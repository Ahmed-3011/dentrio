import { NextRequest } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { requireUser } from '@/lib/auth';
import { blobEnabled } from '@/lib/storage';

const ALLOWED_CONTENT_TYPES = [
  'model/stl',
  'application/octet-stream',
  'application/sla',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'audio/webm',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
  'audio/aac',
  'video/mp4',
  'video/webm',
  'text/html',
  'application/xml',
  'text/xml',
  'application/json',
  'application/zip',
  'application/pdf',
];

export async function GET() {
  return Response.json({ enabled: blobEnabled() });
}

export async function POST(req: NextRequest) {
  if (!blobEnabled()) {
    return Response.json({ error: 'Blob storage is not configured' }, { status: 503 });
  }
  const user = await requireUser();
  if (user instanceof Response) return user;

  let body: HandleUploadBody;
  try {
    body = (await req.json()) as HandleUploadBody;
  } catch {
    return Response.json({ error: 'Invalid upload payload' }, { status: 400 });
  }

  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_CONTENT_TYPES,
        maximumSizeInBytes: 500 * 1024 * 1024,
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ userId: user.id, role: user.role }),
      }),
      onUploadCompleted: async () => {},
    });
    return Response.json(json);
  } catch (err) {
    return Response.json({ error: (err as Error).message || 'Upload rejected' }, { status: 400 });
  }
}
