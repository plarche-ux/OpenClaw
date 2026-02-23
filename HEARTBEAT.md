# HEARTBEAT.md

## Maintenance Tasks (run every heartbeat)

### QMD Memory Sync
Run the following to keep memory indexed and searchable after every session:
```
XDG_CONFIG_HOME=~/.openclaw/agents/main/qmd/xdg-config XDG_CACHE_HOME=~/.openclaw/agents/main/qmd/xdg-cache qmd update 2>&1 | tail -3
XDG_CONFIG_HOME=~/.openclaw/agents/main/qmd/xdg-config XDG_CACHE_HOME=~/.openclaw/agents/main/qmd/xdg-cache qmd embed 2>&1 | tail -3
```
Only notify Paul if there are errors. Silent success = fine.

## Periodic Checks (rotate, 2-4x per day)
- Email: Any urgent unread?
- Calendar: Events in next 24-48h?
- Amazon Ads: Any alerts from the skill?
- LinkedIn: Any pending posts due today?

## Reminder
Silent success on QMD sync is fine — only notify Paul on errors.
