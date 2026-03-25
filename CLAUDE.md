- YOU MUST: ## コミュニケーションルール
- ユーザーへの質問は必ず `AskUserQuestion` ツールを使用すること。テキスト内で質問を記述してはならない。

---

description:
globs:
alwaysApply: true

---

# アーキテクチャルール (2025-05-09)

**要約：** UI は **App Router** (`app/*`) に存在し、**Server Actions** と通信します。それ以下の層はすべてフレームワーク非依存です。 **_読み取り_** はデフォルトで **React Server Components (RSC)** と React の `cache()` を使用し、**_書き込み_** は RSC キャッシュも再検証する **検証済み Server Actions** を経由します。すべてのルートセグメントは独自の **エラーバウンダリ** を持ち、**Partial Prerendering (PPR)** でストリーミングできます。

- クライアントフックは、プレゼンテーションとオプティミスティック UI のみを管理します。読み取りは RSC、書き込みは Server Actions です。
- `useFormState` は非推奨とし、`useActionState` (React 19) を使用します。([React][1], [React][2])
- ドメインサービスモジュールは小さく保ちます (ファイルあたり 300 LOC 以下、ユースケースごとに 1 ファイル)。`service/index.ts` はバレルであり、ビジネスロジックは含みません。†

---

## 0 · レイヤー境界 (ランタイム順)

```text
クライアントコンポーネント / RSC キャッシュ (またはインタラクション/ポーリングが必要な場合は SWR†)
│
└─── Server Actions (app/**/actions/<verb>.ts) ──► Zod 検証 · 認証 · revalidatePath/tag
     ▼
     ドメインサービス (domain/**/service/*.service.ts) ──► ビジネスルール · オーケストレーション
     ▼
     リポジトリ / DAL (domain/**/repository/*.repository.ts) ──► 単一テーブル CRUD
     ▼
     外部アダプタ (external/**) ──► メール · S3 …
     ▼
     DB / Supabase RPC / サードパーティ HTTP
```

> † **SWR** は、クライアントサイドのポーリング、オプティミスティックアップデート、またはライブソケットにのみ使用します。通常の読み取りには RSC をデフォルトで使用します。

- **レイヤースキップなし** — ページ/コンポーネントはリポジトリをインポートしてはならず、サービスは `fetch`/Supabase を直接呼び出してはなりません。

> **境界ルール:**
>
> - クライアントコンポーネント (`'''use client'''` が付いたファイル) は、環境変数、ファイルシステム、またはデータベース/ORM モジュールを直接読み取るコードを **インポートしてはなりません**。
> - そのようなコードは RSC またはそれ以下のレイヤーに存在し、プロップまたは Server Actions を介してのみ到達できます。
>   **(理由: 機密情報/データベースライブラリがブラウザにバンドルされるのを避けるため。参考: @Next.js Docs)**

> **将来的に公開 JSON API やモバイルクライアントが追加された場合は、薄い API ルート/TRPC レイヤーを介してドメインサービスを公開します。それまでは、Server Actions が唯一の書き込みサーフェスとなります。**

> **共有カーネル (`domain/_shared/`)** – ドメイン間で再利用される、純粋で依存関係のない型 (ID ブランド)、結果ユニオン、およびロギングヘルパー。DB 呼び出し、フレームワークのインポートはありません。

---

## 1 · ディレクトリ構造 (注釈付き)

```tree
app/                      # すべてのルーティングと UI (App Router)
├── (dashboard)/          # ルートグループ (URL パスには含まれない)
│   ├── page.tsx          # ページコンポーネント (デフォルトで RSC)
│   ├── layout.tsx        # セグメントの共有レイアウト
│   ├── template.tsx      # 再レンダリングされるレイアウトラッパー
│   ├── actions/          # この機能スライスのサーバーアクション
│   │   ├── archive.ts    # ファイルごとに単一のアクション
│   │   ├── list.ts
│   │   └── index.ts      # バレルエクスポート
│   ├── lib/              # ルートローカルユーティリティ
│   │   └── format-duration.ts
+ │   ├── components/     # ルートローカル UI コンポーネント (必要な場合)
+ │   │   └── user-card.tsx
│   └── error.tsx         # ルートセグメントエラーバウンダリ
│
├── (marketing)/          # 別のルートグループ
│   ├── page.tsx
│   └── error.tsx
│
└── ...                   # その他のルート/グループ

components/               # 真に共有された、フレームワーク非依存の UI プリミティブ
├── button/
│   └── index.tsx
└── ...

domain/                   # フレームワーク非依存のビジネスロジックとデータアクセス
├── _shared/              # ドメイン間で共有される純粋な型とヘルパー
│   └── types/
│       └── ids.ts        # 例: Branded ID
│
├── bot/
│   ├── service/          # ユースケースごとに最大 1 ファイル (create-bot.service.ts…)
│   │   ├── create-bot.service.ts
│   │   ├── get-bot-status.service.ts
│   │   └── index.ts      # バレルエクスポート (ロジックなし)
│   ├── index.ts          # サービスレイヤー (バレル)
│   └── repository/       # "bot" アグリゲートのデータアクセスレイヤー
│       ├── bot.repository.ts
│       └── index.ts      # バレルエクスポート
│
├── meeting/
│   ├── service/          # ユースケースごとに最大 1 ファイル (archive-meeting.service.ts…)
│   │   ├── archive-meeting.service.ts
│   │   ├── list-meetings.service.ts
│   │   └── index.ts      # バレルエクスポート (ロジックなし)
│   ├── index.ts          # サービスレイヤー (バレル)
│   └── repository/       # このアグリゲートの 1 つ以上のリポジトリファイル
│       ├── participant.repository.ts
│       ├── minutes-doc.repository.ts
│       └── index.ts      # バレル再エクスポート
└── ...

cache/                    # RSC cache() を使用する純粋なリードスルーヘルパー
├── meeting/
│   └── read-upcoming-meetings.ts
└── ...

external/                 # サードパーティ API のアダプタ
├── email/                # 例: メールアダプタ
│   └── mail-api.ts       # 例: メール API
└── ...

lib/                      # 横断的でフレームワーク非依存のユーティリティ
├── date/
│   └── format-utc.ts
└── ...
```

