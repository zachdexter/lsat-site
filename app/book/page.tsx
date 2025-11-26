'use client';

import { useEffect, useRef } from 'react';

const CALENDLY_URL = 'https://calendly.com/satchelbaskette';

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void;
    };
  }
}

export default function BookPage() {
  const calendlyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Calendly script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;

    // Initialize widget after script loads
    script.onload = () => {
      if (window.Calendly && calendlyRef.current) {
        window.Calendly.initInlineWidget({
          url: CALENDLY_URL,
          parentElement: calendlyRef.current,
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script and clear widget
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (calendlyRef.current) {
        calendlyRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 p-8 md:p-10">
        <h1 className="text-3xl font-bold text-white md:text-4xl">Book a session with Satchel Basket</h1>
        <p className="text-lg leading-relaxed text-indigo-100">
          Choose a time that works for you. You&apos;ll receive a confirmation
          email with the meeting link and any prep details.
        </p>
      </div>

      {/* Calendly inline widget container */}
      <div
        ref={calendlyRef}
        className="min-h-[700px] rounded-xl border-2 border-indigo-200 bg-white shadow-lg"
      />
    </div>
  );
}
