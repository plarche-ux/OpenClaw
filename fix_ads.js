const fs = require('fs');
const path = 'projects/mission-control/app/amazon-ads/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/medium: 'bg-blue-950\/30 text-blue-400'/g, "medium: 'bg-blue-100 text-blue-800'");
content = content.replace(/high:   'bg-red-950\/30 text-red-400'/g, "high:   'bg-red-100 text-red-800'");
content = content.replace(/keyword_paused:   'bg-red-950\/30 text-red-400'/g, "keyword_paused:   'bg-red-100 text-red-800'");
content = content.replace(/bid_adjusted:     'bg-blue-950\/30 text-blue-400'/g, "bid_adjusted:     'bg-blue-100 text-blue-800'");
content = content.replace(/campaign_created: 'bg-purple-950\/30 text-purple-400'/g, "campaign_created: 'bg-purple-100 text-purple-800'");
content = content.replace(/active:  'bg-blue-950\/30 text-blue-400'/g, "active:  'bg-blue-100 text-blue-800'");
content = content.replace(/bg-red-950\/30 text-red-400/g, "bg-red-100 text-red-800");

fs.writeFileSync(path, content);
console.log('Fixed amazon ads badges');
