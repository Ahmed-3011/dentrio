import { NextRequest } from 'next/server';
import { run, get } from '@/lib/db';
import { requirePrivilege } from '@/lib/auth';

const LEVEL: Record<string, number> = { normal: 0, admin: 1, owner: 2 };

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await requirePrivilege(['admin', 'owner']);
  const { id } = await params;
  const targetId = Number(id);

  const body = await req.json().catch(() => ({}));
  const privilege = String(body.privilege || '').toLowerCase();
  if (!['normal', 'admin', 'owner'].includes(privilege)) {
    return Response.json({ error: 'Invalid privilege level' }, { status: 400 });
  }

  const target = await get('SELECT id, privilege FROM users WHERE id = ?', [targetId]);
  if (!target) return Response.json({ error: 'User not found' }, { status: 404 });

  const actorLevel = LEVEL[actor.privilege];
  const targetLevel = LEVEL[String(target.privilege)];

  // Only owner can assign owner privilege.
  if (privilege === 'owner' && actor.privilege !== 'owner') {
    return Response.json({ error: 'Only an owner can grant owner privileges' }, { status: 403 });
  }
  // Cannot modify another owner, unless you are an owner.
  if (targetLevel === 2 && actor.privilege !== 'owner') {
    return Response.json({ error: 'Cannot modify an owner' }, { status: 403 });
  }
  // An admin cannot promote anyone to owner or manage owners; makers of privilege >= target only.
  if (actorLevel < targetLevel && actor.privilege !== 'owner') {
    return Response.json({ error: 'Cannot modify a user with higher privileges' }, { status: 403 });
  }

  await run('UPDATE users SET privilege = ? WHERE id = ?', [privilege, targetId]);
  return Response.json({ ok: true, id: targetId, privilege });
}
