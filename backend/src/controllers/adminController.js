import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import catchAsync from "../utils/catchAsync.js";
import { ORDER_STATUSES } from "../constants/index.js";

const LOW_STOCK_THRESHOLD = 5;

export const getDashboardStats = catchAsync(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    productsCount,
    activeProducts,
    categoriesCount,
    usersCount,
    ordersCount,
    revenueAgg,
    revenue30Agg,
    ordersByStatusAgg,
    recentOrders,
    lowStock,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Category.countDocuments(),
    User.countDocuments({ deleted: false }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: ORDER_STATUSES.CANCELLED } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    Order.aggregate([
      { $match: { status: { $ne: ORDER_STATUSES.CANCELLED }, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.find().sort({ createdAt: -1 }).limit(6).populate("user", "email firstName lastName").lean(),
    Product.find({ stock: { $lte: LOW_STOCK_THRESHOLD } })
      .sort({ stock: 1 })
      .limit(6)
      .select("name stock unit images")
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      counts: { products: productsCount, activeProducts, categories: categoriesCount, users: usersCount, orders: ordersCount },
      revenue: {
        total: revenueAgg[0]?.total || 0,
        last30Days: revenue30Agg[0]?.total || 0,
        ordersLast30Days: revenue30Agg[0]?.count || 0,
      },
      ordersByStatus: Object.fromEntries(ordersByStatusAgg.map((s) => [s._id, s.count])),
      recentOrders,
      lowStock,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
    },
  });
});
