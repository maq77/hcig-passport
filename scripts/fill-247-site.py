# -*- coding: utf-8 -*-
"""Fetch anything the mirrored page references that is not on disk yet."""
import io, os, re, urllib.request

SITE = 'https://www.247clinic.net'
OUT = '.work/mirror'
UA = {'User-Agent': 'Mozilla/5.0 HCIG-preview'}

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=45) as r:
        return r.read()

wanted = set()
for root, _, files in os.walk(OUT):
    for f in files:
        if not f.endswith(('.html', '.css', '.js')):
            continue
        t = io.open(os.path.join(root, f), encoding='utf-8', errors='replace').read()
        for pat in [r'["\'(]\s*(/assets/[^"\')\s>]+)', r'["\'(]\s*(/photos/[^"\')\s>]+)',
                    r'["\'(]\s*(/lib/[^"\')\s>]+)']:
            wanted |= set(re.findall(pat, t))

got, gone = 0, []
for u in sorted(wanted):
    clean = u.split('?')[0].split('#')[0]
    if not clean or clean.endswith('/'):
        continue
    dest = os.path.join(OUT, clean.lstrip('/'))
    if os.path.exists(dest):
        continue
    try:
        data = get(SITE + clean)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        io.open(dest, 'wb').write(data)
        got += 1
    except Exception as e:
        gone.append((clean, str(e)[:34]))

print('referenced %d, fetched %d, still missing %d' % (len(wanted), got, len(gone)))
for p, e in gone[:15]:
    print('   %s  %s' % (p, e))
