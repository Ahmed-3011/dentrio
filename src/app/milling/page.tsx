'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import type { ApiMe } from '@/lib/types';
import { useLanguage } from '@/components/LanguageProvider';
import { downloadFilesToDirectory } from '@/lib/downloadHelper';

interface MillingCaseItem {
  id: number;
  code: string;
  status: string;
  createdAt: string;
  clinicName: string;
  labName: string;
  toothNumber?: string | null;
  material: string | null;
  shade: string | null;
  dueDate: string | null;
  notes: string | null;
  millingNotes: string | null;
  isCadApproved: boolean;
  cadApprovedAt: string | null;
  stls: Array<{ id: number; path: string; name: string }>;
  constructions: Array<{ id: number; path: string; name: string }>;
  tasks: Record<string, boolean>;
}

const CHECKLIST_KEYS = [
  { key: 'nesting_calculated', labelEn: '1. CAM Nesting & Toolpath Calculated', labelAr: '1. احتساب التموضع ومسار الأدوات (CAM Nesting)' },
  { key: 'milling_completed', labelEn: '2. 5-Axis CNC Milling Completed', labelAr: '2. اكتمال الخراطة على ماكينة 5-Axis' },
  { key: 'green_state_finished', labelEn: '3. Support Pins Removed & Green-State Finished', labelAr: '3. فصل الدعامات والتشطيب الأولي' },
  { key: 'sintering_completed', labelEn: '4. Sintering Furnace Thermal Cycle Finished', labelAr: '4. اكتمال دورة التلبيد في الفرن الحراري' },
  { key: 'glazing_polished', labelEn: '5. Staining, Glazing & Polish Finished', labelAr: '5. التلوين والتزجيج والتلميع النهائي' },
  { key: 'qc_fit_checked', labelEn: '6. Quality Control & Margin Fit Verified on Model', labelAr: '6. فحص الجودة ومطابقة الحواف والإطباق' },
];

