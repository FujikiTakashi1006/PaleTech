#!/bin/bash
# GitHub Projects のステータスを更新する
# Usage: update-status.sh <issue番号> <ステータス名>
# Example: update-status.sh 42 実装中

set -euo pipefail

ISSUE_NUMBER="${1:?Usage: update-status.sh <issue番号> <ステータス名>}"
STATUS_NAME="${2:?Usage: update-status.sh <issue番号> <ステータス名>}"

# 定数
PROJECT_OWNER="AICE-inc"
PROJECT_NUMBER=14
REPO="prj-azn-val-api"

# 1. Project ID と Status フィールド情報を GraphQL で取得
QUERY='
query($owner: String!, $number: Int!) {
  organization(login: $owner) {
    projectV2(number: $number) {
      id
      field(name: "Status") {
        ... on ProjectV2SingleSelectField {
          id
          options { id name }
        }
      }
    }
  }
}'

PROJECT_DATA=$(gh api graphql -f query="$QUERY" -F owner="$PROJECT_OWNER" -F number="$PROJECT_NUMBER")

PROJECT_ID=$(echo "$PROJECT_DATA" | jq -r '.data.organization.projectV2.id')
FIELD_ID=$(echo "$PROJECT_DATA" | jq -r '.data.organization.projectV2.field.id')

# 2. ステータス名から option-id を解決
OPTION_ID=$(echo "$PROJECT_DATA" | jq -r --arg name "$STATUS_NAME" \
  '.data.organization.projectV2.field.options[] | select(.name == $name) | .id')

if [ -z "$OPTION_ID" ]; then
  echo "エラー: ステータス '$STATUS_NAME' が見つかりません"
  echo "利用可能なステータス:"
  echo "$PROJECT_DATA" | jq -r '.data.organization.projectV2.field.options[].name'
  exit 1
fi

# 3. Issue の Item ID を取得
ITEM_ID=$(gh project item-list "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --limit 200 --format json | python3 -c "
import json,sys
data = json.load(sys.stdin)
for item in data['items']:
    c = item.get('content', {})
    if c.get('number') == $ISSUE_NUMBER and '$REPO' in c.get('repository',''):
        print(item['id']); break
")

if [ -z "$ITEM_ID" ]; then
  # Project に未追加の場合は追加
  echo "Issue #$ISSUE_NUMBER を Project に追加中..."
  gh project item-add "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" \
    --url "https://github.com/$PROJECT_OWNER/$REPO/issues/$ISSUE_NUMBER"

  ITEM_ID=$(gh project item-list "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --limit 200 --format json | python3 -c "
import json,sys
data = json.load(sys.stdin)
for item in data['items']:
    c = item.get('content', {})
    if c.get('number') == $ISSUE_NUMBER and '$REPO' in c.get('repository',''):
        print(item['id']); break
")
fi

# 4. ステータスを更新
gh project item-edit --project-id "$PROJECT_ID" --id "$ITEM_ID" \
  --field-id "$FIELD_ID" --single-select-option-id "$OPTION_ID"

echo "✅ Issue #$ISSUE_NUMBER → $STATUS_NAME"
