import { NextRequest } from 'next/server';
import { all } from '@/lib/db';
import { requirePrivilege } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requirePrivilege(['admin', 'owner']);

  const role = req.nextUrl.searchParams.get('role');
  let rows: Record<string, unknown>[];
  if (role && ['DENTIST', 'LAB', 'SHIPPING'].includes(role)) {
    rows = await all(
      `SELECT id, email, username, name, role, privilege, created_at FROM users WHERE role = ?
       ORDER BY id ASC`,
      [role]
    );
  } else {
    rows = await all(
      `SELECT id, email, username, name, role, privilege, created_at FROM users ORDER BY id ASC`
    );
  }

  return Response.json(
    rows.map((r) => ({
      id: Number(r.id),
      email: r.email,
      username: r.username,
      name: r.name,
      role: r.role,
      privilege: r.privilege,
      createdAt: r.created_at,
    }))
  );
}
