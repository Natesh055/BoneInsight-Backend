import express from "express";
import multer from "multer";
import { uploadXray, getXrayHistory, getXrayImage } from "../controllers/xrayController.js";
import { authenticateAccessToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();
const upload = multer();

router.post(
  "/upload",
  authenticateAccessToken,
  requireRole("patient"),
  upload.single("xray"),
  uploadXray
);

router.get(
  "/history",
  authenticateAccessToken,
  requireRole("patient"),
  getXrayHistory
);

router.get(
  "/:id/image",
  authenticateAccessToken,
  requireRole("patient"),
  getXrayImage
);

export default router;
