# Data model: TMASI v6

All data is static content. Words come from v3's files unchanged; v6 adds only media records and display order.

## Film

| Field | Rule |
|---|---|
| role | `hero` (muted loop) or `watch` (with sound) |
| file | H.264 MP4, faststart; hero has no audio track |
| source | his finished hero cut; the Kling commercial for `watch` |
| poster | a designed image named in the media contract, never a frame |
| captions | WebVTT for `watch` if the film has speech |
| credit | the "made with AI" line he approves |

States: `poster` (before play, reduced motion, Data Saver, refused autoplay) → `playing` → `paused` (off screen).

## Journey part

| Field | Rule |
|---|---|
| title | one of the five Medical Tourism items, exactly as `live/<lang>.json` holds it |
| order | the site's order: Comprehensive Healthcare Packages, Top Medical Destinations, Personalized Travel Arrangements, Dedicated Coordinators, Luxury and Comfort Options |
| photo | a real photo or a bento photo; a labelled design slot if none fits |
| number | none (never shown as numbered steps) |

## Service group

Name and items exactly as the content files; `displayOrder` puts Medical Tourism Services first, the other five in the
site's order. Links to its group page in the same language.

## Proof item

| Field | Rule |
|---|---|
| photo | a real event photo from the site's own posts |
| post | the news post it belongs to |
| partner | Egypt Healthcare Authority, Hansa Medica, ITIC Global or Uniglobal, with the official logo in full colour |

## Office

Name, city, address, phone, email from the site's footer (as v3). Five offices.

## Flight (hubs map)

As v3 (`FLIGHTS`, `PHONE_FLIGHTS`), plus the rule: plays once on first view, then rests; none under reduced motion.
