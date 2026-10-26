// Home words. Every string carries its source (BRAIN.md rule 1).
//   live: healthcareig.com as captured 2026-10-26 (brand guideline/HCIG Content.txt, hcig-v6/material/live-capture/)
//   live-fix: live words with a logged punctuation fix only (WORKLOG.md)
//   manager: the Maritime & Cruise copy (src/content/manager/)
//   approved: words he approved on a v3 board (group section line, 2026-10-22; confirmed "Both" 2026-10-26)
//   ref: words from his reference image (hcig material/ref image.jpeg), shown to him for approval
//   new: written for v6, marked for his approval

export const NAV = [
  { label: "Home", path: "/", src: "live" },
  { label: "About Us", path: "/about/", src: "live" },
  { label: "Services", path: "/services/", src: "live" },
  { label: "Maritime & Cruise", path: "/maritime-cruise-healthcare/", src: "manager" },
  { label: "For Partners", path: "/partner/", src: "live" },
  { label: "Contact", path: "/contacts/", src: "live" },
  { label: "Blog", path: "/blog/", src: "live" },
];

export const LANGS = [
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "pl", name: "Polski" },
  { code: "fr", name: "Français" },
  { code: "it", name: "Italiano" },
  { code: "es", name: "Español" },
  { code: "cs", name: "Čeština" },
];

export const HERO = {
  h1: { text: "Integrated Healthcare Ecosystem for International Patients and Travel Industry", accentFrom: 4, src: "live" },
  sub: { text: "Structured Healthcare Solutions for International Patients and Global Partners", src: "live" },
  lead: {
    text: "Healthcare International Group (HCIG) is built to manage the full patient journey from first medical contact to advanced treatment and international coordination.",
    src: "live",
  },
  ctaPrimary: { text: "Talk to our team", src: "live" },
  ctaSecondary: { text: "Become a Partner", src: "live" },
  partner: {
    text: "Healthcare International Group (HCIG) is the Official Partner of Global Healthcare Accreditation™ (GHA) and the German Medical Wellness Association (DMWV) in Egypt",
    src: "live",
  },
};

export const INSURERS = {
  stat: "100%",
  title: "Trusted by Global Insurance & Assistance Networks",
  text: "We work directly with leading international insurers and assistance companies ensuring fast approvals, efficient coordination, and a fully cashless patient experience.",
  tagline: "Direct integration. Faster decisions. Seamless care delivery.",
  src: "live",
  // the 23 logos on the live partner page (hcig-v3/material/live-site/assets/partner/img/logos1.jpeg), in its order
  logos: [
    "Lloyds", "Aviva", "AXA", "Post Office", "ADAC", "UNIQA", "Leisure Guard", "Admiral", "adec", "Gouda", "Europe Insurance",
    "CoverWise", "Liberty Mutual", "Vienna Insurance Group", "Allianz", "HanseMerkur", "ERV", "ERGO Hestia", "AllClear",
    "ERGO", "Mondial Assistance", "avanti", "Groupama",
  ],
};

export const ABOUT = {
  heading: "About Us",
  paras: [
    "With over 40 years of experience, Healthcare International Group (HCIG) is built to manage the full patient journey across international healthcare markets.",
    "Rather than operating as a traditional healthcare provider, HCIG brings structure to a system that is often fragmented connecting urgent care, hospital treatment, and international medical coordination within one clear model.",
    "Our ecosystem spans on-site medical services in hotels and resorts, advanced hospital care, and direct coordination with insurance and assistance partners.",
  ],
  ensureIntro: "This approach allows us to ensure:",
  ensure: ["faster access to care", "clear responsibility across the case", "seamless patient management from first contact to resolution"],
  closing: "Operating across multiple markets, HCIG supports international patients, insurers, and global partners with structured, reliable, and scalable healthcare solutions.",
  // live: "We don’t just provide healthcare we manage it." Punctuation fix logged (same words).
  statement: { text: "We don’t just provide healthcare. We manage it.", src: "live-fix" },
  // the About band's route: the live sentence's own words ("connecting urgent care, hospital treatment, and
  // international medical coordination within one clear model")
  route: { items: ["urgent care", "hospital treatment", "international medical coordination"], src: "live" },
  stats: [
    { n: 40, suffix: "+", label: "Years of Experience" },
    { n: 600, suffix: "K+", label: "Patients Served" },
    { n: 350, suffix: "+", label: "Medical Professionals" },
  ],
  src: "live",
};

