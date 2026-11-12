import multer from "multer";
import AppError from "../utils/AppError.js";
import { uploadMany, deleteImages } from "../services/imageService.js";

const MAX_FILE_SIZE_MB = 8;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

const multerInstance = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new AppError("Позволени са само изображения (JPG, PNG, WEBP, GIF, AVIF).", 400));
  },
});

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: `Файлът е твърде голям (максимум ${MAX_FILE_SIZE_MB} MB).`,
  LIMIT_FILE_COUNT: "Качени са твърде много файлове.",
  LIMIT_UNEXPECTED_FILE: "Качени са твърде много файлове или е използвано грешно поле.",
};

/**
 * Middleware фабрика: приема файлове от полето `field`, качва ги в Cloudinary
 * (папка E-Commerce-Template-2/<folder>) и записва резултата в req.uploadedImages
 * като [{ url, publicId }].
 *
 * Ако заявката завърши с грешка (статус >= 400), качените снимки се изтриват
 * автоматично, за да не остават неизползвани файлове в Cloudinary.
 */
export const uploadImages = ({ field = "images", maxCount = 8, folder }) => [
  (req, res, next) => {
    multerInstance.array(field, maxCount)(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        return next(new AppError(MULTER_MESSAGES[err.code] || err.message, 400));
      }
      next(err);
    });
  },
  async (req, res, next) => {
    req.uploadedImages = [];
    const files = req.files || [];
    if (!files.length) return next();

    try {
      req.uploadedImages = await uploadMany(files, folder);

      res.on("finish", () => {
        if (res.statusCode >= 400 && req.uploadedImages?.length) {
          deleteImages(req.uploadedImages);
        }
      });

      next();
    } catch (error) {
      next(error);
    }
  },
];
