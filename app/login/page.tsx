'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { FadeIn } from '../../components/FadeIn';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // This effect runs only on the client because the page is a client component.
    // Read query params from window.location instead of useSearchParams to avoid
    // SSR Suspense requirements during build.
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);

      // Check for password reset success message
      if (params.get('password') === 'reset') {
        setSuccess('Password reset successfully! You can now log in with your new password.');
        window.history.replaceState({}, '', '/login');
      }

      // Check for email verification message
      if (params.get('verified') === 'true') {
        setSuccess('Email verified successfully! You can now log in.');
        window.history.replaceState({}, '', '/login');
      }

      // Load remembered email if available
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email.trim());
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      if (authError) {
        setError(authError.message);
        return;
      }

      if (!data.user) {
        setError('Unable to log in. Please try again.');
        return;
      }

      // Check if user is admin and redirect accordingly
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please refresh the page and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <FadeIn>
        <section className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 md:text-4xl">Log in</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Sign in to access your Basket LSAT account.
          </p>
        </section>
      </FadeIn>

      <FadeIn delayMs={60}>
        <form
          onSubmit={handleLogin}
          className="space-y-4 rounded-2xl border-2 border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 shadow-sm"
        >
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none ring-indigo-100 dark:ring-indigo-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-2"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#4338ca';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '';
                  e.currentTarget.style.textDecoration = '';
                }}
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none ring-indigo-100 dark:ring-indigo-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-2"
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500"
            />
            <label htmlFor="remember-me" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
              Remember me
            </label>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 p-3 text-xs text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 p-3 text-xs text-emerald-800 dark:text-emerald-200">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#4f46e5';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.boxShadow = '';
              }
            }}
          >
            {isLoading ? 'Logging in…' : 'Log in'}
          </button>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-indigo-600 underline-offset-2 hover:text-indigo-700 hover:underline"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#4338ca';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '';
                e.currentTarget.style.textDecoration = '';
              }}
            >
              Sign up
            </Link>
          </p>
        </form>
      </FadeIn>
    </div>
  );
}
