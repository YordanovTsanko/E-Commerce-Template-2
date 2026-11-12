import express from "express";
import { getAuditLogs } from "../controllers/auditLogController.js";
import { adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", adminOnly, getAuditLogs);

export default router;
