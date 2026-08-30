'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

const FEATURES = [
  { num: '01', title: '3D In-Browser Preview', desc: 'View, rotate, and inspect STL/PLY dental scans directly in your browser — no desktop software required.' },
  { num: '02', title: 'Structured Prescriptions', desc: 'Capture tooth number, restoration type, shade, material, and notes in one consistent digital form.' },
  { num: '03', title: 'Case-Attached Chat', desc: 'Every question, photo, and clarification stays attached directly to the specific case — zero lost emails.' },
  { num: '04', title: 'Live Status Pipeline', desc: 'From upload to delivery, one synchronized pipeline tells every participant exactly where a case stands.' },
  { num: '05', title: 'Lab Response Files', desc: 'Labs upload CAD designs and revisions back to the case thread before milling begins.' },
  { num: '06', title: 'Privacy-Preserved Shipping', desc: 'Couriers receive only the Case ID and addresses — clinical scans and patient data stay protected.' },
];

const ROLES = [
  {
    icon: '🦷',
    title: 'Dentist',
    color: 'var(--dentist)',
    colorRgb: '166, 240, 255',
    desc: 'Upload 3D scans, set structured prescriptions, preview models in-browser, approve designs, and track every case.',
    perks: ['In-browser 3D scan viewer', 'Lab directory & selection', 'Case chat with photo uploads', '1-click design approval'],
  },
  {
    icon: '🔬',
    title: 'Dental Lab',
    color: 'var(--lab)',
    colorRgb: '42, 127, 255',
    desc: 'Receive organized cases with scan files and prescriptions. Upload design proposals and advance production stages.',
    perks: ['Full prescription specs', '3D inspection & rotation', 'Design file responses', 'Ready-for-pickup trigger'],
  },
  {
    icon: '🚚',
    title: 'Shipping',
    color: 'var(--ship)',
    colorRgb: '95, 168, 255',
    desc: 'Privacy-separated view — see pickup and delivery addresses with Case ID only. No clinical data exposed.',
    perks: ['Pickup confirmation', 'Tracking number assignment', 'Live delivery status', 'Automated case closing'],
  },
];

const HOW_STEPS = [
  { num: 'Step 1', title: 'Create your account', desc: 'Sign up as a Dentist, Dental Lab, or Shipping company. Each role sees its own tailored workspace.' },
  { num: 'Step 2', title: 'Submit a dental case', desc: 'Upload the 3D scan (STL/PLY), fill in the structured prescription, and assign it to your preferred lab.' },
  { num: 'Step 3', title: 'Collaborate in real time', desc: 'Chat, share reference photos, review the CAD design, and approve or request revisions — all in one place.' },
  { num: 'Step 4', title: 'Track to the door', desc: 'The shipping partner picks up, enters tracking, and the case closes automatically on confirmed delivery.' },
];

const MARQUEE_ITEMS = [
  '🦷 Dental Workflow', '🔬 Lab Collaboration', '📦 Shipping Logistics',
  '✅ Design Approval', '💬 Case Chat', '🧊 3D Scan Viewer',
  '🦷 Dental Workflow', '🔬 Lab Collaboration', '📦 Shipping Logistics',
  '✅ Design Approval', '💬 Case Chat', '🧊 3D Scan Viewer',
];

