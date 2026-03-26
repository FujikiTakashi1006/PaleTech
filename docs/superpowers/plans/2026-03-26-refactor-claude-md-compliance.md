# PaleTech CLAUDE.md準拠リファクタリング実装プラン

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 898行の単一page.tsxをCLAUDE.mdアーキテクチャルール準拠のディレクトリ構造に分割し、未使用コンポーネントを削除する

**Architecture:** CLAUDE.mdのレイヤー構造（app/ → components/ → lib/）に従い、page.tsxの各セクションをルートローカルコンポーネントに分割。共有フック・ユーティリティはlib/に配置。現在DBやAPIがないため、domain/やcache/層は作成しない（将来のコンタクトフォームバックエンド実装時に追加）。

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS 4, anime.js 3.2.2, TypeScript 5

---

## 現状分析

### page.tsx内の関数・コンポーネント一覧 (898行)

| 関数名 | 行数(約) | 種類 | 移動先 |
|--------|---------|------|--------|
| `PastelBlobs` | 12 | 装飾コンポーネント | `app/(marketing)/components/pastel-blobs.tsx` |
| `GrainOverlay` | 10 | 装飾コンポーネント | `app/(marketing)/components/grain-overlay.tsx` |
| `CursorDot` | 25 | UIコンポーネント | `app/(marketing)/components/cursor-dot.tsx` |
| `wheelInterceptRef` / `scrollToRef` | 2 | モジュールレベル状態 | `app/(marketing)/lib/scroll-state.ts` |
| `useSmoothScroll` | 58 | カスタムフック | `app/(marketing)/lib/hooks/use-smooth-scroll.ts` |
| `useScrollProgress` | 30 | カスタムフック | `app/(marketing)/lib/hooks/use-scroll-progress.ts` |
| `interp` | 4 | ユーティリティ | `lib/animation/interp.ts` |
| `TiltCard` | 17 | UIコンポーネント | `components/tilt-card/index.tsx`（共有可能） |
| `SectionDots` | 13 | UIコンポーネント | `app/(marketing)/components/section-dots.tsx` |
| `HeroSection` | 35 | セクション | `app/(marketing)/components/hero-section.tsx` |
| `PhilosophySection` | 50 | セクション | `app/(marketing)/components/philosophy-section.tsx` |
| `RAGIllustration` | 42 | サービス詳細 | `app/(marketing)/components/rag-illustration.tsx` |
| `ServicesSection` | 260 | セクション | `app/(marketing)/components/services-section.tsx` |
| `CtaSection` | 145 | セクション | `app/(marketing)/components/cta-section.tsx` |
| `FooterSection` | 34 | セクション | `app/(marketing)/components/footer-section.tsx` |
| `TestPage` (default export) | 62 | ページ | `app/(marketing)/page.tsx` |

### 削除対象（未使用ファイル）

| ファイル | 理由 |
|---------|------|
| `src/components/Header.tsx` | page.tsxが独自ナビを持つ。どこからもimportされていない |
| `src/components/Footer.tsx` | page.tsxがFooterSectionを持つ。どこからもimportされていない |
| `src/components/ScrollAnimator.tsx` | Footer.tsxのみが使用。Footer.tsx削除に伴い不要 |
| `src/components/WaveDivider.tsx` | Footer.tsxのみが使用。Footer.tsx削除に伴い不要 |
| `src/components/TextReveal.tsx` | どこからもimportされていない |
| `src/components/NetworkAnimation.tsx` | どこからもimportされていない |
| `src/utils/motion.ts` | どこからもimportされていない |

### 最終ディレクトリ構造

