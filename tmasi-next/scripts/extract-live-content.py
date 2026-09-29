"""Extract the live tmasi.net text, word for word, into one content file per language.

Source: the rendered pages saved in tmasi-live/snapshot-<date>/ (see inventory.py there).
Output: src/content/live/<lang>.json and src/content/live/assets.json (every image the pages use).

Rules: nothing is rewritten. Whitespace is collapsed, <br> becomes a space, HTML entities are decoded.
Headings keep their highlighted part (the live <strong>/<span> accent) as a separate segment.
Run: python scripts/extract-live-content.py [snapshot-folder]
"""
import json
import re
import sys
from pathlib import Path
from urllib.parse import urljoin, unquote

from bs4 import BeautifulSoup, Comment, Tag

ROOT = Path(__file__).resolve().parent.parent
SNAP = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / "tmasi-live" / "snapshot-2026-09-28"
OUT = ROOT / "src" / "content" / "live"
BASE = "https://tmasi.net/"

PAGES = {
    "en": {"home": "", "about": "about/", "services": "services/", "contact": "contacts/", "blog": "blog/",
           "posts": [f"blog/news{i}.php" for i in range(1, 7)], "leaders": ["dr-amba.php", "dr-ahmed.php"]},
    "de": {"home": "de/", "about": "de/uber-uns/", "services": "de/leistungen/", "contact": "de/kontakt/",
           "blog": None, "posts": [], "leaders": ["de/dr-amba.php", "de/dr-ahmed.php"]},
    "pl": {"home": "pl/", "about": "pl/o-nas/", "services": "pl/us%C5%82ugi/", "contact": "pl/kontakt/",
           "blog": None, "posts": [], "leaders": ["pl/dr-amba.php", "pl/dr-ahmed.php"]},
    "es": {"home": "es/", "about": "es/sobre-nosotros/", "services": "es/servicios/", "contact": "es/contacto/",
           "blog": "es/blog/", "posts": [f"es/blog/news{i}.php" for i in range(1, 5)], "leaders": ["es/dr-amba.php", "es/dr-ahmed.php"]},
}

ASSETS: set[str] = set()


def load(path: str) -> BeautifulSoup:
    f = re.sub(r"/$", "/index", path) or "index"
    f = f.replace("/", "__").replace("%", "_") + ".html"
    s = BeautifulSoup((SNAP / f).read_text(encoding="utf-8", errors="ignore"), "lxml")
    for c in s.find_all(string=lambda x: isinstance(x, Comment)):
        c.extract()
    for t in s(["script", "style", "noscript"]):
        t.decompose()
    s._tmasi_url = BASE + path  # type: ignore[attr-defined]
    return s


SCRUBBED: list = []
DASHES: list = []
FOREIGN_URL = re.compile(r"https?://(?!(?:www\.)?tmasi\.net)[^\s<>\"']+")


def clean(t: str) -> str:
    """Collapse whitespace. Bare web addresses to other sites are spam injected into the live pages
    (e.g. a .ru link in the Spanish home, 2026-09-28): they are removed and reported, never copied."""
    t = re.sub(r"\s+", " ", t).strip()
    for m in FOREIGN_URL.findall(t):
        SCRUBBED.append(m)
    t = re.sub(r"\s+", " ", FOREIGN_URL.sub("", t)).strip()
    # No em or en dashes (Mohamed's rule): a dash between words becomes a comma. Same words, punctuation only.
    if re.search(r"[–—]", t):
        DASHES.append(t[:60])
        t = re.sub(r"\s*[–—]\s*", ", ", t)
    return t


def txt(el) -> str:
    if el is None:
        return ""
    el = BeautifulSoup(str(el), "lxml")
    for br in el.find_all("br"):
        br.replace_with(" ")
    return clean(el.get_text(""))


def img(s, el) -> str:
    """Absolute site path of an image, recorded for copying into the build."""
    if el is None:
        return ""
    src = el.get("src") or el.get("data-src") or ""
    if not src:
        return ""
    absu = urljoin(s._tmasi_url, src)
    path = unquote(absu.replace(BASE, "/"))
    ASSETS.add(path)
    return path


# A run of capitalised words joined by "&" (or the language's "and": I, Y, UND) is the slogan's highlight.
ACCENT = re.compile(r"([A-ZÄÖÜŁŚŻŹĆŃÓĘĄÑÁÉÍÚ]{2,}(?:\s+(?:&|I|Y|UND|AND)\s+[A-ZÄÖÜŁŚŻŹĆŃÓĘĄÑÁÉÍÚ]{2,})+)")


