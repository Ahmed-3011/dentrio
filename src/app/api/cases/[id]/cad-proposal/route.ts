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
    return Response.json({ error: 'Only dental laboratories can submit HTML design previews' }, { status: 403 });
  }

  const { id } = await params;
  const caseId = Number(id);

  if (!(await isLabOfCase(user.id, caseId))) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get('proposal') as File | null;
  const [uploaded] = parseUploadedKeys(form.get('proposalKey'));
  const designerNotes = String(form.get('notes') || '').trim();

  if (!uploaded && (!file || file.size === 0)) {
    return Response.json({ error: 'Please upload an interactive 3D HTML design file (.html)' }, { status: 400 });
  }

  const fileName = uploaded ? uploaded.name : (file as File).name;
  const ext = '.' + (fileName.split('.').pop()?.toLowerCase() || '');
  const allowed = ['.html', '.htm'];
  if (!allowed.includes(ext)) {
    return Response.json({ error: 'Only interactive 3D Web Viewer files (.html) are accepted for design approval' }, { status: 400 });
  }

  const filePath = uploaded
    ? uploaded.path
    : await putUpload(Buffer.from(await (file as File).arrayBuffer()), fileName, 'cad_proposals');

  // Update case record with HTML 3D viewer, reset doctor approval to pending review
  await run(
    `UPDATE cases 
     SET cad_proposal_path = ?, 
         cad_proposal_name = ?, 
         cad_approved_at = NULL, 
         cad_approved_by = NULL, 
         cad_revision_notes = NULL,
         status = 'REVIEW',
         updated_at = datetime('now')
     WHERE id = ?`,
    [filePath, fileName, caseId]
  );

  // Log message in the case thread
  await run(
    `INSERT INTO messages (case_id, sender_user_id, body, file_path, file_name, is_image)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [
      caseId,
      user.id,
      `🌐 [3D HTML Design Preview Uploaded]: ${designerNotes || 'The interactive 3D HTML Web Viewer is ready for doctor review & authorization.'}`,
      filePath,
      fileName,
    ]
  );

  return Response.json({ ok: true, path: filePath, name: fileName });
}
