'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { FadeIn } from '../../components/FadeIn';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  useEffect(() => {
    // Load reCAPTCHA script
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
      console.warn('reCAPTCHA site key not configured');
      return;
    }

    // Check if script is already loaded
    if (document.querySelector(`script[src*="recaptcha"]`)) {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => setRecaptchaLoaded(true));
      }
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => setRecaptchaLoaded(true));
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if component unmounts - remove script and badge
      const existingScript = document.querySelector(`script[src*="recaptcha"]`);
      if (existingScript) {
        existingScript.remove();
      }
      // Remove reCAPTCHA badge if it exists
      const badge = document.querySelector('.grecaptcha-badge');
      if (badge) {
        badge.remove();
      }
    };
  }, []);

  // Add CSS to style and position the reCAPTCHA badge
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'recaptcha-badge-style';
    style.textContent = `
      .grecaptcha-badge {
        visibility: visible !important;
        opacity: 0.7 !important;
        transition: opacity 0.3s !important;
        position: fixed !important;
        bottom: 0 !important;
        right: 0 !important;
        z-index: 9999 !important;
        margin: 0 !important;
      }
      .grecaptcha-badge:hover {
        opacity: 1 !important;
      }
      /* On mobile, move it to bottom-left to avoid sidebar */
      @media (max-width: 768px) {
        .grecaptcha-badge {
          left: 0 !important;
          right: auto !important;
        }
      }
      /* On desktop, ensure it doesn't overlap with sidebar */
      @media (min-width: 769px) {
        .grecaptcha-badge {
          right: 0 !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById('recaptcha-badge-style');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    // Verify reCAPTCHA if configured
    if (siteKey && recaptchaLoaded && window.grecaptcha) {
      try {
        // Get reCAPTCHA token
        const token = await window.grecaptcha.execute(siteKey, {
          action: 'signup',
        });

        // Verify token on server
        const verifyResponse = await fetch('/api/verify-recaptcha', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const verifyData = await verifyResponse.json();

        console.log('reCAPTCHA verification result:', verifyData);

        if (!verifyResponse.ok || !verifyData.success) {
          console.error('reCAPTCHA verification failed:', verifyData);
          setError('reCAPTCHA verification failed. Please try again.');
          setIsLoading(false);
          return;
        }
      } catch (recaptchaError) {
        console.error('reCAPTCHA error:', recaptchaError);
        setError('Security verification failed. Please refresh the page and try again.');
        setIsLoading(false);
        return;
      }
    } else if (siteKey && !recaptchaLoaded) {
      setError('Security verification is loading. Please wait a moment and try again.');
      setIsLoading(false);
      return;
    }

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
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-indigo-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2"
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-indigo-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a strong password"
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-indigo-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2"
            />
            <p className="mt-1 text-xs text-slate-500">Must be at least 6 characters</p>
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
            {isLoading ? 'Creating account…' : 'Sign up'}
          </button>

          <p className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 underline-offset-2 hover:text-indigo-700 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </FadeIn>
    </div>
  );
}
