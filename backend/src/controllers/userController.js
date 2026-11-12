import User from "../models/User.js";
import Session from "../models/Session.js";
import RefreshToken from "../models/RefreshToken.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { logAction } from "../utils/auditLog.js";
import { deleteImages } from "../services/imageService.js";
import { canAssignRole, canManageUser } from "../utils/roles.js";
import { escapeRegex, getPagination, buildPaginationMeta, pick } from "../utils/helpers.js";

const PROFILE_FIELDS = ["firstName", "lastName", "phone", "address"];
const ADDRESS_FIELDS = ["fullName", "phone", "city", "postalCode", "street", "country"];

// =========================
// ТЕКУЩ ПОТРЕБИТЕЛ
// =========================
export const getMe = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

export const updateMe = catchAsync(async (req, res) => {
  const updates = pick(req.body, PROFILE_FIELDS);
  const user = req.user;

  if (updates.address) {
    user.address = { ...(user.address?.toObject?.() || {}), ...pick(updates.address, ADDRESS_FIELDS) };
    delete updates.address;
  }

  user.set(updates);
  await user.save();

  res.status(200).json({ success: true, message: "Профилът е обновен.", data: { user } });
});

export const updateMyAvatar = catchAsync(async (req, res, next) => {
  const [image] = req.uploadedImages || [];
  if (!image) return next(new AppError("Моля, изберете изображение.", 400));

  const oldAvatar = req.user.avatar;
  req.user.avatar = image;
  await req.user.save();
  if (oldAvatar?.publicId) await deleteImages([oldAvatar]);

  res.status(200).json({ success: true, message: "Профилната снимка е обновена.", data: { user: req.user } });
});

export const deleteMyAvatar = catchAsync(async (req, res) => {
  if (req.user.avatar?.publicId) await deleteImages([req.user.avatar]);
  req.user.avatar = null;
  await req.user.save();
  res.status(200).json({ success: true, message: "Профилната снимка е премахната.", data: { user: req.user } });
});

export const deleteMe = catchAsync(async (req, res) => {
  const user = req.user;
  if (user.avatar?.publicId) await deleteImages([user.avatar]);

  user.set({ deleted: true, deletedAt: new Date(), status: "inactive", avatar: null });
  await user.save({ validateBeforeSave: false });

  await Promise.all([
    RefreshToken.updateMany({ user: user._id, revoked: false }, { revoked: true, revokedAt: new Date() }),
    Session.updateMany({ user: user._id, isActive: true }, { isActive: false, revokedAt: new Date() }),
  ]);

  res.status(200).json({ success: true, message: "Акаунтът е изтрит." });
});

// =========================
// АДМИН: управление на потребители
// =========================
export const getUsers = catchAsync(async (req, res) => {
  const pagination = getPagination(req.query, { defaultLimit: 20 });
  const filter = { deleted: false };

  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search?.trim()) {
    const regex = new RegExp(escapeRegex(req.query.search.trim()), "i");
    filter.$or = [{ email: regex }, { firstName: regex }, { lastName: regex }, { phone: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: { items: users, pagination: buildPaginationMeta(pagination, total) },
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.params.id, deleted: false });
  if (!user) return next(new AppError("Потребителят не е намерен.", 404));
  res.status(200).json({ success: true, data: { user } });
});

const loadManageableUser = async (req) => {
  const target = await User.findOne({ _id: req.params.id, deleted: false });
  if (!target) throw new AppError("Потребителят не е намерен.", 404);
  if (!canManageUser(req.user, target)) {
    throw new AppError("Нямате права да управлявате този потребител.", 403);
  }
  return target;
};

export const updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  if (!canAssignRole(req.user, role)) {
    return next(new AppError("Само супер администратор може да назначава администратори.", 403));
  }

  const target = await loadManageableUser(req);
  const before = { role: target.role };
  target.role = role;
  await target.save();

  await logAction(req, { action: "user.role", entityType: "User", entityId: target._id, before, after: { role } });
  res.status(200).json({ success: true, message: "Ролята е обновена.", data: { user: target } });
});

export const updateUserStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const target = await loadManageableUser(req);
  const before = { status: target.status };
  target.status = status;
  await target.save({ validateBeforeSave: false });

  // При блокиране прекратяваме активните сесии
  if (["suspended", "banned", "inactive"].includes(status)) {
    await RefreshToken.updateMany({ user: target._id, revoked: false }, { revoked: true, revokedAt: new Date() });
  }

  await logAction(req, { action: "user.status", entityType: "User", entityId: target._id, before, after: { status } });
  res.status(200).json({ success: true, message: "Статусът е обновен.", data: { user: target } });
});

export const deleteUser = catchAsync(async (req, res) => {
  const target = await loadManageableUser(req);
  if (target.avatar?.publicId) await deleteImages([target.avatar]);

  target.set({ deleted: true, deletedAt: new Date(), status: "inactive", avatar: null });
  await target.save({ validateBeforeSave: false });
  await RefreshToken.updateMany({ user: target._id, revoked: false }, { revoked: true, revokedAt: new Date() });

  await logAction(req, { action: "user.delete", entityType: "User", entityId: target._id });
  res.status(200).json({ success: true, message: "Потребителят е изтрит." });
});
