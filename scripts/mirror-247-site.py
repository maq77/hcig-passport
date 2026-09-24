# -*- coding: utf-8 -*-
"""Mirror a page of 247clinic.net and everything it loads from its own domain.

Their CSS, their images, their layout. We edit these files rather than rebuild,
because their brief says keep as much of the current site as possible.
"""
import io, os, re, sys, urllib.parse as up, urllib.request

SITE = 'https://www.247clinic.net'
OUT = '.work/mirror'
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) HCIG-preview'}

def get(url):
    # Their photo filenames contain spaces. Encode the path for the request but
    # keep the literal name on disk, or the page cannot find them again.
    scheme, rest = url.split('://', 1)
    host, _, path = rest.partition('/')
    url = scheme + '://' + host + '/' + up.quote(path)
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.read()

def local(url):
    """Site-relative path for anything served from their domain, else None."""
    p = up.urlparse(url)
    if p.scheme and p.netloc and '247clinic.net' not in p.netloc:
        return None
    path = p.path
    if not path.startswith('/'):
        return None
    return path

def save(path, data):
    f = os.path.join(OUT, path.lstrip('/'))
    os.makedirs(os.path.dirname(f), exist_ok=True)
    io.open(f, 'wb').write(data)
    return f

page = sys.argv[1] if len(sys.argv) > 1 else '/'
html = get(SITE + page).decode('utf-8', 'replace')

refs = set()
for pat in [r'<link[^>]+href="([^"]+)"', r'<script[^>]+src="([^"]+)"',
            r'(?:src|data-src|data-bg)="([^"]+)"', r'srcset="([^"]+)"',
            r'url\((?:&quot;|"|\')?([^)"\'&]+)']:
    srcset = 'srcset' in pat
    for m in re.findall(pat, html):
        # Only srcset carries "file.jpg 2x" descriptors. Splitting on a space
        # anywhere else chops filenames that legitimately contain one, which is
        # most of their photo library.
        parts = m.split(',') if srcset else [m]
        for part in parts:
            u = part.strip()
            if srcset:
                u = u.split(' ')[0]
            if u and not u.startswith('data:'):
                refs.add(u)

got, missed, css_files = 0, [], []
for u in sorted(refs):
    p = local(u)
    if not p:
        continue
    try:
        data = get(SITE + p)
        save(p, data)
        got += 1
        if p.endswith('.css'):
            css_files.append(p)
    except Exception as e:
        missed.append((p, str(e)[:40]))

# CSS files reference more assets of their own. One level is enough here.
for c in css_files:
    try:
        text = io.open(os.path.join(OUT, c.lstrip('/')), encoding='utf-8', errors='replace').read()
    except Exception:
        continue
    base = os.path.dirname(c)
    for u in set(re.findall(r'url\((?:"|\')?([^)"\']+)', text)):
        if u.startswith('data:') or u.startswith('http'):
            continue
        p = u if u.startswith('/') else os.path.normpath(os.path.join(base, u)).replace(chr(92), '/')
        if not p.startswith('/'):
            p = '/' + p
        p = p.split('?')[0].split('#')[0]
        if os.path.exists(os.path.join(OUT, p.lstrip('/'))):
            continue
        try:
            save(p, get(SITE + p))
            got += 1
        except Exception as e:
            missed.append((p, str(e)[:40]))

name = 'index.html' if page == '/' else page.strip('/').replace('/', '-') + '.html'
save('/' + name, html.encode('utf-8'))
print('page      %s  ->  %s/%s' % (page, OUT, name))
print('assets    %d saved, %d missing' % (got, len(missed)))
for p, e in missed[:12]:
    print('   missing %s  %s' % (p, e))
