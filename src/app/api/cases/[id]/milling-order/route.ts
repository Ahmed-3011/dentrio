import { NextRequest } from 'next/server';
import { get, run } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { saveUpload } from '@/lib/upload';

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
  
  // Retrieve multiple STL files
  const stlFiles = (form.getAll('stls') as File[]).concat(
    form.getAll('stl') as File[]
  ).filter((f) => f && f.size > 0);

  // Retrieve multiple construction files
  const constructionFiles = (form.getAll('constructions') as File[]).concat(
    form.getAll('construction') as File[]
  ).filter((f) => f && f.size > 0);

  const notes = String(form.get('notes') || '').trim();

  if (stlFiles.length === 0) {
    return Response.json({ error: 'Please upload at least one final Milled STL design file' }, { status: 400 });
  }

  let primaryStlPath = '';
  let primaryStlName = '';

  // Save all STL files to case_files table and disk
  for (let i = 0; i < stlFiles.length; i++) {
    const f = stlFiles[i];
    const buffer = Buffer.from(await f.arrayBuffer());
    const path = saveUpload(buffer, f.name, 'milling_stl');

    if (i === 0) {
      primaryStlPath = path;
      primaryStlName = f.name;
    }

    await run(
      `INSERT INTO case_files (case_id, file_path, file_name, file_type)
       VALUES (?, ?, ?, 'milling_stl')`,
      [caseId, path, f.name]
    );
  }

  let primaryConstPath: string | null = null;
  let primaryConstName: string | null = null;

  // Save all construction files to case_files table and disk
  for (let i = 0; i < constructionFiles.length; i++) {
    const f = constructionFiles[i];
    const buffer = Buffer.from(await f.arrayBuffer());
    const path = saveUpload(buffer, f.name, 'milling_construction');

    if (i === 0) {
      primaryConstPath = path;
      primaryConstName = f.name;
    }

    await run(
      `INSERT INTO case_files (case_id, file_path, file_name, file_type)
       VALUES (?, ?, ?, 'construction_info')`,
      [caseId, path, f.name]
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
  const stlSummary = stlFiles.map((f) => f.name).join(', ');
  const constSummary = constructionFiles.map((f) => f.name).join(', ');

  await run(
    `INSERT INTO messages (case_id, sender_user_id, body, is_image)
     VALUES (?, ?, ?, 0)`,
    [
      caseId,
      user.id,
      `⚙️ [Milling Order Dispatched]: Finalized ${stlFiles.length} STL design file(s) (${stlSummary})${
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
