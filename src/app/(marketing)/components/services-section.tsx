'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { wheelInterceptRef } from '../lib/scroll-state';
import { interp } from '@/lib/animation/interp';
import { RAGIllustration } from './rag-illustration';

export function ServicesSection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [detailOpen, setDetailOpen] = useState<number | null>(null);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [detailContentVisible, setDetailContentVisible] = useState(false);
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
      return;
    }

    ragProgressRef.current = 0;
    setRagProgress(0);

    wheelInterceptRef.current = (deltaY: number) => {
      ragProgressRef.current = Math.max(0, Math.min(1, ragProgressRef.current + deltaY * 0.0008));
      setRagProgress(ragProgressRef.current);
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

  const services = [
    { en: 'RAG', ja: 'RAG開発', desc: 'Retrieval-Augmented Generation（検索拡張生成）を活用した高精度なAIシステムを構築。社内ナレッジの活用や業務効率化を実現します。', color: '#4a7fe0' },
    { en: 'WEBSITES', ja: 'Webサイト制作', desc: 'ブランドの世界観を体現する、美しく機能的なWebサイトをデザイン・制作します。', color: '#5fbf96' },
    { en: 'WEB APPS', ja: 'Web開発', desc: 'Next.js・React等のモダン技術で、スケーラブルなWebアプリケーションを開発します。', color: '#9b8ad4' },
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
          {[{y:35,w:80,d:0.2},{y:47,w:80,d:0.45},{y:59,w:80,d:0.7}].map((line,i)=>{
            const lo=interp(op,line.d,line.d+0.15,0,1);
            return(<line key={i} x1="16" y1={line.y} x2={16+line.w*lo} y2={line.y} stroke="#4a7fe0" strokeWidth="2" strokeLinecap="round" style={{opacity:lo*0.7}}/>);
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

        {/* Left: WE DEVELOP + descriptions */}
        <div className="flex flex-col justify-center px-6 lg:px-12 transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: panelExpanded ? '45%' : '100%', flexShrink: 0 }}>

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
            width: panelExpanded ? '55%' : '0%',
            height: '100vh',
            overflow: 'hidden',
            transition: 'width 0.7s cubic-bezier(0.22,1,0.36,1)',
          }}>
          <div style={{ width: '55vw', height: '100vh', display: 'grid', alignContent: 'center', padding: '40px', overflowY: 'auto', opacity: detailContentVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}>
            <div>

            {/* RAG detail */}
            {detailOpen === 0 && (
              <div ref={ragPanelRef}>
                {/* Intro: shown until scroll starts */}
                {ragProgress < 0.12 && (
                  <div style={{ opacity: interp(ragProgress, 0, 0.08, 1, 0) }}>
                    <p className="font-gothic text-[11px] tracking-[0.3em] uppercase mb-5" style={{ color: services[0].color }}>About RAG</p>
                    <h4 className="font-display text-xl text-stone-800 font-bold mb-4">Retrieval-Augmented Generation</h4>
                    <p className="font-gothic text-[14px] text-stone-700 leading-[2.2] font-light mb-8">
                      RAG（検索拡張生成）は、AIが事前学習していない社内文書やナレッジベースの内容でも、正確に回答できるようにする技術です。
                    </p>
                    <div className="flex items-center gap-2 text-stone-400">
                      <div className="w-[1px] h-6 overflow-hidden">
                        <div className="w-full h-full bg-stone-400 scroll-line" />
                      </div>
                      <span className="font-gothic text-[10px] tracking-[0.2em] uppercase">Scroll to explore</span>
                    </div>
                  </div>
                )}

                {/* How it works: shown after scroll */}
                {ragProgress >= 0.08 && (
                  <div style={{ opacity: interp(ragProgress, 0.08, 0.15, 0, 1) }}>
                  <p className="font-gothic text-[11px] tracking-[0.3em] uppercase mb-6" style={{ color: services[0].color }}>How RAG Works</p>
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-full md:w-5/12">
                      <RAGIllustration steps={ragSteps} progress={ragProgress} stepAppear={stepAppear} />
                    </div>
                    <div className="w-full md:w-7/12 relative">
                      <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-stone-200/30 rounded-full hidden md:block">
                        <div className="w-full rounded-full" style={{ height: `${Math.min(Math.max(ragProgress - 0.08, 0) * 150, 100)}%`, background: '#4a7fe0' }} />
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
                              <p className="font-gothic text-[12px] text-stone-600 leading-[1.8] font-light">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  </div>
                )}
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
    </div>
  );
}
