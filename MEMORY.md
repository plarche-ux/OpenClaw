# Long-Term Memory

## System
- Running on: Mac Mini M4, 32 GB
- OpenClaw: native install with launchd daemon (v2026.2.22-2)
- Execution sandbox: OrbStack (Docker) for agent-generated code
- Models: Gemini 3 Flash (main/general, alias: gemini-flash), Gemini 3.1 Pro (on-demand, alias: gemini-3.1), Kimi K2.5 (coding/complex, alias: kimi), MiniMax M2.5 (coding/fallback, alias: minimax), Claude Sonnet 4.6 (on-demand, alias: sonnet), GPT-5.2 (on-demand, alias: gpt5), Ollama qwen3:30b (heartbeats/local, alias: local-heavy), Ollama qwen2.5:14b (local fallback, alias: local-medium), Ollama llama3.2:3b (triage)
- **Model aliases:** gemini-flash=gemini-3-flash-preview, gemini-3.1=gemini-3.1-pro-preview, kimi=kimi-k2.5, minimax=minimax-2.5, Minimax=MiniMax-M2.5, sonnet=claude-sonnet-4-6, gpt5=gpt-5.2, triage=llama3.2:3b, local-medium=qwen2.5:14b, local-heavy=qwen3:30b
- **Model routing (updated 2026-02-23):** Main agent=gemini-flash; Heartbeats=qwen3:30b (local/free); Fallback=minimax only; Coding/complex=kimi or MiniMax (auto sub-agent — no need to ask Paul); On-demand session upgrade: gemini-3.1, sonnet, gpt5. Auto-escalation rules in SOUL.md: spawn Kimi sub-agent for any generative/coding/strategy task; stay on Flash for fetch/route/format tasks.
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

## Infrastructure
- **PM2:** Installed globally. Manages Brand Value Canvas (:3000) and Mission Control (:3001) dev servers. Configured to auto-start on Mac reboot. Commands: `pm2 list`, `pm2 logs <name>`, `pm2 restart <name>`.

## LinkedIn Generate Protocol
When a system event arrives with text starting `LINKEDIN_GENERATE_REQUEST`:
1. Parse `topic:` field. If `topic:auto`, pick the next logical topic not yet covered in `memory/linkedin-posts.json`
2. Read skill: `skills/divided-brain-linkedin.md`
3. Follow the full workflow: duplicate check → manuscript search → draft → compute next schedule slot
4. Use **Kimi K2.5** (spawn sub-agent with model=kimi) for the draft
5. Send the completed draft to Paul via Telegram with: hook, full post body, suggested scheduled date
6. Save a `draft` entry to `memory/linkedin-posts.json` immediately (do not wait for approval)
7. Update `memory/projects/linkedin-pipeline.csv` for legacy compatibility

## Task Review Protocol
When a system event arrives with text starting `TASK_REVIEW_REQUEST`:
1. Parse the fields: `id`, `title`, `description`, `project`, `priority`, `assignee`
2. Evaluate the task using description + context from MEMORY.md / daily notes
3. If complete: `PATCH /api/tasks?id=xxx` with `{"status":"done"}` (or edit tasks.json directly)
4. If incomplete: `PATCH` with `{"status":"in_progress"}` + send Paul a Telegram message explaining what's still needed
5. Always confirm the move in chat: "✅ Moved [title] to Done" or "↩️ Sent [title] back to In Progress — [reason]"

## Active Skills
- **Claude Code:** Installed natively at `~/.local/bin/claude`. To use: `cd /opt/homebrew/lib/node_modules/openclaw && claude`. Auth conflict warning is harmless.
- **Firebase CLI:** v15.7.0 installed globally via npm. Authenticated with Larche Communications Google account.
- **Google OAuth credentials:** Stored at `~/.openclaw/secrets/google-oauth.json` (chmod 600, outside workspace/git). gog is already authenticated — file only needed if re-auth is required.
- **QMD:** Active memory daemon. 40 files, 410 vectors. Collections: memory-root-main, memory-alt-main, memory-dir-main, sessions-main. Config: `memory.backend = "qmd"`, `searchMode = "query"`, `update.interval = "3m"` in `~/.openclaw/openclaw.json`. XDG paths: `~/.openclaw/agents/main/qmd/`.

## CRITICAL SECURITY RULES
- **NEVER output API keys in chat.** If a key appears in any tool output or is read from a file, NEVER echo it back in any response. Use placeholders like `AIzaSy...` or say "Got it. Updating now." If you must confirm an update, say "Key is live" without any characters from the key itself.
- If receiving keys via file attachment, read and update immediately, delete the file, and respond with no key visible.


