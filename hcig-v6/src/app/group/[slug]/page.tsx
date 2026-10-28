import type { Metadata } from "next";
import { BRANDS, BRAND_UI } from "@/content/brands.mjs";
import { CTA, T } from "@/content/home.mjs";
import { SITE, abs, href } from "@/lib/site";
import { Shell } from "@/components/site/Shell";
import { PageHero } from "@/components/site/PageHero";
import { BrandBody, BrandPlate } from "@/components/site/BrandPage";
import { brandBySlug, brandPath, groupOf } from "@/lib/brands";
import { postCards } from "@/lib/posts";
import { ClosingBand } from "@/components/home/Lower";
import { Icon } from "@/components/ui/Icon";

export const dynamicParams = false;
export function generateStaticParams() {
  return BRANDS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const b = brandBySlug(slug);
  const g = groupOf(b);
  return { title: { absolute: `${g.name}: ${g.line} | HCIG` }, description: `${b.lead} ${b.about}` };
}

export default async function BrandRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = brandBySlug(slug);
  const g = groupOf(b);
  // the brand as an organisation inside the group (schema), linked to its own site
  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: g.name,
    url: g.url,
    description: b.lead,
    parentOrganization: { "@type": "Organization", name: "Healthcare International Group", url: SITE + "/" },
    mainEntityOfPage: abs(brandPath(b)),
  };
  return (
    <Shell>
      <main id="main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <PageHero
          crumbs={[{ label: T.home, path: "/" }, { label: BRAND_UI.crumb.text, path: "/group/" }, { label: g.short, path: brandPath(b) }]}
          eyebrow={g.line}
          title={g.name}
          lead={b.lead}
          image={b.img}
          imageAlt={b.alt}
          aside={b.img ? undefined : <BrandPlate b={b} />}
          actions={<>
            <a className="btn" href={g.url} target="_blank" rel="noopener">{BRAND_UI.visit.text}<Icon name="up" /></a>
            <a className="btn2" href={href("/partner/")}>{CTA.primary}</a>
          </>}
        />
        <BrandBody b={b} post={b.post ? postCards().find((p) => p.n === b.post) : undefined} />
        <ClosingBand />
      </main>
    </Shell>
  );
}
