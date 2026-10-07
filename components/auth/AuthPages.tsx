'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { routeWithRedirect, safeRedirectTarget } from '@/lib/auth/redirect';
import { authService } from '@/lib/services/authService';
import { useStore } from '@/lib/store';

type AuthPageProps = {
  redirectTo?: string;
  googleAuthError?: boolean;
};

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthShell({
  children,
  heading,
  description,
  eyebrow,
}: {
  children: React.ReactNode;
  heading: string;
  description: string;
  eyebrow: string;
}) {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-visual">
          <Link href="/" className="auth-brand" aria-label="StyleMe Eyewear home">
            Style<span>Me</span>
            <small>EYEWEAR</small>
          </Link>
          <div className="auth-visual-copy">
            <span className="tag">A clearer kind of confidence</span>
            <h2>See the<br /><em>better you.</em></h2>
            <p>Thoughtful frames, made for the way you see the world.</p>
          </div>
          <div className="auth-frame-art" aria-hidden="true">
            <svg viewBox="0 0 360 126" fill="none">
              <path d="M18 26c21-14 65-18 91-8 13 5 19 19 20 40 2 34-15 52-47 52-27 0-47-14-56-38L18 26Z" stroke="currentColor" strokeWidth="5" />
              <path d="M342 26c-21-14-65-18-91-8-13 5-19 19-20 40-2 34 15 52 47 52 27 0 47-14 56-38l10-46Z" stroke="currentColor" strokeWidth="5" />
              <path d="M129 46c13-11 28-12 51-12s38 1 51 12" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              <path d="m18 26-13-8M342 26l13-8" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="auth-visual-caption">
            <span>01 / 03</span>
            <span>Find your frame. Find your focus.</span>
          </div>
        </div>

        <div className="auth-form-panel">
          <Link href="/" className="auth-brand auth-mobile-brand" aria-label="StyleMe Eyewear home">
            Style<span>Me</span><small>EYEWEAR</small>
          </Link>
          <div className="auth-form-heading">
            <p className="auth-eyebrow">{eyebrow}</p>
            <h1>{heading}</h1>
            <p>{description}</p>
          </div>
          {children}
          <div className="auth-preview-note">
            <span aria-hidden="true">✦</span>
            {authService.isEnabled()
              ? 'Sign-in is handled by the StyleMe backend. Google credentials are handled by Google and are never stored here.'
              : 'Sign-in is currently unavailable on this deployment until the StyleMe backend is hosted.'}
          </div>
        </div>
      </div>
    </section>
  );
}

function EmailField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label className="auth-field">
      <span>Email</span>
      <input
        className="input-field"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'auth-email-error' : undefined}
      />
      {error && <span id="auth-email-error" className="auth-field-error">{error}</span>}
    </label>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  error,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  const errorId = `auth-${label.toLowerCase().replace(/\s+/g, '-')}-error`;

  return (
    <label className="auth-field">
      <span>{label}</span>
      <span className="auth-password-wrap">
        <input
          className="input-field"
          type={visible ? 'text' : 'password'}
          name={label.toLowerCase().replace(/\s+/g, '-')}
          autoComplete={autoComplete}
          placeholder="••••••••"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        <button
          type="button"
          className="auth-show-password"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </span>
      {error && <span id={errorId} className="auth-field-error">{error}</span>}
    </label>
  );
}

function Divider() {
  return <div className="auth-divider"><span>OR</span></div>;
}

function GoogleButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  const available = authService.isEnabled();
  return (
    <button
      type="button"
      className="auth-google-button"
      onClick={onClick}
      disabled={disabled || !available}
      title={available ? undefined : 'Google sign-in is unavailable until the backend is hosted.'}
    >
      <span className="auth-google-g" aria-hidden="true">G</span>
      {available ? 'Continue with Google' : 'Google sign-in unavailable'}
    </button>
  );
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Email is required.';
  if (!emailPattern.test(email.trim())) return 'Enter a valid email address.';
  return undefined;
}

