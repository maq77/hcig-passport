import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { bebas, bigNoodle, montserrat } from "./fonts";
import { alternates, LANG_NAMES, LANGS } from "@/lib/site";

// The 404 for any address no page matches. Each language has its own root layout, so there is no
// shared one to build this from; Next renders this full document instead. It only points home.
export const metadata: Metadata = { title: "404 | TMASI Global", robots: "noindex, nofollow" };

export default function GlobalNotFound() {
  const homes = alternates("home");
  return (
    <html lang="en" className={`${montserrat.variable} ${bigNoodle.variable} ${bebas.variable}`}>
      <body className="antialiased">
        <main className="nf">
          <p className="nf-code">404</p>
          <nav aria-label="TMASI Global" className="nf-links">
            {LANGS.map((l) => homes[l] && <Link key={l} href={homes[l]!} lang={l}>{LANG_NAMES[l]}</Link>)}
          </nav>
        </main>
        <style dangerouslySetInnerHTML={{__html: `
          .nf { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px;
            background: #0F205C; color: #ffffff; padding: 24px; text-align: center; }
          .nf-code { margin: 0; font-family: var(--font-display); font-size: clamp(96px, 16vw, 180px); line-height: 1; letter-spacing: 0.04em; }
          .nf-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
          .nf-links a { color: #ffffff; text-decoration: none; font-family: var(--font-montserrat), sans-serif; font-weight: 600; font-size: 15px;
            padding: 12px 22px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.3); transition: background-color .2s ease; }
          .nf-links a:hover, .nf-links a:focus-visible { background: rgba(127,224,225,0.16); border-color: #7fe0e1; }
        `}} />
      </body>
    </html>
  );
}
