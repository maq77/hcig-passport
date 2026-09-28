"""Writes src/content/live/image-sizes.json: the displayed width and height of every news image.

Post pages show a lead image whole, at its own shape (as the live site does). Knowing the shape
before the image loads keeps the text below from jumping. Run again after adding news images:
    python scripts/image-sizes.py
"""
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LIVE = ROOT / "src" / "content" / "live"


def images(node):
    if isinstance(node, dict):
        if isinstance(node.get("img"), str):
            yield node["img"]
        for v in node.values():
            yield from images(v)
    elif isinstance(node, list):
        for v in node:
            yield from images(v)


sizes = {}
for name in ["en.json", "de.json", "pl.json", "es.json", "drafts.json"]:
    for src in images(json.loads((LIVE / name).read_text(encoding="utf-8"))):
        if src in sizes or not src.startswith("/blog/"):
            continue
        with Image.open(ROOT / "public" / src.lstrip("/")) as im:
            w, h = im.size
            # Phone photos often store the picture turned; browsers turn it back, so do the same.
            if im.getexif().get(0x0112, 1) in (5, 6, 7, 8):
                w, h = h, w
        sizes[src] = [w, h]

out = LIVE / "image-sizes.json"
out.write_text(json.dumps(dict(sorted(sizes.items())), indent=1) + "\n", encoding="utf-8")
print(f"image-sizes: {len(sizes)} images -> {out.relative_to(ROOT)}")
