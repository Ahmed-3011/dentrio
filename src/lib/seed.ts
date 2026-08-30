/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { all, run, get } from './db';

function loadEnv() {
  const cwd = process.cwd();
  for (const f of ['.env.local', '.env']) {
    const fp = path.join(cwd, f);
    if (fs.existsSync(fp)) {
      for (const line of fs.readFileSync(fp, 'utf8').split('\n')) {
        const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].trim();
        }
      }
    }
  }
}

async function clear() {
  // Clear in correct foreign-key dependency order
  await run('DELETE FROM messages');
  await run('DELETE FROM shipments');
  await run('DELETE FROM prescriptions');
  await run('DELETE FROM cases');
  await run('DELETE FROM sessions');
  await run('DELETE FROM shipping_companies');
  await run('DELETE FROM dentists');
  await run('DELETE FROM labs');
  await run('DELETE FROM users');
}

async function upsertUser(
  email: string,
  username: string,
  password: string,
  name: string,
  role: string,
  privilege: string
): Promise<number> {
  const hash = bcrypt.hashSync(password, 10);
  const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    await run('UPDATE users SET username = ?, password_hash = ?, name = ? WHERE id = ?', [
      username,
      hash,
      name,
      existing.id,
    ]);
    return Number(existing.id);
  }
  const info = await run(
    `INSERT INTO users (email, username, password_hash, name, role, privilege)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [email, username, hash, name, role, privilege]
  );
  return Number(info.lastInsertRowid);
}

export async function seed() {
  loadEnv();
  await clear();

  const dentist = await upsertUser(
    'dentist@demo.com',
    'alice_wong',
    'password123',
    'Dr. Alice Wong',
    'DENTIST',
    'normal'
  );
  await run(
    'INSERT INTO dentists (user_id, clinic_name, specialty, address) VALUES (?, ?, ?, ?)',
    [dentist, 'Bright Smile Dental Clinic', 'General & Cosmetic Dentistry', '123 Main St, Austin, TX']
  );

  const labA = await upsertUser(
    'labA@demo.com',
    'zirconia_lab',
    'password123',
    'Zirconia Lab Co.',
    'LAB',
    'normal'
  );
  const labAId = Number(
    (
      await run(
        `INSERT INTO labs (user_id, lab_name, description, specialties, materials, turnaround_days, address)
         VALUES (?,?,?,?,?,?,?)`,
        [
          labA,
          'Zirconia Lab Co.',
          'Specialists in zirconia crowns and bridges with fast turnaround.',
          'Crowns,Bridges,Implants',
          'Zirconia,EMAX',
          3,
          '200 Industrial Pkwy, Dallas, TX',
        ]
      )
    ).lastInsertRowid
  );

  const labB = await upsertUser(
    'labB@demo.com',
    'align_frame',
    'password123',
    'Align & Frame Dental Lab',
    'LAB',
    'admin'
  );
  await run(
    `INSERT INTO labs (user_id, lab_name, description, specialties, materials, turnaround_days, address)
     VALUES (?,?,?,?,?,?,?)`,
    [
      labB,
      'Align & Frame Dental Lab',
      'Full-service lab focused on clear aligners and cosmetic restorations.',
      'Aligners,Veneers,Crowns',
      'EMAX,Composite,Clear Aligner',
      5,
      '77 Oak Ave, Houston, TX',
    ]
  );

  await run('UPDATE dentists SET preferred_lab_id = ? WHERE user_id = ?', [labAId, dentist]);

  const owner = await upsertUser(
    'owner@demo.com',
    'platform_owner',
    'password123',
    'Triad Admin',
    'SHIPPING',
    'owner'
  );
  await run('INSERT INTO shipping_companies (user_id, company_name) VALUES (?, ?)', [
    owner,
    'Swift Dental Logistics',
  ]);

  const h09 = await upsertUser(
    'h09@triad.local',
    'h09',
    'novel',
    'Platform Owner',
    'DENTIST',
    'owner'
  );
  await run('INSERT INTO dentists (user_id, clinic_name, specialty, address) VALUES (?, ?, ?, ?)', [
    h09,
    'Triad HQ',
    'Platform Administration',
    '',
  ]);

  // Dedicated Test Labs for testing workflows & selection
  const testlab1 = await upsertUser(
    'testlab@demo.com',
    'testlab',
    'password123',
    'TestLab Pro Technician',
    'LAB',
    'normal'
  );
  await run(
    `INSERT INTO labs (user_id, lab_name, description, specialties, materials, turnaround_days, address)
     VALUES (?,?,?,?,?,?,?)`,
    [
      testlab1,
      'TestLab Precision Milling',
      'Dedicated test laboratory supporting all restorative workflows, CAD/CAM crowns, and rapid turnaround.',
      'Crowns,Bridges,Implants,Aligners,Veneers',
      'Multi-layer Zirconia,EMAX,Titanium,PMMA',
      2,
      '100 Tech Center Blvd, Suite 400, Chicago, IL',
    ]
  );

  const testlab2 = await upsertUser(
    'testlab2@demo.com',
    'testlab2',
    'password123',
    'TestLab Ortho Lead',
    'LAB',
    'normal'
  );
  await run(
    `INSERT INTO labs (user_id, lab_name, description, specialties, materials, turnaround_days, address)
     VALUES (?,?,?,?,?,?,?)`,
    [
      testlab2,
      'TestLab Ortho & Aligners',
      'Specialist lab for clear aligners, indirect bonding trays, and 3D printed surgical guides.',
      'Aligners,Nightguards,Surgical Guides',
      'Clear Thermo-Plastic,Bio-Compatible Resin',
      3,
      '55 Innovation Way, Boston, MA',
    ]
  );

  console.log('Seeded Turso remote database with test labs successfully.');
}

if (require.main === module) {
  seed().then(() => process.exit(0)).catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  });
}
