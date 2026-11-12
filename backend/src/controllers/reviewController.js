import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { isAdmin } from "../utils/roles.js";
import { getPagination, buildPaginationMeta } from "../utils/helpers.js";

export const getProductReviews = catchAsync(async (req, res) => {
  const pagination = getPagination(req.query, { defaultLimit: 10, maxLimit: 50 });
  const filter = { product: req.params.id };

  const [items, total] = await Promise.all([
    Review.find(filter)
      .populate("user", "firstName lastName avatar")
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  // Показва дали авторът е купувал продукта
  const buyers = await Order.distinct("user", {
    "items.product": req.params.id,
    user: { $in: items.map((r) => r.user?._id).filter(Boolean) },
    status: { $ne: "Cancelled" },
  });
  const buyerIds = new Set(buyers.map(String));

  res.status(200).json({
    success: true,
    data: {
      items: items.map((r) => ({ ...r, verifiedPurchase: buyerIds.has(String(r.user?._id)) })),
      pagination: buildPaginationMeta(pagination, total),
    },
  });
});

// Създава или обновява отзива на текущия потребител
export const upsertReview = catchAsync(async (req, res, next) => {
  const product = await Product.exists({ _id: req.params.id, isActive: true });
  if (!product) return next(new AppError("Продуктът не е намерен.", 404));

  const { rating, comment = "" } = req.body;
  const existing = await Review.exists({ product: req.params.id, user: req.user._id });

  const review = await Review.findOneAndUpdate(
    { product: req.params.id, user: req.user._id },
    { rating, comment },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).populate("user", "firstName lastName avatar");

  await Review.recalculate(req.params.id);

  res.status(existing ? 200 : 201).json({
    success: true,
    message: existing ? "Отзивът е обновен." : "Благодарим за отзива!",
    data: { review },
  });
});

export const deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError("Отзивът не е намерен.", 404));

  if (String(review.user) !== String(req.user._id) && !isAdmin(req.user)) {
    return next(new AppError("Нямате права да изтриете този отзив.", 403));
  }

  await review.deleteOne();
  await Review.recalculate(review.product);

  res.status(200).json({ success: true, message: "Отзивът е изтрит." });
});
