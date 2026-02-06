#!/bin/bash
# sync_tsumego.sh - Update Daily Tsumego and push to GitHub

# Set path to project
PROJECT_DIR="/Users/aliguli/Documents/iProject/AppShowcase"
LOG_FILE="/Users/aliguli/clawd/memory/tsumego_sync.log"

echo "--- Syncing Tsumego at $(date) ---" >> "$LOG_FILE"

cd "$PROJECT_DIR" || exit

# Run fetch script
node scripts/fetch_tsumego.js >> "$LOG_FILE" 2>&1

# Git sync
git add data/tsumego.json data/sgf/*.sgf
if ! git diff-index --quiet HEAD --; then
    git commit -m "🤖 每日一题自动更新: $(date +'%Y-%m-%d')" >> "$LOG_FILE" 2>&1
    git push origin main >> "$LOG_FILE" 2>&1
    echo "✅ Changes pushed to GitHub." >> "$LOG_FILE"
else
    echo "No changes in tsumego data." >> "$LOG_FILE"
fi

echo "--- Sync completed at $(date) ---" >> "$LOG_FILE"
