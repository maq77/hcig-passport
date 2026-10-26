# Contract: addresses and redirects (HCIG v6)

Trailing slashes everywhere, like the live site. Every redirect is one hop, 301, written in `.htaccess` at go-live.
All seven languages launch together, so there is no German gap: the four German addresses are replaced in place.

## Live addresses (verified 2026-10-26, all 200)

| Address | After go-live |
|---|---|
| `/`, `/about/`, `/services/`, `/partner/`, `/contacts/`, `/blog/` | same address, new page |
| `/de/`, `/de/ueber-uns/`, `/de/leistungen/`, `/de/kontakt/` | same address, new German page (live German words kept) |
| `/blog/news1.php` to `/blog/news15.php` | 301 to `/blog/<slug>/` |
| `/group_ceo.php`, `/group_chairman.php`, `/group_coo.php` (public, linked from About) | 301 to `/about/leadership/` |

## Duplicates and leftovers that answer today

| Address | After go-live |
|---|---|
| `/index.php`, `/index1.php`, `/indexnew.php`, `/indexold.php`, `/inde.html` | 301 to `/` |
| `/de/index.php` | 301 to `/de/` |
| `/about.html`, `/about1.php`, `/aboutold.php`, `/about.php` (404 today, named in share tags) | 301 to `/about/` |
| `/services.php`, `/servis.php` | 301 to `/services/` |
| `/partners.php` (404 today, named in share tags) | 301 to `/partner/` |
| `/blog.php` | 301 to `/blog/` |
| `/kontakty.php`, `/contact.php` | 301 to `/contacts/` |
| `/news1.php` to `/news15.php` (root duplicates) | 301 to `/blog/<slug>/` |
| any page with `?lang=en` or `?lang=de` | 301 to the clean address in that language |
| `/send.php` (old form handler) | 410 once the new endpoint is live |
| everything else of the old site (admin folder, SQL file, test files, logs, old copies) | removed; only `old_hcig_backup_website.zip` stays, outside `public_html` |

## New English addresses

| Address | Page |
|---|---|
| `/about/leadership/` | Leadership |
| `/services/<line>/` x 7 | service lines (slugs from the keyword map) |
| `/maritime-cruise-healthcare/` | Maritime & Cruise Healthcare Solutions (manager's URL, exact) |
| `/partner/<type>/` x 6 | insurance-assistance-companies, embassies-government, hotels-and-resorts, tour-operators-travel-agencies, healthcare-providers, corporate-international-organisations (final from the keyword map) |
| `/group/`, `/group/<brand>/` x 8 | group hub and brand pages |
| `/network/`, `/trust/`, `/press/`, `/partner-kit/` | network, trust and standards, press room, partner kit |
| `/privacy/`, `/cookies/`, `/imprint/` | legal |

## Section roots per language

| Section | en | de | pl | fr | it | es | cs |
|---|---|---|---|---|---|---|---|
| About | about | ueber-uns | o-nas | a-propos | chi-siamo | sobre-nosotros | o-nas |
| Leadership | about/leadership | ueber-uns/fuehrung | o-nas/zarzad | a-propos/direction | chi-siamo/direzione | sobre-nosotros/direccion | o-nas/vedeni |
| Services | services | leistungen | uslugi | services | servizi | servicios | sluzby |
| Maritime | maritime-cruise-healthcare | from the keyword map | | | | | |
| Partners | partner | partner | partnerzy | partenaires | partner | socios | partneri |
| Group | group | gruppe | grupa | groupe | gruppo | grupo | skupina |
| Network | network | netzwerk | siec | reseau | rete | red | sit |
| Trust | trust | vertrauen | zaufanie | confiance | fiducia | confianza | duvera |
| Press | press | presse | prasa | presse | stampa | prensa | tisk |
| News | blog | blog | blog | blog | blog | blog | blog |
| Contact | contacts | kontakt | kontakt | contact | contatti | contacto | kontakt |
| Privacy | privacy | datenschutz | polityka-prywatnosci | confidentialite | privacy | privacidad | ochrana-osobnich-udaju |
| Cookies | cookies | cookies | pliki-cookie | cookies | cookie | cookies | cookies |
| Imprint | imprint | impressum | nota-prawna | mentions-legales | note-legali | aviso-legal | pravni-upozorneni |

English sits at the root; the other languages under `/de/`, `/pl/`, `/fr/`, `/it/`, `/es/`, `/cs/`. Leaf slugs (service
lines, partner types, brands, posts, the maritime page in six languages) come from the keyword map and are frozen in
`src/lib/site.ts`. Post slugs come from each post's title (place and event names kept, 80 characters at most).

## Checks

- `scripts/check-redirects.mjs` runs the full old-address list against the live build before the swap and against the
  live domain right after it: every old address answers 200 or one 301 to a 200.
- hreflang on every page lists all seven languages plus x-default (English), reciprocal.
