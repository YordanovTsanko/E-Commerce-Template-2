import mongoose from "mongoose";
import { cleanJSON } from "./shared.js";

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 2000, default: "" },
  },
  { timestamps: true, toJSON: cleanJSON },
);

// Един отзив на потребител за продукт
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Преизчислява средната оценка и броя отзиви на продукта
reviewSchema.statics.recalculate = async function recalculate(productId) {
  const [stats] = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(String(productId)) } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await mongoose.model("Product").updateOne(
    { _id: productId },
    {
      rating: stats ? Math.round(stats.avg * 10) / 10 : 0,
      numReviews: stats ? stats.count : 0,
    },
  );
};

const Review = mongoose.model("Review", reviewSchema);
export default Review;
