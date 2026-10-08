'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import CaseAnalyticsDashboard from '@/components/CaseAnalyticsDashboard';
import type { AnyCase, ApiMe } from '@/lib/types';
import { useLanguage } from '@/components/LanguageProvider';

const STATUS_COLOR: Record<string, string> = {
  SUBMITTED: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  REVIEW: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  DESIGN: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  PRODUCTION: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  READY: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  SHIPPED: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  CLOSED: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
};

export default function DashboardPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [user, setUser] = useState<ApiMe | null>(null);
  const [cases, setCases] = useState<AnyCase[]>([]);
  const [loading, setLoading] = useState(true);

  const isAr = lang === 'ar';

  useEffect(() => {
    (async () => {
      const [meRes, casesRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/cases/list'),
      ]);
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.needsOnboarding) {
          router.replace('/onboarding');
          return;
        }
        setUser(meData);
      }
      if (casesRes.ok) setCases(await casesRes.json());
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <NavBar role="" name="" />
        <main className="mx-auto max-w-6xl p-8 text-sm font-semibold text-[var(--text-muted)]">
          {isAr ? 'جارٍ تحميل لوحة التحكم...' : 'Loading dashboard data…'}
        </main>
      </div>
    );
  }

  const isDentist = user?.user?.role === 'DENTIST';
  const isLab = user?.user?.role === 'LAB';
  const isShipping = user?.user?.role === 'SHIPPING';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
      <NavBar role={user?.user?.role} name={user?.user?.name} />
      
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">
              {isAr
                ? `مرحباً بك مجدداً${user?.user?.name ? `، ${user.user.name.split(' ')[0]}` : ''}`
                : `Welcome back${user?.user?.name ? `, ${user.user.name.split(' ')[0]}` : ''}`}
            </h1>
            <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
              {isDentist && (isAr ? 'أرسل المسحات ثلاثية الأبعاد للمعامل، عاين تصاميم الـ CAD، وتابع مراحل التنفيذ.' : 'Send 3D scans to dental labs, preview CAD designs, and track order stages.')}
              {isLab && (isAr ? 'أدر الوصفات الرقمية الواردة، صمم النماذج ثلاثية الأبعاد، ووجه الحالات للإنتاج.' : 'Manage incoming digital prescriptions, design CAD models, and hand off to production.')}
              {isShipping && (isAr ? 'استلم الطرود، أدر أرقام التتبع، وأكمل لوجستيات التوصيل للحالات الجاهزة.' : 'Pickup, track, and complete shipping logistics for finalized cases.')}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isDentist && (
              <Link
                href="/cases/new"
                className="btn-accent inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-md text-white"
              >
                <span>+</span> {isAr ? 'إنشاء حالة جديدة' : 'Create New Case'}
              </Link>
            )}
            {isLab && (
              <Link
                href="/milling"
                className="btn-accent inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-md text-white"
              >
                <span>⚙️</span> {isAr ? 'لوحة الخراطة والإنتاج' : 'Milling Dashboard'}
              </Link>
            )}
            {isShipping && (
              <Link
                href="/shipping"
                className="btn-accent inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-md text-white"
              >
                {isAr ? 'قائمة الشحن' : 'Open Shipping Queue'}
              </Link>
            )}
          </div>
        </div>

        {/* Top Metric Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="dentrio-card rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {isAr ? 'إجمالي الحالات' : 'Total Case Volume'}
            </p>
            <p className="mt-2 text-4xl font-black text-[var(--text)]">{user?.caseCount ?? 0}</p>
          </div>
          <div className="dentrio-card rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {isAr ? 'الحالات الجارية' : 'Active Pipeline'}
            </p>
            <p className="mt-2 text-4xl font-black text-[var(--accent)]">{user?.activeCount ?? 0}</p>
          </div>
          <div className="dentrio-card rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {isAr ? 'نوع الحساب والصلاحية' : 'Your Role & Privilege'}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xl font-extrabold text-[var(--text)]">
                {user?.user?.role === 'DENTIST'
                  ? (isAr ? 'طبيب أسنان' : 'Dentist')
                  : user?.user?.role === 'LAB'
                  ? (isAr ? 'معمل أسنان' : 'Dental Lab')
                  : (isAr ? 'شحن ولوجستيات' : 'Shipping')}
              </span>
              <span className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-0.5 text-xs font-bold text-[var(--accent)]">
                {user?.user?.privilege || 'normal'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        {user?.profile && (
          <div className="dentrio-card mt-6 rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {isAr ? 'بيانات الحساب والمنشأة' : 'Organization & Profile Details'}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 text-sm font-semibold sm:grid-cols-2 lg:grid-cols-3">
              {isDentist && (
                <>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                    <span className="text-xs text-[var(--text-muted)]">{isAr ? 'اسم العيادة:' : 'Clinic Name:'}</span>
                    <p className="text-sm font-bold text-[var(--text)]">{user.profile.clinic_name || '—'}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                    <span className="text-xs text-[var(--text-muted)]">{isAr ? 'المعمل المفضل:' : 'Preferred Lab:'}</span>
                    <p className="text-sm font-bold text-[var(--accent)]">{user.profile.preferredLabName || (isAr ? 'لم يحدد' : 'None Selected')}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                    <span className="text-xs text-[var(--text-muted)]">{isAr ? 'هاتف التواصل:' : 'Contact Phone:'}</span>
                    <p className="text-sm font-bold text-[var(--text)] font-mono">{user.user.phone || '—'}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3 sm:col-span-2">
                    <span className="text-xs text-[var(--text-muted)]">{isAr ? 'العنوان والموقع:' : 'Address & Location:'}</span>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-sm font-bold text-[var(--text)]">{user.profile.address || '—'}</p>
                      {user.profile.maps_url ? (
                        <a
                          href={user.profile.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                        >
                          📍 {isAr ? 'عرض في خرائط Google ↗' : 'View on Google Maps ↗'}
                        </a>
                      ) : user.profile.address ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(user.profile.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                        >
                          📍 {isAr ? 'عرض في خرائط Google ↗' : 'View on Google Maps ↗'}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </>
              )}
              {isLab && (
                <>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                    <span className="text-xs text-[var(--text-muted)]">{isAr ? 'اسم المعمل:' : 'Lab Name:'}</span>
                    <p className="text-sm font-bold text-[var(--text)]">{user.profile.lab_name || '—'}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                    <span className="text-xs text-[var(--text-muted)]">{isAr ? 'مدة التنفيذ المعتادة:' : 'Turnaround Time:'}</span>
                    <p className="text-sm font-bold text-[var(--accent)]">{user.profile.turnaround_days || 3} {isAr ? 'أيام عمل' : 'Business Days'}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                    <span className="text-xs text-[var(--text-muted)]">{isAr ? 'هاتف التواصل:' : 'Contact Phone:'}</span>
                    <p className="text-sm font-bold text-[var(--text)] font-mono">{user.user.phone || '—'}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3 sm:col-span-2">
                    <span className="text-xs text-[var(--text-muted)]">{isAr ? 'تخصصات المعمل:' : 'Specialties:'}</span>
                    <p className="text-sm font-bold text-[var(--text)]">{user.profile.specialties || '—'}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3 sm:col-span-3">
                    <span className="text-xs text-[var(--text-muted)]">{isAr ? 'مقر المعمل والعنوان:' : 'Lab Facility Address & Location:'}</span>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-sm font-bold text-[var(--text)]">{user.profile.address || '—'}</p>
                      {user.profile.maps_url ? (
                        <a
                          href={user.profile.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                        >
                          📍 {isAr ? 'عرض في خرائط Google ↗' : 'View on Google Maps ↗'}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 📊 Case Counting & Doctor Analytics Section (Per Time Period & Doctor) */}
        {!isShipping && <CaseAnalyticsDashboard />}

        {/* Recent Cases Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold tracking-tight text-[var(--text)]">
              {isAr ? 'أحدث طلبات الحالات' : 'Recent Case Orders'}
            </h2>
            <Link href="/cases" className="text-xs font-bold text-[var(--accent)] hover:underline">
              {isAr ? 'عرض كل الحالات ←' : 'View All Cases →'}
            </Link>
          </div>

          {cases.length === 0 ? (
            <div className="dentrio-card mt-4 rounded-2xl border-dashed p-10 text-center text-sm font-semibold text-[var(--text-muted)]">
              {isDentist && (isAr ? 'لا توجد حالات مسجلة حتى الآن.' : 'No cases submitted yet. Create your first case to upload an STL scan.')}
              {isLab && (isAr ? 'لا توجد حالات مسندة حتى الآن.' : 'No cases assigned yet. Cases sent to your lab will appear here.')}
              {isShipping && (isAr ? 'لا توجد شحنات جاهزة للاستلام حالياً.' : 'No packages currently awaiting pickup.')}
            </div>
          ) : (
            <div className="dentrio-card mt-4 overflow-hidden rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[var(--border)] bg-[var(--bg-elevated)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <tr>
                      <th className="px-5 py-3.5">{isAr ? 'كود الحالة' : 'Case Code'}</th>
                      <th className="px-5 py-3.5">{isDentist ? (isAr ? 'المعمل المعين' : 'Assigned Lab') : isLab ? (isAr ? 'العيادة / الطبيب' : 'Doctor / Clinic') : (isAr ? 'المصدر' : 'Source')}</th>
                      <th className="px-5 py-3.5">{isAr ? 'مرحلة الحالة' : 'Status Pipeline'}</th>
                      <th className="px-5 py-3.5">{isAr ? 'تاريخ الإرسال' : 'Submission Date'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {cases.slice(0, 8).map((c) => (
                      <tr key={c.id} className="transition hover:bg-[var(--bg-elevated)]/50">
                        <td className="px-5 py-4 font-mono font-bold">
                          <Link href={`/cases/${c.id}`} className="text-[var(--accent)] hover:underline">
                            {c.code}
                          </Link>
                        </td>
                        <td className="px-5 py-4 font-medium text-[var(--text)]">{c.counterpart || '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold ${STATUS_COLOR[c.status] || 'bg-slate-500/10 text-slate-400'}`}>
                            {c.statusLabel}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-medium text-[var(--text-muted)]">
                          {new Date(c.createdAt + 'Z').toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
