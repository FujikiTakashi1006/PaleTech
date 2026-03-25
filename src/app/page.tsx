'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import anime from 'animejs';
import Link from 'next/link';

/* ─── Pastel blobs ─── */
function PastelBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute -top-[15vh] -right-[10vw] w-[65vw] h-[65vw] rounded-full"
        style={{ background: 'radial-gradient(circle at 40% 40%, rgba(255,183,197,0.35), rgba(255,218,185,0.2) 50%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="absolute top-[35vh] -left-[15vw] w-[55vw] h-[55vw] rounded-full"
        style={{ background: 'radial-gradient(circle at 60% 50%, rgba(196,181,253,0.25), rgba(165,214,255,0.15) 55%, transparent 70%)', filter: 'blur(100px)' }} />
      <div className="absolute bottom-[-10vh] right-[5vw] w-[50vw] h-[50vw] rounded-full"
        style={{ background: 'radial-gradient(circle at 40% 60%, rgba(167,243,208,0.2), rgba(196,181,253,0.15) 55%, transparent 70%)', filter: 'blur(90px)' }} />
    </div>
  );
}

/* ─── Grain ─── */
function GrainOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.025]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat', backgroundSize: '128px 128px',
      }} />
  );
}

/* ─── Cursor ─── */
function CursorDot() {
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
      <div ref={ringRef} className="fixed w-10 h-10 rounded-full border pointer-events-none z-[100] hidden md:block"
        style={{ borderColor: 'rgba(167,139,250,0.3)', transform: 'translate(-50%, -50%)' }} />
    </>
  );
}

/* ─── Smooth scroll (lerp only, no snap) ─── */
function useSmoothScroll(containerRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let current = 0;
    let target = 0;
    let rafId: number;
    const maxScroll = () => el.scrollHeight - el.clientHeight;

    const lerp = () => {
      const diff = target - current;
      current += diff * 0.08;
      if (Math.abs(diff) < 0.5) current = target;
      el.scrollTop = current;
      rafId = requestAnimationFrame(lerp);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      target = Math.max(0, Math.min(target + e.deltaY, maxScroll()));
    };

    let lastTouchY = 0;
    const handleTouchStart = (e: TouchEvent) => { lastTouchY = e.touches[0].clientY; };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const y = e.touches[0].clientY;
      const dy = lastTouchY - y;
      lastTouchY = y;
      target = Math.max(0, Math.min(target + dy * 2, maxScroll()));
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    rafId = requestAnimationFrame(lerp);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(rafId);
    };
  }, [containerRef]);
}

/* ─── Hook: section scroll progress (0→1) driven by scroll position ─── */
function useScrollProgress(sectionRef: React.RefObject<HTMLElement | null>, containerRef: React.RefObject<HTMLDivElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    let ticking = false;
    const update = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = section.getBoundingClientRect();
          const vh = window.innerHeight;
          // p=0 when top of section reaches bottom of viewport
          // p=1 when top of section reaches top of viewport
          const p = Math.max(0, Math.min(1, 1 - rect.top / vh));
          setProgress(p);
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', update, { passive: true });
    update();
    return () => container.removeEventListener('scroll', update);
  }, [sectionRef, containerRef]);

  return progress;
}

/* ─── Interpolation helper ─── */
function interp(progress: number, start: number, end: number, from: number, to: number) {
  const t = Math.max(0, Math.min(1, (progress - start) / (end - start)));
  return from + (to - from) * t;
}