**なぜ `lib/` なのか?**

- **1 つのルートセグメント内でのみ使用される** ヘルパーを保持します。
- Next.js App Router では、`page.tsx` や `route.ts` を含まないフォルダは自動的にルートから除外されます。
- インポートパスを短く (`./lib/...`) 保ち、`domain/` を UI 固有のヘルパーからクリーンに保ちます。

**なぜ `cache/` なのか?**

- 費用のかかる読み取りを `cache()` で一度ラップします。どのサーバーコンポーネントもリクエスト内でキャッシュされた結果を再利用できます。
- `app/` の外に存在するため、Edge Functions、CLI スクリプト、または cron ジョブから UI コードを取り込まずに呼び出すことができます。
- **読み取り専用** — ミューテーションは、検証、認証、およびキャッシュの再検証を処理するために Server Actions に属します。
- **選択的使用** — 複数のコンポーネントで使用される高コストなクエリにのみ使用します。単一使用のデータは Server Components で直接フェッチします。

**なぜ `service/` なのか?**

> オーケストレーションモジュールを小さくテスト可能に保ち、1000 行の「神」ファイルを回避します。大きなファイルは認識されているコードの臭いです ([ESLint][3])。

---

## 2 · ファイルシステムレイアウトテーブル

| 関心事 / レイヤー                | パスパターン                                  | 例                                                    |
| :------------------------------- | :-------------------------------------------- | :---------------------------------------------------- |
| ページとエラーバウンダリ         | `app/(route)/page.tsx` / `error.tsx`          | `bots/page.tsx`, `bots/error.tsx`                     |
| レイアウトとテンプレート         | `app/(route)/layout.tsx` / `template.tsx`     | `dashboard/layout.tsx`                                |
| **サーバーアクション**           | `app/(route)/actions/<verb>.ts`               | `meetings/actions/archive.ts`                         |
| プライベートヘルパー             | `app/(route)/lib/**/*.ts`                     | `bots/lib/format-duration.ts`                         |
| **ルートローカル UI**            | `app/(route)/components/*.tsx`                | `users/components/user-card.tsx`                      |
| 共有 UI コンポーネント           | `components/<ui-piece>/index.tsx`             | `components/button/index.tsx`                         |
| ドメインサービス (分割)          | `domain/<feature>/service/*.service.ts`       | `domain/meeting/service/archive-meeting.service.ts`   |
| リポジトリ / DAL (分割)          | `domain/<feature>/repository/*.repository.ts` | `domain/meeting/repository/minutes-doc.repository.ts` |
| 共有カーネル型                   | `domain/_shared/**/*.ts`                      | `_shared/types/ids.ts`                                |
| 外部アダプタ                     | `external/<vendor>/<resource>Api.ts`          | `external/email/mail-api.ts`                          |
| キャッシュされた読み取りヘルパー | `cache/<feature>/read<X>.ts`                  | `cache/meeting/read-upcoming-meetings.ts`             |
| 横断的ユーティリティ             | `lib/<utility>/**/*.ts`                       | `lib/date/format-utc.ts`                              |

## **注: `/public` ディレクトリは、標準の HTTP で画像やフォントなどの静的アセットに引き続き使用されます。**

## 3 · レイヤーごとのコーディングルール

### 3.1 Server Actions (動詞ごとに 1 ファイル)

- ルートグループは `actions/` フォルダを所有し、各ファイルは **正確に 1 つ** のアクション (`list.ts`, `archive.ts`, …) をエクスポートします。ローカルバレル `actions/index.ts` がそれらを再エクスポートします。
- `'''use server''';` で始まる必要があります。
- **Zod** スキーマを介して入力を検証し、必要な認証/認可チェックを早期に実行します。
- 成功時には、データの鮮度を確保するためにアクション内で `validateTag()` を呼び出します。
- **すべての成功したミューテーションの後には、必ず `revalidatePath()` または `revalidateTag()` を呼び出す必要があります** (または、キャッシュが不適切な場合にデータフェッチが `noStore()` または同等のものを使用することを確認します)。 **(理由: キャッシュ無効化ルールを明示的にし、UI が変更を反映するようにするため。参考: @Next.js Docs - revalidatePath)**
- 予期されるクライアントまたはサーバーエラーに対しては `NextResponse.json({ error: '''...\''' }, { status: 4xx/5xx })` をスローします。
- ビジネスロジックは簡潔に保ち (ターゲット ≤ 約 20 LOC)、複雑な操作はドメインサービスに委任します。
- 任意の `actions/*.ts` ファイルの `max-lines ≤ 300` (lint)。([React][9])
- ファイル名は URL に表示されるため、短く、小文字で、`.action` サフィックスなしにします。
- 基になるドライバーエラー (DB、外部 API) を型付きドメインエラーでラップし、生の例外やスタックトレースをクライアントに漏洩させません。
- 同じアクションをサーバーコンポーネント (例: `<form action={...}>` 経由) とクライアントコンポーネント (例: `startTransition` 経由) の両方から呼び出す必要がある場合は、**専用の `actions/<verb>.ts` ファイルからエクスポートします。** クライアントコンポーネントファイル (`'''use client'''`) 内でインラインで定義しないでください。 **(理由: サーバー専用コードの依存関係が誤ってクライアントにバンドルされるのを防ぐため。参考: @Upsun Blog - Common Mistakes)**
- プログレッシブエンハンスメントを確保するために、すべてのミューテーションを標準の HTML `<form action={serverFn}>…</form>` を介して公開します (JS なしで動作します)。ローディング/無効状態およびオプティミスティックアップデートのために、必要に応じて `useFormStatus` / `useActionState` フックを使用してユーザーエクスペリエンスを向上させます。 **(理由: クライアントサイド JavaScript なしでの基本機能というサーバーアクションの主要な設計目標に沿っているため。参考: @Next.js Docs - Server Actions)**
- **データフロー:** Server Components がデータを取得 → Server Actions がデータを変更 → 再検証により Server Components が更新されます。Server Actions はミューテーション、Server Components はデータフェッチを処理します。これらの懸念事項を混在させないでください。

