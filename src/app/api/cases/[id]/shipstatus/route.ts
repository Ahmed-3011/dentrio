import { NextRequest } from 'next/server';
import { get, run } from '@/lib/db';
import { requireRole } from '@/lib/auth';

const SHIP_NEXT: Record<string, string> = {
  PENDING: 'PICKED_UP',
  PICKED_UP: 'IN_TRANSIT',
  IN_TRANSIT: 'DELIVERED',
};

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(['SHIPPING']);
  const { id } = await params;
  const caseId = Number(id);

  const ship = await get('SELECT id, status, shipper_user_id FROM shipments WHERE case_id = ?', [caseId]);
  if (!ship) return Response.json({ error: 'No shipment for this case' }, { status: 404 });
  if (Number(ship.shipper_user_id) !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const current = String(ship.status);
  const next = SHIP_NEXT[current];
  if (!next) return Response.json({ error: 'Shipment already delivered' }, { status: 400 });

  await run(
    `UPDATE shipments SET status = ?, completed_at = CASE WHEN ? = 'DELIVERED' THEN datetime('now') ELSE completed_at END WHERE id = ?`,
    [next, next, Number(ship.id)]
  );

  if (next === 'DELIVERED') {
    await run("UPDATE cases SET status = 'CLOSED', updated_at = datetime('now') WHERE id = ?", [caseId]);
  }

  return Response.json({ ok: true, status: next });
}
