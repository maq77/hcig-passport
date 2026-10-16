/* 24/7 Clinic story samples engine.
   One bundle drives three sample players found by [data-story]:
   film  : photoreal frames as a steerable film (DOM only)
   depth : real photographs given depth and a moving camera (three.js)
   live  : a procedural Red Sea resort at night rendered live (three.js)
   Every player shares one timeline: it plays by itself, wheel or drag over it steers it,
   [data-goto] jumps, [data-play] toggles. It only ever styles elements that the page
   already has; it never builds page UI. */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const REDUCED = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;


/* Some hosts (the design canvas) mark the page hidden while it is on screen, and the browser then all but
   stops requestAnimationFrame. Each frame asks for both; whichever comes first wins, so a real screen gets
   real frames and a stalled one still moves on a timer. */
const nextFrame = (cb) => {
  let done = false;
  const go = (t) => { if (done) return; done = true; cb(typeof t === 'number' && t > 1 ? t : performance.now()); };
  requestAnimationFrame(go); setTimeout(() => go(performance.now()), 20);
};
/* ---------- shared timeline ---------- */
class Timeline {
  constructor(root, seconds) {
    this.root = root; this.seconds = seconds; this.p = 0; this.playing = !REDUCED; this.visible = true;
    this.last = performance.now(); this.listeners = []; root.__tl = this;
    root.addEventListener('wheel', (e) => {
      if (!root.contains(e.target)) return;
      e.preventDefault(); this.p = clamp(this.p + e.deltaY / 5200, 0, 1); this.hold();
    }, { passive: false });
    let drag = null;
    root.addEventListener('pointerdown', (e) => { if (e.target.closest('a,button')) return; drag = { x: e.clientX, y: e.clientY, p: this.p }; });
    window.addEventListener('pointerup', () => { drag = null; });
    window.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const d = (drag.x - e.clientX) / (root.clientWidth * 1.4) + (drag.y - e.clientY) / (root.clientHeight * 2.2);
      this.p = clamp(drag.p + d, 0, 1); this.hold();
    });
    root.addEventListener('click', (e) => {
      const g = e.target.closest('[data-goto]');
      if (g && root.contains(g)) { e.preventDefault(); this.p = parseFloat(g.getAttribute('data-goto')) || 0; this.playing = true; }
      const pl = e.target.closest('[data-play]');
      if (pl && root.contains(pl)) { e.preventDefault(); if (this.p >= 0.999) this.p = 0; this.playing = !this.playing; }
    });
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => { this.visible = es[0].isIntersecting; }).observe(root);
  }
  hold() { this.playing = false; clearTimeout(this.t); this.t = setTimeout(() => { if (this.p < 0.999) this.playing = true; }, 2600); }
  tick(now) {
    const dt = Math.min(0.25, (now - this.last) / 1000); this.last = now;
    if (this.playing) { this.p += dt / this.seconds; if (this.p >= 1) { this.p = 1; this.playing = false; } }
    return dt;
  }
}

/* ---------- shared DOM chrome: timed text, chapters, bar, clock ---------- */
function bindChrome(root, tl) {
  const q = (s) => root.querySelectorAll(s);
  const clockKeys = [[0, 17 * 60 + 42], [0.29, 23 * 60 + 58], [0.3, 26 * 60 + 14], [0.7, 26 * 60 + 41], [0.76, 32 * 60 + 30], [1, 33 * 60 + 5]];
  let wasPlaying = null, lastSay = '';
  return () => {
    const p = tl.p;
    q('[data-t0]').forEach((el) => {
      const a = parseFloat(el.getAttribute('data-t0')), b = parseFloat(el.getAttribute('data-t1') || '1');
      const f = Math.min(sstep(a, a + 0.018, p), 1 - sstep(b - 0.018, b, p));
      el.style.opacity = f.toFixed(3);
      el.style.transform = 'translateY(' + ((1 - f) * 14).toFixed(1) + 'px)';
      el.style.visibility = f < 0.01 ? 'hidden' : 'visible';
    });
    q('[data-ch]').forEach((el) => {
      const a = parseFloat(el.getAttribute('data-goto')), b = parseFloat(el.getAttribute('data-ch'));
      const on = p >= a - 0.0001 && p < b; el.classList.toggle('on', on);
      const fill = el.querySelector('[data-fill]'); if (fill) fill.style.transform = 'scaleX(' + clamp((p - a) / (b - a), 0, 1).toFixed(3) + ')';
    });
    let say = '', best = 0.6; q('[data-say]').forEach((el) => { const o = parseFloat(el.style.opacity || '0'); if (o > best) { best = o; say = el.getAttribute('data-say'); } });
    if (say && say !== lastSay) { lastSay = say; q('[data-live]').forEach((el) => { el.textContent = say; }); }
    q('[data-bar]').forEach((el) => { el.style.transform = 'scaleX(' + p.toFixed(4) + ')'; });
    q('[data-clock]').forEach((el) => {
      let m = clockKeys[0][1];
      for (let i = 0; i < clockKeys.length - 1; i++) { const [a, ma] = clockKeys[i], [b, mb] = clockKeys[i + 1]; if (p >= a && p <= b) m = lerp(ma, mb, (p - a) / (b - a)); }
      if (p > 1) m = clockKeys[clockKeys.length - 1][1];
      m = Math.floor(m) % (24 * 60); el.textContent = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
    });
    if (wasPlaying !== tl.playing) { wasPlaying = tl.playing; q('[data-play]').forEach((el) => el.setAttribute('aria-label', tl.playing ? 'Pause the story' : 'Play the story')); q('[data-icon-play]').forEach((el) => { el.style.display = tl.playing ? 'none' : 'block'; }); q('[data-icon-pause]').forEach((el) => { el.style.display = tl.playing ? 'block' : 'none'; }); }
  };
}

/* ---------- film grain ---------- */
function grain(root) {
  const el = root.querySelector('[data-grain]'); if (!el) return () => {};
  const c = document.createElement('canvas'); c.width = c.height = 160; const g = c.getContext('2d'); const urls = [];
  for (let k = 0; k < 4; k++) { const d = g.createImageData(160, 160); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 22; } g.putImageData(d, 0, 0); urls.push(c.toDataURL()); }
  let i = 0, acc = 0;
  return (dt) => { if (REDUCED) return; acc += dt; if (acc > 0.07) { acc = 0; i = (i + 1) % urls.length; el.style.backgroundImage = 'url(' + urls[i] + ')'; } };
}

