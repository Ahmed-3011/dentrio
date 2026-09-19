'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import type { ApiMe } from '@/lib/types';

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

export default function NewCasePage() {
  const router = useRouter();
  const [user, setUser] = useState<ApiMe | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLab, setSelectedLab] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [prescription, setPrescription] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLab) return setError('Please select a dental lab.');
    if (!file) return setError('Please upload a 3D scan file (.stl or .ply).');
    setError('');
    setBusy(true);

    const fd = new FormData();
    fd.set('labUserId', String(selectedLab));
    fd.set('scan', file);
    fd.set('restorationType', prescription.restorationType || '');
    fd.set('toothNumber', prescription.toothNumber || '');
    fd.set('material', prescription.material || '');
    fd.set('shade', prescription.shade || '');
    fd.set('dueDate', prescription.dueDate || '');
    fd.set('notes', prescription.notes || '');

    try {
      const res = await fetch('/api/cases', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create case');
        setBusy(false);
        return;
      }
      router.push(`/cases/${data.caseId}`);
    } catch {
      setError('Network error submitting case');
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <NavBar role={user?.user?.role} name={user?.user?.name} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">New Dental Case</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Select a verified lab partner, attach the 3D scan file, and complete the digital prescription.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Lab Selection Section */}
          <section className="dentrio-card rounded-2xl p-6">
            <h2 className="text-base font-bold text-[var(--text)]">1. Choose Dental Lab</h2>
            <div className="mt-3">
              <input
                type="text"
                placeholder="Search by lab name, materials (Zirconia), or specialties…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="dentrio-input w-full rounded-xl px-4 py-3 text-sm"
              />
            </div>

            <div className="mt-4 max-h-[380px] space-y-2.5 overflow-y-auto pr-1">
              {labs.length === 0 && (
                <p className="py-8 text-center text-sm font-medium text-[var(--text-muted)]">
                  No dental labs found matching search.
                </p>
              )}
              {labs.map((lab) => (
                <button
                  key={lab.id}
                  type="button"
                  onClick={() => setSelectedLab(lab.id)}
                  className={
                    'w-full rounded-xl border p-4 text-left transition ' +
                    (selectedLab === lab.id
                      ? 'border-[var(--accent)] bg-[var(--accent-dim)] shadow-md shadow-[var(--accent-glow)]'
                      : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)]')
                  }
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[var(--text)]">
                      {lab.labName}
                      {lab.isPreferred && (
                        <span className="ml-2 rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                          Preferred Lab
                        </span>
                      )}
                    </p>
                    <span className="text-xs font-semibold text-[var(--accent)]">
                      {lab.turnaroundDays != null ? `${lab.turnaroundDays}d turnaround` : ''}
                    </span>
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

          {/* Scan & Prescription Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {/* 3D Scan Upload */}
            <section className="dentrio-card rounded-2xl p-6">
              <h2 className="text-base font-bold text-[var(--text)]">2. Upload 3D Intraoral Scan</h2>
              <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-6 text-center transition hover:border-[var(--accent)]">
                <input
                  type="file"
                  accept=".stl,.ply"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="flex flex-col items-center">
                  <span className="text-3xl">🦷</span>
                  <p className="mt-2 text-sm font-bold text-[var(--text)]">
                    {file ? file.name : 'Click or drop STL / PLY file here'}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Direct browser-based 3D preview enabled
                  </p>
                </div>
              </label>
            </section>

            {/* Prescription Form */}
            <section className="dentrio-card rounded-2xl p-6">
              <h2 className="text-base font-bold text-[var(--text)]">3. Prescription Specifications</h2>
              
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Restoration Type
                  </label>
                  <select
                    value={prescription.restorationType || ''}
                    onChange={(e) => setP('restorationType', e.target.value)}
                    className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm"
                  >
                    <option value="">Select Restoration…</option>
                    <option value="Crown">Crown</option>
                    <option value="Bridge">Bridge</option>
                    <option value="Aligner">Clear Aligner</option>
                    <option value="Veneer">Veneer</option>
                    <option value="Implant">Implant Abutment</option>
                    <option value="Inlay / Onlay">Inlay / Onlay</option>
                    <option value="Nightguard">Nightguard / Splint</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Tooth Number(s)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. #14, #19"
                    value={prescription.toothNumber || ''}
                    onChange={(e) => setP('toothNumber', e.target.value)}
                    className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Material
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Multi-layer Zirconia, EMAX"
                    value={prescription.material || ''}
                    onChange={(e) => setP('material', e.target.value)}
                    className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Shade
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A2, BL1, Bleach"
                    value={prescription.shade || ''}
                    onChange={(e) => setP('shade', e.target.value)}
                    className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Required Due Date
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
                  Clinical & Margin Notes
                </label>
                <textarea
                  value={prescription.notes || ''}
                  onChange={(e) => setP('notes', e.target.value)}
                  rows={3}
                  placeholder="Specific margin requirements, contact points, or occlusal notes for the CAD technician…"
                  className="dentrio-input w-full rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>
            </section>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs font-bold text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-accent flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-[#0a0e17] shadow-lg disabled:opacity-50"
            >
              {busy ? 'Uploading scan & submitting…' : 'Submit Case to Dental Lab'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
