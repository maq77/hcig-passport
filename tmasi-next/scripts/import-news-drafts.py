"""Turn the translated news drafts in "tmasi sponsor/translations" into v3 posts.

Each draft file holds: a note line, the dateline, the title, then the paragraphs, word for word.
"news 1" is live news5 (Hansa Medica), "news 2" is live news6 (ITIC Global 2026 Istanbul).
The English post is the layout template: its text blocks are replaced, in order, by the draft's
paragraphs; its photos stay where they are. The counts must match or the script stops.
Checked by Gemini and Claude (Mohamed's decision, 2026-09-28); no native speaker yet.
Output: src/content/live/drafts.json
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT.parent / "tmasi sponsor" / "translations"
LIVE = ROOT / "src" / "content" / "live"
MAP = {"news 1": "/blog/news5.php", "news 2": "/blog/news6.php"}


def parse(f: Path):
    lines = [l.strip() for l in f.read_text(encoding="utf-8").splitlines()]
    paras = [l for l in lines if l]
    assert paras[0].startswith("First draft"), f"unexpected note line in {f.name}"
    dateline, title, body = paras[1], paras[2], paras[3:]
    return dateline, title, body


def main():
    en = json.loads((LIVE / "en.json").read_text(encoding="utf-8"))
    by_source = {p["source"]: p for p in en["posts"]}
    out = {}
    for f in sorted(SRC.glob("news * ??.txt")):
        m = re.match(r"(news \d) (DE|ES|PL)\.txt$", f.name)
        if not m:
            continue
        key, lang = m.group(1), m.group(2).lower()
        template = by_source[MAP[key]]
        dateline, title, paras = parse(f)
        slots = [i for i, b in enumerate(template["body"]) if "p" in b or "quote" in b]
        if len(slots) != len(paras):
            sys.exit(f"{f.name}: {len(paras)} paragraphs but the English post has {len(slots)} text blocks")
        body = [dict(b) for b in template["body"]]
        for i, t in zip(slots, paras):
            body[i]["quote" if "quote" in body[i] else "p"] = t
        out.setdefault(lang, []).append({
            "source": MAP[key], "draft": True, "title": title, "date": dateline, "body": body,
            "meta": {"title": title, "description": paras[0][:300]},
        })
    (LIVE / "drafts.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print({k: len(v) for k, v in out.items()})


if __name__ == "__main__":
    main()
