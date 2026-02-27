# HEARTBEAT.md

## Maintenance Tasks (run every heartbeat)

### QMD Memory Sync
Run the following to keep memory indexed and searchable after every session:
```
XDG_CONFIG_HOME=~/.openclaw/agents/main/qmd/xdg-config XDG_CACHE_HOME=~/.openclaw/agents/main/qmd/xdg-cache qmd update 2>&1 | tail -3
XDG_CONFIG_HOME=~/.openclaw/agents/main/qmd/xdg-config XDG_CACHE_HOME=~/.openclaw/agents/main/qmd/xdg-cache qmd embed 2>&1 | tail -3
```
Only notify Paul if there are errors. Silent success = fine.

## Periodic Checks (rotate, 2-4x per day)
- Email: Any urgent unread?
- Calendar: Events in next 24-48h?
- Amazon Ads: Any alerts from the skill?
- LinkedIn: Read `memory/linkedin-posts.json`. Check:
  1. Any post with `status: approved` scheduled for today or tomorrow? → Remind Paul to post it.
  2. No post scheduled in the next 2 days AND today is Mon/Wed/Sat (or the day before)? → Notify Paul a new post slot is coming up.
  3. More than 3 days since last published post? → Nudge Paul.

## Reminder
Silent success on QMD sync is fine — only notify Paul on errors.
]9;4;3]9;4;1;100Indexing: 1/1        ]9;4;0]9;4;3]9;4;1;100Indexing: 1/1        ]9;4;0]9;4;3]9;4;1;3Indexing: 1/33        ]9;4;1;6Indexing: 2/33        ]9;4;1;9Indexing: 3/33 ETA: 0s        ]9;4;1;12Indexing: 4/33 ETA: 0s        ]9;4;1;15Indexing: 5/33 ETA: 0s        ]9;4;1;18Indexing: 6/33 ETA: 0s        ]9;4;1;21Indexing: 7/33 ETA: 0s        ]9;4;1;24Indexing: 8/33 ETA: 0s        ]9;4;1;27Indexing: 9/33 ETA: 0s        ]9;4;1;30Indexing: 10/33 ETA: 0s        ]9;4;1;33Indexing: 11/33 ETA: 0s        ]9;4;1;36Indexing: 12/33 ETA: 0s        ]9;4;1;39Indexing: 13/33 ETA: 0s        ]9;4;1;42Indexing: 14/33 ETA: 0s        ]9;4;1;45Indexing: 15/33 ETA: 0s        ]9;4;1;48Indexing: 16/33 ETA: 0s        ]9;4;1;52Indexing: 17/33 ETA: 0s        ]9;4;1;55Indexing: 18/33 ETA: 0s        ]9;4;1;58Indexing: 19/33 ETA: 0s        ]9;4;1;61Indexing: 20/33 ETA: 0s        ]9;4;1;64Indexing: 21/33 ETA: 0s        ]9;4;1;70Indexing: 23/33 ETA: 0s        ]9;4;1;73Indexing: 24/33 ETA: 0s        ]9;4;1;76Indexing: 25/33 ETA: 0s        ]9;4;1;79Indexing: 26/33 ETA: 0s        ]9;4;1;82Indexing: 27/33 ETA: 0s        ]9;4;1;85Indexing: 28/33 ETA: 0s        ]9;4;1;88Indexing: 29/33 ETA: 0s        ]9;4;1;91Indexing: 30/33 ETA: 0s        ]9;4;1;94Indexing: 31/33 ETA: 0s        ]9;4;1;97Indexing: 32/33 ETA: 0s        ]9;4;1;100Indexing: 33/33 ETA: 0s        ]9;4;0]9;4;3]9;4;1;3Indexing: 1/29        ]9;4;1;7Indexing: 2/29        ]9;4;1;10Indexing: 3/29 ETA: 0s        ]9;4;1;14Indexing: 4/29 ETA: 0s        ]9;4;1;17Indexing: 5/29 ETA: 0s        ]9;4;1;21Indexing: 6/29 ETA: 0s        ]9;4;1;24Indexing: 7/29 ETA: 0s        ]9;4;1;28Indexing: 8/29 ETA: 0s        ]9;4;1;31Indexing: 9/29 ETA: 0s        ]9;4;1;34Indexing: 10/29 ETA: 0s        ]9;4;1;38Indexing: 11/29 ETA: 0s        ]9;4;1;41Indexing: 12/29 ETA: 0s        ]9;4;1;45Indexing: 13/29 ETA: 0s        ]9;4;1;48Indexing: 14/29 ETA: 0s        ]9;4;1;52Indexing: 15/29 ETA: 0s        ]9;4;1;55Indexing: 16/29 ETA: 0s        ]9;4;1;59Indexing: 17/29 ETA: 0s        ]9;4;1;62Indexing: 18/29 ETA: 0s        ]9;4;1;66Indexing: 19/29 ETA: 0s        ]9;4;1;69Indexing: 20/29 ETA: 0s        ]9;4;1;72Indexing: 21/29 ETA: 0s        ]9;4;1;76Indexing: 22/29 ETA: 0s        ]9;4;1;79Indexing: 23/29 ETA: 0s        ]9;4;1;83Indexing: 24/29 ETA: 0s        ]9;4;1;86Indexing: 25/29 ETA: 0s        ]9;4;1;90Indexing: 26/29 ETA: 0s        ]9;4;1;93Indexing: 27/29 ETA: 0s        ]9;4;1;97Indexing: 28/29 ETA: 0s        ]9;4;1;100Indexing: 29/29 ETA: 0s        ]9;4;0