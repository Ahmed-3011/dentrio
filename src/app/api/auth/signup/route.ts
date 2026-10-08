import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { run, get } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    email,
    password,
    name,
    phone,
  } = body as {
    email?: string;
    password?: string;
    phone?: string;
    name?: string;
  };

  if (!email || !password || !name || !phone) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Validate 11-digit phone number
  const cleanPhone = phone.replace(/\D/g, '').trim();
  if (cleanPhone.length !== 11) {
    return Response.json(
      { error: 'Phone number must be exactly 11 digits (e.g. 01012345678)' },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const cleanEmail = email.toLowerCase().trim();
  // Auto-generate username from email prefix or clean name
  const autoUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || cleanPhone;

  const existing = await get(
    'SELECT id FROM users WHERE email = ? OR phone = ?',
    [cleanEmail, cleanPhone]
  );
  if (existing) {
    return Response.json({ error: 'Email or phone number is already registered' }, { status: 409 });
  }

  const hash = bcrypt.hashSync(password, 10);
  // Default role is DENTIST placeholder until user completes the onboarding questionnaire
  const insert = await run(
    `INSERT INTO users (email, username, phone, password_hash, name, role, privilege, email_verified)
     VALUES (?, ?, ?, ?, ?, 'DENTIST', 'normal', 1)`,
    [cleanEmail, autoUsername, cleanPhone, hash, name.trim()]
  );
  const userId = Number(insert.lastInsertRowid);

  // Auto create session so user is logged in immediately
  await createSession(userId);

  return Response.json({ ok: true, needsVerification: false });
}
