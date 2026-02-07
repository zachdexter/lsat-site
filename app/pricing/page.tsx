import Link from 'next/link';
import { BuyMaterialsButton } from '../../components/BuyMaterialsButton';

export default function PricingPage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Pricing & Packages
        </p>
        <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
          Choose the option that works for you
        </h1>
        <p className="text-lg leading-relaxed text-slate-600">
          Whether you&apos;re looking for comprehensive study materials or personalized 
          one-on-one tutoring, we have options to fit your needs and budget.
        </p>
      </section>

      {/* Pricing Cards */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Materials Package */}
        <div className="rounded-2xl border-2 border-indigo-200 bg-white p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-bold text-slate-900">Materials Access</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-indigo-600">$450</span>
              <span className="text-slate-600">one-time</span>
            </div>
          </div>
          
          <p className="mb-6 text-lg text-slate-700">
            Get lifetime access to our comprehensive LSAT study materials library.
          </p>

          <div className="mb-8 space-y-4">
            <h3 className="font-semibold text-slate-900">What&apos;s included:</h3>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 shrink-0 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Access to video library with LSAT explanation videos</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 shrink-0 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Study guides and practice materials</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 shrink-0 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Future content additions (videos, resources, and more)</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 shrink-0 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Lifetime access - no recurring fees</span>
              </li>
            </ul>
          </div>

          <div className="mb-6 rounded-lg bg-indigo-50 p-4 text-sm text-slate-700">
            <p className="font-medium">Note:</p>
            <p>Materials are being added regularly. Purchase now to get access to all current and future content.</p>
          </div>

          <BuyMaterialsButton />
        </div>

        {/* One-on-One Sessions */}
        <div className="rounded-2xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-blue-50 p-8 shadow-lg">
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900">One-on-One Sessions</h2>
              <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white">Popular</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-indigo-600">$30</span>
              <span className="text-slate-600">per hour</span>
            </div>
          </div>

          <p className="mb-6 text-lg text-slate-700">
            Personalized tutoring sessions tailored to your specific needs and goals.
          </p>

          <div className="mb-8 space-y-4">
            <h3 className="font-semibold text-slate-900">What you get:</h3>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 shrink-0 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>60-minute focused sessions</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 shrink-0 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Personalized study plan based on your goals</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 shrink-0 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Targeted practice on your weak areas</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 shrink-0 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Flexible scheduling - book as needed</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 shrink-0 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No commitment - pay per session</span>
              </li>
            </ul>
          </div>

          <Link
            href="/book"
            className="block w-full rounded-lg bg-indigo-600 px-6 py-3 text-center text-base font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-md"
          >
            Book a session
          </Link>
        </div>
      </div>

      {/* FAQ / Additional Info */}
      <section className="space-y-6 rounded-2xl border-2 border-indigo-100 bg-white p-8 md:p-10">
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-semibold text-slate-900">Can I book multiple sessions at once?</h3>
            <p className="text-slate-600">
              Yes! You can book single sessions or schedule recurring weekly sessions. 
              Each session is billed at $30/hour. For longer sessions, you can book 
              multiple consecutive time slots through the booking page.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-slate-900">Do I need to purchase materials access to book sessions?</h3>
            <p className="text-slate-600">
              No, materials access and one-on-one sessions are separate. You can book 
              sessions without purchasing materials, or purchase materials without booking 
              sessions. Many students find value in combining both.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-slate-900">What if I want to try a session first?</h3>
            <p className="text-slate-600">
              Absolutely! You can book a single one-hour session to see if the tutoring 
              style works for you. There&apos;s no commitment required.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 p-8 md:p-10 text-center">
        <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">Ready to get started?</h2>
        <p className="mb-6 text-lg text-indigo-100">
          Book a session or learn more about our materials package.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/book"
            className="inline-block rounded-lg bg-white px-6 py-3 text-base font-semibold text-indigo-600 transition-all hover:bg-indigo-50 hover:shadow-lg"
          >
            Book a session
          </Link>
          <Link
            href="/about"
            className="inline-block rounded-lg border-2 border-white px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white/10"
          >
            Learn more
          </Link>
        </div>
      </section>
    </div>
  );
}

