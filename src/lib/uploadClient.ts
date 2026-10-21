'use client';

import { upload } from '@vercel/blob/client';

export type BlobStatus = 'enabled' | 'disabled' | 'unreachable';

let probe: Promise<BlobStatus> | null = null;

export function blobStatus(): Promise<BlobStatus> {
  if (probe) return probe;
  probe = fetch('/api/blob/upload', { cache: 'no-store' })
    .then((res) => (res.ok ? (res.json() as Promise<{ enabled?: boolean }>) : null))
    .then((data) =>
      data && typeof data.enabled === 'boolean' ? (data.enabled ? 'enabled' : 'disabled') : 'unreachable'
    )
    .catch(() => 'unreachable');
  return probe;
}

export async function blobUploadsEnabled(): Promise<boolean> {
  return (await blobStatus()) === 'enabled';
}

const UPLOAD_TIMEOUT_MS = 5 * 60 * 1000;

export async function uploadToBlob(
  file: File,
  prefix: string,
  onProgress?: (percentage: number) => void
): Promise<{ path: string; name: string }> {
  const safe = file.name.replace(/[^\w.\-]+/g, '_').replace(/^_+/, '') || 'file';
  const uploadPromise = upload(`${prefix}/${Date.now()}-${safe}`, file, {
    access: 'public',
    handleUploadUrl: '/api/blob/upload',
    multipart: file.size > 5 * 1024 * 1024,
    onUploadProgress: onProgress ? ({ percentage }) => onProgress(Math.round(percentage)) : undefined,
  });

  const blob = await Promise.race([
    uploadPromise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Upload timed out. Check your connection and try again.')), UPLOAD_TIMEOUT_MS)
    ),
  ]);

  return { path: new URL(blob.url).pathname.replace(/^\//, ''), name: file.name };
}