/* ---------- A: film ---------- */
function filmPlayer(root) {
  const tl = new Timeline(root, parseFloat(root.getAttribute('data-seconds') || '96'));
  const chrome = bindChrome(root, tl); const gr = grain(root); const snd = score(root, tl); keys(root, tl);
  const fs = [...root.querySelectorAll('[data-frame]')]; const n = fs.length;
  const at = fs.map((el) => parseFloat(el.getAttribute('data-frame')));
  const tr = fs.map((el) => el.getAttribute('data-tr') || 'fade');
  const flash = root.querySelector('[data-flash]');
  const loop = (now) => {
    const dt = tl.tick(now); chrome(); gr(dt); snd(dt); const p = tl.p;
    let fl = 0;
    fs.forEach((el, i) => {
      const a = at[i], b = i < n - 1 ? at[i + 1] : 1.0001;
      const inn = i === 0 ? 1 : tr[i] === 'black' ? sstep(a + 0.002, a + 0.02, p) : sstep(a - 0.012, a + 0.012, p);
      const out = i === n - 1 ? 0 : tr[i + 1] === 'black' ? sstep(b - 0.018, b, p) : sstep(b - 0.012, b + 0.012, p);
      const o = Math.min(inn, 1 - out);
      if (tr[i] === 'flash') fl = Math.max(fl, 1 - clamp(Math.abs(p - a) / 0.01, 0, 1));
      const lp = clamp((p - a) / (b - a), 0, 1);
      const kb = el.getAttribute('data-kb') || 'in';
      let s = 1.06, x = 0, y = 0;
      if (kb === 'in') s = lerp(1.04, 1.16, lp); if (kb === 'out') s = lerp(1.18, 1.05, lp);
      if (kb === 'left') { s = 1.14; x = lerp(3, -3, lp); } if (kb === 'right') { s = 1.14; x = lerp(-3, 3, lp); }
      if (kb === 'up') { s = 1.14; y = lerp(3, -3, lp); }
      el.style.opacity = o.toFixed(3); el.style.visibility = o < 0.005 ? 'hidden' : 'visible';
      el.style.transform = REDUCED ? 'none' : 'translate3d(' + x.toFixed(2) + '%,' + y.toFixed(2) + '%,0) scale(' + s.toFixed(4) + ')';
    });
    if (flash) flash.style.opacity = (fl * fl * (3 - 2 * fl) * 0.28).toFixed(3);
    nextFrame(loop);
  };
  nextFrame(loop);
}

/* ---------- keyboard: space plays or pauses, arrows move by chapter ---------- */
function keys(root, tl) {
  if (!root.hasAttribute('tabindex')) root.setAttribute('tabindex', '0');
  root.addEventListener('keydown', (e) => {
    if (e.target.closest('a,button') && (e.key === ' ' || e.key === 'Enter')) return;
    const starts = [...root.querySelectorAll('[data-ch]')].map((el) => parseFloat(el.getAttribute('data-goto'))).sort((a, b) => a - b);
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); if (tl.p >= 0.999) tl.p = 0; tl.playing = !tl.playing; }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); const nx = starts.find((a) => a > tl.p + 0.003); tl.p = nx === undefined ? 0.999 : nx; tl.playing = true; }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); const pv = starts.filter((a) => a < tl.p - 0.02).pop(); tl.p = pv === undefined ? 0 : pv; tl.playing = true; }
  });
}

/* ---------- the score: sea, night, a slow piano and the story's sounds, all made live ----------
   Nothing loads; Web Audio builds every sound. It stays silent until the viewer turns it on. */
