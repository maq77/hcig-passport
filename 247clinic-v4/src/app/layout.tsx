import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "./pages.css";
import "./detail.css";
import "./home-calm.css";
/* v6 header, hero, footer and WhatsApp float (the user, 2026-11-17: "copy the hero and header and footer of v6 to v3"), in theme F since 2026-11-18. Last, so it wins. */
/* v6 layout of the home sections (the user, 2026-11-17: "same spacing and layout in v3"). */
import "./v6-layout.css";
import "./v6-chrome.css";
import "./phone-motion.css";
import { global, section } from "@/content/load";
import { APPROVED, BRIEF, THEIRS } from "@/content/brief";
import { GA4_ID, GSC_TOKEN, IS_PREVIEW, PHONE, PREVIEW_HOST, SITE, SOCIAL } from "@/data/facts";
import { DESTINATIONS } from "@/data/clinics";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { MediaShimmer } from "@/components/ui/MediaShimmer";
import { RevealObserver, Tracker } from "@/components/ui/Motion";

const sans = Poppins({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
/* Theme F (Ms. Irina, 2026-11-18): the brand book's two fonts only. Calisto MT for headlines and numbers,
   Poppins for everything else; Cormorant Garamond is gone from v3.
   Calisto MT, licensed, supplied by the user 2026-09-23. Latin subsets built by scripts/fonts.mjs. */
const display = localFont({
  src: [
    { path: "../fonts/calisto-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/calisto-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["Book Antiqua", "Palatino", "Georgia", "serif"],
});

const hero = section("home", "hero");

/* Meta from the brief's own lines (spec assumption): h1 + brand, and the opening sentence. */
const BP = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
/* Absolute share image: the live domain for the live target, the preview host plus base path otherwise. */
const OG_IMAGE = IS_PREVIEW ? `${PREVIEW_HOST}${BP}/og-image.jpg` : `${SITE}/og-image.jpg`;

export const metadata: Metadata = {
  /* their live title, kept (the user, 2026-09-23) */
  title: THEIRS.pageTitle,
  description: hero.body[0],
  robots: IS_PREVIEW ? { index: false, follow: false } : { index: true, follow: true },
  ...(IS_PREVIEW ? {} : { alternates: { canonical: `${SITE}/` }, metadataBase: new URL(SITE) }),
  /* Search Console HTML-tag verification, only when a token is set for the live build. */
  ...(!IS_PREVIEW && GSC_TOKEN ? { verification: { google: GSC_TOKEN } } : {}),
  icons: {
    icon: [
      { url: `${BP}/favicon.svg`, type: "image/svg+xml" },
      { url: `${BP}/favicon-32.png`, sizes: "32x32", type: "image/png" },
      { url: `${BP}/favicon-16.png`, sizes: "16x16", type: "image/png" },
    ],
    shortcut: `${BP}/favicon.ico`,
    apple: { url: `${BP}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" },
  },
  openGraph: { title: THEIRS.pageTitle, description: hero.body[0], url: IS_PREVIEW ? `${PREVIEW_HOST}${BP}` : `${SITE}/`, siteName: "24/7 Clinic", locale: "en_GB", type: "website", images: [{ url: OG_IMAGE, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: THEIRS.pageTitle, description: hero.body[0], images: [OG_IMAGE] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

/* Adds `js` so reveals may start hidden, and takes it away again after 3 s if the
   app never marked itself ready. Content can never stay hidden (the v2 lesson). */
/* Who we are, for Google and AI answer engines: one organisation and the website, on every page. Facts only from
   facts.ts and the brief (phone, email, address, social pages, the destinations they serve). Clinic pages point
   their MedicalClinic at this @id as parentOrganization. */
const ORG_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalOrganization",
      "@id": `${SITE}/#org`,
      name: "24/7 Clinic",
      alternateName: "24/7 Clinic Travel Medical Services",
      url: `${SITE}/`,
      logo: `${SITE}/logo-512.png`,
      image: `${SITE}/og-image.jpg`,
      description: THEIRS.about,
      telephone: PHONE.tel,
      email: THEIRS.email,
      address: { "@type": "PostalAddress", streetAddress: "123 Hassan ElMaamoun St., Sixth Floor, Suite 604, Nasr City", addressLocality: "Cairo", addressCountry: "EG" },
      areaServed: DESTINATIONS.map((d) => ({ "@type": "City", name: d.name })),
      sameAs: SOCIAL.map((s) => s.href),
      contactPoint: { "@type": "ContactPoint", telephone: PHONE.tel, contactType: "customer service", availableLanguage: ["English"], hoursAvailable: "Mo-Su 00:00-23:59" },
    },
    { "@type": "WebSite", "@id": `${SITE}/#website`, url: `${SITE}/`, name: "24/7 Clinic", inLanguage: "en", publisher: { "@id": `${SITE}/#org` } },
  ],
};

const JS_GATE = `(function(d){d.classList.add('js');setTimeout(function(){if(!d.classList.contains('rv-ready'))d.classList.remove('js')},3000)})(document.documentElement)`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const g = global();
  const nav = g.nav.map((n) => n.title);
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_GATE }} />
        <script src="https://www.medparkhospitals.com/dashboard/t.js?s=247clinic" defer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_LD) }} />
        {/* Google Analytics 4, live build only and only once an ID is set (deploy/live-settings.json). */}
        {!IS_PREVIEW && GA4_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA4_ID}');` }} />
          </>
        )}
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Header labels={{ nav, waLong: BRIEF.waUs, waShort: BRIEF.needDoctor, promises: (hero.subheading ?? "").split("•").map((s) => s.trim()), email: THEIRS.email, address: THEIRS.address, accredited: APPROVED.accredited, partOf: APPROVED.partOf }} />
        <main id="main">{children}</main>
        <Footer nav={nav} footerOnly={g.footerOnly.map((n) => n.title)} />
        <WhatsAppFloat label={BRIEF.waUs} aria={g.whatsapp.floatingText} />
        <RevealObserver />
        <MediaShimmer />
        <Tracker />
      </body>
    </html>
  );
}