#### 3.2 React-cache ヘルパー (`cache/`)

- これらは Server Component のデータフェッチを最適化するためのラッパーです
- Server Components の代替ではなく、それらを強化するものです
- 同じ高コストなクエリが 1 つのレンダー内で複数回必要な場合に使用します

##### いつ cache() を使用するか

**✅ 使用すべきケース:**

1. **複数のコンポーネントが同じデータを必要とする場合**

   ```typescript
   // cache/user/read-user-with-permissions.ts
   export const readUserWithPermissions = cache(async (userId: string) => {
     // 高コストなクエリ: ユーザー + ロール + 権限をJOIN
     const result = await db.query(
       `
       SELECT u.*, r.*, p.* FROM users u
       JOIN roles r ON u.role_id = r.id
       JOIN permissions p ON r.id = p.role_id
       WHERE u.id = $1
     `,
       [userId],
     );
     return result;
   });

   // 複数のコンポーネントから呼び出される
   // HeaderComponent, SidebarComponent, ProfileComponent で同じデータが必要
   ```

2. **再帰的またはネストされたデータ構造**

   ```typescript
   // cache/category/read-category-tree.ts
   export const readCategoryById = cache(async (categoryId: string) => {
     const category = await categoryRepo.findById(categoryId);
     // 親カテゴリも同じ関数で取得（キャッシュされる）
     if (category.parentId) {
       category.parent = await readCategoryById(category.parentId);
     }
     return category;
   });
   ```

3. **複雑な集計や計算**

   ```typescript
   // cache/analytics/read-monthly-stats.ts
   export const readMonthlyStats = cache(
     async (shopId: string, month: Date) => {
       // 複数のテーブルから集計する高コストなクエリ
       const stats = await db.query(`
       WITH daily_sales AS (...),
            cast_performance AS (...),
            expense_summary AS (...)
       SELECT ... // 複雑な集計
     `);
       return stats;
     },
   );
   ```

**❌ 使用すべきでないケース:**

1. **単一のコンポーネントでのみ使用されるデータ**

   ```typescript
   // ❌ 悪い例 - キャッシュ不要
   export const readSimpleUserList = cache(async () => {
     return await db.query("SELECT id, name FROM users");
   });

   // ✅ 良い例 - Server Component で直接フェッチ
   export default async function UsersPage() {
     const users = await db.query("SELECT id, name FROM users");
     return <UserList users={users} />;
   }
   ```

2. **リアルタイムまたは常に最新である必要があるデータ**

   ```typescript
   // ❌ 悪い例 - 在庫数はキャッシュすべきでない
   export const readStockCount = cache(async (productId: string) => {
     return await db.query("SELECT stock FROM products WHERE id = $1", [
       productId,
     ]);
   });

   // ✅ 良い例 - unstable_noStore() を使用
   import { unstable_noStore } from "next/cache";

   export async function readStockCount(productId: string) {
     unstable_noStore();
     return await db.query("SELECT stock FROM products WHERE id = $1", [
       productId,
     ]);
   }
   ```

##### 実装例

```typescript
// cache/meeting/read-upcoming-meetings.ts
import { cache } from "react";
import { listUpcomingMeetingsFromDb } from "@/domain/meeting/repository";
import { unstable_noStore } from "next/cache";

// キャッシュが有効な例：複数のコンポーネントで使用
export const readUpcomingMeetings = cache(async (userId: string) => {
  console.log(
    `キャッシュヘルパー: ユーザー ${userId} の今後のミーティングを取得`,
  );

  // 複雑なクエリ：参加者、場所、関連ドキュメントを含む
  const result = await listUpcomingMeetingsFromDb({
    userId,
    includeParticipants: true,
    includeDocuments: true,
  });

  return result;
});

// キャッシュが不要な例：シンプルで単一使用
export async function readMeetingCount(userId: string) {
  // cache() でラップしない - 単純なカウントクエリ
  return await db.query("SELECT COUNT(*) FROM meetings WHERE user_id = $1", [
    userId,
  ]);
}

// 常に最新データが必要な例
export async function readActiveMeetingStatus(meetingId: string) {
  unstable_noStore(); // キャッシュを明示的に無効化
  return await db.query(
    "SELECT status, participant_count FROM meetings WHERE id = $1",
    [meetingId],
  );
}
```

##### 代替パターン

