'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';

export function RAGIllustration({ steps, progress, stepAppear }: {
  steps: { id: string; color: string; icon: (op: number) => React.ReactNode }[];
  progress: number;
  stepAppear: number[];
}) {
  const [activeStep, setActiveStep] = useState(-1);
  const [iconProgress, setIconProgress] = useState(0);
  const animRef = useRef<ReturnType<typeof anime> | null>(null);

  useEffect(() => {
    let current = -1;
    for (let i = stepAppear.length - 1; i >= 0; i--) {
      if (progress >= stepAppear[i]) { current = i; break; }
    }
    if (current !== activeStep) setActiveStep(current);
  }, [progress, stepAppear, activeStep]);

  useEffect(() => {
    if (activeStep < 0) return;
    setIconProgress(0);
    if (animRef.current) animRef.current.pause();
    const obj = { val: 0 };
    animRef.current = anime({
      targets: obj, val: 1, duration: 2000, easing: 'easeInOutCubic',
      update: () => setIconProgress(obj.val),
    });
    return () => { if (animRef.current) animRef.current.pause(); };
  }, [activeStep]);

  return (
    <div className="relative h-[160px] md:h-[200px]">
      {steps.map((step, i) => (
        <div key={step.id} className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
          style={{ opacity: i === activeStep ? 1 : 0, pointerEvents: i === activeStep ? 'auto' : 'none' }}>
          <div className="w-full max-w-[280px] h-full" style={{ filter: `drop-shadow(0 4px 20px ${step.color}20)` }}>
            {step.icon(i === activeStep ? iconProgress : 0)}
          </div>
        </div>
      ))}
    </div>
  );
}
