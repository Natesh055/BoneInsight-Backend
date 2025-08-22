import Xray from "../models/Xray.js";
import { encryptFile, decryptFile } from "../utils/fileUtils.js";

// Upload handler: encrypt and store X-ray image with key and IV
export const uploadXray = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const { encrypted, key, iv } = encryptFile(file.buffer);

    const xray = await Xray.create({
      patient: req.user.id,
      filename: file.originalname,
      imageData: encrypted,
      contentType: file.mimetype,
      key,
      iv,
      // Optional: add prediction, confidence, doctorNotes if available later
    });

    res.json({ message: "X-ray uploaded and stored encrypted", xray });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user X-ray history (metadata only, exclude sensitive buffers)
export const getXrayHistory = async (req, res) => {
  try {
    const xrays = await Xray.find({ patient: req.user.id })
      .select("-imageData -key -iv")
      .sort({ uploadedAt: -1 });
    res.json({ xrays });
  } catch (err) {
    console.error("History fetch error:", err);
    res.status(500).json({ message: "Failed to fetch X-ray history" });
  }
};

// Serve decrypted X-ray image by ID
export const getXrayImage = async (req, res) => {
  try {
    const xray = await Xray.findById(req.params.id);
    if (!xray || !xray.imageData) return res.status(404).send("Image not found");

    const decrypted = decryptFile(xray.imageData, xray.key, xray.iv);

    res.contentType(xray.contentType);
    res.send(decrypted); // decrypted is already a Buffer
  } catch (err) {
    console.error("Image retrieval error:", err);
    res.status(500).send("Failed to retrieve X-ray image");
  }
};
