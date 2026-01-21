'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FadeIn } from '../../components/FadeIn';

export default function AdminDashboardPage() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsChecking(false);
        setIsAdmin(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      setIsAdmin(profile?.role === 'admin');
      setIsChecking(false);
    }

    checkAdmin();
  }, []);

  if (isChecking) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-500">Checking admin access…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Not authorized</h1>
        <p className="text-slate-600 text-sm">
          You need an admin account to view this dashboard. Please log in with an admin user.
        </p>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-700"
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <FadeIn>
        <section className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Admin Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Internal tools for managing videos and tracking Basket LSAT users.
            </p>
          </div>
          <Link
            href="/"
            className="hidden rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-700 md:inline-block"
          >
            ← Back to site
          </Link>
        </section>
      </FadeIn>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Video upload / management */}
        <FadeIn delayMs={0} className="h-full">
          <section className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">Video library</h2>
              <p className="text-sm text-slate-500">
                Upload new explanation videos and organize your library.
              </p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              Admin only
            </span>
          </div>

          <div className="mt-4 space-y-5">
            {/* Upload form (frontend only for now) */}
            <form
              className="space-y-4 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4 md:p-5"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-800" htmlFor="video-title">
                  Video title
                </label>
                <input
                  id="video-title"
                  type="text"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-indigo-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2"
                  placeholder="e.g. Logic Games - Basic Ordering (PT 52, Game 3)"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-800" htmlFor="video-section">
                  Section
                </label>
                <select
                  id="video-section"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-indigo-100 focus:border-indigo-500 focus:ring-2"
                  defaultValue="lg"
                >
                  <option value="lg">Logic Games (LG)</option>
                  <option value="lr">Logical Reasoning (LR)</option>
                  <option value="rc">Reading Comprehension (RC)</option>
                  <option value="general">General Strategy</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-800" htmlFor="video-file">
                  Video file
                </label>
                <input
                  id="video-file"
                  type="file"
                  className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:transition-colors file:hover:bg-indigo-700"
                />
                <p className="text-xs text-slate-500">
                  For now this is a visual-only form. We&apos;ll wire it up to real storage later.
                </p>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                disabled
              >
                Upload video (coming soon)
              </button>
            </form>

            {/* Placeholder list of recent videos */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">Recent videos (sample)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <div className="space-y-0.5">
                    <p className="font-medium text-slate-900">Logic Games - Basic Ordering</p>
                    <p className="text-xs text-slate-500">Section: LG · 12:34 min</p>
                  </div>
                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    Published
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <div className="space-y-0.5">
                    <p className="font-medium text-slate-900">Logical Reasoning - Necessary Assumptions</p>
                    <p className="text-xs text-slate-500">Section: LR · 18:02 min</p>
                  </div>
                  <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
                    Draft
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        </FadeIn>

        {/* Users table */}
        <FadeIn delayMs={120} className="h-full">
          <section className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">Current users</h2>
                <p className="text-sm text-slate-500">
                  This section will show real Supabase user data (name, email, membership status) once the backend
                  integration is complete.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              User list UI placeholder — no mock data stored in the codebase anymore.
            </div>
          </section>
        </FadeIn>
      </div>
    </div>
  );
}
