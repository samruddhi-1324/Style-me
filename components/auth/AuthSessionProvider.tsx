'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { safeRedirectTarget } from '@/lib/auth/redirect';
import { GOOGLE_REDIRECT_SESSION_KEY, authService } from '@/lib/services/authService';
import { useStore } from '@/lib/store';

function takeGoogleRedirect(): string {
  try {
    const target = window.sessionStorage.getItem(GOOGLE_REDIRECT_SESSION_KEY);
    window.sessionStorage.removeItem(GOOGLE_REDIRECT_SESSION_KEY);
    return safeRedirectTarget(target);
  } catch (error) {
    console.error('Unable to restore the destination requested before Google sign-in.', error);
    return '/account';
  }
}

export default function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const started = useRef(false);
  const setAuthenticatedUser = useStore((state) => state.setAuthenticatedUser);
  const setAuthStatus = useStore((state) => state.setAuthStatus);
  const logout = useStore((state) => state.logout);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let active = true;
    const completeSessionCheck = async () => {
      const currentUrl = new URL(window.location.href);
      const oauthResult = currentUrl.searchParams.get('oauth');
      if (oauthResult === 'error') {
        const redirectTo = takeGoogleRedirect();
        router.replace(`/login?oauth=error&redirect=${encodeURIComponent(redirectTo)}`);
      }

      if (!authService.isEnabled()) {
        logout();
        return;
      }

      try {
        const user = await authService.getCurrentUser();
        if (!active) return;
        if (useStore.getState().authStatus !== 'loading') return;
        if (user) {
          setAuthenticatedUser(user);
        } else {
          logout();
        }

        if (oauthResult === 'success') {
          const redirectTo = takeGoogleRedirect();
          router.replace(user ? redirectTo : `/login?oauth=error&redirect=${encodeURIComponent(redirectTo)}`);
        }
      } catch (error) {
        if (!active) return;
        if (useStore.getState().authStatus !== 'loading') return;
        console.error('Unable to verify the StyleMe authentication session.', error);
        setAuthStatus('error');
      }
    };

    void completeSessionCheck();
    return () => {
      active = false;
      started.current = false;
    };
  }, [logout, router, setAuthStatus, setAuthenticatedUser]);

  return children;
}