```typescript
// 代替案1: ドメイン内にキャッシュヘルパーを配置
domain/
  └── meeting/
      ├── service/
      ├── repository/
      └── cache/              // ドメイン固有のキャッシュ
          └── read-complex-meeting-data.ts

// 代替案2: Server Component での直接フェッチ（推奨）
// app/(dashboard)/meetings/page.tsx
export default async function MeetingsPage() {
  // ほとんどの場合、これで十分
  const meetings = await meetingService.listMeetings();
  return <MeetingList meetings={meetings} />;
}
```

##### 重要な注意事項

- これらはデータフェッチロジックの純粋な読み取り専用ラッパーであり、**ミューテーション** や副作用は許可されません。
- サーバーコンポーネント、Edge functions、およびバックグラウンドジョブ/スクリプトから安全に呼び出すことができます。
- `react` の `cache()` は、関数が **純粋** (リクエストライフサイクル内で同じ入力が常に同じ出力を生成する) であるか、リクエストレベルのキャッシュが必要な場合にのみ使用します。
- **常に** 新鮮であるべきデータ (「ライブ」データ) については、基になるフェッチが `{ cache: 'no-store' }` を使用するか、ヘルパー関数自体を `next/cache` の `unstable_noStore()` でラップすることを確認します。 **(理由: データが頻繁に変更される場合に偶発的な長期間の古さを防ぐため。参考: @Next.js Docs - Caching)**

#### 3.3 ドメインサービス (service/\*.service.ts)†

- **ユースケースごとに 1 つのサービスファイル** (例: `archive-meeting.service.ts`, `list-meetings.service.ts`)。
- すべてのファイルは `domain/<feature>/service/` に存在し、`service/index.ts` (バレル) によって **再エクスポート** されます。バレルには `export * from '''./*.service''';` のみが含まれ、**ビジネスコードやインポートはありません**。([Medium][2])
- 成功または特定の失敗モードを明確に示すために、判別されたユニオンまたは同様の結果型を返します (多くの場合 `domain/_shared/` で定義されます)。

```typescript
// 結果型の例 (おそらく domain/_shared/results.ts から)
export type CreateBotResult =
  | { success: true; botId: BotId } // Branded 型を使用
  | {
      success: false;
      error:
        | "InsufficientPermissions"
        | "ValidationError"
        | "QuotaExceeded"
        | "UnknownError";
    };

// サービス関数シグネチャの例
export async function createBot(
  userId: UserId, // Branded 型を使用
  config: BotConfig,
): Promise<CreateBotResult> {
  // 1. 必要に応じて入力をさらに検証
  // 2. 権限/クォータを確認 (他のサービス/リポジトリを呼び出す)
  // 3. ボットリポジトリを呼び出す (例: botRepository.create(...))
  // 4. 副作用を実行 (例: 外部アダプタ経由の初期設定)
  // 5. 成功またはエラーユニオンを返す
}
```

- 単体テストを容易にするために、リポジトリ/アダプタの依存性注入 (コンストラクタまたは関数引数) を使用する場合があります。
- 1 つのデータベーステーブルと最小限のロジックのみを含む非常に単純な機能の場合、別の `repository/` フォルダとファイルを作成しても大きな再利用価値や抽象化の利点がない場合に限り、サービス内で単純なクエリをインライン化 **してもかまいません**。デフォルトではリポジトリを使用します。
- 任意の `*.service.ts` の `max-lines` **≤ 300**。制限に達した場合は、別のサービスファイルを作成します。このガードは SRP 違反とマージコンフリクトを防ぎます。([ESLint][3])

> _なぜすべてのサービスを 1 つのファイルにマージしないのか?_
> 大きなファイルは SRP ([Medium][1]) に違反し、コンフリクトのリスクを高めます ([Reddit][4])。ファイルを細かく保つことは、Vercel Commerce および Next.js テンプレートのコミュニティプラクティス ([Vercel][5], [Next.js by Vercel - The React Framework][6]) に沿っています。

#### 3.4 リポジトリ (`repository/*.repository.ts`)

- 単一のデータベーステーブル、または 1 つのアグリゲート/境界コンテキストを表す密接に関連するテーブルのグループに対して、基本的な CRUD (作成、読み取り、更新、削除) 操作を提供します。
- `.repository.ts` サフィックスを付けて `domain/<feature>/repository/` に存在します。`repository/index.ts` を介してバレルエクスポートされます。
- 標準化された結果オブジェクト (例: `{ success: boolean; data?: T; error?: RepoError }`) を返します (型は多くの場合 `_shared` から)。
- 原子性を必要とする操作のために `withTransaction<T>(fn: (txClient) => Promise<T>)` メソッドを公開する場合があります。
- 特定の ORM またはデータベースクライアントの詳細 (例: Supabase クライアント、Prisma クライアント) を抽象化します。
- 単一のリポジトリファイルが 400 LOC を超える場合は、テーブル/アグリゲートの責任によって分割し、`repository/index.ts` を介してバレルエクスポートします。(ESLint ルール `max-lines` によって強制されます)。([Next.js by Vercel - The React Framework][3])

#### 3.5 データフェッチパターン

### 黄金律

**Server Components がデータを取得します。Client Components が UI 状態を管理します。** これが Next.js App Router データアーキテクチャの基本原則です。

### データフェッチ階層

| パターン              | 使用タイミング                     | 方法                                      | 例                                         |
| --------------------- | ---------------------------------- | ----------------------------------------- | ------------------------------------------ |
| **Server Components** | すべてのデータフェッチのデフォルト | コンポーネント内で直接 async/await        | ページデータ、ユーザープロファイル、リスト |
| **Server Actions**    | すべてのデータミューテーション     | 'use server' を持つ専用アクションファイル | フォーム送信、更新、削除                   |
| **Cache Helpers**     | 重複排除が必要な高コストな読み取り | React cache() でラップ                    | 複数回使用される複雑なクエリ               |
| **Client Fetching**   | リアルタイム/ポーリングのみ        | SWR または類似                            | ライブ通知、チャット                       |

