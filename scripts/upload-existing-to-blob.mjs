import fs from 'node:fs';
import path from 'node:path';
import { put } from '@vercel/blob';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.stl': 'model/stl',
  '.ply': 'application/octet-stream',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.webm': 'audio/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.mp4': 'video/mp4',
  '.xml': 'application/xml; charset=utf-8',
  '.zip': 'application/zip',
  '.pdf': 'application/pdf',
};

function mimeFor(name) {
  const ext = path.extname(name).toLowerCase();
  return MIME[ext] || 'application/octet-stream';
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error('BLOB_READ_WRITE_TOKEN is not set.');
  console.error('Copy it from your Vercel project (Settings > Environment Variables) and run:');
  console.error('  $env:BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."');
  console.error('  npm run blob:migrate');
  process.exit(1);
}

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  console.log('No ./uploads directory found — nothing to migrate.');
  process.exit(0);
}

const files = walk(uploadDir);
console.log(`Found ${files.length} local file(s) in ./uploads`);

let uploaded = 0;
let failed = 0;

for (const file of files) {
  const key = path.relative(uploadDir, file).split(path.sep).join('/');
  try {
    await put(key, fs.readFileSync(file), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: mimeFor(key),
      token,
    });
    uploaded++;
    console.log(`  ok   ${key}`);
  } catch (err) {
    failed++;
    console.error(`  FAIL ${key}: ${err.message}`);
  }
}

console.log(`Done. Uploaded ${uploaded}, failed ${failed}.`);
process.exit(failed > 0 ? 1 : 0);
