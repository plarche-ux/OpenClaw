const fs = require('fs');

const path = 'memory/tasks.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Update existing tasks
data.tasks = data.tasks.map(t => {
  if (t.id === 't-002') { // Fix Brand Value Canvas sidebar bleed
    t.assignee = 'link';
    t.status = 'in_progress'; // Let's move it to in progress since I can spawn a subagent for it.
  }
  if (t.id === 't-007') { // Rewrite Speaking + About page
    t.assignee = 'trinity'; // Trinity can draft the copy
    t.status = 'todo';
  }
  if (t.id === 't-009') { // Create Brand Value Canvas lead magnet PDF
    t.assignee = 'trinity'; 
  }
  if (t.id === 't-010') { // Full paullarche.com site audit
    t.assignee = 'niobe'; // Niobe can do the research/audit
    t.status = 'todo';
  }
  return t;
});

// Add missing tasks from MEMORY.md
data.tasks.push({
  id: "t-011",
  title: "Draft next LinkedIn post (Endowment Effect or Reciprocity)",
  description: "Next slot is Saturday. Need Trinity to draft it.",
  status: "in_progress",
  priority: "high",
  project: "book-promotion",
  assignee: "trinity",
  tags: ["linkedin"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

data.tasks.push({
  id: "t-012",
  title: "Post-show critique: Escaping the Drift podcast",
  description: "Run the post-show critique for the Escaping the Drift appearance recorded on Feb 21.",
  status: "todo",
  priority: "medium",
  project: "book-promotion",
  assignee: "trinity",
  tags: ["podcast", "speaking"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

data.tasks.push({
  id: "t-013",
  title: "Build Mission Control Team page UI",
  description: "Rebuild app/team/page.tsx to show Trinity + Niobe as live cards with [Files] button.",
  status: "todo",
  priority: "medium",
  project: "mission-control",
  assignee: "link",
  tags: ["coding", "ui"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

data.tasks.push({
  id: "t-014",
  title: "Build Mission Control Podcasts page",
  description: "app/podcasts/page.tsx NOT built; API route and nav item needed.",
  status: "todo",
  priority: "medium",
  project: "mission-control",
  assignee: "link",
  tags: ["coding", "ui"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

data.tasks.push({
  id: "t-015",
  title: "Research: Out of the Box with Christine Blosdale",
  description: "New podcast opp received Feb 23. Research host and show to help Paul reply.",
  status: "todo",
  priority: "high",
  project: "book-promotion",
  assignee: "niobe",
  tags: ["research", "podcast"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

data.tasks.push({
  id: "t-016",
  title: "Barrie Cares: Open Action Items",
  description: "Provide org letterhead, John Alousis letter, Jammin' for Barrie status, Thurston College brainstorming.",
  status: "todo",
  priority: "high",
  project: "barrie-cares",
  assignee: "paul",
  tags: ["board", "admin"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log("Tasks updated successfully.");
