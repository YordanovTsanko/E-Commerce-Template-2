/**
 * Създава нов или повишава съществуващ потребител до администратор.
 *
 * Употреба:
 *   npm run create-admin -- <email> <парола> [superAdmin|admin]
 *
 * Пример:
 *   npm run create-admin -- owner@shop.bg MyPass123 superAdmin
 *
 * Ако потребителят съществува, паролата се игнорира и се сменя само ролята.
 */
import mongoose from "mongoose";
import "../src/config/env.js";
import connectDB from "../src/config/db.js";
import User from "../src/models/User.js";
import { ROLES } from "../src/constants/index.js";

const [email, password, roleArg = ROLES.SUPER_ADMIN] = process.argv.slice(2);
const role = roleArg === ROLES.ADMIN ? ROLES.ADMIN : ROLES.SUPER_ADMIN;

const run = async () => {
  if (!email) {
    console.error("Употреба: npm run create-admin -- <email> <парола> [superAdmin|admin]");
    process.exit(1);
  }

  await connectDB();

  let user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    user.role = role;
    user.status = "active";
    user.deleted = false;
    await user.save({ validateBeforeSave: true });
    console.log(`✅ Потребителят ${user.email} вече е с роля "${role}".`);
  } else {
    if (!password || password.length < 8) {
      console.error("❌ За нов потребител е нужна парола с поне 8 символа.");
      process.exit(1);
    }
    user = await User.create({
      email,
      password,
      firstName: "Admin",
      role,
      status: "active",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });
    console.log(`✅ Създаден е администратор ${user.email} с роля "${role}".`);
  }

  await mongoose.connection.close();
};

run().catch(async (err) => {
  console.error("❌ Грешка:", err.message);
  await mongoose.connection.close();
  process.exit(1);
});
