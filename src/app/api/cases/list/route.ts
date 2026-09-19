import { all } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { STATUS_LABEL } from '@/lib/constants';

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;

  let rows: Record<string, unknown>[] = [];
  if (user.role === 'DENTIST') {
    rows = await all(
      `SELECT c.*, u.name as lab_name
       FROM cases c JOIN users u ON u.id = c.lab_user_id
       WHERE c.dentist_user_id = ?
       ORDER BY c.created_at DESC`,
      [user.id]
    );
  } else if (user.role === 'LAB') {
    rows = await all(
      `SELECT c.*, u.name as dentist_name
       FROM cases c JOIN users u ON u.id = c.dentist_user_id
       WHERE c.lab_user_id = ?
       ORDER BY c.created_at DESC`,
      [user.id]
    );
  } else if (user.role === 'SHIPPING') {
    rows = await all(
      `SELECT c.*, u.name as lab_name
       FROM cases c JOIN users u ON u.id = c.lab_user_id
       WHERE c.status IN ('READY','SHIPPED')
       ORDER BY CASE c.status WHEN 'READY' THEN 0 ELSE 1 END, c.updated_at DESC`
    );
  }

  const result = rows.map((r) => ({
    id: Number(r.id),
    code: r.code,
    status: r.status,
    statusLabel: STATUS_LABEL[String(r.status)] || String(r.status),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    scanOriginalName: r.scan_original_name,
    counterpart: r.lab_name ?? r.dentist_name ?? null,
  }));

  return Response.json(result);
}
