#!/bin/bash
# restore-openclaw-config.sh
# Restores a backed-up openclaw.json to the active config location.
# Run with no arguments to list available backups.
# Run with a filename to restore that backup.

WORKSPACE="$HOME/.openclaw/workspace"
BACKUP_DIR="$WORKSPACE/backups"
CONFIG_DEST="$HOME/.openclaw/openclaw.json"

# --- List mode (no arguments) ---
if [ -z "$1" ]; then
  echo "Available openclaw.json backups (newest first):"
  echo ""
  count=1
  for f in $(ls -t "$BACKUP_DIR"/openclaw.json.* 2>/dev/null); do
    filename=$(basename "$f")
    timestamp=$(echo "$filename" | sed 's/openclaw.json.//')
    echo "  $count) $filename  ($timestamp)"
    count=$((count + 1))
  done

  if [ $count -eq 1 ]; then
    echo "  (no backups found in $BACKUP_DIR)"
  fi

  echo ""
  echo "To restore a backup, run:"
  echo "  $WORKSPACE/scripts/restore-openclaw-config.sh <filename>"
  echo ""
  echo "Example:"
  echo "  $WORKSPACE/scripts/restore-openclaw-config.sh openclaw.json.2026-02-24-1205"
  exit 0
fi

# --- Restore mode ---
BACKUP_FILE="$BACKUP_DIR/$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ ERROR: Backup not found: $BACKUP_FILE"
  echo ""
  echo "Run with no arguments to list available backups:"
  echo "  $WORKSPACE/scripts/restore-openclaw-config.sh"
  exit 1
fi

# Safety copy of current config before overwriting
SAFETY_BACKUP="$BACKUP_DIR/openclaw.json.pre-restore-$(date +"%Y-%m-%d-%H%M")"
cp "$CONFIG_DEST" "$SAFETY_BACKUP"
echo "✅ Safety backup of current config saved: $(basename $SAFETY_BACKUP)"

# Restore
cp "$BACKUP_FILE" "$CONFIG_DEST"
echo "✅ Restored: $1 → $CONFIG_DEST"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  NEXT STEP: Restart the gateway"
echo ""
echo "  Run this in Terminal:"
echo "  openclaw gateway stop && sleep 2 && openclaw gateway start"
echo ""
echo "  Or if that fails:"
echo "  launchctl bootout gui/\$UID/ai.openclaw.gateway"
echo "  sleep 2"
echo "  launchctl bootstrap gui/\$UID ~/Library/LaunchAgents/ai.openclaw.gateway.plist"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
