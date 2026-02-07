'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { FadeIn } from '../../components/FadeIn';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Handle the hash parameters from Supabase
    const handleHash = async () => {
      if (typeof window === 'undefined') return;

      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (type === 'recovery' && accessToken) {
        try {
          // Set the session using the tokens from the URL
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (sessionError) {
            console.error('Error setting session:', sessionError);
            setIsValidToken(false);
            return;
          }

          setIsValidToken(true);
          // Clear the hash from URL
          window.history.replaceState({}, '', '/reset-password');
        } catch (err) {
          console.error('Error processing reset link:', err);
          setIsValidToken(false);
        }
      } else {
        setIsValidToken(false);
      }
    };

    handleHash();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    // Verify we have a valid session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError('Invalid or expired reset link. Please request a new one.');
      setIsLoading(false);
      return;
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);

    // Redirect to login after a short delay
    setTimeout(() => {
      router.push('/login?password=reset');
    }, 2000);
  }

  // Prevent hydration mismatch by only rendering after mount
  if (!isMounted || isValidToken === null) {
    return (
      <FadeIn>
        <div className="mx-auto max-w-md space-y-6">
          <p className="text-center text-sm text-slate-500">Verifying reset link...</p>
        </div>
      </FadeIn>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <FadeIn>
          <section className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Invalid reset link</h1>
            <p className="text-slate-600 text-sm">
              This password reset link is invalid or has expired.
            </p>
          </section>
        </FadeIn>

        <FadeIn delayMs={60}>
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 md:p-8 text-center">
            <p className="mb-4 text-sm text-red-900">
              Please request a new password reset link.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/forgot-password"
                className="inline-block rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
              >
                Request new link
              </Link>
              <Link
                href="/login"
                className="inline-block rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-700"
              >
                Back to login
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <FadeIn>
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 md:p-8 text-center">
            <p className="mb-4 text-lg font-semibold text-emerald-900">
              Password reset successfully!
            </p>
            <p className="mb-4 text-sm text-emerald-800">
              Redirecting you to the login page...
            </p>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <FadeIn>
        <section className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Set new password</h1>
          <p className="text-slate-600 text-sm">
            Enter your new password below.
          </p>
        </section>
      </FadeIn>

      <FadeIn delayMs={60}>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-6 md:p-8 shadow-sm"
        >
          <div>
            <label htmlFor="reset-password" className="block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              id="reset-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-indigo-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2"
            />
            <p className="mt-1 text-xs text-slate-500">Must be at least 6 characters</p>
          </div>

          <div>
            <label htmlFor="reset-confirm" className="block text-sm font-medium text-slate-700">
              Confirm new password
            </label>
            <input
              id="reset-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-indigo-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Resetting password...' : 'Reset password'}
          </button>

          <p className="text-center text-xs text-slate-500">
            <Link href="/login" className="font-semibold text-indigo-600 underline-offset-2 hover:text-indigo-700 hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      </FadeIn>
    </div>
  );
}
