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

## What the repositioning brief adds that is not built yet

**The accreditation.** 24/7 Clinic is the first international urgent care
network outside the United States accredited through the Urgent Care Association
and CAUCQ. This is the strongest trust signal they have and it is not on the
landing pages at all. It should sit close to the top of every one. I have not
added it yet because I do not have the accreditation logo or confirmation of how
it may be displayed.

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
2. The accreditation logo, and confirmation of how it may be shown.
3. Confirmation of the years, the clinic count and the patient numbers.
4. The real WhatsApp number for each clinic, not one shared placeholder.
5. Which phone number is correct. The site says 122 112 2246, the films say
   122 222 8247.
