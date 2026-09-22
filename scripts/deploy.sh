#!/usr/bin/env bash
# Собирает статический сайт и публикует его в ветку gh-pages (GitHub Pages).
set -euo pipefail
cd "$(dirname "$0")/.."
REPO_NAME="${GITHUB_REPO_NAME:-prime-health}"
GITHUB_PAGES=true GITHUB_REPO_NAME="$REPO_NAME" npx next build
touch out/.nojekyll
cd out
rm -rf .git
git init -q -b gh-pages
git add -A
git -c user.name="deploy" -c user.email="deploy@local" commit -q -m "deploy $(date '+%Y-%m-%d %H:%M')"
git push -f "$(cd .. && git remote get-url origin)" gh-pages:gh-pages
cd ..
rm -rf out/.git
echo "Опубликовано: https://$(git remote get-url origin | sed -E 's#.*github.com[:/]([^/]+)/([^/.]+)(\.git)?#\1.github.io/\2#')/"
