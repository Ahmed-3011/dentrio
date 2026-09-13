'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.fade-up');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const ROLES = [
    {
      icon: '🦷',
      title: t.dentistTitle,
      color: 'var(--dentist)',
      colorRgb: '166, 240, 255',
      desc: t.dentistDesc,
      perks: [t.dentistP1, t.dentistP2, t.dentistP3, t.dentistP4],
    },
    {
      icon: '🔬',
      title: t.labTitle,
      color: 'var(--lab)',
      colorRgb: '42, 127, 255',
      desc: t.labDesc,
      perks: [t.labP1, t.labP2, t.labP3, t.labP4],
    },
    {
      icon: '🚚',
      title: t.shippingTitle,
      color: 'var(--ship)',
      colorRgb: '95, 168, 255',
      desc: t.shippingDesc,
      perks: [t.shippingP1, t.shippingP2, t.shippingP3, t.shippingP4],
    },
  ];

  const HOW_STEPS = [
    { num: lang === 'ar' ? 'الخطوة ١' : 'Step 1', title: t.step1Title, desc: t.step1Desc },
    { num: lang === 'ar' ? 'الخطوة ٢' : 'Step 2', title: t.step2Title, desc: t.step2Desc },
    { num: lang === 'ar' ? 'الخطوة ٣' : 'Step 3', title: t.step3Title, desc: t.step3Desc },
    { num: lang === 'ar' ? 'الخطوة ٤' : 'Step 4', title: t.step4Title, desc: t.step4Desc },
  ];

  const FEATURES = [
    { num: '01', title: t.feat1Title, desc: t.feat1Desc },
    { num: '02', title: t.feat2Title, desc: t.feat2Desc },
    { num: '03', title: t.feat3Title, desc: t.feat3Desc },
    { num: '04', title: t.feat4Title, desc: t.feat4Desc },
    { num: '05', title: t.feat5Title, desc: t.feat5Desc },
    { num: '06', title: t.feat6Title, desc: t.feat6Desc },
  ];

  const MARQUEE_ITEMS = [
    `🦷 ${t.dentistTitle}`,
    `🔬 ${t.labTitle}`,
    `📦 ${t.shippingTitle}`,
    `✅ ${t.feat5Title}`,
    `💬 ${t.feat3Title}`,
    `🧊 ${t.feat1Title}`,
    `🦷 ${t.dentistTitle}`,
    `🔬 ${t.labTitle}`,
    `📦 ${t.shippingTitle}`,
    `✅ ${t.feat5Title}`,
    `💬 ${t.feat3Title}`,
    `🧊 ${t.feat1Title}`,
  ];

  return (
    <div className="relative min-h-screen">
      {/* Floating blob background */}
      <div className="blob-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="grid-overlay" />

      <div className="relative z-10">

        {/* ── Navbar ─────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-xl">
          <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--dentist)] to-[var(--lab)] text-xl font-bold text-[#070A10] shadow-lg">
                ◈
              </div>
              <span className="text-2xl font-black tracking-tight text-[var(--text)]">
                {t.brand}<span className="text-[var(--accent)]">.</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <a href="#roles"    className="text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)]">{t.roles}</a>
              <a href="#how"      className="text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)]">{t.howItWorks}</a>
              <a href="#features" className="text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)]">{t.features}</a>
            </nav>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Language Switcher Button (EN / AR) */}
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
              <button onClick={toggleTheme} type="button" aria-label="Toggle theme"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] transition hover:border-[var(--accent)]">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              <Link href="/login"
                className="hidden rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] sm:inline-flex">
                {t.signIn}
              </Link>
              <Link href="/signup" className="btn-accent rounded-xl px-4 py-2 text-sm">
                {t.getStarted}
              </Link>

              {/* Mobile burger */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] md:hidden" aria-label="Menu">
                <span className="text-[var(--text)] text-lg">{mobileOpen ? '✕' : '☰'}</span>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="border-t border-[var(--border)] bg-[var(--bg-card)] px-5 pb-5 pt-3 md:hidden">
              <nav className="flex flex-col gap-2">
                {[['#roles', t.roles], ['#how', t.howItWorks], ['#features', t.features]].map(([href, label]) => (
                  <a key={href} href={href} onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]">
                    {label}
                  </a>
                ))}
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]">
                  {t.signIn}
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="btn-accent mt-1 rounded-xl px-4 py-2.5 text-center text-sm">
                  {t.getStarted}
                </Link>
              </nav>
            </div>
          )}
        </header>

        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-5 pt-20 pb-16 sm:px-8 lg:flex-row lg:gap-16 lg:pt-28 lg:pb-24">
          {/* Left / Start — text */}
          <div className="flex-1 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(42,127,255,0.3)] bg-[var(--accent-dim)] px-4 py-1.5 text-xs font-bold text-[var(--accent-light)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              {t.heroBadge}
            </div>

            <h1 className="mt-7 text-5xl font-black leading-[1.08] tracking-tight text-[var(--text)] sm:text-6xl xl:text-7xl">
              {t.heroTitle1}<br />
              <span className="bg-gradient-to-r from-[var(--accent-light)] via-[var(--accent)] to-[var(--lab)] bg-clip-text text-transparent">
                {t.heroTitle2}
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg lg:mx-0">
              {t.heroDescription}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link href="/signup" className="btn-accent rounded-xl px-8 py-3.5 text-base">
                {t.heroCreateBtn}
              </Link>
              <Link href="/login"
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-8 py-3.5 text-base font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
                {t.heroSignInBtn}
              </Link>
            </div>

            {/* Mini stats */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
              {[['3', t.statConnectedRoles], ['1', t.statSharedRecord], ['0', t.statZeroLost]].map(([n, l]) => (
                <div key={l} className="text-center lg:text-start">
                  <p className="text-3xl font-black text-[var(--accent)]">{n}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right / End — Concentric Animated Orbit Rings & Central Lottie Animation */}
          <div className="relative flex h-72 w-72 flex-shrink-0 items-center justify-center sm:h-96 sm:w-96">
            <div className="orbit-ring orbit-ring-1"><div className="orbit-dot dot-dentist" title={t.dentistTitle} /></div>
            <div className="orbit-ring orbit-ring-2"><div className="orbit-dot dot-lab" title={t.labTitle} /></div>
            <div className="orbit-ring orbit-ring-3"><div className="orbit-dot dot-ship" title={t.shippingTitle} /></div>

            {/* Central Embedded Lottie Animation */}
            <div className="relative z-10 flex h-48 w-48 items-center justify-center overflow-hidden rounded-full drop-shadow-[0_15px_40px_rgba(42,127,255,0.45)] sm:h-56 sm:w-56 pointer-events-none">
              <iframe
                src="https://lottie.host/embed/d7ef5f9c-658b-4685-9c04-c04d93aa0bdf/XGuvK53YBG.json"
                className="h-full w-full border-0 pointer-events-none scale-125"
                title="Dental Orbit Animation"
                allowTransparency
              />
            </div>

            {/* Role indicator badges below orbits */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-5">
              {[['#A6F0FF', `🦷 ${t.dentistTitle}`], ['#2A7FFF', `🔬 ${t.labTitle}`], ['#5fa8ff', `🚚 ${t.shippingTitle}`]].map(([c, l]) => (
                <span key={l} className="text-[10px] font-bold" style={{ color: c }}>{l}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Glow divider ───────────────────────────────────────── */}
        <div className="glow-line mx-8" />

        {/* ── Marquee strip ──────────────────────────────────────── */}
        <div className="overflow-hidden border-y border-[var(--border)] bg-[var(--bg-card)] py-4">
          <div className="marquee-track">
            {MARQUEE_ITEMS.map((item, i) => (
              <span key={i} className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                {item} &nbsp;&nbsp;·
              </span>
            ))}
          </div>
        </div>

        {/* ── Roles ──────────────────────────────────────────────── */}
        <section id="roles" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="text-center fade-up">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">{t.rolesSubtitle}</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-5xl">
              {t.rolesTitle}
            </h2>
            <p className="mt-3 text-base text-[var(--text-muted)]">
              {t.rolesDescription}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {ROLES.map((r, i) => (
              <div key={r.title}
                className={`dentrio-card relative overflow-hidden rounded-2xl p-7 transition hover:-translate-y-2 fade-up fade-up-delay-${i + 1}`}>
                <div className="absolute inset-x-0 top-0 h-1" style={{ background: r.color }} />
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
                  style={{ background: `rgba(${r.colorRgb}, 0.12)` }}>
                  {r.icon}
                </div>
                <h3 className="mt-5 text-xl font-bold" style={{ color: r.color }}>{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{r.desc}</p>
                <ul className="mt-5 space-y-2">
                  {r.perks.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
                      <span className="font-bold" style={{ color: r.color }}>✓</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ───────────────────────────────────────── */}
        <section id="how" className="border-y border-[var(--border)] bg-[var(--bg-card)] py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="text-center fade-up">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">{t.processSubtitle}</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-5xl">
                {t.processTitle}
              </h2>
              <p className="mt-3 text-base text-[var(--text-muted)]">
                {t.processDescription}
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_STEPS.map((s, i) => (
                <div key={s.num} className={`dentrio-card rounded-2xl p-6 fade-up fade-up-delay-${i + 1}`}>
                  <span className="inline-block rounded-lg bg-[var(--accent-dim)] px-3 py-1 text-xs font-bold text-[var(--accent-light)]">
                    {s.num}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-[var(--text)]">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────────── */}
        <section id="features" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="text-center fade-up">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">{t.featuresSubtitle}</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-5xl">
              {t.featuresTitle}
            </h2>
            <p className="mt-3 text-base text-[var(--text-muted)]">
              {t.featuresDescription}
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div key={f.num}
                className={`dentrio-card group rounded-2xl p-7 transition hover:-translate-y-1 hover:border-[var(--accent)] fade-up fade-up-delay-${(i % 3) + 1}`}>
                <span className="font-mono text-4xl font-black text-[var(--accent)] opacity-30 transition group-hover:opacity-60">
                  {f.num}
                </span>
                <h3 className="mt-3 text-base font-bold text-[var(--text)]">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner (Adaptive Theme: Pure White in Light Mode / #0E1B2A in Dark Mode) ── */}
        <section className="dentrio-card relative mx-5 mb-16 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-8 py-16 text-center sm:mx-8 fade-up shadow-sm">
          {/* Subtle Ambient Radial Glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(42,127,255,0.08)_0%,_transparent_70%)]" />

          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">{t.ctaReady}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text)] sm:text-5xl">
              {t.ctaTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-[var(--text-muted)]">
              {t.ctaDesc}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup" className="btn-accent rounded-xl px-8 py-3.5 text-base font-bold shadow-md">
                {t.heroCreateBtn}
              </Link>
              <Link href="/login"
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-8 py-3.5 text-base font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
                {t.signIn}
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer className="border-t border-[var(--border)] bg-[var(--bg-card)] py-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--dentist)] to-[var(--lab)] text-sm font-bold text-[#070A10]">◈</div>
            <span className="text-lg font-black text-[var(--text)]">{t.brand}<span className="text-[var(--accent)]">.</span></span>
          </Link>
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            {t.footerRights}
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <Link href="/login"  className="text-xs font-semibold text-[var(--text-muted)] transition hover:text-[var(--accent)]">{t.signIn}</Link>
            <Link href="/signup" className="text-xs font-semibold text-[var(--text-muted)] transition hover:text-[var(--accent)]">{t.getStarted}</Link>
          </div>
        </footer>

      </div>
    </div>
  );
}
