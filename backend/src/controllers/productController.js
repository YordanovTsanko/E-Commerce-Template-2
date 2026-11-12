import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Favorite from "../models/Favorite.js";
import Review from "../models/Review.js";
import Cart from "../models/Cart.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { isAdmin } from "../utils/roles.js";
import { logAction } from "../utils/auditLog.js";
import { deleteImages, deleteRemovedImages } from "../services/imageService.js";
import { MAX_PRODUCT_IMAGES } from "../constants/index.js";
import {
  escapeRegex,
  getPagination,
  buildPaginationMeta,
  parseArrayField,
  toBool,
} from "../utils/helpers.js";

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { finalPrice: 1, createdAt: -1 },
  price_desc: { finalPrice: -1, createdAt: -1 },
  rating: { rating: -1, numReviews: -1 },
  popular: { sold: -1, createdAt: -1 },
  name_asc: { name: 1 },
  stock_asc: { stock: 1 },
};

const SEARCH_FIELDS = ["name", "description", "brand", "tags", "features"];

// Търси категория по id или slug
const resolveCategoryId = async (value) => {
  if (mongoose.isValidObjectId(value)) return value;
  const category = await Category.findOne({ slug: value }).select("_id").lean();
  return category?._id || null;
};

// Намира продукт по id или slug
const findProductByParam = (idOrSlug) =>
  mongoose.isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };

const buildFilter = async (query, user) => {
  const filter = {};
  const admin = isAdmin(user);

  // Админът може да вижда и неактивни продукти
  if (admin && query.isActive === "all") {
    /* без филтър */
  } else if (admin && query.isActive === "false") {
    filter.isActive = false;
  } else {
    filter.isActive = true;
  }

  if (query.ids) {
    const ids = parseArrayField(query.ids).filter((id) => mongoose.isValidObjectId(id));
    filter._id = { $in: ids };
  }

  if (query.category) {
    const categoryId = await resolveCategoryId(query.category);
    filter.category = categoryId || new mongoose.Types.ObjectId(); // несъществуваща -> празен резултат
  }

  if (query.brand) filter.brand = new RegExp(`^${escapeRegex(query.brand)}$`, "i");
  if (toBool(query.featured)) filter.isFeatured = true;
  if (toBool(query.inStock)) filter.stock = { $gt: 0 };
  if (toBool(query.onSale)) filter.salePrice = { $ne: null };
  if (query.rating) filter.rating = { $gte: Number(query.rating) };

  if (query.minPrice || query.maxPrice) {
    filter.finalPrice = {};
    if (query.minPrice) filter.finalPrice.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.finalPrice.$lte = Number(query.maxPrice);
  }

  // Всяка дума трябва да се среща в поне едно от полетата
  const terms = query.search?.trim().split(/\s+/).filter(Boolean).slice(0, 8) || [];
  if (terms.length) {
    filter.$and = terms.map((term) => {
      const regex = new RegExp(escapeRegex(term), "i");
      return { $or: SEARCH_FIELDS.map((field) => ({ [field]: regex })) };
    });
  }

  return filter;
};

const attachFavorites = async (items, user) => {
  if (!user || !items.length) return items;
  const favorites = await Favorite.find({ user: user._id, product: { $in: items.map((i) => i._id) } })
    .select("product")
    .lean();
  const favoriteIds = new Set(favorites.map((f) => String(f.product)));
  return items.map((item) => ({ ...item, isFavorite: favoriteIds.has(String(item._id)) }));
};

// =========================
// ПУБЛИЧНИ
// =========================
export const getProducts = catchAsync(async (req, res) => {
  const pagination = getPagination(req.query, { defaultLimit: 12, maxLimit: 60 });
  const filter = await buildFilter(req.query, req.user);
  const sort = SORT_OPTIONS[req.query.sort] || SORT_OPTIONS.newest;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      items: await attachFavorites(items, req.user),
      pagination: buildPaginationMeta(pagination, total),
    },
  });
});

