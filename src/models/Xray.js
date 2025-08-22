import mongoose from "mongoose";

const xraySchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  filename: { type: String, required: true },
  imageData: { type: Buffer, required: true },
  contentType: { type: String, required: true },
  key: { type: Buffer },
  iv: { type: Buffer },
  prediction: { type: String },
  confidence: { type: Number },
  doctorNotes: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Xray", xraySchema);
