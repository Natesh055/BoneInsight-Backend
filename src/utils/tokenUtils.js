import jwt from "jsonwebtoken";
import crypto from "crypto";

export function generateAccessToken(user) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not defined");
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

export function generateRefreshTokenPlain() {
  return crypto.randomBytes(64).toString("hex");
}
