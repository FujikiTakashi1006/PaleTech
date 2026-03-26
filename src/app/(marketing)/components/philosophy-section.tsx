'use client';

import { useRef } from 'react';
import { useScrollProgress } from '../lib/hooks/use-scroll-progress';
import { interp } from '@/lib/animation/interp';

export function PhilosophySection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLElement>(null);
  const p = useScrollProgress(ref, containerRef);

  const labelOp = interp(p, 0.1, 0.3, 0, 1);
  const labelX = interp(p, 0.1, 0.3, -30, 0);
  const title1Op = interp(p, 0.15, 0.4, 0, 1);
  const title1Y = interp(p, 0.15, 0.4, 50, 0);
  const title2Op = interp(p, 0.25, 0.5, 0, 1);
  const title2Y = interp(p, 0.25, 0.5, 50, 0);
  const lineScale = interp(p, 0.3, 0.55, 0, 1);
  const text1Op = interp(p, 0.4, 0.65, 0, 1);
  const text1Y = interp(p, 0.4, 0.65, 30, 0);
  const text2Op = interp(p, 0.55, 0.8, 0, 1);
  const text2Y = interp(p, 0.55, 0.8, 30, 0);

  return (
    <section ref={ref} className="section-page relative flex items-center px-6 lg:px-12 overflow-hidden">
      <div className="max-w-[1440px] mx-auto w-full">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-8">
          <div className="lg:col-span-5">
            <p className="font-gothic text-[11px] tracking-[0.35em] text-stone-500 uppercase mb-6"
              style={{ opacity: labelOp, transform: `translateX(${labelX}px)` }}>Philosophy</p>
            <h2 className="font-display text-5xl md:text-6xl lg:text-8xl text-stone-800 font-extrabold leading-[1.05]">
              <span className="block" style={{ opacity: title1Op, transform: `translateY(${title1Y}px)` }}>Human</span>
              <span className="block" style={{ opacity: title2Op, transform: `translateY(${title2Y}px)` }}>Nature.</span>
            </h2>
            <div className="h-[2px] w-72 mt-8"
              style={{ background: 'linear-gradient(90deg, #60a5fa, #f9a8d4, transparent)', transformOrigin: 'left', transform: `scaleX(${lineScale})` }} />
          </div>
          <div className="lg:col-span-6 lg:col-start-7 flex flex-col justify-center">
            <p className="font-gothic text-lg md:text-xl text-stone-600 leading-[2.2] font-light mb-8"
              style={{ opacity: text1Op, transform: `translateY(${text1Y}px)` }}>
              SNS、ゲーム、際限のない通知——<br />
              テクノロジーはいつしか、<br />
              人間から幸せを奪う道具になった。
            </p>
            <p className="font-gothic text-[15px] text-stone-500 leading-[2.2] font-light"
              style={{ opacity: text2Op, transform: `translateY(${text2Y}px)` }}>
              私たちは、より高度なテクノロジーでその流れを逆転させます。<br />
              人間本来の生き方を、現代の技術で取り戻す。
              それがPaleolithic × Technologyの意志です。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
