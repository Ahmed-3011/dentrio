import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { get } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body as { email?: string; password?: string };
  if (!email || !password) {
    return Response.json({ error: 'Missing credentials' }, { status: 400 });
  }
  const user = await get(
    'SELECT id, email, username, password_hash, role FROM users WHERE email = ? OR username = ?',
    [email.toLowerCase(), email]
  );
  if (!user || !bcrypt.compareSync(password, String(user.password_hash))) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  }
  await createSession(Number(user.id));
  return Response.json({ ok: true, role: user.role });
}
