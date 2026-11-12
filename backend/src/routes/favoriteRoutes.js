import express from "express";
import { param } from "express-validator";
import { getFavorites, getFavoriteIds, addFavorite, removeFavorite } from "../controllers/favoriteController.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = express.Router();
const productIdValidation = [param("productId").isMongoId().withMessage("Невалиден продукт.")];

router.use(protect);

router.get("/", getFavorites);
router.get("/ids", getFavoriteIds);
router.post("/:productId", productIdValidation, validate, addFavorite);
router.delete("/:productId", productIdValidation, validate, removeFavorite);

export default router;
