import { getContent, getPosts, LANGS, ROUTES } from "@/lib/site";
import { abs, pageSeo } from "@/lib/seo";

export const dynamic = "force-static";

// /llms.txt: a plain map of the site for AI assistants (llmstxt.org). Each page with its own title
// and description, grouped the way the menu groups them; the other languages at the end.
export function GET() {
  const en = ROUTES.filter((r) => r.lang === "en");
  const line = (id: string) => {
    const r = en.find((x) => x.id === id);
    if (!r) return "";
    const s = pageSeo(r);
    return `- [${s.title}](${abs(r.path)}): ${s.description}`;
  };
  const { live } = getContent("en");
  const offices = live.contact.offices.map((_, i) => line(`office:${i}`));
  const groups = live.services.groups.map((_, i) => line(`group:${i}`)).filter(Boolean);
  const posts = getPosts("en").map((p) => line(`post:${p.key}`));
  const home = pageSeo(en.find((r) => r.id === "home")!);
  const text = [
    "# TMASI Global",
    "",
    `> ${home.description}`,
    "",
    "## Pages",
    line("home"), line("about"), line("leader:0"), line("services"), line("contact"), line("blog"),
    "",
    "## Services",
    ...groups,
    "",
    "## Offices",
    ...offices,
    "",
    "## News",
    ...posts,
    "",
    "## Other languages",
    ...LANGS.filter((l) => l !== "en").map((l) => {
      const r = ROUTES.find((x) => x.lang === l && x.id === "home")!;
      return `- [${getContent(l).ui.langName}](${abs(r.path)})`;
    }),
    "",
  ].join("\n");
  return new Response(text, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
