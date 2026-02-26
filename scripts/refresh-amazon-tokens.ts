import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

async function refresh() {
  const tokenPath = 'memory/projects/book-promotion/amazon-ads/tokens.json';
  const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

  const clientId = process.env.AMZ_CLIENT_ID;
  const clientSecret = process.env.AMZ_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing AMZ_CLIENT_ID or AMZ_CLIENT_SECRET');
    process.exit(1);
  }

  console.log('Attempting to refresh Amazon Ads token...');
  
  try {
    const response = await axios.post('https://api.amazon.com/auth/o2/token', {
      grant_type: 'refresh_token',
      refresh_token: tokens.refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const newTokens = {
      ...tokens,
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token || tokens.refreshToken,
      expiresAt: Date.now() + (response.data.expires_in * 1000)
    };

    fs.writeFileSync(tokenPath, JSON.stringify(newTokens, null, 2));
    console.log('SUCCESS: Amazon Ads token refreshed.');
  } catch (error) {
    console.error('Refresh failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

refresh();
