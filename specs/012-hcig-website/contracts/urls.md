# Contract: addresses, redirects and the German gap

Trailing slashes everywhere, like the live site. Every redirect is one hop, 301, in `.htaccess`.

## Addresses that exist today [verified 2026-10-18]

| Address | Today | After the rebuild |
|---|---|---|
| `/` | 200 | Same address |
| `/about/` | 200 | Same address |
| `/services/` | 200 | Same address |
| `/partner/` | 200 | Same address |
| `/contacts/` | 200 | Same address |
| `/blog/` | 200 | Same address |
| `/blog/news1.php` to `/blog/news15.php` | 200 | 301 to `/blog/<slug>/` at the English go-live |
| `/de/`, `/de/ueber-uns/`, `/de/leistungen/`, `/de/kontakt/` | 200 | Same addresses; old PHP until wave two replaces them in place |
| `/index.php`, `/de/index.php` | 200 (duplicate) | 301 to `/`, `/de/` (Phase 0) |
| `/services.php`, `/blog.php`, `/kontakty.php` | 200 (duplicate) | 301 to `/services/`, `/blog/`, `/contacts/` (Phase 0) |
| `/news1.php` to `/news15.php` at the root | 200 (duplicate) | Phase 0: 301 to `/blog/newsN.php`. Go-live: rule rewritten to point straight at `/blog/<slug>/` |
| `/about.php`, `/partners.php` | 404, but in share tags | 301 to `/about/`, `/partner/` (Phase 0) |
| Any page with `?lang=en` or `?lang=de` | Same page, text switched by script | Go-live: 301 to the clean address in that language (checked against Search Console first) |
| `/send.php` | Live form handler | Stays until the new endpoint is live, then returns 410 |

## Section roots per language

| Section | en | de | pl | fr | it | es | cs |
|---|---|---|---|---|---|---|---|
| About | about | ueber-uns | o-nas | a-propos | chi-siamo | sobre-nosotros | o-nas |
| Leadership | about/leadership | ueber-uns/fuehrung | o-nas/zarzad | a-propos/direction | chi-siamo/direzione | sobre-nosotros/direccion | o-nas/vedeni |
| Services | services | leistungen | uslugi | services | servizi | servicios | sluzby |
| Partners | partner | partner | partnerzy | partenaires | partner | socios | partneri |
| Group | group | gruppe | grupa | groupe | gruppo | grupo | skupina |
| Network | network | netzwerk | siec | reseau | rete | red | sit |
| Trust | trust | vertrauen | zaufanie | confiance | fiducia | confianza | duvera |
| Press | press | presse | prasa | presse | stampa | prensa | tisk |
| News | blog | blog | blog | blog | blog | blog | blog |
| Events | events | veranstaltungen | wydarzenia | evenements | eventi | eventos | udalosti |
| Contact | contacts | kontakt | kontakt | contact | contatti | contacto | kontakt |
| Privacy | privacy | datenschutz | polityka-prywatnosci | confidentialite | privacy | privacidad | ochrana-osobnich-udaju |
| Legal notice | legal-notice | impressum | nota-prawna | mentions-legales | note-legali | aviso-legal | pravni-upozorneni |

Leaf slugs (each service, partner type, brand, news post) come from the keyword map in Phase 1 and are frozen in
`lib/routes.ts`. News slugs come from each post's title (TMASI rule: place and event names kept, 80 characters at most).

## The German gap (R4)

1. English go-live: the English PHP files move to `~/old-site-<date>/`. `/de/` and what it needs stay: `de/`,
   `i18n.js`, `css/styless.css`, `img/`, `fonts/`. `DirectoryIndex index.html index.php`.
2. The new English pages carry hreflang to the four German addresses that exist; the old German pages already point
   back after Phase 0. English addresses do not change, so those links stay valid.
3. Wave two writes the new German pages to the same four addresses and adds the new German pages. The old German PHP
   files move out only after the new files are uploaded and checked.
4. A redirect checker runs the full old-address list before and after each step.