## Amazon Ads
- **Last audit (Feb 22, 2026):** $116.66 spend / $3.99 sales / 2923% ACoS over 30 days
- **Surgical cuts applied (Feb 21):** Paused "branding" keyword; added "decision making" + "behavioral psychology"
- **Attribution lag:** 24-48h — next meaningful data check: Mon Feb 23
- **Dashboard:** https://docs.google.com/spreadsheets/d/1AcEqHFvH87X2DDXwWnS3O05Ewqp02HoBpUWaMTCh7pY
- **SOP:** `skills/amazon-handshake-sop.md`

## Projects
- **Brand Value Canvas v2**: Major update (Feb 22) applying "Divided Brain" branding. UI colors set to slate/black/white with amber accents. "AI Brainstorm" feature added. Layout spacing issues root-caused. Deployed to Firebase + live on paullarche.com. Source: `projects/brand-value-canvas-v2/`.
- **Mission Control**: App rebuilt as Next.js dashboard with live workspace API integrations. Source: `projects/mission-control/`. Podcasts page in progress — API route exists (`app/api/podcasts/route.ts`), page (`app/podcasts/page.tsx`) and nav item not yet built. `POST /api/files` added to save .md files from Docs view.
- **`memory/podcasts.json`**: Canonical podcast pipeline JSON. 6 shows: WholeCEO (done+critiqued), Escaping the Drift (done, critique pending), Sales POP! (Feb 24 ✅ briefed), Travis Makes Money (Mar 2), On Brand (Mar 6 pending), Out of the Box (new opp). Source of truth for Mission Control Podcasts page.
- **Claude Code**: Native installation confirmed at `~/.local/bin/claude`.
- **Brand Value Canvas Code**: Saved permanently at `memory/projects/tech/brand-value-canvas-code.md`.

## People
- (Add key contacts here as needed)

## Decisions
- **Writing Rule (2026-02-22):** NEVER use em dashes (—) in generated copy, descriptions, or social posts. Paul considers them a dead giveaway of AI generation.
- **Memory Optimization (2026-02-22):** Compaction now fires at 120k tokens (was 180k). Memory flush at 100k tokens (was 176k). QMD searchMode = "query" (reranking enabled). QMD syncs every 3 min. Research doc: `memory/reference/memory-optimization.md`.
- **Post-Compaction Protocol (2026-02-22):** `WORKFLOW_AUTO.md` created — forces memory search + process check before any action after reset. Heartbeat now runs `qmd update && qmd embed` every cycle.
- **Model Config (2026-02-23):** Default primary = gemini-flash. Fallback = minimax only. Ollama reserved for heartbeats only. Per-session upgrades via `/model sonnet`, `/model gemini-3.1`, etc.
- **Search Configuration (2026-02-20):** Fixed Brave Search integration by resolving API key subscription errors and hard-coding keys in config.
- **Site Rebuild (2026-02-21):** paullarche.com audit completed; 6 marketing gaps found; Paul open to full rebuild — subagent audit planned as next step.
- **KDP Optimization (2026-02-21):** Applied new categories (Consumer Behavior, Applied Psychology, Decision-Making), 7 backend keywords, new Cialdini-positioning description. Primary marketplace: Amazon.com. Paperback confirmed published.
- **Cron Configuration (2026-02-21):** Fixed delivery issues by adding `"channel": "last"` and `bestEffort` to crons.
- **API Keys (2026-02-21):** Replaced invalid MiniMax key. Perplexity key still returning 401; fresh key required.

## Pending Actions
- **Mission Control Podcasts page**: `app/podcasts/page.tsx` NOT built (sub-agent timed out); API route exists at `app/api/podcasts/route.ts`; nav item not added yet — finish next session.
- **Sales POP! Podcast**: TODAY Tue Feb 24 @ 5:30 PM via Restream (Chrome). Briefing PDF ready: `memory/projects/book-promotion/podcasts/briefing-salespop-2026-02-24.pdf`. Key angle: John Golden is former Huthwaite CEO (SPIN Selling) — audience is salespeople; frame everything around "what does the salesperson do differently."
- **Out of the Box with Christine Blosdale**: New opp received Feb 23 — Paul has NOT replied to Jimmy yet. Dates available: Mar 11–17. Reply to jimmy@dalynmillerpr.com with preferred slot.
- **Escaping the Drift critique**: Episode recorded Feb 21 with John Gafford. No post-show critique done yet — run when recording/YouTube link is available.
- **LinkedIn post for Wed Feb 25**: Slot is open — next post (lp-024, postNumber 29) to draft. Good candidates: Confirmation Bias, Endowment Effect, Reciprocity.
- **AGENTS.md rewrite**: Ready to execute based on Paul's Feb 23 answers (QMD focus).
- **whisper.cpp install**: Paul interested — needs APPROVE before `brew install ggerganov/ggerganov/whisper-cpp`.
- **Brand Value Canvas sidebar bleed**: Add `overflow-hidden` to sidebar wrapper divs at lines 242, 285, 307, 329 in Canvas.tsx
- **Ollama update**: Upgrade to v0.16.3 + pull Qwen3 (deferred by Paul)
- **Gemini API billing cap**: Set daily quota in Google Cloud Console

