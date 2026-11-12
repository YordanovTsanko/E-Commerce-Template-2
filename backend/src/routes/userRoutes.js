import express from "express";
import { body, param } from "express-validator";
import {
  getMe,
  updateMe,
  updateMyAvatar,
  deleteMyAvatar,
  deleteMe,
  getUsers,
  getUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../controllers/userController.js";
import { protect, requireAdmin, requireSuperAdmin } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { uploadImages } from "../middleware/upload.js";
import { IMAGE_FOLDERS } from "../config/cloudinary.js";
import { ROLE_VALUES, USER_STATUSES } from "../constants/index.js";

const router = express.Router();
const idParam = [param("id").isMongoId().withMessage("Невалидно id.")];

router.use(protect);

// ===== Профил =====
router.get("/me", getMe);
router.patch(
  "/me",
  [
    body("firstName").optional().trim().isLength({ min: 1, max: 50 }).withMessage("Невалидно име."),
    body("lastName").optional({ values: "null" }).trim().isLength({ max: 50 }),
    body("phone").optional({ values: "null" }).trim().isLength({ max: 30 }),
    body("address").optional().isObject().withMessage("Невалиден адрес."),
  ],
  validate,
  updateMe,
);
router.patch("/me/avatar", uploadImages({ field: "avatar", maxCount: 1, folder: IMAGE_FOLDERS.avatars }), updateMyAvatar);
router.delete("/me/avatar", deleteMyAvatar);
router.delete("/me", deleteMe);

// ===== Админ =====
router.get("/", requireAdmin, getUsers);
router.get("/:id", requireAdmin, idParam, validate, getUser);
router.patch(
  "/:id/role",
  requireAdmin,
  [...idParam, body("role").isIn(ROLE_VALUES).withMessage("Невалидна роля.")],
  validate,
  updateUserRole,
);
router.patch(
  "/:id/status",
  requireAdmin,
  [...idParam, body("status").isIn(USER_STATUSES).withMessage("Невалиден статус.")],
  validate,
  updateUserStatus,
);
router.delete("/:id", requireSuperAdmin, idParam, validate, deleteUser);

export default router;
