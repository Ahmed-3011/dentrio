import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export const ALLOWED_SCAN_EXT = ['.stl', '.ply'];
export const ALLOWED_IMAGE_EXT = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
export const ALLOWED_AUDIO_EXT = ['.webm', '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.mp4'];

export function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function isAllowedFile(name: string, kind: 'scan' | 'image' | 'audio' | 'any'): boolean {
  const ext = path.extname(name).toLowerCase();
  if (kind === 'scan') return ALLOWED_SCAN_EXT.includes(ext);
  if (kind === 'image') return ALLOWED_IMAGE_EXT.includes(ext);
  if (kind === 'audio') return ALLOWED_AUDIO_EXT.includes(ext);
  return true;
}

export function saveUpload(buffer: Buffer, originalName: string, subdir: string): string {
  ensureUploadDir();
  const dir = path.join(UPLOAD_DIR, subdir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const ext = path.extname(originalName).toLowerCase() || '.webm';
  const filename = `${Date.now()}-${randomBytes(4).toString('hex')}${ext}`;
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, buffer);
  return path.relative(UPLOAD_DIR, filePath).split(path.sep).join('/'); // store like "scans/123.stl"
}

export function absoluteUploadPath(relative: string): string {
  return path.join(UPLOAD_DIR, relative);
}
