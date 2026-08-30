'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import Viewer3D from '@/components/Viewer3D';
import Chat from '@/components/Chat';
import { STATUS_LABEL, PIPELINE } from '@/lib/constants';

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
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [tracking, setTracking] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

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
      const me = await fetch('/api/auth/me');
      if (me.ok && alive) setUser(await me.json());
      const res = await fetch(`/api/cases/${params.id}`);
      if (res.ok && alive) setData(await res.json());
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <NavBar role="" name="" />
        <main className="mx-auto max-w-6xl p-8 text-sm font-semibold text-[var(--text-muted)]">Loading case details…</main>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <NavBar role="" name="" />
        <main className="mx-auto max-w-6xl p-8 text-sm font-semibold text-[var(--text-muted)]">Case record not found.</main>
      </div>
    );
  }

  const role = data.myRole;
  const isShipping = role === 'SHIPPING';
  const isLab = role === 'LAB';

  async function advance(action?: string) {
    setBusy(true);
    setError('');
    const fd = new FormData();
    if (designFile) fd.set('design', designFile);
    if (action) fd.set('action', action);
    const res = await fetch(`/api/cases/${data.id}/status`, { method: 'POST', body: fd });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || 'Failed to update case stage');
      setBusy(false);
      return;
    }
    setDesignFile(null);
    await load();
    setBusy(false);
  }

  async function startShipment() {
    setBusy(true);
    setError('');
    const res = await fetch(`/api/cases/${data.id}/ship`, {
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
    const res = await fetch(`/api/cases/${data.id}/shipstatus`, { method: 'POST' });
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

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
      <NavBar role={role} name={user?.user?.name} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-[var(--text)]">Case {data.code}</h1>
              <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${STATUS_COLOR[data.status] || 'bg-slate-500/10 text-slate-400'}`}>
                {data.statusLabel}
              </span>
            </div>
            <p className="mt-1.5 text-xs font-semibold text-[var(--text-muted)]">
              {data.labName ? `Lab: ${data.labName}` : ''}
              {data.dentistName ? ` · Doctor: ${data.dentistName}` : ''}
            </p>
          </div>
        </div>

        {/* Status Pipeline Step Indicator */}
        {!isShipping && (
          <div className="dentrio-card mt-6 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              {PIPELINE.map((s, i) => (
                <div key={s} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={
                        'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ' +
                        (i <= currentIdx
                          ? 'bg-[var(--accent)] text-[#090d16] shadow-sm shadow-[var(--accent-glow)]'
                          : 'border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)]')
                      }
                    >
                      {i + 1}
                    </div>
                    <span
                      className={
                        'mt-1.5 text-[10px] font-bold ' +
                        (i <= currentIdx ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')
                      }
                    >
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

        {/* Shipping View */}
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

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column: 3D Scan & Actions */}
          <div className="space-y-6">
            <section className="dentrio-card rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
                3D Intraoral Scan{data.scan ? ` (${data.scan.name})` : ''}
              </h2>
              <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)]">
                {data.scan ? (
                  <Viewer3D url={`/api/files/${data.scan.path}`} />
                ) : (
                  <p className="py-12 text-center text-sm font-medium text-[var(--text-muted)]">No 3D scan file attached.</p>
                )}
              </div>
              {data.design && data.myRole !== 'SHIPPING' && (
                <div className="mt-5">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-400">CAD Design Proposal</h3>
                  <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                    <Viewer3D url={`/api/files/${data.design.path}`} />
                  </div>
                </div>
              )}
            </section>

            {/* Role Action Controls */}
            {!isShipping && (
              <section className="dentrio-card rounded-2xl p-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">Workflow Stage Controls</h2>
                <div className="mt-4 space-y-3">
                  {isLab && data.canAdvance && (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          Attach CAD Design File (STL / PLY)
                        </label>
                        <input
                          type="file"
                          accept=".stl,.ply"
                          onChange={(e) => setDesignFile(e.target.files?.[0] || null)}
                          className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-xs"
                        />
                      </div>
                      <button
                        onClick={() => advance()}
                        disabled={busy}
                        className="btn-accent flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-[#090d16] disabled:opacity-50"
                      >
                        Advance to {STATUS_LABEL[data.status === 'REVIEW' ? 'DESIGN' : data.status === 'DESIGN' ? 'PRODUCTION' : 'READY']}
                      </button>
                    </div>
                  )}
                  {isLab && data.canMarkReady && (
                    <button
                      onClick={() => advance('mark-ready')}
                      disabled={busy}
                      className="btn-accent flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-[#090d16] disabled:opacity-50"
                    >
                      Mark Ready for Shipping Pickup
                    </button>
                  )}
                </div>
              </section>
            )}

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
                        className="btn-accent flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-[#090d16] disabled:opacity-50"
                      >
                        Confirm Package Pickup
                      </button>
                    </div>
                  )}

                  {data.shipStatus && data.shipStatus !== 'DELIVERED' && (
                    <button
                      onClick={advanceShip}
                      disabled={busy}
                      className="btn-accent flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-[#090d16] disabled:opacity-50"
                    >
                      Update: {data.shipStatus === 'PENDING' ? 'Confirm Pickup' : data.shipStatus === 'PICKED_UP' ? 'Mark In Transit' : 'Mark Delivered'}
                    </button>
                  )}
                </div>
              </section>
            )}

            {error && <p className="text-xs font-bold text-red-400">{error}</p>}
          </div>

          {/* Right Column: Prescription & Chat */}
          <div className="space-y-6">
            {!isShipping && data.prescription && (
              <section className="dentrio-card rounded-2xl p-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">Digital Prescription</h2>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Restoration', data.prescription.restorationType],
                    ['Tooth', data.prescription.toothNumber],
                    ['Material', data.prescription.material],
                    ['Shade', data.prescription.shade],
                    ['Due Date', data.prescription.dueDate],
                  ].map(([k, v]) => (
                    <div key={k as string} className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{k}</dt>
                      <dd className="mt-1 font-bold text-[var(--text)]">{v || '—'}</dd>
                    </div>
                  ))}
                  {data.prescription.notes && (
                    <div className="col-span-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Margin Notes</dt>
                      <dd className="mt-1 whitespace-pre-wrap font-bold text-[var(--text)]">{data.prescription.notes}</dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            {!isShipping ? (
              <Chat caseId={data.id} />
            ) : (
              <div className="dentrio-card rounded-2xl border-dashed p-6 text-xs font-medium text-[var(--text-muted)]">
                Clinical records and chat messages are strictly private. Shipping couriers only access verified addresses and Case ID.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
