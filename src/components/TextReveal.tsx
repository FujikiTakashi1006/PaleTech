'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { prefersReducedMotion } from '@/utils/motion';

interface TextRevealProps {
  text: string;
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  className?: string;
}

export default function TextReveal({
  text,
  delay = 0,
  staggerDelay = 50,
  duration = 800,
  className = '',
}: TextRevealProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chars = container.querySelectorAll('.char');

    if (prefersReducedMotion()) {
      chars.forEach((char) => {
        (char as HTMLElement).style.opacity = '1';
        (char as HTMLElement).style.transform = 'none';
      });
      return;
    }

    anime({
      targets: chars,
      opacity: [0, 1],
      translateY: ['100%', '0%'],
      duration,
      delay: anime.stagger(staggerDelay, { start: delay }),
      easing: 'easeOutCubic',
    });
  }, [delay, staggerDelay, duration]);

  return (
    <span ref={containerRef} className={`inline-block overflow-hidden ${className}`}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="char inline-block opacity-0"
          style={{ willChange: 'transform, opacity' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
