# OpenClaw Recovery SOP
## What to Do When Neo Goes Down

---

## 🟢 Step 1: Check if the Gateway is Running
Open Terminal on the Mac Mini and run:
```
openclaw gateway status
```
- If it says **"running"** → the gateway is fine. The issue is elsewhere (likely a model auth error). Check Step 3.
- If it says **"not running"** → proceed to Step 2.

---

## 🔄 Step 2: Restart the Gateway
Run this **single command** (do NOT use kill or force):
```
openclaw gateway restart
```
Wait 10-15 seconds, then send "hello" in Telegram to test.

If that fails, try:
```
openclaw gateway stop
openclaw gateway start
```

---

## 🔑 Step 3: Check for Auth/API Key Issues
If the gateway is running but Neo isn't responding or is using the wrong model, check the error log:
```
tail -n 30 ~/.openclaw/logs/gateway.log
```
Look for lines containing `"No API key found"` or `"UNAVAILABLE"`.

If you see auth errors → the session model override was lost. Send this message in Telegram:
```
use sonnet
```
Neo will re-apply the Sonnet 4.6 override for the current session.

---

## 🔍 Step 4: Check the Brave Search Key
If web search is broken, the Brave API key may have expired. To re-apply:
```
openclaw config set tools.web.search.apiKey <YOUR_KEY>
openclaw gateway restart
```
Current key stored in: `~/.openclaw/openclaw.json`

---

## 📋 Key File Locations
| File | Purpose |
|---|---|
| `~/.openclaw/logs/gateway.log` | Main gateway log |
| `~/.openclaw/logs/gateway.err.log` | Error log |
| `~/.openclaw/openclaw.json` | Main config (API keys, model settings) |
| `~/.openclaw/agents/main/agent/auth-profiles.json` | Model API keys (Anthropic, etc.) |
| `~/.openclaw/workspace/memory/` | Neo's memory files |

---

## 🚨 Emergency: Full Reset
Only use this if all else fails:
```
openclaw gateway stop
openclaw gateway start
```
Then send "hello" in Telegram and wait 30 seconds.

---

*Last updated: 2026-02-21*