def segments(el, caps_accent=False) -> list:
    """Heading as segments: [{"t": text}, {"t": text, "accent": true}, ...]."""
    if el is None:
        return []
    el = BeautifulSoup(str(el), "lxml").find(el.name)
    for br in el.find_all("br"):
        br.replace_with(" ")
    out = []
    for c in el.children:
        if isinstance(c, Tag) and c.name in ("strong", "b", "em") or (isinstance(c, Tag) and "orange" in c.get("class", [])):
            out.append({"t": c.get_text(""), "accent": True})
        else:
            out.append({"t": c.get_text("") if isinstance(c, Tag) else str(c)})
    joined = clean("".join(s["t"] for s in out))
    if caps_accent and not any(s.get("accent") for s in out):
        m = ACCENT.search(joined)
        if m:
            return [x for x in ({"t": joined[: m.start()]}, {"t": m.group(1), "accent": True}, {"t": joined[m.end():]}) if x["t"]]
    # normalise whitespace across segment borders
    res, prev_space = [], False
    for s_ in out:
        t = re.sub(r"\s+", " ", s_["t"])
        if not res:
            t = t.lstrip()
        if t:
            res.append({**s_, "t": t})
    if res:
        res[-1]["t"] = res[-1]["t"].rstrip()
    return res


def bullets(p) -> list:
    """Service items: <span class="custom-bullet"><b>Title:</b> text</span> -> {title, text}."""
    items = []
    for sp in p.select("span.custom-bullet") if p else []:
        b = sp.find(["b", "strong"])
        if b:
            title = clean(b.get_text("")).rstrip(":").strip()
            b.extract()
            items.append({"title": title, "text": txt(sp)})
        else:
            items.append({"text": txt(sp)})
    return items


def header_footer(s) -> dict:
    h = s.find("header")
    nav = [txt(a) for a in h.select("nav a")] if h else []
    call = ""
    for a in h.find_all("a") if h else []:
        if a.get("href", "").startswith(("tel:", "https://wa.me")) or "call" in " ".join(a.get("class", [])).lower():
            t = txt(a)
            call = re.split(r"\s+(?:EN|DE|PL|ES)\b", t)[0].strip()
            if call:
                break
    f = s.find("footer")
    form = f.find("form") if f else None
    quote = {
        "title": txt(f.find(["h2", "h3"])) if f else "",
        "text": txt(f.find("p", class_=re.compile("section-hero-description"))) if f else "",
        "fields": {i.get("name"): i.get("placeholder") for i in form.find_all("input") if i.get("name")} if form else {},
        "submit": (form.find("input", attrs={"type": "submit"}) or {}).get("value", "") if form else "",
    }
    fnav = [txt(li) for li in f.select("li.footer-item")] if f else []
    offices = []
    for ul in f.select("ul.stroke-kont-item") if f else []:
        lis = ul.select("li.stroke-kont-list")
        tel = next((a.get("href", "")[4:] for a in ul.select("a[href^='tel:']")), "")
        mail = next((a.get("href", "")[7:] for a in ul.select("a[href^='mailto:']")), "")
        offices.append({"name": txt(lis[0]) if lis else "", "address": txt(lis[1]) if len(lis) > 1 else "",
                        "phone": txt(ul.select_one("a[href^='tel:']")), "tel": tel, "email": mail})
    more = txt(f.find("button", class_=re.compile("toggle-locations"))) if f else ""
    return {"nav": nav[:5], "call": call, "quote": quote, "footerNav": fnav, "showMoreLocations": more, "offices": offices}


def home(s) -> dict:
    hero = s.select_one("section.section-hero")
    btns = hero.find_all("a")
    about = s.select_one("section.section-about.perv")
    spans = [txt(x) for x in about.select("p.section-about-description > span")]
    relax = s.select_one("section.about-bg")
    values = s.select_one("section.values-section")
    mission = s.select_one("section.about-section")
    why = s.select_one("section.section-why")
    do = s.select_one("section.section-do")
    return {
        "hero": {"title": segments(hero.find("h1")), "text": txt(hero.find("p")),
                 "ctaQuote": txt(btns[0]) if btns else "", "ctaCall": txt(btns[1]) if len(btns) > 1 else ""},
        "about": {"eyebrow": txt(about.find("h2") or about.find("h1")), "statement": txt(about.find("h3")),
                  "lead": spans[:3], "body": " ".join(spans[3:])},
        "relax": {"title": segments(relax.find("h2"), caps_accent=True), "text": txt(relax.find("p"))},
        "values": {"title": txt(values.find("h2")),
                   "items": [{"n": txt(n), "title": txt(t), "text": txt(d)} for n, t, d in
                             zip(values.select(".values-number"), values.select(".values-title"), values.select(".values-description"))]},
        "mission": {"title": txt(mission.find("h2")),
                    "cards": [{"title": txt(li.find(class_="about-title")), "text": txt(li.find("p")), "icon": img(s, li.find("img"))}
                              for li in mission.select("li.about-card")]},
        "why": {"title": txt(why.find("h2")),
                "items": [{"title": txt(t), "text": txt(d), "icon": img(s, i)} for i, t, d in
                          zip(why.select("img.section-why-icon"), why.select(".section-why-item-heading"), why.select(".section-why-item-description"))]},
        "services": {"title": txt(do.find("h2")), "sub": txt(do.find("p", class_="section-description")),
                     "groups": [{"title": txt(a), "items": bullets(p)} for a, p in
                                zip(do.select("a.section-do-link"), do.select("p.section-do-item-description"))]},
    }


