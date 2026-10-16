// T016 (data-model "Story beat", globe contract "States"). Timings for the opening story and the idle
// state. Pure functions of time, so a frame can be computed for any moment (and the still is the end state).
export type GlobeState = "still" | "arriving" | "story" | "idle" | "focus" | "paused" | "lost" | "fallback";
export type Motion = "story" | "scroll" | "idle";

export const TIMING = {
  arriveEnd: 1.2,   // globe settles in
  homeOn: 1.15,     // Egypt lights
  firstArc: 1.6,
  arcGap: 0.7,
  arcDur: 0.9,
  longArcDur: 1.3,  // arcs longer than 90 degrees (Tampa)
  pulseEvery: 2.6,
  swayPeriod: 14,
  swayAmount: 0.07, // radians
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

export type Frame = {
  arrive: number;          // 0..1 settle-in
  home: number;            // 0..1 Egypt pin
  arcs: number[];          // draw progress per arc
  pulses: number[];        // pulse position per arc (-1 = none)
  framing: number;         // 0 = facing Egypt, 1 = final framing over the whole network
  sway: number;            // radians added to the turn in idle
  done: boolean;           // story finished
};

/** The opening story at time t (seconds). longArcs[i] = arc i spans more than 90 degrees. */
export function storyFrame(t: number, longArcs: boolean[]): Frame {
  const n = longArcs.length;
  const arcs: number[] = [];
  let end = TIMING.firstArc;
  for (let i = 0; i < n; i++) {
    const start = TIMING.firstArc + i * TIMING.arcGap;
    const dur = longArcs[i] ? TIMING.longArcDur : TIMING.arcDur;
    arcs.push(easeInOut((t - start) / dur));
    end = Math.max(end, start + dur);
  }
  const done = t >= end;
  const idleT = t - end;
  const pulses = arcs.map((_, i) => (done ? ((idleT / TIMING.pulseEvery + i * 0.23) % 1) * 1.3 - 0.15 : -1));
  return {
    arrive: easeOutCubic(t / TIMING.arriveEnd),
    home: easeOutCubic((t - TIMING.homeOn) / 0.35),
    arcs,
    pulses,
    framing: easeInOut((t - TIMING.firstArc) / (end - TIMING.firstArc + 0.4)),
    sway: done ? Math.sin((idleT / TIMING.swayPeriod) * Math.PI * 2) * TIMING.swayAmount : 0,
    done,
  };
}

/** The end state, used for the still and for reduced motion: everything drawn, nothing moving. */
export function finalFrame(n: number): Frame {
  return { arrive: 1, home: 1, arcs: new Array(n).fill(1), pulses: new Array(n).fill(-1), framing: 1, sway: 0, done: true };
}
