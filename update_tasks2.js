const fs = require('fs');
const path = 'memory/tasks.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const task = data.tasks.find(t => t.id === 't-015');
if (task) {
  task.title = "Prep: Out of the Box with Christine Blosdale";
  task.description = "Paul replied offering Mar 17 @ 8:30pm. Niobe to research host/show for interview prep once confirmed.";
  task.status = "todo";
  task.updatedAt = new Date().toISOString();
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log("Tasks updated.");
