# -*- coding: utf-8 -*-
"""Build the 24/7 Clinic website preview from the mirrored live site.

    python scripts/mirror-247-site.py   download the live homepage into .work/mirror
    python scripts/fill-247-site.py     fetch anything it references that was missed
    python scripts/build-247-site.py    ->  src/247site
    node build.js                       ->  dist/247clinic/website-preview

Their brief, section 2: "We do NOT want a complete redesign. The objective is to
keep as much of the current layout and existing website blocks as possible."

So this does not rebuild their site. It takes their real homepage, with their
own stylesheet, script bundle and images, and applies the brief to it.
Everything is reproducible: re-mirror, re-run, and the same edits land on a
fresh copy. Nothing is hand-edited in src/247site, because a hand edit would be
lost the next time their site is pulled down.

Order matters. Content edits run first, on their pristine markup, so every
anchor below matches what their server actually sends. Path rewriting runs
last, over every file.

Every visual change rides in assets/repositioning.css, loaded after their
bundle. Their 576 KB bundle.min.css is never edited.

All copy is their brief's, word for word. Each edit is tagged with the section
it comes from, so any change can be checked against the document.
"""
import io
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

RAW = os.path.join('.work', 'mirror')
OUT = os.path.join('src', '247site')
PREFIX = '/247clinic/website-preview'
LIVE = 'https://www.247clinic.net'
DEMO = 'https://hcig-passport.vercel.app/247clinic/hotel-landing-pages'

# Their WhatsApp number as used on the landing pages. Still shared by every
# clinic; a per-clinic number is an open item.
WA_NUMBER = '201222228247'

# Section 38, the homepage message; section 5, the insurance message.
WA_HOME = 'Hello, I need medical assistance through the 24/7 Clinic website.'
WA_INSURANCE = ('Hello, I need medical assistance and would like to check whether '
                'my travel insurance can be used for cashless treatment.')

# Pages that exist on their live site but not in this preview. Their links are
# sent to the live site so nothing 404s. As a page gets built here it moves out
# of this list and into MIRRORED below, or the preview would send a visitor off
# to the old version of a page we have just rewritten.
NOT_MIRRORED = [
    '/blog', '/faqs', '/article/',
]

# Built by build_247_inner.py. Their links stay inside the preview.
MIRRORED = [
    '/services', '/insurance', '/our-clinics', '/about-us', '/contact-us',
    '/beauty-wellness', '/faq', '/hotel-clinics', '/accreditation',
    '/for-hotels', '/for-insurance',
]

edits = []


def wa(message):
    return 'https://wa.me/%s?text=%s' % (WA_NUMBER, urllib.parse.quote(message))


def note(section, what):
    edits.append((section, what))


