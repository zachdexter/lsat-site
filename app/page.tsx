import Link from 'next/link';
import { FadeIn } from '../components/FadeIn';

export default function HomePage() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <FadeIn>
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
          <div className="flex-1 space-y-5">
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
            >
              Book a session
            </Link>
          </div>
          {/* Optional placeholder for a future image */}
          <div className="flex-1 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm p-6 text-center text-sm text-indigo-100">
            Tutor photo / promo graphic
          </div>
        </div>
        </section>
      </FadeIn>

      {/* How it works */}
      <FadeIn>
        <section id="how-it-works" className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">How tutoring works</h2>
          <p className="mt-2 text-slate-600">Three simple steps to get started</p>
        </div>
        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="absolute left-0 right-0 top-16 hidden h-0.5 bg-gradient-to-r from-indigo-200 via-indigo-300 to-indigo-200 md:block"></div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <FadeIn delayMs={0} className="flex flex-col">
              <div className="group relative flex flex-1 flex-col rounded-2xl border-2 border-indigo-100 bg-white p-8 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1">
                <div className="absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-xl font-bold text-white shadow-lg ring-4 ring-white">
                  1
                </div>
                <h3 className="mb-3 mt-2 text-xl font-semibold text-slate-900">Book a time</h3>
                <p className="flex-1 text-slate-600 leading-relaxed">
                  Pick a 60-minute slot that fits your schedule through the booking page.
                </p>
              </div>
            </FadeIn>
            
            <FadeIn delayMs={80} className="flex flex-col">
              <div className="group relative flex flex-1 flex-col rounded-2xl border-2 border-indigo-100 bg-white p-8 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1">
                <div className="absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-xl font-bold text-white shadow-lg ring-4 ring-white">
                  2
                </div>
                <h3 className="mb-3 mt-2 text-xl font-semibold text-slate-900">Share your goals</h3>
                <p className="flex-1 text-slate-600 leading-relaxed">
                  Before the session, you can share recent PT scores and sections you want to focus on.
                </p>
              </div>
            </FadeIn>
            
            <FadeIn delayMs={160} className="flex flex-col">
              <div className="group relative flex flex-1 flex-col rounded-2xl border-2 border-indigo-100 bg-white p-8 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1">
                <div className="absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-xl font-bold text-white shadow-lg ring-4 ring-white">
                  3
                </div>
                <h3 className="mb-3 mt-2 text-xl font-semibold text-slate-900">Targeted practice</h3>
                <p className="flex-1 text-slate-600 leading-relaxed">
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
        <section className="space-y-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 p-8 md:p-10">
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Pricing Options</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <FadeIn delayMs={0} className="h-full">
            <div className="rounded-xl bg-white p-6 shadow-md border-2 border-indigo-100 transition-all duration-300 hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1">
            <h3 className="mb-2 text-xl font-semibold text-slate-900">One-on-One Sessions</h3>
            <p className="mb-4 text-2xl font-bold text-indigo-600">$30/hour</p>
            <p className="mb-4 text-slate-600">
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
            <div className="rounded-xl bg-white p-6 shadow-md border-2 border-indigo-100 transition-all duration-300 hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1">
            <h3 className="mb-2 text-xl font-semibold text-slate-900">Materials Access</h3>
            <p className="mb-4 text-2xl font-bold text-indigo-600">$450</p>
            <p className="mb-4 text-slate-600">
              Lifetime access to video library, study guides, and all future content additions.
            </p>
            <Link
              href="/pricing"
              className="inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-md"
            >
              View details
            </Link>
            </div>
          </FadeIn>
        </div>
        <div className="pt-4">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-base font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
          >
            See full pricing breakdown
            <span className="text-xl">→</span>
          </Link>
        </div>
        </section>
      </FadeIn>

      {/* Future: videos/resources */}
      <FadeIn>
        <section className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-8 md:p-10">
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Videos & resources</h2>
        <p className="text-lg leading-relaxed text-slate-600">
          Soon, this site will host a library of LSAT explanation videos and
          study guides. For now, 1-on-1 tutoring is the main focus.
        </p>
        </section>
      </FadeIn>
    </div>
  );
}
