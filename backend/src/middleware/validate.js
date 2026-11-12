import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";

// Поставя се след масив от express-validator правила.
// Връща по една (първата) грешка за всяко поле.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const messages = [
    ...new Set(
      errors
        .array({ onlyFirstError: true })
        .map((e) => (e.msg === "Invalid value" ? `Невалидна стойност за поле „${e.path}“.` : e.msg)),
    ),
  ];

  next(new AppError(messages.join(" "), 400));
};

export default validate;
