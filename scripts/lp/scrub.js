/**
 * The walk, scrubbed by scroll.
 *
 * His own film of the walk from the hotel reception to the clinic door, with
 * the scroll wheel driving the playhead instead of the clock. The guest walks
 * there as they read. Apple use this on their product pages. The difference
 * here is that the footage is real and the walk is the actual walk.
 *
 * Three things make it smooth rather than a slideshow.
 *
 * A dedicated encode. The film ships with a keyframe every five seconds, which
 * is right for watching and useless for seeking, because landing between two
 * keyframes means decoding up to 150 frames. The scrub copy carries a keyframe
 * every ten frames, so a seek is nine frames of work at most. Same 720 by 1280,
 * same 30fps, same 24.3 seconds, and a higher bitrate than the original. It is
 * a bigger file, not a smaller picture.
 *
 * Easing rather than seeking. Setting currentTime on every scroll event fights
 * the decoder. This holds a target and walks the playhead toward it inside a
 * rAF loop, so scrolling fast glides instead of stuttering.
 *
 * Nothing hides. The steps are visible by default. The script adds a class to
 * take them over, so if the script never runs, or the file never loads, the
 * section is a plain list of directions and a normal player. That is the same
 * failsafe the reveal animation needed after it hid three sections of design 2.
 */

