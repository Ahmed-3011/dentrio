'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';

type WorkflowRole = 'DENTIST' | 'LAB';

const DENTIST_SPECIALTIES_EN = [
  'General Dentistry',
  'Prosthodontics & Restorative',
  'Orthodontics & Aligners',
  'Implantology & Oral Surgery',
  'Cosmetic & Esthetic Dentistry',
  'Endodontics',
  'Pediatric Dentistry',
  'Periodontics',
];

const DENTIST_SPECIALTIES_AR = [
  'طب الأسنان العام',
  'الاستعاضة والتركيبات السنية',
  'تقويم الأسنان والشفاف',
  'زراعة الأسنان وجراحة الفم',
  'طب الأسنان التجميلي وعدسات الابتسامة',
  'علاج جذور وعصب الأسنان',
  'طب أسنان الأطفال',
  'أمراض وجراحة اللثة',
];

const LAB_SPECIALTY_CHOICES_EN = [
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

const LAB_SPECIALTY_CHOICES_AR = [
  'التيجان والجسور الثابتة',
  'الزيركون والخزف التجميلي',
  'التقويم الشفاف (Clear Aligners)',
  'عدسات الأسنان والفينير (Veneers)',
  'الأطقم المتحركة والكاملة',
  'زراعة الأسنان والجسور المخصصة',
  'حشوات الإنلاي والأونلاي الخزفية',
  'أجهزة وأقواس التقويم',
  'واقيات الأسنان الليلية (Nightguards)',
  'الاستعاضات الوجهية والفكية المتقدمة',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState<WorkflowRole | null>(null);

  // Form fields
  const [orgName, setOrgName] = useState('');
  const [clinicalSpecialty, setClinicalSpecialty] = useState(
    lang === 'ar' ? DENTIST_SPECIALTIES_AR[0] : DENTIST_SPECIALTIES_EN[0]
  );
  const [selectedLabSpecs, setSelectedLabSpecs] = useState<string[]>([]);
  const [turnaroundDays, setTurnaroundDays] = useState('3');
  const [address, setAddress] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.replace('/login');
          return;
        }
        const data = await res.json();
        if (data.user) {
          setUserName(data.user.name || '');
          // If already onboarded, send directly to dashboard
          if (!data.needsOnboarding && data.profile) {
            router.replace('/dashboard');
            return;
          }
        }
      } catch {
        router.replace('/login');
      } finally {
        setCheckingAuth(false);
      }
    }
    checkUser();
  }, [router]);

  function toggleLabSpec(spec: string) {
    setSelectedLabSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) {
      setError(
        lang === 'ar'
          ? 'يرجى اختيار ما إذا كنت عيادة أسنان أو معمل أسنان'
          : 'Please select whether you are a Dentist or a Dental Lab'
      );
      return;
    }

    setBusy(true);
    setError('');

    const payload = {
      role,
      clinicName: role === 'DENTIST' ? orgName.trim() || userName : undefined,
      specialty: role === 'DENTIST' ? clinicalSpecialty : undefined,
      labName: role === 'LAB' ? orgName.trim() || userName : undefined,
      specialties: role === 'LAB' ? selectedLabSpecs : undefined,
      turnaroundDays: role === 'LAB' ? Number(turnaroundDays) || 3 : undefined,
      address: address.trim(),
    };

    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save onboarding details.');
        setBusy(false);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError(
        lang === 'ar'
          ? 'حدث خطأ أثناء حفظ البيانات، يرجى المحاولة مرة أخرى'
          : 'Failed to connect. Please try again.'
      );
      setBusy(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070A10] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            {lang === 'ar' ? 'جارٍ التحقق من الحساب...' : 'Loading workspace setup...'}
          </p>
        </div>
      </div>
    );
  }

  const labChoices = lang === 'ar' ? LAB_SPECIALTY_CHOICES_AR : LAB_SPECIALTY_CHOICES_EN;
  const dentistChoices = lang === 'ar' ? DENTIST_SPECIALTIES_AR : DENTIST_SPECIALTIES_EN;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8 bg-[#070A10] text-[var(--text)]">
      {/* ── High-Performance CSS Radial Glow Mesh (Zero Lag / Pure CSS) ─ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[550px] w-[550px] rounded-full bg-[radial-gradient(circle,_rgba(42,127,255,0.18)_0%,_transparent_70%)]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[550px] w-[550px] rounded-full bg-[radial-gradient(circle,_rgba(18,59,107,0.25)_0%,_transparent_70%)]" />
      </div>
      <div className="grid-overlay" />

      {/* Header Controls */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2.5">
        <button
          onClick={toggleLanguage}
          type="button"
          className="flex h-10 items-center gap-1.5 rounded-xl border border-[rgba(42,127,255,0.25)] bg-[#0E1B2A]/90 px-3 text-xs font-bold text-[var(--text)] shadow-lg transition hover:border-[var(--accent)]"
        >
          <span>{lang === 'en' ? '🇸🇦' : '🇺🇸'}</span>
          <span className="font-mono">{lang === 'en' ? 'العربية' : 'EN'}</span>
        </button>

        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle Theme"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(42,127,255,0.25)] bg-[#0E1B2A]/90 text-[var(--text)] shadow-lg transition hover:border-[var(--accent)]"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-2xl my-8">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--dentist)] to-[var(--lab)] text-xl font-bold text-[#070A10] shadow-lg shadow-[var(--accent-glow)]">
              ◈
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
              {t.brand}<span className="text-[var(--accent)]">.</span>
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl drop-shadow-sm">
            {t.onboardingTitle}
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
            {t.onboardingSubtitle}
          </p>
        </div>

        {/* Main Interactive Questionnaire Card */}
        <div className="rounded-2xl border border-[rgba(42,127,255,0.25)] bg-[#0E1B2A]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Role Determination Question */}
            <div>
              <label className="mb-3 block text-sm font-bold tracking-wide text-white">
                {t.qRoleTitle}
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Dentist Option */}
                <button
                  type="button"
                  onClick={() => setRole('DENTIST')}
                  className={`group relative flex flex-col rounded-2xl border p-5 text-start transition ${
                    role === 'DENTIST'
                      ? 'border-[var(--accent)] bg-[var(--accent-dim)] ring-2 ring-[var(--accent)] shadow-lg shadow-[var(--accent-glow)]'
                      : 'border-[rgba(42,127,255,0.2)] bg-[#070A10]/70 hover:border-[var(--accent)]/60 hover:bg-[#070A10]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(166,240,255,0.15)] text-2xl">
                      🦷
                    </span>
                    <span
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition ${
                        role === 'DENTIST'
                          ? 'border-[var(--accent)] bg-[var(--accent)] text-[#070A10] text-xs font-bold'
                          : 'border-[var(--border)]'
                      }`}
                    >
                      {role === 'DENTIST' ? '✓' : ''}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">
                    {t.qRoleDentistTitle}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
                    {t.qRoleDentistDesc}
                  </p>
                </button>

                {/* Lab Option */}
                <button
                  type="button"
                  onClick={() => setRole('LAB')}
                  className={`group relative flex flex-col rounded-2xl border p-5 text-start transition ${
                    role === 'LAB'
                      ? 'border-[var(--accent)] bg-[var(--accent-dim)] ring-2 ring-[var(--accent)] shadow-lg shadow-[var(--accent-glow)]'
                      : 'border-[rgba(42,127,255,0.2)] bg-[#070A10]/70 hover:border-[var(--accent)]/60 hover:bg-[#070A10]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(42,127,255,0.18)] text-2xl">
                      🔬
                    </span>
                    <span
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition ${
                        role === 'LAB'
                          ? 'border-[var(--accent)] bg-[var(--accent)] text-[#070A10] text-xs font-bold'
                          : 'border-[var(--border)]'
                      }`}
                    >
                      {role === 'LAB' ? '✓' : ''}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">
                    {t.qRoleLabTitle}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
                    {t.qRoleLabDesc}
                  </p>
                </button>
              </div>
            </div>

            {/* Step 2: Tailored Follow-up Questions based on Role */}
            {role && (
              <div className="space-y-4 pt-4 border-t border-[rgba(42,127,255,0.2)] animate-in fade-in duration-300">
                {/* Practice / Lab Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {role === 'DENTIST' ? t.clinicNameLabel : t.labNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      role === 'DENTIST'
                        ? lang === 'ar'
                          ? 'مثال: مجمع الابتسامة المتقدمة لطب الأسنان'
                          : 'e.g. Apex Precision Dental Practice'
                        : lang === 'ar'
                          ? 'مثال: معمل الأفق لتركيبات وزراعة الأسنان'
                          : 'e.g. Apex Digital Dental Laboratory'
                    }
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[#070A10]/90 border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
                  />
                </div>

                {/* Dentist Specific: Clinical Specialty Focus */}
                {role === 'DENTIST' && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {t.qClinicalSpecialtyTitle}
                    </label>
                    <select
                      value={clinicalSpecialty}
                      onChange={(e) => setClinicalSpecialty(e.target.value)}
                      className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold bg-[#070A10]/90 border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
                    >
                      {dentistChoices.map((choice) => (
                        <option key={choice} value={choice} className="bg-[#070A10] text-white">
                          {choice}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Lab Specific: Production Specialties & Turnaround */}
                {role === 'LAB' && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          {t.qSpecialtiesTitle}
                        </label>
                        <span className="text-[10px] font-mono text-[var(--accent-light)]">
                          {selectedLabSpecs.length} {t.selectedBadge}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-xl border border-[rgba(42,127,255,0.2)] bg-[#070A10]/60 p-3">
                        {labChoices.map((spec) => {
                          const isChecked = selectedLabSpecs.includes(spec);
                          return (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => toggleLabSpec(spec)}
                              className={`flex items-center gap-2.5 p-2 rounded-lg text-start transition text-xs font-semibold ${
                                isChecked
                                  ? 'bg-[var(--accent-dim)] text-[var(--accent-light)] border border-[rgba(42,127,255,0.35)]'
                                  : 'text-[var(--text-muted)] hover:bg-[#123B6B]/30 hover:text-white border border-transparent'
                              }`}
                            >
                              <span
                                className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                                  isChecked
                                    ? 'border-[var(--accent)] bg-[var(--accent)] text-[#070A10] text-[10px] font-bold'
                                    : 'border-[var(--border)]'
                                }`}
                              >
                                {isChecked ? '✓' : ''}
                              </span>
                              <span className="flex-1">{spec}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        {t.qTurnaroundTitle}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        placeholder="3"
                        value={turnaroundDays}
                        onChange={(e) => setTurnaroundDays(e.target.value)}
                        className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[#070A10]/90 border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
                      />
                    </div>
                  </>
                )}

                {/* Location / Google Maps */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {t.qAddressTitle}
                  </label>
                  <input
                    type="text"
                    placeholder={t.qAddressPlaceholder}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-[var(--input-placeholder)] bg-[#070A10]/90 border-[rgba(42,127,255,0.2)] focus:border-[var(--accent)]"
                  />
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                    {t.locationHelp}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !role}
              className="btn-accent w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50 disabled:pointer-events-none"
            >
              {busy ? t.savingWorkspace : t.completeSetupBtn}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
