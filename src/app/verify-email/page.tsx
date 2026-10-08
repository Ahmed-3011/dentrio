import { Suspense } from 'react';
import VerifyEmailClient from './VerifyEmailClient';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="text-sm font-semibold text-[var(--text-muted)]">Checking your verification link…</p>}>
      <VerifyEmailClient />
    </Suspense>
  );
}