# Memory Optimization Research
*Last updated: 2026-02-22*

## The Problem: Why Context Compaction Causes Amnesia

When context fills up, OpenClaw compacts the entire history into a summary. The summary loses granular detail — "we built X" instead of "we built X and these are the exact file paths, config values, and decisions we made." The agent wakes up from compaction with a rough sketch instead of a detailed map.

**Current trigger point:** With our config (`reserveTokensFloor: 20000`, `softThresholdTokens: 4000`):
- Memory flush fires at: 200k - 20k - 4k = **176k tokens**
- Compaction fires at: 200k - 20k = **180k tokens**

That's 4-second warning before everything gets summarized. Basically nothing.

**Anthropic's finding (context rot):** As context grows, recall accuracy degrades. The model attends to all tokens via n² pairwise relationships — bigger context = thinner attention. After ~80k tokens, noise drowns out signal.

---

## The 3 Memory Types Every Agent Needs

Based on research (MachineLearningMastery, arXiv 2502.06975):

### 1. Semantic Memory — "What I know"
Facts, references, rules. Lives in `MEMORY.md` and `memory/reference/`.
- Best for: Durable decisions, branding rules, project specs
- Risk: Gets stale; needs periodic pruning

### 2. Episodic Memory — "What happened"
Session logs, daily notes. Lives in `memory/daily/YYYY-MM-DD.md`.
- Best for: Reconstructing context after compaction
- Key insight (arXiv Feb 2025): *Episodic memory is the missing piece for long-term LLM agents* — RAG alone isn't enough; you need a record of WHAT WAS DONE, not just what's known

### 3. Procedural Memory — "How to do things"
Workflows, SOPs, skill files. Lives in `WORKFLOW_AUTO.md`, `AGENTS.md`, skill SKILL.md files.
- Best for: Post-compaction recovery (the agent knows HOW to rebuild context)

**Diagnosis:** We had semantic + weak episodic. We lacked procedural (WORKFLOW_AUTO.md now fixes this).

---

## Key Findings

### Finding 1: Flush WAY earlier
*Source: dev.to/kiravaughn (OpenClaw-specific)*

The default 176k flush point is too late. By then:
- The compaction summary is already poor quality (too much to summarize)
- Critical session details are already lost

**Recommended:** Flush at ~80-100k tokens. Compaction at ~120k.

### Finding 2: Search mode matters
*Source: OpenClaw docs*

QMD supports 3 search modes:
- `search` (BM25 keyword) — current default
- `vsearch` (vector similarity only)
- `query` (query expansion + BM25 + vector + reranking) — BEST quality

Our current `searchMode` is the default `search --json`. Switching to `query` gives semantically richer results with reranking.

### Finding 3: Write immediately, don't wait for compaction
*Source: Anthropic context engineering, dev.to*

"The agent writes important details to memory files immediately and searches them when needed."

The compaction flush is a safety net, not the primary write mechanism. Important decisions should be written to disk the moment they're made.

### Finding 4: Keep autoloaded files small
*Source: dev.to (OpenClaw-specific)*

Every autoloaded workspace file (AGENTS.md, SOUL.md, MEMORY.md, etc.) burns context on EVERY turn. Target: <10KB total for all autoloaded files. Everything else goes into searchable memory files loaded on demand.

**Our current autoloaded size:** ~25KB (MEMORY.md is getting large)

### Finding 5: Mem0 benchmark
*Source: arXiv 2504.19413*

Mem0 (structured memory) achieves:
- 91% lower p95 latency vs full context
- 90%+ token cost reduction
- Achieved via: extract → consolidate → retrieve pattern

Takeaway: We should periodically consolidate/prune MEMORY.md rather than just appending.

---

## Recommended Changes

### A. Compaction config (openclaw.json) — REQUIRES APPROVE

```json
"compaction": {
  "mode": "safeguard",
  "reserveTokensFloor": 80000,
  "memoryFlush": {
    "enabled": true,
    "softThresholdTokens": 20000,
    "prompt": "Write any lasting notes to memory/daily/YYYY-MM-DD.md and update MEMORY.md if needed; reply with NO_REPLY if nothing to store.\nCurrent time: {{datetime}}",
    "systemPrompt": "Session nearing compaction. Store durable memories now."
  }
}
```

Effect: Flush at 100k tokens. Hard compaction at 120k. **Much earlier intervention.**

### B. QMD search mode (openclaw.json) — REQUIRES APPROVE

```json
"memory": {
  "backend": "qmd",
  "qmd": {
    "sessions": { "enabled": true },
    "searchMode": "query",
    "update": { "interval": "3m" }
  }
}
```

Effect: Better semantic search quality. More frequent background sync.

### C. MEMORY.md size management — ongoing
- Keep MEMORY.md under 5KB of active facts
- Archive completed project sections to `memory/projects/archive/`
- Monthly pruning: remove resolved pending actions

### D. Daily notes discipline — behavioral
- Write file paths, exact config values, and "DO NOT redo" notes
- Format: "✅ DONE: [exact description] — skip this on restart"
- Already started with today's notes

### E. WORKFLOW_AUTO.md — DONE ✅
Forces post-compaction search before any action. Already created.

---

## What's Already Fixed

- ✅ `WORKFLOW_AUTO.md` — mandatory post-compaction checklist
- ✅ QMD heartbeat sync — runs `qmd update && qmd embed` every heartbeat  
- ✅ Daily notes now include "DO NOT redo" flags
- ✅ QMD re-embedded to current state (105 + 8 chunks)

## What Needs Paul's Approval

- `reserveTokensFloor`: 20000 → 80000
- `softThresholdTokens`: 4000 → 20000
- `memory.qmd.searchMode`: default → "query"
- `memory.qmd.update.interval`: default (5m) → "3m"
