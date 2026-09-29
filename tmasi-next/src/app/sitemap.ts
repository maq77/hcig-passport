import type { MetadataRoute } from "next";
import { alternates, LANGS, ROUTES } from "@/lib/site";
import { abs, pageSeo } from "@/lib/seo";

export const dynamic = "force-static";

// Every page in every language, rebuilt from the route table on each build (never kept by hand),
// each with its addresses in the other languages and its own picture. /sitemap.xml once live.
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((r) => {
    const langs = alternates(r.id);
    const languages: Record<string, string> = {};
    for (const l of LANGS) if (langs[l]) languages[l] = abs(langs[l]!);
    if (langs.en) languages["x-default"] = abs(langs.en);
    const image = pageSeo(r).image;
    return { url: abs(r.path), alternates: { languages }, ...(image ? { images: [abs(image)] } : {}) };
  });
}
