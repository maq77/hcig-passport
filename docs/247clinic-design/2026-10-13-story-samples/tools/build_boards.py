"""Builds the 24/7 story sample boards (film, depth, live; desktop and phone) from one definition.
usage: python build_boards.py local|canvas   (canvas mode reads blob ids from blobs.json)"""
import json, os, sys, html

MODE = sys.argv[1] if len(sys.argv) > 1 else 'local'
HERE = os.path.dirname(os.path.abspath(__file__))
BLOBS = json.load(open(os.path.join(HERE, 'blobs.json'), encoding='utf-8')) if os.path.exists(os.path.join(HERE, 'blobs.json')) else {}

def url(key):
    if MODE == 'canvas':
        return '/_blob/' + BLOBS[key]
    local = {'engine': 'dist/story.js', 'logo': 'assets/247-logo-white.svg', 'mark': 'assets/247-mark-white.svg', 'markc': 'assets/247-mark.svg',
             'calisto400': 'assets/calisto-400.woff2', 'calisto700': 'assets/calisto-700.woff2'}
    if key in local: return local[key]
    return 'web/' + key + '.webp'

CHAPTERS = [('I', 'Arrival', 0.0, 0.18), ('II', 'The Stay', 0.18, 0.30), ('III', '2:14 am', 0.30, 0.46),
            ('IV', 'The Hero of the Moment', 0.46, 0.76), ('V', 'The Holiday Continues', 0.76, 1.0001)]
FRAMES = [('f01', 0.00, 'in', 'fade'), ('f02', 0.09, 'right', 'fade'), ('f03', 0.18, 'out', 'flash'), ('f04', 0.24, 'left', 'fade'),
          ('n1', 0.30, 'in', 'black'), ('f05', 0.335, 'in', 'fade'), ('f06', 0.38, 'in', 'fade'),
          ('n2', 0.46, 'in', 'fade'), ('f07', 0.495, 'right', 'fade'), ('n3', 0.56, 'in', 'fade'), ('f08', 0.585, 'in', 'fade'),
          ('f09', 0.625, 'out', 'fade'), ('f10', 0.69, 'in', 'fade'),
          ('n4', 0.76, 'out', 'black'), ('f11', 0.81, 'up', 'fade'), ('n5', 0.855, 'right', 'fade'), ('f12', 0.895, 'left', 'flash'),
          ('n6', 0.935, 'out', 'fade')]
FILM_FRAMES = [f for f, *_ in FRAMES]
SHOTS = [('f01', 0.00, 'rise', 0.36), ('f04', 0.18, 'in', 0.30), ('f05', 0.30, 'in', 0.30), ('f07', 0.46, 'track', 0.34),
         ('f09', 0.58, 'orbit', 0.28), ('f10', 0.66, 'in', 0.34), ('f11', 0.76, 'rise', 0.30), ('f12', 0.86, 'track', 0.40)]
CAPTIONS = [
    (0.105, 0.17, 'The Red Sea, at golden hour.', 'Your holiday begins.'),
    (0.24, 0.296, 'Days made of light.', 'Nights made of stars.'),
    (0.36, 0.455, '2:14 am.', 'A fever, far from home.'),
    (0.515, 0.556, 'Through the gardens,', 'the hero of the moment.'),
    (0.566, 0.665, 'A knock at the door.', 'Care, inside your suite.'),
    (0.695, 0.755, 'The Invisible Service.', 'A 24/7 Clinic inside your resort, open all night.'),
    (0.82, 0.885, 'Morning comes.', 'The holiday goes on.'),
]
DESTS = [('Hurghada', 5), ('Sahl Hasheesh', 4), ('Soma Bay', 4), ('El Quseir', 1), ('Marsa Alam', 11), ('North Coast', 5)]
WA = 'https://wa.me/201222228247'
WA_SVG = '<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.2.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"></path></svg>'
SERIF = "'Calisto MT', 'Book Antiqua', Georgia, serif"
ITAL = "'Cormorant Garamond', Georgia, serif"
PHONE_POS = {'n1': '40%', 'n2': '55%', 'n3': '62%', 'n4': '72%', 'n5': '29%', 'n6': '50%', 'f01': '62%', 'f02': '52%', 'f03': '62%', 'f04': '50%', 'f05': '72%', 'f06': '58%', 'f07': '42%', 'f08': '60%', 'f09': '36%', 'f10': '55%', 'f11': '50%', 'f12': '58%'}
PHONE_CX = {'f01': 0.25, 'f02': 0.1, 'f04': 0.0, 'f05': 0.3, 'f07': -0.05, 'f09': -0.3, 'f10': 0.05, 'f11': 0.0, 'f12': 0.12}
TITLES = {'film': 'Cinematic film', 'depth': 'Real photographs in 3D', 'live': 'Live 3D world'}

