import type { Metadata } from "next";
import { CTA, T } from "@/content/home.mjs";
import { SERVICES_PAGE } from "@/content/pages.mjs";
import { href } from "@/lib/site";
import { Shell } from "@/components/site/Shell";
import { CtaBand, PageHero } from "@/components/site/PageHero";
import { Capabilities } from "@/components/site/Capabilities";
import { OurHealthcare } from "@/components/home/Middle";
import { Insurers, Maritime } from "@/components/home/Lower";
import { SheetLink } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: SERVICES_PAGE.meta.title, description: SERVICES_PAGE.lead };

export default function ServicesPage() {
  const S = SERVICES_PAGE;
  return (
    <Shell>
      <main id="main">
        <PageHero
          crumbs={[{ label: T.home, path: "/" }, { label: S.eyebrow, path: "/services/" }]}
          eyebrow={S.eyebrow}
          title={S.title}
          lead={S.lead}
          image="coordination-desk"
          imageAlt={T.alt.coordRoom}
          actions={<SheetLink className="btn">{S.cta}<Icon name="arrow" /></SheetLink>}
          note={S.note}
        />
        <OurHealthcare />
        <Capabilities />
        <Maritime />
        <Insurers />
        <CtaBand
          title={S.closing.title}
          text={S.closing.text}
          note={S.closing.note}
          actions={<>
            <SheetLink className="btn">{S.cta}<Icon name="arrow" /></SheetLink>
            <a className="btn2" href={href("/partner/")}>{CTA.primary}</a>
          </>}
        />
      </main>
    </Shell>
  );
}
