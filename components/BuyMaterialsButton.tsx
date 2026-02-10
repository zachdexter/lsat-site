'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function BuyMaterialsButton() {

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // NOTE: Purchasing is temporarily disabled until more materials are available.
  // We intentionally do NOT call the checkout API from here right now.

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

  // If user already has access, show thank you message (regardless of purchase state)
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
        disabled
        className="w-full rounded-lg bg-slate-300 dark:bg-slate-600 px-6 py-3 text-center text-base font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
      >
        Purchase materials access
      </button>
      <p className="text-xs text-slate-600 dark:text-slate-400">Work in progress — stay tuned.</p>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

