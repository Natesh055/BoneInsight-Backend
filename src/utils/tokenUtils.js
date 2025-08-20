import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export function generateAccessToken(user) {
  const payload = { userId: user._id.toString(), role: user.role };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m' });
}

export function generateRefreshTokenPlain() {
  // returns a cryptographically secure random token (plain text)
  return crypto.randomBytes(parseInt(process.env.REFRESH_TOKEN_BYTES || '64')).toString('hex');
}
