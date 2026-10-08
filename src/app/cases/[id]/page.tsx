'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import NavBar from '@/components/NavBar';
import Viewer3D from '@/components/Viewer3D';
import Chat from '@/components/Chat';
import CadProposalViewer from '@/components/CadProposalViewer';
import MillingOrderPackage from '@/components/MillingOrderPackage';
import { STATUS_LABEL, PIPELINE } from '@/lib/constants';
import type { ApiMe, CaseDetail } from '@/lib/types';
import { useLanguage } from '@/components/LanguageProvider';
import { downloadFilesToDirectory } from '@/lib/downloadHelper';

const STEP_INDEX: Record<string, number> = Object.fromEntries(PIPELINE.map((s, i) => [s, i]));

const STATUS_COLOR: Record<string, string> = {
  SUBMITTED: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  REVIEW: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  DESIGN: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  PRODUCTION: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  READY: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  SHIPPED: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  CLOSED: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
};

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const [user, setUser] = useState<ApiMe | null>(null);
  const [data, setData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeScanIdx, setActiveScanIdx] = useState(0);
  const [tracking, setTracking] = useState('');
  const [busy, setBusy] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [error, setError] = useState('');

  const isAr = lang === 'ar';

  const load = useCallback(async () => {
    const me = await fetch('/api/auth/me');
    if (me.ok) setUser(await me.json());
    const res = await fetch(`/api/cases/${params.id}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    let alive = true;
    (async () => {
      await load();
      if (!alive) return;
    })();
    return () => {
      alive = false;
    };
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <NavBar role="" name="" />
        <main className="mx-auto max-w-6xl p-8 text-sm font-semibold text-[var(--text-muted)]">
          {isAr ? 'جارٍ تحميل تفاصيل الحالة...' : 'Loading case details…'}
        </main>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <NavBar role="" name="" />
        <main className="mx-auto max-w-6xl p-8 text-sm font-semibold text-[var(--text-muted)]">
          {isAr ? 'لم يتم العثور على سجل الحالة.' : 'Case record not found.'}
        </main>
      </div>
    );
  }

  const role = data.myRole;
  const isShipping = role === 'SHIPPING';
  const isLab = role === 'LAB';
  const caseId = data.id;

  async function advance(action?: string) {
    setBusy(true);
    setError('');
    const fd = new FormData();
    if (action) fd.set('action', action);
    const res = await fetch(`/api/cases/${caseId}/status`, { method: 'POST', body: fd });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || 'Failed to update case stage');
      setBusy(false);
      return;
    }
    await load();
    setBusy(false);
  }

  async function startShipment() {
    setBusy(true);
    setError('');
    const res = await fetch(`/api/cases/${caseId}/ship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingNumber: tracking }),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || 'Failed to start shipment');
      setBusy(false);
      return;
    }
    setTracking('');
    await load();
    setBusy(false);
  }

  async function advanceShip() {
    setBusy(true);
    setError('');
    const res = await fetch(`/api/cases/${caseId}/shipstatus`, { method: 'POST' });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || 'Failed to update tracking');
      setBusy(false);
      return;
    }
    await load();
    setBusy(false);
  }

  const currentIdx = STEP_INDEX[data.status] ?? 0;

  const allScans =
    data.scans && data.scans.length > 0
      ? data.scans
      : data.scan
      ? [{ id: 0, path: data.scan.path, name: data.scan.name, type: 'scan' }]
      : [];
  const activeScan = allScans[activeScanIdx] || allScans[0] || null;

  // Direct folder download of all files across the entire case
  async function handleDownloadAllCaseFiles() {
    if (!data) return;
    const filesToDownload: Array<{ url: string; name: string }> = [];

    // 1. All intraoral scans & clinical photos
    allScans.forEach((s) => {
      filesToDownload.push({ url: `/api/files/${s.path}`, name: `Scan_${s.name}` });
    });

    // 2. CAD Design Proposal (HTML / 3D)
    if (data.cadProposal) {
      filesToDownload.push({
        url: `/api/files/${data.cadProposal.path}`,
        name: `CAD_Design_${data.cadProposal.name}`,
      });
    }

    // 3. Milling CAM STLs
    if (data.millingPackage?.stls) {
      data.millingPackage.stls.forEach((stl) => {
        filesToDownload.push({
          url: `/api/files/${stl.path}`,
          name: `Milled_${stl.name}`,
        });
      });
    }

    // 4. Construction Info files
    if (data.millingPackage?.constructions) {
      data.millingPackage.constructions.forEach((cFile) => {
        filesToDownload.push({
          url: `/api/files/${cFile.path}`,
          name: `Construction_${cFile.name}`,
        });
      });
    }

    if (filesToDownload.length === 0) return;

    await downloadFilesToDirectory(filesToDownload, (msg) => setDownloadProgress(msg));
    setDownloadProgress('');
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
      <NavBar role={user?.user?.role} name={user?.user?.name} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Case Header Banner */}
        <div className="dentrio-card rounded-2xl p-6 relative overflow-hidden shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-white">Case {data.code}</h1>
                <span className={'rounded-xl px-3 py-1 text-xs font-bold ' + (STATUS_COLOR[data.status] || '')}>
                  {data.statusLabel}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-[var(--text-muted)] font-mono">
                {isAr ? 'تم الإنشاء:' : 'Created:'} {new Date(data.createdAt).toLocaleDateString()}
                {data.dentistName && ` · 🦷 ${data.dentistName}`}
                {data.labName && ` · 🔬 ${data.labName}`}
              </p>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2.5">
              {!isShipping && allScans.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadAllCaseFiles}
                  className="btn-accent rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md flex items-center gap-2"
                  title={isAr ? 'حفظ جميع ملفات الحالة مباشرة في مجلد' : 'Save all case files directly to folder'}
                >
                  <span>📁</span>
                  <span>{isAr ? 'حفظ جميع الملفات في مجلد 📁' : 'Save Case Files to Folder 📁'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Download Progress Message */}
          {downloadProgress && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-950/40 p-3 text-xs font-bold text-sky-300 animate-in fade-in">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
              <span>{downloadProgress}</span>
            </div>
          )}
        </div>

        {/* Pipeline Stage Bar */}
        {!isShipping && (
          <div className="dentrio-card mt-6 overflow-x-auto rounded-2xl p-6">
            <div className="flex min-w-[560px] items-center justify-between">
              {PIPELINE.map((s, i) => (
                <div key={s} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={
                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ' +
                        (i <= currentIdx
                          ? 'bg-[var(--accent)] text-[#090d16] shadow-sm'
                          : 'border border-[var(--border)] text-[var(--text-muted)]')
                      }
                    >
                      {i < currentIdx ? '✓' : i + 1}
                    </div>
                    <span className="mt-1 text-[10px] font-bold text-[var(--text-muted)]">
                      {STATUS_LABEL[s].split(' ')[0]}
                    </span>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <div className={'mx-2 mb-6 h-0.5 flex-1 ' + (i < currentIdx ? 'bg-[var(--accent)]' : 'bg-[var(--border)]')} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shipping Logistics Banner */}
        {isShipping && (
          <div className="dentrio-card mt-6 rounded-2xl p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Delivery Logistics Information</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Pickup Location (Lab)</p>
                <p className="mt-1 font-bold text-[var(--text)]">{data.pickupAddress || '—'}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Delivery Destination (Clinic)</p>
                <p className="mt-1 font-bold text-[var(--text)]">{data.deliveryAddress || '—'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Two-Column Grid: CAD/CAM Pipeline & Communication */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column: 3D Scan, 3D HTML Design Preview with Doctor Approval, and CAM Milling Order */}
          <div className="space-y-6">
            {/* 1. 3D Intraoral Scan & Multi-Scan Switcher */}
            <section className="dentrio-card rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {isAr ? '1. المسح ثلاثي الأبعاد الأصلي' : '1. Original 3D Intraoral Scans'}
                  </h2>
                  {allScans.length > 1 && (
                    <span className="text-[10px] font-mono text-[var(--accent-light)] font-bold">
                      {allScans.length} {isAr ? 'ملفات مسح وصور مرفقة' : 'Scan Files Available'}
                    </span>
                  )}
                </div>
                {activeScan && (
                  <a
                    href={`/api/files/${activeScan.path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[var(--accent-light)] hover:underline"
                  >
                    {isAr ? 'تحميل الملف ↗' : 'Download File ↗'}
                  </a>
                )}
              </div>

              {/* Multi-Scan Tab Switcher */}
              {allScans.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-1.5 border-b border-[var(--border)] pb-3">
                  {allScans.map((s, idx) => {
                    const is3D = s.name.toLowerCase().endsWith('.stl') || s.name.toLowerCase().endsWith('.ply');
                    const isActive = idx === activeScanIdx;

                    return (
                      <button
                        key={s.id || idx}
                        type="button"
                        onClick={() => setActiveScanIdx(idx)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                          isActive
                            ? 'bg-[var(--accent)] text-[#090d16] shadow-sm'
                            : 'border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-white'
                        }`}
                      >
                        <span>{is3D ? '🦷' : '📷'}</span>
                        <span className="truncate max-w-[140px]">{s.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)]">
                {activeScan ? (
                  activeScan.name.toLowerCase().endsWith('.stl') || activeScan.name.toLowerCase().endsWith('.ply') ? (
                    <Viewer3D key={activeScan.path} url={`/api/files/${activeScan.path}`} />
                  ) : (
                    <div className="flex h-[380px] items-center justify-center bg-[#131d2e] p-4">
                      <img
                        src={`/api/files/${activeScan.path}`}
                        alt={activeScan.name}
                        className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
                      />
                    </div>
                  )
                ) : (
                  <p className="py-12 text-center text-sm font-medium text-[var(--text-muted)]">
                    {isAr ? 'لم يتم إرفاق ملف مسح ثلاثي الأبعاد.' : 'No 3D scan file attached.'}
                  </p>
                )}
              </div>
            </section>

            {/* 2. 3D HTML Design Preview with Doctor Authorization Gate */}
            {!isShipping && (
              <CadProposalViewer
                caseId={data.id}
                cadProposal={data.cadProposal || null}
                canApproveCad={!!data.canApproveCad}
                canUploadProposal={!!data.canUploadCadProposal}
                onRefresh={load}
              />
            )}

            {/* 3. CAM Milling Order Package (Multi-STL + Construction Info + Batch Download) */}
            {!isShipping && (
              <MillingOrderPackage
                caseId={data.id}
                caseCode={data.code}
                millingPackage={data.millingPackage || null}
                isCadApproved={!!data.isCadApproved}
                canUploadMilling={!!data.canUploadMillingOrder}
                onRefresh={load}
              />
            )}

            {/* 4. Lab Ready for Shipping Action Controls */}
            {!isShipping && isLab && data.canMarkReady && (
              <section className="dentrio-card rounded-2xl p-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {isAr ? 'إنهاء الإنتاج وتجهيز الشحن' : 'Finalize Production & Mark Ready'}
                </h2>
                <p className="mt-1 text-xs text-[var(--text-muted)] mb-3">
                  {isAr
                    ? 'بعد اكتمال الخراطة والتلبيد والتلميع، اضغط هنا لإشعار مندوب الشحن بالاستلام.'
                    : 'Click when milling, sintering, and glazing are complete to request courier pickup.'}
                </p>
                <button
                  onClick={() => advance('mark-ready')}
                  disabled={busy}
                  className="btn-accent flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50"
                >
                  {isAr ? 'تأكيد جاهزية الطلب للاستلام والشحن 📦' : 'Mark Ready for Shipping Pickup 📦'}
                </button>
              </section>
            )}

            {/* Logistics Shipper Actions */}
            {isShipping && (
              <section className="dentrio-card rounded-2xl p-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">Logistics Actions</h2>
                <div className="mt-4 space-y-3">
                  {data.canShip && !data.shipStatus && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={tracking}
                        onChange={(e) => setTracking(e.target.value)}
                        placeholder="Carrier tracking number…"
                        className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm"
                      />
                      <button
                        onClick={startShipment}
                        disabled={busy}
                        className="btn-accent flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50"
                      >
                        Confirm Package Pickup
                      </button>
                    </div>
                  )}

                  {data.shipStatus && data.shipStatus !== 'DELIVERED' && (
                    <button
                      onClick={advanceShip}
                      disabled={busy}
                      className="btn-accent flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50"
                    >
                      Update: {data.shipStatus === 'PENDING' ? 'Confirm Pickup' : data.shipStatus === 'PICKED_UP' ? 'Mark In Transit' : 'Mark Delivered'}
                    </button>
                  )}
                </div>
              </section>
            )}

            {error && <p className="text-xs font-bold text-red-400">{error}</p>}
          </div>

          {/* Right Column: Digital Prescription & Live Thread with Voice Chat */}
          <div className="space-y-6">
            {!isShipping && data.prescription && (
              <section className="dentrio-card rounded-2xl p-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {isAr ? 'الوصفة والمواصفات السريرية' : 'Digital Clinical Prescription'}
                </h2>
                <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  {([
                    data.prescription.restorationType ? [isAr ? 'نوع التركيبة' : 'Restoration', data.prescription.restorationType] : null,
                    data.prescription.toothNumber ? [isAr ? 'رقم السن' : 'Tooth', data.prescription.toothNumber] : null,
                    [isAr ? 'الخامة المحددة' : 'Lab Material', data.prescription.material],
                    [isAr ? 'درجة اللون VITA' : 'VITA Shade', data.prescription.shade],
                    [isAr ? 'تاريخ التسليم المطلوب' : 'Required Due Date', data.prescription.dueDate],
                  ].filter(Boolean) as [string, string | null | undefined][]).map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{k}</dt>
                      <dd className="mt-1 font-bold text-[var(--text)] break-words">{v || '—'}</dd>
                    </div>
                  ))}
                  {data.prescription.notes && (
                    <div className="col-span-1 sm:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        {isAr ? 'ملاحظات التحضير والحواف السريرية' : 'Clinical & Margin Notes'}
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap font-bold text-[var(--text)]">{data.prescription.notes}</dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            {/* Live Case Communication with Voice Chat & Attachments */}
            {!isShipping ? (
              <Chat caseId={data.id} />
            ) : (
              <div className="dentrio-card rounded-2xl border-dashed p-6 text-xs font-medium text-[var(--text-muted)]">
                {isAr
                  ? 'البيانات السريرية والماسحات ثلاثية الأبعاد محمية ومخصصة للطبيب والمعمل فقط. يحصل مندوب التوصيل على كود الحالة وعناوين الاستلام والتسليم فقط.'
                  : 'Clinical records and chat messages are strictly private. Shipping couriers only access verified addresses and Case ID.'}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
