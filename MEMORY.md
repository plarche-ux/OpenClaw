# Long-Term Memory

## System
- Running on: Mac Mini M4, 32 GB
- OpenClaw: native install with launchd daemon (v2026.2.21-2)
- Execution sandbox: OrbStack (Docker) for agent-generated code
- Models: Gemini 3 Flash (main/general, alias: gemini-flash), Gemini 3.1 Pro (on-demand, alias: gemini-3.1), Kimi K2.5 (coding/complex, alias: kimi), MiniMax M2.5 (coding/fallback, alias: minimax), Claude Sonnet 4.6 (on-demand, alias: sonnet), GPT-5.2 (on-demand, alias: gpt5), Ollama qwen3:30b (heartbeats/local, alias: local-heavy), Ollama qwen2.5:14b (local fallback, alias: local-medium), Ollama llama3.2:3b (triage)
- **Model aliases:** gemini-flash=gemini-3-flash-preview, gemini-3.1=gemini-3.1-pro-preview, kimi=kimi-k2.5, minimax=minimax-2.5, Minimax=MiniMax-M2.5, sonnet=claude-sonnet-4-6, gpt5=gpt-5.2, triage=llama3.2:3b, local-medium=qwen2.5:14b, local-heavy=qwen3:30b
- **Model routing (updated 2026-02-22):** Main agent=gemini-flash; Heartbeats=qwen3:30b (local/free); Fallbacks=minimax→qwen2.5:14b; Coding/complex=kimi or MiniMax (manual/sub-agent); On-demand: gemini-3.1, sonnet, gpt5
- **Cron routing:** Daily Memory Maintenance → ollama/qwen3:30b; Book Sales Intelligence → moonshot/kimi-k2.5; Morning Briefing → main/Gemini 3.1
- **⚠️ Gateway reload:** Do NOT use `kill -HUP` or `launchctl bootout`. Safe command: `openclaw gateway restart`. `com.openclaw.backup` LaunchAgent removed to prevent admin dialogs.
- Remote access: Jump Desktop (primary), Tailscale (not yet configured)
- Primary interface: Telegram (streaming: true)

## Book: The Divided Brain
- Full title: "The Divided Brain: Behavioral Psychology for Better Decision Making"
- BookLife Prize: 10/10 rating, Editor's Pick 2025
- Core concept: The "Old Brain" (emotional, instinctive) drives decisions; the "New Brain" (logical, analytical) rationalizes them after the fact
- Manuscript: memory/reference/the-divided-brain.md
- Branding rules: memory/reference/divided-brain-branding.md

## Active Skills
- **Claude Code:** Installed natively at `~/.local/bin/claude`. To use: `cd /opt/homebrew/lib/node_modules/openclaw && claude`. Auth conflict warning is harmless.
- **Firebase CLI:** v15.7.0 installed globally via npm. Authenticated with Larche Communications Google account.
- **QMD:** Active memory daemon. 40 files, 410 vectors. Collections: memory-root-main, memory-alt-main, memory-dir-main, sessions-main. Config: `memory.backend = "qmd"`, `searchMode = "query"`, `update.interval = "3m"` in `~/.openclaw/openclaw.json`. XDG paths: `~/.openclaw/agents/main/qmd/`.

## Amazon Ads
- **Last audit (Feb 22, 2026):** $116.66 spend / $3.99 sales / 2923% ACoS over 30 days
- **Surgical cuts applied (Feb 21):** Paused "branding" keyword; added "decision making" + "behavioral psychology"
- **Attribution lag:** 24-48h — next meaningful data check: Mon Feb 23
- **Dashboard:** https://docs.google.com/spreadsheets/d/1AcEqHFvH87X2DDXwWnS3O05Ewqp02HoBpUWaMTCh7pY
- **SOP:** `skills/amazon-handshake-sop.md`

## Projects
- **Brand Value Canvas v2:** React/Vite/TS app. Source: `projects/brand-value-canvas-v2/`. Dev server: `http://192.168.1.205:3000`. Deployed: `https://brand-value-canvas-nzg44.web.app`. Live on paullarche.com via iframe. GitHub: `https://github.com/plarche-ux/brand-value-canvas-v2`. Gemini API key in `.env.local`. Uses `gemini-3-flash-preview` (keeping for cost reasons). Divided Brain branding applied. Section spacing FIXED. PENDING: `overflow-hidden` on sidebar wrappers (lines 242, 285, 307, 329 in Canvas.tsx).
- **Mission Control:** Next.js 16 dashboard app. Source: `projects/mission-control/`. Dev server: `http://192.168.1.205:3001`. Light theme, slate sidebar. 9 sections: Dashboard, Docs, Memory, Tasks, Tools, Amazon Ads, LinkedIn, System, Team. 6 API routes reading live from workspace. `next.config.ts` has `allowedDevOrigins: ['192.168.1.205']` — do NOT change. Restart dev server if down: `cd projects/mission-control && npm run dev`.
- **Brand Value Canvas Code:** Saved permanently at `memory/projects/brand-value-canvas-code.md`.

## People
- (Add key contacts here as needed)

