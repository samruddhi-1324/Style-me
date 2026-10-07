const FALLBACK_REDIRECT = '/account';

export function safeRedirectTarget(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return FALLBACK_REDIRECT;
  }

  try {
    const destination = new URL(value, 'https://styleme.local');
    return destination.origin === 'https://styleme.local'
      ? `${destination.pathname}${destination.search}${destination.hash}`
      : FALLBACK_REDIRECT;
  } catch {
    return FALLBACK_REDIRECT;
  }
}

export function loginHref(redirectTo: string): string {
  return `/login?redirect=${encodeURIComponent(safeRedirectTarget(redirectTo))}`;
}

export function routeWithRedirect(path: string, redirectTo: string): string {
  const query = new URLSearchParams({ redirect: safeRedirectTarget(redirectTo) });
  return `${path}?${query.toString()}`;
}
