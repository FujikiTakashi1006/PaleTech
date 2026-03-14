# Animation Enhancement Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PaleTechトップページにanime.js + Intersection Observerでモダンなスクロール連動アニメーションとヒーローSVGベクターアニメーションを実装する。

**Architecture:** anime.jsをメインエンジンとし、Intersection Observer APIでスクロールトリガーを検知。再利用可能なコンポーネント（ScrollAnimator, TextReveal, NetworkAnimation, WaveDivider）を作成し、page.tsxで組み合わせる。NEWSセクションは削除。

**Tech Stack:** Next.js 15 / React 19 / TypeScript / Tailwind CSS 4 / anime.js 3.x

---

## Chunk 1: Foundation — anime.js Setup & Utility Components

### Task 1: Install anime.js

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install anime.js**

```bash
cd /Users/fujikitakashi/Documents/GitHub/PaleTech
npm install animejs@^3.2.2
```

- [ ] **Step 2: Install type definitions**

```bash
npm install -D @types/animejs
```

- [ ] **Step 3: Verify installation**

```bash
cd /Users/fujikitakashi/Documents/GitHub/PaleTech
cat node_modules/animejs/lib/anime.es.js | head -5
```

Expected: File exists and shows anime.js source code header.

- [ ] **Step 4: Verify build passes**

```bash
cd /Users/fujikitakashi/Documents/GitHub/PaleTech
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add animejs dependency for scroll animations"
```

---

### Task 2: Create shared motion utility

Extract `prefersReducedMotion` into a shared utility used by all animation components.

**Files:**
- Create: `src/utils/motion.ts`

- [ ] **Step 1: Create motion.ts**

```ts
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/motion.ts
git commit -m "feat: add shared prefersReducedMotion utility"
```

---

### Task 3: Create ScrollAnimator component

A custom hook + wrapper component that uses Intersection Observer to trigger anime.js animations when elements enter the viewport. This is the core utility used by all scroll-animated sections.

**Files:**
- Create: `src/components/ScrollAnimator.tsx`

- [ ] **Step 1: Create ScrollAnimator.tsx**

```tsx
'use client';

import { useEffect, useRef, ReactNode } from 'react';
import anime from 'animejs';
import { prefersReducedMotion } from '@/utils/motion';

type AnimationType = 'fade-up' | 'fade-in' | 'scale-in' | 'clip-reveal-x';

interface ScrollAnimatorProps {
  children: ReactNode;
  animation: AnimationType;
  delay?: number;
  duration?: number;
  stagger?: number;
  threshold?: number;
  className?: string;
}

export default function ScrollAnimator({
  children,
  animation,
  delay = 0,
  duration = 800,
  stagger = 0,
  threshold = 0.2,
  className = '',
}: ScrollAnimatorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }

    // Set initial state based on animation type
    switch (animation) {
      case 'fade-up':
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        break;
      case 'fade-in':
        el.style.opacity = '0';
        break;
      case 'scale-in':
        el.style.opacity = '0';
        el.style.transform = 'scale(0.85)';
        break;
      case 'clip-reveal-x':
        el.style.overflow = 'hidden';
        Array.from(el.children).forEach((child) => {
          (child as HTMLElement).style.transform = 'translateX(-100%)';
        });
        break;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          const targets = stagger > 0 ? el.children : el;

          switch (animation) {
            case 'fade-up':
              anime({
                targets,
                opacity: [0, 1],
                translateY: [30, 0],
                duration,
                delay: stagger > 0 ? anime.stagger(stagger, { start: delay }) : delay,
                easing: 'easeOutCubic',
              });
              break;
            case 'fade-in':
              anime({
                targets,
                opacity: [0, 1],
                duration,
                delay: stagger > 0 ? anime.stagger(stagger, { start: delay }) : delay,
                easing: 'easeOutCubic',
              });
              break;
            case 'scale-in':
              anime({
                targets,
                opacity: [0, 1],
                scale: [0.85, 1],
                duration,
                delay: stagger > 0 ? anime.stagger(stagger, { start: delay }) : delay,
                easing: 'cubicBezier(0.16, 1, 0.3, 1)',
              });
              break;
            case 'clip-reveal-x':
              anime({
                targets: Array.from(el.children),
                translateX: ['-100%', '0%'],
                duration,
                delay: stagger > 0 ? anime.stagger(stagger, { start: delay }) : delay,
                easing: 'cubicBezier(0.77, 0, 0.175, 1)',
              });
              break;
          }

          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [animation, delay, duration, stagger, threshold]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform, opacity' }}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/fujikitakashi/Documents/GitHub/PaleTech
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/ScrollAnimator.tsx
git commit -m "feat: add ScrollAnimator component with Intersection Observer + anime.js"
```

---

