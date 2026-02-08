'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export function BuyMaterialsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      
      if (user) {
        // Check if user already has access
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, membership_status')
          .eq('id', user.id)
          .maybeSingle();
        
        const userIsAdmin = profile?.role === 'admin';
        const userHasMembership = profile?.membership_status === 'active' || profile?.membership_status === 'trial';
        setHasAccess(userIsAdmin || userHasMembership);
      } else {
        setHasAccess(false);
      }
      
      setIsCheckingAuth(false);
    }

    checkAuth();

    // Listen for auth state changes (e.g., when user logs in from sidebar)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthenticated(!!session?.user);
      
      if (session?.user) {
        // Check if user already has access
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, membership_status')
          .eq('id', session.user.id)
          .maybeSingle();
        
        const userIsAdmin = profile?.role === 'admin';
        const userHasMembership = profile?.membership_status === 'active' || profile?.membership_status === 'trial';
        setHasAccess(userIsAdmin || userHasMembership);
      } else {
        setHasAccess(false);
      }
      
      setIsCheckingAuth(false);
    });

    return () => {
      subscription.unsubscribe();
    };
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
      <div className="relative w-full">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            className="flex-1 rounded-lg bg-slate-300 dark:bg-slate-600 px-6 py-3 text-center text-base font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
          >
            Purchase materials access
          </button>
          <div className="relative">
            <button
              type="button"
              className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-400 dark:bg-slate-500 text-white text-xs font-semibold hover:bg-slate-500 dark:hover:bg-slate-400 transition-colors cursor-help"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              aria-label="Information about purchasing materials access"
            >
              i
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-full mt-2 w-64 px-3 py-2 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg shadow-lg z-10">
                Please log in to purchase materials access. You can create an account or log in using the sidebar.
                <div className="absolute -top-1 right-4">
                  <div className="border-4 border-transparent border-b-slate-800 dark:border-b-slate-700"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If user already has access, show thank you message
  if (hasAccess) {
    return (
      <div className="rounded-lg border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 p-6 text-center">
        <p className="text-base font-semibold text-emerald-900 dark:text-emerald-200 mb-2">
          Thank you for your support!
        </p>
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          You already have access to premium materials.
        </p>
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
        onMouseEnter={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.backgroundColor = '#4f46e5';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
            e.currentTarget.style.transform = 'scale(1.02)';
          }
        }}
        onMouseLeave={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.backgroundColor = '';
            e.currentTarget.style.boxShadow = '';
            e.currentTarget.style.transform = '';
          }
        }}
      >
        {isLoading ? 'Redirecting to checkout…' : 'Purchase materials access'}
      </button>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

