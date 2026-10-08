'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';

interface CadProposalData {
  path: string;
  name: string;
  isHtml: boolean;
  isStl: boolean;
  approvedAt: string | null;
  approvedBy: number | null;
  revisionNotes: string | null;
}

interface CadProposalViewerProps {
  caseId: number;
  cadProposal: CadProposalData | null;
  canApproveCad: boolean;
  canUploadProposal: boolean;
  onRefresh: () => void;
}

export default function CadProposalViewer({
  caseId,
  cadProposal,
  canApproveCad,
  canUploadProposal,
  onRefresh,
}: CadProposalViewerProps) {
  const { lang } = useLanguage();
  const [showUpload, setShowUpload] = useState(false);
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [designerNotes, setDesignerNotes] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isAr = lang === 'ar';

  // Handle Doctor Approval
  async function handleDoctorApprove() {
    setBusy(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/cases/${caseId}/cad-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to approve HTML design preview');
        setBusy(false);
        return;
      }
      setSuccessMsg(isAr ? 'تم اعتماد التصميم بنجاح! الحالة جاهزة الآن لأمر الخراطة.' : 'HTML 3D design approved! Ready for Milling Order.');
      onRefresh();
    } catch {
      setError(isAr ? 'حدث خطأ في الاتصال' : 'Connection error');
    } finally {
      setBusy(false);
    }
  }

  // Handle Doctor Requesting Revisions
  async function handleDoctorRevise(e: React.FormEvent) {
    e.preventDefault();
    if (!revisionNotes.trim()) {
      setError(isAr ? 'يرجى كتابة ملاحظات التعديل المطلوبة للمصمم.' : 'Please describe the required modifications.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/cases/${caseId}/cad-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REVISE', notes: revisionNotes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit revision request');
        setBusy(false);
        return;
      }
      setShowRevisionInput(false);
      setRevisionNotes('');
      setSuccessMsg(isAr ? 'تم إرسال طلب التعديل للمعمل بنجاح.' : 'Revision request sent to dental lab.');
      onRefresh();
    } catch {
      setError(isAr ? 'حدث خطأ في الاتصال' : 'Connection error');
    } finally {
      setBusy(false);
    }
  }

  // Handle Lab Uploading HTML Design Preview
  async function handleLabUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!proposalFile) return;
    setBusy(true);
    setError('');
    const fd = new FormData();
    fd.set('proposal', proposalFile);
    if (designerNotes.trim()) fd.set('notes', designerNotes.trim());

    try {
      const res = await fetch(`/api/cases/${caseId}/cad-proposal`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to upload HTML design preview');
        setBusy(false);
        return;
      }
      setProposalFile(null);
      setDesignerNotes('');
      setShowUpload(false);
      setSuccessMsg(isAr ? 'تم رفع ملف الـ HTML ثلاثي الأبعاد وإرساله للطبيب للمراجعة والاعتماد.' : '3D HTML Web Viewer preview uploaded and sent for doctor authorization.');
      onRefresh();
    } catch {
      setError(isAr ? 'حدث خطأ في الاتصال' : 'Connection error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="dentrio-card rounded-2xl p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌐</span>
            <h2 className="text-base font-bold text-[var(--text)]">
              {isAr ? 'معاينة تصميم الـ HTML ثلاثي الأبعاد واعتماد الطبيب' : '3D HTML Design Preview & Doctor Approval'}
            </h2>
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {isAr
              ? 'معاينة تفاعلية لملف الـ HTML المُصدر من برامج التصميم (exocad / 3Shape) ومراجعة الطبيب قبل بدء الخراطة'
              : 'Interactive 3D HTML Web Viewer preview & Doctor authorization before CAM milling'}
          </p>
        </div>

        {/* Action button to upload HTML for lab */}
        {canUploadProposal && (
          <button
            type="button"
            onClick={() => setShowUpload(!showUpload)}
            className="btn-accent rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md flex items-center gap-1.5"
          >
            <span>{showUpload ? '✕' : '🌐'}</span>
            <span>{isAr ? (showUpload ? 'إلغاء' : 'رفع ملف HTML') : (showUpload ? 'Cancel' : 'Upload 3D HTML Preview')}</span>
          </button>
        )}
      </div>

      {/* Upload Form Drawer for Dental Lab */}
      {showUpload && (
        <form onSubmit={handleLabUpload} className="my-4 rounded-xl border border-[rgba(42,127,255,0.3)] bg-[#070A10]/90 p-4 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              {isAr ? 'رفع ملف الـ HTML التفاعلي (3D Web Viewer)' : 'Upload 3D HTML Web Viewer (.html / .htm)'}
            </h3>
            <span className="text-[10px] text-[var(--accent-light)] font-mono">
              exocad / 3Shape / DentalCAD Web Viewers
            </span>
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[rgba(42,127,255,0.3)] bg-[var(--bg-elevated)] p-5 text-center hover:border-[var(--accent)] transition">
            <input
              type="file"
              accept=".html,.htm"
              required
              className="hidden"
              onChange={(e) => setProposalFile(e.target.files?.[0] || null)}
            />
            <span className="text-3xl">🌐</span>
            <p className="mt-2 text-xs font-bold text-white">
              {proposalFile ? proposalFile.name : (isAr ? 'اضغط لاختيار ملف الـ HTML ثلاثي الأبعاد أو اسحبه هنا' : 'Click or drop .html interactive 3D web viewer here')}
            </p>
            <p className="mt-0.5 text-[10px] text-[var(--text-muted)] font-mono">
              .HTML (Interactive 3D Preview)
            </p>
          </label>

          <input
            type="text"
            placeholder={isAr ? 'ملاحظات المصمم للطبيب (مثال: تم ضبط نقاط التماس والمحيط الإطباقي)...' : 'Designer notes for the doctor (e.g. Adjusted occlusal clearance and margin profile)...'}
            value={designerNotes}
            onChange={(e) => setDesignerNotes(e.target.value)}
            className="dentrio-input w-full rounded-xl px-3.5 py-2 text-xs"
          />

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
              disabled={busy || !proposalFile}
              className="btn-accent rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md disabled:opacity-50"
            >
              {busy ? (isAr ? 'جارٍ الرفع...' : 'Uploading...') : (isAr ? 'إرسال الـ HTML للاعتماد' : 'Submit for Doctor Approval')}
            </button>
          </div>
        </form>
      )}

      {/* Messages / Alerts */}
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

      {/* Status Banner */}
      <div className="mt-4">
        {cadProposal ? (
          cadProposal.approvedAt ? (
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-xs text-emerald-400 font-bold">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-sm">✓</span>
                <div>
                  <p>{isAr ? 'تم اعتماد تصميم الـ HTML من قبل الطبيب' : 'HTML 3D Design Approved by Doctor'}</p>
                  <p className="text-[10px] font-normal opacity-80">
                    {new Date(cadProposal.approvedAt).toLocaleString()} — {isAr ? 'مصرح به لأمر الخراطة والإنتاج (CAM)' : 'Authorized for 5-Axis Milling CAM Package'}
                  </p>
                </div>
              </div>
              <a
                href={`/api/files/${cadProposal.path}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition"
              >
                {isAr ? 'فتح HTML ↗' : 'Open HTML ↗'}
              </a>
            </div>
          ) : cadProposal.revisionNotes ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-3.5 text-xs text-amber-400 font-bold">
              <div className="flex items-center gap-2 mb-1">
                <span>⚠️</span>
                <span>{isAr ? 'طلب الطبيب تعديلات على التصميم:' : 'Doctor Requested Design Modifications:'}</span>
              </div>
              <p className="text-xs font-normal text-amber-200/90 pl-6 whitespace-pre-wrap">
                "{cadProposal.revisionNotes}"
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-sky-500/30 bg-sky-950/30 p-3.5 text-xs text-sky-400 font-bold">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400 animate-pulse" />
                <span>{isAr ? 'تصميم الـ HTML بانتظار مراجعة واعتماد الطبيب قبل الخراطة' : '3D HTML Preview awaiting Doctor Approval prior to Milling'}</span>
              </div>
              <span className="text-[10px] font-mono opacity-80">{cadProposal.name}</span>
            </div>
          )
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-6 text-center text-xs font-semibold text-[var(--text-muted)]">
            {isAr
              ? 'لم يقم المعمل برفع ملف الـ HTML ثلاثي الأبعاد حتى الآن. سيتمكن الطبيب من معاينة التصميم واعتماده فور رفعه.'
              : 'No 3D HTML design preview uploaded yet. The laboratory will upload the interactive .html web viewer here for doctor approval.'}
          </div>
        )}
      </div>

      {/* Interactive 3D HTML Web Viewer Iframe Sandbox */}
      {cadProposal && (
        <div className="mt-4 space-y-3">
          <div className="relative h-[480px] w-full overflow-hidden rounded-2xl border border-[rgba(42,127,255,0.3)] bg-[#070A10] shadow-inner">
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
              <a
                href={`/api/files/${cadProposal.path}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-[rgba(42,127,255,0.3)] bg-[#0E1B2A]/90 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md hover:border-[var(--accent)] transition"
                title="Open in Fullscreen Browser Tab"
              >
                {isAr ? 'فتح في شاشة كاملة ↗' : 'Fullscreen Viewer ↗'}
              </a>
            </div>

            <iframe
              src={`/api/files/${cadProposal.path}`}
              title="3D HTML Web Viewer Preview"
              sandbox="allow-scripts allow-same-origin"
              className="h-full w-full border-0"
            />
          </div>

          {/* Doctor Approval Action Bar */}
          {canApproveCad && !cadProposal.approvedAt && (
            <div className="rounded-2xl border border-[var(--accent)] bg-[var(--accent-dim)] p-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? 'هل تعتمد هذا التصميم لبدء الخراطة والتصنيع؟' : 'Authorize 3D HTML Design for Milling & CAM Production?'}
                  </h3>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    {isAr
                      ? 'بمجرد اعتمادك، سيتم تفعيل أمر الخراطة للمعمل للبدء في إنتاج التركيبة فوراً.'
                      : 'Approving authorizes the laboratory to dispatch the CAM package and start milling the restoration.'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowRevisionInput(!showRevisionInput)}
                    className="rounded-xl border border-amber-500/40 bg-amber-950/40 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
                  >
                    {isAr ? 'طلب تعديل ✏️' : 'Request Changes ✏️'}
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleDoctorApprove}
                    className="btn-accent rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md flex items-center gap-1.5"
                  >
                    <span>✓</span>
                    <span>{busy ? (isAr ? 'جارٍ الاعتماد...' : 'Approving...') : (isAr ? 'اعتماد التصميم للخراطة' : 'Approve for Milling')}</span>
                  </button>
                </div>
              </div>

              {/* Revision Notes Input Field */}
              {showRevisionInput && (
                <form onSubmit={handleDoctorRevise} className="mt-3 pt-3 border-t border-[rgba(42,127,255,0.2)] space-y-2 animate-in fade-in duration-150">
                  <label className="block text-xs font-bold text-amber-300">
                    {isAr ? 'اكتب التعديلات المطلوبة للمصمم:' : 'Describe requested modifications for the CAD technician:'}
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                    placeholder={isAr ? 'مثال: يرجى تقليل الحدبة الإطباقية بمقدار 0.3 مم وتعديل حافة السن المجاور...' : 'e.g. Please reduce the distal cusp by 0.3mm and tighten the mesial contact point...'}
                    className="dentrio-input w-full rounded-xl p-2.5 text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRevisionInput(false)}
                      className="rounded-lg px-3 py-1 text-xs text-[var(--text-muted)] hover:text-white"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={busy || !revisionNotes.trim()}
                      className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-amber-400 transition"
                    >
                      {busy ? (isAr ? 'جارٍ الإرسال...' : 'Sending...') : (isAr ? 'إرسال طلب التعديل' : 'Send Revision Request')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
