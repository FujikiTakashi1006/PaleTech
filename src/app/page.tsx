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
      <div ref={ringRef} className="fixed w-10 h-10 rounded-full border-2 pointer-events-none z-[100] hidden md:block"
        style={{ borderColor: 'rgba(167,139,250,0.3)', transform: 'translate(-50%, -50%)' }} />
    </>
  );
}

/* ─── Smooth scroll (lerp only, no snap) ─── */
// wheelInterceptRef: if set to a function, wheel events are forwarded there instead of scrolling
const wheelInterceptRef = { current: null as ((deltaY: number) => void) | null };
const scrollToRef = { current: null as ((pos: number) => void) | null };

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
      if (wheelInterceptRef.current) {
        wheelInterceptRef.current(e.deltaY);
        return;
      }
      target = Math.max(0, Math.min(target + e.deltaY, maxScroll()));
    };

    let lastTouchY = 0;
    const handleTouchStart = (e: TouchEvent) => { lastTouchY = e.touches[0].clientY; };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const y = e.touches[0].clientY;
      const dy = lastTouchY - y;
      lastTouchY = y;
      if (wheelInterceptRef.current) {
        wheelInterceptRef.current(dy * 2);
        return;
      }
      target = Math.max(0, Math.min(target + dy * 2, maxScroll()));
    };

    scrollToRef.current = (pos: number) => {
      target = Math.max(0, Math.min(pos, maxScroll()));
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    rafId = requestAnimationFrame(lerp);

    return () => {
      scrollToRef.current = null;
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



/* ─── RAG left-side illustration: auto-plays with anime.js when step triggers ─── */

/* ─── RAG Illustration: auto-plays with anime.js when step triggers ─── */
function RAGIllustration({ steps, progress, stepAppear }: {
  steps: { id: string; color: string; icon: (op: number) => React.ReactNode }[];
  progress: number;
  stepAppear: number[];
}) {
  const [activeStep, setActiveStep] = useState(-1);
  const [iconProgress, setIconProgress] = useState(0);
  const animRef = useRef<ReturnType<typeof anime> | null>(null);

  useEffect(() => {
    let current = -1;
    for (let i = stepAppear.length - 1; i >= 0; i--) {
      if (progress >= stepAppear[i]) { current = i; break; }
    }
    if (current !== activeStep) setActiveStep(current);
  }, [progress, stepAppear, activeStep]);

  useEffect(() => {
    if (activeStep < 0) return;
    setIconProgress(0);
    if (animRef.current) animRef.current.pause();
    const obj = { val: 0 };
    animRef.current = anime({
      targets: obj, val: 1, duration: 2000, easing: 'easeInOutCubic',
      update: () => setIconProgress(obj.val),
    });
    return () => { if (animRef.current) animRef.current.pause(); };
  }, [activeStep]);

  return (
    <div className="relative h-[160px] md:h-[200px]">
      {steps.map((step, i) => (
        <div key={step.id} className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
          style={{ opacity: i === activeStep ? 1 : 0, pointerEvents: i === activeStep ? 'auto' : 'none' }}>
          <div className="w-full max-w-[280px] h-full" style={{ filter: `drop-shadow(0 4px 20px ${step.color}20)` }}>
            {step.icon(i === activeStep ? iconProgress : 0)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Services Section: WE DEVELOP scroll + detail panel ─── */
function ServicesSection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [detailOpen, setDetailOpen] = useState<number | null>(null);
  const [ragProgress, setRagProgress] = useState(0);
  const ragProgressRef = useRef(0);

  // Main scroll progress
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

  // When detail is open: intercept wheel → drive ragProgress instead of page scroll
  useEffect(() => {
    if (detailOpen === null) {
      wheelInterceptRef.current = null;
      return;
    }

    ragProgressRef.current = 0;
    setRagProgress(0);

    wheelInterceptRef.current = (deltaY: number) => {
      ragProgressRef.current = Math.max(0, Math.min(1, ragProgressRef.current + deltaY * 0.0008));
      setRagProgress(ragProgressRef.current);
    };

    return () => { wheelInterceptRef.current = null; };
  }, [detailOpen]);

  const services = [
    { en: 'RAG', ja: 'RAG開発', desc: 'Retrieval-Augmented Generation（検索拡張生成）を活用した高精度なAIシステムを構築。社内ナレッジの活用や業務効率化を実現します。', color: '#7aa3ed' },
    { en: 'WEBSITES', ja: 'Webサイト制作', desc: 'ブランドの世界観を体現する、美しく機能的なWebサイトをデザイン・制作します。', color: '#5fbf96' },
    { en: 'WEB APPS', ja: 'Web開発', desc: 'Next.js・React等のモダン技術で、スケーラブルなWebアプリケーションを開発します。', color: '#9b8ad4' },
  ];

  // RAG scroll-driven steps with SVG icons
  const ragSteps = [
    {
      id: 'query', label: 'Step 01', title: 'ユーザーが質問する',
      desc: 'ユーザーが自然言語で質問を入力。AIが質問の意図を理解し、検索クエリに変換します。',
      color: '#7aa3ed',
      icon: (op: number) => (
        <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
          <rect x="10" y="10" width="100" height="50" rx="12" stroke="#7aa3ed" strokeWidth="1.5" style={{ strokeDasharray: 300, strokeDashoffset: 300 * (1 - op), opacity: op }} />
          <line x1="26" y1="28" x2="74" y2="28" stroke="#7aa3ed" strokeWidth="2" strokeLinecap="round" style={{ opacity: interp(op, 0.3, 0.6, 0, 1) }} />
          <line x1="26" y1="38" x2="60" y2="38" stroke="#7aa3ed" strokeWidth="2" strokeLinecap="round" style={{ opacity: interp(op, 0.4, 0.7, 0, 1) }} />
          <rect x="62" y="34" width="2" height="10" fill="#7aa3ed" rx="1" style={{ opacity: interp(op, 0.5, 0.8, 0, 1) }} />
          <path d="M60 62 L60 76 M54 70 L60 76 L66 70" stroke="#7aa3ed" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: interp(op, 0.7, 1, 0, 1) }} />
        </svg>
      ),
    },
    {
      id: 'search', label: 'Step 02', title: 'ベクトル検索で関連文書を取得',
      desc: '質問をベクトル化し、データベース内の類似ドキュメントを高速に検索。最も関連性の高い情報源を特定します。',
      color: '#7aa3ed',
      icon: (op: number) => (
        <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
          {[{cx:25,cy:20,d:0},{cx:45,cy:15,d:0.05},{cx:65,cy:25,d:0.1},{cx:85,cy:18,d:0.15},{cx:35,cy:45,d:0.2},{cx:55,cy:40,d:0.25},{cx:75,cy:50,d:0.3},{cx:95,cy:42,d:0.35},{cx:20,cy:65,d:0.4},{cx:45,cy:60,d:0.45}].map((dot, i) => (
            <circle key={i} cx={dot.cx} cy={dot.cy} r={i===5?5:3} fill={i===5?'#7aa3ed':'#7aa3ed40'}
              style={{opacity:interp(op,dot.d,dot.d+0.3,0,1),transform:`scale(${interp(op,dot.d,dot.d+0.3,0,1)})`,transformOrigin:`${dot.cx}px ${dot.cy}px`}}/>
          ))}
          <circle cx="82" cy="60" r="10" stroke="#7aa3ed" strokeWidth="1.5" style={{strokeDasharray:80,strokeDashoffset:80*(1-interp(op,0.5,0.8,0,1))}}/>
          <line x1="89" y1="67" x2="98" y2="76" stroke="#7aa3ed" strokeWidth="2" strokeLinecap="round" style={{opacity:interp(op,0.6,0.9,0,1)}}/>
        </svg>
      ),
    },
    {
      id: 'generate', label: 'Step 03', title: 'LLMが回答を生成',
      desc: '取得した文書をコンテキストとしてLLMに渡し、根拠に基づいた正確な回答を生成します。',
      color: '#7aa3ed',
      icon: (op: number) => (
        <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
          <rect x="5" y="4" width="110" height="72" rx="10" stroke="#7aa3ed" strokeWidth="1.5" style={{strokeDasharray:400,strokeDashoffset:400*(1-interp(op,0,0.25,0,1))}}/>
          <circle cx="16" cy="16" r="3" fill="#7aa3ed" style={{opacity:interp(op,0.1,0.3,0,1)}}/>
          <text x="22" y="18" fill="#7aa3ed" fontSize="6" fontFamily="monospace" fontWeight="bold" style={{opacity:interp(op,0.1,0.3,0,1)}}>AI</text>
          {[{y:35,w:80,d:0.2},{y:47,w:65,d:0.45},{y:59,w:50,d:0.7}].map((line,i)=>{
            const lo=interp(op,line.d,line.d+0.15,0,1);
            return(<line key={i} x1="16" y1={line.y} x2={16+line.w*lo} y2={line.y} stroke="#7aa3ed" strokeWidth="2" strokeLinecap="round" style={{opacity:lo*0.7}}/>);
          })}
        </svg>
      ),
    },
  ];
  const stepAppear = [0.08, 0.35, 0.62];

  const svcStart = 0.1;
  const seg = (1 - svcStart) / services.length;

  return (
    <div ref={ref} style={{ height: `${(services.length * 1.5 + 1) * 100}vh` }} className="relative">
      <div className="sticky top-0 h-screen flex overflow-hidden">

        {/* ─── Left: WE DEVELOP + descriptions ─── */}
        <div className="flex flex-col justify-center px-6 lg:px-12 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: detailOpen !== null ? '45%' : '100%', flexShrink: 0 }}>

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

          <div className="mt-6 mb-8" style={{ height: '2px', width: `${interp(progress, 0.05, 0.2, 0, 80)}px`, background: 'linear-gradient(90deg, #7aa3ed, transparent)' }} />

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
                  <p className="font-gothic text-[14px] text-stone-700 leading-[2] font-light mb-4">{s.desc}</p>
                  <div className="flex justify-end">
                    <button onClick={() => setDetailOpen(detailOpen === i ? null : i)}
                      className="inline-flex items-center gap-2 font-gothic text-[11px] tracking-[0.1em] px-5 py-2.5 rounded-full transition-all duration-300 hover:brightness-90 cursor-pointer"
                      style={{ background: s.color, color: '#fff' }}>
                      {detailOpen === i ? '閉じる' : '詳細を見る'}
                      <svg className="w-3.5 h-3.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                        style={{ transform: detailOpen === i ? 'rotate(45deg)' : 'none' }}>
                        {detailOpen === i
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          : <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                        }
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Right: Detail panel ─── */}
        <div className="h-full border-l overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            width: detailOpen !== null ? '55%' : '0%',
            opacity: detailOpen !== null ? 1 : 0,
            borderColor: detailOpen !== null ? 'rgba(0,0,0,0.06)' : 'transparent',
          }}>
          <div className="h-full flex flex-col justify-center p-6 lg:p-10">

            {/* RAG: scroll-driven illustration + timeline */}
            {detailOpen === 0 && (
              <div>
                <p className="font-gothic text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: services[0].color }}>How RAG Works</p>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Left: auto-play illustration */}
                  <div className="w-full md:w-5/12">
                    <RAGIllustration steps={ragSteps} progress={ragProgress} stepAppear={stepAppear} />
                  </div>
                  {/* Right: scroll-driven timeline */}
                  <div className="w-full md:w-7/12 relative">
                    <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-stone-200/30 rounded-full hidden md:block">
                      <div className="w-full rounded-full" style={{ height: `${Math.min(ragProgress * 130, 100)}%`, background: '#7aa3ed' }} />
                    </div>
                    {ragSteps.map((step, i) => {
                      const appear = interp(ragProgress, stepAppear[i], stepAppear[i] + 0.12, 0, 1);
                      return (
                        <div key={step.id} className="flex items-start gap-4 pb-5"
                          style={{ opacity: appear, transform: `translateY(${(1 - appear) * 20}px)` }}>
                          <div className="hidden md:flex flex-shrink-0 w-4 h-4 rounded-full border-2 mt-0.5 items-center justify-center relative z-10"
                            style={{ borderColor: step.color, background: appear > 0.5 ? step.color : 'white', transition: 'background 0.4s' }}>
                            {appear > 0.5 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <span className="font-gothic text-[10px] tracking-[0.2em] uppercase mb-1 block" style={{ color: step.color }}>{step.label}</span>
                            <h4 className="font-display text-base text-stone-800 font-bold mb-1">{step.title}</h4>
                            <p className="font-gothic text-[12px] text-stone-500 leading-[1.8] font-light">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Websites detail */}
            {detailOpen === 1 && (
              <div>
                <p className="font-gothic text-[11px] tracking-[0.3em] uppercase mb-8" style={{ color: services[1].color }}>Design Process</p>
                <div className="space-y-6">
                  {['ヒアリング・リサーチ', 'ワイヤーフレーム設計', 'ビジュアルデザイン', 'コーディング・実装', 'テスト・公開'].map((step, i) => (
                    <div key={i} className="flex items-center gap-5">
                      <span className="font-display text-[28px] font-extrabold leading-none" style={{ color: services[1].color + '25' }}>{String(i + 1).padStart(2, '0')}</span>
                      <p className="font-gothic text-[14px] text-stone-600 font-light">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Web Apps detail */}
            {detailOpen === 2 && (
              <div>
                <p className="font-gothic text-[11px] tracking-[0.3em] uppercase mb-8" style={{ color: services[2].color }}>Tech Stack</p>
                <div className="flex flex-wrap gap-3 mb-8">
                  {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Prisma', 'Vercel'].map((tech, i) => (
                    <span key={i} className="px-4 py-2 rounded-full font-gothic text-[12px] border"
                      style={{ borderColor: services[2].color + '25', color: services[2].color, background: services[2].color + '08' }}>
                      {tech}
                    </span>
                  ))}
                </div>
                <p className="font-gothic text-[14px] text-stone-500 leading-[2] font-light">
                  フロントエンドからバックエンド、インフラまで。TypeScriptベースのモダンスタックで保守性と拡張性を両立します。
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

function CtaSection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLElement>(null);
  const p = useScrollProgress(ref, containerRef);
  const [showForm, setShowForm] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const headOp = showForm ? 0 : interp(p, 0.15, 0.4, 0, 1);
  const headY = showForm ? 0 : interp(p, 0.15, 0.4, 30, 0);
  const subOp = showForm ? 0 : interp(p, 0.3, 0.55, 0, 1);
  const subY = showForm ? 0 : interp(p, 0.3, 0.55, 20, 0);
  const btnOp = showForm ? 0 : interp(p, 0.45, 0.7, 0, 1);
  const btnY = showForm ? 0 : interp(p, 0.45, 0.7, 20, 0);
  const bgTextOp = interp(p, 0.1, 0.5, 0, 0.03);

  const openForm = () => {
    setShowForm(true);
    setTimeout(() => setFormReady(true), 50);
  };

  const handleBack = () => {
    setFormReady(false);
    setTimeout(() => { setShowForm(false); setSubmitted(false); }, 400);
  };

  const formContainerRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);

    // Phase 1: shrink form
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 800);
  };

  useEffect(() => {
    if (!submitted || !successRef.current) return;
    const el = successRef.current;
    const circle = el.querySelector('.check-circle') as SVGCircleElement;
    const check = el.querySelector('.check-path') as SVGPathElement;
    const texts = el.querySelectorAll('.success-text');

    // draw circle
    if (circle) {
      const len = circle.getTotalLength();
      circle.style.strokeDasharray = `${len}`;
      circle.style.strokeDashoffset = `${len}`;
      anime({ targets: circle, strokeDashoffset: [len, 0], duration: 600, easing: 'easeInOutCubic', delay: 100 });
    }
    // draw check
    if (check) {
      const len = check.getTotalLength();
      check.style.strokeDasharray = `${len}`;
      check.style.strokeDashoffset = `${len}`;
      anime({ targets: check, strokeDashoffset: [len, 0], duration: 400, easing: 'easeOutCubic', delay: 550 });
    }
    // scale pop the svg container
    anime({ targets: el.querySelector('.check-icon'), scale: [0, 1], duration: 500, easing: 'easeOutBack', delay: 50 });
    // fade in texts staggered
    anime({ targets: texts, opacity: [0, 1], translateY: [15, 0], duration: 500, delay: anime.stagger(120, { start: 800 }), easing: 'easeOutCubic' });
  }, [submitted]);

  return (
    <section ref={ref} className="section-page relative flex items-center justify-center px-6 lg:px-12 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="font-display text-[clamp(5rem,16vw,14rem)] text-stone-800 font-extrabold leading-none"
          style={{ opacity: bgTextOp }}>Contact</span>
      </div>

      {/* CTA content */}
      <div className="max-w-[1440px] mx-auto relative z-10 text-center transition-all duration-400"
        style={{ opacity: showForm ? 0 : 1, transform: showForm ? 'translateY(-20px)' : 'none', pointerEvents: showForm ? 'none' : 'auto', position: showForm ? 'absolute' : 'relative' }}>
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
          <button onClick={openForm}
            className="px-10 py-4 font-gothic text-[12px] tracking-[0.15em] uppercase rounded-full bg-stone-800 text-white hover:bg-stone-600 transition-all duration-300 hover:shadow-lg">
            お問い合わせ
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="max-w-[780px] w-full mx-auto relative z-10 transition-all duration-500 rounded-3xl px-8 py-10 md:px-12 md:py-12"
          style={{ opacity: formReady ? 1 : 0, transform: formReady ? 'translateY(0)' : 'translateY(30px)', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(20px) saturate(1.4)', WebkitBackdropFilter: 'blur(20px) saturate(1.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          {!submitted ? (
            <>
              <div className="text-center mb-6">
                <h3 className="font-gothic text-xl text-stone-800 font-light mb-1">お問い合わせ</h3>
                <p className="font-gothic text-[12px] text-stone-400 font-light">
                  お気軽にどうぞ。
                </p>
              </div>
              <form onSubmit={handleSubmit}>
                <label className="block mb-4">
                  <span className="font-gothic text-[11px] text-stone-500 tracking-[0.08em] uppercase block mb-2">お名前 / 会社名 *</span>
                  <input required type="text" name="name"
                    className="w-full bg-white/60 border border-stone-200/80 rounded-lg px-4 py-3 font-gothic text-[14px] text-stone-700 placeholder-stone-300 outline-none focus:border-stone-400 focus:bg-white transition-all"
                    placeholder="山田 太郎 / 株式会社〇〇" />
                </label>
                <label className="block mb-4">
                  <span className="font-gothic text-[11px] text-stone-500 tracking-[0.08em] uppercase block mb-2">メールアドレス *</span>
                  <input required type="email" name="email"
                    className="w-full bg-white/60 border border-stone-200/80 rounded-lg px-4 py-3 font-gothic text-[14px] text-stone-700 placeholder-stone-300 outline-none focus:border-stone-400 focus:bg-white transition-all"
                    placeholder="email@example.com" />
                </label>
                <label className="block mb-6">
                  <span className="font-gothic text-[11px] text-stone-500 tracking-[0.08em] uppercase block mb-2">ご相談内容 *</span>
                  <textarea required name="message" rows={8}
                    className="w-full bg-white/60 border border-stone-200/80 rounded-lg px-4 py-3 font-gothic text-[14px] text-stone-700 placeholder-stone-300 outline-none focus:border-stone-400 focus:bg-white transition-all resize-none"
                    placeholder="ご相談内容をお書きください" />
                </label>
                <div className="text-center">
                <button type="submit" disabled={sending}
                  className="px-14 py-4 font-gothic text-[12px] tracking-[0.15em] uppercase rounded-full bg-stone-800 text-white hover:bg-stone-600 transition-all duration-300 hover:shadow-lg disabled:opacity-60 disabled:hover:bg-stone-800"
                  style={{ minWidth: sending ? 56 : undefined, transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)' }}>
                  {sending ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  ) : '送信する'}
                </button>
                </div>
              </form>
            </>
          ) : (
            <div ref={successRef} className="text-center py-12">
              <div className="check-icon mx-auto mb-8" style={{ width: 80, height: 80 }}>
                <svg viewBox="0 0 80 80" fill="none" width="80" height="80">
                  <circle className="check-circle" cx="40" cy="40" r="36" stroke="#78716c" strokeWidth="2" fill="none" />
                  <path className="check-path" d="M24 40l10 10 22-22" stroke="#78716c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <h3 className="success-text font-gothic text-2xl text-stone-800 font-light mb-3" style={{ opacity: 0 }}>送信完了</h3>
              <p className="success-text font-gothic text-[13px] text-stone-400 leading-[1.8] font-light" style={{ opacity: 0 }}>
                ありがとうございます。<br />担当者よりご連絡いたします。
              </p>
            </div>
          )}
        </div>
      )}
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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PAGE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function TestPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const SECTION_COUNT = 5;

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

        @keyframes scrollLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .scroll-line { animation: scrollLine 1.5s ease-in-out infinite; }

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
            {[
              { label: 'Home', id: 'hero' },
              { label: 'Philosophy', id: 'philosophy' },
              { label: 'Service', id: 'services' },
              { label: 'Contact', id: 'contact' },
            ].map((item) => (
              <button key={item.id}
                onClick={() => {
                  const el = document.getElementById(item.id);
                  const container = containerRef.current;
                  if (el && container && scrollToRef.current) {
                    const containerRect = container.getBoundingClientRect();
                    const elRect = el.getBoundingClientRect();
                    const offset = elRect.top - containerRect.top + container.scrollTop;
                    scrollToRef.current(offset);
                  }
                }}
                className="font-gothic text-[11px] text-stone-400 tracking-[0.2em] uppercase transition-all duration-300 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-pink-400 cursor-pointer bg-transparent border-none">
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div ref={containerRef} className="scroll-container" style={{ background: '#f0eeeb' }}>
        <div id="hero"><HeroSection containerRef={containerRef} /></div>
        <div id="philosophy"><PhilosophySection containerRef={containerRef} /></div>
        <div id="services"><ServicesSection containerRef={containerRef} /></div>
        <div id="cta"><CtaSection containerRef={containerRef} /></div>
        <div id="contact"><FooterSection containerRef={containerRef} /></div>
      </div>
    </>
  );
}
