'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

type Role = 'DENTIST' | 'LAB' | 'SHIPPING';

const ROLE_HOME: Record<Role, string> = {
  DENTIST: '/dashboard',
  LAB: '/dashboard',
  SHIPPING: '/shipping',
};

const LAB_SPECIALTY_CHOICES = [
  'Crowns & Bridges',
  'Zirconia & Ceramics',
  'Clear Aligners',
  'Porcelain Veneers',
  'Full & Partial Dentures',
  'Dental Implants & Custom Bars',
  'Inlays & Onlays',
  'Orthodontic Appliances',
  'Nightguards & Splints',
  'Maxillofacial Prosthetics',
];

export default function SignupPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [role, setRole] = useState<Role>('DENTIST');
  const [form, setForm] = useState<Record<string, string>>({});
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleSpecialty(s: string) {
    setSelectedSpecialties((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    if (!form.email || !form.password || !form.username || !form.name || !form.phone) {
      setError('Please complete all required fields including your phone number.');
      setBusy(false);
      return;
    }

    const payload = {
      email: form.email.trim(),
      username: form.username.trim(),
      phone: form.phone.trim(),
      password: form.password,
      name: form.name.trim(),
      role,
      clinicName: form.clinicName?.trim() || form.name.trim(),
      labName: form.labName?.trim() || form.name.trim(),
      companyName: form.companyName?.trim() || form.name.trim(),
      specialties: role === 'LAB' ? selectedSpecialties.join(', ') : '',
      turnaroundDays: form.turnaroundDays ? Number(form.turnaroundDays) : 3,
      address: form.address?.trim() || '',
      mapsUrl: form.mapsUrl?.trim() || '',
    };

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup registration failed');
        setBusy(false);
        return;
      }
      router.push(ROLE_HOME[role]);
      router.refresh();
    } catch {
      setError('Network connection error. Please try again.');
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8 bg-[#070A10] text-[var(--text)]">
      {/* ── Background Looping Fall Forest Video ────────────────────── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40 scale-105"
      >
        <source src="/videos/first-fall-forest.mp4" type="video/mp4" />
      </video>

      {/* Dark Vignette & Mesh Overlay matching #070A10 and #123B6B */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#070A10]/75 via-[#070A10]/55 to-[#070A10]/90 backdrop-blur-[2px]" />

      {/* Theme Toggle Button in Corner */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle Theme"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(42,127,255,0.25)] bg-[#0E1B2A]/80 text-[var(--text)] shadow-lg backdrop-blur-md transition hover:border-[var(--accent)]"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-xl my-8">
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
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl drop-shadow-sm">
            Create Your Account
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-medium text-[var(--text-muted)]">
            Join the connected dental clinic, lab & logistics workflow
          </p>
        </div>

        {/* Glassmorphic Signup Card */}
        <div className="rounded-2xl border border-[rgba(42,127,255,0.25)] bg-[#0E1B2A]/90 p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Role Picker */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['DENTIST', 'LAB', 'SHIPPING'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={
                    'rounded-xl border py-2.5 px-2 text-center text-xs font-bold transition ' +
                    (role === r
                      ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent-light)] shadow-sm'
                      : 'border-[var(--border)] bg-[#070A10]/60 text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-white')
                  }
                >
                  {r === 'DENTIST' ? '🦷 Dentist' : r === 'LAB' ? '🔬 Dental Lab' : '🚚 Shipping'}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Username *
                </label>
                <input
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="e.g. dr_smith"
                  value={form.username || ''}
                  onChange={(e) => set('username', e.target.value)}
                  className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[#070A10]/90 border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Full Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. John Smith"
                  value={form.name || ''}
                  onChange={(e) => set('name', e.target.value)}
                  className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[#070A10]/90 border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={form.email || ''}
                  onChange={(e) => set('email', e.target.value)}
                  className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[#070A10]/90 border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={form.phone || ''}
                  onChange={(e) => set('phone', e.target.value)}
                  className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[#070A10]/90 border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={form.password || ''}
                onChange={(e) => set('password', e.target.value)}
                className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[#070A10]/90 border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
              />
            </div>

            {/* Dynamic Role Fields */}
            {role === 'DENTIST' && (
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Clinic / Practice Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Precision Dental Care"
                  value={form.clinicName || ''}
                  onChange={(e) => set('clinicName', e.target.value)}
                  className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[#070A10]/90 border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
                />
              </div>
            )}

            {role === 'LAB' && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Dental Lab Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Precision Dental Lab"
                    value={form.labName || ''}
                    onChange={(e) => set('labName', e.target.value)}
                    className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[#070A10]/90 border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
                  />
                </div>

                {/* Lab Specialties Checkbox Choices (Materials Removed) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Lab Specialties (Select All That Apply)
                    </label>
                    <span className="text-[10px] font-mono text-[var(--accent-light)]">
                      {selectedSpecialties.length} Selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-xl border border-[rgba(42,127,255,0.2)] bg-[#070A10]/60 p-3">
                    {LAB_SPECIALTY_CHOICES.map((spec) => {
                      const isChecked = selectedSpecialties.includes(spec);
                      return (
                        <label
                          key={spec}
                          onClick={() => toggleSpecialty(spec)}
                          className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition text-xs font-semibold select-none ${
                            isChecked
                              ? 'bg-[var(--accent-dim)] text-[var(--accent-light)] border border-[rgba(42,127,255,0.35)]'
                              : 'text-[var(--text-muted)] hover:bg-[#123B6B]/30 hover:text-white border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="h-4 w-4 rounded border-[#123B6B] bg-[#070A10] text-[var(--accent)] focus:ring-0 cursor-pointer accent-[var(--accent)]"
                          />
                          <span>{spec}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Typical Turnaround Time (Business Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 3"
                    value={form.turnaroundDays || ''}
                    onChange={(e) => set('turnaroundDays', e.target.value)}
                    className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[#070A10]/90 border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
                  />
                </div>
              </>
            )}

            {role === 'SHIPPING' && (
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Logistics Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Swift Dental Express"
                  value={form.companyName || ''}
                  onChange={(e) => set('companyName', e.target.value)}
                  className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[#070A10]/90 border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
                />
              </div>
            )}

            {/* Address & Google Maps Location */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Physical Street Address
              </label>
              <input
                type="text"
                placeholder="e.g. 450 Lexington Ave, Suite 1200, New York, NY"
                value={form.address || ''}
                onChange={(e) => set('address', e.target.value)}
                className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[#070A10]/90 border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
              />
            </div>

            {/* Google Maps Exact Location Link / Coordinates */}
            {(role === 'DENTIST' || role === 'LAB') && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    📍 Google Maps Exact Location (Link or Coordinates)
                  </label>
                  {form.address && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-[var(--accent-light)] hover:underline flex items-center gap-1"
                    >
                      Find on Google Maps ↗
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="https://maps.google.com/?q=... or https://maps.app.goo.gl/..."
                  value={form.mapsUrl || ''}
                  onChange={(e) => set('mapsUrl', e.target.value)}
                  className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[#070A10]/90 border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)] font-mono text-xs"
                />
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                  Paste your clinic or lab Google Maps link to allow automatic courier navigation and dental partner discovery.
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/50 p-3.5 text-xs font-bold text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-accent flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-[#070A10] shadow-md disabled:opacity-50"
            >
              {busy ? 'Creating account & setting up…' : 'Register & Enter Platform'}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="mt-6 text-center text-xs font-medium text-[var(--text-muted)]">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[var(--accent-light)] hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </main>
  );
}
