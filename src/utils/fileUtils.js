import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const ALGORITHM = 'aes-256-cbc';
const KEY = crypto.randomBytes(32); // In production, store securely
const IV = crypto.randomBytes(16);

export function encryptFile(buffer) {
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return { encrypted, iv: IV.toString('hex') };
}

export function saveFile(buffer, filename) {
  const filepath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  return filepath;
}
