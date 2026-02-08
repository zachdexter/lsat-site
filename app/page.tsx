'use client';

import Link from 'next/link';
import { FadeIn } from '../components/FadeIn';

export default function HomePage() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <FadeIn>
        <section className="relative mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 dark:from-indigo-800 dark:via-indigo-900 dark:to-indigo-950 p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="relative mx-auto max-w-3xl">
          <div className="space-y-5 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-200">
              1-on-1 LSAT Tutoring
            </p>
            <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
              Raise your LSAT score with focused, personalized sessions.
            </h1>
            <p className="text-lg leading-relaxed text-indigo-100">
              Get expert 1-on-1 LSAT tutoring with Satchel, who specializes in building personalized strategies, strengthening core skills, and boosting your confidence on every section of the LSAT.
            </p>
            <Link
              href="/book"
              className="inline-block rounded-lg bg-white px-6 py-3 text-base font-semibold text-indigo-600 transition-all hover:bg-indigo-50 hover:shadow-lg"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#eef2ff';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              Book a session
            </Link>
          </div>
        </div>
        </section>
      </FadeIn>

      {/* How it works */}
      <FadeIn>
        <section id="how-it-works" className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">How tutoring works</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Three simple steps to get started</p>
        </div>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="absolute left-0 right-0 top-16 hidden h-0.5 bg-gradient-to-r from-indigo-200 via-indigo-300 to-indigo-200 dark:from-indigo-800 dark:via-indigo-700 dark:to-indigo-800 md:block"></div>

          <div className="grid gap-8 md:grid-cols-3">
            <FadeIn delayMs={0} className="flex flex-col">
              <div className="group relative flex flex-1 flex-col rounded-2xl border-2 border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-lg">
                <div className="absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 dark:from-indigo-500 dark:to-blue-500 text-xl font-bold text-white shadow-lg ring-4 ring-white dark:ring-slate-800">
                  1
                </div>
                <h3 className="mb-3 mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Book a time</h3>
                <p className="flex-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Pick a 60-minute slot that fits your schedule through the booking page.
                </p>
              </div>
            </FadeIn>

            <FadeIn delayMs={80} className="flex flex-col">
              <div className="group relative flex flex-1 flex-col rounded-2xl border-2 border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-lg">
                <div className="absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 dark:from-indigo-500 dark:to-blue-500 text-xl font-bold text-white shadow-lg ring-4 ring-white dark:ring-slate-800">
                  2
                </div>
                <h3 className="mb-3 mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Share your goals</h3>
                <p className="flex-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Before the session, you can share recent PT scores and sections you want to focus on.
                </p>
              </div>
            </FadeIn>

            <FadeIn delayMs={160} className="flex flex-col">
              <div className="group relative flex flex-1 flex-col rounded-2xl border-2 border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-lg">
                <div className="absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 dark:from-indigo-500 dark:to-blue-500 text-xl font-bold text-white shadow-lg ring-4 ring-white dark:ring-slate-800">
                  3
                </div>
                <h3 className="mb-3 mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Targeted practice</h3>
                <p className="flex-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                  Sessions focus on the exact question types and timing issues that are holding your score back.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
        </section>
      </FadeIn>

      {/* Pricing Options */}
      <FadeIn>
        <section className="space-y-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 p-8 md:p-10">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">Pricing Options</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <FadeIn delayMs={0} className="h-full">
            <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-md border-2 border-indigo-100 dark:border-slate-700">
            <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">One-on-One Sessions</h3>
            <p className="mb-4 text-2xl font-bold text-indigo-600 dark:text-indigo-400">$30/hour</p>
            <p className="mb-4 text-slate-600 dark:text-slate-300">
              Personalized tutoring sessions tailored to your needs. Book a single session 
              or schedule recurring weekly sessions.
            </p>
            <Link
              href="/book"
              className="inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-md"
            >
              Book a session
            </Link>
            </div>
          </FadeIn>
          <FadeIn delayMs={120} className="h-full">
            <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-md border-2 border-indigo-100 dark:border-slate-700">
            <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Materials Access</h3>
            <p className="mb-4 text-2xl font-bold text-indigo-600 dark:text-indigo-400">$450</p>
            <p className="mb-4 text-slate-600 dark:text-slate-300">
              Lifetime access to video library, study guides, and all future content additions.
            </p>
            <Link
              href="/pricing"
              className="inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-md"
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
              View details
            </Link>
            </div>
          </FadeIn>
        </div>
        <div className="pt-4">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-base font-semibold text-indigo-600 dark:text-indigo-400 transition-colors hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            See full pricing breakdown
            <span className="text-xl">→</span>
          </Link>
        </div>
        </section>
      </FadeIn>

    </div>
  );
}
