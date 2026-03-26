'use client';

import { useEffect } from 'react';
import { wheelInterceptRef, scrollToRef } from '../scroll-state';

export function useSmoothScroll(containerRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let current = 0;
    let target = 0;
    let rafId: number;
    const maxScroll = () => el.scrollHeight - el.clientHeight;

    const lerp = () => {
      const diff = target - current;
      current += diff * 0.08;
      if (Math.abs(diff) < 0.5) current = target;
      el.scrollTop = current;
      rafId = requestAnimationFrame(lerp);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelInterceptRef.current) {
        wheelInterceptRef.current(e.deltaY);
        return;
      }
      target = Math.max(0, Math.min(target + e.deltaY, maxScroll()));
    };

    let lastTouchY = 0;
    const handleTouchStart = (e: TouchEvent) => { lastTouchY = e.touches[0].clientY; };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const y = e.touches[0].clientY;
      const dy = lastTouchY - y;
      lastTouchY = y;
      if (wheelInterceptRef.current) {
        wheelInterceptRef.current(dy * 2);
        return;
      }
      target = Math.max(0, Math.min(target + dy * 2, maxScroll()));
    };

    scrollToRef.current = (pos: number) => {
      current = el.scrollTop;
      target = Math.max(0, Math.min(pos, maxScroll()));
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    rafId = requestAnimationFrame(lerp);

    return () => {
      scrollToRef.current = null;
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(rafId);
    };
  }, [containerRef]);
}
