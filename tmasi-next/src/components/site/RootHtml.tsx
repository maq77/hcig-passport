import Script from "next/script";
import SmoothScroll from "@/components/SmoothScroll";
import { bigNoodle, montserrat } from "@/app/fonts";

// The <html> of every language: its own lang attribute, the two brand fonts, the Jotform agent.
export default function RootHtml({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <html lang={lang} className={`${montserrat.variable} ${bigNoodle.variable}`}>
      <body className="antialiased">
        <SmoothScroll>{children}</SmoothScroll>
        {/* Jotform AI agent (the chat at bottom right), the same embed as the live tmasi.net footer. */}
        <Script src="https://cdn.jotfor.ms/agent/embedjs/0199f6528e8c7651bd7eaff1d0a4518f2b08/embed.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
