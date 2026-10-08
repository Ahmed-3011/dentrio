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

  const identifier = email.trim().toLowerCase();
  const rawIdentifier = email.trim();
  const user = await get(
    `SELECT id, email, username, phone, password_hash, role, email_verified
     FROM users 
     WHERE LOWER(email) = ? OR LOWER(username) = ? OR (phone != '' AND phone = ?)`,
    [identifier, identifier, rawIdentifier]
  );

  if (!user || !bcrypt.compareSync(password, String(user.password_hash))) {
    return Response.json({ error: 'Invalid username, email, phone number or password' }, { status: 401 });
  }

  // Verification check temporarily bypassed
  await createSession(Number(user.id));

  // Check if user has completed profile onboarding
  let needsOnboarding = false;
  if (user.role === 'DENTIST') {
    const dentist = await get('SELECT user_id, clinic_name FROM dentists WHERE user_id = ?', [user.id]);
    if (!dentist || !dentist.clinic_name) {
      needsOnboarding = true;
    }
  } else if (user.role === 'LAB') {
    const lab = await get('SELECT user_id, lab_name FROM labs WHERE user_id = ?', [user.id]);
    if (!lab || !lab.lab_name) {
      needsOnboarding = true;
    }
  }

  return Response.json({ ok: true, role: user.role, needsOnboarding });
}
