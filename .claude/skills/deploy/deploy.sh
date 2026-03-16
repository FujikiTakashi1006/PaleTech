#!/bin/bash
# Azure App Service コンテナデプロイスクリプト
# config.json から設定を読み込み、タグを自動インクリメントしてデプロイする

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../scripts/azure-config.json"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "エラー: $CONFIG_FILE が見つかりません"
  echo "/deploy または /deploy-logs を実行して設定を作成してください"
  exit 1
fi

# config.json から設定を読み込み
APP_NAME=$(jq -r '.app_name' "$CONFIG_FILE")
RESOURCE_GROUP=$(jq -r '.resource_group' "$CONFIG_FILE")
REGISTRY=$(jq -r '.registry' "$CONFIG_FILE")

echo "=== デプロイ設定 ==="
echo "App Service: $APP_NAME"
echo "リソースグループ: $RESOURCE_GROUP"
echo "レジストリ: $REGISTRY"
echo ""

# 現在のタグを取得
CURRENT=$(az webapp config container show \
  --name "$APP_NAME" --resource-group "$RESOURCE_GROUP" \
  --query "[?name=='DOCKER_CUSTOM_IMAGE_NAME'].value" -o tsv \
  | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+')

if [ -z "$CURRENT" ]; then
  echo "エラー: 現在のタグを取得できませんでした"
  exit 1
fi

# パッチ番号を+1
NEW_TAG=$(echo "$CURRENT" | awk -F. "{print \$1\".\"\$2\".\"\$3+1}")

echo "現在: $CURRENT → 新規: $NEW_TAG"
echo ""

# ACRビルド
echo "=== ACR ビルド開始 ==="
az acr build --registry "$REGISTRY" --image "$APP_NAME:$NEW_TAG" .

# App Service 更新
echo "=== App Service 更新 ==="
az webapp config container set \
  --name "$APP_NAME" --resource-group "$RESOURCE_GROUP" \
  --container-image-name "$REGISTRY.azurecr.io/$APP_NAME:$NEW_TAG"

echo ""
echo "デプロイ完了: $NEW_TAG"

# 音声で通知
say "デプロイが完了しました。バージョン ${NEW_TAG} です。" &
