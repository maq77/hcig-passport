# Medcierge rebuild. What changed, and what needs a yes

Preview: https://hcig-passport.vercel.app/medcierge
Built 2026-09-14 from the live site at medcierge.com. Same URLs, same sections, same images, same words, except the lines below.

---

## What is fixed

**Search engines and AI answer engines can now read the site.**
The live site sends an empty page and builds it in the browser. Every page is now real HTML.

**Every page has its own title, description and canonical.**
Live: 7 of 9 pages share the homepage title and description.

**The invented review rating is gone from the code.**
Live schema claims 4.9 stars from 15,000 reviews and a phone number of "+20-XXX-XXX-XXXX". Google penalises ratings with no real source.

**Structured data added.**
Organisation with 24/7 hours and all 12 service areas, breadcrumbs on every page, the services list, and a local listing for Hurghada.

**The map works.**
Live map is stuck on "Loading map..." because its Mapbox key is missing. The new map needs no key.

**Link previews show the clinic, not Lovable.**
Live share image is Lovable's default picture.

**One WhatsApp button, emergency line always visible.**
Live mobile shows four floating buttons over the content (chat, WhatsApp, pay, call).

**Three logos were invisible.**
DER, ETI and FTI were white on white. Recoloured.

**Ready for the real deploy.**
Sitemap, robots.txt that lets AI crawlers in, and llms.txt. One command builds the indexable version.

**Design.**
Light, cream and white, navy text, the site's own gold, Playfair Display and Inter kept. Red for the emergency line, green for WhatsApp, as on every HCIG site.

**Homepage upgraded with motion and depth.**
Hero of three real photos in 3D, turning with the pointer and drifting on scroll. Partner logos move in two rows, with a pause button. Facilities slide sideways as you scroll. A gold line fills through the four steps. The map draws a route down the coast and lights each town.

**All motion switches off for visitors who ask for less motion.**
The page is complete without it. Emergency and WhatsApp never animate in.

**New share image.**
Brand, headline, hotline and the lobby photo, for WhatsApp and social previews.

---

## Words that changed

| Where | Live says | Now says | Why |
|---|---|---|---|
| Home hero, trust strip, meta | 150+ luxury hotels | 50+ | The site says 15+, 50+ and 150+. 50+ is the most used |
| Home "Why guests trust" | 15+ partner hotels | 50+ | Same |
| Home "Why guests trust" | 100% guest satisfaction | 98% satisfaction rate | 100% is a claim ad rules forbid. 98% is the About page's own figure |
| Accreditations, About, Partners | GHA "Accredited since 2020", "Prestigious certification" | Official Partner of Global Healthcare Accreditation | HCIG's verified status. Partner is not accredited |
| Accreditations, About, Partners | German Medical Association (GMA), "Accredited since 2022" | German Medical Wellness Association (DMWV), Official Partner | The live Partners page already links to dmwv.de |
| Partners, About | UCA "Accredited since 2016", "International accreditation for urgent care excellence" | Year and "accreditation" removed | Not verified. See question 3 |
| Service Areas | City phones "+20 65 XXX XXXX" | The hotline, +20 120 678 8566 | Placeholders were live |
| Home map | "Elite Hospital" in Cairo (3), Giza, Alexandria, Hurghada, Sharm, Luxor | Removed | Not verified. A tourist could look for a hospital that does not exist |
| Booking form | "By booking, you agree to our terms of service. A confirmation will be sent to your phone." | "For emergencies, please call our hotline directly." | There is no terms page, and no SMS is sent |
| Everywhere | Em dashes | Full stop or comma | House style |

---

## Needs an answer before it goes live

1. **How many partner hotels, really?** 15+, 50+ or 150+.
2. **Satisfaction rate and the 4.9/5 rating.** Where do they come from?
3. **Does the clinic network hold UCA accreditation?** If yes, since when.
4. **The GMA logo.** Which organisation is it?
5. **The eight "Elite Hospital" locations.** Do they exist?
6. **Real phone numbers per city**, or the hotline for all.
7. **ISO 9001 and HIPAA.** Is there a certificate? Kept for now.
8. **The six testimonials and Michael K.** Where were they posted? Kept for now.
9. **"Arriving within 15 minutes".** Can every area promise this? Kept for now.
10. **Opening hours.** Four cities show 8:00 AM to 10:00 PM, while the site says 24/7 everywhere.
11. **Hotel lists disagree.** Home lists Four Seasons, Hyatt, Ritz-Carlton. Partners page lists Oberoi, Albatros, Baron.
12. **Photos.** All seven look AI generated, including fake "URGENT CARE" signage. Real clinic photos would be stronger.
13. **Privacy policy and terms.** Footer links point nowhere. A privacy policy is required for EU guests.
14. **Forms.** The preview sends callback and booking requests to WhatsApp, filled in. Live stores them in Supabase. Which one for launch?
15. **Chat assistant.** Not in the preview. Its error message sends people to +960 123 4567, a Maldives number.
16. **Pay Now button.** Not in the preview. Where should payment live?
17. **Dashboard and video calls** still open the live patient portal.