export default function MillingPage() {
  const { lang } = useLanguage();
  const [user, setUser] = useState<ApiMe | null>(null);
  const [cases, setCases] = useState<MillingCaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'IN_PROCESS' | 'DONE' | 'ALL'>('IN_PROCESS');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [downloadingCaseId, setDownloadingCaseId] = useState<number | null>(null);
  const [downloadStatusMsg, setDownloadStatusMsg] = useState<string>('');

  // Collapsed/Minimized state for each case (set of case IDs that are expanded)
  const [expandedCaseIds, setExpandedCaseIds] = useState<Set<number>>(new Set());

  const isAr = lang === 'ar';

  async function loadData() {
    try {
      const [meRes, millingRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/milling'),
      ]);
      if (meRes.ok) setUser(await meRes.json());
      if (millingRes.ok) {
        const data: MillingCaseItem[] = await millingRes.json();
        setCases(data);
        // By default, expand cases that are in process
        const initialExpanded = new Set<number>();
        data.forEach((c) => {
          const isDone = CHECKLIST_KEYS.every((k) => !!c.tasks[k.key]);
          if (!isDone) {
            initialExpanded.add(c.id);
          }
        });
        setExpandedCaseIds(initialExpanded);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function toggleExpandCase(caseId: number) {
    setExpandedCaseIds((prev) => {
      const next = new Set(prev);
      if (next.has(caseId)) {
        next.delete(caseId);
      } else {
        next.add(caseId);
      }
      return next;
    });
  }

  function expandAll() {
    setExpandedCaseIds(new Set(cases.map((c) => c.id)));
  }

  function collapseAll() {
    setExpandedCaseIds(new Set());
  }

  async function toggleTask(caseId: number, taskKey: string, currentVal: boolean) {
    const newVal = !currentVal;
    setUpdatingTaskId(`${caseId}-${taskKey}`);

    // Optimistic UI update
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            tasks: { ...c.tasks, [taskKey]: newVal },
          };
        }
        return c;
      })
    );

    try {
      await fetch('/api/milling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_TASK',
          caseId,
          taskKey,
          completed: newVal,
        }),
      });
    } catch {
      loadData();
    } finally {
      setUpdatingTaskId(null);
    }
  }

  async function markReadyForShipping(caseId: number) {
    try {
      const res = await fetch('/api/milling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MARK_READY', caseId }),
      });
      if (res.ok) {
        loadData();
      }
    } catch {
      /* ignore */
    }
  }

  // Download all files directly to user's chosen folder & automatically check "1. CAM Nesting & Toolpath Calculated"
  async function handleDownloadAllFilesToFolder(c: MillingCaseItem) {
    const filesToDownload: Array<{ url: string; name: string }> = [];

    c.stls.forEach((stl) => {
      filesToDownload.push({ url: `/api/files/${stl.path}`, name: `Milled_${stl.name}` });
    });

    c.constructions.forEach((cFile) => {
      filesToDownload.push({ url: `/api/files/${cFile.path}`, name: `Construction_${cFile.name}` });
    });

    if (filesToDownload.length === 0) return;

    setDownloadingCaseId(c.id);
    const success = await downloadFilesToDirectory(filesToDownload, (msg) => setDownloadStatusMsg(msg));
    setDownloadingCaseId(null);
    setDownloadStatusMsg('');

    // Automatically check task 1 (Nesting & Toolpath calculated) upon successful download
    if (success && !c.tasks['nesting_calculated']) {
      await toggleTask(c.id, 'nesting_calculated', false);
    }
  }

  const inProcessCount = useMemo(() => {
    return cases.filter((c) => {
      const allTasksDone = CHECKLIST_KEYS.every((k) => !!c.tasks[k.key]);
      return !allTasksDone;
    }).length;
  }, [cases]);

  const doneCount = useMemo(() => {
    return cases.filter((c) => {
      const allTasksDone = CHECKLIST_KEYS.every((k) => !!c.tasks[k.key]);
      return allTasksDone;
    }).length;
  }, [cases]);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.clinicName.toLowerCase().includes(search.toLowerCase()) ||
        (c.material && c.material.toLowerCase().includes(search.toLowerCase())) ||
        (c.shade && c.shade.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      const isDone = CHECKLIST_KEYS.every((k) => !!c.tasks[k.key]);

      if (filterTab === 'IN_PROCESS') return !isDone;
      if (filterTab === 'DONE') return isDone;
      return true;
    });
  }, [cases, search, filterTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <NavBar role="" name="" />
        <main className="mx-auto max-w-6xl p-8 text-sm font-semibold text-[var(--text-muted)]">
          {isAr ? 'جارٍ تحميل لوحة تحكم الخراطة والتصنيع...' : 'Loading Milling & Production Dashboard…'}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
      <NavBar role={user?.user?.role} name={user?.user?.name} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">⚙️</span>
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">
                {isAr ? 'لوحة تحكم الخراطة والإنتاج (CAM)' : 'Milling & CAM Production'}
              </h1>
            </div>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {isAr
                ? 'متابعة وتنزيل ملفات الـ STL والخامات وألوان VITA وقائمة مهام التصنيع وضبط الجودة لكل حالة'
                : 'Follow up on case materials, VITA shades, CAM files & manufacturing quality checklist'}
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-center shadow-sm">
              <span className="text-xs font-bold text-[var(--text-muted)] block uppercase tracking-wider">
                {isAr ? 'قيد التنفيذ' : 'In Process'}
              </span>
              <span className="text-lg font-black text-indigo-400">
                {inProcessCount}
              </span>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-center shadow-sm">
              <span className="text-xs font-bold text-[var(--text-muted)] block uppercase tracking-wider">
                {isAr ? 'مكتملة' : 'Done'}
              </span>
              <span className="text-lg font-black text-emerald-400">
                {doneCount}
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Small Navigation Tabs Toolbar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[260px] flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'ابحث بكود الحالة، العيادة، الخامة، أو اللون VITA…' : 'Search by code, clinic, material, or VITA shade…'}
              className="dentrio-input w-full rounded-xl px-4 py-2 text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Small Separation Tabs: In Process / Done / All */}
            <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-1">
              <button
                type="button"
                onClick={() => setFilterTab('IN_PROCESS')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                  filterTab === 'IN_PROCESS'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                <span>⏳</span>
                <span>{isAr ? 'قيد التنفيذ' : 'In Process'}</span>
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-mono">
                  {inProcessCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('DONE')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                  filterTab === 'DONE'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                <span>✓</span>
                <span>{isAr ? 'مكتمل' : 'Done'}</span>
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-mono">
                  {doneCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('ALL')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  filterTab === 'ALL'
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                {isAr ? 'الكل' : 'All'} ({cases.length})
              </button>
            </div>

            {/* Bulk Expand / Collapse Buttons */}
            <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-1">
              <button
                type="button"
                onClick={expandAll}
                className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-elevated)] transition"
                title={isAr ? 'توسيع كل الحالات' : 'Expand All Cases'}
              >
                {isAr ? 'توسيع الكل' : 'Expand All'}
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-elevated)] transition"
                title={isAr ? 'تصغير كل الحالات' : 'Collapse All Cases'}
              >
                {isAr ? 'تصغير الكل' : 'Collapse All'}
              </button>
            </div>
          </div>
        </div>

        {/* Global Download Progress Toast */}
        {downloadStatusMsg && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-sky-500/30 bg-sky-950/40 p-3 text-xs font-bold text-sky-300 animate-in fade-in">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
            <span>{downloadStatusMsg}</span>
          </div>
        )}

        {/* Case List with Accordion (Minimized / Restored) & Color Progress Indicators */}
        <div className="mt-6 space-y-4">
          {filteredCases.length === 0 ? (
            <div className="dentrio-card rounded-2xl p-12 text-center">
              <span className="text-4xl block mb-2">⚙️</span>
              <p className="text-sm font-bold text-[var(--text)]">
                {isAr ? 'لا توجد حالات في هذا القسم حالياً.' : 'No milling cases in this section.'}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {isAr
                  ? 'ستظهر الحالات هنا فور اعتماد الطبيب للتصميم أو إصدار أمر الخراطة.'
                  : 'Cases will appear here once the doctor authorizes the design or when a CAM milling package is dispatched.'}
              </p>
            </div>
          ) : (
            filteredCases.map((c) => {
              const completedTasksCount = CHECKLIST_KEYS.filter((k) => c.tasks[k.key]).length;
              const totalTasksCount = CHECKLIST_KEYS.length;
              const percent = Math.round((completedTasksCount / totalTasksCount) * 100);
              const isAllTasksDone = completedTasksCount === totalTasksCount;
              const isDownloading = downloadingCaseId === c.id;
              const isExpanded = expandedCaseIds.has(c.id);

              // ─── Dynamic Color Progress Indicator Styles ─────────
              let cardProgressBorder = 'border-[var(--border)]';
              let progressBadgeColor = 'bg-slate-500/20 text-slate-300 border-slate-500/30';
              let glowEffect = '';

              if (isAllTasksDone || c.status === 'READY' || c.status === 'SHIPPED') {
                // 100% Completed -> Emerald Green Glow & Indicator
                cardProgressBorder = 'border-emerald-500/60';
                progressBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                glowEffect = 'shadow-[0_0_22px_rgba(16,185,129,0.14)]';
              } else if (completedTasksCount > 0) {
                // 1-5 Tasks (In Progress) -> Vibrant Indigo / Electric Blue Indicator
                cardProgressBorder = 'border-[var(--accent)]';
                progressBadgeColor = 'bg-[var(--accent-dim)] text-[var(--accent-light)] border-[var(--accent)]/40';
                glowEffect = 'shadow-[0_0_20px_rgba(42,127,255,0.12)]';
              }

              return (
                <div
                  key={c.id}
                  className={`dentrio-card relative overflow-hidden rounded-2xl border transition duration-200 ${cardProgressBorder} ${glowEffect}`}
                >
                  {/* Progress Indicator Stripe at Top of Card */}
                  <div className="h-1.5 w-full bg-[var(--border)] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isAllTasksDone
                          ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                          : completedTasksCount > 0
                          ? 'bg-[var(--accent)] shadow-[0_0_10px_#2a7fff]'
                          : 'bg-slate-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Summary Header (Clicking expands / collapses the case card) */}
                  <div className="p-5 flex flex-wrap items-center justify-between gap-3 select-none">
                    {/* Left: Code, Doctor/Clinic, Material, VITA Shade, and Progress */}
                    <div
                      onClick={() => toggleExpandCase(c.id)}
                      className="flex flex-wrap items-center gap-3 cursor-pointer flex-1 min-w-0"
                    >
                      <button
                        type="button"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--accent-light)] hover:text-white"
                        title={isExpanded ? (isAr ? 'تصغير' : 'Minimize') : (isAr ? 'توسيع' : 'Expand')}
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-white font-mono">
                            Case {c.code}
                          </span>
                          <span className="text-xs font-semibold text-[var(--text-muted)] truncate max-w-[160px]">
                            · 🦷 {c.clinicName}
                          </span>
                        </div>

                        {/* Minimized Quick Info Subtitle */}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          {c.toothNumber && (
                            <span className="rounded-md bg-[var(--bg-elevated)] px-2 py-0.5 font-mono text-[11px] font-bold text-white border border-[var(--border)]">
                              🦷 {c.toothNumber}
                            </span>
                          )}
                          {c.material && (
                            <span className="font-semibold text-white/90 truncate max-w-[200px]">
                              ✨ {c.material}
                            </span>
                          )}
                          {c.shade && (
                            <span className="rounded-md bg-[var(--bg-elevated)] px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--accent-light)] border border-[var(--border)]">
                              🦷 {c.shade}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Pill, Progress Badge, Folder Download & Open Case */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      {/* Dynamic Color Progress Pill */}
                      <div
                        onClick={() => toggleExpandCase(c.id)}
                        className={`cursor-pointer rounded-xl border px-3 py-1 text-xs font-bold flex items-center gap-1.5 ${progressBadgeColor}`}
                      >
                        <span>{isAllTasksDone ? '✓' : '⚙️'}</span>
                        <span>
                          {completedTasksCount}/{totalTasksCount} ({percent}%)
                        </span>
                      </div>

                      {/* Direct Folder Download Action */}
                      {(c.stls.length > 0 || c.constructions.length > 0) && (
                        <button
                          type="button"
                          disabled={isDownloading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadAllFilesToFolder(c);
                          }}
                          className="btn-accent rounded-xl px-3.5 py-1.5 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                          title={isAr ? 'تنزيل جميع الملفات مباشرة في مجلد واحتساب التموضع تلقائياً' : 'Save all files directly to selected CAM folder and auto-check nesting'}
                        >
                          <span>{isDownloading ? '⏳' : '📁'}</span>
                          <span>
                            {isDownloading
                              ? isAr
                                ? 'جارٍ الحفظ...'
                                : 'Saving…'
                              : isAr
                              ? 'حفظ في مجلد'
                              : 'Save to Folder'}
                          </span>
                        </button>
                      )}

                      {/* Open Full Case Details Link */}
                      <Link
                        href={`/cases/${c.id}`}
                        className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-white hover:border-[var(--accent)] transition flex items-center gap-1"
                        title={isAr ? 'فتح صفحة الحالة الكاملة' : 'Open Case Details'}
                      >
                        <span>{isAr ? 'تفاصيل' : 'Details'}</span>
                        <span className="text-[10px]">↗</span>
                      </Link>
                    </div>
                  </div>

                  {/* Restored / Expanded Case Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 space-y-4 border-t border-[var(--border)] animate-in fade-in duration-200">
                      {/* Prescription Badges Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                        {/* Tooth Number Badge */}
                        <div className="rounded-xl border border-[rgba(42,127,255,0.2)] bg-[var(--bg-elevated)] p-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                            {isAr ? 'أرقام الأسنان' : 'Tooth Number(s)'}
                          </span>
                          <p className="mt-1 text-xs font-bold text-white font-mono">
                            {c.toothNumber ? `🦷 ${c.toothNumber}` : (isAr ? 'الكل / غير محدد' : 'Full case')}
                          </p>
                        </div>

                        {/* Material Badge */}
                        <div className="rounded-xl border border-[rgba(42,127,255,0.2)] bg-[var(--bg-elevated)] p-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                            {isAr ? 'الخامة المحددة' : 'Lab Material'}
                          </span>
                          <p className="mt-1 text-xs font-bold text-white leading-snug">
                            {c.material ? `✨ ${c.material}` : '—'}
                          </p>
                        </div>

                        {/* VITA Shade Badge */}
                        <div className="rounded-xl border border-[rgba(42,127,255,0.2)] bg-[var(--bg-elevated)] p-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                            {isAr ? 'درجة اللون VITA' : 'VITA Shade'}
                          </span>
                          <p className="mt-1 text-xs font-bold text-white font-mono">
                            {c.shade ? `🦷 ${c.shade}` : '—'}
                          </p>
                        </div>

                        {/* Due Date & Status */}
                        <div className="rounded-xl border border-[rgba(42,127,255,0.2)] bg-[var(--bg-elevated)] p-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                            {isAr ? 'تاريخ التسليم المطلوب' : 'Required Due Date'}
                          </span>
                          <p className="mt-1 text-xs font-bold text-amber-300 font-mono">
                            {c.dueDate ? `📅 ${c.dueDate}` : '—'}
                          </p>
                        </div>
                      </div>

                      {/* CAM Package Files Section (Info & Construction Download Only) */}
                      <div className="pt-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-white block mb-2">
                          {isAr ? 'ملفات حزمة الخراطة (CAM Package):' : 'CAM Milling Package Files:'}
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Milled STL Files Info */}
                          <div className="rounded-xl border border-[rgba(42,127,255,0.25)] bg-[#070A10]/70 p-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                              {isAr ? 'ملفات الـ STL المرفقة للخراطة:' : 'Attached Milled STL Geometry:'}
                            </span>
                            <div className="space-y-1">
                              {c.stls.map((stl, idx) => (
                                <p key={stl.id || idx} className="text-xs font-semibold text-white truncate">
                                  🦷 {stl.name}
                                </p>
                              ))}
                            </div>
                          </div>

                          {/* Construction Info Files Card */}
                          <div className="rounded-xl border border-[rgba(42,127,255,0.25)] bg-[#070A10]/70 p-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                              {isAr ? 'بيانات البناء (Construction Info):' : 'Construction Info Metadata:'}
                            </span>
                            {c.constructions.length > 0 ? (
                              <div className="space-y-1.5">
                                {c.constructions.map((cFile, idx) => (
                                  <div key={cFile.id || idx} className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-white truncate">📋 {cFile.name}</p>
                                    <a
                                      href={`/api/files/${cFile.path}`}
                                      download={cFile.name}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--accent-light)] hover:border-[var(--accent)] shrink-0 transition"
                                    >
                                      ⬇️ {isAr ? 'تحميل' : 'Info'}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-[var(--text-muted)]">
                                {isAr ? 'لا يوجد ملف بناء مرفق' : 'No construction file attached'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Interactive Production Follow-Up To-Do Checklist */}
                      <div className="rounded-xl border border-[rgba(42,127,255,0.25)] bg-[#070A10]/70 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">📋</span>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                              {isAr ? 'قائمة مهام التصنيع ومتابعة الجودة (To-Do Follow-up):' : 'Production Manufacturing & QC Follow-Up Checklist:'}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="w-28 h-2 rounded-full bg-[var(--border)] overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  isAllTasksDone ? 'bg-emerald-400' : 'bg-[var(--accent)]'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-mono font-bold text-[var(--accent-light)]">
                              {completedTasksCount}/{totalTasksCount} ({percent}%)
                            </span>
                          </div>
                        </div>

                        {/* Checklist Items Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {CHECKLIST_KEYS.map((item) => {
                            const isDone = !!c.tasks[item.key];
                            const isUpdating = updatingTaskId === `${c.id}-${item.key}`;

                            return (
                              <button
                                key={item.key}
                                type="button"
                                disabled={isUpdating}
                                onClick={() => toggleTask(c.id, item.key, isDone)}
                                className={`flex items-center gap-2.5 rounded-xl p-2.5 text-start transition text-xs font-semibold ${
                                  isDone
                                    ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                                    : 'bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:border-[var(--accent)]'
                                }`}
                              >
                                <span
                                  className={`flex h-5 w-5 items-center justify-center rounded-lg border text-xs font-bold shrink-0 transition ${
                                    isDone
                                      ? 'border-emerald-500 bg-emerald-500 text-[#070A10]'
                                      : 'border-[var(--border)]'
                                  }`}
                                >
                                  {isDone ? '✓' : ''}
                                </span>
                                <span className={`flex-1 ${isDone ? 'line-through opacity-85' : ''}`}>
                                  {isAr ? item.labelAr : item.labelEn}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Mark Ready Button when all checklist items are done */}
                        {user?.user?.role === 'LAB' && c.status === 'PRODUCTION' && (
                          <div className="mt-4 pt-3 border-t border-[rgba(42,127,255,0.2)] flex justify-end">
                            <button
                              type="button"
                              onClick={() => markReadyForShipping(c.id)}
                              className={`rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-md flex items-center gap-2 ${
                                isAllTasksDone
                                  ? 'btn-accent text-white animate-pulse'
                                  : 'border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-white'
                              }`}
                            >
                              <span>📦</span>
                              <span>
                                {isAr
                                  ? 'اكتمال التصنيع · تأكيد الجاهزية للشحن'
                                  : 'Complete Manufacturing · Mark Ready for Pickup'}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