const CH_AT = [0, 0.18, 0.30, 0.46, 0.76];
const CHORDS = [
  { pad: [50, 57, 64, 66, 69], arp: [62, 66, 69, 73, 76], every: 1.25, lvl: 1 },
  { pad: [47, 54, 62, 69, 73], arp: [66, 69, 71, 73, 78], every: 1.4, lvl: 0.9 },
  { pad: [40, 47, 54, 55], arp: [64, 66, 71], every: 2.8, lvl: 0.7 },
  { pad: [43, 50, 57, 59, 64], arp: [67, 71, 74, 76, 79], every: 1.1, lvl: 1 },
  { pad: [50, 57, 66, 69, 76], arp: [69, 74, 76, 78, 81], every: 1.0, lvl: 1.1 },
];
const CUES = [[0.385, 'sent'], [0.405, 'reply'], [0.5605, 'knock'], [0.897, 'plane'], [0.944, 'swell']];
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
function score(root, tl) {
  const btns = [...root.querySelectorAll('[data-sound]')]; if (!btns.length) return () => {};
  let ctx = null, on = false, master, music, send, noise, sea, seaF, voices = [], chord = -1, nextNote = 0, noteI = 0, last = tl.p, t = 0;
  const show = () => btns.forEach((b) => {
    b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.setAttribute('aria-label', on ? 'Turn the sound off' : 'Turn the sound on');
    b.querySelectorAll('[data-sound-on]').forEach((e) => { e.style.display = on ? 'block' : 'none'; });
    b.querySelectorAll('[data-sound-off]').forEach((e) => { e.style.display = on ? 'none' : 'block'; });
    b.querySelectorAll('[data-sound-label]').forEach((e) => { e.textContent = on ? 'Sound on' : 'Sound off'; });
  });
  const build = () => {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4; comp.connect(ctx.destination);
    master = ctx.createGain(); master.gain.value = 0; master.connect(comp);
    const ir = ctx.createBuffer(2, ctx.sampleRate * 3.4, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3.2); }
    const verb = ctx.createConvolver(); verb.buffer = ir; verb.connect(master);
    send = ctx.createGain(); send.gain.value = 0.5; send.connect(verb);
    music = ctx.createGain(); music.gain.value = 1; music.connect(master); music.connect(send);
    noise = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    { const d = noise.getChannelData(0); let l = 0; for (let i = 0; i < d.length; i++) { l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.5; } }
    const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
    seaF = ctx.createBiquadFilter(); seaF.type = 'lowpass'; seaF.frequency.value = 520;
    sea = ctx.createGain(); sea.gain.value = 0; src.connect(seaF).connect(sea).connect(master); src.start();
    root.__audio = { ctx, master };
    return true;
  };
  const env = (g, at, peak, a, d) => { g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(peak, at + a); g.gain.exponentialRampToValueAtTime(0.0001, at + a + d); };
  const pan = (v) => { if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = v; return p; } return ctx.createGain(); };
  const piano = (m, lvl) => {
    const at = ctx.currentTime + 0.02, g = ctx.createGain(), pp = pan((Math.random() - 0.5) * 0.6);
    [[1, 1], [2, 0.18], [3, 0.05]].forEach(([k, v]) => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = hz(m) * k; const og = ctx.createGain(); og.gain.value = v; o.connect(og).connect(g); o.start(at); o.stop(at + 4.2); });
    env(g, at, 0.075 * lvl, 0.012, 3.6); g.connect(pp).connect(music);
  };
  const setChord = (i) => {
    const now = ctx.currentTime;
    voices.forEach((v) => { v.g.gain.cancelScheduledValues(now); v.g.gain.setTargetAtTime(0.0001, now, 0.9); v.o.forEach((o) => o.stop(now + 5)); });
    voices = CHORDS[i].pad.map((m, k) => {
      const g = ctx.createGain(); g.gain.value = 0.0001; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = i === 2 ? 700 : 1100; f.Q.value = 0.4;
      const o = [-6, 6].map((d) => { const x = ctx.createOscillator(); x.type = k < 2 ? 'sine' : 'triangle'; x.frequency.value = hz(m); x.detune.value = d; x.connect(f); x.start(now); return x; });
      f.connect(g).connect(music); g.gain.setTargetAtTime((k < 2 ? 0.05 : 0.022) * CHORDS[i].lvl, now, 1.4); return { g, o };
    });
  };
  const cue = (name) => {
    const now = ctx.currentTime;
    if (name === 'sent' || name === 'reply') {
      const ns = name === 'sent' ? [81, 88] : [88, 84];
      ns.forEach((m, k) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = hz(m); o.connect(g).connect(master); env(g, now + k * 0.09, 0.09, 0.006, 0.22); o.start(now + k * 0.09); o.stop(now + k * 0.09 + 0.4); });
    } else if (name === 'knock') {
      [0, 0.32].forEach((d) => { const s = ctx.createBufferSource(); s.buffer = noise; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260; const g = ctx.createGain(); s.connect(f).connect(g).connect(master); env(g, now + d, 0.9, 0.004, 0.16); s.start(now + d, Math.random() * 3, 0.3); });
    } else if (name === 'plane') {
      const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 190; f.Q.value = 1.4;
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(82, now); o.frequency.linearRampToValueAtTime(96, now + 6); const of = ctx.createBiquadFilter(); of.type = 'lowpass'; of.frequency.value = 300; const og = ctx.createGain(); og.gain.value = 0.25;
      const g = ctx.createGain(), pp = pan(-0.8); if (pp.pan) pp.pan.linearRampToValueAtTime(0.8, now + 6.5);
      s.connect(f).connect(g); o.connect(of).connect(og).connect(g); g.connect(pp).connect(master);
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.16, now + 2.6); g.gain.exponentialRampToValueAtTime(0.0001, now + 6.8);
      s.start(now); o.start(now); s.stop(now + 7); o.stop(now + 7);
    } else if (name === 'swell') {
      [62, 69, 74, 78, 81].forEach((m, k) => setTimeout(() => { if (on) piano(m, 1.1); }, k * 160));
    }
  };
  const ambience = (p, dt) => {
    if (Math.random() < dt * (p > 0.2 && p < 0.47 ? 2.6 : 0)) {
      const o = ctx.createOscillator(), am = ctx.createOscillator(), amg = ctx.createGain(), g = ctx.createGain(), pp = pan(Math.random() * 1.6 - 0.8), now = ctx.currentTime;
      o.frequency.value = 4300 + Math.random() * 500; am.frequency.value = 28 + Math.random() * 8; amg.gain.value = 0.006;
      g.gain.value = 0.008; am.connect(amg).connect(g.gain); o.connect(g).connect(pp).connect(master); g.gain.setTargetAtTime(0, now + 0.18, 0.05);
      o.start(now); am.start(now); o.stop(now + 0.5); am.stop(now + 0.5);
    }
    if (Math.random() < dt * (p > 0.765 && p < 0.9 ? 1.4 : 0)) {
      const now = ctx.currentTime, b = 2600 + Math.random() * 1200, pp = pan(Math.random() * 1.6 - 0.8);
      for (let k = 0; k < 2 + (Math.random() * 3 | 0); k++) { const o = ctx.createOscillator(), g = ctx.createGain(), at = now + k * 0.13; o.frequency.setValueAtTime(b, at); o.frequency.exponentialRampToValueAtTime(b * 1.5, at + 0.08); o.connect(g).connect(pp).connect(master); env(g, at, 0.02, 0.01, 0.08); o.start(at); o.stop(at + 0.12); }
    }
  };
  let away = false; document.addEventListener('visibilitychange', () => { away = document.visibilityState === 'hidden'; if (away && master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.1); });
  btns.forEach((b) => b.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!ctx && !build()) return;
    on = !on; if (on && ctx.state !== 'running') ctx.resume(); show();
  }));
  show();
  root.__score = () => ({ on, chord, state: ctx && ctx.state });
  return (dt) => {
    t += dt; const p = tl.p;
    if (!ctx) { last = p; return; }
    const audible = on && !away;
    master.gain.setTargetAtTime(audible ? (tl.playing ? 0.9 : 0.45) : 0, ctx.currentTime, 0.25);
    if (!audible) { last = p; return; }
    const night = p > 0.28 && p < 0.76, seaLvl = (night ? 0.05 : 0.11) * (0.65 + 0.35 * Math.sin(t * 0.55));
    sea.gain.setTargetAtTime(seaLvl, ctx.currentTime, 0.4); seaF.frequency.setTargetAtTime(night ? 380 : 620, ctx.currentTime, 1);
    let ci = 0; CH_AT.forEach((a, i) => { if (p >= a) ci = i; });
    if (ci !== chord) { chord = ci; setChord(ci); nextNote = t + 0.6; noteI = 0; }
    if (tl.playing && t >= nextNote && p < 0.995) { const c = CHORDS[ci]; piano(c.arp[noteI % c.arp.length] + (noteI % 7 === 6 ? -12 : 0), c.lvl); noteI++; nextNote = t + c.every * (0.85 + Math.random() * 0.3); }
    if (p > last && p - last < 0.02) CUES.forEach(([c, name]) => { if (last < c && p >= c) cue(name); });
    ambience(p, dt); last = p;
  };
}

