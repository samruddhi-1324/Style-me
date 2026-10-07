import { LoginForm } from '@/components/auth/AuthPages';
import { safeRedirectTarget } from '@/lib/auth/redirect';

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string; oauth?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect, oauth } = await searchParams;
  return (
    <LoginForm
      redirectTo={safeRedirectTarget(redirect)}
      googleAuthError={oauth === 'error'}
    />
  );
}
