import mongoose from 'mongoose';

const xraySchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  filepath: { type: String, required: true }, // encrypted storage path
  prediction: { type: String, default: '' },
  confidence: { type: Number, default: 0 },
  doctorNotes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Xray || mongoose.model('Xray', xraySchema);
