import { NextRequest } from 'next/server';
import { run, get } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { saveUpload, isAllowedFile } from '@/lib/upload';
import { ensureCaseCodeUnique } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const user = await requireRole(['DENTIST']);

  const form = await req.formData();
  const labUserId = Number(form.get('labUserId'));
  const restorationType = String(form.get('restorationType') || '');
  const toothNumber = String(form.get('toothNumber') || '');
  const material = String(form.get('material') || '');
  const shade = String(form.get('shade') || '');
  const dueDate = String(form.get('dueDate') || '');
  const notes = String(form.get('notes') || '');
  const scanFile = form.get('scan') as File | null;

  if (!labUserId) {
    return Response.json({ error: 'A lab must be selected' }, { status: 400 });
  }
  const lab = await get('SELECT user_id FROM labs WHERE user_id = ?', [labUserId]);
  if (!lab) {
    return Response.json({ error: 'Selected lab not found' }, { status: 400 });
  }
  if (!scanFile || scanFile.size === 0) {
    return Response.json({ error: 'A 3D scan file is required' }, { status: 400 });
  }
  if (!isAllowedFile(scanFile.name, 'scan')) {
    return Response.json({ error: 'Scan file must be .stl or .ply' }, { status: 400 });
  }

  const buffer = Buffer.from(await scanFile.arrayBuffer());
  const scanPath = saveUpload(buffer, scanFile.name, 'scans');

  const code = await ensureCaseCodeUnique();
  const insert = await run(
    `INSERT INTO cases (code, dentist_user_id, lab_user_id, status, scan_original_name, scan_path)
     VALUES (?, ?, ?, 'REVIEW', ?, ?)`,
    [code, user.id, labUserId, scanFile.name, scanPath]
  );
  const caseId = Number(insert.lastInsertRowid);

  await run(
    `INSERT INTO prescriptions (case_id, restoration_type, tooth_number, material, shade, due_date, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [caseId, restorationType, toothNumber, material, shade, dueDate || null, notes || null]
  );

  return Response.json({ ok: true, caseId, code });
}
