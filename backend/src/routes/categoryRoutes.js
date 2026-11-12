import express from "express";
import { body, param } from "express-validator";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { optionalAuth, adminOnly } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { uploadImages } from "../middleware/upload.js";
import { IMAGE_FOLDERS } from "../config/cloudinary.js";

const router = express.Router();
const categoryImage = uploadImages({ field: "image", maxCount: 1, folder: IMAGE_FOLDERS.categories });
const idParam = param("id").isMongoId().withMessage("Невалидно id.");

const fields = (optional) => [
  (optional ? body("name").optional() : body("name"))
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage("Името е задължително (до 80 символа)."),
  body("description").optional().trim().isLength({ max: 500 }),
  body("sortOrder").optional({ values: "falsy" }).isInt().toInt(),
];

router.get("/", optionalAuth, getCategories);
router.get("/:idOrSlug", getCategory);

router.post("/", adminOnly, categoryImage, fields(false), validate, createCategory);
router.patch("/:id", adminOnly, categoryImage, [idParam, ...fields(true)], validate, updateCategory);
router.delete("/:id", adminOnly, [idParam], validate, deleteCategory);

export default router;
