import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env"), quiet: true });

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isPlaceholder = (value) => !value || /^<.*>$/.test(String(value).trim());

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: (process.env.NODE_ENV || "development") === "development",
  port: toNumber(process.env.PORT, 5000),
  appUrl: process.env.APP_URL || "http://localhost:5173",

  mongoUri: process.env.MONGO_URI,
  mongoDbName: process.env.MONGO_DB_NAME || "e-commerce-template-2",

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "change-me-access",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "change-me-refresh",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || "E-Commerce-Template-2",
    get isConfigured() {
      return ![this.cloudName, this.apiKey, this.apiSecret].some(isPlaceholder);
    },
  },

  store: {
    name: process.env.STORE_NAME || "EcoKoren-Yordanov",
    email: process.env.STORE_EMAIL || "hello@ecokoren.bg",
    currency: process.env.CURRENCY || "EUR",
    taxRate: toNumber(process.env.TAX_RATE, 0.2),
    pricesIncludeTax: process.env.PRICES_INCLUDE_TAX !== "false",
    shippingFee: toNumber(process.env.SHIPPING_FEE, 5.99),
    freeShippingThreshold: toNumber(process.env.FREE_SHIPPING_THRESHOLD, 50),
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: toNumber(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || "no-reply@example.com",
    get isConfigured() {
      return Boolean(this.host && this.user && this.pass);
    },
  },
};

export { isPlaceholder };