/* ---------- three helpers ---------- */
function makeRenderer(canvas, phone) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: !phone, powerPreference: 'high-performance', alpha: false, preserveDrawingBuffer: true });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 1.75));
  r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  return r;
}
function fit(renderer, composer, camera, canvas) {
  const host = canvas.parentElement || canvas;
  let w = (canvas.clientWidth || host.clientWidth) | 0, h = (canvas.clientHeight || host.clientHeight) | 0;
  if (!w || !h) { const ph = host.getAttribute && host.getAttribute('data-phone') === '1'; w = ph ? 390 : 1440; h = ph ? 844 : 810; }
  const c = renderer.domElement;
  if (c.width !== Math.floor(w * renderer.getPixelRatio()) || c.height !== Math.floor(h * renderer.getPixelRatio())) {
    renderer.setSize(w, h, false); if (composer) composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
}
const loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');
const onTex = new Set();
function tex(url, color = true) { const t = loader.load(url, () => onTex.forEach((f) => f())); if (color) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }

/* ---------- B: depth photographs ---------- */
function depthPlayer(root) {
  const canvas = root.querySelector('canvas[data-gl]'); if (!canvas) return;
  const phone = root.getAttribute('data-phone') === '1';
  const tl = new Timeline(root, parseFloat(root.getAttribute('data-seconds') || '96'));
  const chrome = bindChrome(root, tl); const gr = grain(root);
  const renderer = makeRenderer(canvas, phone);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#050404');
  const camera = new THREE.PerspectiveCamera(phone ? 52 : 38, 16 / 9, 0.01, 50);
  const shots = [...root.querySelectorAll('[data-shot]')].map((el) => ({
    at: parseFloat(el.getAttribute('data-shot')), img: el.getAttribute('data-img'), depth: el.getAttribute('data-depth'),
    move: el.getAttribute('data-move') || 'in', amp: parseFloat(el.getAttribute('data-amp') || '0.32'), cx: parseFloat(el.getAttribute('data-cx') || '0'),
  }));
  const geo = new THREE.PlaneGeometry(1.778, 1, phone ? 180 : 320, phone ? 100 : 180);
  const vs = `uniform sampler2D uDepth; uniform float uAmp; varying vec2 vUv; varying float vD;
    void main(){ vUv = uv; float d = texture2D(uDepth, uv).r; vD = d;
      vec3 p = position; p.z += (d - 0.5) * uAmp;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }`;
  const fs = `uniform sampler2D uMap; uniform float uO; uniform float uT; varying vec2 vUv; varying float vD;
    void main(){ vec4 c = texture2D(uMap, vUv);
      float v = smoothstep(0.95, 0.35, distance(vUv, vec2(0.5)));
      vec3 col = c.rgb * mix(0.8, 1.0, v);
      col += vec3(0.06,0.02,0.0) * smoothstep(0.6,1.0,vD) * 0.6;
      gl_FragColor = vec4(col, uO);
      #include <colorspace_fragment>
    }`;
  const meshes = shots.map((s) => {
    const m = new THREE.ShaderMaterial({ uniforms: { uMap: { value: tex(s.img) }, uDepth: { value: tex(s.depth, false) }, uAmp: { value: s.amp }, uO: { value: 0 }, uT: { value: 0 } }, vertexShader: vs, fragmentShader: fs, transparent: true, depthWrite: false });
    const mesh = new THREE.Mesh(geo, m); mesh.scale.setScalar(1.12); mesh.visible = false; scene.add(mesh); return mesh;
  });
  // floating dust in the light
  const dustN = phone ? 220 : 520; const dg = new THREE.BufferGeometry(); const dp = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) { dp[i * 3] = (Math.random() - 0.5) * 1.9; dp[i * 3 + 1] = (Math.random() - 0.5) * 1.1; dp[i * 3 + 2] = Math.random() * 0.7 - 0.1; }
  dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: '#FFE2C2', size: phone ? 0.006 : 0.0045, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);
  let mx = 0, my = 0;
  root.addEventListener('pointermove', (e) => { const r = root.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5; });
  let t = 0, frameN = 0, force = true;
  onTex.add(() => { force = true; });
  const loop = (now) => {
    const dt = tl.tick(now); t += dt; chrome(); gr(dt); frameN++;
    if (force || (tl.visible || frameN % 12 === 0)) {
      force = false;
      fit(renderer, null, camera, canvas);
      const p = tl.p; const n = shots.length;
      let cz = 1.55, cx = 0, cy = 0, shotCx = 0;
      shots.forEach((s, i) => {
        const a = s.at, b = i < n - 1 ? shots[i + 1].at : 1.0001;
        const o = Math.min(sstep(a - 0.015, a + 0.015, p), 1 - sstep(b - 0.015, b + 0.015, p));
        const mesh = meshes[i]; mesh.visible = o > 0.003; mesh.material.uniforms.uO.value = o; mesh.renderOrder = i;
        if (p >= a && p < b) {
          const lp = clamp((p - a) / (b - a), 0, 1); shotCx = s.cx;
          if (s.move === 'in') { cz = lerp(1.5, 1.08, lp); cx = lerp(-0.05, 0.05, lp); }
          if (s.move === 'track') { cz = 1.24; cx = lerp(-0.16, 0.16, lp); cy = lerp(0.02, -0.02, lp); }
          if (s.move === 'rise') { cz = lerp(1.32, 1.18, lp); cy = lerp(-0.09, 0.07, lp); }
          if (s.move === 'orbit') { cz = 1.26; cx = Math.sin(lp * Math.PI - Math.PI / 2) * 0.14; }
        }
      });
      if (phone) { cz *= 0.8; cx = cx * 0.5 + shotCx; }
      camera.position.set(cx + (REDUCED ? 0 : mx * 0.05), cy - (REDUCED ? 0 : my * 0.035), cz);
      camera.lookAt(cx * 0.35, cy * 0.4, 0);
      if (!REDUCED) { const a = dg.attributes.position.array; for (let i = 0; i < dustN; i++) { a[i * 3 + 1] += Math.sin(t * 0.4 + i) * 0.00012 + 0.00006; if (a[i * 3 + 1] > 0.55) a[i * 3 + 1] = -0.55; } dg.attributes.position.needsUpdate = true; }
      renderer.render(scene, camera);
    }
    nextFrame(loop);
  };
  nextFrame(loop);
}

