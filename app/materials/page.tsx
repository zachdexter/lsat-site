'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';
import { FadeIn } from '../../components/FadeIn';
import { LoadingSkeleton, CardSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';

export default function MaterialsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [videoCount, setVideoCount] = useState(0);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [pdfCount, setPdfCount] = useState(0);
  const [isLoadingPdfs, setIsLoadingPdfs] = useState(false);

  useEffect(() => {
    // Check for success parameter in URL (client-side only)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const purchaseSuccess = params.get('purchase') === 'success';
      if (purchaseSuccess) {
        setShowSuccessMessage(true);
        // Clear the URL parameter after showing the message
        window.history.replaceState({}, '', '/materials');
        // Auto-hide success message after 5 seconds
        const timer = setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  useEffect(() => {
    async function checkAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        setHasAccess(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, membership_status')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        setIsLoading(false);
        setHasAccess(false);
        return;
      }

      const userIsAdmin = profile?.role === 'admin';
      const userHasMembership = profile?.membership_status === 'active' || profile?.membership_status === 'trial';

      setIsAdmin(userIsAdmin);
      setMembershipStatus(profile?.membership_status ?? null);
      setHasAccess(userIsAdmin || userHasMembership);
      setIsLoading(false);

      // If user has access, load video and PDF counts
      if (userIsAdmin || userHasMembership) {
        loadVideoCount();
        loadPdfCount();
      }
    }

    checkAccess();
  }, []);

  async function loadVideoCount() {
    setIsLoadingVideos(true);
    const { count, error } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ready');

    if (error) {
      console.error('Error loading video count:', error);
    } else {
      setVideoCount(count || 0);
    }
    setIsLoadingVideos(false);
  }

  async function loadPdfCount() {
    setIsLoadingPdfs(true);
    const { count, error } = await supabase
      .from('pdfs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error loading PDF count:', error);
    } else {
      setPdfCount(count || 0);
    }
    setIsLoadingPdfs(false);
  }

  if (isLoading) {
    return (
      <FadeIn>
        <div className="space-y-6">
          <LoadingSkeleton className="h-10" />
          <CardSkeleton />
        </div>
      </FadeIn>
    );
  }

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <FadeIn>
          <section className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 md:text-4xl">Premium Materials</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Access to video library, study guides, and exclusive LSAT resources.
            </p>
          </section>
        </FadeIn>

        <FadeIn delayMs={60}>
          <section className="rounded-2xl border-2 border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center shadow-sm md:p-10">
            <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">Materials Access Required</h2>
            <p className="mb-6 text-slate-600 dark:text-slate-300">
              You need materials access to view premium content. Purchase access to get the full video library, study guides, and exclusive content.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/pricing"
                className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
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
                View Pricing
              </Link>
              <Link
                href="/"
                className="inline-block rounded-lg border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-700"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#818cf8';
                  e.currentTarget.style.color = '#4338ca';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '';
                  e.currentTarget.style.color = '';
                }}
              >
                Back to Home
              </Link>
            </div>
          </section>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {showSuccessMessage && (
        <FadeIn>
          <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4 text-center shadow-sm">
            <p className="text-sm font-semibold text-emerald-900">
              🎉 Payment successful! Your membership has been activated.
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              You now have full access to all premium materials.
            </p>
          </div>
        </FadeIn>
      )}

      <FadeIn>
        <section className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 md:text-4xl">Premium Materials</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Access to video library, study guides, and exclusive LSAT resources.
          </p>
        </section>
      </FadeIn>

      <FadeIn delayMs={60}>
        <Link
          href="/materials/videos"
          className="block rounded-2xl border-2 border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] md:p-8 group"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#818cf8';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
            e.currentTarget.style.transform = 'scale(1.01)';
            // Also update the "View all videos" text
            const viewAllText = e.currentTarget.querySelector('span');
            if (viewAllText) {
              viewAllText.style.textDecoration = 'underline';
              viewAllText.style.transform = 'scale(1.05)';
            }
            // Update arrow icon
            const arrowIcon = e.currentTarget.querySelector('svg');
            if (arrowIcon) {
              arrowIcon.style.transform = 'translateX(0.25rem)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '';
            e.currentTarget.style.boxShadow = '';
            e.currentTarget.style.transform = '';
            // Reset the "View all videos" text
            const viewAllText = e.currentTarget.querySelector('span');
            if (viewAllText) {
              viewAllText.style.textDecoration = '';
              viewAllText.style.transform = '';
            }
            // Reset arrow icon
            const arrowIcon = e.currentTarget.querySelector('svg');
            if (arrowIcon) {
              arrowIcon.style.transform = '';
            }
          }}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Video Library</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Comprehensive video explanations for Logical Reasoning and Reading Comprehension. Search, filter, and
                  watch videos organized by section.
                </p>
              </div>
              <svg
                className="ml-4 h-6 w-6 shrink-0 text-indigo-600 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {isLoadingVideos ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading videos...
              </div>
            ) : videoCount === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600">
                No videos available yet. Check back soon!
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-medium">{videoCount}</span>
                  <span>video{videoCount !== 1 ? 's' : ''} available</span>
                </div>
                <span 
                  className="text-sm font-medium text-indigo-600 transition-all"
                  style={{ display: 'inline-block' }}
                >
                  View all videos →
                </span>
              </div>
            )}
          </div>
        </Link>
      </FadeIn>

      <FadeIn delayMs={120}>
        <Link
          href="/materials/study-guides"
          className="block rounded-2xl border-2 border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] md:p-8"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#818cf8';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
            e.currentTarget.style.transform = 'scale(1.01)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '';
            e.currentTarget.style.boxShadow = '';
            e.currentTarget.style.transform = '';
          }}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Study Guides and Notes</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Downloadable PDFs with strategies, answer keys, practice problems, and study notes. Search, filter, and
                  download guides organized by section.
                </p>
              </div>
              <svg
                className="ml-4 h-6 w-6 shrink-0 text-indigo-600 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {isLoadingPdfs ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading study guides...
              </div>
            ) : pdfCount === 0 ? (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-center text-sm text-slate-600 dark:text-slate-400">
                No study guides available yet. Check back soon!
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-medium">{pdfCount}</span>
                  <span>study guide{pdfCount !== 1 ? 's' : ''} available</span>
                </div>
                <span
                  className="text-sm font-medium text-indigo-600 transition-all cursor-pointer"
                  style={{ display: 'inline-block' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = '';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  View all study guides →
                </span>
              </div>
            )}
          </div>
        </Link>
      </FadeIn>

      {isAdmin && (
        <FadeIn delayMs={180}>
          <section className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-900/30 p-4 text-center">
            <p className="text-xs text-indigo-700 dark:text-indigo-300">
              Admin view: You have full access to all materials. Use the{' '}
              <Link href="/admin" className="font-semibold underline underline-offset-2 hover:text-indigo-800">
                Admin Dashboard
              </Link>{' '}
              to manage content.
            </p>
          </section>
        </FadeIn>
      )}
    </div>
  );
}

