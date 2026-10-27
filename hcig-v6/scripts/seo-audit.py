# SEO audit of a built export: title and description length, duplicates, one H1, canonical and hreflang present.
#   python scripts/seo-audit.py out            (or out-langs/de)
import collections, glob, html, os, re, sys

root = sys.argv[1] if len(sys.argv) > 1 else "out"
rows = []
for f in glob.glob(os.path.join(root, "**", "index.html"), recursive=True):
    rel = os.path.relpath(f, root).replace(os.sep, "/")
    if rel.startswith(("_", "404")):
        continue
    s = open(f, encoding="utf-8").read()
    t = html.unescape((re.search(r"<title>([^<]*)</title>", s) or [None, ""])[1])
    d = html.unescape((re.search(r'<meta name="description" content="([^"]*)"', s) or [None, ""])[1])
    rows.append((rel[: -len("index.html")] or "/", t, d, len(re.findall(r"<h1[\s>]", s)), 'rel="canonical"' in s, s.count('hreflang="')))
tc = collections.Counter(r[1] for r in rows)
dc = collections.Counter(r[2] for r in rows)
bad = 0
for p, t, d, h1, canon, hl in sorted(rows):
    flags = []
    if len(t) > 65: flags.append(f"title {len(t)}")
    if len(t) < 25: flags.append(f"title short {len(t)}")
    if not d: flags.append("no description")
    elif len(d) > 165: flags.append(f"description {len(d)}")
    elif len(d) < 70: flags.append(f"description short {len(d)}")
    if tc[t] > 1: flags.append("duplicate title")
    if d and dc[d] > 1: flags.append("duplicate description")
    if h1 != 1: flags.append(f"h1 x{h1}")
    if not canon: flags.append("no canonical")
    if hl < 2: flags.append("no hreflang")
    if flags:
        bad += 1
        print(f"{p:55} {'; '.join(flags):45} {t[:70]}")
print(f"{len(rows)} pages, {bad} flagged")
