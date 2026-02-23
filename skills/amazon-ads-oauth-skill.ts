/**
 * Moltbot Amazon Ads OAuth Automation Skill
 * Handles complete OAuth 2.0 flow with automatic token management
 * 
 * Usage: moltbot setup amazon-ads-oauth
 * Or via Telegram: /setup amazon-ads-oauth
 */

import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import axios, { AxiosError } from 'axios';

interface AmazonOAuthConfig {
  clientId: string;
  clientSecret: string;
  profileId: string;
  region: string;
  redirectPort: number;
  credentialsPath: string;
}

interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  createdAt: number;
}

interface EncryptedCredentials {
  encrypted: string;
  iv: string;
  algorithm: string;
}

class AmazonAdsOAuthSkill {
  private config: AmazonOAuthConfig;
  private encryptionKey: string;
  private callbackServer: http.Server | null = null;
  private authCode: string | null = null;
  private authPromise: Promise<string>;
  private authResolve: ((code: string) => void) | null = null;
  private authReject: ((error: Error) => void) | null = null;

  constructor(config: Partial<AmazonOAuthConfig>) {
    this.config = {
      clientId: config.clientId || process.env.AMAZON_CLIENT_ID || '',
      clientSecret: config.clientSecret || process.env.AMAZON_CLIENT_SECRET || '',
      profileId: config.profileId || process.env.AMAZON_PROFILE_ID || '',
      region: config.region || process.env.AMAZON_REGION || 'US',
      redirectPort: config.redirectPort || 8080,
      credentialsPath: config.credentialsPath || path.join(process.env.HOME || '', '.moltbot/.amazon-ads-oauth.json'),
    };
    this.config.redirectUri = `https://paullarche.com`;

    this.encryptionKey = this.deriveEncryptionKey();

    this.authPromise = new Promise((resolve, reject) => {
      this.authResolve = resolve;
      this.authReject = reject;
      // 5 minute timeout
      setTimeout(() => {
        reject(new Error('OAuth authorization timeout - did not receive code within 5 minutes'));
      }, 300000);
    });

    this.validateConfig();
  }

  /**
   * Validate that all required credentials are available
   */
  private validateConfig(): void {
    const missing: string[] = [];

    if (!this.config.clientId) missing.push('AMAZON_CLIENT_ID');
    if (!this.config.clientSecret) missing.push('AMAZON_CLIENT_SECRET');
    if (!this.config.profileId) missing.push('AMAZON_PROFILE_ID');

    if (missing.length > 0) {
      throw new Error(
        `Missing required Amazon credentials: ${missing.join(', ')}\n` +
        'Set them in ~/.moltbot/.amazon-ads-creds.env or environment variables'
      );
    }
  }

  /**
   * Derive encryption key from machine identity for secure token storage
   */
  private deriveEncryptionKey(): string {
    const machineId = this.getMachineId();
    return crypto
      .createHash('sha256')
      .update(`amazon-ads-oauth-${machineId}`)
      .digest('hex');
  }

  /**
   * Get machine identifier (MAC address or fallback)
   */
  private getMachineId(): string {
    try {
      const { execSync } = require('child_process');
      const mac = execSync('cat /sys/class/net/*/address | head -1', {
        encoding: 'utf8',
      }).trim();
      return mac || 'default-machine';
    } catch {
      return 'default-machine';
    }
  }

