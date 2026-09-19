'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import type { AnyCase, ApiMe } from '@/lib/types';

const STATUS_COLOR: Record<string, string> = {
  SUBMITTED: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  REVIEW: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  DESIGN: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  PRODUCTION: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  READY: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  SHIPPED: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  CLOSED: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
};

export default function CasesPage() {
  const [user, setUser] = useState<ApiMe | null>(null);
  const [cases, setCases] = useState<AnyCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [meRes, casesRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/cases/list'),
      ]);
      if (meRes.ok) setUser(await meRes.json());
      if (casesRes.ok) setCases(await casesRes.json());
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <NavBar role="" name="" />
        <main className="mx-auto max-w-6xl p-8 text-sm font-semibold text-[var(--text-muted)]">Loading cases…</main>
      </div>
    );
  }

  const role = user?.user?.role;
  const isDentist = role === 'DENTIST';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
      <NavBar role={role} name={user?.user?.name} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">Case Directory</h1>
            <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
              Manage and track digital dental orders through every milestone.
            </p>
          </div>
          {isDentist && (
            <Link
              href="/cases/new"
              className="btn-accent inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
            >
              <span>+</span> New Case
            </Link>
          )}
        </div>

        {cases.length === 0 ? (
          <div className="dentrio-card mt-6 rounded-2xl border-dashed p-10 text-center text-sm font-semibold text-[var(--text-muted)]">
            {isDentist
              ? 'No active cases. Click "+ New Case" to upload an STL scan.'
              : 'No cases currently assigned in this queue.'}
          </div>
        ) : (
          <div className="dentrio-card mt-6 overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--bg-elevated)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  <tr>
                    <th className="px-5 py-3.5">Case Code</th>
                    <th className="px-5 py-3.5">{isDentist ? 'Dental Lab' : 'Doctor / Clinic'}</th>
                    <th className="px-5 py-3.5">Scan File</th>
                    <th className="px-5 py-3.5">Current Status</th>
                    <th className="px-5 py-3.5">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {cases.map((c) => (
                    <tr key={c.id} className="transition hover:bg-[var(--bg-elevated)]/50">
                      <td className="px-5 py-4 font-mono font-bold">
                        <Link href={`/cases/${c.id}`} className="text-[var(--accent)] hover:underline">
                          {c.code}
                        </Link>
                      </td>
                      <td className="px-5 py-4 font-medium text-[var(--text)]">{c.counterpart || '—'}</td>
                      <td className="px-5 py-4 font-mono text-xs text-[var(--text-muted)]">{c.scanOriginalName || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold ${STATUS_COLOR[c.status] || 'bg-slate-500/10 text-slate-400'}`}>
                          {c.statusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-[var(--text-muted)]">
                        {new Date((c.updatedAt || c.createdAt) + 'Z').toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
