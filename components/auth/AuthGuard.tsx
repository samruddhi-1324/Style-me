'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginHref } from '@/lib/auth/redirect';
import { useStore } from '@/lib/store';

export default function AuthGuard({
  children,
  redirectTo,
}: {
  children: React.ReactNode;
  redirectTo: string;
}) {
  const router = useRouter();
  const hasHydrated = useStore((state) => state.hasHydrated);
  const authStatus = useStore((state) => state.authStatus);
  const isAuthenticated = useStore((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (hasHydrated && authStatus === 'unauthenticated' && !isAuthenticated) {
      router.replace(loginHref(redirectTo));
    }
  }, [authStatus, hasHydrated, isAuthenticated, redirectTo, router]);

  if (authStatus === 'error') {
    return (
      <div className="auth-guard-loading" role="alert">
        <span className="auth-loading-mark">Style<span>Me</span></span>
        <span>We couldn’t verify your sign-in. Check your connection and try again.</span>
        <button className="btn-outline" type="button" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  if (!hasHydrated || authStatus === 'loading' || !isAuthenticated) {
    return (
      <div className="auth-guard-loading" role="status" aria-live="polite">
        <span className="auth-loading-mark">Style<span>Me</span></span>
        <span>{authStatus === 'unauthenticated' ? 'Taking you to sign in…' : 'Checking your sign-in…'}</span>
      </div>
    );
  }

  return children;
}
