import express from "express";
import { body, param } from "express-validator";
import {
  createOrder,
  getMyOrders,
  getOrder,
  cancelMyOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { ORDER_STATUS_VALUES, PAYMENT_METHODS, PAYMENT_STATUSES } from "../constants/index.js";

const router = express.Router();
const idParam = [param("id").isMongoId().withMessage("Невалидна поръчка.")];

const createOrderValidation = [
  body("shippingAddress.fullName").trim().isLength({ min: 3, max: 100 }).withMessage("Въведете име и фамилия."),
  body("shippingAddress.phone")
    .trim()
    .matches(/^\+?[0-9\s-]{8,20}$/)
    .withMessage("Въведете валиден телефонен номер."),
  body("shippingAddress.email").trim().isEmail().withMessage("Въведете валиден имейл."),
  body("shippingAddress.city").trim().isLength({ min: 2, max: 100 }).withMessage("Въведете град."),
  body("shippingAddress.postalCode").trim().isLength({ min: 3, max: 20 }).withMessage("Въведете пощенски код."),
  body("shippingAddress.street").trim().isLength({ min: 3, max: 250 }).withMessage("Въведете адрес."),
  body("shippingAddress.notes").optional().trim().isLength({ max: 500 }),
  body("paymentMethod").isIn(Object.values(PAYMENT_METHODS)).withMessage("Изберете метод на плащане."),
  body("saveAddress").optional().isBoolean(),
];

router.use(protect);

// ===== Клиент =====
router.post("/", createOrderValidation, validate, createOrder);
router.get("/my", getMyOrders);
router.patch("/:id/cancel", idParam, validate, cancelMyOrder);

// ===== Админ =====
router.get("/", requireAdmin, getAllOrders);
router.patch(
  "/:id/status",
  requireAdmin,
  [
    ...idParam,
    body("status").optional().isIn(ORDER_STATUS_VALUES).withMessage("Невалиден статус."),
    body("paymentStatus").optional().isIn(PAYMENT_STATUSES).withMessage("Невалиден статус на плащане."),
    body("note").optional().trim().isLength({ max: 300 }),
  ],
  validate,
  updateOrderStatus,
);

// Собственик или админ
router.get("/:id", idParam, validate, getOrder);

export default router;
