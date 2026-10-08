'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { downloadFilesToDirectory } from '@/lib/downloadHelper';

interface MillingPackageData {
  stlPath: string;
  stlName: string;
  stls?: Array<{ id: number; path: string; name: string }>;
  constructionPath: string | null;
  constructionName: string | null;
  constructions?: Array<{ id: number; path: string; name: string }>;
  notes: string | null;
  createdAt: string | null;
}

interface MillingOrderPackageProps {
  caseId: number;
  caseCode?: string;
  millingPackage: MillingPackageData | null;
  isCadApproved: boolean;
  canUploadMilling: boolean;
  onRefresh: () => void;
}

export default function MillingOrderPackage({
  caseId,
  millingPackage,
  isCadApproved,
  canUploadMilling,
  onRefresh,
}: MillingOrderPackageProps) {
  const { lang } = useLanguage();
  const [showUpload, setShowUpload] = useState(false);
  const [stlFiles, setStlFiles] = useState<File[]>([]);
  const [constructionFiles, setConstructionFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isAr = lang === 'ar';

  function handleStlSelect(selected: FileList | null) {
    if (!selected) return;
    const newFiles = Array.from(selected);
    setStlFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const filtered = newFiles.filter((f) => !existingNames.has(f.name));
      return [...prev, ...filtered];
    });
  }

  function handleConstructionSelect(selected: FileList | null) {
    if (!selected) return;
    const newFiles = Array.from(selected);
    setConstructionFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const filtered = newFiles.filter((f) => !existingNames.has(f.name));
      return [...prev, ...filtered];
    });
  }

  function removeStl(index: number) {
    setStlFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function removeConstruction(index: number) {
    setConstructionFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleDispatchMilling(e: React.FormEvent) {
    e.preventDefault();
    if (stlFiles.length === 0) {
      setError(isAr ? 'يرجى اختيار ملف STL واحد على الأقل للخراطة.' : 'Please select at least one final Milled STL file.');
      return;
    }
    setBusy(true);
    setError('');

    const fd = new FormData();
    stlFiles.forEach((file) => {
      fd.append('stls', file);
    });
    constructionFiles.forEach((file) => {
      fd.append('constructions', file);
    });

    try {
      const res = await fetch(`/api/cases/${caseId}/milling-order`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to dispatch milling order');
        setBusy(false);
        return;
      }
      setStlFiles([]);
      setConstructionFiles([]);
      setShowUpload(false);
      setSuccessMsg(isAr ? 'تم إرسال حزمة الخراطة (CAM Package) بنجاح وبدء الإنتاج!' : 'Milling CAM package dispatched! Production in progress.');
      onRefresh();
    } catch {
      setError(isAr ? 'حدث خطأ في الاتصال' : 'Connection error');
    } finally {
      setBusy(false);
    }
  }

  const allStlList =
    millingPackage?.stls && millingPackage.stls.length > 0
      ? millingPackage.stls
      : millingPackage?.stlPath
      ? [{ id: 0, path: millingPackage.stlPath, name: millingPackage.stlName }]
      : [];

  const allConstList =
    millingPackage?.constructions && millingPackage.constructions.length > 0
      ? millingPackage.constructions
      : millingPackage?.constructionPath
      ? [{ id: 0, path: millingPackage.constructionPath, name: millingPackage.constructionName || 'constructionInfo' }]
      : [];

  // Direct uncompressed folder download with directory picker & auto-nesting task check
  async function handleDownloadAllCamFiles() {
    const filesToDownload: Array<{ url: string; name: string }> = [];

    allStlList.forEach((stl) => {
      filesToDownload.push({ url: `/api/files/${stl.path}`, name: `Milled_${stl.name}` });
    });

    allConstList.forEach((cFile) => {
      filesToDownload.push({ url: `/api/files/${cFile.path}`, name: `Construction_${cFile.name}` });
    });

    if (filesToDownload.length === 0) return;

    const success = await downloadFilesToDirectory(filesToDownload, (msg) => setDownloadProgress(msg));
    setDownloadProgress('');

    // Automatically mark "1. CAM Nesting & Toolpath Calculated" upon download
    if (success) {
      try {
        await fetch('/api/milling', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'TOGGLE_TASK',
            caseId,
            taskKey: 'nesting_calculated',
            completed: true,
          }),
        });
        onRefresh();
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <section className="dentrio-card rounded-2xl p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-base font-bold text-[var(--text)]">
              {isAr ? 'حزمة الخراطة والتصنيع (CAM Package)' : 'CAM Milling Package'}
            </h2>
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {isAr
              ? 'ملفات الـ STL النهائية وملفات الـ Construction Info لمشغلي ماكينات الـ CAM'
              : 'Finalized Milled STL files & Construction Info metadata for 5-axis CNC machines'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Folder Download with Directory Picker */}
          {allStlList.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadAllCamFiles}
              className="btn-accent rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md flex items-center gap-1.5"
              title={isAr ? 'حفظ جميع ملفات الخراطة مباشرة في مجلد وتحديد مهمة التموضع تلقائياً' : 'Download all files directly to selected CAM folder and auto-check nesting task'}
            >
              <span>📁</span>
              <span>{isAr ? 'حفظ الملفات في مجلد 📁' : 'Save Files to Folder 📁'}</span>
            </button>
          )}

          {/* Upload Button for Lab when Doctor has Approved */}
          {canUploadMilling && isCadApproved && (
            <button
              type="button"
              onClick={() => setShowUpload(!showUpload)}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-xs font-bold text-white hover:border-[var(--accent)] transition flex items-center gap-1.5"
            >
              <span>{showUpload ? '✕' : '⚙️'}</span>
              <span>{isAr ? (showUpload ? 'إلغاء' : 'إصدار أمر الخراطة') : (showUpload ? 'Cancel' : 'Upload CAM Files')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Download Progress Banner */}
      {downloadProgress && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-950/40 p-3 text-xs font-bold text-sky-300 animate-in fade-in">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
          <span>{downloadProgress}</span>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs font-bold text-red-400">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs font-bold text-emerald-400">
          {successMsg}
        </div>
      )}

      {/* Approval Gate Status Banner */}
      {!isCadApproved && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
            <span>🔒</span>
            <span>{isAr ? 'أمر الخراطة مقفل حالياً' : 'Milling Order Locked'}</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            {isAr
              ? 'لا يمكن بدء الخراطة أو تصدير حزمة التصنيع إلا بعد مراجعة واعتماد الطبيب لمقترح تصميم الـ HTML أعلاه.'
              : 'CAM Milling is locked until the prescribing doctor reviews and authorizes the 3D HTML design preview above.'}
          </p>
        </div>
      )}

      {/* Lab CAM Multi-File Upload Drawer */}
      {showUpload && isCadApproved && (
        <form onSubmit={handleDispatchMilling} className="my-4 rounded-xl border border-[rgba(42,127,255,0.3)] bg-[#070A10]/90 p-4 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              {isAr ? 'رفع ملفات حزمة الخراطة (Multi-STL CAM Package)' : 'Upload 5-Axis Multi-STL CAM Package'}
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              ✓ Doctor Authorization Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Multi Milled STL Design */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white">
                  {isAr ? '1. ملفات STL النهائية للخراطة *' : '1. Final Milled STL Files (Multi-Select) *'}
                </label>
                <span className="text-[10px] font-mono text-[var(--accent-light)] font-bold">
                  {stlFiles.length} {isAr ? 'ملفات' : 'Files'}
                </span>
              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[rgba(42,127,255,0.3)] bg-[#070A10]/60 p-4 text-center hover:border-[var(--accent)] transition">
                <input
                  type="file"
                  multiple
                  accept=".stl,.ply"
                  className="hidden"
                  onChange={(e) => handleStlSelect(e.target.files)}
                />
                <span className="text-xl">🦷📁</span>
                <p className="mt-1 text-xs font-bold text-white">
                  {isAr ? 'اضغط لاختيار ملفات STL متعددة' : 'Click or drop multiple .stl files'}
                </p>
              </label>

              {/* Selected STL Files Preview List */}
              {stlFiles.length > 0 && (
                <div className="mt-2.5 max-h-32 overflow-y-auto space-y-1 pr-1">
                  {stlFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[#070A10] px-2.5 py-1 text-[11px]"
                    >
                      <span className="truncate max-w-[170px] font-semibold text-white">🦷 {f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeStl(i)}
                        className="text-red-400 hover:text-red-300 font-bold px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Construction Info files */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white">
                  {isAr ? '2. ملفات البناء Construction Info' : '2. Construction Info (Multi-Select)'}
                </label>
                <span className="text-[10px] font-mono text-[var(--accent-light)] font-bold">
                  {constructionFiles.length} {isAr ? 'ملفات' : 'Files'}
                </span>
              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[rgba(42,127,255,0.3)] bg-[#070A10]/60 p-4 text-center hover:border-[var(--accent)] transition">
                <input
                  type="file"
                  multiple
                  accept=".constructionInfo,.dentalcad,.xml,.txt,.json"
                  className="hidden"
                  onChange={(e) => handleConstructionSelect(e.target.files)}
                />
                <span className="text-xl">📋</span>
                <p className="mt-1 text-xs font-bold text-white">
                  {isAr ? 'اختر ملفات .constructionInfo أو .dentalcad' : 'Select .constructionInfo, .xml, or .dentalcad'}
                </p>
              </label>

              {/* Selected Construction Files Preview */}
              {constructionFiles.length > 0 && (
                <div className="mt-2.5 max-h-32 overflow-y-auto space-y-1 pr-1">
                  {constructionFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[#070A10] px-2.5 py-1 text-[11px]"
                    >
                      <span className="truncate max-w-[170px] font-semibold text-white">📋 {f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeConstruction(i)}
                        className="text-red-400 hover:text-red-300 font-bold px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-white"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={busy || stlFiles.length === 0}
              className="btn-accent rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md disabled:opacity-50"
            >
              {busy ? (isAr ? 'جارٍ الإرسال...' : 'Dispatching...') : (isAr ? 'إرسال أمر الخراطة والبدء في الإنتاج' : 'Dispatch CAM Milling Package')}
            </button>
          </div>
        </form>
      )}

      {/* Dispatched Milling Package Details */}
      {millingPackage && (
        <div className="mt-4 rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>
                {isAr ? 'حزمة الخراطة والتصنيع جاهزة ونشطة في الماكينة' : 'Milling CAM Package Dispatched & Active'}
                {allStlList.length > 0 && ` (${allStlList.length} STL Files)`}
              </span>
            </div>
            {millingPackage.createdAt && (
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                {new Date(millingPackage.createdAt).toLocaleString()}
              </span>
            )}
          </div>

          {/* Clean Files List (Info Only + Construction Download) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* STL Files Info Card */}
            <div className="rounded-xl border border-[rgba(42,127,255,0.25)] bg-[#070A10]/70 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                {isAr ? 'ملفات الـ STL المرفقة للخراطة:' : 'Milled STL Geometry Files:'}
              </span>
              <div className="space-y-1">
                {allStlList.map((stl, idx) => (
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
              {allConstList.length > 0 ? (
                <div className="space-y-1.5">
                  {allConstList.map((cFile, idx) => (
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
      )}
    </section>
  );
}
