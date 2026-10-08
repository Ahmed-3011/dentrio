function appUrl(): string {
  return (process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/+$/, '');
}

export function verificationLink(token: string): string {
  return `${appUrl()}/verify-email?token=${encodeURIComponent(token)}`;
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  code: string,
  name: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }

  const link = verificationLink(token);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'Dentrio <onboarding@resend.dev>',
      to: [email],
      subject: 'Verify your Dentrio account',
      text: `Hi ${name},\n\nYour Dentrio verification code is:\n\n${code}\n\nOr click the link below to verify instantly (expires in 24 hours):\n${link}\n\nIf you did not create a Dentrio account, you can ignore this email.`,
      html: `<p>Hi ${name},</p><p>Your Dentrio verification code is:</p><p style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#2A7FFF">${code}</p><p>— or click the button below to verify instantly:</p><p><a href="${link}" style="display:inline-block;background:#2A7FFF;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Verify my email</a></p><p>This link and code expire in 24 hours.</p><p>If you did not create a Dentrio account, you can ignore this email.</p>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}