  /**
   * Generate the Login with Amazon authorization URL
   */
  private generateAuthorizationUrl(): string {
    // IMPORTANT: redirectUri must match EXACTLY what is in Amazon Developer Console (currently https://paullarche.com)
    // IMPORTANT: scopes must be limited to 'advertising::campaign_management profile'. 
    // Do NOT add 'advertising::report_access' unless whitelisted first.
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      scope: 'advertising::campaign_management profile',
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      state: crypto.randomBytes(16).toString('hex'),
    });

    return `https://www.amazon.com/ap/oa?${params.toString()}`;
  }

  /**
   * Start local HTTP server to capture OAuth callback
   */
  private async startCallbackServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.callbackServer = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url || '', true);

        if (parsedUrl.pathname === '/callback') {
          const code = parsedUrl.query.code as string;
          const error = parsedUrl.query.error as string;
          const errorDescription = parsedUrl.query.error_description as string;

          if (error) {
            const errorMsg = `OAuth Error: ${error} - ${errorDescription || 'Unknown error'}`;
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(`
              <html>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                  <h1 style="color: red;">Authorization Failed</h1>
                  <p>${errorMsg}</p>
                  <p>You can close this window.</p>
                </body>
              </html>
            `);
            if (this.authReject) {
              this.authReject(new Error(errorMsg));
            }
          } else if (code) {
            this.authCode = code;
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
              <html>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                  <h1 style="color: green;">✅ Authorization Successful!</h1>
                  <p>Your Moltbot has been authorized to manage Amazon Ads campaigns.</p>
                  <p>You can close this window and return to your terminal.</p>
                </body>
              </html>
            `);
            if (this.authResolve) {
              this.authResolve(code);
            }
          }
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      });

      this.callbackServer.listen(this.config.redirectPort, 'localhost', () => {
        resolve();
      });

      this.callbackServer.on('error', (err) => {
        reject(new Error(`Failed to start callback server on port ${this.config.redirectPort}: ${err.message}`));
      });
    });
  }

  /**
   * Stop the callback server
   */
  private stopCallbackServer(): void {
    if (this.callbackServer) {
      this.callbackServer.close();
      this.callbackServer = null;
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  private async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
    try {
      const response = await axios.post('https://api.amazon.com/auth/o2/token', {
        grant_type: 'authorization_code',
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: `http://localhost:${this.config.redirectPort}/callback`,
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in || 3600,
        tokenType: response.data.token_type || 'Bearer',
        createdAt: Date.now(),
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        `Token exchange failed: ${axiosError.message}` +
        (axiosError.response?.data ? `\nDetails: ${JSON.stringify(axiosError.response.data)}` : '')
      );
    }
  }

  /**
   * Refresh expired access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    try {
      const response = await axios.post('https://api.amazon.com/auth/o2/token', {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken,
        expiresIn: response.data.expires_in || 3600,
        tokenType: response.data.token_type || 'Bearer',
        createdAt: Date.now(),
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        `Token refresh failed: ${axiosError.message}` +
        (axiosError.response?.data ? `\nDetails: ${JSON.stringify(axiosError.response.data)}` : '')
      );
    }
  }

  /**
   * Encrypt sensitive tokens for secure storage
   */
  private encryptTokens(tokens: OAuthTokens): EncryptedCredentials {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey, 'hex'), iv);

    let encrypted = cipher.update(JSON.stringify(tokens), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
      algorithm: 'aes-256-cbc',
    };
  }

  /**
   * Decrypt stored tokens
   */
  private decryptTokens(encrypted: EncryptedCredentials): OAuthTokens {
    const decipher = crypto.createDecipheriv(
      encrypted.algorithm,
      Buffer.from(this.encryptionKey, 'hex'),
      Buffer.from(encrypted.iv, 'hex')
    );

    let decrypted = decipher.update(encrypted.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  /**
   * Save credentials to encrypted file
   */
  private async saveCredentials(tokens: OAuthTokens): Promise<void> {
    const credDir = path.dirname(this.config.credentialsPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(credDir)) {
      fs.mkdirSync(credDir, { recursive: true, mode: 0o700 });
    }

    const encrypted = this.encryptTokens(tokens);

    const credentials = {
      version: 1,
      provider: 'amazon-ads',
      profileId: this.config.profileId,
      region: this.config.region,
      tokens: encrypted,
      lastUpdated: new Date().toISOString(),
    };

    fs.writeFileSync(
      this.config.credentialsPath,
      JSON.stringify(credentials, null, 2),
      { mode: 0o600 }
    );
  }

  /**
   * Load credentials from encrypted file
   */
  private async loadCredentials(): Promise<OAuthTokens | null> {
    if (!fs.existsSync(this.config.credentialsPath)) {
      return null;
    }

    try {
      const data = fs.readFileSync(this.config.credentialsPath, 'utf8');
      const credentials = JSON.parse(data);
      return this.decryptTokens(credentials.tokens);
    } catch (error) {
      throw new Error(`Failed to load credentials: ${(error as Error).message}`);
    }
  }

  /**
   * Main OAuth flow - handles everything automatically
   */
  async authenticate(): Promise<OAuthTokens> {
    console.log('\n🔐 Starting Amazon Ads OAuth Authorization...\n');

    // Check if valid tokens already exist
    const existingTokens = await this.loadCredentials();
    if (existingTokens && this.isTokenValid(existingTokens)) {
      console.log('✅ Valid cached tokens found. Using existing authorization.\n');
      return existingTokens;
    }

    if (existingTokens) {
      console.log('⚠️  Cached tokens expired, refreshing...\n');
      try {
        const refreshedTokens = await this.refreshAccessToken(existingTokens.refreshToken);
        await this.saveCredentials(refreshedTokens);
        console.log('✅ Tokens refreshed successfully.\n');
        return refreshedTokens;
      } catch (error) {
        console.log('ℹ️  Token refresh failed, starting new authorization...\n');
      }
    }

    // Start callback server
    console.log('📡 Starting callback server...');
    await this.startCallbackServer();
    console.log(`✅ Callback server running on http://localhost:${this.config.redirectPort}\n`);

    // Generate and display authorization URL
    const authUrl = this.generateAuthorizationUrl();
    console.log('🔗 Click this link to authorize Moltbot:\n');
    console.log(`   ${authUrl}\n`);
    console.log('⏳ Waiting for authorization...\n');

    try {
      // Wait for callback
      const code = await this.authPromise;
      console.log('✅ Authorization code received!\n');

      // Exchange code for tokens
      console.log('🔄 Exchanging code for tokens...');
      const tokens = await this.exchangeCodeForTokens(code);
      console.log('✅ Tokens acquired!\n');

      // Save tokens
      console.log('💾 Saving encrypted credentials...');
      await this.saveCredentials(tokens);
      console.log(`✅ Credentials saved to: ${this.config.credentialsPath}\n`);

      return tokens;
    } finally {
      this.stopCallbackServer();
    }
  }

  /**
   * Check if token is still valid (with 5 minute buffer)
   */
  private isTokenValid(tokens: OAuthTokens): boolean {
    const bufferMs = 5 * 60 * 1000; // 5 minute buffer
    const expiresAt = tokens.createdAt + tokens.expiresIn * 1000;
    return Date.now() < expiresAt - bufferMs;
  }

  /**
   * Get current valid access token (refreshing if needed)
   */
  async getAccessToken(): Promise<string> {
    const tokens = await this.loadCredentials();

    if (!tokens) {
      throw new Error('No credentials found. Run: moltbot setup amazon-ads-oauth');
    }

    if (this.isTokenValid(tokens)) {
      return tokens.accessToken;
    }

    console.log('🔄 Access token expired, refreshing...');
    const refreshedTokens = await this.refreshAccessToken(tokens.refreshToken);
    await this.saveCredentials(refreshedTokens);
    return refreshedTokens.accessToken;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get('https://advertising-api.amazon.com/v2/profiles', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Amazon-Advertising-API-ClientId': this.config.clientId,
          'Content-Type': 'application/json',
        },
      });

      console.log('\n✅ API Connection Successful!\n');
      console.log('Available Profiles:');
      console.log(JSON.stringify(response.data, null, 2));
      return true;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('\n❌ API Connection Failed');
      console.error(`Error: ${axiosError.message}`);
      if (axiosError.response?.data) {
        console.error(`Details: ${JSON.stringify(axiosError.response.data)}`);
      }
      return false;
    }
  }
}

