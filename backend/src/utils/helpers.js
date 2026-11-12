import slugify from "slugify";
import crypto from "crypto";

export const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const makeSlug = (text) =>
  slugify(String(text || ""), { lower: true, strict: true, locale: "bg", trim: true }) ||
  crypto.randomBytes(3).toString("hex");

export const uniqueSuffix = () => crypto.randomBytes(3).toString("hex");

// Позволява масив, JSON низ ("[...]") или низ разделен със запетаи.
export const parseArrayField = (value) => {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);

  const str = String(value).trim();
  if (str.startsWith("[")) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean);
    } catch {
      /* пада към разделяне по запетая */
    }
  }
  return str
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

export const toBool = (value) => value === true || value === "true" || value === "1" || value === 1;

// Пагинация от query параметри
export const getPagination = (query, { defaultLimit = 12, maxLimit = 100 } = {}) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || defaultLimit, 1), maxLimit);
  return { page, limit, skip: (page - 1) * limit };
};

export const buildPaginationMeta = ({ page, limit }, total) => ({
  page,
  limit,
  total,
  pages: Math.max(Math.ceil(total / limit), 1),
});

// Връща само изброените полета от обект.
export const pick = (obj, fields) =>
  fields.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {});