export function LoginForm({ redirectTo: target, googleAuthError = false }: AuthPageProps) {
  const router = useRouter();
  const redirectTo = safeRedirectTarget(target);
  const setAuthenticatedUser = useStore((state) => state.setAuthenticatedUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>(() => (
    googleAuthError
      ? { form: 'Google sign-in could not be completed. Please try again or sign in with your email.' }
      : {}
  ));
  const [loading, setLoading] = useState(false);

  const finishSignIn = (destination: string) => router.replace(safeRedirectTarget(destination));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = { email: validateEmail(email) };
    if (!password) nextErrors.password = 'Password is required.';
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setLoading(true);
    try {
      const user = await authService.login({ email: email.trim(), password });
      setAuthenticatedUser(user);
      finishSignIn(redirectTo);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Unable to sign in. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrors({});
    try {
      authService.startGoogleSignIn(redirectTo);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Unable to continue with Google.' });
      setLoading(false);
    }
  };

  const forgotHref = routeWithRedirect('/forgot-password', redirectTo);
  const registerHref = routeWithRedirect('/register', redirectTo);

  return (
    <AuthShell
      eyebrow="Your StyleMe space"
      heading="Welcome Back"
      description="Sign in to revisit the frames and details you love."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <EmailField value={email} onChange={setEmail} error={errors.email} />
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete="current-password"
        />
        <div className="auth-forgot-row">
          <Link href={forgotHref}>Forgot Password?</Link>
        </div>
        {errors.form && <p className="auth-form-error" role="alert">{errors.form}</p>}
        <button className="btn-primary auth-submit" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
          {!loading && <span aria-hidden="true">→</span>}
        </button>
      </form>

      <Divider />
      <GoogleButton onClick={handleGoogleSignIn} disabled={loading} />
      <p className="auth-switch-copy">
        Don&apos;t have an account? <Link href={registerHref}>Create Account</Link>
      </p>
    </AuthShell>
  );
}

export function RegisterForm({ redirectTo: target }: AuthPageProps) {
  const router = useRouter();
  const redirectTo = safeRedirectTarget(target);
  const setAuthenticatedUser = useStore((state) => state.setAuthenticatedUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = { email: validateEmail(email) };
    if (!name.trim()) nextErrors.name = 'Full name is required.';
    else if (name.trim().split(/\s+/).length < 2) nextErrors.name = 'Enter your first and last name.';
    if (!password) nextErrors.password = 'Password is required.';
    else if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      nextErrors.password = 'Use at least 8 characters, including a letter and a number.';
    }
    if (!confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email || nextErrors.password || nextErrors.confirmPassword) return;

    setLoading(true);
    try {
      setAuthenticatedUser(await authService.register({ name: name.trim(), email: email.trim(), password }));
      router.replace(redirectTo);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Unable to create your account. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrors({});
    try {
      authService.startGoogleSignIn(redirectTo);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Unable to continue with Google.' });
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Start seeing things differently"
      heading="Create Account"
      description="Save your favourites and keep your eyewear details close."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="auth-field">
          <span>Full Name</span>
          <input
            className="input-field"
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Your full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'auth-name-error' : undefined}
          />
          {errors.name && <span id="auth-name-error" className="auth-field-error">{errors.name}</span>}
        </label>
        <EmailField value={email} onChange={setEmail} error={errors.email} />
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
        {errors.form && <p className="auth-form-error" role="alert">{errors.form}</p>}
        <button className="btn-primary auth-submit" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
          {!loading && <span aria-hidden="true">→</span>}
        </button>
      </form>

      <Divider />
      <GoogleButton onClick={handleGoogleSignIn} disabled={loading} />
      <p className="auth-switch-copy">
        Already have an account? <Link href={routeWithRedirect('/login', redirectTo)}>Sign In</Link>
      </p>
    </AuthShell>
  );
}

export function ForgotPasswordForm({ redirectTo: target }: AuthPageProps) {
  const redirectTo = safeRedirectTarget(target);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailError = validateEmail(email);
    setError(emailError);
    setSent(false);
    if (emailError) return;

    setLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setSent(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to process this request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      heading="Forgot your password?"
      description="Password recovery is not connected yet. No reset email will be sent."
    >
      {sent ? (
        <div className="auth-success-message" role="status">
          <span aria-hidden="true">✓</span>
          <div>
            <strong>Request received</strong>
            <p>Password recovery isn’t available yet. No reset email was sent.</p>
          </div>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <EmailField value={email} onChange={setEmail} error={error} />
          <button className="btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send Reset Link'}
            {!loading && <span aria-hidden="true">→</span>}
          </button>
        </form>
      )}
      <p className="auth-switch-copy auth-back-link">
        <Link href={routeWithRedirect('/login', redirectTo)}>← Back to Login</Link>
      </p>
    </AuthShell>
  );
}
