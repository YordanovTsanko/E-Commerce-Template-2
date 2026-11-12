import mongoose from "mongoose";

// Обща схема за изображение в Cloudinary
export const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: null },
  },
  { _id: false },
);

// Премахва __v и id от JSON отговорите
export const cleanJSON = {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret.id;
    return ret;
  },
};
