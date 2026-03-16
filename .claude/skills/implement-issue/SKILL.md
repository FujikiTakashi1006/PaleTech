---
name: implement-issue
description: GitHub Issueを実装し、ブランチ作成→コミット→PR作成→レビュー対応まで一連の流れを実行する
user-invocable: false
---

# Implement Issue - 単一Issue実装

引数として GitHub Issue 番号または URL を受け取る。

## リポジトリ構成

Issue は `prj-azn-val-api` に集約されているが、実装対象は Issue の内容から判断する。

| リポジトリ | パス | 対象 |
|---|---|---|
| prj-azn-val-api | `/Users/fujikitakashi/Documents/GitHub/prj-azn-val-api` | バックエンド（FastAPI / Python） |
| prj-azn-val | `/Users/fujikitakashi/Documents/GitHub/prj-azn-val` | フロントエンド（Next.js / React） |

## 重要ルール

### ステータス更新は即座に実行すること

各手順に記載された `update-status.sh` は、該当ステップに到達したら**最優先で即座に実行**すること。
ステータスはチームリードやユーザーが進捗を監視する唯一の手段であり、遅延は許容されない。

### チーム実行時の質問ルール（auto-implement 経由の場合）

auto-implement からチームメンバーとして起動された場合、実装中に仕様の不明点や判断が必要な事項が発生したら:

1. **作業を中断する**
2. **SendMessage でチームリードに質問を送る**（チームリードがユーザーに中継する）
3. **チームリードからの回答を待ってから作業を再開する**

AskUserQuestion は直接使用しない（チームメンバーからはユーザーに届かないため）。

## 手順

### 1. Issue内容の確認

```bash
gh issue view <issue番号>
```

Issue のタイトルと本文を読み、実装内容を把握する。

### 2. フィーチャーブランチ作成

```bash
git switch main && git pull origin main
git switch -c feature/<issue-id>-<短い説明>
```

ブランチ名の例: `feature/FB-S1-1-aspect-ratio-lock`

**ブランチ作成直後に必ず以下を実行する（後回し禁止）:**
```bash
# ステータス更新（最優先）
./.claude/skills/scripts/update-status.sh <issue番号> 実装中

# Issue にコメント
gh issue comment <issue番号> --body "🚀 実装開始
ブランチ: \`<ブランチ名>\`
対象リポジトリ: <リポジトリ名>"
```

### 3. 実装

- EnterPlanMode で計画を立ててからコードを書く
- CLAUDE.md のアーキテクチャルールに従う
- 変更は最小限に保つ

### 4. コミット & プッシュ

```bash
git add <変更ファイル>
git commit -m "<type>: <説明> (#<issue番号>)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push -u origin <ブランチ名>
```

### 5. PR作成

```bash
gh pr create --title "<type>: <タイトル>" --body "$(cat <<'EOF'
## Summary
- 変更内容の箇条書き

Closes <org>/<repo>#<issue番号>

## Test plan
- [ ] テスト項目

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"

# ステータス更新
./.claude/skills/scripts/update-status.sh <issue番号> Geminiレビュー待ち
```

- **Closes** で対応する Issue をリンクする
- Issue が別リポジトリの場合は `Closes AICE-inc/<repo>#<番号>` の形式を使う

### 6. Gemini Code Assist のレビュー待ち

PR作成後、2分待ってからレビューを確認する。

```bash
sleep 120

# レビューコメントを確認
gh api repos/<owner>/<repo>/pulls/<PR番号>/comments --jq '.[] | "ID: \(.id)\nBody: \(.body)\n---"'
# PR全体のレビューも確認
gh pr view <PR番号> --json reviews --jq '.reviews[].body'
```

まだレビューが届いていない場合は、さらに1分待って再確認する。最大3回までリトライする。

### 7. レビュー指摘への対応

```bash
./.claude/skills/scripts/update-status.sh <issue番号> Geminiレビュー対応中
```

- 各指摘に対してコードを修正
- 修正をコミット & プッシュ

```bash
git add <修正ファイル>
git commit -m "fix: レビュー指摘対応 - <修正概要>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push
```

### 8. レビューコメントに返信

各レビューコメントに対して、修正内容とコミットURLを返信する。

```bash
gh api repos/<owner>/<repo>/pulls/<PR番号>/comments/<コメントID>/replies \
  -f body="修正内容の説明

修正コミット: https://github.com/<owner>/<repo>/commit/<コミットハッシュ>"
```

### 9. 完了報告

```bash
./.claude/skills/scripts/update-status.sh <issue番号> ユーザー確認待ち
```

ユーザーに以下を報告する:
- PR URL
- レビュー指摘の対応状況
- 残タスクがあれば共有

> **Note:** 「マージ済み」ステータスは、ユーザーが PR を確認・マージした後に設定される。

### ブランチ削除・中止時

ユーザーからブランチ削除やタスク中止を指示された場合:

```bash
git switch main
git branch -D <ブランチ名>

gh issue comment <issue番号> --body "🛑 実装中止
ブランチ \`<ブランチ名>\` を削除しました。"

./.claude/skills/scripts/update-status.sh <issue番号> 依頼待ち
```
