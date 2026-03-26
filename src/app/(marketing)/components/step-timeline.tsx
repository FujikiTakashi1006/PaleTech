'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface Step {
  id: string;
  label: string;
  title: string;
  desc: string;
  color: string;
}

export function StepTimeline({ steps, currentStep, color }: {
  steps: Step[];
  currentStep: number; // -1=none, 0=step1, 1=step2, 2=step3
  color: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [dotTops, setDotTops] = useState<number[]>([]);
  const measured = useRef(false);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cTop = container.getBoundingClientRect().top;
    const tops = dotRefs.current.map(el => {
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return r.top - cTop + r.height / 2;
    });
    if (tops.some(t => t > 0)) {
      setDotTops(tops);
      measured.current = true;
    }
  }, []);

  // Measure on mount, resize, and step change
  useEffect(() => {
    measure();
    const t1 = setTimeout(measure, 50);
    const t2 = setTimeout(measure, 150);
    const t3 = setTimeout(measure, 300);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', measure);
    };
  }, [measure, currentStep]);

  // Target position: starts at 0 (top), moves to current step's dot
  const targetPos = (() => {
    if (dotTops.length === 0 || currentStep < 0) return 0;
    return dotTops[Math.min(currentStep, dotTops.length - 1)] || 0;
  })();

  return (
    <div ref={containerRef} className="w-full md:w-7/12 relative pl-6 md:pl-0">
      {/* Background track */}
      {dotTops.length > 0 && dotTops[0] > 0 && (
        <div className="absolute left-[7px] hidden md:block rounded-full"
          style={{
            top: 0,
            height: `${dotTops[dotTops.length - 1] || 0}px`,
            width: '2px',
            background: `${color}12`,
          }} />
      )}

      {/* Active filled line — always in DOM, starts at height 0 */}
      <div className="absolute left-[7px] hidden md:block rounded-full"
        style={{
          top: 0,
          height: `${Math.max(targetPos, 0)}px`,
          width: '2px',
          background: color,
          opacity: currentStep >= 0 ? 1 : 0,
          transition: 'height 2s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.3s ease',
        }} />

      {/* Moving tip dot — always in DOM, starts at top */}
      <div className="absolute hidden md:block rounded-full z-20"
        style={{
          left: '8px',
          width: '8px',
          height: '8px',
          background: color,
          boxShadow: `0 0 10px ${color}80`,
          top: `${targetPos}px`,
          transform: 'translate(-50%, -50%)',
          opacity: currentStep >= 0 ? 1 : 0,
          transition: 'top 2s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.3s ease',
        }} />

      {/* All steps — always in DOM for stable measurement, visibility controlled */}
      {steps.map((step, i) => {
        const visible = currentStep >= i;
        const reached = currentStep > i;
        const active = currentStep === i;

        return (
          <div key={step.id}>
            {/* Text block */}
            <div className="ml-8 md:ml-8 mb-3"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
              }}>
              <span className="font-gothic text-[10px] tracking-[0.2em] uppercase mb-1 block"
                style={{ color: (reached || active) ? color : color + '50', transition: 'color 0.3s' }}>
                {step.label}
              </span>
              <h4 className="font-display text-base text-stone-800 font-bold mb-1">{step.title}</h4>
              <p className="font-gothic text-[12px] text-stone-600 leading-[1.8] font-light">{step.desc}</p>
            </div>

            {/* Checkpoint dot + divider — always rendered for measurement */}
            <div className="flex items-center mb-6">
              <div
                ref={el => { dotRefs.current[i] = el; }}
                className="hidden md:flex flex-shrink-0 w-3 h-3 rounded-full relative z-10"
                style={{
                  marginLeft: '2px',
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
