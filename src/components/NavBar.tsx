'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';

export default function NavBar({ role, name }: { role?: string; name?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const isShipping = role === 'SHIPPING';

  const LINKS = isShipping
    ? [
        { href: '/dashboard', label: t.overview },
        { href: '/shipping', label: t.shippingQueue },
      ]
    : [
        { href: '/dashboard', label: t.dashboard },
        { href: '/cases', label: t.cases },
        { href: '/milling', label: t.millingQueue },
        { href: '/labs', label: t.labDirectory },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Navigation Links */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--dentist)] to-[var(--lab)] text-base font-bold text-[#070A10] shadow-sm">
              ◈
            </div>
            <span className="text-xl font-black tracking-tight text-[var(--text)]">
              {t.brand}<span className="text-[var(--accent)]">.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={
                    'rounded-lg px-3.5 py-1.5 text-xs font-bold transition ' +
                    (active
                      ? 'bg-[var(--accent-dim)] text-[var(--accent-light)] border border-[rgba(42,127,255,0.25)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]')
                  }
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Language Switcher, Theme Switcher & User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Language Toggle Button (EN / AR) */}
          <button
            onClick={toggleLanguage}
            type="button"
            title={lang === 'en' ? 'التحويل إلى العربية' : 'Switch to English'}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-2.5 text-xs font-bold text-[var(--text)] shadow-sm transition hover:border-[var(--accent)]"
          >
            <span>{lang === 'en' ? '🇸🇦' : '🇺🇸'}</span>
            <span className="font-mono">{lang === 'en' ? 'العربية' : 'EN'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            type="button"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] shadow-sm transition hover:border-[var(--accent)]"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {name && (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-xs font-semibold text-[var(--text)]">
                {name}
              </span>
              <span className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent-light)]">
                {role === 'DENTIST' ? t.dentistTitle : role === 'LAB' ? t.labTitle : t.shippingTitle}
              </span>
            </div>
          )}

          <button
            onClick={logout}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-bold text-[var(--text-muted)] transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
          >
            {t.signOut}
          </button>
        </div>
      </div>
    </header>
  );
}
