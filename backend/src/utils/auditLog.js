import AuditLog from "../models/AuditLog.js";

// Записва административно действие; грешка при логването не спира заявката.
export const logAction = async (req, { action, entityType, entityId = null, before = null, after = null }) => {
  try {
    await AuditLog.create({
      actor: req.user?._id || null,
      action,
      entityType,
      entityId,
      changes: { before, after },
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error("Неуспешен запис в AuditLog:", error.message);
  }
};
