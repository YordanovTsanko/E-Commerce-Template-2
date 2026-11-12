import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";

import routes from "./routes/index.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { env } from "./config/env.js";

const app = express();

// Правилен req.ip зад proxy / load balancer (Render, Railway, Nginx...)
app.set("trust proxy", 1);

// CORS е отворен за всички произходи (автентикацията е чрез Bearer токен, не бисквитки)
app.use(cors());
app.options("*", cors());

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
if (env.isDev) app.use(morgan("dev"));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
// Премахва $ и . от ключовете – защита от NoSQL injection
app.use(mongoSanitize());

app.get("/health", (req, res) => res.status(200).json({ status: "ok", time: new Date().toISOString() }));

app.use("/api/v1", apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
