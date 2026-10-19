import { NextRequest } from 'next/server';
import { get, run } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { isAllowedFile } from '@/lib/upload';
import { putUpload, parseUploadedKeys } from '@/lib/storage';

const NEXT_STATUS: Record<string, string> = {
  REVIEW: 'DESIGN',
  DESIGN: 'PRODUCTION',
  PRODUCTION: 'READY',
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(['LAB']);
  if (user instanceof Response) return user;
  const { id } = await params;
  const caseId = Number(id);

  const caseRow = await get(
    'SELECT id, lab_user_id, status, cad_approved_at FROM cases WHERE id = ?',
    [caseId]
  );
  if (!caseRow) return Response.json({ error: 'Case not found' }, { status: 404 });
  if (Number(caseRow.lab_user_id) !== user.id)
    return Response.json({ error: 'Forbidden' }, { status: 403 });

  const current = String(caseRow.status);
  const next = NEXT_STATUS[current];
  if (!next) {
    return Response.json({ error: 'Case cannot be advanced from this stage' }, { status: 400 });
  }

  // Doctor CAD Approval Gate: Cannot start production/milling without doctor approval
  if (next === 'PRODUCTION' && !caseRow.cad_approved_at) {
    return Response.json(
      { error: 'Cannot advance to Milling & Production: The CAD design must be approved by the doctor first.' },
      { status: 400 }
    );
  }

  let designPath: string | null = null;
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    form = new FormData();
  }
  const designFile = form.get('design') as File | null;
  const [uploadedDesign] = parseUploadedKeys(form.get('designKey'));
  const action = String(form.get('action') || '');

  const designName = uploadedDesign ? uploadedDesign.name : designFile && designFile.size > 0 ? designFile.name : null;

  if (designName) {
    if (!isAllowedFile(designName, 'scan')) {
      return Response.json({ error: 'Design file must be .stl or .ply' }, { status: 400 });
    }
    designPath = uploadedDesign
      ? uploadedDesign.path
      : await putUpload(Buffer.from(await (designFile as File).arrayBuffer()), designName, 'designs');
  }

  if (action === 'mark-ready') {
    await run("UPDATE cases SET status = 'READY', updated_at = datetime('now') WHERE id = ?", [caseId]);
  } else if (designPath) {
    await run(
      `UPDATE cases SET status = ?, design_path = ?, updated_at = datetime('now') WHERE id = ?`,
      [next, designPath, caseId]
    );
  } else {
    await run(`UPDATE cases SET status = ?, updated_at = datetime('now') WHERE id = ?`, [
      next,
      caseId,
    ]);
  }

  return Response.json({ ok: true, status: action === 'mark-ready' ? 'READY' : next });
}
