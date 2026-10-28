// Round 10 (owner, 2026-10-28): where the HCIG promo film lives. Options, desktop and phone, with the real film
// playing (as video, muted previews, never a still taken from it). Labels marked new wait for his review.
// Run: node hcig-v6/canvas/build-round10.mjs
import { B, C, board, esc, ic, publishBoards } from "./board-kit.mjs";

const H = C.HERO;
const words = H.h1.text.split(" ");
const h1 = words.map((w, i) => (i >= H.h1.accentFrom ? `<span class="acc">${esc(w)}</span>` : esc(w))).join(" ");
const P = esc(H.partner.text).replace("Official Partner", "<b>Official Partner</b>").replace("Global Healthcare Accreditation™ (GHA)", "<b>Global Healthcare Accreditation™ (GHA)</b>").replace("German Medical Wellness Association (DMWV)", "<b>German Medical Wellness Association (DMWV)</b>");
const LOOP = B("promo-loop"), FULL = B("promo-720");
const NEW = { watch: "Watch our film", dur: "1:11", film: "The HCIG film", line: "One group, from first contact to case closure.", sound: "Watch with sound" };
const vid = (cls = "") => `<video class="${cls}" src="${LOOP}" autoplay muted loop playsinline></video>`;
const plates = (s) => `<span class="pl" style="width:${s}px;height:${s}px"><img src="${B("dmwv")}" alt=""></span><span class="pl" style="width:${Math.round(s * 1.38)}px;height:${s}px"><img src="${B("gha")}" alt=""></span>`;

