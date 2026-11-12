import rateLimit from "express-rate-limit";

const limitMessage = (message) => ({ success: false, status: "fail", message });

// За вход/регистрация/забравена парола – защита от brute-force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage("Твърде много опити. Опитайте отново след 15 минути."),
});

// Общ лимит за API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage("Твърде много заявки. Опитайте отново по-късно."),
});

// Форма за контакт
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage("Изпратихте твърде много съобщения. Опитайте отново по-късно."),
});
