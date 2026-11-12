import { body, param, query } from "express-validator";
import { PRODUCT_UNITS } from "../constants/index.js";

export const idParam = [param("id").isMongoId().withMessage("Невалидно id.")];

const priceRule = (field, label) =>
  body(field)
    .isFloat({ min: 0, max: 10_000_000 })
    .withMessage(`${label} трябва да е положително число.`)
    .bail()
    .custom((value) => /^\d+([.,]\d{1,2})?$/.test(String(value)))
    .withMessage(`${label} може да има максимум 2 знака след десетичната запетая.`)
    .customSanitizer((value) => Number(String(value).replace(",", ".")));

const productFields = (optional) => {
  const opt = (chain) => (optional ? chain.optional() : chain);
  return [
    opt(body("name")).trim().isLength({ min: 1, max: 150 }).withMessage("Заглавието е задължително (до 150 символа)."),
    opt(body("description"))
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage("Описанието е задължително (до 5000 символа)."),
    optional ? priceRule("price", "Цената").optional() : priceRule("price", "Цената"),
    body("salePrice")
      .optional({ values: "falsy" })
      .custom((value) => value === "null" || /^\d+([.,]\d{1,2})?$/.test(String(value)))
      .withMessage("Невалидна промоционална цена.")
      .customSanitizer((value) => (value === "null" ? null : Number(String(value).replace(",", ".")))),
    opt(body("stock")).isFloat({ min: 0 }).withMessage("Наличността трябва да е 0 или повече."),
    body("unit").optional().isIn(PRODUCT_UNITS).withMessage("Невалидна мерна единица."),
    body("category")
      .optional({ values: "falsy" })
      .custom((value) => value === "null" || /^[a-f\d]{24}$/i.test(value))
      .withMessage("Невалидна категория."),
    body("brand").optional().trim().isLength({ max: 100 }),
    body("isActive").optional().isIn(["true", "false", true, false]),
    body("isFeatured").optional().isIn(["true", "false", true, false]),
  ];
};

export const createProductValidation = productFields(false);
export const updateProductValidation = [...idParam, ...productFields(true)];

export const listProductsValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 60 }),
  query("minPrice").optional({ values: "falsy" }).isFloat({ min: 0 }),
  query("maxPrice").optional({ values: "falsy" }).isFloat({ min: 0 }),
  query("rating").optional({ values: "falsy" }).isFloat({ min: 0, max: 5 }),
  query("search").optional().isString().isLength({ max: 100 }),
];
