#!/bin/bash
# Azure App Service のデプロイログを取得する
# 共有の azure-config.json から設定を読み込む
# Usage: fetch-logs.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../scripts/azure-config.json"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "エラー: $CONFIG_FILE が見つかりません"
  echo "/deploy または /deploy-logs を実行して設定を作成してください"
  exit 1
fi

APP_NAME=$(jq -r '.app_name' "$CONFIG_FILE")
RESOURCE_GROUP=$(jq -r '.resource_group' "$CONFIG_FILE")

echo "=== ログ取得: $APP_NAME ==="

# 1. ログの有効化
az webapp log config \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --docker-container-logging filesystem \
  --output none

# 2. ログのダウンロード
az webapp log download \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --log-file /tmp/app-service-logs.zip

# 3. 解凍
rm -rf /tmp/app-service-logs
unzip -o /tmp/app-service-logs.zip -d /tmp/app-service-logs > /dev/null

# 4. Docker ログの直近100行を表示
echo ""
echo "=== Docker ログ（直近100行）==="
DOCKER_LOG=$(ls -t /tmp/app-service-logs/LogFiles/*docker*.log 2>/dev/null | head -1 || \
             ls -t /tmp/app-service-logs/LogFiles/*_docker.log 2>/dev/null | head -1)

if [ -n "$DOCKER_LOG" ]; then
  tail -100 "$DOCKER_LOG"
else
  echo "Docker ログが見つかりません"
  echo "利用可能なログファイル:"
  ls /tmp/app-service-logs/LogFiles/ 2>/dev/null || echo "(なし)"
fi
