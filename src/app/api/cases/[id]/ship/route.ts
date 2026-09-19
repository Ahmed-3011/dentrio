import { NextRequest } from 'next/server';
import { get, run } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(['SHIPPING']);
  if (user instanceof Response) return user;
  const { id } = await params;
  const caseId = Number(id);

  const caseRow = await get('SELECT id, status, dentist_user_id, lab_user_id FROM cases WHERE id = ?', [caseId]);
  if (!caseRow) return Response.json({ error: 'Case not found' }, { status: 404 });
  if (caseRow.status !== 'READY') {
    return Response.json({ error: 'Case is not ready to ship' }, { status: 400 });
  }

  const existing = await get('SELECT id FROM shipments WHERE case_id = ?', [caseId]);
  if (existing) return Response.json({ error: 'Shipment already exists' }, { status: 409 });

  const body = await req.json();
  const { trackingNumber } = body as { trackingNumber?: string };

  const dentist = await get('SELECT d.address, d.clinic_name FROM dentists d WHERE d.user_id = ?', [
    Number(caseRow.dentist_user_id),
  ]);
  const lab = await get('SELECT l.address, l.lab_name FROM labs l WHERE l.user_id = ?', [
    Number(caseRow.lab_user_id),
  ]);

  await run(
    `INSERT INTO shipments (case_id, shipper_user_id, pickup_address, delivery_address, tracking_number, status)
     VALUES (?, ?, ?, ?, ?, 'PENDING')`,
    [
      caseId,
      user.id,
      lab ? `${lab.lab_name} — ${lab.address}` : `Lab #${caseRow.lab_user_id}`,
      dentist ? `${dentist.clinic_name} — ${dentist.address}` : `Dentist #${caseRow.dentist_user_id}`,
      trackingNumber || '',
    ]
  );

  await run("UPDATE cases SET status = 'SHIPPED', updated_at = datetime('now') WHERE id = ?", [caseId]);

  return Response.json({ ok: true });
}
