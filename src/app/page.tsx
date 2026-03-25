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
function RAGIllustration({ steps, progress, stepAppear }: {
  steps: { id: string; color: string; icon: (op: number) => React.ReactNode }[];
  progress: number;
  stepAppear: number[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(-1);
  const [iconProgress, setIconProgress] = useState(0);
  const animRef = useRef<ReturnType<typeof anime> | null>(null);

  // Determine which step is active based on scroll progress
  useEffect(() => {
    let current = -1;
    for (let i = stepAppear.length - 1; i >= 0; i--) {
      if (progress >= stepAppear[i]) { current = i; break; }
    }
    if (current !== activeStep) {
      setActiveStep(current);
    }
  }, [progress, stepAppear, activeStep]);

  // When active step changes, auto-play animation
  useEffect(() => {
    if (activeStep < 0) return;

    // Reset and animate icon progress 0→1 over 2 seconds
    setIconProgress(0);
    if (animRef.current) animRef.current.pause();

    const obj = { val: 0 };
    animRef.current = anime({
      targets: obj,
      val: 1,
      duration: 2000,
      easing: 'easeInOutCubic',
      update: () => setIconProgress(obj.val),
    });

    return () => { if (animRef.current) animRef.current.pause(); };
  }, [activeStep]);

  return (
    <div ref={containerRef} className="relative h-[180px] md:h-[220px]">
      {steps.map((step, i) => {
        const isActive = i === activeStep;
        const isPast = i < activeStep;
        const opacity = isActive ? 1 : isPast ? 0 : 0;

        return (
          <div key={step.id} className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
            style={{ opacity, pointerEvents: isActive ? 'auto' : 'none' }}>
            <div className="w-full max-w-[320px] h-full"
              style={{ filter: `drop-shadow(0 4px 20px ${step.color}20)` }}>
              {step.icon(isActive ? iconProgress : 0)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── SVG icon that draws itself based on scroll progress ─── */
function DrawIcon({ paths, progress, color }: { paths: string[]; progress: number; color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-16 h-16 lg:w-20 lg:h-20" xmlns="http://www.w3.org/2000/svg">
      {paths.map((d, i) => {
        const delay = i * 0.15;
        const iconP = Math.max(0, Math.min(1, (progress - delay) / 0.6));
        return (
          <path key={i} d={d} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ strokeDasharray: 200, strokeDashoffset: 200 * (1 - iconP), transition: 'none' }} />
        );
      })}
    </svg>
  );
}

/* ─── Services Section: cards → click → selected expands, others slide away ─── */
function ServicesSection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [activeService, setActiveService] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [ragProgress, setRagProgress] = useState(0);

  const p = useScrollProgress(ref as React.RefObject<HTMLElement>, containerRef);

  const labelOp = interp(p, 0.1, 0.3, 0, 1);
  const labelX = interp(p, 0.1, 0.3, -20, 0);
  const titleOp = interp(p, 0.15, 0.4, 0, 1);
  const titleY = interp(p, 0.15, 0.4, 40, 0);

  const services = [
    { num: '01', title: 'RAG開発', en: 'RAG Development', desc: '検索拡張生成でAIを強化', color: '#60a5fa', hasDetail: true },
    { num: '02', title: 'Webサイト制作', en: 'Web Design', desc: 'ブランドを体現するデザイン', color: '#f9a8d4', hasDetail: false },
    { num: '03', title: 'Web開発', en: 'Web Development', desc: 'モダン技術でスケーラブルに', color: '#fbbf24', hasDetail: false },
  ];

  const ragSteps = [
    {
      id: 'query', label: 'Step 01', title: 'ユーザーが質問する',
      desc: 'ユーザーが自然言語で質問を入力。AIが質問の意図を理解し、検索クエリに変換します。',
      color: '#60a5fa',
      icon: (op: number) => (
        <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
          <rect x="10" y="10" width="100" height="50" rx="12" stroke="#60a5fa" strokeWidth="1.5" style={{ strokeDasharray: 300, strokeDashoffset: 300 * (1 - op), opacity: op }} />
          <line x1="26" y1="28" x2="74" y2="28" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" style={{ opacity: interp(op, 0.3, 0.6, 0, 1) }} />
          <line x1="26" y1="38" x2="60" y2="38" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" style={{ opacity: interp(op, 0.4, 0.7, 0, 1) }} />
          <rect x="62" y="34" width="2" height="10" fill="#60a5fa" rx="1" style={{ opacity: interp(op, 0.5, 0.8, 0, 1) }} />
          <path d="M60 62 L60 76 M54 70 L60 76 L66 70" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: interp(op, 0.7, 1, 0, 1) }} />
        </svg>
      ),
    },
    {
      id: 'search', label: 'Step 02', title: 'ベクトル検索で関連文書を取得',
      desc: '質問をベクトル化し、データベース内の類似ドキュメントを高速に検索。最も関連性の高い情報源を特定します。',
      color: '#60a5fa',
      icon: (op: number) => (
        <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
          {[{cx:25,cy:20,d:0},{cx:45,cy:15,d:0.05},{cx:65,cy:25,d:0.1},{cx:85,cy:18,d:0.15},{cx:35,cy:45,d:0.2},{cx:55,cy:40,d:0.25},{cx:75,cy:50,d:0.3},{cx:95,cy:42,d:0.35},{cx:20,cy:65,d:0.4},{cx:45,cy:60,d:0.45}].map((dot, i) => (
            <circle key={i} cx={dot.cx} cy={dot.cy} r={i===5?5:3} fill={i===5?'#60a5fa':'#60a5fa40'}
              style={{opacity:interp(op,dot.d,dot.d+0.3,0,1),transform:`scale(${interp(op,dot.d,dot.d+0.3,0,1)})`,transformOrigin:`${dot.cx}px ${dot.cy}px`}}/>
          ))}
          {[{x:25,y:20},{x:65,y:25},{x:35,y:45},{x:75,y:50},{x:45,y:60}].map((pt,i)=>(
            <line key={i} x1="55" y1="40" x2={pt.x} y2={pt.y} stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="4 3" style={{opacity:interp(op,0.4+i*0.05,0.7+i*0.05,0,0.5)}}/>
          ))}
          <circle cx="82" cy="60" r="10" stroke="#60a5fa" strokeWidth="1.5" style={{strokeDasharray:80,strokeDashoffset:80*(1-interp(op,0.5,0.8,0,1))}}/>
          <line x1="89" y1="67" x2="98" y2="76" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" style={{opacity:interp(op,0.6,0.9,0,1)}}/>
        </svg>
      ),
    },
    {
      id: 'generate', label: 'Step 03', title: 'LLMが回答を生成',
      desc: '取得した文書をコンテキストとしてLLMに渡し、根拠に基づいた正確な回答を生成。ハルシネーションを抑制します。',
      color: '#60a5fa',
      icon: (op: number) => (
        <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
          <rect x="5" y="4" width="110" height="72" rx="10" stroke="#60a5fa" strokeWidth="1.5" style={{strokeDasharray:400,strokeDashoffset:400*(1-interp(op,0,0.25,0,1))}}/>
          <circle cx="16" cy="16" r="3" fill="#60a5fa" style={{opacity:interp(op,0.1,0.3,0,1)}}/>
          <text x="22" y="18" fill="#60a5fa" fontSize="6" fontFamily="monospace" fontWeight="bold" style={{opacity:interp(op,0.1,0.3,0,1)}}>AI</text>
          {[{y:35,w:80,d:0.2},{y:47,w:65,d:0.45},{y:59,w:50,d:0.7}].map((line,i)=>{
            const lo=interp(op,line.d,line.d+0.15,0,1);
            return(<line key={i} x1="16" y1={line.y} x2={16+line.w*lo} y2={line.y} stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" style={{opacity:lo*0.7}}/>);
          })}
        </svg>
      ),
    },
  ];
  const stepAppear = [0.08, 0.35, 0.62];

  useEffect(() => {
    if (activeService !== 0) return;
    const section = ref.current;
    const container = containerRef.current;
    if (!section || !container) return;
    let ticking = false;
    const update = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = section.getBoundingClientRect();
          const sectionH = section.offsetHeight;
          const vh = window.innerHeight;
          setRagProgress(Math.max(0, Math.min(1, -rect.top / (sectionH - vh))));
          ticking = false;
        });
        ticking = true;
      }
    };
    container.addEventListener('scroll', update, { passive: true });
    update();
    return () => container.removeEventListener('scroll', update);
  }, [activeService, containerRef]);

  // Phase: 'cards' → 'leaving' → 'detail' → 'returning' → 'cards'
  const [phase, setPhase] = useState<'cards' | 'leaving' | 'detail' | 'returning'>('cards');

  const handleOpen = (i: number) => {
    setActiveService(i);
    setRagProgress(0);
    setPhase('detail');
  };

  const handleClose = () => {
    setActiveService(null);
    setRagProgress(0);
    setPhase('cards');
  };

  const isOpen = activeService !== null;

  return (
    <div ref={ref} style={{ height: activeService === 0 ? '400vh' : '100vh', transition: 'height 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }} className="relative">
      <div className="sticky top-0 h-screen flex items-center px-6 lg:px-12 overflow-hidden">
        <div className="max-w-[1440px] mx-auto w-full">
          <p className="font-gothic text-[11px] tracking-[0.35em] text-stone-500 uppercase mb-6"
            style={{ opacity: labelOp, transform: `translateX(${labelX}px)` }}>Services</p>

          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-stone-800 font-extrabold leading-[1.1] mb-10"
            style={{ opacity: titleOp, transform: `translateY(${titleY}px)` }}>
            What we do.
          </h2>

          {/* ─── Cards row (fixed height) ─── */}
          <div className="flex gap-3 mb-6" style={{ height: '180px' }}>
            {services.map((service, i) => {
              const cardOp = interp(p, 0.3 + i * 0.1, 0.55 + i * 0.1, 0, 1);
              const cardY = interp(p, 0.3 + i * 0.1, 0.55 + i * 0.1, 40, 0);
              const isSelected = activeService === i;
              const isOther = isOpen && !isSelected;

              return (
                <div key={i}
                  onClick={() => {
                    if (phase === 'cards' && service.hasDetail) handleOpen(i);
                    else if (isOther) { handleClose(); setTimeout(() => handleOpen(i), 600); }
                    else if (isSelected) handleClose();
                  }}
                  className="group/card relative rounded-2xl border backdrop-blur-sm overflow-hidden cursor-pointer h-full"
                  style={{
                    flex: '1 1 33.33%',
                    opacity: cardOp,
                    transform: phase === 'cards' ? `translateY(${cardY}px)` : 'translateY(0)',
                    borderColor: isSelected ? service.color + '50' : 'rgba(0,0,0,0.05)',
                    background: isSelected ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)',
                    transition: 'border-color 0.3s ease, background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
                  }}>
                  {/* Selected indicator — left color bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-all duration-300"
                    style={{ background: service.color, opacity: isSelected ? 1 : 0, transform: isSelected ? 'scaleY(1)' : 'scaleY(0)' }} />

                  <div className="p-6 h-full flex flex-col justify-center">
                    <span className="font-display text-[11px] tracking-[0.2em] uppercase mb-2 block transition-colors duration-300"
                      style={{ color: service.color }}>{service.num}</span>
                    <h3 className="font-display text-xl text-stone-800 font-bold mb-1">{service.title}</h3>
                    <p className="font-gothic text-[11px] text-stone-500 tracking-[0.1em] mb-2">{service.en}</p>
                    <p className="font-gothic text-xs text-stone-500 leading-[1.8] font-light">{service.desc}</p>
                    {service.hasDetail && !isSelected && (
                      <div className="flex items-center gap-2 mt-3 text-stone-300 group-hover/card:text-stone-500 transition-colors duration-300">
                        <span className="font-gothic text-[10px] tracking-[0.15em] uppercase">詳しく見る</span>
                        <svg className="w-3.5 h-3.5 group-hover/card:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── Detail area below cards ─── */}
          <div style={{
            maxHeight: isOpen ? '50vh' : '0',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0)' : 'translateY(8px)',
            overflow: 'hidden',
            transition: 'max-height 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease, transform 0.4s ease',
          }}>
            {activeService === 0 && (
              <div className="p-6 lg:p-8">
                <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                  <div className="w-full md:w-5/12">
                    <RAGIllustration steps={ragSteps} progress={ragProgress} stepAppear={stepAppear} />
                  </div>
                  <div className="w-full md:w-7/12 relative">
                    <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-stone-200/30 rounded-full hidden md:block">
                      <div className="w-full rounded-full" style={{ height: `${Math.min(ragProgress * 130, 100)}%`, background: '#60a5fa' }} />
                    </div>
                    {ragSteps.map((step, si) => {
                      const appear = interp(ragProgress, stepAppear[si], stepAppear[si] + 0.12, 0, 1);
                      return (
                        <div key={step.id} className="flex items-start gap-5 pb-5 md:ml-0"
                          style={{ opacity: appear, transform: `translateY(${(1 - appear) * 25}px)` }}>
                          <div className="hidden md:flex flex-shrink-0 w-4 h-4 rounded-full border-2 mt-0.5 items-center justify-center relative z-10"
                            style={{ borderColor: step.color, background: appear > 0.5 ? step.color : 'white', transition: 'background 0.4s' }}>
                            {appear > 0.5 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <span className="font-gothic text-[10px] tracking-[0.3em] uppercase mb-1.5 block" style={{ color: step.color }}>{step.label}</span>
                            <h3 className="font-display text-base md:text-lg text-stone-800 font-bold mb-1">{step.title}</h3>
                            <p className="font-gothic text-[13px] text-stone-600 leading-[1.8] font-light max-w-sm">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