SND = '<button type="button" data-sound="1" aria-pressed="false" aria-label="Turn the sound on" class="pill" style="height:{h}px;padding:0 {px}px;display:flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.4);border-radius:999px;background:rgba(255,255,255,.06);color:#FFFFFF;font-family:inherit;font-size:12px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;cursor:pointer"><svg data-sound-off="1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"></path><path d="M16 9.5l5 5M21 9.5l-5 5"></path></svg><svg data-sound-on="1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" style="display:none"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"></path><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"></path></svg>{label}</button>'
FINDER = 'https://www.247clinic.net/our-clinics'

def styles():
    return f"""<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400;1,500&amp;family=Poppins:wght@300;400;500;600&amp;display=swap" rel="stylesheet">
<style>
@font-face{{font-family:"Calisto MT";src:url("{url('calisto400')}") format("woff2");font-weight:400;font-display:swap}}
@font-face{{font-family:"Calisto MT";src:url("{url('calisto700')}") format("woff2");font-weight:700;font-display:swap}}
body{{margin:0;background:#050404}}
a{{color:inherit;text-decoration:none}}a:hover{{color:inherit}}
*{{box-sizing:border-box}}
[data-story]{{touch-action:none;-webkit-user-select:none;user-select:none;cursor:grab}}
[data-story]:active{{cursor:grabbing}}
[data-t0]{{opacity:0;visibility:hidden;will-change:opacity,transform}}
[data-frame]{{will-change:opacity,transform;transform-origin:50% 50%}}
.chb .lbl{{opacity:.55;transition:opacity .4s ease}}
.chb.on .lbl,.chb:hover .lbl{{opacity:1}}
.chb .num{{color:rgba(255,255,255,.5);transition:color .4s ease}}
.chb.on .num{{color:#FF6B6B}}
.pill{{transition:transform .18s ease,background-color .18s ease}}
.pill:hover{{transform:translateY(-1px)}}
@keyframes leak{{0%,100%{{opacity:.18;transform:translateX(-6%)}}50%{{opacity:.34;transform:translateX(6%)}}}}
@keyframes hint{{0%,100%{{transform:translateY(0)}}50%{{transform:translateY(5px)}}}}
.leak{{animation:leak 14s ease-in-out infinite}}
@keyframes kb{{from{{transform:scale(1.04)}}to{{transform:scale(1.14) translateX(-1.5%)}}}}
.kb{{animation:kb 18s ease-in-out infinite alternate}}
.hintdot{{animation:hint 1.8s ease-in-out infinite}}
@media (prefers-reduced-motion: reduce){{.leak,.hintdot,.kb{{animation:none}}}}
</style>"""

def media(kind, phone):
    if kind == 'film':
        imgs = ''.join(f'<img data-frame="{at}" data-kb="{kb}" data-tr="{tr}" src="{url(f)}" alt="" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:{PHONE_POS[f] if phone else "50%"} center;opacity:{1 if at == 0 else 0}">' for f, at, kb, tr in FRAMES)
        return f'<div aria-hidden="true" style="position:absolute;inset:0;overflow:hidden;background:#050404">{imgs}<div data-flash="1" style="position:absolute;inset:0;opacity:0;pointer-events:none;mix-blend-mode:screen;background:radial-gradient(90% 80% at 50% 40%, rgba(255,226,190,.95), rgba(255,170,120,.5) 60%, rgba(255,140,90,.2))"></div></div>'
    shots = ''
    if kind == 'depth':
        shots = ''.join(f'<span data-shot="{at}" data-img="{url(f)}" data-depth="{url(f + "-depth")}" data-move="{mv}" data-amp="{amp}" data-cx="{PHONE_CX.get(f, 0) if phone else 0}"></span>' for f, at, mv, amp in SHOTS)
    return f'<div data-err="1" style="display:none;position:absolute;inset:0;z-index:1;align-items:center;justify-content:center;padding:40px;text-align:center;font-size:14px;color:rgba(255,255,255,.75)"></div><canvas data-gl="1" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;display:block"></canvas>{shots}'

