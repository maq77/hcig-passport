# DOMAIN: Spatial Engineering & Structural Grid Layouts

## Scope: Layout Scale Rules & Spatial Math Formulas

### 1. The Math of Wealth (Spatial Restraint)
Luxury is explicitly defined by spatial abundance. To evoke an authentic premium standard, enforce strict spacing rules across the layout hierarchy:
*   **Vertical Decompression Multipliers:** Standard layout blocks must upgrade compact spacing elements to sweeping macro dimensions:
    *   Transform `py-8` / `py-12` -> `py-28` to `py-48` (`7rem` to `12rem` vertical padding steps).
    *   Transform `space-y-6` / `space-y-8` -> `space-y-16` to `space-y-24`.
*   **The 60% Restraint Rule:** Ensure no less than 60% of any viewport's structural coordinates contain purely empty, inactive white space. Force deep asymmetry to isolate core content focus.

### 2. Layout Patterns: Architectural Grids
*   **Asymmetric Exhibition Alignments:** Rejects predictable multi-column layouts. Use unequal columns paired with large structural offsets (e.g., `grid-cols-12` with text blocks taking up `lg:col-span-7` and media cards restricted to `lg:col-span-4 lg:col-start-9`).
*   **Hairline Axis Partitioning:** Separate macro sections using minimal structural line divisions (`border-stone-200/40` or `border-white/5` with `strokeWidth={0.8}`).
