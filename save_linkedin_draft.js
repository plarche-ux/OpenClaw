const fs = require('fs');
const path = 'memory/linkedin-posts.json';

try {
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  
  // Find the highest postNumber
  let maxPostNumber = 0;
  data.posts.forEach(post => {
    if (post.postNumber > maxPostNumber) {
      maxPostNumber = post.postNumber;
    }
  });
  
  // Determine next ID (e.g., lp-025)
  const nextIdNum = data.posts.length + 1;
  const nextId = `lp-${String(nextIdNum).padStart(3, '0')}`;
  
  const newPost = {
    id: nextId,
    postNumber: maxPostNumber + 1,
    topic: "Reciprocity",
    chapter: "Old Brain / Influence",
    hook: "That free coffee at the car dealership is not generosity. It is a calculated deposit in your psychological bank account.",
    cta: "What is the smallest gift or favor that has ever influenced a decision you made?",
    postBody: "That free coffee at the car dealership is not generosity. It is a calculated deposit in your psychological bank account.\n\nRobert Cialdini identified reciprocity as one of the six universal principles of influence, and for good reason. It runs deeper than manners. It is hardwired into your Old Brain, which evolved to track social debts and obligations because survival once depended on group cohesion.\n\nWhen someone gives you something, even something trivial, your Old Brain registers an open loop. It creates discomfort until balance is restored. The free sample at Costco. The unexpected upgrade on your flight. The handwritten note in a business proposal. Each triggers the same mechanism.\n\nYour New Brain does not recognize this as manipulation. It reframes it as fairness, as relationship-building, as good business. You rationalize the decision you have already been nudged toward.\n\nThe most skilled negotiators and sales professionals understand this split. They know that the gift does not need to be large. It only needs to be first. Once reciprocity is activated, your Old Brain treats the social debt as real, and your New Brain constructs logical reasons why compliance makes sense.\n\nTakeaway: Reciprocity is not about gratitude. It is about leverage. Your Old Brain treats small favors as binding contracts. Your New Brain justifies the obligation as integrity. Recognizing the mechanism is the only way to remain genuinely autonomous in your decisions.\n\nWhat is the smallest gift or favor that has ever influenced a decision you made?\n\n#behavioralpsychology #decisionmaking #reciprocity #influence #leadership #thedividedbrain",
    status: "draft",
    scheduledDate: "2026-02-28",
    publishedDate: "",
    linkedInUrl: "",
    notes: "Drafted by Trinity (Kimi K2.5) on Feb 27 2026. Added manually via Neo.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.posts.unshift(newPost); // Add to the top of the array
  
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
  console.log(`Draft saved successfully as ${nextId}.`);
} catch (error) {
  console.error("Error saving draft:", error);
}
