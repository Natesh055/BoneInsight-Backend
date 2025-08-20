import express from 'express';
import multer from 'multer';
import { uploadXray } from '../controllers/xrayController.js';
import { authenticateAccessToken } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();
const upload = multer(); // in-memory storage

// Only patients can upload their X-rays
router.post('/upload', authenticateAccessToken, requireRole('patient'), upload.single('xray'), uploadXray);

export default xrayRoutes = router;
