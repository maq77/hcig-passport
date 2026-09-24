---
name: awesome-design
description: Library of 74 ready-made DESIGN.md design-system files (Apple, Airbnb, Stripe, Linear, Notion, Vercel, Tesla, Spotify and more) from VoltAgent's awesome-design-md / awesome-claude-design. Use when the user wants a site or app to "look like" or "feel like" a known product, needs a design direction or reference, wants to write or structure a DESIGN.md for their own brand, or wants a starting design system to feed Claude Design, Google Stitch or a coding agent.
---

# Awesome Design (DESIGN.md library)

74 plain-text design systems. Each one holds tokens, rules and the reason behind
them, in the same 9 sections, so an agent can build on-system screens from it.

Source: https://github.com/VoltAgent/awesome-design-md (MIT), listed by
https://github.com/VoltAgent/awesome-claude-design. Previews: https://getdesign.md

## Files

- `INDEX.md`: every system, one line each, grouped by category. Read this first.
- `designs/<slug>/DESIGN.md`: the full file. Read only the one or two you need.

## The 9 sections every file follows

1. Visual Theme and Atmosphere
2. Color Palette and Roles
3. Typography Rules
4. Component Stylings
5. Layout Principles
6. Depth and Elevation
7. Do's and Don'ts
8. Responsive Behavior
9. Agent Prompt Guide

The front matter carries machine-readable tokens (`colors`, `typography`,
`rounded`, `spacing`). Emit them as CSS variables with the same semantic names.

## How to use

1. **Pick.** Match the wanted feel against `INDEX.md`. Offer two or three
   candidates when the brief is vague, with the one-line reason for each.
2. **Read** the chosen `DESIGN.md` in full before writing any UI.
3. **Build** from its tokens and its Do's and Don'ts. Proprietary fonts get the
   Google Fonts substitute the file names.
4. **Blend** only on purpose: take structure from one (layout, density) and
   surface from another (colour, type), and say which came from where.
5. **Write a DESIGN.md for the user's own brand** by copying the 9-section shape
   and front matter of the closest file, filled with the brand's real values.
6. **For Claude Design:** upload the file under Create new design system, or
   attach it to a prototype and ask "Create a design system from this DESIGN.md".

## Rules

- **Inspiration, not cloning.** These are not official systems. Never ship a
  third party's logo, name, proprietary typeface or a 1:1 copy of their site.
- **A real brand guideline beats any file here.** When the project has its own
  guideline, use the library only for structure, layout ideas and component
  patterns, never to replace its colours, fonts or voice.
- **HCIG work:** the brand guidelines in `D:\Healthcare international group\brand guideline\`
  and the `hcig` skill's rules win. Many files here are dark-first (Cursor,
  Tesla, SpaceX, Lamborghini, Bugatti and others); HCIG allows no dark designs.
  Useful light references for healthcare and hospitality: `airbnb`, `apple`,
  `notion`, `mintlify`, `wise`, `intercom`, `cal`, `stripe`.

## Updating

```bash
git clone --depth 1 https://github.com/VoltAgent/awesome-design-md tmp-adm
# copy tmp-adm/design-md/<slug>/DESIGN.md into designs/<slug>/, rebuild INDEX.md
```
Keep the global copy (`~/.claude/skills/awesome-design`) and the HCIG project
copy (`.claude/skills/awesome-design`) identical.
