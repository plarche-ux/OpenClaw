# BOOT.md — Gateway Startup Checklist

Dev servers are now managed by **PM2** and start automatically on gateway restart and Mac reboot.
No manual startup needed.

## Verify servers are running

```bash
pm2 list
```

Both `brand-value-canvas` (:3000) and `mission-control` (:3001) should show `online`.

## If a server is down

```bash
pm2 restart brand-value-canvas
pm2 restart mission-control
```

## Notify Paul only if restart fails

If `pm2 restart` doesn't bring it online, send a Telegram message:
> "⚠️ [server name] failed to restart. Run: `pm2 logs [server name]` to diagnose."

Silent success = fine. Don't message Paul if everything is running.