const CSS = `
.hero { position: relative; overflow: hidden; background: #fff; }
.hero-bg { position: absolute; inset: 0; background: url('${B("earth-day")}') 75% 35% / cover; }
.hero-bg::after { content: ""; position: absolute; inset: 0; background: radial-gradient(75% 95% at 18% 50%, rgba(255,255,255,.95), rgba(255,255,255,.55) 55%, rgba(255,255,255,.05) 85%); }
.m .hero-bg { bottom: auto; height: 300px; background-position: 62% 10%; background-size: 230% auto; }
.m .hero-bg::after { background: linear-gradient(180deg, rgba(255,255,255,.1), rgba(255,255,255,.2) 60%, #fff 100%); }
.hdr { position: relative; z-index: 3; display: flex; align-items: center; gap: 26px; padding: 22px 64px; }
.hdr img.lg { height: 52px; width: auto; } .hdr nav { display: flex; gap: 24px; margin-left: auto; font: 500 14px/1 'Inter', sans-serif; }
.m .hdr { margin: 12px; padding: 10px 10px 10px 16px; border-radius: 22px; background: rgba(255,255,255,.8); box-shadow: 0 10px 30px -18px rgba(0,0,0,.35); }
.m .hdr img.lg { height: 38px; } .m .hdr .burger { margin-left: auto; width: 44px; height: 44px; border-radius: 14px; background: #000; color: #fff; display: grid; place-items: center; }
.body { position: relative; z-index: 2; padding: 34px 64px 48px; max-width: 760px; display: grid; gap: 18px; justify-items: start; }
.m .body { padding: 150px 20px 24px; gap: 12px; }
.cred { display: grid; gap: 12px; padding-bottom: 16px; position: relative; max-width: 640px; } .cred::after { content: ""; position: absolute; left: 0; bottom: 0; width: 72px; height: 2px; background: var(--t); }
.cred .pls { display: flex; gap: 10px; } .cred p { font: 500 16px/1.5 'Inter', sans-serif; color: #222; } .cred b { color: #000; font-weight: 700; } .m .cred p { font-size: 13.5px; }
.pl { display: grid; place-items: center; border-radius: 13px; background: #fff; box-shadow: 0 10px 24px -14px rgba(0,0,0,.35), inset 0 0 0 1px var(--d20); padding: 6px; } .pl img { max-width: 100%; max-height: 100%; object-fit: contain; }
h1 { margin: 0; font: 400 58px/1.04 'Helma', Georgia, serif; } .m h1 { font-size: 33px; line-height: 1.1; } h1 .acc { color: var(--t); }
.sub { font: 600 18px/1.45 'Inter', sans-serif; max-width: 560px; } .m .sub { font-size: 16px; }
.lead { color: var(--dim); font-size: 16px; max-width: 560px; } .m .lead { font-size: 15px; }
.ctas { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; } .m .ctas { display: grid; width: 100%; gap: 10px; } .m .ctas > * { justify-content: center; }
.btn2 { display: inline-flex; align-items: center; gap: 10px; min-height: 48px; padding: 0 22px; border-radius: 999px; border: 1px solid var(--d20); background: rgba(255,255,255,.75); font: 500 14px/1 'Inter', sans-serif; }
/* the watch control */
.watch { display: inline-flex; align-items: center; gap: 12px; padding: 6px 18px 6px 6px; border-radius: 999px; font: 600 14px/1 'Inter', sans-serif; color: #000; }
.watch .pb { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; background: #000; color: #fff; box-shadow: 0 0 0 6px rgba(18,192,198,.18); }
.watch small { font: 500 12px/1 'Inter', sans-serif; color: var(--dim); letter-spacing: .08em; }
.wthumb { display: inline-flex; align-items: center; gap: 14px; padding: 8px 18px 8px 8px; border-radius: 18px; background: rgba(255,255,255,.82); box-shadow: 0 18px 40px -24px rgba(0,0,0,.5), inset 0 0 0 1px var(--d20); font: 600 14px/1.2 'Inter', sans-serif; }
.wthumb .tv { position: relative; width: 120px; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: #000; } .wthumb video { width: 100%; height: 100%; object-fit: cover; }
.wthumb .tv i { position: absolute; inset: 0; display: grid; place-items: center; color: #fff; background: rgba(0,0,0,.25); }
.wfloat { position: absolute; z-index: 3; right: 64px; bottom: 56px; } .wfloat .tv { width: 220px; }
.wthumb small { display: block; margin-top: 4px; font-weight: 500; color: var(--dim); }
.chip { position: absolute; z-index: 4; right: 20px; top: 104px; display: inline-flex; align-items: center; gap: 10px; padding: 6px 14px 6px 6px; border-radius: 999px; background: rgba(255,255,255,.85); box-shadow: 0 14px 30px -18px rgba(0,0,0,.5); font: 600 13px/1 'Inter', sans-serif; }
.chip .pb { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; background: #000; color: #fff; }
/* film band */
.fb { padding: 56px 64px; background: #fff; } .m.fb, .m .fb { padding: 30px 20px; }
.fb-card { position: relative; border-radius: 28px; overflow: hidden; aspect-ratio: 16 / 9; background: #000; box-shadow: 0 50px 90px -50px rgba(0,0,0,.6); }
.m .fb-card { border-radius: 20px; }
.fb-card video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.fb-card::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,.65), transparent 45%); }
.fb-in { position: absolute; z-index: 2; left: 40px; right: 40px; bottom: 34px; display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; color: #fff; }
.m .fb-in { left: 16px; right: 16px; bottom: 16px; }
.fb-in small { font: 500 11.5px/1 'Inter', sans-serif; letter-spacing: .22em; text-transform: uppercase; opacity: .85; } .fb-in h3 { margin: 10px 0 0; font: 400 34px/1.1 'Helma', serif; max-width: 18ch; } .m .fb-in h3 { font-size: 20px; }
.big { display: inline-flex; align-items: center; gap: 12px; padding: 8px 22px 8px 8px; border-radius: 999px; background: rgba(255,255,255,.92); color: #000; font: 600 15px/1 'Inter', sans-serif; white-space: nowrap; }
.big .pb { width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; background: var(--t); color: #000; }
.m .big { padding: 6px 14px 6px 6px; font-size: 13px; } .m .big .pb { width: 40px; height: 40px; }
.next { padding: 44px 64px 30px; text-align: center; } .next h2 { margin: 0; font: 400 46px/1 'Helma', serif; } .m .next { padding: 26px 20px 20px; } .m .next h2 { font-size: 32px; }
.note { position: absolute; z-index: 9; left: 14px; bottom: 12px; padding: 6px 10px; border-radius: 8px; background: rgba(0,0,0,.72); color: #fff; font: 600 11px/1.3 'Inter', sans-serif; letter-spacing: .04em; }
/* lightbox */
.lb { position: relative; background: rgba(8,10,12,.94); display: grid; place-items: center; }
.lb .frame { position: relative; width: 82%; aspect-ratio: 16 / 9; border-radius: 18px; overflow: hidden; box-shadow: 0 40px 120px -40px #000; } .m .lb .frame { width: 100%; border-radius: 0; }
.lb video { width: 100%; height: 100%; object-fit: cover; display: block; }
.lb .x { position: absolute; top: 22px; right: 22px; width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.12); color: #fff; box-shadow: inset 0 0 0 1px rgba(255,255,255,.3); }
.lb .cap { position: absolute; left: 50%; bottom: 26px; transform: translateX(-50%); color: rgba(255,255,255,.75); font: 500 13px/1 'Inter', sans-serif; letter-spacing: .1em; text-transform: uppercase; }
`;
const NAV = C.NAV.map((n, i) => `<span${i === 0 ? ' style="box-shadow:inset 0 -1px 0 #12C0C6;padding-bottom:6px"' : ""}>${esc(n.label)}</span>`).join("");
const hdrD = `<div class="hdr"><img class="lg" src="${B("logo-h-black")}" alt=""><nav>${NAV}</nav><span class="btn">${esc(H.ctaPrimary.text)}${ic("arrow", 16)}</span></div>`;
const hdrM = `<div class="hdr"><img class="lg" src="${B("logo-h-black")}" alt=""><span class="burger">${ic("menu", 20)}</span></div>`;
const cred = (m) => `<div class="cred"><span class="pls">${plates(m ? 44 : 56)}</span><p>${P}</p></div>`;
const btns = `<span class="btn">${esc(H.ctaPrimary.text)}${ic("arrow", 16)}</span><span class="btn2">${esc(H.ctaSecondary.text)}</span>`;
const play = ic("play", 18);
const filmBand = (m) => `<div class="fb"><div class="fb-card">${vid()}<div class="fb-in"><div><small>${NEW.film}</small><h3>${NEW.line}</h3></div><span class="big"><span class="pb">${play}</span>${NEW.sound} · ${NEW.dur}</span></div></div></div>`;
const aboutHead = `<div class="next"><h2>${esc(C.ABOUT.heading)}</h2></div>`;