export const GROUP = {
  heading: { text: "Our Premises and Facilities", src: "live" },
  line: { text: "Integrated healthcare group all over the world", src: "approved" },
  soundOn: { text: "Play with sound", src: "approved" },
  soundOff: { text: "Sound off", src: "approved" },
  filmLabel: { text: "The HCIG group film: the HC mark opens into the eight group brands", src: "approved" },
  listLabel: { text: "The group brands", src: "approved" },
  brands: [
    { short: "24/7 Clinic", name: "24/7 Clinic", line: "On-Site Urgent Care & Emergency Services in Hotels & Resorts", url: "https://247clinic.net", logo: "brand-247" },
    { short: "MedPark", name: "MedPark Health Group", line: "Advanced Hospital & Emergency Medical Services", url: "https://medparkhospitals.com", logo: "brand-medpark" },
    { short: "MedOne", name: "MedOne Group", line: "Travel Medical Services & Care Coordination", url: "https://medoneclinic.net", logo: "brand-medone" },
    { short: "TMASI", name: "TMASI GLOBAL", line: "International Medical Assistance & Case Coordination", url: "https://tmasi.net", logo: "brand-tmasi" },
    { short: "One Medical Center", name: "One Medical Center (Florida - USA)", line: "Urgent Care & Outpatient Medical Services", url: "https://onemedicalcenters.com", logo: "brand-onemedical" },
    { short: "One Medical Spa", name: "One Medical Spa (Florida - USA)", line: "Aesthetic & Medical Wellness Services", url: "https://onemedspa.net", logo: "brand-onespa" },
    { short: "SCMG", name: "Shakankiry Clinics Medical Group", line: "Travel Medical Services", url: "https://scmg-egypt.com", logo: "brand-scmg" },
    { short: "UCA MENA", name: "UCA MENA", line: "Urgent Care Association Egypt & MENA", url: "https://ucamena.org", logo: "brand-uca" },
  ],
};

// The signature visual from his reference image: the traveller at the centre, every service around them.
export const ECOSYSTEM = {
  centre: { text: "The traveller at the centre", src: "ref" },
  centreSub: { text: "Protected · Supported · Safe", src: "ref" },
  tagline: { text: "Wherever the journey leads, support is already around you.", src: "ref" },
  nodes: [
    { label: "24/7 Assistance", icon: "headset" },
    { label: "Telemedicine", icon: "telemed" },
    { label: "Hotel / Resort Clinics", icon: "hotel" },
    { label: "Urgent Care", icon: "cross" },
    { label: "Hospitals", icon: "hospital" },
    { label: "Ambulance", icon: "ambulance" },
    { label: "Pharmacy", icon: "pill" },
    { label: "Medical Evacuation & Repatriation", icon: "plane" },
    { label: "Insurance / Cashless Coordination", icon: "shield" },
    { label: "Language Support", icon: "language" },
    { label: "Wellness & Recovery", icon: "leaf" },
    { label: "Follow-up Care", icon: "clipboard" },
  ],
  src: "ref",
};

export const SYSTEM = {
  heading: "How Our System Works",
  steps: [
    { n: "01", title: "Immediate Access & First Response", text: "Patients receive immediate medical support through on-site clinics, urgent care centers, or coordinated medical access points." },
    { n: "02", title: "Case Ownership & Medical Coordination", text: "Each case is taken under full control with continuous coordination between providers, insurers, and partners." },
    { n: "03", title: "Escalation to Advanced Care", text: "When required, patients are transferred to hospital-level treatment within our network or partner facilities." },
    { n: "04", title: "Evacuation & Repatriation", text: "For critical or complex cases, we organize medical evacuation or repatriation across countries with full logistical and medical coordination." },
    { n: "05", title: "Insurance & Claims Management", text: "We work directly with insurance and assistance companies, ensuring efficient approvals, documentation, and claims handling." },
    { n: "06", title: "Follow-Up & Case Closure", text: "We continue managing the patient journey until full recovery or case resolution ensuring continuity and quality of care." },
  ],
  src: "live",
};

