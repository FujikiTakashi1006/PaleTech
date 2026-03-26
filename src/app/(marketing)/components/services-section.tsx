'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { wheelInterceptRef } from '../lib/scroll-state';
import { interp } from '@/lib/animation/interp';
import { RAGIllustration } from './rag-illustration';
import { StepTimeline } from './step-timeline';
import { WebTechScene } from './web-tech-scene';

export function ServicesSection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [detailOpen, setDetailOpen] = useState<number | null>(null);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [detailContentVisible, setDetailContentVisible] = useState(false);
  const [ragStep, setRagStep] = useState(-1);
  const ragStepRef = useRef(-1);
  const [webStep, setWebStep] = useState(-1);
  const webStepRef = useRef(-1);
  const lockedUntilRef = useRef(0);
  const scrollAccumRef = useRef(0);

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

  // When detail is open: intercept wheel → drive ragStep instead of page scroll
  const ragPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (detailOpen !== null) {
      // Open: expand panel first, then show content
      setPanelExpanded(true);
      const t = setTimeout(() => setDetailContentVisible(true), 700);
      return () => clearTimeout(t);
    } else {
      // Close: hide content first, then collapse panel
      setDetailContentVisible(false);
      const t = setTimeout(() => setPanelExpanded(false), 400);
      return () => clearTimeout(t);
    }
  }, [detailOpen]);

  useEffect(() => {
    if (detailOpen === null) {
      wheelInterceptRef.current = null;
      ragStepRef.current = -1;
      setRagStep(-1);
      webStepRef.current = -1;
      setWebStep(-1);
      return;
    }
    if (detailOpen !== 0 && detailOpen !== 1) {
      wheelInterceptRef.current = null;
      return;
    }
    if (detailOpen !== 0) return;

    ragStepRef.current = -1;
    setRagStep(-1);
    scrollAccumRef.current = 0;

    const TOTAL_ANIM_STEPS = 3; // step 0, 1, 2 (animated steps)
    const RESULT_STEP = 3; // final results screen
    const SCROLL_THRESHOLD = 150;
    const LOCK_DURATION = 2200;

    wheelInterceptRef.current = (deltaY: number) => {
      if (Date.now() < lockedUntilRef.current) return;

      scrollAccumRef.current += deltaY;

      // Forward
      if (scrollAccumRef.current > SCROLL_THRESHOLD) {
        scrollAccumRef.current = 0;
        if (ragStepRef.current < TOTAL_ANIM_STEPS - 1) {
          // Next animated step
          ragStepRef.current += 1;
          setRagStep(ragStepRef.current);
          lockedUntilRef.current = Date.now() + LOCK_DURATION;
        } else if (ragStepRef.current === TOTAL_ANIM_STEPS - 1) {
          // After last animated step → results screen (no lock)
          ragStepRef.current = RESULT_STEP;
          setRagStep(RESULT_STEP);
        }
        return;
      }

      // Backward
      if (scrollAccumRef.current < -SCROLL_THRESHOLD) {
        scrollAccumRef.current = 0;
        if (ragStepRef.current === RESULT_STEP) {
          // Back from results to last animated step
          ragStepRef.current = TOTAL_ANIM_STEPS - 1;
          setRagStep(ragStepRef.current);
        } else if (ragStepRef.current >= 0) {
          ragStepRef.current -= 1;
          setRagStep(ragStepRef.current);
          lockedUntilRef.current = Date.now() + (ragStepRef.current >= 0 ? LOCK_DURATION : 500);
        }
        return;
      }

      scrollAccumRef.current = Math.max(-SCROLL_THRESHOLD, Math.min(SCROLL_THRESHOLD, scrollAccumRef.current));
    };

    // Animate RAG panel content when it opens
    if (detailOpen === 0) {
      setTimeout(() => {
        const panel = ragPanelRef.current;
        if (panel) {
          // Fade in text elements first
          anime({
            targets: panel.querySelectorAll('.rag-fade'),
            opacity: [0, 1],
            delay: anime.stagger(100, { start: 200 }),
            duration: 700,
            easing: 'easeOutCubic',
          });
        }
      }, 100);
    }

    return () => { wheelInterceptRef.current = null; };
  }, [detailOpen]);

  // Start step 0 animation once content is visible
  useEffect(() => {
    if (detailContentVisible && detailOpen === 0 && ragStepRef.current === -1) {
      ragStepRef.current = 0;
      setRagStep(0);
      lockedUntilRef.current = Date.now() + 2200;
    }
  }, [detailContentVisible, detailOpen]);

  // Website detail: wheel intercept for step-by-step tech reveal
  useEffect(() => {
    if (detailOpen !== 1) return;

    webStepRef.current = -1;
    setWebStep(-1);
    scrollAccumRef.current = 0;

    const webTechs = ['3Dアニメーション', 'スクロール連動演出', 'マイクロインタラクション'];
    const SCROLL_THRESHOLD = 400;

    // Step 0→1: cube disassemble + expand = ~2.5s. Step 1→2: content needs to be seen
    const LOCK_DURATIONS = [3000, 2500, 1000];

    wheelInterceptRef.current = (deltaY: number) => {
      if (Date.now() < lockedUntilRef.current) return;

      scrollAccumRef.current += deltaY;
      if (scrollAccumRef.current > SCROLL_THRESHOLD) {
        scrollAccumRef.current = 0;
        if (webStepRef.current < webTechs.length - 1) {
          webStepRef.current += 1;
          setWebStep(webStepRef.current);
          lockedUntilRef.current = Date.now() + (LOCK_DURATIONS[webStepRef.current] || 2000);
        }
      } else if (scrollAccumRef.current < -SCROLL_THRESHOLD) {
        scrollAccumRef.current = 0;
        if (webStepRef.current >= 0) {
          webStepRef.current -= 1;
          setWebStep(webStepRef.current);
          lockedUntilRef.current = Date.now() + (LOCK_DURATIONS[webStepRef.current] || 2000);
        }
      }
    };

    return () => { wheelInterceptRef.current = null; };
  }, [detailOpen]);

  // Start first web step once content visible
  useEffect(() => {
    if (detailContentVisible && detailOpen === 1 && webStepRef.current === -1) {
      webStepRef.current = 0;
      setWebStep(0);
      lockedUntilRef.current = Date.now() + 3000; // let 3D cube play for 3s
    }
  }, [detailContentVisible, detailOpen]);

  const services = [
    { en: 'RAG', ja: 'RAG開発', desc: 'Retrieval-Augmented Generation（検索拡張生成）は、AIが事前学習していない社内文書やナレッジベースの内容でも正確に回答できるようにする技術です。', color: '#4a7fe0' },
    { en: 'WEB SITE', ja: 'Webサイト制作', desc: 'ブランドの世界観を体現する、美しく機能的なWebサイトをデザイン・制作します。', color: '#5fbf96' },
    { en: 'WEB APP', ja: 'Web開発', desc: 'Next.js・React等のモダン技術で、スケーラブルなWebアプリケーションを開発します。', color: '#9b8ad4' },
  ];

  // RAG scroll-driven steps with SVG icons
  const ragSteps = [
    {
      id: 'query', label: 'Step 01', title: 'ユーザーの質問を分解する',
      desc: 'ユーザーの質問をAIが分析し、複数の検索クエリに分解。複雑な質問でも段階的に処理することで、正確な回答を導き出します。',
      color: '#4a7fe0',
      icon: (op: number) => (
        <svg viewBox="0 0 160 80" className="w-full h-full" fill="none">
          {/* Original question bubble */}
          <rect x="35" y="2" width="90" height="20" rx="6" stroke="#4a7fe0" strokeWidth="1.5"
            style={{ strokeDasharray: 220, strokeDashoffset: 220 * (1 - interp(op, 0, 0.2, 0, 1)) }} />
          <line x1="46" y1="12" x2="114" y2="12" stroke="#4a7fe0" strokeWidth="1.5" strokeLinecap="round"
            style={{ opacity: interp(op, 0.1, 0.25, 0, 0.5) }} />
          {/* Branching lines */}
          {[{ x: 28, y: 48 }, { x: 80, y: 48 }, { x: 132, y: 48 }].map((pt, i) => (
            <line key={i} x1="80" y1="22" x2={80 + (pt.x - 80) * interp(op, 0.25 + i * 0.05, 0.45 + i * 0.05, 0, 1)} y2={22 + (pt.y - 22) * interp(op, 0.25 + i * 0.05, 0.45 + i * 0.05, 0, 1)}
              stroke="#4a7fe0" strokeWidth="1.2" strokeLinecap="round"
              style={{ opacity: interp(op, 0.25 + i * 0.05, 0.4 + i * 0.05, 0, 0.6) }} />
          ))}
          {/* Sub-query boxes — spaced apart */}
          {[{ x: 6, d: 0.4 }, { x: 58, d: 0.5 }, { x: 110, d: 0.6 }].map((box, i) => (
            <g key={i} style={{ opacity: interp(op, box.d, box.d + 0.15, 0, 1) }}>
              <rect x={box.x} y="48" width="44" height="26" rx="5" stroke="#4a7fe0" strokeWidth="1.5"
                style={{ strokeDasharray: 140, strokeDashoffset: 140 * (1 - interp(op, box.d, box.d + 0.2, 0, 1)) }} />
              <line x1={box.x + 7} y1="58" x2={box.x + 37} y2="58" stroke="#4a7fe0" strokeWidth="1.2" strokeLinecap="round"
                style={{ opacity: interp(op, box.d + 0.1, box.d + 0.25, 0, 0.5) }} />
              <line x1={box.x + 7} y1="65" x2={box.x + 28} y2="65" stroke="#4a7fe0" strokeWidth="1.2" strokeLinecap="round"
                style={{ opacity: interp(op, box.d + 0.15, box.d + 0.3, 0, 0.5) }} />
            </g>
          ))}
        </svg>
      ),
    },
    {
      id: 'search', label: 'Step 02', title: 'ハイブリッド検索で関連文書を取得',
      desc: 'キーワード検索とベクトル検索を組み合わせて候補を抽出し、意味的再ランク付けで最も関連性の高い文書を特定します。',
      color: '#4a7fe0',
      icon: (op: number) => (
        <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
          {[{cx:25,cy:20,d:0},{cx:45,cy:15,d:0.05},{cx:65,cy:25,d:0.1},{cx:85,cy:18,d:0.15},{cx:35,cy:45,d:0.2},{cx:55,cy:40,d:0.25},{cx:75,cy:50,d:0.3},{cx:95,cy:42,d:0.35},{cx:20,cy:65,d:0.4},{cx:45,cy:60,d:0.45}].map((dot, i) => (
            <circle key={i} cx={dot.cx} cy={dot.cy} r={i===5?5:3} fill={i===5?'#4a7fe0':'#4a7fe040'}
              style={{opacity:interp(op,dot.d,dot.d+0.3,0,1),transform:`scale(${interp(op,dot.d,dot.d+0.3,0,1)})`,transformOrigin:`${dot.cx}px ${dot.cy}px`}}/>
          ))}
          {[{x:25,y:20},{x:45,y:15},{x:65,y:25},{x:35,y:45},{x:75,y:50},{x:45,y:60}].map((pt, i) => (
            <line key={i} x1="55" y1="40" x2={pt.x} y2={pt.y} stroke="#4a7fe0" strokeWidth="0.8" strokeDasharray="4 3"
              style={{opacity:interp(op,0.35+i*0.04,0.55+i*0.04,0,0.5)}}/>
          ))}
          <circle cx="82" cy="60" r="10" stroke="#4a7fe0" strokeWidth="1.5" style={{strokeDasharray:80,strokeDashoffset:80*(1-interp(op,0.5,0.8,0,1))}}/>
          <line x1="89" y1="67" x2="98" y2="76" stroke="#4a7fe0" strokeWidth="2" strokeLinecap="round" style={{opacity:interp(op,0.6,0.9,0,1)}}/>
        </svg>
      ),
    },
    {
      id: 'generate', label: 'Step 03', title: 'LLMが回答を生成',
      desc: '取得した文書をコンテキストとしてLLMに渡し、根拠に基づいた正確な回答を生成します。',
      color: '#4a7fe0',
      icon: (op: number) => (
        <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
          <rect x="5" y="4" width="110" height="72" rx="10" stroke="#4a7fe0" strokeWidth="1.5" style={{strokeDasharray:400,strokeDashoffset:400*(1-interp(op,0,0.25,0,1))}}/>
          <circle cx="16" cy="16" r="3" fill="#4a7fe0" style={{opacity:interp(op,0.1,0.3,0,1)}}/>
          <text x="22" y="18" fill="#4a7fe0" fontSize="6" fontFamily="monospace" fontWeight="bold" style={{opacity:interp(op,0.1,0.3,0,1)}}>AI</text>
          {[{y:28,w:80,d:0.2},{y:40,w:80,d:0.45},{y:52,w:80,d:0.7}].map((line,i)=>{
            const lo=interp(op,line.d,line.d+0.15,0,1);
            return(<line key={i} x1="16" y1={line.y} x2={16+line.w*lo} y2={line.y} stroke="#4a7fe0" strokeWidth="2" strokeLinecap="round" style={{opacity:lo*0.7}}/>);
          })}
        </svg>
      ),
    },
  ];
  const svcStart = 0.1;
  const seg = (1 - svcStart) / services.length;

  return (
    <div ref={ref} style={{ height: `${(services.length * 1.5 + 1) * 100}vh` }} className="relative">
      <div className="sticky top-0 h-screen flex overflow-hidden">

        {/* Left: WE DEVELOP + descriptions */}
        <div className="flex flex-col justify-center px-6 lg:px-12 overflow-hidden transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: panelExpanded ? '50%' : '100%', flexShrink: 0 }}>

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

          <div className="mt-6 mb-8" style={{ height: '2px', width: `${interp(progress, 0.05, 0.2, 0, 80)}px`, background: 'linear-gradient(90deg, #4a7fe0, transparent)' }} />

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
                      className="inline-flex items-center justify-center gap-2 font-gothic text-[11px] tracking-[0.1em] px-5 py-2.5 rounded-full transition-all duration-300 hover:brightness-90 cursor-pointer min-w-[130px]"
                      style={{ background: s.color, color: '#fff', filter: 'saturate(1.3) brightness(0.85)' }}>
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

        {/* Right: Detail panel — no width animation, opacity only */}
        <div style={{
            width: panelExpanded ? '50%' : '0%',
            height: '100vh',
            overflow: 'hidden',
            transition: 'width 0.7s cubic-bezier(0.22,1,0.36,1)',
          }}>
          <div style={{ width: '50vw', height: '100vh', display: 'grid', alignContent: 'center', padding: '40px', overflowY: 'auto', opacity: detailContentVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}>
            <div>

            {/* RAG detail */}
            {detailOpen === 0 && (
              <div ref={ragPanelRef} className="relative" style={{ minHeight: '300px' }}>
                {/* Step timeline: absolute so it doesn't push results down */}
                <div style={{
                  position: ragStep === 3 ? 'absolute' : 'relative',
                  top: 0, left: 0, right: 0,
                  opacity: ragStep < 3 ? 1 : 0,
                  pointerEvents: ragStep < 3 ? 'auto' : 'none',
                  transition: 'opacity 0.3s ease',
                }}>
                  <p className="font-gothic text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: services[0].color }}>How RAG Works</p>
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-full md:w-5/12">
                      <RAGIllustration steps={ragSteps} progress={ragStep} />
                    </div>
                    <StepTimeline steps={ragSteps} currentStep={ragStep} color="#4a7fe0" />
                  </div>
                </div>

                {/* Results screen: shown after all steps */}
                {ragStep === 3 && (
                  <div>
                    <p className="font-gothic text-[11px] tracking-[0.3em] uppercase mb-5" style={{ color: services[0].color }}>Performance</p>
                    <h4 className="font-display text-xl text-stone-800 font-bold mb-4">国内最高性能のRAGシステム</h4>
                    <p className="font-gothic text-[14px] text-stone-700 leading-[2.2] font-light">
                      当社のRAGシステムは国内最高性能を達成。<br />
                      大手保険会社や大手不動産コンサルティング会社をはじめ、<br />
                      多くの企業に導入いただいています。
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Websites detail */}
            {detailOpen === 1 && (() => {
              const webTechs = [
                { label: '3Dアニメーション', desc: 'Three.jsを活用した没入感のある3D表現' },
                { label: 'スクロール連動演出', desc: 'スクロールに応じて要素が動的に変化する演出' },
                { label: 'マイクロインタラクション', desc: 'ホバーやクリックに反応する繊細なアニメーション' },
              ];
              return (
                <div className="flex gap-8 items-center">
                  {/* Left: tech keywords stacking up */}
                  <div className="w-1/2 flex-shrink-0">
                    <p className="font-gothic text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: services[1].color }}>Technologies</p>
                    <div className="space-y-4">
                      {webTechs.map((tech, i) => (
                        <div key={i} style={{ opacity: webStep >= i ? 1 : 0, transform: `translateY(${webStep >= i ? 0 : 15}px)`, transition: 'all 0.5s ease' }}>
                          <h4 className="font-display text-lg text-stone-800 font-bold mb-1">{tech.label}</h4>
                          <p className="font-gothic text-[12px] text-stone-500 leading-[1.8] font-light">{tech.desc}</p>
                        </div>
                      ))}
                    </div>
                    {webStep >= webTechs.length - 1 && (
                      <p className="font-gothic text-[14px] text-stone-700 leading-[2] font-light mt-8" style={{ animation: 'fadeIn 0.5s ease' }}>
                        これらの技術を駆使し、ブランドの世界観を体現するモダンなWebサイトを制作します。
                      </p>
                    )}
                  </div>
                  {/* Right: cumulative tech scene */}
                  <div className="w-1/2" style={{ height: '350px' }}>
                    <WebTechScene step={webStep} color={services[1].color} />
                  </div>
                </div>
              );
            })()}

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
    </div>
  );
}
