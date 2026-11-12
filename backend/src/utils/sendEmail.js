import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter = null;

const getTransporter = () => {
  if (!env.smtp.isConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
};

// Връща true при успешно изпращане. Ако SMTP не е настроен,
// съдържанието се логва в конзолата (удобно при разработка).
const sendEmail = async ({ to, subject, text, html, replyTo }) => {
  const mailer = getTransporter();

  if (!mailer) {
    console.info(`✉️  [SMTP не е настроен] До: ${to} | Тема: ${subject}\n${text || ""}`);
    return false;
  }

  try {
    await mailer.sendMail({ from: env.smtp.from, to, subject, text, html, replyTo });
    return true;
  } catch (error) {
    console.error("Грешка при изпращане на имейл:", error.message);
    return false;
  }
};

export default sendEmail;
