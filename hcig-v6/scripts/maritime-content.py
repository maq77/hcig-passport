# Turn the manager's maritime page (src/content/manager/maritime-page.md) into src/content/maritime.mjs, word for word.
# Run: python scripts/maritime-content.py
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
md = (ROOT / "src/content/manager/maritime-page.md").read_text(encoding="utf-8")
md = re.sub(r"<!--.*?-->", "", md, flags=re.S)
parts = [p.strip() for p in md.split("\n---\n")]
strip = lambda s: re.sub(r"\*\*(.+?)\*\*", r"\1", s).strip()

def paras(block):
    out = []
    for chunk in re.split(r"\n\s*\n", block.strip()):
        chunk = chunk.strip()
        if chunk and not chunk.startswith(("#", "- ")):
            out.append(strip(chunk))
    return out

def bullets(block):
    return [strip(l[2:]) for l in block.splitlines() if l.startswith("- ")]

# 1. intro
p0 = parts[0]
intro = {
    "eyebrow": strip(re.search(r"^# (.+)$", p0, re.M).group(1)),
    "kicker": strip(re.search(r"^## (.+)$", p0, re.M).group(1)),
}
body = [x for x in paras(re.sub(r"^#.*$", "", p0, flags=re.M))]
intro["tagline"] = body[0]
intro["paras"] = body[1:4]
intro["line"] = body[4]
ctas = re.search(r"CTA: (.+)$", p0, re.M).group(1).strip("* ").split(" | ")
intro["ctas"] = ctas

def section(p):
    return {
        "eyebrow": strip(re.search(r"^## (.+)$", p, re.M).group(1)),
        "title": strip(m.group(1)) if (m := re.search(r"^### (.+)$", p, re.M)) else "",
    }

# 2. ecosystem
eco = section(parts[1]); eco["paras"] = paras(re.sub(r"^#.*$", "", parts[1], flags=re.M))

# 3. capabilities (its own heading is only the caps label; the first ### belongs to capability 01)
cap_head = {"eyebrow": strip(re.search(r"^## (.+)$", parts[2], re.M).group(1)), "title": ""}
caps = []
for c in re.split(r"\n(?=### )", parts[2])[1:]:
    t = re.search(r"^### (\d+)\. (.+)$", c, re.M)
    kick = re.search(r"^\*\*(.+?)\*\*$", c, re.M)
    rest = re.sub(r"^###.*$|^\*\*.+\*\*$", "", c, flags=re.M)
    ps = paras(rest)
    li = next(i for i, x in enumerate(ps) if x.endswith(":"))  # the list label ends with a colon
    caps.append({"n": t.group(1), "title": t.group(2).strip(), "kicker": kick.group(1), "intro": ps[:li], "listLabel": ps[li], "items": bullets(c), "close": " ".join(ps[li + 1:])})

# 4. journey
jr = section(parts[3])
jp = paras(re.sub(r"^#.*$", "", parts[3], flags=re.M))
jr["flow"] = [s.strip() for s in jp[0].split("→")]
jr["paras"] = jp[1:-1]
jr["line"] = jp[-1]

# 5. models
md5 = section(parts[4])
models = []
lines = [l for l in re.sub(r"^#.*$", "", parts[4], flags=re.M).split("\n\n") if l.strip()]
for i in range(0, len(lines) - 1, 2):
    models.append({"title": strip(lines[i]), "text": strip(lines[i + 1])})
md5["items"] = models

# 6. who
who = {"eyebrow": strip(re.search(r"^## (.+)$", parts[5], re.M).group(1))}
wp = paras(re.sub(r"^#.*$", "", parts[5], flags=re.M))
who["lead"], who["items"], who["close"] = wp[0], bullets(parts[5]), wp[-1]

# 7. why
why = section(parts[6])
wl = [l for l in re.sub(r"^#.*$", "", parts[6], flags=re.M).split("\n\n") if l.strip()]
why["lead"] = strip(wl[0])
why["items"] = [{"title": strip(wl[i]), "text": strip(wl[i + 1])} for i in range(1, len(wl) - 1, 2)]

# 8. closing
cl = parts[7]
closing = {"title": strip(re.search(r"^## (.+)$", cl, re.M).group(1))}
cp = paras(re.sub(r"^#.*$", "", cl, flags=re.M))
closing["text"], closing["line"] = cp[0], cp[1]
closing["cta"] = re.search(r"CTA: (.+)$", cl, re.M).group(1).strip("* ")
closing["email"] = re.search(r"Email: (\S+)", cl).group(1)

seo = (ROOT / "src/content/manager/maritime-seo.md").read_text(encoding="utf-8")
row = lambda k: re.search(rf"^\| {k} \| (.+?) \|$", seo, re.M).group(1).replace("\\|", "|").strip("` ")
data = {
    "meta": {"h1": row("Page H1"), "title": row("SEO title"), "description": row("Meta description"), "primary": row("Primary CTA"), "secondary": row("Secondary CTA")},
    "form": {"fields": ["Company", "Fleet/Vessel Type", "Required Services", "Operating Region", "Contact Details"]},
    "intro": intro, "eco": eco, "capsHead": cap_head, "caps": caps, "journey": jr, "models": md5, "who": who, "why": why, "closing": closing,
}
# Headings the manager set in capitals get title case for display (same words; casing only)
SMALL = {"and", "of", "the", "to", "a", "for"}
def title_case(t):
    w = t.lower().split()
    return " ".join(x if (i and x in SMALL) else x[:1].upper() + x[1:] for i, x in enumerate(w))
data["capsHead"]["title"] = title_case(data["capsHead"]["eyebrow"])
data["who"]["title"] = title_case(data["who"]["eyebrow"])
out = "// Generated from src/content/manager/maritime-page.md and maritime-seo.md by scripts/maritime-content.py.\n// The manager's words, word for word (BRAIN.md rule 1). Do not edit by hand: change the source and rerun.\n"
out += "export const MARITIME_PAGE = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n"
(ROOT / "src/content/maritime.mjs").write_text(out, encoding="utf-8")
print("caps", len(caps), "models", len(models), "who", len(who["items"]), "why", len(why["items"]), "flow", jr["flow"])