function build({ esc, svg }) {
  function scrubWalk(c, token) {
    const steps = c.steps
      .map(
        (t, i, all) =>
          `<li data-at="${(i / all.length).toFixed(3)}"><span class="n">${i + 1}</span><p>${esc(t)}</p></li>`
      )
      .join('');

    return `<div class="scrub" data-scrub>
        <div class="scrub-stage">
          <div class="scrub-frame">
            <video muted playsinline preload="none" data-scrub-video data-src="%%${token}%%"
              aria-label="The walk from ${esc(c.hotelShort)} to the 24/7 Clinic"></video>
            <span class="scrub-hint" data-scrub-hint>${svg('arrow')}Keep scrolling to walk there</span>
          </div>
          <div class="scrub-side">
            <span class="tag">Finding us</span>
            <h2>The walk from your hotel</h2>
            <ol class="scrub-steps">${steps}</ol>
            <div class="scrub-meter" aria-hidden="true"><i data-scrub-bar></i></div>
            <span class="scrub-count" data-scrub-count></span>
          </div>
        </div>
      </div>`;
  }

  const SCRUB_CSS = `
.scrub{position:relative}
.scrub-stage{display:grid;gap:22px}
.scrub-frame{position:relative;border-radius:14px;overflow:hidden;background:var(--sand2,#F2EDE6);
  aspect-ratio:9/16;max-width:340px;margin:0 auto;width:100%}
.scrub-frame video{width:100%;height:100%;object-fit:cover;display:block}
.scrub-hint{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);display:inline-flex;align-items:center;gap:8px;
  background:rgba(255,255,255,.94);color:var(--ink,#1A1614);font-size:13.5px;font-weight:600;padding:9px 15px;
  border-radius:999px;white-space:nowrap;box-shadow:0 8px 22px -10px rgba(20,18,16,.4);transition:opacity .4s ease}
.scrub-hint .ico{width:16px;height:16px;transform:rotate(90deg)}
.scrub-steps{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.scrub-steps li{display:flex;gap:14px;align-items:flex-start;background:#fff;border:1px solid var(--line,#E6DFD6);
  border-radius:12px;padding:16px 18px}
.scrub-steps .n{flex:none;width:30px;height:30px;border-radius:50%;background:var(--red-t,#FBF0EF);color:var(--red,#C00000);
  display:grid;place-items:center;font-size:14px;font-weight:600;font-variant-numeric:tabular-nums}
.scrub-steps p{color:var(--ink2,#57504C);font-size:15.5px;line-height:1.55;margin:0}
.scrub-side{display:grid;gap:14px;align-content:center}
.scrub-side h2{margin:0}
.scrub-meter{height:3px;border-radius:2px;background:var(--line,#E6DFD6);overflow:hidden}
.scrub-meter i{display:block;height:100%;width:100%;background:var(--red,#C00000);transform:scaleX(0);transform-origin:0 50%}
.scrub-count{font-size:13.5px;color:var(--ink3,#8A817B);font-variant-numeric:tabular-nums}
/* The meter only means anything once the scroll is driving the film. */
.scrub-meter,.scrub-count{display:none}
.scrub.is-live .scrub-meter{display:block}
.scrub.is-live .scrub-count{display:block}

/* Only once the script has taken over does this become a pinned stage. Until
   then it is a film and a list of directions, stacked, and correct. */
.scrub.is-live{height:300vh}
.scrub.is-live .scrub-stage{position:sticky;top:0;height:100dvh;align-content:center;padding:64px 0 24px}
/* Sized by height, not width. A 9:16 frame set by width overflows a short
   laptop window: 330px wide is 587px tall, taller than the space left once the
   sticky header is out. Height first, and the width follows the ratio. */
.scrub.is-live .scrub-frame{height:min(66dvh,520px);width:auto;max-width:86vw;margin:0 auto}
.scrub.is-live .scrub-steps{position:relative;min-height:120px;margin:6px 0 4px}
.scrub.is-live .scrub-steps li{position:absolute;inset:0 auto auto 0;width:100%;opacity:0;transform:translateY(12px);
  transition:opacity .45s var(--ez,ease),transform .45s var(--ez,ease);pointer-events:none}
.scrub.is-live .scrub-steps li.on{opacity:1;transform:none;pointer-events:auto}

@media(min-width:900px){
  .scrub.is-live .scrub-stage{grid-template-columns:auto 1fr;gap:52px;align-items:center;
    max-width:var(--wrap,1140px);margin:0 auto;padding:0 40px}
  .scrub.is-live .scrub-frame{height:min(72dvh,600px);max-width:none}
  .scrub.is-live .scrub-steps{min-height:120px}
}
@media (prefers-reduced-motion:reduce){
  .scrub.is-live{height:auto}
  .scrub.is-live .scrub-stage{position:static;height:auto;padding:0}
  .scrub.is-live .scrub-steps{position:static;min-height:0}
  .scrub.is-live .scrub-steps li{position:static;opacity:1;transform:none;pointer-events:auto}
  .scrub-hint{display:none}
}
`;

  const SCRUB_JS = `
(function () {
  var box = document.querySelector('[data-scrub]');
  if (!box) return;
  var video = box.querySelector('[data-scrub-video]');
  var hint = box.querySelector('[data-scrub-hint]');
  var steps = [].slice.call(box.querySelectorAll('.scrub-steps li'));
  var bar = box.querySelector('[data-scrub-bar]');
  var count = box.querySelector('[data-scrub-count]');
  if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var target = 0, shown = -1, raf = null, ready = false, failed = false;

  function giveUp() {
    /* Anything goes wrong and the section becomes a plain, correct one. */
    failed = true;
    box.classList.remove('is-live');
    video.setAttribute('controls', '');
    if (hint && hint.parentNode) hint.parentNode.removeChild(hint);
    if (raf) cancelAnimationFrame(raf);
  }
  video.addEventListener('error', giveUp);

  function load() {
    if (video.src) return;
    video.src = video.getAttribute('data-src');
    video.load();
    /* The giving-up clock starts here, not at page load. The film only starts
       downloading when the section is approached, which on a page this long is
       always more than eight seconds in. Started any earlier, this fired before
       the film had been asked for and killed the loop before it began. */
    window.setTimeout(function () { if (!ready) giveUp(); }, 12000);
    /* iOS will not decode until playback has been allowed once. Play, then
       stop on the first frame, and seeking works from then on. */
    var p = video.play();
    if (p && p.then) p.then(function () { video.pause(); }).catch(function () {});
  }

  video.addEventListener('loadedmetadata', function () {
    if (!video.duration || !isFinite(video.duration)) return giveUp();
    ready = true;
    box.classList.add('is-live');
  });

  var io = new IntersectionObserver(function (es) {
    for (var i = 0; i < es.length; i++) {
      if (es[i].isIntersecting) { load(); io.disconnect(); return; }
    }
  }, { rootMargin: '200% 0px' });
  io.observe(box);

  function progress() {
    var r = box.getBoundingClientRect();
    var travel = r.height - window.innerHeight;
    if (travel <= 0) return 0;
    return Math.min(1, Math.max(0, -r.top / travel));
  }

  function tick() {
    raf = requestAnimationFrame(tick);
    if (failed || !ready) return;

    var p = progress();
    target = p * (video.duration - 0.05);

    /* Ease toward the target instead of snapping to it. Scrolling fast glides
       rather than dropping frames while the decoder catches up. */
    var now = video.currentTime;
    if (Math.abs(target - now) > 0.02 && video.readyState >= 2) {
      try { video.currentTime = now + (target - now) * 0.16; } catch (e) {}
    }

    if (hint) hint.style.opacity = p > 0.04 ? '0' : '1';
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';

    var want = 0;
    for (var i = 0; i < steps.length; i++) {
      if (p >= Number(steps[i].getAttribute('data-at'))) want = i;
    }
    if (want !== shown) {
      for (var k = 0; k < steps.length; k++) steps[k].classList.toggle('on', k === want);
      if (count) count.textContent = 'Step ' + (want + 1) + ' of ' + steps.length;
      shown = want;
    }
  }
  tick();
})();
`;

  return { scrubWalk, SCRUB_CSS, SCRUB_JS };
}

module.exports = { build };
