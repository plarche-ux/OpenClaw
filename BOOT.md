# BOOT.md — Gateway Startup Checklist

Runs automatically on gateway restart. Keep this short.

## 1. Start Mission Control

```bash
pkill -f "next dev -p 3001" 2>/dev/null; sleep 1
cd /Users/paul/.openclaw/workspace/projects/mission-control && npm run dev &
```

Wait ~5 seconds, then verify it responds at http://localhost:3001.

## 2. Skip Brand Value Canvas

Only start it if Paul asks — it's not needed at all times.

## 3. Notify Paul (only if startup fails)

If Mission Control doesn't respond after 10 seconds, send a Telegram message:
> "⚠️ Mission Control failed to start after gateway restart. Run: `cd projects/mission-control && npm run dev`"

Silent success = fine. Don't message Paul if everything started cleanly.
