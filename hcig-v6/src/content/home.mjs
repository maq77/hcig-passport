// Home words. Every string carries its source (BRAIN.md rule 1).
//   live: healthcareig.com as captured 2026-10-26 (brand guideline/HCIG Content.txt, hcig-v6/material/live-capture/)
//   manager: the Maritime & Cruise copy (src/content/manager/)
//   new: written for v6, shown to the owner on the canvas before use

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
  // h1 split into words; the accent words are the live heading's second half (owner's turquoise rule)
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

export const UI = {
  home: { text: "Healthcare International Group, home", src: "new" },
  menu: { text: "Menu", src: "new" },
  mainNav: { text: "Main", src: "new" },
  toDay: { text: "Switch to day", src: "new" },
  toNight: { text: "Switch to night", src: "new" },
};
