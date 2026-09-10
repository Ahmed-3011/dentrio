import { createClient } from '@libsql/client';
import type { Client, InArgs } from '@libsql/client';

declare global {
  // eslint-disable-next-line no-var
  var __triadDb: Client | undefined;
}

export type Row = Record<string, unknown>;

function getClient(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not set');
  }
  if (!global.__triadDb) {
    global.__triadDb = createClient({ url, authToken: token });
  }
  return global.__triadDb;
}

let schemaPromise: Promise<void> | null = null;

async function initSchema(): Promise<void> {
  const c = getClient();
  await c.batch(
    [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL DEFAULT '',
        phone TEXT DEFAULT '',
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('DENTIST','LAB','SHIPPING')),
        privilege TEXT NOT NULL DEFAULT 'normal' CHECK (privilege IN ('normal','admin','owner')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS dentists (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        clinic_name TEXT,
        specialty TEXT,
        address TEXT,
        maps_url TEXT,
        latitude REAL,
        longitude REAL,
        preferred_lab_id INTEGER REFERENCES labs(id)
      )`,
      `CREATE TABLE IF NOT EXISTS labs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        lab_name TEXT NOT NULL,
        description TEXT,
        specialties TEXT,
        materials TEXT,
        turnaround_days INTEGER,
        address TEXT,
        maps_url TEXT,
        latitude REAL,
        longitude REAL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS shipping_companies (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        company_name TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        expires_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        dentist_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lab_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'SUBMITTED'
          CHECK (status IN ('SUBMITTED','REVIEW','DESIGN','PRODUCTION','READY','SHIPPED','CLOSED')),
        scan_original_name TEXT,
        scan_path TEXT,
        design_path TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS prescriptions (
        case_id INTEGER PRIMARY KEY REFERENCES cases(id) ON DELETE CASCADE,
        restoration_type TEXT,
        tooth_number TEXT,
        material TEXT,
        shade TEXT,
        due_date TEXT,
        notes TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        sender_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        body TEXT,
        file_path TEXT,
        file_name TEXT,
        is_image INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS shipments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id INTEGER NOT NULL UNIQUE REFERENCES cases(id) ON DELETE CASCADE,
        shipper_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        pickup_address TEXT,
        delivery_address TEXT,
        tracking_number TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING'
          CHECK (status IN ('PENDING','PICKED_UP','IN_TRANSIT','DELIVERED')),
        completed_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    ],
    'write'
  );

  // Safe non-blocking migrations for existing databases
  const safeMigrations = [
    'ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ""',
    'ALTER TABLE dentists ADD COLUMN maps_url TEXT',
    'ALTER TABLE dentists ADD COLUMN latitude REAL',
    'ALTER TABLE dentists ADD COLUMN longitude REAL',
    'ALTER TABLE labs ADD COLUMN maps_url TEXT',
    'ALTER TABLE labs ADD COLUMN latitude REAL',
    'ALTER TABLE labs ADD COLUMN longitude REAL',
  ];

  for (const m of safeMigrations) {
    try {
      await c.execute(m);
    } catch {
      // Column already exists or already migrated
    }
  }
}

export function ensureSchema(): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = initSchema();
  }
  return schemaPromise;
}

export function db(): Client {
  return getClient();
}

export async function all(
  sql: string,
  args?: unknown[] | Record<string, unknown>
): Promise<Row[]> {
  await ensureSchema();
  const res = await db().execute({ sql, args: args as InArgs });
  return res.rows.map((r) => r as unknown as Row);
}

export async function get(
  sql: string,
  args?: unknown[] | Record<string, unknown>
): Promise<Row | undefined> {
  const rows = await all(sql, args);
  return rows[0];
}

export async function run(
  sql: string,
  args?: unknown[] | Record<string, unknown>
): Promise<{ lastInsertRowid: number }> {
  await ensureSchema();
  const res = await db().execute({ sql, args: args as InArgs });
  return { lastInsertRowid: Number(res.lastInsertRowid ?? 0) };
}
