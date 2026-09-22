# MedPark Search Console review

22 Sep 2026 · Mohamed Amin · source: Performance on Search export, 22 Sep 2026

**Read this first.** The file says "Last 3 months". It holds 16 days.
Data runs 4 Sep to 19 Sep 2026. Every number below is 16 days, not 90.

| Total | Value |
|---|---|
| Clicks | 139 |
| Impressions | 5,398 |
| CTR | 2.57% |
| Average position | 5.8 |
| Days of data | 16 |

---

## is last few days dcreasing is because what we are doing ?

No. There is no decrease.

| Half of the window | Clicks | Impressions | Position |
|---|---|---|---|
| 4 to 11 Sep | 71 | 2,765 | 5.84 |
| 12 to 19 Sep | 68 | 2,633 | 5.75 |

Three clicks apart. Position got slightly better, not worse.

Daily clicks over the 16 days run between 5 and 14. At that size a move from
14 to 5 is normal movement, not a trend. The last day in any export is also
incomplete. Search Console reports 2 to 3 days behind.

Nothing we did caused a drop, because there was no drop.

## is it beacuase of running google ads ?

No.

Google Ads does not change organic ranking. This export is filtered to
"Search type: Web", so paid clicks are not in it at all.

One real effect exists and is worth knowing. When an ad and the organic
listing both show on the same search, the click can go to the ad instead of
the listing. That moves a click from organic to paid. It does not lose the
patient. At 139 clicks in 16 days that effect is too small to see.

## what is the cause of it then?

There is no decline to explain. There are four real problems holding the
numbers down. These are the causes worth your attention.

| # | Finding | Evidence | Impact | Priority |
|---|---|---|---|---|
| 1 | The site only wins its own name. Non-brand searches almost never convert to a click. | 209 non-brand queries, 918 impressions, 9 clicks. CTR 0.98%. Brand CTR is 4.25%. | Growth is capped. Nobody new finds us. | P0 |
| 2 | The German homepage carries an English meta description. | Checked live 22 Sep 2026. `/de/` description begins "MedPark Hospitals provides high-quality medical services". | German searchers read English before deciding to click. Germany is our second market. | P0 |
| 3 | Mobile LCP is 3.3s and failing. | Core Web Vitals export 17 Sep 2026. 14 URLs affected, data to 15 Sep. | Mobile is two thirds of impressions, 3,563 of 5,398. Slow pages lose visitors and rank. | P0 |
| 4 | ~~9 pages have no self-referencing hreflang.~~ **WITHDRAWN 22 Sep 2026. This was wrong.** | Checked every page by hand: all 14 carry en, de, pl and x-default, with a correct self reference. The finding was a bug in our own watchdog, which strips trailing slashes when it normalises a URL and then compared `/about` against the page's `/about/`. Tool fixed, regression test added. | None. There was never a defect here. | n/a |
| 5 | The German and Polish pages are never listed in sitemap.xml as pages of their own. | Fetched 22 Sep 2026. 15 `<loc>` entries, every one English. The 30 German and Polish URLs appear only as `<xhtml:link rel="alternate">` annotations, and there is no x-default anywhere. | Google can still find them, but a page that is only ever an annotation is weaker than one that is listed. These are our two target markets. | P0 |
| 6 | The new /hospitals-in-hurghada/ page is not in the sitemap at all. | Fetched 22 Sep 2026. | The newest page, built for exactly this problem, is the hardest one for Google to find. | P1 |

Two pages are where the loss is concentrated.

| Page | Impressions | Clicks | CTR | Position |
|---|---|---|---|---|
| /healthhub.php | 996 | 7 | 0.70% | 4.85 |
| /emergency-urgent-care/ | 270 | 0 | 0.00% | 4.37 |

Both sit around position 4 to 5. Both are near invisible. Together they were
shown 1,266 times and produced 7 clicks. At 3%, a modest CTR for that
position, they would have produced 38.

