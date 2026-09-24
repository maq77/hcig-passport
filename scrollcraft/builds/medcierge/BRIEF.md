# Elite Medical Concierge homepage upgrade

**Self-authored under explicit creative delegation.** His words, 2026-09-14:
"you have the right to do whatever adding or changing better content or adding pictures ... do what needs to be done and add new designs and creative ones. and upgrade home page to be better and have great looking design and animations and visuals", "good looking animation moving partners logos and use scroll effect and 3d views", "make better hero if possible and use animations and visuals and 3d views if it would make it better".

Base: the rebuilt light site already on `/medcierge` (cream, navy, gold, Playfair Display + Inter). This is an extension of that world, not a new one.

## The eight topics

1. **Vibe.** Calm five-star lobby. Quiet, certain, warm. References: a grand hotel reception at night, a Swiss watch caseback, a passport stamp. [authored]
2. **Journey, in order.** The live site's own order, kept: hero, partners, services, facilities, why guests trust us, four steps, accreditations, partners, service areas, contact. [evidence: live site]
3. **Energy.** Calm open, rises at facilities, calm through the steps, a second lift at the map, calm close at the form. [authored]
4. **Feeling.** See the curve below. The one moment: the map lighting up city by city down the coast.
5. **Something no site does.** The coast lights up under your scroll: a gold line runs Alexandria to Aswan through every town they cover, and each town switches on as the line reaches it. [authored]
6. **Distance from premium-minimal.** Near. Editorial premium with depth, not maximalist. A medical brand has to stay trustworthy. [authored]
7. **One world or scenes.** Distinct scenes. No continuous camera flight. [authored]
8. **Assets.** Their seven photographs (lobby, clinic, urgent care room, team, diagnostics, care unit, ambulance), 27 partner logos. No generation key on this machine yet, so nothing is generated. [evidence]

## Feeling curve

| Act | Feeling | What causes it |
|---|---|---|
| Hero | Reassured | A lobby that looks like their hotel, a doctor already at the desk, depth that moves with them |
| Partners | Recognition | Their own hotel and insurer passing by |
| Services | Relief | Everything they might need, one glance |
| Facilities | Impressed | The rooms slide past sideways while they scroll down |
| Why us | Trust | Plain reasons, numbers that land |
| Steps | Clarity | A line draws through four steps as they read |
| Accreditations | Confidence | Named bodies, held still |
| Map | **Peak: covered** | The coast lights up town by town |
| Contact | Calm | One form, one phone number |

**The peak.** "You scroll and the whole Red Sea coast lights up, town by town, and it tells you they are already there." Lives in the service areas act. It gets the largest scroll room and the quiet section before it.

**Tell someone.** It's the site where the map lights up the coast as you scroll and shows you the doctor is already nearby.

## Rules held from HCIG

- Red emergency, green WhatsApp, both instant and never animated in.
- No invented numbers, accreditations or reviews. Copy may be tightened; facts may not be added.
- Light grounds only. Reduced motion gets the full static page.

## Score

| Beat | Device | Why |
|---|---|---|
| Hero | `parallax` + pointer tilt + `kinetic` | Three photo planes at different depths; the headline rises line by line |
| Partners | `drift` (two-row marquee, opposite directions) | Explicitly requested; recognition, not reading |
| Services | `flow` + `in` | Scanning, no gimmick |
| Facilities | `pan` (pinned, desktop only) | Lateral travel reads as a tour of rooms |
| Why us | `count` | Real numbers only, the site's own |
| Steps | `reveal` (a drawn line) | Progress is a change of state |
| Accreditations | `flow` | Stillness before the peak |
| Map | signature: coast light-up, scrubbed | The peak |
| Contact | `flow` | The close holds still |
