'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';

export function RAGIllustration({ steps, progress }: {
  steps: { id: string; color: string; icon: (op: number) => React.ReactNode }[];
  progress: number; // step index: -1=none, 0, 1, 2
}) {
  const [iconProgress, setIconProgress] = useState(0);
  const animRef = useRef<ReturnType<typeof anime> | null>(null);
  const prevStep = useRef(-999); // use impossible value so first real step always triggers

  useEffect(() => {
    if (progress < 0) return;
    if (progress === prevStep.current) return;
    prevStep.current = progress;

    // Start SVG draw animation 0→1 over 2s
    setIconProgress(0);
    if (animRef.current) animRef.current.pause();

    // Small delay to ensure DOM is ready after display:none→block
    const timer = setTimeout(() => {
      const obj = { val: 0 };
      animRef.current = anime({
        targets: obj, val: 1, duration: 2000, easing: 'easeInOutCubic',
        update: () => setIconProgress(obj.val),
      });
    }, 30);

    return () => {
      clearTimeout(timer);
      if (animRef.current) animRef.current.pause();
    };
  }, [progress]);

  return (
    <div className="relative h-[160px] md:h-[200px]">
      {steps.map((step, i) => (
        <div key={step.id} className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
          style={{ opacity: i === progress ? 1 : 0, pointerEvents: i === progress ? 'auto' : 'none' }}>
          <div className="w-full max-w-[280px] h-full" style={{ filter: `drop-shadow(0 4px 20px ${step.color}20)` }}>
            {step.icon(i === progress ? iconProgress : 0)}
          </div>
        </div>
      ))}
    </div>
  );
}
