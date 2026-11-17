# 24/7 Clinic logo, faithful SVG (2026-11-17)

Source of truth: `brand guideline/247 Brand Guideline.pdf`, page "01 LogoMark" (PDF index 4, JPEG 1920x1080, logo about 680 px wide). Colour variation (index 5) and minimum size (index 6) pages checked as well.

## Files
- `247-logo.svg`: full colour logo with tagline, for white or ivory grounds.
- `247-mark.svg`: same logo without "TRAVEL MEDICAL SERVICES" (guideline: use below 120 px wide).
- `247-logo-ivory.svg`, `247-mark-ivory.svg`: the guideline's reversed version. Everything is one solid ivory `#FCFFEA` (sampled from the white-on-red and white-on-black panels on page 02).
- `247-logo-1200.png`, `247-logo-ivory-1200.png`: transparent, 1200 px wide.
- `comparison/`: guideline next to the SVG, ink diff images, 4x zooms of the swoosh merge, tips and the C over the swoosh.
- `method/`: the scripts used (Python, OpenCV, fontTools, scipy; rendering with sharp).

All SVGs: viewBox `0 0 682 658`, paths only, no `<text>`, no `<style>`, no background, inline fill attributes plus two `linearGradient` defs.

## Colours (sampled)
- 24 and 7: `#DD1B24`. Slash and CLINIC: `#000000`. Tagline: `#BF212F`.
- Outer swoosh: near-vertical linear gradient (2 degree tilt), black at the top through burgundy (`#4B0007`, `#7C000A`, `#A11017`) to `#DD1B24` from about 74 percent down.
- Inner swoosh: its own gradient, black at the top to `#DD1B24` at its lower tip.

## Method
1. Swooshes: segmented from the page by colour and connectivity. The part hidden behind the C was completed from a cubic fit of the visible inner edge. The two swooshes were split with circles fitted to the inner swoosh edges. The outer tail end was rebuilt from fitted edge curves so the V where it meets the inner swoosh stays crisp. Tips were sharpened by intersecting the edge lines. Contours fitted with cubic Beziers (Schneider), sharp corners kept.
2. Type: every glyph was overlaid with per-glyph affine fits.
   - Tagline is Calisto MT Bold, condensed to 84.4 percent width, cap height 19.6 px at guideline scale. Built from the font outlines with fontTools (soft IoU 0.87 on 20 px text, outlines sit on the raster).
   - 24, 7, slash and CLINIC do not match Calisto MT Regular or Bold (soft IoU 0.74 to 0.80; the 4 has no foot serif, the 7 has a straight leg, the L and C serifs differ). Times New Roman, Georgia and a scan of the 674 installed fonts on the 7 found no match either (best 0.87). These letters were traced from the guideline with a line-aware vectoriser: straight edges as true lines, corners intersected, near horizontal and vertical lines snapped.
3. Verification: SVG rendered with sharp (librsvg) at the guideline size and compared with the page.

## Results (binary ink IoU, G channel below 128)
| File | Check | IoU |
|---|---|---|
| 247-logo.svg | vs page 01 at native size (682 px) | 0.982 |
| 247-logo.svg | vs page 01 at 600 px wide | 0.981 |
| 247-mark.svg | vs page 01, tagline band excluded | 0.985 |
| 247-logo-ivory.svg | shape vs page 01 ink | 0.983 |
| 247-logo-ivory.svg | vs page 02 black panel (about 300 px wide) | 0.865, see note |

Mean colour difference on shared ink: about 3 of 255 per channel.

## Open points
- Page 02 places the tagline a little lower under CLINIC (in both the colour and the reversed versions) than page 01. These files follow page 01, the master LogoMark. That is the main reason for the 0.865 against page 02.
- The wordmark letters are traced, not set from a font. If the owner has the original vector file or the wordmark font, a rebuild from it would beat a trace from a 1920 px JPEG.
- At 1200 px and above, the stems of the I letters show a very slight waviness from the trace. It is not visible at site sizes.
