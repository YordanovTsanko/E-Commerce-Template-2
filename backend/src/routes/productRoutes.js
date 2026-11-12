import express from "express";
import {
  getProducts,
  getPriceRange,
  getProduct,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { getProductReviews, upsertReview } from "../controllers/reviewController.js";
import { optionalAuth, protect, adminOnly } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { uploadImages } from "../middleware/upload.js";
import { IMAGE_FOLDERS } from "../config/cloudinary.js";
import { MAX_PRODUCT_IMAGES } from "../constants/index.js";
import {
  idParam,
  createProductValidation,
  updateProductValidation,
  listProductsValidation,
} from "../validators/productValidators.js";
import { reviewValidation } from "../validators/reviewValidators.js";

const router = express.Router();
const productImages = uploadImages({ field: "images", maxCount: MAX_PRODUCT_IMAGES, folder: IMAGE_FOLDERS.products });

// ===== Публични =====
router.get("/", optionalAuth, listProductsValidation, validate, getProducts);
router.get("/price-range", getPriceRange);
router.get("/:idOrSlug", optionalAuth, getProduct);
router.get("/:idOrSlug/related", optionalAuth, getRelatedProducts);

// ===== Отзиви =====
router.get("/:id/reviews", idParam, validate, getProductReviews);
router.post("/:id/reviews", protect, reviewValidation, validate, upsertReview);

// ===== Админ =====
router.post("/", adminOnly, productImages, createProductValidation, validate, createProduct);
router.patch("/:id", adminOnly, productImages, updateProductValidation, validate, updateProduct);
router.delete("/:id", adminOnly, idParam, validate, deleteProduct);

export default router;