export const MISSION = {
  mission: {
    heading: "Our mission",
    paras: [
      "To build and scale a healthcare ecosystem that redefines how patient care is accessed, managed, and delivered across international markets.",
      "To take full responsibility for the patient journey ensuring speed, clarity, and control from the first point of contact to resolution.",
      "To lead the transformation of healthcare by working with insurers, providers, and global partners to eliminate fragmentation and establish a more efficient, transparent, and globally connected model of care.",
    ],
  },
  vision: {
    heading: "Our vision",
    paras: [
      "To define the future of global healthcare by setting a new standard for how medical services are delivered across borders.",
      "We envision a world where healthcare is no longer fragmented or reactive, but structured, predictable, and seamlessly embedded into global travel, hospitality, and everyday life.",
    ],
  },
  cta: "Talk to our team",
  src: "live",
};

export const WHY = {
  heading: "Why partners choose HCIG",
  sub: "Designed for insurers, global partners, and international patients.",
  items: [
    { title: "Full Patient Ownership", text: "We take full responsibility for every patient journey from first contact to full recovery.", icon: "ownership" },
    { title: "Connected Care Delivery", text: "We operate a healthcare ecosystem where all services work as one coordinated system.", icon: "network" },
    { title: "Speed & Responsiveness", text: "We act immediately, ensuring fast access to care when every moment matters.", icon: "speed" },
    { title: "Global Standards & Accreditation", text: "We operate in line with internationally recognized medical standards and trusted global partnerships.", icon: "standard" },
    { title: "Hospitality Integration", text: "We seamlessly integrate healthcare into the hospitality experience for international patients.", icon: "hotel" },
    { title: "Cultural Intelligence", text: "We understand international patients and adapt care to their expectations, culture, and mindset.", icon: "language" },
    { title: "Partner Development & Accreditation Support", text: "We don’t just work with partners we develop them. Through training, operational support, and accreditation guidance, we help healthcare providers reach international standards and integrate into the global medical tourism ecosystem.", icon: "growth" },
  ],
  src: "live",
};

export const BUILT = {
  heading: "Built for Global Healthcare Delivery",
  sub: "Designed to operate across borders, support international patients, and deliver consistent care in complex environments",
  items: [
    { title: "Multilingual Medical Teams", text: "Our teams operate across multiple languages, ensuring clear communication with international patients, insurers, and global partners.", icon: "language" },
    { title: "Global Presence & Network", text: "We operate across key international markets, with facilities and trusted partners in major travel destinations.", icon: "globe" },
    { title: "Insurance & Assistance Integration", text: "We work directly with global insurers and assistance companies, ensuring faster approvals, efficient coordination, and streamlined case management.", icon: "shield" },
    { title: "Training & Partner Development", text: "We support healthcare providers through training, operational guidance, and accreditation pathways helping them meet international standards and grow within the global medical tourism ecosystem.", icon: "growth" },
    { title: "Hospitality & Travel Integration", text: "Our model is designed to operate inside hotels, resorts, and travel environments bringing healthcare closer to the patient.", icon: "hotel" },
    { title: "Operational Control & Scalability", text: "Our system is built to scale across regions while maintaining full control, transparency, and consistency in care delivery.", icon: "control" },
  ],
  closing: "Built to perform under pressure. Structured to deliver at scale.",
  src: "live",
};

