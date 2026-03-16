---
name: auto-implement
description: 依頼済みIssueを一括取得し、Agent Teamで並列に自動実装する
user-invocable: true
---

# Auto Implement - 依頼済みIssueの一括自動実装

引数なしで実行する。GitHub Projects の「依頼済み」ステータスの Issue を全て取得し、Agent Team で並列に実装する。

## 手順

### 1. 依頼済み Issue の取得

```bash
./.claude/skills/scripts/get-issues.sh 依頼済み
```

依頼済み Issue が0件の場合はその旨をユーザーに報告して終了する。

### 2. Agent Team の起動

各 Issue はブランチを切って作業するため、常に並列実行可能。

1. **TeamCreate** でチームを作成
2. 依頼済み Issue ごとに **Agent ツール** でメンバーを起動:
   - `isolation: "worktree"` — git worktree で隔離
   - `run_in_background: true` — バックグラウンド実行
   - 各メンバーに `/implement-issue <issue番号>` を実行させる

```
Agent(
  subagent_type: "general-purpose",
  isolation: "worktree",
  run_in_background: true,
  prompt: "Skill implement-issue を使って Issue #<番号> を実装してください。手順1〜9を全て実行すること。"
)
```

### 3. 質問の中継（ハイブリッド方式）

エージェントが実装中に仕様の不明点や判断が必要な事項に遭遇した場合、チームリード（自分）に SendMessage で質問が届く。

**チームリードの対応:**
1. エージェントからの質問メッセージを受信する
2. `say "質問です" &` で音声通知する
3. AskUserQuestion でユーザーに質問を中継する
4. ユーザーの回答を SendMessage でエージェントに返す

### 4. 定期確認 & 進捗報告

ポーリングはバックグラウンドで実行しつつ、**ユーザーには定期的に進捗を報告する**。

```bash
# バックグラウンドでポーリング開始
./.claude/skills/scripts/poll-status.sh ユーザー確認待ち 60 30 <issue番号...>
```

**ポーリング結果を確認するたびに、各 Issue の現在のステータスをユーザーに報告する。**

報告例:
```
#53 実装中 — ブランチ作成済み、コード修正中
#54 Geminiレビュー待ち — PR作成済み、レビュー待ち
#55 依頼済み — まだ着手されていません
```

- 全 Issue が「ユーザー確認待ち」になったら完了と判断
- 最大30分まで確認、超えたらタイムアウト報告

### 5. 完了報告 & クリーンアップ

全エージェント完了後:
1. 各 Issue の PR URL とレビュー対応状況をまとめて報告
2. **TeamDelete** でチームをクリーンアップ

タイムアウト時:
1. 完了した Issue と未完了の Issue を分けて報告
2. 未完了の Issue は手動確認を依頼
3. TeamDelete でクリーンアップ
