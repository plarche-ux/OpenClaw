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

## Paul's Frameworks
- **MOCHA** — Customer experience flywheel (Make, Our, Customers, Happy, Always). Origin: radio/media career. Core goal: passionate customers who convert others. Full doc: `memory/reference/frameworks/mocha.md`. Connects directly to Divided Brain (H = Old Brain decides; New Brain rationalizes after). Good for sales/speaking contexts.
- *More frameworks to be added as retrieved.*
- **Memory Amnesia Fix (2026-02-22):** Root cause was flush triggering at 176k tokens (too late). Fixed via config + WORKFLOW_AUTO.md. If I redo completed work, check daily notes for "DO NOT redo" flags before acting.
- **Dev Server Restart (2026-02-23):** Dev servers now managed by PM2 and survive gateway restarts automatically. PM2 also configured to auto-start on Mac reboot. No manual restart needed.
- **Calendar Verification (2026-02-19):** Always verify live calendar via `gog` CLI rather than relying on cached briefs.
- **Technical Fix (2026-02-19):** PATH stays resolved by explicitly pointing to `/opt/homebrew/Cellar/node@22/22.22.0/bin/node` for `gog` and node commands.
- **LinkedIn Post Pipeline (2026-02-21):** Tracked in `memory/projects/linkedin-pipeline.csv` — always check before generating a new post.
- **Gateway Crash Root Cause (2026-02-24):** `openclaw gateway restart` conflicts with LaunchD KeepAlive → lock-contention loop. Combined with invalid `sources` key in `memorySearch.experimental` causing config validation errors. Fix: always use `stop && sleep 2 && start`. Never use `openclaw gateway restart`.
- **Config Backup System (2026-02-24):** Built timestamped backup + git-committed restore system. Run backup BEFORE any config change. Scripts in `workspace/scripts/`. Skill: `workspace/skills/config-safety/SKILL.md`. Emergency: `~/Desktop/RESTORE.txt`.
- **sessionMemory Config (2026-02-24):** Added `agents.defaults.memorySearch.experimental.sessionMemory = true` to `openclaw.json`. Do NOT re-add. `compaction.memoryFlush.enabled` was already `true` — do NOT re-add.
- **Branding Rules (2026-02-21):** Visual DNA in `memory/reference/divided-brain-branding.md`. Face silhouette always points LEFT; Large Gear = Old Brain (dominant); Small Gear = New Brain. Assets in Google Drive: `1eslLIjy1K25e4igHmILTNjRWGkg5G-zd`.
- **Amazon Ads Configuration (2026-02-21):** Whitelisted redirect URI `https://paullarche.com`. 30-day audit revealed 2923% ACoS; surgical cuts applied. SOP: `skills/amazon-handshake-sop.md`.
- **Book Sales Intelligence (2026-02-21):** Recurring subagent (every 3 days) researches Amazon algorithm trends for The Divided Brain.
- **Apple Watch Shortcut (2026-02-21):** URL scheme to trigger OpenClaw: `https://t.me/plarche1Bot?text=[Input]`.
- **API Key Rotation (2026-02-23):** When rotating a Google key, update BOTH `auth.json` AND `auth-profiles.json`. Only updating auth.json leaves the old (possibly revoked) key in auth-profiles.json, causing cooldown errors and slow/failed responses. Also clear `usageStats` in auth-profiles.json to remove any cooldown timers from the old key.
- **Key Security (2026-02-23):** NEVER output API keys in chat responses — not even to confirm they were updated. Google scanners detect keys in chat and auto-revoke them within minutes. Always say "Key is live" with no key characters visible.
- **Podcast Delivery (2026-02-23):** WholeCEO/Lisa G critique — filler words (~65 per 20 min), stumbled on own book title at close (said it 3x), "Hawkins razor" error (it's Occam's razor), "private parts" framing awkward (use "status/ego"). All standing rules now in `skills/podcast-prep-master.md` — do not re-document per episode.
- **Podcast Prep Skill (2026-02-23):** `skills/podcast-prep-master.md` rebuilt as full 6-step workflow. Model routing baked in: Gemini Flash (main) handles research + PDF; Kimi K2.5 sub-agent handles Q&A generation (Step 3) and post-show critique (Step 6). Memory-efficient: no inline data, uses memory_search() on demand. Pre-built AI question answer included. Always invoke this skill before any podcast appearance.
- **YouTube Transcription (2026-02-23):** Use `summarize "[YouTube URL]" --youtube auto --extract-only` — no API key needed, uses built-in captions. MP3-only audio requires Groq, OpenAI Whisper key, or local whisper.cpp (not yet installed).

## Pending Actions
- **Sales POP! Podcast (Feb 24)**: ✅ COMPLETED. Host: John Golden (ex-CEO Huthwaite/SPIN Selling). Focus: "what does the salesperson do differently when they understand the Old Brain?" Est. release: ~March 17. Post-show critique pending recording link.
- **Travis Makes Money Podcast (Mar 2)**: Scheduled for today.
- **Out of the Box with Christine Blosdale**: New opp received Feb 23. Paul replied offering March 17 at 8:30pm ET. Awaiting confirmation.
- **Escaping the Drift critique**: recorded Feb 21. No post-show critique done yet — run when link available.
- **LinkedIn post for Wed Mar 4**: Next open slot. (Update 2026-02-28: Post should position *The Divided Brain* as the 2026 update to legacy behavioral frameworks).
- **Guests (Feb 25 - Mar 4)**: Barb and Jeff arriving Feb 25 at 11:15 AM (organized by Lawrence Larche).
- **Email Flagged (Feb 24)**: Alice Mark (book practitioner question), 1Password (price update), CRA (new mail), Bell (e-bill), Brittany Wilson (RVH ED zone). Paul needs to review.
- **Mission Control Team page UI**: In progress — rebuild `app/team/page.tsx` to show Trinity + Niobe as live cards with [Files] button.
- **Mission Control Podcasts page**: In progress — `app/podcasts/page.tsx` NOT built; API route and nav item needed.
- **Brand Value Canvas sidebar bleed**: Add `overflow-hidden` to sidebar wrapper divs in Canvas.tsx.
- **Ollama update**: Upgrade to v0.16.3 + pull Qwen3 (deferred by Paul).
- **Gemini API billing cap**: Set daily quota in Google Cloud Console.

