'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FadeIn } from '../../components/FadeIn';
import { LoadingSkeleton, TableSkeleton, CardSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';

type User = {
  id: string;
  full_name: string | null;
  role: string | null;
  membership_status: string | null;
  created_at: string;
};

export default function AdminDashboardPage() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isUsersCollapsed, setIsUsersCollapsed] = useState(false);

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

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading profile in admin check:', profileError);
      }
      console.log('Admin check profile:', profile);

      setIsAdmin(profile?.role === 'admin');
      setIsChecking(false);

      // If admin, load users
      if (profile?.role === 'admin') {
        loadUsers();
      }
    }

    checkAdmin();
  }, []);

  async function loadUsers() {
    setIsLoadingUsers(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, membership_status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading users:', error);
    } else {
      setUsers(data || []);
    }
    setIsLoadingUsers(false);
  }

  if (isChecking) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-10" />
        <CardSkeleton />
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

      <div className="space-y-8">
        {/* Users table - collapsible, above video section */}
        <FadeIn delayMs={0}>
          <section className="rounded-2xl border-2 border-indigo-100 bg-white p-6 md:p-8 shadow-sm">
            <button
              type="button"
              onClick={() => setIsUsersCollapsed(!isUsersCollapsed)}
              className="flex w-full items-center justify-between gap-4"
            >
              <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">Current users</h2>
              <span className="text-lg text-slate-400 transition-transform">
                {isUsersCollapsed ? '▼' : '▲'}
              </span>
            </button>

            {!isUsersCollapsed && (
              <div className="mt-4">
            {isLoadingUsers ? (
              <TableSkeleton />
            ) : users.length === 0 ? (
              <EmptyState
                title="No users yet"
                message="User accounts will appear here once people sign up."
              />
            ) : (
                  <div className="-mx-4 overflow-x-auto md:mx-0">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Role
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Joined
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="whitespace-nowrap px-4 py-2 font-medium text-slate-900">
                              {user.full_name || 'No name'}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2 text-slate-600 capitalize">
                              {user.role || 'none'}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2">
                              <StatusBadge status={user.membership_status} />
                            </td>
                            <td className="whitespace-nowrap px-4 py-2 text-xs text-slate-500">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        </FadeIn>

        {/* Video upload / management */}
        <FadeIn delayMs={120}>
          <section className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-6 md:p-8 shadow-sm">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">Video library</h2>
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
                </div>

                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Video upload not yet implemented.');
                  }}
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md hover:scale-105 active:scale-95"
                >
                  Upload video
                </button>
              </form>
            </div>
          </section>
        </FadeIn>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        ● Active
      </span>
    );
  }

  if (status === 'trial') {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
        ● Trial
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
      ● None
    </span>
  );
}
