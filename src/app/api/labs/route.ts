import { NextRequest } from 'next/server';
import { all, get } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const search = req.nextUrl.searchParams.get('q')?.trim().toLowerCase() || '';

  let rows: Record<string, unknown>[];
  if (search) {
    // search is bound as a bound parameter ($1/$2/$3) — never concatenated into SQL,
    // so this is safe from SQL injection.
    rows = await all(
      `SELECT l.*, u.name as user_name,
         (SELECT COUNT(*) FROM cases c WHERE c.lab_user_id = l.user_id) as case_count
       FROM labs l JOIN users u ON u.id = l.user_id
       WHERE l.lab_name LIKE $search OR l.specialties LIKE $search OR l.materials LIKE $search`,
      { search: `%${search}%` }
    );
  } else {
    rows = await all(
      `SELECT l.*, u.name as user_name,
         (SELECT COUNT(*) FROM cases c WHERE c.lab_user_id = l.user_id) as case_count
       FROM labs l JOIN users u ON u.id = l.user_id`
    );
  }

  let preferredId: unknown = null;
  if (user.role === 'DENTIST') {
    const pref = await get('SELECT preferred_lab_id FROM dentists WHERE user_id = ?', [user.id]);
    preferredId = pref?.preferred_lab_id;
  }

  const result = rows.map((r) => ({
    id: Number(r.id),
    labName: r.lab_name,
    description: r.description,
    specialties: r.specialties,
    materials: r.materials,
    turnaroundDays: r.turnaround_days != null ? Number(r.turnaround_days) : null,
    address: r.address,
    caseCount: Number(r.case_count || 0),
    isPreferred: preferredId != null && Number(preferredId) === Number(r.id),
  }));

  return Response.json(result);
}
