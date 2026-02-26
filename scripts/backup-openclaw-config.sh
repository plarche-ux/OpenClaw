#!/bin/bash
# backup-openclaw-config.sh
# Creates a timestamped, sanitized backup of openclaw.json and commits it to git.

set -e

CONFIG_SRC="$HOME/.openclaw/openclaw.json"
WORKSPACE="$HOME/.openclaw/workspace"
BACKUP_DIR="$WORKSPACE/backups"
TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
BACKUP_FILE="$BACKUP_DIR/openclaw.json.$TIMESTAMP"

# --- Sanity checks ---
if [ ! -f "$CONFIG_SRC" ]; then
  echo "❌ ERROR: $CONFIG_SRC not found. Nothing to back up."
  exit 1
fi

if [ ! -d "$WORKSPACE/.git" ]; then
  echo "❌ ERROR: Workspace git repo not found at $WORKSPACE"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

# --- Copy and Sanitize ---
# Replaces all "apiKey" values with "***REDACTED***" to prevent leaking secrets to GitHub
jq 'walk(if type == "object" and has("apiKey") then .apiKey = "***REDACTED***" else . end)' "$CONFIG_SRC" > "$BACKUP_FILE"

echo "✅ Backup created (Sanitized): $BACKUP_FILE"

# --- Commit ---
cd "$WORKSPACE"
git add "backups/openclaw.json.$TIMESTAMP"
git commit -m "config backup: pre-change snapshot $TIMESTAMP (sanitized)" --quiet
echo "✅ Committed to workspace git: config backup $TIMESTAMP"
echo ""
echo "To restore this snapshot:"
echo "  $WORKSPACE/scripts/restore-openclaw-config.sh openclaw.json.$TIMESTAMP"