### Task 4: Create TextReveal component
```

---

Splits text into individual characters and reveals them one by one using anime.js stagger. Used in the hero section.

**Files:**
- Create: `src/components/TextReveal.tsx`

- [ ] **Step 1: Create TextReveal.tsx**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { prefersReducedMotion } from '@/utils/motion';

interface TextRevealProps {
  text: string;
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  className?: string;
}

export default function TextReveal({
  text,
  delay = 0,
  staggerDelay = 50,
  duration = 800,
  className = '',
}: TextRevealProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chars = container.querySelectorAll('.char');

    if (prefersReducedMotion()) {
      chars.forEach((char) => {
        (char as HTMLElement).style.opacity = '1';
        (char as HTMLElement).style.transform = 'none';
      });
      return;
    }

    anime({
      targets: chars,
      opacity: [0, 1],
      translateY: ['100%', '0%'],
      duration,
      delay: anime.stagger(staggerDelay, { start: delay }),
      easing: 'easeOutCubic',
    });
  }, [delay, staggerDelay, duration]);

  return (
    <span ref={containerRef} className={`inline-block overflow-hidden ${className}`}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="char inline-block opacity-0"
          style={{ willChange: 'transform, opacity' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/fujikitakashi/Documents/GitHub/PaleTech
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/TextReveal.tsx
git commit -m "feat: add TextReveal component for character-by-character animation"
```

---

### Task 5: Create WaveDivider component

An SVG wave shape used as a section divider. Placed between VISION→SERVICE and before Footer. Uses `useId()` to avoid SVG gradient ID collisions when multiple instances are rendered.

**Files:**
- Create: `src/components/WaveDivider.tsx`

- [ ] **Step 1: Create WaveDivider.tsx**

```tsx
'use client';

import { useEffect, useRef, useId } from 'react';
import anime from 'animejs';
import { prefersReducedMotion } from '@/utils/motion';

interface WaveDividerProps {
  color?: string;
  flip?: boolean;
  className?: string;
}

export default function WaveDivider({
  color = '#f9fafb',
  flip = false,
  className = '',
}: WaveDividerProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const gradientId = useId();

  useEffect(() => {
    const path = pathRef.current;
    if (!path || prefersReducedMotion()) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          anime({
            targets: path,
            strokeDashoffset: [length, 0],
            duration: 1500,
            easing: 'easeInOutQuad',
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(path);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`w-full overflow-hidden leading-none ${className}`}
      style={{ transform: flip ? 'scaleY(-1)' : undefined }}
    >
      <svg
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <path
          d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
          fill={color}
        />
        <path
          ref={pathRef}
          d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          fill="none"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/fujikitakashi/Documents/GitHub/PaleTech
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/WaveDivider.tsx
git commit -m "feat: add WaveDivider component for section transitions"
```

---

### Task 6: Create NetworkAnimation component

SVG network node animation for the hero section. 5 nodes connected by lines, drawn with anime.js stroke-dashoffset animation. Nodes pulse gently. Uses `useId()` for gradient ID uniqueness.

**Files:**
- Create: `src/components/NetworkAnimation.tsx`

- [ ] **Step 1: Create NetworkAnimation.tsx**

```tsx
'use client';

import { useEffect, useRef, useId } from 'react';
import anime from 'animejs';
import { prefersReducedMotion } from '@/utils/motion';

const NODES = [
  { cx: 120, cy: 80, r: 10 },
  { cx: 280, cy: 120, r: 13 },
  { cx: 200, cy: 240, r: 8 },
  { cx: 350, cy: 200, r: 11 },
  { cx: 80, cy: 200, r: 7 },
];

const EDGES: [number, number][] = [
  [0, 1],
  [1, 3],
  [1, 2],
  [0, 4],
  [4, 2],
  [2, 3],
];

export default function NetworkAnimation({ className = '' }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gradientId = useId();

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    if (prefersReducedMotion()) {
      svg.querySelectorAll('.net-line').forEach((el) => {
        (el as SVGLineElement).style.strokeDashoffset = '0';
      });
      svg.querySelectorAll('.net-node').forEach((el) => {
        (el as SVGElement).style.opacity = '1';
      });
      svg.querySelectorAll('.net-dot').forEach((el) => {
        (el as SVGElement).style.opacity = '1';
      });
      return;
    }

    // Draw lines with stagger (anime.setDashoffset handles dasharray automatically)
    const lines = svg.querySelectorAll('.net-line');
    anime({
      targets: lines,
      strokeDashoffset: [anime.setDashoffset, 0],
      duration: 1200,
      delay: anime.stagger(150, { start: 800 }),
      easing: 'easeInOutQuad',
    });

    // Fade in outer rings
    anime({
      targets: svg.querySelectorAll('.net-node'),
      opacity: [0, 0.6],
      scale: [0.5, 1],
      duration: 600,
      delay: anime.stagger(100, { start: 500 }),
      easing: 'easeOutCubic',
    });

    // Fade in inner dots
    anime({
      targets: svg.querySelectorAll('.net-dot'),
      opacity: [0, 1],
      duration: 400,
      delay: anime.stagger(100, { start: 600 }),
      easing: 'easeOutCubic',
    });

    // Pulse animation (looping)
    anime({
      targets: svg.querySelectorAll('.net-node'),
      scale: [1, 1.2, 1],
      opacity: [0.6, 0.3, 0.6],
      duration: 3000,
      delay: anime.stagger(400, { start: 2000 }),
      easing: 'easeInOutSine',
      loop: true,
    });
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 440 300"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      {/* Connection lines */}
      {EDGES.map(([from, to], i) => (
        <line
          key={`edge-${i}`}
          className="net-line"
          x1={NODES[from].cx}
          y1={NODES[from].cy}
          x2={NODES[to].cx}
          y2={NODES[to].cy}
          stroke={`url(#${gradientId})`}
          strokeWidth="1.5"
          opacity="0.5"
        />
      ))}

      {/* Nodes */}
      {NODES.map((node, i) => (
        <g key={`node-${i}`}>
          {/* Outer ring */}
          <circle
            className="net-node"
            cx={node.cx}
            cy={node.cy}
            r={node.r}
            stroke={`url(#${gradientId})`}
            strokeWidth="2"
            fill="none"
            opacity="0"
          />
          {/* Inner dot */}
          <circle
            className="net-dot"
            cx={node.cx}
            cy={node.cy}
            r={node.r * 0.4}
            fill={`url(#${gradientId})`}
            opacity="0"
          />
        </g>
      ))}
    </svg>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/fujikitakashi/Documents/GitHub/PaleTech
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/NetworkAnimation.tsx
git commit -m "feat: add NetworkAnimation SVG component for hero section"
```

---

## Chunk 2: Page Assembly — Integrate Animations into page.tsx and Footer

### Task 7: Update globals.css

Remove old CSS keyframe animations (replaced by anime.js) and add reduced-motion support.

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace globals.css content**

Replace the entire file with:

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

/* Parallax scroll support */
.parallax-image {
  will-change: transform;
  transition: transform 0.1s linear;
}

/* Service card hover */
.service-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* Reduced motion: skip all animations */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/fujikitakashi/Documents/GitHub/PaleTech
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "refactor: replace CSS keyframes with anime.js driven animations"
```

