// Round 5 (owner, 2026-10-27): the page stays minimal and a modal on the page holds the full details and the image,
// with a style of its own per section (Why, Built, Our Healthcare), desktop and phone. Plus phone options: Built as a
// bento or a 2 x 3 grid (no slider, the closing line on two lines), How Our System Works as a clock like desktop, and
// Maritime redesigned with his own photos.
// Run: node hcig-v6/canvas/build-round5.mjs
import { B, C, board, esc, head, ic, pad, publishBoards } from "./board-kit.mjs";

const WHY = C.WHY, BUILT = C.BUILT, CARE = C.HEALTHCARE, ECO = C.ECOSYSTEM, MAR = C.MARITIME, UI = C.UI;
const boards = [];

// Page impression behind a modal: the section, dimmed and softly blurred
const behind = (cards) => `<div class="pg"><div class="pgh"><span></span><b></b><span></span></div><div class="pgg">${cards}</div></div><div class="dim"></div>`;
const MODAL_BASE = `
.pg { position: absolute; inset: 0; padding: 70px 80px; background: var(--d06); filter: blur(3px); }
.pgh { display: flex; align-items: center; gap: 30px; justify-content: center; margin-bottom: 40px; } .pgh span { flex: 1; height: 1px; background: #000; } .pgh b { width: 360px; height: 46px; border-radius: 8px; background: #d9d9db; }
.pgg { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; } .pgg i { height: 190px; border-radius: 18px; background: #fff; box-shadow: 0 0 0 1px var(--d20); }
.dim { position: absolute; inset: 0; background: rgba(0,0,0,.42); }
.m-x { position: absolute; top: 18px; right: 18px; z-index: 5; width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(255,255,255,.92); color: #000; box-shadow: 0 8px 20px -10px rgba(0,0,0,.5); }
.m-nav { display: flex; align-items: center; gap: 10px; } .m-nav b { font: 500 13px/1 'Inter', sans-serif; letter-spacing: .08em; color: var(--d60); margin-right: auto; }
.note { position: absolute; left: 20px; bottom: 16px; z-index: 6; max-width: 520px; padding: 8px 12px; border-radius: 10px; background: rgba(255,255,255,.92); font: 500 12px/1.45 'Inter', sans-serif; color: var(--dim); }
.ph.phone .pg { padding: 40px 20px; } .ph.phone .pgg { grid-template-columns: 1fr 1fr; } .ph.phone .pgh b { width: 200px; }
.sheet { position: absolute; left: 0; right: 0; bottom: 0; z-index: 4; border-radius: 26px 26px 0 0; background: #fff; overflow: hidden; box-shadow: 0 -24px 50px -24px rgba(0,0,0,.45); }
.grab { position: absolute; top: 8px; left: 50%; z-index: 6; width: 44px; height: 5px; margin-left: -22px; border-radius: 5px; background: rgba(255,255,255,.7); }
`;
const cards4 = "<i></i><i></i><i></i><i></i><i></i><i></i><i></i>";

