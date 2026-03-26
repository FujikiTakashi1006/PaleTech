'use client';

import { useRef, useState, useEffect } from 'react';
import anime from 'animejs';

export function ScrollDemo({ color, active }: { color: string; active: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  // Auto-scroll animation
  useEffect(() => {
    if (!active) return;
    const obj = { val: 0 };
    const anim = anime({
      targets: obj,
      val: [0, 1, 0],
      duration: 6000,
      easing: 'easeInOutSine',
      loop: true,
      update: () => setScrollY(obj.val),
    });
    return () => anim.pause();
  }, [active]);

  return (
    <div className="relative rounded-xl border overflow-hidden" style={{ width: 220, height: 300, borderColor: color + '20', background: 'white' }}>
      {/* Scroll indicator */}
      <div className="absolute right-1 top-8 bottom-8 w-1 rounded-full z-10" style={{ background: color + '10' }}>
        <div className="w-full rounded-full" style={{ height: '30%', background: color + '40', transform: `translateY(${scrollY * 230}%)`, transition: 'transform 0.1s' }} />
      </div>

      {/* Content that moves with scroll */}
      <div style={{ transform: `translateY(${-scrollY * 180}px)`, transition: 'transform 0.1s linear' }}>
        {/* Hero section */}
        <div className="p-5 pb-3">
          <div className="w-12 h-1.5 rounded mb-4" style={{ background: color + '30' }} />
          <div className="w-3/4 h-3 rounded mb-2" style={{ background: color + '20', transform: `translateX(${-scrollY * 20}px)`, transition: 'transform 0.15s' }} />
          <div className="w-1/2 h-3 rounded mb-5" style={{ background: color + '15', transform: `translateX(${-scrollY * 30}px)`, transition: 'transform 0.2s' }} />
          {/* Parallax image placeholder */}
          <div className="w-full h-20 rounded-lg mb-3" style={{
            background: `linear-gradient(135deg, ${color}12, ${color}06)`,
            transform: `translateY(${scrollY * 15}px) scale(${1 + scrollY * 0.05})`,
            transition: 'transform 0.15s',
          }} />
        </div>

        {/* Cards that reveal on scroll */}
        {[0, 1, 2].map(i => (
          <div key={i} className="mx-5 mb-3 p-3 rounded-lg border" style={{
            borderColor: color + '12',
            opacity: scrollY > 0.15 + i * 0.2 ? 1 : 0,
            transform: `translateY(${scrollY > 0.15 + i * 0.2 ? 0 : 20}px)`,
            transition: 'all 0.4s ease',
          }}>
            <div className="flex gap-2 items-center mb-2">
              <div className="w-5 h-5 rounded-full" style={{ background: color + '15' }} />
              <div className="w-16 h-1.5 rounded" style={{ background: color + '12' }} />
            </div>
            <div className="w-full h-1 rounded mb-1" style={{ background: color + '08' }} />
            <div className="w-3/4 h-1 rounded" style={{ background: color + '06' }} />
          </div>
        ))}

        {/* Bottom CTA that fades in */}
        <div className="mx-5 mt-2 flex justify-center" style={{
          opacity: scrollY > 0.7 ? 1 : 0,
          transform: `scale(${scrollY > 0.7 ? 1 : 0.9})`,
          transition: 'all 0.5s ease',
        }}>
          <div className="px-6 py-2 rounded-full" style={{ background: color + '15' }}>
            <div className="w-12 h-1.5 rounded" style={{ background: color + '30' }} />
          </div>
        </div>
      </div>

      {/* Scroll label */}
      <div className="absolute bottom-2 left-0 right-0 text-center">
        <span className="font-gothic text-[8px] tracking-wider uppercase" style={{ color: color + '50' }}>auto-scrolling</span>
      </div>
    </div>
  );
}
