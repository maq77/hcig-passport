// The design canvas build of the v4 globe (tasks T018): the same engine as the site (src/globe), with the
// land dots inlined, exposed as window.TMASIGlobe for the board's artboards. Each globe starts only when its
// artboard first comes on screen, so a board of many artboards never holds more live 3D views than needed.
import landDesktop from "../public/globe/land-desktop.bin";
import landPhone from "../public/globe/land-phone.bin";
import { OFFICES, STORY_ORDER } from "../src/content/offices";
import { createGlobe, type GlobeController, type GlobeOptions } from "../src/globe/scene";
import type { Look, Theme } from "../src/globe/looks";
import type { Motion } from "../src/globe/story";

type MountOptions = {
  look: Look; theme: Theme; motion: Motion; profile: "desktop" | "phone";
  earthTexture?: string; realTextures?: GlobeOptions["realTextures"]; interactive?: boolean; tour?: boolean; reducedMotion?: boolean; planes?: boolean;
  onPins?: GlobeOptions["onPins"]; onFocus?: GlobeOptions["onFocus"]; onHover?: GlobeOptions["onHover"]; onState?: GlobeOptions["onState"];
};

const buf = (u8: Uint8Array) => u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
// Story order (Egypt first, then nearest to farthest): pins, the phone tour and the card row all follow it.
const offices = STORY_ORDER.map((id) => OFFICES.find((o) => o.id === id)!);

function mount(canvas: HTMLCanvasElement, o: MountOptions) {
  let ctl: GlobeController | null = null;
  const queue: ((c: GlobeController) => void)[] = [];
  const run = (fn: (c: GlobeController) => void) => (ctl ? fn(ctl) : queue.push(fn));
  const reduced = o.reducedMotion ?? window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting || ctl) return;
    io.disconnect();
    ctl = createGlobe({
      canvas, offices, order: STORY_ORDER.filter((id) => id !== "eg"),
      look: o.look, theme: o.theme, motion: o.motion, profile: o.profile,
      landData: buf(o.profile === "phone" ? landPhone : landDesktop),
      earthTexture: o.earthTexture, realTextures: o.realTextures, interactive: o.interactive ?? o.profile === "desktop",
      reducedMotion: reduced, planes: o.planes ?? true, onPins: o.onPins, onFocus: o.onFocus, onHover: o.onHover, onState: o.onState,
    });
    if (o.tour) ctl.startTour();
    queue.splice(0).forEach((fn) => fn(ctl!));
  }, { threshold: 0.01 });
  io.observe(canvas);
  return {
    focus: (id: string | null) => run((c) => c.focus(id)),
    setScrollProgress: (p: number) => run((c) => c.setScrollProgress(p)),
    setLook: (l: Look, t: Theme) => run((c) => c.setLook(l, t)),
    replay: () => run((c) => c.replay()),
    destroy: () => { io.disconnect(); ctl?.destroy(); },
  };
}

(window as unknown as { TMASIGlobe: unknown }).TMASIGlobe = { mount, offices: offices.map(({ id, city }) => ({ id, city })) };