/**
 * Moltbot Skill Export
 */
export default {
  name: 'amazon-ads-oauth',
  version: '1.0.0',
  description: 'Automated OAuth flow for Amazon Ads API with token management',
  commands: {
    /**
     * Initialize OAuth flow
     * Usage: moltbot setup amazon-ads-oauth
     */
    async setup(): Promise<void> {
      const skill = new AmazonAdsOAuthSkill({});
      const tokens = await skill.authenticate();

      console.log('\n════════════════════════════════════════════════');
      console.log('🎉 OAuth Setup Complete!');
      console.log('════════════════════════════════════════════════\n');

      console.log('Token Details:');
      console.log(`  ✅ Access Token: ${tokens.accessToken.slice(0, 20)}...`);
      console.log(`  ✅ Refresh Token: ${tokens.refreshToken.slice(0, 20)}...`);
      console.log(`  ✅ Expires in: ${Math.floor(tokens.expiresIn / 60)} minutes`);
      console.log(`  ✅ Stored at: ${process.env.HOME}/.moltbot/.amazon-ads-oauth.json\n`);

      console.log('Next steps:');
      console.log('  1. Update your Moltbot config to enable amazon-ads skill');
      console.log('  2. Test with: moltbot test amazon-ads-oauth');
      console.log('  3. Run: /send Show me my active campaigns\n');
    },

    /**
     * Test API connection
     * Usage: moltbot test amazon-ads-oauth
     */
    async test(): Promise<void> {
      const skill = new AmazonAdsOAuthSkill({});
      await skill.testConnection();
    },

    /**
     * Refresh tokens manually
     * Usage: moltbot refresh amazon-ads-oauth
     */
    async refresh(): Promise<void> {
      const skill = new AmazonAdsOAuthSkill({});
      console.log('🔄 Refreshing access token...\n');

      const tokens = await skill.loadCredentials();
      if (!tokens) {
        throw new Error('No credentials found. Run: moltbot setup amazon-ads-oauth');
      }

      const refreshedTokens = await skill.refreshAccessToken(tokens.refreshToken);
      await skill.saveCredentials(refreshedTokens);

      console.log('✅ Tokens refreshed successfully!\n');
      console.log(`  New Access Token: ${refreshedTokens.accessToken.slice(0, 20)}...`);
      console.log(`  Expires in: ${Math.floor(refreshedTokens.expiresIn / 60)} minutes\n`);
    },
  },

  /**
   * Export skill class for use in other modules
   */
  AmazonAdsOAuthSkill,
};
