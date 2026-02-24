---
name: podcast-prep-master
description: Research, prep briefing PDF, and delivery coaching for Paul's podcast appearances. Run when Paul has an upcoming podcast or asks for interview prep.
metadata: { "openclaw": { "emoji": "🎙️", "requires": { "bins": ["md-to-pdf"] } } }
---

# Podcast Prep Master

## When to invoke
- Paul mentions an upcoming podcast, interview, or media appearance
- Paul asks for prep, talking points, or a briefing
- Day-before or morning-of a show
- After a show (post-show critique)

## Model Routing

Each step has a best-fit agent. Don't use one model for everything.

| Step | Task | Agent | Why |
|---|---|---|---|
| 1 | Show details, calendar lookup | **Main (Gemini Flash)** | Fast, free, just reading |
| 2 | Host research, web search, episode fetch | **Main (Gemini Flash)** | Tool-calling, no reasoning needed |
| 3 | Q&A generation + talking points | **Kimi K2.5 sub-agent** | Long context (manuscript + stories), complex instruction-following |
| 4 | Delivery rules review | **Main (Gemini Flash)** | Static checklist, no generation |
| 5 | PDF generation | **Main (Gemini Flash)** | Mechanical — just fills template and runs md-to-pdf |
| 6 | Post-show critique | **Kimi K2.5 sub-agent** | Nuanced transcript analysis, scoring, multi-axis feedback |

**How to delegate Steps 3 and 6:**

For **Step 3**, after completing research, spawn a sub-agent:
```
sessions_spawn(
  task="[paste host research + show context + story bank search results]
        Generate 6-8 likely interview questions for [Host Name] on [Show].
        For each: write a 3-sentence Scene opener Paul can use, the core Old Brain/New Brain insight, and a book tie-in.
        Audience is [describe]. Tone: [describe]. No em dashes. No filler.",
  model="kimi",
  mode="run"
)
```
Take the output, fill the briefing template, then generate PDF.

For **Step 6**, spawn a sub-agent with the transcript:
```
sessions_spawn(
  task="Critique this podcast transcript for Paul Larche, author of The Divided Brain.
        Score 0-10: framework clarity, storytelling, delivery (filler words), credibility signals, book close.
        Count uh/um per minute. Identify top 3 improvements. Note any factual errors.
        Transcript: [paste full transcript]",
  model="kimi",
  mode="run"
)
```

---

## Memory efficiency rules
- Do NOT load the full manuscript. Use `memory_search("divided brain [topic]")` to pull only the relevant section.
- Do NOT load all LinkedIn posts. Use `memory_search("linkedin post [topic]")` to find story examples.
- Pull live show details from `memory/projects/book-promotion/podcasts/pipeline.md` or calendar — do not rely on memory alone.
- Briefing markdown must stay under ~800 words. Paul reads it on his phone and during the interview.

---

## Step 1 — Confirm show details

Pull from `memory/projects/book-promotion/podcasts/pipeline.md` or ask Paul:
- Show name and host name
- Date, time, timezone
- Format: length, live vs. recorded, video vs. audio only
- Platform / connection link
- Any questions provided by the show in advance

**Platform connection notes (standing):**
| Platform | Notes |
|---|---|
| Restream | Must use **Google Chrome** |
| Riverside | Must use **Google Chrome**; join link is the studio URL — test it ahead of time |
| Zoom | Any browser; join 5 min early for audio check |
| Zencastr / SquadCast | Chrome preferred |

---

## Step 2 — Host research (5 min)

```
web_search: "[Host Name] podcast [Show Name] interview style"
web_search: "[Show Name] recent episodes topics"
summarize "[recent YouTube episode URL]" --youtube auto --extract-only --length medium
```

Look for:
- Does the host interrupt, or let guests run long?
- Tactical (tips/tactics) or conceptual (ideas/frameworks)?
- What's their audience — sales, entrepreneurship, wellness, leadership?
- Any personal angles, recurring themes, or signature questions?

---

## Step 3 — Build talking points *(delegate to Kimi K2.5)*

After host research is done, spawn Kimi K2.5 (see Model Routing above) with the research context + story bank search results. Do not try to generate Q&A yourself — Kimi handles long context and nuanced instruction-following far better here.

For each likely question, Kimi should produce a **Scene → Insight → Book tie** structure:

> **Scene** (3 sentences, vivid real example — open every answer with this)
> **Insight** (the old brain/new brain principle it illustrates)
> **Book tie** (optional — one line referencing The Divided Brain)

**Standing story bank** — search on demand, don't load all at once:
- `memory_search("Banita Ted auto shop")` — storytelling / emotional trust / client results
- `memory_search("Tropicana rebrand")` — familiarity / pattern recognition / $65M lesson
- `memory_search("capuchin monkey fairness")` — fairness / tribal instinct
- `memory_search("jam study paradox of choice")` — simplicity / choice overload
- Personal (memorized): 25 guitars, Rolex, lion in the bush, 5 radio stations from scratch

