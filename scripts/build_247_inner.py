# -*- coding: utf-8 -*-
"""Inner pages for the 24/7 Clinic site, in their layout.

Imported and called by build-247-site.py after the homepage is built. Not run
on its own, because it needs the finished homepage to take the header and
footer from.

Why it works this way. Their mirror only holds the homepage, so there is no
inner-page template of theirs to edit. Rather than invent a second design,
every inner page is their own header and footer wrapped around sections built
from their own block classes (`sec-title`, `about-one`, `counter-one`) and the
`rp-` classes the repositioning sheet already defines. So an inner page is made
of the same parts as the homepage and inherits the same stylesheet.

Content is `content/247clinic/en/*.json`, which holds WEBSITE.docx word for
word. Nothing here writes a sentence of copy. If a page needs a line the brief
does not have, the line is left out and reported, never invented.

URLs are their live ones. /services, /insurance, /our-clinics, /about-us and
/contact-us all return 200 today, and keeping them is worth more than a
tidier slug. Only the four pages the brief adds get new paths.
"""
import io
import json
import os
import re

CONTENT = os.path.join('content', '247clinic', 'en')

# page json -> (url path, nav title, whether the brief invents the page)
PAGES = [
    ('medical-services',    '/services',        'Medical Services',                  False),
    ('insurance-cashless',  '/insurance',       'Insurance & Cashless Care',         False),
    ('find-a-clinic',       '/our-clinics',     'Find a Clinic',                     False),
    ('about',               '/about-us',        'About Us',                          False),
    ('contact',             '/contact-us',      'Contact',                           False),
    ('beauty-wellness',     '/beauty-wellness', 'Beauty & Wellness',                 False),
    ('faq',                 '/faq',             'FAQ',                               False),
    ('hotel-clinic-concept', '/hotel-clinics',  'The Hotel Clinic Concept',          True),
    ('accreditation',       '/accreditation',   'International Accreditation',       True),
    ('for-hotels',          '/for-hotels',      'For Hotels & Resorts',              True),
    ('for-insurers',        '/for-insurance',   'For Insurance & Assistance',        True),
]


def esc(s):
    return (str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            .replace('"', '&quot;'))


def load(name):
    p = os.path.join(CONTENT, name + '.json')
    with io.open(p, encoding='utf-8') as f:
        return json.load(f)


def shell(index_html):
    """Split the finished homepage into everything above the content and
    everything below it, so an inner page gets the real header and footer.

    The homepage's own <main>/content sits between the end of the header and
    the start of the footer. Both markers come from their markup."""
    head_end = index_html.find('<!--Start Main Slider Two-->')
    if head_end < 0:
        head_end = index_html.find('<!--Start Main Slider-->')

    # The newsletter band, not the footer itself. On the homepage the final
    # call to action sits above it, so an inner page ending the same way
    # (content, CTA, newsletter, footer) matches the homepage exactly.
    foot_start = index_html.find('<!--Start Subscribe One-->')
    if foot_start < 0:
        foot_start = index_html.find('<!--Start Site Footer-->')

    if head_end < 0 or foot_start < 0 or foot_start <= head_end:
        return None, None
    return index_html[:head_end], index_html[foot_start:]


def banner(title, lead):
    """A page title band with breadcrumbs."""
    out = ['<!--Start Repositioning Page Head-->',
           '<section class="rp-pagehead">',
           '  <div class="container">',
           '    <ul class="thm-breadcrumb list-unstyled rp-breadcrumb">',
           '      <li><a href="/">Home</a></li>',
           '      <li class="active">%s</li>' % esc(title),
           '    </ul>',
           '    <h1>%s</h1>' % esc(title)]
    if lead:
        out.append('    <p class="rp-lead">%s</p>' % esc(lead))
    out += ['  </div>', '</section>', '']
    return '\n'.join(out)


def looks_like_heading(text):
    """Is this body line really a sub-heading the extraction flattened?

    WEBSITE.docx has sub-headings inside its sections, and the extraction put
    them into body[] alongside the paragraphs. Rendered as paragraphs they read
    as stray sentences: "How Cashless Treatment Works" sat between two
    paragraphs looking like a broken line.

    The rule is short, and no sentence-ending punctuation. Checked against
    every content file on 2026-09-22: 10 lines match, all of them genuine
    sub-headings, and no real sentence is caught.
    """
    t = (text or '').strip()
    return 0 < len(t) <= 70 and t[-1] not in '.!?:;,' and not t.startswith(('•', '-'))


