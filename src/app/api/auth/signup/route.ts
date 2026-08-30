import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { run, get } from '@/lib/db';
import { createSession } from '@/lib/auth';

const ROLE_TABLE: Record<string, string> = {
  DENTIST: 'dentists',
  LAB: 'labs',
  SHIPPING: 'shipping_companies',
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    email,
    password,
    name,
    role,
    username,
    ...extra
  } = body as {
    email?: string;
    password?: string;
    username?: string;
    name?: string;
    role?: string;
    labName?: string;
    clinicName?: string;
    companyName?: string;
    specialties?: string;
    materials?: string;
    turnaroundDays?: number;
    address?: string;
  };

  if (!email || !password || !name || !role || !(role in ROLE_TABLE)) {
    return Response.json({ error: 'Missing required fields or invalid role' }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const existing = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  if (existing) {
    return Response.json({ error: 'Email already registered' }, { status: 409 });
  }

  const hash = bcrypt.hashSync(password, 10);
  const insert = await run(
    `INSERT INTO users (email, username, password_hash, name, role, privilege)
     VALUES (?, ?, ?, ?, ?, 'normal')`,
    [email.toLowerCase(), (username || name || '').trim(), hash, name, role]
  );
  const userId = Number(insert.lastInsertRowid);

  if (role === 'DENTIST') {
    await run('INSERT INTO dentists (user_id, clinic_name, address) VALUES (?, ?, ?)', [
      userId,
      extra.clinicName || name,
      extra.address || '',
    ]);
  } else if (role === 'LAB') {
    await run(
      `INSERT INTO labs (user_id, lab_name, description, specialties, materials, turnaround_days, address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        extra.labName || name,
        '',
        extra.specialties || '',
        extra.materials || '',
        extra.turnaroundDays || 5,
        extra.address || '',
      ]
    );
  } else if (role === 'SHIPPING') {
    await run('INSERT INTO shipping_companies (user_id, company_name) VALUES (?, ?)', [
      userId,
      extra.companyName || name,
    ]);
  }

  await createSession(userId);
  return Response.json({ ok: true, role });
}
