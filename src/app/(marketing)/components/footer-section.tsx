'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useScrollProgress } from '../lib/hooks/use-scroll-progress';
import { interp } from '@/lib/animation/interp';

export function FooterSection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLElement>(null);
  const p = useScrollProgress(ref, containerRef);

  const col1Op = interp(p, 0.1, 0.35, 0, 1);
  const col1Y = interp(p, 0.1, 0.35, 30, 0);
  const col2Op = interp(p, 0.2, 0.45, 0, 1);

  return (
    <section ref={ref} className="relative overflow-hidden px-6 lg:px-12 py-12" style={{ background: '#e8e6e1' }}>
      <div className="max-w-[1440px] mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10" style={{ opacity: col1Op, transform: `translateY(${col1Y}px)` }}>
          <div>
            <Link href="/" className="font-display text-2xl text-stone-700 font-bold tracking-tight inline-block mb-3">PaleTech</Link>
            <p className="font-gothic text-xs text-stone-500 leading-[1.8] font-light">テクノロジーで取り戻す。</p>
          </div>
          <div className="flex gap-8" style={{ opacity: col2Op }}>
            {['About', 'Service', 'Contact'].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`} className="font-gothic text-xs text-stone-500 hover:text-stone-700 transition-colors duration-300">{item}</Link>
            ))}
            <Link href="/privacy" className="font-gothic text-xs text-stone-500 hover:text-stone-700 transition-colors duration-300">Privacy</Link>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
          <p className="font-gothic text-[10px] text-stone-400">&copy; {new Date().getFullYear()} PaleTech Inc.</p>
          <p className="font-gothic text-[10px] text-stone-400/50 mt-1 md:mt-0">Fukuoka, Japan</p>
        </div>
      </div>
    </section>
  );
}
