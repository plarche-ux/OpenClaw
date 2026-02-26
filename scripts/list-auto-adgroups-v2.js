const axios = require('axios');
const fs = require('fs');

async function listAdGroups() {
  const tokenPath = 'memory/projects/book-promotion/amazon-ads/tokens.json';
  const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  const profileId = "3410842252761117"; 
  const campaignId = 371676363401532; 

  try {
    const response = await axios.get(`https://advertising-api.amazon.com/v2/adGroups?campaignIdFilter=${campaignId}`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Amazon-Advertising-API-ClientId': process.env.AMZ_CLIENT_ID,
        'Amazon-Advertising-API-Scope': profileId,
        'Content-Type': 'application/json',
      },
    });

    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Failed to list ad groups:', error.response?.data || error.message);
  }
}

listAdGroups();
