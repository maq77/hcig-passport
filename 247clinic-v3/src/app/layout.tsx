import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { global, section } from "@/content/load";
import { APPROVED, BRIEF, THEIRS } from "@/content/brief";
import { IS_PREVIEW } from "@/data/facts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { RevealObserver, Tracker } from "@/components/ui/Motion";

const sans = Poppins({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
/* Calisto MT, licensed, supplied by the user 2026-09-23. Latin subsets built by scripts/fonts.mjs. */
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
export const metadata: Metadata = {
  /* their live title, kept (the user, 2026-09-23) */
  title: THEIRS.pageTitle,
  description: hero.body[0],
  robots: IS_PREVIEW ? { index: false, follow: false } : { index: true, follow: true },
  ...(IS_PREVIEW ? {} : { alternates: { canonical: "https://www.247clinic.net/" }, metadataBase: new URL("https://www.247clinic.net") }),
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/logos/marks/247-logo.svg` },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

/* Adds `js` so reveals may start hidden, and takes it away again after 3 s if the
   app never marked itself ready. Content can never stay hidden (the v2 lesson). */
const JS_GATE = `(function(d){d.classList.add('js');setTimeout(function(){if(!d.classList.contains('rv-ready'))d.classList.remove('js')},3000)})(document.documentElement)`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const g = global();
  const nav = g.nav.map((n) => n.title);
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_GATE }} />
        <script src="https://www.medparkhospitals.com/dashboard/t.js?s=247clinic" defer />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Header labels={{ nav, waLong: BRIEF.waUs, waShort: BRIEF.needDoctor, promises: (hero.subheading ?? "").split("•").map((s) => s.trim()), email: THEIRS.email, address: THEIRS.address, accredited: APPROVED.accredited, partOf: APPROVED.partOf }} />
        <main id="main">{children}</main>
        <Footer nav={nav} footerOnly={g.footerOnly.map((n) => n.title)} />
        <WhatsAppFloat prompts={[BRIEF.needDoctor, BRIEF.needHelp, BRIEF.waUs]} sub={BRIEF.sticky} aria={g.whatsapp.floatingText} />
        <RevealObserver />
        <Tracker />
      </body>
    </html>
  );
}
