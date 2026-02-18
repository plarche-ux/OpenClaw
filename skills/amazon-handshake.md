---
name: amazon-handshake
description: Manual Amazon Ads API handshake and token management.
metadata: { "openclaw": { "emoji": "🛒" } }
---

# Amazon Ads Handshake

To link your account, I need three pieces of information from your **Amazon Developer Console**. 

**DO NOT PASTE THEM IN CHAT.** 🕶️

### Step 1: Provide Credentials via Environment
Run this in your Mac Mini terminal (replace the placeholders with your real values):
```bash
export AMZ_CLIENT_ID="your_client_id_here"
export AMZ_CLIENT_SECRET="your_client_secret_here"
export AMZ_REGION="na" # "na" for North America
```

### Step 2: Generate the Link
Once the environment is set, tell me: **"Neo, generate the Amazon link."**

I will then provide you with the authorization URL to open in Safari.
