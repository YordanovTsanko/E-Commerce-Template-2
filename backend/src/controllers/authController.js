import User from "../models/User.js";
import Session from "../models/Session.js";
import LoginHistory from "../models/LoginHistory.js";
import RefreshToken from "../models/RefreshToken.js";
import PasswordReset from "../models/PasswordReset.js";

import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import sendEmail from "../utils/sendEmail.js";
import { env } from "../config/env.js";
import { generateRawToken, hashToken } from "../utils/tokenUtils.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  expiresInToDate,
  REFRESH_EXPIRES_IN,
} from "../utils/jwt.js";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

const clientInfo = (req) => ({ ip: req.ip, userAgent: req.headers["user-agent"] || null });

// Издава access + refresh токени и създава Session + RefreshToken записи
const issueTokens = async (user, req) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  const expiresAt = expiresInToDate(REFRESH_EXPIRES_IN);
  const tokenHash = hashToken(refreshToken);

  await Promise.all([
    RefreshToken.create({ user: user._id, tokenHash, expiresAt, ...clientInfo(req) }),
    Session.create({ user: user._id, sessionToken: tokenHash, expiresAt, ...clientInfo(req) }),
  ]);

  return { accessToken, refreshToken };
};

const sendAuthResponse = async (user, req, res, statusCode = 200) => {
  const tokens = await issueTokens(user, req);
  res.status(statusCode).json({ success: true, data: { user, ...tokens } });
};