def about_page(s) -> dict:
    top = s.select_one("section.section-about.perv")
    spans = [txt(x) for x in top.select("p.section-about-description > span")] or [txt(top.find("p"))]
    relax = s.select_one("section.about-bg")
    mission = s.select_one("section.about-section")
    how = s.select_one("section.how-work")
    return {
        "heading": txt(top.find("h1")), "statement": txt(top.find("h3")), "lines": spans,
        "relax": {"title": segments(relax.find("h2"), caps_accent=True), "text": txt(relax.find("p"))},
        "mission": {"title": txt(mission.find("h2")),
                    "cards": [{"title": txt(li.find(class_="about-title")), "text": txt(li.find("p")), "icon": img(s, li.find("img"))}
                              for li in mission.select("li.about-card")]},
        "how": {"title": txt(how.find("h2")), "steps": [txt(h) for h in how.find_all("h3")],
                "footer": txt(how.find("p", class_="how-work-footer"))},
    }


def hidden_board(path: str) -> dict:
    """The About page's BOARD MEMBERS block is commented out on the live site; it is the only place that
    names each leader's role, and v3 shows it so the two leader pages can be reached."""
    f = re.sub(r"/$", "/index", path) or "index"
    raw = (SNAP / (f.replace("/", "__").replace("%", "_") + ".html")).read_text(encoding="utf-8", errors="ignore")
    m = re.search(r"<!--\s*(<section class=\"exec-team-section\">.*?)-->", raw, re.S)
    if not m:
        return {}
    sec = BeautifulSoup(m.group(1), "lxml")
    heading = txt(sec.find("h2"))
    members = []
    for card in sec.select(".exec-team-card, .exec-card, .team-card, li, .exec-member"):
        parts = [clean(t) for t in card.stripped_strings if clean(t)]
        if len(parts) >= 2:
            members.append({"name": parts[0], "role": parts[1], "org": parts[2] if len(parts) > 2 else ""})
    if not members:  # fall back to the text sequence: name, role, organisation
        parts = [clean(t) for t in sec.stripped_strings if clean(t)][1:]
        for i in range(0, len(parts) - 1, 3):
            members.append({"name": parts[i], "role": parts[i + 1], "org": parts[i + 2] if i + 2 < len(parts) else ""})
    return {"heading": heading, "members": members}


def services_page(s) -> dict:
    sec = s.select_one("section.services-section")
    why = s.select_one("section.section-why")
    return {
        "heading": txt(sec.find("h1")), "sub": txt(sec.find("h3")),
        "groups": [{"title": txt(t), "items": bullets(p), "image": img(s, i)} for i, t, p in
                   zip(sec.select("img.services-icon"), sec.select(".services-title"), sec.select("p.services-description"))],
        "benefits": {"title": txt(why.find("h2")), "sub": txt(why.find("h3")),
                     "items": [{"title": txt(t), "text": txt(d), "icon": img(s, i)} for i, t, d in
                               zip(why.select("img.section-why-icon"), why.select(".section-why-item-heading"), why.select(".section-why-item-description"))]},
    }


def contact_page(s) -> dict:
    sec = s.select_one("section.contact-section")
    form = sec.find("form")
    maps = s.find_all("iframe")
    locs = s.select_one("section.contact-locations")
    offices = []
    for h in locs.find_all("h3"):
        ps = []
        for sib in h.find_next_siblings():
            if sib.name == "h3":
                break
            ps.extend(sib.find_all("p") if sib.name != "p" else [sib])
        if not ps:  # the office block wraps the heading and its lines
            ps = h.parent.find_all("p")
        lines = [txt(p) for p in ps]
        phones = [a.get("href", "")[4:] for p in ps for a in p.find_all("a") if a.get("href", "").startswith("tel:")]
        emails = [a.get("href", "")[7:] for p in ps for a in p.find_all("a") if a.get("href", "").startswith("mailto:")]
        offices.append({"name": txt(h), "lines": lines, "tel": phones, "email": emails})
    return {
        "heading": txt(sec.find("h1")),
        "form": {"fields": {i.get("name"): i.get("placeholder") for i in form.find_all(["input", "textarea"]) if i.get("name")},
                 "submit": (form.find("input", attrs={"type": "submit"}) or form.find("button") or {}).get("value", "") if form else ""},
        "locationHeading": txt(sec.find("h2")),
        "mapHeading": txt(s.select_one("section.custom-map-section h2")),
        "maps": [m.get("src") for m in maps if "google.com/maps" in (m.get("src") or "")],
        "offices": offices,
    }


