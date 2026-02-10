'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Load remembered email if available
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
    
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
      } else {
        setHasUser(false);
        setFullName(null);
        setIsAdmin(false);
        setMembershipStatus(null);
      }

      setIsLoadingUser(false);
    }

    loadUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser();
      } else {
        setHasUser(false);
        setFullName(null);
        setIsAdmin(false);
        setMembershipStatus(null);
        setIsLoadingUser(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close mobile menu when pathname changes and reset hover states
  useEffect(() => {
    setIsOpen(false);
    setShowLogin(false);
    
    // Reset any lingering hover styles on navigation links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach((link) => {
      const element = link as HTMLElement;
      element.style.transform = '';
      element.style.backgroundColor = '';
      element.style.color = '';
      element.style.boxShadow = '';
    });
  }, [pathname]);

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

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email.trim());
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      if (error) {
        setError(error.message);
        return;
      }

      if (!data.user) {
        setError('Unable to log in. Please try again.');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name, membership_status')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        // Don't block login if profile read fails—user is still authenticated.
        console.error('Error loading profile after login:', profileError);
      }

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
    } catch (err) {
      console.error('Sidebar login failed:', err);
      setError('Login failed. Please refresh the page and try again.');
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
        className="fixed left-4 top-4 z-50 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-md transition-all hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:shadow-lg md:hidden"
        aria-label="Toggle menu"
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#818cf8';
          e.currentTarget.style.backgroundColor = '#eef2ff';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '';
          e.currentTarget.style.backgroundColor = '';
          e.currentTarget.style.boxShadow = '';
        }}
      >
        <svg
          className="h-6 w-6 text-slate-700 dark:text-slate-300"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 transform border-r border-indigo-100 dark:border-slate-700 bg-gradient-to-b from-white to-indigo-50/30 dark:from-slate-800 dark:to-slate-900 shadow-xl backdrop-blur-sm transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b border-indigo-100 dark:border-slate-700 p-6">
            <Link
              href="/"
              onClick={() => {
                setIsOpen(false);
              }}
              className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#4f46e5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '';
              }}
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
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:translate-x-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
                onMouseEnter={(e) => {
                  if (!isActive(link.href)) {
                    e.currentTarget.style.transform = 'translateX(0.25rem)';
                    // Use appropriate background color based on dark mode
                    const isDark = document.documentElement.classList.contains('dark');
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(67, 56, 202, 0.3)' : '#eef2ff';
                    e.currentTarget.style.color = isDark ? '#818cf8' : '#4f46e5';
                  } else {
                    // Ensure active link doesn't have hover styles
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.color = '';
                  }
                }}
                onMouseLeave={(e) => {
                  // Always reset styles on mouse leave, regardless of active state
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.color = '';
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Premium Materials & Admin links */}
            <>
              <div className="my-4 border-t border-slate-200 dark:border-slate-700" />
              <Link
                href={isAdmin || membershipStatus === 'active' || membershipStatus === 'trial' ? '/materials' : '/pricing'}
                onClick={() => {
                  setIsOpen(false);
                }}
                className={`block rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive('/materials') || isActive('/pricing')
                    ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 shadow-sm'
                    : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 hover:shadow-sm'
                }`}
                onMouseEnter={(e) => {
                  if (!isActive('/materials') && !isActive('/pricing')) {
                    const isDark = document.documentElement.classList.contains('dark');
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(67, 56, 202, 0.4)' : '#e0e7ff';
                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                  } else {
                    // Ensure active link doesn't have hover styles
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.boxShadow = '';
                  }
                }}
                onMouseLeave={(e) => {
                  // Always reset styles on mouse leave
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.boxShadow = '';
                }}
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
                      : 'bg-indigo-600 text-white hover:scale-105 hover:bg-indigo-700 hover:shadow-md'
                  }`}
                  onMouseEnter={(e) => {
                    if (!isActive('/admin')) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.backgroundColor = '#4f46e5';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
                    } else {
                      // Ensure active link doesn't have hover styles
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.boxShadow = '';
                    }
                  }}
                  onMouseLeave={(e) => {
                    // Always reset styles on mouse leave
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
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
                  onMouseEnter={(e) => {
                    if (!isActive('/profile')) {
                      e.currentTarget.style.backgroundColor = '#eef2ff';
                      e.currentTarget.style.color = '#4f46e5';
                    } else {
                      // Ensure active link doesn't have hover styles
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.color = '';
                    }
                  }}
                  onMouseLeave={(e) => {
                    // Always reset styles on mouse leave
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.color = '';
                  }}
                >
                  {formatNavName(fullName) ?? 'Profile'}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-700 hover:scale-[1.02] active:scale-95"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.color = '#334155';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.color = '';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLogin(!showLogin)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-400 hover:shadow-md"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#818cf8';
                    e.currentTarget.style.color = '#4338ca';
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.color = '';
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  Login or Sign Up
                </button>

                {showLogin && (
                  <form
                    onSubmit={handleLoginSubmit}
                    className="absolute bottom-full left-0 mb-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-sm shadow-xl"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Log in</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Use your Basket LSAT account email and password.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowLogin(false)}
                        className="rounded-full p-1 text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
                        aria-label="Close"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f1f5f9';
                          e.currentTarget.style.color = '#475569';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.color = '';
                        }}
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label htmlFor="sidebar-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                          Email
                        </label>
                        <input
                          id="sidebar-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-sm text-slate-900 dark:text-slate-100 outline-none ring-indigo-100 dark:ring-indigo-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-2 focus:shadow-sm"
                        />
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <label htmlFor="sidebar-password" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                            Password
                          </label>
                          <Link
                            href="/forgot-password"
                            onClick={() => {
                              setShowLogin(false);
                              setIsOpen(false);
                            }}
                            className="text-[10px] font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#4338ca';
                              e.currentTarget.style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '';
                              e.currentTarget.style.textDecoration = '';
                            }}
                          >
                            Forgot?
                          </Link>
                        </div>
                        <input
                          id="sidebar-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Your password"
                          className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-sm text-slate-900 dark:text-slate-100 outline-none ring-indigo-100 dark:ring-indigo-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-2 focus:shadow-sm"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          id="sidebar-remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500"
                        />
                        <label htmlFor="sidebar-remember-me" className="ml-2 text-xs text-slate-700 dark:text-slate-300">
                          Remember me
                        </label>
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md hover:scale-[1.02] active:scale-95"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#4f46e5';
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.boxShadow = '';
                          e.currentTarget.style.transform = '';
                        }}
                      >
                        Log in
                      </button>
                      {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-[11px] text-red-700">
                          {error}
                        </div>
                      )}
                      <p className="pt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
                        Don&apos;t have an account?{' '}
                        <Link
                          href="/signup"
                          onClick={() => {
                            setShowLogin(false);
                            setIsOpen(false);
                          }}
                          className="font-semibold text-indigo-600 underline-offset-2 hover:text-indigo-700 hover:underline"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#4338ca';
                            e.currentTarget.style.textDecoration = 'underline';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '';
                            e.currentTarget.style.textDecoration = '';
                          }}
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
              success ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'
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
          onClick={() => {
            setIsOpen(false);
            setShowLogin(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
              setShowLogin(false);
            }
          }}
          role="button"
          tabIndex={-1}
          aria-label="Close menu"
        />
      )}
    </>
  );
}

