'use client';

import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FadeIn } from '../../components/FadeIn';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <FadeIn>
          <section className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Check your email</h1>
            <p className="text-slate-600 text-sm">
              We&apos;ve sent a password reset link to {email}
            </p>
          </section>
        </FadeIn>

        <FadeIn delayMs={60}>
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 md:p-8 text-center">
            <p className="mb-4 text-sm text-emerald-900">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
            <Link
              href="/login"
              className="inline-block rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
            >
              Back to login
            </Link>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <FadeIn>
        <section className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Reset your password</h1>
          <p className="text-slate-600 text-sm">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </section>
      </FadeIn>

      <FadeIn delayMs={60}>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-6 md:p-8 shadow-sm"
        >
          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
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
            {isLoading ? 'Sending...' : 'Send reset link'}
          </button>

          <p className="text-center text-xs text-slate-500">
            Remember your password?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 underline-offset-2 hover:text-indigo-700 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </FadeIn>
    </div>
  );
}
