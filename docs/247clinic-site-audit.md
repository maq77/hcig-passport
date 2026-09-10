# 247clinic.net as it stands today

Measured on the live site on 2026-09-10, not guessed. Every number here was
taken by fetching the pages.

Section 39 of their brief asks for a technical check before publishing. This is
it, and two things on our own older list turned out to be already fixed.

## Fixed since we last looked

**The sitemap works.** `/sitemap.xml` returns 200 and lists 11 URLs. Our earlier
note said it returned a 500. That is no longer true.

**Titles and descriptions are there.** All seven main pages carry a unique title
and a meta description, and they are decent ones. Our earlier note said several
were blank. Also no longer true.

Whoever fixed those did good work. The list below is what is left.

## Still broken

### There is no 404 page

`https://www.247clinic.net/this-page-does-not-exist-12345` returns **200 OK**
with the homepage. Every wrong URL on the site does.

This is the most damaging item on the list. Google treats it as a soft 404,
every typo and every dead link becomes a duplicate of the homepage, and the
crawler has infinite pages to wander through. It also means nobody can tell a
broken link from a working one, which is why our own link checks kept passing
against pages that do not exist.

### No canonical tag on any page

Checked on the homepage, services, insurance, our clinics, about us, contact and
FAQs. None of the seven has one. Combined with the missing 404 this is what lets
duplicate URLs multiply.

### The homepage has no H1

Not a wrong H1. None at all. The hero headline "We Cover all your Needs" is an
H2. Her SEO list asks for one clear H1 per page.

### robots.txt does not point at the sitemap

The file is otherwise fine. It just needs one line:
`Sitemap: https://www.247clinic.net/sitemap.xml`

### Sixteen links open a new tab without rel="noopener"

On the homepage alone. The opened page gets a handle back on yours.

## What the brief already calls out, confirmed live

- **The "00" counter** is on the homepage now. Section 14.
- **"What our Patients Says"** is the testimonials heading. Section 31.
- **Beauty & Wellness leads the hero.** The slider's second panel is
  "Be Beautiful". Sections 6 and 29 both say to remove it from the hero.
- **The blog stopped in November 2023.** Two articles, both that month.

## Weight

| Part | Size |
|---|---|
| Homepage HTML | 114 KB |
| Its own assets, 34 files | 1,202 KB |
| **Total** | **1,316 KB** |

| Heaviest single files | Size |
|---|---|
| bundle.min.css | 576 KB |
| bundle.min.js | 321 KB |

**897 KB of that 1.3 MB is two framework bundles.** Section 36 asks for unused
JavaScript and CSS to be dealt with, and this is where it lives. A tourist on
hotel wifi, feeling unwell, is downloading three quarters of a megabyte of
framework before they see a phone number.

This is not something to fix by hand-trimming the bundles. It is fixed by
loading the slider and animation libraries only on the pages that use them.

## What is good and should not be touched

Every image on the homepage has an alt attribute. All 34 of them. That is
unusual and someone deliberately did it.

The typography, the red, and the general feel are fine. Their brief says keep
the layout and the blocks, and having seen the site, that is the right call.
The problem is what the page says, not how it looks.
