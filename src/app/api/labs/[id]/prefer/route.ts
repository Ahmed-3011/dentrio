import { NextRequest } from 'next/server';
import { run, get } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(['DENTIST']);
  if (user instanceof Response) return user;
  const { id } = await params;
  const labId = Number(id);

  const lab = await get('SELECT id FROM labs WHERE id = ?', [labId]);
  if (!lab) return Response.json({ error: 'Lab not found' }, { status: 404 });

  await run('UPDATE dentists SET preferred_lab_id = ? WHERE user_id = ?', [labId, user.id]);
  return Response.json({ ok: true });
}
