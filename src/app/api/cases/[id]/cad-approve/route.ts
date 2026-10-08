import { NextRequest } from 'next/server';
import { get, run } from '@/lib/db';
import { requireUser } from '@/lib/auth';

async function isDoctorOfCase(userId: number, caseId: number): Promise<boolean> {
  const c = await get('SELECT dentist_user_id FROM cases WHERE id = ?', [caseId]);
  return !!c && Number(c.dentist_user_id) === userId;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.role !== 'DENTIST') {
    return Response.json({ error: 'Only the prescribing doctor can approve or revise the CAD design' }, { status: 403 });
  }

  const { id } = await params;
  const caseId = Number(id);

  if (!(await isDoctorOfCase(user.id, caseId))) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { action, notes } = body as { action?: 'APPROVE' | 'REVISE'; notes?: string };

  if (!action || (action !== 'APPROVE' && action !== 'REVISE')) {
    return Response.json({ error: 'Invalid action' }, { status: 400 });
  }

  const caseRow = await get('SELECT cad_proposal_path FROM cases WHERE id = ?', [caseId]);
  if (!caseRow || !caseRow.cad_proposal_path) {
    return Response.json({ error: 'No CAD proposal has been uploaded yet for this case' }, { status: 400 });
  }

  if (action === 'APPROVE') {
    // Doctor approves the CAD design proposal -> Ready for Lab Milling Order
    await run(
      `UPDATE cases 
       SET cad_approved_at = datetime('now'),
           cad_approved_by = ?,
           cad_revision_notes = NULL,
           updated_at = datetime('now')
       WHERE id = ?`,
      [user.id, caseId]
    );

    // Notify lab in message thread
    await run(
      `INSERT INTO messages (case_id, sender_user_id, body, is_image)
       VALUES (?, ?, ?, 0)`,
      [caseId, user.id, `✅ [CAD Design Approved]: The doctor has reviewed and approved the 3D CAD design proposal. The case is now authorized for the Milling CAM package.`]
    );

    return Response.json({ ok: true, approved: true });
  } else {
    // Doctor requests revisions from the CAD designer
    const revisionNotes = (notes || '').trim();
    if (!revisionNotes) {
      return Response.json({ error: 'Please provide notes describing the requested design modifications' }, { status: 400 });
    }

    await run(
      `UPDATE cases 
       SET cad_approved_at = NULL,
           cad_approved_by = NULL,
           cad_revision_notes = ?,
           status = 'DESIGN',
           updated_at = datetime('now')
       WHERE id = ?`,
      [revisionNotes, caseId]
    );

    // Notify lab in message thread
    await run(
      `INSERT INTO messages (case_id, sender_user_id, body, is_image)
       VALUES (?, ?, ?, 0)`,
      [caseId, user.id, `⚠️ [CAD Revision Requested by Doctor]: ${revisionNotes}`]
    );

    return Response.json({ ok: true, approved: false, revisionNotes });
  }
}
