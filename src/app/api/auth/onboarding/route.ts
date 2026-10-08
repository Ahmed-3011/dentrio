import { NextRequest } from 'next/server';
import { run, get } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (user instanceof Response) return user;

  const body = await req.json();
  const {
    role,
    clinicName,
    specialty,
    labName,
    specialties,
    turnaroundDays,
    address,
    mapsUrl,
    latitude,
    longitude,
  } = body as {
    role?: 'DENTIST' | 'LAB';
    clinicName?: string;
    specialty?: string;
    labName?: string;
    specialties?: string | string[];
    turnaroundDays?: number;
    address?: string;
    mapsUrl?: string;
    latitude?: number;
    longitude?: number;
  };

  if (!role || (role !== 'DENTIST' && role !== 'LAB')) {
    return Response.json({ error: 'Please select whether you are a Dentist or a Dental Lab' }, { status: 400 });
  }

  const locationInput = (address || '').trim();
  const resolvedMapsUrl =
    mapsUrl ||
    (locationInput
      ? locationInput.startsWith('http')
        ? locationInput
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationInput)}`
      : '');

  // Update user role in users table
  await run('UPDATE users SET role = ? WHERE id = ?', [role, user.id]);

  if (role === 'DENTIST') {
    const finalClinicName = (clinicName || user.name || '').trim();
    const existing = await get('SELECT user_id FROM dentists WHERE user_id = ?', [user.id]);
    if (existing) {
      await run(
        `UPDATE dentists 
         SET clinic_name = ?, specialty = ?, address = ?, maps_url = ?, latitude = ?, longitude = ?
         WHERE user_id = ?`,
        [
          finalClinicName,
          specialty || '',
          locationInput,
          resolvedMapsUrl,
          latitude ?? null,
          longitude ?? null,
          user.id,
        ]
      );
    } else {
      await run(
        `INSERT INTO dentists (user_id, clinic_name, specialty, address, maps_url, latitude, longitude)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          finalClinicName,
          specialty || '',
          locationInput,
          resolvedMapsUrl,
          latitude ?? null,
          longitude ?? null,
        ]
      );
    }
  } else if (role === 'LAB') {
    const finalLabName = (labName || user.name || '').trim();
    const formattedSpecialties = Array.isArray(specialties)
      ? specialties.join(', ')
      : specialties || '';
    const finalTurnaround = turnaroundDays ? Number(turnaroundDays) : 3;

    const existing = await get('SELECT id FROM labs WHERE user_id = ?', [user.id]);
    if (existing) {
      await run(
        `UPDATE labs
         SET lab_name = ?, specialties = ?, turnaround_days = ?, address = ?, maps_url = ?, latitude = ?, longitude = ?
         WHERE user_id = ?`,
        [
          finalLabName,
          formattedSpecialties,
          finalTurnaround,
          locationInput,
          resolvedMapsUrl,
          latitude ?? null,
          longitude ?? null,
          user.id,
        ]
      );
    } else {
      await run(
        `INSERT INTO labs (user_id, lab_name, description, specialties, materials, turnaround_days, address, maps_url, latitude, longitude)
         VALUES (?, ?, '', ?, '', ?, ?, ?, ?, ?)`,
        [
          user.id,
          finalLabName,
          formattedSpecialties,
          finalTurnaround,
          locationInput,
          resolvedMapsUrl,
          latitude ?? null,
          longitude ?? null,
        ]
      );
    }
  }

  return Response.json({ ok: true, role });
}
