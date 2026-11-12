import { body, param } from "express-validator";

const email = body("email").trim().isEmail().withMessage("Невалиден имейл адрес.").normalizeEmail({
  gmail_remove_dots: false,
});
const strongPassword = (field) =>
  body(field)
    .isLength({ min: 8, max: 128 })
    .withMessage("Паролата трябва да е поне 8 символа.")
    .matches(/\d/)
    .withMessage("Паролата трябва да съдържа поне една цифра.");

export const registerValidation = [
  email,
  strongPassword("password"),
  body("firstName").trim().notEmpty().withMessage("Името е задължително.").isLength({ max: 50 }),
  body("lastName").optional({ values: "falsy" }).trim().isLength({ max: 50 }),
];

export const loginValidation = [email, body("password").notEmpty().withMessage("Паролата е задължителна.")];

export const forgotPasswordValidation = [email];

export const resetPasswordValidation = [param("token").notEmpty(), strongPassword("password")];

export const changePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("Въведете текущата парола."),
  strongPassword("newPassword"),
];
