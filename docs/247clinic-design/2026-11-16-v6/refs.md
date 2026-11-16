# 24/7 Clinic v6: 21st.dev component references (mechanics only)

Date: 2026-11-16. Source: 21st.dev MCP (free tier). Code was read for 2 of 3 picks. The third code fetch hit the daily retrieval limit (resets 2026-11-17 00:00 UTC), so that entry is metadata only.

## 1. Single-quote testimonial carousel

**Name:** Quote Crossfade (by ibrandify)
**URL:** https://21st.dev/@ibrandify/components/quote-crossfade

- **DOM:** `section` with role=region, aria-roledescription=carousel, labelled by an h2. A stage holds one quote. A footer has author tabs (aria-pressed), prev and next icon buttons, and an optional pause toggle. A 2px progress bar sits below.
- **Crossfade:** the outgoing quote stays mounted for 360ms. The incoming quote runs a 0.36s ease `cubic-bezier(.22,1,.36,1)` from opacity 0 and translateY 9px to rest. The outgoing one fades to 0 and moves to -9px. Both sit in one grid cell, and a hidden sizer keeps the height stable.
- **Timing:** autoplay is opt-in, with a 6.5s default and a 2.5s floor. It pauses on hover, focus or a hidden tab. Progress is a linear scaleX 0 to 1.
- **Accessibility:** arrow keys, Home and End. The live region goes off while autoplay runs. Reduced motion removes all transitions and hides the outgoing quote.

## 2. Numbered full-screen mobile menu with a reveal from the burger

**Name:** Immersive Full Screen Navigation (by hyperiux)
**URL:** https://21st.dev/@hyperiux/components/immersive-full-screen-nav

Note: this reveal is a polygon wipe from the left or bottom edge, not a circle. It has no numbered list. For the circle, swap the polygon for `circle()` radii anchored at the burger's coordinates.

- **DOM:** fixed header (brand plus three-bar toggle). A fixed nav panel at inset 0 holds the links.
- **Reveal:** GSAP timeline animates `clip-path` open over 1.2s, delayed 0.2s, ease `power4.inOut`. Close scales the links to 0.9 and opacity to 0.5 over 0.7s, then shrinks the clip over 1.2s.
- **Burger:** CSS transitions turn the bars into an X, with the middle bar scaling out. Delays run 300ms, durations 500 to 700ms.
- **Stagger:** links rise 30px over 0.8s with a 0.07s stagger.
- **Accessibility:** focus trap, Escape closes, focus returns to the toggle. Body scroll locks. The toggle has aria-expanded, the closed panel has aria-hidden, and closed links get tabIndex -1. Reduced motion becomes a 0.2s fade.

## 3. Split hero with slide counter and progress

**Name:** Split Hero With Image Cards (by felipemenezes098)
**URL:** https://21st.dev/@felipemenezes098/components/hero-08

Not verified. Code was not retrieved because of the quota limit. From the listing only: a split layout with a serif headline, avatar social proof, and two image cards with invertible overlay text and CTA buttons. The listing shows no slide counter or progress bar, so it may not match the brief. Retry the code fetch after 2026-11-17, or pick a different reference.

## Gaps

- No circle clip-path numbered menu was found in search. The closest is 3D Fold Fullscreen Menu (https://21st.dev/@kedhareswer/components/folio-fold-menu), which is a 3D fold, not a circle reveal. Its code was not retrieved.
- No split hero with a counter and progress was found in the listings.
