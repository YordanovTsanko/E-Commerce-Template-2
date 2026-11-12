import Favorite from "../models/Favorite.js";
import Product from "../models/Product.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

export const getFavorites = catchAsync(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate({ path: "product", match: { isActive: true }, populate: { path: "category", select: "name slug" } })
    .lean();

  const items = favorites.filter((f) => f.product).map((f) => ({ ...f.product, isFavorite: true }));
  res.status(200).json({ success: true, data: { items } });
});

// Само id-та – за бързо оцветяване на сърцата в UI
export const getFavoriteIds = catchAsync(async (req, res) => {
  const ids = await Favorite.find({ user: req.user._id }).distinct("product");
  res.status(200).json({ success: true, data: { ids } });
});

export const addFavorite = catchAsync(async (req, res, next) => {
  const product = await Product.exists({ _id: req.params.productId, isActive: true });
  if (!product) return next(new AppError("Продуктът не е намерен.", 404));

  await Favorite.updateOne(
    { user: req.user._id, product: req.params.productId },
    { $setOnInsert: { user: req.user._id, product: req.params.productId } },
    { upsert: true },
  );

  res.status(200).json({
    success: true,
    message: "Добавено в любими.",
    data: { productId: req.params.productId, isFavorite: true },
  });
});

export const removeFavorite = catchAsync(async (req, res) => {
  await Favorite.deleteOne({ user: req.user._id, product: req.params.productId });
  res.status(200).json({
    success: true,
    message: "Премахнато от любими.",
    data: { productId: req.params.productId, isFavorite: false },
  });
});
