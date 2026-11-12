import express from "express";
import { body } from "express-validator";
import { getStoreConfig, sendContactMessage } from "../controllers/miscController.js";
import { getDashboardStats } from "../controllers/adminController.js";
import { adminOnly } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { contactLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/config", getStoreConfig);

router.post(
  "/contact",
  contactLimiter,
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Въведете име."),
    body("email").trim().isEmail().withMessage("Въведете валиден имейл."),
    body("message").trim().isLength({ min: 10, max: 3000 }).withMessage("Съобщението трябва да е поне 10 символа."),
  ],
  validate,
  sendContactMessage,
);

router.get("/admin/stats", adminOnly, getDashboardStats);

export default router;
