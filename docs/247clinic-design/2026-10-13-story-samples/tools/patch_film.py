import os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(HERE, 'src', 'story.js')
s = open(p, encoding='utf-8').read()
new = open(os.path.join(HERE, 'tools', 'film_js.js'), encoding='utf-8').read()
a, b = s.index('/* ---------- A: film ---------- */'), s.index('/* ---------- three helpers ---------- */')
s = s[:a] + new + s[b:]
if 'lastSay' not in s:
    k = "    q('[data-bar]').forEach"
    assert k in s
    s = s.replace(k, """    let say = '', best = 0.6; q('[data-say]').forEach((el) => { const o = parseFloat(el.style.opacity || '0'); if (o > best) { best = o; say = el.getAttribute('data-say'); } });
    if (say && say !== lastSay) { lastSay = say; q('[data-live]').forEach((el) => { el.textContent = say; }); }
""" + k, 1)
    s = s.replace("  let wasPlaying = null;\n  return () => {", "  let wasPlaying = null, lastSay = '';\n  return () => {", 1)
    assert 'lastSay = \'\'' in s
open(p, 'w', encoding='utf-8').write(s)
print('patched')
