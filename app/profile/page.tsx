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

      const { data } = await supabase
        .from('profiles')
        .select('full_name, role, membership_status')
        .eq('id', user.id)
        .maybeSingle();

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
          <p className="text-sm text-slate-500">Loading your profile…</p>
        </div>
      </FadeIn>
    );
  }

  if (!profile) {
    return (
      <FadeIn>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          <p className="text-sm text-slate-600">You need to be logged in to view your profile.</p>
          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-700"
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
          <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-600 text-sm">
            This page will eventually let you manage your membership and personal information. For now, it just shows
            what&apos;s stored in your profile.
          </p>
        </section>
      </FadeIn>

      <FadeIn delayMs={120}>
        <section className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-6 md:p-8">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</p>
            <p className="text-lg font-medium text-slate-900">{profile.full_name || 'No name set'}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</p>
            <p className="text-sm text-slate-800">
              {profile.role === 'admin'
                ? 'Admin'
                : profile.role === 'member'
                ? 'Member'
                : profile.role === 'trial'
                ? 'Trial'
                : 'None'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Membership status</p>
            <p className="text-sm text-slate-800 capitalize">{profile.membership_status || 'none'}</p>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}