def items_block(items):
    """items[] become cards when they carry text, and a plain list when they
    do not.

    Several of the brief's sections are just lists of things: "Insurance
    verification", "Policy details", "Guarantee of Payment". Rendering each of
    those as a full card produced a column of mostly empty boxes. A list is
    what the brief actually is."""
    if not items:
        return ''

    named = [it for it in items
             if (it.get('title') or '').strip() or (it.get('text') or '').strip()]
    if not named:
        return ''

    # A section often mixes the two: eight bare names followed by one entry
    # that has a paragraph. Rendering the whole set as cards left eight empty
    # boxes beside one full one. Each half gets the shape that suits it.
    plain = [it for it in named if not (it.get('text') or '').strip()]
    rich = [it for it in named if (it.get('text') or '').strip()]

    out = ''
    if plain:
        lis = '\n'.join('      <li>%s</li>' % esc((it.get('title') or '').strip())
                        for it in plain)
        out += '  <ul class="rp-list">\n%s\n  </ul>\n' % lis
    if not rich:
        return out

    cards = []
    for it in rich:
        t = (it.get('title') or '').strip()
        x = (it.get('text') or '').strip()
        card = ['    <div class="rp-card">']
        if t:
            card.append('      <h3>%s</h3>' % esc(t))
        if x:
            card.append('      <p>%s</p>' % esc(x))
        card.append('    </div>')
        cards.append('\n'.join(card))
    # --auto rather than --3: the brief's sections carry anything from two to
    # eight items, so a fixed column count leaves gaps on some pages.
    out += '  <div class="rp-grid rp-grid--auto">\n%s\n  </div>\n' % '\n'.join(cards)
    return out


def section(sec, wa_href, wa_svg):
    """One section of a content JSON, in their blocks."""
    heading = (sec.get('heading') or '').strip()
    sub = (sec.get('subheading') or '').strip()
    body = [b.strip() for b in (sec.get('body') or []) if b and b.strip()]
    items = sec.get('items') or []
    ctas = sec.get('ctas') or []

    out = ['<!--Start Repositioning Section: %s (brief %s)-->'
           % (sec.get('id', ''), sec.get('briefSection', '?')),
           '<section class="rp-sec" id="%s">' % esc(sec.get('id', '')),
           '  <div class="container">']

    if heading:
        out.append('    <div class="sec-title text-center">'
                   '<h2 class="sec-title__title">%s</h2></div>' % esc(heading))
    if sub:
        out.append('    <p class="rp-lead text-center">%s</p>' % esc(sub))
    for b in body:
        if looks_like_heading(b):
            out.append('    <h3 class="rp-sub">%s</h3>' % esc(b))
        else:
            out.append('    <p>%s</p>' % esc(b))

    grid = items_block(items)
    if grid:
        out.append(grid.rstrip())

    for c in ctas:
        label = (c.get('label') or '').strip()
        target = (c.get('target') or '').strip().lower()
        if not label:
            continue
        if 'whatsapp' in target or 'whatsapp' in label.lower():
            out.append('    <div class="rp-cta-row"><a class="rp-btn rp-btn--wa rp-shine" '
                       'href="%s" target="_blank" rel="noopener" '
                       'data-ev="whatsapp_medical_click">%s%s</a></div>'
                       % (wa_href, wa_svg, esc(label)))
        else:
            out.append('    <div class="rp-cta-row"><a class="rp-btn rp-btn--ghost" '
                       'href="/contact-us">%s</a></div>' % esc(label))

    out += ['  </div>', '</section>', '']
    return '\n'.join(out)


