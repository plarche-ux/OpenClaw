const axios = require('axios');
const fs = require('fs');

async function addNegativeKeywords() {
  const tokenPath = 'memory/projects/book-promotion/amazon-ads/tokens.json';
  const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  const profileId = "3410842252761117"; 
  const campaignId = 371676363401532; 
  const adGroupId = 444962937597670;

  const negativeKeywords = [
    "free", "textbook", "workbook", "audiobook", "novel", "fiction"
  ];

  const payload = negativeKeywords.map(term => ({
    campaignId: campaignId,
    adGroupId: adGroupId,
    keywordText: term,
    matchType: "negativeExact",
    state: "enabled"
  }));

  try {
    const response = await axios.post('https://advertising-api.amazon.com/v2/negativeKeywords', payload, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Amazon-Advertising-API-ClientId': process.env.AMZ_CLIENT_ID,
        'Amazon-Advertising-API-Scope': profileId,
        'Content-Type': 'application/json',
      },
    });

    console.log('Negative Keywords Added:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Failed to add negative keywords:', error.response?.data || error.message);
  }
}

addNegativeKeywords();