/* ─── Tilt card ─── */
function TiltCard({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = (e: React.MouseEvent) => {
    const card = ref.current; if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.01)`;
  };
  const handleLeave = () => { if (ref.current) ref.current.style.transform = 'none'; };
  return (
    <div ref={ref} className={className} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ ...style, transition: 'transform 0.4s cubic-bezier(0.03, 0.98, 0.52, 0.99)' }}>
      {children}
    </div>
  );
}

/* ─── Counter ─── */

/* ─── Section dots ─── */
function SectionDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="w-2 h-2 rounded-full transition-all duration-500"
          style={{
            background: i === current ? 'linear-gradient(135deg, #60a5fa, #f9a8d4)' : 'rgba(0,0,0,0.08)',
            transform: i === current ? 'scale(1.5)' : 'scale(1)',
          }} />
      ))}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SCROLL-DRIVEN SECTIONS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function HeroSection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
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
        <p className="font-gothic text-[11px] tracking-[0.35em] text-stone-500 uppercase mb-5">PaleTech &mdash; Fukuoka, Japan</p>
        <h1 className="font-display text-[clamp(2.5rem,8vw,9rem)] leading-[1] text-stone-800 tracking-tight mb-8 font-extrabold inline-block">
          <span className="hero-title block opacity-0">Paleolithic</span>
          <span className="hero-title block opacity-0">Technology</span>
        </h1>
        <div className="hero-line h-px w-full max-w-sm mb-8" style={{ background: 'linear-gradient(90deg, #60a5fa, #f9a8d4, transparent)', transformOrigin: 'left', transform: 'scaleX(0)' }} />
        <p className="hero-sub font-gothic text-xl md:text-2xl lg:text-3xl text-stone-600 font-light tracking-wide max-w-xl" style={{ opacity: 0 }}>テクノロジーで、人を想う。</p>
        <div className="scroll-hint absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center" style={{ opacity: 0 }}>
          <div className="w-6 h-10 rounded-full border-2 border-stone-300/40 flex justify-center pt-2 mb-3">
            <div className="w-1 h-2 rounded-full bg-stone-500/70 scroll-dot" />
          </div>
          <span className="font-gothic text-[9px] tracking-[0.4em] text-stone-500/70 uppercase">Scroll</span>
        </div>
      </div>
    </section>
  );
}

function PhilosophySection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLElement>(null);
  const p = useScrollProgress(ref, containerRef);

  // Elements appear progressively as you scroll into this section
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
              <span className="block" style={{ opacity: title2Op, transform: `translateY(${title2Y}px)` }}>First.</span>
            </h2>
            <div className="h-px w-24 mt-8"
              style={{ background: 'linear-gradient(90deg, #60a5fa, #f9a8d4, transparent)', transformOrigin: 'left', transform: `scaleX(${lineScale})` }} />
          </div>
          <div className="lg:col-span-6 lg:col-start-7 flex flex-col justify-center">
            <p className="font-gothic text-lg md:text-xl text-stone-600 leading-[2.2] font-light mb-8"
              style={{ opacity: text1Op, transform: `translateY(${text1Y}px)` }}>
              多様性を認め合い、それぞれの強みを活かせる社会。<br />
              誰もが自分らしく生きられる世界を、<br />
              テクノロジーの力で実現する。
            </p>
            <p className="font-gothic text-[15px] text-stone-500 leading-[2.2] font-light"
              style={{ opacity: text2Op, transform: `translateY(${text2Y}px)` }}>
              テクノロジーと人の温かさを融合させ、
              持続可能で包括的なコミュニティを創造します。
              私たちは、一人ひとりの個性が最大限に発揮される未来を信じています。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}



/* ─── RAG left-side illustration: auto-plays with anime.js when step triggers ─── */

/* ─── Services Section: cards → click → selected expands, others slide away ─── */
function ServicesSection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  // Track scroll progress within this tall section
  useEffect(() => {
    const section = ref.current;
    const container = containerRef.current;
    if (!section || !container) return;
    let ticking = false;
    const update = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = section.getBoundingClientRect();
          const h = section.offsetHeight;
          const vh = container.clientHeight;
          setProgress(Math.max(0, Math.min(1, -rect.top / (h - vh))));
          ticking = false;
        });
        ticking = true;
      }
    };
    container.addEventListener('scroll', update, { passive: true });
    update();
    return () => container.removeEventListener('scroll', update);
  }, [containerRef]);

  const services = [
    { en: 'RAG', ja: 'RAG開発', desc: '検索拡張生成（RAG）を活用した高精度なAIシステムを構築。社内ナレッジの活用や業務効率化を実現します。', color: '#60a5fa' },
    { en: 'WEBSITES', ja: 'Webサイト制作', desc: 'ブランドの世界観を体現する、美しく機能的なWebサイトをデザイン・制作します。', color: '#f9a8d4' },
    { en: 'WEB APPS', ja: 'Web開発', desc: 'Next.js・React等のモダン技術で、スケーラブルなWebアプリケーションを開発します。', color: '#fbbf24' },
  ];

  // 0~0.1: "WE DO" fades in
  // 0.1~1.0: each service gets equal segment
  const svcStart = 0.1;
  const seg = (1 - svcStart) / services.length;
  const weDoOp = interp(progress, 0, 0.08, 0, 1);
  const activeIndex = Math.min(Math.floor((progress - svcStart) / seg), services.length - 1);

  return (
    <div ref={ref} style={{ height: `${(services.length * 1.5 + 1) * 100}vh` }} className="relative">
      <div className="sticky top-0 h-screen flex flex-col justify-center px-6 lg:px-12 overflow-hidden">

        {/* "WE DO" + service name — single line */}
        <div className="flex items-baseline gap-[1.2em] whitespace-nowrap overflow-hidden">
          <span className="font-display text-[clamp(1.8rem,4vw,3.5rem)] font-extrabold text-stone-800 leading-none">
            WE DEVELOP
          </span>

          <div className="relative" style={{ height: 'clamp(1.8rem,4vw,3.5rem)' }}>
            {services.map((s, i) => {
              const start = svcStart + i * seg;
              const end = start + seg;
              const inOp = interp(progress, start, start + seg * 0.25, 0, 1);
              const inY = interp(progress, start, start + seg * 0.25, 40, 0);
              const outOp = i < services.length - 1 ? interp(progress, end - seg * 0.2, end, 1, 0) : 1;
              const outY = i < services.length - 1 ? interp(progress, end - seg * 0.2, end, 0, -30) : 0;
              const op = Math.min(inOp, outOp);
              if (op < 0.01) return null;
              return (
                <span key={i} className="font-display absolute left-0 top-0 text-[clamp(1.8rem,4vw,3.5rem)] font-extrabold leading-none whitespace-nowrap"
                  style={{ color: s.color, opacity: op, transform: `translateY(${inY + outY}px)` }}>
                  {s.en}
                </span>
              );
            })}
          </div>
        </div>

        {/* Accent line */}
        <div className="mt-6 mb-8" style={{ height: '2px', width: `${interp(progress, 0.05, 0.2, 0, 80)}px`, background: 'linear-gradient(90deg, #60a5fa, transparent)' }} />

        {/* Description */}
        <div className="relative" style={{ minHeight: '80px', maxWidth: '500px' }}>
          {services.map((s, i) => {
            const start = svcStart + i * seg;
            const end = start + seg;
            const dOp = interp(progress, start + seg * 0.15, start + seg * 0.4, 0, 1);
            const dY = interp(progress, start + seg * 0.15, start + seg * 0.4, 15, 0);
            const dExit = i < services.length - 1 ? interp(progress, end - seg * 0.2, end, 1, 0) : 1;
            const op = Math.min(dOp, dExit);
            if (op < 0.01) return null;
            return (
              <div key={i} className="absolute top-0 left-0 right-0"
                style={{ opacity: op, transform: `translateY(${dY}px)` }}>
                <p className="font-gothic text-[13px] mb-2" style={{ color: s.color, fontWeight: 500 }}>{s.ja}</p>
                <p className="font-gothic text-[14px] text-stone-500 leading-[2] font-light">{s.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Right dots */}
        <div className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3">
          {services.map((s, i) => {
            const active = progress >= svcStart + i * seg && (i === services.length - 1 || progress < svcStart + (i + 1) * seg);
            return (
              <div key={i} className="transition-all duration-400" style={{
                width: '5px', height: active ? '18px' : '5px', borderRadius: '3px',
                background: active ? s.color : 'rgba(0,0,0,0.08)',
                transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
              }} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CtaSection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLElement>(null);
  const p = useScrollProgress(ref, containerRef);

  const headOp = interp(p, 0.15, 0.4, 0, 1);
  const headY = interp(p, 0.15, 0.4, 30, 0);
  const subOp = interp(p, 0.3, 0.55, 0, 1);
  const subY = interp(p, 0.3, 0.55, 20, 0);
  const btnOp = interp(p, 0.45, 0.7, 0, 1);
  const btnY = interp(p, 0.45, 0.7, 20, 0);
  const bgTextOp = interp(p, 0.1, 0.5, 0, 0.03);

  return (
    <section ref={ref} className="section-page relative flex items-center justify-center px-6 lg:px-12 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="font-display text-[clamp(8rem,25vw,22rem)] text-stone-800 font-extrabold leading-none"
          style={{ opacity: bgTextOp }}>Join</span>
      </div>
      <div className="max-w-[1440px] mx-auto relative z-10 text-center">
        <h2 className="font-gothic text-3xl md:text-4xl lg:text-5xl text-stone-800 font-light leading-[1.7] mb-12"
          style={{ opacity: headOp, transform: `translateY(${headY}px)` }}>
          一緒に未来を<br />創りませんか？
        </h2>
        <p className="font-gothic text-[15px] text-stone-500 leading-[2] font-light max-w-lg mx-auto mb-14"
          style={{ opacity: subOp, transform: `translateY(${subY}px)` }}>
          私たちと共に、新しい社会の形を実現しましょう。
        </p>
        <div className="flex flex-col sm:flex-row gap-5 justify-center"
          style={{ opacity: btnOp, transform: `translateY(${btnY}px)` }}>
          <a href="/careers"
            className="group relative px-10 py-4 font-gothic text-[12px] tracking-[0.15em] uppercase overflow-hidden rounded-full border text-stone-700 hover:text-white transition-colors duration-500"
            style={{ borderColor: 'rgba(0,0,0,0.12)' }}>
            <span className="relative z-10">採用情報を見る</span>
            <div className="absolute inset-0 bg-stone-800 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full" />
          </a>
          <a href="/contact"
            className="group relative px-10 py-4 font-gothic text-[12px] tracking-[0.15em] uppercase overflow-hidden rounded-full bg-stone-800 text-white hover:text-stone-800 transition-colors duration-500">
            <span className="relative z-10">お問い合わせ</span>
            <div className="absolute inset-0 bg-stone-100 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full" />
          </a>
        </div>
      </div>
    </section>
  );
}

function FooterSection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLElement>(null);
  const p = useScrollProgress(ref, containerRef);

  const col1Op = interp(p, 0.1, 0.35, 0, 1);
  const col1Y = interp(p, 0.1, 0.35, 30, 0);
  const col2Op = interp(p, 0.2, 0.45, 0, 1);
  const col2Y = interp(p, 0.2, 0.45, 30, 0);
  const col3Op = interp(p, 0.3, 0.55, 0, 1);
  const col3Y = interp(p, 0.3, 0.55, 30, 0);

  return (
    <section ref={ref} className="section-page relative flex items-end overflow-hidden" style={{ background: '#e8e6e1' }}>
      <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 py-16">
        <div className="grid lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-5" style={{ opacity: col1Op, transform: `translateY(${col1Y}px)` }}>
            <Link href="/" className="font-display text-4xl text-stone-700 font-bold tracking-tight inline-block mb-6">PaleTech</Link>
            <p className="font-gothic text-sm text-stone-500 leading-[2] font-light max-w-sm">
              テクノロジーで取り戻す。<br />福岡からAIを活用し、ウェルビーイングな社会を創造する。
            </p>
          </div>
          <div className="lg:col-span-3 lg:col-start-7" style={{ opacity: col2Op, transform: `translateY(${col2Y}px)` }}>
            <p className="font-gothic text-[11px] tracking-[0.2em] text-stone-400 uppercase mb-6">Navigate</p>
            <div className="space-y-4">
              {['About', 'Service', 'News', 'Careers', 'Contact'].map((item) => (
                <div key={item}><Link href={`/${item.toLowerCase()}`} className="font-gothic text-sm text-stone-500 hover:text-stone-700 transition-colors duration-300">{item}</Link></div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3" style={{ opacity: col3Op, transform: `translateY(${col3Y}px)` }}>
            <p className="font-gothic text-[11px] tracking-[0.2em] text-stone-400 uppercase mb-6">Legal</p>
            <div className="space-y-4">
              <div><Link href="/privacy" className="font-gothic text-sm text-stone-500 hover:text-stone-700 transition-colors duration-300">個人情報保護方針</Link></div>
              <div><Link href="/ir" className="font-gothic text-sm text-stone-500 hover:text-stone-700 transition-colors duration-300">IR情報</Link></div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
          <p className="font-gothic text-[11px] text-stone-400">&copy; {new Date().getFullYear()} PaleTech Inc.</p>
          <p className="font-gothic text-[11px] text-stone-400/60 mt-2 md:mt-0">Fukuoka, Japan</p>
        </div>
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PAGE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function TestPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const SECTION_COUNT = 10;

  useSmoothScroll(containerRef);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const vh = window.innerHeight;
      setCurrentSection(Math.min(Math.round(scrollTop / vh), SECTION_COUNT - 1));
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@300;400;500;700;900&display=swap');

        .font-display { font-family: 'Zen Maru Gothic', sans-serif; }
        .font-gothic { font-family: 'Zen Maru Gothic', sans-serif; }

        @keyframes scrollDot {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(12px); opacity: 0; }
        }
        .scroll-dot { animation: scrollDot 2s ease-in-out infinite; }

        .group\/card:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 8px 30px rgba(0,0,0,0.06);
          border-color: rgba(0,0,0,0.1) !important;
        }

        html, body { overflow: hidden; height: 100%; margin: 0; }

        .scroll-container {
          height: 100vh;
          overflow-y: scroll;
        }

        .section-page {
          height: 100vh;
          min-height: 100vh;
        }

        .scroll-container::-webkit-scrollbar { display: none; }
        .scroll-container { -ms-overflow-style: none; scrollbar-width: none; }

        ::selection { background: rgba(167, 139, 250, 0.2); color: inherit; }
      `}</style>

      <PastelBlobs />
      <GrainOverlay />
      <CursorDot />
      <SectionDots current={currentSection} total={SECTION_COUNT} />

      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-3 flex justify-between items-center">
          <Link href="/" className="font-display text-lg text-stone-800 tracking-tight font-bold">PaleTech</Link>
          <div className="flex items-center gap-8">
            <Link href="/" className="font-gothic text-[11px] text-stone-500 hover:text-stone-800 tracking-[0.2em] uppercase transition-colors duration-300">Home</Link>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'linear-gradient(135deg, #60a5fa, #f9a8d4)' }} />
          </div>
        </div>
      </nav>

      <div ref={containerRef} className="scroll-container" style={{ background: '#f0eeeb' }}>
        <HeroSection containerRef={containerRef} />
        <PhilosophySection containerRef={containerRef} />
        <ServicesSection containerRef={containerRef} />
        <CtaSection containerRef={containerRef} />
        <FooterSection containerRef={containerRef} />
      </div>
    </>
  );
}
