import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { getCartWithTotals, getOrCreateCart, normalizeQuantity } from "../services/cartService.js";

const sendCart = async (req, res, message) => {
  const data = await getCartWithTotals(req.user._id);
  res.status(200).json({ success: true, ...(message && { message }), data });
};

const findActiveProduct = async (productId) => {
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) throw new AppError("Продуктът не е намерен или не е активен.", 404);
  return product;
};

export const getCart = catchAsync(async (req, res) => sendCart(req, res));

export const addItem = catchAsync(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await findActiveProduct(productId);
  const cart = await getOrCreateCart(req.user._id);

  const existing = cart.items.find((item) => String(item.product) === String(product._id));
  const newQuantity = normalizeQuantity((existing?.quantity || 0) + Number(quantity), product);

  if (existing) existing.quantity = newQuantity;
  else cart.items.push({ product: product._id, quantity: newQuantity });

  await cart.save();
  await sendCart(req, res, "Продуктът е добавен в количката.");
});

export const updateItem = catchAsync(async (req, res, next) => {
  const product = await findActiveProduct(req.params.productId);
  const cart = await Cart.findOne({ user: req.user._id });
  const item = cart?.items.find((i) => String(i.product) === String(product._id));

  if (!item) return next(new AppError("Продуктът не е в количката.", 404));

  item.quantity = normalizeQuantity(req.body.quantity, product);
  await cart.save();
  await sendCart(req, res);
});

export const removeItem = catchAsync(async (req, res) => {
  await Cart.updateOne({ user: req.user._id }, { $pull: { items: { product: req.params.productId } } });
  await sendCart(req, res, "Продуктът е премахнат от количката.");
});

export const clearCart = catchAsync(async (req, res) => {
  await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } });
  await sendCart(req, res, "Количката е изпразнена.");
});

// Слива количката на госта (от localStorage) с тази в профила след вход
export const mergeCart = catchAsync(async (req, res) => {
  const incoming = Array.isArray(req.body.items) ? req.body.items.slice(0, 100) : [];
  const cart = await getOrCreateCart(req.user._id);

  const products = await Product.find({
    _id: { $in: incoming.map((i) => i.productId) },
    isActive: true,
  });

  for (const product of products) {
    const guestItem = incoming.find((i) => String(i.productId) === String(product._id));
    const existing = cart.items.find((i) => String(i.product) === String(product._id));
    const desired = (existing?.quantity || 0) + Number(guestItem.quantity || 0);

    // Количеството се ограничава до наличността вместо да връща грешка
    let quantity = Math.min(desired, product.stock);
    if (product.unit === "piece") quantity = Math.floor(quantity);
    if (quantity <= 0) continue;

    if (existing) existing.quantity = quantity;
    else cart.items.push({ product: product._id, quantity });
  }

  await cart.save();
  await sendCart(req, res);
});
