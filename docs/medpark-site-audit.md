# Audit — www.medparkhospitals.com

Generated 2026-09-01 09:20 UTC · target `https://www.medparkhospitals.com/`

## Transport

```
HTTP/1.1 200 OK
Server: nginx/1.31.1
Content-Type: text/html; charset=UTF-8
Cache-Control: no-cache, must-revalidate
```

**Timing** (3 runs, seconds)

| run | dns | connect | tls | ttfb | total | bytes |
|---|---|---|---|---|---|---|
| 1 | 0.005717 | 0.210042 | 0.441598 | 0.655904 | 1.065302 | 60347 |
| 2 | 0.003341 | 0.225993 | 0.449305 | 0.662987 | 1.078857 | 60347 |
| 3 | 0.003662 | 0.208729 | 0.432476 | 0.646927 | 1.060117 | 60347 |

> TTFB over ~0.6 s is an origin problem, not a payload problem. See references/performance.md.

## Host canonicalisation

| host | status |
|---|---|
| https://medparkhospitals.com/ | 200 -> https://medparkhospitals.com/ |
| https://www.medparkhospitals.com/ | 200 -> https://www.medparkhospitals.com/ |
| http://medparkhospitals.com/ | 200 -> http://medparkhospitals.com/ |

## Head and indexability

- **Title** (82 chars): `MedPark Hospitals | Advanced Medical Care in Hurghada & El Quseir | 24/7 Emergency`
- **Description** (178 chars): `MedPark Hospitals provides high-quality medical services, 24/7 emergency care, diagnostics, surgery, dental treatments, and international patient support in Hurghada & El Quseir.`
- **Canonical**: `https://medparkhospitals.com/`
- **Robots meta**: `none (defaults to index,follow)`
- **Viewport**: 1 tag(s)
- **H1 count**: 1
- **hreflang in head**: 0
- **JSON-LD blocks**: 1
- **OG tags**: 0
- **meta keywords (obsolete)**: 1

Schema `@type` values found: ContactPoint Hospital Organization PostalAddress 

## Images

- total: **45**
- missing a non-empty `alt`: **2**
- missing `loading="lazy"`: **45**
- missing explicit `width`/`height` (CLS risk): **45**
- legacy formats (.jpg/.png) referenced: **22**

## Render-blocking and third-party resources

| kind | url | status | bytes | time |
|---|---|---|---|---|
| css | `../css/styles.css` | 200 | 76005 | 1.135564 |
| css | `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css` | 200 | 59305 | 0.391100 |
| css | `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css` | 200 | 102526 | 0.241360 |
| other | `https://fonts.googleapis.com` | 404 | 1621 | 0.486035 |
| other | `https://fonts.googleapis.com/css2?family=Arimo:ital,wght@0,400..700;1,400..700&display=swap` | 200 | 5379 | 0.231777 |
| other | `https://fonts.gstatic.com` | 404 | 1561 | 0.259195 |
| other | `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap` | 200 | 315243 | 0.458854 |
| other | `https://medparkhospitals.com/` | 200 | 60347 | 1.050995 |
| other | `https://www.googletagmanager.com/gtag/js?id=G-QSK7TQV4S0` | 200 | 506845 | 0.779058 |
| other | `logo.JPG` | 200 | 87464 | 1.083693 |
| css | `responsive.css` | 200 | 1394 | 0.644309 |

⚠ **Font Awesome loaded 2 times** at different versions — remove all but one.
🔴 **Placeholder API key `YOUR_API_KEY` in the page source** — that integration is broken in production.

## Tags

- GA4: G-QSK7TQV4S0 
- Google Ads: 
- GTM: 
- Meta pixel: 0

## robots.txt and sitemap

```
User-agent: *
Allow: /

# Block technical and duplicate files
Disallow: /cgi-bin/
Disallow: /tmp/
Disallow: /private/
Disallow: /*?*
Disallow: /*.php?*

# Allow important PHP pages explicitly
Allow: /news/*.php
Allow: /healthhub.php
Allow: /medparkhospital.php

# Sitemap
Sitemap: https://medparkhospitals.com/sitemap.xml
```

Sitemap `https://medparkhospitals.com/sitemap.xml` → status 200, 15 `<loc>` entries, 45 hreflang alternates.

## AI crawler access (GEO)

| bot | blocked? |
|---|---|
| GPTBot | not named (allowed by `User-agent: *`) |
| OAI-SearchBot | not named (allowed by `User-agent: *`) |
| ChatGPT-User | not named (allowed by `User-agent: *`) |
| PerplexityBot | not named (allowed by `User-agent: *`) |
| ClaudeBot | not named (allowed by `User-agent: *`) |
| Claude-User | not named (allowed by `User-agent: *`) |
| Google-Extended | not named (allowed by `User-agent: *`) |
| Bingbot | not named (allowed by `User-agent: *`) |
| Applebot-Extended | not named (allowed by `User-agent: *`) |

> Blocking AI crawlers removes the site from ChatGPT/Perplexity answers. See references/geo-ai-visibility.md.


---

Next: score findings with `references/audit-playbook.md`, then log them in the task memory file.
