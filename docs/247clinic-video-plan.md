# 24/7 Clinic, Premier Le Rêve. Where every film goes.

Prepared 2026-09-09, ready to apply. **Nothing has been changed on the three
designs yet.** They are waiting for you to look at them first.

Sixteen files sit in `247 material`. Your renaming settled what each one is, so
no film was opened to find out. Metadata only: duration and shape.

---

## The films, and where each one belongs

| File | Length | Shape | Where it goes |
|---|---|---|---|
| `Le reve 247 full commercial.mp4` | 68 s | landscape | **Hero.** Silent loop behind the headline, full film with sound in the lightbox |
| `how to find us video in sahl hasheesh le reve.mp4` | 24 s | portrait | **Where to find us.** Replaces the drawn plan and arrow |
| `patient 1.mp4` | 35 s | portrait | **Guest stories**, first |
| `patient 2.mp4` | 20 s | landscape | **Guest stories**, second |
| `staff.mp4` | 22 s | portrait | **The team**, first |
| `staff 2.mp4` | 20 s | portrait | **The team**, second |
| `staff 3.mp4` | 25 s | portrait | **The team**, third |
| `dental premier le reve 247.mp4` | 20 s | portrait | **Services**, dental |
| `sahl hasheeh dental 247 le reve.mp4` | 28 s | portrait | **Services**, dental, second angle |
| `emeregency 247.mp4` | 22 s | portrait | **Services**, emergency |
| `tooth jeweler 247.mp4` | 23 s | portrait | **Services**, tooth jewellery |
| `long beach -aethitic procedure.mp4` | 25 s | portrait | **Services**, aesthetic procedures |

### Not on this page

| File | Why |
|---|---|
| `dental 247 hurghada.mp4` | Hurghada, not Sahl Hasheesh. Belongs on a Hurghada page |
| `new alamin 247.mp4` | Gewan Resort, El Alamein. Belongs on a North Coast page |
| `247 clinic video intro - where you are in your hotel.mp4` | Network-wide intro. Better as the hero on clinics that have no film of their own, which is Steigenberger and Amwaj |

**One thing to confirm.** `long beach -aethitic procedure.mp4` was filmed at Long
Beach Resort, not at Premier Le Rêve. On this page it should be worded as a
service the network offers, not as something filmed here. Say the word if you
would rather it came off the Le Rêve page entirely.

---

## The three new sections

### Guest stories

Two films side by side. One portrait, one landscape, so they need different
frames rather than a matched pair. Each autoplays silently, with the guest's
country and one line of context under it. Sound on tap.

### The team

Three portrait films in a rail that scrolls, the same rail as the offers. Heading
along the lines of **"The people who will see you"**. This is the strongest trust
block available and it costs nothing to earn: they are named, on camera, in their
own clinic.

### Services

Four films, one per service: dental, emergency, tooth jewellery, aesthetic
procedures. As a grid of portrait cards, each with the service name and one line.
On a phone they stack; on a desktop they sit four across.

This replaces the current icon list on design 1 and the icon rows on designs 2
and 3, or sits under it. Worth deciding which.

---

## Where to find us

The drawn plan with the dotted arrow comes out. The film goes in, full width in
its column, silent and looping, with the three written steps beside it and the
Google map underneath.

The film carries its own burnt-in captions, which say the same thing as the three
steps. Keeping both is deliberate: the steps are readable with the sound off and
by a search engine, the film is faster for a guest standing outside the hotel.

---

## Free health check, made premium

It is a red band today. It becomes a proper block.

- **Their poster kept whole**, on the left, never cropped
- **Two animated tiles** beside it, one for blood pressure and one for blood
  sugar, each with a drawn icon: the cuff inflating, the meter reading rising
- **A "no appointment" line** with a tick that draws itself
- **A red call button**, because the offer is the reason to press it
- Motion is CSS only, respects reduced motion, and every tile is legible frozen

The animation earns its place by showing what the check is, not by decorating.
Lottie files would do it better and I will swap them in when you have the account.

---

## Weight, and when to deal with it

Twelve films at the quality you asked for is roughly **60 to 80 MB** on one page
if they all load. Nothing will load unasked:

- Every film gets a short silent loop for the preview, a few hundred KB each
- Full films load only when someone presses play
- Below the fold, loops load only when scrolled to

That keeps the page honest at high quality. The real optimisation pass comes
before it goes live on 247clinic.net, as you said.

**One consequence to know about now.** The repo already needed
`git config http.postBuffer 524288000` to push 33 MB of assets. At 100 MB the
right answer is to serve the films from somewhere built for video rather than
from the repo.

---

## What I need from you

1. **Look at the three designs first.** This plan applies to whichever you pick.
2. **Stills, if any are wanted.** I will not cut frames from the films. If a
   section wants a still, tell me and you choose the frame. Right now none of
   the three designs uses one, so nothing is blocked.
3. **The Lottie account**, when you have it, for the health check icons.
