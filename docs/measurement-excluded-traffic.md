# Keeping our own traffic out of the numbers

Spec: `specs/001-measurement-foundation/spec.md`, FR-009.
Implemented in `src/assets/hcig-tracking.js`. Written down here because an
exclusion rule nobody can read is a rule nobody can check.

## The rule

The check runs immediately after the measurement ID check and before anything
else. When it matches, the module returns. GA4 is never loaded, no event is
sent, and no request leaves the page. An excluded visit costs nothing and
appears nowhere.

Order matters. Excluding after loading GA4 would still register a page view.

## What is excluded, and how

| Source | How it is identified | Certainty |
|---|---|---|
| Playwright, Puppeteer, Selenium | `navigator.webdriver` is true | Reliable. Set by the browser itself, not by us. |
| Our own watchdog crawler | Sends no JavaScript requests at all | Total. It fetches HTML and never runs a page. |
| Local development | hostname is `localhost` or `127.0.0.1` | Reliable. |
| Preview deploys | hostname ends in `.vercel.app` | Reliable today. See the risk below. |
| Lighthouse and PageSpeed Insights | `Lighthouse`, `Chrome-Lighthouse` or `Speed Insights` in the user agent | Reliable. Google sets these. |
| Headless Chrome | `HeadlessChrome` in the user agent | Mostly reliable. Trivially spoofed, but nothing we run spoofs it. |
| Googlebot | `Googlebot` in the user agent | Belt and braces. Googlebot does not report to GA4 anyway. |

## What is NOT excluded, and why

Naming these matters more than the list above. These are the gaps.

- **Our own team browsing the live sites normally.** A real person on a real
  phone looking at medparkhospitals.com is counted as a visitor, because from
  the browser's point of view they are one. There is no reliable client-side
  way to tell staff from a guest. The honest fix is a GA4 property-level IP
  filter, or an internal-traffic rule set in GA4 Admin, and that has not been
  done. Until it is, assume a small share of traffic is us.
- **Anyone at the clinic or hospital using the site on site Wi-Fi.** Same
  reason, same fix.
- **Screenshot runs driven through a real browser profile** rather than an
  automation driver, for example a person pressing print screen. Not
  detectable and not worth detecting.
- **Third-party uptime monitors or SEO crawlers** we do not control. Most do
  not run JavaScript, so they never reach this code, but one that does would
  be counted.

## The one real risk in this rule

Excluding every `.vercel.app` hostname is correct **only while no public site
is served from a vercel.app domain**. Today the only one is the HCIG Work
portal, which is internal and noindex, so excluding it is right. If a real
customer-facing site is ever put on a vercel.app address, this rule would
silently delete its traffic from the numbers. Anyone moving a site to Vercel
must change this line first.

## How to check it is working

1. Open a site with DevTools and run `navigator.webdriver`. It is `false` for
   a real visit, so tracking loads.
2. Run the page through PageSpeed Insights. No event should appear in GA4
   realtime.
3. Run any Playwright script against the page. No event should appear.
4. A clean way to confirm the negative: GA4 realtime should stay empty during
   an automated run that would otherwise produce a page view.
