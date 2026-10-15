// Words of the home trust section "Beyond Assistance. Built on Trust." (his text, 2026-10-15), kept exactly,
// including "travellers" and the " - " in the fourth paragraph. Design: canvas board C, "Wall of Moments", with his
// own heading edits (one line on desktop, gold underline under TRUST. as on board A).
// English on every language for now, like the maritime map; the markup marks the section lang="en".
// The photo labels are his own words from the fourth paragraph. He confirmed consent for the photos with faces.

export const TRUST = {
  titleA: "BEYOND ASSISTANCE.",
  titleB: "BUILT ON",
  titleC: "TRUST.",
  lead: "When travellers face medical challenges far from home, they need more than access to healthcare.",
  leadStrong: "They need someone they can trust.",
  sometimesWord: "Sometimes,",
  sometimes: "that trust means asking a TMASI representative to stay by their side, even during a medical examination.",
  andSometimesWord: "And sometimes,",
  andSometimes:
    "it means making sure that even a birthday spent far from home, in the middle of an unexpected medical situation, doesn’t go unnoticed.",
  // The fourth paragraph in pieces, so the five service words can be marked; joined it reads exactly as he wrote it.
  moments: [
    "These are real moments from the journeys of people we have assisted - from ",
    { k: "emergency transportation" },
    " and ",
    { k: "specialist consultations" },
    " to ",
    { k: "hospital care" },
    ", ",
    { k: "personal support" },
    " and ",
    { k: "the little gestures" },
    " that make a difference.",
  ] as (string | { k: string })[],
  closing: "Because for us, medical assistance is not just about arranging care.",
  there: "IT IS ABOUT BEING THERE.",
  // Screen-reader and control words (not shown as page copy).
  rowLabel: "Real moments",
  open: "Open photo",
  close: "Close",
  prev: "Previous photo",
  next: "Next photo",
};

export type TrustPhoto = { file: string; w: number; h: number; cat: string; alt: string };

/** The ten photos, in the order of the two moving rows (first five on top). */
export const TRUST_PHOTOS: TrustPhoto[] = [
  { file: "ambulance", w: 960, h: 1200, cat: "Emergency transportation", alt: "A patient resting on a stretcher inside a TMASI-arranged ambulance" },
  { file: "ultrasound-1", w: 960, h: 1200, cat: "Personal support", alt: "A guest during an ultrasound examination, with a TMASI representative in the room" },
  { file: "flowers-door", w: 960, h: 1200, cat: "The little gestures", alt: "Flowers brought to a guest room door for a birthday" },
  { file: "eye-exam", w: 960, h: 1200, cat: "Specialist consultations", alt: "A guest during an eye examination with a specialist" },
  { file: "hospital-bed", w: 960, h: 1200, cat: "Hospital care", alt: "A patient resting on a hospital bed in the emergency ward" },
  { file: "birthday-together", w: 960, h: 1200, cat: "The little gestures", alt: "A guest and a TMASI representative together in the hotel room on her birthday" },
  { file: "mri", w: 960, h: 1200, cat: "Hospital care", alt: "A patient lying on an MRI scanner table" },
  { file: "consultation", w: 960, h: 1200, cat: "Specialist consultations", alt: "A guest going over her scan results with the doctor" },
  { file: "team-patients", w: 1200, h: 900, cat: "Personal support", alt: "TMASI representatives with guests after their hospital visit, holding the scan disc" },
  { file: "ultrasound-2", w: 960, h: 1200, cat: "Personal support", alt: "A specialist examination with the TMASI representative at the guest side" },
];
