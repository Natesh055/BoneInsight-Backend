import express from "express";
import multer from "multer";
import { uploadXray } from "../controllers/xrayController.js";
import { authenticateAccessToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();
const upload = multer(); // in-memory storage

router.post("/upload", authenticateAccessToken, requireRole("patient"), upload.single("xray"), uploadXray);

export default router;
