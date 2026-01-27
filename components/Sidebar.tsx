'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [hasUser, setHasUser] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      setIsLoadingUser(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name, membership_status')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error loading profile in Sidebar:', profileError);
        }
        setHasUser(true);
        setFullName(profile?.full_name ?? null);
        setIsAdmin(profile?.role === 'admin');
        setMembershipStatus(profile?.membership_status ?? null);
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
        .select('role, full_name, membership_status')
        .eq('id', data.user.id)
        .maybeSingle();

      const isUserAdmin = profile?.role === 'admin';
      setHasUser(true);
      setFullName(profile?.full_name ?? null);
      setIsAdmin(isUserAdmin);
      setMembershipStatus(profile?.membership_status ?? null);
      setSuccess('Logged in successfully.');

      setShowLogin(false);
      setEmail('');
      setPassword('');

      if (isUserAdmin) {
        router.push('/admin');
      }
    }
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

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/book', label: 'Book a Session' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg border border-slate-200 bg-white p-2 shadow-md md:hidden"
        aria-label="Toggle menu"
      >
        <svg
          className="h-6 w-6 text-slate-700"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 transform border-r border-indigo-100 bg-gradient-to-b from-white to-indigo-50/30 backdrop-blur-sm shadow-xl transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b border-indigo-100 p-6">
            <Link
              href="/"
              onClick={() => {
                setIsOpen(false);
              }}
              className="text-xl font-bold text-slate-900 transition-colors hover:text-indigo-600"
            >
              Basket LSAT
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  setIsOpen(false);
                }}
                className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-indigo-100 text-indigo-700 font-semibold shadow-sm'
                    : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:translate-x-1'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Premium Materials & Admin links */}
            <>
              <div className="my-4 border-t border-slate-200" />
              <Link
                href={isAdmin || membershipStatus === 'active' || membershipStatus === 'trial' ? '/materials' : '/pricing'}
                onClick={() => {
                  setIsOpen(false);
                }}
                className={`block rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive('/materials') || isActive('/pricing')
                    ? 'bg-indigo-200 text-indigo-800 shadow-sm'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:shadow-sm'
                }`}
              >
                Premium Materials
              </Link>
              {hasUser && isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  className={`block rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive('/admin')
                      ? 'bg-indigo-700 text-white shadow-md'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:scale-105'
                  }`}
                >
                  Admin Dashboard
                </Link>
              )}
            </>
          </nav>

          {/* Profile section at bottom */}
          <div className="border-t border-indigo-100 p-4">
            {!isLoadingUser && hasUser ? (
              <div className="space-y-2">
                <Link
                  href="/profile"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive('/profile')
                      ? 'bg-indigo-100 text-indigo-700 font-semibold shadow-sm'
                      : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  {formatNavName(fullName) ?? 'Profile'}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLogin(!showLogin)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:text-indigo-700 hover:shadow-md hover:scale-[1.02]"
                >
                  Login or Sign Up
                </button>

                {showLogin && (
                  <form
                    onSubmit={handleLoginSubmit}
                    className="absolute bottom-full left-0 mb-2 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-xl"
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
                        <label htmlFor="sidebar-email" className="block text-xs font-medium text-slate-700">
                          Email
                        </label>
                        <input
                          id="sidebar-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 outline-none ring-indigo-100 placeholder:text-slate-400 transition-all focus:border-indigo-500 focus:ring-2 focus:shadow-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="sidebar-password" className="block text-xs font-medium text-slate-700">
                          Password
                        </label>
                        <input
                          id="sidebar-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Your password"
                          className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 outline-none ring-indigo-100 placeholder:text-slate-400 transition-all focus:border-indigo-500 focus:ring-2 focus:shadow-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md hover:scale-[1.02] active:scale-95"
                      >
                        Log in
                      </button>
                      {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-[11px] text-red-700">
                          {error}
                        </div>
                      )}
                      <p className="pt-2 text-center text-[11px] text-slate-500">
                        Don&apos;t have an account?{' '}
                        <Link
                          href="/signup"
                          onClick={() => {
                            setShowLogin(false);
                            setIsOpen(false);
                          }}
                          className="font-semibold text-indigo-600 underline-offset-2 hover:text-indigo-700 hover:underline"
                        >
                          Sign up
                        </Link>{' '}
                        here
                      </p>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Flash messages */}
      {(success || error) && (
        <div className="pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 px-4">
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

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
