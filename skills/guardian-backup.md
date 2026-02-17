---
name: guardian-backup
description: Manages critical backups of OpenClaw config and workspace files. Provides clear recovery instructions.
metadata: { "openclaw": { "emoji": "🛡️" } }
---

# Guardian Backup

This skill ensures you never lose your progress. It manages a local `backups/` directory and provides recovery steps.

## 1. Automated Backups
I will perform a full workspace and config backup every time you say "Guardian Backup" or during my nightly routine.

## 2. Manual Backup Command
```bash
# @use-tool: exec
mkdir -p backups
cp /Users/paul/.openclaw/openclaw.json backups/openclaw.json.bak
cp -R /Users/paul/.openclaw/workspace backups/workspace_backup
echo "Backup created on $(date)" > backups/README.md
```

## 3. Recovery Instructions
If I "freeze" or "crash," follow these steps on your Mac Mini:

### Level 1: The Soft Reset
Try restarting the gateway service:
`openclaw gateway restart`

### Level 2: The Config Restore
If I won't start due to a config error, restore your last good settings:
`cp ~/.openclaw/workspace/backups/openclaw.json.bak ~/.openclaw/openclaw.json && openclaw gateway restart`

### Level 3: The Full Revert
If my "brain" (workspace) is corrupted, restore the backup:
`rm -rf ~/.openclaw/workspace/* && cp -R ~/.openclaw/workspace/backups/workspace_backup/* ~/.openclaw/workspace/ && openclaw gateway restart`
