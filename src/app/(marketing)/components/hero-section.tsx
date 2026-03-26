'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';

export function HeroSection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    anime({ targets: el.querySelectorAll('.hero-title'), opacity: [0, 1], translateY: [30, 0], duration: 900, delay: 400, easing: 'cubicBezier(0.33, 1, 0.68, 1)' });
    anime({ targets: el.querySelector('.hero-line'), scaleX: [0, 1], duration: 900, delay: 1000, easing: 'easeInOutQuart' });
    anime({ targets: el.querySelector('.hero-sub'), opacity: [0, 1], translateY: [20, 0], duration: 1000, delay: 1200, easing: 'easeOutCubic' });
    anime({ targets: el.querySelector('.scroll-hint'), opacity: [0, 0.6], translateY: [10, 0], duration: 600, delay: 1600, easing: 'easeOutCubic' });
  }, []);

  return (
    <section ref={ref} className="section-page relative flex flex-col justify-center px-6 lg:px-12 overflow-hidden">
      <div className="absolute right-[-8vw] top-[12vh] w-[50vw] h-[50vw] rounded-full border" style={{ borderColor: 'rgba(167,139,250,0.08)' }} />
      <div className="absolute right-[-3vw] top-[18vh] w-[35vw] h-[35vw] rounded-full border" style={{ borderColor: 'rgba(249,168,212,0.08)' }} />

      <div className="max-w-[1440px] mx-auto w-full">
        <p className="font-gothic text-[11px] tracking-[0.35em] text-stone-500 uppercase mb-5">PaleTech &mdash; Fukuoka&times;Tokyo</p>
        <h1 className="font-display text-[clamp(2.5rem,8vw,9rem)] leading-[1] text-stone-800 tracking-tight mb-8 font-extrabold inline-block">
          <span className="hero-title block opacity-0">Paleolithic</span>
          <span className="hero-title block opacity-0">Technology</span>
        </h1>
        <div className="hero-line h-[2px] w-full max-w-md mb-8" style={{ background: 'linear-gradient(90deg, #60a5fa, #f9a8d4, transparent)', transformOrigin: 'left', transform: 'scaleX(0)' }} />
        <p className="hero-sub font-gothic text-xl md:text-2xl lg:text-3xl text-stone-600 font-light tracking-wide max-w-xl" style={{ opacity: 0 }}>テクノロジーで、人を想う。</p>
        <div className="scroll-hint absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3" style={{ opacity: 0 }}>
          <div className="w-[1px] h-12 overflow-hidden">
            <div className="w-full h-full bg-stone-600 scroll-line" />
          </div>
          <span className="font-gothic text-[9px] tracking-[0.4em] text-stone-600 uppercase">Scroll</span>
        </div>
      </div>
    </section>
  );
}