const boards = [];
const add = (id, title, w, h, x, y, html) => boards.push({ id, title, w, h, x, y, html: board(id, CSS, html, w, h) });

// F1: a watch button in the hero (three ways to draw it), opening the film full screen with sound
add("R10Hero1", `F1 hero, desktop: "${NEW.watch}" as a living thumbnail floating over the globe, bottom right (the film plays muted inside it); press it and the film opens full screen with sound`, 1440, 860, 0, 0,
  `<div class="ph hero" style="width:1440px;height:860px"><span class="tag">F1</span><div class="hero-bg"></div>${hdrD}<div class="body">${cred(false)}<h1>${h1}</h1><p class="sub">${esc(H.sub.text)}</p><p class="lead">${esc(H.lead.text)}</p><div class="ctas">${btns}</div></div><span class="wthumb wfloat"><span class="tv">${vid()}<i>${play}</i></span><span>${NEW.watch}<small>${NEW.dur}</small></span></span></div>`);
add("R10Hero1m", `F1 hero, phone: a small "${NEW.watch}" chip on the globe, so the hero still fits the first screen`, 390, 844, 1520, 0,
  `<div class="ph hero m" style="width:390px;height:844px"><span class="tag">F1</span><div class="hero-bg"></div>${hdrM}<span class="chip"><span class="pb">${ic("play", 14)}</span>${NEW.watch} · ${NEW.dur}</span><div class="body">${cred(true)}<h1>${h1}</h1><p class="sub">${esc(H.sub.text)}</p><div class="ctas">${btns}</div></div></div>`);
add("R10Hero2", `F1b hero, desktop, quieter: a text play link next to the two buttons`, 1440, 860, 0, 940,
  `<div class="ph hero" style="width:1440px;height:860px"><span class="tag">F1b</span><div class="hero-bg"></div>${hdrD}<div class="body">${cred(false)}<h1>${h1}</h1><p class="sub">${esc(H.sub.text)}</p><p class="lead">${esc(H.lead.text)}</p><div class="ctas">${btns}<span class="watch"><span class="pb">${play}</span>${NEW.watch} <small>${NEW.dur}</small></span></div></div></div>`);

// F2: the film as its own band after About Us (About still opens the first scroll)
add("R10Band", `F2 desktop: the film as its own band right after About Us; it plays muted on its own, "${NEW.sound}" opens it full screen`, 1440, 980, 0, 1880,
  `<div class="ph" style="width:1440px"><span class="tag">F2</span>${aboutHead}<div class="note">... About Us, then the film</div>${filmBand(false)}</div>`);
add("R10Bandm", `F2 phone: the same band, the card fits the screen width`, 390, 360, 1520, 1880,
  `<div class="ph m" style="width:390px"><span class="tag">F2</span>${aboutHead}${filmBand(true)}</div>`);

// F3: right after the hero (before About): strongest, but About moves down one block
add("R10After", `F3 desktop: the film band directly under the hero, before About Us (the strongest place, but About is no longer the first scroll)`, 1440, 1100, 0, 2940,
  `<div class="ph" style="width:1440px"><span class="tag">F3</span><div style="height:120px;background:linear-gradient(#e9f5f6,#fff)" class="note-wrap"></div><div class="note">end of the hero, then the film, then About Us</div>${filmBand(false)}${aboutHead}</div>`);

// The player every option opens
add("R10Player", `The player all options open: full screen, with sound, the film's own controls, close with X or Esc`, 1440, 810, 0, 4120,
  `<div class="ph lb" style="width:1440px;height:810px"><span class="tag">Player</span><div class="frame"><video src="${FULL}" controls muted autoplay loop playsinline></video></div><span class="x">${ic("close", 20)}</span><span class="cap">${NEW.film}</span></div>`);
add("R10Playerm", `The player on a phone: the film edge to edge; turn the phone for full screen`, 390, 844, 1520, 4120,
  `<div class="ph lb m" style="width:390px;height:844px"><span class="tag">Player</span><div class="frame"><video src="${FULL}" controls muted autoplay loop playsinline></video></div><span class="x">${ic("close", 20)}</span><span class="cap">${NEW.film}</span></div>`);

publishBoards(boards, "r10", "Round 10: the HCIG film (pick)");
