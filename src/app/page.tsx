'use client';

import { useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NetworkAnimation from '@/components/NetworkAnimation';
import TextReveal from '@/components/TextReveal';
import ScrollAnimator from '@/components/ScrollAnimator';
import WaveDivider from '@/components/WaveDivider';
import anime from 'animejs';

export default function Home() {
  const accentLineRef = useRef<HTMLDivElement>(null);
  const subTextRef = useRef<HTMLParagraphElement>(null);
  const visionImageRef = useRef<HTMLDivElement>(null);

  // Hero accent line + subtext animation on mount
  useEffect(() => {
    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) return;

    if (accentLineRef.current) {
      anime({
        targets: accentLineRef.current,
        width: ['0%', '100%'],
        duration: 800,
        delay: 2200,
        easing: 'easeOutCubic',
      });
    }

    if (subTextRef.current) {
      anime({
        targets: subTextRef.current,
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 800,
        delay: 2500,
        easing: 'easeOutCubic',
      });
    }
  }, []);

  // Parallax scroll for VISION image
  useEffect(() => {
    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const el = visionImageRef.current;
          if (el) {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.top < windowHeight && rect.bottom > 0) {
              const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
              const offset = (scrollProgress - 0.5) * 60;
              el.style.transform = `translateY(${offset}px)`;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-screen flex items-end">
          <div className="absolute inset-0 z-0">
            <img src="/back.jpg" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          {/* Network SVG Animation */}
          <NetworkAnimation className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 w-64 md:w-80 lg:w-96 z-10 opacity-70" />

          <div className="relative z-10 px-8 lg:px-16 pb-24 w-full">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              <TextReveal text="テクノロジーで" delay={1200} className="block mb-2" />
              <TextReveal text="取り戻す" delay={1800} />
            </h1>
            <div className="relative max-w-2xl mt-6">
              <div
                ref={accentLineRef}
                className="h-3 bg-gradient-to-r from-purple-600 to-blue-500 mb-4"
                style={{ width: 0 }}
              ></div>
              <p
                ref={subTextRef}
                className="text-lg md:text-xl text-white leading-relaxed"
                style={{ opacity: 0 }}
              >
                PaleTechは福岡でAIを活用し、<br className="hidden md:block" />
                ウェルビーイングな社会を創造する企業です。
              </p>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-24 md:py-32 bg-gray-50 relative">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <div
                  ref={visionImageRef}
                  className="h-96 bg-gray-200 rounded-lg parallax-image"
                ></div>
              </div>
              <div className="order-1 md:order-2">
                <ScrollAnimator animation="fade-up" duration={800}>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
                    VISION
                  </h2>
                </ScrollAnimator>
                <ScrollAnimator animation="clip-reveal-x" delay={200} duration={600}>
                  <div className="w-20 h-1 bg-black mb-8"></div>
                </ScrollAnimator>
                <ScrollAnimator animation="fade-up" delay={400} stagger={200}>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    多様性を認め合い、それぞれの強みを活かせる社会。
                    誰もが自分らしく生きられる世界を目指しています。
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    テクノロジーと人の温かさを融合させ、
                    持続可能で包括的なコミュニティを創造します。
                  </p>
                </ScrollAnimator>
              </div>
            </div>
          </div>
          <WaveDivider color="#ffffff" className="absolute bottom-0 left-0" />
        </section>

        {/* Service Section */}
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
            <div className="text-center mb-16">
              <ScrollAnimator animation="clip-reveal-x" duration={800}>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
                  SERVICE
                </h2>
              </ScrollAnimator>
              <ScrollAnimator animation="clip-reveal-x" delay={200} duration={600}>
                <div className="w-20 h-1 bg-black mx-auto mb-8"></div>
              </ScrollAnimator>
              <ScrollAnimator animation="fade-in" delay={400}>
                <p className="text-lg text-gray-600">
                  私たちが提供するサービス
                </p>
              </ScrollAnimator>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'コンサルティング',
                  description: '企業や組織のギフテッド人材活用をサポートし、新しい価値創造を実現します。',
                },
                {
                  title: '教育プログラム',
                  description: '個性を伸ばす独自の教育プログラムで、才能の開花をサポートします。',
                },
                {
                  title: 'コミュニティ',
                  description: 'ギフテッドが集まり、交流できる場を提供し、新たなつながりを創出します。',
                },
              ].map((service, index) => (
                <ScrollAnimator
                  key={index}
                  animation="scale-in"
                  delay={index * 150}
                  duration={600}
                >
                  <div className="bg-gray-50 p-8 rounded-lg service-card">
                    <div className="w-16 h-16 bg-black rounded-full mb-6"></div>
                    <h3 className="text-2xl font-bold mb-4 text-black">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </ScrollAnimator>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 bg-black text-white">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-12 text-center">
            <ScrollAnimator animation="clip-reveal-x" duration={800}>
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                一緒に未来を創りませんか？
              </h2>
            </ScrollAnimator>
            <ScrollAnimator animation="fade-in" delay={300}>
              <p className="text-xl text-gray-300 mb-12 leading-relaxed">
                私たちと共に、新しい社会の形を実現しましょう。
              </p>
            </ScrollAnimator>
            <ScrollAnimator animation="fade-up" delay={500} stagger={200}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <a
                  href="/careers"
                  className="px-8 py-4 bg-white text-black font-medium rounded-full hover:bg-gray-100 transition-colors"
                >
                  採用情報を見る
                </a>
                <a
                  href="/contact"
                  className="px-8 py-4 border-2 border-white text-white font-medium rounded-full hover:bg-white hover:text-black transition-colors"
                >
                  お問い合わせ
                </a>
              </div>
            </ScrollAnimator>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
