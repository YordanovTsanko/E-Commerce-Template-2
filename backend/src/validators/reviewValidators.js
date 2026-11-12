import { body, param } from "express-validator";

export const reviewValidation = [
  param("id").isMongoId().withMessage("Невалиден продукт."),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Оценката трябва да е между 1 и 5.").toInt(),
  body("comment").optional().trim().isLength({ max: 2000 }).withMessage("Коментарът е твърде дълъг."),
];
