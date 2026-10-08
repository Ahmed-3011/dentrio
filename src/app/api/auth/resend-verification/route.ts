import { NextRequest } from 'next/server';
import { get } from '@/lib/db';
import { generateVerificationToken, generateVerificationCode, setVerificationToken } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/mail';

const COOLDOWN_MS = 60 * 1000; // 1 minute between resend attempts

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body as { email?: string };
  if (!email) {
    return Response.json({ error: 'Email is required' }, { status: 400 });
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await get(
    `SELECT id, email, name, email_verified, verification_expires_at
     FROM users WHERE email = ?`,
    [cleanEmail]
  );

  if (!user) {
    return Response.json({ error: 'No account found for this email' }, { status: 404 });
  }
  if (Number(user.email_verified) === 1) {
    return Response.json({ error: 'This email is already verified' }, { status: 409 });
  }

  const expiresAt = user.verification_expires_at ? new Date(String(user.verification_expires_at)) : null;
  if (expiresAt && expiresAt.getTime() - Date.now() > 24 * 60 * 60 * 1000 - COOLDOWN_MS) {
    return Response.json({ error: 'Please wait a minute before requesting another email' }, { status: 429 });
  }

  const token = generateVerificationToken();
  const code = generateVerificationCode();
  await setVerificationToken(Number(user.id), token, code);
  try {
    await sendVerificationEmail(cleanEmail, token, code, String(user.name));
  } catch (e) {
    console.error('Failed to resend verification email:', e);
    return Response.json({ error: 'Could not send verification email. Please try again later.' }, { status: 502 });
  }

  return Response.json({ ok: true });
}