## how can we fix that if we can?

Yes, all of it. In this order.

| Fix | Effort | Why first |
|---|---|---|
| Write a German meta description for `/de/` and every German page. | 2 hours | Cheapest fix on the list. Germany is 634 impressions. |
| Get the mobile LCP under 2.5s. | Needs your Lighthouse data | Blocks everything else. See the note at the end. |
| Rewrite the title and description on `/healthhub.php` and `/emergency-urgent-care/` to answer the search, not describe the building. | 3 hours | These two pages are the largest single loss. |
| Put the German and Polish URLs into sitemap.xml, plus the new Hurghada page. | 1 hour | Largest fix for the smallest effort on this list. |
| Claim the local pack for "hospital hurghada" through Google Business Profile. | Ongoing | See the next answer. |

## full review about each and all to make everything works right and fix mistakes we made if we made?

**Mistakes we made.** Three, and they are ours.

1. The German description was never translated.
2. The sitemap listed only the English pages. German and Polish appeared as
   annotations, never as pages of their own, and x-default was missing.
3. A claim we had already removed came back. `/hospitals-in-hurghada/` is live
   and says "Allianz, AXA, Cigna, Bupa direct billing". The review on 19 Sep
   removed exactly that claim. It returned on the new page. I have stopped
   that ticket and it needs your answer, below.

**Not mistakes, but wrong assumptions.**

- The export is 16 days, not 3 months. Judging a trend on it was never going
  to work.
- `/hospitals-in-hurghada/` does not appear in this data at all. It went live
  around 19 Sep, after the window closed. It has not had a chance yet. Do not
  judge it until the next export.

**What is working and should not be touched.**

| Working | Evidence |
|---|---|
| Titles on the English pages are correctly targeted. | `/healthhub.php` title reads "Hospital in Hurghada & Sahl Hasheesh". |
| Polish page is properly localised. | `/pl/` title and description are both Polish. |
| Schema is rich and correct. | Hospital, MedicalWebPage, BreadcrumbList, GeoCoordinates all present. |
| Brand searches rank well. | "medpark hospital hurghada" position 1.1, "medpark health hub" position 1.2. |
| Tracking is on the right property. | Checked live 22 Sep 2026. All five pages tested serve G-LE2B44N7SF plus the Ads tag AW-17729597588. |

One latent risk, not live. The previous developer's property G-QSK7TQV4S0 is
still written into `medpark-live/header.php` for English, German and Polish.
Those templates are not the ones being served, so nothing is leaking today.
Delete them before someone switches a template back.

**One caveat on all query numbers.** Google hides rare queries. The named
queries account for 64 clicks. The site total is 139. So 54% of clicks are on
searches Google will not name. Treat query tables as direction, not as a full
count.

## how can we get more organic and get more traffic and more clicks and more visitors and how can we get more tourists ?

The single largest gap is CTR on searches we already rank for. We are being
shown 5,398 times and clicked 139 times. Position is not the problem. Position
5.8 is page one. The problem is that people see us and scroll past.

| Where the growth is | Now | Realistic |
|---|---|---|
| Non-brand CTR | 0.98% | 3% to 4% |
| /healthhub.php CTR | 0.70% | 3% |
| /emergency-urgent-care/ CTR | 0.00% | 3% |

Concretely: lifting those two pages alone to 3% CTR is 31 more clicks on the
same impressions. That is 22% more traffic for the whole site without ranking
one place higher.

**For tourists specifically,** the audience is not where it looks.

| Country | Clicks | Impressions |
|---|---|---|
| Egypt | 83 | 2,254 |
| Germany | 20 | 634 |
| Poland | 9 | 286 |
| United Kingdom | 3 | 341 |
| United States | 0 | 326 |
| Netherlands | 4 | 163 |
| Switzerland | 4 | 89 |
| Austria | 4 | 82 |
| Czechia | 1 | 35 |

