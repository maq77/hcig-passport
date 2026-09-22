# MedPark speed deploy

22 Sep 2026 · Mohamed Amin · deployed and verified live

**Rollback:** `~/backups/speed-20260922/pre.tgz` on the server, 11.6 MB.
It holds every file that was replaced. `medpark-live/` is gitignored, so this
tarball is the only way back.

## What changed

| # | Change | File |
|---|---|---|
| 1 | Hero video trimmed from 62.7s to 12.8s, cut exactly on a scene boundary so the loop is clean. Stream copy, so no re-encode and no quality change. | `videos/hero-mobile.mp4`, `videos/hero-desktop.mp4` |
| 2 | Hero video sources moved out of the markup and attached after the page loads. `preload="none"`. | `v2/home.php`, `v2/de-home.php`, `v2/pl-home.php`, `js/v2.js` |
| 3 | Google tags load after the page finishes or on first touch, whichever comes first. The `gtag()` stub still runs immediately and queues every call. | `v2/_head.php`, `header-inner.php` |
| 4 | `mp-icons.css` merged into `v2.css`, appended so the cascade order is unchanged. One less request in the critical chain. | `css/v2.css`, `v2/_head.php` |
| 5 | `v2.min.css` generated and served. Comments stripped, nothing else. | `css/v2.min.css`, `scripts/medpark-minify-css.js` |
| 6 | `preconnect` to googletagmanager.com. | `v2/_head.php`, `header-inner.php` |

## Measured result

| Critical path on a phone | Before | After |
|---|---|---|
| HTML | 20 KB | 20 KB |
| Render-blocking CSS | 52 KB | 28 KB |
| Hero poster | 142 KB | 142 KB |
| Google tag bundles | 312 KB | 0 KB, deferred |
| **Total** | **527 KB** | **190 KB, 64% less** |

| Also | Before | After |
|---|---|---|
| hero-mobile.mp4 | 2,895 KB | 766 KB, 74% less |
| Total page weight | 4,090 KB | about 1,024 KB |
| gtag main thread time | 1,414 ms | 0 ms until after load |

## Verified after deploy

- All five PHP files linted on the server before anything was moved into place.
- Six pages return HTTP 200: `/`, `/de/`, `/pl/`, `/healthhub.php`,
  `/emergency-urgent-care/`, `/hospitals-in-hurghada/`.
- Homepage rendered at 1440 and 390. Hero, nav, headline, buttons, icons and
  the WhatsApp button all correct. Icons confirm the merged CSS works.
- Title, both tag IDs and the hero poster preload all unchanged.
- The deferred pieces confirmed to load: after the page settles, the gtag
  script is in the DOM and the hero video source is attached. No analytics is
  lost and the video still plays.

## Not done, and why

- **The six oversized images.** Lighthouse claims 467 KB. It measures CSS
  pixels and ignores retina, so shrinking them to the reported size would make
  them blurry on modern phones. The correct fix is `srcset`, which gains less
  than Lighthouse claims. Held for a separate pass.
- **Full CSS minification.** Saved only 2 KB more than stripping comments and
  is where minifiers break stylesheets. Not worth it.
- **Contrast fix** for the Accessibility score. It changes colours, so it
  needs to be seen before it ships.
- **Removing 38 KB of unused CSS.** Too easy to break something subtle across
  27 templates.

## One open item

The PageSpeed Insights API returned HTTP 429, Google's shared daily quota for
anonymous calls. It is not our connection. Run PageSpeed from a browser to get
the new score. The byte counts above are measured directly and are not
estimates.