### 決定木

```text
データが必要？
├─ データの読み取り？
│   ├─ YES → Server Component を使用 (デフォルト)
│   │         └─ 高コスト/繰り返し？ → cache() でラップ
│   └─ NO → 続行
└─ データの書き込み/変更？
    ├─ YES → Server Action を使用
    │         └─ 常に revalidatePath/Tag を実行
    └─ NO → リアルタイム更新が必要？
             ├─ YES → Client Component + SWR を使用
             └─ NO → 再考 - おそらく Server Component が必要
```

### 避けるべきアンチパターン

❌ **絶対にしない**: 初期データフェッチに useEffect を使用
❌ **絶対にしない**: リアルタイムでない限り Client Components でデータを取得
❌ **絶対にしない**: Server Components を Client Component の children に渡す
❌ **絶対にしない**: ミューテーション後の再検証を忘れる

### 正しいパターン

#### Server Component データフェッチ

```typescript
// app/(dashboard)/users/page.tsx
import { listUsers } from "@/domain/user/service";

export default async function UsersPage() {
  // Server Component 内で直接データフェッチ
  const users = await listUsers();

  return (
    <div>
      <h1>Users</h1>
      <UserList users={users} /> {/* データをプロップとして渡す */}
    </div>
  );
}
```

#### Server Action ミューテーション

```typescript
// app/(dashboard)/users/actions/create.ts
"use server";

import { createUser } from "@/domain/user/service";
import { revalidatePath } from "next/cache";

export async function createUserAction(formData: FormData) {
  // 検証、変更、再検証
  const result = await createUser(data);

  if (result.success) {
    revalidatePath("/users");
    revalidatePath(`/users/${result.userId}`);
  }

  return result;
}
```

#### Server Action を使用する Client Component

```typescript
// app/(dashboard)/users/components/create-form.tsx
"use client";

import { useActionState } from "react";
import { createUserAction } from "../actions/create";

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUserAction, null);

  return (
    <form action={formAction}>
      {/* フォームフィールド */}
      <button disabled={isPending}>
        {isPending ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}
```

### 移行ガイド

フックベースのデータフェッチから Server Components への移行:

**Before (フックを使用した Client Component):**

```typescript
"use client";
function Page() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then(setData);
  }, []);
  return <div>{data}</div>;
}
```

**After (Server Component):**

```typescript
async function Page() {
  const data = await fetchData(); // 直接呼び出し
  return <div>{data}</div>;
}
```

#### 3.6 外部アダプタ (`external/**`)

- 外部サービス **リソース** ごとに 1 つのファイルを作成します (例: `stripe/payment-intents-api.ts`)。
- サードパーティ API とのすべての対話ロジック (認証、リクエストフォーマット、レスポンス解析) をカプセル化します。
- **生の HTTP レスポンスやベンダー SDK オブジェクトを直接返しません。** 結果をアダプタ固有の成功/エラーユニオンまたはドメインに関連する単純化された DTO (型は `_shared` からの可能性がある) でラップします。

#### 3.7 React & Next.js フック (クライアントサイド UI 状態管理)

- **目的:** クライアントサイドの状態、プレゼンテーションロジック、オプティミスティックアップデート、および Server Action 統合。データフェッチには使用しません。
- **黄金律:** フックは UI 状態を管理し、Server Actions と対話します。データフェッチは Server Components で行われます。
- **場所:** ルートローカルフックは `app/(route)/lib/hooks/` 内、グローバルフックは `hooks/` 内

| フック           | 目的                         | 使用方法                             | 注意                             |
| ---------------- | ---------------------------- | ------------------------------------ | -------------------------------- |
| `useActionState` | Server Action フォーム状態   | 保留/エラー状態を持つフォーム送信    | 非推奨の useFormState を置き換え |
| `useFormStatus`  | 親フォーム状態へのアクセス   | 送信ボタンの無効化                   | 子コンポーネントのみ             |
| `useOptimistic`  | オプティミスティック UI 更新 | サーバー確認前の即座のフィードバック | Server Actions と使用            |
| `useState`       | ローカル UI 状態             | モーダル、トグル、入力               | UI 状態のみ                      |
| `useEffect`      | 副作用                       | サブスクリプション、DOM 操作         | データフェッチには使用しない     |
| `useSWR`         | リアルタイムデータのみ       | ポーリング、WebSocket フォールバック | 例外、標準ではない               |

**重要:** フックを使用してデータを取得している場合、おそらく間違っています。代わりに Server Components を使用してください。

---

## 4 · パフォーマンスとレンダリング

