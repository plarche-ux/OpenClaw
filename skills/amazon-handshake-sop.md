# Amazon Ads Handshake - Troubleshooting & SOP

If you need to re-authorize Amazon Ads, follow these exact settings to avoid "400 Bad Request" errors.

### 1. Whitelisted Settings (Amazon Developer Console)
The current Security Profile for "ClawdbotAmazonAds" is configured with:
*   **Allowed Return URL:** `https://paullarche.com`
*   **Allowed Scopes:** `advertising::campaign_management` and `profile`.

### 2. Common Failures
*   **DO NOT** use `http://localhost:8080/callback` as the redirect URI; it is not whitelisted.
*   **DO NOT** request `advertising::report_access`; it is currently not enabled in the security profile and will cause an "Unknown Scope" error.

### 3. Manual Handshake Process
If the automated server can't "hear" the response (because it redirects to the website):
1.  Neo generates the link using the `paullarche.com` redirect.
2.  Paul opens the link on the Mac Mini, logs in, and hits "Allow."
3.  Paul is redirected to `https://paullarche.com/?code=XYZ...`
4.  Paul copies the string after `code=` and pastes it into the Telegram chat.
5.  Neo uses that code to finalize the token exchange.

---
*Last updated: 2026-02-21*
