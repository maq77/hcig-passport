# Quickstart: run and verify 24/7 Clinic v3

## Prerequisites

Node 18+, ffmpeg and ffprobe on PATH, Playwright MCP available, the repo at
`D:\Healthcare international group`.

## Run

```bash
cd 247clinic-v3
npm install
npm run dev                         # http://localhost:3000/247clinic/v3
npm run media                       # films and stills into public/ (from ../247 material)
V3_TARGET=preview npm run build     # export + flatten-rsc + check-brief
node scripts/sync-preview.mjs       # out/ -> ../src/247clinic-v3
cd .. && npm test                   # root build + check
npm run dev                         # http://localhost:4173/247clinic/v3
```

## Verify (every step must pass before a review link is sent)

1. **Words.** `check-brief` prints 0 failures. Plant one invented sentence, confirm it fails, remove it.
2. **First screen.** Playwright at 375x667: h1, supporting line and the WhatsApp button visible without scrolling. Same at 1440x900.
3. **WhatsApp everywhere.** Scroll the home top to bottom at 375 and 1440; a WhatsApp action is on screen at every stop. Each link opens `wa.me/201222228247` with the right message (contracts/whatsapp-events.md).
4. **No JavaScript.** Load with JavaScript disabled: every section's text and every link present, nothing hidden.
5. **Reduced motion.** Emulate `prefers-reduced-motion: reduce`: no autoplay, no marquee movement, no reveals, final numbers shown.
6. **Screenshots.** Hide `<video>` with CSS before every screenshot. Never capture a film frame.
7. **Rendered head** on the published preview: `noindex, nofollow`, title, description, canonical, JSON-LD valid, no rating in schema.
8. **Quality.** Lighthouse mobile 90+ performance, 100 accessibility target; axe 0 serious or critical; no horizontal scroll at 320 to 1920; contrast per DESIGN.md section 2.
9. **Design slots.** Every slot on the page is in `docs/247clinic-v3-design-slots.md` with its size, and the other way round.
10. **Links.** 0 broken internal links, 0 console errors.

## Publish the preview

Commit or stash unrelated work first (`npm run publish` stages everything). Then
`npm run publish "24/7 v3: ..."`, open `https://hcig-passport.vercel.app/247clinic/v3`,
repeat step 7 on the live preview, update `content/registry.js`.
