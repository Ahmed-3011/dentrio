'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

const ROLE_HOME: Record<string, string> = {
  DENTIST: '/dashboard',
  LAB: '/dashboard',
  SHIPPING: '/shipping',
};

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid username or password');
        setBusy(false);
        return;
      }
      router.push(ROLE_HOME[data.role] || '/dashboard');
      router.refresh();
    } catch {
      setError('Server connection error. Please try again.');
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8 bg-[#070A10] text-[var(--text)]">
      {/* ── Background Looping Azure Horizon Video ──────────────────── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40 scale-105"
      >
        <source
          src="https://motionbgs.com/media/9760/azure-horizon.960x540.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark Vignette & Mesh Overlay matching #070A10 and #123B6B */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#070A10]/70 via-[#070A10]/50 to-[#070A10]/85 backdrop-blur-[2px]" />

      {/* Theme Toggle in Header Corner */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle Theme"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(42,127,255,0.25)] bg-[#0E1B2A]/80 text-[var(--text)] shadow-lg backdrop-blur-md transition hover:border-[var(--accent)]"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--dentist)] to-[var(--lab)] text-xl font-bold text-[#070A10] shadow-lg shadow-[var(--accent-glow)]">
              ◈
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
              Dentrio<span className="text-[var(--accent)]">.</span>
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white drop-shadow-sm">
            Sign in to your account
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Dental clinic, lab & logistics orchestration
          </p>
        </div>

        {/* Clean Glassmorphic Card */}
        <div className="rounded-2xl border border-[rgba(42,127,255,0.25)] bg-[#0E1B2A]/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Username or Email
              </label>
              <input
                type="text"
                autoComplete="username"
                required
                placeholder="e.g. user or user@email.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[#070A10]/90 border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[#070A10]/90 border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/50 p-3 text-xs font-semibold text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-accent flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-[#070A10] shadow-md disabled:opacity-50"
            >
              {busy ? 'Authenticating…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs font-medium text-[var(--text-muted)]">
          Need a clinic or lab account?{' '}
          <Link href="/signup" className="font-bold text-[var(--accent-light)] hover:underline">
            Create Profile
          </Link>
        </p>
      </div>
    </main>
  );
}