| 関心事                     | ルール                                                                                                                                                                                                                                                                                                                                                                                  |
| :------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Partial Prerendering (PPR) | ほとんどのページ/レイアウトで PPR を有効にするには `export const dynamic = "auto"` (デフォルト) のままにします。動的レンダリング (`use client`, `noStore` など) をオプトインするコンポーネントを含む `<Suspense fallback={...}>` で、重要でない動的サブツリーのみをマークします。`force-dynamic` セグメントオプションは控えめに使用します。                                             |
| Edge Runtime               | 低レイテンシが重要で Node.js API が不要な API ルートまたはサーバーコンポーネント/アクションには `export const runtime = "edge"` を使用します。Edge ランタイムの制限に注意してください。                                                                                                                                                                                                 |
| バンドルサイズガード       | 定期的に、理想的には PR で `npx @next/bundle-analyzer analyze` を実行します。ルートごとの JavaScript バンドルサイズを **≤ 65 kB gzipped** (必要に応じてターゲットを調整) を目指します。大きなチャンクを分析し、インポート/コンポーネントを最適化します。                                                                                                                                |
| 並列フェッチと Suspense    | サーバーコンポーネントの先頭で並列データフェッチ (`Promise.all([...])`) を優先するか、独自のデータをフェッチするコンポーネントの周りに複数の詳細な `<Suspense>` 境界を使用します。独立したデータニーズに対してシーケンシャルな `await` チェーン (ウォーターフォール) を回避します。 **(理由: ストリーミングと PPR の利点を最大化するため。参考: @Next.js Docs - Composition Patterns)** |
| データフェッチ最適化       | Server Components は自動的にウォーターフォールを排除します。並列データフェッチパターンを使用し、Suspense でストリーミングして最適な UX を実現します。キャッシュヘルパーは高コストなクエリの重複排除に使用します。                                                                                                                                                                       |

---

## 5 · エラーとロギングの規約

| レイヤー      | エラー時                             | ロギング戦略                                                                                     |
| :------------ | :----------------------------------- | :----------------------------------------------------------------------------------------------- |
| リポジトリ    | `return { success: false, error }`   | `logger.error({ err, traceId, ... }, "[RepoName] Failed...")`                                    |
| ドメイン      | エラーユニオンをそのまま伝播         | `logger.warn({ params, error, traceId, ... }, "[DomainOp] Failed...")` (エラー処理/マッピング時) |
| Server Action | `throw NextResponse.json({ error })` | 最小限。ドメイン/リポジトリログに依存。エントリ/終了/認証失敗のみ `traceId` と共にログ記録。     |
| RSC / ページ  | `error.tsx` バウンダリがキャッチ     | `error.tsx` 内に `traceId` を含むエラー詳細をログ記録。                                          |

- **トレーサビリティ:** Server Action (または API ルート) からドメインサービスおよびリポジトリまで、常に一意の `traceId` (例: `AsyncLocalStorage` を使用) を生成または伝播します。リクエストの相関のために、すべての構造化ログにこの `traceId` を含めます。
- **ブラウザの可視性:** ブラウザの DevTools でのデバッグを容易にするために、`traceId` と主要なパフォーマンタイミングを `Server-Timing` ヘッダーに挿入することを検討します。

---

## 6 · テストマトリックス

| レイヤー           | テストタイプ                                  | ツール                          | フォーカス                                       |
| :----------------- | :-------------------------------------------- | :------------------------------ | :----------------------------------------------- |
| リポジトリ         | 統合 (実際の DB に対して)                     | Vitest, Testcontainers          | SQL の正確性、データマッピング                   |
| ドメイン           | ユニット (モック化されたリポジトリ/アダプタ)  | Vitest, MSW (HTTP 用)           | ビジネスロジック、ルール適用                     |
| Server Action      | 統合 / E2E                                    | Vitest (モックあり), Playwright | 入力検証、認証、フローオーケストレーション       |
| キャッシュヘルパー | ユニット (モック化されたリポジトリ)           | Vitest                          | 正しいデータフェッチ呼び出し、キャッシュロジック |
| UI コンポーネント  | ユニット / 統合 (RSC/CC + フック)             | Vitest, React Testing Library   | レンダリング、インタラクション、フックの動作     |
| エンドツーエンド   | 完全なアプリケーションフロー (ブラウザベース) | Playwright                      | ユーザージャーニー、クリティカルパス             |

- **カバレッジゲート:** CI で強制される `domain/` ( `_shared` を除く) および `repository/` ディレクトリのステートメントカバレッジ **≥ 90 %** を目指します。
- **E2E デバッグ:** 失敗した Playwright E2E テストは、UI リグレッションのデバッグを容易にするために、トレースファイルを自動的にキャプチャして CI 実行アーティファクトに添付する必要があります。

---

## 7 · 命名と型のクイックリファレンス

| 概念                   | ルール                                                       | 例                                                 |
| :--------------------- | :----------------------------------------------------------- | :------------------------------------------------- |
| ファイル (TS/TSX)      | **kebab-case**                                               | `create-bot.ts`, `mail-api.ts`, `user-profile.tsx` |
| Server Action 関数     | **camelCase**                                                | `createBot(formData: FormData)`                    |
| ドメインサービス関数   | **camelCase**                                                | `activateUser(userId: UserId)`                     |
| キャッシュヘルパー関数 | **camelCase**, プレフィックス `read`                         | `readUpcomingMeetings(userId)`                     |
| 関数結果型             | **PascalCase**, `[FnName]Result`                             | `CreateBotResult`, `ActivateUserResult`            |
| リポジトリ関数         | **camelCase** (CRUD 動詞)                                    | `findBotById()`, `updateBotConfig()`               |
| ロガーインスタンス     | コンテキストに応じた子ロガー                                 | `logger.child({ service: "createBot", traceId })`  |
| 型/インターフェース    | **PascalCase**                                               | `UserProfile`, `MeetingDetails`                    |
| Branded ID 型          | **PascalCase**, `[EntityName]Id`                             | `UserId`, `MeetingId` (`_shared/types/ids.ts` 内)  |
| ファイルサフィックス   | ルール                                                       | 例                                                 |
| **.repository.ts**     | `repository/` 内のデータアクセスモジュール                   | `meeting.repository.ts`                            |
| **.service.ts**        | `service/` 内のビジネスロジックオーケストレータ              | `archive-meeting.service.ts`                       |
| _(サフィックスなし)_   | Server Action ファイル。フォルダによって一意性が提供される ¹ | `archive.ts`                                       |

