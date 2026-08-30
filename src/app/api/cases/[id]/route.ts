import { NextRequest } from 'next/server';
import { get } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { STATUS_LABEL } from '@/lib/constants';

function canAccess(userId: number, role: string, row: Record<string, unknown>): boolean {
  if (role === 'DENTIST') return Number(row.dentist_user_id) === userId;
  if (role === 'LAB') return Number(row.lab_user_id) === userId;
  if (role === 'SHIPPING') return true;
  return false;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;
  const caseId = Number(id);

  const row = await get(
    `SELECT c.*, d.clinic_name,
       l.lab_name, p.restoration_type, p.tooth_number, p.material, p.shade, p.due_date, p.notes,
       s.tracking_number, s.status as ship_status, s.pickup_address, s.delivery_address
     FROM cases c
     LEFT JOIN dentists d ON d.user_id = c.dentist_user_id
     LEFT JOIN labs l ON l.user_id = c.lab_user_id
     LEFT JOIN prescriptions p ON p.case_id = c.id
     LEFT JOIN shipments s ON s.case_id = c.id
     WHERE c.id = ?`,
    [caseId]
  );

  if (!row) return Response.json({ error: 'Case not found' }, { status: 404 });
  if (!canAccess(user.id, user.role, row)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const isShipping = user.role === 'SHIPPING';

  const status = String(row.status);
  const payload: Record<string, unknown> = {
    id: Number(row.id),
    code: row.code,
    status,
    statusLabel: STATUS_LABEL[status] || status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    myRole: user.role,
  };

  if (isShipping) {
    payload.pickupAddress = row.pickup_address || row.lab_name || '';
    payload.deliveryAddress = row.delivery_address || row.clinic_name || '';
    payload.trackingNumber = row.tracking_number || '';
    payload.shipStatus = row.ship_status || 'PENDING';
    return Response.json(payload);
  }

  const dentistName = (await get('SELECT name FROM users WHERE id = ?', [Number(row.dentist_user_id)]))?.name;
  const labUser = (await get('SELECT name FROM users WHERE id = ?', [Number(row.lab_user_id)]))?.name;

  payload.labName = row.lab_name || labUser;
  payload.labUserId = Number(row.lab_user_id);
  payload.dentistName = row.clinic_name || dentistName;
  payload.dentistUserId = Number(row.dentist_user_id);
  payload.scan = row.scan_path ? { path: row.scan_path, name: row.scan_original_name } : null;
  payload.design = row.design_path ? { path: row.design_path } : null;
  payload.prescription = {
    restorationType: row.restoration_type,
    toothNumber: row.tooth_number,
    material: row.material,
    shade: row.shade,
    dueDate: row.due_date,
    notes: row.notes,
  };
  payload.shipping = row.ship_status
    ? { trackingNumber: row.tracking_number, status: row.ship_status }
    : null;
  payload.canAdvance =
    user.role === 'LAB' && ['REVIEW', 'DESIGN', 'PRODUCTION'].includes(status);
  payload.canMarkReady = user.role === 'LAB' && status === 'PRODUCTION';
  payload.canShip = isShipping && status === 'READY';

  return Response.json(payload);
}
