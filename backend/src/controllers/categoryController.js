import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { isAdmin } from "../utils/roles.js";
import { toBool, pick } from "../utils/helpers.js";
import { logAction } from "../utils/auditLog.js";
import { deleteImages } from "../services/imageService.js";

const FIELDS = ["name", "description", "sortOrder"];

// Брой активни продукти за всяка категория
const getProductCounts = async () => {
  const counts = await Product.aggregate([
    { $match: { isActive: true, category: { $ne: null } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  return new Map(counts.map((c) => [String(c._id), c.count]));
};

export const getCategories = catchAsync(async (req, res) => {
  const showAll = isAdmin(req.user) && req.query.all === "true";
  const filter = showAll ? {} : { isActive: true };

  const [categories, counts] = await Promise.all([
    Category.find(filter).sort({ sortOrder: 1, name: 1 }).lean(),
    getProductCounts(),
  ]);

  res.status(200).json({
    success: true,
    data: { items: categories.map((c) => ({ ...c, productCount: counts.get(String(c._id)) || 0 })) },
  });
});

export const getCategory = catchAsync(async (req, res, next) => {
  const { idOrSlug } = req.params;
  const query = mongoose.isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };
  const category = await Category.findOne(query).lean();
  if (!category) return next(new AppError("Категорията не е намерена.", 404));
  res.status(200).json({ success: true, data: { category } });
});

export const createCategory = catchAsync(async (req, res) => {
  const [image] = req.uploadedImages || [];
  const category = await Category.create({
    ...pick(req.body, FIELDS),
    isActive: req.body.isActive === undefined ? true : toBool(req.body.isActive),
    image: image || null,
  });

  await logAction(req, { action: "category.create", entityType: "Category", entityId: category._id });
  res.status(201).json({ success: true, message: "Категорията е създадена.", data: { category } });
});

export const updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new AppError("Категорията не е намерена.", 404));

  const oldImage = category.image?.toObject?.() || null;
  const [newImage] = req.uploadedImages || [];
  const removeImage = toBool(req.body.removeImage);

  category.set(pick(req.body, FIELDS));
  if (req.body.isActive !== undefined) category.isActive = toBool(req.body.isActive);
  if (newImage) category.image = newImage;
  else if (removeImage) category.image = null;

  await category.save();
  if (oldImage && (newImage || removeImage)) await deleteImages([oldImage]);

  await logAction(req, { action: "category.update", entityType: "Category", entityId: category._id });
  res.status(200).json({ success: true, message: "Категорията е обновена.", data: { category } });
});

export const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new AppError("Категорията не е намерена.", 404));

  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    return next(
      new AppError(
        `Категорията съдържа ${productCount} продукт(а). Преместете или изтрийте продуктите преди това.`,
        409,
      ),
    );
  }

  await category.deleteOne();
  if (category.image) await deleteImages([category.image]);

  await logAction(req, { action: "category.delete", entityType: "Category", entityId: category._id });
  res.status(200).json({ success: true, message: "Категорията е изтрита." });
});
