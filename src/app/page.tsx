'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

const PIPELINE_STEPS = [
  { icon: '📤', label: 'Upload' },
  { icon: '🔍', label: 'Review' },
  { icon: '✏️', label: 'Design' },
  { icon: '✅', label: 'Approve' },
  { icon: '⚙️', label: 'Produce' },
  { icon: '🚚', label: 'Ship' },
  { icon: '✓', label: 'Delivered' },
];

const STEP_DETAILS = [
  {
    status: 'Uploading 3D scan (STL/PLY)...',
    fields: [
      { label: 'Patient', value: 'J. Morrison' },
      { label: 'Tooth', value: '#14 Upper Left Molar' },
      { label: 'Restoration', value: 'Zirconia Crown' },
      { label: 'Shade', value: 'A2' },
      { label: 'Due Date', value: 'Sep 5, 2026' },
      { label: 'Lab', value: 'Precision Dental Lab' },
    ],
    preview: '🦷',
    previewText: '3D Scan Preview (STL)',
    previewSub: 'Drag to rotate • Scroll to zoom in browser',
  },
  {
    status: 'Lab reviewing prescription...',
    fields: [
      { label: 'Patient', value: 'J. Morrison' },
      { label: 'Tooth', value: '#14 Upper Left Molar' },
      { label: 'Restoration', value: 'Zirconia Crown' },
      { label: 'Shade', value: 'A2' },
      { label: 'Notes', value: 'Minimal clearance, watch margin' },
      { label: 'Lab', value: 'Precision Dental Lab' },
    ],
    preview: '💬',
    previewText: 'Lab Case Chat',
    previewSub: '"Can you confirm margin line on buccal side?"',
  },
  {
    status: 'CAD design in progress...',
    fields: [
      { label: 'Patient', value: 'J. Morrison' },
      { label: 'Tooth', value: '#14 Upper Left Molar' },
      { label: 'Designer', value: 'M. Chen' },
      { label: 'Software', value: 'Exocad 3.2' },
      { label: 'Started', value: 'Aug 29, 2:15 PM' },
      { label: 'ETA', value: '~3 hours' },
    ],
    preview: '✏️',
    previewText: 'Design CAD Model',
    previewSub: 'Preparing crown geometry & contact points',
  },
  {
    status: 'Awaiting dentist approval...',
    fields: [
      { label: 'Patient', value: 'J. Morrison' },
      { label: 'Tooth', value: '#14 Upper Left Molar' },
      { label: 'Design', value: 'v2 (revised margin)' },
      { label: 'Shade', value: 'A2 — confirmed match' },
      { label: 'Sent', value: 'Aug 29, 5:42 PM' },
      { label: 'Action needed', value: 'Dentist approval required' },
    ],
    preview: '👁️',
    previewText: 'Interactive Preview',
    previewSub: 'Inspect 3D restoration before physical milling',
  },
  {
    status: 'In production (milling & sintering)...',
    fields: [
      { label: 'Patient', value: 'J. Morrison' },
      { label: 'Tooth', value: '#14 Upper Left Molar' },
      { label: 'Machine', value: 'DMG DentaMill 5-Axis' },
      { label: 'Material', value: 'Zirconia block #Z-440' },
      { label: 'Started', value: 'Aug 29, 6:15 PM' },
      { label: 'ETA', value: '~4 hours milling' },
    ],
    preview: '⚙️',
    previewText: 'Production Monitor',
    previewSub: 'Milling & glazing in progress (67%)',
  },
  {
    status: 'Ready for shipping pickup...',
    fields: [
      { label: 'Patient', value: 'J. Morrison' },
      { label: 'Tooth', value: '#14 Upper Left Molar' },
      { label: 'Package', value: 'Crown + model + invoice' },
      { label: 'Weight', value: '45g' },
      { label: 'Pickup from', value: 'Precision Dental Lab' },
      { label: 'Deliver to', value: 'Smile Dental, 42 Oak St' },
    ],
    preview: '📦',
    previewText: 'Shipping Logistics Handoff',
    previewSub: 'Addresses & Case ID shared (clinical data hidden)',
  },
  {
    status: 'Delivered & Completed ✓',
    fields: [
      { label: 'Patient', value: 'J. Morrison' },
      { label: 'Tooth', value: '#14 Upper Left Molar' },
      { label: 'Tracking', value: '1Z999AA10123456784' },
      { label: 'Carrier', value: 'Express Courier' },
      { label: 'Delivered', value: 'Aug 30, 9:15 AM' },
      { label: 'Signed by', value: 'Dr. Williams' },
    ],
    preview: '✓',
    previewText: 'Case Closed',
    previewSub: 'Physical piece delivered & case completed',
  },
];

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  const step = STEP_DETAILS[activeStep];
  const fillPercent = (activeStep / 6) * 100;

  return (
    <div className="relative min-h-screen">
      {/* Tradex Animated Mesh & Grid */}
      <div className="mesh-bg"></div>
      <div className="grid-overlay"></div>

      <div className="relative z-10">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--dentist)] to-[var(--lab)] text-xl font-bold text-[#0a0e17] shadow-lg shadow-[var(--accent-glow)]">
                ◈
              </div>
              <span className="text-2xl font-black tracking-tight text-[var(--text)]">
                DENTRIO<span className="text-[var(--accent)]">.</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-8 md:flex">
              <a href="#roles" className="text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)]">
                Roles
              </a>
              <a href="#workflow" className="text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)]">
                Workflow
              </a>
              <a href="#features" className="text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)]">
                Features
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] transition hover:border-[var(--accent)]"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <Link
                href="/login"
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="btn-accent rounded-lg px-4 py-2 text-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section with Interactive Orbit */}
        <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(0,212,170,0.25)] bg-[var(--accent-dim)] px-4 py-1.5 text-xs font-semibold text-[var(--accent)]">
            <span>◈</span>
            <span>The Connected Dental Logistics Network</span>
          </div>

          <h1 className="mt-8 text-5xl font-black tracking-tight text-[var(--text)] sm:text-7xl sm:leading-none">
            One platform.<br />
            <span className="bg-gradient-to-r from-[var(--dentist)] via-[var(--lab)] to-[var(--ship)] bg-clip-text text-transparent">
              Three connected worlds.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--text-muted)] sm:text-xl">
            Dentrio connects <strong>dentists, dental labs, and shipping companies</strong> in one shared case workflow — built around in-browser 3D dental scan previews instead of lost emails.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="btn-accent rounded-xl px-8 py-3.5 text-base"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-8 py-3.5 text-base font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Enter Demo (h09)
            </Link>
          </div>

          {/* Tradex 3D Tooth & Orbit Visualization */}
          <div className="relative mx-auto mt-16 flex h-80 w-80 items-center justify-center sm:h-96 sm:w-96">
            <div className="orbit-ring orbit-ring-1">
              <div className="orbit-dot dot-dentist" title="Dentist"></div>
            </div>
            <div className="orbit-ring orbit-ring-2">
              <div className="orbit-dot dot-lab" title="Dental Lab"></div>
            </div>
            <div className="orbit-ring orbit-ring-3">
              <div className="orbit-dot dot-ship" title="Shipping"></div>
            </div>

            <svg className="h-44 w-44 animate-pulse" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="toothGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <path
                d="M70 60 Q100 30 130 60 Q140 80 135 100 Q100 110 65 100 Q60 80 70 60Z"
                fill="url(#toothGrad)"
                stroke="#00d4aa"
                strokeWidth="1.5"
                opacity="0.9"
              />
              <path
                d="M65 100 Q55 130 60 160 Q70 170 80 150 Q85 120 80 100Z"
                fill="url(#toothGrad)"
                stroke="#00d4aa"
                strokeWidth="1"
                opacity="0.8"
              />
              <path
                d="M135 100 Q145 130 140 160 Q130 170 120 150 Q115 120 120 100Z"
                fill="url(#toothGrad)"
                stroke="#00d4aa"
                strokeWidth="1"
                opacity="0.8"
              />
              <path
                d="M85 105 Q90 140 95 165 Q100 175 105 165 Q110 140 115 105Z"
                fill="url(#toothGrad)"
                stroke="#00d4aa"
                strokeWidth="1"
                opacity="0.85"
              />
            </svg>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-[var(--border)] bg-[var(--bg-card)] py-12">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 text-center sm:grid-cols-3">
            <div>
              <p className="text-5xl font-black text-[var(--accent)]">3</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Connected Roles</p>
            </div>
            <div>
              <p className="text-5xl font-black text-[var(--lab)]">1</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Shared Case Record</p>
            </div>
            <div>
              <p className="text-5xl font-black text-[var(--ship)]">0</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Lost Attachments</p>
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section id="roles" className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-5xl">
              Built for every participant
            </h2>
            <p className="mt-3 text-lg text-[var(--text-muted)]">
              Each role sees exactly what they need — no more, no less.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Dentist Card */}
            <div className="dentrio-card relative overflow-hidden rounded-2xl p-8 transition hover:-translate-y-2">
              <div className="absolute top-0 right-0 left-0 h-1 bg-[var(--dentist)]"></div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[rgba(0,212,170,0.15)] text-2xl text-[var(--dentist)]">
                🦷
              </div>
              <h3 className="mt-6 text-2xl font-bold text-[var(--dentist)]">Dentist</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                Upload 3D scans (STL/PLY), set structured prescriptions, preview models in-browser, and track status.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs font-medium text-[var(--text-muted)]">
                <li className="flex items-center gap-2"><span className="text-[var(--dentist)]">✓</span> In-browser 3D scan viewer</li>
                <li className="flex items-center gap-2"><span className="text-[var(--dentist)]">✓</span> Lab directory & selection</li>
                <li className="flex items-center gap-2"><span className="text-[var(--dentist)]">✓</span> Case chat with photo uploads</li>
                <li className="flex items-center gap-2"><span className="text-[var(--dentist)]">✓</span> 1-click design approval</li>
              </ul>
            </div>

            {/* Dental Lab Card */}
            <div className="dentrio-card relative overflow-hidden rounded-2xl p-8 transition hover:-translate-y-2">
              <div className="absolute top-0 right-0 left-0 h-1 bg-[var(--lab)]"></div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[rgba(96,165,250,0.15)] text-2xl text-[var(--lab)]">
                🔬
              </div>
              <h3 className="mt-6 text-2xl font-bold text-[var(--lab)]">Dental Lab</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                Receive organized cases with scan files & prescriptions. Upload design proposals and advance production stages.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs font-medium text-[var(--text-muted)]">
                <li className="flex items-center gap-2"><span className="text-[var(--lab)]">✓</span> Complete prescription specs</li>
                <li className="flex items-center gap-2"><span className="text-[var(--lab)]">✓</span> 3D inspection & rotation</li>
                <li className="flex items-center gap-2"><span className="text-[var(--lab)]">✓</span> Design file responses</li>
                <li className="flex items-center gap-2"><span className="text-[var(--lab)]">✓</span> Ready-for-pickup trigger</li>
              </ul>
            </div>

            {/* Shipping Card */}
            <div className="dentrio-card relative overflow-hidden rounded-2xl p-8 transition hover:-translate-y-2">
              <div className="absolute top-0 right-0 left-0 h-1 bg-[var(--ship)]"></div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[rgba(245,158,11,0.15)] text-2xl text-[var(--ship)]">
                📦
              </div>
              <h3 className="mt-6 text-2xl font-bold text-[var(--ship)]">Shipping</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                Dedicated privacy-separated view. See pickup and delivery addresses with Case ID only — no clinical data exposed.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs font-medium text-[var(--text-muted)]">
                <li className="flex items-center gap-2"><span className="text-[var(--ship)]">✓</span> Pickup confirmation</li>
                <li className="flex items-center gap-2"><span className="text-[var(--ship)]">✓</span> Tracking number assignment</li>
                <li className="flex items-center gap-2"><span className="text-[var(--ship)]">✓</span> Live delivery status pipeline</li>
                <li className="flex items-center gap-2"><span className="text-[var(--ship)]">✓</span> Automated case closing</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Interactive Tradex Workflow Pipeline */}
        <section id="workflow" className="mx-auto max-w-5xl px-6 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-5xl">
              Interactive Case Pipeline
            </h2>
            <p className="mt-3 text-base text-[var(--text-muted)]">
              Click any stage to see what happens in the shared record.
            </p>
          </div>

          {/* Pipeline Track */}
          <div className="relative mt-16 px-4">
            <div className="absolute top-7 right-8 left-8 h-1 bg-[var(--border)]">
              <div
                className="h-full bg-gradient-to-r from-[var(--dentist)] via-[var(--lab)] to-[var(--ship)] transition-all duration-500"
                style={{ width: `${fillPercent}%` }}
              ></div>
            </div>

            <div className="relative flex justify-between">
              {PIPELINE_STEPS.map((s, idx) => (
                <button
                  key={s.label}
                  onClick={() => setActiveStep(idx)}
                  className="group flex flex-col items-center gap-2"
                >
                  <div
                    className={
                      'flex h-14 w-14 items-center justify-center rounded-full border-2 text-xl font-bold transition-all ' +
                      (idx === activeStep
                        ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)] shadow-lg shadow-[var(--accent-glow)] scale-110'
                        : idx < activeStep
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-[#0a0e17]'
                        : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)]')
                    }
                  >
                    {s.icon}
                  </div>
                  <span
                    className={
                      'text-xs font-bold transition ' +
                      (idx === activeStep ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')
                    }
                  >
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Case Detail Simulation */}
          <div className="dentrio-card mt-12 rounded-2xl p-8">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <span className="rounded-md bg-[var(--accent-dim)] px-3 py-1 font-mono text-sm font-bold text-[var(--accent)]">
                CASE-2026-0847
              </span>
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <span className="h-2.5 w-2.5 animate-ping rounded-full bg-[var(--accent)]"></span>
                <span>{step.status}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {step.fields.map((f) => (
                <div key={f.label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{f.label}</p>
                  <p className="mt-1 text-sm font-bold text-[var(--text)]">{f.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] text-center">
              <span className="text-4xl">{step.preview}</span>
              <p className="mt-2 text-sm font-bold text-[var(--text)]">{step.previewText}</p>
              <p className="text-xs text-[var(--text-muted)]">{step.previewSub}</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-5xl">
              Core Capabilities
            </h2>
            <p className="mt-3 text-lg text-[var(--text-muted)]">
              Everything that makes Dentrio the next-generation dental orchestration tool.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              { num: '01', title: '3D In-Browser Preview', desc: 'No heavy desktop software needed. View, rotate, and inspect STL/PLY files directly in your web browser.' },
              { num: '02', title: 'Structured Prescriptions', desc: 'Eliminate scribbled notes and messy emails. Capture restoration type, tooth number, shade, material, and notes consistently.' },
              { num: '03', title: 'Case-Attached Chat', desc: 'Every question, clarification, and reference photo stays attached directly to the specific case file.' },
              { num: '04', title: 'Live Status Pipeline', desc: 'From upload to pickup and delivery, one synchronized pipeline tells everyone where a case stands in real time.' },
              { num: '05', title: 'Lab Response Files', desc: 'Labs upload digital CAD designs and revisions directly back to the case thread before milling.' },
              { num: '06', title: 'Privacy-Preserved Shipping', desc: 'Couriers receive case IDs and addresses without accessing confidential clinical files or scans.' },
            ].map((f) => (
              <div key={f.num} className="dentrio-card rounded-2xl p-8 transition hover:-translate-y-1">
                <span className="font-mono text-4xl font-black text-[var(--accent)] opacity-40">{f.num}</span>
                <h3 className="mt-3 text-xl font-bold text-[var(--text)]">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <footer className="border-t border-[var(--border)] bg-[var(--bg-card)] py-20 text-center">
          <h2 className="text-3xl font-black tracking-tight text-[var(--text)] sm:text-5xl">
            Ready to streamline your dental workflow?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[var(--text-muted)]">
            Join Dentrio today and connect your clinic or dental lab to a unified 3D pipeline.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/signup" className="btn-accent rounded-xl px-8 py-3.5 text-base">
              Create Your Account
            </Link>
            <Link href="/login" className="rounded-xl border border-[var(--border)] px-8 py-3.5 text-base font-semibold text-[var(--text)] transition hover:border-[var(--accent)]">
              Sign In
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