```
src/
├── app/
│   ├── (marketing)/              # ルートグループ: マーケティングサイト
│   │   ├── page.tsx              # ページコンポーネント（コンポーネント組み合わせのみ）
│   │   ├── components/           # ルートローカルUIコンポーネント
│   │   │   ├── pastel-blobs.tsx
│   │   │   ├── grain-overlay.tsx
│   │   │   ├── cursor-dot.tsx
│   │   │   ├── section-dots.tsx
│   │   │   ├── hero-section.tsx
│   │   │   ├── philosophy-section.tsx
│   │   │   ├── rag-illustration.tsx
│   │   │   ├── services-section.tsx
│   │   │   ├── cta-section.tsx
│   │   │   └── footer-section.tsx
│   │   └── lib/                  # ルートローカルユーティリティ
│   │       ├── scroll-state.ts   # wheelInterceptRef, scrollToRef
│   │       └── hooks/
│   │           ├── use-smooth-scroll.ts
│   │           └── use-scroll-progress.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── favicon.ico
├── components/                   # 共有UIプリミティブ
│   └── tilt-card/
│       └── index.tsx
└── lib/                          # 横断的ユーティリティ
    └── animation/
        └── interp.ts
```

---

## Chunk 1: 基盤ユーティリティとフックの分割

### Task 1: 共有interpユーティリティの抽出

**Files:**
- Create: `src/lib/animation/interp.ts`

- [ ] **Step 1: interpを新ファイルに作成**

```typescript
// src/lib/animation/interp.ts
/**
 * Interpolation helper for scroll-driven animations.
 * Maps a progress value within [start, end] range to [from, to] output range.
 */
export function interp(progress: number, start: number, end: number, from: number, to: number): number {
  const t = Math.max(0, Math.min(1, (progress - start) / (end - start)));
  return from + (to - from) * t;
}
```

- [ ] **Step 2: ビルド確認**

Run: `npx next build 2>&1 | tail -5`
Expected: ビルド成功（まだimportしていないので既存に影響なし）

---

### Task 2: scroll-stateモジュールの抽出

**Files:**
- Create: `src/app/(marketing)/lib/scroll-state.ts`

- [ ] **Step 1: scroll-stateを新ファイルに作成**

```typescript
// src/app/(marketing)/lib/scroll-state.ts
'use client';

/**
 * Module-level refs for scroll interception.
 * wheelInterceptRef: when set, wheel events are forwarded to this function instead of scrolling.
 * scrollToRef: allows programmatic smooth scroll to a position.
 */
export const wheelInterceptRef = { current: null as ((deltaY: number) => void) | null };
export const scrollToRef = { current: null as ((pos: number) => void) | null };
```

---

### Task 3: useSmoothScrollフックの抽出

**Files:**
- Create: `src/app/(marketing)/lib/hooks/use-smooth-scroll.ts`

- [ ] **Step 1: useSmoothScrollを新ファイルに作成**

```typescript
// src/app/(marketing)/lib/hooks/use-smooth-scroll.ts
'use client';

import { useEffect } from 'react';
import { wheelInterceptRef, scrollToRef } from '../scroll-state';

export function useSmoothScroll(containerRef: React.RefObject<HTMLDivElement | null>) {
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
```

---

### Task 4: useScrollProgressフックの抽出

**Files:**
- Create: `src/app/(marketing)/lib/hooks/use-scroll-progress.ts`

- [ ] **Step 1: useScrollProgressを新ファイルに作成**

```typescript
// src/app/(marketing)/lib/hooks/use-scroll-progress.ts
'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks scroll progress (0→1) of a section within a scrollable container.
 * p=0 when top of section reaches bottom of viewport.
 * p=1 when top of section reaches top of viewport.
 */
export function useScrollProgress(
  sectionRef: React.RefObject<HTMLElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
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
```

- [ ] **Step 2: コミット**

```bash
git add src/lib/animation/interp.ts src/app/\(marketing\)/lib/
git commit -m "refactor: extract shared utilities and hooks from page.tsx"
```

---

## Chunk 2: 装飾・UI コンポーネントの分割

### Task 5: 共有TiltCardコンポーネントの抽出

**Files:**
- Create: `src/components/tilt-card/index.tsx`

- [ ] **Step 1: TiltCardを新ファイルに作成**

