import { ForgotPasswordForm } from '@/components/auth/AuthPages';
import { safeRedirectTarget } from '@/lib/auth/redirect';

type ForgotPasswordPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { redirect } = await searchParams;
  return <ForgotPasswordForm redirectTo={safeRedirectTarget(redirect)} />;
}
