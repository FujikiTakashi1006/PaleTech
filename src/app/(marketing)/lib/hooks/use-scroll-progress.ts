'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks scroll progress (0→1) of a section within a scrollable container.
 * p=0 when top of section reaches bottom of viewport.
 * p=1 when top of section reaches top of viewport.
 */
export function useScrollProgress(
  sectionRef: React.RefObject<HTMLElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    let ticking = false;
    const update = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = section.getBoundingClientRect();
          const vh = window.innerHeight;
          const p = Math.max(0, Math.min(1, 1 - rect.top / vh));
          setProgress(p);
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', update, { passive: true });
    update();
    return () => container.removeEventListener('scroll', update);
  }, [sectionRef, containerRef]);

  return progress;
}
