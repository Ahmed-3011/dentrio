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
    phone,
    ...extra
  } = body as {
    email?: string;
    password?: string;
    username?: string;
    phone?: string;
    name?: string;
    role?: string;
    labName?: string;
    clinicName?: string;
    companyName?: string;
    specialties?: string | string[];
    turnaroundDays?: number;
    address?: string;
    mapsUrl?: string;
    latitude?: number;
    longitude?: number;
  };

  if (!email || !password || !name || !role || !(role in ROLE_TABLE)) {
    return Response.json({ error: 'Missing required fields or invalid role' }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanUsername = (username || name || '').trim();
  const cleanPhone = (phone || '').trim();

  const existing = await get(
    'SELECT id FROM users WHERE email = ? OR (phone != "" AND phone = ?)',
    [cleanEmail, cleanPhone]
  );
  if (existing) {
    return Response.json({ error: 'Email or phone number is already registered' }, { status: 409 });
  }

  const hash = bcrypt.hashSync(password, 10);
  const insert = await run(
    `INSERT INTO users (email, username, phone, password_hash, name, role, privilege)
     VALUES (?, ?, ?, ?, ?, ?, 'normal')`,
    [cleanEmail, cleanUsername, cleanPhone, hash, name.trim(), role]
  );
  const userId = Number(insert.lastInsertRowid);

  const formattedSpecialties = Array.isArray(extra.specialties)
    ? extra.specialties.join(', ')
    : (extra.specialties || '');

  if (role === 'DENTIST') {
    await run(
      `INSERT INTO dentists (user_id, clinic_name, address, maps_url, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        extra.clinicName || name,
        extra.address || '',
        extra.mapsUrl || '',
        extra.latitude ?? null,
        extra.longitude ?? null,
      ]
    );
  } else if (role === 'LAB') {
    await run(
      `INSERT INTO labs (user_id, lab_name, description, specialties, materials, turnaround_days, address, maps_url, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        extra.labName || name,
        '',
        formattedSpecialties,
        '', // Materials removed as requested
        extra.turnaroundDays || 5,
        extra.address || '',
        extra.mapsUrl || '',
        extra.latitude ?? null,
        extra.longitude ?? null,
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
