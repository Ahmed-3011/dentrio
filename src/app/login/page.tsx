'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';

const ROLE_HOME: Record<string, string> = {
  DENTIST: '/dashboard',
  LAB: '/dashboard',
  SHIPPING: '/shipping',
};

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notVerified, setNotVerified] = useState<string>('');
  const [resendMsg, setResendMsg] = useState('');
  const [resending, setResending] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setNotVerified('');
    setResendMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (lang === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid email, phone number, or password'));
        if (data.code === 'email_not_verified') {
          setNotVerified(String(data.email || identifier.trim()).toLowerCase());
          setError('');
        }
        setBusy(false);
        return;
      }
      if (data.needsOnboarding) {
        router.push('/onboarding');
      } else {
        router.push(ROLE_HOME[data.role] || '/dashboard');
      }
      router.refresh();
    } catch {
      setError(lang === 'ar' ? 'حدث خطأ في الاتصال بالخادم' : 'Server connection error. Please try again.');
      setBusy(false);
    }
  }

  async function handleResend() {
    if (!notVerified) return;
    setResending(true);
    setResendMsg('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: notVerified }),
      });
      const data = await res.json();
      setResendMsg(data.error || t.resendSent);
    } catch {
      setResendMsg(lang === 'ar' ? 'حدث خطأ في الاتصال بالخادم' : 'Server connection error. Please try again.');
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8 bg-[var(--bg)] text-[var(--text)]">
      {/* ── High-Performance CSS Radial Glow Mesh (Zero Lag / Pure CSS) ─ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,_rgba(42,127,255,0.18)_0%,_transparent_70%)]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,_rgba(18,59,107,0.25)_0%,_transparent_70%)]" />
      </div>
      <div className="grid-overlay" />

      {/* Language & Theme Controls in Header Corner */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2.5">
        <button
          onClick={toggleLanguage}
          type="button"
          className="flex h-10 items-center gap-1.5 rounded-xl border border-[rgba(42,127,255,0.25)] bg-[var(--bg-card)]/90 px-3 text-xs font-bold text-[var(--text)] shadow-lg transition hover:border-[var(--accent)]"
        >
          <span>{lang === 'en' ? '🇸🇦' : '🇺🇸'}</span>
          <span className="font-mono">{lang === 'en' ? 'العربية' : 'EN'}</span>
        </button>

        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle Theme"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(42,127,255,0.25)] bg-[var(--bg-card)]/90 text-[var(--text)] shadow-lg transition hover:border-[var(--accent)]"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md my-8">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--dentist)] to-[var(--lab)] text-xl font-bold text-[#070A10] shadow-lg shadow-[var(--accent-glow)]">
              ◈
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-[var(--text)] drop-shadow-md">
              {t.brand}<span className="text-[var(--accent)]">.</span>
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)] drop-shadow-sm">
            {t.loginTitle}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {t.loginSubtitle}
          </p>
        </div>

        {/* Clean Glassmorphic Card */}
        <div className="rounded-2xl border border-[rgba(42,127,255,0.25)] bg-[var(--bg-card)]/95 p-6 shadow-2xl sm:p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {lang === 'ar' ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email or Phone Number'}
              </label>
              <input
                type="text"
                autoComplete="username"
                required
                placeholder={lang === 'ar' ? 'user@example.com أو 01012345678' : 'user@example.com or 01XXXXXXXXX'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[var(--input-bg)] border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {t.passwordLabel}
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[var(--input-bg)] border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
              />
            </div>

            {notVerified && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                <p className="mb-2">{lang === 'ar' ? 'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول.' : 'Please verify your email before logging in.'}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="rounded-lg bg-amber-500/20 px-2.5 py-1 font-bold text-amber-700 hover:bg-amber-500/30 disabled:opacity-50 dark:text-amber-300"
                  >
                    {resending ? (lang === 'ar' ? 'جارٍ الإرسال…' : 'Sending…') : t.resendVerification}
                  </button>
                  <Link
                    href="/verify-email"
                    className="rounded-lg bg-amber-500/20 px-2.5 py-1 font-bold text-amber-700 hover:bg-amber-500/30 dark:text-amber-300"
                  >
                    {lang === 'ar' ? 'أدخل رمز التحقق' : 'Enter verification code'}
                  </Link>
                </div>
                {resendMsg && <p className="mt-2 text-[11px] text-amber-700/90 dark:text-amber-200/80">{resendMsg}</p>}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-accent flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-md disabled:opacity-50"
            >
              {busy ? t.authenticating : t.signIn}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs font-medium text-[var(--text-muted)]">
          {t.needAccount}{' '}
          <Link href="/signup" className="font-bold text-[var(--accent-light)] hover:underline">
            {t.createAccount}
          </Link>
        </p>
      </div>
    </main>
  );
}
