import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

if (env.cloudinary.isConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
} else {
  console.warn(
    "⚠️  Cloudinary не е конфигуриран – попълнете CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET в .env",
  );
}

// Подпапки в основната папка E-Commerce-Template-2
export const IMAGE_FOLDERS = {
  products: "products",
  categories: "categories",
  banners: "banners",
  avatars: "avatars",
};

export default cloudinary;
