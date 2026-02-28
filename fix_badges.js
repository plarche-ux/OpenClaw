const fs = require('fs');

function fixLinkedin() {
  const path = 'projects/mission-control/app/linkedin/page.tsx';
  let content = fs.readFileSync(path, 'utf8');
  
  content = content.replace(/draft: 'bg-slate-100 text-slate-500',/g, "draft: 'bg-slate-200 text-slate-700',");
  content = content.replace(/approved: 'bg-blue-950\/30 text-blue-400',/g, "approved: 'bg-blue-100 text-blue-800',");
  content = content.replace(/scheduled: 'bg-blue-50 text-blue-600 border border-blue-500\/20',/g, "scheduled: 'bg-blue-100 text-blue-800 border border-blue-300',");
  content = content.replace(/published: 'bg-green-950\/30 text-green-400',/g, "published: 'bg-green-100 text-green-800',");
  content = content.replace(/archived: 'bg-red-950\/30 text-red-400',/g, "archived: 'bg-red-100 text-red-800',");
  
  // Fix the light text-slate-500 hook text 
  content = content.replace(/text-slate-500 flex-1 truncate font-mono italic opacity-60/g, "text-slate-600 flex-1 truncate font-mono italic");
  
  fs.writeFileSync(path, content);
}

function fixPodcasts() {
  const path = 'projects/mission-control/app/podcasts/page.tsx';
  let content = fs.readFileSync(path, 'utf8');
  
  content = content.replace(/upcoming: 'bg-blue-950\/30 text-blue-400',/g, "upcoming: 'bg-blue-100 text-blue-800',");
  content = content.replace(/confirmed: 'bg-blue-50 text-blue-600',/g, "confirmed: 'bg-blue-100 text-blue-800',");
  content = content.replace(/pending_confirmation: 'bg-blue-950\/30 text-blue-400 border border-blue-500\/20',/g, "pending_confirmation: 'bg-slate-200 text-slate-700 border border-slate-300',");
  content = content.replace(/completed: 'bg-slate-100 text-slate-500',/g, "completed: 'bg-slate-200 text-slate-700',");
  content = content.replace(/new_opportunity: 'bg-purple-950\/30 text-purple-400',/g, "new_opportunity: 'bg-purple-100 text-purple-800',");
  content = content.replace(/cancelled: 'bg-red-950\/30 text-red-400',/g, "cancelled: 'bg-red-100 text-red-800',");
  
  fs.writeFileSync(path, content);
}

try {
  fixLinkedin();
  console.log('Fixed linkedin');
} catch (e) {
  console.log('Could not fix linkedin:', e.message);
}

try {
  fixPodcasts();
  console.log('Fixed podcasts');
} catch (e) {
  console.log('Could not fix podcasts:', e.message);
}
