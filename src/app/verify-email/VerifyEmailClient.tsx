'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

type Status = 'checking' | 'ok' | 'error' | 'idle';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status>(() => (token ? 'checking' : 'idle'));
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!res.ok) {
          setStatus('error');
          setError(data.error || t.verifyFailed);
          return;
        }
        setStatus('ok');
      } catch {
        setStatus('error');
        setError(t.verifyFailed);
      }
    })();
  }, [token, t]);

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setStatus('error');
      setError(t.verifyMissingToken);
      return;
    }
    setBusy(true);
    setStatus('checking');
    setError('');
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setError(data.error || t.verifyFailed);
        return;
      }
      setStatus('ok');
    } catch {
      setStatus('error');
      setError(t.verifyFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8 bg-[#070A10] text-[var(--text)]">
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-[rgba(42,127,255,0.25)] bg-[#0E1B2A]/90 p-8 shadow-2xl backdrop-blur-md">
          {status === 'checking' && (
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
              <p className="text-sm font-semibold text-[var(--text-muted)]">Verifying your email…</p>
            </div>
          )}

          {status === 'ok' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl">✅</div>
              <h1 className="mb-2 text-xl font-black text-[var(--text)]">{t.verifySuccessTitle}</h1>
              <p className="mb-6 text-sm font-medium text-[var(--text-muted)]">{t.verifySuccessBody}</p>
              <Link
                href="/login"
                className="btn-accent inline-block rounded-xl px-6 py-2.5 text-sm font-bold text-[#090d16]"
              >
                {t.signIn}
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-2xl">⚠️</div>
              <h1 className="mb-2 text-xl font-black text-[var(--text)]">{t.verifyFailed}</h1>
              <p className="mb-6 text-sm font-medium text-[var(--text-muted)]">{error}</p>
              {code && (
                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle');
                    setError('');
                  }}
                  className="btn-accent mb-3 inline-block rounded-xl px-6 py-2.5 text-sm font-bold text-[#090d16]"
                >
                  {t.verifyCodeButton}
                </button>
              )}
              <Link
                href="/login"
                className="btn-accent inline-block rounded-xl px-6 py-2.5 text-sm font-bold text-[#090d16]"
              >
                {t.signIn}
              </Link>
            </div>
          )}

          {status === 'idle' && (
            <form onSubmit={submitCode} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-dim)] text-2xl">🔑</div>
              <h1 className="mb-2 text-xl font-black text-[var(--text)]">{t.verifyCodeLabel}</h1>
              <p className="mb-5 text-sm font-medium text-[var(--text-muted)]">{t.verifyLinkLabel}</p>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder={t.verifyCodePlaceholder}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="dentrio-input w-full rounded-xl px-3.5 py-3 text-center text-2xl font-black tracking-[0.5em] placeholder:tracking-normal placeholder:text-sm placeholder:font-semibold text-[var(--text)] bg-[#070A10]/90 border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
              />
              <button
                type="submit"
                disabled={busy || code.length !== 6}
                className="btn-accent mt-4 w-full rounded-xl py-3 text-sm font-bold text-[#090d16] disabled:opacity-50"
              >
                {busy ? '…' : t.verifyCodeButton}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}