import { body, param } from "express-validator";

const quantity = body("quantity").isFloat({ gt: 0 }).withMessage("Количеството трябва да е по-голямо от 0.").toFloat();

export const productIdParamValidation = [param("productId").isMongoId().withMessage("Невалиден продукт.")];

export const addItemValidation = [
  body("productId").isMongoId().withMessage("Невалиден продукт."),
  quantity.optional(),
];

export const updateItemValidation = [...productIdParamValidation, quantity];

export const mergeCartValidation = [
  body("items").isArray({ max: 100 }).withMessage("Невалидна количка."),
  body("items.*.productId").isMongoId().withMessage("Невалиден продукт."),
  body("items.*.quantity").isFloat({ gt: 0 }).withMessage("Невалидно количество."),
];
