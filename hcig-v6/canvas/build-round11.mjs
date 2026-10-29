// Round 11 (owner, 2026-10-29): the share image (Open Graph, 1200 x 630). "simple and professional and world class,
// to explain us". Three options from og-cards.mjs (the same source renders the final file), plus all three at the size
// a phone shows them in WhatsApp or LinkedIn. Run: node hcig-v6/canvas/build-round11.mjs
import { B, board, publishBoards } from "./board-kit.mjs";
import { css, cards } from "./og-cards.mjs";

const CS = css(B) + `
.tag { position: absolute; top: 10px; right: 10px; z-index: 30; padding: 5px 10px; border-radius: 999px; background: #000; color: #fff; font: 600 11px/1 'Inter', sans-serif; letter-spacing: .08em; }
.share { width: 1240px; padding: 40px; background: #ECE5DD; display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; font: 400 14px/1.4 'Inter', sans-serif; }
.msg { background: #fff; border-radius: 12px; padding: 6px; box-shadow: 0 1px 2px rgba(0,0,0,.15); }
.msg .th { width: 100%; aspect-ratio: 1200 / 630; overflow: hidden; border-radius: 8px; position: relative; }
.msg .th > .og { transform: scale(.2967); transform-origin: 0 0; position: absolute; left: 0; top: 0; }
.msg p { padding: 8px 6px 4px; color: #111; font-weight: 600; } .msg small { display: block; padding: 0 6px 6px; color: #667; }
`;
const K = cards(B);
const boards = [];
const add = (id, title, w, h, x, y, html) => boards.push({ id, title, w, h, x, y, html: board(id, CS, html, w, h) });
const one = (k, tag) => `<div style="position:relative;width:1200px;height:630px">${K[k]}<span class="tag">${tag}</span></div>`;

// Round 11b: his brief "minimal, but global, international, everywhere, a group; all our companies' logos; accredited
// and partner", on his own Gemini backgrounds (glass map, Red Sea coast, silk), faded into the card.
add("R11OgA", `S4, his pick: glass map, profile slide 8 labels, UCA seal, nine group brands with Ma Vie Clinique`, 1200, 630, 0, 0, one("s4", "S4"));
add("R11OgB", `S2 Red Sea coast: the sea melts into white under the words; the group on a glass strip`, 1200, 630, 1280, 0, one("s2", "S2"));
add("R11OgC", `S3 Red Sea coast: the group in a glass panel over the resort`, 1200, 630, 2560, 0, one("s3", "S3"));
add("R11OgD", `S1 silk: the silk flows behind the glass panel of the group`, 1200, 630, 3840, 0, one("s1", "S1"));
const msg = (k) => `<div class="msg"><div class="th">${K[k]}</div><p>Healthcare International Group</p><small>healthcareig.com</small></div>`;
add("R11Share", `How S4, S2 and S1 look when a link is shared on a phone (WhatsApp size)`, 1240, 330, 0, 720,
  `<div class="share">${msg("s4")}${msg("s2")}${msg("s1")}</div>`);

publishBoards(boards, "r11", "Round 11: share image (pick)");
