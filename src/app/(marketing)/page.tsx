'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSmoothScroll } from './lib/hooks/use-smooth-scroll';
import { scrollToRef } from './lib/scroll-state';
import { PastelBlobs } from './components/pastel-blobs';
import { GrainOverlay } from './components/grain-overlay';
import { CursorDot } from './components/cursor-dot';
import { SectionDots } from './components/section-dots';
import { HeroSection } from './components/hero-section';
import { PhilosophySection } from './components/philosophy-section';
import { ServicesSection } from './components/services-section';
import { CtaSection } from './components/cta-section';
import { FooterSection } from './components/footer-section';

export default function HomePage() {
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

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          from { transform: translateY(0); }
          to { transform: translateY(-8px); }
        }

        @keyframes spin3d {
          from { transform: rotateX(-20deg) rotateY(0deg); }
          to { transform: rotateX(-20deg) rotateY(360deg); }
        }

        @keyframes parallaxFloat {
          from { transform: translate(-50%, -50%) translateY(0px); }
          to { transform: translate(-50%, -50%) translateY(-12px); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(95,191,150,0.3); }
          50% { transform: scale(1.03); box-shadow: 0 0 20px 5px rgba(95,191,150,0.15); }
        }

        @keyframes ripple {
          0% { transform: translateX(-50%) scale(1); opacity: 0.4; }
          100% { transform: translateX(-50%) scale(1.8); opacity: 0; }
        }

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
                  const target = document.getElementById(item.id);
                  const container = containerRef.current;
                  if (target && container && scrollToRef.current) {
                    const containerRect = container.getBoundingClientRect();
                    const targetRect = target.getBoundingClientRect();
                    const offset = targetRect.top - containerRect.top + container.scrollTop;
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
