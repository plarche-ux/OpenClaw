const fs = require('fs');

const draft = `Subject: RE: INTERVIEW OPP: Out of the Box with Christine Blosdale

Hi Jimmy,

Thanks for bringing this to me. I took a look at the show—Christine’s energy is great and her audience (business/entrepreneurial with a focus on self-improvement) aligns perfectly with the core themes of the book. I’m happy to accept.

As I mentioned previously, I can make March 17th at 8:30 PM ET work on my end. 

Let me know once they confirm the date and send over any platform or prep links (Riverside, Zoom, etc.), and my team will handle the rest.

Best,
Paul`;

fs.writeFileSync('workspace/draft-email-blosdale.txt', draft);
console.log("Email drafted.");