¹ アクションは `actions/` ディレクトリと `'''use server'''` プラグマからセマンティクスを取得するため、サフィックスは冗長になります。([GitHub][8])

---

## 8 · CI アーキテクチャルール

**`eslint-plugin-prj-s-demo-architecture`** (仮説上のカスタム ESLint プラグイン) は以下を強制します:

1. **正しいレイヤー依存関係:** 不正なインポート (例: UI がリポジトリをインポート、リポジトリが UI をインポート) を防ぎます。(`eslint-plugin-boundaries` または同様のもの)。([Medium][7])
2. **許可されるファイルパスと命名規則:** セクション 1 と 2 で定義された構造 ( `.repository.ts` と `.service.ts` サフィックスを含む) を強制します。
3. **必須の戻り値の型:** サービス/リポジトリが一貫した結果ユニオン/オブジェクト (多くの場合 `_shared` から) を使用することを保証します。
4. **Server Action ルール:** `'''use server'''` をチェックし、構造 (`actions/<verb>.ts`) を検証し、アクションファイル内に再検証呼び出し (`revalidatePath` または `revalidateTag`) または `noStore` の使用が存在することを確認します。
5. **最大行数:** 行数制限 (`max-lines` ルール) を強制します: `*.repository.ts` は 400 LOC、`actions/*.ts` は 300 LOC。
6. **最大行数 (サービス)** – `*.service.ts` の `max-lines` ≤ 300 を強制します。([Reddit][4])
7. **ロジックなしバレル** – `service/index.ts` および `repository/index.ts` は再エクスポートのみを含むことができます。ランタイムシンボルをインポートすると `prj-s-demo/no-barrel-logic` がトリガーされます。([Vercel][5])
8. **共有カーネルの純粋性:** `domain/_shared/` 以下のファイルは、TS 型、enum、Branded ID、または純粋関数 (副作用なし、外部 I/O なし、フレームワークのインポートなし) のみをエクスポートできます。Lint ルール `prj-s-demo/no-impure-shared` がこれを強制します。([Reddit][5], [Next.js by Vercel - The React Framework][6])
9. **クライアントコンポーネントの境界:** クライアントコンポーネント (`'''use client'''`) は `*.repository.ts` または `*.service.ts` ファイルを直接インポートしてはなりません。(`eslint-plugin-boundaries` または同様のもの)。([Medium][7])

これらの自動化されたアーキテクチャルールに違反するプルリクエストは **マージできません**。

---

## 9 · 付録: コード例 (簡潔)

このセクションには、新しいパターンを反映した更新された簡潔な例が含まれています。

### 9.1 分割リポジトリの例 (`minutes-doc.repository.ts`)

```typescript
// domain/meeting/repository/minutes-doc.repository.ts
import "server-only";
import { db } from "@/lib/database"; // DB クライアントインポートの例
import { MeetingId, MinutesDocId } from "@/domain/_shared/types/ids";
import { BaseRepoResult } from "@/domain/_shared/types/results";
// ... その他のインポート

type MinutesDoc = { id: MinutesDocId /* ... その他のフィールド */ };

export async function findMinutesByMeetingId(
  meetingId: MeetingId,
): Promise<BaseRepoResult<MinutesDoc | null>> {
  try {
    const doc = await db.query.minutesDocs.findFirst({
      // Fictional ORM クエリ
      where: (docs, { eq }) => eq(docs.meetingId, meetingId),
    });
    return { success: true, data: doc ?? null };
  } catch (error) {
    // logger.error(...)
    return { success: false, error: "DatabaseError" };
  }
}

// ... 議事録用のその他の CRUD 関数 (合計約 120 LOC ターゲット)
```

### 9.2 分割サービスの例 (`archive-meeting.service.ts`)

```typescript
// domain/meeting/service/archive-meeting.service.ts
import "server-only";
import { MeetingId, UserId } from "@/domain/_shared/types/ids";
import * as meetingRepo from "../repository/meeting.repository"; // リポジトリインポートの例
import { BaseServiceResult } from "@/domain/_shared/types/results";
// ... その他のインポート (例: 権限チェック)

type ArchiveResult = BaseServiceResult<
  void,
  "NotFound" | "PermissionDenied" | "AlreadyArchived"
>;

export async function archiveMeeting(
  userId: UserId,
  meetingId: MeetingId,
): Promise<ArchiveResult> {
  // 1. ミーティングを取得 + 権限を確認
  const findResult = await meetingRepo.findMeetingById(meetingId, userId);
  if (!findResult.success || !findResult.data) {
    // logger.warn(...)
    return { success: false, error: "NotFound" };
  }
  // 権限チェックはリポジトリ内またはここで行われると仮定

  if (findResult.data.isArchived) {
    return { success: false, error: "AlreadyArchived" };
  }

  // 2. リポジトリを呼び出して更新
  const updateResult = await meetingRepo.updateMeetingStatus(meetingId, {
    isArchived: true,
  });
  if (!updateResult.success) {
    // logger.error(...) - リポジトリエラーを伝播またはマップ
    return { success: false, error: updateResult.error }; // RepoError が ServiceError にマップされると仮定
  }

  // 3. オプション: ドメインイベントをディスパッチ?

  return { success: true, data: undefined };
}

// (Target approx 20-50 LOC per service file)
```

### 9.3 単一目的の Server Action (`archive.ts`)

