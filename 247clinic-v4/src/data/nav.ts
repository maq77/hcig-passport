/* Paths for the brief's nav (section 4) and footer-only links, in the same order as
   content/247clinic/en/global.json. Live URLs kept, brief URLs for new pages
   (specs/007-247clinic-v3/contracts/urls.md). */
export const NAV = [
  { path: "/" },
  { path: "/services" },
  { path: "/insurance" },
  { path: "/our-clinics" },
  { path: "/for-hotels" },
  { path: "/about-us" },
  { path: "/contact-us" },
];

export const FOOTER_ONLY = [{ path: "/beauty-wellness" }, { path: "/blog" }, { path: "/faqs" }];

export const ROUTES = {
  services: "/services",
  insurance: "/insurance",
  clinics: "/our-clinics",
  accreditation: "/international-accreditation",
};
