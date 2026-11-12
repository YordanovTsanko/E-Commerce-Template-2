import mongoose from "mongoose";
import { imageSchema, cleanJSON } from "./shared.js";
import { makeSlug } from "../utils/helpers.js";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Името на категорията е задължително"],
      trim: true,
      unique: true,
      maxlength: 80,
    },
    slug: { type: String, unique: true, index: true },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    image: { type: imageSchema, default: null },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: cleanJSON },
);

categorySchema.pre("validate", function setSlug() {
  if (!this.slug || this.isModified("name")) this.slug = makeSlug(this.name);
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
