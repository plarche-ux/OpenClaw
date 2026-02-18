---
name: podcast-prep-master
description: Deep research, host style analysis, and PDF briefing generation for podcast appearances.
metadata: { "openclaw": { "emoji": "🎙️", "requires": { "skills": ["tavily", "summarize", "youtube-research"], "bins": ["md-to-pdf"] } } }
---

# Podcast Prep Master

Automated workflow for high-stakes interview preparation.

## Core Process

1. **Host Research**: Use Perplexity/Tavily to analyze the host's background, style, and past interviews.
2. **Transcript Analysis**: Pull and summarize transcripts from recent episodes to detect questioning patterns.
3. **Q&A Generation**: Generate 10 likely questions and 10 strategic "Divided Brain" answers.
4. **PDF Output**: Convert the briefing to a clean PDF for easy access during the show.

## Implementation Details

```bash
# @use-tool: exec
# @command: md-to-pdf briefing.md --output briefing.pdf
```
