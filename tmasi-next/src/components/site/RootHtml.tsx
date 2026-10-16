import Script from "next/script";
import SmoothScroll from "@/components/SmoothScroll";
import { bebas, bigNoodle, montserrat } from "@/app/fonts";
import { BASE_PATH } from "@/lib/asset";

// The live tmasi.net tags, copied at go-live (his pick, 2026-10-16): GTM-PN6F2FFK, Google tags G-905JHCMETP and
// GT-MJKDN68P (one gtag.js load for both; the old site loaded it twice) and Yandex Metrica 110788743 with the same
// settings (script ids must not be "ym" or "gtag": an element id becomes a window name and blocks the call). Only the real site carries them: the HCIG Work preview (base path set) never reports into live analytics.
const LIVE = BASE_PATH === "";
const GTM = "GTM-PN6F2FFK";
const GTAGS = ["G-905JHCMETP", "GT-MJKDN68P"];
const YM = 110788743;

function Tags() {
  return (
    <>
      <Script id="tmasi-gtm-init" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM}');`}</Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GTAGS[0]}`} strategy="afterInteractive" />
      <Script id="tmasi-gtag-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${GTAGS.map((id) => `gtag('config','${id}');`).join("")}`}</Script>
      <Script id="tmasi-ym-init" strategy="afterInteractive">{`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YM}','ym');ym(${YM},'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});`}</Script>
      <noscript>
        <iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} title="Google Tag Manager" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://mc.yandex.ru/watch/${YM}`} style={{ position: "absolute", left: "-9999px" }} alt="" />
      </noscript>
    </>
  );
}

// The <html> of every language: its own lang attribute, the two brand fonts, the Jotform agent.
// data-scroll-behavior: the site scrolls smoothly within a page, and this tells Next 16 to switch
// that off while it changes page. Without it, a menu click starts a smooth scroll down to the new
// page's footer and ends there.
export default function RootHtml({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <html lang={lang} className={`${montserrat.variable} ${bigNoodle.variable} ${bebas.variable}`} data-scroll-behavior="smooth">
      <body className="antialiased">
        {/* Without JavaScript the scroll reveals never run: show every block as it is. */}
        {LIVE && <Tags />}
        <noscript><style>{".reveal,.rv-item{opacity:1!important;transform:none!important}"}</style></noscript>
        <SmoothScroll>{children}</SmoothScroll>
        {/* Jotform AI agent (the chat at bottom right), the same embed as the live tmasi.net footer. */}
        <Script src="https://cdn.jotfor.ms/agent/embedjs/0199f6528e8c7651bd7eaff1d0a4518f2b08/embed.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
