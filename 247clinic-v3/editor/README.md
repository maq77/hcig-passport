# 24/7 Clinic v3 Visual Editor

This is a local development-only visual editor for the 24/7 Clinic v3 home page.

## How to start
Run `npm run edit` in `247clinic-v3`. This starts both Next.js and the save server.
Open [http://localhost:3000/247clinic/v3?edit=1](http://localhost:3000/247clinic/v3?edit=1).

## Features & Where Changes Are Saved

1. **Text Editing**
   - **How it works:** Click any visible text (headers, paragraphs, buttons) to edit in place.
   - **Saved to:** The exact JSON/TS content file where the string originated (e.g. `content/247clinic/en/home.json`). If the string exists in multiple files, a prompt asks which file to update.
   - **Log:** Edits are also appended to `content/247clinic/approved-edits.json` so the word-for-word checker accepts them.

2. **Sections (Ordering, Hiding, Adding)**
   - **How it works:** In the sidebar, you can reorder sections, hide them, or add new predefined blocks (Text+Img, Full Img, LogoRow).
   - **Saved to:** `src/content/home-layout.json`.

3. **Section Spacing & Size**
   - **How it works:** Adjust top/bottom padding and heading scale for each section in the sidebar.
   - **Saved to:** Inline styles (via `home-layout.json`) and cascade rules in `src/app/editor-overrides.css`.

4. **Colours and Typography**
   - **How it works:** The Theme panel provides color pickers for primary/surface/ink tokens and base font size. A Reset to Brand button clears them.
   - **Saved to:** `src/app/theme-overrides.css` as `:root` custom properties.

5. **Elements (Selection & Nudging)**
   - **How it works:** Click any element to select it. The sidebar displays its stable CSS selector and provides Hide and Center buttons.
   - **Saved to:** `src/app/editor-overrides.css`.

6. **Images**
   - **How it works:** Drag and drop an image file onto any slot (`.slot` or `.slot-img`).
   - **Saved to:** Converted to WebP format via Sharp and saved to `public/slots/<name>.webp`.

7. **Preview Toggle & Changes**
   - **How it works:** Toggle between Mobile (375px), Tablet (768px), and Desktop (1440px) using the top icons. View all your recent saves in the Changes drawer.
   - **Saved to:** The Changes log reads from `editor/changes.log`.

## Notes
- The editor does not ship to production (`npm run build`).
- Do not commit without reviewing the `changes.log`.
