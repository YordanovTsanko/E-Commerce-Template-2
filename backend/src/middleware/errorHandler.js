import AppError from "../utils/AppError.js";
import { env } from "../config/env.js";

const FIELD_LABELS = {
  email: "имейл",
  name: "име",
  slug: "адрес (slug)",
  username: "потребителско име",
  orderNumber: "номер на поръчка",
};

const normalizeError = (err) => {
  if (err instanceof AppError) return err;

  if (err.name === "CastError") {
    return new AppError(`Невалидна стойност за поле "${err.path}".`, 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const label = FIELD_LABELS[field] || field;
    return new AppError(`Запис с това ${label} вече съществува.`, 409);
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return new AppError(`Невалидни данни: ${messages.join(". ")}`, 400);
  }

  if (err.name === "JsonWebTokenError") return new AppError("Невалиден токен. Моля, влезте отново.", 401);
  if (err.name === "TokenExpiredError") return new AppError("Сесията е изтекла. Моля, влезте отново.", 401);

  if (err.type === "entity.parse.failed") return new AppError("Невалиден JSON в заявката.", 400);
  if (err.type === "entity.too.large") return new AppError("Заявката е твърде голяма.", 413);

  return null;
};

// Трябва да е регистриран ПОСЛЕДЕН: app.use(errorHandler)
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const operational = normalizeError(err);

  if (!operational) {
    console.error("НЕОЧАКВАНА ГРЕШКА:", err);
  }

  const statusCode = operational?.statusCode || 500;
  const message = operational?.message || "Нещо се обърка. Опитайте отново по-късно.";

  res.status(statusCode).json({
    success: false,
    status: statusCode < 500 ? "fail" : "error",
    message,
    ...(env.isDev && { stack: err.stack, original: err.message }),
  });
};

export default errorHandler;
