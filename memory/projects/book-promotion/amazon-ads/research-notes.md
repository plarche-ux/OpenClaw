# Amazon Ads Research Notes
_Last updated: 2026-02-19_

---

## PART 1: Why OpenClaw Was Crashing (API Rate Limits)

### Two Different Errors — Important Distinction

| Error | Code | Cause | Who's Responsible |
|-------|------|-------|-------------------|
| Rate Limit | 429 | We exceeded tokens-per-minute (TPM) or requests-per-minute (RPM) | Our side |
| Overloaded | 529 | Anthropic's servers are saturated across all users | Anthropic's side |

### Why 429 Hits Us Specifically

1. **Long conversation context.** As a session grows, every new API call re-sends the *entire conversation history* as context. A 20-message thread might consume 30,000+ tokens just as overhead, before the actual new message is even processed. That alone can blow through a per-minute token limit.

2. **Token bucket algorithm.** Anthropic doesn't reset limits at the top of the minute — they use a continuous "bucket" that slowly refills. Short bursts of heavy work (multi-step tasks, sub-agents, heartbeats firing close together) can drain the bucket fast even if the 1-hour average looks fine.

3. **Agentic tasks multiply token use.** When I run multi-step tool calls (web searches → fetch → summarize → write file), each step sends the full context again. A single complex task can cost 5–10x the tokens you'd expect.

4. **Sub-agents share the org quota.** If multiple sessions (main + isolated sub-agents) fire simultaneously, they all draw from the same bucket.

### Why 529 Also Hits Us

- Anthropic's Claude Sonnet 4.6 is a very popular model. During peak hours (US business hours, especially mornings), their servers can get overloaded globally — nothing to do with our usage.

### What We Can Do About It (for discussion — no changes yet)

- **Shorter sessions:** Use `/new` more often to reset context. Don't let one session run for hours on complex tasks.
- **Model routing:** Route triage/simple tasks to `gemini-flash` or local `ollama/qwen2.5:14b`. Only escalate to Sonnet for strategy and writing.
- **Stagger cron jobs:** Don't fire heartbeats and cron briefings at the same time.
- **Exponential backoff:** The skill should retry with wait times of 1s → 2s → 4s → 8s before failing hard.
- **OpenClaw retry config:** There may be a retry/backoff setting in `openclaw.json` — worth checking.

---

## PART 2: Amazon Ads Best Practices for "The Divided Brain"

### Key Principle: Know Your Breakeven ACoS First

Before running any ad, calculate:

```
Royalty = Book price - Amazon commission - (delivery/printing costs)
Breakeven ACoS = Royalty ÷ Book price × 100
```

**Example:** If the book sells for $18.99 and your royalty is $6.00:
- Breakeven ACoS = 6.00 / 18.99 = ~31.6%
- Target ACoS should be **below** this (current skill targets 35% — may be slightly above breakeven, needs Paul's actual royalty number to confirm)
- **For KU/Kindle Unlimited:** KENP revenue adds to the denominator, which LOWERS your effective ACoS. Our skill already accounts for this. ✅

---

### The 3-Campaign Pillar Structure (Best Practice)

Every book needs at least these three campaign types running simultaneously:

| Pillar | Purpose | Targeting Type | Key Metric |
|--------|---------|----------------|------------|
| **Pillar 1: Discovery** | Find new, high-converting search terms | Automatic + Manual Broad Match | Search Term Report — mine for winners |
| **Pillar 2: Harvest** | Drive sales using proven terms from Pillar 1 | Manual Exact Match keywords + competitor ASINs | ACoS (must stay below breakeven) |
| **Pillar 3: Brand Defense** | Defend your own book page from competitors | Manual Exact Match on book title, author name | Impressions/CTR (should be high) |

**Naming convention:** `[Book Title] | Auto | Broad | $0.50` — makes reporting much cleaner.

---

### Targeting Strategy for Nonfiction/Behavioral Psychology

**Keyword targeting (what readers type):**
- Specific beats broad: "books for better decision making" converts better than "psychology books"
- Try: "behavioral economics book", "decision making book", "why we make bad decisions", "brain science book", "cognitive bias book", "Daniel Kahneman type book"
- Avoid: generic terms like "self help book" or "nonfiction" — too broad, high cost, poor conversion

**Competitor/author ASIN targeting (product targeting):**
- Target the detail pages of books readers already bought, like:
  - *Thinking, Fast and Slow* — Daniel Kahneman
  - *Predictably Irrational* — Dan Ariely
  - *The Power of Habit* — Charles Duhigg
  - *Nudge* — Thaler & Sunstein
  - *Blink* — Malcolm Gladwell
- Your ad shows up on their page. When a reader finishes reading a description and scrolls down, they see "Customers also bought" — your book appears there.

**Author targeting:**
- Target searches for: Daniel Kahneman, Dan Ariely, Robert Cialdini, Malcolm Gladwell
- Readers looking for these authors are already primed for behavioral psychology content

---

### Negative Keywords — Critical for Nonfiction

Stop wasting money on bad traffic:

| What to Block | Negative Keyword | Why |
|--------------|-----------------|-----|
| Free book seekers | "free" | They won't buy |
| Wrong audience | "textbook", "workbook" | Academic shoppers, different intent |
| Wrong format | "audiobook" (if not on Audible) | Won't convert |
| Fiction readers | "novel", "fiction" | Wrong genre |

---

### KENP / Kindle Unlimited Considerations

- If the book is in KDP Select/KU, KENP reads generate royalty (~$0.0045/page)
- A ~250-page book read fully = ~$1.12 in KENP royalties
- **Our skill already factors KENP into the "real ACoS" calculation** — this is a competitive advantage over authors who only look at purchase ACoS ✅
- KU readers tend to be voracious readers who try unknown authors — great audience for discovery campaigns

---

### Bidding Strategy

- **Start low:** $0.30–$0.50 bids in auto campaigns. Let Amazon collect data for 2 weeks before adjusting.
- **Scale winners:** If a keyword has 5+ clicks and at least 1 sale → raise bid 10–15%
- **Cut losers:** 10+ clicks with zero sales/KENP → pause or lower bid to $0.05
- **Daily budget:** Start at $5–$10/day. Don't blow budget before the algorithm has data.

---

### What to Build Into the Skill (Ideas — No Changes Yet)

1. **Breakeven ACoS calculator** — input royalty, output target ACoS
2. **KENP-adjusted ACoS** — already in skill ✅
3. **Search Term Report harvester** — auto-pull winners from Pillar 1 to feed Pillar 2
4. **Competitor ASIN watchlist** — track if competitors are bidding on our title
5. **Weekly summary report** → deliver to Telegram
6. **Negative keyword suggestions** — flag search terms with 10+ clicks and 0 conversions

---

## Sources
- Reedsy / ShelfLife (Laura Russom, ex-Blackstone Publishing) — Amazon Ads 2026 guide
- SellerMetrics — KDP Advertising complete guide 2026
- Ace Book Publishers — 3-pillar campaign structure + negative keywords
- Anthropic API Docs — rate limits and token bucket algorithm
- Various Reddit/GitHub issues on rate limit behavior
