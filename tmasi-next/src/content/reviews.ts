// Words of the home guest reviews section, from the TMASI guest satisfaction form (Irina, WhatsApp 2026-11-11).
// Names and countries as sent (the guests agreed to publication). Design = canvas board "Reviews C. Moving wall",
// approved 2026-11-12. English on every language, like the trust section.

export const REVIEWS_TEXT = {
  title: "What Our Guests Say",
  count: "9 verified guest reviews",
  source: "from our guest satisfaction form",
  verified: "Verified guest",
  read: "Read",
  translated: "Translated from Spanish",
  form: "Satisfaction form",
  prev: "Previous",
  next: "Next",
  close: "Close",
};

export type Review = { name: string; country: string; text: string; lang?: "es"; tr?: string };

// Country flag per review (SVGs in public/img/flags/, from flag-icons, MIT; Spain is the plain civil flag because the
// coat of arms cannot be read at 20px). His pick 2026-11-12: flags on every card, a row under the heading without
// Israel, ending in a "+".
export const FLAG: Record<string, string> = { UK: "gb", England: "gb-eng", USA: "us", Australia: "au", Israel: "il", Indonesia: "id", Spain: "es", "España": "es" };
export const FLAG_ROW = ["gb", "gb-eng", "us", "au", "id", "es"];

export const REVIEWS: Review[] = [
  { name: "John Mundell", country: "UK", text: "“We felt very well looked after in difficult circumstances which was very much appreciated.”" },
  { name: "Denise Bergeland", country: "USA", text: "“Care and professionalism was fantastic.  The team went above expectation.”" },
  { name: "Mathias Thomseth", country: "Australia", text: "“I felt safe and taken care of. And I was very happy with my agent Stefan who was doing a very good job helping me with everything I needed. 10/10.”" },
  { name: "Dee Matthews", country: "England", text: "“I appreciated the help and kindness shown to me by the team. In such a difficult situation having someone help me navigate all the parts was so helpful. THANK YOU!”" },
  { name: "Meital Baranes", country: "Israel", text: "“Great service thank you so much! Stefan was very helpful! And all the medical team.”" },
  { name: "Tahlia Winters", country: "Australia", text: "“Stefan was great, very helpful and supportive, happy to go the extra mile for me which was much appreciated.”" },
  { name: "Eduard Davydov", country: "Indonesia", text: "“Instead of suggesting improvements to the service, I would like to express my sincere gratitude to Stefan, whose exceptional care and dedication made all the difference during a very difficult time for me.\n\nStefan was incredibly attentive, compassionate, and genuinely concerned about my well-being. He helped arrange my transportation from one hospital to another, accompanied me throughout the process, and made sure I could communicate with doctors and nurses in my native language.\n\nHe was always there to support me, explain what was happening, and make sure I received the care I needed.\n\nI sincerely believe that without Stefan’s involvement, I would not have received the medical assistance I desperately needed.\n\nHis kindness, professionalism, and personal commitment went far beyond what I could have expected.”" },
  { name: "José Enrique Paone Delgado", country: "Spain", text: "“Stefan and Irina were both very helpful in organizing and coordinating everything. I really appreciate their support and professionalism.”" },
  { name: "Jesus Corral", country: "España", lang: "es", text: "“La rapida respuesta, la facilidad que tuve para el papeleo, y la entrega del intérprete, Abdelghfar, una maravilla.”", tr: "“The quick response, how easy the paperwork was for me, and the dedication of the interpreter, Abdelghfar, was wonderful.”" },
];
