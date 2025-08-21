import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import xrayRoutes from "./routes/xrayRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/xrays", xrayRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).send("✅ BoneInsight Backend is running!");
});

// MongoDB connection and server start
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/bones")
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
