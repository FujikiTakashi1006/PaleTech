'use client';

import { useEffect, useRef, useCallback } from 'react';
import anime from 'animejs';

const COLS = 14;
const ROWS = 10;

export function WebDemoGrid({ step, color }: { step: number; color: string }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<ReturnType<typeof anime> | null>(null);
  const prevStepRef = useRef(-1);

  const runAnimation = useCallback((currentStep: number) => {
    const grid = gridRef.current;
    if (!grid) return;
    const dots = grid.querySelectorAll('.web-dot');
    if (dots.length === 0) return;

    // Kill previous animation
    if (animRef.current) animRef.current.pause();

    // Reset all dots
    dots.forEach(dot => {
      (dot as HTMLElement).style.transform = 'scale(1)';
      (dot as HTMLElement).style.opacity = '0.25';
      (dot as HTMLElement).style.borderRadius = '2px';
    });

    if (currentStep === 0) {
      // 3D Animation demo: wave ripple from center, dots scale up with 3D rotation
      animRef.current = anime({
        targets: dots,
        scale: [
          { value: 1.8, easing: 'easeOutSine', duration: 500 },
          { value: 1, easing: 'easeInOutQuad', duration: 800 },
        ],
        opacity: [
          { value: 1, easing: 'easeOutSine', duration: 500 },
          { value: 0.25, easing: 'easeInOutQuad', duration: 800 },
        ],
        rotateZ: [
          { value: '1turn', easing: 'easeInOutQuad', duration: 1300 },
        ],
        borderRadius: [
          { value: '50%', duration: 500 },
          { value: '2px', duration: 800 },
        ],
        backgroundColor: [
          { value: color, duration: 500 },
          { value: '#d6d3d1', duration: 800 },
        ],
        delay: anime.stagger(60, { grid: [COLS, ROWS], from: 'center' }),
        loop: true,
        direction: 'normal',
        easing: 'easeInOutQuad',
      });
    } else if (currentStep === 1) {
      // Scroll-linked demo: cascading wave top-to-bottom, like a scroll reveal
      animRef.current = anime({
        targets: dots,
        translateY: [
          { value: -12, duration: 600, easing: 'easeOutCubic' },
          { value: 0, duration: 800, easing: 'easeInOutCubic' },
        ],
        scale: [
          { value: 1.5, duration: 600, easing: 'easeOutCubic' },
          { value: 1, duration: 800, easing: 'easeInOutCubic' },
        ],
        opacity: [
          { value: 0.9, duration: 600 },
          { value: 0.25, duration: 800 },
        ],
        backgroundColor: [
          { value: color, duration: 600 },
          { value: '#d6d3d1', duration: 800 },
        ],
        borderRadius: [
          { value: '50%', duration: 600 },
          { value: '2px', duration: 800 },
        ],
        delay: anime.stagger(40, { grid: [COLS, ROWS], from: 'first', axis: 'y' }),
        loop: true,
      });
    } else if (currentStep === 2) {
      // Micro-interaction demo: random pops like interactive touches
      const randomPop = () => {
        const randomDots: Element[] = [];
        const count = 5 + Math.floor(Math.random() * 8);
        for (let i = 0; i < count; i++) {
          randomDots.push(dots[Math.floor(Math.random() * dots.length)]);
        }

        anime({
          targets: randomDots,
          scale: [
            { value: 2.2, duration: 300, easing: 'easeOutBack' },
            { value: 1, duration: 600, easing: 'easeInOutCubic' },
          ],
          opacity: [
            { value: 1, duration: 300 },
            { value: 0.25, duration: 600 },
          ],
          backgroundColor: [
            { value: color, duration: 300 },
            { value: '#d6d3d1', duration: 600 },
          ],
          borderRadius: [
            { value: '50%', duration: 300 },
            { value: '2px', duration: 600 },
          ],
          complete: () => {
            if (gridRef.current) randomPop();
          },
        });
      };
      randomPop();
    }
  }, [color]);

  useEffect(() => {
    if (step !== prevStepRef.current && step >= 0) {
      prevStepRef.current = step;
      // Small delay so the text animation settles first
      setTimeout(() => runAnimation(step), 200);
    }
    return () => {
      if (animRef.current) animRef.current.pause();
    };
  }, [step, runAnimation]);

  // Mouse interaction: hover ripple
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const grid = gridRef.current;
    if (!grid || step < 0) return;
    const rect = grid.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellW = rect.width / COLS;
    const cellH = rect.height / ROWS;
    const col = Math.floor(x / cellW);
    const row = Math.floor(y / cellH);
    const index = row * COLS + col;

    const dots = grid.querySelectorAll('.web-dot');
    if (index >= 0 && index < dots.length) {
      anime({
        targets: dots[index],
        scale: [{ value: 2.5, duration: 200 }, { value: 1, duration: 600 }],
        opacity: [{ value: 1, duration: 200 }, { value: 0.25, duration: 600 }],
        backgroundColor: [{ value: color, duration: 200 }, { value: '#d6d3d1', duration: 600 }],
        borderRadius: [{ value: '50%', duration: 200 }, { value: '2px', duration: 600 }],
        easing: 'easeOutCubic',
      });
    }
  }, [step, color]);

  return (
    <div className="w-1/2 flex items-center justify-center">
      <div
        ref={gridRef}
        className="grid gap-[6px]"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, width: '100%', maxWidth: '320px' }}
        onMouseMove={handleMouseMove}
      >
        {Array.from({ length: COLS * ROWS }).map((_, i) => (
          <div
            key={i}
            className="web-dot aspect-square"
            style={{
              background: '#d6d3d1',
              borderRadius: '2px',
              opacity: 0.25,
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>
    </div>
  );
}
