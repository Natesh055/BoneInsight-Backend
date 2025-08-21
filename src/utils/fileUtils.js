import fs from "fs";
import crypto from "crypto";
import path from "path";

const UPLOAD_DIR = "./uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Encrypt file buffer
export function encryptFile(buffer) {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return { encrypted, key, iv };
}

// Save file to disk
export function saveFile(buffer, filename) {
  const filepath = path.join(UPLOAD_DIR, `${Date.now()}-${filename}`);
  fs.writeFileSync(filepath, buffer);
  return filepath;
}
