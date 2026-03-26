'use client';

import { useEffect, useRef } from 'react';

export function CursorDot() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current, ring = ringRef.current;
    if (!dot || !ring) return;
    let mx = 0, my = 0;
    const move = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; dot.style.left = `${mx}px`; dot.style.top = `${my}px`; };
    const follow = () => {
      const rx = parseFloat(ring.style.left || '0'), ry = parseFloat(ring.style.top || '0');
      ring.style.left = `${rx + (mx - rx) * 0.08}px`; ring.style.top = `${ry + (my - ry) * 0.08}px`;
      requestAnimationFrame(follow);
    };
    window.addEventListener('mousemove', move); follow();
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <>
      <div ref={dotRef} className="fixed w-2 h-2 rounded-full pointer-events-none z-[100] hidden md:block"
        style={{ background: '#60a5fa', transform: 'translate(-50%, -50%)' }} />
      <div ref={ringRef} className="fixed w-10 h-10 rounded-full border-2 pointer-events-none z-[100] hidden md:block"
        style={{ borderColor: 'rgba(167,139,250,0.3)', transform: 'translate(-50%, -50%)' }} />
    </>
  );
}
