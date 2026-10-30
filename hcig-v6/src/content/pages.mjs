// Inner page words. Every string carries its source (BRAIN.md rule 1), like src/content/home.mjs:
//   live-about, live-services, live-partner, live-contacts, live-leadership: healthcareig.com captured 2026-10-26
//   (hcig-v6/material/live-capture/2026-10-26/); live-fix: the same words with a logged punctuation fix only
//   profile: the company profile titles he chose 2026-10-26 (specs/013-hcig-v6/fact-sheet.md section 3)
//   manager: the Maritime & Cruise copy (src/content/manager/); new: written for v6, for his review

export const SITE_URL = "https://healthcareig.com";

export const ABOUT_PAGE = {
  meta: { title: "About HCIG: 40 Years of Global Healthcare Excellence", src: "live-fix" }, // live title had an en dash
  eyebrow: "About Us",
  title: "Innovating Healthcare, Changing Lives.",
  note: "Secure & confidential communication",
  boardTitle: "Board Members",
  src: "live-about",
};

export const LEADERSHIP = {
  meta: { title: "Leadership | Healthcare International Group (HCIG)", src: "new" },
  title: "Board Members",
  people: [
    { name: "Dr. Mostafa Elshakankery", roles: ["Group Chairman"], img: "lead-mostafa" },
    { name: "Dr. Amr Abbass", roles: ["Group Vice Chairman", "Group CEO"], img: "lead-amr", quote: true },
    { name: "Dr. Ahmed Safwat", roles: ["Group Deputy CEO"], img: "lead-safwat" },
    { name: "Mr. Mohsen Mohamed", roles: ["HCIG Board Member"], img: "lead-mohsen" },
    { name: "Dr. Mohamed Aziz", roles: ["Group CSO"] },
    { name: "Dr. Hesham Abdalla", roles: ["Group COO"] },
  ],
  src: "profile",
};

export const SERVICES_PAGE = {
  meta: { title: "HCIG Services | Urgent Care, Radiology & Wellness in Egypt", src: "live-services" },
  eyebrow: "Services",
  title: "Healthcare Services Delivered Through One System",
  lead: "Each service is part of a structured model designed to manage the full patient journey from first contact to treatment, coordination, and recovery.",
  cta: "Request Medical Assistance",
  note: "24/7 Medical Support | Fast Response | Fully Confidential",
  capabilities: [
    { title: "Immediate Medical Access", text: "On-site clinics, urgent care centers, and rapid response teams providing 24/7 access to medical care fully integrated within hotels, resorts, and key travel environments.", icon: "cross" },
    { title: "Telemedicine & Remote Medical Support", text: "Instant access to qualified doctors through remote consultations, enabling fast triage, medical advice, and continuous patient support across locations and time zones.", icon: "telemed" },
    { title: "Advanced Diagnostics & Treatment", text: "Hospital-based care supported by full diagnostic capabilities, laboratory services, imaging, and specialized medical treatment across multiple disciplines.", icon: "hospital" },
    { title: "Medical Coordination & Case Management", text: "Full case ownership and coordination across providers, insurers, and assistance companies ensuring clarity, speed, and structured patient management.", icon: "network" },
    { title: "Medical Evacuation & Repatriation", text: "International patient transfers with complete medical, logistical, and operational coordination from stabilization to safe relocation across borders.", icon: "plane" },
    { title: "Insurance & Claims Management", text: "Direct integration with major international insurance and assistance companies, ensuring fast approvals, efficient case handling, and a fully cashless patient experience.", icon: "shield" },
    { title: "Recovery & Follow-Up Care", text: "Ongoing patient monitoring and coordination until full recovery, ensuring continuity of care across different locations and healthcare systems.", icon: "clipboard" },
    { title: "Elite Medical Concierge Service", text: "Dedicated, high-touch medical support with personalized case oversight, multilingual communication, and seamless coordination across all services and locations.", icon: "standard" },
  ],
  closing: {
    title: "Request Medical Assistance or Partnership",
    text: "Whether you need immediate medical support, treatment planning, or partnership collaboration our team is ready to respond 24/7.",
    note: "Fast response | Multilingual support | Fully confidential",
  },
  src: "live-services",
};

