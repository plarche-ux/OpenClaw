# Long-Term Memory

## System
- Running on: Mac Mini M4, 32 GB
- OpenClaw: native install with launchd daemon (v2026.2.26) — auto-update cron runs nightly at 3 AM ET
- Execution sandbox: OrbStack (Docker) for agent-generated code
- Models: Gemini 3 Flash (main/general, alias: gemini-flash), Gemini 3.1 Pro (on-demand, alias: gemini-3.1), Kimi K2.5 (coding/complex, alias: kimi), MiniMax M2.5 (coding/fallback, alias: minimax), Claude Sonnet 4.6 (on-demand, alias: sonnet), GPT-5.2 (on-demand, alias: gpt5), Ollama qwen3:30b (heartbeats/local, alias: local-heavy), Ollama qwen2.5:14b (local fallback, alias: local-medium), Ollama llama3.2:3b (triage)
- **Model aliases:** gemini-flash=gemini-3-flash-preview, gemini-3.1=gemini-3.1-pro-preview, kimi=kimi-k2.5, minimax=minimax-2.5, Minimax=MiniMax-M2.5, sonnet=claude-sonnet-4-6, gpt5=gpt-5.2, triage=llama3.2:3b, local-medium=qwen2.5:14b, local-heavy=qwen3:30b
- **Model routing (updated 2026-02-23):** Main agent=gemini-flash; Heartbeats=qwen3:30b (local/free); Fallback=minimax only; Coding/complex=kimi or MiniMax (auto sub-agent — no need to ask Paul); On-demand session upgrade: gemini-3.1, sonnet, gpt5. Auto-escalation rules in SOUL.md: spawn Kimi sub-agent for any generative/coding/strategy task; stay on Flash for fetch/route/format tasks.
- **Cron routing:** Tank (Daily Memory Maintenance) → ollama/qwen3:30b; Oracle (Book Sales Intelligence) → moonshot/kimi-k2.5; Morpheus (Morning Briefing) → main/Gemini Flash; Ghost (Auto-Update) → isolated/Gemini Flash
- **Agent naming (Matrix theme):** Neo = main agent (me); Trinity = Book Agent; Niobe = Research Agent; Link = Developer Agent; Morpheus = Morning Briefing cron; Tank = Daily Memory Maintenance cron; Oracle = Book Sales Intelligence cron; Ghost = Auto-Update OpenClaw cron; Smith = Security/Auditor cron
- **Live specialist agents (updated 2026-02-24):**
  - Trinity (`agentId: trinity`) — 📚 Book/content/promotion. Model: Kimi K2.5. Workspace: `~/.openclaw/workspace-trinity`.
  - Niobe (`agentId: niobe`) — 🔍 Research/intelligence. Model: Gemini Flash. Workspace: `~/.openclaw/workspace-niobe`.
  - Link (`agentId: link`) — ⚙️ Developer/code. Model: Kimi K2.5. Workspace: `~/.openclaw/workspace-link`.
- **Mission Control Agent API:** Route created at `/app/api/agents/[agentId]/files/route.ts` to allow file management for Trinity, Niobe, and Link.
- **agentToAgent:** enabled for main, trinity, niobe, link. Use `sessions_spawn(agentId="trinity/niobe/link", task="...")` to delegate.
- **⚠️ Gateway reload:** Do NOT use `kill -HUP`, `launchctl bootout`, or `openclaw gateway restart`. Safe sequence: `openclaw gateway stop && sleep 2 && openclaw gateway start`. `com.openclaw.backup` LaunchAgent removed.
- **⚠️ Config Change Safety (MANDATORY):** ALWAYS run `~/.openclaw/workspace/scripts/backup-openclaw-config.sh` BEFORE editing `openclaw.json` or restarting the gateway. Emergency restore instructions: `~/Desktop/RESTORE.txt`. Backups stored in `workspace/backups/` committed to workspace git.
- **System Hardening (2026-02-24):** `openclaw doctor --fix` and `openclaw security audit --fix` run. Canonicalized session keys, set file permissions to 600, and removed invalid `sources` key from `memorySearch.experimental`.
- **Auto-Update (2026-03-02):** OpenClaw updated to `v2026.2.26`. Features include `openclaw secrets` workflow and Android node support (device status/notifications).
- **Heartbeat Cycles (2026-02-24):** QMD sync + embed confirmed working every cycle.
- **Infrastructure Status (2026-02-24):** PM2 managing `brand-value-canvas` (:3000) and `mission-control` (:3001).
- Remote access: Jump Desktop (primary)
- Primary interface: Telegram (streaming: true)

## Book: The Divided Brain
- Full title: "The Divided Brain: Behavioral Psychology for Better Decision Making"
- BookLife Prize: 10/10 rating, Editor's Pick 2025
- Core concept: The "Old Brain" (emotional, instinctive) drives decisions; the "New Brain" (logical, analytical) rationalizes them after the fact
- Manuscript: memory/reference/the-divided-brain.md
- Branding rules: memory/reference/divided-brain-branding.md
- **Book Positioning (2026-02-28):** Audited behavioral sales landscape across 4 models (Research Bake-off). *The Divided Brain* is positioned as the "missing bridge" connecting deep academia (Kahneman) with real-world application, bypassing the "hacking" feel of modern rivals like Jeremy Miner (*The New Model of Selling*), David Hoffeld (*The Science of Selling*), and Renvoise & Morin (*The Persuasion Code*).
- **Amazon Strategy (2026-02-28):** Priority actions identified:
    - Categories: Expand to "Medical Books > Psychology" and "Business & Money > Skills > Decision Making."
    - Keywords: Add `habit loop`, `neuroscience business`, `cognitive bias sales`, `why people buy`.
    - Pricing: Target $16.99 (positioning between James Clear and Robert Cialdini).
    - Strategy: Prioritize external traffic links (LinkedIn/Podcasts) to Amazon to boost A10 authority.

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

