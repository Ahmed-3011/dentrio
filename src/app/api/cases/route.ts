import { NextRequest } from 'next/server';
import { run, get } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { saveUpload, isAllowedFile } from '@/lib/upload';
import { ensureCaseCodeUnique } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const user = await requireRole(['DENTIST']);
  if (user instanceof Response) return user;

  const form = await req.formData();
  const labUserId = Number(form.get('labUserId'));
  const restorationType = String(form.get('restorationType') || '');
  const toothNumber = String(form.get('toothNumber') || '');
  const material = String(form.get('material') || '');
  const shade = String(form.get('shade') || '');
  const dueDate = String(form.get('dueDate') || '');
  const notes = String(form.get('notes') || '');

  // Retrieve all uploaded scan and photo files
  const uploadedFiles = form.getAll('scans') as File[];
  // Also check 'scan' fallback if sent as single
  const singleScan = form.get('scan') as File | null;
  if (singleScan && singleScan.size > 0 && !uploadedFiles.some((f) => f.name === singleScan.name)) {
    uploadedFiles.push(singleScan);
  }

  if (!labUserId) {
    return Response.json({ error: 'A dental laboratory must be selected' }, { status: 400 });
  }
  const lab = await get('SELECT user_id FROM labs WHERE id = ?', [labUserId]);
  if (!lab) {
    return Response.json({ error: 'Selected lab not found' }, { status: 400 });
  }
  const labUserIdRecord = Number(lab.user_id);

  if (uploadedFiles.length === 0 || uploadedFiles.every((f) => f.size === 0)) {
    return Response.json({ error: 'At least one 3D scan file (.stl or .ply) is required' }, { status: 400 });
  }

  // Find primary 3D scan
  let primaryScanFile: File | null = null;
  for (const f of uploadedFiles) {
    const ext = '.' + (f.name.split('.').pop()?.toLowerCase() || '');
    if (['.stl', '.ply'].includes(ext)) {
      primaryScanFile = f;
      break;
    }
  }

  if (!primaryScanFile) {
    return Response.json({ error: 'At least one 3D scan file (.stl or .ply) is required' }, { status: 400 });
  }

  const primaryBuffer = Buffer.from(await primaryScanFile.arrayBuffer());
  const primaryScanPath = saveUpload(primaryBuffer, primaryScanFile.name, 'scans');

  const code = await ensureCaseCodeUnique();
  const insert = await run(
    `INSERT INTO cases (code, dentist_user_id, lab_user_id, status, scan_original_name, scan_path)
     VALUES (?, ?, ?, 'REVIEW', ?, ?)`,
    [code, user.id, labUserIdRecord, primaryScanFile.name, primaryScanPath]
  );
  const caseId = Number(insert.lastInsertRowid);

  // Save all uploaded files to case_files
  for (const f of uploadedFiles) {
    if (f.size === 0) continue;
    const ext = '.' + (f.name.split('.').pop()?.toLowerCase() || '');
    const isScan = isAllowedFile(f.name, 'scan');
    const isImage = isAllowedFile(f.name, 'image');

    const fileBuffer = Buffer.from(await f.arrayBuffer());
    const savedPath = saveUpload(fileBuffer, f.name, isScan ? 'scans' : 'photos');

    await run(
      `INSERT INTO case_files (case_id, file_path, file_name, file_type)
       VALUES (?, ?, ?, ?)`,
      [caseId, savedPath, f.name, isScan ? 'scan' : isImage ? 'photo' : 'other']
    );
  }

  await run(
    `INSERT INTO prescriptions (case_id, restoration_type, tooth_number, material, shade, due_date, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [caseId, restorationType, toothNumber, material, shade, dueDate || null, notes || null]
  );

  return Response.json({ ok: true, caseId, code });
}
