'use client';

import { upload } from '@vercel/blob/client';

let probe: Promise<boolean> | null = null;

export function blobUploadsEnabled(): Promise<boolean> {
  if (probe) return probe;
  probe = fetch('/api/blob/upload', { cache: 'no-store' })
    .then((res) => (res.ok ? (res.json() as Promise<{ enabled?: boolean }>) : { enabled: false }))
    .then((data) => Boolean(data.enabled))
    .catch(() => false);
  return probe;
}

export async function uploadToBlob(file: File, prefix: string): Promise<{ path: string; name: string }> {
  const safe = file.name.replace(/[^\w.\-]+/g, '_').replace(/^_+/, '') || 'file';
  const blob = await upload(`${prefix}/${Date.now()}-${safe}`, file, {
    access: 'public',
    handleUploadUrl: '/api/blob/upload',
    multipart: file.size > 5 * 1024 * 1024,
  });
  return { path: new URL(blob.url).pathname.replace(/^\//, ''), name: file.name };
}