export const HEALTHCARE = {
  heading: "Our Healthcare",
  sub: "Delivered across multiple levels of care within one structured system.",
  // " - " in the live text becomes a full stop (logged punctuation fix, same words)
  items: [
    { title: "Hospital & Specialty Services", text: "Advanced inpatient and outpatient care delivered through our hospital network. Supported by full diagnostic capabilities, laboratory services, imaging, and specialized medical treatment across multiple disciplines.", img: "svc-hospital", path: "/services/hospital-specialty-services/" },
    { title: "Medical Tourism Facilitation", text: "End-to-end patient journey management for international patients. From initial coordination to treatment, travel logistics, medication support, and post-care follow-up.", img: "svc-tourism", path: "/services/medical-tourism-facilitation/" },
    { title: "Emergency & Urgent Care", text: "24/7 immediate medical access through on-site clinics, urgent care centers, and integrated pharmacy support. Ensuring fast treatment and medication availability at the point of care.", img: "svc-urgent", path: "/services/emergency-urgent-care/" },
    { title: "Wellness, Longevity & Aesthetic Care", text: "Preventive, recovery, and lifestyle-focused medical services designed to support long-term health, wellbeing, and performance.", img: "svc-wellness", path: "/services/wellness-longevity-aesthetic-care/" },
    { title: "Corporate Healthcare Solutions", text: "Tailored healthcare programs for organizations, insurers, and international partners. Ensuring access, continuity, and efficient care management across global operations.", img: "svc-corporate", path: "/services/corporate-healthcare-solutions/" },
    { title: "Elite Medical Concierge Service", text: "High-touch, personalized medical support with full coordination across all HCIG services, ensuring a seamless and stress-free patient experience.", img: "svc-concierge", path: "/services/elite-medical-concierge/" },
    { title: "Accreditation & Training Services", text: "Supporting healthcare providers through training, operational consulting, and accreditation pathways to meet international standards and integrate into global medical networks.", img: "svc-accreditation", path: "/services/accreditation-training/" },
  ],
  src: "live-fix",
};

export const MARITIME = {
  eyebrow: "MARITIME & CRUISE HEALTHCARE",
  heading: "Extending Our Healthcare Ecosystem Beyond the Shore.",
  paras: [
    "Healthcare International Group brings its healthcare infrastructure and medical operations expertise to the maritime industry, supporting cruise operators with onboard clinic establishment, medical recruitment, complete clinical operations, and integrated shore-side healthcare.",
    "From one onboard doctor to the management of medical services across an entire fleet, we connect onboard healthcare with international medical assistance, hospitals, emergency transport, and patient coordination through one structured system.",
  ],
  chips: ["Onboard Medical Clinics", "Doctors & Nurses", "Fleet Medical Management", "Shore-Side Assistance", "Evacuation & Repatriation"],
  cta: "Discover Our Maritime Healthcare Solutions",
  src: "manager",
};

export const TESTIMONIALS = {
  heading: { text: "Testimonials", src: "live" },
  videos: [
    { key: "testimonial-1", label: { text: "Patient testimonial 1", src: "new" } },
    { key: "testimonial-2", label: { text: "Patient testimonial 2", src: "new" } },
    { key: "testimonial-3", label: { text: "Patient testimonial 3", src: "new" } },
  ],
  watch: { text: "Watch", src: "new" },
  reviewsTitle: { text: "MedPark Health Hub on Google", src: "new" },
  reviewsLink: { text: "Review us on Google", src: "google" },
  // MedPark Health Hub's Google profile, as its live Elfsight widget shows it on medparkhospitals.com/healthhub.php
  // (checked 2026-10-26, and pasted by the owner the same day). Reviews word for word; relative dates left out.
  reviews: {
    rating: "4.8",
    count: "292",
    url: "https://maps.google.com/?cid=8921907815233210791",
    items: [
      { name: "Sandra Munz", text: "We were very well taken care of; the doctor and the nurses were very kind and helped us with everything. They handled all the arrangements with our insurance company in Germany and were always very attentive. We felt like we were in good hands ❤️" },
      { name: "Navn Kaur", text: "Very helpful- had a quad bike accident & they helped me to clean it and sanitise the wound. Would definitely recommend them!" },
      { name: "Anja Lazendic", text: "Very nice and professional, quick help. And a big thank you to Mustafa and Anna." },
      { name: "Mia", text: "Very nice staff and a big thank you to mustafa for helping me!" },
    ],
    src: "google",
  },
  momentsLabel: { text: "HCIG moments", src: "new" },
};

