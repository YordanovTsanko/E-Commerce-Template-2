import mongoose from "mongoose";
import { env } from "./env.js";

mongoose.set("strictQuery", true);

const connectDB = async () => {
  if (!env.mongoUri) {
    throw new Error("Липсва MONGO_URI в .env файла.");
  }
  if (env.mongoUri.includes("<db_password>")) {
    throw new Error("Заменете <db_password> в MONGO_URI (.env) с истинската парола.");
  }

  await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDbName,
    serverSelectionTimeoutMS: 15000,
  });

  console.log(`✅ MongoDB е свързана (база: ${env.mongoDbName})`);
};

export default connectDB;