/* ---------- C: live Red Sea resort ---------- */
function livePlayer(root) {
  const canvas = root.querySelector('canvas[data-gl]'); if (!canvas) return;
  const phone = root.getAttribute('data-phone') === '1';
  const tl = new Timeline(root, parseFloat(root.getAttribute('data-seconds') || '96'));
  const chrome = bindChrome(root, tl); const gr = grain(root);
  const renderer = makeRenderer(canvas, phone); renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#08141B', 0.0024);
  const camera = new THREE.PerspectiveCamera(phone ? 58 : 42, 16 / 9, 0.5, 3000);
  const U = { uTime: { value: 0 }, uDawn: { value: 0 }, uReveal: { value: 0 } };

  // sky dome
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: U,
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float uDawn; varying vec3 vP;
      void main(){ float h = clamp(vP.y, -0.1, 1.0);
        vec3 nTop = vec3(0.012,0.022,0.05), nHor = vec3(0.05,0.13,0.17);
        vec3 dTop = vec3(0.22,0.36,0.58), dHor = vec3(1.0,0.66,0.42);
        vec3 top = mix(nTop, dTop, uDawn), hor = mix(nHor, dHor, uDawn);
        vec3 c = mix(hor, top, pow(smoothstep(0.0, 0.55, h), 0.8));
        float sunGlow = pow(max(dot(vP, normalize(vec3(0.6,0.08,-0.8))),0.0), 18.0) * uDawn;
        c += vec3(1.0,0.55,0.3) * sunGlow * 1.6;
        gl_FragColor = vec4(c,1.0); }`,
  }));
  scene.add(sky);
  // stars
  const sN = 1600, sp = new Float32Array(sN * 3);
  for (let i = 0; i < sN; i++) { const th = Math.random() * Math.PI * 2, ph = Math.random() * 0.48 * Math.PI; sp[i * 3] = Math.cos(th) * Math.cos(ph) * 1300; sp[i * 3 + 1] = Math.sin(ph) * 1300 + 40; sp[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * 1300; }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: '#FFFFFF', size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0.85, fog: false, depthWrite: false });
  scene.add(new THREE.Points(sg, starMat));
  // moon
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr2 = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr2.addColorStop(0, 'rgba(255,255,255,1)'); gr2.addColorStop(0.18, 'rgba(255,246,230,.9)'); gr2.addColorStop(0.35, 'rgba(255,220,190,.25)'); gr2.addColorStop(1, 'rgba(255,200,170,0)'); g.fillStyle = gr2; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const moonPos = new THREE.Vector3(-340, 230, -900);
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#FFF6E8', transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  moon.position.copy(moonPos); moon.scale.set(160, 160, 1); scene.add(moon);

  // ocean
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000, 1, 1), new THREE.ShaderMaterial({
    uniforms: Object.assign({ uMoon: { value: moonPos.clone().normalize() }, uCam: { value: new THREE.Vector3() } }, U), fog: false,
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform float uTime; uniform float uDawn; uniform vec3 uMoon; uniform vec3 uCam; varying vec3 vW;
      vec2 w(vec2 p, vec2 d, float f, float s){ float x = dot(p,d)*f + uTime*s; return d * cos(x) * f; }
      void main(){
        vec2 p = vW.xz;
        vec2 g = w(p, normalize(vec2(1.0,0.3)), 0.08, 1.1)*0.6 + w(p, normalize(vec2(-0.4,1.0)), 0.13, 1.6)*0.45 + w(p, normalize(vec2(0.7,-0.8)), 0.31, 2.4)*0.25 + w(p, normalize(vec2(-0.9,-0.2)), 0.67, 3.1)*0.12;
        vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
        vec3 v = normalize(uCam - vW);
        float fres = pow(1.0 - max(dot(n, v), 0.0), 5.0);
        vec3 deep = mix(vec3(0.004,0.03,0.045), vec3(0.03,0.25,0.3), uDawn);
        vec3 skyc = mix(vec3(0.05,0.12,0.16), vec3(1.0,0.7,0.5), uDawn);
        vec3 col = mix(deep, skyc, clamp(fres*1.2,0.0,1.0));
        vec3 l = normalize(mix(uMoon, normalize(vec3(0.6,0.08,-0.8)), uDawn));
        vec3 h = normalize(l + v);
        float spec = pow(max(dot(n, h), 0.0), mix(420.0, 160.0, uDawn));
        col += mix(vec3(1.0,0.95,0.85)*2.4, vec3(1.0,0.7,0.4)*2.0, uDawn) * spec;
        float shore = smoothstep(18.0, 0.0, vW.z + 2.0);
        col = mix(col, vec3(0.05,0.35,0.36)*mix(0.35,1.0,uDawn), shore*0.55);
        float dist = length(uCam - vW);
        vec3 fogc = mix(vec3(0.03,0.08,0.1), vec3(0.62,0.5,0.44), uDawn);
        col = mix(col, fogc, 1.0 - exp(-dist*0.0011));
        gl_FragColor = vec4(col,1.0); }`,
  }));
  ocean.rotation.x = -Math.PI / 2; ocean.position.y = 0; scene.add(ocean);

  // land: beach strip and terraces (land is z < 0)
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(900, 40), new THREE.MeshStandardMaterial({ color: '#C9B597', roughness: 1 }));
  sand.rotation.x = -Math.PI / 2; sand.position.set(0, 0.25, -14); scene.add(sand);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 700), new THREE.MeshStandardMaterial({ color: '#7A6B57', roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0.4, -380); scene.add(ground);
  // mountains
  const mg = new THREE.PlaneGeometry(2600, 420, 160, 20); const mpos = mg.attributes.position;
  for (let i = 0; i < mpos.count; i++) { const x = mpos.getX(i), y = mpos.getY(i); const k = (y + 210) / 420; const hgt = (Math.sin(x * 0.006) * 0.5 + 0.5) * 120 + Math.sin(x * 0.019 + 1.3) * 38 + Math.sin(x * 0.051) * 14; mpos.setZ(i, k * k * hgt); }
  mg.computeVertexNormals();
  const mtn = new THREE.Mesh(mg, new THREE.MeshStandardMaterial({ color: '#5E4636', roughness: 1, flatShading: true }));
  mtn.rotation.x = -Math.PI / 2 + 0.0; mtn.rotation.x = -Math.PI / 2; mtn.position.set(0, -2, -720); mtn.scale.set(1, 1, 1); scene.add(mtn);

  // villas, instanced, with lit windows
  const villas = []; const rnd = (s) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };
  for (let row = 0; row < 3; row++) for (let i = -9; i <= 9; i++) {
    const x = i * 17 + (row % 2) * 8 + (rnd(i * 3 + row) - 0.5) * 4, z = -34 - row * 22 - rnd(i + row * 9) * 6;
    const w = 10 + rnd(i * 7 + row) * 5, d = 8 + rnd(i * 5 + row) * 3, h = (row === 0 ? 6 : 7.5) + (rnd(i + row * 4) > 0.6 ? 3.6 : 0);
    villas.push({ x, z, w, d, h });
  }
  const suiteIdx = villas.findIndex((v) => v.x > 18 && v.z > -40); const clinicIdx = villas.findIndex((v) => v.x < -40 && v.z < -50);
  const vm = new THREE.MeshStandardMaterial({ color: '#D8CFC1', roughness: 0.9, transparent: true });
  vm.onBeforeCompile = (sh) => {
    sh.uniforms.uDawn = U.uDawn; sh.uniforms.uReveal = U.uReveal;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp; varying vec3 vNw;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvec4 wpp = vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nwpp = instanceMatrix * wpp;\n#endif\nwpp = modelMatrix * wpp; vWp = wpp.xyz; vNw = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uDawn; uniform float uReveal; varying vec3 vWp; varying vec3 vNw;\nfloat hh(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        { vec3 an = abs(vNw);
          float side = step(an.y, 0.5);
          vec2 cell = an.x > an.z ? vec2(vWp.z, vWp.y) : vec2(vWp.x, vWp.y);
          vec2 g = fract(cell / vec2(3.2, 3.6)); vec2 id = floor(cell / vec2(3.2, 3.6));
          float win = step(0.3, g.x) * step(g.x, 0.7) * step(0.28, g.y) * step(g.y, 0.7);
          float lit = step(0.66, hh(id + floor(vWp.xz*0.03)));
          float onAt = 1.0 - smoothstep(0.35, 0.9, uDawn);
          totalEmissiveRadiance += vec3(1.0,0.62,0.3) * win * lit * side * 0.62 * onAt;
          totalEmissiveRadiance += vec3(0.85,0.05,0.07) * 0.0; }`)
      .replace('#include <dithering_fragment>', '#include <dithering_fragment>\n gl_FragColor.a *= mix(1.0, 0.16, uReveal);\n gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.75,0.9,1.0)*0.35, uReveal*0.6);');
  };
  const box = new THREE.BoxGeometry(1, 1, 1); box.translate(0, 0.5, 0);
  const vInst = new THREE.InstancedMesh(box, vm, villas.length);
  const mtx = new THREE.Matrix4();
  villas.forEach((v, i) => { mtx.compose(new THREE.Vector3(v.x, 0.4, v.z), new THREE.Quaternion(), new THREE.Vector3(v.w, v.h, v.d)); vInst.setMatrixAt(i, mtx); });
  scene.add(vInst);
  // reveal edges
  const edgeGeos = villas.map((v) => { const e = new THREE.EdgesGeometry(new THREE.BoxGeometry(v.w, v.h, v.d)); e.translate(v.x, 0.4 + v.h / 2, v.z); return e; });
  const edgeMat = new THREE.LineBasicMaterial({ color: '#FFD9D4', transparent: true, opacity: 0, depthWrite: false });
  scene.add(new THREE.LineSegments(mergeGeometries(edgeGeos), edgeMat));
  // clinic glow (red cove light) and suite window
  const clinic = villas[clinicIdx], suite = villas[suiteIdx];
  const glowMat = (c, s) => new THREE.SpriteMaterial({ map: glowTex, color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: s });
  const clinicGlow = new THREE.Sprite(glowMat('#FF2A2A', 0.95)); clinicGlow.position.set(clinic.x, 2.6, clinic.z + clinic.d / 2 + 0.6); clinicGlow.scale.set(16, 9, 1); scene.add(clinicGlow);
  const clinicLight = new THREE.PointLight('#FF3B30', 40, 40, 1.6); clinicLight.position.copy(clinicGlow.position).add(new THREE.Vector3(0, 1, 2)); scene.add(clinicLight);
  const suiteGlow = new THREE.Sprite(glowMat('#FFC98A', 0.9)); suiteGlow.position.set(suite.x + 1, suite.h * 0.6, suite.z + suite.d / 2 + 0.3); suiteGlow.scale.set(6, 6, 1); scene.add(suiteGlow);

  // pools
  const poolMat = new THREE.ShaderMaterial({ uniforms: U, transparent: true,
    vertexShader: 'varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }',
    fragmentShader: `uniform float uTime; uniform float uDawn; varying vec2 vUv; varying vec3 vW;
      void main(){ vec2 p = vW.xz*0.35; float c = 0.0;
        for(int i=0;i<3;i++){ float fi = float(i); c += sin(p.x*(1.3+fi*0.7) + uTime*(0.8+fi*0.3) + sin(p.y*(1.1+fi*0.5) + uTime*0.6)); }
        c = pow(abs(c)/3.0, 3.0);
        vec3 base = mix(vec3(0.0,0.55,0.62), vec3(0.18,0.75,0.8), uDawn);
        vec3 col = base*(0.75 + 1.4*c);
        float e = smoothstep(0.0,0.06,vUv.x)*smoothstep(1.0,0.94,vUv.x)*smoothstep(0.0,0.06,vUv.y)*smoothstep(1.0,0.94,vUv.y);
        gl_FragColor = vec4(col*1.3, 0.95*e + 0.05); }` });
  [[-30, -24, 26, 9], [10, -25, 34, 8], [-75, -46, 18, 7], [52, -47, 20, 7]].forEach(([x, z, w, d]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), poolMat); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.5, z); scene.add(m); });

  // palms: one merged geometry, instanced
  const palmGeo = (() => {
    const parts = []; const trunk = new THREE.CylinderGeometry(0.16, 0.3, 9, 7, 8); trunk.translate(0, 4.5, 0);
    const tp = trunk.attributes.position; for (let i = 0; i < tp.count; i++) { const y = tp.getY(i); tp.setX(i, tp.getX(i) + Math.pow(y / 9, 2) * 1.4); }
    parts.push(trunk);
    for (let k = 0; k < 9; k++) {
      const leaf = new THREE.PlaneGeometry(4.6, 0.7, 8, 1); const lp = leaf.attributes.position;
      for (let i = 0; i < lp.count; i++) { const x = lp.getX(i) + 2.3; const w = Math.sin((x / 4.6) * Math.PI) * 0.9; lp.setY(i, lp.getY(i) * w - Math.pow(x / 4.6, 2) * 1.8); lp.setX(i, x); }
      leaf.rotateY((k / 9) * Math.PI * 2); leaf.rotateZ(0.12); leaf.translate(1.4, 9, 0); parts.push(leaf);
    }
    return mergeGeometries(parts.map((g) => g.toNonIndexed ? g.toNonIndexed() : g));
  })();
  const palmMat = new THREE.MeshStandardMaterial({ color: '#203024', roughness: 0.9, side: THREE.DoubleSide });
  const palmN = phone ? 70 : 140; const palms = new THREE.InstancedMesh(palmGeo, palmMat, palmN);
  for (let i = 0; i < palmN; i++) { const x = (rnd(i * 2.1) - 0.5) * 330, z = -16 - rnd(i * 3.7) * 80; const s = 0.75 + rnd(i * 5.3) * 0.6; mtx.compose(new THREE.Vector3(x, 0.4, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rnd(i) * 6.28, (rnd(i * 9) - 0.5) * 0.18)), new THREE.Vector3(s, s, s)); palms.setMatrixAt(i, mtx); }
  scene.add(palms);

  // jetty and yacht
  const wood = new THREE.MeshStandardMaterial({ color: '#6B4A33', roughness: 0.9 });
  const jetty = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 80), wood); jetty.position.set(40, 1.2, 28); scene.add(jetty);
  const yacht = new THREE.Group();
  const hullShape = new THREE.Shape(); hullShape.moveTo(-9, 0); hullShape.lineTo(8, 0); hullShape.quadraticCurveTo(11, 0.3, 12.5, 2.2); hullShape.lineTo(-9.5, 2.2); hullShape.lineTo(-9, 0);
  const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(hullShape, { depth: 4.4, bevelEnabled: true, bevelSize: 0.3, bevelThickness: 0.3, bevelSegments: 2 }), new THREE.MeshStandardMaterial({ color: '#F4F1EA', roughness: 0.35, metalness: 0.1 }));
  hull.position.z = -2.2; yacht.add(hull);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(9, 2, 3.6), new THREE.MeshStandardMaterial({ color: '#F7F4EE', roughness: 0.4, emissive: '#FFB36B', emissiveIntensity: 0.25 })); cabin.position.set(-1, 3.2, 0); yacht.add(cabin);
  const yglow = new THREE.Sprite(glowMat('#FFC98A', 0.7)); yglow.position.set(-1, 3.4, 2.2); yglow.scale.set(9, 3, 1); yacht.add(yglow);
  yacht.rotation.y = Math.PI / 2; scene.add(yacht);

  // the hero path: clinic to suite, lanterns and the doctor's light
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(clinic.x, 0.9, clinic.z + clinic.d / 2 + 3), new THREE.Vector3(clinic.x + 16, 0.9, -40), new THREE.Vector3(-30, 0.9, -32),
    new THREE.Vector3(-8, 0.9, -32), new THREE.Vector3(8, 0.9, -34), new THREE.Vector3(suite.x - 4, 0.9, suite.z + suite.d / 2 + 4), new THREE.Vector3(suite.x, 0.9, suite.z + suite.d / 2 + 1.2),
  ]);
  const lanternN = 34; const lantern = new THREE.InstancedMesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshBasicMaterial({ color: '#FFD9A0' }), lanternN);
  for (let i = 0; i < lanternN; i++) { const p = path.getPointAt(i / (lanternN - 1)); const side = i % 2 ? 1.6 : -1.6; mtx.makeTranslation(p.x + side, 0.9, p.z + side * 0.3); lantern.setMatrixAt(i, mtx); }
  scene.add(lantern);
  const lanternGlows = []; for (let i = 0; i < lanternN; i += 2) { const p = path.getPointAt(i / (lanternN - 1)); const g = new THREE.Sprite(glowMat('#FFB86B', 0.55)); g.position.set(p.x, 1.1, p.z); g.scale.set(4, 4, 1); scene.add(g); lanternGlows.push(g); }
  const route = new THREE.Mesh(new THREE.TubeGeometry(path, 240, 0.32, 8, false), new THREE.MeshBasicMaterial({ color: '#FF3344', transparent: true, opacity: 0.95 }));
  route.geometry.setDrawRange(0, 0); scene.add(route);
  const routeTotal = route.geometry.index ? route.geometry.index.count : route.geometry.attributes.position.count;
  const hero = new THREE.Sprite(glowMat('#FFFFFF', 1)); hero.scale.set(5, 5, 1); scene.add(hero);
  const heroLight = new THREE.PointLight('#FFE7C4', 30, 26, 1.5); scene.add(heroLight);

  // lights
  const moonLight = new THREE.DirectionalLight('#9FB8D8', 1.1); moonLight.position.copy(moonPos).normalize().multiplyScalar(300); scene.add(moonLight);
  const hemi = new THREE.HemisphereLight('#3D5A70', '#1A140F', 0.6); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#FFC08A', 0); sun.position.set(400, 60, -500); scene.add(sun);

  // post
  const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), phone ? 0.32 : 0.42, 0.42, 0.84); composer.addPass(bloom); composer.addPass(new OutputPass());

  // camera story
  const K = [
    [0.00, [70, 34, 300], [20, 8, -30]],
    [0.13, [60, 14, 110], [30, 6, -10]],
    [0.25, [-12, 7, 26], [0, 4, -36]],
    [0.30, [suite.x + 10, 9, suite.z + 30], [suite.x, suite.h * 0.55, suite.z]],
    [0.40, [suite.x + 4, 6, suite.z + 16], [suite.x, suite.h * 0.6, suite.z]],
    [0.44, [-20, 16, 4], [clinic.x + 8, 1, clinic.z]],
    [0.60, [12, 12, -6], [suite.x - 4, 1, suite.z]],
    [0.66, [0, 120, 46], [0, 0, -36]],
    [0.75, [-10, 128, 34], [-6, 0, -40]],
    [0.85, [-80, 22, 96], [10, 8, -26]],
    [1.00, [0, 260, 360], [0, 0, -80]],
  ].map(([t, a, b]) => [t, new THREE.Vector3(...a), new THREE.Vector3(...b)]);
  const camAt = (p) => {
    let i = 0; while (i < K.length - 2 && p > K[i + 1][0]) i++;
    const [t0, a0, b0] = K[i], [t1, a1, b1] = K[i + 1]; const f = sstep(0, 1, clamp((p - t0) / (t1 - t0), 0, 1));
    return [a0.clone().lerp(a1, f), b0.clone().lerp(b1, f)];
  };
  let t = 0, frameN = 0, force = 3; const tmp = new THREE.Vector3();
  const loop = (now) => {
    const dt = tl.tick(now); t += dt; chrome(); gr(dt); frameN++;
    if (force > 0 || (tl.visible || frameN % 12 === 0)) {
      force--;
      fit(renderer, composer, camera, canvas);
      const p = tl.p; U.uTime.value = t;
      const dawn = Math.max(0.8 * (1 - sstep(0.12, 0.27, p)), sstep(0.77, 0.9, p)); U.uDawn.value = dawn;
      const reveal = Math.min(sstep(0.64, 0.69, p), 1 - sstep(0.75, 0.79, p)); U.uReveal.value = reveal;
      edgeMat.opacity = reveal * 0.75;
      scene.fog.color.setRGB(lerp(0.031, 0.62, dawn), lerp(0.078, 0.5, dawn), lerp(0.106, 0.44, dawn));
      starMat.opacity = 0.85 * (1 - dawn); moon.material.opacity = 1 - dawn;
      moonLight.intensity = lerp(1.1, 0.2, dawn); sun.intensity = lerp(0, 1.8, dawn); hemi.intensity = lerp(0.5, 0.9, dawn);
      hemi.color.setRGB(lerp(0.24, 0.85, dawn), lerp(0.35, 0.75, dawn), lerp(0.44, 0.7, dawn));
      lanternGlows.forEach((g) => { g.material.opacity = 0.55 * (1 - dawn); });
      suiteGlow.material.opacity = 0.2 + 0.8 * sstep(0.29, 0.31, p) * (1 - sstep(0.62, 0.66, p));
      clinicGlow.material.opacity = 0.65 + 0.3 * Math.sin(t * 2.0) * 0.5 + 0.3 * sstep(0.44, 0.46, p);
      // yacht arrives
      const ya = sstep(0.0, 0.2, p); yacht.position.set(44.5, 0.4 + Math.sin(t * 1.3) * 0.12, lerp(220, 70, ya)); yacht.rotation.z = Math.sin(t * 0.9) * 0.012;
      // the doctor's light along the path
      const hp = sstep(0.45, 0.6, p);
      path.getPointAt(clamp(hp, 0, 1), tmp); hero.position.set(tmp.x, 1.6 + Math.sin(t * 6) * 0.05, tmp.z); heroLight.position.copy(hero.position).add(new THREE.Vector3(0, 1.4, 0));
      const heroOn = sstep(0.44, 0.46, p) * (1 - sstep(0.62, 0.65, p)); hero.material.opacity = heroOn; heroLight.intensity = 30 * heroOn;
      const routeF = Math.max(sstep(0.45, 0.6, p) * (1 - sstep(0.62, 0.64, p)), sstep(0.66, 0.72, p) * (1 - sstep(0.75, 0.78, p)));
      route.geometry.setDrawRange(0, Math.floor(routeTotal * clamp(p < 0.64 ? hp : sstep(0.66, 0.73, p), 0, 1) / 3) * 3); route.material.opacity = routeF;
      const [cp, cl] = camAt(p);
      if (!REDUCED) cp.add(new THREE.Vector3(Math.sin(t * 0.21) * 0.8, Math.sin(t * 0.17) * 0.4, 0));
      camera.position.copy(cp); camera.lookAt(cl);
      ocean.material.uniforms.uCam.value.copy(camera.position);
      composer.render();
    }
    nextFrame(loop);
  };
  nextFrame(loop);
}


/* ---------- boot: find players, survive re-renders ---------- */
const started = new WeakSet();
function boot() {
  document.querySelectorAll('[data-story]').forEach((root) => {
    if (started.has(root)) return; started.add(root);
    const kind = root.getAttribute('data-story');
    try { if (kind === 'film') filmPlayer(root); if (kind === 'depth') depthPlayer(root); if (kind === 'live') livePlayer(root); }
    catch (e) { console.error('[story]', kind, e); root.setAttribute('data-story-error', String(e && e.message)); const n = root.querySelector('[data-err]'); if (n) { n.textContent = 'This 3D sample needs WebGL, which this browser has turned off. (' + String(e && e.message).slice(0, 120) + ')'; n.style.display = 'flex'; } }
  });
}
boot();
new MutationObserver(boot).observe(document.documentElement, { childList: true, subtree: true });
