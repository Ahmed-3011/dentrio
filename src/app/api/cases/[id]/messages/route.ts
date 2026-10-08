import { NextRequest } from 'next/server';
import { all, get, run } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { saveUpload, isAllowedFile, ALLOWED_AUDIO_EXT } from '@/lib/upload';

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
  if (user instanceof Response) return user;
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
    messages.map((m) => {
      const fileNameStr = m.file_name ? String(m.file_name) : '';
      const ext = fileNameStr ? '.' + (fileNameStr.split('.').pop()?.toLowerCase() || '') : '';
      const isAudio = ALLOWED_AUDIO_EXT.includes(ext);

      return {
        id: Number(m.id),
        senderUserId: Number(m.sender_user_id),
        senderName: String(m.sender_name || ''),
        body: m.body ? String(m.body) : null,
        file: m.file_path ? { path: String(m.file_path), name: fileNameStr } : null,
        isImage: !!m.is_image,
        isAudio,
        createdAt: String(m.created_at || ''),
        mine: Number(m.sender_user_id) === user.id,
      };
    })
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const { id } = await params;
  const caseId = Number(id);

  if (!(await canAccess(user.id, user.role, caseId))) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    form = new FormData();
  }
  const body = String(form.get('body') || '');

  // Retrieve multiple attached files
  const uploadedFiles = (form.getAll('files') as File[]).concat(
    form.getAll('file') as File[]
  );

  if (!body.trim() && (uploadedFiles.length === 0 || uploadedFiles.every((f) => f.size === 0))) {
    return Response.json({ error: 'Message must have text or at least one file' }, { status: 400 });
  }

  const validFiles = uploadedFiles.filter((f) => f && f.size > 0);

  if (validFiles.length === 0) {
    // Text-only message
    const info = await run(
      `INSERT INTO messages (case_id, sender_user_id, body, file_path, file_name, is_image)
       VALUES (?, ?, ?, NULL, NULL, 0)`,
      [caseId, user.id, body.trim()]
    );
    return Response.json({ ok: true, id: Number(info.lastInsertRowid) });
  }

  // Insert a message for each file (first message carries the text body if present)
  let firstId = 0;
  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i];
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
    const isImage = isAllowedFile(file.name, 'image') ? 1 : 0;
    const isAudio = isAllowedFile(file.name, 'audio');

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = saveUpload(
      buffer,
      file.name,
      isAudio ? 'voice_notes' : isImage ? 'photos' : 'attachments'
    );

    const messageBody = i === 0 && body.trim() ? body.trim() : null;

    const info = await run(
      `INSERT INTO messages (case_id, sender_user_id, body, file_path, file_name, is_image)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [caseId, user.id, messageBody, filePath, file.name, isImage]
    );
    if (i === 0) firstId = Number(info.lastInsertRowid);
  }

  return Response.json({ ok: true, id: firstId });
}
