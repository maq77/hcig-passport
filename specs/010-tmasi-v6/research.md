# Research: TMASI v6

## R1. Base: copy v3, do not branch it

- **Decision**: copy `tmasi-next/` to a sibling app `tmasi-v6/` with basePath `/tmasi/v6`.
- **Rationale**: he asked for a new URL with v3 untouched; v3 still receives fixes from other sessions, so a shared
  folder would mix the two. A copy keeps both previews alive side by side, as v3 and v4 were.
- **Alternatives**: a git branch of `tmasi-next` (one preview at a time, conflicts with live v3 work); a flag inside v3
  (`?preview=6`, mixes code paths in the live preview).

## R2. Hero film delivery

- **Decision**: one MP4 (H.264, yuv420p, faststart, no audio track) for the hero, `muted autoplay loop playsinline`,
  `preload="metadata"`, a designed poster image, and play only after the headline has painted. A smaller phone file
  when his cut allows (same cut, lower bitrate).
- **Rationale**: H.264 plays everywhere; his Kling file is HEVC, which some browsers refuse. Muted plus playsinline is
  what browsers allow to autoplay. The poster removes the black flash he rejects.
- **Edge**: iPhone low power mode refuses autoplay: the poster stays, the `play()` rejection is caught silently.
- **Alternatives**: a streaming service (extra account and cookies); WebM only (Safari gaps).

## R3. Watch film

- **Decision**: a lightbox with the Kling commercial (H.264 web copy, sound), opened by "Watch film", closed by Esc,
  the close button or a tap outside; focus returns to the button. Captions (WebVTT) if the film has speech.
- **Open**: whether the commercial has speech is unknown (we never look inside). He tells us; if yes, the captions
  are written from his script or by listening, never from frames.

## R4. Posters

- **Decision**: posters are existing designed images chosen by name: the Red Sea pool image from the bento set
  (`w5-comprehensive.webp`) for the hero until his cut arrives, then the image he prefers.
- **Rationale**: the never-a-still rule (2026-09-09).

## R5. Hubs map planes: fly once, then rest

- **Decision**: in `HubsMap.tsx` the Web Animations run with `iterations: 1` and `fill: "forwards"` ending at rest
  (each plane lands and fades), started the first time the map is 35% in view; never restarted. Reduced motion: no
  animation, routes at rest.
- **Rationale**: his answer of 2026-10-07; the existing keyframe pattern (measured 59 fps on a slow phone) stays.

## R6. Services order

- **Decision**: reorder the six groups for display only (Medical Tourism first, then the other five in the site's
  order); the words and each group's items stay as the content files hold them.
- **Rationale**: "Order and look are free" (word rule); the content files stay identical to v3.

## R7. Word check across four languages

- **Decision**: port `tmasi-v4/scripts/check-words.mjs` and run it over every built page in `out/` against
  `src/content/live/<lang>.json` and `ui.ts` for that language, plus `approved-edits.json` for logged fixes.
- **Rationale**: v4's check only knew the English home; v6 carries every page in four languages.

## R8. AI film credit

- **Decision**: a short credit near the film, wording proposed on the canvas for his yes (it is new text). The AI
  people rule is enforced in review: no generated face as staff, doctor, patient or testimonial.
- **Rationale**: EU AI Act Article 50 transparency rules for AI-generated video are due to apply from August 2026;
  the site addresses Germany, Poland and Spain. Legal confirms the wording.
