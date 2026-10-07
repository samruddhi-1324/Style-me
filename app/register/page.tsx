import { RegisterForm } from '@/components/auth/AuthPages';
import { safeRedirectTarget } from '@/lib/auth/redirect';

type RegisterPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { redirect } = await searchParams;
  return <RegisterForm redirectTo={safeRedirectTarget(redirect)} />;
}
