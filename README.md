# PaleTech

Next.js で構築されたモダンな Web アプリケーションです。

## 技術スタック

- **Next.js 15** - React フレームワーク
- **TypeScript** - 型安全性
- **Tailwind CSS** - ユーティリティファースト CSS
- **ESLint** - コード品質管理

## 開発環境の起動

```bash
# 開発サーバーの起動
npm run dev
# または
yarn dev
# または
pnpm dev
# または
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて結果を確認してください。

`src/app/page.tsx`を編集することでページの編集を開始できます。ファイルを編集すると、ページが自動的に更新されます。

## プロジェクト構造

```
PaleTech/
├── src/
│   └── app/               # App Router（Next.js 13+）
│       ├── page.tsx       # ホームページ
│       ├── layout.tsx     # 共通レイアウト
│       └── globals.css    # グローバルスタイル
├── public/                # 静的ファイル
├── package.json           # 依存関係とスクリプト
├── tsconfig.json          # TypeScript設定
├── next.config.ts         # Next.js設定
└── eslint.config.mjs      # ESLint設定
```

## 利用可能なスクリプト

- `npm run dev` - 開発サーバーの起動
- `npm run build` - プロダクションビルド
- `npm run start` - プロダクションサーバーの起動
- `npm run lint` - ESLint によるコードチェック

## 学習リソース

Next.js について詳しく学ぶには、以下のリソースをご確認ください：

- [Next.js ドキュメント](https://nextjs.org/docs) - Next.js の機能と API について学ぶ
- [Next.js を学ぶ](https://nextjs.org/learn) - インタラクティブな Next.js チュートリアル
- [Next.js GitHub リポジトリ](https://github.com/vercel/next.js) - フィードバックや貢献をお待ちしています！

## デプロイ

Next.js アプリをデプロイする最も簡単な方法は、Next.js の作成者が提供する[Vercel プラットフォーム](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)を使用することです。

詳細については、[Next.js デプロイメントドキュメント](https://nextjs.org/docs/app/building-your-application/deploying)をご確認ください。
