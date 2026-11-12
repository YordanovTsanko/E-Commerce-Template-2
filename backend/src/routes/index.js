import express from "express";

import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import sessionRoutes from "./sessionRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import auditLogRoutes from "./auditLogRoutes.js";
import productRoutes from "./productRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import bannerRoutes from "./bannerRoutes.js";
import favoriteRoutes from "./favoriteRoutes.js";
import cartRoutes from "./cartRoutes.js";
import orderRoutes from "./orderRoutes.js";
import miscRoutes from "./miscRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/sessions", sessionRoutes);
router.use("/notifications", notificationRoutes);
router.use("/audit-logs", auditLogRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/reviews", reviewRoutes);
router.use("/banners", bannerRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/", miscRoutes);

export default router;
