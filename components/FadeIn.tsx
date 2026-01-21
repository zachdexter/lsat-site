'use client';

import { useEffect, useRef, useState } from 'react';

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * Optional stagger delay in ms for nicer grids.
   */
  delayMs?: number;
  /**
   * IntersectionObserver threshold (0..1). Lower means earlier trigger.
   */
  threshold?: number;
};

export function FadeIn({ children, className = '', delayMs = 0, threshold = 0.15 }: FadeInProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={[
        'will-change-transform will-change-opacity transition-all duration-500 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

