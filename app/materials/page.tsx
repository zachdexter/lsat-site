'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';
import { FadeIn } from '../../components/FadeIn';
import { LoadingSkeleton, CardSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';

export default function MaterialsPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Check for success parameter in URL
    const purchaseSuccess = searchParams.get('purchase') === 'success';
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
  }, [searchParams]);

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
    }

    checkAccess();
  }, []);

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
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Premium Materials</h1>
            <p className="text-sm text-slate-600">
              Access to video library, study guides, and exclusive LSAT resources.
            </p>
          </section>
        </FadeIn>

        <FadeIn delayMs={60}>
          <section className="rounded-2xl border-2 border-indigo-100 bg-white p-8 text-center shadow-sm md:p-10">
            <h2 className="mb-3 text-xl font-semibold text-slate-900">Membership Required</h2>
            <p className="mb-6 text-slate-600">
              You need an active membership to access premium materials. Upgrade your account to get access to the full
              video library, study guides, and exclusive content.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/pricing"
                className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
              >
                View Pricing
              </Link>
              <Link
                href="/"
                className="inline-block rounded-lg border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-700"
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
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Premium Materials</h1>
          <p className="text-sm text-slate-600">
            Access to video library, study guides, and exclusive LSAT resources.
          </p>
        </section>
      </FadeIn>

      <FadeIn delayMs={60}>
        <section className="rounded-2xl border-2 border-indigo-100 bg-white p-6 shadow-sm md:p-8">
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-xl font-semibold text-slate-900">Video Library</h2>
              <p className="text-sm text-slate-600">
                Comprehensive video explanations for Logical Reasoning and Reading Comprehension.
              </p>
            </div>

            <EmptyState
              title="Video library coming soon"
              message="Content will be organized by section and practice test. Check back soon!"
            />
          </div>
        </section>
      </FadeIn>

      <FadeIn delayMs={120}>
        <section className="rounded-2xl border-2 border-indigo-100 bg-white p-6 shadow-sm md:p-8">
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-xl font-semibold text-slate-900">Study Guides</h2>
              <p className="text-sm text-slate-600">
                Downloadable PDFs with strategies, answer keys, and practice problems.
              </p>
            </div>

            <EmptyState
              title="Study guides coming soon"
              message="Downloadable PDFs with strategies, answer keys, and practice problems will be available here."
            />
          </div>
        </section>
      </FadeIn>

      {isAdmin && (
        <FadeIn delayMs={180}>
          <section className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 text-center">
            <p className="text-xs text-indigo-700">
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