// Минимална и максимална цена – за плъзгача във филтрите
export const getPriceRange = catchAsync(async (req, res) => {
  const [range] = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, min: { $min: "$finalPrice" }, max: { $max: "$finalPrice" } } },
  ]);
  res.status(200).json({ success: true, data: { min: range?.min || 0, max: range?.max || 0 } });
});

export const getProduct = catchAsync(async (req, res, next) => {
  const query = findProductByParam(req.params.idOrSlug);
  if (!isAdmin(req.user)) query.isActive = true;

  const product = await Product.findOne(query).populate("category", "name slug").lean();
  if (!product) return next(new AppError("Продуктът не е намерен.", 404));

  const [withFavorite] = await attachFavorites([product], req.user);
  res.status(200).json({ success: true, data: { product: withFavorite } });
});

export const getRelatedProducts = catchAsync(async (req, res, next) => {
  const product = await Product.findOne(findProductByParam(req.params.idOrSlug)).select("category").lean();
  if (!product) return next(new AppError("Продуктът не е намерен.", 404));

  const items = await Product.find({ _id: { $ne: product._id }, category: product.category, isActive: true })
    .sort({ rating: -1, createdAt: -1 })
    .limit(4)
    .lean();

  res.status(200).json({ success: true, data: { items: await attachFavorites(items, req.user) } });
});

// =========================
// АДМИН
// =========================
const EDITABLE_FIELDS = ["name", "description", "price", "salePrice", "category", "brand", "unit", "stock"];

const buildProductPayload = (body) => {
  const payload = {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) payload[field] = body[field];
  }
  if (payload.salePrice === "" || payload.salePrice === "null") payload.salePrice = null;
  if (payload.category === "" || payload.category === "null") payload.category = null;
  if (body.tags !== undefined) payload.tags = parseArrayField(body.tags);
  if (body.features !== undefined) payload.features = parseArrayField(body.features);
  if (body.isActive !== undefined) payload.isActive = toBool(body.isActive);
  if (body.isFeatured !== undefined) payload.isFeatured = toBool(body.isFeatured);
  return payload;
};

export const createProduct = catchAsync(async (req, res, next) => {
  const images = req.uploadedImages || [];
  if (!images.length) return next(new AppError("Качете поне едно изображение на продукта.", 400));

  const product = await Product.create({ ...buildProductPayload(req.body), images });
  await logAction(req, { action: "product.create", entityType: "Product", entityId: product._id });

  res.status(201).json({ success: true, message: "Продуктът е създаден.", data: { product } });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError("Продуктът не е намерен.", 404));

  const oldImages = product.images.map((img) => img.toObject());

  // existingImages: publicId-та (или url-и) на запазените снимки, в желания ред
  let images = oldImages;
  if (req.body.existingImages !== undefined) {
    const keep = parseArrayField(req.body.existingImages);
    images = keep
      .map((key) => oldImages.find((img) => img.publicId === key || img.url === key))
      .filter(Boolean);
  }
  images = [...images, ...(req.uploadedImages || [])];

  if (!images.length) return next(new AppError("Продуктът трябва да има поне едно изображение.", 400));
  if (images.length > MAX_PRODUCT_IMAGES) {
    return next(new AppError(`Максимум ${MAX_PRODUCT_IMAGES} изображения на продукт.`, 400));
  }

  product.set({ ...buildProductPayload(req.body), images });
  await product.save();

  // Едва след успешен запис трием премахнатите снимки от Cloudinary
  await deleteRemovedImages(oldImages, images);
  await logAction(req, { action: "product.update", entityType: "Product", entityId: product._id });

  res.status(200).json({ success: true, message: "Продуктът е обновен.", data: { product } });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return next(new AppError("Продуктът не е намерен.", 404));

  await Promise.all([
    deleteImages(product.images),
    Favorite.deleteMany({ product: product._id }),
    Review.deleteMany({ product: product._id }),
    Cart.updateMany({}, { $pull: { items: { product: product._id } } }),
  ]);
  await logAction(req, { action: "product.delete", entityType: "Product", entityId: product._id });

  res.status(200).json({ success: true, message: "Продуктът е изтрит." });
});
