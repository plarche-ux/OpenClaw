---
name: youtube-research
description: Search YouTube and extract video metadata using web-based search.
metadata: { "openclaw": { "emoji": "📺" } }
---

# YouTube Research

This skill allows searching for YouTube videos without requiring a heavy API library.

## Search

```bash
# Search for behavioral psychology podcasts
# @use-tool: web_search
# @query: site:youtube.com "behavioral psychology" podcast
```

## Extract Metadata

To get details from a specific video, use `web_fetch` on the video URL to pull the description and basic info.
