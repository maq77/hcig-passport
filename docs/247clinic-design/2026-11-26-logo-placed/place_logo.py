"""Put the REAL 24/7 Clinic logo on generated photos (his ask 2026-11-26: Nano Banana redraws the logo wrong).

The logo file itself is warped onto the coat, bag or sign: it takes the light and folds of the surface under it
(shading from the photo's own luminance), a little softness and the photo's grain, so it reads as printed on.
An AI-drawn logo can be painted out first (erase box: inpaint the pixels that differ from the surface).

Usage: python place_logo.py <spec.json>
spec: {"src": "...", "out": "...", "erase": [[x0,y0,x1,y1,thresh], ...],
       "logos": [{"file": "mark|logo", "cx":..,"cy":..,"w":..,"rot":0,"squash":1.0,"skew":0,"opacity":0.95}, ...]}
  w       = logo width in photo pixels before squash
  rot     = degrees clockwise
  squash  = horizontal foreshortening for a surface turned away (1 = facing the camera)
  skew    = vertical shear in degrees (a surface that leans)
"""
import json, sys, os
import numpy as np, cv2
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))

def load_logo(name):
    im = Image.open(os.path.join(HERE, f"{name}-1600.png")).convert("RGBA")
    a = np.asarray(im)
    ys, xs = np.where(a[..., 3] > 8)
    return a[ys.min():ys.max() + 1, xs.min():xs.max() + 1].astype(np.float32) / 255.0

def erase(img, box):
    x0, y0, x1, y1, th = box
    crop = img[y0:y1, x0:x1]
    bg = cv2.medianBlur(crop, 41)
    diff = np.abs(crop.astype(np.int16) - bg.astype(np.int16)).max(axis=2)
    mask = (diff > th).astype(np.uint8) * 255
    mask = cv2.dilate(mask, np.ones((7, 7), np.uint8), iterations=2)
    img[y0:y1, x0:x1] = cv2.inpaint(crop, mask, 9, cv2.INPAINT_TELEA)
    # a second, softer pass smooths the inpaint streaks inside the mask only
    smooth = cv2.GaussianBlur(img[y0:y1, x0:x1], (0, 0), 3)
    m = cv2.GaussianBlur(mask, (0, 0), 4)[..., None] / 255.0
    img[y0:y1, x0:x1] = (img[y0:y1, x0:x1] * (1 - m * 0.6) + smooth * m * 0.6).astype(np.uint8)
    return img

def place(img, logo, p):
    H, W = img.shape[:2]
    lh, lw = logo.shape[:2]
    w = p["w"]; h = w * lh / lw
    # destination corners: rectangle centred at 0, foreshortened, sheared, rotated, moved
    pts = np.array([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], np.float32)
    pts[:, 0] *= p.get("squash", 1.0)
    sk = np.tan(np.radians(p.get("skew", 0)))
    pts[:, 1] += pts[:, 0] * sk
    r = np.radians(p.get("rot", 0))
    R = np.array([[np.cos(r), -np.sin(r)], [np.sin(r), np.cos(r)]], np.float32)
    pts = pts @ R.T + np.array([p["cx"], p["cy"]], np.float32)
    # pre-shrink the logo to ~3x the target so the warp keeps fine strokes clean
    f = max(1.0, (lw / max(w, 1)) / 3)
    small = cv2.resize(logo, (int(lw / f), int(lh / f)), interpolation=cv2.INTER_AREA)
    sh, sw = small.shape[:2]
    M = cv2.getPerspectiveTransform(np.array([[0, 0], [sw, 0], [sw, sh], [0, sh]], np.float32), pts)
    warped = cv2.warpPerspective(small, M, (W, H), flags=cv2.INTER_AREA, borderValue=(0, 0, 0, 0))
    a = warped[..., 3:4]
    if a.max() < 0.01:
        return img
    soft = p.get("soft", 0.45)
    if soft > 0:
        warped = cv2.GaussianBlur(warped, (0, 0), soft)
        a = warped[..., 3:4]
    rgb = np.where(a > 1e-4, warped[..., :3] / np.maximum(a, 1e-4), 0)
    base = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0
    base = cv2.GaussianBlur(base, (0, 0), 1.2)
    foot = cv2.dilate((a[..., 0] > 0.02).astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
    ref = np.percentile(base[foot], 88)
    shade = np.clip(base / max(ref, 1e-3), 0.4, 1.08) ** p.get("shade_gamma", 1.0)
    ink = rgb[..., ::-1] * shade[..., None]           # logo is RGB, img is BGR
    gray = ink.mean(axis=2, keepdims=True)
    ink = ink * (1 - p.get("desat", 0.1)) + gray * p.get("desat", 0.1)
    # grain like the photo around it
    ys, xs = np.where(foot)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    region = img[y0:y1, x0:x1].astype(np.float32) / 255.0
    hp = region - cv2.GaussianBlur(region, (0, 0), 1.5)
    noise = np.random.default_rng(7).normal(0, max(hp.std(), 0.006), ink[y0:y1, x0:x1].shape).astype(np.float32)
    ink[y0:y1, x0:x1] += noise
    alpha = np.clip(a * p.get("opacity", 0.95), 0, 1)
    out = img.astype(np.float32) / 255.0 * (1 - alpha) + np.clip(ink, 0, 1) * alpha
    return (np.clip(out, 0, 1) * 255).round().astype(np.uint8)

def main(spec_path):
    spec = json.load(open(spec_path, encoding="utf-8"))
    img = cv2.imdecode(np.fromfile(spec["src"], np.uint8), cv2.IMREAD_COLOR)
    for box in spec.get("erase", []):
        img = erase(img, box)
    cache = {}
    for p in spec["logos"]:
        name = p.get("file", "mark")
        if name not in cache:
            cache[name] = load_logo(name)
        img = place(img, cache[name], p)
    ok, buf = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 96])
    buf.tofile(spec["out"])
    print("wrote", spec["out"])

if __name__ == "__main__":
    for s in sys.argv[1:]:
        main(s)
