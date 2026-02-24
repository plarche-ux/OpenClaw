---
name: divided-brain-linkedin
description: Specialized skill for generating LinkedIn posts based on "The Divided Brain" using Paul's unique voice, behavioral psychology insights, and tracking in linkedin-posts.json.
metadata: { "openclaw": { "emoji": "🧠", "requires": { "skills": ["gog"] } } }
---

# Divided Brain LinkedIn Strategist

## Core Persona & Style
- **Voice:** Conversational, authoritative, grounded in behavioral psychology.
- **Goal:** Educate the "New Brain" (logical) while captivating the "Old Brain" (instinctive).
- **Rule 1:** No generic AI corporate-speak. Banned words: "leverage," "synergy," "unlock," "game-changer," "dive in," "delve," "it's not just about..."
- **Rule 2:** No em dashes (—). Paul considers them a dead giveaway of AI generation.
- **Rule 3:** Always include a "Scroll-Stopping Hook" — a bold claim, a middle-of-the-story entry, or a head-scratching behavioral fact.
- **Rule 4:** Optimize for "Dwell Time" — white space, bullet points, short punchy sentences. No walls of text.
- **Rule 5:** Close with a thoughtful question that triggers tribal belonging or identity (Old Brain CTA).

## Scheduling
- **Target frequency:** 3 posts per week
- **Preferred days:** Monday, Wednesday, Saturday
- **How to compute next slot:** Read `memory/linkedin-posts.json`, find the latest `scheduledDate`, then add slots forward using preferred days. Skip dates already occupied.

## Workflow

### Step 1: Duplicate Check (Primary)
Read `memory/linkedin-posts.json`. Extract all `topic`, `hook`, and `chapter` fields. The new post must not repeat a topic already covered or reuse a hook concept. This is the authoritative source.

### Step 2: Duplicate Check (Secondary — optional)
Cross-reference with Google Sheet (ID: `18x3Xd5oklGNgcZw-1sFSSiuKGHCoETbikyZ_BAR1MhY`) as an archive check. Not required if CSV/JSON is up to date.

### Step 3: Semantic Research
Search the book manuscript at `memory/reference/the-divided-brain-manuscript-complete.md` for the specific concept. Use `memory_search("concept name")` to find relevant passages. Pull 2-3 specific facts, examples, or stories from the manuscript — this grounds the post in real content and avoids hallucination.

### Step 4: Branding Check
Review `memory/reference/divided-brain-branding.md` for visual DNA and tone. If suggesting an image:
- Face silhouette always points LEFT
- Large Gear = Old Brain (dominant)
- Small Gear = New Brain
- Color palette: slate/black/white with amber accents

### Step 5: Draft the Post
Use **Kimi K2.5** (alias: `kimi`) as default model. Upgrade to **Claude Sonnet 4.6** (alias: `sonnet`) for extra polish or when Paul requests it.

Structure:
```
[HOOK — 1-2 lines, bold claim or story entry]

[White space]

[Body — 3-6 short paragraphs or bullets, behavioral insight from manuscript]

[White space]

[Takeaway — 1-2 lines connecting to The Divided Brain]

[White space]

[CTA — One question that triggers identity/belonging/curiosity]

[Optional] 📘 The Divided Brain — available on Amazon.
```

### Step 6: Log to JSON
After Paul approves the post, add a new entry to `memory/linkedin-posts.json`:
```json
{
  "id": "lp-XXX",
  "postNumber": [next number],
  "topic": "...",
  "chapter": "...",
  "hook": "...",
  "cta": "...",
  "postBody": "full post text here",
  "status": "draft|scheduled|published",
  "scheduledDate": "YYYY-MM-DD",
  "publishedDate": "YYYY-MM-DD or null",
  "linkedInUrl": "url or empty",
  "notes": "...",
  "createdAt": "ISO",
  "updatedAt": "ISO"
}
```

Also update `memory/projects/linkedin-pipeline.csv` for legacy compatibility.

## Post Status Values
- `draft` — Generated, not yet approved
- `approved` — Approved by Paul, ready to schedule
- `scheduled` — Date set, not yet posted
- `published` — Live on LinkedIn
- `archived` — Rejected or pulled

## Reminder Protocol (Heartbeat)
During heartbeats, check:
1. Read `memory/linkedin-posts.json`
2. Find the latest `publishedDate` or `scheduledDate`
3. If no post scheduled in next 2 days AND today is Mon/Wed/Sat (or day before): notify Paul
4. If a post has `status: approved` with a `scheduledDate` today or tomorrow: remind Paul to post it

## Trigger Phrases
- "Generate a LinkedIn post about [topic]"
- "Write a draft for LinkedIn based on Chapter [X]"
- "Give me 3 LinkedIn hooks for my book"
- "What should my next LinkedIn post be about?"
- "Draft the next LinkedIn post" (Neo picks topic based on what's not been covered)
