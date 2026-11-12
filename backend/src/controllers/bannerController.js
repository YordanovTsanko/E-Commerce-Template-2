import Banner from "../models/Banner.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { isAdmin } from "../utils/roles.js";
import { toBool, pick } from "../utils/helpers.js";
import { logAction } from "../utils/auditLog.js";
import { deleteImages } from "../services/imageService.js";

const FIELDS = ["title", "subtitle", "buttonText", "link", "sortOrder"];

export const getBanners = catchAsync(async (req, res) => {
  const filter = isAdmin(req.user) && req.query.all === "true" ? {} : { isActive: true };
  const items = await Banner.find(filter).sort({ sortOrder: 1, createdAt: -1 }).lean();
  res.status(200).json({ success: true, data: { items } });
});

export const createBanner = catchAsync(async (req, res, next) => {
  const [image] = req.uploadedImages || [];
  if (!image) return next(new AppError("Качете изображение за банера.", 400));

  const banner = await Banner.create({
    ...pick(req.body, FIELDS),
    isActive: req.body.isActive === undefined ? true : toBool(req.body.isActive),
    image,
  });

  await logAction(req, { action: "banner.create", entityType: "Banner", entityId: banner._id });
  res.status(201).json({ success: true, message: "Банерът е създаден.", data: { banner } });
});

export const updateBanner = catchAsync(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return next(new AppError("Банерът не е намерен.", 404));

  const oldImage = banner.image?.toObject?.();
  const [newImage] = req.uploadedImages || [];

  banner.set(pick(req.body, FIELDS));
  if (req.body.isActive !== undefined) banner.isActive = toBool(req.body.isActive);
  if (newImage) banner.image = newImage;

  await banner.save();
  if (newImage && oldImage) await deleteImages([oldImage]);

  await logAction(req, { action: "banner.update", entityType: "Banner", entityId: banner._id });
  res.status(200).json({ success: true, message: "Банерът е обновен.", data: { banner } });
});

export const deleteBanner = catchAsync(async (req, res, next) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) return next(new AppError("Банерът не е намерен.", 404));
  await deleteImages([banner.image]);

  await logAction(req, { action: "banner.delete", entityType: "Banner", entityId: banner._id });
  res.status(200).json({ success: true, message: "Банерът е изтрит." });
});
