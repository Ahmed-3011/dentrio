import { NextRequest } from 'next/server';
import { all, get, run } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { saveUpload, isAllowedFile } from '@/lib/upload';

async function canAccess(userId: number, role: string, caseId: number): Promise<boolean> {
  if (role === 'SHIPPING') return false;
  const c = await get('SELECT dentist_user_id, lab_user_id FROM cases WHERE id = ?', [caseId]);
  if (!c) return false;
  if (role === 'DENTIST') return Number(c.dentist_user_id) === userId;
  if (role === 'LAB') return Number(c.lab_user_id) === userId;
  return false;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;
  const caseId = Number(id);

  if (!(await canAccess(user.id, user.role, caseId))) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const messages = await all(
    `SELECT m.id, m.sender_user_id, u.name as sender_name, m.body, m.file_path, m.file_name, m.is_image, m.created_at
     FROM messages m JOIN users u ON u.id = m.sender_user_id
     WHERE m.case_id = ?
     ORDER BY m.id ASC`,
    [caseId]
  );

  return Response.json(
    messages.map((m) => ({
      id: Number(m.id),
      senderUserId: Number(m.sender_user_id),
      senderName: m.sender_name,
      body: m.body,
      file: m.file_path ? { path: m.file_path, name: m.file_name } : null,
      isImage: !!m.is_image,
      createdAt: m.created_at,
      mine: Number(m.sender_user_id) === user.id,
    }))
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;
  const caseId = Number(id);

  if (!(await canAccess(user.id, user.role, caseId))) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const form = await req.formData();
  const body = String(form.get('body') || '');
  const file = form.get('file') as File | null;

  if (!body.trim() && (!file || file.size === 0)) {
    return Response.json({ error: 'Message must have text or a file' }, { status: 400 });
  }

  let filePath: string | null = null;
  let fileName: string | null = null;
  let isImage = 0;

  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
    isImage = imageExts.includes(ext) ? 1 : 0;
    if (isImage) {
      if (!isAllowedFile(file.name, 'image')) {
        return Response.json({ error: 'Unsupported image type' }, { status: 400 });
      }
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    filePath = saveUpload(buffer, file.name, 'chat');
    fileName = file.name;
  }

  const info = await run(
    `INSERT INTO messages (case_id, sender_user_id, body, file_path, file_name, is_image)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [caseId, user.id, body.trim() || null, filePath, fileName, isImage]
  );

  return Response.json({ ok: true, id: Number(info.lastInsertRowid) });
}
