# Etch the real HCIG logo into the boardroom window (hero D), night and day. The logo is placed, never redrawn:
# frosted-glass look = soft white fill, a faint inner light edge, a touch of blur, multiplied by the pane only.
import sys
import numpy as np
from PIL import Image, ImageFilter
A = sys.argv[1]
def etch(photo, logo, out, cx, cy, w, day):
    im = Image.open(A + photo).convert("RGB"); k = im.width / 1376
    lg = Image.open(A + logo).convert("RGBA")
    W = round(w * k); H = round(lg.height * W / lg.width)
    lg = lg.resize((W, H), Image.LANCZOS)
    a = np.asarray(lg.split()[3]).astype(np.float32) / 255
    soft = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8 * k))).astype(np.float32) / 255
    edge = np.clip(soft - np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3 * k))).astype(np.float32) / 255, 0, 1)
    base = np.asarray(im).astype(np.float32)
    x0, y0 = round(cx * k - W / 2), round(cy * k - H / 2)
    reg = base[y0:y0 + H, x0:x0 + W]
    if day:   # frosted on a bright sky: milky white with a cool grey rim so it reads
        fill, fa, rim, ra = np.array([250, 252, 252]), 0.58, np.array([120, 146, 152]), 0.35
    else:     # frosted on dusk glass: catches the room light
        fill, fa, rim, ra = np.array([236, 246, 247]), 0.30, np.array([255, 255, 255]), 0.30
    m = soft[..., None] * fa
    reg = reg * (1 - m) + fill * m
    e = edge[..., None] * ra
    reg = reg * (1 - e) + rim * e
    base[y0:y0 + H, x0:x0 + W] = reg
    Image.fromarray(base.clip(0, 255).astype(np.uint8)).save(A + out, quality=88)
    print(out, (x0, y0, W, H))
for photo, day, tag in [("hero-assets/g-boardroom-sea.jpg", False, "night"), ("hero-assets/g-boardroom-day.jpg", True, "day")]:
    logo = "canvas-assets/img/logo-h-white.png" if not day else "canvas-assets/img/logo-h-white.png"
    etch(photo, logo, f"hero-assets/d-glass-logo-{tag}.jpg", 1036, 190, 196, day)
    etch(photo, "canvas-assets/img/mark-white.png", f"hero-assets/d-glass-mark-{tag}.jpg", 1036, 180, 132, day)
