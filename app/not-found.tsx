'use client';

import Link from 'next/link';
import { FadeIn } from '../components/FadeIn';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      <FadeIn>
        <section className="space-y-4">
          <h1 className="text-6xl font-bold text-indigo-600 dark:text-indigo-400">404</h1>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">
            Page not found
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </section>
      </FadeIn>

      <FadeIn delayMs={80}>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
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
            Back to Home
          </Link>
          <Link
            href="/book"
            className="inline-block rounded-lg border-2 border-indigo-600 dark:border-indigo-500 px-6 py-3 text-base font-semibold text-indigo-600 dark:text-indigo-400 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#eef2ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            Book a Session
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
