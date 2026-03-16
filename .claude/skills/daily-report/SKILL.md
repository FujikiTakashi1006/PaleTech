---
description: 当日の作業内容をgitログ・PR・Issueから自動で日報にまとめる
user-invocable: true
---

# Daily Report - 日報作成

## 手順

### 1. アクティビティ取得

```bash
./.claude/skills/daily-report/fetch-activity.sh
# 日付指定: ./.claude/skills/daily-report/fetch-activity.sh 2026-03-01
```

### 2. 日報にまとめる

取得データを以下のルールで整形する:

- **時系列順**に並べる（リポジトリをまたいでも時間順に統合）
- コミットメッセージは信用しない。**変更ファイル名・パスから作業内容を推測**する
- 同じ機能に対する複数コミットは1項目にまとめる
- 出力は短く。個別ファイルの行数一覧は不要

### 3. 出力フォーマット

Slack mrkdwn 形式でコードブロックに出力する。

```
*YYYY/MM/DD 日報*

*作業内容*
・HH:MM [BE] 作業内容
・HH:MM [FE] 作業内容

*PR*
・【マージ】タイトル
https://github.com/ORG/REPO/pull/番号

*Issue*
・【クローズ】タイトル
https://github.com/ORG/REPO/issues/番号
```

ラベル:
- リポジトリ名に `api` → `BE`
- フロントエンド系 → `FE`
- その他 → リポジトリ名
