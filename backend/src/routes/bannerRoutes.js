import express from "express";
import { body, param } from "express-validator";
import { getBanners, createBanner, updateBanner, deleteBanner } from "../controllers/bannerController.js";
import { optionalAuth, adminOnly } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { uploadImages } from "../middleware/upload.js";
import { IMAGE_FOLDERS } from "../config/cloudinary.js";

const router = express.Router();
const bannerImage = uploadImages({ field: "image", maxCount: 1, folder: IMAGE_FOLDERS.banners });
const idParam = param("id").isMongoId().withMessage("Невалидно id.");

const fields = (optional) => [
  (optional ? body("title").optional() : body("title"))
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("Заглавието е задължително (до 120 символа)."),
  body("subtitle").optional().trim().isLength({ max: 300 }),
  body("buttonText").optional().trim().isLength({ max: 40 }),
  body("link").optional().trim().isLength({ max: 300 }),
  body("sortOrder").optional({ values: "falsy" }).isInt().toInt(),
];

router.get("/", optionalAuth, getBanners);
router.post("/", adminOnly, bannerImage, fields(false), validate, createBanner);
router.patch("/:id", adminOnly, bannerImage, [idParam, ...fields(true)], validate, updateBanner);
router.delete("/:id", adminOnly, [idParam], validate, deleteBanner);

export default router;
