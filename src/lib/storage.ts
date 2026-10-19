import { put, head } from '@vercel/blob';
import { saveUpload } from '@/lib/upload';
import { mimeFor } from '@/lib/mime';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export function blobEnabled(): boolean {
  return Boolean(BLOB_TOKEN);
}

function safeName(originalName: string): string {
  const cleaned = originalName.replace(/[^\w.\-]+/g, '_').replace(/^_+/, '');
  return cleaned || 'file';
}

/**
 * Persists an uploaded buffer and returns the storage key used in the DB.
 * On Vercel (BLOB_READ_WRITE_TOKEN set) the bytes go to Vercel Blob; locally
 * they keep going to the gitignored ./uploads directory.
 */
export async function putUpload(buffer: Buffer, originalName: string, subdir: string): Promise<string> {
  if (!blobEnabled()) return saveUpload(buffer, originalName, subdir);
  const pathname = `${subdir}/${Date.now()}-${safeName(originalName)}`;
  const blob = await put(pathname, buffer, {
    access: 'public',
    addRandomSuffix: true,
    contentType: mimeFor(originalName),
  });
  return new URL(blob.url).pathname.replace(/^\//, '');
}

export async function readUpload(key: string): Promise<{ body: ArrayBuffer; contentType: string } | null> {
  if (!blobEnabled()) return null;
  try {
    const meta = await head(key);
    const res = await fetch(meta.url, { cache: 'no-store' });
    if (!res.ok) return null;
    return { body: await res.arrayBuffer(), contentType: meta.contentType || mimeFor(key) };
  } catch {
    return null;
  }
}

export { isAllowedFile } from '@/lib/upload';

export type UploadedKey = { path: string; name: string };

/**
 * Parses a JSON field containing files the browser already pushed to storage,
 * e.g. `scanKeys` / `stlKeys`. Returns [] for missing or malformed input.
 */
export function parseUploadedKeys(raw: FormDataEntryValue | null | undefined): UploadedKey[] {
  if (!raw || typeof raw !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (k): k is UploadedKey =>
          Boolean(k) && typeof (k as UploadedKey).path === 'string' && typeof (k as UploadedKey).name === 'string'
      )
      .map((k) => ({ path: k.path, name: k.name }));
  } catch {
    return [];
  }
}
