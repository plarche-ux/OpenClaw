# Config Safety Skill

**Trigger:** Any time you are about to:
- Edit `~/.openclaw/openclaw.json`
- Apply any OpenClaw config changes

**Also trigger on:** Paul saying `/restore-config`, "restore config", "restore my openclaw config", or "which backups do I have"

---

## Pre-Change Checklist (MANDATORY)

Before making ANY of the above changes, run the backup script first:

```bash
~/.openclaw/workspace/scripts/backup-openclaw-config.sh
```

**Do not proceed** until you see:
```
✅ Backup created (Sanitized): ...
✅ Committed to workspace git: config backup ... (sanitized)
```

If the backup script fails, **stop and tell Paul** — do not proceed with the config change.

---

## Safe Gateway Restart Sequence (PM2)

The gateway is now managed by PM2. 

**To apply config changes:**
```bash
pm2 restart openclaw-gateway
```

**If it fails to come online:**
```bash
pm2 logs openclaw-gateway
```

---

## Restore a Backup

### List available backups:
```bash
~/.openclaw/workspace/scripts/restore-openclaw-config.sh
```

### Restore a specific backup:
```bash
~/.openclaw/workspace/scripts/restore-openclaw-config.sh openclaw.json.YYYY-MM-DD-HHmm
```

The restore script will:
1. Save a safety copy of the current (broken) config
2. Restore the chosen backup
3. Print the PM2 restart commands to run

---

## Emergency (Everything down, no Telegram)

Open Terminal and run:
```bash
cat ~/Desktop/RESTORE.txt
```

This file contains all restore and restart instructions in plain English.

---

## Notes
- Backups are stored in: `~/.openclaw/workspace/backups/`
- All backups are committed to the workspace git repo but are **SANITIZED** (API keys replaced with `***REDACTED***`).
- The restore script always saves a safety copy before overwriting.
