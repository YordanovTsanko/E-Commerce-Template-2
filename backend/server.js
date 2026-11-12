import "./src/config/env.js";
import mongoose from "mongoose";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { env } from "./src/config/env.js";

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION – спиране на сървъра:", err);
  process.exit(1);
});

const start = async () => {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(`🚀 Сървърът работи на http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} получен – затваряне...`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION – спиране на сървъра:", err);
    server.close(() => process.exit(1));
  });
};

start().catch((err) => {
  console.error("Неуспешно стартиране на сървъра:", err.message);
  process.exit(1);
});
