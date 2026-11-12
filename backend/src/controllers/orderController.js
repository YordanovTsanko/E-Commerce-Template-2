import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import sendEmail from "../utils/sendEmail.js";
import { env } from "../config/env.js";
import { isAdmin } from "../utils/roles.js";
import { logAction } from "../utils/auditLog.js";
import { round2, escapeRegex, getPagination, buildPaginationMeta, pick } from "../utils/helpers.js";
import { calculateTotals } from "../utils/pricing.js";
import { getCartWithTotals } from "../services/cartService.js";
import { reserveStock, releaseStock } from "../services/orderService.js";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, PAYMENT_METHODS } from "../constants/index.js";

const ADDRESS_FIELDS = ["fullName", "phone", "email", "city", "postalCode", "street", "notes"];

const formatMoney = (value) =>
  new Intl.NumberFormat("bg-BG", { style: "currency", currency: env.store.currency }).format(value);

const notifyUser = async (order, title, message) => {
  try {
    await Notification.create({
      user: order.user,
      type: "order",
      title,
      message,
      link: `/orders/${order._id}`,
      data: { orderId: order._id, status: order.status },
    });
  } catch (error) {
    console.error("Неуспешно създаване на известие:", error.message);
  }
};

// Връща запасите, ако поръчката е отказана (само веднъж)
const restoreStockIfNeeded = async (order) => {
  if (order.stockRestored) return;
  await releaseStock(order.items);
  order.stockRestored = true;
};

// =========================
// КЛИЕНТ
// =========================
export const createOrder = catchAsync(async (req, res, next) => {
  const { shippingAddress, paymentMethod, saveAddress } = req.body;
  const cart = await getCartWithTotals(req.user._id);

  if (!cart.items.length) return next(new AppError("Количката е празна.", 400));

  const invalid = cart.items.find((i) => i.exceedsStock);
  if (invalid) {
    return next(
      new AppError(`Няма достатъчна наличност от „${invalid.product.name}“ (налични: ${invalid.product.stock}).`, 409),
    );
  }

  const items = cart.items.map(({ product, quantity }) => ({
    product: product._id,
    name: product.name,
    slug: product.slug,
    image: product.images?.[0]?.url || null,
    unit: product.unit,
    price: product.price,
    finalPrice: product.finalPrice,
    quantity,
    lineTotal: round2(product.finalPrice * quantity),
  }));

  // Сумите се изчисляват наново на сървъра – никога не се приемат от клиента
  const totals = calculateTotals(items);

  await reserveStock(items);

  let order;
  try {
    order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress: pick(shippingAddress, ADDRESS_FIELDS),
      paymentMethod,
      currency: env.store.currency,
      itemsPrice: totals.subtotal,
      savings: totals.savings,
      shippingPrice: totals.shipping,
      taxPrice: totals.tax,
      taxRate: totals.taxRate,
      pricesIncludeTax: totals.pricesIncludeTax,
      totalPrice: totals.total,
    });
  } catch (error) {
    await releaseStock(items);
    throw error;
  }

  await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } });

  if (saveAddress) {
    const { fullName, phone, city, postalCode, street } = shippingAddress;
    await User.updateOne(
      { _id: req.user._id },
      { address: { fullName, phone, city, postalCode, street, country: "България" } },
    );
  }

  await notifyUser(order, "Поръчката е приета", `Поръчка ${order.orderNumber} е приета успешно.`);
  await sendEmail({
    to: order.shippingAddress.email,
    subject: `Поръчка ${order.orderNumber} – ${env.store.name}`,
    text: `Благодарим ви! Поръчка ${order.orderNumber} на стойност ${formatMoney(order.totalPrice)} е приета.`,
    html: `<p>Благодарим ви!</p><p>Поръчка <b>${order.orderNumber}</b> на стойност <b>${formatMoney(
      order.totalPrice,
    )}</b> е приета. Можете да следите статуса ѝ в <a href="${env.appUrl}/orders/${order._id}">профила си</a>.</p>`,
  });

  res.status(201).json({ success: true, message: "Поръчката е направена успешно!", data: { order } });
});

export const getMyOrders = catchAsync(async (req, res) => {
  const pagination = getPagination(req.query, { defaultLimit: 10, maxLimit: 50 });
  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit).lean(),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, data: { items, pagination: buildPaginationMeta(pagination, total) } });
});

export const getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user", "email firstName lastName phone");
  if (!order) return next(new AppError("Поръчката не е намерена.", 404));

  if (String(order.user?._id) !== String(req.user._id) && !isAdmin(req.user)) {
    return next(new AppError("Поръчката не е намерена.", 404));
  }

  res.status(200).json({ success: true, data: { order } });
});

export const cancelMyOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return next(new AppError("Поръчката не е намерена.", 404));

  if (order.status !== ORDER_STATUSES.PENDING) {
    return next(new AppError("Можете да откажете само поръчка със статус „Изчакваща“.", 409));
  }

  order.status = ORDER_STATUSES.CANCELLED;
  order.cancelledAt = new Date();
  order.statusHistory.push({ status: order.status, changedBy: req.user._id, note: "Отказана от клиента" });
  await restoreStockIfNeeded(order);
  await order.save();

  res.status(200).json({ success: true, message: "Поръчката е отказана.", data: { order } });
});

// =========================
// АДМИН
// =========================
export const getAllOrders = catchAsync(async (req, res) => {
  const pagination = getPagination(req.query, { defaultLimit: 20 });
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  if (req.query.search?.trim()) {
    const regex = new RegExp(escapeRegex(req.query.search.trim()), "i");
    filter.$or = [
      { orderNumber: regex },
      { "shippingAddress.email": regex },
      { "shippingAddress.fullName": regex },
      { "shippingAddress.phone": regex },
    ];
  }

  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "email firstName lastName")
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, data: { items, pagination: buildPaginationMeta(pagination, total) } });
});

export const updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, paymentStatus, note = "" } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError("Поръчката не е намерена.", 404));

  const before = { status: order.status, paymentStatus: order.paymentStatus };

  if (status && status !== order.status) {
    if (order.status === ORDER_STATUSES.CANCELLED) {
      return next(new AppError("Отказана поръчка не може да бъде активирана отново.", 409));
    }

    order.status = status;
    order.statusHistory.push({ status, note, changedBy: req.user._id });

    if (status === ORDER_STATUSES.DELIVERED) {
      order.deliveredAt = new Date();
      // При наложен платеж плащането се счита за получено при доставка
      if (order.paymentMethod === PAYMENT_METHODS.COD && order.paymentStatus === "Pending") {
        order.paymentStatus = "Paid";
        order.paidAt = new Date();
      }
    }

    if (status === ORDER_STATUSES.CANCELLED) {
      order.cancelledAt = new Date();
      await restoreStockIfNeeded(order);
    }

    await notifyUser(
      order,
      "Промяна в статуса на поръчката",
      `Поръчка ${order.orderNumber} е със статус „${ORDER_STATUS_LABELS[status]}“.`,
    );
  }

  if (paymentStatus && paymentStatus !== order.paymentStatus) {
    order.paymentStatus = paymentStatus;
    if (paymentStatus === "Paid") order.paidAt = new Date();
  }

  await order.save();
  await logAction(req, {
    action: "order.update",
    entityType: "Order",
    entityId: order._id,
    before,
    after: { status: order.status, paymentStatus: order.paymentStatus },
  });

  await order.populate("user", "email firstName lastName phone");
  res.status(200).json({ success: true, message: "Поръчката е обновена.", data: { order } });
});