export const PARTNER_PAGE = {
  meta: { title: "HCIG Partners | Global Healthcare System for Insurance & International Partners", src: "live-partner" },
  eyebrow: "For partners",
  title: { lead: "Partner with HCIG", accent: "Build Healthcare Without Fragmentation" },
  lead: "We collaborate with insurance companies, assistance providers, hospitality groups, and healthcare institutions to deliver structured, reliable, and internationally integrated healthcare solutions.",
  primary: "Become a Partner",
  secondary: "Request a Meeting",
  note: "Direct integration | Faster decisions | Full case control",
  whyTitle: "Why Partners Choose HCIG",
  why: [
    // live: "from first contact to final resolution" had " - "; logged punctuation fix
    { title: "Full Patient Ownership", text: "We take full responsibility for every case, from first contact to final resolution.", icon: "ownership" },
    { title: "Direct Insurance Integration", text: "We work directly with insurers and assistance companies, eliminating delays and intermediaries.", icon: "shield" },
    { title: "Speed & Operational Control", text: "Fast response, clear decision-making, and structured case management at every stage.", icon: "speed" },
    { title: "Healthcare Built for Travel Industry", text: "Integrated medical services designed specifically for hotels, resorts, and international environments.", icon: "hotel" },
  ],
  whoTitle: "Who We Work With",
  short: {
    "insurance-assistance-companies": "Direct medical coordination and global case management.",
    "embassies-government": "Medical support for diplomatic missions and delegations.",
    "hotels-and-resorts": "On-site medical services and emergency response.",
    "tour-operators-travel-agencies": "Traveler medical support across the full journey.",
    "healthcare-providers": "International patient flow and structured referrals.",
    "corporate-international-organisations": "Cross-border healthcare solutions for organizations.",
  },
  stepsTitle: "How Our System Works",
  steps: [
    { n: "1", title: "Immediate Access", text: "On-site clinics, telemedicine, or emergency response." },
    { n: "2", title: "Case Assessment", text: "Medical triage and coordination with providers." },
    { n: "3", title: "Treatment Delivery", text: "Urgent or hospital-based care." },
    { n: "4", title: "Insurance Coordination", text: "Approvals and claims management." },
    { n: "5", title: "Evacuation (if needed)", text: "Cross-border medical logistics." },
    { n: "6", title: "Recovery & Follow-Up", text: "Full resolution and continuity of care." },
  ],
  enableTitle: "What We Enable for Our Partners",
  enable: {
    "insurance-assistance-companies": { title: "Insurance & Assistance", text: "Faster case handling, cost control, and reliable provider network." },
    "hotels-and-resorts": { title: "Hotels & Resorts", text: "Guest safety, on-site medical presence, reduced operational risk." },
    "tour-operators-travel-agencies": { title: "Tour Operators", text: "Medical support throughout the traveler journey." },
    "healthcare-providers": { title: "Healthcare Providers", text: "Access to international patient flow and structured case management." },
  },
  insurersLead: "Working directly with leading international insurers and assistance providers worldwide.",
  system: {
    title: "Not a Provider. A System.",
    lines: [
      "HCIG is not just a healthcare provider.",
      "We are a structured system designed to manage patient flow across multiple levels of care, ensuring clarity, speed, and full control over every case.",
    ],
  },
  closing: {
    title: "Let’s Build a Smarter Healthcare Model Together",
    text: "Partner with HCIG to deliver faster, more reliable, and fully coordinated healthcare solutions across international markets.",
    primary: "Become a Partner",
    secondary: "Schedule a Call",
    note: "We respond within 24 hours | Confidential | Global support",
  },
  src: "live-partner",
};