// ---------- Why modal: split card, Dim Gray panel with the number and the icon (the image slot for later) ----------
{
  const x = WHY.items[1], n = 1;
  const css = MODAL_BASE + `
.mw { position: absolute; left: 50%; top: 50%; z-index: 4; width: 920px; height: 500px; transform: translate(-50%, -50%); display: grid; grid-template-columns: 40% 60%; border-radius: 28px; overflow: hidden; background: #fff; box-shadow: 0 60px 120px -40px rgba(0,0,0,.6); }
.mw .art { position: relative; display: grid; align-content: space-between; padding: 34px; color: #fff; background: radial-gradient(80% 70% at 100% 0%, rgba(18,192,198,.32), transparent 60%), linear-gradient(150deg, var(--b80), var(--dim)); }
.mw .num { font: 400 96px/1 'Helma', serif; color: transparent; -webkit-text-stroke: 1px var(--t60); }
.mw .big { color: var(--t); opacity: .9; } .mw .big svg { width: 120px; height: 120px; stroke-width: .8; }
.mw .art small { font: 500 11px/1 'Inter', sans-serif; letter-spacing: .22em; text-transform: uppercase; color: var(--d40); }
.mw .tx { display: grid; align-content: center; gap: 20px; padding: 48px 52px; }
.mw h3 { margin: 0; font: 400 44px/1.08 'Helma', serif; } .mw p { font-size: 18px; line-height: 1.65; color: var(--dim); }
.mw .m-nav { margin-top: 18px; padding-top: 22px; border-top: 1px solid var(--d20); }
.mwp { display: grid; grid-template-rows: 180px auto; }
.mwp .art { display: flex; align-items: flex-end; justify-content: space-between; padding: 26px 22px; color: #fff; background: radial-gradient(80% 90% at 100% 0%, rgba(18,192,198,.32), transparent 60%), linear-gradient(150deg, var(--b80), var(--dim)); }
.mwp .num { font: 400 64px/1 'Helma', serif; color: transparent; -webkit-text-stroke: 1px var(--t60); } .mwp .big { color: var(--t); } .mwp .big svg { width: 72px; height: 72px; stroke-width: .9; }
.mwp .tx { display: grid; align-content: start; gap: 14px; padding: 24px 22px; } .mwp h3 { margin: 0; font: 400 30px/1.1 'Helma', serif; } .mwp p { font-size: 15.5px; color: var(--dim); }
.mwp .m-nav { margin-top: 10px; }`;
  const art = (big) => `<div class="art"><span class="num">${pad(n)}</span><span class="big">${ic(x.icon, big)}</span>${big > 80 ? `<small>${esc(WHY.heading)}</small>` : ""}</div>`;
  const nav = `<div class="m-nav"><b>${pad(n)} / 07</b><span class="cbtn l">${ic("arrow", 18)}</span><span class="cbtn">${ic("arrow", 18)}</span></div>`;
  boards.push({ id: "R5ModalWhy", title: "Modal, Why (desktop): a split card; the Dim Gray panel carries the number and a large hairline icon now, and becomes the image later; step through all seven inside", w: 1440, h: 860, x: 0, y: 0,
    html: board("Modal Why desktop", css, `<div class="ph" style="height:860px"><span class="tag">MODAL WHY</span>${behind(cards4)}<div class="mw">${art(120)}<div class="tx"><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p>${nav}</div><span class="m-x">${ic("close", 20)}</span></div><p class="note">Motion: the clicked card grows into the modal (same element), the words rise in after it; closing shrinks it back into its card. Escape, the X or a click outside closes it.</p></div>`, 1440, 860) });
  boards.push({ id: "R5ModalWhyP", title: "Modal, Why (phone): a bottom sheet that slides up; drag it down or tap the X to close", w: 390, h: 844, x: 1500, y: 0,
    html: board("Modal Why phone", css, `<div class="ph phone" style="height:844px"><span class="tag">WHY</span>${behind(cards4)}<div class="sheet mwp"><span class="grab"></span>${art(72)}<div class="tx"><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p>${nav}</div><span class="m-x">${ic("close", 20)}</span></div></div>`, 390, 844) });
}

