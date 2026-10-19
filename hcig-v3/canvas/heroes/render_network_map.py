"""HCIG v3 hero B2, the network map in dark and light (2026-10-19).

His ask: hero B with a light and dark switch, and in light the background turns to day, "like we have on tmasi on
maritime and globe network hub". This uses the TMASI map recipe (same Natural Earth data, same Miller projection,
render_map.py and render_light.py in .work/tmasi-assets) in the HCIG palette: black, white and turquoise #12C0C6.
Both themes share one frame, so the routes drawn over them in SVG land on the same cities.

Writes hcig-v3/material/hero-assets/map-dark.jpg and map-light.jpg (2880 x 1800, the 1440 x 900 board at 2x)
and routes.json (route curves in 1440 x 900 board pixels).
"""
import json, math, random, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / ".work" / "tmasi-assets"))
import render_map as rm  # noqa: E402  (Proj, rings, glow, PLACES)

OUT = ROOT / "hcig-v3" / "material" / "hero-assets"
COUNTRIES = json.loads((ROOT / ".work/tmasi-assets/geo/ne_50m_admin_0_countries.geojson").read_text(encoding="utf-8"))

S = 2                          # render scale over the 1440 x 900 board
W, H = 1440 * S, 900 * S
LON0, LON1, LAT_TOP = -76.0, 64.0, 67.0
HUB = ("Hurghada", 27.26, 33.81)
# The seven site languages' home markets, one city each (spec 012): routes run from them to the Red Sea.
CITIES = [("London", 51.51, -0.13), ("Paris", 48.86, 2.35), ("Madrid", 40.42, -3.70), ("Berlin", 52.52, 13.40),
          ("Warsaw", 52.23, 21.01), ("Prague", 50.08, 14.44), ("Milan", 45.46, 9.19)]

map_w = W * 360.0 / (LON1 - LON0)
x0 = -((LON0 + 180.0) / 360.0) * map_w
P0 = rm.Proj(0, 0, map_w)
y0 = -P0.xy(LAT_TOP, 0)[1]
P = rm.Proj(x0, y0, map_w)


def land_mask():
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    for ring in rm.rings():
        pts = [P.xy(lat, lon) for lon, lat in ring]
        if len(pts) >= 3:
            d.polygon(pts, fill=255)
    return m


def country_mask(code):
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    for f in COUNTRIES["features"]:
        if f["properties"].get("ADM0_A3") != code:
            continue
        g = f["geometry"]
        for poly in (g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]):
            d.polygon([P.xy(lat, lon) for lon, lat in poly[0]], fill=255)
    return m


def borders(color):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for f in COUNTRIES["features"]:
        g = f["geometry"]
        for poly in (g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]):
            pts = [P.xy(lat, lon) for lon, lat in poly[0]]
            if len(pts) >= 3:
                d.line(pts + [pts[0]], fill=color, width=1 * S)
    return layer


def coasts(color, width):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for ring in rm.rings():
        pts = [P.xy(lat, lon) for lon, lat in ring]
        if len(pts) >= 3:
            d.line(pts + [pts[0]], fill=color, width=width, joint="curve")
    return layer


yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
MASK = land_mask()
EGY = country_mask("EGY")


def light():
    # Sea: near white where the headline sits (left), deepening to turquoise toward the right and the bottom.
    d = np.sqrt(((xx - W * 0.12) / (W * 0.95)) ** 2 + ((yy - H * 0.15) / (H * 1.1)) ** 2)
    t = (np.clip(d, 0, 1) ** 1.35)[..., None]
    pale, deep = np.array([244, 251, 251], np.float32), np.array([38, 150, 158], np.float32)
    img = Image.fromarray((pale * (1 - t) + deep * t).clip(0, 255).astype(np.uint8), "RGB").convert("RGBA")
    shadow = Image.new("RGBA", (W, H), (8, 70, 76, 0))
    shadow.putalpha(MASK.filter(ImageFilter.GaussianBlur(6 * S)).point(lambda v: int(v * 0.28)))
    img = Image.alpha_composite(img, shadow.transform((W, H), Image.AFFINE, (1, 0, -2 * S, 0, 1, -3 * S)))
    g = (1 - yy / H)[..., None]
    land = np.zeros((H, W, 4), np.uint8)
    land[..., :3] = (np.array([226, 231, 232], np.float32) * (1 - g * 0.6) + np.array([246, 247, 247], np.float32) * g * 0.6).astype(np.uint8)
    land[..., 3] = 255
    img.paste(Image.fromarray(land, "RGBA"), (0, 0), MASK)
    img = Image.alpha_composite(img, borders((198, 208, 210, 190)))
    egy = Image.new("RGBA", (W, H), (18, 192, 198, 255))
    img.paste(egy, (0, 0), EGY)
    img = Image.alpha_composite(img, coasts((255, 255, 255, 235), 2 * S))
    return img.convert("RGB")


