import mongoose from "mongoose";
import { GridFsStorage } from "multer-gridfs-storage";
import multer from "multer";

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/bones";

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "xrays"
    };
  },
});

export const upload = multer({ storage });
