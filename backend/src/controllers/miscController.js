import catchAsync from "../utils/catchAsync.js";
import sendEmail from "../utils/sendEmail.js";
import { env } from "../config/env.js";

// Публични настройки на магазина (валута, доставка, ДДС)
export const getStoreConfig = (req, res) => {
  const { name, email, currency, taxRate, pricesIncludeTax, shippingFee, freeShippingThreshold } = env.store;
  res.status(200).json({
    success: true,
    data: { name, email, currency, taxRate, pricesIncludeTax, shippingFee, freeShippingThreshold },
  });
};

const escapeHtml = (str) =>
  String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const sendContactMessage = catchAsync(async (req, res) => {
  const { name, email, message } = req.body;

  await sendEmail({
    to: env.store.email,
    replyTo: email,
    subject: `Ново съобщение от ${name} – ${env.store.name}`,
    text: `От: ${name} <${email}>\n\n${message}`,
    html: `<p><b>От:</b> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
  });

  res.status(200).json({ success: true, message: "Съобщението е изпратено. Ще се свържем с вас скоро!" });
});
