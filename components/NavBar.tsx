'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export function NavBar() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [hasUser, setHasUser] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // On mount, check if there is an existing session and profile
  useEffect(() => {
    async function loadUser() {
      setIsLoadingUser(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log('Supabase user in NavBar (on mount):', user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .maybeSingle();

        console.log('Loaded profile (on mount):', profile);
        setHasUser(true);
        setFullName(profile?.full_name ?? null);
        setIsAdmin(profile?.role === 'admin');
      }

      setIsLoadingUser(false);
    }

    loadUser();
  }, []);

  // Auto-clear flash messages after a short delay
  useEffect(() => {
    if (!error && !success) return;

    const timer = setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [error, success]);

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', data.user.id)
        .maybeSingle();

      console.log('Loaded profile after login:', profile);
      const isUserAdmin = profile?.role === 'admin';
      setHasUser(true);
      setFullName(profile?.full_name ?? null);
      setIsAdmin(isUserAdmin);
      setSuccess('Logged in successfully.');

      if (isUserAdmin) {
        router.push('/admin');
      }
    }

    setShowLogin(false);
    setEmail('');
    setPassword('');
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setHasUser(false);
    setFullName(null);
    setShowLogin(false);
    setEmail('');
    setPassword('');
    setError(null);
    setSuccess('Logged out.');
    router.push('/');
  }

  function formatNavName(name: string | null) {
    if (!name) return null;
    const first = name.trim().split(/\s+/)[0] || '';
    const max = 10;
    if (first.length <= max) return first;
    return `${first.slice(0, max)}…`;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-indigo-100 bg-white/80 backdrop-blur-sm shadow-sm">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <Link href="/" className="text-xl font-bold text-slate-900 transition-colors hover:text-indigo-600">
          Basket LSAT
        </Link>

        <div className="flex items-center gap-3 md:gap-5 text-sm md:text-base">
          <Link href="/" className="font-medium text-slate-700 transition-colors hover:text-indigo-600">
            Home
          </Link>
          <Link href="/about" className="font-medium text-slate-700 transition-colors hover:text-indigo-600">
            About
          </Link>
          <Link href="/pricing" className="font-medium text-slate-700 transition-colors hover:text-indigo-600">
            Pricing
          </Link>
          <Link href="/book" className="font-medium text-slate-700 transition-colors hover:text-indigo-600">
            Book a Session
          </Link>

          {/* Divider */}
          <span className="hidden h-6 w-px bg-slate-200 md:inline-block" />

          {!isLoadingUser && hasUser ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link
                href="/profile"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs md:text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-700 hover:shadow-md"
              >
                {formatNavName(fullName) ?? 'Profile'}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLogin((open) => !open)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs md:text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-700 hover:shadow-md"
              >
                Log in
              </button>

              {showLogin && (
                <form
                  onSubmit={handleLoginSubmit}
                  className="absolute right-0 mt-3 w-72 rounded-2xl border border-slate-200 bg-white/95 p-4 text-sm shadow-xl"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Log in</p>
                      <p className="text-[11px] text-slate-500">Use your Basket LSAT account email and password.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLogin(false)}
                      className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label htmlFor="admin-username" className="block text-xs font-medium text-slate-700">
                        Email
                      </label>
                      <input
                        id="admin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 outline-none ring-indigo-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="admin-password" className="block text-xs font-medium text-slate-700">
                        Password
                      </label>
                      <input
                        id="admin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 outline-none ring-indigo-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2"
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-1.5 w-full rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
                    >
                      Log in
                    </button>
                    {error && <p className="text-[11px] text-red-600">{error}</p>}
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

      </nav>
      {/* Flash messages */}
      {(success || error) && (
        <div className="pointer-events-none fixed left-1/2 top-16 z-40 -translate-x-1/2 px-4">
          <div
            className={`pointer-events-auto max-w-md rounded-full border px-4 py-2 text-xs font-medium shadow-md ${
              success
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {success || error}
          </div>
        </div>
      )}
    </header>
  );
}

