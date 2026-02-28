const fs = require('fs');
const path = 'memory/tasks.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

data.tasks.push({
  id: "t-017",
  title: "Research Podcast Guest Training/Coaching",
  description: "Find highly rated podcast training services or coaches to help Paul improve his podcast interviews.",
  status: "in_progress",
  priority: "high",
  project: "book-promotion",
  assignee: "niobe",
  tags: ["research", "podcast", "training"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log("Task added.");