def chrome(kind, phone):
    W, H = (390, 844) if phone else (1440, 810)
    pad = 20 if phone else 48
    cap_size = 24 if phone else 40
    out = []
    # shading, light leak, grain, letterbox
    out.append(f'<div aria-hidden="true" style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 90% at 50% 45%, rgba(5,4,4,0) 55%, rgba(5,4,4,.55) 100%), linear-gradient(180deg, rgba(5,4,4,.6) 0%, rgba(5,4,4,0) 18%, rgba(5,4,4,0) 62%, rgba(5,4,4,.85) 100%)"></div>')
    out.append('<div class="leak" aria-hidden="true" style="position:absolute;inset:-10%;pointer-events:none;mix-blend-mode:screen;background:radial-gradient(40% 50% at 12% 20%, rgba(255,140,90,.35), transparent 70%), radial-gradient(30% 40% at 92% 80%, rgba(226,6,19,.22), transparent 70%)"></div>')
    out.append('<div data-grain="1" aria-hidden="true" style="position:absolute;inset:0;pointer-events:none;mix-blend-mode:overlay;opacity:.55;background-size:160px 160px"></div>')
    # opening title, on black, gone by about four seconds
    if kind == 'film':
        out.append(f'''<div data-t0="-1" data-t1="0.044" data-say="24/7 Clinic presents One Night on the Red Sea." style="position:absolute;inset:0;z-index:8;opacity:1;visibility:visible;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:{16 if phone else 22}px;text-align:center;padding:0 {pad}px;background:#050404;pointer-events:none">
<img src="{url('logo')}" alt="" style="height:{56 if phone else 72}px;width:auto;opacity:.92">
<span style="font-size:{10 if phone else 11}px;font-weight:500;letter-spacing:.42em;text-transform:uppercase;color:rgba(255,255,255,.62)">presents</span>
<span style="font-family:{SERIF};font-size:{34 if phone else 60}px;line-height:1.05;color:#FFFFFF">One Night <span style="font-family:{ITAL};font-style:italic;font-weight:500;color:#FFD9D4">on the Red Sea</span></span></div>''')
        out.append('<div data-live="1" role="status" aria-live="polite" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap"></div>')
    # top bar
    logo_h = 46 if phone else 64
    out.append(f'''<div style="position:absolute;left:0;right:0;top:0;height:{78 if phone else 96}px;padding:0 {pad}px;display:flex;align-items:center;justify-content:space-between;z-index:7">
<a href="#" aria-label="24/7 Clinic home" style="display:flex"><img src="{url('mark' if phone else 'logo')}" alt="24/7 Clinic" style="height:{logo_h}px;width:auto;display:block"></a>
<div style="display:flex;align-items:center;gap:{8 if phone else 14}px">
{SND.format(h=44, px=12 if phone else 16, label='' if phone else '<span data-sound-label="1">Sound off</span>') if kind == 'film' else ''}
<a href="#" data-goto="0.95" style="font-size:{11 if phone else 12}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.86);padding:12px 4px">{'Skip' if phone and kind == 'film' else 'Skip the story'}</a>
<a href="{WA}" class="pill" aria-label="WhatsApp us 24/7" style="height:{44 if phone else 46}px;padding:0 {14 if phone else 20}px;display:flex;align-items:center;gap:8px;background:#25D366;border-radius:999px;color:#FFFFFF;font-size:14px;font-weight:500">{WA_SVG.format(s=18)}{'' if phone else 'WhatsApp Us 24/7'}</a>
</div></div>''')
    # clock
    out.append(f'''<div data-t0="0.356" data-t1="0.705" style="position:absolute;left:0;right:0;top:{96 if phone else 118}px;display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:none;z-index:3">
<span data-clock="1" style="font-family:{SERIF};font-size:{44 if phone else 64}px;line-height:1;color:#FFFFFF;letter-spacing:.02em;text-shadow:0 2px 24px rgba(0,0,0,.6)">02:14</span>
<span style="font-size:{10 if phone else 11}px;font-weight:500;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,217,212,.85)">Sahl Hasheesh, Red Sea</span></div>''')
    # chapter title cards
    for num, title, a, b in CHAPTERS:
        t0, t1 = (0.047, 0.098) if num == 'I' else (a + 0.004, a + 0.052)
        out.append(f'''<div data-t0="{t0:.3f}" data-t1="{t1:.3f}" data-say="Chapter {num}. {html.escape(title)}." style="position:absolute;inset:0;background:radial-gradient(60% 55% at 50% 50%, rgba(5,4,4,.55), rgba(5,4,4,.15) 70%, rgba(5,4,4,0));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:{10 if phone else 16}px;pointer-events:none;z-index:3;text-align:center;padding:0 {pad}px">
<span style="font-size:{11 if phone else 12}px;font-weight:500;letter-spacing:.42em;color:#FFB3B3">CHAPTER {num}</span>
<span style="font-family:{SERIF};font-size:{40 if phone else 76}px;line-height:1;color:#FFFFFF;text-shadow:0 4px 40px rgba(0,0,0,.55)">{html.escape(title)}</span>
<span style="width:{40 if phone else 60}px;height:1px;background:#E20613"></span></div>''')
    # captions
    for a, b, l1, l2 in CAPTIONS:
        out.append(f'''<div data-t0="{a}" data-t1="{b}" data-say="{html.escape(l1 + ' ' + l2)}" style="position:absolute;left:{pad}px;right:{pad}px;bottom:{176 if phone else 150}px;z-index:3;pointer-events:none;max-width:{W - 2 * pad if phone else 760}px">
<p style="margin:0;font-family:{SERIF};font-size:{cap_size}px;line-height:1.12;color:#FFFFFF;text-shadow:0 2px 30px rgba(0,0,0,.65)">{html.escape(l1)} <span style="font-family:{ITAL};font-style:italic;font-weight:500;color:#FFD9D4">{html.escape(l2)}</span></p></div>''')
    # the 2:14 am message exchange
    cw = W - 2 * pad if phone else 380
    pos = f'left:{pad}px;top:{200}px' if phone else f'right:{pad}px;top:240px'
    out.append(f'''<div data-t0="0.375" data-t1="0.462" style="position:absolute;{pos};width:{cw}px;z-index:4;pointer-events:none;border-radius:22px;padding:16px;background:rgba(18,14,14,.72);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.14);box-shadow:0 30px 80px rgba(0,0,0,.45);display:flex;flex-direction:column;gap:10px;font-size:{13.5 if phone else 14}px;line-height:1.45">
<div style="display:flex;align-items:center;gap:10px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.1)"><span style="width:34px;height:34px;border-radius:50%;background:#FFFFFF;display:flex;align-items:center;justify-content:center"><img src="{url('markc')}" alt="" style="height:24px;width:auto"></span><span style="display:flex;flex-direction:column"><span style="font-weight:600;color:#FFFFFF">24/7 Clinic</span><span style="font-size:11px;color:#25D366">online, 24/7</span></span></div>
<div data-t0="0.385" data-t1="0.462" style="align-self:flex-end;max-width:84%;background:#1F5C3A;color:#FFFFFF;border-radius:14px 14px 4px 14px;padding:9px 12px">Hello, my husband has a high fever. We are at Sahl Hasheesh, suite 402.<span style="display:block;text-align:right;font-size:10.5px;color:rgba(255,255,255,.7);margin-top:2px">02:14 ✓✓</span></div>
<div data-t0="0.405" data-t1="0.462" style="align-self:flex-start;max-width:84%;background:rgba(255,255,255,.1);color:#FFFFFF;border-radius:14px 14px 14px 4px;padding:9px 12px">Thank you. A doctor is on the way to your suite.<span style="display:block;text-align:right;font-size:10.5px;color:rgba(255,255,255,.6);margin-top:2px">02:15</span></div></div>''')
    # final card
    dest = ''.join(f'<span style="display:flex;align-items:flex-start;gap:4px">{d}<sup style="font-family:Poppins,sans-serif;font-size:10px;color:#FFB3B3">{c}</sup></span>' for d, c in DESTS)
    out.append(f'''<div data-t0="0.948" data-t1="1.2" data-say="World class care in world class hotels, while you have your vacation." style="position:absolute;inset:0;z-index:6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:{18 if phone else 26}px;text-align:center;padding:0 {pad}px;background:radial-gradient(80% 70% at 50% 50%, rgba(5,4,4,.35), rgba(5,4,4,.82))">
<img src="{url('logo')}" alt="24/7 Clinic" style="height:{70 if phone else 96}px;width:auto">
<p style="margin:0;max-width:{W - 40 if phone else 900}px;font-family:{SERIF};font-size:{28 if phone else 52}px;line-height:1.12;color:#FFFFFF">World class care in world class hotels, <span style="font-family:{ITAL};font-style:italic;font-weight:500;color:#FFD9D4">while you have your vacation.</span></p>
<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;width:{'100%' if phone else 'auto'}">
<a href="{WA}" class="pill" style="height:{54 if phone else 58}px;padding:0 8px 0 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;background:#25D366;border-radius:999px;color:#FFFFFF;font-size:15.5px;font-weight:500;{'width:100%' if phone else ''}">WhatsApp Us 24/7<span style="width:42px;height:42px;border-radius:50%;background:#128C3E;display:flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></span></a>
<a href="{FINDER}" target="_blank" rel="noopener" class="pill" style="height:{54 if phone else 58}px;padding:0 26px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.6);border-radius:999px;color:#FFFFFF;font-size:15.5px;font-weight:500;{'width:100%' if phone else ''}">Find Your Clinic</a>
<button type="button" data-goto="0" class="pill" style="height:{54 if phone else 58}px;padding:0 22px;display:flex;align-items:center;justify-content:center;gap:8px;border:0;background:transparent;color:rgba(255,255,255,.86);font-family:inherit;font-size:13px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;{'width:100%' if phone else ''}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"></path></svg>Watch again</button></div>
<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:{8 if phone else 10}px {16 if phone else 30}px;font-family:{SERIF};font-size:{15 if phone else 19}px;color:rgba(255,255,255,.88)">{dest}</div></div>''')
    # bottom controls
    chs = ''.join(f'''<button type="button" class="chb" data-goto="{a}" data-ch="{b}" style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:8px;background:transparent;border:0;padding:{10 if phone else 12}px 0 0;color:#FFFFFF;font-family:inherit;text-align:left;cursor:pointer"><span style="position:relative;display:block;width:100%;height:2px;background:rgba(255,255,255,.22);overflow:hidden"><span data-fill="1" style="position:absolute;inset:0;background:#FFFFFF;transform:scaleX(0);transform-origin:left"></span></span>{'' if phone else f'<span class="lbl" style="display:flex;gap:8px;align-items:baseline;font-size:12.5px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%"><span class="num" style="font-family:{SERIF};font-size:14px">{n}</span>{html.escape(t)}</span>'}</button>''' for n, t, a, b in CHAPTERS)
    play = f'''<button type="button" data-play="1" aria-label="Pause the story" style="flex:0 0 auto;width:{44 if phone else 48}px;height:{44 if phone else 48}px;border-radius:50%;border:1px solid rgba(255,255,255,.45);background:rgba(255,255,255,.08);color:#FFFFFF;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0"><svg data-icon-pause="1" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"></path></svg><svg data-icon-play="1" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="display:none"><path d="M8 5.5v13l10.5-6.5z"></path></svg></button>'''
    meta = f'''<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:{10 if phone else 11}px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.62)"><span style="display:flex;align-items:center;gap:8px"><span class="hintdot" style="width:6px;height:6px;border-radius:50%;background:#FF6B6B"></span>{'Swipe to steer' if phone else 'Scroll or drag to steer the story'}</span><span>{'Sample, made with AI' if phone else TITLES[kind] + ' · Sample, made with AI'}</span></div>'''
    out.append(f'''<div style="position:absolute;left:{pad}px;right:{pad}px;bottom:{22 if phone else 30}px;z-index:7;display:flex;flex-direction:column;gap:{12 if phone else 16}px">
<div style="display:flex;align-items:flex-end;gap:{12 if phone else 22}px">{play}<div style="flex:1;display:flex;gap:{6 if phone else 14}px">{chs}</div></div>{meta}</div>''')
    return '\n'.join(out)

