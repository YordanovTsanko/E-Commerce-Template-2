import mongoose from "mongoose";
import { imageSchema, cleanJSON } from "./shared.js";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Заглавието е задължително"], trim: true, maxlength: 120 },
    subtitle: { type: String, trim: true, maxlength: 300, default: "" },
    buttonText: { type: String, trim: true, maxlength: 40, default: "" },
    link: { type: String, trim: true, maxlength: 300, default: "" },
    image: { type: imageSchema, required: [true, "Изображението е задължително"] },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: cleanJSON },
);

bannerSchema.index({ isActive: 1, sortOrder: 1 });

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
