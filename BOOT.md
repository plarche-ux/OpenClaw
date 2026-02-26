# BOOT.md — Gateway Startup Checklist

Dev servers and the Gateway are now managed by **PM2** and start automatically on Mac reboot.
No manual startup needed.

## Verify servers are running

```bash
pm2 list
```

All three should show `online`:
1. `openclaw-gateway` (:18789)
2. `brand-value-canvas` (:3000)
3. `mission-control` (:3001)

## If a server is down

```bash
pm2 restart [name]
```

## Notify Paul only if restart fails

If `pm2 restart` doesn't bring it online, send a Telegram message:
> "⚠️ [server name] failed to restart. Run: `pm2 logs [server name]` to diagnose."

Silent success = fine. Don't message Paul if everything is running.

If BOOT.md asks you to send a message, use the message tool (action=send with channel + target).
Use the `target` field (not `to`) for message tool destinations.
After sending with the message tool, reply with ONLY: NO_REPLY.
If nothing needs attention, reply with ONLY: NO_REPLY.