export const CONTACT_PAGE = {
  meta: { title: "Contact HCIG | Medical Tourism Experts in Egypt", src: "live-fix" }, // live: "egypt" lower case
  eyebrow: "Leave Your Message",
  title: "Get in Touch with Us",
  lead: "Whether you need immediate medical support, treatment planning, or partnership collaboration our team is ready to respond 24/7.",
  note: "We respond within 24 hours | Confidential | Global support",
  labels: { address: "Address", phone: "Phone", email: "E-mail" }, // live
  form: {
    // new, for his review: plain form labels
    name: "Full name", company: "Company", mail: "Work email", phone: "Phone", type: "I am a", message: "Your message",
    send: "Send message", sent: "Thank you. Our team will reply within 24 hours.", privacy: "Secure & confidential communication",
    src: "new",
  },
  offices: { cairo: "Cairo, Egypt", florida: "Clearwater, Florida, USA", src: "new" },
  map: { text: "Open in Google Maps", src: "new" },
  src: "live-contacts",
};

// The six partner types: words from the live home (Who We Work With) and the live partner page; slugs from the URL contract
export const PARTNER_TYPES = [
  { slug: "insurance-assistance-companies", icon: "shield", img: "built-insurance" },
  { slug: "embassies-government", icon: "embassy", img: "embassy-meeting" },
  { slug: "hotels-and-resorts", icon: "hotel", img: "built-hospitality", maritime: true },
  { slug: "tour-operators-travel-agencies", icon: "plane", img: "traveller-centre" },
  { slug: "healthcare-providers", icon: "hospital", img: "built-training" },
  { slug: "corporate-international-organisations", icon: "corporate", img: "svc-corporate" },
];

// The seven service lines: their live text (home) plus the live capabilities (services page) that make each one work
export const SERVICE_LINES = [
  { slug: "hospital-specialty-services", caps: ["Advanced Diagnostics & Treatment", "Medical Coordination & Case Management", "Recovery & Follow-Up Care"] },
  { slug: "medical-tourism-facilitation", caps: ["Medical Coordination & Case Management", "Insurance & Claims Management", "Recovery & Follow-Up Care", "Elite Medical Concierge Service"] },
  { slug: "emergency-urgent-care", caps: ["Immediate Medical Access", "Telemedicine & Remote Medical Support", "Medical Evacuation & Repatriation"] },
  { slug: "wellness-longevity-aesthetic-care", caps: ["Recovery & Follow-Up Care", "Telemedicine & Remote Medical Support", "Elite Medical Concierge Service"] },
  { slug: "corporate-healthcare-solutions", caps: ["Medical Coordination & Case Management", "Insurance & Claims Management", "Telemedicine & Remote Medical Support"] },
  { slug: "elite-medical-concierge", caps: ["Elite Medical Concierge Service", "Medical Coordination & Case Management", "Immediate Medical Access"] },
  { slug: "accreditation-training", caps: ["Medical Coordination & Case Management"] },
];

// Group, Network, Trust (fact sheet sections 1, 2, 4, 5 and 6, approved 2026-10-26)
export const GROUP_PAGE = {
  meta: { title: "Our Premises and Facilities | Healthcare International Group", src: "new" },
  title: "Our Premises and Facilities", // live
  line: "Integrated healthcare group all over the world", // approved
  visit: { text: "Visit website", src: "new" },
  places: {
    title: { text: "MedPark", src: "live" },
    hub: { name: "MedPark Health Hub", place: "Sahl Hasheesh Road, Hurghada", img: "about-hub", src: "fact-sheet" },
    hospital: { name: "MedPark Hospital", place: "El Quseir", img: "medpark-hospital", src: "fact-sheet" },
  },
};

export const NETWORK_PAGE = {
  meta: { title: "Our Main Hubs | Healthcare International Group", src: "owner" },
  title: { text: "Our Main Hubs", src: "owner" }, // his words 2026-10-30 (was "Where We Operate")
  sub: { text: "We operate globally and serve patients everywhere", src: "owner" }, // his words 2026-10-30
  lead: { text: "Operating across multiple markets, HCIG supports international patients, insurers, and global partners with structured, reliable, and scalable healthcare solutions.", src: "live-about" },
  countries: [
    { name: "Egypt", note: "150+ On-Site Clinics Across Egypt", office: 0 },
    { name: "United Arab Emirates" },
    { name: "Germany" },
    { name: "Spain" },
    { name: "United States", office: 1 },
  ],
  countriesSrc: "fact-sheet (company profile, his answer 2026-10-26: five countries); 2026-10-30 he set them as our main hubs, not the only places we serve",
  officesTitle: { text: "Our offices", src: "new" },
};

