import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshTokenPlain } from "../utils/tokenUtils.js";
import dotenv from "dotenv";

dotenv.config();

const SALT_ROUNDS = 10;
const COOKIE_NAME = "boneinsight_refresh";

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };
}

// POST /api/auth/signup
export async function signup(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, passwordHash, role: role || "patient" });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshPlain = generateRefreshTokenPlain();
    const refreshHash = await bcrypt.hash(refreshPlain, SALT_ROUNDS);

    user.refreshTokens = [{ tokenHash: refreshHash }];
    await user.save();

    res.cookie(COOKIE_NAME, refreshPlain, cookieOptions());
    res.json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshPlain = generateRefreshTokenPlain();
    const refreshHash = await bcrypt.hash(refreshPlain, SALT_ROUNDS);

    // Save refresh token
    user.refreshTokens.push({ tokenHash: refreshHash });
    await user.save();

    res.cookie(COOKIE_NAME, refreshPlain, cookieOptions());
    res.json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/auth/refresh
export async function refreshToken(req, res) {
  try {
    const tokenPlain = req.cookies[COOKIE_NAME];
    if (!tokenPlain) return res.status(401).json({ message: "No refresh token" });

    const users = await User.find({});
    let matchedUser = null;
    let matchedIndex = -1;

    for (const u of users) {
      for (let i = 0; i < u.refreshTokens.length; i++) {
        if (await bcrypt.compare(tokenPlain, u.refreshTokens[i].tokenHash)) {
          matchedUser = u;
          matchedIndex = i;
          break;
        }
      }
      if (matchedUser) break;
    }

    if (!matchedUser) return res.status(401).json({ message: "Invalid refresh token" });

    // Rotate token
    const newRefreshPlain = generateRefreshTokenPlain();
    const newRefreshHash = await bcrypt.hash(newRefreshPlain, SALT_ROUNDS);

    matchedUser.refreshTokens[matchedIndex].tokenHash = newRefreshHash;
    await matchedUser.save();

    const accessToken = generateAccessToken(matchedUser);
    res.cookie(COOKIE_NAME, newRefreshPlain, cookieOptions());
    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/auth/logout
export async function logout(req, res) {
  try {
    const tokenPlain = req.cookies[COOKIE_NAME];
    if (tokenPlain) {
      const users = await User.find({});
      for (const u of users) {
        for (let i = u.refreshTokens.length - 1; i >= 0; i--) {
          if (await bcrypt.compare(tokenPlain, u.refreshTokens[i].tokenHash)) {
            u.refreshTokens.splice(i, 1);
            await u.save();
            break;
          }
        }
      }
    }
    res.clearCookie(COOKIE_NAME);
    res.json({ message: "Logged out" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
