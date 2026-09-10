# The two briefs, and what they change

Written 2026-09-10, after reading the repositioning brief (WEBSITE.docx) against
the landing page task.

There are now two briefs on the table and they disagree in one important place.
Everything else lines up.

## The one real conflict: the URL structure

| Source | Structure | Example |
|---|---|---|
| Landing page task | `/destination/hotel-clinic` | `/sahl-hasheesh/premier-le-reve-clinic` |
| Repositioning brief, section 20 | `/clinics/destination/hotel-name` | `/clinics/soma-bay/steigenberger-hotel-clinic` |

The three pages are built on the first one, because that is what was approved on
8 September and it is what the landing page task asks for.

**My recommendation is to keep the shorter form.** Two reasons. It puts the
destination first, which is the part people search, and the `/clinics/` folder
adds a level without adding meaning. The counter-argument is real though: the
folder makes the site's structure obvious and gives a natural parent page at
`/clinics`. If the wider site is being reorganised around folders anyway, that
consistency is worth more than the shorter path.

This needs one decision, and it should be made before anything is indexed.
Changing it afterwards means redirects.

## What the repositioning brief changes, and is now done

**WhatsApp is the main conversion, not the phone.** The brief is unambiguous.
The GA4 events now use their names: `whatsapp_medical_click`, `phone_click`,
`clinic_directions_click`, and `clinic_view` on every page load.

**The insurance promise was too strong.** The pages said we deal with your
insurer and write the report your claim needs. The brief is explicit that
cashless treatment must never be promised universally, only where the insurer
approves and the policy allows. That was a real exposure: a guest who reads a
promise and is then billed has a complaint. The FAQ now says what the brief
says.

**A hotel room visit was missing.** It is one of their six services and it was
nowhere on the page. It is in the FAQ now.

**Find the clinic was missing.** The landing page task asks for three buttons
above the fold: call, WhatsApp, find the clinic. There were only two and a Watch
video button that was wider than either. All four are now the same size, two by
two, with the phone number underneath.

## Corrected 2026-09-10, after checking her list line by line

**The hero line was ours, not hers.** She sets it: "24/7 Clinic located inside /
serving [Hotel Name]." The pages said "24/7 Urgent Care Clinic, in the grounds
of the hotel", which never names the hotel, and design 3 added a second sentence
on top of it. Now:

| Clinic | Line |
|---|---|
| Premier Le Reve | 24/7 Clinic located inside Premier Le Reve Hotel & Spa. |
| Steigenberger | 24/7 Clinic serving Steigenberger Resort Ras Soma. |
| Amwaj | 24/7 Clinic serving Amwaj Beach Club Abu Soma. |

Inside for Le Reve, because the clinic is on the property and there is film of
its own door. Serving for the other two, because nobody has confirmed the clinic
is within the building and the safer of her two words is the true one.

**Four services she names were missing.** Her list asks for doctor consultation,
medical examination, treatment of minor injuries, laboratory and diagnostic
coordination, and hospital referral. The grid had six cards and covered about
half of it. It has eight now, and every item on her list appears somewhere on
the page. The insurance card also carried the same flat promise the FAQ did, and
is reworded.

## What the repositioning brief adds that is not built yet

**The accreditation is now on the page**, as a band directly under the hero,
which is where section 7 puts it. The sentence is copied from their brief word
for word and not reworded, because an accreditation claim is a legal statement
rather than marketing copy. Nothing on the page claims more than that sentence,
per section 23.

**Three marks are on the band**, supplied 2026-09-10 with permission:

| Mark | What it is |
|---|---|
| UCA | Urgent Care Association, Egypt and MENA |
| GHA | Global Healthcare Accreditation, for medical travel |
| GMWA | Deutscher Medical Wellness Verband e.V., certified |

Each carries a small caption naming the body and nothing else. An unexplained
roundel tells a guest nothing, and a caption that only names the issuer makes no
claim about what the mark means, which is what section 23 requires.

The band is white rather than the brand pink. UCA came through as a transparent
PNG and is used exactly as supplied. GHA and GMWA are flat JPEGs on white, so a
coloured band would put a white box behind those two. Send those two with
transparency and the band can take any colour we like. White is also the safest ground under most certification
mark usage rules. The marks were trimmed and their ground flood filled to pure
white; nothing else was touched, because a certification mark is not ours to
redraw.

Two things worth checking with the issuer:

The UCA file is the association's Egypt and MENA chapter mark. If UCA issues a
distinct accreditation seal, that is the more accurate one to show beside a
sentence about accreditation.

No CAUCQ mark was supplied, although the claim names CAUCQ alongside UCA.

The GHA file is small, 179 by 99 after trimming. It renders acceptably at 52px
high but a larger original would be sharper on a phone.

One thing deliberately left out: the brief's "Learn About Our Accreditation"
button. It points at `/international-accreditation`, which does not exist yet,
and a button to a 404 is worse than no button.

**Cashless care as a conversion block.** The brief wants "Check Your Insurance on
WhatsApp" with a list of what to send: name, hotel, insurer, policy number,
insurance card, passport, and a description of the problem. That is a much
stronger section than the row of insurer logos currently there.

**Pre-filled WhatsApp messages per page.** Ours says "Hello, I need a doctor at
[hotel]". Theirs is "Hello, I am staying at [Hotel Name] and need medical
assistance." Trivial to change, worth matching exactly so their team can tell
where an enquiry came from.

## Two things to check before publishing

**The numbers.** The pages say "Since 2001" and "28 clinics", taken from their
own home page. Section 14 of the brief says the site's counters are broken and
currently show 00, and that any number used must be factually confirmed. So the
figures I copied may not be reliable. Someone needs to confirm both before these
pages go live.

**Beauty and wellness.** Section 29 says it must not compete with urgent care
positioning. Two of the four service films on the pages are tooth jewellery and
aesthetic procedures. They are good films, but on a page whose job is to reach
someone who is unwell they pull in the wrong direction. I would drop them from
the landing pages and keep them on the main site.

## Where the two briefs agree, and we already match

- One page per hotel clinic, on the main domain, never a separate site.
- Titles built on the search, not the brand: doctor, clinic, and the town.
- MedicalClinic, FAQPage, BreadcrumbList and Organization schema.
- Google map and a Directions link on every page.
- A floating WhatsApp button and a sticky mobile call to action.
- Mobile first, fast, contact details above the fold.
- Unique content per clinic rather than one page with the name swapped.
- No "Make an Appointment". Someone who is unwell is not booking.
- Destination pages as a later phase: Hurghada, Makadi Bay, Marsa Alam,
  El Quseir, North Coast.

## What is still needed from them

Unchanged from the open items list, plus two from the new brief.

1. Photographs of each clinic. The brief asks for clinic photographs on every
   page and there are none that can be used.
2. On the accreditation, now that the three marks are in place:
   - the CAUCQ mark, which the claim names but which was not supplied;
   - confirmation that the UCA chapter mark is the right one to show, or the
     accreditation seal if a separate one exists;
   - a larger GHA file if one exists, the supplied one is 200px square;
   - GHA and GMWA as transparent PNGs, like the UCA one, which would free the
     band from having to be white;
   - confirmation that the sentence now on the page is the approved wording.
3. Confirmation of the years, the clinic count and the patient numbers.
4. The real WhatsApp number for each clinic, not one shared placeholder.
5. Which phone number is correct. The site says 122 112 2246, the films say
   122 222 8247.