def board(kind, phone):
    W, H = (390, 844) if phone else (1440, 810)
    body = f'''<div data-story="{kind}" aria-label="{'One Night on the Red Sea, an interactive story. Space plays or pauses, arrow keys change chapter.' if kind == 'film' else TITLES[kind]}" role="region" data-seconds="{110 if kind == 'film' else 96}" data-phone="{1 if phone else 0}" style="position:relative;width:{W}px;height:{H}px;overflow:hidden;background:#050404;color:#FFFFFF;font-family:Poppins, 'Segoe UI', system-ui, sans-serif;font-weight:300">
{media(kind, phone)}
{chrome(kind, phone)}
</div>'''
    return W, H, body


def band(phone):
    W, H = (390, 760) if phone else (1440, 640)
    pad = 20 if phone else 64
    thumbs = ''.join(f'<span style="flex:1 1 0;min-width:0;height:{72 if phone else 96}px;overflow:hidden;border:1px solid rgba(255,255,255,.22)"><img src="{url(f)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block"></span>' for f in ['f02', 'f05', 'f07', 'f11'])
    text = f'''<div style="position:relative;z-index:2;display:flex;flex-direction:column;gap:{16 if phone else 24}px;max-width:{W - 2 * pad if phone else 560}px">
<span style="display:flex;align-items:center;gap:12px;font-size:{11 if phone else 12}px;font-weight:500;letter-spacing:.3em;text-transform:uppercase;color:#FFB3B3"><span style="width:36px;height:1px;background:#E20613"></span>An Interactive Story</span>
<h2 style="margin:0;font-family:{SERIF};font-weight:400;font-size:{38 if phone else 64}px;line-height:1.02;color:#FFFFFF">One Night on the Red Sea, <span style="font-family:{ITAL};font-style:italic;font-weight:500;color:#FFD9D4">in Five Chapters.</span></h2>
<p style="margin:0;font-size:{15 if phone else 17}px;line-height:1.6;color:rgba(255,255,255,.84)">A golden arrival, a fever at 2:14 am, a knock at the door, and a holiday that never stops. Scroll to steer the story.</p>
<div style="display:flex;flex-wrap:wrap;align-items:center;gap:14px">
<a href="A-Film.dc.html" class="pill" style="height:{56 if phone else 60}px;padding:0 8px 0 26px;display:flex;align-items:center;gap:18px;background:#FFFFFF;border-radius:999px;color:#1A1414;font-size:15.5px;font-weight:500;{'width:100%;justify-content:space-between' if phone else ''}">Play the Story<span style="width:44px;height:44px;border-radius:50%;background:#C00000;display:flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.5v11l9-5.5z" fill="#FFFFFF"></path></svg></span></a>
<span style="font-size:12px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.7)">About 2 minutes</span></div>
<div style="display:flex;gap:8px;margin-top:{4 if phone else 8}px">{thumbs}</div></div>'''
    body = f'''<section style="position:relative;width:{W}px;height:{H}px;overflow:hidden;background:#0F0B0B;color:#FFFFFF;font-family:Poppins, 'Segoe UI', system-ui, sans-serif;font-weight:300;display:flex;align-items:{'flex-end' if phone else 'center'};padding:{pad}px">
<img class="kb" src="{url('f07')}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:{'42%' if phone else '60%'} center">
<div aria-hidden="true" style="position:absolute;inset:0;background:{'linear-gradient(180deg, rgba(15,11,11,.1) 0%, rgba(15,11,11,.55) 38%, rgba(15,11,11,.95) 72%)' if phone else 'linear-gradient(90deg, rgba(15,11,11,.94) 0%, rgba(15,11,11,.7) 40%, rgba(15,11,11,.05) 75%)'}"></div>
<div class="leak" aria-hidden="true" style="position:absolute;inset:-10%;pointer-events:none;mix-blend-mode:screen;background:radial-gradient(40% 50% at 80% 30%, rgba(255,140,90,.25), transparent 70%)"></div>
{text}
</section>'''
    return W, H, body

