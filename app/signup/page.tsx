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
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (user) {
        // User is already logged in, redirect to home
        router.push('/');
        return;
      }
      
      setIsCheckingAuth(false);
    }
    
    checkAuth();
  }, [router]);

  useEffect(() => {
    // Load reCAPTCHA script
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
      // reCAPTCHA not configured, skip verification
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

    // First, check if email already exists
    try {
      const checkResponse = await fetch('/api/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const checkData = await checkResponse.json();
      
      if (checkData.exists) {
        setError('An account with this email already exists. Please log in instead.');
        setIsLoading(false);
        return;
      }
    } catch (checkError) {
      console.error('Error checking email:', checkError);
      // Continue with signup if check fails
    }

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
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
      },
    });

    if (authError) {
      // Check if the error is due to email already existing
      const errorMessage = authError.message.toLowerCase();
      if (
        errorMessage.includes('already registered') ||
        errorMessage.includes('user already exists') ||
        errorMessage.includes('email already exists') ||
        errorMessage.includes('already been registered')
      ) {
        setError('An account with this email already exists. Please log in instead.');
      } else {
        setError(authError.message);
      }
      setIsLoading(false);
      return;
    }

    // Check if user was actually created
    // Supabase may return success but not create a user if email already exists
    if (!authData.user) {
      setError('An account with this email already exists. Please log in instead.');
      setIsLoading(false);
      return;
    }

    // Additional check: Verify the user was actually created by checking if we can get the user
    // If email confirmation is required, Supabase might return a user object but not actually create it
    // if the email already exists. Let's check the user's ID and email match.
    if (authData.user.email && authData.user.email.toLowerCase() !== email.trim().toLowerCase()) {
      setError('An account with this email already exists. Please log in instead.');
      setIsLoading(false);
      return;
    }

    // Check if this is a new user or an existing one
    // If the user was created more than 10 seconds ago, it's likely an existing user (duplicate)
    const userCreatedAt = authData.user.created_at ? new Date(authData.user.created_at).getTime() : null;
    const now = Date.now();
    const isNewUser = userCreatedAt && (now - userCreatedAt) < 10000; // Created within last 10 seconds

    // Profile is automatically created by the database trigger
    // Wait for the profile to be created to verify the user was actually created
    if (authData.user?.id) {
      const userId = authData.user.id;
      
      // If user was created a while ago, it's definitely a duplicate
      if (!isNewUser) {
        setError('An account with this email already exists. Please log in instead.');
        setIsLoading(false);
        return;
      }
      
      let profileCheck = null;
      let attempts = 0;
      const maxAttempts = 10; // 5 seconds total (10 * 500ms) - give trigger more time
      
      // Check for profile creation with retries
      while (!profileCheck && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data, error } = await supabase
          .from('profiles')
          .select('id, created_at')
          .eq('id', userId)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking profile:', error);
          // If it's a permission error, wait a bit more
          if (attempts < maxAttempts - 1) {
            attempts++;
            continue;
          }
        }
        
        if (data) {
          // Check if profile was created recently (within last 15 seconds)
          // If profile exists but was created a while ago, it's a duplicate
          const profileCreatedAt = data.created_at ? new Date(data.created_at).getTime() : null;
          if (profileCreatedAt && (now - profileCreatedAt) < 15000) {
            profileCheck = data;
            break;
          } else if (profileCreatedAt) {
            // Profile exists but was created a while ago - this is a duplicate
            setError('An account with this email already exists. Please log in instead.');
            setIsLoading(false);
            return;
          }
        }
        
        attempts++;
      }

      // If profile doesn't exist after waiting and user is new, it might just be slow
      // But if user is old, it's definitely a duplicate
      if (!profileCheck && !isNewUser) {
        setError('An account with this email already exists. Please log in instead.');
        setIsLoading(false);
        return;
      }
    } else {
      // No user ID means user wasn't created
      setError('An account with this email already exists. Please log in instead.');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    
    // Check if email confirmation is required
    // If user.email_confirmed_at is null, they need to verify their email
    if (!authData.user.email_confirmed_at) {
      setSuccess('Account created! Please check your email to verify your account before logging in.');
      // Clear form after a delay
      setTimeout(() => {
        setEmail('');
        setPassword('');
        setFullName('');
      }, 2000);
    } else {
      // Email confirmation not required, redirect to home
      router.push('/?signedup=true');
    }
  }

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <FadeIn>
          <div className="space-y-4 rounded-2xl border-2 border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 shadow-sm text-center">
            <p className="text-slate-600 dark:text-slate-400">Checking authentication...</p>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <FadeIn>
        <section className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 md:text-4xl">Create an account</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Sign up to access Basket LSAT tutoring resources and materials.
          </p>
        </section>
      </FadeIn>

      <FadeIn delayMs={60}>
        <form
          onSubmit={handleSignUp}
          className="space-y-4 rounded-2xl border-2 border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 shadow-sm"
        >
          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Full name
            </label>
            <input
              id="signup-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none ring-indigo-100 dark:ring-indigo-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none ring-indigo-100 dark:ring-indigo-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none ring-indigo-100 dark:ring-indigo-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-2"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Must be at least 6 characters</p>
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
            {isLoading ? 'Creating account…' : 'Sign up'}
          </button>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 underline-offset-2 hover:text-indigo-700 hover:underline"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#4338ca';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '';
                e.currentTarget.style.textDecoration = '';
              }}
            >
              Log in
            </Link>
          </p>
        </form>
      </FadeIn>
    </div>
  );
}
