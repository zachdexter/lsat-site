'use client';

import { useEffect } from 'react';
import { FadeIn } from '../../components/FadeIn';

const CALENDLY_URL = 'https://calendly.com/satchelbaskette';

export default function BookPage() {
  // Load Calendly assets once
  useEffect(() => {
    if (!document.querySelector('#calendly-widget-css')) {
      const link = document.createElement('link');
      link.id = 'calendly-widget-css';
      link.rel = 'stylesheet';
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      document.head.appendChild(link);
    }

    if (!document.querySelector('#calendly-widget-script')) {
      const script = document.createElement('script');
      script.id = 'calendly-widget-script';
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="space-y-8">
      <FadeIn>
        <section className="space-y-4 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 p-8 md:p-10">
          <h1 className="text-3xl font-bold text-white md:text-4xl">Book a session with Satchel Basket</h1>
          <p className="text-lg leading-relaxed text-indigo-100">
            Choose a time that works for you. You&apos;ll receive a confirmation email with the meeting link and any prep
            details.
          </p>
        </section>
      </FadeIn>

      <FadeIn delayMs={80}>
        <section className="space-y-4">
          {/* Calendly inline widget container (fully interactive for everyone) */}
          <div
            className="calendly-inline-widget rounded-xl border-2 border-indigo-200 bg-white shadow-lg"
            data-url={CALENDLY_URL}
            style={{ minWidth: '320px', height: '700px' }}
          />
        </section>
      </FadeIn>
    </div>
  );
}
