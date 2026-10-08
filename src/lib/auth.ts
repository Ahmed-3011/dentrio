import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { get, run } from '@/lib/db';

const SESSION_COOKIE = 'triad_session';
const SESSION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const VERIFY_MS = 1000 * 60 * 60 * 24; // 24 hours

export type Role = 'DENTIST' | 'LAB' | 'SHIPPING';
export type Privilege = 'normal' | 'admin' | 'owner';

export type AuthUser = {
  id: number;
  email: string;
  phone: string;
  name: string;
  role: Role;
  privilege: Privilege;
};

async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_MS).toISOString();
  await run('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', [
    token,
    userId,
    expiresAt,
  ]);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAt),
  });
  return token;
}

export async function destroySession(): Promise<void> {
  const token = await getToken();
  if (token) {
    await run('DELETE FROM sessions WHERE token = ?', [token]);
  }
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const token = await getToken();
  if (!token) return null;
  const row = await get(
    `SELECT u.id, u.email, u.phone, u.name, u.role, u.privilege
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > datetime('now')`,
    [token]
  );
  if (!row) return null;
  return {
    id: Number(row.id),
    email: String(row.email),
    phone: String(row.phone ?? ''),
    name: String(row.name),
    role: row.role as Role,
    privilege: (row.privilege as Privilege) || 'normal',
  };
}

export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateVerificationCode(): string {
  const code = randomBytes(3).readUIntBE(0, 3) % 1000000;
  return code.toString().padStart(6, '0');
}

export async function setVerificationToken(
  userId: number,
  token: string,
  code?: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + VERIFY_MS).toISOString();
  if (code) {
    await run('UPDATE users SET verification_token = ?, verification_code = ?, verification_expires_at = ? WHERE id = ?', [
      token,
      code,
      expiresAt,
      userId,
    ]);
  } else {
    await run('UPDATE users SET verification_token = ?, verification_expires_at = ? WHERE id = ?', [
      token,
      expiresAt,
      userId,
    ]);
  }
}

async function verifyByColumn(column: 'verification_token' | 'verification_code', value: string): Promise<AuthUser | null> {
  const row = await get(
    `SELECT id, email, phone, name, role, privilege,
            email_verified, verification_expires_at
     FROM users WHERE ${column} = ?`,
    [value]
  );
  if (!row) return null;
  if (Number(row.email_verified) === 1) {
    return userFromRow(row);
  }
  if (row.verification_expires_at && new Date(String(row.verification_expires_at)) < new Date()) {
    return null;
  }
  await run('UPDATE users SET email_verified = 1, verification_token = NULL, verification_code = NULL, verification_expires_at = NULL WHERE id = ?', [
    Number(row.id),
  ]);
  return userFromRow(row);
}

export async function verifyEmailByToken(token: string): Promise<AuthUser | null> {
  return verifyByColumn('verification_token', token);
}

export async function verifyEmailByCode(code: string): Promise<AuthUser | null> {
  return verifyByColumn('verification_code', code);
}

export async function isEmailVerified(userId: number): Promise<boolean> {
  const row = await get('SELECT email_verified FROM users WHERE id = ?', [userId]);
  return !!row && Number(row.email_verified) === 1;
}

function userFromRow(row: Record<string, unknown>): AuthUser {
  return {
    id: Number(row.id),
    email: String(row.email),
    phone: String(row.phone ?? ''),
    name: String(row.name),
    role: row.role as Role,
    privilege: (row.privilege as Privilege) || 'normal',
  };
}

export async function requireUser(): Promise<AuthUser | Response> {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return user;
}

export async function requireRole(roles: Role[]): Promise<AuthUser | Response> {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (!roles.includes(user.role)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  return user;
}

export async function requirePrivilege(levels: Privilege[]): Promise<AuthUser | Response> {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (!levels.includes(user.privilege)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  return user;
}
