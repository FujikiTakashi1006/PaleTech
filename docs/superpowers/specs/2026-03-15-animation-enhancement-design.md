# PaleTech Animation Enhancement Design

## Overview

PaleTechのトップページをモダンなアニメーションで強化する。Three.jsは使わず、anime.js + CSS + Intersection Observerでスクロール連動アニメーションとヒーローのSVGベクターアニメーションを実装する。S3 Seismic風のプロフェッショナルな印象を目指す。

## Decisions

- **Three.js不使用** — 一昔前の印象になりがちなため除外
- **anime.js中心** — DOM/SVGアニメーションのメインエンジン
- **NEWSセクション削除** — 不要と判断
- **参考サイト**: [S3 Seismic](https://www.s3seismic.com/) — パララックス、波線SVG装飾、プロフェッショナルなトーン

## Tech Stack

| 技術 | 用途 |
|------|------|
| anime.js | テキストスプリット、stagger、SVGパス描画、スクロール連動アニメーション |
| Intersection Observer API | スクロールトリガー検知（軽量、ライブラリ不要） |
| CSS animations/transitions | グラデーション背景、ホバー効果、基本的なトランジション |

### 不使用
- Three.js / React Three Fiber — 不使用（削除対象）
- Framer Motion — anime.jsに統一するため不使用
- GSAP — anime.jsで十分カバーできるため不使用

## Color Scheme

ダーク＋ライトのミックス構成:

- **Hero**: ダーク背景（既存の背景画像 + オーバーレイ）
- **VISION**: ライトグレー背景（`bg-gray-50`）
- **SERVICE**: 白背景
- **CTA**: ダーク背景（黒）
- **Footer**: ダーク背景 + 波線SVG区切り
- **アクセントカラー**: 既存のパープル→ブルーグラデーション維持（`purple-600` → `blue-500`）

## Page Structure (After Changes)

```
Header (fixed, backdrop blur — 変更なし)
├── Hero Section (dark)
│   ├── 背景画像 + ダークオーバーレイ
│   ├── ネットワークノードSVGアニメーション（右側）
│   ├── テキスト（左下）— 1文字ずつリビール
│   ├── アクセントグラデーションライン
│   └── サブテキスト フェードイン
├── VISION Section (light gray)
│   ├── パララックスレイヤー（画像とテキスト異速度）
│   ├── テキスト — 下からスライドイン
│   └── 波線SVG装飾（セクション区切り）
├── SERVICE Section (white)
│   ├── タイトル — クリップリビール
│   ├── 3カード — stagger付きスケールイン
│   └── カード — ホバーで浮き上がりエフェクト
├── CTA Section (dark)
│   ├── テキスト — クリップリビール（横スライド）
│   └── ボタン — フェードイン
└── Footer (dark)
    ├── 波線SVG区切り（上部）
    └── リンク — staggerフェードイン
```

## Animation Details

### 1. Hero Section

**ネットワークノードSVGアニメーション:**
- 4-6個のノード（円）がSVGで描画
- ノード間の接続線がanime.jsのSVGパス描画（stroke-dashoffset）で順番に現れる
- ノードは微妙にパルスするアニメーション（`scale` + `opacity`の繰り返し）
- AI/テクノロジーの「つながり」を視覚的に表現
- 配置: 画面右側、背景画像の上にオーバーレイ

**テキストアニメーション:**
- anime.jsの`stagger`で1文字ずつ下から出現（`translateY(100%)` → `0`）
- 「テクノロジーで」→ 「取り戻す」の順にディレイ付き
- アクセントライン: 幅0 → 展開アニメーション
- サブテキスト: 最後にフェードイン

**タイムライン:**
```
0.0s — ページロード
0.5s — SVGノード出現開始
0.8s — SVG接続線描画開始
1.2s — 「テクノロジーで」文字リビール
1.8s — 「取り戻す」文字リビール
2.2s — アクセントライン展開
2.5s — サブテキストフェードイン
```

### 2. VISION Section

**パララックス効果:**
- 左カラムの画像エリアと右カラムのテキストが異なるスクロール速度で移動
- 画像: スクロール速度 × 0.7（遅め）
- テキスト: スクロール速度 × 1.0（通常）
- anime.jsでスクロール量に連動した`translateY`を計算

**テキストアニメーション:**
- Intersection Observerでビューポート進入を検知
- 見出し「VISION」: 下から30pxスライド + フェードイン（0.8s）
- アンダーライン: 幅0 → 展開（0.6s、ディレイ0.2s）
- 本文テキスト: stagger付きで段落ごとにフェードイン（ディレイ0.4s）

**波線SVG装飾:**
- セクション下部に波線SVGをフルワイドで配置
- パスのstroke-dashoffsetでスクロール連動の描画アニメーション
- 色: アクセントグラデーション（purple → blue）、opacity低め

### 3. SERVICE Section

**タイトルアニメーション:**
- 「SERVICE」テキストがクリップリビール（`overflow: hidden` + `translateX(-100%)` → `0`）
- アンダーライン展開

**カードアニメーション:**
- 3枚のカードがstagger付き（0.15s間隔）でスケールイン
- 初期状態: `scale(0.85)` + `opacity: 0`
- 表示状態: `scale(1)` + `opacity: 1`
- イージング: `cubicBezier(0.16, 1, 0.3, 1)`（弾むような動き）

**ホバーエフェクト:**
- カードホバー時: `translateY(-8px)` + `shadow-lg`拡大
- CSS transition（0.3s ease）で実装

### 4. CTA Section

**テキストアニメーション:**
- 見出し「一緒に未来を創りませんか？」がクリップリビール
- サブテキストがフェードイン（ディレイ0.3s）

**ボタンアニメーション:**
- 2つのボタンがstagger付きフェードイン（0.2s間隔）
- 初期状態: `translateY(20px)` + `opacity: 0`

### 5. Footer

**波線SVG区切り:**
- Footer上部に波線SVGを配置（セクション区切り）
- CTAの黒背景からFooterへの自然な遷移

**リンクアニメーション:**
- Intersection Observerでトリガー
- 各カラムのリンクがstagger付きフェードイン

## Implementation Components

### New Files
- `src/components/NetworkAnimation.tsx` — ヒーローのネットワークノードSVGアニメーション
- `src/components/ScrollAnimator.tsx` — Intersection Observer + anime.jsのスクロールアニメーションフック
- `src/components/WaveDivider.tsx` — 波線SVG装飾コンポーネント
- `src/components/TextReveal.tsx` — テキストスプリット＋リビールアニメーション

### Modified Files
- `src/app/page.tsx` — NEWSセクション削除、各セクションにアニメーション適用
- `src/app/globals.css` — 新規キーフレーム追加（既存は維持）
- `src/components/Footer.tsx` — 波線SVG追加、staggerアニメーション追加
- `package.json` — anime.jsを依存関係に追加

### Dependencies
- `animejs` (v3.x) — 追加
- `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` — 削除（extraneous）
- `framer-motion` — 削除（extraneous）

## Performance Considerations

- **Intersection Observer**: 全アニメーションをビューポート進入時にのみ実行（不要なアニメーション抑制）
- **will-change**: アニメーション対象要素に`will-change: transform, opacity`を適用してGPU合成を促進
- **anime.js**: 軽量ライブラリ（~17KB gzipped）、パフォーマンスへの影響は最小
- **SVGアニメーション**: DOM要素数を抑え、パス描画アニメーションで表現力を確保
- **リデュースドモーション**: `prefers-reduced-motion`メディアクエリ対応。アクセシビリティのためアニメーションを無効化するオプションを提供

## Out of Scope

- 他ページ（/about, /service等）のアニメーション — 今回はトップページのみ
- モバイル固有のアニメーション調整 — レスポンシブ対応はするが、特別なモバイルアニメーションは含まない
- Lottieファイルの作成 — SVGアニメーションをanime.jsで直接制御する方式を採用
