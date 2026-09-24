# 24/7 Clinic v3: home editor

A local editor for the home page. It runs on this computer only and never ships:
production builds leave it out.

## Start

    cd 247clinic-v3
    npm run edit

Then open http://localhost:3000/247clinic/v3?edit=1

The panel is on the left, the page on the right. Pick Phone, Tablet or Desktop at the top.
Every change shows on the page at once. Nothing is written until you press Save.
Undo and Redo work with Ctrl Z and Ctrl Y.

## What you can do

| Action | How | Saved to |
|---|---|---|
| Change words | Click a line and type. Enter keeps it, Esc cancels. | The content file the line comes from (`content/247clinic/en/home.json` and the rest), logged in `content/247clinic/approved-edits.json` |
| Reorder sections | Arrows in the Sections list | `src/content/home-layout.json` |
| Hide a section | Eye button | `src/content/home-layout.json` |
| Space above or below, heading size | "Spacing and heading size" under a section | `src/content/home-layout.json` |
| Add a section | Add: Text + image, Text, Image | `src/content/home-layout.json` |
| Replace a picture | Drag an image file onto a picture or a design slot | `public/slots/<name>.webp` |
| Size, alignment, colour or hiding of one element | Click it, then use the Selected panel | `src/app/editor-overrides.css` |
| Brand colours and base text size | Colours and type | `src/app/theme-overrides.css` |

Colours are limited to the brand palette for single elements. The theme pickers warn when
text would fall under 4.5:1 contrast. "Reset to brand" empties the theme file.

## Good to know

- A line that is built from two content lines, or a hotel name, cannot be changed here.
  The panel says so. Tell Claude.
- A new section starts with placeholder words. The build refuses to publish them, so
  replace them before asking for a preview update.
- Element changes are added to the end of `src/app/editor-overrides.css`. To take one
  back after saving, delete its line there, or ask Claude.
- Every save is listed under "Saved so far" and in `editor/changes.log` (not committed).
- The save server listens on 127.0.0.1:3100 and only accepts requests from a localhost page.
