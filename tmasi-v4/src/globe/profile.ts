// T013 (research R6, globe contract "Guards"): decides whether a visitor gets live 3D, and how much,
// and steps down while running if frames are slow.
export type Profile = "desktop" | "phone" | "still";

type NavExtras = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

/** Before any 3D loads. Any "no" gives the designed still. */
export function pickProfile(win: Window = window): Profile {
  const nav = win.navigator as NavExtras;
  if (win.matchMedia("(prefers-reduced-motion: reduce)").matches) return "still";
  if (nav.connection?.saveData) return "still";
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) return "still";
  if (!hasWebGL(win.document)) return "still";
  const coarse = win.matchMedia("(pointer: coarse)").matches;
  return coarse || win.innerWidth < 768 ? "phone" : "desktop";
}

export function hasWebGL(doc: Document): boolean {
  try {
    const c = doc.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Pixel ratio ladder: the device's own up to 2, then 1.5, then 1.25. */
export function pixelRatioSteps(device: number): number[] {
  const top = Math.min(device || 1, 2);
  return [top, 1.5, 1.25].filter((v, i, a) => v <= top && a.indexOf(v) === i);
}

/**
 * Frame-time probe. Starts after the arrival, skips 20 warm-up frames, then averages 60.
 * Slower than 22 ms (under about 45 fps, the target) calls stepDown(); the caller lowers the pixel ratio,
 * then the profile, then shows the still. Returns a function to feed each frame's delta (ms).
 */
export function frameProbe(stepDown: () => boolean, { warmup = 20, window: size = 60, limitMs = 22 } = {}) {
  let seen = 0, sum = 0, count = 0, done = false;
  return (dtMs: number) => {
    if (done) return;
    seen++;
    if (seen <= warmup) return;
    sum += dtMs;
    count++;
    if (count < size) return;
    const avg = sum / count;
    sum = 0;
    count = 0;
    seen = 0;
    if (avg > limitMs) {
      if (!stepDown()) done = true; // nothing left to lower: the caller has switched to the still
    } else {
      done = true; // fast enough: stop measuring
    }
  };
}
