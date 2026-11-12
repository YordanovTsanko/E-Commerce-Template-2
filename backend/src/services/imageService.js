import cloudinary from "../config/cloudinary.js";
import { env } from "../config/env.js";
import AppError from "../utils/AppError.js";

const ensureConfigured = () => {
  if (!env.cloudinary.isConfigured) {
    throw new AppError(
      "Cloudinary не е конфигуриран. Попълнете CLOUDINARY_* променливите в .env.",
      500,
    );
  }
};

// Качва буфер в папка E-Commerce-Template-2/<subfolder>
export const uploadBuffer = (buffer, subfolder) => {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.cloudinary.folder}/${subfolder}`,
        resource_type: "image",
        // Ограничава оригинала до 1600px, за да не се пазят огромни файлове
        transformation: [{ width: 1600, height: 1600, crop: "limit" }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
};

export const uploadMany = async (files, subfolder) => {
  const results = await Promise.allSettled(files.map((file) => uploadBuffer(file.buffer, subfolder)));

  const uploaded = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
  const failed = results.find((r) => r.status === "rejected");

  if (failed) {
    // Ако някое качване се провали – премахваме успешно качените, за да няма "сираци"
    await deleteImages(uploaded);
    console.error("Cloudinary upload error:", failed.reason?.message || failed.reason);
    throw new AppError("Възникна грешка при качването на изображенията в Cloudinary.", 502);
  }

  return uploaded;
};

// Приема масив от { publicId } обекти или publicId низове
export const deleteImages = async (images = []) => {
  const ids = images
    .map((img) => (typeof img === "string" ? img : img?.publicId))
    .filter(Boolean);

  if (!ids.length || !env.cloudinary.isConfigured) return;

  const results = await Promise.allSettled(
    ids.map((id) => cloudinary.uploader.destroy(id, { invalidate: true })),
  );

  results
    .filter((r) => r.status === "rejected")
    .forEach((r) => console.error("Cloudinary delete error:", r.reason?.message || r.reason));
};

// Сравнява стар и нов списък и трие от Cloudinary премахнатите снимки
export const deleteRemovedImages = async (oldImages = [], newImages = []) => {
  const keep = new Set(newImages.map((img) => img?.publicId).filter(Boolean));
  const removed = oldImages.filter((img) => img?.publicId && !keep.has(img.publicId));
  await deleteImages(removed);
};
