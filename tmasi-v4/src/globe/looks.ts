// The four looks he compares on board 1 (spec 009, canvas/board-1-hero.md), each on a dark or light hero.
// Colours stay inside the TMASI guideline: teal dominant, white and black; medium blue and indigo sparingly.
export type Look = "dotted" | "realistic" | "glass" | "hologram" | "real";
export type Theme = "dark" | "light";

export type Palette = {
  base: string;        // sphere body
  baseOpacity: number; // 1 = opaque body that hides the far side
  rim: string;         // fresnel rim on the body
  rimStrength: number;
  dots: string;
  dotSize: number;     // CSS px before pixel ratio
  dotAlpha: number;
  backAlpha: number;   // how much of the far side shows through (0 on opaque bodies)
  halo: string;
  haloStrength: number;
  arc: string;
  arcAlpha: number;
  pulse: string;
  pinCore: string;
  pinRing: string;
  grid: string | null; // hologram graticule
  gridAlpha: number;
  texture: boolean;    // realistic look uses the NASA night Earth (the real look draws its own Earth, real.ts)
};

const TEAL = "#009a9c", TEAL_ON_DARK = "#7fe0e1", INDIGO = "#0f205c", WHITE = "#ffffff";

export const LOOKS: Record<Look, Record<Theme, Palette>> = {
  dotted: {
    dark: { base: "#06111f", baseOpacity: 1, rim: "#1bc4c6", rimStrength: 0.55, dots: "#3cc9cb", dotSize: 2.1, dotAlpha: 0.95, backAlpha: 0, halo: "#19b7b9", haloStrength: 0.55, arc: TEAL_ON_DARK, arcAlpha: 0.9, pulse: WHITE, pinCore: WHITE, pinRing: TEAL_ON_DARK, grid: null, gridAlpha: 0, texture: false },
    light: { base: "#eef4f6", baseOpacity: 1, rim: "#9fdcdd", rimStrength: 0.5, dots: TEAL, dotSize: 2.1, dotAlpha: 0.9, backAlpha: 0, halo: "#7fd3d4", haloStrength: 0.3, arc: "#00878a", arcAlpha: 0.95, pulse: INDIGO, pinCore: INDIGO, pinRing: TEAL, grid: null, gridAlpha: 0, texture: false },
  },
  realistic: {
    dark: { base: "#000000", baseOpacity: 1, rim: "#3aa8d8", rimStrength: 0.45, dots: TEAL_ON_DARK, dotSize: 0, dotAlpha: 0, backAlpha: 0, halo: "#2c9fd0", haloStrength: 0.6, arc: TEAL_ON_DARK, arcAlpha: 0.95, pulse: WHITE, pinCore: WHITE, pinRing: TEAL_ON_DARK, grid: null, gridAlpha: 0, texture: true },
    light: { base: "#000000", baseOpacity: 1, rim: "#6cc6e6", rimStrength: 0.4, dots: TEAL, dotSize: 0, dotAlpha: 0, backAlpha: 0, halo: "#8fd6ee", haloStrength: 0.35, arc: TEAL_ON_DARK, arcAlpha: 0.95, pulse: WHITE, pinCore: WHITE, pinRing: TEAL_ON_DARK, grid: null, gridAlpha: 0, texture: true },
  },
  glass: {
    dark: { base: "#0b2a3a", baseOpacity: 0.22, rim: "#bff4f5", rimStrength: 1.1, dots: "#5fd8da", dotSize: 1.9, dotAlpha: 0.95, backAlpha: 0.16, halo: "#19b7b9", haloStrength: 0.4, arc: TEAL_ON_DARK, arcAlpha: 0.9, pulse: WHITE, pinCore: WHITE, pinRing: TEAL_ON_DARK, grid: null, gridAlpha: 0, texture: false },
    light: { base: "#d8eef0", baseOpacity: 0.35, rim: "#ffffff", rimStrength: 1.0, dots: TEAL, dotSize: 1.9, dotAlpha: 0.9, backAlpha: 0.14, halo: "#9fdcdd", haloStrength: 0.3, arc: "#00878a", arcAlpha: 0.95, pulse: INDIGO, pinCore: INDIGO, pinRing: TEAL, grid: null, gridAlpha: 0, texture: false },
  },
  real: {
    dark: { base: "#000000", baseOpacity: 1, rim: "#3aa8d8", rimStrength: 0, dots: TEAL_ON_DARK, dotSize: 0, dotAlpha: 0, backAlpha: 0, halo: "#2c9fd0", haloStrength: 0, arc: "#8ff0f0", arcAlpha: 0.95, pulse: WHITE, pinCore: WHITE, pinRing: TEAL_ON_DARK, grid: null, gridAlpha: 0, texture: false },
    light: { base: "#000000", baseOpacity: 1, rim: "#3aa8d8", rimStrength: 0, dots: TEAL, dotSize: 0, dotAlpha: 0, backAlpha: 0, halo: "#8fd6ee", haloStrength: 0, arc: "#8ff0f0", arcAlpha: 0.95, pulse: WHITE, pinCore: WHITE, pinRing: TEAL, grid: null, gridAlpha: 0, texture: false },
  },
  hologram: {
    dark: { base: "#041018", baseOpacity: 0.55, rim: "#3fe0e2", rimStrength: 0.8, dots: "#7fe9ea", dotSize: 1.4, dotAlpha: 0.85, backAlpha: 0.1, halo: "#19c3c5", haloStrength: 0.5, arc: TEAL_ON_DARK, arcAlpha: 0.95, pulse: WHITE, pinCore: WHITE, pinRing: TEAL_ON_DARK, grid: "#2ad1d3", gridAlpha: 0.32, texture: false },
    light: { base: "#f2f8f9", baseOpacity: 0.6, rim: "#7fd3d4", rimStrength: 0.6, dots: TEAL, dotSize: 1.4, dotAlpha: 0.85, backAlpha: 0.1, halo: "#9fdcdd", haloStrength: 0.25, arc: "#00878a", arcAlpha: 0.95, pulse: INDIGO, pinCore: INDIGO, pinRing: TEAL, grid: TEAL, gridAlpha: 0.28, texture: false },
  },
};
