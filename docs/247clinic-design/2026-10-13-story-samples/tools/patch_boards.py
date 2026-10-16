"""Turns the film route into the full piece: 18 shots with transitions, an opening title, sound, live captions,
real links. Only the film boards and the band change; B and C keep their published files."""
import os, re
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(HERE, 'build_boards.py')
s = open(p, encoding='utf-8').read()

def sub(old, new, count=1):
    global s
    assert old in s, old[:80]
    s = s.replace(old, new, count)

# 18 shots, each with a camera move and a way in
sub("""FRAMES = [('f01', 0.00, 'in'), ('f02', 0.09, 'right'), ('f03', 0.18, 'out'), ('f04', 0.24, 'left'), ('f05', 0.30, 'in'),
          ('f06', 0.38, 'in'), ('f07', 0.46, 'right'), ('f08', 0.55, 'in'), ('f09', 0.62, 'out'), ('f10', 0.69, 'in'),
          ('f11', 0.76, 'up'), ('f12', 0.86, 'left')]""",
"""FRAMES = [('f01', 0.00, 'in', 'fade'), ('f02', 0.09, 'right', 'fade'), ('f03', 0.18, 'out', 'flash'), ('f04', 0.24, 'left', 'fade'),
          ('n1', 0.30, 'in', 'black'), ('f05', 0.335, 'in', 'fade'), ('f06', 0.38, 'in', 'fade'),
          ('n2', 0.46, 'in', 'fade'), ('f07', 0.495, 'right', 'fade'), ('n3', 0.56, 'in', 'fade'), ('f08', 0.585, 'in', 'fade'),
          ('f09', 0.625, 'out', 'fade'), ('f10', 0.69, 'in', 'fade'),
          ('n4', 0.76, 'out', 'black'), ('f11', 0.81, 'up', 'fade'), ('n5', 0.855, 'right', 'fade'), ('f12', 0.895, 'left', 'flash'),
          ('n6', 0.935, 'out', 'fade')]
FILM_FRAMES = [f for f, *_ in FRAMES]""")
sub("""        imgs = ''.join(f'<img data-frame="{at}" data-kb="{kb}" src="{url(f)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:{PHONE_POS[f] if phone else "50%"} center;opacity:0">' for f, at, kb in FRAMES)
        return f'<div aria-hidden="true" style="position:absolute;inset:0;overflow:hidden;background:#050404">{imgs}</div>'""",
"""        imgs = ''.join(f'<img data-frame="{at}" data-kb="{kb}" data-tr="{tr}" src="{url(f)}" alt="" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:{PHONE_POS[f] if phone else "50%"} center;opacity:{1 if at == 0 else 0}">' for f, at, kb, tr in FRAMES)
        return f'<div aria-hidden="true" style="position:absolute;inset:0;overflow:hidden;background:#050404">{imgs}<div data-flash="1" style="position:absolute;inset:0;opacity:0;pointer-events:none;mix-blend-mode:screen;background:radial-gradient(90% 80% at 50% 40%, rgba(255,226,190,.95), rgba(255,170,120,.5) 60%, rgba(255,140,90,.2))"></div></div>'""")
sub("PHONE_POS = {'f01': '62%',", "PHONE_POS = {'n1': '40%', 'n2': '55%', 'n3': '62%', 'n4': '50%', 'n5': '50%', 'n6': '50%', 'f01': '62%',")

# captions: new timing for the 18 shots, each also spoken to screen readers
sub("""CAPTIONS = [
    (0.075, 0.17, 'The Red Sea, at golden hour.', 'Your holiday begins.'),
    (0.24, 0.30, 'Days made of light.', 'Nights made of stars.'),
    (0.36, 0.455, '2:14 am.', 'A fever, far from home.'),
    (0.475, 0.545, 'Through the gardens,', 'the hero of the moment.'),
    (0.56, 0.665, 'A knock at the door.', 'Care, inside your suite.'),
    (0.67, 0.755, 'The Invisible Service.', 'A 24/7 Clinic inside your resort, open all night.'),
    (0.82, 0.905, 'Morning comes.', 'The holiday goes on.'),
]""", """CAPTIONS = [
    (0.105, 0.17, 'The Red Sea, at golden hour.', 'Your holiday begins.'),
    (0.24, 0.296, 'Days made of light.', 'Nights made of stars.'),
    (0.36, 0.455, '2:14 am.', 'A fever, far from home.'),
    (0.515, 0.556, 'Through the gardens,', 'the hero of the moment.'),
    (0.566, 0.665, 'A knock at the door.', 'Care, inside your suite.'),
    (0.695, 0.755, 'The Invisible Service.', 'A 24/7 Clinic inside your resort, open all night.'),
    (0.82, 0.885, 'Morning comes.', 'The holiday goes on.'),
]""")
sub("""        out.append(f'''<div data-t0="{a}" data-t1="{b}" style="position:absolute;left:{pad}px;right:{pad}px;bottom:{176 if phone else 150}px""",
    """        out.append(f'''<div data-t0="{a}" data-t1="{b}" data-say="{html.escape(l1 + ' ' + l2)}" style="position:absolute;left:{pad}px;right:{pad}px;bottom:{176 if phone else 150}px""")
