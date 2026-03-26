'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { useScrollProgress } from '../lib/hooks/use-scroll-progress';
import { interp } from '@/lib/animation/interp';

export function CtaSection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
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

  const successRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
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

    if (circle) {
      const len = circle.getTotalLength();
      circle.style.strokeDasharray = `${len}`;
      circle.style.strokeDashoffset = `${len}`;
      anime({ targets: circle, strokeDashoffset: [len, 0], duration: 600, easing: 'easeInOutCubic', delay: 100 });
    }
    if (check) {
      const len = check.getTotalLength();
      check.style.strokeDasharray = `${len}`;
      check.style.strokeDashoffset = `${len}`;
      anime({ targets: check, strokeDashoffset: [len, 0], duration: 400, easing: 'easeOutCubic', delay: 550 });
    }
    anime({ targets: el.querySelector('.check-icon'), scale: [0, 1], duration: 500, easing: 'easeOutBack', delay: 50 });
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
