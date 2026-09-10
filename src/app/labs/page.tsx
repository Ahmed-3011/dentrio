'use client';

import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';

type Lab = {
  id: number;
  labName: string;
  description: string;
  specialties: string;
  materials: string;
  turnaroundDays: number | null;
  address: string;
  maps_url?: string;
  caseCount: number;
  isPreferred: boolean;
};

export default function LabsPage() {
  const [user, setUser] = useState<any>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  async function loadLabs(q = '') {
    const url = q ? `/api/labs?q=${encodeURIComponent(q)}` : '/api/labs';
    const res = await fetch(url);
    if (res.ok) setLabs(await res.json());
  }

  useEffect(() => {
    (async () => {
      const me = await fetch('/api/auth/me');
      if (me.ok) setUser(await me.json());
      await loadLabs();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadLabs(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const isDentist = user?.user?.role === 'DENTIST';

  async function prefer(lab: Lab) {
    const res = await fetch(`/api/labs/${lab.id}/prefer`, { method: 'POST' });
    if (res.ok) {
      setNotice(`Set ${lab.labName} as your preferred lab.`);
      await loadLabs(search);
      setTimeout(() => setNotice(''), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
      <NavBar role={user?.user?.role} name={user?.user?.name} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">Dental Lab Directory</h1>
            <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
              {isDentist
                ? 'Browse verified dental labs, review specialties, and select your preferred partner.'
                : 'Registered lab network available to clinics on Dentrio.'}
            </p>
          </div>
          <input
            type="text"
            placeholder="Search by specialty, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="dentrio-input w-72 rounded-xl px-4 py-2.5 text-xs font-medium"
          />
        </div>

        {notice && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs font-bold text-emerald-400">
            {notice}
          </div>
        )}

        {loading ? (
          <p className="mt-8 text-sm font-semibold text-[var(--text-muted)]">Loading lab network…</p>
        ) : labs.length === 0 ? (
          <div className="dentrio-card mt-6 rounded-2xl border-dashed p-10 text-center text-sm font-semibold text-[var(--text-muted)]">
            No dental labs found matching your query.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {labs.map((lab) => (
              <div key={lab.id} className="dentrio-card rounded-2xl p-6 transition hover:border-[var(--accent)]">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text)]">{lab.labName}</h3>
                    {lab.isPreferred && (
                      <span className="mt-1 inline-block rounded-md border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        ★ Preferred Lab Partner
                      </span>
                    )}
                  </div>
                  <span className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1 font-mono text-xs font-bold text-[var(--accent)]">
                    {lab.caseCount} order{lab.caseCount === 1 ? '' : 's'}
                  </span>
                </div>
                {lab.description && (
                  <p className="mt-2.5 text-xs font-medium leading-relaxed text-[var(--text-muted)]">{lab.description}</p>
                )}
                
                {/* Lab Specialties Badges */}
                <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                  {lab.specialties &&
                    lab.specialties.split(',').map((s) => (
                      <span key={s} className="rounded-md border border-[rgba(42,127,255,0.25)] bg-[var(--accent-dim)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent-light)]">
                        {s.trim()}
                      </span>
                    ))}
                </div>

                {/* Turnaround & Address Details */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-3 text-xs font-semibold text-[var(--text-muted)]">
                  <div>
                    {lab.turnaroundDays != null && <span>⏱ <strong className="text-[var(--accent)]">{lab.turnaroundDays}d</strong> turnaround</span>}
                    {lab.address && <span className="ml-2">· {lab.address}</span>}
                  </div>

                  {/* Google Maps Location Button */}
                  {(lab.maps_url || lab.address) && (
                    <a
                      href={lab.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lab.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-[var(--accent-light)] hover:underline flex items-center gap-1"
                    >
                      📍 Maps ↗
                    </a>
                  )}
                </div>

                {isDentist && (
                  <button
                    onClick={() => prefer(lab)}
                    disabled={lab.isPreferred}
                    className="btn-accent mt-4 w-full rounded-xl py-2 text-xs font-bold disabled:opacity-40"
                  >
                    {lab.isPreferred ? '★ Preferred Partner' : 'Set as Preferred Lab'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
