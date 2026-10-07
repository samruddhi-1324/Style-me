import { authApi, buildApiUrl, isAuthApiEnabled, type ApiUser } from '@/lib/api/apiClient';
import { safeRedirectTarget } from '@/lib/auth/redirect';
import type { AuthUser } from '@/lib/store';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegistrationDetails extends AuthCredentials {
  name: string;
}

export const GOOGLE_REDIRECT_SESSION_KEY = 'styleme-google-auth-redirect';

function toAuthUser(user: ApiUser): AuthUser {
  const firstName = user.firstName?.trim() ?? '';
  const lastName = user.lastName?.trim() ?? '';
  const name = [firstName, lastName].filter(Boolean).join(' ') || user.email;

  return {
    id: user.id,
    name,
    email: user.email,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
  };
}

export const authService = {
  isEnabled(): boolean {
    return isAuthApiEnabled();
  },

  async login(credentials: AuthCredentials): Promise<AuthUser> {
    if (!isAuthApiEnabled()) {
      throw new Error('Sign-in is unavailable on this deployment until the StyleMe backend is hosted.');
    }
    return toAuthUser(await authApi.login(credentials));
  },

  async register({ name, email, password }: RegistrationDetails): Promise<AuthUser> {
    if (!isAuthApiEnabled()) {
      throw new Error('Account creation is unavailable on this deployment until the StyleMe backend is hosted.');
    }
    const nameParts = name.trim().replace(/\s+/g, ' ').split(' ');
    const firstName = nameParts.shift() ?? '';
    const lastName = nameParts.join(' ');
    if (!lastName) {
      throw new Error('Enter your first and last name to create an account.');
    }

    return toAuthUser(await authApi.register({
      email: email.trim(),
      password,
      firstName,
      lastName,
    }));
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    if (!isAuthApiEnabled()) return null;
    const user = await authApi.getCurrentUser();
    return user ? toAuthUser(user) : null;
  },

  async logout(): Promise<void> {
    if (!isAuthApiEnabled()) return;
    await authApi.logout();
  },

  startGoogleSignIn(redirectTo: string): void {
    if (!isAuthApiEnabled()) {
      throw new Error('Google sign-in is unavailable until the StyleMe backend is hosted.');
    }
    if (typeof window === 'undefined') {
      throw new Error('Google sign-in can only be started in a browser.');
    }

    try {
      window.sessionStorage.setItem(
        GOOGLE_REDIRECT_SESSION_KEY,
        safeRedirectTarget(redirectTo)
      );
    } catch {
      throw new Error('Your browser could not save the sign-in destination. Enable browser storage and try again.');
    }

    window.location.assign(buildApiUrl('/oauth2/authorization/google'));
  },

  async requestPasswordReset(email: string): Promise<void> {
    if (!email.trim()) {
      throw new Error('Enter your email address to continue.');
    }
  },
};