// ---------- Built modal: image-led, the photo on top with the title over it ----------
{
  const x = BUILT.items[4], n = 4;
  const css = MODAL_BASE + `
.mb { position: absolute; left: 50%; top: 50%; z-index: 4; width: 980px; transform: translate(-50%, -50%); border-radius: 28px; overflow: hidden; background: #fff; box-shadow: 0 60px 120px -40px rgba(0,0,0,.6); }
.mb .im { position: relative; height: 400px; } .mb .im img { width: 100%; height: 100%; object-fit: cover; }
.mb .im::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,.72)); }
.mb .cap { position: absolute; left: 40px; right: 40px; bottom: 30px; z-index: 2; display: flex; align-items: flex-end; gap: 18px; color: #fff; }
.mb .chip { width: 56px; height: 56px; flex: none; display: inline-flex; align-items: center; justify-content: center; border-radius: 16px; background: rgba(255,255,255,.94); color: #000; }
.mb .cap h3 { margin: 0; font: 400 44px/1.05 'Helma', serif; } .mb .cap b { margin-left: auto; font: 400 30px/1 'Helma', serif; color: var(--t60); }
.mb .bd { display: grid; grid-template-columns: 1fr auto; align-items: end; gap: 40px; padding: 30px 40px 34px; } .mb .bd p { font-size: 17.5px; line-height: 1.65; color: var(--dim); max-width: 60ch; }
.mbp { } .mbp .im { height: 300px; position: relative; } .mbp .im img { width: 100%; height: 100%; object-fit: cover; }
.mbp .im::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 35%, rgba(0,0,0,.75)); }
.mbp .cap { position: absolute; left: 20px; right: 20px; bottom: 18px; z-index: 2; color: #fff; } .mbp .cap b { font: 400 22px/1 'Helma', serif; color: var(--t60); } .mbp .cap h3 { margin: 6px 0 0; font: 400 30px/1.08 'Helma', serif; }
.mbp .bd { padding: 22px 20px; display: grid; gap: 18px; } .mbp .bd p { font-size: 15.5px; color: var(--dim); }`;
  const nav = `<div class="m-nav"><b>${pad(n)} / 06</b><span class="cbtn l">${ic("arrow", 18)}</span><span class="cbtn">${ic("arrow", 18)}</span></div>`;
  boards.push({ id: "R5ModalBuilt", title: "Modal, Built (desktop): image-led; the photo carries the title, the text sits under it; step through all six (the Built photos come back here)", w: 1440, h: 860, x: 0, y: 940,
    html: board("Modal Built desktop", css, `<div class="ph" style="height:860px"><span class="tag">MODAL BUILT</span>${behind(cards4)}<div class="mb"><div class="im"><img src="${B("built-hospitality")}" alt=""><div class="cap"><span class="chip">${ic(x.icon, 26)}</span><h3>${esc(x.title)}</h3><b>${pad(n)}</b></div></div><div class="bd"><p>${esc(x.text)}</p>${nav}</div><span class="m-x">${ic("close", 20)}</span></div><p class="note">Motion: the photo opens from the tile with a slow zoom settling in; next and previous slide the photo sideways.</p></div>`, 1440, 860) });
  boards.push({ id: "R5ModalBuiltP", title: "Modal, Built (phone): a tall sheet with the photo on top; swipe sideways for the next one", w: 390, h: 844, x: 1500, y: 940,
    html: board("Modal Built phone", css, `<div class="ph phone" style="height:844px"><span class="tag">BUILT</span>${behind(cards4)}<div class="sheet mbp"><span class="grab"></span><div class="im"><img src="${B("built-hospitality")}" alt=""><div class="cap"><b>${pad(n)}</b><h3>${esc(x.title)}</h3></div></div><div class="bd"><p>${esc(x.text)}</p>${nav}</div><span class="m-x">${ic("close", 20)}</span></div></div>`, 390, 844) });
}