def dark():
    rnd = random.Random(11)
    d = np.sqrt(((xx - W * 0.66) / (W * 0.7)) ** 2 + ((yy - H * 0.5) / (H * 0.8)) ** 2)
    t = np.clip(d, 0, 1)[..., None]
    inner, outer = np.array([8, 26, 30], np.float32), np.array([3, 6, 8], np.float32)
    img = Image.fromarray((inner * (1 - t) + outer * t).astype(np.uint8), "RGB").convert("RGBA")
    img.paste(Image.new("RGBA", (W, H), (9, 20, 23, 255)), (0, 0), MASK)
    img = Image.alpha_composite(img, borders((40, 70, 76, 150)))
    egy = Image.new("RGBA", (W, H), (18, 192, 198, 0))
    egy.putalpha(EGY.point(lambda v: int(v * 0.32)))
    img = Image.alpha_composite(img, egy)
    line = coasts((18, 192, 198, 255), 2 * S)
    img = Image.alpha_composite(img, rm.glow(line, 7 * S, 0.9))
    img = Image.alpha_composite(img, line)
    # City lights from Natural Earth places, white with a turquoise hint, kept on land.
    lights = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(lights)
    m = np.asarray(MASK)
    for f in rm.PLACES["features"]:
        lon, lat = f["geometry"]["coordinates"][:2]
        pop = f["properties"].get("pop_max") or 0
        if pop < 50_000:
            continue
        x, y = P.xy(lat, lon)
        if not (0 <= x < W and 0 <= y < H):
            continue
        n = int((math.log10(pop) - 4.5) * 6) + 3
        spread = (1.2 + (math.log10(pop) - 4.7) * 1.5) * S
        for _ in range(n):
            px, py = rnd.gauss(x, spread), rnd.gauss(y, spread * 0.8)
            if 0 <= int(px) < W and 0 <= int(py) < H and m[int(py), int(px)]:
                r = rnd.uniform(0.5, 1.3) * S
                col = (235, 250, 250, rnd.randint(120, 230)) if rnd.random() < 0.75 else (120, 230, 234, rnd.randint(110, 200))
                ld.ellipse([px - r, py - r, px + r, py + r], fill=col)
    img = Image.alpha_composite(img, rm.glow(lights, 3 * S, 1.4))
    img = Image.alpha_composite(img, lights)
    return img.convert("RGB")


def routes():
    hx, hy = P.xy(HUB[1], HUB[2])
    out = {"hub": [round(hx / S, 1), round(hy / S, 1)], "routes": []}
    for name, lat, lon in CITIES:
        cx, cy = P.xy(lat, lon)
        mx, my = (cx + hx) / 2, (cy + hy) / 2 - abs(hx - cx) * 0.22 - 40 * S
        out["routes"].append({"from": name, "d": f"M{cx / S:.1f} {cy / S:.1f} Q {mx / S:.1f} {my / S:.1f} {hx / S:.1f} {hy / S:.1f}", "city": [round(cx / S, 1), round(cy / S, 1)]})
    return out


if __name__ == "__main__":
    light().save(OUT / "map-light.jpg", quality=88)
    dark().save(OUT / "map-dark.jpg", quality=88)
    r = routes()
    (Path(__file__).parent / "routes.json").write_text(json.dumps(r, indent=1), encoding="utf-8")
    print("hub", r["hub"], [x["city"] for x in r["routes"]])
