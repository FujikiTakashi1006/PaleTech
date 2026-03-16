#!/bin/bash
# 指定ステータスの Issue を取得する
# Usage: get-issues.sh <ステータス名>
# Example: get-issues.sh 依頼済み
# Output: 1行1Issue "番号 タイトル" 形式

set -euo pipefail

STATUS_NAME="${1:?Usage: get-issues.sh <ステータス名>}"

# 定数
PROJECT_OWNER="AICE-inc"
PROJECT_NUMBER=14
REPO="prj-azn-val-api"

gh project item-list "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --limit 200 --format json | python3 -c "
import json,sys
data = json.load(sys.stdin)
for item in data['items']:
    s = item.get('status','')
    c = item.get('content', {})
    if s == '$STATUS_NAME' and '$REPO' in c.get('repository',''):
        print(f'{c[\"number\"]} {c[\"title\"]}')
"
