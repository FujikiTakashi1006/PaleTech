'use client';

import { useEffect, useRef, useId } from 'react';
import anime from 'animejs';
import { prefersReducedMotion } from '@/utils/motion';

interface WaveDividerProps {
  color?: string;
  flip?: boolean;
  className?: string;
}

export default function WaveDivider({
  color = '#f9fafb',
  flip = false,
  className = '',
}: WaveDividerProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const gradientId = useId();

  useEffect(() => {
    const path = pathRef.current;
    if (!path || prefersReducedMotion()) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          anime({
            targets: path,
            strokeDashoffset: [length, 0],
            duration: 1500,
            easing: 'easeInOutQuad',
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(path);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`w-full overflow-hidden leading-none ${className}`}
      style={{ transform: flip ? 'scaleY(-1)' : undefined }}
    >
      <svg
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <path
          d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
          fill={color}
        />
        <path
          ref={pathRef}
          d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          fill="none"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