---

### Task 8: Rewrite page.tsx with animations

Remove NEWS section. Add all animation components. Add parallax scroll listener for VISION section.

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace page.tsx with animated version**

```tsx
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
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/fujikitakashi/Documents/GitHub/PaleTech
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: rewrite page with anime.js animations, remove NEWS section"
```

---

### Task 9: Update Footer with wave divider and stagger animation

Add WaveDivider at the top of the footer. Add ScrollAnimator for stagger fade-in on footer link columns.

**Files:**
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Replace Footer.tsx**

```tsx
'use client';

import Link from 'next/link';
import WaveDivider from '@/components/WaveDivider';
import ScrollAnimator from '@/components/ScrollAnimator';

export default function Footer() {
  return (
    <footer className="bg-black text-white relative">
      <WaveDivider color="#000000" flip className="absolute -top-px left-0 z-10" />

      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-16">
        <ScrollAnimator animation="fade-up" stagger={100}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                PaleTech
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                テクノロジーで取り戻す
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                PaleTechは福岡でAIを活用し、ウェルビーイングな社会を創造する企業です。
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">
                    ABOUT
                  </Link>
                </li>
                <li>
                  <Link href="/service" className="text-gray-400 hover:text-white text-sm transition-colors">
                    SERVICE
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="text-gray-400 hover:text-white text-sm transition-colors">
                    NEWS
                  </Link>
                </li>
                <li>
                  <Link href="/ir" className="text-gray-400 hover:text-white text-sm transition-colors">
                    IR
                  </Link>
                </li>
              </ul>
            </div>

            {/* More Links */}
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">More</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/careers" className="text-gray-400 hover:text-white text-sm transition-colors">
                    CAREERS
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                    CONTACT
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </ScrollAnimator>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} PaleTech
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                個人情報保護方針
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/fujikitakashi/Documents/GitHub/PaleTech
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat: add wave divider and stagger animations to Footer"
```

---

### Task 10: Final build verification and visual check

- [ ] **Step 1: Run lint**

```bash
cd /Users/fujikitakashi/Documents/GitHub/PaleTech
npm run lint
```

Expected: No errors. Fix any lint issues if they appear.

- [ ] **Step 2: Run production build**

```bash
cd /Users/fujikitakashi/Documents/GitHub/PaleTech
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Visual verification in dev mode**

```bash
cd /Users/fujikitakashi/Documents/GitHub/PaleTech
npm run dev
```

Open http://localhost:3000 and verify each animation:
- Hero: network SVG animates on load, text reveals character by character, accent line expands, subtext fades in
- NEWS section is removed
- VISION: text fades up on scroll, image has parallax effect, wave divider at bottom
- SERVICE: title clip-reveals, 3 cards scale-in with stagger in grid layout, hover lifts cards
- CTA: text clip-reveals, buttons fade up in flex layout
- Footer: wave divider at top, links stagger fade in

If any animation is broken, fix the specific component and re-verify.

- [ ] **Step 4: Commit any remaining fixes**

If any fixes were needed, commit them with specific file paths:

```bash
git add src/components/ScrollAnimator.tsx src/app/page.tsx
git commit -m "fix: resolve animation and layout issues"
```
