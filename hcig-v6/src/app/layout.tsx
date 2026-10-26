import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { HERO, UI } from "@/content/home.mjs";
import { IS_PREVIEW, file } from "@/lib/site";

const sans = Inter({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], variable: "--font-inter", display: "swap" });
/* Helma, the guideline display face: one Regular file, shown at a synthetic 600 like the live site. */
const display = localFont({
  src: [{ path: "../fonts/helma.woff2", weight: "400", style: "normal" }],
  variable: "--font-helma",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const metadata: Metadata = {
  title: "Healthcare International Group (HCIG)",
  description: HERO.lead.text,
  robots: IS_PREVIEW ? { index: false, follow: false } : { index: true, follow: true },
  icons: { icon: file("media/mark-black.png") },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <head>
        <noscript>
          <style>{`[data-rv]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <a className="skip" href="#main">{UI.skip.text}</a>
        {children}
      </body>
    </html>
  );
}
