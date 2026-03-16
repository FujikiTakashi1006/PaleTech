#!/bin/bash
# 当日の GitHub アクティビティを取得する
# Usage: fetch-activity.sh [YYYY-MM-DD]
# 引数なしの場合は今日の日付を使用

set -euo pipefail

DATE="${1:-$(date +%Y-%m-%d)}"

# ユーザー名と org を自動検出
USER=$(gh api user --jq '.login')
ORG=$(gh repo view --json owner --jq '.owner.login' 2>/dev/null || echo "")

if [ -z "$ORG" ]; then
  echo "エラー: org を検出できません。GitHub リポジトリ内で実行してください"
  exit 1
fi

echo "=== $DATE のアクティビティ ($USER@$ORG) ==="
echo ""

# 1. コミット
echo "--- COMMITS ---"
COMMITS=$(gh api "search/commits?q=author:$USER+org:$ORG+committer-date:$DATE&sort=committer-date&per_page=30" \
  --jq '.items[] | "\(.repository.full_name)|\(.sha[:7])|\(.commit.message | split("\n")[0])"' 2>/dev/null || echo "")

if [ -z "$COMMITS" ]; then
  echo "(なし)"
else
  echo "$COMMITS"

  # コミットがあったリポジトリでローカルログ取得（時刻付き）
  echo ""
  echo "--- LOCAL LOGS ---"
  REPOS=$(echo "$COMMITS" | cut -d'|' -f1 | sort -u | sed "s|$ORG/||")
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  REPO_BASE="$(cd "$SCRIPT_DIR/../../.." && pwd)"

  for REPO in $REPOS; do
    REPO_PATH="$REPO_BASE/../$REPO"
    if [ -d "$REPO_PATH/.git" ]; then
      echo "[$REPO]"
      git -C "$REPO_PATH" log --since="$DATE 00:00" --until="$DATE 23:59:59" --all \
        --format="%ad|%h|%s" --date=format:"%H:%M" --name-only 2>/dev/null || echo "(取得失敗)"
      echo ""
    fi
  done
fi

# 2. PR
echo "--- PRS ---"
gh api "search/issues?q=author:$USER+org:$ORG+type:pr+updated:$DATE&per_page=10" \
  --jq '.items[] | "\(.repository_url | split("/")[-2:]|join("/"))|PR#\(.number)|\(.title)|\(.state)"' 2>/dev/null || echo "(なし)"

echo ""

# 3. Issue
echo "--- ISSUES ---"
gh api "search/issues?q=author:$USER+org:$ORG+type:issue+updated:$DATE&per_page=10" \
  --jq '.items[] | "\(.repository_url | split("/")[-2:]|join("/"))|#\(.number)|\(.title)|\(.state)"' 2>/dev/null || echo "(なし)"