sub("""        t0, t1 = a + 0.004, a + (0.07 if num == 'I' else 0.052)
        out.append(f'''<div data-t0="{t0:.3f}" data-t1="{t1:.3f}" style=""",
    """        t0, t1 = (0.047, 0.098) if num == 'I' else (a + 0.004, a + 0.052)
        out.append(f'''<div data-t0="{t0:.3f}" data-t1="{t1:.3f}" data-say="Chapter {num}. {html.escape(title)}." style=""")

# opening title (fades out at about four seconds), sound button, skip, finder link, live captions
SND = '''<button type="button" data-sound="1" aria-pressed="false" aria-label="Turn the sound on" class="pill" style="height:{h}px;padding:0 {px}px;display:flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.4);border-radius:999px;background:rgba(255,255,255,.06);color:#FFFFFF;font-family:inherit;font-size:12px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;cursor:pointer"><svg data-sound-off="1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"></path><path d="M16 9.5l5 5M21 9.5l-5 5"></path></svg><svg data-sound-on="1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" style="display:none"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"></path><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"></path></svg>{label}</button>'''
sub("""<a href="#" style="font-size:{11 if phone else 12}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.86);padding:12px 4px">Skip the story</a>""",
    """{SND.format(h=44, px=12 if phone else 16, label='' if phone else '<span data-sound-label="1">Sound off</span>') if kind == 'film' else ''}
<a href="#" data-goto="0.95" style="font-size:{11 if phone else 12}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.86);padding:12px 4px">{'Skip' if phone and kind == 'film' else 'Skip the story'}</a>""")
sub("def styles():", "SND = " + repr(SND) + "\nFINDER = 'https://www.247clinic.net/our-clinics'\n\ndef styles():")
sub("""<a href="#" class="pill" style="height:{54 if phone else 58}px;padding:0 26px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.6)""",
    """<a href="{FINDER}" target="_blank" rel="noopener" class="pill" style="height:{54 if phone else 58}px;padding:0 26px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.6)""")
sub("""    out.append(f'''<div data-t0="0.915" data-t1="1.2" style="position:absolute;inset:0;z-index:6;""",
    """    out.append(f'''<div data-t0="0.948" data-t1="1.2" data-say="World class care in world class hotels, while you have your vacation." style="position:absolute;inset:0;z-index:6;""")
sub("""    # top bar""", """    # opening title, on black, gone by about four seconds
    if kind == 'film':
        out.append(f'''<div data-t0="-1" data-t1="0.044" data-say="24/7 Clinic presents One Night on the Red Sea." style="position:absolute;inset:0;z-index:8;opacity:1;visibility:visible;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:{16 if phone else 22}px;text-align:center;padding:0 {pad}px;background:#050404;pointer-events:none">
<img src="{url('logo')}" alt="" style="height:{56 if phone else 72}px;width:auto;opacity:.92">
<span style="font-size:{10 if phone else 11}px;font-weight:500;letter-spacing:.42em;text-transform:uppercase;color:rgba(255,255,255,.62)">presents</span>
<span style="font-family:{SERIF};font-size:{34 if phone else 60}px;line-height:1.05;color:#FFFFFF">One Night <span style="font-family:{ITAL};font-style:italic;font-weight:500;color:#FFD9D4">on the Red Sea</span></span></div>''')
        out.append('<div data-live="1" role="status" aria-live="polite" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap"></div>')
    # top bar""")

# film runs a little longer now that it has 18 shots
sub("""data-story="{kind}" data-seconds="96\"""", """data-story="{kind}" data-seconds="{110 if kind == 'film' else 96}\"""")
sub("""<div data-story="{kind}\"""", """<div data-story="{kind}" aria-label="{'One Night on the Red Sea, an interactive story. Space plays or pauses, arrow keys change chapter.' if kind == 'film' else TITLES[kind]}" role="region\"""")
open(p, 'w', encoding='utf-8').write(s)
print('boards patched')
