'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Role = 'DENTIST' | 'LAB' | 'SHIPPING';

const ROLE_HOME: Record<Role, string> = {
  DENTIST: '/dashboard',
  LAB: '/dashboard',
  SHIPPING: '/shipping',
};

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('DENTIST');
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload = {
      email: form.email,
      username: form.username,
      password: form.password,
      name: form.name,
      role,
      clinicName: form.clinicName,
      labName: form.labName,
      companyName: form.companyName,
      specialties: form.specialties,
      materials: form.materials,
      turnaroundDays: form.turnaroundDays ? Number(form.turnaroundDays) : undefined,
      address: form.address,
    };
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        setBusy(false);
        return;
      }
      router.push(ROLE_HOME[role]);
    } catch {
      setError('Network error');
      setBusy(false);
    }
  }

  const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500";

  return (
    <main className="flex flex-1 items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Join the Triad network.</p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {(['DENTIST', 'LAB', 'SHIPPING'] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={
                'rounded-lg border px-3 py-2 text-sm font-medium transition ' +
                (role === r
                  ? 'border-sky-600 bg-sky-50 text-sky-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50')
              }
            >
              {r === 'DENTIST' ? 'Dentist' : r === 'LAB' ? 'Dental Lab' : 'Shipping'}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" required value={form.email || ''} onChange={(e) => set('email', e.target.value)} className={input} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" required minLength={6} value={form.password || ''} onChange={(e) => set('password', e.target.value)} className={input} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
            <input type="text" required value={form.username || ''} onChange={(e) => set('username', e.target.value)} className={input} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Your name</label>
            <input type="text" required value={form.name || ''} onChange={(e) => set('name', e.target.value)} className={input} />
          </div>

          {role === 'DENTIST' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Clinic name</label>
              <input type="text" value={form.clinicName || ''} onChange={(e) => set('clinicName', e.target.value)} className={input} />
            </div>
          )}
          {role === 'LAB' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Lab name</label>
                <input type="text" required value={form.labName || ''} onChange={(e) => set('labName', e.target.value)} className={input} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Specialties</label>
                  <input type="text" placeholder="Crowns, Bridges…" value={form.specialties || ''} onChange={(e) => set('specialties', e.target.value)} className={input} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Materials</label>
                  <input type="text" placeholder="Zirconia, EMAX…" value={form.materials || ''} onChange={(e) => set('materials', e.target.value)} className={input} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Typical turnaround (days)</label>
                <input type="number" min={0} value={form.turnaroundDays || ''} onChange={(e) => set('turnaroundDays', e.target.value)} className={input} />
              </div>
            </>
          )}
          {role === 'SHIPPING' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Company name</label>
              <input type="text" value={form.companyName || ''} onChange={(e) => set('companyName', e.target.value)} className={input} />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
            <input type="text" value={form.address || ''} onChange={(e) => set('address', e.target.value)} className={input} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-sky-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
