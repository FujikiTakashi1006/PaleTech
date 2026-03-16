---
description: Azure App Service のデプロイログを取得・分析してエラーを特定・解決する
user-invocable: false
---

# Deploy Logs - デプロイログ診断

## 事前チェック

`.claude/skills/scripts/azure-config.json` が存在するか確認する。

### azure-config.json がない場合（初回）

AskUserQuestion で以下を確認する:

1. **App Service 名** (例: prj-azn-val-api)
2. **リソースグループ名** (例: prj-aice)

確認後、`.claude/skills/scripts/azure-config.json` を以下の形式で保存する:

```json
{
  "app_name": "ユーザーの回答",
  "resource_group": "ユーザーの回答"
}
```

> **Note:** deploy スキルで既に作成済みの場合は `registry` フィールドも含まれているが、そのまま使う。

### azure-config.json がある場合

設定内容を表示して、そのまま実行に進む。

## 手順

### 1. ログ取得

```bash
./.claude/skills/deploy-logs/fetch-logs.sh
```

### 2. エラーパターンの特定

出力されたログから以下のパターンを探す:

- `executable file not found` → Dockerfile の CMD/ENTRYPOINT の問題
- `ModuleNotFoundError` → 依存関係のインストール漏れ
- `Connection refused` → ポート設定の不一致
- `OOM` / `Killed` → メモリ不足
- `timeout` → コンテナ起動タイムアウト

### 3. リアルタイムログ（必要に応じて）

```bash
APP_NAME=$(jq -r '.app_name' ./.claude/skills/scripts/azure-config.json)
RESOURCE_GROUP=$(jq -r '.resource_group' ./.claude/skills/scripts/azure-config.json)
az webapp log tail --name "$APP_NAME" --resource-group "$RESOURCE_GROUP"
```
