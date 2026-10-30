import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { HERO, UI } from "@/content/home.mjs";
import { IS_PREVIEW, LANG, file } from "@/lib/site";

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

// The live site's own tags, carried over as they run on healthcareig.com today (owner 2026-10-30: "Same tags as today"):
// Google Ads AW-17729597588, GA4 G-W184QV2179, Google tag GT-NGWMPX7J, and Yandex Metrika (German pages 110788548,
// every other language 110788507, as the old English and German headers did). Live build only; the preview has none.
const GTAG = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-17729597588');gtag('config','G-W184QV2179');gtag('config','GT-NGWMPX7J');`;
const YM_ID = LANG === "de" ? 110788548 : 110788507;
const YM = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}','ym');ym(${YM_ID},'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});`;

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={LANG} className={`${sans.variable} ${display.variable}`}>
      <head>
        <noscript>
          <style>{`[data-rv]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {IS_PREVIEW ? null : (
          <>
            <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17729597588" />
            <script dangerouslySetInnerHTML={{ __html: GTAG }} />
            <script dangerouslySetInnerHTML={{ __html: YM }} />
          </>
        )}
      </head>
      <body>
        <a className="skip" href="#main">{UI.skip.text}</a>
        {children}
        {IS_PREVIEW ? null : (
          <noscript><div><img src={`https://mc.yandex.ru/watch/${YM_ID}`} style={{ position: "absolute", left: "-9999px" }} alt="" /></div></noscript>
        )}
      </body>
    </html>
  );
}
