#!/bin/bash
# Issue のステータスをポーリングして完了を検知する
# Usage: poll-status.sh <target-status> <interval-sec> <max-retries> <issue番号...>
# Example: poll-status.sh ユーザー確認待ち 60 30 43 46
# Exit 0: 全Issue が target-status に到達
# Exit 1: タイムアウト

set -euo pipefail

TARGET_STATUS="${1:?Usage: poll-status.sh <target-status> <interval> <max-retries> <issue番号...>}"
INTERVAL="${2:?}"
MAX_RETRIES="${3:?}"
shift 3
ISSUES=("$@")

if [ ${#ISSUES[@]} -eq 0 ]; then
  echo "エラー: Issue番号を1つ以上指定してください"
  exit 1
fi

# 定数
PROJECT_OWNER="AICE-inc"
PROJECT_NUMBER=14
REPO="prj-azn-val-api"

TOTAL=${#ISSUES[@]}

# Python用にIssue番号リストを作成
ISSUE_LIST=$(printf ",%s" "${ISSUES[@]}")
ISSUE_LIST="[${ISSUE_LIST:1}]"

echo "対象Issue: ${ISSUES[*]} (${TOTAL}件)"
echo "目標ステータス: $TARGET_STATUS"
echo "確認間隔: ${INTERVAL}秒 × 最大${MAX_RETRIES}回"
echo ""

for i in $(seq 1 "$MAX_RETRIES"); do
  sleep "$INTERVAL"

  DONE=$(gh project item-list "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --limit 200 --format json | python3 -c "
import json,sys
data = json.load(sys.stdin)
targets = $ISSUE_LIST
done = sum(1 for item in data['items']
           if item.get('status') == '$TARGET_STATUS'
           and item.get('content',{}).get('number') in targets)
print(done)
")

  echo "[$i/$MAX_RETRIES] 完了: $DONE/$TOTAL"

  if [ "$DONE" -eq "$TOTAL" ]; then
    echo ""
    echo "✅ 全Issue が '$TARGET_STATUS' に到達しました"
    exit 0
  fi
done

echo ""
echo "⏰ タイムアウト: $DONE/$TOTAL 完了"
exit 1
