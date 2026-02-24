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
- LinkedIn: Read `memory/linkedin-posts.json`. Check:
  1. Any post with `status: approved` scheduled for today or tomorrow? → Remind Paul to post it.
  2. No post scheduled in the next 2 days AND today is Mon/Wed/Sat (or the day before)? → Notify Paul a new post slot is coming up.
  3. More than 3 days since last published post? → Nudge Paul.

## Reminder
Silent success on QMD sync is fine — only notify Paul on errors.
