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
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
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

