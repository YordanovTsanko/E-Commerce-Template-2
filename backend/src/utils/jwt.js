import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const { accessSecret, refreshSecret, accessExpiresIn, refreshExpiresIn } = env.jwt;

export const generateAccessToken = (userId) =>
  jwt.sign({ sub: String(userId) }, accessSecret, { expiresIn: accessExpiresIn });

export const generateRefreshToken = (userId) =>
  // jti гарантира уникален токен дори при две заявки в една и съща секунда
  jwt.sign({ sub: String(userId), jti: crypto.randomUUID() }, refreshSecret, {
    expiresIn: refreshExpiresIn,
  });

export const verifyAccessToken = (token) => jwt.verify(token, accessSecret);
export const verifyRefreshToken = (token) => jwt.verify(token, refreshSecret);

// "30d" / "15m" -> Date в бъдещето
export const expiresInToDate = (expiresIn) => {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) return new Date(Date.now() + 15 * 60 * 1000);

  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return new Date(Date.now() + Number(match[1]) * unitMs[match[2]]);
};

export const REFRESH_EXPIRES_IN = refreshExpiresIn;
