# -*- coding: utf-8 -*-
"""Check the built pages against Irina's landing page brief, item by item."""
import io, re, json, sys

# Which design to check. `python scripts/check-247-brief.py 4` checks design 4.
N = sys.argv[1] if len(sys.argv) > 1 else '1'
B = 'dist/247clinic/hotel-landing-pages/design-' + N
PAGES = {
 'Premier Le Reve':   (B + '.html', 'Premier Le Rêve', 'Sahl Hasheesh'),
 'Steigenberger':     (B + '-steigenberger.html', 'Steigenberger Ras Soma', 'Soma Bay'),
 'Amwaj Beach Club':  (B + '-amwaj.html', 'Amwaj Beach Club', 'Abu Soma'),
}
print('Checking design %s against the brief' % N)

def text(h):
    h = re.sub(r'<script[\s\S]*?</script>', ' ', h)
    h = re.sub(r'<style[\s\S]*?</style>', ' ', h)
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', h))

rows = []
for name, (path, hotel, area) in PAGES.items():
    h = io.open(path, encoding='utf-8').read()
    t = text(h)
    ld = ' '.join(re.findall(r'application/ld\+json">([\s\S]*?)</script>', h))

    checks = [
      ('H1 "Need a Doctor at [Hotel]?"',  re.search(r'<h1[^>]*>\s*Need a Doctor at ' + re.escape(hotel) + r'\?', h) is not None),
      ('Sub "24/7 Clinic located inside / serving"', re.search(r'24/7 Clinic (located inside|serving) \w', t) is not None),
      ('Button CALL NOW',                 'Call now' in t),
      ('Button WHATSAPP',                 'WhatsApp' in t),
      ('Button FIND THE CLINIC',          'Find the clinic' in t),
      ('Hotel name',                      hotel in t),
      ('24/7 Clinic branding (logo)',     'c7-logo' in h or 'alt="24/7 Clinic"' in h),
      ('Exact clinic location (geo)',     'geo.position' in h and 'GeoCoordinates' in ld),
      ('Where the clinic is in the hotel', 'reception' in t.lower() or 'entrance' in t.lower() or 'grounds' in t.lower()),
      ('Google Map',                      'maps.google.com' in h or 'google.com/maps' in h),
      ('Directions link',                 'google.com/maps' in h),
      ('Opening hours',                   'Open 24 hours' in t and 'openingHoursSpecification' in ld),
      ('Phone number',                    '+20 122 222 8247' in t and 'tel:' in h),
      ('WhatsApp link',                   'wa.me' in h),
      ('Clinic photographs',              bool(re.search(r'<img[^>]+c7-(?!logo|og|acc|map)', h))),
      ('Doctor consultation',             any(x in t for x in ('Doctor consultation', 'Urgent Medical Care', 'Specialist Consultation'))),
      ('Medical examination',             any(x in t for x in ('Medical examination', 'Medical assessment', 'Assessment and treatment'))),
      ('Minor illnesses and injuries',    'minor illnesses and injuries' in t.lower() or 'minor procedures' in t.lower()),
      ('Medication support',              'Medication' in t),
      ('Laboratory / diagnostics',        'Laboratory' in t or 'laboratory' in t),
      ('Ambulance coordination',          'ambulance' in t.lower()),
      ('Hospital referral',               'hospital referral' in t.lower()),
      ('Insurance assistance',            'insurance' in t.lower()),
      ('Medical reports',                 'Medical reports' in t or 'medical report' in t.lower()),
      ('Support for international tourists', 'German' in t or 'international' in t.lower()),
      ('Emergency contact CTA',           'wa.me' in h and 'tel:' in h),
      ('FAQ section',                     '<details' in h and 'FAQPage' in ld),
      ('--- SEO ---', None),
      ('Unique SEO title',                bool(re.search(r'<title>[^<]{20,70}</title>', h))),
      ('Meta description',                'name="description"' in h),
      ('Exactly one H1',                  h.count('<h1') == 1),
      ('H2 structure',                    h.count('<h2') >= 4),
      ('Image ALT tags on every img',     len(re.findall(r'<img(?![^>]*\balt=)[^>]*>', h)) == 0),
      ('Internal links to siblings',      h.count('/247clinic/hotel-landing-pages/') >= 2),
      ('Canonical',                       'rel="canonical"' in h),
      ('MedicalClinic schema',            'MedicalClinic' in ld),
      ('LocalBusiness reviewed',          'MedicalClinic' in ld),
      ('BreadcrumbList schema',           'BreadcrumbList' in ld),
      ('--- TRACKING ---', None),
      ('WhatsApp click event',            'whatsapp_medical_click' in h),
      ('Call click event',                'phone_click' in h),
      ('Directions click event',          'clinic_directions_click' in h),
      ('Page visit event',                'clinic_view' in h),
      ('--- MOBILE ---', None),
      ('Viewport meta',                   'width=device-width' in h),
      ('Sticky WhatsApp / call bar',      'wa-float' in h or re.search(r'class="bar"', h) is not None),
      ('Lazy media below the fold',       'loading="lazy"' in h and ('<video' not in h or 'preload="none"' in h)),
    ]
    rows.append((name, checks))

for name, checks in rows:
    fails = [c for c, ok in checks if ok is False]
    total = len([c for c, ok in checks if ok is not None])
    print('\n%s  %d/%d' % (name, total - len(fails), total))
    for c, ok in checks:
        if ok is None:
            print('   %s' % c)
        else:
            print('   %s %s' % ('PASS' if ok else 'FAIL', c))


# ---------------------------------------------------------------- uniqueness
# Her brief: "Do NOT create three identical pages and simply replace the hotel
# name." This is the measurement of whether we did that anyway.
import difflib

def visible(p):
    h = io.open(p, encoding='utf-8').read()
    h = re.sub(r'<script[\s\S]*?</script>', ' ', h)
    h = re.sub(r'<style[\s\S]*?</style>', ' ', h)
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', h)).strip()

T = {k: visible(v[0]) for k, v in PAGES.items()}
ks = list(T)
print('\n\nHow different the three pages are')
worst = 0
for i in range(len(ks)):
    for j in range(i + 1, len(ks)):
        r = difflib.SequenceMatcher(None, T[ks[i]], T[ks[j]]).ratio()
        worst = max(worst, r)
        print('   %-18s vs %-18s %5.1f%% identical' % (ks[i], ks[j], r * 100))

print('')
for k in ks:
    others = set()
    for o in ks:
        if o != k:
            others |= set(re.findall(r'[A-Za-z\u00c0-\u024f]{4,}', T[o].lower()))
    mine = re.findall(r'[A-Za-z\u00c0-\u024f]{4,}', T[k].lower())
    uniq = sorted(set(w for w in mine if w not in others))
    print('   %-18s %3d words found on no other page' % (k, len(uniq)))

print('')
if worst > 0.85:
    print('   FAIL  Pages are more than 85% alike. Her brief forbids this.')
else:
    print('   PASS  Each page carries its own content.')
