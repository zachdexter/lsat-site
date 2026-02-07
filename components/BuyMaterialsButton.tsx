'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export function BuyMaterialsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setIsCheckingAuth(false);
    }

    checkAuth();
  }, []);

  async function handleClick() {
    if (!isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the session token to send to the server
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('Please log in to purchase materials access.');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const res = await fetch('/api/checkout/materials', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setError('Please log in to purchase materials access.');
          setIsAuthenticated(false);
        } else {
          throw new Error(errorData.error || 'Unable to start checkout. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      const data = (await res.json()) as { url?: string };
      if (!data.url) {
        throw new Error('Missing checkout URL from server.');
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError('Something went wrong starting checkout. Please refresh and try again.');
      setIsLoading(false);
    }
  }

  if (isCheckingAuth) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-lg bg-indigo-400 px-6 py-3 text-center text-base font-semibold text-white cursor-not-allowed"
      >
        Loading…
      </button>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 text-center">
          <p className="mb-4 text-sm font-medium text-amber-900">
            You need to be logged in to purchase materials access.
          </p>
          <div className="space-y-3">
            <Link
              href="/signup"
              className="inline-block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-md"
            >
              Create an account
            </Link>
            <p className="text-xs text-amber-700">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-indigo-700 underline-offset-2 hover:text-indigo-800 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-center text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        {isLoading ? 'Redirecting to checkout…' : 'Purchase materials access'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