def leader(s) -> dict:
    sec = s.select_one("section.exec-team-section")
    im = sec.find("img")
    return {"name": txt(sec.find("h1")), "image": img(s, im), "imageAlt": im.get("alt", "") if im else "",
            "subheading": txt(sec.find("h3")), "paragraphs": [txt(p) for p in sec.select("p.exec-bio-text")]}


def blog_index(s) -> dict:
    sec = s.select_one("section.news-section")
    cards = []
    for art in sec.select(".news-card"):
        a = art.find("a", class_="news-link")
        cards.append({"image": img(s, art.find("img")), "date": txt(art.find(class_="news-date")),
                      "title": txt(art.find(class_="news-title")), "excerpt": txt(art.find(class_="news-excerpt")),
                      "more": txt(a), "href": a.get("href") if a else ""})
    return {"heading": txt(sec.find("h1")), "cards": cards}


def post(s) -> dict:
    h1 = s.find("h1")
    container = h1.find_parent("main") or s.body
    body = []
    for el in container.find_all(["p", "h1", "h2", "h3", "h4", "blockquote", "img", "li"]):
        if el.find_parent("footer") or el.find_parent("header"):
            continue
        if el.name == "h1":
            continue
        if el.name == "img":
            body.append({"img": img(s, el), "alt": el.get("alt", "")})
        elif el.name in ("h2", "h3", "h4"):
            body.append({"h": txt(el), "cls": " ".join(el.get("class", []))})
        elif el.name == "blockquote":
            body.append({"quote": txt(el)})
        elif el.name == "li" and not el.find_parent("blockquote"):
            body.append({"li": txt(el)})
        elif el.name == "p" and not el.find_parent("blockquote") and "Powered by" not in el.get_text():
            t = txt(el)
            if t:
                body.append({"p": t, "cls": " ".join(el.get("class", []))})
    d = s.find(class_="news-date")
    # A dateline's dash separates place and date: shown as " · ", like the blog cards.
    date = re.sub(r"\s*,\s*(?=[^,]*$)", " · ", txt(d)) if d is not None and re.search(r"[–—]", d.get_text()) else txt(d)
    date = re.sub(r"\s-\s", " · ", date)
    return {"title": txt(h1), "date": date, "body": body}


def head(s) -> dict:
    d = s.find("meta", attrs={"name": "description"})
    return {"title": clean(s.title.get_text()) if s.title else "", "description": clean(d.get("content", "")) if d else ""}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for lang, pg in PAGES.items():
        hs = load(pg["home"])
        data = {"lang": lang, "shell": header_footer(hs), "meta": {}}
        data["home"] = home(hs)
        data["meta"]["home"] = head(hs)
        for key, fn in (("about", about_page), ("services", services_page), ("contact", contact_page)):
            s = load(pg[key])
            data[key] = fn(s)
            data["meta"][key] = head(s)
        data["about"]["board"] = hidden_board(pg["about"])
        data["leaders"] = []
        for path in pg["leaders"]:
            s = load(path)
            data["leaders"].append({"source": "/" + path, **leader(s), "meta": head(s)})
        if pg["blog"]:
            s = load(pg["blog"])
            data["blog"] = blog_index(s)
            data["meta"]["blog"] = head(s)
        data["posts"] = []
        for path in pg["posts"]:
            s = load(path)
            data["posts"].append({"source": "/" + path, **post(s), "meta": head(s)})
        (OUT / f"{lang}.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        print(lang, "ok:", len(data["home"]["services"]["groups"]), "groups,", len(data["contact"]["offices"]), "offices,",
              len(data["posts"]), "posts,", len(data["leaders"]), "leaders")
    (OUT / "assets.json").write_text(json.dumps(sorted(ASSETS), ensure_ascii=False, indent=1), encoding="utf-8")
    print(len(ASSETS), "images referenced")
    if DASHES:
        print(len(DASHES), "texts had an em or en dash turned into a comma")
    if SCRUBBED:
        print("REMOVED injected addresses:", sorted(set(SCRUBBED)))


if __name__ == "__main__":
    main()
