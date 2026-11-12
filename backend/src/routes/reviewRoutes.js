import express from "express";
import { param } from "express-validator";
import { deleteReview } from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = express.Router();

// Собственикът на отзива или админ
router.delete("/:id", protect, [param("id").isMongoId()], validate, deleteReview);

export default router;
