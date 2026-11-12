import mongoose from "mongoose";
import crypto from "crypto";
import { cleanJSON } from "./shared.js";
import {
  ORDER_STATUSES,
  ORDER_STATUS_VALUES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PRODUCT_UNITS,
} from "../constants/index.js";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    slug: { type: String, default: null },
    image: { type: String, default: null },
    unit: { type: String, enum: PRODUCT_UNITS, default: "piece" },
    price: { type: Number, required: true }, // редовна цена към момента на поръчката
    finalPrice: { type: Number, required: true }, // платена единична цена
    quantity: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false },
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    country: { type: String, default: "България" },
    notes: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { _id: false },
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUS_VALUES, required: true },
    note: { type: String, default: "" },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: {
      type: [orderItemSchema],
      validate: { validator: (v) => v.length > 0, message: "Поръчката няма продукти" },
    },
    shippingAddress: { type: shippingAddressSchema, required: true },

    paymentMethod: { type: String, enum: Object.values(PAYMENT_METHODS), required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "Pending" },
    paidAt: { type: Date, default: null },

    status: { type: String, enum: ORDER_STATUS_VALUES, default: ORDER_STATUSES.PENDING, index: true },
    statusHistory: { type: [statusHistorySchema], default: [] },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    stockRestored: { type: Boolean, default: false },

    currency: { type: String, default: "EUR" },
    itemsPrice: { type: Number, required: true },
    savings: { type: Number, default: 0 },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    taxRate: { type: Number, default: 0 },
    pricesIncludeTax: { type: Boolean, default: true },
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true, toJSON: cleanJSON },
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });

// Номер от вида ORD-261112-4F7A2C
orderSchema.pre("validate", function setOrderNumber() {
  if (!this.orderNumber) {
    const d = new Date();
    const datePart = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(
      d.getDate(),
    ).padStart(2, "0")}`;
    this.orderNumber = `ORD-${datePart}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  }
  if (this.isNew && !this.statusHistory.length) {
    this.statusHistory.push({ status: this.status, changedBy: this.user });
  }
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
