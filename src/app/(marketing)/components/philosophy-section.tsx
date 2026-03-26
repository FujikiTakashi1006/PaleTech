'use client';

import { useRef } from 'react';
import { useScrollProgress } from '../lib/hooks/use-scroll-progress';
import { interp } from '@/lib/animation/interp';

export function PhilosophySection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLElement>(null);
  const p = useScrollProgress(ref, containerRef);

  const photoOp = interp(p, 0.1, 0.35, 0, 1);
  const photoY = interp(p, 0.1, 0.35, 40, 0);
  const nameOp = interp(p, 0.2, 0.45, 0, 1);
  const labelOp = interp(p, 0.15, 0.35, 0, 1);
  const labelX = interp(p, 0.15, 0.35, -20, 0);
  const lineScale = interp(p, 0.2, 0.45, 0, 1);
  const text1Op = interp(p, 0.3, 0.55, 0, 1);
  const text1Y = interp(p, 0.3, 0.55, 25, 0);
  const text2Op = interp(p, 0.45, 0.7, 0, 1);
  const text2Y = interp(p, 0.45, 0.7, 25, 0);

  return (
    <section ref={ref} className="section-page relative flex items-center px-6 lg:px-12 overflow-hidden">
      <div className="max-w-[1440px] mx-auto w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left: Photo + Name */}
          <div className="lg:col-span-5 lg:col-start-2 flex flex-col items-center"
            style={{ opacity: photoOp, transform: `translateY(${photoY}px)` }}>
            <div className="w-full h-[420px] rounded-2xl overflow-hidden">
              <div className="w-full h-full bg-stone-200/80 flex items-center justify-center">
                <svg className="w-14 h-14 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
                </svg>
              </div>
            </div>
            <div className="mt-4" style={{ opacity: nameOp }}>
              <p className="font-gothic text-[13px] text-stone-700 font-medium">代表　藤木 崇史</p>
            </div>
          </div>

          {/* Right: Philosophy text */}
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="font-gothic text-[11px] tracking-[0.35em] text-stone-400 uppercase mb-4"
              style={{ opacity: labelOp, transform: `translateX(${labelX}px)` }}>Philosophy</p>
            <div className="h-[1.5px] w-48 mb-8"
              style={{ background: 'linear-gradient(90deg, #60a5fa, #f9a8d4, transparent)', transformOrigin: 'left', transform: `scaleX(${lineScale})` }} />
            <p className="font-gothic text-lg md:text-xl text-stone-600 leading-[2.2] font-light mb-8"
              style={{ opacity: text1Op, transform: `translateY(${text1Y}px)` }}>
              SNS、ゲーム、際限のない通知——<br />
              テクノロジーはいつしか、<br />
              人間から幸せを奪う道具になった。
            </p>
            <p className="font-gothic text-[15px] text-stone-500 leading-[2.2] font-light"
              style={{ opacity: text2Op, transform: `translateY(${text2Y}px)` }}>
              私たちは、より高度なテクノロジーでその流れを逆転させます。<br />
              人間本来の生き方を、現代の技術で取り戻す。<br />
              それがPaleolithic × Technologyの意志です。
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
