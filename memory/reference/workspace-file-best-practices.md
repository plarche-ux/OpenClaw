# Workspace File Best Practices Research
*Last updated: 2026-02-22 | Sources: OpenClaw official docs, aihero.dev, openclaw-setup.me, mmntm.net, awesome-openclaw*

---

## The Core Principle: One Job Per File

Every autoloaded workspace file (AGENTS.md, SOUL.md, USER.md, etc.) burns tokens on **every single turn**. They load before anything else. The total across all files is your "instruction budget" — research suggests ~150-200 instructions is the practical limit before the model loses coherence.

**The golden rule: No duplication. Pick one home for each fact.**

---

## The File Map: What Goes Where

### AGENTS.md — The Operating Contract
**Purpose:** Top-level rules for how the agent works. Loaded every session. The "constitution" of the agent.

**Put here:**
- Session startup ritual (what to read/search on boot)
- Memory workflow rules (write it down, search before acting)
- Safety/approval rules (ask before sending, destructive commands)
- Workspace structure conventions
- Post-compaction recovery (reference to WORKFLOW_AUTO.md)

**Do NOT put here:**
- Personality, tone, voice → that's SOUL.md
- User preferences → that's USER.md
- Tool-specific notes → that's TOOLS.md
- Temporary tasks → that's HEARTBEAT.md
- Behavioral philosophy (group chat etiquette, when to react) → SOUL.md

**Best practice:** ≤150 lines. Stable rules only — not temporary tasks. If a section hasn't changed in 3 months, it belongs here. If it changes weekly, it belongs elsewhere.

**Common mistake:** Treating AGENTS.md as a catch-all. Every rule you add costs tokens on every single turn, even if it's irrelevant to what's being asked.

---

### SOUL.md — Philosophy & Behavioral Core
**Purpose:** Who the agent IS, not what it does. Persona, values, voice, temperament, and non-negotiable constraints.

**Put here:**
- Core identity ("sharp, capable, not performative")
- Hard constraints (never send emails without APPROVE, never delete without asking)
- Voice and tone rules (no em dashes, conversational not corporate)
- Model routing decision logic (when to use which model)
- Group chat behavior (when to speak, when to react — these are behavioral philosophy)
- Platform formatting rules (Discord/Telegram/WhatsApp differences)
- Ethical boundaries

**Do NOT put here:**
- Project-specific tasks or tickets
- Temporary instructions
- Facts about Paul or the book → USER.md and MEMORY.md
- Memory implementation details → AGENTS.md

**Key insight (mmntm.net):** "System prompts tell models what to do. Soul files tell them who to be." The distinction matters — soul files create consistency of character, not just consistency of behavior.

---

### USER.md — The Personalization Layer
**Purpose:** Who the human is and how to serve them. Communication preferences, style defaults, known constraints.

**Put here:**
- Name, timezone, location
- Technical level (important for calibrating explanations)
- Communication style preferences
- Permission policies (read-only by default, ask for writes)
- Writing style the agent should match
- Current book/project context (brief, not detailed)

**Do NOT put here:**
- Agent behavior rules → AGENTS.md
- Detailed project history → MEMORY.md
- Task lists → HEARTBEAT.md

---

### IDENTITY.md — Presentation Layer
**Purpose:** How the agent appears to users. Name, emoji, vibe, avatar. These affect runtime behavior (message prefix, ack emoji reaction).

**Priority cascade:** Global config → per-agent config → IDENTITY.md → default "Assistant"

Keep this minimal — it's metadata, not instructions.

---

### TOOLS.md — Environment Notes
**Purpose:** Practical, environment-specific notes about local tools. Host quirks, path conventions, aliases, risky commands.

**Put here:**
- Camera names, SSH hosts, device nicknames
- Known gotchas for tools on THIS machine
- Voice/TTS preferences IF configured

**Do NOT put here:** Tool documentation (that's in skill SKILL.md files). Only YOUR specific environment notes.

---

### HEARTBEAT.md — Periodic Checklist
**Purpose:** Short checklist for heartbeat runs. Keep it minimal — it gets loaded on every heartbeat poll.

**Best practice:** ≤20 lines. Just the checklist. If it's longer, the heartbeat wastes tokens on instructions rather than actual work.

---

### MEMORY.md — Long-Term Facts
**Purpose:** Persistent facts and compressed history that survive daily churn. Curated, NOT a raw transcript.

**Put here:**
- Decisions made and why
- Current state of active projects
- Lessons learned
- Pending actions
- Facts about people, projects, references

**Do NOT put here:**
- Behavioral rules → SOUL.md
- Operating instructions → AGENTS.md
- Duplicate info from other files

**Key insight:** "No duplication across files — SOUL.md defines behavior, MEMORY.md stores facts. Don't repeat product details in both." (awesome-openclaw)

**Best practice:** Keep under 5KB of active facts. Archive completed project sections. Monthly pruning removes noise and keeps searches accurate.

---

### memory/daily/YYYY-MM-DD.md — Episodic Log
**Purpose:** Raw daily notes. Append-only. What happened, decisions made, things to not redo.

**Best practice:** Include "DO NOT redo" flags for completed work. Future sessions should be able to reconstruct context from this file alone. File paths, exact values, session names all belong here.

---

### WORKFLOW_AUTO.md — Post-Compaction Recovery
**Purpose (OpenClaw-specific):** Read automatically after context compaction. Forces orientation before action.

**Best practice:** Keep the checklist short and explicit. Search commands, not philosophy.

---

## The Instruction Hierarchy (conflict resolution)

When files conflict, priority order is:
1. System prompt (OpenClaw's own instructions)
2. SOUL.md hard constraints
3. AGENTS.md operating rules
4. USER.md preferences
5. Retrieved content (web, email, search results)

This means: safety rules in SOUL.md always win. User preferences in USER.md can be overridden by operating rules in AGENTS.md. External content (web pages, emails) never overrides any of the above.

---

## The Duplication Audit: Our Current State

| Content | Where it lives now | Where it should live |
|---|---|---|
| Group chat behavior | AGENTS.md | SOUL.md |
| Heartbeat instructions | AGENTS.md + HEARTBEAT.md | HEARTBEAT.md only |
| Platform formatting | AGENTS.md | SOUL.md |
| TTS/sag reference | AGENTS.md | Remove (not configured) |
| Bootstrap section | AGENTS.md | Remove (BOOTSTRAP.md deleted) |
| "Make It Yours" filler | AGENTS.md | Remove |
| Model routing rules | SOUL.md | SOUL.md ✅ |
| Model alias lookup | MEMORY.md | MEMORY.md ✅ |
| Daily notes path | AGENTS.md (wrong path) | Fix to memory/daily/ |
| QMD/memory search discipline | Nowhere in AGENTS.md | Add to AGENTS.md |
| WORKFLOW_AUTO.md reference | Nowhere in AGENTS.md | Add to AGENTS.md |
| Temp task lists | SOUL.md (minor) | Remove from SOUL.md |

---

## Recommended File Sizes (post-cleanup targets)

| File | Current | Target |
|---|---|---|
| AGENTS.md | ~200 lines | ~100 lines |
| SOUL.md | ~40 lines | ~50 lines (absorbs group chat/formatting) |
| USER.md | ~10 lines | ~12 lines |
| HEARTBEAT.md | ~25 lines | ~15 lines (remove duplicated content) |
| MEMORY.md | ~120 lines | ~80 lines active (archive completed) |

---

## Git Backup Recommendation
The official docs recommend keeping the workspace in a **private** Git repo for backup and recovery. Worth doing when things stabilize.
