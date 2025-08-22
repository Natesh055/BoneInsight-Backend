import Xray from "../models/Xray.js";
import { encryptFile, saveFile } from "../utils/fileUtils.js";

// Upload handler (existing)
export const uploadXray = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const { encrypted } = encryptFile(file.buffer);
    const filepath = saveFile(encrypted, file.originalname);

    const xray = await Xray.create({
      patient: req.user.id,
      filename: file.originalname,
      filepath,
    });

    res.json({ message: "X-ray uploaded", xray });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// New: Get user X-ray history
export const getXrayHistory = async (req, res) => {
  try {
    const xrays = await Xray.find({ patient: req.user.id }).sort({
      uploadedAt: -1,
    });
    res.json({ xrays });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch X-ray history" });
  }
};
