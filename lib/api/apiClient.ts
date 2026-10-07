export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
};

export type ApiUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
  roles?: string[];
  active?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
};

export const getApiBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

export const isAuthApiEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true'
  || (process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'false' && process.env.NODE_ENV !== 'production');

const isCsrfProtectionEnabled = (): boolean => process.env.NEXT_PUBLIC_CSRF_ENABLED === 'true';

export const buildApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
};

export class ApiRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers ?? {});

  if (!(options.body instanceof FormData) && options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const method = (options.method ?? 'GET').toUpperCase();
  if (isCsrfProtectionEnabled() && !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
    const csrf = await apiRequest<{ headerName: string; token: string }>('/api/v1/auth/csrf');
    headers.set(csrf.headerName, csrf.token);
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers,
    cache: 'no-store',
    credentials: 'include',
  });

  const rawText = await response.text();
  let payload: unknown = null;
  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      if (response.ok) {
        throw new Error('The server returned an unreadable response.');
      }
    }
  }

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'message' in payload
      ? String(payload.message)
      : `Request failed with status ${response.status}`;
    throw new ApiRequestError(message, response.status);
  }

  if (payload && typeof payload === 'object' && 'success' in payload) {
    const envelope = payload as ApiEnvelope<T>;
    if (!envelope.success) {
      throw new Error(envelope.message ?? 'Request failed');
    }

    return envelope.data as T;
  }

  return payload as T;
}

export const authApi = {
  async login(credentials: { email: string; password: string }): Promise<ApiUser> {
    return apiRequest<ApiUser>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(credentials: { email: string; password: string; firstName: string; lastName: string }): Promise<ApiUser> {
    return apiRequest<ApiUser>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async getCurrentUser(): Promise<ApiUser | null> {
    const user = await apiRequest<ApiUser | null>('/api/v1/auth/session', { method: 'GET' });
    return user ?? null;
  },

  async logout(): Promise<void> {
    await apiRequest<void>('/api/v1/auth/logout', { method: 'POST' });
  },
};
