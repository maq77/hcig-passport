# HCIG email templates

Every email: **subject that says the ask**, ask in the first two lines, short
lines, one ask, sign-off. Replace `[needed: X]` before sending.

## Subject lines

`Brand · Topic · what you need`, under 60 characters.

- `MedPark · Website redesign · approval needed`
- `24/7 Clinic · Landing pages · 3 answers needed by 18 Sep`
- `HCIG · Weekly update · 15 Sep`

Never: "Update", "Quick question", "Following up".

## Sign-off

```
Mohamed Amin
[needed: job title, once, then store it here]
Healthcare International Group
```

Partner and insurer emails add: `partner@healthcareig.com`.

---

## 1. Approval request (to Irina)

```
Subject: MedPark · Website redesign · approval needed

Hi Irina,

The MedPark redesign is ready for your approval.
Link: https://hcig-passport.vercel.app/medpark/website-v2

What it is
44 pages in English, German and Polish.

What happens when you approve
It goes live on medparkhospitals.com the same day.

What I need
A yes, or the changes you want.

Thanks,
Mohamed
```

## 2. Weekly update (to Irina)

Generate the body from the registry: update `content/registry.js`, run
`npm run report`, paste `report.md`. Add at most two lines on top:

```
Subject: HCIG · Weekly update · 15 Sep

Hi Irina,

2 things need you this week: [item] and [item].
Everything else is below, and every line links to the work.

[report.md]
```

## 3. Information request (to a clinic, hotel or team)

Numbered questions. One line each on why it matters. A date.

```
Subject: 24/7 Clinic · Landing pages · 3 answers needed by 18 Sep

Hi [name],

The three hotel landing pages are built. Three facts block launch.

1. Which number should a guest call?
   247clinic.net shows +20 122 112 2246. Your films show +20 122 222 8247.
2. What is the real WhatsApp number?
   Every clinic currently shares a placeholder.
3. Can you send photos of the Steigenberger and Amwaj clinics?
   The pages need real rooms, not stock.

A reply by 18 Sep keeps launch on track.

Thanks,
Mohamed
```

## 4. Partner or insurer outreach (B2B)

Professional, confident, precise. No emoji. Approved figures only: 40+ years,
600,000+ patients, 350+ medical professionals, 135+ on-site clinics.

```
Subject: HCIG · Medical assistance for your guests in Egypt

Dear [name],

We would like to discuss medical assistance for [company]'s guests in Egypt.

Healthcare International Group has cared for travellers in Egypt for 40+ years.
600,000+ patients. 350+ medical professionals. 135+ on-site clinics.
We are an Official Partner of GHA and DMWV.

[one sentence on what we offer them, from approved copy]

Could we book 20 minutes in the week of [date]?

Kind regards,
Mohamed Amin
[title]
Healthcare International Group
partner@healthcareig.com
```

Use TMASI's B2B register for TMASI partners: "We expand your reach and bring
international patients seamlessly." (verbatim only).

## 5. Follow-up

```
Subject: Re: [original subject]

Hi [name],

Following my email of [date] about [topic].
I still need [the ask]. [one line on what it blocks].

Could you reply by [date]?

Thanks,
Mohamed
```

## 6. Blocked item escalation

```
Subject: MedPark · Business Profile · blocked on owner access

Hi Irina,

Business Profile work is blocked.

Why: only an Owner can grant API access. We hold Manager.
What unblocks it: the Owner sends a transfer, or promotes us to Owner.
Cost of waiting: a transfer takes 7 days to complete.

Who can do this?

Thanks,
Mohamed
```

## 7. Reply to a guest enquiry

Only if he asks. Clinical safety first.

- Emergency: first line is the emergency number as text, nothing before it.
- No diagnosis, no medical advice, no prices or outcomes not published.
- The brand's approved voice lines only, verbatim.
- No patient details copied into any other document.

## German and Polish

Write the English first and get it approved. Translate after. Flag in chat that
a native speaker must check. Keep names, numbers and links identical.