function useFadeUp() {
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
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  useFadeUp();

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
                Dentrio<span className="text-[var(--accent)]">.</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <a href="#roles"    className="text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)]">Roles</a>
              <a href="#how"      className="text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)]">How it works</a>
              <a href="#features" className="text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)]">Features</a>
            </nav>

            <div className="flex items-center gap-3">
              <button onClick={toggleTheme} type="button" aria-label="Toggle theme"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] transition hover:border-[var(--accent)]">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <Link href="/login"
                className="hidden rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] sm:inline-flex">
                Sign In
              </Link>
              <Link href="/signup" className="btn-accent rounded-xl px-4 py-2 text-sm">
                Get Started
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
                {[['#roles','Roles'],['#how','How it works'],['#features','Features']].map(([href,label])=>(
                  <a key={href} href={href} onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]">
                    {label}
                  </a>
                ))}
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]">
                  Sign In
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="btn-accent mt-1 rounded-xl px-4 py-2.5 text-center text-sm">
                  Get Started
                </Link>
              </nav>
            </div>
          )}
        </header>

        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-5 pt-20 pb-16 sm:px-8 lg:flex-row lg:gap-16 lg:pt-28 lg:pb-24">
          {/* Left — text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(42,127,255,0.3)] bg-[var(--accent-dim)] px-4 py-1.5 text-xs font-bold text-[var(--accent-light)] fade-up">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              The Connected Dental Platform
            </div>

            <h1 className="mt-7 text-5xl font-black leading-[1.08] tracking-tight text-[var(--text)] sm:text-6xl xl:text-7xl fade-up fade-up-delay-1">
              One platform.<br />
              <span className="bg-gradient-to-r from-[var(--accent-light)] via-[var(--accent)] to-[var(--lab)] bg-clip-text text-transparent">
                Three connected worlds.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg lg:mx-0 fade-up fade-up-delay-2">
              Dentrio connects <strong className="text-[var(--text)]">dentists, dental labs, and shipping companies</strong> in one shared case workflow — built around in-browser 3D dental scan previews instead of lost emails and scattered files.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start fade-up fade-up-delay-3">
              <Link href="/signup" className="btn-accent rounded-xl px-8 py-3.5 text-base">
                Create Account
              </Link>
              <Link href="/login"
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-8 py-3.5 text-base font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
                Sign In
              </Link>
            </div>

            {/* Mini trust strip */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 lg:justify-start fade-up fade-up-delay-4">
              {[['3', 'Connected Roles'], ['1', 'Shared Case Record'], ['0', 'Lost Attachments']].map(([n, l]) => (
                <div key={l} className="text-center lg:text-left">
                  <p className="text-3xl font-black text-[var(--accent)]">{n}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — orbit visual */}
          <div className="relative flex h-72 w-72 flex-shrink-0 items-center justify-center sm:h-96 sm:w-96 fade-up fade-up-delay-2">
            <div className="orbit-ring orbit-ring-1"><div className="orbit-dot dot-dentist" /></div>
            <div className="orbit-ring orbit-ring-2"><div className="orbit-dot dot-lab" /></div>
            <div className="orbit-ring orbit-ring-3"><div className="orbit-dot dot-ship" /></div>

            {/* Floating & Rounding Dental Implant Bar + Overdenture Visual */}
            <svg
              className="dental-float-rounding h-44 w-44 drop-shadow-[0_15px_35px_rgba(42,127,255,0.45)] sm:h-52 sm:w-52"
              viewBox="0 0 240 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Overdenture Pink/Gingiva Gradient */}
                <linearGradient id="gingivaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#123B6B" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#0E1B2A" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#070A10" stopOpacity="0.95" />
                </linearGradient>

                {/* Titanium / Zirconia Bar Gradient */}
                <linearGradient id="titaniumBar" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2A7FFF" />
                  <stop offset="50%" stopColor="#A6F0FF" />
                  <stop offset="100%" stopColor="#2A7FFF" />
                </linearGradient>

                {/* Tooth Enamel Crown Gradient */}
                <linearGradient id="crownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#A6F0FF" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#2A7FFF" stopOpacity="0.75" />
                </linearGradient>

                {/* Implant Fixture Thread Gradient */}
                <linearGradient id="implantGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#A6F0FF" />
                  <stop offset="50%" stopColor="#2A7FFF" />
                  <stop offset="100%" stopColor="#123B6B" />
                </linearGradient>
              </defs>

              {/* ── 1. Implant Fixtures (4 Multi-Unit Dental Implants) ── */}
              <g id="dental-implants" opacity="0.85">
                {/* Implant 1 (Far Left) */}
                <path d="M52 148 L56 182 L48 182 Z" fill="url(#implantGrad)" />
                <line x1="47" y1="156" x2="57" y2="156" stroke="#A6F0FF" strokeWidth="1.5" />
                <line x1="48" y1="164" x2="56" y2="164" stroke="#A6F0FF" strokeWidth="1.5" />
                <line x1="49" y1="172" x2="55" y2="172" stroke="#A6F0FF" strokeWidth="1.5" />
                
                {/* Implant 2 (Center Left) */}
                <path d="M96 156 L100 192 L92 192 Z" fill="url(#implantGrad)" />
                <line x1="91" y1="166" x2="101" y2="166" stroke="#A6F0FF" strokeWidth="1.5" />
                <line x1="92" y1="174" x2="100" y2="174" stroke="#A6F0FF" strokeWidth="1.5" />
                <line x1="93" y1="182" x2="99" y2="182" stroke="#A6F0FF" strokeWidth="1.5" />

                {/* Implant 3 (Center Right) */}
                <path d="M144 156 L148 192 L140 192 Z" fill="url(#implantGrad)" />
                <line x1="139" y1="166" x2="149" y2="166" stroke="#A6F0FF" strokeWidth="1.5" />
                <line x1="140" y1="174" x2="148" y2="174" stroke="#A6F0FF" strokeWidth="1.5" />
                <line x1="141" y1="182" x2="147" y2="182" stroke="#A6F0FF" strokeWidth="1.5" />

                {/* Implant 4 (Far Right) */}
                <path d="M188 148 L192 182 L184 182 Z" fill="url(#implantGrad)" />
                <line x1="183" y1="156" x2="193" y2="156" stroke="#A6F0FF" strokeWidth="1.5" />
                <line x1="184" y1="164" x2="192" y2="164" stroke="#A6F0FF" strokeWidth="1.5" />
                <line x1="185" y1="172" x2="191" y2="172" stroke="#A6F0FF" strokeWidth="1.5" />
              </g>

              {/* ── 2. Rounded Titanium / Zirconia Implant Bar ── */}
              <g id="implant-bar" className="dental-bar">
                {/* Abutment Collars */}
                <rect x="47" y="140" width="10" height="9" rx="2" fill="url(#titaniumBar)" />
                <rect x="91" y="148" width="10" height="9" rx="2" fill="url(#titaniumBar)" />
                <rect x="139" y="148" width="10" height="9" rx="2" fill="url(#titaniumBar)" />
                <rect x="183" y="140" width="10" height="9" rx="2" fill="url(#titaniumBar)" />

                {/* Rounded Arch Implant Framework Bar */}
                <path
                  d="M45 142 C 75 160, 165 160, 195 142 C 196 136, 185 132, 175 135 C 145 146, 95 146, 65 135 C 55 132, 44 136, 45 142 Z"
                  fill="url(#titaniumBar)"
                  stroke="#A6F0FF"
                  strokeWidth="1.2"
                />

                {/* Locator / Retentive Attachments on Bar */}
                <circle cx="70" cy="143" r="3.5" fill="#FFFFFF" stroke="#2A7FFF" strokeWidth="1.5" />
                <circle cx="120" cy="151" r="3.5" fill="#FFFFFF" stroke="#2A7FFF" strokeWidth="1.5" />
                <circle cx="170" cy="143" r="3.5" fill="#FFFFFF" stroke="#2A7FFF" strokeWidth="1.5" />
              </g>

              {/* ── 3. Overdenture Prosthesis (Pink Base + Crowns) ── */}
              <g id="overdenture" className="dental-overdenture">
                {/* Gingival Acrylic Base Arch */}
                <path
                  d="M38 126 C 60 150, 180 150, 202 126 C 210 114, 198 94, 182 92 C 145 88, 95 88, 58 92 C 42 94, 30 114, 38 126 Z"
                  fill="url(#gingivaGrad)"
                  stroke="rgba(42, 127, 255, 0.4)"
                  strokeWidth="1.5"
                />

                {/* Crown 1: Left Molar (#19/20) */}
                <path
                  d="M48 108 C 44 94, 52 82, 62 84 C 70 85, 71 96, 68 110 C 60 114, 52 114, 48 108 Z"
                  fill="url(#crownGrad)"
                  stroke="#A6F0FF"
                  strokeWidth="1"
                />

                {/* Crown 2: Left Premolar/Canine (#21/22) */}
                <path
                  d="M72 108 C 68 90, 75 74, 86 76 C 95 78, 96 92, 92 110 C 85 113, 78 112, 72 108 Z"
                  fill="url(#crownGrad)"
                  stroke="#A6F0FF"
                  strokeWidth="1"
                />

                {/* Crown 3: Central Incisor (#24/25) */}
                <path
                  d="M96 112 C 93 88, 100 68, 114 70 C 122 71, 123 88, 118 114 C 110 116, 102 115, 96 112 Z"
                  fill="url(#crownGrad)"
                  stroke="#A6F0FF"
                  strokeWidth="1.2"
                />

                {/* Crown 4: Central Incisor (#25/26) */}
                <path
                  d="M122 114 C 117 88, 118 71, 126 70 C 140 68, 147 88, 144 112 C 138 115, 130 116, 122 114 Z"
                  fill="url(#crownGrad)"
                  stroke="#A6F0FF"
                  strokeWidth="1.2"
                />

                {/* Crown 5: Right Premolar/Canine (#27/28) */}
                <path
                  d="M148 110 C 144 92, 145 78, 154 76 C 165 74, 172 90, 168 108 C 162 112, 155 113, 148 110 Z"
                  fill="url(#crownGrad)"
                  stroke="#A6F0FF"
                  strokeWidth="1"
                />

                {/* Crown 6: Right Molar (#29/30) */}
                <path
                  d="M172 110 C 169 96, 170 85, 178 84 C 188 82, 196 94, 192 108 C 188 114, 180 114, 172 110 Z"
                  fill="url(#crownGrad)"
                  stroke="#A6F0FF"
                  strokeWidth="1"
                />
              </g>
            </svg>

            {/* Labels */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-5">
              {[['#A6F0FF','🦷 Clinic'],['#2A7FFF','🔬 Lab'],['#5fa8ff','🚚 Ship']].map(([c,l])=>(
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
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Who it's for</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-5xl">
              Built for every participant
            </h2>
            <p className="mt-3 text-base text-[var(--text-muted)]">
              Each role sees exactly what they need — no more, no less.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {ROLES.map((r, i) => (
              <div key={r.title}
                className={`dentrio-card relative overflow-hidden rounded-2xl p-7 transition hover:-translate-y-2 fade-up fade-up-delay-${i + 1}`}>
                {/* Top accent bar */}
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
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Process</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-5xl">
                How it works
              </h2>
              <p className="mt-3 text-base text-[var(--text-muted)]">
                From first scan to final delivery in four seamless steps.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_STEPS.map((s, i) => (
                <div key={s.num} className={`dentrio-card rounded-2xl p-6 fade-up fade-up-delay-${i + 1}`}>
                  <span className="inline-block rounded-lg bg-[var(--accent-dim)] px-3 py-1 text-xs font-bold text-[var(--accent)]">
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
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Capabilities</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-5xl">
              Core Features
            </h2>
            <p className="mt-3 text-base text-[var(--text-muted)]">
              Everything that makes Dentrio the next-generation dental orchestration tool.
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

        {/* ── CTA Banner ─────────────────────────────────────────── */}
        <section className="mx-5 mb-16 overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[#0E1B2A] to-[#123B6B] px-8 py-16 text-center sm:mx-8 fade-up">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-light)] opacity-70">Ready?</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text)] sm:text-5xl">
            Streamline your dental workflow today.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[var(--text-muted)]">
            Join Dentrio and connect your clinic or dental lab to a unified, privacy-first 3D pipeline.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup" className="btn-accent rounded-xl px-8 py-3.5 text-base">
              Create Your Account
            </Link>
            <Link href="/login"
              className="rounded-xl border border-[rgba(166,240,255,0.25)] px-8 py-3.5 text-base font-semibold text-[var(--accent-light)] transition hover:border-[var(--accent-light)]">
              Sign In
            </Link>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer className="border-t border-[var(--border)] bg-[var(--bg-card)] py-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--dentist)] to-[var(--lab)] text-sm font-bold text-[#070A10]">◈</div>
            <span className="text-lg font-black text-[var(--text)]">Dentrio<span className="text-[var(--accent)]">.</span></span>
          </Link>
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            © 2026 Dentrio. Connecting dental clinics, labs, and logistics.
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <Link href="/login"  className="text-xs font-semibold text-[var(--text-muted)] transition hover:text-[var(--accent)]">Sign In</Link>
            <Link href="/signup" className="text-xs font-semibold text-[var(--text-muted)] transition hover:text-[var(--accent)]">Register</Link>
          </div>
        </footer>

      </div>
    </div>
  );
}
