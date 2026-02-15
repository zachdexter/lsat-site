'use client';

import { useEffect, useState, useRef } from 'react';
import { FadeIn } from '../../components/FadeIn';

const CALENDLY_URL = 'https://calendly.com/satchelbaskette';

export default function BookPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Load Calendly CSS if not already present
    if (!document.querySelector('link[href*="calendly.com"]')) {
      const link = document.createElement('link');
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Load Calendly script if not already loaded
    const existingScript = document.querySelector('script[src*="calendly.com"]');
    
    // Set a timeout to show fallback message if widget doesn't load after 10 seconds
    const fallbackTimeout = setTimeout(() => {
      setShowFallback(true);
    }, 10000);
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;

      script.onload = () => {
        // Give Calendly a moment to process the data-url attribute and render the widget
        setTimeout(() => {
          setIsLoading(false);
          clearTimeout(fallbackTimeout);
          // Check if widget actually rendered by looking for Calendly iframe
          setTimeout(() => {
            const calendlyFrame = document.querySelector('.calendly-inline-widget iframe');
            if (!calendlyFrame) {
              setShowFallback(true);
            }
          }, 2000);
        }, 1500);
      };

      script.onerror = () => {
        // If the script fails to load, stop the spinner but keep the area visible
        setIsLoading(false);
        setShowFallback(true);
        clearTimeout(fallbackTimeout);
      };

      document.body.appendChild(script);
    } else {
      // Script already loaded (e.g., client-side navigation). Give Calendly a brief moment
      // to hydrate the inline widget before hiding the loading state.
      const timeoutId = window.setTimeout(() => {
        setIsLoading(false);
        clearTimeout(fallbackTimeout);
        // Check if widget actually rendered
        setTimeout(() => {
          const calendlyFrame = document.querySelector('.calendly-inline-widget iframe');
          if (!calendlyFrame) {
            setShowFallback(true);
          }
        }, 2000);
      }, 800);

      return () => {
        window.clearTimeout(timeoutId);
        clearTimeout(fallbackTimeout);
      };
    }

    return () => {
      clearTimeout(fallbackTimeout);
    };
  }, []);

  return (
    <div className="space-y-8">
      <FadeIn>
        <section className="space-y-4 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 dark:from-indigo-800 dark:via-indigo-900 dark:to-indigo-950 p-8 md:p-10">
          <h1 className="text-3xl font-bold text-white md:text-4xl">Book a session with Satchel Baskette</h1>
          <p className="text-lg leading-relaxed text-indigo-100 dark:text-indigo-200">
            Choose a time that works for you. You&apos;ll receive a confirmation email with the meeting link and any prep
            details.
          </p>
        </section>
      </FadeIn>

      <FadeIn delayMs={80}>
        <section className="space-y-4">
          <div className="w-full relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-indigo-200 dark:border-slate-700 bg-white dark:bg-slate-800 z-10">
                <div className="text-center">
                  <div className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Loading booking widget...</p>
                </div>
              </div>
            )}
            {showFallback && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-indigo-200 dark:border-slate-700 bg-white dark:bg-slate-800 z-20">
                <div className="text-center p-6 max-w-md">
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Calendly widget isn&apos;t loading
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Please refresh the page to try again.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            )}
            <div
              className="calendly-inline-widget rounded-xl border-2 border-indigo-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg"
              data-url={CALENDLY_URL}
              style={{ 
                width: '100%',
                height: '700px',
                minHeight: '700px',
                opacity: isLoading || showFallback ? 0 : 1,
                transition: 'opacity 0.3s ease-in-out'
              }}
            />
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