def icons():
    """The same outline icons the landing pages use, read from data.js."""
    out = subprocess.run(
        ['node', '-e', "process.stdout.write(JSON.stringify(require('./scripts/lp/data').ICON))"],
        capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


ICON = {}


def svg(name, cls='rp-ico'):
    return ('<svg class="%s" viewBox="0 0 24 24" aria-hidden="true">%s</svg>'
            % (cls, ICON[name]))


def one(html, old, new, section, what):
    if old not in html:
        print('   SKIPPED, anchor not found: %s' % what)
        return html
    note(section, what)
    return html.replace(old, new, 1)


def sub(html, pattern, new, section, what, count=1):
    out, n = re.subn(pattern, new, html, count=count)
    if not n:
        print('   SKIPPED, no match: %s' % what)
        return html
    note(section, what)
    return out


def between(html, start, end, new, section, what):
    """Replace everything from marker start up to, not including, marker end."""
    a = html.find(start)
    b = html.find(end, a + 1) if a >= 0 else -1
    if a < 0 or b < 0:
        print('   SKIPPED, markers not found: %s' % what)
        return html
    note(section, what)
    return html[:a] + new + html[b:]


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
    # Longest first, so /for-insurance is not caught by a shorter prefix.
    for page in sorted(MIRRORED, key=len, reverse=True):
        text = text.replace('href="%s"' % page, 'href="%s%s/"' % (PREFIX, page))
    # Keep preview internal: links to root "/" (e.g. logos, Home links) stay inside the preview root.
    text = re.sub(r'href=[\'"]/[\'"](?=[\s>])', 'href="%s/"' % PREFIX, text)
    return text


# ---------------------------------------------------------------- the blocks

NAV_STRUCTURE = [
    ('/', 'Home', []),
    ('/services', 'Medical Services', [
        ('/services', 'Medical Services'),
        ('/hotel-clinics', 'The Hotel Clinic Concept'),
        ('/beauty-wellness', 'Beauty & Wellness'),
    ]),
    ('/insurance', 'Insurance & Cashless', [
        ('/insurance', 'Insurance & Cashless Care'),
        ('/for-insurance', 'For Insurance & Assistance'),
    ]),
    ('/our-clinics', 'Find a Clinic', []),
    ('/for-hotels', 'For Hotels & Partners', []),
    ('/about-us', 'About Us', [
        ('/about-us', 'About Us'),
        ('/accreditation', 'International Accreditation'),
        ('/faq', 'FAQ'),
    ]),
    ('/contact-us', 'Contact', []),
]


def nav(current='/'):
    """Section 4. Main navigation interlinking all 12 pages.

    Dropdown submenus group related services, insurance options, and about
    pages so all 12 pages are reachable directly from the header without
    overflowing the row.

    `current` marks the open page and its parent with their own `li.current`
    class, which their stylesheet already colours.
    """
    cur = (current or '/').rstrip('/') or '/'
    lis = []
    for h, t, children in NAV_STRUCTURE:
        href = (PREFIX + '/') if h == '/' else h
        if children:
            child_hrefs = [c[0].rstrip('/') or '/' for c in children]
            is_parent_active = (cur == (h.rstrip('/') or '/')) or (cur in child_hrefs)
            pcls = 'dropdown' + (' current' if is_parent_active else '')
            sub_lis = []
            for ch, ct in children:
                ccls = ' class="current"' if (ch.rstrip('/') or '/') == cur else ''
                sub_lis.append('<li%s><a href="%s">%s</a></li>' % (ccls, ch, ct.replace('&', '&amp;')))
            sub_html = '\n'.join(sub_lis)
            lis.append('<li class="%s"><a href="%s">%s</a>\n<ul>\n%s\n</ul>\n</li>'
                       % (pcls, href, t.replace('&', '&amp;'), sub_html))
        else:
            cls = ' class="current"' if (h.rstrip('/') or '/') == cur else ''
            lis.append('<li%s><a href="%s">%s</a></li>' % (cls, href, t.replace('&', '&amp;')))
    lis = '\n'.join(lis)
    return ('<ul class="main-menu__list">\n%s\n</ul>\n'
            '<a class="rp-head-wa" href="%s" target="_blank" rel="noopener" data-ev="whatsapp_medical_click">'
            '%s<span class="rp-long">WhatsApp Us 24/7</span><span class="rp-short">Need a Doctor?</span></a>'
            % (lis, wa(WA_HOME), svg('wa')))


FILM = 'https://hcig-passport.vercel.app/assets/'
PLAY = '<svg class="rp-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>'


def hero_slide(bg, tagline, title, text, btn1, btn2, film=None, trust=False):
    """One slide in their own markup, so their styles and their entrance
    motion apply unchanged. Every word is the brief's."""
    video = ('<video class="rp-hero-film" src="%s%s" autoplay muted loop playsinline preload="metadata" '
             'aria-hidden="true"></video>' % (FILM, film)) if film else ''
    trust_html = ('<p class="rp-trust"><img src="/assets/accreditation/c7acc-uca.png" alt="Urgent Care Association" '
                  'width="44" height="44">Internationally Accredited Urgent Care Network</p>') if trust else ''
    return """<!--Start Main Slider Two Single-->
                <div class="main-slider-two__single">
                    <div class="image-layer" style="background-image:url('%s')"></div>
                    %s
                    <div class="rp-hero-shade"></div>
                    <div class="shape3"><img src="/assets/images/shapes/main-slider-v2-shape2.webp" alt=""></div>
                    <div class="shape4"><img src="/assets/images/shapes/main-slider-v2-shape3.webp" alt=""></div>
                    <div class="container">
                        <div class="main-slider-two__single-inner">
                            <div class="main-slider-two__content">
                                <div class="tagline"><div class="border-box"></div><div class="text-box"><p>%s</p></div></div>
                                <div class="title">%s</div>
                                <p class="rp-hero-text">%s</p>
                                <div class="main-slider-one__content-btn">
                                    <div class="btn-one">%s</div>
                                    <div class="btn-two">%s</div>
                                </div>
                                %s
                            </div>
                            <div class="main-slider-two__video">
                                <a class="video-popup" href="https://www.youtube.com/watch?v=G8xUK_jtO5s" aria-label="Play the 24/7 Clinic film">
                                    <div class="main-slider-two__video-icon"><span class="icon-play"></span><i class="ripple"></i></div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
""" % (bg, video, tagline, title, text, btn1, btn2, trust_html)


def hero_slides():
    """Section 6 first, then the brief's two strongest messages, sections 8 and
    11, in their slider as their homepage always had three slides."""
    wa_btn = ('<a class="thm-btn rp-wa-btn" href="%s" target="_blank" rel="noopener" data-ev="whatsapp_medical_click">'
              '%sWhatsApp Us 24/7</a>' % (wa(WA_HOME), svg('wa')))
    return ''.join([
        hero_slide('/assets/rp/hero-room.webp',
                   '24/7 Medical Care &bull; Cashless Insurance &bull; Multilingual Support',
                   '<h1>Urgent Medical Care. Right Inside Your Hotel.</h1>',
                   '24/7 Clinic operates a network of on-site urgent care clinics inside hotels and resorts across Egypt&rsquo;s leading tourist destinations, giving international travelers fast access to medical care without unnecessary hospital visits.',
                   wa_btn, '<a href="#rp-find">Find Your Clinic</a>', film='v-commercial.mp4', trust=True),
        hero_slide('/assets/rp/resort.webp',
                   'On-Site Hotel Clinics',
                   '<h2>Medical Care Without Leaving Your Resort</h2>',
                   '24/7 Clinic brings urgent and primary medical care directly into hotels and resorts, allowing international guests to receive medical consultation, diagnostics and treatment close to their hotel room.',
                   '<a class="thm-btn" href="#rp-find">Find a Clinic</a>', '<a href="/services">View All Medical Services</a>'),
        hero_slide('/assets/rp/hero-insurance.webp',
                   'Cashless Treatment',
                   '<h2>Travelling With Medical Insurance?</h2>',
                   'Where insurance approval and policy conditions allow, we can arrange cashless medical treatment, meaning the patient may not need to pay the full medical cost upfront and claim it back later.',
                   '<a class="thm-btn rp-wa-btn" href="%s" target="_blank" rel="noopener" data-ev="whatsapp_insurance_click">%sCheck Your Insurance on WhatsApp</a>' % (wa(WA_INSURANCE), svg('wa')),
                   '<a href="/insurance">Learn About Insurance &amp; Cashless Care</a>'),
    ])

def accreditation():
    """Section 7. The CTA to an accreditation page is left out: that page is
    Phase 2 and does not exist, and a button to nowhere is worse than none.

    Two different statuses sit here and they are kept visibly apart.

    Accreditation: the UCA sentence, word for word from their brief.

    Partnership: HCIG is an Official Partner of Global Healthcare Accreditation
    and of the German Medical Wellness Association (references/compliance.md).
    That is not accreditation. Placing those two marks under an "Accredited"
    heading would upgrade partner into accredited, which is a misrepresentation
    the issuing bodies notice. So they sit under their own label, in the exact
    permitted wording."""
    points = ''.join('<li>%s%s</li>' % (svg('check'), t) for t in
                     ['International Standards', 'Patient Safety', 'Clinical Quality', 'Operational Excellence'])

    def mark(f, alt, cap, shape):
        return ('<figure class="rp-mark rp-mark--%s"><img src="%s/assets/accreditation/%s" alt="%s" loading="lazy">'
                '<figcaption>%s</figcaption></figure>' % (shape, PREFIX, f, alt, cap))

    accredited = mark('c7acc-uca.png', 'Urgent Care Association, Egypt and MENA', 'Urgent Care Association', 'round')
    partners = (mark('c7acc-gha.png', 'Global Healthcare Accreditation', 'Global Healthcare Accreditation&trade;', 'wide')
                + mark('c7acc-gmwa.png', 'German Medical Wellness Association', 'German Medical Wellness Association', 'round'))
    return '''<!--Start Repositioning Accreditation-->
<section class="rp-acc">
    <div class="container rp-acc__in">
        <div class="rp-acc__body">
            <h2>Internationally Accredited Urgent Care</h2>
            <p>24/7 Clinic is the first international urgent care network outside the United States to achieve accreditation through the Urgent Care Association and CAUCQ.</p>
            <ul class="rp-ticks">%s</ul>
            <div class="rp-cta-row rp-cta-row--left"><a class="rp-link" href="/accreditation">Learn more about our international accreditation &rarr;</a></div>
        </div>
        <div class="rp-acc__marks">
            <div class="rp-acc__group"><p class="rp-acc__label">Accredited through</p><div class="rp-acc__row">%s</div></div>
            <div class="rp-acc__group"><p class="rp-acc__label">Healthcare International Group is an Official Partner of</p><div class="rp-acc__row">%s</div></div>
        </div>
    </div>
</section>
''' % (points, accredited, partners)


def why_hotel():
    """Section 9, four cards, beside their film of where the clinic is in the
    hotel. Video as video, lazy, muted, never a still cut from it."""
    cards = [
        ('pin', 'Inside Your Resort', 'No need to search for an unfamiliar medical facility in another part of the city.'),
        ('clock', 'Fast Access to Medical Care', 'Our hotel-based model gives travelers direct access to medical support where they are staying.'),
        ('stethoscope', 'Treatment On-Site', 'Many common urgent and primary care conditions can be assessed and treated without a hospital visit.'),
        ('hospital', 'Hospital Transfer Only When Needed', 'If higher-level care is required, our team coordinates the appropriate hospital, ambulance or next medical step.'),
    ]
    body = ''.join('<div class="rp-card rp-spot wow fadeInUp" data-wow-delay="%.1fs"><i class="rp-x rp-x--a"></i><i class="rp-x rp-x--b"></i>'
                   '<span class="rp-card__i">%s</span><h3>%s</h3><p>%s</p></div>'
                   % (0.1 + k * 0.1, svg(i), t, d) for k, (i, t, d) in enumerate(cards))
    return """<!--Start Repositioning Why Hotel-->
<section class="rp-sec rp-sec--tint rp-why">
    <div class="container">
        <div class="sec-title text-center"><h2 class="sec-title__title">Why Leave Your Hotel When Medical Care Is Already There?</h2></div>
        <div class="rp-why__in">
            <div class="rp-reel wow fadeInLeft" data-wow-delay="0.1s">
                <video class="rp-lazy" data-src="%sv-intro.mp4" muted loop playsinline preload="none" aria-label="Where the 24/7 Clinic is inside the hotel"></video>
                <button class="rp-watch" type="button" data-film="%sv-intro.mp4" aria-label="Watch: where the clinic is inside the hotel">%sWatch</button>
            </div>
            <div class="rp-grid rp-grid--2 rp-snap">%s</div>
        </div>
        <div class="rp-cta-row"><a class="thm-btn" href="/hotel-clinics">Explore The Hotel Clinic Concept</a></div>
    </div>
</section>
""" % (FILM, FILM, PLAY, body)

def services():
    """Section 10, six services, in their own Services One block: photo, icon
    badge, title, Learn More. The brief's text goes under each title.
    Photos: their own IV photo, and Pexels for the rest (src/assets/CREDITS.md)."""
    items = [
        ('c7n-urgent.webp', 'call-sos', 'Urgent Medical Care', 'Assessment and treatment of sudden illness, fever, infections, gastrointestinal conditions, dehydration, respiratory problems and other urgent conditions.'),
        ('c7n-injury.webp', 'first-aid-kit', 'Injuries &amp; Minor Procedures', 'Treatment of wounds, burns, sprains, minor trauma, dressings, suturing and other minor procedures where clinically appropriate.'),
        ('c7n-lab.webp', 'medical-screen', 'Diagnostics &amp; Laboratory Tests', 'Medical assessment with access to laboratory tests and diagnostic services when required.'),
        (None, 'heart', 'IV Therapy &amp; Medication', 'Doctor-prescribed medication, injections and IV therapy when medically indicated.'),
        ('c7n-specialist.webp', 'doctor', 'Specialist Consultation', 'Access to specialist physicians and coordinated consultations where further medical assessment is required.'),
        ('c7n-roomvisit.webp', 'paramedic', 'Hotel Room Doctor Visit', 'When appropriate, a doctor visit can be arranged directly in the guest&rsquo;s hotel room.'),
    ]
    cards = []
    for k, (img, icon, title, text) in enumerate(items):
        src = '/assets/rp/%s' % (img or 'svc-iv.webp')
        alt = title.replace('&amp;', 'and')
        cards.append("""<div class="col-xl-4 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="%.1fs">
    <div class="services-one__single rp-svc">
        <div class="services-one__single-img">
            <a href="/services" class="inner"><img src="%s" alt="%s" loading="lazy"></a>
            <div class="services-one__single-img-icon"><div class="services-one__single-img-icon-inner">
                <svg width="34" height="34"><use xlink:href="/assets/images/svg/master.svg#%s" stroke="white"></use></svg>
            </div></div>
        </div>
        <div class="services-one__single-content clearfix">
            <div class="btn-box"><a href="/services"><div class="text-box">Learn More</div><div class="icon-box"><span class="icon-arrow-right1"></span></div></a></div>
            <div class="services-one__single-content-inner">
                <h2><a href="/services">%s</a></h2>
                <p class="rp-svc__text">%s</p>
            </div>
        </div>
    </div>
</div>""" % (0.1 + (k % 3) * 0.15, src, alt, icon, title, text))
    return """<!--Start Services One-->
<section class="services-one rp-services">
    <div class="container">
        <div class="sec-title text-center">
            <div class="sec-title__tagline"><h6>Our Services</h6></div>
            <h2 class="sec-title__title">What We Can Treat On-Site</h2>
        </div>
        <div class="row rp-snap rp-svc-row">%s</div>
        <div class="rp-cta-row"><a class="thm-btn" href="/services">View All Medical Services</a></div>
    </div>
</section>
""" % ''.join(cards)

def insurance():
    """Section 11 in their Banner One idea, compact: text on brand red, their
    insurance photo shown whole beside it. Cashless is never promised flat."""
    items = ['Insurance verification', 'Guarantee of Payment coordination', 'Direct communication with the insurer',
             'Medical documentation', 'Billing coordination', 'Cashless treatment where approved']
    ticks = ''.join('<li>%s%s</li>' % (svg('check'), t) for t in items)
    return """<!--Start Banner One-->
<section class="rp-sec rp-sec--tight">
    <div class="container">
        <div class="rp-ins2 wow fadeInUp" data-wow-delay="0.1s">
            <div class="rp-ins2__text">
                <h2>Travelling With Medical Insurance?</h2>
                <p class="rp-ins2__sub">We Can Coordinate Directly With Your Insurer</p>
                <p>24/7 Clinic works with international travel insurers and assistance companies worldwide.</p>
                <p>Where insurance approval and policy conditions allow, we can arrange cashless medical treatment, meaning the patient may not need to pay the full medical cost upfront and claim it back later.</p>
                <p class="rp-ins2__label">Our team can assist with:</p>
                <ul class="rp-ins2__ticks">%s</ul>
                <div class="rp-ins2__btns">
                    <a class="rp-btn rp-btn--white rp-shine" href="%s" target="_blank" rel="noopener" data-ev="whatsapp_insurance_click">%sCheck Your Insurance on WhatsApp</a>
                    <a class="rp-link rp-link--white" href="/insurance">Learn About Insurance &amp; Cashless Care</a>
                    <a class="rp-link rp-link--white" href="/for-insurance">For Insurance &amp; Assistance Partners &rarr;</a>
                </div>
            </div>
            <figure class="rp-ins2__img wow fadeInRight" data-wow-delay="0.25s">
                <img src="/assets/images/backgrounds/insurance.webp" alt="Health insurance" width="859" height="427" loading="lazy">
            </figure>
        </div>
    </div>
</section>
""" % (ticks, wa(WA_INSURANCE), svg('wa'))

def how_it_works():
    """Section 12, four steps."""
    steps = [
        ('Message Us on WhatsApp', 'Tell us your hotel, location and what happened.'),
        ('We Find the Nearest Medical Option', 'If your hotel has a 24/7 Clinic, we direct you there. If not, our coordination team identifies the most appropriate medical solution.'),
        ('We Check Your Insurance', 'Send us your insurance details and, where applicable, our team can coordinate directly with your insurer.'),
        ('Receive Medical Care', 'Treatment is provided on-site whenever clinically appropriate. If higher-level care is needed, we coordinate the next step.'),
    ]
    body = ''.join('<li class="rp-step wow fadeInUp" data-wow-delay="%.1fs"><span class="rp-step__n">%02d</span><h3>%s</h3><p>%s</p></li>'
                   % (0.15 + i * 0.2, i + 1, t, d) for i, (t, d) in enumerate(steps))
    return '''<!--Start Repositioning How It Works-->
<section class="rp-sec rp-sec--tint">
    <div class="container">
        <div class="sec-title text-center"><h2 class="sec-title__title">Getting Medical Help Is Simple</h2></div>
        <ol class="rp-steps">%s</ol>
        <div class="rp-cta-row"><a class="rp-btn rp-btn--wa rp-shine" href="%s" target="_blank" rel="noopener" data-ev="whatsapp_medical_click">Get Medical Help Now</a></div>
    </div>
</section>
''' % (body, wa(WA_HOME))


def team_films():
    """Their three team films, played muted as they scroll into view. The
    heading is an approved line from their brand guideline."""
    films = [('v-staff-1.mp4', 'The 24/7 Clinic team'), ('v-staff-2.mp4', 'The 24/7 Clinic team at work'),
             ('v-staff-3.mp4', 'Inside a 24/7 Clinic')]
    cards = ''.join("""<div class="rp-film wow fadeInUp" data-wow-delay="%.1fs">
        <video class="rp-lazy" data-src="%s%s" muted loop playsinline preload="none" aria-label="%s"></video>
        <button class="rp-watch" type="button" data-film="%s%s" aria-label="Watch: %s">%sWatch</button>
    </div>""" % (0.1 + k * 0.15, FILM, f, label, FILM, f, label, PLAY) for k, (f, label) in enumerate(films))
    return """<!--Start Repositioning Team Films-->
<section class="rp-sec rp-films">
    <div class="container">
        <div class="sec-title text-center">
            <div class="sec-title__tagline"><h6>24/7 Clinic</h6></div>
            <h2 class="sec-title__title">You&rsquo;re far from home, but not far from help.</h2>
        </div>
        <div class="rp-films__row rp-snap">%s</div>
    </div>
</section>
""" % cards


def guest_stories():
    """Their six guest films under the written reviews. Every card is the same
    portrait shape; Watch opens the film in its own shape, with sound. The rail
    advances by itself and stops for good the moment a visitor touches it."""
    films = [
        ('v-story-italy.mp4', 'it', 'Italy'),
        ('v-story-romania-family.mp4', 'ro', 'Romania'),
        ('v-story-scotland.mp4', 'gb', 'Scotland'),
        ('v-story-poland.mp4', 'pl', 'Poland'),
        ('v-story-romania-iv.mp4', 'ro', 'Romania'),
        ('v-story-scooter.mp4', None, ''),
    ]
    cards = ''.join("""<figure class="rp-story wow fadeInUp" data-wow-delay="%.2fs">
        <video class="rp-lazy" data-src="%s%s" muted loop playsinline preload="none" aria-hidden="true"></video>
        <figcaption>%s%s</figcaption>
        <button class="rp-watch" type="button" data-film="%s%s" aria-label="Watch the guest film%s">%sWatch</button>
    </figure>""" % (0.05 + k * 0.08, FILM, f,
                    ('<img src="%sc7flag-%s.svg" alt="" width="26" height="18">' % (FILM, flag)) if flag else '',
                    '<span>%s</span>' % where if where else '',
                    FILM, f, (' from %s' % where) if where else '', PLAY)
        for k, (f, flag, where) in enumerate(films))
    return """<!--Start Repositioning Guest Stories-->
<section class="rp-stories">
    <div class="container">
        <div class="rp-stories__head">
            <div class="sec-title__tagline"><h6>Patient Feedback</h6></div>
            <div class="rp-stories__nav">
                <button type="button" class="rp-arrow" data-dir="-1" aria-label="Previous">&#8592;</button>
                <button type="button" class="rp-arrow" data-dir="1" aria-label="Next">&#8594;</button>
            </div>
        </div>
        <div class="rp-stories__rail rp-snap" tabindex="0">%s</div>
    </div>
</section>
""" % cards

def find_clinic():
    """Section 13: "Only list locations where the network is currently active."

    Active means present in their own clinic map. Their homepage embeds that
    data as clinicData, 30 clinics with names and coordinates, read 2026-09-13.
    Every destination below has at least one clinic in it, and every hotel named
    in a caption is taken from that data. Makadi Bay is in the brief's example
    list but has no clinic in their data, so it is left out.

    The three hotel landing pages are linked, as the brief asks each
    destination to link to its own page eventually."""
    places = [
        ('Sahl Hasheesh', 'Premier Le R&ecirc;ve Hotel &amp; Spa', DEMO + '/design-4'),
        ('Soma Bay', 'Steigenberger Resort Ras Soma', DEMO + '/design-4-steigenberger'),
        ('Abu Soma', 'Amwaj Beach Club', DEMO + '/design-4-amwaj'),
        ('Hurghada', 'Hilton Hurghada Plaza, Long Beach Resort and more', '/our-clinics'),
        ('Marsa Alam', 'Steigenberger Alaya, Reef Oasis and more', '/our-clinics'),
        ('El Quseir', 'Radisson Blu El Quseir', '/our-clinics'),
        ('North Coast', 'Jaz Almaza Beach, Jaz Oriental and more', '/our-clinics'),
    ]
    body = ''.join('<a class="rp-place wow fadeInUp" data-wow-delay="%.2fs" href="%s">'
                   '<span class="rp-place__pin">%s</span>'
                   '<span class="rp-place__body"><b>%s</b><small>%s</small></span>'
                   '<span class="rp-place__go" aria-hidden="true">&#8594;</span></a>'
                   % (0.05 + k * 0.07, h, svg('pin'), d, s) for k, (d, s, h) in enumerate(places))
    return '''<!--Start Repositioning Find a Clinic-->
<section class="rp-sec" id="rp-find">
    <div class="container">
        <div class="sec-title text-center"><h2 class="sec-title__title">Find a 24/7 Clinic Near You</h2></div>
        <p class="rp-lead">Our clinics are located inside hotels and resorts across Egypt&rsquo;s major tourism destinations.</p>
        <div class="rp-places rp-snap">%s</div>
        <div class="rp-cta-row"><a class="thm-btn" href="/our-clinics">View All Clinics</a></div>
    </div>
</section>
''' % body


def final_cta():
    """Section 16."""
    return '''<!--Start Repositioning Final CTA-->
<section class="rp-final">
    <div class="container rp-final__in">
        <div>
            <h2>Feeling Unwell During Your Holiday?</h2>
            <p>Tell us where you are staying and what happened. Our medical coordination team is available 24/7.</p>
        </div>
        <div class="rp-final__btns">
            <a class="rp-btn rp-btn--wa rp-shine" href="%s" target="_blank" rel="noopener" data-ev="whatsapp_medical_click">%sWhatsApp Us Now</a>
            <a class="rp-btn rp-btn--ghost" href="#rp-find">Find Your Nearest Clinic</a>
        </div>
    </div>
</section>
''' % (wa(WA_HOME), svg('wa'))


def floating():
    """Section 5: floating button on desktop, sticky bar on a phone."""
    return '''<a class="rp-float" href="%s" target="_blank" rel="noopener" data-ev="whatsapp_medical_click"><i class="rp-pulse" aria-hidden="true"></i>%s<span>Need a Doctor? Chat on WhatsApp</span></a>
<a class="rp-sticky" href="%s" target="_blank" rel="noopener" data-ev="whatsapp_medical_click">%sWhatsApp Medical Support 24/7</a>
<div class="rp-lb" hidden role="dialog" aria-modal="true" aria-label="Film">
  <button class="rp-lb__close" type="button" aria-label="Close">&#215;</button>
  <video class="rp-lb__v" controls playsinline></video>
</div>
<script>
(function(){
  var calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Scroll-reveal, our own, since animate.css and wow.js do not reveal here.
     Content is visible by default (CSS forces .wow visible); this only adds a
     gentle fade-up. If it never runs, nothing is hidden. */
  (function(){
    if(calm||!('IntersectionObserver' in window))return;
    document.documentElement.classList.add('rp-anim');
    var els=[].slice.call(document.querySelectorAll('.wow'));
    els.forEach(function(e){e.classList.add('rp-pre');});
    var io=new IntersectionObserver(function(en){en.forEach(function(x){
      if(x.isIntersecting){x.target.classList.add('rp-seen');io.unobserve(x.target);}});
    },{rootMargin:'0px 0px -8% 0px',threshold:.08});
    els.forEach(function(e){io.observe(e);});
    /* Failsafe: reveal everything shortly after load no matter what. */
    addEventListener('load',function(){setTimeout(function(){els.forEach(function(e){e.classList.add('rp-seen');});},1600);});
  })();
  /* Their carousel clones slides for its loop. Clones keep no h1 and no film. */
  var tries=0,t=setInterval(function(){
    var c=document.querySelectorAll('.main-slider-two .owl-item.cloned');
    if(c.length||++tries>40){clearInterval(t);
      c.forEach(function(el){
        el.querySelectorAll('h1').forEach(function(h){var d=document.createElement('div');d.className='rp-h1';d.innerHTML=h.innerHTML;h.replaceWith(d)});
        el.querySelectorAll('video').forEach(function(v){v.removeAttribute('src');v.load();v.remove()});
      });
    }
  },100);
  document.querySelectorAll('.rp-hero-film').forEach(function(v){if(calm){v.removeAttribute('autoplay');v.pause()}});
  /* Films play muted once on screen, pause when off it. */
  var lazy=document.querySelectorAll('video.rp-lazy');
  if('IntersectionObserver' in window&&!calm){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;
      if(e.isIntersecting){if(!v.src)v.src=v.dataset.src;v.play().catch(function(){})}else if(v.src)v.pause()})},{rootMargin:'150px'});
    lazy.forEach(function(v){io.observe(v)});
  }
  /* The viewer: opens any film in its own shape, with sound. */
  var lb=document.querySelector('.rp-lb'),lv=lb.querySelector('video'),opener=null;
  function closeLb(){lv.pause();lv.removeAttribute('src');lv.load();lb.hidden=true;document.documentElement.classList.remove('rp-lb-open');if(opener)opener.focus()}
  document.querySelectorAll('.rp-watch').forEach(function(b){b.addEventListener('click',function(){
    opener=b;lv.src=b.dataset.film;lb.hidden=false;document.documentElement.classList.add('rp-lb-open');
    lv.muted=false;lv.play().catch(function(){});lb.querySelector('.rp-lb__close').focus()})});
  lb.addEventListener('click',function(e){if(e.target===lb)closeLb()});
  lb.querySelector('.rp-lb__close').addEventListener('click',closeLb);
  addEventListener('keydown',function(e){if(!lb.hidden&&e.key==='Escape')closeLb();
    if(!lb.hidden&&e.key==='Tab'){e.preventDefault();(document.activeElement===lv?lb.querySelector('.rp-lb__close'):lv).focus()}});
  /* Guest films advance one card every 4 s, stop for good on any touch. */
  var rail=document.querySelector('.rp-stories__rail');
  if(rail&&!calm){var stop=false,tick=setInterval(function(){
    if(stop||document.hidden)return;var card=rail.querySelector('.rp-story');if(!card)return;
    var step=card.getBoundingClientRect().width+18;
    if(rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-4)rail.scrollTo({left:0,behavior:'smooth'});
    else rail.scrollBy({left:step,behavior:'smooth'})},4000);
    ['pointerdown','wheel','touchstart','focusin','keydown'].forEach(function(ev){rail.addEventListener(ev,function(){stop=true;clearInterval(tick)},{passive:true})});
    rail.addEventListener('mouseenter',function(){stop=true});rail.addEventListener('mouseleave',function(){stop=false});}
  document.querySelectorAll('.rp-arrow').forEach(function(b){b.addEventListener('click',function(){
    var r=document.querySelector('.rp-stories__rail');var c=r.querySelector('.rp-story');
    r.scrollBy({left:(+b.dataset.dir)*(c?c.getBoundingClientRect().width+18:r.clientWidth*.8),behavior:calm?'auto':'smooth'})})});
  /* Dots under each phone carousel, following the scroll. */
  document.querySelectorAll('.rp-snap').forEach(function(row){
    var items=row.children;if(items.length<2)return;
    var d=document.createElement('div');d.className='rp-dots';d.setAttribute('aria-hidden','true');
    for(var i=0;i<items.length;i++)d.appendChild(document.createElement('i'));
    row.parentNode.insertBefore(d,row.nextSibling);
    function mark(){var w=items[0].getBoundingClientRect().width||1,n=Math.round(row.scrollLeft/(w+14));
      [].forEach.call(d.children,function(x,j){x.classList.toggle('on',j===Math.min(n,items.length-1))})}
    row.addEventListener('scroll',function(){requestAnimationFrame(mark)},{passive:true});mark();
  });
  /* The step rail draws itself when it comes into view. */
  var steps=document.querySelector('.rp-steps');
  if(steps&&'IntersectionObserver' in window){new IntersectionObserver(function(es,o){es.forEach(function(e){
    if(e.isIntersecting){steps.classList.add('rp-drawn');o.disconnect()}})},{threshold:.3}).observe(steps)}else if(steps)steps.classList.add('rp-drawn');
  /* Spotlight cards: the glow follows the pointer. */
  document.querySelectorAll('.rp-spot').forEach(function(c){
    c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();
      c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')});
  });
})();
</script>
''' % (wa(WA_HOME), svg('wa'), wa(WA_HOME), svg('wa'))


REPOSITIONING_CSS = r"""/* Repositioning, applied on top of their own stylesheet.
   Modern clinical urgent-care redesign, mobile-first, clean proportions.
   Their bundle.min.css is untouched. */

:root {
  --rp-font-sans: 'Kumbh Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --uterpy-base: #C00000;
  --uterpy-base-rgb: 192,0,0;
}

/* ---- modern typography reset ----------------------------------------- */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--rp-font-sans) !important;
  letter-spacing: -0.02em !important;
}
.main-slider-two__content .title h1,
.main-slider-two__content .title .rp-h1,
.main-slider-two__content .title h2,
.sec-title__title,
.about-one__content-title h2,
.rp-acc h2,
.rp-ins2 h2,
.rp-final h2,
.rp-pagehead h1,
.services-one__single-content-inner h2,
.rp-card h3,
.rp-step h3,
.rp-place b,
.therapy-two__content .title-box h2,
.footer-widget__title {
  font-family: var(--rp-font-sans) !important;
  letter-spacing: -0.02em !important;
  text-wrap: balance;
}

.rp-ico {
  width: 20px;
  height: 20px;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ---- compact modern desktop header ------------------------------------ */
.main-header-one__top {
  padding: 5px 0 !important;
  min-height: 36px;
  border-bottom: 1px solid #ece7e4;
}
.main-header__contact-list ul li {
  font-size: 13px !important;
  line-height: 24px !important;
  margin-left: 18px !important;
}
.main-header-one__top-right-social a {
  font-size: 13px !important;
  width: 26px !important;
  height: 26px !important;
  line-height: 26px !important;
}
.main-header-one__bottom-inner {
  min-height: 70px;
}
.logo-one {
  padding-right: 32px !important;
}
.logo-one img {
  max-height: 48px;
  width: auto;
}
.logo-one::before {
  border-bottom: 74px solid #fff !important;
  border-right: 32px solid transparent !important;
}
.main-menu .main-menu__list > li > a {
  padding-top: 20px !important;
  padding-bottom: 20px !important;
  font-size: 15px !important;
  font-weight: 600;
  font-family: var(--rp-font-sans) !important;
}
.main-menu .main-menu__list > li + li {
  margin-left: 24px !important;
}
.stricky-header .main-menu__list > li > a {
  padding-top: 15px !important;
  padding-bottom: 15px !important;
  font-size: 14.5px !important;
}
.stricky-header .logo-one img {
  max-height: 40px;
}
.stricky-header {
  box-shadow: 0 4px 20px rgba(0,0,0,.06) !important;
}

/* ---- header dropdown submenu polish & clean CSS chevron -------------- */
.main-menu .main-menu__list > li.dropdown > a:after {
  content: "";
  display: inline-block;
  width: 5px;
  height: 5px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: rotate(45deg);
  margin-left: 6px;
  margin-bottom: 3px;
  opacity: .6;
  transition: transform .2s ease;
}
.main-menu .main-menu__list > li.dropdown:hover > a:after {
  transform: rotate(-135deg);
  margin-bottom: 0;
}
.main-menu .main-menu__list > li > ul {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 16px 36px -10px rgba(0,0,0,.12);
  border: 1px solid #f0e6e4;
  padding: 8px;
  min-width: 240px;
  background-color: #fff;
}
.main-menu .main-menu__list > li > ul > li > a {
  border-radius: 8px;
  padding: 9px 16px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  white-space: normal;
  line-height: 1.4;
  border-bottom: none !important;
  transition: all .2s;
}
.main-menu .main-menu__list > li > ul > li > a:hover {
  background: #fff4f3 !important;
  color: var(--uterpy-base) !important;
}
.main-menu .main-menu__list > li > ul > li.current > a {
  color: var(--uterpy-base);
  font-weight: 700;
  background: #fff4f3;
}

/* ---- header WhatsApp button ------------------------------------------- */
.main-menu .main-menu__main-menu-box,
.stricky-header .main-menu__main-menu-box {
  display: flex !important;
  align-items: center;
  flex-wrap: nowrap;
}
.rp-head-wa {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 20px;
  padding: 9px 18px;
  border-radius: 999px;
  background: #25D366;
  color: #fff !important;
  font-weight: 700;
  font-size: 14px;
  white-space: nowrap;
  text-decoration: none;
  flex: none;
  transition: background .2s, transform .15s;
}
.rp-head-wa:hover {
  background: #128C7E;
  transform: translateY(-1px);
}
.rp-head-wa .rp-ico {
  width: 17px;
  height: 17px;
}
.rp-head-wa .rp-short {
  display: none;
}
@media (max-width: 1439px) {
  .rp-head-wa .rp-long { display: none; }
  .rp-head-wa .rp-short { display: inline; }
}

/* ---- compact modern hero slider --------------------------------------- */
.rp-hero-film {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}
.rp-hero-shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  /* A soft light wash, not a dark scrim. The brand rule is no dark designs:
     the photo stays visible and the headline sits on its own light panel. */
  background: linear-gradient(90deg, rgba(255,255,255,.30) 0%, rgba(255,255,255,.10) 42%, rgba(255,255,255,0) 68%);
}
.main-slider-two .shape3,
.main-slider-two .shape4 {
  z-index: 2;
}
.main-slider-two__single .container {
  position: relative;
  z-index: 3;
}
/* The headline sits on a frosted white panel, readable over any photo and on
   brand. Dark ink text, red accent, one soft shadow. */
.main-slider-two__content {
  padding: 34px 38px 36px !important;
  max-width: 620px;
  margin: 64px 0 !important;
  background: rgba(255,255,255,.90);
  border: 1px solid rgba(255,255,255,.85);
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(20,8,8,.18);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.main-slider-two__content .tagline .text-box p {
  color: var(--uterpy-base, #C00000) !important;
  font-size: 13px !important;
  line-height: 22px !important;
  font-weight: 700 !important;
  letter-spacing: 0.06em !important;
  text-transform: uppercase;
  white-space: normal;
}
.main-slider-two__content .tagline .border-box { background: var(--uterpy-base, #C00000) !important; }
.main-slider-two__content .title h1,
.main-slider-two__content .title .rp-h1,
.main-slider-two__content .title h2 {
  color: #14100F !important;
  font-size: clamp(30px, 3.4vw, 44px) !important;
  line-height: 1.1 !important;
  font-weight: 800 !important;
  letter-spacing: -0.01em;
  margin: 0;
  text-shadow: none;
}
.rp-hero-text {
  color: #4E4743 !important;
  font-size: 16px !important;
  line-height: 1.62 !important;
  max-width: 540px;
  margin: 14px 0 0 !important;
  text-shadow: none;
}
.main-slider-two__content .main-slider-one__content-btn {
  margin-top: 24px !important;
  gap: 12px;
}
.main-slider-two__content .main-slider-one__content-btn a {
  min-height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px !important;
  font-weight: 700;
  padding: 0 26px;
}
/* Second hero button: a red-outline pill that matches the primary, instead of
   the bundle's underlined white link that vanished on the light panel. */
.main-slider-two__content .main-slider-one__content-btn .btn-two a {
  background: #fff !important;
  color: var(--uterpy-base, #C00000) !important;
  border: 2px solid var(--uterpy-base, #C00000) !important;
  box-shadow: none !important;
  transition: background .18s ease, color .18s ease, transform .18s ease;
}
.main-slider-two__content .main-slider-one__content-btn .btn-two a:hover {
  background: var(--uterpy-base, #C00000) !important;
  color: #fff !important;
  transform: translateY(-2px);
}
.main-slider-two__video-icon {
  width: 64px !important;
  height: 64px !important;
  line-height: 64px !important;
  font-size: 14px !important;
}
.main-slider-two__video-icon .ripple,
.main-slider-two__video-icon .ripple:before,
.main-slider-two__video-icon .ripple:after {
  width: 100px !important;
  height: 100px !important;
}
.main-slider-two .active .rp-hero-text,
.main-slider-two .active .rp-trust {
  animation: rp-rise .8s cubic-bezier(.22,.61,.36,1) .6s both;
}
@keyframes rp-rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}
.rp-trust {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 18px 0 0 !important;
  padding: 6px 14px 6px 8px !important;
  border-radius: 999px;
  background: #FBF0EF;
  border: 1px solid #EBD3D1;
  color: var(--uterpy-black);
  font-weight: 600;
  font-size: 13.5px !important;
  white-space: nowrap;
  max-width: 100%;
}
.rp-trust img {
  width: 30px !important;
  height: 30px !important;
  max-width: 30px !important;
  object-fit: contain;
  flex: none;
  border-radius: 50%;
  margin: 0 !important;
}
.rp-wa-btn {
  display: inline-flex !important;
  align-items: center;
  gap: 8px;
  background: #25D366 !important;
  color: #fff !important;
}
.rp-wa-btn:hover {
  background: #128C7E !important;
}

/* ---- unified modern section rhythm & typography ---------------------- */
.rp-sec,
.services-one.rp-services {
  padding: 64px 0 !important;
}
.rp-sec--tint {
  background: #f7f5f4;
}
.rp-sec--tight {
  padding: 40px 0 !important;
}
.sec-title {
  margin-bottom: 24px !important;
}
.sec-title__tagline h6 {
  font-size: 12.5px !important;
  letter-spacing: 0.08em !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  color: var(--uterpy-base) !important;
  margin-bottom: 6px !important;
}
.sec-title__title {
  font-size: 34px !important;
  line-height: 1.22 !important;
  font-weight: 700 !important;
  color: var(--uterpy-black) !important;
}
.rp-lead {
  text-align: center;
  max-width: 620px;
  margin: -10px auto 28px !important;
  font-size: 15.5px !important;
  line-height: 1.6 !important;
  color: #5b5b5b;
}

/* ---- accreditation bar ----------------------------------------------- */
.rp-acc {
  background: #fff;
  border-bottom: 1px solid #ece7e4;
  padding: 40px 0 !important;
}
.rp-acc__in {
  display: grid;
  grid-template-columns: 1.2fr .8fr;
  gap: 40px;
  align-items: center;
}
.rp-acc h2 {
  font-size: 27px !important;
  line-height: 1.25 !important;
  margin: 0 0 10px;
  font-weight: 700;
}
.rp-acc p {
  margin: 0;
  font-size: 15px !important;
  line-height: 1.6 !important;
  color: #555;
  max-width: 620px;
}
.rp-acc__marks {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 28px;
  justify-content: flex-end;
  align-items: center;
}
.rp-acc__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.rp-acc__label {
  margin: 0 !important;
  font-size: 11px !important;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: #888 !important;
  max-width: 240px;
}
.rp-acc__row {
  display: flex;
  gap: 20px;
  align-items: center;
}
.rp-mark {
  margin: 0;
  width: 104px;
  text-align: center;
}
.rp-mark img {
  display: block;
  margin: 0 auto;
  width: auto;
}
.rp-mark--round img {
  height: 56px !important;
}
.rp-mark--wide img {
  height: 40px !important;
  margin: 6px auto !important;
}
.rp-mark figcaption {
  margin-top: 6px;
  font-size: 11.5px !important;
  line-height: 1.3;
  color: #777;
}

/* ---- about section overhaul ------------------------------------------ */
.about-one {
  padding: 64px 0 54px !important;
}
.about-one__content-text1 p {
  font-size: 15.5px !important;
  line-height: 1.65 !important;
}
.about-one__content-text3 p {
  font-size: 14.5px !important;
  line-height: 1.6 !important;
}
.about-one .experience-box {
  width: 120px !important;
  height: 120px !important;
}

/* ---- services cards: compact & modern -------------------------------- */
.rp-services .services-one__single {
  height: calc(100% - 24px);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #ede8e5;
  box-shadow: 0 4px 18px -6px rgba(0,0,0,.06);
  transition: transform .3s ease, box-shadow .3s ease, border-color .3s;
}
.rp-services .services-one__single:hover {
  transform: translateY(-4px);
  border-color: #f0c9c4;
  box-shadow: 0 16px 36px -12px rgba(192,0,0,.16);
}
.rp-services .services-one__single-img .inner {
  display: block;
  overflow: hidden;
}
.rp-services .services-one__single-img img {
  aspect-ratio: 16/10 !important;
  object-fit: cover;
  width: 100%;
  transition: transform 1s cubic-bezier(.22,.61,.36,1);
}
.rp-services .services-one__single:hover .services-one__single-img img {
  transform: scale(1.06);
}
.services-one__single-content {
  padding: 20px 18px 22px !important;
}
.rp-services .services-one__single-content-inner h2 {
  font-size: 18px !important;
  line-height: 1.35 !important;
  margin: 0;
  font-weight: 700;
}
.rp-services .services-one__single-content-inner h2 a {
  color: var(--uterpy-black) !important;
}
.rp-services .services-one__single-content-inner h2 a:hover {
  color: var(--uterpy-base) !important;
}
.rp-svc__text {
  margin: 8px 0 0 !important;
  font-size: 14px !important;
  line-height: 1.55 !important;
  color: #666;
}
.services-one__single-img-icon {
  width: 44px !important;
  height: 44px !important;
}
.services-one__single-img-icon-inner {
  width: 44px !important;
  height: 44px !important;
  line-height: 44px !important;
}
.services-one__single-img-icon-inner span {
  font-size: 16px !important;
}

/* ---- why choose hotel clinics: video reel + clean cards -------------- */
.rp-why__in {
  display: grid;
  grid-template-columns: .75fr 1.25fr;
  gap: 32px;
  align-items: start;
}
.rp-grid--2 {
  grid-template-columns: 1fr 1fr;
}
.rp-reel,
.rp-film,
.rp-story {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  background: #e9e4de;
  margin: 0;
}
.rp-reel {
  aspect-ratio: 9/16;
  max-height: 540px;
  box-shadow: 0 24px 50px -30px rgba(120,20,20,.45);
}
.rp-reel video,
.rp-film video,
.rp-story video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ---- cards and spotlights -------------------------------------------- */
.rp-card {
  background: #fff;
  border: 1px solid #ece7e4;
  border-radius: 14px;
  padding: 22px 20px !important;
}
.rp-card__i {
  display: inline-grid;
  place-items: center;
  width: 48px !important;
  height: 48px !important;
  border-radius: 14px !important;
  background: #fff4f3;
  color: var(--uterpy-base);
  margin-bottom: 14px !important;
}
.rp-card h3 {
  font-size: 18px !important;
  line-height: 1.35 !important;
  margin: 0 0 8px !important;
  font-weight: 700;
}
.rp-card p {
  margin: 0;
  font-size: 14.5px !important;
  line-height: 1.6 !important;
  color: #5b5b5b;
}

/* ---- insurance banner: compact & punchy ------------------------------- */
.rp-ins2 {
  display: grid;
  grid-template-columns: 1.3fr .7fr;
  gap: 44px;
  align-items: center;
  max-width: 1080px;
  margin: 0 auto;
  padding: 44px 48px !important;
  border-radius: 24px !important;
  background:
    radial-gradient(120% 120% at 100% 0%, #D42332 0%, var(--uterpy-base) 55%);
  color: #fff;
  box-shadow: 0 30px 60px -32px rgba(120,0,0,.6);
}
.rp-ins2__img img {
  border-radius: 16px;
  border: 6px solid rgba(255,255,255,.16);
  box-shadow: 0 20px 40px -20px rgba(0,0,0,.45);
  width: 100%;
  height: auto;
  object-fit: cover;
}
.rp-ins2 h2 {
  color: #fff !important;
  font-size: 28px !important;
  line-height: 1.2 !important;
  margin: 0;
  font-weight: 700;
}
.rp-ins2__sub {
  font-size: 16px !important;
  font-weight: 700;
  margin: 6px 0 10px !important;
  color: #fff;
}
.rp-ins2 p {
  color: rgba(255,255,255,.92);
  font-size: 14.5px !important;
  line-height: 1.55 !important;
  margin: 0 0 8px;
}
.rp-ins2__label {
  font-weight: 700;
  color: #fff !important;
  margin-top: 10px !important;
}
.rp-ins2__ticks {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 28px;
}
.rp-ins2__ticks li {
  display: flex;
  gap: 9px;
  align-items: center;
  font-size: 14.5px !important;
  font-weight: 600;
  line-height: 1.3;
}
.rp-ins2__ticks .rp-ico { color: #fff; }
.rp-ins2__ticks .rp-ico {
  width: 16px;
  height: 16px;
  flex: none;
  stroke-width: 2.4;
  margin-top: 1px;
}
.rp-ins2__btns {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 18px;
  margin-top: 18px !important;
}

/* ---- steps rail: 4 clean numbered cards ------------------------------ */
.rp-steps {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  position: relative;
}
.rp-steps:before {
  content: "";
  position: absolute;
  left: 12.5%;
  right: 12.5%;
  top: 26px;
  height: 2px;
  background: repeating-linear-gradient(90deg, var(--uterpy-base) 0 8px, transparent 8px 15px);
  opacity: .4;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 1.4s cubic-bezier(.22,.61,.36,1) .2s;
}
.rp-steps.rp-drawn:before {
  transform: none;
}
.rp-steps .rp-step {
  position: relative;
  text-align: center;
  background: none;
  border: 0;
  padding: 0 6px;
}
.rp-steps .rp-step__n {
  position: relative;
  z-index: 1;
  width: 52px !important;
  height: 52px !important;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--uterpy-base);
  color: var(--uterpy-base);
  font-size: 17px !important;
  display: grid;
  place-items: center;
  box-shadow: 0 0 0 6px #f7f5f4;
}
.rp-steps .rp-step:first-child .rp-step__n {
  background: var(--uterpy-base);
  color: #fff;
}
.rp-step h3 {
  font-size: 17px !important;
  line-height: 1.35 !important;
  margin: 0 0 6px !important;
  font-weight: 700;
}
.rp-step p {
  margin: 0;
  font-size: 14px !important;
  line-height: 1.55 !important;
  color: #666;
}

/* ---- find a clinic: destination pills --------------------------------- */
.rp-places {
  display: flex !important;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px !important;
}
.rp-place {
  flex: 0 0 calc((100% - 42px)/4);
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 18px 16px !important;
  border-radius: 14px !important;
  background: #fff;
  border: 1px solid #ece7e4;
  box-shadow: 0 8px 24px -16px rgba(80,10,10,.35);
  transition: transform .25s, box-shadow .25s, border-color .25s;
  text-decoration: none;
}
.rp-place:hover {
  transform: translateY(-3px);
  border-color: #f0c9c4;
  box-shadow: 0 16px 32px -16px rgba(120,20,20,.4);
}
.rp-place__pin {
  display: grid;
  place-items: center;
  width: 40px !important;
  height: 40px !important;
  flex: none;
  border-radius: 12px !important;
  background: #fff4f3;
  color: var(--uterpy-base);
}
.rp-place__body b {
  display: block;
  font-size: 16px !important;
  line-height: 1.25;
  color: var(--uterpy-black);
}
.rp-place__body small {
  display: block;
  margin-top: 3px;
  font-size: 13px !important;
  line-height: 1.4;
  color: #6b625e;
}
.rp-place__go {
  align-self: center;
  color: var(--uterpy-base);
  font-size: 16px;
}

/* ---- other legacy section overrides ---------------------------------- */
.testimonial-one {
  padding: 60px 0 50px !important;
}
.testimonial-one::before {
  height: 300px !important;
}
.why-choose-one {
  padding: 60px 0 !important;
}
.blog-one {
  padding: 60px 0 46px !important;
}
.counter-one {
  margin-top: 20px !important;
}
.counter-one__inner {
  padding: 40px 0 24px !important;
  border-radius: 18px !important;
  margin-bottom: -40px !important;
}
.counter-one--two .counter-one__single-top h2 {
  font-size: 34px !important;
}
.counter-one--two .counter-one__single-bottom p {
  font-size: 13.5px !important;
}
.therapy-two {
  padding: 60px 0 !important;
}
.subscribe-one {
  padding: 60px 0 !important;
}
.subscribe-one h2 {
  font-size: 28px !important;
}

/* ---- guest stories rail ----------------------------------------------- */
.rp-stories {
  padding: 16px 0 64px !important;
}
.rp-story {
  height: auto !important;
  width: calc((100% - 42px)/4) !important;
  aspect-ratio: 9/16 !important;
  border-radius: 18px !important;
}

/* ---- buttons ---------------------------------------------------------- */
.rp-btn {
  justify-content: center;
  min-height: 48px;
  padding: 0 22px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 15px;
  transition: background .2s, color .2s, transform .15s;
}
.rp-btn:active {
  transform: scale(.98);
}
.thm-btn {
  padding: 14px 28px !important;
  font-size: 15px !important;
  border-radius: 999px !important;
  font-family: var(--rp-font-sans) !important;
  font-weight: 700 !important;
}
.rp-cta-row {
  margin-top: 30px !important;
  gap: 12px 20px !important;
}

/* ---- final CTA ------------------------------------------------------- */
.rp-final {
  background: #fff4f3;
  border-top: 1px solid #f3dcd9;
  padding: 48px 0 !important;
}
.rp-final h2 {
  font-size: 28px !important;
  line-height: 1.25 !important;
}
.rp-final p {
  font-size: 15.5px !important;
}

/* ---- footer links & credit ------------------------------------------- */
.footer-widget__service-list.rp-footer-grid {
  display: grid !important;
  grid-template-columns: 1fr 1fr;
  gap: 8px 18px;
}
.footer-widget__service-list.rp-footer-grid li {
  margin: 0 !important;
}
.footer-widget__service-list.rp-footer-grid li a {
  font-size: 14px !important;
  white-space: nowrap;
}

/* ---- inner pages rhythm & breadcrumbs -------------------------------- */
.rp-pagehead {
  background: #f7f5f4;
  padding: 44px 0 34px !important;
  text-align: center;
  border-bottom: 1px solid #eee;
}
.rp-pagehead h1 {
  font-size: 32px !important;
  line-height: 1.2 !important;
  margin: 0 0 10px !important;
  font-weight: 700;
}
.rp-pagehead .rp-lead {
  margin: 0 auto !important;
  max-width: 680px;
}
.rp-breadcrumb {
  margin: 0 auto 14px !important;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: #777;
}
.rp-breadcrumb li {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.rp-breadcrumb li a {
  color: #888;
  text-decoration: none;
}
.rp-breadcrumb li a:hover {
  color: var(--uterpy-base);
}
.rp-breadcrumb li + li:before {
  content: "/";
  color: #bbb;
}
.rp-breadcrumb li.active {
  color: var(--uterpy-base);
  font-weight: 600;
}
.rp-related {
  padding: 50px 0 !important;
}
.rp-related-card {
  display: block;
  text-decoration: none;
  transition: border-color .2s, transform .2s, box-shadow .2s;
  color: inherit;
  height: 100%;
}
.rp-related-card:hover {
  border-color: var(--uterpy-base);
  transform: translateY(-3px);
  box-shadow: 0 12px 28px -10px rgba(192,0,0,.15);
}
.rp-related-card h3 {
  font-size: 17px !important;
  color: var(--uterpy-black);
  margin: 0 0 6px !important;
  font-weight: 700;
}
.rp-related-card p {
  font-size: 13.5px !important;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

/* ---- floating WhatsApp on Desktop ------------------------------------- */
@media (min-width: 768px) {
  .rp-float {
    position: fixed !important;
    right: 24px !important;
    bottom: 24px !important;
    z-index: 9990 !important;
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    padding: 12px 20px !important;
    border-radius: 999px !important;
    background: #25D366 !important;
    color: #fff !important;
    font-weight: 700 !important;
    font-size: 14.5px !important;
    box-shadow: 0 10px 28px -6px rgba(18,140,126,.5) !important;
    text-decoration: none !important;
    transition: transform .2s, box-shadow .2s !important;
  }
  .rp-float:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 14px 34px -4px rgba(18,140,126,.6) !important;
    background: #1eb956 !important;
    color: #fff !important;
  }
  .rp-sticky {
    display: none !important;
  }
}

/* ======================================================================
   MOBILE-FIRST LAYER (Strict touch targets, clean viewports, no bloat)
   ====================================================================== */
@media (max-width: 991px) {
  /* mobile header: clean & compact */
  .main-header-one__top {
    display: none !important;
  }
  .main-header-one__bottom-inner {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 10px 18px !important;
    min-height: 60px !important;
  }
  .logo-one {
    padding-right: 0 !important;
  }
  .logo-one::before {
    display: none !important;
  }
  .logo-one img {
    max-height: 40px !important;
  }
  .main-header-one__bottom-right {
    display: none !important;
  }
  .rp-head-wa {
    display: none !important;
  }
  .mobile-nav__toggler {
    width: 44px !important;
    height: 44px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 20px !important;
    color: var(--uterpy-black) !important;
    border-radius: 10px !important;
    background: #faf8f7 !important;
    border: 1px solid #efe8e5 !important;
    margin: 0 !important;
    touch-action: manipulation;
  }
}

@media (max-width: 767px) {
  body {
    padding-bottom: 78px !important;
  }
  .container {
    padding-left: 18px !important;
    padding-right: 18px !important;
  }

  /* mobile hero: clean, intentional, no cut off headers */
  .main-slider-two__content {
    padding: 28px 0 24px !important;
  }
  .main-slider-two__single-inner {
    min-height: auto !important;
    padding: 24px 0 20px !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-end !important;
  }
  .main-slider-two__video,
  .main-slider-two .shape3,
  .main-slider-two .shape4 {
    display: none !important;
  }
  .main-slider-two__content .tagline {
    margin-bottom: 6px !important;
  }
  .main-slider-two__content .tagline .text-box p {
    font-size: 12px !important;
    line-height: 1.3 !important;
    letter-spacing: 0.03em !important;
  }
  .main-slider-two__content .title h1,
  .main-slider-two__content .title .rp-h1,
  .main-slider-two__content .title h2 {
    font-size: 26px !important;
    line-height: 1.18 !important;
    letter-spacing: -0.02em !important;
  }
  .rp-hero-text {
    font-size: 14px !important;
    line-height: 1.5 !important;
    margin-top: 10px !important;
  }
  .main-slider-two__content .main-slider-one__content-btn {
    margin-top: 16px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
  }
  .main-slider-two__content .main-slider-one__content-btn a {
    min-height: 46px !important;
    border-radius: 12px !important;
    font-size: 14.5px !important;
    font-weight: 700 !important;
    width: 100% !important;
  }
  .rp-trust {
    margin-top: 14px !important;
    padding: 5px 12px 5px 7px !important;
    font-size: 12px !important;
    border-radius: 999px !important;
    white-space: normal !important;
  }
  .rp-trust img {
    width: 26px !important;
    height: 26px !important;
  }

  /* mobile sections */
  .rp-sec,
  .services-one.rp-services,
  .about-one,
  .rp-stories {
    padding: 40px 0 !important;
  }
  .rp-sec--tight {
    padding: 28px 0 !important;
  }
  .sec-title.text-center {
    text-align: left !important;
  }
  .sec-title__title {
    font-size: 24px !important;
    line-height: 1.22 !important;
    hyphens: none !important;
    -webkit-hyphens: none !important;
  }
  .rp-lead {
    text-align: left !important;
    margin: -6px 0 20px !important;
    font-size: 14px !important;
    line-height: 1.5 !important;
  }

  /* accreditation mobile: compact & structured */
  .rp-acc {
    padding: 30px 0 !important;
  }
  .rp-acc__in {
    gap: 18px !important;
    grid-template-columns: 1fr !important;
  }
  .rp-acc h2 {
    font-size: 21px !important;
    line-height: 1.25 !important;
  }
  .rp-acc p {
    font-size: 13.5px !important;
    line-height: 1.5 !important;
  }
  .rp-acc__marks {
    justify-content: flex-start !important;
    gap: 12px 16px !important;
  }
  .rp-acc__row {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    gap: 12px !important;
    align-items: center !important;
  }
  .rp-mark {
    width: auto !important;
    flex: 1 1 auto !important;
    text-align: center !important;
  }
  .rp-mark--round img {
    height: 42px !important;
  }
  .rp-mark--wide img {
    height: 32px !important;
    margin: 4px auto !important;
  }
  .rp-mark figcaption {
    font-size: 10.5px !important;
    line-height: 1.2 !important;
    margin-top: 3px !important;
  }
  .rp-ticks {
    gap: 8px 14px !important;
    margin-top: 10px !important;
  }
  .rp-ticks li {
    font-size: 13px !important;
  }

  /* mobile horizontal swipe carousels */
  .rp-snap {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    scroll-snap-type: x mandatory !important;
    gap: 12px !important;
    margin-left: -18px !important;
    margin-right: -18px !important;
    padding: 4px 18px 12px !important;
    scrollbar-width: none !important;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    scroll-padding-left: 18px;
  }
  .rp-snap::-webkit-scrollbar {
    display: none;
  }
  .rp-snap > * {
    flex: 0 0 80% !important;
    max-width: 80% !important;
    scroll-snap-align: start;
  }
  .rp-svc-row > * {
    padding: 0 !important;
  }
  .rp-svc-row .services-one__single {
    height: 100%;
    margin: 0;
  }
  .rp-films__row > * {
    flex-basis: 66% !important;
    max-width: 66% !important;
  }
  .rp-stories__rail > .rp-story {
    flex-basis: 62% !important;
    max-width: 62% !important;
    width: auto !important;
  }
  .rp-places > .rp-place {
    flex-basis: 78% !important;
    max-width: 78% !important;
  }
  .rp-grid--2.rp-snap > * {
    flex-basis: 78% !important;
    max-width: 78% !important;
  }

  /* why: film scaled */
  .rp-reel {
    max-width: none !important;
    aspect-ratio: 16/10 !important;
    margin: 0 0 16px !important;
    border-radius: 16px !important;
  }

  /* insurance mobile: compact card */
  .rp-ins2 {
    grid-template-columns: 1fr !important;
    padding: 20px 18px !important;
    gap: 16px !important;
    border-radius: 16px !important;
  }
  .rp-ins2__img {
    order: -1;
  }
  .rp-ins2 h2 {
    font-size: 22px !important;
  }
  .rp-ins2__ticks {
    grid-template-columns: 1fr !important;
    gap: 6px !important;
  }
  .rp-ins2__btns .rp-btn {
    width: 100% !important;
  }

  /* steps on phone */
  .rp-steps {
    grid-template-columns: 1fr !important;
    gap: 0 !important;
  }
  .rp-steps:before {
    left: 20px !important;
    right: auto !important;
    top: 10px !important;
    bottom: 10px !important;
    width: 2px !important;
    height: auto !important;
    background: repeating-linear-gradient(180deg, var(--uterpy-base) 0 8px, transparent 8px 15px) !important;
    transform: none !important;
  }
  .rp-steps .rp-step {
    text-align: left !important;
    padding: 0 0 20px 60px !important;
  }
  .rp-steps .rp-step__n {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    margin: 0 !important;
    width: 42px !important;
    height: 42px !important;
    font-size: 14px !important;
    box-shadow: 0 0 0 5px #f7f5f4 !important;
  }

  /* dots */
  .rp-stories__nav {
    display: none !important;
  }
  .rp-dots {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 4px;
  }
  .rp-dots i {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: #d9d0cc;
    transition: width .3s, background .3s;
  }
  .rp-dots i.on {
    width: 18px;
    background: var(--uterpy-base);
  }

  /* sticky WhatsApp bar on phone */
  .rp-float {
    display: none !important;
  }
  .rp-sticky {
    position: fixed !important;
    left: 12px !important;
    right: 12px !important;
    bottom: 12px !important;
    z-index: 9999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    min-height: 48px !important;
    padding: 11px 18px !important;
    border-radius: 999px !important;
    background: #25D366 !important;
    color: #fff !important;
    font-weight: 700 !important;
    font-size: 14.5px !important;
    text-decoration: none !important;
    box-shadow: 0 8px 24px rgba(37,211,102,.4), 0 2px 6px rgba(0,0,0,.15) !important;
    touch-action: manipulation;
  }
  .rp-sticky .rp-ico {
    width: 19px;
    height: 19px;
  }
}

@media (min-width: 768px) {
  .rp-dots { display: none !important; }
}
@media (min-width: 768px) and (max-width: 991px) {
  .rp-place { flex-basis: calc((100% - 14px)/2) !important; }
  .rp-story { width: calc((100% - 14px)/2) !important; }
  .rp-ins2 { grid-template-columns: 1fr !important; }
}

@media (prefers-reduced-motion: reduce) {
  .rp-shine:after,
  .rp-pulse {
    animation: none;
    display: none;
  }
  .rp-steps:before {
    transform: none !important;
    transition: none !important;
  }
  .main-slider-two .active .rp-hero-text,
  .main-slider-two .active .rp-trust {
    animation: none !important;
  }
  .rp-film:hover,
  .rp-services .services-one__single:hover .services-one__single-img img {
    transform: none !important;
  }
  .rp-spot,
  .rp-spot:hover {
    transform: none !important;
  }
}
/* ---- films lightbox modal player (frosted white) ----------------------- */
.rp-watch {
  position: absolute;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: rgba(255,255,255,.94);
  color: #15120f;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 10px 24px -12px rgba(0,0,0,.45);
  transition: background .2s, color .2s, transform .2s;
}
.rp-watch .rp-ico {
  width: 16px;
  height: 16px;
  fill: currentColor;
  stroke: none;
}
.rp-watch:hover {
  background: var(--uterpy-base);
  color: #fff;
}
.rp-lb {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(250,248,246,.85);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  animation: rp-fade .25s ease-out;
}
.rp-lb[hidden] {
  display: none;
}
.rp-lb__v {
  max-width: min(92vw, 1100px);
  max-height: 86vh;
  width: auto;
  height: auto;
  border-radius: 18px;
  background: #e9e4de;
  box-shadow: 0 40px 80px -30px rgba(40,10,10,.55);
  animation: rp-pop .3s cubic-bezier(.22,.61,.36,1);
}
.rp-lb__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 0;
  background: #fff;
  color: #15120f;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 8px 20px -10px rgba(0,0,0,.4);
}
.rp-lb-open,
.rp-lb-open body {
  overflow: hidden;
}
@keyframes rp-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes rp-pop { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: none; } }

/* ---- films: 3-column row ---------------------------------------------- */
.rp-films__row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}
.rp-film {
  aspect-ratio: 9/16;
  box-shadow: 0 24px 48px -28px rgba(120,20,20,.45);
  transition: transform .35s;
}
.rp-film:hover {
  transform: translateY(-5px);
}

/* ---- guest stories rail ----------------------------------------------- */
.rp-stories__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.rp-stories__nav {
  display: flex;
  gap: 10px;
}
.rp-arrow {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1.5px solid var(--uterpy-black);
  background: #fff;
  font-size: 18px;
  cursor: pointer;
  transition: background .2s, color .2s;
  display: inline-grid;
  place-items: center;
}
.rp-arrow:hover {
  background: var(--uterpy-black);
  color: #fff;
}
.rp-stories__rail {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 4px 2px 14px;
  scrollbar-width: thin;
  scroll-behavior: smooth;
}
.rp-stories__rail::-webkit-scrollbar {
  display: none;
}
.rp-story {
  flex: none;
  scroll-snap-align: start;
  box-shadow: 0 20px 40px -26px rgba(80,10,10,.45);
}
.rp-story:after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 45%;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.45));
}
.rp-story figcaption {
  position: absolute;
  left: 12px;
  top: 12px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 10px 5px 7px;
  border-radius: 999px;
  background: rgba(255,255,255,.92);
  font-size: 12px;
  font-weight: 700;
  color: #15120f;
}
.rp-story figcaption:empty {
  display: none;
}
.rp-story figcaption img {
  border-radius: 3px;
}
.rp-story .rp-watch {
  z-index: 2;
}
.rp-story video {
  transition: transform 1s cubic-bezier(.22,.61,.36,1);
}
.rp-story:hover video {
  transform: scale(1.04);
}

/* ---- spotlight hover effects ------------------------------------------ */
.rp-spot {
  position: relative;
  overflow: visible;
  border-radius: 16px;
  transition: border-color .3s, transform .3s, box-shadow .3s;
}
.rp-spot:before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity .3s;
  background: radial-gradient(220px circle at var(--mx,50%) var(--my,0%), rgba(192,0,0,.08), transparent 70%);
}
.rp-spot:hover {
  border-color: #f0c9c4;
  transform: translateY(-3px);
  box-shadow: 0 18px 36px -24px rgba(120,20,20,.3);
}
.rp-spot:hover:before {
  opacity: 1;
}
.rp-spot > * {
  position: relative;
}
.rp-spot:hover .rp-card__i {
  background: var(--uterpy-base);
  color: #fff;
  border-color: var(--uterpy-base);
}
.rp-x {
  position: absolute !important;
  width: 12px;
  height: 12px;
  pointer-events: none;
  opacity: .5;
}
.rp-x:before,
.rp-x:after {
  content: "";
  position: absolute;
  background: var(--uterpy-base);
}
.rp-x:before {
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
}
.rp-x:after {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
}
.rp-x--a {
  top: -6px;
  left: -6px;
}
.rp-x--b {
  bottom: -6px;
  right: -6px;
}

/* ---- buttons & pulse -------------------------------------------------- */
.rp-shine {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
.rp-shine:after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: -60%;
  width: 40%;
  z-index: -1;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,.4), transparent);
  transform: skewX(-18deg);
  animation: rp-shine 4.5s ease-in-out infinite;
}
@keyframes rp-shine { 0%, 70% { left: -60%; } 100% { left: 130%; } }
.rp-btn--wa {
  background: #25D366;
  color: #fff;
}
.rp-btn--wa:hover {
  background: #128C7E;
  color: #fff;
}
.rp-btn--ghost {
  background: #fff;
  color: var(--uterpy-black);
  border: 1.5px solid #dcd5d1;
}
.rp-btn--ghost:hover {
  background: #faf8f7;
  border-color: var(--uterpy-black);
  color: var(--uterpy-black);
}
.rp-pulse {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid #25D366;
  animation: rp-pulse 2.4s ease-out infinite;
  pointer-events: none;
}
@keyframes rp-pulse { 0% { opacity: .7; transform: scale(1); } 100% { opacity: 0; transform: scale(1.18, 1.5); } }

/* ---- light theme rules (no black blocks) ------------------------------ */
.main-header-one.style2 .main-header-one__top,
.main-header-one.style2 .main-header-one__top-inner {
  background: #f7f5f4 !important;
}
.main-header-one.style2 .main-header-one__top::before,
.main-header-one.style2 .main-header-one__top-left::before {
  display: none !important;
}
.main-header-one.style2 .main-header-one__top * {
  color: #3b3533 !important;
}
.main-header-one.style2 .main-header-one__top [class^="icon-"]:before,
.main-header-one.style2 .main-header-one__top [class*=" icon-"]:before {
  color: var(--uterpy-base) !important;
}
.main-header-one__top,
.main-header-one__top a,
.main-header-one__top p,
.main-header-one__top span,
.main-header-one__top h6 {
  color: #3b3533 !important;
}
.site-footer--two .shape1,
.site-footer--two .shape2,
.site-footer--two .shape3 {
  display: none !important;
}
.site-footer--two__pattern {
  background-image: none !important;
  background: #f7f5f4 !important;
}
.site-footer--two,
.site-footer--two p,
.site-footer--two a,
.site-footer--two li,
.site-footer--two h3,
.site-footer--two h4,
.site-footer--two .footer-widget__title,
.site-footer__bottom-text p {
  color: #3b3533 !important;
}
.site-footer--two a:hover {
  color: var(--uterpy-base) !important;
}
.site-footer__bottom {
  border-top: 1px solid #e7e1da;
}
.site-footer__bottom,
.site-footer__bottom * {
  color: #6b625e !important;
}
.site-footer__bottom a {
  color: var(--uterpy-base) !important;
}
.footer-widget__about-social-link a {
  background: #fff4f3 !important;
  color: var(--uterpy-base) !important;
  border: 1px solid #f3dcd9;
}
.footer-widget__about-social-link a:hover {
  background: var(--uterpy-base) !important;
  color: #fff !important;
}
.footer-widget__about-social-link a * {
  color: inherit !important;
}
.counter-one--two .counter-one__inner-bg {
  background: #fff4f3 !important;
  border: 1px solid #f3dcd9;
}
.counter-one--two .counter-one__single-bottom p,
.counter-one--two h3,
.counter-one--two .odometer,
.counter-one--two .counter-one__single-top span {
  color: var(--uterpy-black) !important;
}
.testimonial-one--two.testimonial-one:before {
  background-color: #f7f5f4 !important;
}

/* ---- inner pages support classes -------------------------------------- */
.rp-grid {
  display: grid;
  gap: 20px;
  margin-top: 10px;
}
.rp-grid--3 {
  grid-template-columns: repeat(3, 1fr);
}
.rp-grid--4 {
  grid-template-columns: repeat(4, 1fr);
}
.rp-grid--auto {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
@media (max-width: 1199px) {
  .rp-grid--4 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 991px) {
  .rp-grid--3 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 575px) {
  .rp-grid--3, .rp-grid--4 { grid-template-columns: 1fr; }
}
.rp-sub {
  font-size: 20px !important;
  margin: 28px 0 8px !important;
  font-weight: 700;
}
.rp-list {
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}
.rp-list li {
  position: relative;
  padding: 9px 12px 9px 28px;
  background: #faf8f7;
  border: 1px solid #efe9e7;
  border-radius: 8px;
  font-size: 14px;
}
.rp-list li:before {
  content: "";
  position: absolute;
  left: 10px;
  top: 16px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #C00000;
}
.rp-ticks {
  list-style: none;
  padding: 0;
  margin: 14px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 24px;
}
.rp-ticks li {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
}
.rp-ticks .rp-ico {
  color: var(--uterpy-base);
  width: 18px;
  height: 18px;
  stroke-width: 2.4;
}
.rp-ticks--col {
  flex-direction: column;
  gap: 10px;
}
.rp-link {
  font-weight: 700;
  color: var(--uterpy-black);
  text-decoration: underline;
  text-underline-offset: 4px;
}
/* White variants for use on the brand-red insurance panel. Without these the
   button and links fell back to red-on-red and were invisible. */
.rp-btn--white {
  background: #fff !important;
  color: var(--uterpy-base, #C00000) !important;
  box-shadow: 0 10px 24px -12px rgba(0,0,0,.4);
}
.rp-btn--white:hover {
  background: #FBF0EF !important;
  transform: translateY(-2px);
}
.rp-btn--white svg,
.rp-btn--white .rp-ico { color: var(--uterpy-base, #C00000) !important; }
.rp-link--white {
  color: #fff !important;
  text-decoration-color: rgba(255,255,255,.7);
  text-underline-offset: 4px;
}
.rp-link--white:hover { color: #FBF0EF !important; }

/* ---- map details on phone -------------------------------------------- */
@media (max-width: 767px) {
  .therapy-two__content-list li {
    display: flex !important;
    gap: 12px;
    align-items: flex-start;
    text-align: left;
  }
  .therapy-two__content-list .icon-box {
    width: 48px !important;
    height: 48px !important;
    min-width: 48px;
    flex: none;
    margin: 0 !important;
  }
  .therapy-two__content-list .icon-box svg {
    width: 24px;
    height: 24px;
  }
  .therapy-two__content-list h2 {
    font-size: 17px !important;
    margin-top: 0 !important;
  }
  .therapy-two__content .title-box h2 {
    font-size: 22px !important;
    line-height: 1.25 !important;
  }
  .therapy-two__img-content {
    display: flex !important;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 8px;
    padding: 10px !important;
    background: transparent !important;
    scrollbar-width: none;
  }
  .therapy-two__img-content .thm-btn {
    flex: none;
    margin: 0 !important;
    padding: 8px 16px !important;
    border-radius: 999px !important;
    background: #fff !important;
    color: var(--uterpy-base) !important;
    border: 1px solid #f0c9c4 !important;
    font-size: 13.5px !important;
    line-height: 1.2;
  }
}

/* =======================================================================
   FIX PASS 2026-09-23. Repairs regressions on the shared layout.
   Loaded last so these win. Every rule here fixes a confirmed defect:
   ======================================================================= */

/* 1. CONTENT WAS INVISIBLE. animate.css is not loaded, so wow.js set every
   animated block to visibility:hidden and never revealed it. Most sections
   were blank. Force all wow content visible; our own reveal below adds the
   motion so nothing depends on the missing library. */
.wow {
  visibility: visible !important;
  opacity: 1 !important;
  animation-name: none !important;
}
/* Gentle, dependency-free entrance. Starts hidden only when JS is present and
   marks the page; reveals on scroll. If JS never runs, content stays visible. */
.rp-anim .wow.rp-pre { opacity: 0 !important; transform: translateY(20px); }
.rp-anim .wow.rp-seen {
  opacity: 1 !important; transform: none;
  transition: opacity .6s ease, transform .7s cubic-bezier(.2,.7,.2,1);
}
@media (prefers-reduced-motion: reduce) {
  .rp-anim .wow.rp-pre { opacity: 1 !important; transform: none; }
}

/* 2. BUTTONS 93px TALL. .thm-btn inherited line-height:65px from their bundle,
   which plus padding made every primary button ~93px. Normalise it. */
.thm-btn {
  line-height: 1.15 !important;
  padding: 15px 30px !important;
  min-height: 52px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px;
}

/* 3. BUTTONS COLLAPSED TO 18px. The .rp-btn base had no display, so <a>
   elements collapsed to text height. Give it the flex box it always needed. */
.rp-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 52px !important;
  padding: 0 26px !important;
  gap: 8px;
  line-height: 1.15 !important;
}
.rp-btn--wa { background: var(--rp-wa, #25D366) !important; color: #fff !important; }
.rp-btn--wa:hover { background: var(--rp-wa-deep, #128C7E) !important; }
.rp-btn--wa svg, .rp-btn--wa .rp-ico { color: #fff !important; }

/* 4. SECTION CTAs LEFT-ALIGNED. Their sections are centred but the CTA row was
   flush left, floating oddly under centred content. Centre them. */
.rp-cta-row {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  flex-wrap: wrap;
}

/* 5. Icons inside buttons keep a consistent size. */
.thm-btn svg, .thm-btn .rp-ico,
.rp-btn svg, .rp-btn .rp-ico { width: 18px; height: 18px; flex: none; }
"""


def main():
    if not os.path.isdir(RAW):
        sys.exit('\n  No mirror yet. Run: python scripts/mirror-247-site.py\n')

    global ICON
    ICON = icons()

    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    shutil.copytree(RAW, OUT)

    index = os.path.join(OUT, 'index.html')
    h = io.open(index, encoding='utf-8', errors='replace').read()
    print('\n  content edits:')

    # ------------------------------------------------------------ our sheet
    h = one(h, '</head>', '<link rel="stylesheet" href="%s/assets/repositioning.css">\n</head>' % PREFIX,
            '2', 'repositioning.css loaded after their bundle, which is untouched')

    # First-party measurement is injected before </body> further down (section 5),
    # in the generator, so every page including the inner ones carries it and a
    # rebuild never loses it. Token 247clinic is the dashboard row in lib/sites.php.

    # ------------------------------------------------------------ 4. nav
    h = sub(h, r'<ul class="main-menu__list">[\s\S]*?</ul>', nav(), '4',
            'Navigation simplified to the seven items, Beauty, Blog and FAQs moved out, WhatsApp button added')

    # ----------------------------------------------------------- 6. hero
    # Their slider, their look, three slides of brief copy. The first plays our
    # Le Reve film. The carousel clones slides for its loop; the page script
    # turns the h1 in each clone into a div and drops the clone's film, so the
    # page keeps one h1 and downloads the film once.
    first = h.find('<!--Start Main Slider Two Single-->')
    ctrl = h.find('<div class="owl-theme">', first)
    if first >= 0 and ctrl > first:
        close = h.rfind('</div>', first, ctrl)
        h = h[:first] + hero_slides() + '            ' + h[close:]
        note('6', 'Hero: their slider with three brief slides, our Le Reve film on the first, one h1')
    else:
        print('   SKIPPED, hero slides not found')

    # -------------------------------------------------- 7. accreditation
    h = one(h, '<!--Start About One-->', accreditation() + '<!--Start About One-->',
            '7', 'Accreditation block with the UCA, GHA and GMWA marks, directly under the hero')

    # ------------------------------------------ 8. what is 24/7 Clinic?
    h = sub(h, r'<h2 class="sec-title__title">Welcome to\s*<span>24/7</span>\s*Clinic</h2>',
            '<h2 class="sec-title__title">Medical Care Without Leaving Your Resort</h2>', '8',
            'About block heading rewritten')
    h = sub(h, r'(<div class="about-one__content-text1">\s*<p>)[\s\S]*?(</p>)',
            r'\1When you become ill or injured while travelling, visiting a hospital should not always be the first step.\2'
            r'\n<p>24/7 Clinic brings urgent and primary medical care directly into hotels and resorts, allowing international guests to receive medical consultation, diagnostics and treatment close to their hotel room.</p>',
            '8', 'About block opening text rewritten')
    h = sub(h, r'(<div class="about-one__content-text2-text">\s*)<ul>[\s\S]*?</ul>',
            r'\1<p class="rp-highlight"><b>Hospital care when necessary - not automatically.</b></p>'
            r'<div class="rp-cta-row rp-cta-row--left"><a class="thm-btn" href="#rp-find">Find a Clinic</a></div>',
            '8', 'About block list replaced with the highlighted line and Find a Clinic')
    h = sub(h, r'(<div class="about-one__content-text3">\s*<div class="right-content">\s*<p>)[\s\S]*?(</p>)',
            r'\1Our medical teams can manage a wide range of conditions on-site and coordinate hospital care only when medically necessary.\2',
            '8', 'About block closing text rewritten')

    # ------------------------------------- 9 and 10, replacing Services One
    h = between(h, '<!--Start Services One-->', '<!--Start Banner One-->', services() + why_hotel(),
                '9, 10', 'Why hotel-based care, four cards, then What We Can Treat On-Site, six cards')

    # ----------------------------- 11, 12 and 13, replacing Banner One
    h = between(h, '<!--Start Banner One-->', '<!--Start Counter One -->',
                insurance() + how_it_works() + team_films() + find_clinic(),
                '11, 12, 13', 'Insurance and cashless care, how it works, find a clinic with the landing pages linked')

    # ---------------------------------------------------------- 14. numbers
    h, n = re.subn(r'(<span class="odometer" data-count="(\d+)">)00(</span>)', r'\g<1>\g<2>\g<3>', h)
    if n:
        note('14', 'Counters print their real values instead of 00 (%d)' % n)
    h = sub(h, r'<!--Start Counter One Single-->\s*<div class="col-xl-3 col-lg-6 col-md-6">'
               r'(?:(?!<!--Start Counter One Single-->)[\s\S])*?International Patients</p>\s*</div>\s*</div>\s*</div>',
            '', '14', 'International Patients counter removed, it repeated the staff figure and cannot be verified')
    a = h.find('<!--Start Counter One -->')
    b = h.find('<!--Start Therapy Two-->', a)
    if a >= 0 and b > a:
        h = h[:a] + h[a:b].replace('col-xl-3 col-lg-6 col-md-6', 'col-xl-4 col-lg-4 col-md-6') + h[b:]

    # ---------------------------------------------------------- 15 and 31
    h = one(h, 'What our Patients Says', 'What Our Patients Say', '15', 'Testimonials heading corrected')
    h = one(h, '<!--Start Blog Two-->', guest_stories() + '<!--Start Blog Two-->', '15',
            'Guest story films under the written reviews')
    h = h.replace('North Cost', 'North Coast')

    # ---------------------------------------------------------- 16. final CTA
    # Placed above their red newsletter band rather than below it. Directly
    # before the footer, two red bands stacked into one block.
    h = one(h, '<!--Start Subscribe One-->', final_cta() + '<!--Start Subscribe One-->',
            '16', 'Final call to action, above the newsletter band')
    h = one(h, 'Subscribe to recieve', 'Subscribe to receive', '31', 'Fixed "recieve"')

    # Section 30 and 31: "Remove Lorem Ipsum." Their first blog card's excerpt is
    # the template's lorem ipsum. The excerpt is removed rather than rewritten:
    # writing a summary of an article is new copy, and that is theirs to supply.
    h = sub(h, r'<p>\s*Lorem ipsum[\s\S]*?</p>', '', '30, 31',
            'Lorem ipsum excerpt removed from the blog card', count=0)

    # -------------------------------------------- 39. links that go nowhere
    n = h.count('href=""')
    if n:
        h = h.replace('href=""', 'href="/our-clinics"')
        note('39', '%d empty links pointed at Our Clinics' % n)

    # ----------------------------------------------------- section order
    # Find a clinic, their numbers band and their clinic map belong together
    # and belong at the end, right before the final call to action.
    fa = h.find('<!--Start Repositioning Find a Clinic-->')
    tt = h.find('<!--Start Testimonial One-->')
    if 0 <= fa < tt:
        chunk = h[fa:tt]
        h = h[:fa] + h[tt:]
        fc = h.find('<!--Start Repositioning Final CTA-->')
        h = h[:fc] + chunk + h[fc:]
        note('2', 'Order: Find a Clinic, numbers and map moved to the end, before the final call to action')
    else:
        print('   SKIPPED, section order')

    # --------------------------------------------------- 39. their map bug
    # Their page calls initMap on DOMContentLoaded, before the async Maps API
    # has loaded, so every visit throws "google is not defined". The API's own
    # callback=initMap already calls it once the library is ready.
    h = sub(h, r"document\.addEventListener\('DOMContentLoaded', function \(\) \{\s*initMap\(\);\s*\}\);", '',
            '39', 'Map: removed the early initMap call that threw "google is not defined"')
    h = one(h, 'function initMap() {', "function initMap() {\n            if (typeof google === 'undefined') return;",
            '39', 'Map: initMap guarded')

    # Footer credit, his instruction 2026-09-19. No link: no URL was given.
    h = sub(h, r'Powered by\s*<a href="https://innovixsolutions\.com"[^>]*>Innovix Solutions</a>',
            'Powered by Pulse Marketing', '2', 'Footer credit: Powered by Pulse Marketing')

    # Light footer (his rule: no black backgrounds), so it takes the red logo.
    h = one(h, 'clinic-logo-white.svg" class="w-25"', 'clinic-logo.svg" class="w-25"', '2',
            'Footer logo in colour for the light footer')

    # Footer links: comprehensive grid interlinking all 11 inner pages
    footer_links = """<ul class="footer-widget__service-list list-unstyled clearfix rp-footer-grid">
                                    <li><a href="/services">Medical Services</a></li>
                                    <li><a href="/hotel-clinics">Hotel Clinic Concept</a></li>
                                    <li><a href="/insurance">Insurance &amp; Cashless</a></li>
                                    <li><a href="/for-insurance">For Insurers</a></li>
                                    <li><a href="/our-clinics">Find a Clinic</a></li>
                                    <li><a href="/for-hotels">For Hotels &amp; Partners</a></li>
                                    <li><a href="/beauty-wellness">Beauty &amp; Wellness</a></li>
                                    <li><a href="/accreditation">Accreditation</a></li>
                                    <li><a href="/about-us">About Us</a></li>
                                    <li><a href="/faq">FAQ</a></li>
                                    <li><a href="/contact-us">Contact Us</a></li>
                                </ul>"""
    h = sub(h, r'<ul class="footer-widget__service-list list-unstyled clearfix">[\s\S]*?</ul>',
            footer_links, '2', 'Footer links updated with all 11 inner pages')

    # ---------------------------------------------------- 5. floating WhatsApp & tracking
    fp_tracking = '\n<!-- HCIG First-Party Measurement: 24/7 Clinic -->\n<script src="https://www.medparkhospitals.com/dashboard/t.js?s=247clinic" defer></script>\n'
    h = one(h, '</body>', floating() + fp_tracking + '</body>', '5', 'Floating WhatsApp button, mobile sticky bar, and first-party tracking')

    io.open(index, 'w', encoding='utf-8').write(h)

    # ------------------------------------------------------- inner pages
    # Phase 2 of the brief, section 40. Their header and footer wrapped around
    # sections built from content/247clinic/en/*.json, which is WEBSITE.docx
    # word for word. Their live URLs are kept: /services, /insurance,
    # /our-clinics, /about-us and /contact-us all return 200 today, and the
    # ranking they already have is worth more than a tidier slug.
    print('\n  inner pages:')
    import build_247_inner
    INNER = build_247_inner.build(OUT, h, PREFIX, wa(WA_HOME), svg('wa'), final_cta(),
                                  nav_for=nav)

    # ------------------------------------------------ our files, then paths
    io.open(os.path.join(OUT, 'assets', 'repositioning.css'), 'w', encoding='utf-8').write(REPOSITIONING_CSS)
    rp = os.path.join(OUT, 'assets', 'rp')
    os.makedirs(rp, exist_ok=True)
    for f in ('c7n-urgent.webp', 'c7n-injury.webp', 'c7n-lab.webp', 'c7n-specialist.webp', 'c7n-roomvisit.webp'):
        shutil.copyfile(os.path.join('src', 'assets', f), os.path.join(rp, f))
    shutil.copyfile(os.path.join('src', 'assets', 'px-resort-lereve.webp'), os.path.join(rp, 'resort.webp'))
    # Their jpgs are gitignored here (*.jpg), so they are carried as webp.
    from PIL import Image
    for src, dst in (('photos/home-banners/slider-v2-img2_2_lg.jpg', 'hero-room.webp'),
                     ('photos/home-banners/247 insurance with overlay_lg.jpg', 'hero-insurance.webp'),
                     ('photos/serviceCategories/Urgent Care Services_lg.jpg', 'svc-iv.webp')):
        Image.open(os.path.join(RAW, src)).convert('RGB').save(os.path.join(rp, dst), 'WEBP', quality=86)
    acc = os.path.join(OUT, 'assets', 'accreditation')
    os.makedirs(acc, exist_ok=True)
    for f in ('c7acc-uca.png', 'c7acc-gha.png', 'c7acc-gmwa.png'):
        shutil.copyfile(os.path.join('src', 'assets', f), os.path.join(acc, f))

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

    for sec, what in edits:
        print('   section %-10s %s' % (sec, what))
    print('\n  paths rewritten in %d files' % touched)
    print('  %s built from %s\n' % (OUT, RAW))


if __name__ == '__main__':
    main()