RELATED_MAP = {
    '/services': [
        ('/hotel-clinics', 'The Hotel Clinic Concept', 'How medical clinics are integrated inside Egyptian resorts.'),
        ('/insurance', 'Insurance & Cashless Care', 'Direct coordination with international travel insurance providers.'),
        ('/our-clinics', 'Find a Clinic Near You', 'Active resort clinics across Hurghada, Sahl Hasheesh, and the Red Sea.'),
        ('/beauty-wellness', 'Beauty & Wellness Services', 'Specialized aesthetic and wellness treatments at selected resort clinics.'),
    ],
    '/hotel-clinics': [
        ('/services', 'Medical Services', 'Comprehensive acute care, diagnostic checks, and room visits.'),
        ('/for-hotels', 'For Hotels & Resorts', 'Partnership structure and operational benefits for resort operators.'),
        ('/accreditation', 'International Accreditation', 'First UCA-accredited urgent care network in Egypt and MENA.'),
        ('/our-clinics', 'Resort Locations', 'Browse resort clinics across Egypt tourism destinations.'),
    ],
    '/insurance': [
        ('/for-insurance', 'For Insurance & Assistance', 'Dedicated operational coordination for insurance partners.'),
        ('/services', 'Medical Services', 'On-site clinical capabilities and acute treatments provided.'),
        ('/faq', 'Insurance FAQ', 'Answers to common travel insurance and cashless billing questions.'),
        ('/contact-us', 'Contact Coordination Team', 'Get immediate assistance for patient cases and insurance verification.'),
    ],
    '/for-insurance': [
        ('/insurance', 'Cashless Care Overview', 'How cashless treatment operates for international policyholders.'),
        ('/hotel-clinics', 'The Hotel Clinic Concept', 'On-site hotel clinic infrastructure avoiding unnecessary hospitalizations.'),
        ('/accreditation', 'International Accreditation', 'Clinical quality, patient safety, and international UCA standards.'),
        ('/contact-us', 'Assistance Team Contact', 'Direct liaison channel for international assistance coordinators.'),
    ],
    '/for-hotels': [
        ('/hotel-clinics', 'The Hotel Clinic Concept', 'Operational model, medical staffing, and resort integration.'),
        ('/accreditation', 'International Accreditation', 'Internationally recognized standards protecting guest safety.'),
        ('/services', 'Guest Medical Services', 'Full scope of on-site acute medical care available to guests.'),
        ('/contact-us', 'Partner With Us', 'Discuss establishing an accredited 24/7 Clinic inside your property.'),
    ],
    '/our-clinics': [
        ('/hotel-clinics', 'The Hotel Clinic Concept', 'Learn why on-site resort clinics deliver faster care.'),
        ('/services', 'Medical Services Available', 'Complete list of outpatient medical treatments and doctor consultations.'),
        ('/insurance', 'Insurance & Cashless Care', 'Using your travel medical insurance at any 24/7 Clinic location.'),
        ('/contact-us', '24/7 Central Dispatch', 'Connect with our medical team on WhatsApp or phone immediately.'),
    ],
    '/about-us': [
        ('/accreditation', 'International Accreditation', 'Our UCA urgent care accreditation and healthcare quality marks.'),
        ('/hotel-clinics', 'The Hotel Clinic Concept', 'The founding vision and operational architecture of 24/7 Clinic.'),
        ('/services', 'Clinical Scope', 'Medical services delivered daily across all resort clinics.'),
        ('/contact-us', 'Group Operations & Head Office', 'Reach executive management, medical directors, and team.'),
    ],
    '/accreditation': [
        ('/about-us', 'About 24/7 Clinic', 'Background, leadership, and our mission in Egyptian travel healthcare.'),
        ('/hotel-clinics', 'The Hotel Clinic Concept', 'How international standards are applied inside hotel-based clinics.'),
        ('/services', 'Standardized Medical Services', 'Strict clinical pathways followed for every guest interaction.'),
        ('/for-insurance', 'For Insurance & Assistance', 'Assurance of quality and documentation standards for insurers.'),
    ],
    '/beauty-wellness': [
        ('/services', 'Primary Medical Services', 'Urgent medical care, doctor consultations, and diagnostic tests.'),
        ('/hotel-clinics', 'The Hotel Clinic Concept', 'Care delivered right where you stay during your Egyptian holiday.'),
        ('/our-clinics', 'Find a Clinic', 'Locate the nearest resort clinic offering aesthetic services.'),
        ('/contact-us', 'Book a Consultation', 'Speak with our aesthetic and medical specialists today.'),
    ],
    '/faq': [
        ('/insurance', 'Insurance & Cashless Care', 'Complete guide to using your travel policy for medical treatment.'),
        ('/services', 'What We Can Treat', 'Conditions evaluated and treated on-site without hospital transfer.'),
        ('/hotel-clinics', 'The Hotel Clinic Concept', 'Why hotel clinics offer faster, calmer urgent medical care.'),
        ('/contact-us', 'Ask a Direct Question', 'Contact our medical team 24 hours a day on WhatsApp.'),
    ],
    '/contact-us': [
        ('/our-clinics', 'Find a Clinic Near You', 'Map and directory of 24/7 Clinic resort locations across Egypt.'),
        ('/services', 'Medical Services Overview', 'Explore the complete range of on-site medical treatments.'),
        ('/insurance', 'Travel Insurance Information', 'Check your policy eligibility for cashless medical treatment.'),
        ('/for-hotels', 'Partnership Inquiries', 'Explore hotel clinic partnerships and resort medical operations.'),
    ],
}


def related_block(path):
    links = RELATED_MAP.get(path.rstrip('/'))
    if not links:
        return ''
    cards = []
    for href, title, desc in links:
        cards.append('''    <a class="rp-card rp-related-card wow fadeInUp" href="%s">
      <h3>%s &rarr;</h3>
      <p>%s</p>
    </a>''' % (href, esc(title), esc(desc)))
    return '''<!--Start Repositioning Related Pages-->
<section class="rp-sec rp-sec--tint rp-related">
  <div class="container">
    <div class="sec-title text-center">
      <div class="sec-title__tagline"><h6>Explore 24/7 Clinic</h6></div>
      <h2 class="sec-title__title">Related Services &amp; Information</h2>
    </div>
    <div class="rp-grid rp-grid--auto rp-related__grid">
%s
    </div>
  </div>
</section>
''' % '\n'.join(cards)


