const fs = require('fs');

const path = 'memory/tasks.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Update existing tasks
data.tasks = data.tasks.map(t => {
  if (t.id === 't-010') t.status = 'done'; // Completed the site audit
  return t;
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log("Tasks updated.");
