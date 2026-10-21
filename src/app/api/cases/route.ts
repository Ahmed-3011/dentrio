import { NextRequest } from 'next/server';
import { run, get, db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { isAllowedFile } from '@/lib/upload';
import { putUpload, parseUploadedKeys } from '@/lib/storage';
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
  const rawDesignParams = String(form.get('designParams') || '');
  let designParams: string | null = null;
  if (rawDesignParams) {
    try {
      JSON.parse(rawDesignParams);
      designParams = rawDesignParams;
    } catch {
      designParams = null;
    }
  }

  // Files already uploaded directly to storage by the browser (Vercel Blob).
  const uploadedKeys = parseUploadedKeys(form.get('scanKeys'));

  // Retrieve all uploaded scan and photo files
  const uploadedFiles = (form.getAll('scans') as File[]).filter((f) => f instanceof File && f.size > 0);
  // Also check 'scan' fallback if sent as single
  const singleScan = form.get('scan') as File | null;
  if (singleScan && singleScan.size > 0 && !uploadedFiles.some((f) => f.name === singleScan.name)) {
    uploadedFiles.push(singleScan);
  }

  if (!labUserId) {
    return Response.json({ error: 'A dental laboratory must be selected' }, { status: 400 });
  }

  // The lab lookup and code generation are independent: one round trip instead of two.
  const [lab, code] = await Promise.all([
    get('SELECT user_id FROM labs WHERE id = ?', [labUserId]),
    ensureCaseCodeUnique(),
  ]);
  if (!lab) {
    return Response.json({ error: 'Selected lab not found' }, { status: 400 });
  }
  const labUserIdRecord = Number(lab.user_id);

  if (uploadedKeys.length === 0 && uploadedFiles.length === 0) {
    return Response.json({ error: 'At least one 3D scan file (.stl or .ply) is required' }, { status: 400 });
  }

  const isScanName = (name: string) => ['.stl', '.ply'].includes('.' + (name.split('.').pop()?.toLowerCase() || ''));

  // Find primary 3D scan
  const primaryKey = uploadedKeys.find((k) => isScanName(k.name)) || null;
  let primaryScanFile: File | null = null;
  if (!primaryKey) {
    for (const f of uploadedFiles) {
      if (isScanName(f.name)) {
        primaryScanFile = f;
        break;
      }
    }
  }

  if (!primaryKey && !primaryScanFile) {
    return Response.json({ error: 'At least one 3D scan file (.stl or .ply) is required' }, { status: 400 });
  }

  const primaryScanName = primaryKey ? primaryKey.name : (primaryScanFile as File).name;
  const primaryScanPath = primaryKey
    ? primaryKey.path
    : await putUpload(Buffer.from(await (primaryScanFile as File).arrayBuffer()), primaryScanName, 'scans');

  const insert = await run(
    `INSERT INTO cases (code, dentist_user_id, lab_user_id, status, scan_original_name, scan_path)
     VALUES (?, ?, ?, 'REVIEW', ?, ?)`,
    [code, user.id, labUserIdRecord, primaryScanName, primaryScanPath]
  );
  const caseId = Number(insert.lastInsertRowid);

  // Stage the remaining files (legacy FormData uploads) in parallel.
  const extraFiles = await Promise.all(
    uploadedFiles.map(async (f) => {
      const isScan = isAllowedFile(f.name, 'scan');
      const isImage = isAllowedFile(f.name, 'image');
      const savedPath = await putUpload(
        Buffer.from(await f.arrayBuffer()),
        f.name,
        isScan ? 'scans' : 'photos'
      );
      return { path: savedPath, name: f.name, type: isScan ? 'scan' : isImage ? 'photo' : 'other' };
    })
  );

  // Files plus prescription in a single write round trip.
  await db().batch(
    [
      ...uploadedKeys.map((k) => ({
        sql: `INSERT INTO case_files (case_id, file_path, file_name, file_type) VALUES (?, ?, ?, ?)`,
        args: [
          caseId,
          k.path,
          k.name,
          isAllowedFile(k.name, 'scan') ? 'scan' : isAllowedFile(k.name, 'image') ? 'photo' : 'other',
        ],
      })),
      ...extraFiles.map((f) => ({
        sql: `INSERT INTO case_files (case_id, file_path, file_name, file_type) VALUES (?, ?, ?, ?)`,
        args: [caseId, f.path, f.name, f.type],
      })),
      {
        sql: `INSERT INTO prescriptions (case_id, restoration_type, tooth_number, material, shade, due_date, notes, design_params)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [caseId, restorationType, toothNumber, material, shade, dueDate || null, notes || null, designParams],
      },
    ],
    'write'
  );

  return Response.json({ ok: true, caseId, code });
}
