import Script from "next/script";
import SmoothScroll from "@/components/SmoothScroll";
import { bebas, bigNoodle, montserrat } from "@/app/fonts";

// The <html> of every language: its own lang attribute, the two brand fonts, the Jotform agent.
// data-scroll-behavior: the site scrolls smoothly within a page, and this tells Next 16 to switch
// that off while it changes page. Without it, a menu click starts a smooth scroll down to the new
// page's footer and ends there.
export default function RootHtml({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <html lang={lang} className={`${montserrat.variable} ${bigNoodle.variable} ${bebas.variable}`} data-scroll-behavior="smooth">
      <body className="antialiased">
        {/* Without JavaScript the scroll reveals never run: show every block as it is. */}
        <noscript><style>{".reveal{opacity:1!important;transform:none!important}"}</style></noscript>
        <SmoothScroll>{children}</SmoothScroll>
        {/* Jotform AI agent (the chat at bottom right), the same embed as the live tmasi.net footer. */}
        <Script src="https://cdn.jotfor.ms/agent/embedjs/0199f6528e8c7651bd7eaff1d0a4518f2b08/embed.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