def write():
    outdir = os.path.join(HERE, 'out', MODE); os.makedirs(outdir, exist_ok=True)
    names = {('film', False): 'A-Film', ('depth', False): 'B-Depth', ('live', False): 'Main',
             ('film', True): 'A-Phone', ('depth', True): 'B-Phone', ('live', True): 'C-Phone'}
    items = list(names.items()) + [(('band', False), 'Home-Band'), (('band', True), 'Home-Band-Phone')]
    for (kind, phone), name in items:
        try:
            W, H, body = band(phone) if kind == 'band' else board(kind, phone)
        except KeyError as e:
            print('skip', name, 'missing', e); continue
        title = ('24/7 home band, story invite, ' + ("phone" if phone else "desktop")) if kind == 'band' else f'24/7 story sample, {TITLES[kind].lower()}, {"phone" if phone else "desktop"}'
        if MODE == 'canvas':
            doc = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
<script src="{url('engine')}"></script>
</head>
<body>
<x-dc>
<helmet>
{styles()}
</helmet>
{body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{W},"height":{H}}}}}'>
class Component extends DCLogic {{
  renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
'''
            open(os.path.join(outdir, name + '.dc.html'), 'w', encoding='utf-8').write(doc)
        else:
            doc = f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{title}</title>{styles()}</head><body>{body}<script src="{url("engine")}"></script></body></html>'
            open(os.path.join(HERE, name + '.html'), 'w', encoding='utf-8').write(doc)
        print('wrote', name)

write()