```typescript
// app/(dashboard)/meetings/actions/archive.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server"; // 認証の例
import { archiveMeeting as archiveMeetingService } from "@/domain/meeting/service"; // サービスインポート (バレルから)
import { MeetingId } from "@/domain/_shared/types/ids";
import { actionErrorHandler } from "@/lib/error-handling/action-error-handler"; // エラーハンドラの例

const archiveSchema = z.object({
  meetingId: z
    .string()
    .uuid()
    .transform((id) => id as MeetingId),
});

export async function archiveMeeting(formData: FormData) {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("Unauthorized"); // または特定の認証エラー

    const validation = archiveSchema.safeParse({
      meetingId: formData.get("meetingId"),
    });
    if (!validation.success) {
      throw new Error("Invalid input"); // またはより具体的な検証エラー
    }

    const { meetingId } = validation.data;

    const result = await archiveMeetingService(userId, meetingId); // ドメインサービスを呼び出す

    if (!result.success) {
      throw new Error(result.error); // またはドメインエラーを HTTP エラーにマップ
    }

    revalidatePath("/meetings"); // 関連パスを再検証
    revalidatePath(`/meetings/${meetingId}`);

    return { success: true, message: "Meeting archived." };
  } catch (error) {
    return actionErrorHandler(error); // アクションの集中エラー処理
  }
}

// (合計約 120 LOC をターゲット)
```

### 9.4 Server Component データフェッチの例

```typescript
// app/(dashboard)/meetings/page.tsx
import { listMeetings } from "@/domain/meeting/service";
import { MeetingList } from "./components/meeting-list";

export default async function MeetingsPage() {
  // Server Component で直接データを取得
  const meetings = await listMeetings();

  return (
    <div>
      <h1>Meetings</h1>
      {/* データをプロップとして Client Component に渡す */}
      <MeetingList meetings={meetings} />
    </div>
  );
}
```

### 9.5 `useOptimistic` フックスニペット (クライアントコンポーネント)

```typescript
// app/(dashboard)/meetings/components/archive-button.tsx
"use client";

import { useOptimistic, useState, useTransition } from "react";
import { archiveMeeting } from "../actions/archive"; // サーバーアクションをインポート
import { Meeting } from "@/types"; // 型の例
import { Button } from "@/components/ui/button"; // UI コンポーネントの例
import { useActionState } from "react"; // React 19 フックを使用

type Props = { meeting: Meeting };

export function ArchiveButton({ meeting }: Props) {
  const [optimisticMeeting, setOptimisticMeeting] = useOptimistic(
    meeting,
    (currentMeeting, optimisticValue: boolean) => ({
      ...currentMeeting,
      isArchived: optimisticValue,
    })
  );

  // フォーム状態管理に useActionState を使用
  const [state, formAction, isPending] = useActionState(archiveMeeting, null);

  const handleClick = async () => {
    const formData = new FormData();
    formData.append("meetingId", meeting.id);

    // UI を即座にオプティミスティックに更新
    setOptimisticMeeting(true);

    // formAction を介してサーバーアクションを呼び出す
    formAction(formData);

    // 注: エラー処理 / 元に戻すロジックは通常、
    // `useActionState` によって返される `state` に基づいて管理されます。
    // state が失敗を示している場合は、setOptimisticMeeting(false) を呼び出す場合があります
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {" "}
      {/* ボタンクリックを使用する場合はデフォルトを防止 */}
      <Button
        onClick={handleClick}
        disabled={isPending || optimisticMeeting.isArchived}
        variant="destructive"
      >
        {isPending
          ? "Archiving..."
          : optimisticMeeting.isArchived
          ? "Archived"
          : "Archive"}
      </Button>
      {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
    </form>
  );
}
```

---

このドキュメントは、prj-s-demo のアーキテクチャに関する **唯一の** 正式なリファレンスとなることを目的としています。新しい開発者を導き、コードレビューアのチェックリストとして機能し、自動化されたアーキテクチャテストの基礎を形成する必要があります。将来の機能がこれらのルールからの逸脱を必要とする場合、その例外は **このファイル内で明示的に正当化され、文書化されなければなりません**。

[1]: https://david-vancouvering.medium.com/applying-solid-principles-to-services-e56ef2382a26?utm_source=chatgpt.com "Applying SOLID principles to services | by David Van Couvering"
[2]: https://solutionsarchitecture.medium.com/code-smells-a-solution-architectss-guide-c58adb3f45d2?utm_source=chatgpt.com "Code Smells: A Solution Architects's Guide - Rahul Krishnan - Medium"
[3]: https://eslint.org/docs/latest/rules/max-lines?utm_source=chatgpt.com "max-lines - ESLint - Pluggable JavaScript Linter"
[4]: https://www.reddit.com/r/SoftwareEngineering/comments/1jp7y1a/service_layer_becoming_too_big_do_you_know/?utm_source=chatgpt.com "'''Service''' layer becoming too big. Do you know another architecture ..."
[5]: https://vercel.com/templates/next.js/nextjs-commerce?utm_source=chatgpt.com "Next.js Commerce - Vercel"
[6]: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations?utm_source=chatgpt.com "Server Actions and Mutations - Data Fetching - Next.js"
[7]: https://medium.com/%40lior_amsalem/nextjs-15-actions-best-practice-bf5cc023301e?utm_source=chatgpt.com "Nextjs 15 — Actions Best Practice | by Lior Amsalem - Medium"
[8]: https://github.com/vercel/next.js/discussions/17218?utm_source=chatgpt.com "Why .next folder is so big? 251MB total #17218 - GitHub"
[9]: https://react.dev/blog/2024/12/05/react-19?utm_source=chatgpt.com "React v19"
