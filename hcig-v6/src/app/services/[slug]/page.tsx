import type { Metadata } from "next";
import { CTA, HEALTHCARE } from "@/content/home.mjs";
import { SERVICES_PAGE, SERVICE_LINES } from "@/content/pages.mjs";
import { href } from "@/lib/site";
import { Shell } from "@/components/site/Shell";
import { CtaBand, PageHero } from "@/components/site/PageHero";
import { ServiceLineBody } from "@/components/site/Partners";
import { Insurers } from "@/components/home/Lower";
import { SheetLink } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";

type Line = { title: string; text: string; img: string; path: string };
const find = (slug: string) => (HEALTHCARE.items as Line[]).find((l) => l.path.endsWith(`/${slug}/`)) as Line;

export const dynamicParams = false;
export function generateStaticParams() {
  return SERVICE_LINES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const l = find(slug);
  return { title: `${l.title} | HCIG Services`, description: l.text };
}

export default async function ServiceLinePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = find(slug);
  const S = SERVICES_PAGE;
  return (
    <Shell>
      <main id="main">
        <PageHero
          crumbs={[{ label: "Home", path: "/" }, { label: S.eyebrow, path: "/services/" }, { label: l.title, path: l.path }]}
          eyebrow={HEALTHCARE.heading}
          title={l.title}
          lead={l.text}
          image={l.img}
          actions={<>
            <SheetLink className="btn">{S.cta}<Icon name="arrow" /></SheetLink>
            <a className="btn2" href={href("/partner/")}>{CTA.primary}</a>
          </>}
          note={S.note}
        />
        <ServiceLineBody slug={slug} />
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
