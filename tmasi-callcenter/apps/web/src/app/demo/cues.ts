// Soft audio chimes and the "results ready" browser notification (his pick 2026-11-18: chime on connect, chime and
// notification when results are ready). Chimes are synthesised with Web Audio, so there are no sound files to load.
"use client";

let ctx: AudioContext | null = null;

/** Call inside a click handler (the Start call button): browsers only allow audio after a user gesture. */
export function primeCues(): void {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AC && !ctx) ctx = new AC();
    void ctx?.resume();
  } catch {
    ctx = null;
  }
  try {
    if ("Notification" in window && Notification.permission === "default") void Notification.requestPermission();
  } catch {
    /* notifications not available */
  }
}

function tone(freq: number, start: number, length: number, peak: number) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + length + 0.05);
}

/** connect: two rising notes; ready: a soft three-note arpeggio. Quiet (peak gain under 0.1). */
export function chime(kind: "connect" | "ready"): void {
  if (!ctx) return;
  const t = ctx.currentTime + 0.02;
  if (kind === "connect") {
    tone(659.25, t, 0.45, 0.07); // E5
    tone(880, t + 0.16, 0.6, 0.06); // A5
  } else {
    tone(783.99, t, 0.5, 0.06); // G5
    tone(987.77, t + 0.14, 0.5, 0.055); // B5
    tone(1318.51, t + 0.28, 0.8, 0.05); // E6
  }
}

/** A system notification, only when the page is not in front (another tab or window). */
export function notifyReady(body: string): void {
  try {
    if (!("Notification" in window) || Notification.permission !== "granted" || !document.hidden) return;
    const n = new Notification("TMASI call saved", { body, tag: "tmasi-call-ready" });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    /* ignore */
  }
}
