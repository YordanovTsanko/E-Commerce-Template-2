import mongoose from "mongoose";
import { imageSchema, cleanJSON } from "./shared.js";
import { PRODUCT_UNITS } from "../constants/index.js";
import { makeSlug, uniqueSuffix, round2 } from "../utils/helpers.js";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Заглавието е задължително"],
      trim: true,
      maxlength: [150, "Заглавието е твърде дълго"],
    },
    slug: { type: String, unique: true, index: true },
    description: {
      type: String,
      required: [true, "Описанието е задължително"],
      trim: true,
      maxlength: 5000,
    },
    price: { type: Number, required: [true, "Цената е задължителна"], min: 0 },
    salePrice: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator(value) {
          return value === null || value === undefined || value < this.price;
        },
        message: "Промоционалната цена трябва да е по-ниска от редовната",
      },
    },
    // Ефективна цена (salePrice или price) – използва се за филтри и сортиране
    finalPrice: { type: Number, default: 0, index: true },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null, index: true },
    brand: { type: String, trim: true, maxlength: 100, default: "" },
    tags: { type: [String], default: [] },
    features: { type: [String], default: [] },

    unit: { type: String, enum: PRODUCT_UNITS, default: "piece" },
    stock: { type: Number, required: true, min: [0, "Наличността не може да е отрицателна"], default: 0 },
    sold: { type: Number, default: 0 },

    images: {
      type: [imageSchema],
      default: [],
      validate: {
        validator: (images) => images.length > 0,
        message: "Продуктът трябва да има поне едно изображение",
      },
    },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, toJSON: cleanJSON, toObject: { virtuals: true } },
);

productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ isActive: 1, finalPrice: 1 });
productSchema.index({ isActive: 1, rating: -1 });

productSchema.virtual("inStock").get(function inStock() {
  return this.stock > 0;
});

productSchema.virtual("discountPercent").get(function discountPercent() {
  if (!this.salePrice || !this.price) return 0;
  return Math.round((1 - this.salePrice / this.price) * 100);
});

productSchema.pre("validate", function prepare() {
  if (this.salePrice === "" || this.salePrice === 0) this.salePrice = null;
  this.price = round2(this.price);
  if (this.salePrice !== null && this.salePrice !== undefined) this.salePrice = round2(this.salePrice);
  this.finalPrice = this.salePrice ?? this.price;

  if (!this.slug || this.isModified("name")) {
    this.slug = `${makeSlug(this.name)}-${uniqueSuffix()}`;
  }
});

const Product = mongoose.model("Product", productSchema);
export default Product;
