# Generating images with Gemini: what it costs, where we use it, where we do not

Last updated 2026-09-10.

## The state of the key right now

The key works and it reaches every image model. It cannot generate anything yet,
because the project's prepaid credits are at zero. Every call comes back:

```
429 RESOURCE_EXHAUSTED
Your prepayment credits are depleted.
```

Top up at https://ai.studio/projects and it starts working immediately. Nothing
else needs changing.

**The key is now in `.env.local`, which is gitignored.** It is never committed.
This repository is public.

**Rotate this key.** You pasted it into a chat, so it exists outside the vault
now. Create a new one in AI Studio, put it in `.env.local`, delete the old one.
Same advice as the Pexels key.

## What it costs

Per image, in US dollars. Read from the Gemini pricing page on 2026-09-10.

| Model | 1K | 2K | 4K | Use it for |
|---|---|---|---|---|
| Flash Lite | $0.034 | | | Icons, textures, flat shapes, patterns |
| Flash | $0.067 | $0.101 | $0.151 | Heroes, banners, illustration. The workhorse |
| Pro | $0.134 | $0.134 | $0.24 | Anything with text in the image. Best composition |

There is no free tier for image generation. Every image is billed.

To put that against your budget, a complete visual pass over one site looks like
this:

| Work | Images | Model | Cost |
|---|---|---|---|
| Service illustrations, one per service | 12 | Flash 2K | $1.21 |
| Hero and section backgrounds | 8 | Flash 2K | $0.81 |
| Share cards, one per page | 10 | Pro 2K | $1.34 |
| Icon set | 40 | Lite 1K | $1.34 |
| Retries, because a third of them come back wrong | 25 | Flash 2K | $2.53 |

That is **$7.23** for a full set. Twenty dollars of credit covers 24/7 Clinic
and MedPark together with room to redo things. This is not a line item that will
hurt. The cost that matters is time spent rejecting bad output, not money.

Set a budget cap in the Google Cloud console anyway, so a loop in a script
cannot run away with it.

## Where we use it

**Service illustrations.** Dental, emergency, laboratory, room visit,
vaccination. Consistent flat illustration in Classic Red on white, one prompt
style reused so the set matches. This is the biggest win: right now these
sections use stock photographs of other people's clinics.

**Section and hero backgrounds.** Abstract, textural, brand coloured. Not
photographs of places.

**Share cards.** The three cards for the clinic pages are drawn in code today,
which is why they are plain. Pro renders text well enough to make a proper
designed card.

**Icons and spot art.** Cheap on Lite, and they can be made to match each other
in a way icon libraries cannot.

**Explaining a process.** The walk from the hotel, what happens at an insurance
claim, what a health check involves. A diagram is honest in a way a fake
photograph is not.

**Fixing what we have.** The edit mode takes an existing image and changes it.
Extend a photograph to a wider crop, remove a distracting object, recolour a
background to brand. This is useful on real photographs you supply.

## Where we do not use it

**Never a photograph of a real place we operate.** No generated image of a 24/7
Clinic entrance, a MedPark ward, or a reception desk, presented as that place.

Three reasons, and the first is the one that matters.

A guest who is unwell is looking at that image to find the building. If the
image is invented, they are looking for a door that does not exist. That is a
real person, at night, in pain, in a country they do not know.

Second, this is a healthcare provider. Invented images of a medical facility are
the kind of thing that ends up in a complaint, and Google's guidance on health
content treats trust signals seriously.

Third, you would know. You have seen these buildings. So would Irina, and so
would any guest who has been there.

**Never a generated member of staff or patient**, presented as one of yours.
Generic illustrated people are fine. A photorealistic "doctor" implying a real
person on your team is not.

**Never a generated review, badge, certificate or partner logo.**

The correct fix for a missing clinic photograph is one phone photograph of the
door, which takes a minute. Until then the network cards use Pexels stock of the
Red Sea coast, which reads as a mood image and not as a claim.

## Using it

```
node scripts/gemini.js cost
node scripts/gemini.js models

node scripts/gemini.js gen "<prompt>" <name> [--model lite|flash|pro] [--ar 16:9] [--size 1K|2K|4K]
node scripts/gemini.js edit <source> "<prompt>" <name>
```

Or `bat/image.bat`.

Every generation writes a line into `src/assets/AI-IMAGES.md`: the model, the
prompt, the date and the price. Nothing generated is untraceable, and
`node scripts/gemini.js cost` totals what has been spent.

The original file is always kept. A webp is made alongside it if ffmpeg is
present, never instead of it.

## Prompts that work for this brand

Keep a house style so a set of twelve looks like a set of twelve.

```
Flat vector illustration, [subject]. Classic red #C00000 and warm white only,
one 2px stroke weight throughout, generous white margin, no text, no letters,
no logos, no gradients, clean medical branding, centred composition.
```

```
Soft abstract background texture suggesting [idea], warm white and pale sand,
a single classic red #C00000 accent, very low contrast, nothing recognisable,
no text, no people, no buildings. Wide banner.
```

Three things that consistently go wrong. Ask for "no text" explicitly, because
these models like to add invented words. Name the exact hex, because "red" comes
back orange. And say "no people" unless you want people, because it adds them.

## Video

The key also reaches Veo. That is a different order of cost and the clinic
already has real films, so it is not worth it here. Worth remembering for a
service with no footage at all.
