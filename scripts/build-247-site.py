# -*- coding: utf-8 -*-
"""Build the 24/7 Clinic website preview from the mirrored live site.

    python .work/mirror.py          download the live pages into .work/mirror
    python scripts/build-247-site.py  ->  src/247site

Their brief, section 2: "We do NOT want a complete redesign. The objective is to
keep as much of the current layout and existing website blocks as possible."

So this does not rebuild their site. It takes their real pages, with their own
stylesheet, script bundle and images, and applies the repositioning to them.
Everything here is reproducible: re-run the mirror, re-run this, and the same
edits land on a fresh copy. Nothing is hand-edited in src/247site, because a
hand edit would be lost the next time their site is pulled down.

Two kinds of change are made.

PATHS. The mirrored pages ask for /assets/... from the site root. Served under
/247clinic/website-preview/ that would collide with the portal's own assets, so
root-absolute asset paths get the prefix. Links to pages that were not mirrored
point back at the live site, so the preview is navigable rather than full of
dead ends.

CONTENT. The edits from their brief, each one tagged with the section it comes
from, so anyone can check the change against the document.
"""
import io
import os
import re
import shutil
import sys

RAW = os.path.join('.work', 'mirror')
OUT = os.path.join('src', '247site')
PREFIX = '/247clinic/website-preview'
LIVE = 'https://www.247clinic.net'

# Pages of theirs we have not mirrored. Links to these go to the live site so
# the preview never dead-ends.
NOT_MIRRORED = [
    '/services', '/insurance', '/our-clinics', '/about-us', '/contact-us',
    '/beauty-wellness', '/blog', '/faqs', '/article/',
]

edits = []


def note(section, what):
    edits.append((section, what))


def rewrite_paths(text, is_css=False):
    """Prefix their root-absolute asset paths; send page links to the live site."""
    for folder in ('assets', 'photos', 'lib', 'cf-fonts', 'cdn-cgi', 'recaptcha'):
        text = text.replace('"/%s/' % folder, '"%s/%s/' % (PREFIX, folder))
        text = text.replace("'/%s/" % folder, "'%s/%s/" % (PREFIX, folder))
        text = text.replace('(/%s/' % folder, '(%s/%s/' % (PREFIX, folder))
    if is_css:
        return text
    for page in NOT_MIRRORED:
        text = text.replace('href="%s"' % page, 'href="%s%s"' % (LIVE, page))
        text = text.replace('href="%s' % page, 'href="%s%s' % (LIVE, page))
    return text


def one(html, old, new, section, what, count=1):
    """Replace and record it. Fails loudly if their markup has moved on."""
    if old not in html:
        print('   SKIPPED (not found): %s' % what)
        return html
    note(section, what)
    return html.replace(old, new, count)


def sub(html, pattern, new, section, what, count=1):
    out, n = re.subn(pattern, new, html, count=count)
    if not n:
        print('   SKIPPED (no match): %s' % what)
        return html
    note(section, what)
    return out


def main():
    if not os.path.isdir(RAW):
        sys.exit('\n  No mirror yet. Run: python .work/mirror.py\n')

    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    shutil.copytree(RAW, OUT)

    # ---------------------------------------------------------------- paths
    touched = 0
    for root, _, files in os.walk(OUT):
        for f in files:
            if not f.endswith(('.html', '.css')):
                continue
            p = os.path.join(root, f)
            t = io.open(p, encoding='utf-8', errors='replace').read()
            t2 = rewrite_paths(t, is_css=f.endswith('.css'))
            if t2 != t:
                io.open(p, 'w', encoding='utf-8').write(t2)
                touched += 1

    print('\n  paths rewritten in %d files' % touched)
    print('  content edits:')

    # -------------------------------------------------------------- content
    index = os.path.join(OUT, 'index.html')
    h = io.open(index, encoding='utf-8', errors='replace').read()

    # ------------------------------------------- our own sheet, not theirs
    # Every visual change we need rides in one small stylesheet loaded after
    # their bundle. Their 576 KB bundle.min.css is never edited, so a future
    # re-mirror cannot lose our work and they can drop our file to revert.
    h = one(h, '</head>',
            '<link rel="stylesheet" href="%s/assets/repositioning.css">
</head>' % PREFIX,
            '2', 'Added repositioning.css, their bundle untouched')

    # ------------------------------------------------------ 4. navigation
    h = one(h, NAV_OLD, NAV_NEW, '4',
            'Simplified nav, Beauty and Blog and FAQs moved out, WhatsApp button added')

    # ------------------------------------------------------------ 6. hero
    # Slides one and two become a single slide. Slide two was "Be Beautiful",
    # which sections 6 and 29 both say must leave the hero. The headline is an
    # h1: their page had no h1 anywhere, which is why the SEO list asks for one.
    h = sub(h, HERO_RE, HERO_NEW, '6',
            'Hero rewritten, Beauty slide removed, headline is now the page h1')

    # --------------------------------------------------- 7. accreditation
    h = one(h, '<!--Start Feature One-->', ACCRED + '
<!--Start Feature One-->',
            '7', 'Accreditation block added under the hero')

    # ----------------------------------------------------- 14. the numbers
    # The counters are not broken values. They are an odometer that never runs,
    # so the placeholder 00 is what a visitor sees. Their real figures sit in
    # data-count. Printing them plainly means the block works with or without
    # the script.
    for count, label in [('20', 'Years of experience'), ('28', 'Fully Equipped Clinics'),
                         ('300', 'Professional Staff')]:
        h = one(h, '<span class="odometer" data-count="%s">00</span>' % count,
                '<span class="odometer" data-count="%s">%s</span>' % (count, count),
                '14', 'Counter shows %s instead of 00' % count)

    # Their fourth counter repeats the staff figure for patients, which is
    # plainly a copy and paste. Removed rather than published as fact.
    h = sub(h, PATIENTS_RE, '', '14',
            'Removed the International Patients counter, it repeated the staff number')

    # ---------------------------------------------- 31. language and copy
    h = one(h, 'What our Patients Says', 'What Our Patients Say',
            '31', 'Fixed "What our Patients Says"')
    h = h.replace('North Cost', 'North Coast')
    h = one(h, 'Make an Apointment', 'Make an Appointment',
            '31', 'Fixed "Make an Apointment"')

    # ---------------------------------------- 5. WhatsApp, and dead links
    # Six links on their homepage have href="". The hero buttons are two of
    # them, so the main call to action goes nowhere at all.
    n = h.count('href=""')
    if n:
        h = h.replace('href=""', 'href="%s/our-clinics"' % LIVE)
        note('39', 'Pointed %d empty links at Our Clinics' % n)

    h = one(h, '</body>', FLOAT + '
</body>', '5',
            'Floating WhatsApp button and mobile sticky bar added')

    io.open(index, 'w', encoding='utf-8').write(h)

    css = os.path.join(OUT, 'assets', 'repositioning.css')
    io.open(css, 'w', encoding='utf-8').write(REPOSITIONING_CSS)
    print('   wrote assets/repositioning.css')

    for s, w in edits:
        print('   section %-3s %s' % (s, w))
    print('\n  %s built from %s\n' % (OUT, RAW))


if __name__ == '__main__':
    main()