**Pre-built answer — the AI/human advantage question** (use verbatim or close):
> *"The human advantage is authentic emotional connection. AI can optimize for conversion, but it can't sit across the table from someone and make them feel genuinely understood. That's still a human skill. The brands that win in an AI world use AI for efficiency and reserve their human energy for trust-building."*

**Credibility to drop early (first 3 min):**
- BookLife Prize: 10/10 score, Editor's Pick 2025 — from Publisher's Weekly. Rare.
- Built five radio stations from scratch; 40 years studying what moves people
- Brand Value Canvas — free tool at paullarche.com

---

## Step 4 — Delivery rules (read before every show)

From live critique of WholeCEO/Lisa G episode (Feb 2026, score: Delivery 5/10, Book close 3/10):

1. **Kill the filler.** "Uh" and "um" appeared ~65 times in 20 min — one every 17 seconds. When you feel one coming: stop, breathe, speak. The pause sounds confident. The filler sounds uncertain.

2. **Scene first, always.** Open every answer with a scene. The listener needs to see something before they can understand something. Do NOT open with the concept.

3. **Book close — say this exactly, every time:**
   > *"It's called The Divided Brain — available on Amazon and at paullarche.com."*
   Practice it out loud before the show. In the Lisa G episode it took 3 attempts to land the title.

4. **Use "status and ego" — not "private parts."** The three emotional drivers (heart, gut, status/ego) are solid. The "private parts / sexual reproduction" framing turns off professional audiences. Same science, no awkward moment.

5. **Occam's razor, not Hawkins razor.** William of Ockham. Or just say: *"The simplest explanation is usually correct."*

6. **End answers cleanly.** You tend to keep talking past your point. Land the insight, stop, let the host pick it up.

7. **Don't deflect the AI question.** Hosts always ask it. Answer it directly with the pre-built answer above, then pivot to the human/emotional angle.

---

## Step 5 — Save briefing

After building the briefing markdown:

1. **Save as `.md`** — primary format, shows up in Mission Control Docs tree and is viewable via the "View Briefing" button in the Podcasts page:
```bash
# Write directly to the podcasts folder
cat > /Users/paul/.openclaw/workspace/memory/projects/book-promotion/podcasts/briefing-[SHOW]-[DATE].md << 'EOF'
[briefing content]
EOF
```

2. **Update `memory/podcasts.json`** — set `briefingMd` field to `"memory/projects/book-promotion/podcasts/briefing-[SHOW]-[DATE].md"` for the matching show.

3. **PDF is optional** — only generate if Paul specifically requests it. The `.md` version is readable on screen in Mission Control and doesn't need an extra app.

4. **Delete after show** — briefing files are ephemeral. After the post-show critique is done, remove them to keep the workspace clean.

Tell Paul to go to Mission Control → Podcasts → expand the show card → click "View Briefing".

**Briefing template (fill in per show):**

```markdown
# 🎙️ [SHOW NAME] — [DATE] [TIME ET]
**Host:** [Name] | **Format:** [length, video/audio] | **Platform:** [name]
**Link:** [URL]

---

## Host Style
[2–3 sentences from research]

---

## Likely Questions + Your Opening Scene

**1. [Question]**
→ Scene: [open with this]
→ Key point: [insight]

**2. [Question]**
→ Scene: [open with this]
→ Key point: [insight]

**3. [Question]**
→ Scene: [open with this]
→ Key point: [insight]

*(5–7 questions max)*

---

## AI Question (use verbatim)
"The human advantage is authentic emotional connection. AI can optimize for
conversion, but it can't sit across the table from someone and make them feel
genuinely understood. That's still a human skill..."

---

## Book Close (say this exactly)
"It's called The Divided Brain — available on Amazon and at paullarche.com."

---

## Reminders
- Pause > uh. Scene first. End cleanly.
- Drop BookLife Prize / 5 radio stations early.
- [Any show-specific note]
```

---

## Step 6 — Post-show critique *(delegate to Kimi K2.5)*

1. **Main agent:** Extract transcript — `summarize "[YouTube or URL]" --youtube auto --extract-only --length xxl`
2. **Main agent:** Spawn Kimi K2.5 sub-agent with full transcript (see Model Routing above)
3. **Kimi delivers:** Scores (0–10 across 5 axes), filler word count per minute, top 3 improvements, factual errors flagged
4. **Main agent:** Format and send critique to Paul via Telegram
5. **Main agent:** Save summary to `memory/daily/YYYY-MM-DD.md`
6. **Main agent:** Update `memory/podcasts.json` — set postShow.scores, postImprovements, recordingUrl, critiqueDate
7. **Main agent:** Update `memory/projects/book-promotion/podcasts/pipeline.md` — mark show done, note score

---

## Podcast Pipeline (reference)

Full pipeline tracked in: `memory/projects/book-promotion/podcasts/pipeline.md`
