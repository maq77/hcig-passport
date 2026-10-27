import type { Metadata } from "next";
import { PARTNER_PAGE } from "@/content/pages.mjs";
import { href } from "@/lib/site";
import { Shell } from "@/components/site/Shell";
import { CtaBand, PageHero } from "@/components/site/PageHero";
import { PartnerHubBody } from "@/components/site/Partners";
import { Insurers, Maritime } from "@/components/home/Lower";
import { SheetLink } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: { absolute: PARTNER_PAGE.meta.title }, description: PARTNER_PAGE.lead };

export default function PartnerPage() {
  const P = PARTNER_PAGE;
  return (
    <Shell>
      <main id="main">
        <PageHero
          crumbs={[{ label: "Home", path: "/" }, { label: "For Partners", path: "/partner/" }]}
          eyebrow={P.eyebrow}
          title={<>{P.title.lead} <span className="acc">{P.title.accent}</span></>}
          lead={P.lead}
          image="built-global"
          imageAlt="Medical coordinators in front of a world map of patient routes"
          actions={<>
            <a className="btn" href={href("/contacts/")}>{P.primary}<Icon name="arrow" /></a>
            <SheetLink className="btn2">{P.secondary}</SheetLink>
          </>}
          note={P.note}
        />
        <PartnerHubBody />
        <Insurers />
        <Maritime />
        <CtaBand
          title={P.closing.title}
          text={P.closing.text}
          note={P.closing.note}
          actions={<>
            <a className="btn" href={href("/contacts/")}>{P.closing.primary}<Icon name="arrow" /></a>
            <SheetLink className="btn2">{P.closing.secondary}</SheetLink>
          </>}
        />
      </main>
    </Shell>
  );
}
