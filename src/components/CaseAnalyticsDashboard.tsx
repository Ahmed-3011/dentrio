'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/components/LanguageProvider';

interface AnalyticsData {
  period: string;
  summary: {
    totalCases: number;
    inProduction: number;
    readyOrShipped: number;
    closed: number;
    activeCases: number;
  };
  doctorBreakdown: Array<{
    doctorId: number;
    doctorName: string;
    clinicName: string;
    totalCases: number;
    activeCases: number;
    completedCases: number;
    percentage: number;
  }>;
  materialBreakdown: Array<{
    material: string;
    count: number;
    percentage: number;
  }>;
  shadeBreakdown: Array<{
    shade: string;
    count: number;
    percentage: number;
  }>;
  doctorList: Array<{
    id: number;
    name: string;
    clinicName: string;
  }>;
}

export default function CaseAnalyticsDashboard() {
  const { lang } = useLanguage();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'last_month' | 'year' | 'all' | 'custom'>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const isAr = lang === 'ar';

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('period', period);
      if (selectedDoctorId && selectedDoctorId !== 'all') {
        params.set('doctorId', selectedDoctorId);
      }
      if (period === 'custom' && startDate) {
        params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
      }

      const res = await fetch(`/api/analytics?${params.toString()}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [period, selectedDoctorId, startDate, endDate]);

  useEffect(() => {
    (async () => {
      await fetchAnalytics();
    })();
  }, [fetchAnalytics]);

  return (
    <section className="dentrio-card mt-8 rounded-2xl p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h2 className="text-lg font-bold text-white">
              {isAr ? 'نظام إحصائيات وعداد الحالات حسب الوقت والطبيب' : 'Case Volume & Doctor Analytics'}
            </h2>
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {isAr
              ? 'تتبع وتصنيف عدد الحالات المنجزة والجارية بحسب الفترات الزمنية وكل طبيب وعيادة'
              : 'Track case volume, production rate, materials, and doctor breakdown across time periods'}
          </p>
        </div>

        {/* Doctor Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[var(--text-muted)] whitespace-nowrap">
            {isAr ? 'تصفية حسب الطبيب:' : 'Filter Doctor:'}
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="dentrio-input rounded-xl px-3 py-1.5 text-xs font-semibold bg-[#070A10]"
          >
            <option value="all">{isAr ? 'جميع الأطباء والعيادات' : 'All Doctors & Clinics'}</option>
            {data?.doctorList?.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.clinicName ? `${d.name} (${d.clinicName})` : d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Time Period Filter Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[#070A10]/60 p-1">
          {[
            { id: 'today', labelEn: 'Today', labelAr: 'اليوم' },
            { id: 'week', labelEn: 'This Week', labelAr: 'هذا الأسبوع' },
            { id: 'month', labelEn: 'Last 30 Days', labelAr: 'آخر 30 يوماً' },
            { id: 'last_month', labelEn: 'Last Month', labelAr: 'الشهر الماضي' },
            { id: 'year', labelEn: 'This Year', labelAr: 'هذا العام' },
            { id: 'all', labelEn: 'All Time', labelAr: 'كل الأوقات' },
            { id: 'custom', labelEn: 'Custom Range', labelAr: 'مخصص 📅' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPeriod(tab.id as typeof period)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                period === tab.id
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Custom Date Range Inputs */}
        {period === 'custom' && (
          <div className="flex items-center gap-2 animate-in fade-in duration-150">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="dentrio-input rounded-xl px-2.5 py-1 text-xs"
            />
            <span className="text-xs text-[var(--text-muted)]">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="dentrio-input rounded-xl px-2.5 py-1 text-xs"
            />
          </div>
        )}
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Cases */}
        <div className="rounded-2xl border border-[rgba(42,127,255,0.25)] bg-[var(--bg-elevated)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {isAr ? 'إجمالي الحالات' : 'Total Cases'}
            </span>
            <span className="text-base">📈</span>
          </div>
          <p className="mt-2 text-3xl font-black text-white font-mono">
            {loading ? '…' : data?.summary.totalCases ?? 0}
          </p>
        </div>

        {/* In Production */}
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              {isAr ? 'في الخراطة والإنتاج' : 'In Production'}
            </span>
            <span className="text-base">⚙️</span>
          </div>
          <p className="mt-2 text-3xl font-black text-indigo-300 font-mono">
            {loading ? '…' : data?.summary.inProduction ?? 0}
          </p>
        </div>

        {/* Ready & Shipped */}
        <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
              {isAr ? 'جاهزة والشحن' : 'Ready / Shipped'}
            </span>
            <span className="text-base">📦</span>
          </div>
          <p className="mt-2 text-3xl font-black text-sky-300 font-mono">
            {loading ? '…' : data?.summary.readyOrShipped ?? 0}
          </p>
        </div>

        {/* Closed */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              {isAr ? 'مكتملة ومغلقة' : 'Delivered & Closed'}
            </span>
            <span className="text-base">✓</span>
          </div>
          <p className="mt-2 text-3xl font-black text-emerald-300 font-mono">
            {loading ? '…' : data?.summary.closed ?? 0}
          </p>
        </div>
      </div>

      {/* Grid: Doctor Breakdown & Material/Shade Distribution */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Doctor Case Volume Leaderboard */}
        <div className="rounded-2xl border border-[var(--border)] bg-[#070A10]/70 p-4">
          <div className="flex items-center justify-between mb-3 border-b border-[var(--border)] pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <span>🦷</span>
              <span>{isAr ? 'توزيع وعدد الحالات لكل طبيب وعيادة' : 'Case Volume by Doctor & Clinic'}</span>
            </h3>
            <span className="text-[10px] font-mono text-[var(--accent-light)] font-bold">
              {data?.doctorBreakdown?.length || 0} {isAr ? 'أطباء' : 'Doctors'}
            </span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {!data?.doctorBreakdown || data.doctorBreakdown.length === 0 ? (
              <p className="py-8 text-center text-xs text-[var(--text-muted)]">
                {isAr ? 'لا توجد بيانات لهذه الفترة.' : 'No doctor records for this period.'}
              </p>
            ) : (
              data.doctorBreakdown.map((doc) => (
                <div
                  key={doc.doctorId}
                  onClick={() => setSelectedDoctorId(String(doc.doctorId))}
                  className={`rounded-xl border p-3 cursor-pointer transition ${
                    selectedDoctorId === String(doc.doctorId)
                      ? 'border-[var(--accent)] bg-[var(--accent-dim)]'
                      : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)]/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div>
                      <span className="font-bold text-white block">{doc.doctorName}</span>
                      <span className="text-[11px] text-[var(--text-muted)]">{doc.clinicName}</span>
                    </div>

                    <div className="text-end">
                      <span className="text-sm font-black text-[var(--accent-light)] font-mono">
                        {doc.totalCases} {isAr ? 'حالات' : 'Cases'}
                      </span>
                      <span className="text-[10px] block opacity-75 text-[var(--text-muted)] font-mono">
                        {doc.activeCases} {isAr ? 'جارية' : 'Active'} · {doc.completedCases} {isAr ? 'مكتملة' : 'Done'}
                      </span>
                    </div>
                  </div>

                  {/* Volume Distribution Bar */}
                  <div className="h-1.5 w-full rounded-full bg-[var(--border)] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--accent)] to-emerald-400"
                      style={{ width: `${doc.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Materials & VITA Shade Statistics */}
        <div className="space-y-4">
          {/* Material Stats */}
          <div className="rounded-2xl border border-[var(--border)] bg-[#070A10]/70 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2.5 flex items-center gap-1.5">
              <span>✨</span>
              <span>{isAr ? 'أكثر الخامات طلباً في الفترة' : 'Top Prescribed Lab Materials'}</span>
            </h3>

            <div className="space-y-2">
              {!data?.materialBreakdown || data.materialBreakdown.length === 0 ? (
                <p className="py-4 text-center text-xs text-[var(--text-muted)]">
                  {isAr ? 'لا توجد خامات مسجلة.' : 'No materials recorded.'}
                </p>
              ) : (
                data.materialBreakdown.map((mat, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="truncate max-w-[240px] text-white/90 font-medium">
                      {mat.material}
                    </span>
                    <div className="flex items-center gap-2 shrink-0 font-mono">
                      <span className="font-bold text-[var(--accent-light)]">{mat.count}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">({mat.percentage}%)</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* VITA Shade Stats */}
          <div className="rounded-2xl border border-[var(--border)] bg-[#070A10]/70 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2.5 flex items-center gap-1.5">
              <span>🦷</span>
              <span>{isAr ? 'أكثر درجات ألوان VITA استخداماً' : 'Most Popular VITA Shades'}</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {!data?.shadeBreakdown || data.shadeBreakdown.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)]">{isAr ? 'لا توجد درجات ألوان مسجلة.' : 'No shades recorded.'}</p>
              ) : (
                data.shadeBreakdown.map((sh, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-bold text-white shadow-sm"
                  >
                    <span>🦷 {sh.shade}</span>
                    <span className="rounded-md bg-[var(--accent-dim)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--accent-light)]">
                      {sh.count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