```typescript
// src/components/tilt-card/index.tsx
'use client';

import { useRef } from 'react';

export function TiltCard({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.01)`;
  };

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = 'none';
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ ...style, transition: 'transform 0.4s cubic-bezier(0.03, 0.98, 0.52, 0.99)' }}
    >
      {children}
    </div>
  );
}
```

---

### Task 6: 装飾コンポーネントの抽出（PastelBlobs, GrainOverlay, CursorDot, SectionDots）

**Files:**
- Create: `src/app/(marketing)/components/pastel-blobs.tsx`
- Create: `src/app/(marketing)/components/grain-overlay.tsx`
- Create: `src/app/(marketing)/components/cursor-dot.tsx`
- Create: `src/app/(marketing)/components/section-dots.tsx`

- [ ] **Step 1: PastelBlobsを作成**

```typescript
// src/app/(marketing)/components/pastel-blobs.tsx
export function PastelBlobs() {
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
```

- [ ] **Step 2: GrainOverlayを作成**

page.tsxから完全コピー。`'use client'`不要（JSXのみ）。

- [ ] **Step 3: CursorDotを作成**

`'use client'`付き。useEffect + useRefを使用。page.tsxから完全コピー。

- [ ] **Step 4: SectionDotsを作成**

```typescript
// src/app/(marketing)/components/section-dots.tsx
export function SectionDots({ current, total }: { current: number; total: number }) {
  // ... page.tsxから完全コピー
}
```

- [ ] **Step 5: コミット**

```bash
git add src/components/tilt-card/ src/app/\(marketing\)/components/
git commit -m "refactor: extract decoration and UI components"
```

---

## Chunk 3: セクションコンポーネントの分割

### Task 7: HeroSectionの抽出

**Files:**
- Create: `src/app/(marketing)/components/hero-section.tsx`

- [ ] **Step 1: HeroSectionを新ファイルに作成**

```typescript
// src/app/(marketing)/components/hero-section.tsx
'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';

export function HeroSection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  // ... page.tsxから完全コピー
}
```

---

### Task 8: PhilosophySectionの抽出

**Files:**
- Create: `src/app/(marketing)/components/philosophy-section.tsx`

- [ ] **Step 1: PhilosophySectionを新ファイルに作成**

```typescript
// src/app/(marketing)/components/philosophy-section.tsx
'use client';

import { useRef } from 'react';
import { useScrollProgress } from '../lib/hooks/use-scroll-progress';
import { interp } from '@/lib/animation/interp';

export function PhilosophySection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  // ... page.tsxから完全コピー（importパスを更新）
}
```

---

### Task 9: RAGIllustration + ServicesSectionの抽出

**Files:**
- Create: `src/app/(marketing)/components/rag-illustration.tsx`
- Create: `src/app/(marketing)/components/services-section.tsx`

- [ ] **Step 1: RAGIllustrationを作成**

```typescript
// src/app/(marketing)/components/rag-illustration.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { interp } from '@/lib/animation/interp';

export function RAGIllustration({ steps, progress, stepAppear }: {
  steps: { id: string; color: string; icon: (op: number) => React.ReactNode }[];
  progress: number;
  stepAppear: number[];
}) {
  // ... page.tsxから完全コピー
}
```

- [ ] **Step 2: ServicesSectionを作成**

```typescript
// src/app/(marketing)/components/services-section.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { wheelInterceptRef } from '../lib/scroll-state';
import { interp } from '@/lib/animation/interp';
import { RAGIllustration } from './rag-illustration';

export function ServicesSection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  // ... page.tsxから完全コピー（importパスを更新）
}
```

---

### Task 10: CtaSectionの抽出

**Files:**
- Create: `src/app/(marketing)/components/cta-section.tsx`

- [ ] **Step 1: CtaSectionを作成**

```typescript
// src/app/(marketing)/components/cta-section.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { useScrollProgress } from '../lib/hooks/use-scroll-progress';
import { interp } from '@/lib/animation/interp';

export function CtaSection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  // ... page.tsxから完全コピー（フォーム含む）
}
```

---

### Task 11: FooterSectionの抽出

**Files:**
- Create: `src/app/(marketing)/components/footer-section.tsx`

- [ ] **Step 1: FooterSectionを作成**

```typescript
// src/app/(marketing)/components/footer-section.tsx
'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useScrollProgress } from '../lib/hooks/use-scroll-progress';
import { interp } from '@/lib/animation/interp';

