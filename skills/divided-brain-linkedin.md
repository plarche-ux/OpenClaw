---
name: divided-brain-linkedin
description: Specialized skill for generating LinkedIn posts based on "The Divided Brain" using Paul's unique voice, behavioral psychology insights, and cross-checking with existing posts on Google Sheets.
metadata: { "openclaw": { "emoji": "🧠", "requires": { "skills": ["gog"] } } }
---

# Divided Brain LinkedIn Strategist

## Core Persona & Style
- **Voice:** Conversational, authoritative, grounded in behavioral psychology.
- **Goal:** Educate the "New Brain" (logical) while captivating the "Old Brain" (instinctive).
- **Rule 1:** No generic AI corporate-speak (avoid words like "leverage," "synergy," "unlock").
- **Rule 2:** Always include a "Scroll-Stopping Hook" (Bold claim, personal story teaser, or a head-scratching behavioral fact).
- **Rule 3:** Optimize for "Dwell Time" using white space, bullet points, and short sentences.

## Workflow

### 1. Check for Duplicates
Before writing, I will search the "LinkedIn Posts" Google Sheet (ID: `18x3Xd5oklGNgcZw-1sFSSiuKGHCoETbikyZ_BAR1MhY`) to ensure the topic or core story hasn't been used recently.

### 2. Semantic Research
Search the book manuscript (`memory/reference/the-divided-brain-manuscript-complete.md`) for the specific concept requested (e.g., Scarcity, Patternicity, The Big Three).

### 3. Draft the Post
Using **Sonnet 4.6** (or Kimi K2.5 for complex strategy), I will generate a draft following these 2026 best practices:
- **Frequency:** Targeted for 3 posts per week.
- **Hook:** Middle-of-the-story entry or a direct challenge to a business norm.
- **Value:** A clear takeaway related to the "Divided Brain" gears.
- **Call to Action (CTA):** A thoughtful question to spark comments (Old Brain tribalism/belonging).

### 4. Tracking
When a post is approved and used, I will log the details to `memory/projects/linkedin-pipeline.csv`. I will also cross-reference with the Google Sheet (ID: `18x3Xd5oklGNgcZw-1sFSSiuKGHCoETbikyZ_BAR1MhY`) to ensure zero repetition.

## Trigger Phrases
- "Generate a LinkedIn post about [topic]"
- "Write a draft for LinkedIn based on Chapter [X]"
- "Give me 3 LinkedIn hooks for my book"
