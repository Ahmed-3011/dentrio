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

  const identifier = email.trim();
  const user = await get(
    `SELECT id, email, username, phone, password_hash, role 
     FROM users 
     WHERE email = ? OR username = ? OR (phone != '' AND phone = ?)`,
    [identifier.toLowerCase(), identifier, identifier]
  );

  if (!user || !bcrypt.compareSync(password, String(user.password_hash))) {
    return Response.json({ error: 'Invalid username, email, phone number or password' }, { status: 401 });
  }

  await createSession(Number(user.id));
  return Response.json({ ok: true, role: user.role });
}
