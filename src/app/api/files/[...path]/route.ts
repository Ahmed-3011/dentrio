import { NextRequest } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { get } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { absoluteUploadPath } from '@/lib/upload';

async function canAccess(
  userId: number,
  role: string,
  fileName: string
): Promise<boolean> {
  // Shipping never sees clinical/design files.
  if (role === 'SHIPPING') return false;

  const fileRow = await get('SELECT file_path FROM messages WHERE file_path = ?', [fileName]);
  if (fileRow) {
    const msg = await get('SELECT case_id FROM messages WHERE file_path = ?', [fileName]);
    const c = await get('SELECT dentist_user_id, lab_user_id FROM cases WHERE id = ?', [msg?.case_id]);
    if (c) {
      if (role === 'DENTIST') return Number(c.dentist_user_id) === userId;
      if (role === 'LAB') return Number(c.lab_user_id) === userId;
    }
  }

  const caseRow = await get(
    'SELECT id, dentist_user_id, lab_user_id FROM cases WHERE scan_path = ? OR design_path = ?',
    [fileName, fileName]
  );
  if (caseRow) {
    if (role === 'DENTIST') return Number(caseRow.dentist_user_id) === userId;
    if (role === 'LAB') return Number(caseRow.lab_user_id) === userId;
  }

  return false;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const { path: p } = await params;
  const relative = p.join('/');

  const abs = absoluteUploadPath(relative);
  const base = path.resolve(absoluteUploadPath(''));
  if (!abs.startsWith(base + path.sep)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!fs.existsSync(abs)) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  if (!(await canAccess(user.id, user.role, relative))) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ext = path.extname(abs).toLowerCase();
  const mime =
    ext === '.stl' ? 'model/stl'
    : ext === '.ply' ? 'application/octet-stream'
    : ext === '.png' ? 'image/png'
    : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
    : ext === '.gif' ? 'image/gif'
    : ext === '.webp' ? 'image/webp'
    : 'application/octet-stream';

  const data = fs.readFileSync(abs);
  return new Response(new Uint8Array(data), {
    status: 200,
    headers: { 'Content-Type': mime, 'Content-Length': String(data.length) },
  });
}
