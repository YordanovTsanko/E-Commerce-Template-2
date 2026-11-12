// Огледало на backend/src/utils/pricing.js – използва се за количката на гост
// и за мигновено показване на сумите. Окончателните суми се изчисляват на сървъра.
const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const DEFAULT_STORE_CONFIG = {
  currency: 'EUR',
  taxRate: 0.2,
  pricesIncludeTax: true,
  shippingFee: 5.99,
  freeShippingThreshold: 50,
};

export const calculateTotals = (items, settings = DEFAULT_STORE_CONFIG) => {
  const { taxRate, pricesIncludeTax, shippingFee, freeShippingThreshold } = { ...DEFAULT_STORE_CONFIG, ...settings };

  let subtotal = 0;
  let originalSubtotal = 0;
  for (const item of items) {
    subtotal += item.finalPrice * item.quantity;
    originalSubtotal += item.price * item.quantity;
  }
  subtotal = round2(subtotal);

  const shipping =
    subtotal === 0 || (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) ? 0 : round2(shippingFee);

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
    amountToFreeShipping: freeShippingThreshold > 0 ? round2(Math.max(freeShippingThreshold - subtotal, 0)) : 0,
  };
};

export const getFinalPrice = (product) => product?.salePrice ?? product?.finalPrice ?? product?.price ?? 0;
