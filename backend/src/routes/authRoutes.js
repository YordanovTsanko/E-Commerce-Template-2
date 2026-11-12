import express from "express";
import { param } from "express-validator";
import {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
} from "../validators/authValidators.js";

const router = express.Router();

router.post("/register", authLimiter, registerValidation, validate, register);
router.post("/login", authLimiter, loginValidation, validate, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/verify-email/:token", [param("token").notEmpty()], validate, verifyEmail);
router.post("/resend-verification", protect, resendVerification);

router.post("/forgot-password", authLimiter, forgotPasswordValidation, validate, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPasswordValidation, validate, resetPassword);
router.post("/change-password", protect, changePasswordValidation, validate, changePassword);

export default router;
