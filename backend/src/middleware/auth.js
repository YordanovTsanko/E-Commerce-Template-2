import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { isAdmin, isSuperAdmin } from "../utils/roles.js";

const extractToken = (req) => {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.split(" ")[1] : null;
};

// Изисква валиден Bearer access token. Записва потребителя в req.user.
export const protect = catchAsync(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return next(new AppError("Не сте влезли в профила си. Моля, влезте, за да продължите.", 401));
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    return next(new AppError("Невалиден или изтекъл токен. Моля, влезте отново.", 401));
  }

  const user = await User.findById(decoded.sub);

  if (!user || user.deleted) {
    return next(new AppError("Потребителят, свързан с този токен, вече не съществува.", 401));
  }

  if (!user.canLogin()) {
    return next(new AppError("Достъпът до акаунта е ограничен. Моля, свържете се с нас.", 403));
  }

  if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime() - 1000) {
    return next(new AppError("Паролата е сменена наскоро. Моля, влезте отново.", 401));
  }

  req.user = user;
  next();
});

// Ако има валиден токен – добавя req.user, иначе продължава като гост.
export const optionalAuth = catchAsync(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub);
    if (user && !user.deleted && user.canLogin()) req.user = user;
  } catch {
    /* невалиден токен -> гост */
  }
  next();
});

// Достъп само за admin или superAdmin (role или булеви флагове)
export const requireAdmin = (req, res, next) => {
  if (!req.user) return next(new AppError("Не сте влезли в профила си.", 401));
  if (!isAdmin(req.user)) {
    return next(new AppError("Нямате права за достъп до този ресурс.", 403));
  }
  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) return next(new AppError("Не сте влезли в профила си.", 401));
  if (!isSuperAdmin(req.user)) {
    return next(new AppError("Само супер администратор може да извърши това действие.", 403));
  }
  next();
};

// Удобни комбинирани вериги
export const adminOnly = [protect, requireAdmin];
export const superAdminOnly = [protect, requireSuperAdmin];
