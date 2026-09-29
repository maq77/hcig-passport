import type { MetadataRoute } from "next";
import { IS_PREVIEW, SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

// Live: the same rules as the live tmasi.net robots.txt, plus the sitemap. The preview says no to
// everything (it also carries noindex on every page).
export default function robots(): MetadataRoute.Robots {
  if (IS_PREVIEW) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", crawlDelay: 3 }, sitemap: `${SITE_URL}/sitemap.xml` };
}
