'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import ToothChartSelector from '@/components/ToothChartSelector';
import Viewer3D from '@/components/Viewer3D';
import MaterialPicker from '@/components/MaterialPicker';
import DesignParametersPanel, {
  DEFAULT_DESIGN_PARAMS,
  NUM_PARAM_DEFS,
  type DesignParams,
} from '@/components/DesignParametersPanel';
import type { ApiMe } from '@/lib/types';
import { useLanguage } from '@/components/LanguageProvider';

type Lab = {
  id: number;
  labName: string;
  description: string;
  specialties: string;
  materials: string;
  turnaroundDays: number | null;
  address: string;
  isPreferred: boolean;
};

const STEPS = [
  { en: 'Upload', ar: 'رفع الملفات' },
  { en: 'Customization', ar: 'التخصيص' },
  { en: 'Confirm & Send', ar: 'تأكيد وإرسال' },
];

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] py-2 last:border-b-0">
      <span className="shrink-0 text-xs font-semibold text-[var(--text-muted)]">{label}</span>
      <span className="break-words text-right text-xs font-semibold text-[var(--text)]">{value}</span>
    </div>
  );
}

export default function NewCasePage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [user, setUser] = useState<ApiMe | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLab, setSelectedLab] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [prescription, setPrescription] = useState<Record<string, string>>({});
  const [designParams, setDesignParams] = useState<DesignParams>(DEFAULT_DESIGN_PARAMS);
  const [error, setError] = useState('');
  const [stageError, setStageError] = useState('');
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const urlsRef = useRef<Record<string, string>>({});

  const isAr = lang === 'ar';
  const hasTeeth = !!(prescription.toothNumber || '').trim();

  function setP(field: string, value: string) {
    setPrescription((p) => ({ ...p, [field]: value }));
  }

  useEffect(() => {
    (async () => {
      const me = await fetch('/api/auth/me');
      if (me.ok) setUser(await me.json());
      await loadLabs();
    })();
  }, []);

  async function loadLabs(q = '') {
    const url = q ? `/api/labs?q=${encodeURIComponent(q)}` : '/api/labs';
    const res = await fetch(url);
    if (res.ok) setLabs(await res.json());
  }

  useEffect(() => {
    const t = setTimeout(() => loadLabs(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  function handleFileSelect(selected: FileList | null) {
    if (!selected) return;
    const existingNames = new Set(files.map((f) => f.name));
    const filtered = Array.from(selected).filter((f) => !existingNames.has(f.name));
    if (filtered.length === 0) return;
    const made: Record<string, string> = {};
    for (const f of filtered) {
      made[f.name] = URL.createObjectURL(f);
    }
    if (Object.keys(made).length > 0) {
      urlsRef.current = { ...urlsRef.current, ...made };
      setFileUrls((prev) => ({ ...prev, ...made }));
    }
    setActiveFile((prev) => prev ?? filtered[0].name);
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...filtered.filter((f) => !names.has(f.name))];
    });
  }

  function removeFile(index: number) {
    const target = files[index];
    const remaining = files.filter((_, i) => i !== index);
    setFiles(remaining);
    if (target && fileUrls[target.name]) {
      URL.revokeObjectURL(fileUrls[target.name]);
      const rest = { ...urlsRef.current };
      delete rest[target.name];
      urlsRef.current = rest;
      setFileUrls((prev) => {
        const next = { ...prev };
        delete next[target.name];
        return next;
      });
    }
    if (target && activeFile === target.name) {
      const next = remaining[Math.min(index, remaining.length - 1)];
      setActiveFile(next ? next.name : null);
    }
  }

  useEffect(() => {
    const urls = urlsRef;
    return () => {
      Object.values(urls.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function goNext() {
    setStageError('');
    if (stage === 0) {
      if (files.length === 0) {
        setStageError(
          isAr
            ? 'يرجى رفع ملف مسح ثلاثي الأبعاد واحد على الأقل (.stl أو .ply).'
            : 'Please upload at least one 3D scan file (.stl or .ply) before continuing.'
        );
        return;
      }
      setStage(1);
      return;
    }
    if (stage === 1) {
      if (!hasTeeth) {
        setStageError(
          isAr
            ? 'يرجى اختيار سن واحد على الأقل من مخطط الأسنان قبل المتابعة.'
            : 'Please select at least one tooth on the chart before continuing.'
        );
        return;
      }
      setStage(2);
    }
  }

  function goBack() {
    setStageError('');
    setStage((s) => Math.max(0, s - 1));
  }

  function goToStage(i: number) {
    if (i < stage) {
      setStageError('');
      setStage(i);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLab) {
      return setError(isAr ? 'يرجى اختيار معمل الأسنان.' : 'Please select a dental lab.');
    }
    if (files.length === 0) {
      return setError(
        isAr
          ? 'يرجى رفع ملف مسح ثلاثي الأبعاد واحد على الأقل (.stl أو .ply).'
          : 'Please upload at least one 3D scan file (.stl or .ply).'
      );
    }
    setError('');
    setBusy(true);

    const fd = new FormData();
    fd.set('labUserId', String(selectedLab));
    files.forEach((f) => {
      fd.append('scans', f);
    });
    fd.set('toothNumber', prescription.toothNumber || '');
    fd.set('material', prescription.material || '');
    fd.set('shade', prescription.shade || '');
    fd.set('dueDate', prescription.dueDate || '');
    fd.set('notes', prescription.notes || '');
    fd.set('designParams', JSON.stringify(designParams));

    try {
      const res = await fetch('/api/cases', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isAr ? 'فشل إرسال الحالة' : 'Failed to create case'));
        setBusy(false);
        return;
      }
      router.push(`/cases/${data.caseId}`);
    } catch {
      setError(isAr ? 'حدث خطأ في الاتصال بالخادم' : 'Network error submitting case');
      setBusy(false);
    }
  }

  const stageErrorBox = stageError ? (
    <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs font-bold text-red-400">
      {stageError}
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <NavBar role={user?.user?.role} name={user?.user?.name} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">
            {isAr ? 'إنشاء حالة أسنان جديدة' : 'New Dental Case'}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {isAr
              ? 'ارفع ملفات المسح، خصص التصميم مع اختيار الأسنان، ثم أكمل التأكيد والإرسال للمعمل.'
              : 'Upload the scan files, customize the design with your tooth selection, then confirm and send to the lab.'}
          </p>
        </div>

        {/* Wizard Stepper */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.en}>
              {i > 0 && <div className="h-px w-5 bg-[var(--border)] sm:w-10" aria-hidden="true" />}
              <button
                type="button"
                onClick={() => goToStage(i)}
                disabled={i >= stage}
                className={
                  'flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition sm:px-4 ' +
                  (i === stage
                    ? 'border-transparent bg-[var(--accent)] text-white shadow-lg'
                    : i < stage
                      ? 'cursor-pointer border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-dim)]'
                      : 'cursor-default border-[var(--border)] text-[var(--text-muted)] opacity-60')
                }
              >
                <span
                  className={
                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold ' +
                    (i === stage
                      ? 'bg-white/25 text-white'
                      : i < stage
                        ? 'bg-[var(--accent-dim)] text-[var(--accent)]'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]')
                  }
                >
                  {i + 1}
                </span>
                {isAr ? s.ar : s.en}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* ── Stage 1: Upload ───────────────────────────────── */}
        {stage === 0 && (
          <div className="space-y-6">
            <section className="dentrio-card rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[var(--text)]">
                  {isAr ? '1. رفع ملفات المسح ثلاثي الأبعاد والصور' : '1. Upload 3D Intraoral Scans & Photos'}
                </h2>
                <span className="text-[11px] font-mono font-bold text-[var(--accent-light)]">
                  {files.length} {isAr ? 'ملفات مختارة' : 'Selected'}
                </span>
              </div>

              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {isAr
                  ? 'يمكنك رفع عدة ملفات معاً (الفك العلوي، الفك السفلي، العضة، صور فوتوغرافية للمريض)'
                  : 'Upload multiple files simultaneously (Upper Jaw, Lower Jaw, Bite registration, Clinical photos)'}
              </p>

              <div className="mt-4 grid gap-5 lg:grid-cols-2">
                <div>
                  <label
                    onDragOver={(e) => {
                      if (!Array.from(e.dataTransfer.types).includes('Files')) return;
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={(e) => {
                      if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
                      setDragOver(false);
                    }}
                    onDrop={(e) => {
                      if (!Array.from(e.dataTransfer.types).includes('Files')) return;
                      e.preventDefault();
                      setDragOver(false);
                      handleFileSelect(e.dataTransfer.files);
                    }}
                    className={
                      'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ' +
                      (dragOver
                        ? 'border-[var(--accent)] bg-[var(--accent-dim)]'
                        : 'border-[rgba(42,127,255,0.3)] bg-[var(--bg-elevated)] hover:border-[var(--accent)] hover:bg-[var(--accent-dim)]')
                    }
                  >
                    <input
                      type="file"
                      multiple
                      accept=".stl,.ply,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => {
                        handleFileSelect(e.target.files);
                        e.target.value = '';
                      }}
                    />
                    <div className="flex flex-col items-center">
                      <span className="text-3xl">🦷📁</span>
                      <p className="mt-2 text-sm font-bold text-[var(--text)]">
                        {isAr ? 'اضغط لاختيار ملفات المسح أو اسحبها وأفلتها هنا' : 'Click or drop multiple STL / PLY / Photo files here'}
                      </p>
                      <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">
                        .STL, .PLY, .PNG, .JPG (Multi-file upload supported)
                      </p>
                    </div>
                  </label>

                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        {isAr ? 'الملفات الجاهزة للإرسال:' : 'Attached Scan Files:'}
                      </span>
                      <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
                        {files.map((f, i) => {
                          const ext = f.name.split('.').pop()?.toLowerCase() || '';
                          const is3D = ['stl', 'ply'].includes(ext);
                          const isActive = f.name === activeFile;
                          const preview = !is3D ? fileUrls[f.name] : undefined;
                          return (
                            <div
                              key={i}
                              onClick={() => setActiveFile(f.name)}
                              className={
                                'flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-xs transition ' +
                                (isActive
                                  ? 'border-[var(--accent)] bg-[var(--accent-dim)] ring-1 ring-[var(--accent)]'
                                  : 'border-[var(--border)] bg-[#070A10]/70 hover:border-[var(--accent)]/50')
                              }
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                {preview ? (
                                  <img
                                    src={preview}
                                    alt=""
                                    className="h-10 w-10 shrink-0 rounded-lg border border-[var(--border)] object-cover"
                                  />
                                ) : (
                                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-lg">
                                    {is3D ? '🦷' : '📄'}
                                  </span>
                                )}
                                <div className="min-w-0">
                                  <span className="block truncate font-semibold text-white">{f.name}</span>
                                  <span className="text-[10px] font-mono opacity-60">
                                    {(f.size / (1024 * 1024)).toFixed(2)} MB
                                    {is3D ? ' · 3D Scan' : ' · ' + ext.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(i);
                                }}
                                className="px-2 py-0.5 font-bold text-red-400 hover:text-red-300"
                                title={isAr ? 'حذف الملف' : 'Remove file'}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {files.length > 1 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {files.map((f) => {
                        const is3D = ['stl', 'ply'].includes(f.name.split('.').pop()?.toLowerCase() || '');
                        const isActive = f.name === activeFile;
                        return (
                          <button
                            key={f.name}
                            type="button"
                            onClick={() => setActiveFile(f.name)}
                            className={
                              'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ' +
                              (isActive
                                ? 'bg-[var(--accent)] text-[#090d16] shadow-sm'
                                : 'border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text)]')
                            }
                          >
                            <span>{is3D ? '🦷' : '📷'}</span>
                            <span className="max-w-[140px] truncate">{f.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                    {activeFile && fileUrls[activeFile] ? (
                      ['stl', 'ply'].includes(activeFile.split('.').pop()?.toLowerCase() || '') ? (
                        <Viewer3D key={activeFile} url={fileUrls[activeFile]} fileName={activeFile} />
                      ) : (
                        <div className="flex h-[420px] items-center justify-center bg-[#131d2e] p-4">
                          <img
                            src={fileUrls[activeFile]}
                            alt={activeFile}
                            className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
                          />
                        </div>
                      )
                    ) : (
                      <div className="flex h-[420px] flex-col items-center justify-center gap-2 bg-[#131d2e] p-6 text-center">
                        <span className="text-3xl">🦷📷</span>
                        <p className="text-xs font-bold text-[var(--text-muted)]">
                          {isAr
                            ? 'ارفع ملفات المسح لعرضها هنا — تظهر الصور فوراً والمجسمات ثلاثية الأبعاد تفاعلية'
                            : 'Upload scan files to preview them here — photos appear instantly, 3D scans open in an interactive viewer'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {stageErrorBox}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={goNext}
                className="btn-accent flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white shadow-lg"
              >
                {isAr ? 'التالي: التخصيص' : 'Next: Customization'} →
              </button>
            </div>
          </div>
        )}

        {/* ── Stage 2: Customization ────────────────────────── */}
        {stage === 1 && (
          <div className="space-y-6">
            <section className="dentrio-card rounded-2xl p-6">
              <h2 className="text-base font-bold text-[var(--text)]">
                {isAr ? '1. اختيار الأسنان وإعدادات التصميم' : '1. Tooth Selection & Design Parameters'}
              </h2>

              <div className="mt-4">
                <ToothChartSelector
                  value={prescription.toothNumber || ''}
                  onChange={(val: string) => setP('toothNumber', val)}
                />
              </div>

              {hasTeeth ? (
                <div className="dt-pref-panel-enter mt-5">
                  <DesignParametersPanel value={designParams} onChange={setDesignParams} />
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-5 text-center">
                  <p className="text-sm font-semibold text-[var(--text)]">
                    {isAr
                      ? 'اختر أسناناً من المخطط لعرض إعدادات تصميم التيجان'
                      : 'Select teeth on the chart to reveal the crown design parameters'}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {isAr
                      ? 'مسافة الإسمنت، زاوية الحافة، السماكة القصوى… إلخ'
                      : 'Cement gap, margin angle, minimal thickness, and more'}
                  </p>
                </div>
              )}
            </section>

            <section className="dentrio-card rounded-2xl p-6 space-y-5">
              <h2 className="text-base font-bold text-[var(--text)]">
                {isAr ? '2. مواصفات الوصفة السريرية' : '2. Prescription Specifications'}
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {isAr ? 'خامة المعمل المطلوبة' : 'Dental Lab Material Classification'}
                  </label>
                  <MaterialPicker
                    value={prescription.material || ''}
                    onChange={(v) => setP('material', v)}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {isAr ? 'دليل الألوان VITA 3D & Classical' : 'VITA 3D-MASTER & Classical Shade Guide'}
                  </label>
                  <select
                    value={prescription.shade || ''}
                    onChange={(e) => setP('shade', e.target.value)}
                    className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm"
                  >
                    <option value="">{isAr ? 'اختر درجة اللون…' : 'Select VITA Shade…'}</option>

                    <optgroup label="🌟 Bleached Shades (VITA 3D Bleach & Hollywood White)">
                      <option value="0M1">0M1 (VITA 3D-Master Ultra Bleach)</option>
                      <option value="0M2">0M2 (VITA 3D-Master Light Bleach)</option>
                      <option value="0M3">0M3 (VITA 3D-Master Bleach)</option>
                      <option value="BL1">BL1 (Ivoclar Chromascop Bleach 1)</option>
                      <option value="BL2">BL2 (Ivoclar Chromascop Bleach 2)</option>
                      <option value="BL3">BL3 (Ivoclar Chromascop Bleach 3)</option>
                      <option value="BL4">BL4 (Ivoclar Chromascop Bleach 4)</option>
                    </optgroup>

                    <optgroup label="🔬 VITA Toothguide 3D-MASTER® — Group 1 (Light)">
                      <option value="1M1">1M1</option>
                      <option value="1M2">1M2</option>
                    </optgroup>

                    <optgroup label="🔬 VITA Toothguide 3D-MASTER® — Group 2">
                      <option value="2L1.5">2L1.5 (Yellowish)</option>
                      <option value="2L2.5">2L2.5 (Yellowish)</option>
                      <option value="2M1">2M1 (Medium Neutral)</option>
                      <option value="2M2">2M2 (Medium Neutral)</option>
                      <option value="2M3">2M3 (Medium Neutral)</option>
                      <option value="2R1.5">2R1.5 (Reddish)</option>
                      <option value="2R2.5">2R2.5 (Reddish)</option>
                    </optgroup>

                    <optgroup label="🔬 VITA Toothguide 3D-MASTER® — Group 3">
                      <option value="3L1.5">3L1.5 (Yellowish)</option>
                      <option value="3L2.5">3L2.5 (Yellowish)</option>
                      <option value="3M1">3M1 (Medium Neutral)</option>
                      <option value="3M2">3M2 (Medium Neutral)</option>
                      <option value="3M3">3M3 (Medium Neutral)</option>
                      <option value="3R1.5">3R1.5 (Reddish)</option>
                      <option value="3R2.5">3R2.5 (Reddish)</option>
                    </optgroup>

                    <optgroup label="🔬 VITA Toothguide 3D-MASTER® — Group 4">
                      <option value="4L1.5">4L1.5 (Yellowish)</option>
                      <option value="4L2.5">4L2.5 (Yellowish)</option>
                      <option value="4M1">4M1 (Medium Neutral)</option>
                      <option value="4M2">4M2 (Medium Neutral)</option>
                      <option value="4M3">4M3 (Medium Neutral)</option>
                      <option value="4R1.5">4R1.5 (Reddish)</option>
                      <option value="4R2.5">4R2.5 (Reddish)</option>
                    </optgroup>

                    <optgroup label="🔬 VITA Toothguide 3D-MASTER® — Group 5 (Dark)">
                      <option value="5M1">5M1</option>
                      <option value="5M2">5M2</option>
                      <option value="5M3">5M3</option>
                    </optgroup>

                    <optgroup label="🦷 VITA Classical A-D (Standard A1-D4)">
                      <option value="A1">A1 (Reddish-Brownish Light)</option>
                      <option value="A2">A2 (Reddish-Brownish Universal)</option>
                      <option value="A3">A3 (Reddish-Brownish Standard)</option>
                      <option value="A3.5">A3.5 (Reddish-Brownish Dark)</option>
                      <option value="A4">A4 (Reddish-Brownish Intense)</option>
                      <option value="B1">B1 (Reddish-Yellowish Light)</option>
                      <option value="B2">B2 (Reddish-Yellowish)</option>
                      <option value="B3">B3 (Reddish-Yellowish)</option>
                      <option value="B4">B4 (Reddish-Yellowish)</option>
                      <option value="C1">C1 (Greyish Light)</option>
                      <option value="C2">C2 (Greyish)</option>
                      <option value="C3">C3 (Greyish)</option>
                      <option value="C4">C4 (Greyish Dark)</option>
                      <option value="D2">D2 (Reddish-Grey)</option>
                      <option value="D3">D3 (Reddish-Grey)</option>
                      <option value="D4">D4 (Reddish-Grey)</option>
                    </optgroup>

                    <option value="Multi-Shade Gingiva / Incisal Gradient (Specify in Notes)">
                      {isAr ? 'تدرج لوني متعدد / تخصيص اللثة والحافة القاطعة' : 'Multi-Shade Gingiva / Incisal Gradient (Specify in Notes)'}
                    </option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {isAr ? 'تاريخ التسليم المطلوب' : 'Required Due Date'}
                  </label>
                  <input
                    type="date"
                    value={prescription.dueDate || ''}
                    onChange={(e) => setP('dueDate', e.target.value)}
                    className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {isAr ? 'ملاحظات' : 'Notes'}
                </label>
                <textarea
                  value={prescription.notes || ''}
                  onChange={(e) => setP('notes', e.target.value)}
                  rows={3}
                  placeholder={
                    isAr
                      ? 'اكتب أي ملاحظات خاصة حول الحواف، مسافة الإطباق، أو نوع التثبيت لمصمم الـ CAD…'
                      : 'Specific margin requirements, contact points, or occlusal notes for the CAD technician…'
                  }
                  className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>
            </section>

            {stageErrorBox}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goBack}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-3.5 text-sm font-bold text-[var(--text)] transition hover:border-[var(--accent)]/50"
              >
                ← {isAr ? 'رجوع' : 'Back'}
              </button>
              <button
                type="button"
                onClick={goNext}
                className="btn-accent flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white shadow-lg"
              >
                {isAr ? 'التالي: التأكيد' : 'Next: Confirm'} →
              </button>
            </div>
          </div>
        )}

        {/* ── Stage 3: Confirm & Send ───────────────────────── */}
        {stage === 2 && (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className="dentrio-card rounded-2xl p-6">
                <h2 className="text-base font-bold text-[var(--text)]">
                  {isAr ? '1. مراجعة الحالة' : '1. Review Case Summary'}
                </h2>

                <div className="mt-4 space-y-5">
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {isAr ? 'ملفات المسح' : 'Scan Files'} ({files.length})
                    </span>
                    <div className="mt-2 max-h-36 space-y-1 overflow-y-auto pr-1">
                      {files.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-xs"
                        >
                          <span className="truncate font-semibold text-[var(--text)]">
                            {['png', 'jpg', 'jpeg'].includes(f.name.split('.').pop()?.toLowerCase() || '') ? '📷' : '🦷'}{' '}
                            {f.name}
                          </span>
                          <span className="shrink-0 font-mono text-[10px] text-[var(--text-muted)]">
                            {(f.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {isAr ? 'الأسنان المحددة' : 'Selected Teeth'}
                    </span>
                    <div className="mt-2">
                      <SummaryRow label={isAr ? 'FDI' : 'FDI'} value={prescription.toothNumber || '—'} />
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {isAr ? 'إعدادات التصميم' : 'Design Parameters'}
                    </span>
                    <div className="mt-2">
                      {NUM_PARAM_DEFS.map((d) => (
                        <SummaryRow
                          key={d.key}
                          label={isAr ? d.ar : d.en}
                          value={`${designParams.nums[d.key] ?? d.def} ${d.unit}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {isAr ? 'الوصفة السريرية' : 'Prescription'}
                    </span>
                    <div className="mt-2">
                      <SummaryRow
                        label={isAr ? 'الخامة' : 'Material'}
                        value={prescription.material || (isAr ? '—' : '—')}
                      />
                      <SummaryRow label={isAr ? 'درجة اللون' : 'Shade'} value={prescription.shade || '—'} />
                      <SummaryRow label={isAr ? 'تاريخ التسليم' : 'Due Date'} value={prescription.dueDate || '—'} />
                      <SummaryRow label={isAr ? 'ملاحظات' : 'Notes'} value={prescription.notes || '—'} />
                    </div>
                  </div>
                </div>
              </section>

              <section className="dentrio-card rounded-2xl p-6">
                <h2 className="text-base font-bold text-[var(--text)]">
                  {isAr ? '2. اختيار معمل الأسنان' : '2. Choose Dental Lab'}
                </h2>
                <div className="mt-3">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={isAr ? 'البحث عن معمل بالاسم، التخصص، أو الموقع…' : 'Search lab by name, specialty, or location…'}
                    className="dentrio-input w-full rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>

                <div className="mt-4 max-h-[560px] space-y-2.5 overflow-y-auto pr-1">
                  {labs.length === 0 && (
                    <p className="py-8 text-center text-xs font-semibold text-[var(--text-muted)]">
                      {isAr ? 'لا توجد معامل مطابقة للبحث.' : 'No laboratories match your query.'}
                    </p>
                  )}
                  {labs.map((lab) => (
                    <button
                      key={lab.id}
                      type="button"
                      onClick={() => setSelectedLab(lab.id)}
                      className={
                        'w-full rounded-xl border p-4 text-start transition ' +
                        (selectedLab === lab.id
                          ? 'border-[var(--accent)] bg-[var(--accent-dim)] ring-2 ring-[var(--accent)]'
                          : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)]/50')
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[var(--text)]">{lab.labName}</span>
                          {lab.isPreferred && (
                            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                              ★ {isAr ? 'مفضل' : 'Preferred'}
                            </span>
                          )}
                        </div>
                        {lab.turnaroundDays && (
                          <span className="text-[11px] font-mono font-bold text-[var(--accent-light)]">
                            ⚡ {lab.turnaroundDays} {isAr ? 'أيام عمل' : 'days'}
                          </span>
                        )}
                      </div>
                      {(lab.specialties || lab.materials) && (
                        <p className="mt-1.5 text-xs font-medium text-[var(--text-muted)]">
                          {lab.specialties && <span className="font-semibold text-[var(--text)]">{lab.specialties}</span>}
                          {lab.specialties && lab.materials && <span> · </span>}
                          {lab.materials && <span>{lab.materials}</span>}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs font-bold text-red-400">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goBack}
                disabled={busy}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-3.5 text-sm font-bold text-[var(--text)] transition hover:border-[var(--accent)]/50 disabled:opacity-50"
              >
                ← {isAr ? 'رجوع' : 'Back'}
              </button>
              <button
                type="submit"
                disabled={busy}
                className="btn-accent flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white shadow-lg disabled:opacity-50"
              >
                {busy
                  ? isAr
                    ? 'جارٍ رفع الملفات وإنشاء الحالة...'
                    : 'Uploading files & creating case…'
                  : isAr
                    ? 'تأكيد وإرسال الحالة للمعمل'
                    : 'Confirm & Send to Dental Lab'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
