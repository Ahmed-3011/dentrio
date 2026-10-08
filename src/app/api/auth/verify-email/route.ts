import { NextRequest } from 'next/server';
import { verifyEmailByToken, verifyEmailByCode } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const rawCode = req.nextUrl.searchParams.get('code');
  if (!token && !rawCode) {
    return Response.json({ error: 'Missing verification token or code' }, { status: 400 });
  }

  const user = token ? await verifyEmailByToken(token) : await verifyEmailByCode(rawCode || '');
  if (!user) {
    return Response.json({ error: 'Invalid or expired verification code' }, { status: 400 });
  }

  return Response.json({ ok: true, role: user.role });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code } = body as { code?: string };
  if (!code) {
    return Response.json({ error: 'Missing verification code' }, { status: 400 });
  }

  const user = await verifyEmailByCode(String(code).trim());
  if (!user) {
    return Response.json({ error: 'Invalid or expired verification code' }, { status: 400 });
  }

  return Response.json({ ok: true, role: user.role });
}