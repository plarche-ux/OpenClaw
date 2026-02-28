const fs = require('fs');
const path = 'memory/podcasts.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const show = data.shows.find(s => s.id === 'out-of-the-box-2026-03-tbd');
if (show) {
  show.status = 'pending_confirmation';
  show.date = '2026-03-17';
  show.time = '20:30';
  show.platformNotes = 'Paul replied on Feb 27 offering Mar 17 at 8:30pm. Awaiting confirmation.';
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log("Podcasts updated.");
