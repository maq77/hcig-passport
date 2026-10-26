# Place the real HC mark or logo on a surface in a generated photo (owner, 2026-10-26: brand identity on objects,
# "real logo placed in post"). The logo file is placed, never redrawn. Ported from hcig-v3/canvas/heroes/etch_logo.py.
#   python place-logo.py <photo> <out> <logo.png> <cx> <cy> <width> <mode>
#   cx, cy, width in the photo's own pixels; mode: frost (frosted glass, light room) | glass-dark | print (ink on a light surface)
import sys
import numpy as np
from PIL import Image, ImageFilter

photo, out, logo, cx, cy, w, mode = sys.argv[1:8]
cx, cy, w = float(cx), float(cy), float(w)
im = Image.open(photo).convert("RGB")
lg = Image.open(logo).convert("RGBA")
W = round(w); H = round(lg.height * W / lg.width)
lg = lg.resize((W, H), Image.LANCZOS)
a = np.asarray(lg.split()[3]).astype(np.float32) / 255
blur = lambda r: np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255
soft, wide = blur(0.7), blur(2.6)
edge = np.clip(soft - wide, 0, 1)
base = np.asarray(im).astype(np.float32)
x0, y0 = round(cx - W / 2), round(cy - H / 2)
reg = base[y0:y0 + H, x0:x0 + W]
if mode == "frost":        # milky white with a cool grey rim, so it reads on bright glass
    fill, fa, rim, ra = np.array([250, 252, 252]), 0.62, np.array([110, 136, 142]), 0.38
elif mode == "glass-dark":  # catches the room light on darker glass
    fill, fa, rim, ra = np.array([236, 246, 247]), 0.34, np.array([255, 255, 255]), 0.30
else:                       # printed ink on a light surface: Dim Gray, slightly soft
    fill, fa, rim, ra = np.array([86, 87, 89]), 0.82, np.array([60, 60, 62]), 0.10
m = soft[..., None] * fa
reg = reg * (1 - m) + fill * m
e = edge[..., None] * ra
reg = reg * (1 - e) + rim * e
base[y0:y0 + H, x0:x0 + W] = reg
Image.fromarray(base.clip(0, 255).astype(np.uint8)).save(out, quality=90)
print(out, (x0, y0, W, H))
