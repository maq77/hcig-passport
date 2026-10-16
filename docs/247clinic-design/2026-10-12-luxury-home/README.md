# 24/7 Clinic v3: luxury home, canvas design (2026-10-12)

Approved by Mohamed on 2026-10-12 ("ok good, i like them now, save all that").

- Canvas (private): https://claude.ai/artifact/T9yFRJUE1GKYwcSW4L3VpU (desktop 1440 page, phone 390)
- References board (private): https://claude.ai/artifact/Lpto2oTTw9XzqDyNxLwTtv
- Hunt report: ~/.claude/skills/kit-hunter/library/hunts/2026-10-12-247-luxury-brand.md

Files
- `home-canvas/`: the two artboards (Main = desktop, Phone) and canvas.json. Image and film ids (`/_blob/...`)
  live on the canvas; the source files are in `247clinic-v4/public` (map in `tools/` notes below).
- `references-canvas/`: the references board.
- `logos/`: 24/7 logo and mark with inline fills (red ring kept), white versions, and AXA/ERGO fixed. The canvas
  strips `<style>` from SVGs, so these are the safe copies.
- `tools/render.py`: renders a .dc.html locally with its renderVals (`python render.py in.dc.html out.html b/`).
  `tools/check.py`: tag balance, logic run, every {{hole}} resolves.
- `home-desktop-render.png`, `home-phone-render.png`: local renders, films hidden.

Open before code: his yes on the new line and the shortened lines; 130 clinics vs 30 in the finder data.
