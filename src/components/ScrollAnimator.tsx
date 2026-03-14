'use client';

import { useEffect, useRef, ReactNode } from 'react';
import anime from 'animejs';
import { prefersReducedMotion } from '@/utils/motion';

type AnimationType = 'fade-up' | 'fade-in' | 'scale-in' | 'clip-reveal-x';

interface ScrollAnimatorProps {
  children: ReactNode;
  animation: AnimationType;
  delay?: number;
  duration?: number;
  stagger?: number;
  threshold?: number;
  className?: string;
}

export default function ScrollAnimator({
  children,
  animation,
  delay = 0,
  duration = 800,
  stagger = 0,
  threshold = 0.2,
  className = '',
}: ScrollAnimatorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }

    // Set initial state based on animation type
    switch (animation) {
      case 'fade-up':
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        break;
      case 'fade-in':
        el.style.opacity = '0';
        break;
      case 'scale-in':
        el.style.opacity = '0';
        el.style.transform = 'scale(0.85)';
        break;
      case 'clip-reveal-x':
        el.style.overflow = 'hidden';
        Array.from(el.children).forEach((child) => {
          (child as HTMLElement).style.transform = 'translateX(-100%)';
        });
        break;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          const targets = stagger > 0 ? el.children : el;

          switch (animation) {
            case 'fade-up':
              anime({
                targets,
                opacity: [0, 1],
                translateY: [30, 0],
                duration,
                delay: stagger > 0 ? anime.stagger(stagger, { start: delay }) : delay,
                easing: 'easeOutCubic',
              });
              break;
            case 'fade-in':
              anime({
                targets,
                opacity: [0, 1],
                duration,
                delay: stagger > 0 ? anime.stagger(stagger, { start: delay }) : delay,
                easing: 'easeOutCubic',
              });
              break;
            case 'scale-in':
              anime({
                targets,
                opacity: [0, 1],
                scale: [0.85, 1],
                duration,
                delay: stagger > 0 ? anime.stagger(stagger, { start: delay }) : delay,
                easing: 'cubicBezier(0.16, 1, 0.3, 1)',
              });
              break;
            case 'clip-reveal-x':
              anime({
                targets: Array.from(el.children),
                translateX: ['-100%', '0%'],
                duration,
                delay: stagger > 0 ? anime.stagger(stagger, { start: delay }) : delay,
                easing: 'cubicBezier(0.77, 0, 0.175, 1)',
              });
              break;
          }

          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [animation, delay, duration, stagger, threshold]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform, opacity' }}>
      {children}
    </div>
  );
}