export function FooterSection({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  // ... page.tsxから完全コピー
}
```

- [ ] **Step 2: コミット**

```bash
git add src/app/\(marketing\)/components/
git commit -m "refactor: extract all section components from page.tsx"
```

---

## Chunk 4: ページの再構成と不要ファイル削除

### Task 12: page.tsxを(marketing)ルートグループに移動・書き換え

**Files:**
- Create: `src/app/(marketing)/page.tsx`（新しいスリムなページ）
- Delete: `src/app/page.tsx`（既存の898行ファイル）

- [ ] **Step 1: 新しいpage.tsxを作成**

```typescript
// src/app/(marketing)/page.tsx
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
            {['About', 'Service', 'News', 'Careers', 'Contact'].map((item) => (
              <button key={item}
                onClick={() => {
                  const el = document.getElementById(item.toLowerCase());
                  if (el && scrollToRef.current) {
                    scrollToRef.current(el.offsetTop);
                  }
                }}
                className="font-gothic text-[11px] text-stone-400 tracking-[0.2em] uppercase transition-all duration-300 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-pink-400 cursor-pointer bg-transparent border-none">
                {item}
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
```

- [ ] **Step 2: 旧page.tsxを削除**

```bash
rm src/app/page.tsx
```

- [ ] **Step 3: ビルド確認**

Run: `npx next build 2>&1 | tail -10`
Expected: ビルド成功。`/` ルートが(marketing)グループから提供される

- [ ] **Step 4: コミット**

```bash
git add -A
git commit -m "refactor: replace monolithic page.tsx with route group structure"
```

---

### Task 13: 未使用コンポーネント・ファイルの削除

**Files:**
- Delete: `src/components/Header.tsx`
- Delete: `src/components/Footer.tsx`
- Delete: `src/components/ScrollAnimator.tsx`
- Delete: `src/components/WaveDivider.tsx`
- Delete: `src/components/TextReveal.tsx`
- Delete: `src/components/NetworkAnimation.tsx`
- Delete: `src/utils/motion.ts`

- [ ] **Step 1: 未使用ファイルを削除**

```bash
rm src/components/Header.tsx
rm src/components/Footer.tsx
rm src/components/ScrollAnimator.tsx
rm src/components/WaveDivider.tsx
rm src/components/TextReveal.tsx
rm src/components/NetworkAnimation.tsx
rm -rf src/utils/
```

- [ ] **Step 2: ビルド確認**

Run: `npx next build 2>&1 | tail -10`
Expected: ビルド成功。削除したファイルへの参照がないことを確認

- [ ] **Step 3: コミット**

```bash
git add -A
git commit -m "chore: remove unused legacy components and utils"
```

---

### Task 14: layout.tsxの整理

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: layout.tsxを確認・整理**

layout.tsxはルートレイアウトとして正しい位置にあるのでそのまま維持。
ただし、page.tsxがZen Maru Gothicをstyle jsxでロードしているため、将来的にはlayout.tsxのnext/font/googleに移行を検討（今回のスコープ外）。

---

### Task 15: 最終ビルド確認とdev動作テスト

- [ ] **Step 1: クリーンビルド**

```bash
rm -rf .next && npx next build
```
Expected: エラーなし、Warningのみ許容

- [ ] **Step 2: dev起動確認**

```bash
npx next dev
```
Expected: localhost:3000でサイトが正常動作。全セクションのスクロールアニメーション、お問い合わせフォームが動作

- [ ] **Step 3: 最終コミット**

```bash
git add -A
git commit -m "refactor: complete CLAUDE.md architecture compliance restructuring"
```

---

## ファイルサイズの確認

リファクタリング後の各ファイル行数目安:

| ファイル | 行数(約) | CLAUDE.mdの上限 |
|---------|---------|----------------|
| `page.tsx` | ~90 | ✅ 300以下 |
| `services-section.tsx` | ~260 | ✅ 300以下 |
| `cta-section.tsx` | ~145 | ✅ 300以下 |
| `hero-section.tsx` | ~35 | ✅ 300以下 |
| `philosophy-section.tsx` | ~50 | ✅ 300以下 |
| `footer-section.tsx` | ~34 | ✅ 300以下 |
| その他各ファイル | <30 | ✅ 300以下 |
