import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { global, section } from "@/content/load";
import { APPROVED, BRIEF, THEIRS } from "@/content/brief";
import { asset, IS_PREVIEW } from "@/data/facts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { MediaShimmer } from "@/components/ui/MediaShimmer";
import { RevealObserver, Tracker } from "@/components/ui/Motion";

const sans = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans", display: "swap" });
/* Cormorant Garamond for h1, h2 and large quotes (spec 015): 300 and 400, upright only. */
const lux = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400"], style: ["normal"], variable: "--font-lux", display: "swap" });
/* Calisto MT, licensed, supplied by the user 2026-09-23. Latin subsets built by scripts/fonts.mjs.
   Numbers, step numerals and the tagline only (the .num role). */
const display = localFont({
  src: [
    { path: "../fonts/calisto-400.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["Book Antiqua", "Palatino", "Georgia", "serif"],
});

const hero = section("home", "hero");

/* Meta from the brief's own lines (spec assumption): h1 + brand, and the opening sentence. */
export const metadata: Metadata = {
  /* their live title, kept (the user, 2026-09-23) */
  title: THEIRS.pageTitle,
  description: hero.body[0],
  robots: IS_PREVIEW ? { index: false, follow: false } : { index: true, follow: true },
  ...(IS_PREVIEW ? {} : { alternates: { canonical: "https://www.247clinic.net/" }, metadataBase: new URL("https://www.247clinic.net") }),
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/logos/marks/247-logo.svg` },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FBF8F4" };

/* Adds `js` so reveals may start hidden, and takes it away again after 3 s if the
   app never marked itself ready. Content can never stay hidden (the v2 lesson). */
/* js gate + the opening curtain once per visit (sessionStorage), never under reduced motion. */
const JS_GATE = `(function(d){d.classList.add('js');try{if(sessionStorage.getItem('c7intro')||matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('intro-seen');else sessionStorage.setItem('c7intro','1')}catch(e){d.classList.add('intro-seen')}setTimeout(function(){if(!d.classList.contains('rv-ready'))d.classList.remove('js')},3000)})(document.documentElement)`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const g = global();
  const nav = g.nav.map((n) => n.title);
  return (
    <html lang="en" className={`${sans.variable} ${lux.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_GATE }} />
        <script src="https://www.medparkhospitals.com/dashboard/t.js?s=247clinic" defer />
      </head>
      <body>
        {/* Opening curtain, once per visit (the user, 2026-11-12: "loading state ... loading animation even if it
            doesnt take much time"). v6: 1.2s, ivory, the logo and a red rule draw, then a clip lift. */}
        <div className="oc" aria-hidden="true">
          <div className="oc-in">
            <img src={asset("/logos/marks/247-logo.svg")} alt="" width={120} height={116} />
            <span className="oc-line" />
          </div>
        </div>
        <a className="skip" href="#main">Skip to content</a>
        <Header labels={{ nav, waLong: BRIEF.waUs, waShort: BRIEF.needDoctor, promises: (hero.subheading ?? "").split("•").map((s) => s.trim()), email: THEIRS.email, address: THEIRS.address, accredited: APPROVED.accredited, partOf: APPROVED.partOf }} />
        <main id="main">{children}</main>
        <Footer nav={nav} footerOnly={g.footerOnly.map((n) => n.title)} />
        <WhatsAppFloat prompts={[BRIEF.needDoctor, BRIEF.needHelp, BRIEF.waUs]} sub={BRIEF.sticky} aria={g.whatsapp.floatingText} />
        <RevealObserver />
        <MediaShimmer />
        <Tracker />
      </body>
    </html>
  );
}
