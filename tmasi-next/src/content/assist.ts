// TMASI chatbot that replaces the Jotform agent.
// Questions: his intake questions (2026-11-12) minus 5, 8, 9 and 11, kept word for word.
// Design: canvas board "Chatbot C. Side drawer", approved 2026-11-12. New lines approved by him the same day.
// English on every language for now.

export const WA_PHONE = "38268939565";
export const PAUSE = 700;

export type Answers = Record<string, string | undefined>;
export type Fields = {
  name: string;
  country: string;
  city: string;
  place: string;
  ptype: string;
  company: string;
  policy: string;
  phone: string;
};

export type Step = {
  id: string;
  t: "choice" | "text" | "loc" | "insco" | "phone" | "consent";
  q: string;
  opts?: string[];
  err?: string;
  when?: (a: Answers) => boolean;
};

export const STEPS: Step[] = [
  { id: "who", t: "choice", q: "Who needs medical assistance?", opts: ["Myself", "Someone else"] },
  { id: "name", t: "text", q: "What is the patient’s full name?", err: "Please write the patient’s full name." },
  { id: "loc", t: "loc", q: "Where is the patient currently located?", err: "Please add the country, the city and where the patient is staying." },
  { id: "kind", t: "choice", q: "What kind of medical assistance do you need?", opts: ["Urgent medical assistance", "Doctor consultation / Medical visit", "Hospital / Medical case coordination", "Other"] },
  { id: "ins", t: "choice", q: "Do you have travel or international medical insurance?", opts: ["Yes", "No", "Not sure"] },
  { id: "insco", t: "insco", q: "If yes, what is the name of your insurance company?", when: (a) => a.ins === "Yes" },
  { id: "phone", t: "phone", q: "What is your WhatsApp or phone number (including country code)?", err: "Please write the number with its country code, for example +44 7700 900123." },
  { id: "consent", t: "consent", q: "Thank you. One last step before we send your request.", err: "Please tick the box so we can send your request." },
];

export const COUNTRIES = ["Egypt", "Montenegro", "Germany", "United Kingdom", "Poland", "Spain", "Czech Republic", "Austria", "Switzerland", "Netherlands", "Belgium", "France", "Italy", "Russia", "Ukraine", "Sweden", "Norway", "Denmark", "Finland", "Ireland", "United States", "Canada", "Australia", "Israel", "Indonesia", "United Arab Emirates", "Saudi Arabia", "Turkey", "Greece", "Croatia", "Serbia", "Albania", "Cyprus", "Portugal", "Hungary", "Romania", "Slovakia", "Lithuania", "Latvia", "Estonia"];
export const PTYPES = ["Hotel", "Address", "Cruise ship"];
export const PLACE_PH: Record<string, string> = { "Hotel": "Hotel name", "Address": "Street and number", "Cruise ship": "Cruise ship name" };

export const SEND_LABELS = ["Securing your details", "Notifying our coordinator", "Opening WhatsApp"];

export const ASSIST = {
  bubbleTitle: "Need medical assistance?",
  bubbleText: "I’m Sofia. I can help you right now.",
  bubbleDismiss: "Dismiss message",
  launcherLabel: "Open the TMASI assistance chat",
  tag: "Ask Sofia",
  drawerLabel: "TMASI medical assistance",
  name: "Sofia",
  role: "TMASI medical assistance coordinator",
  close: "Close",
  welcomeTitle: "Hi, I’m Sofia.",
  welcomeText: "I’ll ask a few short questions so our medical assistance coordinator can help you quickly.",
  ticks: ["About 1 minute", "Change any answer before you send", "Our coordinator answers on WhatsApp or phone"],
  start: "Start",
  questionOf: (n: number, m: number) => "Question " + n + " of " + m,
  lastStep: "Last step",
  edit: "Edit",
  changeAnswer: "Change answer: ",
  loadingNext: "Loading the next question",
  cont: "Continue",
  skip: "Skip",
  namePh: "First and last name",
  nameLabel: "Full name",
  country: "Country",
  countryPh: "Egypt",
  city: "City",
  cityPh: "Hurghada",
  whereExactly: "Where exactly",
  placeLabel: "Hotel / Address / Cruise Ship",
  company: "Insurance company name",
  companyPh: "e.g. Allianz Travel",
  policy: "Policy number (optional)",
  policyPh: "Optional",
  insNote: "You can send a photo of your insurance card or policy in WhatsApp after this.",
  phonePh: "+44 7700 900123",
  phoneLabel: "WhatsApp or phone number",
  consent: "I agree that TMASI may process the personal and medical information above to arrange my medical assistance.",
  send: "Send my request",
  sending: "Sending your request",
  final: "Thank you for contacting TMASI. Your request has been received. Our medical assistance coordinator will contact you shortly via WhatsApp or phone.",
  whatsapp: "Continue in WhatsApp",
  cardNote: "Please attach a photo of your insurance card or policy in the WhatsApp chat.",
  mailFail: "We could not send a copy by email. Please send the message in WhatsApp.",
  again: "Start a new request",
  footer: "Your details go only to the TMASI coordination team.",
};

/** The priority words of a request, in the board's order. */
export function priorities(a: Answers, f: Pick<Fields, "ptype">): string[] {
  const pri: string[] = [];
  if (a.kind === "Urgent medical assistance") pri.push("URGENT");
  if (f.ptype === "Cruise ship") pri.push("CRUISE SHIP");
  return pri;
}

/** The board's buildMsg, unchanged in output. */
export function buildMessage(a: Answers, f: Fields): string {
  const pri = priorities(a, f);
  const L: string[] = ["TMASI MEDICAL ASSISTANCE REQUEST"];
  if (pri.length) L.push("PRIORITY: " + pri.join(" + "));
  L.push("", "Who needs medical assistance: " + (a.who || ""), "Patient full name: " + f.name.trim(), "Location: " + f.city.trim() + ", " + f.country.trim(), f.ptype + ": " + f.place.trim(), "Assistance needed: " + (a.kind || ""), "Travel / medical insurance: " + (a.ins || ""));
  if (a.ins === "Yes") {
    L.push("Insurance company: " + (f.company.trim() || "not given"));
    if (f.policy.trim()) L.push("Policy number: " + f.policy.trim());
    L.push("Insurance card: I will attach a photo in this chat");
  }
  L.push("WhatsApp / phone: " + f.phone.trim(), "Consent to process personal and medical information: Yes");
  return L.join("\n");
}