// ---------- Our Healthcare modal: side by side, the photo full height, a link to the service page ----------
{
  const x = CARE.items[2], n = 2;
  const css = MODAL_BASE + `
.mc { position: absolute; left: 50%; top: 50%; z-index: 4; width: 1120px; height: 600px; transform: translate(-50%, -50%); display: grid; grid-template-columns: 56% 44%; border-radius: 28px; overflow: hidden; background: #fff; box-shadow: 0 60px 120px -40px rgba(0,0,0,.6); }
.mc .im { position: relative; } .mc .im img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.mc .tx { position: relative; display: grid; align-content: center; gap: 20px; padding: 56px 52px; }
.mc .tx small { font: 500 12px/1 'Inter', sans-serif; letter-spacing: .22em; color: var(--t); }
.mc h3 { margin: 0; font: 400 46px/1.06 'Helma', serif; } .mc p { font-size: 17.5px; line-height: 1.65; color: var(--dim); }
.mc .row { display: flex; align-items: center; gap: 10px; margin-top: 14px; } .mc .row .btn { margin-right: auto; }
.mc .thumbs { display: flex; gap: 8px; margin-top: 18px; } .mc .thumbs img { width: 52px; height: 40px; border-radius: 8px; object-fit: cover; opacity: .5; } .mc .thumbs img.on { opacity: 1; box-shadow: 0 0 0 2px var(--t); }
.mcp { display: grid; grid-template-rows: 260px auto; } .mcp .im { position: relative; } .mcp .im img { width: 100%; height: 100%; object-fit: cover; }
.mcp .tx { display: grid; align-content: start; gap: 14px; padding: 22px 20px; } .mcp small { font: 500 11px/1 'Inter', sans-serif; letter-spacing: .22em; color: var(--t); }
.mcp h3 { margin: 0; font: 400 30px/1.08 'Helma', serif; } .mcp p { font-size: 15.5px; color: var(--dim); } .mcp .btn { justify-self: start; }`;
  const thumbs = ["svc-hospital", "svc-tourism-2", "svc-urgent-2", "svc-wellness", "svc-corporate", "svc-concierge", "svc-accreditation"].map((k, i) => `<img class="${i === n ? "on" : ""}" src="${B(k)}" alt="">`).join("");
  boards.push({ id: "R5ModalCare", title: "Modal, Our Healthcare (desktop): side by side, the photo full height; the text, a Read more to the service page, and the seven services as thumbnails", w: 1440, h: 860, x: 0, y: 1880,
    html: board("Modal Care desktop", css, `<div class="ph" style="height:860px"><span class="tag">MODAL CARE</span>${behind(cards4)}<div class="mc"><div class="im"><img src="${B("svc-urgent-2")}" alt=""></div><div class="tx"><small>${pad(n)} / 07</small><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p><div class="row"><span class="btn">${esc(UI.readMore.text)}${ic("arrow", 16)}</span><span class="cbtn l">${ic("arrow", 18)}</span><span class="cbtn">${ic("arrow", 18)}</span></div><div class="thumbs">${thumbs}</div></div><span class="m-x">${ic("close", 20)}</span></div><p class="note">Motion: the tile photo flies into the left half while the text slides in from the right; thumbnails switch the service in place.</p></div>`, 1440, 860) });
  boards.push({ id: "R5ModalCareP", title: "Modal, Our Healthcare (phone): a sheet with the photo on top, the text and Read more", w: 390, h: 844, x: 1500, y: 1880,
    html: board("Modal Care phone", css, `<div class="ph phone" style="height:844px"><span class="tag">CARE</span>${behind(cards4)}<div class="sheet mcp"><span class="grab"></span><div class="im"><img src="${B("svc-urgent-2")}" alt=""></div><div class="tx"><small>${pad(n)} / 07</small><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p><span class="btn">${esc(UI.readMore.text)}${ic("arrow", 16)}</span></div><span class="m-x">${ic("close", 20)}</span></div></div>`, 390, 844) });
}

// ---------- Built on phones: no slider, closing line on two lines ----------
const [l1, l2] = BUILT.closing.split(". ");
{
  const tile = (x, i, cls) => `<article class="bt ${cls}"><span class="n">${pad(i)}</span><span class="i">${ic(x.icon, cls.includes("wide") ? 30 : 26)}</span><h3>${esc(x.title)}</h3></article>`;
  const css = `.bb { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.bt { position: relative; min-height: 132px; padding: 16px; display: grid; align-content: end; gap: 8px; border-radius: 20px; background: var(--t08); box-shadow: inset 0 0 0 1px var(--t40); }
.bt .n { position: absolute; top: 14px; left: 16px; font: 400 18px/1 'Helma', serif; color: var(--d40); } .bt .i { position: absolute; top: 14px; right: 14px; color: var(--t); }
.bt h3 { margin: 0; font: 400 19px/1.15 'Helma', serif; }
.bt.wide { grid-column: 1 / -1; min-height: 120px; } .bt.dk { background: linear-gradient(150deg, var(--b80), var(--dim)); color: #fff; box-shadow: none; } .bt.dk .n { color: var(--t60); }
.close2 { margin-top: 28px; padding-top: 22px; border-top: 1px solid #000; text-align: center; display: grid; gap: 6px; }
.close2 .a { font: 400 24px/1.2 'Helma', serif; white-space: nowrap; } .close2 .b { font: 400 27px/1.2 'Helma', serif; color: var(--t); white-space: nowrap; }`;
  const tiles = BUILT.items.map((x, i) => tile(x, i, i === 0 ? "wide dk" : i === 5 ? "wide dk" : "")).join("");
  boards.push({ id: "R5BuiltBento", title: "Built on phones, option A, bento: a wide dark tile first and last, four light tiles between; the closing line on two lines under a hairline; tap a tile for its modal", w: 390, h: 860, x: 2000, y: 0,
    html: board("Built bento", css, `<div class="ph"><section class="sec"><span class="tag">BUILT A</span>${head(BUILT.heading, BUILT.sub)}<div class="bb">${tiles}</div><div class="close2"><span class="a">${esc(l1)}.</span><span class="b">${esc(l2)}</span></div></section></div>`, 390, 860) });
  const css2 = css + `.bt.c { background: var(--b80); color: #fff; box-shadow: none; } .bt.c .n { color: var(--t60); }
.close3 { margin-top: 26px; display: grid; gap: 4px; justify-items: start; } .close3 .a { font: 600 16px/1.3 'Inter', sans-serif; color: var(--dim); white-space: nowrap; } .close3 .b { font: 400 25px/1.15 'Helma', serif; color: var(--t); white-space: nowrap; }
.close3::before { content: ""; width: 44px; height: 2px; margin-bottom: 12px; background: var(--t); }`;
  const tiles2 = BUILT.items.map((x, i) => tile(x, i, [0, 3, 4].includes(i) ? "c" : "")).join("");
  boards.push({ id: "R5BuiltGrid", title: "Built on phones, option B, 2 x 3: six equal tiles in a light and dark checker; the closing line on two lines, left aligned, small then large", w: 390, h: 860, x: 2430, y: 0,
    html: board("Built 2x3", css2, `<div class="ph"><section class="sec"><span class="tag">BUILT B</span>${head(BUILT.heading, BUILT.sub)}<div class="bb">${tiles2}</div><div class="close3"><span class="a">${esc(l1)}.</span><span class="b">${esc(l2)}</span></div></section></div>`, 390, 860) });
}