export const CEO = {
  quote: "Success isn’t measured only by the number of visitors a destination attracts. It’s measured by how well those visitors are cared for when they need help the most.",
  name: "Dr. Amr Abbass",
  role: "Group CEO, Healthcare International Group",
  src: "live",
};

export const WHO = {
  heading: "Who We Work With",
  sub: "Designed to support partners operating in international and high-demand environments.",
  items: [
    { title: "Insurance & Assistance Companies", text: "Direct medical coordination, case management, and seamless integration with global insurance networks.", path: "/partner/insurance-assistance-companies/", icon: "shield" },
    { title: "Embassies & Government Institutions", text: "Medical support for diplomatic missions, consular staff, and international delegations.", path: "/partner/embassies-government/", icon: "embassy" },
    { title: "Hotels, Resorts & Cruise Lines", text: "On-site clinics, emergency response, and integrated medical services for guests and travelers.", path: "/partner/hotels-and-resorts/", icon: "hotel" },
    { title: "Tour Operators & Travel Agencies", text: "Medical support solutions for travelers, including emergency response, coordination, and access to care throughout the journey.", path: "/partner/tour-operators-travel-agencies/", icon: "plane" },
    { title: "Healthcare Providers", text: "Partnerships, referrals, and access to international patient flow through coordinated care networks.", path: "/partner/healthcare-providers/", icon: "hospital" },
    { title: "Corporate Clients & International Organizations", text: "Tailored healthcare solutions for companies operating across borders and complex environments.", path: "/partner/corporate-international-organisations/", icon: "corporate" },
  ],
  src: "live",
};

export const IMPACT = {
  heading: "Our Impact",
  items: [
    { stat: "135+", text: "On-Site Clinics Across Egypt" },
    { stat: "24/7", text: "Medical Coverage in Key Travel Destinations" },
    { stat: "", text: "Direct Partnerships with Global Insurers" },
    { stat: "", text: "Thousands of International Patients Managed Annually" },
  ],
  src: "live",
};

export const CTA = {
  heading: "Let’s Build Healthcare Without Fragmentation",
  text: "Partner with HCIG to deliver structured, reliable, and internationally integrated healthcare solutions.",
  primary: "Become a Partner",
  secondary: "Request a Consultation",
  src: "live",
  newsletter: {
    label: { text: "Partner news from HCIG", src: "new" },
    field: { text: "Work email", src: "new" },
    button: { text: "Subscribe", src: "new" },
    note: { text: "Occasional updates for partners. Unsubscribe at any time.", src: "new" },
  },
};

export const CONTACT = {
  heading: "Contact",
  phones: ["+2 01001828828", "+2 01287766078"],
  email: "partner@healthcareig.com",
  offices: [
    "123 Hassan ElMaamoun St., Sixth Floor, Suite 604, Nasr City, Cairo, Egypt",
    "2251 Drew St, Suite A, Clearwater, FL 33765, Florida, USA",
  ],
  whatsapp: "+201001828828",
  copyright: "2026 Healthcare International Group. All Rights Reserved. Powered by",
  pulse: "PULSE Marketing",
  src: "live",
};

export const UI = {
  home: { text: "Healthcare International Group, home", src: "new" },
  menu: { text: "Menu", src: "new" },
  mainNav: { text: "Main", src: "new" },
  toDay: { text: "Switch to day", src: "new" },
  toNight: { text: "Switch to night", src: "new" },
  readMore: { text: "Read more", src: "new" },
  readLess: { text: "Show less", src: "new" },
  visit: { text: "Visit website", src: "new" },
  close: { text: "Close", src: "new" },
  whatsapp: { text: "WhatsApp", src: "new" },
  call: { text: "Call", src: "new" },
  email: { text: "Email", src: "new" },
  thanks: { text: "Thank you. You are on the list.", src: "new" },
  skip: { text: "Skip to content", src: "new" },
  prev: { text: "Previous", src: "new" },
  next: { text: "Next", src: "new" },
};
