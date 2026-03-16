---
name: deploy
description: ACRビルド＆App Serviceデプロイを実行し、ログで正常起動を確認する
user-invocable: true
---

# Deploy - ビルド＆デプロイ＆確認

## 事前チェック

`.claude/skills/scripts/azure-config.json` が存在するか確認する。

### azure-config.json がない場合（初回）

AskUserQuestion で以下を確認する:

1. **App Service 名** (例: prj-azn-val-api)
2. **リソースグループ名** (例: prj-aice)
3. **ACR レジストリ名** (例: prjaice)

確認後、`.claude/skills/scripts/azure-config.json` を以下の形式で保存する:

```json
{
  "app_name": "ユーザーの回答",
  "resource_group": "ユーザーの回答",
  "registry": "ユーザーの回答"
}
```

### azure-config.json がある場合（2回目以降）

設定内容を表示して、そのまま実行に進む。

## 手順

### 1. デプロイ実行

```bash
./.claude/skills/deploy/deploy.sh
```

- Bash ツールの `timeout` を `600000`（10分）に設定する
- 「デプロイ完了」が出力されれば成功

### 2. コンテナ起動待機

```bash
sleep 120
```

### 3. デプロイログで確認

deploy-logs スキルの手順に従い、ログを取得してコンテナが正常起動したか確認する。

### 4. 音声通知

コンテナ起動確認後、結果を音声で通知する。

```bash
# 成功時
say "コンテナが正常に起動しました。デプロイ完了です。"

# 失敗時
say "コンテナの起動に失敗しました。ログを確認してください。"
```