## Projects (continued)
- **Barrie Cares**: Community-led non-profit coalition. Paul is a Board Director alongside Rowley Ramey (Chair) and James Massie. Mission: solve homelessness in Barrie via a two-phase "Campus of Care" (CoC). Phase 1 (Tiffin St) — County received occupancy permits Jan 2026. Phase 2 — formal letter sent to Mayor Nuttall Feb 19 requesting land at 384 Penetanguishene Rd. Full docs: `memory/projects/barrie-cares/`. Feb 18 meeting notes: `memory/projects/barrie-cares/documents/meeting-2026-02-18.md`.
- **Barrie Cares — Paul's open action items (Feb 18 meeting):** (1) Provide org letterhead (DONE); (2) Put John Alousis's letter on letterhead + return for review (DONE); (3) Update on Jammin' for Barrie status/beneficiaries; (4) Organize brainstorming at Thurston College (April); (5) Follow up with Kevin Mast (Georgian College contact).

## People
- **Rowley Ramey** — Barrie Cares Board Chair / Co-founder
- **John Alousis** — Barrie Cares legal / letter drafting
- **Mina Fayez-Bahgat** — County of Simcoe, GM of Social Services (Barrie Cares contact)
- **Jamie Massie** — Barrie Cares Director / External Outreach

## Decisions
- **LinkedIn Draft Auto-Save (2026-02-27):** Any time Trinity drafts a new LinkedIn post, it MUST automatically be saved to `memory/linkedin-posts.json` with a "draft" status so it populates the Mission Control Drafts page. Do not just output it in chat.
- **Model Preference (2026-02-27):** Switched to Gemini 3.1 Pro (alias: gemini-3.1) for deep reasoning and project audits per Paul's request.
- **Mission Control UI (2026-02-27):** Changed color scheme back to light mode in `globals.css`. Built Team page and Podcasts page (Link agent).
- **Android Integration (2026-02-28):** Recommended pairing Paul's Android phone as a Node to monitor book sales and Barrie Cares alerts while mobile.

## Lessons Learned
- **Writing Rule (2026-02-22):** NEVER use em dashes (—) in generated copy, descriptions, or social posts. Paul considers them a dead giveaway of AI generation.
- **Memory Optimization (2026-02-22):** Compaction now fires at 120k tokens (was 180k). Memory flush at 100k tokens (was 176k). QMD searchMode = "query" (reranking enabled). QMD syncs every 3 min. Research doc: `memory/reference/memory-optimization.md`.
- **Post-Compaction Protocol (2026-02-22):** `WORKFLOW_AUTO.md` created — forces memory search + process check before any action after reset. Heartbeat now runs `qmd update && qmd embed` every cycle.
- **Model Config (2026-02-23):** Default primary = gemini-flash. Fallback = minimax only. Ollama reserved for heartbeats only. Per-session upgrades via `/model sonnet`, `/model gemini-3.1`, etc.
- **Search Configuration (2026-02-20):** Fixed Brave Search integration by resolving API key subscription errors and hard-coding keys in config.
- **Site Rebuild (2026-02-21):** paullarche.com audit completed; 6 marketing gaps found; Paul open to full rebuild — subagent audit planned as next step.
- **KDP Optimization (2026-02-21):** Applied new categories (Consumer Behavior, Applied Psychology, Decision-Making), 7 backend keywords, new Cialdini-positioning description. Primary marketplace: Amazon.com. Paperback confirmed published.
- **Cron Configuration (2026-02-21):** Fixed delivery issues by adding `"channel": "last"` and `bestEffort` to crons.
- **API Keys (2026-02-21):** Replaced invalid MiniMax key. Perplexity key still returning 401; fresh key required.

## Recent Decisions (March 2026)
- **Squad Activation (2026-03-02):** Transitioned to a narrow-agent hierarchy for high reliability.
    - **Neo:** Orchestrator/Prioritization.
    - **Trinity:** Content Lead (LinkedIn/Pitching).
    - **Niobe:** Scout (Opportunity/News).
    - **Oracle:** Analyst (Amazon Ads/Sales).
    - **Tank:** Journal/Memory (2x daily proactivity).
    - **Link:** Technical Dev (Website/Systems).
- **LinkedIn Rebrand (2026-03-02):** Trinity completed "Cialdini meets Neuroscience" draft. POSITIONING: *The Divided Brain* is the 2026 biological foundation for behavioral sales.
- **Barrie Cares Progress (2026-03-02):** Letterhead and John Alousis's letter (384 Penetanguishene Rd land request) confirmed complete. Paul confirmed status as of 19:36 ET.
- **Task Management (2026-03-02):** Canonicalized tasks in `memory/projects/active-tasks.json`. Neo proactively prods Paul on #1 priority.

## Lessons Learned (March 2026)
- **Memory Compaction (2026-03-02):** Archived older context (Feb 2026) to `memory/archive/` to resolve 20k-character truncation warnings in injected context.
- **Task Routing (2026-03-02):** Wednesday LinkedIn slot (March 4) identified as empty; trigger Trinity to draft.
- **Meeting Readiness (2026-03-02):** Critical meeting on March 3 @ 11:00 AM regarding Community Builders land project.
