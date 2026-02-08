'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';
import { FadeIn } from '../../components/FadeIn';

type Profile = {
  full_name: string | null;
  role: string | null;
  membership_status: string | null;
};

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        setProfile(null);
        return;
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, role, membership_status')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        // Error loading profile, will show null state
      }

      setProfile({
        full_name: data?.full_name ?? null,
        role: (data?.role as string) ?? null,
        membership_status: (data?.membership_status as string) ?? null,
      });
      setIsLoading(false);
    }

    loadProfile();
  }, []);

  if (isLoading) {
    return (
      <FadeIn>
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading your profile…</p>
        </div>
      </FadeIn>
    );
  }

  if (!profile) {
    return (
      <FadeIn>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Profile</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">You need to be logged in to view your profile.</p>
          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-400 hover:scale-[1.02] active:scale-95"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#818cf8';
              e.currentTarget.style.color = '#4338ca';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '';
              e.currentTarget.style.color = '';
              e.currentTarget.style.transform = '';
            }}
          >
            ← Back to home
          </Link>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <section className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Profile</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            View your account information and materials access status.
          </p>
        </section>
      </FadeIn>

      <FadeIn delayMs={120}>
        <section className="space-y-4 rounded-2xl border-2 border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Name</p>
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100">{profile.full_name || 'No name set'}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Materials access</p>
            <p className="text-sm text-slate-800 dark:text-slate-200 capitalize">
              {profile.role === 'admin' 
                ? 'Admin Access' 
                : profile.membership_status === 'active' 
                  ? 'Active' 
                  : profile.membership_status === 'trial' 
                    ? 'Trial' 
                    : 'No access'}
            </p>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}

