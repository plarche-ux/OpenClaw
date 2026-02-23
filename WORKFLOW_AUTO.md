# WORKFLOW_AUTO.md — Post-Compaction Recovery Protocol

This file is read automatically after context compaction. Follow every step before doing ANYTHING else.

## Step 1 — Orient yourself (MANDATORY, no skipping)

Run ALL of these searches before touching any file or running any command:

```
memory_search("what was I working on")
memory_search("mission control")
memory_search("brand value canvas")
memory_search("last session")
```

Then read:
- `memory/daily/YYYY-MM-DD.md` for today AND yesterday
- `MEMORY.md` sections: Projects, Pending Actions

## Step 2 — Check active processes

Run: `process(action=list)`

This tells you what's already running so you don't start duplicate servers or redo work.

## Step 3 — Before modifying ANY file

Search QMD for notes about that specific file BEFORE touching it:
```
memory_search("improvements to [filename]")
memory_search("[filename] rewrite plan")
memory_search("[filename] issues")
```

Then read the file itself. Never overwrite work already done today.

**Why this matters:** The research/analysis for a task is often stored in `memory/reference/` files. Generic orientation searches ("what was I working on") surface daily notes but may miss reference files. Always do a targeted search for the specific task before acting.

## Step 4 — Confirm with Paul before major re-runs

If you're unsure whether something was already completed, say:
> "I see [X] was in progress — want me to pick up from where we left off, or start fresh?"

Never silently redo completed work.

## Why this matters

Context compaction wipes working memory. These steps rebuild it from QMD and daily notes so you don't waste Paul's time redoing things he already saw done.

---

**Current active projects (update this when projects change):**
- `projects/mission-control/` — Next.js dashboard, port 3001, actively being built
- `projects/brand-value-canvas-v2/` — Vite/React app, port 3000, deployed to Firebase
- Dev server for mission-control: session `calm-bison`
- Dev server for brand-value-canvas: session `tender-seaslug` (may need restart)
