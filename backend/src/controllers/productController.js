import mongoose from "mongoose";
import Product from "../models/Product.js";
import Favorite from "../models/Favorite.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

const buildFilter = (query, user) => {
  const filter = {};

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  if (isAdmin) {
    if (query.isActive === "true") {
      filter.isActive = true;
    } else if (query.isActive === "false") {
      filter.isActive = false;
    }
  } else {
    filter.isActive = true; 
  }

  if (query.type) {
    filter.type = query.type;
  }

  if (query.quantityType) {
    filter.quantityType = query.quantityType;
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice !== undefined) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.search?.trim()) {
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const terms = query.search.trim().split(/\s+/).filter(Boolean);
  const searchFields = ["name", "description", "type", "features"];

  const orConditions = [];
  for (const term of terms) {
    const regex = new RegExp(escapeRegex(term), "i");
    for (const field of searchFields) {
      orConditions.push({ [field]: regex });
    }
  }

  if (orConditions.length > 0) {
    filter.$or = orConditions;
  }
}

  return filter;
};

export const getProducts = catchAsync(async (req, res) => {

  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 20, 1),
    100,
  );

  const skip = (page - 1) * limit;

  const filter = buildFilter(req.query, req.user);

  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "name",
    "price",
    "quantity",
  ];

  const sortField = allowedSortFields.includes(req.query.sort)
    ? req.query.sort
    : "createdAt";

  const sortDirection = req.query.order === "asc" ? 1 : -1;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limit)
      .lean(),

    Product.countDocuments(filter),
  ]);

  if (req.user) {
    const productIds = items.map((item) => item._id);

    const favorites = await Favorite.find({
      user: req.user._id,
      product: { $in: productIds },
    })
      .select("product")
      .lean();

    const favoriteIds = new Set(favorites.map((item) => String(item.product)));

    for (const item of items) {
      item.isFavorite = favoriteIds.has(String(item._id));
    }
  }

  res.status(200).json({
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

export const getProduct = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError("Invalid product id", 400));
  }

  const product = await Product.findOne({
    _id: req.params.id
  }).lean();

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (req.user) {
    product.isFavorite = !!(await Favorite.exists({
      user: req.user._id,
      product: product._id,
    }));
  }

  res.status(200).json({
    success: true,
    data: { product },
  });
});

export const createProduct = catchAsync(async (req, res) => {
  const { name, description, type, quantityType, quantity, price } = req.body;
  let features = [];
  if (req.body.features) {
    try {
      features =
        typeof req.body.features === "string"
          ? JSON.parse(req.body.features)
          : req.body.features;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Невалидни характеристики на продукта.",
      });
    }
  }
  if (!Array.isArray(features)) {
    return res.status(400).json({
      success: false,
      message: "Характеристиките трябва да бъдат масив.",
    });
  }
  if (features.length > 0) {
    features = features
      .map((feature) => String(feature).trim())
      .filter(Boolean);
  }
  const images = Array.isArray(req.uploadedImages)
    ? req.uploadedImages.slice(0, 5)
    : [];
  const product = await Product.create({
    name: name?.trim(),
    description: description?.trim(),
    images,
    type,
    features,
    quantityType,
    quantity: Number(quantity),
    price: Number(price),
  });
  res.status(201).json({ success: true, data: { product } });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError("Invalid product id", 400));
  }

  const allowed = [
    "name",
    "description",
    "type",
    "features",
    "quantityType",
    "quantity",
    "price",
    "isActive",
  ];

  const update = {};

  for (const field of allowed) {
    if (req.body[field] !== undefined) {
      update[field] = req.body[field];
    }
  }
  let existingImages = [];

  if (req.body.existingImages !== undefined) {
    try {
      existingImages =
        typeof req.body.existingImages === "string"
          ? JSON.parse(req.body.existingImages)
          : req.body.existingImages;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Невалиден списък със съществуващи снимки.",
      });
    }
  }

  if (!Array.isArray(existingImages)) {
    return res.status(400).json({
      success: false,
      message: "existingImages трябва да бъде масив.",
    });
  }

  existingImages = existingImages
    .map((image) => String(image).trim())
    .filter(Boolean);

  const newImages = Array.isArray(req.uploadedImages)
    ? req.uploadedImages
    : [];
  const images = [...existingImages, ...newImages].slice(0, 5);

  update.images = images;

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: update },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      product,
    },
  });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError('Invalid product id', 400));
  }

  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) return next(new AppError('Product not found', 404));

  res.status(200).json({
    success: true,
    data: null,
  });
});


export const restoreProduct = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError("Invalid product id", 400));
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: { isActive: true } },
    { new: true },
  );

  if (!product) return next(new AppError("Product not found", 404));

  res.status(200).json({
    success: true,
    data: { product },
  });
});
