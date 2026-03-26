'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { interp } from '@/lib/animation/interp';

interface Step {
  id: string;
  label: string;
  title: string;
  desc: string;
  color: string;
}

export function StepTimeline({ steps, progress, stepAppear, color }: {
  steps: Step[];
  progress: number;
  stepAppear: number[];
  color: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [dotTops, setDotTops] = useState<number[]>([]);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cTop = container.getBoundingClientRect().top;
    const tops = dotRefs.current.map(el => {
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return r.top - cTop + r.height / 2;
    });
    setDotTops(tops);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  useEffect(() => {
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [progress, measure]);

  // Moving dot position: travels between checkpoint dots (below each step's text)
  const getPosition = () => {
    if (dotTops.length < 1 || !dotTops[0]) return 0;

    for (let i = steps.length - 1; i >= 0; i--) {
      const reachTime = stepAppear[i] + 0.10;
      if (progress >= reachTime) {
        if (i < steps.length - 1) {
          const nextStart = stepAppear[i + 1] + 0.10;
          if (progress < nextStart) {
            return dotTops[i]; // paused at step i
          }
          // moving toward next
          const t = Math.min((progress - nextStart) / 0.08, 1);
          return dotTops[i] + (dotTops[i + 1] - dotTops[i]) * t;
        }
        return dotTops[i];
      }
    }

    // Approaching first step
    if (progress >= 0.08 && dotTops[0] > 0) {
      const arriveAt = stepAppear[0] + 0.10;
      const t = Math.min((progress - 0.08) / (arriveAt - 0.08), 1);
      return dotTops[0] * t;
    }

    return 0;
  };

  const pos = getPosition();
  const showTip = progress >= 0.08;

  return (
    <div ref={containerRef} className="w-full md:w-7/12 relative pl-6 md:pl-0">
      {/* Background track: from top to last dot */}
      {dotTops.length > 0 && dotTops[0] > 0 && (
        <div className="absolute left-[7px] hidden md:block rounded-full"
          style={{
            top: 0,
            height: `${dotTops[dotTops.length - 1] || 0}px`,
            width: '2px',
            background: `${color}12`,
          }} />
      )}

      {/* Active filled line: from top to current position */}
      {showTip && (
        <div className="absolute left-[7px] hidden md:block rounded-full"
          style={{
            top: 0,
            height: `${Math.max(pos, 0)}px`,
            width: '2px',
            background: color,
            transition: 'height 0.35s ease-out',
          }} />
      )}

      {/* Moving tip dot */}
      {showTip && (
        <div className="absolute hidden md:block rounded-full z-20"
          style={{
            left: '8px',
            width: '8px',
            height: '8px',
            background: color,
            boxShadow: `0 0 10px ${color}80`,
            top: `${pos}px`,
            transform: 'translate(-50%, -50%)',
            transition: 'top 0.35s ease-out',
          }} />
      )}

      {/* Steps: text first, then checkpoint dot below */}
      {steps.map((step, i) => {
        const appear = interp(progress, stepAppear[i], stepAppear[i] + 0.12, 0, 1);
        const reached = progress >= stepAppear[i] + 0.10;

        return (
          <div key={step.id}
            style={{ opacity: appear, transform: `translateY(${(1 - appear) * 15}px)`, transition: 'opacity 0.4s, transform 0.4s' }}>
            {/* Text block */}
            <div className="ml-8 md:ml-8 mb-3">
              <span className="font-gothic text-[10px] tracking-[0.2em] uppercase mb-1 block"
                style={{ color: reached ? color : color + '50', transition: 'color 0.3s' }}>
                {step.label}
              </span>
              <h4 className="font-display text-base text-stone-800 font-bold mb-1">{step.title}</h4>
              <p className="font-gothic text-[12px] text-stone-600 leading-[1.8] font-light">{step.desc}</p>
            </div>

            {/* Checkpoint dot + divider — below the text */}
            <div className="flex items-center mb-6">
              <div
                ref={el => { dotRefs.current[i] = el; }}
                className="hidden md:flex flex-shrink-0 w-3 h-3 rounded-full relative z-10"
                style={{
                  marginLeft: '2px', // center of 12px dot at 8px (2 + 6 = 8)
                  border: `2px solid ${reached ? color : color + '25'}`,
                  background: reached ? color : 'transparent',
                  transition: 'all 0.4s ease',
                  boxShadow: reached ? `0 0 8px ${color}40` : 'none',
                }} />
              <div className="hidden md:block flex-1 h-px ml-3"
                style={{
                  background: reached ? `linear-gradient(90deg, ${color}40, transparent)` : `${color}10`,
                  transition: 'background 0.4s ease',
                }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
