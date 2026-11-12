export const ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "superAdmin",
});

export const ROLE_VALUES = Object.values(ROLES);

export const USER_STATUSES = ["active", "pending", "suspended", "banned", "inactive"];

export const ORDER_STATUSES = Object.freeze({
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
});

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUSES);

export const ORDER_STATUS_LABELS = {
  Pending: "Изчакваща",
  Processing: "Обработва се",
  Shipped: "Изпратена",
  Delivered: "Доставена",
  Cancelled: "Отказана",
};

export const PAYMENT_METHODS = Object.freeze({
  COD: "cod",
  CARD: "card",
});

export const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded"];

export const PRODUCT_UNITS = ["piece", "kg", "l"];

export const MAX_PRODUCT_IMAGES = 8;