export const TRUST_PAGE = {
  meta: { title: "Trust and Standards | Healthcare International Group", src: "new" },
  title: { text: "Trust and Standards", src: "new" },
  lead: { text: "We operate in line with internationally recognized medical standards and trusted global partnerships.", src: "live (Why: Global Standards & Accreditation)" },
  partnership: { text: "Healthcare International Group (HCIG) is the Official Partner of Global Healthcare Accreditation™ (GHA) and the German Medical Wellness Association (DMWV) in Egypt", src: "live" },
  partners: [
    { name: "Global Healthcare Accreditation (GHA)", logo: "gha", post: 5 },
    { name: "German Medical Wellness Association (DMWV)", logo: "dmwv", post: 3 },
  ],
  uca: { text: "24/7 Clinics becomes the first urgent care organization outside the United States accredited by the Urgent Care Association", post: 15, src: "live (blog)" },
  eventsTitle: { text: "Where we show up", src: "new" },
  events: [13, 6, 12, 10, 9, 8],
};

// Press room (/press/): facts, boilerplate, news and the media kit. Facts and boilerplate are live words or the brand
// guideline's elevator pitch (word for word); labels are new and wait for his review.
export const PRESS_PAGE = {
  meta: { title: "Press Room | Healthcare International Group (HCIG)", src: "new" },
  title: { text: "Press Room", src: "new" },
  lead: { text: "News, facts and brand assets about Healthcare International Group, for journalists, event organisers and partners.", src: "new" },
  glance: { text: "HCIG at a glance", src: "plan (approved)" },
  facts: [
    { v: "40+", t: "Years of Experience" },
    { v: "600K+", t: "Patients Served" },
    { v: "700+", t: "Medical Professionals" },
    { v: "150+", t: "On-Site Clinics Across Egypt" },
  ],
  factsSrc: "live",
  partner: { text: "Official Partner of Global Healthcare Accreditation (GHA) and the German Medical Wellness Association (DMWV) in Egypt", src: "live" },
  aboutTitle: { text: "About HCIG", src: "new" },
  short: { label: "In one line", src: "new" },
  long: { label: "Boilerplate", src: "new" },
  pitch: { text: "HCIG is Egypt’s most trusted name in medical assistance and medical tourism. As the official partner of Global Healthcare Accreditation (GHA), we bring international standards into every hospital, clinic, and patient journey. With a nationwide network and a commitment to excellence, HCIG ensures that every patient, tourist, and partner experiences healthcare they can trust, anytime, anywhere.", src: "guideline (Elevator Pitch, page 24)" },
  copy: { text: "Copy", src: "new" },
  copied: { text: "Copied", src: "new" },
  newsTitle: { text: "Our News & Updates", src: "owner" },
  kitTitle: { text: "Media kit", src: "new" },
  kitLead: { text: "Use the logo as supplied, on a clear background, in its own colours.", src: "new (from the guideline logo rules)" },
  logos: [
    { key: "logo-h-black", name: "Logo, black", ground: "light" },
    { key: "logo-h-white", name: "Logo, white", ground: "dark" },
    { key: "mark-black", name: "HC mark, black", ground: "light" },
    { key: "mark-white", name: "HC mark, white", ground: "dark" },
  ],
  download: { text: "Download PNG", src: "new" },
  colours: { text: "Brand colours", src: "new" },
  palette: [
    { name: "Black", hex: "#000000" },
    { name: "Dim Gray", hex: "#565759" },
    { name: "Turquoise", hex: "#12C0C6" },
    { name: "White", hex: "#FFFFFF" },
  ],
  type: { text: "Typefaces", src: "new" },
  fonts: [{ name: "Helma", use: "Headings" }, { name: "Inter", use: "Text" }],
  contactTitle: { text: "Media enquiries", src: "new" },
  contactLead: { text: "For interviews, event invitations and brand assets, write to us.", src: "new" },
};