Egypt is 60% of clicks. That is not a local audience. A German tourist
standing in a Hurghada hotel searching "arzt hurghada" is counted as Egypt.
Country is the wrong lens. Language is the right one.

German speaking total, Germany plus Austria plus Switzerland: 28 clicks and
805 impressions. That is the second business after Egypt, and it is the one
with an English description on its homepage.

## how can we target global keywords like hospital in hurghada ?

Here is the honest answer, and it is not what you expect.

We already rank for it. We just do not get the click.

| Query | Impressions | Clicks | Position |
|---|---|---|---|
| hurghada medical center | 59 | 0 | 7.7 |
| hurghada hospital | 53 | 0 | 5.6 |
| krankenhaus hurghada | 49 | 0 | 5.7 |
| hospital hurghada | 40 | 0 | 6.9 |
| medical center hurghada | 32 | 0 | 7.8 |
| hurghada hospitals | 20 | 0 | 9.6 |
| hospitals in hurghada | 17 | 0 | 8.1 |

Seven searches. 270 impressions. Zero clicks.

The reason is that "hospital in hurghada" is a local search. Google puts the
map pack above the normal results. The clicks go to Google Business Profile
listings, not to websites. We are sitting below the map.

So targeting that keyword with a web page alone will not work. It needs three
things together.

| Action | Owner |
|---|---|
| Google Business Profile: correct category, full hours, photos, and reviews. This is where the clicks actually go. | Needs your decision on who owns the profile |
| A page that matches the words people type, so the organic listing under the map is worth clicking. | Us. `/hospitals-in-hurghada/` is already live and untested. |
| Reviews. Check how many reviews the Health Hub profile has. One search in the data reads "medpark health hub hurghada 1 reviews", 79 impressions, position 3.3, zero clicks. Verify the count. | Needs checking |

Reviews are probably the highest return action on this whole page, and they
cost nothing but asking.

## what keywords can we make didicated landing page that will drive us more customers and audience and tourists ?

Ranked by evidence in this export, not by guess.

| # | Page to build | Evidence, 16 days | Language |
|---|---|---|---|
| 1 | Krankenhaus Hurghada, German speaking care | krankenhaus hurghada 49, hurghada krankenhaus 28, hurghada krankenhaus deutsch 16, bestes krankenhaus hurghada 14, deutsches krankenhaus hurghada 4 | German |
| 2 | Medical centre in Hurghada | hurghada medical center 59, medical center hurghada 32 | English |
| 3 | Emergency care, rewrite of the page we have | 270 impressions, 0 clicks, position 4.37 | English, then DE and PL |
| 4 | Szpital w Hurghadzie | szpital 31, szpital hurghada 11 | Polish |
| 5 | Ziekenhuis Hurghada | ziekenhuis hurghada 12, Netherlands 163 impressions | Dutch, new language |
| 6 | Sahl Hasheesh clinic | sahl hasheesh medical centre 8, 1 click at position 4.2 | English, DE |
| 7 | Treatment with travel insurance, cashless | No query data. No page exists, so no data can exist. | EN, DE, PL |

Number 1 is the clearest. The German cluster is over 110 impressions in 16
days, the words "deutsch" and "deutsches" appear inside the searches, and our
German page currently greets those people in English.

Number 7 has no evidence and I am recommending it anyway. Every insured
tourist asks whether they will have to pay. No page answers it, so the search
can never show us. Build it and measure it.

## if there is more insights you can give me from that file ?