const sendVerificationEmail = async (user) => {
  const rawToken = generateRawToken();
  user.emailVerificationToken = hashToken(rawToken);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${env.appUrl}/verify-email/${rawToken}`;
  await sendEmail({
    to: user.email,
    subject: `Потвърдете имейла си – ${env.store.name}`,
    text: `Здравейте! Потвърдете имейл адреса си тук: ${verifyUrl}`,
    html: `<p>Здравейте!</p><p>Потвърдете имейл адреса си, като кликнете <a href="${verifyUrl}">тук</a>.</p>`,
  });
};

// =========================
// REGISTER
// =========================
export const register = catchAsync(async (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;

  if (await User.exists({ email })) {
    return next(new AppError("Вече съществува потребител с този имейл.", 409));
  }

  const user = await User.create({ email, password, firstName, lastName });
  await sendVerificationEmail(user);

  await sendAuthResponse(user, req, res, 201);
});

// =========================
// LOGIN
// =========================
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, deleted: false }).select(
    "+password +failedLoginAttempts +lockUntil",
  );

  const recordLogin = (success, failureReason = null) =>
    LoginHistory.create({ user: user?._id || null, success, failureReason, ...clientInfo(req) });

  if (!user) {
    return next(new AppError("Грешен имейл или парола.", 401));
  }

  if (user.isAccountLocked()) {
    await recordLogin(false, "account_locked");
    return next(
      new AppError("Акаунтът е временно заключен поради много неуспешни опити. Опитайте след 15 минути.", 423),
    );
  }

  const blockedStatuses = {
    inactive: ["account_inactive", "Достъпът до акаунта е ограничен."],
    suspended: ["account_suspended", "Акаунтът е временно спрян. Свържете се с нас за съдействие."],
    banned: ["account_banned", "Акаунтът е блокиран."],
  };

  if (blockedStatuses[user.status]) {
    const [reason, message] = blockedStatuses[user.status];
    await recordLogin(false, reason);
    return next(new AppError(message, 403));
  }

  if (!(await user.comparePassword(password))) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
      user.failedLoginAttempts = 0;
    }
    await user.save({ validateBeforeSave: false });
    await recordLogin(false, "invalid_credentials");
    return next(new AppError("Грешен имейл или парола.", 401));
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = new Date();
  user.lastLoginIp = req.ip;
  await user.save({ validateBeforeSave: false });
  await recordLogin(true);

  await sendAuthResponse(user, req, res);
});

// =========================
// REFRESH (ротация на refresh token)
// =========================
export const refresh = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return next(new AppError("Липсва refresh token.", 400));

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return next(new AppError("Сесията е изтекла. Моля, влезте отново.", 401));
  }

  const oldHash = hashToken(refreshToken);
  const stored = await RefreshToken.findOne({ tokenHash: oldHash });

  if (!stored || !stored.isActive()) {
    return next(new AppError("Сесията е невалидна. Моля, влезте отново.", 401));
  }

  const user = await User.findById(decoded.sub);
  if (!user || !user.canLogin()) {
    return next(new AppError("Потребителят не е намерен или достъпът е ограничен.", 401));
  }

  const newRefreshToken = generateRefreshToken(user._id);
  const newHash = hashToken(newRefreshToken);
  const expiresAt = expiresInToDate(REFRESH_EXPIRES_IN);

  await stored.revoke(newHash);
  await RefreshToken.create({ user: user._id, tokenHash: newHash, expiresAt, ...clientInfo(req) });
  // Сесията следва новия refresh token, за да може logout да я прекрати
  await Session.updateOne(
    { sessionToken: oldHash },
    { sessionToken: newHash, lastActivityAt: new Date(), expiresAt },
  );

  res.status(200).json({
    success: true,
    data: { accessToken: generateAccessToken(user._id), refreshToken: newRefreshToken },
  });
});

// =========================
// LOGOUT
// =========================
export const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await Promise.all([
      RefreshToken.updateOne({ tokenHash }, { revoked: true, revokedAt: new Date() }),
      Session.updateOne({ sessionToken: tokenHash }, { isActive: false, revokedAt: new Date() }),
    ]);
  }

  res.status(200).json({ success: true, message: "Излязохте успешно." });
});

// =========================
// VERIFY EMAIL
// =========================
export const verifyEmail = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    emailVerificationToken: hashToken(req.params.token),
    emailVerificationExpires: { $gt: Date.now() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    return next(new AppError("Връзката за потвърждение е невалидна или изтекла.", 400));
  }

  user.emailVerified = true;
  user.emailVerifiedAt = new Date();
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  if (user.status === "pending") user.status = "active";
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: "Имейлът е потвърден успешно." });
});

export const resendVerification = catchAsync(async (req, res, next) => {
  if (req.user.emailVerified) {
    return next(new AppError("Имейлът вече е потвърден.", 400));
  }
  await sendVerificationEmail(req.user);
  res.status(200).json({ success: true, message: "Изпратихме нова връзка за потвърждение." });
});

// =========================
// FORGOT / RESET PASSWORD
// =========================
export const forgotPassword = catchAsync(async (req, res) => {
  const user = await User.findOne({ email: req.body.email, deleted: false });

  if (user) {
    const rawToken = generateRawToken();
    await PasswordReset.create({
      user: user._id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      ...clientInfo(req),
    });

    const resetUrl = `${env.appUrl}/reset-password/${rawToken}`;
    await sendEmail({
      to: user.email,
      subject: `Нулиране на парола – ${env.store.name}`,
      text: `Нулирайте паролата си тук (валидно 1 час): ${resetUrl}`,
      html: `<p>Нулирайте паролата си, като кликнете <a href="${resetUrl}">тук</a>. Връзката е валидна 1 час.</p>`,
    });
  }

  // Винаги един и същ отговор, за да не се разкрива дали имейлът съществува
  res.status(200).json({
    success: true,
    message: "Ако имейлът е регистриран, изпратихме връзка за нулиране на паролата.",
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const resetRequest = await PasswordReset.findOne({
    tokenHash: hashToken(req.params.token),
    used: false,
    expiresAt: { $gt: Date.now() },
  });

  if (!resetRequest) {
    return next(new AppError("Връзката за нулиране е невалидна или изтекла.", 400));
  }

  const user = await User.findById(resetRequest.user);
  if (!user) return next(new AppError("Потребителят не е намерен.", 404));

  user.password = req.body.password;
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();
  await resetRequest.markUsed();

  // Прекратява всички активни сесии от съображения за сигурност
  await Promise.all([
    RefreshToken.updateMany({ user: user._id, revoked: false }, { revoked: true, revokedAt: new Date() }),
    Session.updateMany({ user: user._id, isActive: true }, { isActive: false, revokedAt: new Date() }),
  ]);

  res.status(200).json({ success: true, message: "Паролата е сменена успешно. Можете да влезете." });
});

// =========================
// CHANGE PASSWORD (влязъл потребител)
// =========================
export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError("Текущата парола е грешна.", 401));
  }

  user.password = newPassword;
  await user.save();

  // Нови токени, защото старите стават невалидни след смяна на паролата
  await sendAuthResponse(user, req, res);
});
