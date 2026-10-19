'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';

export default function SignupPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();
  const [form, setForm] = useState<Record<string, string>>({});
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    if (!form.name || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      setError(
        lang === 'ar'
          ? 'يرجى إكمال جميع الحقول المطلوبة.'
          : 'Please complete all required fields.'
      );
      setBusy(false);
      return;
    }

    const cleanPhone = form.phone.replace(/\D/g, '').trim();
    if (cleanPhone.length !== 11) {
      setError(
        lang === 'ar'
          ? 'يجب أن يتكون رقم الهاتف من 11 رقماً بالضبط (مثال: 01012345678).'
          : 'Phone number must be exactly 11 digits (e.g. 01012345678).'
      );
      setBusy(false);
      return;
    }

    if (form.password.length < 6) {
      setError(
        lang === 'ar'
          ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.'
          : 'Password must be at least 6 characters.'
      );
      setBusy(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(t.passwordMismatchError);
      setBusy(false);
      return;
    }

    if (!agreedToPolicy) {
      setError(t.policyRequiredError);
      setBusy(false);
      return;
    }

    const payload = {
      email: form.email.trim(),
      phone: cleanPhone,
      password: form.password,
      name: form.name.trim(),
    };

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (lang === 'ar' ? 'فشل إنشاء الحساب' : 'Signup registration failed'));
        setBusy(false);
        return;
      }
      // Instant login & redirect to onboarding
      router.push('/onboarding');
      router.refresh();
    } catch {
      setError(
        lang === 'ar'
          ? 'حدث خطأ في الاتصال بالخادم، يرجى المحاولة مرة أخرى'
          : 'Network connection error. Please try again.'
      );
      setBusy(false);
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

      <div className="relative z-10 w-full max-w-lg my-8">
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
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl drop-shadow-sm">
            {t.createAccount}
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-medium text-[var(--text-muted)]">
            {lang === 'ar'
              ? 'سجل حسابك الموحد للوصول إلى شبكة طب الأسنان الرقمي'
              : 'Join the connected dental clinic & lab orchestration network'}
          </p>
        </div>

        {/* High Performance Glass Card */}
        <div className="rounded-2xl border border-[rgba(42,127,255,0.25)] bg-[var(--bg-card)]/95 p-5 sm:p-8 shadow-2xl">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {t.nameLabel}
              </label>
              <input
                type="text"
                required
                placeholder={t.namePlaceholder}
                value={form.name || ''}
                onChange={(e) => set('name', e.target.value)}
                className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[var(--input-bg)] border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {lang === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={form.email || ''}
                  onChange={(e) => set('email', e.target.value)}
                  className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[var(--input-bg)] border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {lang === 'ar' ? 'رقم الهاتف (11 رقماً) *' : 'Phone Number (11 digits) *'}
                </label>
                <input
                  type="tel"
                  required
                  maxLength={11}
                  placeholder="01XXXXXXXXX"
                  value={form.phone || ''}
                  onChange={(e) => set('phone', e.target.value)}
                  className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[var(--input-bg)] border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {t.passwordLabel} *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder={lang === 'ar' ? '٦ أحرف على الأقل' : 'At least 6 characters'}
                  value={form.password || ''}
                  onChange={(e) => set('password', e.target.value)}
                  className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[var(--input-bg)] border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {t.confirmPasswordLabel}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder={lang === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                  value={form.confirmPassword || ''}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                  className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[var(--input-bg)] border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
                />
              </div>
            </div>

            {/* Mandatory Policy Agreement Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="agree-policy"
                required
                checked={agreedToPolicy}
                onChange={(e) => setAgreedToPolicy(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--accent)] focus:ring-0 cursor-pointer accent-[var(--accent)] shrink-0"
              />
              <label htmlFor="agree-policy" className="text-xs text-[var(--text-muted)] select-none leading-relaxed">
                <span>{t.agreePolicyPrefix} </span>
                <button
                  type="button"
                  onClick={() => setShowPolicyModal(true)}
                  className="font-bold text-[var(--accent-light)] underline hover:text-[var(--accent)] cursor-pointer inline"
                >
                  {t.privacyPolicyLink}
                </button>
              </label>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-600 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !agreedToPolicy}
              className="btn-accent w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? t.creatingAccount : t.createAccountBtn}
            </button>

            <div className="pt-2 text-center text-xs text-[var(--text-muted)]">
              <span>{t.haveAccount} </span>
              <Link
                href="/login"
                className="font-bold text-[var(--accent-light)] hover:underline"
              >
                {t.signInHere}
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Full Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
      />
    </main>
  );
}