| Insight | The number |
|---|---|
| Mobile is the business. | 3,563 of 5,398 impressions. Mobile CTR 2.75% beats desktop 2.16%. This is why LCP 3.3s matters more than it looks. |
| We are burning impressions on the wrong company. | "medpark.io" 111 impressions, 0 clicks. That is a different business. Those people will never be our patients. |
| The UK sees us and ignores us. | 341 impressions, 3 clicks, 0.88%. |
| The US sees us and never clicks. | 326 impressions, 0 clicks. |
| Rich results are almost absent. | Only "Review snippet" appears, 20 impressions, position 11.75. No FAQ, no sitelinks. |
| "24/7 clinic hurghada" is searched. | 13 impressions, position 7.5, on the MedPark site. Confirms 24/7 and MedPark must stay separated in search. |
| People search for named competitors. | "hurghada military hospital" 16 impressions. |
| Our own brand is misspelled constantly. | medprk, medparc, med park, medpark.io. Worth owning the misspellings. |

## if there is ideas we can make ?

Ideas not in the current plan.

1. **Sell the language, not the building.** The searches say "deutsch",
   "deutsches", "polski lekarz". Nobody searches "modern hospital". The one
   thing a frightened tourist wants is a doctor who speaks their language.
   That belongs in the title, not on page three. Confirm with the clinic which
   languages are genuinely staffed before we claim any of them.

2. **Add Dutch.** The Netherlands is our fourth market by clicks with no Dutch
   page at all. "ziekenhuis hurghada" is already being searched. Dutch
   tourists are a large Red Sea segment and nobody is serving them.

3. **Stop reporting by country. Report by language.** Egypt at 60% of clicks
   hides the fact that most of those are tourists already in Hurghada
   searching in German. That is the highest intent audience we have. They need
   a doctor today.

4. **Answer engines.** Tourists increasingly ask ChatGPT and Google AI
   Overviews "where do I find a doctor in Hurghada". Those answers are built
   from clear factual pages, not marketing pages. A plain page of facts,
   address, hours, languages, insurance accepted, is what gets quoted.

5. **The insurance question as the front door.** Cashless and direct billing
   is the real decision a tourist makes. Treat it as a page, not a paragraph.

6. **Own the misspellings.** medprk, medparc, med park. Cheap, and they are
   already producing impressions.

## One thing only you can answer

`/hospitals-in-hurghada/` is live right now and states "Allianz, AXA, Cigna,
Bupa direct billing" and "direct cashless billing with major international
travel insurers".

Naming four insurers and promising direct billing is a contractual claim, not
marketing copy. Does MedPark hold direct billing agreements with Allianz, AXA,
Cigna and Bupa?

- If yes, it stays and I will add the sitemap entry and hreflang.
- If no, it comes down today.

I have not changed the wording, because guessing at an insurance claim is
worse than leaving it and asking.

## Notes

- Method: Search Console export 22 Sep 2026, data 4 to 19 Sep. Core Web Vitals
  export 17 Sep 2026. Live page checks and a watchdog crawl run 22 Sep 2026.
- No search volume figures appear here. None were measured. Every number in
  this report comes from your own Search Console data.
- Query totals cover 64 of 139 clicks. Google hides the rest.
- Closed question: intermittent connection failures seen while testing are the
  internet here dropping, confirmed by you on 22 Sep. Not the server. The same
  cause explains the agy worker DNS errors. The server answers in 0.66s when
  it answers. Nothing to fix on MedPark.
- The speed work you asked about is done and live, checked 22 Sep 2026.
  Caching: static files return `public, max-age=31536000, immutable`, one
  year, with gzip on CSS. HTML is `no-cache`, which is correct for PHP.
  Hero before video: `/videos/hero-poster.webp` is preloaded at
  `fetchpriority="high"`, and every `<video>` on the page carries
  `preload="none"`, so no video byte downloads before the image.
- The 3.3s LCP predates that work. The export is dated 17 Sep and its data
  stops on 15 Sep. The fixes went live around 19 Sep.
- Field data is a 28 day rolling average, so it moves slowly. We are reading
  an old number. A fresh Lighthouse run is the next step.
- One thing that may still cost us: the hero poster is 145 KB. It is the
  likely LCP element. Worth testing a smaller one once we have the new
  reading.
