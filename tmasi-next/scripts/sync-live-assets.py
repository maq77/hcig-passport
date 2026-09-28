"""Copy every image the extracted content uses into public/, and point the content at one copy.

The live site keeps the same photo under /img/, /de/img/, /pl/img/, /es/img/ and the blog folders.
When a language copy is byte-identical to the /img/ or /blog/img/ file, the content points at that one.
Sources, newest first: tmasi-live/work/public_html (files we deployed), then the 26 Sep backup.
Rewrites src/content/live/<lang>.json in place and prints what it copied.
"""
import hashlib
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIVE = ROOT / "src" / "content" / "live"
SOURCES = [ROOT.parent / "tmasi-live" / "work" / "public_html", ROOT.parent / "tmasi-live" / "backup-2026-09-26" / "public_html"]
PUBLIC = ROOT / "public"


def find(path: str):
    for base in SOURCES:
        f = base / path.lstrip("/")
        if f.exists():
            return f
    return None


def digest(f: Path) -> str:
    return hashlib.sha1(f.read_bytes()).hexdigest()


def canonical(path: str) -> str:
    """/de/img/x.jpg -> /img/x.jpg (and /es/blog/img/x -> /blog/img/x) when the files are identical."""
    src = find(path)
    m = re.match(r"^/(de|pl|es)(/.*)$", path)
    if src and m:
        alt = m.group(2)
        a = find(alt)
        if a and digest(a) == digest(src):
            return alt
    return path


def main():
    assets = json.loads((LIVE / "assets.json").read_text(encoding="utf-8"))
    mapping, missing, copied, size = {}, [], 0, 0
    for p in assets:
        c = canonical(p)
        mapping[p] = c
        src = find(c)
        if not src:
            missing.append(c)
            continue
        dst = PUBLIC / c.lstrip("/")
        if not dst.exists():
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dst)
            copied += 1
        size += dst.stat().st_size
    for f in LIVE.glob("??.json"):
        text = f.read_text(encoding="utf-8")
        for old, new in sorted(mapping.items(), key=lambda kv: -len(kv[0])):
            if old != new:
                text = text.replace(json.dumps(old, ensure_ascii=False), json.dumps(new, ensure_ascii=False))
        f.write_text(text, encoding="utf-8")
    uniq = sorted(set(mapping.values()))
    print(f"{len(assets)} referenced, {len(uniq)} unique after merging copies, {copied} newly copied, "
          f"{size / 1e6:.1f} MB in use, missing: {missing}")


if __name__ == "__main__":
    main()
