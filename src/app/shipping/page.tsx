'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

type AnyCase = {
  id: number;
  code: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  counterpart: string | null;
};

export default function ShippingPage() {
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

  const ready = cases.filter((c) => c.status === 'READY');
  const shipped = cases.filter((c) => c.status === 'SHIPPED');

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar role={user?.user?.role} name={user?.user?.name} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Shipping queue</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pick up, track, and deliver completed cases. You only see pickup/delivery addresses and case IDs.
        </p>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800">Ready to pick up ({ready.length})</h2>
          {ready.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No cases awaiting pickup.</p>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {ready.map((c) => (
                <Link
                  key={c.id}
                  href={`/cases/${c.id}`}
                  className="flex items-center justify-between py-3 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-semibold text-sky-700">{c.code}</p>
                    <p className="text-xs text-slate-500">
                      From {c.counterpart || 'lab'} · created {new Date(c.createdAt + 'Z').toLocaleDateString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Ready
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800">In transit / shipped ({shipped.length})</h2>
          {shipped.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No cases in transit.</p>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {shipped.map((c) => (
                <Link
                  key={c.id}
                  href={`/cases/${c.id}`}
                  className="flex items-center justify-between py-3 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-semibold text-sky-700">{c.code}</p>
                    <p className="text-xs text-slate-500">From {c.counterpart || 'lab'}</p>
                  </div>
                  <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
                    Shipped
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