// ---------- How Our System Works on phones: a clock like desktop ----------
{
  const N = ECO.nodes, n = N.length;
  const node = (x, i, r, sz) => `<li style="--a:${(360 / n) * i}deg;--d:${i * 2}s"><span class="nd" style="width:${sz}px;height:${sz}px">${ic(x.icon, Math.round(sz * .48))}</span></li>`;
  const ringCss = (R, box) => `.ring { position: relative; width: ${box}px; height: ${box}px; margin: 0 auto; }
.ring > svg { position: absolute; inset: 0; } .ring .o { fill: none; stroke: var(--d20); } .ring .run { fill: none; stroke: var(--t); stroke-width: 1.6; stroke-linecap: round; stroke-dasharray: 60 ${Math.round(2 * Math.PI * R)}; animation: orb 12s linear infinite; transform-origin: center; }
@keyframes orb { to { stroke-dashoffset: -${Math.round(2 * Math.PI * R)}; } }
.ring ul { list-style: none; margin: 0; padding: 0; position: absolute; inset: 0; }
.ring li { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) rotate(var(--a)) translateY(-${R}px) rotate(calc(var(--a) * -1)); }
.nd { display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #fff; color: var(--t); box-shadow: 0 0 0 1px var(--d20), 0 8px 18px -12px rgba(0,0,0,.4); animation: lit 24s linear infinite; animation-delay: var(--d); }
@keyframes lit { 0%, 7% { background: var(--t); color: #000; box-shadow: 0 0 0 6px var(--t20); } 9%, 100% { background: #fff; color: var(--t); } }
.cen { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); border-radius: 50%; display: grid; place-content: center; justify-items: center; gap: 6px; text-align: center; background: radial-gradient(circle at 50% 35%, var(--t20), #fff 72%); box-shadow: 0 0 0 1px var(--d20), 0 24px 50px -30px rgba(18,192,198,.6); }
.cen .tv { width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--t); color: #000; }
.cen strong { font: 400 17px/1.15 'Helma', serif; max-width: 12ch; } .cen small { font: 500 8.5px/1.4 'Inter', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--dim); max-width: 16ch; }
.tagl { margin: 18px auto 0; text-align: center; font: 400 19px/1.3 'Helma', serif; max-width: 26ch; }`;
  const centre = (w) => `<div class="cen" style="width:${w}px;height:${w}px"><span class="tv">${ic("traveller", 24)}</span><strong>${esc(ECO.centre.text)}</strong><small>${esc(ECO.centreSub.text)}</small></div>`;
  const R1 = 140, box1 = 340;
  const css1 = ringCss(R1, box1) + `.pill { display: flex; justify-content: center; margin-top: 14px; } .pill span { display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 16px; border-radius: 999px; background: #000; color: #fff; font: 500 14px/1 'Inter', sans-serif; } .pill span svg { color: var(--t); }`;
  boards.push({ id: "R5RingClock", title: "How Our System Works on phones, option A, the clock: the twelve services as icons around the traveller; one lights up at a time and its name shows under the ring; tap any icon", w: 390, h: 760, x: 2000, y: 940,
    html: board("Ring clock", css1, `<div class="ph"><section class="sec soft"><span class="tag">RING A</span>${head(C.SYSTEM.heading)}<div class="ring"><svg viewBox="0 0 ${box1} ${box1}"><circle class="o" cx="${box1 / 2}" cy="${box1 / 2}" r="${R1}"/><circle class="run" cx="${box1 / 2}" cy="${box1 / 2}" r="${R1}"/></svg><ul>${N.map((x, i) => node(x, i, R1, 44)).join("")}</ul>${centre(176)}</div><div class="pill"><span>${ic(N[0].icon, 16)}${esc(N[0].label)}</span></div><p class="tagl">${esc(ECO.tagline.text)}</p></section></div>`, 390, 760) });
  const R2 = 128, box2 = 312;
  const css2 = ringCss(R2, box2) + `.ring li .no { position: absolute; top: -6px; right: -6px; width: 18px; height: 18px; border-radius: 50%; background: #000; color: #fff; display: inline-flex; align-items: center; justify-content: center; font: 600 9px/1 'Inter', sans-serif; }
.legend { list-style: none; margin: 18px 0 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 14px; }
.legend li { display: flex; gap: 8px; align-items: baseline; font: 500 13px/1.3 'Inter', sans-serif; } .legend b { font: 400 14px/1 'Helma', serif; color: var(--t); width: 20px; flex: none; }`;
  const nodes2 = N.map((x, i) => `<li style="--a:${(360 / n) * i}deg;--d:${i * 2}s"><span class="nd" style="width:40px;height:40px;position:relative">${ic(x.icon, 19)}<span class="no">${i + 1}</span></span></li>`).join("");
  boards.push({ id: "R5RingLegend", title: "How Our System Works on phones, option B, clock and key: the same ring with numbered icons, and a two-column key of all twelve names under it", w: 390, h: 900, x: 2430, y: 940,
    html: board("Ring legend", css2, `<div class="ph"><section class="sec soft"><span class="tag">RING B</span>${head(C.SYSTEM.heading)}<div class="ring"><svg viewBox="0 0 ${box2} ${box2}"><circle class="o" cx="${box2 / 2}" cy="${box2 / 2}" r="${R2}"/><circle class="run" cx="${box2 / 2}" cy="${box2 / 2}" r="${R2}"/></svg><ul>${nodes2}</ul>${centre(160)}</div><ol class="legend">${N.map((x, i) => `<li><b>${pad(i)}</b>${esc(x.label)}</li>`).join("")}</ol></section></div>`, 390, 900) });
}

