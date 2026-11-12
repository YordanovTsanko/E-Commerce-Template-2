import Cart from "../models/Cart.js";
import AppError from "../utils/AppError.js";
import { calculateTotals } from "../utils/pricing.js";
import { round2 } from "../utils/helpers.js";

const PRODUCT_FIELDS = "name slug price salePrice finalPrice images unit stock isActive";

// Валидира количеството спрямо мерната единица и наличността
export const normalizeQuantity = (quantity, product) => {
  const value = Number(quantity);

  if (!Number.isFinite(value) || value <= 0) {
    throw new AppError("Количеството трябва да е положително число.", 400);
  }
  if (product.unit === "piece" && !Number.isInteger(value)) {
    throw new AppError("Количеството за този продукт трябва да е цяло число.", 400);
  }
  if (value > product.stock) {
    throw new AppError(
      product.stock > 0
        ? `Наличното количество от „${product.name}“ е ${product.stock}.`
        : `„${product.name}“ не е наличен в момента.`,
      409,
    );
  }
  return Number(value.toFixed(3));
};

// Зарежда количката с продуктите и изчислява сумите.
// Неактивните/изтрити продукти се премахват автоматично.
export const getCartWithTotals = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.product", PRODUCT_FIELDS);

  if (!cart) return { items: [], summary: calculateTotals([]) };

  const validItems = cart.items.filter((item) => item.product && item.product.isActive);
  if (validItems.length !== cart.items.length) {
    cart.items = validItems.map((i) => ({ product: i.product._id, quantity: i.quantity }));
    await cart.save();
  }

  const items = validItems.map((item) => {
    const product = item.product.toObject();
    return {
      product,
      quantity: item.quantity,
      lineTotal: round2(product.finalPrice * item.quantity),
      exceedsStock: item.quantity > product.stock,
    };
  });

  const summary = calculateTotals(
    items.map((i) => ({ price: i.product.price, finalPrice: i.product.finalPrice, quantity: i.quantity })),
  );

  return { items, summary };
};

export const getOrCreateCart = (userId) =>
  Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    { new: true, upsert: true },
  );
