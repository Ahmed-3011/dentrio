import { NextRequest } from 'next/server';
import { get, run } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { putUpload, parseUploadedKeys } from '@/lib/storage';

async function isLabOfCase(userId: number, caseId: number): Promise<boolean> {
  const c = await get('SELECT lab_user_id FROM cases WHERE id = ?', [caseId]);
  return !!c && Number(c.lab_user_id) === userId;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.role !== 'LAB') {
    return Response.json({ error: 'Only dental laboratories can submit milling orders' }, { status: 403 });
  }

  const { id } = await params;
  const caseId = Number(id);

  if (!(await isLabOfCase(user.id, caseId))) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const caseRow = await get('SELECT cad_approved_at FROM cases WHERE id = ?', [caseId]);
  if (!caseRow || !caseRow.cad_approved_at) {
    return Response.json(
      { error: 'Cannot create Milling Order: The CAD design must be approved by the doctor first.' },
      { status: 400 }
    );
  }

  const form = await req.formData();

  // Files already uploaded by the browser (Vercel Blob)
  const stlKeys = parseUploadedKeys(form.get('stlKeys'));
  const constructionKeys = parseUploadedKeys(form.get('constructionKeys'));

  // Retrieve multiple STL files
  const stlFiles = (form.getAll('stls') as File[]).concat(
    form.getAll('stl') as File[]
  ).filter((f) => f && f.size > 0);

  // Retrieve multiple construction files
  const constructionFiles = (form.getAll('constructions') as File[]).concat(
    form.getAll('construction') as File[]
  ).filter((f) => f && f.size > 0);

  const notes = String(form.get('notes') || '').trim();

  if (stlKeys.length === 0 && stlFiles.length === 0) {
    return Response.json({ error: 'Please upload at least one final Milled STL design file' }, { status: 400 });
  }

  const stlEntries: { path: string; name: string }[] = [...stlKeys];
  for (const f of stlFiles) {
    stlEntries.push({
      path: await putUpload(Buffer.from(await f.arrayBuffer()), f.name, 'milling_stl'),
      name: f.name,
    });
  }

  const constructionEntries: { path: string; name: string }[] = [...constructionKeys];
  for (const f of constructionFiles) {
    constructionEntries.push({
      path: await putUpload(Buffer.from(await f.arrayBuffer()), f.name, 'milling_construction'),
      name: f.name,
    });
  }

  let primaryStlPath = '';
  let primaryStlName = '';

  // Save all STL files to case_files table
  for (let i = 0; i < stlEntries.length; i++) {
    const f = stlEntries[i];

    if (i === 0) {
      primaryStlPath = f.path;
      primaryStlName = f.name;
    }

    await run(
      `INSERT INTO case_files (case_id, file_path, file_name, file_type)
       VALUES (?, ?, ?, 'milling_stl')`,
      [caseId, f.path, f.name]
    );
  }

  let primaryConstPath: string | null = null;
  let primaryConstName: string | null = null;

  // Save all construction files to case_files table
  for (let i = 0; i < constructionEntries.length; i++) {
    const f = constructionEntries[i];

    if (i === 0) {
      primaryConstPath = f.path;
      primaryConstName = f.name;
    }

    await run(
      `INSERT INTO case_files (case_id, file_path, file_name, file_type)
       VALUES (?, ?, ?, 'construction_info')`,
      [caseId, f.path, f.name]
    );
  }

  // Update case record with Milling Package & advance status to PRODUCTION
  await run(
    `UPDATE cases 
     SET milling_stl_path = ?,
         milling_stl_name = ?,
         milling_construction_path = ?,
         milling_construction_name = ?,
         milling_notes = ?,
         milling_created_at = datetime('now'),
         status = 'PRODUCTION',
         updated_at = datetime('now')
     WHERE id = ?`,
    [primaryStlPath, primaryStlName, primaryConstPath, primaryConstName, notes || null, caseId]
  );

  // Notify case thread
  const stlSummary = stlEntries.map((f) => f.name).join(', ');
  const constSummary = constructionEntries.map((f) => f.name).join(', ');

  await run(
    `INSERT INTO messages (case_id, sender_user_id, body, is_image)
     VALUES (?, ?, ?, 0)`,
    [
      caseId,
      user.id,
      `⚙️ [Milling Order Dispatched]: Finalized ${stlEntries.length} STL design file(s) (${stlSummary})${
        constSummary ? ` and construction info (${constSummary})` : ''
      } dispatched to 5-axis CAM milling machine. Status is now IN PRODUCTION.`,
    ]
  );

  return Response.json({
    ok: true,
    millingPackage: {
      stlPath: primaryStlPath,
      stlName: primaryStlName,
      constructionPath: primaryConstPath,
      constructionName: primaryConstName,
      notes,
    },
  });
}
