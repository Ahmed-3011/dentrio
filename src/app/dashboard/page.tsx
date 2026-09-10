'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

const STATUS_COLOR: Record<string, string> = {
  SUBMITTED: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  REVIEW: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  DESIGN: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  PRODUCTION: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  READY: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  SHIPPED: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  CLOSED: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
};

type AnyCase = {
  id: number;
  code: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  counterpart: string | null;
  scanOriginalName: string | null;
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
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
        <main className="mx-auto max-w-6xl p-8 text-sm font-semibold text-[var(--text-muted)]">Loading dashboard data…</main>
      </div>
    );
  }

  const isDentist = user?.user?.role === 'DENTIST';
  const isLab = user?.user?.role === 'LAB';
  const isShipping = user?.user?.role === 'SHIPPING';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
      <NavBar role={user?.user?.role} name={user?.user?.name} />
      
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">
              Welcome back{user?.user?.name ? `, ${user.user.name.split(' ')[0]}` : ''}
            </h1>
            <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
              {isDentist && 'Send 3D scans to dental labs, preview CAD designs, and track order stages.'}
              {isLab && 'Manage incoming digital prescriptions, design CAD models, and hand off to production.'}
              {isShipping && 'Pickup, track, and complete shipping logistics for finalized cases.'}
            </p>
          </div>

          <div>
            {isDentist && (
              <Link
                href="/cases/new"
                className="btn-accent inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
              >
                <span>+</span> Create New Case
              </Link>
            )}
            {isLab && (
              <Link
                href="/cases"
                className="btn-accent inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
              >
                View Incoming Cases
              </Link>
            )}
            {isShipping && (
              <Link
                href="/shipping"
                className="btn-accent inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
              >
                Open Shipping Queue
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="dentrio-card rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Case Volume</p>
            <p className="mt-2 text-4xl font-black text-[var(--text)]">{user?.caseCount ?? 0}</p>
          </div>
          <div className="dentrio-card rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Active Pipeline</p>
            <p className="mt-2 text-4xl font-black text-[var(--accent)]">{user?.activeCount ?? 0}</p>
          </div>
          <div className="dentrio-card rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Your Role & Privilege</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xl font-extrabold text-[var(--text)]">
                {user?.user?.role === 'DENTIST' ? 'Dentist' : user?.user?.role === 'LAB' ? 'Dental Lab' : 'Shipping'}
              </span>
              <span className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-0.5 text-xs font-bold text-[var(--accent)]">
                {user?.user?.privilege || 'normal'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        {user?.profile && (
          <div className="dentrio-card mt-6 rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">Organization & Profile Details</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 text-sm font-semibold sm:grid-cols-2 lg:grid-cols-3">
              {isDentist && (
                <>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                    <span className="text-xs text-[var(--text-muted)]">Clinic Name:</span>
                    <p className="text-sm font-bold text-[var(--text)]">{user.profile.clinic_name || '—'}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                    <span className="text-xs text-[var(--text-muted)]">Preferred Lab:</span>
                    <p className="text-sm font-bold text-[var(--accent)]">{user.profile.preferredLabName || 'None Selected'}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                    <span className="text-xs text-[var(--text-muted)]">Contact Phone:</span>
                    <p className="text-sm font-bold text-[var(--text)] font-mono">{user.user.phone || '—'}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3 sm:col-span-2">
                    <span className="text-xs text-[var(--text-muted)]">Address & Location:</span>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-sm font-bold text-[var(--text)]">{user.profile.address || '—'}</p>
                      {user.profile.maps_url ? (
                        <a
                          href={user.profile.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                        >
                          📍 Google Maps ↗
                        </a>
                      ) : user.profile.address ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(user.profile.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                        >
                          📍 Google Maps ↗
                        </a>
                      ) : null}
                    </div>
                  </div>
                </>
              )}
              {isLab && (
                <>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                    <span className="text-xs text-[var(--text-muted)]">Lab Facility:</span>
                    <p className="text-sm font-bold text-[var(--text)]">{user.profile.lab_name}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                    <span className="text-xs text-[var(--text-muted)]">Avg. Turnaround:</span>
                    <p className="text-sm font-bold text-[var(--accent)]">{user.profile.turnaround_days ?? '—'} Business Days</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                    <span className="text-xs text-[var(--text-muted)]">Contact Phone:</span>
                    <p className="text-sm font-bold text-[var(--text)] font-mono">{user.user.phone || '—'}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3 sm:col-span-2">
                    <span className="text-xs text-[var(--text-muted)]">Specialties:</span>
                    <p className="text-sm font-bold text-[var(--text)]">{user.profile.specialties || '—'}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3 sm:col-span-3">
                    <span className="text-xs text-[var(--text-muted)]">Lab Facility Address & Location:</span>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-sm font-bold text-[var(--text)]">{user.profile.address || '—'}</p>
                      {user.profile.maps_url ? (
                        <a
                          href={user.profile.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                        >
                          📍 View on Google Maps ↗
                        </a>
                      ) : user.profile.address ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(user.profile.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                        >
                          📍 View on Google Maps ↗
                        </a>
                      ) : null}
                    </div>
                  </div>
                </>
              )}
              {isShipping && (
                <>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                    <span className="text-xs text-[var(--text-muted)]">Logistics Company:</span>
                    <p className="text-sm font-bold text-[var(--text)]">{user.profile.company_name || '—'}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                    <span className="text-xs text-[var(--text-muted)]">Contact Phone:</span>
                    <p className="text-sm font-bold text-[var(--text)] font-mono">{user.user.phone || '—'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Recent Cases Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold tracking-tight text-[var(--text)]">Recent Case Orders</h2>
            <Link href="/cases" className="text-xs font-bold text-[var(--accent)] hover:underline">
              View All Cases →
            </Link>
          </div>

          {cases.length === 0 ? (
            <div className="dentrio-card mt-4 rounded-2xl border-dashed p-10 text-center text-sm font-semibold text-[var(--text-muted)]">
              {isDentist && 'No cases submitted yet. Create your first case to upload an STL scan to a dental lab.'}
              {isLab && 'No cases assigned yet. Dentists who select your lab will appear in your queue.'}
              {isShipping && 'No packages currently awaiting pickup.'}
            </div>
          ) : (
            <div className="dentrio-card mt-4 overflow-hidden rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[var(--border)] bg-[var(--bg-elevated)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <tr>
                      <th className="px-5 py-3.5">Case Code</th>
                      <th className="px-5 py-3.5">{isDentist ? 'Assigned Lab' : isLab ? 'Doctor / Clinic' : 'Lab Source'}</th>
                      <th className="px-5 py-3.5">Status Pipeline</th>
                      <th className="px-5 py-3.5">Submission Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {cases.slice(0, 8).map((c) => (
                      <tr key={c.id} className="transition hover:bg-[var(--bg-elevated)]/50">
                        <td className="px-5 py-4 font-mono font-bold">
                          <Link href={`/cases/${c.id}`} className="text-[var(--accent)] hover:underline">
                            {c.code}
                          </Link>
                        </td>
                        <td className="px-5 py-4 font-medium text-[var(--text)]">{c.counterpart || '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold ${STATUS_COLOR[c.status] || 'bg-slate-500/10 text-slate-400'}`}>
                            {c.statusLabel}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-medium text-[var(--text-muted)]">
                          {new Date(c.createdAt + 'Z').toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