### KDP (Completed Feb 22)
- ✅ New A10-optimized description applied (no em dashes, Cialdini positioning)
- ✅ 7 backend keywords updated
- ✅ Categories applied
- ✅ Brand Value Canvas deployed to Firebase + live on paullarche.com
- ✅ Paperback confirmed published

### Other Pending
- **Perplexity API key**: Still 401 — get fresh key from perplexity.ai/settings/api
- **Speaking + About page**: Rewrite in Elementor
- **Website copy**: Apply hero headline, sub-headline, CTA, BookLife badge, Cialdini line in Elementor
- **Lead magnet**: Create Brand Value Canvas PDF → email opt-in (needs email platform connected)
- **LinkedIn posts**: Wednesday Feb 25 slot is open — next post (lp-024, postNumber 29) to draft. Good candidates: Confirmation Bias, Endowment Effect, Reciprocity.
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
- **Dev Server Restart (2026-02-23):** Dev servers now managed by PM2 and survive gateway restarts automatically. PM2 also configured to auto-start on Mac reboot. No manual restart needed.
- **Calendar Verification (2026-02-19):** Always verify live calendar via `gog` CLI rather than relying on cached briefs.
- **Technical Fix (2026-02-19):** PATH stays resolved by explicitly pointing to `/opt/homebrew/Cellar/node@22/22.22.0/bin/node` for `gog` and node commands.
- **LinkedIn Post Pipeline (2026-02-21):** Tracked in `memory/projects/linkedin-pipeline.csv` — always check before generating a new post.
- **Branding Rules (2026-02-21):** Visual DNA in `memory/reference/divided-brain-branding.md`. Face silhouette always points LEFT; Large Gear = Old Brain (dominant); Small Gear = New Brain. Assets in Google Drive: `1eslLIjy1K25e4igHmILTNjRWGkg5G-zd`.
- **Amazon Ads Configuration (2026-02-21):** Whitelisted redirect URI `https://paullarche.com`. 30-day audit revealed 2923% ACoS; surgical cuts applied. SOP: `skills/amazon-handshake-sop.md`.
- **Book Sales Intelligence (2026-02-21):** Recurring subagent (every 3 days) researches Amazon algorithm trends for The Divided Brain.
- **Apple Watch Shortcut (2026-02-21):** URL scheme to trigger OpenClaw: `https://t.me/plarche1Bot?text=[Input]`.
- **API Key Rotation (2026-02-23):** When rotating a Google key, update BOTH `auth.json` AND `auth-profiles.json`. Only updating auth.json leaves the old (possibly revoked) key in auth-profiles.json, causing cooldown errors and slow/failed responses. Also clear `usageStats` in auth-profiles.json to remove any cooldown timers from the old key.
- **Key Security (2026-02-23):** NEVER output API keys in chat responses — not even to confirm they were updated. Google scanners detect keys in chat and auto-revoke them within minutes. Always say "Key is live" with no key characters visible.
- **Podcast Delivery (2026-02-23):** WholeCEO/Lisa G critique — filler words (~65 per 20 min), stumbled on own book title at close (said it 3x), "Hawkins razor" error (it's Occam's razor), "private parts" framing awkward (use "status/ego"). All standing rules now in `skills/podcast-prep-master.md` — do not re-document per episode.
- **Podcast Prep Skill (2026-02-23):** `skills/podcast-prep-master.md` rebuilt as full 6-step workflow. Model routing baked in: Gemini Flash (main) handles research + PDF; Kimi K2.5 sub-agent handles Q&A generation (Step 3) and post-show critique (Step 6). Memory-efficient: no inline data, uses memory_search() on demand. Pre-built AI question answer included. Always invoke this skill before any podcast appearance.
- **YouTube Transcription (2026-02-23):** Use `summarize "[YouTube URL]" --youtube auto --extract-only` — no API key needed, uses built-in captions. MP3-only audio requires Groq, OpenAI Whisper key, or local whisper.cpp (not yet installed).
