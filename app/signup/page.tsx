'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { FadeIn } from '../../components/FadeIn';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  function validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  }

  function validatePassword(password: string) {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError(null);
    return true;
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    setIsLoading(true);

    // Sign up the user with Supabase Auth
    // Pass full_name in metadata so the database trigger can use it
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim() || null,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    if (!authData.user) {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
      return;
    }

    // Profile is automatically created by the database trigger
    // No need to manually insert - the trigger handles it

    setIsLoading(false);
    // Redirect to home with a success message (you could use a query param or state)
    router.push('/?signedup=true');
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <FadeIn>
        <section className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Create an account</h1>
          <p className="text-slate-600 text-sm">
            Sign up to access Basket LSAT tutoring resources and materials.
          </p>
        </section>
      </FadeIn>

      <FadeIn delayMs={60}>
        <form
          onSubmit={handleSignUp}
          className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-6 md:p-8 shadow-sm"
        >
          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id="signup-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-indigo-100 placeholder:text-slate-400 transition-all focus:border-indigo-500 focus:ring-2 focus:shadow-md"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={() => validateEmail(email)}
              placeholder="you@example.com"
              required
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-indigo-100 placeholder:text-slate-400 transition-all focus:ring-2 focus:shadow-md ${
                emailError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) validatePassword(e.target.value);
              }}
              onBlur={() => validatePassword(password)}
              placeholder="Choose a strong password"
              required
              minLength={6}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-indigo-100 placeholder:text-slate-400 transition-all focus:ring-2 focus:shadow-md ${
                passwordError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {passwordError ? (
              <p className="mt-1 text-xs text-red-600">{passwordError}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">Must be at least 6 characters</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-xs font-medium text-red-800 shadow-sm">
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {isLoading ? 'Creating account…' : 'Sign up'}
          </button>

          <p className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/" className="font-semibold text-indigo-600 underline-offset-2 hover:text-indigo-700 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </FadeIn>
    </div>
  );
}
