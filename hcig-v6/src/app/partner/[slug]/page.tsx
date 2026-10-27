import type { Metadata } from "next";
import { WHO, T } from "@/content/home.mjs";
import { PARTNER_PAGE, PARTNER_TYPES } from "@/content/pages.mjs";
import { href } from "@/lib/site";
import { Shell } from "@/components/site/Shell";
import { CtaBand, PageHero } from "@/components/site/PageHero";
import { PartnerTypeBody } from "@/components/site/Partners";
import { Insurers, Maritime } from "@/components/home/Lower";
import { SheetLink } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";

type Who = { title: string; text: string; path: string };
const find = (slug: string) => (WHO.items as Who[]).find((w) => w.path.endsWith(`/${slug}/`)) as Who;

export const dynamicParams = false;
export function generateStaticParams() {
  return PARTNER_TYPES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const w = find(slug);
  return { title: `${w.title} | ${T.hcigPartners}`, description: w.text };
}

export default async function PartnerTypePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = find(slug);
  const t = PARTNER_TYPES.find((x) => x.slug === slug) as { img: string; maritime?: boolean };
  const P = PARTNER_PAGE;
  return (
    <Shell>
      <main id="main">
        <PageHero
          crumbs={[{ label: T.home, path: "/" }, { label: T.forPartners, path: "/partner/" }, { label: w.title, path: w.path }]}
          eyebrow={P.whoTitle}
          title={w.title}
          lead={w.text}
          image={t.img}
          actions={<>
            <a className="btn" href={href("/contacts/")}>{P.primary}<Icon name="arrow" /></a>
            <SheetLink className="btn2">{P.secondary}</SheetLink>
          </>}
          note={P.note}
        />
        <PartnerTypeBody slug={slug} />
        {slug === "insurance-assistance-companies" ? <Insurers /> : null}
        {t.maritime ? <Maritime /> : null}
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