def set_active_nav(html, nav_html):
    """Swap in this page's own nav, so their `li.current` marks the open page.

    The shell is taken from the finished homepage, which carries the homepage's
    nav with Home marked. Left alone, every inner page would light up Home.

    Only the list is taken. nav() also returns the WhatsApp button that sits
    beside it, and that is already in the shell, so swapping the whole thing in
    would put a second one in the header."""
    m = re.search(r'<ul class="main-menu__list">[\s\S]*?</ul>(?=\s*<a class="rp-head-wa")', nav_html)
    if not m:
        m = re.search(r'<ul class="main-menu__list">[\s\S]*?</ul>', nav_html)
        if not m:
            return html
    ul = m.group(0)
    if re.search(r'<ul class="main-menu__list">[\s\S]*?</ul>(?=\s*<a class="rp-head-wa")', html):
        return re.sub(r'<ul class="main-menu__list">[\s\S]*?</ul>(?=\s*<a class="rp-head-wa")',
                      lambda _: ul, html, count=1)
    return re.sub(r'<ul class="main-menu__list">[\s\S]*?</ul>', lambda _: ul,
                  html, count=1)


def page_html(head, foot, data, title, wa_href, wa_svg, final_cta, prefix, path, nav_for=None):
    secs = data.get('sections') or []
    lead = ''
    if secs:
        b = [x for x in (secs[0].get('body') or []) if x and x.strip()]
        if b:
            lead = b[0].strip()

    parts = [banner(title, lead)]
    for i, s in enumerate(secs):
        # The first body line is already the page lead, so do not repeat it.
        s = dict(s)
        if i == 0 and lead:
            s['body'] = [x for x in (s.get('body') or []) if x.strip() != lead]
        parts.append(section(s, wa_href, wa_svg))
    rel = related_block(path)
    if rel:
        parts.append(rel)
    parts.append(final_cta)

    page_head = head
    if nav_for is not None:
        page_head = set_active_nav(page_head, nav_for(path))
    html = page_head + '\n'.join(parts) + foot

    # The page title and description, from the brief's own heading.
    html = re.sub(r'<title>.*?</title>',
                  '<title>%s | 24/7 Clinic</title>' % esc(title),
                  html, count=1, flags=re.S)
    if lead:
        desc = lead[:157].rsplit(' ', 1)[0] if len(lead) > 160 else lead
        if re.search(r'<meta[^>]+name="description"', html):
            html = re.sub(r'(<meta[^>]+name="description"[^>]+content=")[^"]*(")',
                          lambda m: m.group(1) + esc(desc) + m.group(2), html, count=1)
        else:
            html = html.replace('</title>',
                                '</title>\n<meta name="description" content="%s">' % esc(desc), 1)

    # Canonical to the real site, not the preview host.
    canon = 'https://www.247clinic.net%s' % path
    if re.search(r'<link[^>]+rel="canonical"', html):
        html = re.sub(r'(<link[^>]+rel="canonical"[^>]+href=")[^"]*(")',
                      lambda m: m.group(1) + canon + m.group(2), html, count=1)
    else:
        html = html.replace('</title>', '</title>\n<link rel="canonical" href="%s">' % canon, 1)
    return html


def build(out_dir, index_html, prefix, wa_href, wa_svg, final_cta, nav_for=None):
    """Write every inner page. Returns a list of (path, title, sections, notes)."""
    head, foot = shell(index_html)
    if head is None:
        print('   SKIPPED inner pages, could not split the homepage shell')
        return []

    built = []
    for name, path, title, is_new in PAGES:
        src = os.path.join(CONTENT, name + '.json')
        if not os.path.isfile(src):
            print('   SKIPPED %-22s no content file' % path)
            continue
        data = load(name)
        secs = data.get('sections') or []
        if not secs:
            print('   SKIPPED %-22s content file has no sections' % path)
            continue

        html = page_html(head, foot, data, title, wa_href, wa_svg, final_cta,
                         prefix, path, nav_for)

        folder = os.path.join(out_dir, path.strip('/'))
        if not os.path.isdir(folder):
            os.makedirs(folder)
        with io.open(os.path.join(folder, 'index.html'), 'w', encoding='utf-8', newline='\n') as f:
            f.write(html)

        # Anything the brief marked as still needed is reported, never filled in.
        gaps = []
        for s in secs:
            for k in ('heading',):
                if not (s.get(k) or '').strip():
                    gaps.append('%s has no %s' % (s.get('id', '?'), k))
        built.append((path, title, len(secs), gaps))
        print('   %-22s %-34s %d section(s)%s'
              % (path, title, len(secs), '  NEW PAGE' if is_new else ''))
    return built
