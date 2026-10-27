# Upscale photos 2x for phones and Retina screens (owner approved 2026-10-27): Real-ESRGAN x4plus on the local GPU,
# then a Lanczos step down to 2x, which keeps the detail and removes upscaler artefacts. Nothing leaves the machine.
#   python scripts/upscale.py key1 key2 ...     (keys from media.json; writes material/media/upscaled/<key>.png
#                                               and points media.json at it)
import json, sys
from pathlib import Path
import numpy as np
import torch
from PIL import Image
from spandrel import ImageModelDescriptor, ModelLoader

ROOT = Path(__file__).resolve().parent.parent
REPO = ROOT.parent
MODEL = ROOT / "material/models/RealESRGAN_x4plus.pth"
OUT = ROOT / "material/media/upscaled"
OUT.mkdir(parents=True, exist_ok=True)
dev = "cuda" if torch.cuda.is_available() else "cpu"
model = ModelLoader().load_from_file(str(MODEL))
assert isinstance(model, ImageModelDescriptor)
model = model.to(dev).eval()
if dev == "cuda":
    model = model.half()

def run_tiles(img: np.ndarray, tile=384, pad=16) -> np.ndarray:
    h, w, _ = img.shape
    s = model.scale
    out = np.zeros((h * s, w * s, 3), np.float32)
    for y in range(0, h, tile):
        for x in range(0, w, tile):
            y0, x0 = max(y - pad, 0), max(x - pad, 0)
            y1, x1 = min(y + tile + pad, h), min(x + tile + pad, w)
            t = torch.from_numpy(img[y0:y1, x0:x1].transpose(2, 0, 1)).unsqueeze(0).to(dev)
            t = t.half() if dev == "cuda" else t
            with torch.no_grad():
                r = model(t).float().clamp(0, 1)[0].cpu().numpy().transpose(1, 2, 0)
            oy, ox = (y - y0) * s, (x - x0) * s
            hh, ww = min(tile, h - y) * s, min(tile, w - x) * s
            out[y * s:y * s + hh, x * s:x * s + ww] = r[oy:oy + hh, ox:ox + ww]
    return out

media_path = ROOT / "media.json"
media = json.loads(media_path.read_text(encoding="utf-8"))
for key in sys.argv[1:]:
    e = media[key]
    src = REPO / e["src"]
    im = Image.open(src).convert("RGB")
    arr = np.asarray(im).astype(np.float32) / 255
    up = run_tiles(arr)
    big = Image.fromarray((up * 255).round().astype(np.uint8))
    two = big.resize((im.width * 2, im.height * 2), Image.LANCZOS)
    dst = OUT / f"{key}.png"
    two.save(dst, optimize=True)
    e["src"] = str(dst.relative_to(REPO)).replace("\\", "/")
    e["width"] = min(2752, im.width * 2)
    e["note"] = (e.get("note", "") + "; upscaled 2x (Real-ESRGAN x4plus, local GPU)").lstrip("; ")
    print(key, im.size, "->", two.size)
media_path.write_text(json.dumps(media, indent=2, ensure_ascii=False), encoding="utf-8")
