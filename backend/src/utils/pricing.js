import { env } from "../config/env.js";
import { round2 } from "./helpers.js";

// Единна логика за изчисляване на сумите – използва се от количката и поръчките.
// items: [{ price, finalPrice, quantity }]
export const calculateTotals = (items, settings = env.store) => {
  const { taxRate, pricesIncludeTax, shippingFee, freeShippingThreshold } = settings;

  let subtotal = 0;
  let originalSubtotal = 0;

  for (const item of items) {
    subtotal += item.finalPrice * item.quantity;
    originalSubtotal += item.price * item.quantity;
  }

  subtotal = round2(subtotal);
  originalSubtotal = round2(originalSubtotal);

  const shipping =
    subtotal === 0 || (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold)
      ? 0
      : round2(shippingFee);

  let tax;
  let total;

  if (pricesIncludeTax) {
    total = round2(subtotal + shipping);
    tax = round2(total - total / (1 + taxRate));
  } else {
    tax = round2((subtotal + shipping) * taxRate);
    total = round2(subtotal + shipping + tax);
  }

  return {
    subtotal,
    savings: round2(originalSubtotal - subtotal),
    shipping,
    tax,
    taxRate,
    pricesIncludeTax,
    total,
    freeShippingThreshold,
    amountToFreeShipping:
      freeShippingThreshold > 0 ? round2(Math.max(freeShippingThreshold - subtotal, 0)) : 0,
  };
};
