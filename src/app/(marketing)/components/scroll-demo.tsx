'use client';

import { useState, useEffect } from 'react';
import anime from 'animejs';

export function ScrollDemo({ color, active }: { color: string; active: boolean }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!active) return;
    const obj = { val: 0 };
    const anim = anime({
      targets: obj,
      val: [0, 1, 0],
      duration: 4000,
      easing: 'easeInOutSine',
      loop: true,
      update: () => setScrollY(obj.val),
    });
    return () => anim.pause();
  }, [active]);

  const p = scrollY; // 0→1

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ width: 240, height: 320, background: '#fafaf9', border: `1.5px solid ${color}20` }}>
      {/* Scroll progress bar top */}
      <div className="absolute top-0 left-0 h-[2px] z-20" style={{ width: `${p * 100}%`, background: color, transition: 'width 0.05s' }} />

      {/* --- Content --- */}
      <div className="relative h-full overflow-hidden">

        {/* Hero image — parallax (moves slower than scroll) */}
        <div className="absolute w-full" style={{
          height: 140,
          top: -p * 40,
          background: `linear-gradient(135deg, ${color}30, ${color}10)`,
          transition: 'top 0.1s',
        }}>
          <div className="absolute bottom-4 left-5">
            <div className="w-24 h-3 rounded mb-2" style={{ background: 'white', opacity: 0.9 }} />
            <div className="w-16 h-2 rounded" style={{ background: 'white', opacity: 0.5 }} />
          </div>
        </div>

        {/* Cards — stagger reveal from bottom */}
        {[0, 1, 2].map(i => {
          const threshold = 0.2 + i * 0.2;
          const cardP = Math.max(0, Math.min(1, (p - threshold) / 0.15));
          return (
            <div key={i} className="absolute left-4 right-4 rounded-lg border p-3"
              style={{
                top: 150 + i * 58 - p * 50,
                borderColor: cardP > 0 ? color + '25' : 'rgba(0,0,0,0.04)',
                background: cardP > 0 ? 'white' : 'rgba(255,255,255,0.5)',
                opacity: cardP,
                transform: `translateY(${(1 - cardP) * 30}px) scale(${0.95 + cardP * 0.05})`,
                transition: 'border-color 0.3s, background 0.3s',
                boxShadow: cardP > 0.5 ? `0 2px 12px ${color}10` : 'none',
              }}>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-6 h-6 rounded-full" style={{ background: color + (20 + i * 10).toString(16) }} />
                <div>
                  <div className="w-16 h-2 rounded mb-1" style={{ background: color + '20' }} />
                  <div className="w-10 h-1.5 rounded" style={{ background: color + '10' }} />
                </div>
              </div>
              <div className="w-full h-1.5 rounded mb-1" style={{ background: color + '10' }} />
              <div className="w-3/4 h-1.5 rounded" style={{ background: color + '08' }} />
            </div>
          );
        })}

        {/* Floating CTA — scale bounce at end */}
        <div className="absolute left-4 right-4 bottom-3 flex justify-center" style={{
          opacity: p > 0.75 ? 1 : 0,
          transform: `translateY(${p > 0.75 ? 0 : 20}px) scale(${p > 0.75 ? 1 : 0.8})`,
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <div className="px-8 py-2 rounded-full" style={{ background: color }}>
            <span className="font-gothic text-[9px] text-white tracking-wider">GET STARTED</span>
          </div>
        </div>

        {/* Parallax decorative circles */}
        <div className="absolute rounded-full" style={{
          width: 60, height: 60, right: -10, top: 80 - p * 30,
          background: color + '08', border: `1px solid ${color}15`,
          transition: 'top 0.1s',
        }} />
        <div className="absolute rounded-full" style={{
          width: 30, height: 30, left: 10, top: 200 - p * 50,
          background: color + '06', border: `1px solid ${color}10`,
          transition: 'top 0.1s',
        }} />
      </div>
    </div>
  );
}