// ---------- Maritime on phones, with his photos ----------
{
  const CHIP_IC = ["hospital", "doctor", "ship", "anchor", "plane"];
  const css1 = `.cover { position: relative; height: 440px; margin: -44px -20px 0; } .cover img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; }
.cover::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.15), transparent 35%, rgba(0,0,0,.8)); }
.cover .cp { position: absolute; left: 20px; right: 20px; bottom: 22px; z-index: 2; color: #fff; display: grid; gap: 12px; } .cover .eyebrow { color: rgba(255,255,255,.85); }
.cover h2 { margin: 0; font: 400 32px/1.08 'Helma', serif; }
.paras { display: grid; gap: 14px; margin-top: 22px; } .paras p { font-size: 15.5px; line-height: 1.7; color: var(--dim); }
.chips { display: flex; gap: 8px; overflow: hidden; margin: 20px -20px 0; padding: 0 20px; } .chips span { flex: none; display: inline-flex; align-items: center; gap: 8px; min-height: 42px; padding: 0 14px; border-radius: 999px; background: #fff; box-shadow: inset 0 0 0 1px var(--d20); font: 500 13.5px/1 'Inter', sans-serif; } .chips svg { color: var(--t); }
.duo { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; } .duo img { width: 100%; height: 150px; object-fit: cover; border-radius: 16px; }
.cta { margin-top: 20px; display: flex; } .cta .btn { width: 100%; justify-content: center; min-height: 54px; padding: 10px 18px; text-align: center; }`;
  const chips = MAR.chips.map((c, i) => `<span>${ic(CHIP_IC[i], 16)}${esc(c)}</span>`).join("");
  boards.push({ id: "R5MarCover", title: "Maritime on phones, option A, cover story: your deck photo full bleed with the title on it, the two paragraphs, the services in a swipe row, two of your photos, the call", w: 390, h: 1500, x: 2900, y: 0,
    html: board("Maritime cover", css1, `<div class="ph"><section class="sec soft"><span class="tag">MAR A</span><div class="cover"><img src="${B("mar-m5")}" alt=""><div class="cp"><span class="eyebrow">${esc(MAR.eyebrow)}</span><h2>${esc(MAR.heading)}</h2></div></div><div class="paras">${MAR.paras.map((p) => `<p>${esc(p)}</p>`).join("")}</div><div class="chips">${chips}</div><div class="duo"><img src="${B("mar-m4")}" alt=""><img src="${B("mar-m1")}" alt=""></div><div class="cta"><span class="btn">${esc(MAR.cta)}${ic("arrow", 16)}</span></div></section></div>`, 390, 1500) });
  const css2 = `.col { display: grid; grid-template-columns: 1.4fr 1fr; grid-template-rows: 1fr 1fr; gap: 10px; height: 330px; margin-bottom: 22px; } .col img { width: 100%; height: 100%; object-fit: cover; border-radius: 16px; } .col img:first-child { grid-row: 1 / span 2; }
.mh { display: grid; gap: 12px; } .mh h2 { margin: 0; font: 400 31px/1.08 'Helma', serif; } .mh h2::after { content: ""; display: block; width: 56px; height: 1px; margin-top: 14px; background: #000; }
.paras { display: grid; gap: 14px; margin-top: 18px; } .paras p { font-size: 15.5px; line-height: 1.7; color: var(--dim); }
.svc { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 20px; } .svc span { display: flex; align-items: center; gap: 10px; min-height: 64px; padding: 10px 12px; border-radius: 16px; background: #fff; box-shadow: inset 0 0 0 1px var(--d20); font: 600 13.5px/1.25 'Inter', sans-serif; }
.svc span i { width: 36px; height: 36px; flex: none; display: inline-flex; align-items: center; justify-content: center; border-radius: 11px; background: var(--t20); color: #000; font-style: normal; } .svc span:last-child { grid-column: 1 / -1; background: var(--b80); color: #fff; box-shadow: none; } .svc span:last-child i { background: rgba(255,255,255,.1); color: var(--t); }
.cta { margin-top: 20px; display: flex; } .cta .btn { width: 100%; justify-content: center; min-height: 54px; padding: 10px 18px; text-align: center; }`;
  boards.push({ id: "R5MarCollage", title: "Maritime on phones, option B, collage: three of your photos as a collage first, then the eyebrow, title and paragraphs, the five services as tiles (the last one dark), the call", w: 390, h: 1500, x: 3330, y: 0,
    html: board("Maritime collage", css2, `<div class="ph"><section class="sec soft"><span class="tag">MAR B</span><div class="col"><img src="${B("mar-m5")}" alt=""><img src="${B("mar-m4")}" alt=""><img src="${B("mar-m1")}" alt=""></div><div class="mh"><span class="eyebrow">${esc(MAR.eyebrow)}</span><h2>${esc(MAR.heading)}</h2></div><div class="paras">${MAR.paras.map((p) => `<p>${esc(p)}</p>`).join("")}</div><div class="svc">${MAR.chips.map((c, i) => `<span><i>${ic(CHIP_IC[i], 18)}</i>${esc(c)}</span>`).join("")}</div><div class="cta"><span class="btn">${esc(MAR.cta)}${ic("arrow", 16)}</span></div></section></div>`, 390, 1500) });
}

publishBoards(boards, "r5", "Round 5: modals and phone (pick)");