## Decisions
- **Writing Rule (2026-02-22):** NEVER use em dashes (—) in generated copy, descriptions, or social posts. Paul considers them a dead giveaway of AI generation.
- **Memory Optimization (2026-02-22):** Compaction now fires at 120k tokens (was 180k). Memory flush at 100k tokens (was 176k). QMD searchMode = "query" (reranking enabled). QMD syncs every 3 min. Research doc: `memory/reference/memory-optimization.md`.
- **Post-Compaction Protocol (2026-02-22):** `WORKFLOW_AUTO.md` created — forces memory search + process check before any action after reset. Heartbeat now runs `qmd update && qmd embed` every cycle.
- **Model Upgrade (2026-02-20):** Transitioned primary operations to Claude Sonnet 4.6 for enhanced reasoning and context handling.
- **Search Configuration (2026-02-20):** Fixed Brave Search integration by resolving API key subscription errors and hard-coding keys in config.
- **Main Agent Model (2026-02-21):** Switched main agent from Gemini 3 Flash → `google/gemini-3.1-pro-preview` (alias: gemini-3.1).
- **Site Rebuild (2026-02-21):** paullarche.com audit completed; 6 marketing gaps found; Paul open to full rebuild — subagent audit planned as next step.
- **KDP Optimization (2026-02-21):** Applied new categories (Consumer Behavior, Applied Psychology, Decision-Making), 7 backend keywords, new Cialdini-positioning description. Primary marketplace: Amazon.com.
- **Cron Configuration (2026-02-21):** Fixed delivery issues by adding `"channel": "last"` and `bestEffort` to crons.
- **API Keys (2026-02-21):** Replaced invalid MiniMax key. Perplexity key still returning 401; fresh key required.

## Pending Actions
### Immediate
- **AGENTS.md rewrite**: Needs Paul's answers to 2 questions before proceeding:
  1. Keep "read these files every session" startup instruction OR replace with "search QMD for context before acting"?
  2. Is `memory/heartbeat-state.json` actively used? Keep or drop that heartbeat tracking section?
- **Brand Value Canvas sidebar bleed**: Add `overflow-hidden` to sidebar wrapper divs at lines 242, 285, 307, 329 in Canvas.tsx
- **Ollama update**: Upgrade to v0.16.3 + pull Qwen3 (deferred by Paul)
- **Gemini API billing cap**: Set daily quota in Google Cloud Console

### KDP (Completed Feb 22)
- ✅ New A10-optimized description applied (no em dashes, Cialdini positioning)
- ✅ 7 backend keywords updated
- ✅ Categories applied
- ✅ Brand Value Canvas deployed to Firebase + live on paullarche.com

### Other Pending
- **Perplexity API key**: Still 401 — get fresh key from perplexity.ai/settings/api
- **Speaking + About page**: Rewrite in Elementor
- **Website copy**: Apply hero headline, sub-headline, CTA, BookLife badge, Cialdini line in Elementor
- **Lead magnet**: Create Brand Value Canvas PDF → email opt-in (needs email platform connected)
- **LinkedIn posts**: #2 (Thu – scarcity/loss aversion) and #3 (Sat – archetypes) still to draft
- **Site audit**: Full paullarche.com audit + possible rebuild — subagent (Gemini 3.1) planned
- **Feb 23 reminders**: Paperback KDP + IngramSpark/ACX/Draft2Digital updates (crons set)
- **March 3 reminder**: Evaluate Hannah Stevenson outreach re: KDP rank improvement (cron set)

## KDP Notes (Feb 22)
- KDP keyword slots: 7 slots, MAX 50 characters each. No commas needed — Amazon mixes words automatically.
- Kindle eBook category tree DIFFERS from Paperback tree. Medical eBooks has no Psychology subcategory.
- Best Kindle categories: Business & Money > Consumer Behavior, Business & Money > Decision Making, Medical Books > Psychology > Applied Psychology
- A10 algorithm: Natural language descriptions win; keyword stuffing hurts. Off-Amazon signals (website, LinkedIn) factor into organic rank.

## Lessons Learned
- **Memory Amnesia Fix (2026-02-22):** Root cause was flush triggering at 176k tokens (too late). Fixed via config + WORKFLOW_AUTO.md. If I redo completed work, check daily notes for "DO NOT redo" flags before acting.
- **Dev Server Restart (2026-02-22):** Gateway restart kills all background exec sessions including dev servers. Always check `process(action=list)` after a gateway restart and bring servers back up.
- **Calendar Verification (2026-02-19):** Always verify live calendar via `gog` CLI rather than relying on cached briefs.
- **Technical Fix (2026-02-19):** PATH issues resolved by explicitly pointing to `/opt/homebrew/Cellar/node@22/22.22.0/bin/node` for `gog` and node commands.
- **LinkedIn Post Pipeline (2026-02-21):** Tracked in `memory/projects/linkedin-pipeline.csv` — always check before generating a new post. Google Sheet: `https://docs.google.com/spreadsheets/d/18x3Xd5oklGNgcZw-1sFSSiuKGHCoETbikyZ_BAR1MhY`.
- **Branding Rules (2026-02-21):** Visual DNA in `memory/reference/divided-brain-branding.md`. Face silhouette always points LEFT; Large Gear = Old Brain (dominant); Small Gear = New Brain. Assets in Google Drive: `1eslLIjy1K25e4igHmILTNjRWGkg5G-zd`.
- **Amazon Ads Configuration (2026-02-21):** Whitelisted redirect URI `https://paullarche.com`. 30-day audit revealed 2923% ACoS; surgical cuts applied. SOP: `skills/amazon-handshake-sop.md`.
- **Book Sales Intelligence (2026-02-21):** Recurring subagent (every 3 days) researches Amazon algorithm trends for The Divided Brain.
- **Apple Watch Shortcut (2026-02-21):** URL scheme to trigger OpenClaw: `https://t.me/plarche1Bot?text=[Input]`.
