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

NOT_MIRRORED = [
    '/services', '/insurance', '/our-clinics', '/about-us', '/contact-us',
    '/beauty-wellness', '/blog', '/faqs', '/article/',
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
    return text


# ---------------------------------------------------------------- the blocks

def nav():
    """Section 4. Beauty & Wellness, Blog and FAQ move to the footer."""
    items = [
        ('/', 'Home'),
        ('/services', 'Medical Services'),
        ('/insurance', 'Insurance & Cashless Care'),
        ('/our-clinics', 'Find a Clinic'),
        # No partner page exists yet (section 24, Phase 2). Contact is where a
        # partnership enquiry goes today, so the item works rather than 404s.
        ('/contact-us', 'For Hotels & Partners'),
        ('/about-us', 'About Us'),
        ('/contact-us', 'Contact'),
    ]
    lis = '\n'.join('<li><a href="%s">%s</a></li>' % (h, t.replace('&', '&amp;')) for h, t in items)
    return ('<ul class="main-menu__list">\n%s\n</ul>\n'
            '<a class="rp-head-wa" href="%s" target="_blank" rel="noopener" data-ev="whatsapp_medical_click">'
            '%s<span class="rp-long">WhatsApp Us 24/7</span><span class="rp-short">Need a Doctor?</span></a>'
            % (lis, wa(WA_HOME), svg('wa')))


FILM = 'https://hcig-passport.vercel.app/assets/'


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
        hero_slide('/photos/home-banners/slider-v2-img2_2_lg.jpg',
                   '24/7 Medical Care &bull; Cashless Insurance &bull; Multilingual Support',
                   '<h1>Urgent Medical Care. Right Inside Your Hotel.</h1>',
                   '24/7 Clinic operates a network of on-site urgent care clinics inside hotels and resorts across Egypt&rsquo;s leading tourist destinations, giving international travelers fast access to medical care without unnecessary hospital visits.',
                   wa_btn, '<a href="#rp-find">Find Your Clinic</a>', film='v-commercial.mp4', trust=True),
        hero_slide('/assets/rp/resort.webp',
                   'On-Site Hotel Clinics',
                   '<h2>Medical Care Without Leaving Your Resort</h2>',
                   '24/7 Clinic brings urgent and primary medical care directly into hotels and resorts, allowing international guests to receive medical consultation, diagnostics and treatment close to their hotel room.',
                   '<a class="thm-btn" href="#rp-find">Find a Clinic</a>', '<a href="/services">View All Medical Services</a>'),
        hero_slide('/photos/home-banners/247 insurance with overlay_lg.jpg',
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
                <button class="rp-sound" type="button" aria-pressed="false">%sSound</button>
            </div>
            <div class="rp-grid rp-grid--2">%s</div>
        </div>
    </div>
</section>
""" % (FILM, svg('play') if 'play' in ICON else '', body)

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
        src = '/assets/rp/%s' % img if img else '/photos/serviceCategories/Urgent Care Services_lg.jpg'
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
    <div class="container_lg">
        <div class="sec-title text-center">
            <div class="sec-title__tagline"><h6>Our Services</h6></div>
            <h2 class="sec-title__title">What We Can Treat On-Site</h2>
        </div>
        <div class="row">%s</div>
        <div class="rp-cta-row"><a class="thm-btn" href="/services">View All Medical Services</a></div>
    </div>
</section>
""" % ''.join(cards)

def insurance():
    """Section 11 in their own Banner One block, which the first pass had
    removed: their icon, their insurance photo, now on brand red. Cashless care
    is never promised universally."""
    items = ['Insurance verification', 'Guarantee of Payment coordination', 'Direct communication with the insurer',
             'Medical documentation', 'Billing coordination', 'Cashless treatment where approved']
    ticks = ''.join('<li>%s%s</li>' % (svg('check'), t) for t in items)
    return """<!--Start Banner One-->
<section class="banner-one container_lg rp-banner">
    <div class="row">
        <div class="col-lg-6 p-sm-5 p-4 wow fadeInLeft" data-wow-delay="0.1s">
            <div class="d-sm-flex align-items-start">
                <svg width="120" height="160" class="me-sm-5 me-4 mb-3 rp-banner__tag"><use xlink:href="/assets/images/svg/master.svg#hospital-tag"></use></svg>
                <div>
                    <h2 class="sec-title__title text-white fw-normal mb-2">Travelling With Medical Insurance?</h2>
                    <p class="rp-banner__sub">We Can Coordinate Directly With Your Insurer</p>
                    <p class="my-1">24/7 Clinic works with international travel insurers and assistance companies worldwide.</p>
                    <p class="my-1">Where insurance approval and policy conditions allow, we can arrange cashless medical treatment, meaning the patient may not need to pay the full medical cost upfront and claim it back later.</p>
                    <p class="rp-banner__label">Our team can assist with:</p>
                    <ul class="rp-ticks rp-ticks--2">%s</ul>
                    <div class="rp-cta-row rp-cta-row--left">
                        <a class="rp-btn rp-btn--white rp-shine" href="%s" target="_blank" rel="noopener" data-ev="whatsapp_insurance_click">%sCheck Your Insurance on WhatsApp</a>
                        <a class="rp-link rp-link--white" href="/insurance">Learn About Insurance &amp; Cashless Care</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-6 px-0 right-side wow fadeInRight" data-wow-delay="0.2s">
            <img src="/assets/images/backgrounds/insurance.webp" class="w-100" alt="Health insurance" loading="lazy">
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
        <button class="rp-sound" type="button" aria-pressed="false">Sound</button>
    </div>""" % (0.1 + k * 0.15, FILM, f, label) for k, (f, label) in enumerate(films))
    return """<!--Start Repositioning Team Films-->
<section class="rp-sec rp-films">
    <div class="container">
        <div class="sec-title text-center">
            <div class="sec-title__tagline"><h6>24/7 Clinic</h6></div>
            <h2 class="sec-title__title">You&rsquo;re far from home, but not far from help.</h2>
        </div>
        <div class="rp-films__row">%s</div>
    </div>
</section>
""" % cards


def guest_stories():
    """Their guest films, the same six the landing pages carry, as a rail under
    their written reviews. Portrait and landscape keep their own shape: the
    rail fixes the height and each card takes the film's width. Flags only
    where the film names the country."""
    films = [
        ('v-story-italy.mp4', 'it', 'Guest story, Italy', 'p'),
        ('v-story-romania-family.mp4', 'ro', 'Guest story, a family from Romania', 'l'),
        ('v-story-scotland.mp4', 'gb', 'Guest story, Scotland', 'p'),
        ('v-story-poland.mp4', 'pl', 'Guest story, Poland', 'l'),
        ('v-story-romania-iv.mp4', 'ro', 'Guest story, Romania', 'p'),
        ('v-story-scooter.mp4', None, 'Guest story, a scooter accident', 'p'),
    ]
    cards = ''.join("""<figure class="rp-story rp-story--%s wow fadeInUp" data-wow-delay="%.2fs">
        <video class="rp-lazy" data-src="%s%s" muted loop playsinline preload="none" aria-label="%s"></video>
        %s
        <button class="rp-sound" type="button" aria-pressed="false">Sound</button>
    </figure>""" % (shape, 0.05 + k * 0.08, FILM, f, label,
                    ('<img class="rp-story__flag" src="%sc7flag-%s.svg" alt="" width="30" height="21">' % (FILM, flag)) if flag else '')
        for k, (f, flag, label, shape) in enumerate(films))
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
        <div class="rp-stories__rail" tabindex="0">%s</div>
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
    body = ''.join('<a class="rp-place wow fadeInUp" data-wow-delay="%.2fs" href="%s">%s<span><b>%s</b><small>%s</small></span></a>'
                   % (0.05 + k * 0.07, h, svg('pin'), d, s) for k, (d, s, h) in enumerate(places))
    return '''<!--Start Repositioning Find a Clinic-->
<section class="rp-sec" id="rp-find">
    <div class="container">
        <div class="sec-title text-center"><h2 class="sec-title__title">Find a 24/7 Clinic Near You</h2></div>
        <p class="rp-lead">Our clinics are located inside hotels and resorts across Egypt&rsquo;s major tourism destinations.</p>
        <div class="rp-places">%s</div>
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
<script>
(function(){
  var calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  document.querySelectorAll('.rp-sound').forEach(function(b){b.addEventListener('click',function(){
    var v=b.parentNode.querySelector('video');if(!v.src)v.src=v.dataset.src;v.muted=!v.muted;
    b.setAttribute('aria-pressed',String(!v.muted));v.play().catch(function(){})})});
  document.querySelectorAll('.rp-arrow').forEach(function(b){b.addEventListener('click',function(){
    var r=document.querySelector('.rp-stories__rail');r.scrollBy({left:(+b.dataset.dir)*r.clientWidth*.8,behavior:calm?'auto':'smooth'})})});
  /* The step rail draws itself when it comes into view. */
  var rail=document.querySelector('.rp-steps');
  if(rail&&'IntersectionObserver' in window){new IntersectionObserver(function(es,o){es.forEach(function(e){
    if(e.isIntersecting){rail.classList.add('rp-drawn');o.disconnect()}})},{threshold:.3}).observe(rail)}else if(rail)rail.classList.add('rp-drawn');
  /* Spotlight cards: the glow follows the pointer. */
  document.querySelectorAll('.rp-spot').forEach(function(c){
    c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();
      c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')});
  });
})();
</script>
''' % (wa(WA_HOME), svg('wa'), wa(WA_HOME), svg('wa'))


REPOSITIONING_CSS = r"""/* Repositioning, applied on top of their own stylesheet.
   Their bundle.min.css is untouched. Delete this file and the site is theirs
   again. Every rule is namespaced rp- so nothing of theirs is overridden by
   accident, except the three hero rules marked below, which exist because the
   headline is now an h1 and their theme only styles an h2 there. */

.rp-ico{width:22px;height:22px;flex:none;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}

/* ---- hero: the headline is the page's first and only h1 ---------------- */
/* Their slider, their type, their shapes. Our film sits over the photo on
   the first slide, under a light shade on the reading side only. */
.rp-hero-film{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1}
.rp-hero-shade{position:absolute;inset:0;z-index:1;pointer-events:none;
  background:linear-gradient(90deg,rgba(20,8,8,.5) 0%,rgba(20,8,8,.28) 45%,rgba(20,8,8,0) 75%)}
.main-slider-two .shape3,.main-slider-two .shape4{z-index:2}
.main-slider-two__single .container{position:relative;z-index:3}
.main-slider-two__content .title h1,.main-slider-two__content .title .rp-h1{color:#fff;font-size:60px;line-height:1.08;font-weight:700;
  font-family:var(--uterpy-font-two);margin:0;text-shadow:0 2px 24px rgba(0,0,0,.25)}
@media (max-width:1199px){.main-slider-two__content .title h1,.main-slider-two__content .title .rp-h1{font-size:54px}}
@media (max-width:767px){.main-slider-two__content .title h1,.main-slider-two__content .title .rp-h1,.main-slider-two__content .title h2{font-size:34px!important}}
.rp-hero-text{color:rgba(255,255,255,.95);font-size:18px;line-height:1.6;max-width:600px;margin:18px 0 0;text-shadow:0 1px 12px rgba(0,0,0,.3)}
.main-slider-two .active .rp-hero-text,.main-slider-two .active .rp-trust{animation:rp-rise .9s cubic-bezier(.22,.61,.36,1) 1.3s both}
@keyframes rp-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.rp-trust{display:inline-flex;align-items:center;gap:12px;margin:22px 0 0;padding:8px 16px 8px 8px;border-radius:999px;
  background:rgba(255,255,255,.92);color:var(--uterpy-black);font-weight:600;font-size:14.5px}
.rp-trust img{width:36px!important;height:36px!important;max-width:36px!important;object-fit:contain;flex:none;border-radius:50%;margin:0!important}
.rp-trust{white-space:nowrap;max-width:100%}
@media (max-width:420px){.rp-trust{white-space:normal;font-size:13px;border-radius:18px}}
.rp-wa-btn{display:inline-flex!important;align-items:center;gap:10px}
.rp-wa-btn .rp-ico{width:20px;height:20px}
@media (max-width:767px){
  .rp-hero-text{font-size:16px}
  .main-slider-two__content .main-slider-one__content-btn{flex-direction:column;align-items:stretch}
  .main-slider-one__content-btn .btn-two{margin-left:0;margin-top:12px}
  .main-slider-one__content-btn a{display:flex;justify-content:center;text-align:center}
  .rp-hero-shade{background:rgba(20,8,8,.42)}
}
.main-slider-two__content .tagline .text-box p{white-space:normal}

/* ---- services, in their block: text under the title, image zoom ------- */
.rp-services .services-one__single{height:calc(100% - 30px)}
.rp-services .services-one__single-img .inner{display:block;overflow:hidden}
.rp-services .services-one__single-img img{aspect-ratio:57/34;object-fit:cover;width:100%;transition:transform 1.2s cubic-bezier(.22,.61,.36,1)}
.rp-services .services-one__single:hover .services-one__single-img img{transform:scale(1.08)}
.rp-svc__text{margin:10px 0 0;font-size:15.5px;line-height:1.6;color:#5b5b5b}
.rp-services .services-one__single-content-inner h2{font-size:22px;line-height:1.3}

/* ---- why: their film beside the cards --------------------------------- */
.rp-why__in{display:grid;grid-template-columns:.75fr 1.25fr;gap:32px;align-items:start}
.rp-grid--2{grid-template-columns:1fr 1fr}
@media (max-width:991px){.rp-why__in{grid-template-columns:1fr}.rp-reel{max-width:360px;margin:0 auto}}
@media (max-width:575px){.rp-grid--2{grid-template-columns:1fr}}
.rp-reel,.rp-film,.rp-story{position:relative;overflow:hidden;border-radius:22px;background:#e9e4de;margin:0}
.rp-reel{aspect-ratio:9/16;max-height:640px;box-shadow:0 30px 60px -34px rgba(120,20,20,.55)}
.rp-reel video,.rp-film video,.rp-story video{width:100%;height:100%;object-fit:cover;display:block}
.rp-sound{position:absolute;right:12px;bottom:12px;display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 16px;
  border:0;border-radius:999px;background:rgba(255,255,255,.92);color:#15120f;font-weight:700;font-size:13px;cursor:pointer;
  transition:background .2s,color .2s}
.rp-sound .rp-ico{width:16px;height:16px}
.rp-sound[aria-pressed="true"]{background:var(--uterpy-base);color:#fff}

/* ---- insurance: their banner, on brand red ------------------------------ */
.rp-banner.banner-one{background:var(--uterpy-base);border-radius:24px;overflow:hidden;margin:100px auto}
.rp-banner .right-side{position:relative;min-height:320px}
.rp-banner .right-side img{height:100%;object-fit:cover}
.rp-banner .right-side::before{background-image:linear-gradient(to left,rgba(192,0,0,0),rgba(192,0,0,.15),#C00000)!important;z-index:1}
.rp-banner__tag{flex:none;fill:#fff;stroke:#fff}
.rp-banner__sub{font-size:20px;font-weight:700;color:#fff;margin:0 0 12px}
.rp-banner p{color:rgba(255,255,255,.92)}
.rp-banner__label{font-weight:700;color:#fff!important;margin:16px 0 0}
.rp-banner .rp-ticks--2{display:grid!important;grid-template-columns:1fr 1fr;gap:10px 22px;align-items:start}
.rp-banner .rp-ticks--2 li{align-items:flex-start;line-height:1.35}
@media (max-width:575px){.rp-banner .rp-ticks--2{grid-template-columns:1fr}}
.rp-banner .rp-ticks li{color:#fff}
.rp-banner .rp-ticks .rp-ico{color:#fff}
.rp-btn--white{background:#fff;color:var(--uterpy-base)}
.rp-btn--white:hover{background:#fff4f3;color:var(--uterpy-base)}
.rp-link--white{color:#fff!important}
@media (max-width:991px){.rp-banner.banner-one{margin:64px 12px;border-radius:18px}}

/* ---- step rail draws itself ------------------------------------------- */
.rp-steps:before{transform:scaleX(0);transform-origin:left;transition:transform 1.6s cubic-bezier(.22,.61,.36,1) .2s}
.rp-steps.rp-drawn:before{transform:none}
@media (max-width:991px){.rp-steps:before{transform:scaleY(0);transform-origin:top}.rp-steps.rp-drawn:before{transform:none}}

/* ---- team films ---------------------------------------------------------- */
.rp-films__row{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1000px;margin:0 auto}
.rp-film{aspect-ratio:9/16;box-shadow:0 26px 50px -32px rgba(120,20,20,.5);transition:transform .4s}
.rp-film:hover{transform:translateY(-6px)}
@media (max-width:767px){.rp-films__row{grid-template-columns:none;grid-auto-flow:column;grid-auto-columns:72%;overflow-x:auto;
  scroll-snap-type:x mandatory;padding-bottom:8px}.rp-film{scroll-snap-align:center}}

/* ---- guest story rail ---------------------------------------------------- */
.rp-stories{padding:10px 0 90px;background:#f7f5f4}
.rp-stories__head{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}
.rp-stories__nav{display:flex;gap:10px}
.rp-arrow{width:48px;height:48px;border-radius:50%;border:1.5px solid var(--uterpy-black);background:#fff;font-size:20px;cursor:pointer;
  transition:background .2s,color .2s}
.rp-arrow:hover{background:var(--uterpy-black);color:#fff}
.rp-stories__rail{display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 2px 14px;scrollbar-width:thin}
.rp-story{flex:none;height:440px;scroll-snap-align:start;box-shadow:0 24px 44px -30px rgba(80,10,10,.5)}
.rp-story--p{aspect-ratio:9/16}
.rp-story--l{aspect-ratio:16/9}
.rp-story__flag{position:absolute;left:14px;top:14px;border-radius:4px;box-shadow:0 0 0 2px #fff}
@media (max-width:767px){.rp-story{height:380px}}

/* ---- header WhatsApp button ------------------------------------------- */
/* Their header sets the menu box to display:block at a higher specificity,
   which dropped the button onto a second row. Seven menu items at their 54px
   spacing also leave no room for it, so the spacing tightens to 30px. */
.main-menu .main-menu__main-menu-box,.stricky-header .main-menu__main-menu-box{display:flex!important;align-items:center;flex-wrap:nowrap}
.main-menu .main-menu__list>li+li,.stricky-header .main-menu__list>li+li{margin-left:30px}
.main-menu .main-menu__list>li>a,.stricky-header .main-menu__list>li>a{font-size:16px;white-space:nowrap}
.rp-head-wa{display:inline-flex;align-items:center;gap:8px;margin-left:26px;padding:11px 18px;border-radius:999px;
  background:#25D366;color:#fff!important;font-weight:700;font-size:15px;white-space:nowrap;text-decoration:none;flex:none}
.rp-head-wa:hover{background:#128C7E}
.rp-head-wa .rp-ico{width:19px;height:19px}
.rp-head-wa .rp-short{display:none}
@media (max-width:1439px){.rp-head-wa .rp-long{display:none}.rp-head-wa .rp-short{display:inline}}

/* ---- shared section rhythm ------------------------------------------- */
.rp-sec{padding:100px 0}
.rp-sec--tint{background:#f7f5f4}
@media (max-width:767px){.rp-sec{padding:64px 0}}
.rp-lead{text-align:center;max-width:640px;margin:-20px auto 36px;font-size:18px;color:#555}
.rp-grid{display:grid;gap:24px;margin-top:10px}
.rp-grid--3{grid-template-columns:repeat(3,1fr)}
.rp-grid--4{grid-template-columns:repeat(4,1fr)}
@media (max-width:1199px){.rp-grid--4{grid-template-columns:repeat(2,1fr)}}
@media (max-width:991px){.rp-grid--3{grid-template-columns:repeat(2,1fr)}}
@media (max-width:575px){.rp-grid--3,.rp-grid--4{grid-template-columns:1fr}}
.rp-card{background:#fff;border:1px solid #ece7e4;border-radius:14px;padding:30px 26px}
.rp-card__i{display:inline-grid;place-items:center;width:54px;height:54px;border-radius:50%;
  background:rgba(var(--uterpy-base-rgb),.1);color:var(--uterpy-base);margin-bottom:18px}
.rp-card h3{font-size:21px;line-height:1.3;margin:0 0 10px;font-weight:700}
.rp-card p{margin:0;font-size:16px;line-height:1.65;color:#5b5b5b}
.rp-cta-row{display:flex;flex-wrap:wrap;gap:14px 26px;align-items:center;justify-content:center;margin-top:44px}
.rp-cta-row--left{justify-content:flex-start;margin-top:28px}
.rp-link{font-weight:700;color:var(--uterpy-black);text-decoration:underline;text-underline-offset:4px}
.rp-ticks{list-style:none;padding:0;margin:18px 0 0;display:flex;flex-wrap:wrap;gap:10px 26px}
.rp-ticks li{display:inline-flex;align-items:center;gap:9px;font-weight:600;font-size:16px}
.rp-ticks .rp-ico{color:var(--uterpy-base);width:19px;height:19px;stroke-width:2.4}
.rp-ticks--col{flex-direction:column;gap:12px}

/* ---- accreditation --------------------------------------------------- */
.rp-acc{background:#fff;border-bottom:1px solid #ece7e4;padding:54px 0}
.rp-acc__in{display:grid;grid-template-columns:1.2fr .8fr;gap:48px;align-items:center}
@media (max-width:991px){.rp-acc__in{grid-template-columns:1fr;gap:30px}}
.rp-acc h2{font-size:34px;line-height:1.25;margin:0 0 12px;font-weight:700}
.rp-acc p{margin:0;font-size:17px;line-height:1.65;color:#555;max-width:640px}
.rp-acc__marks{display:flex;flex-wrap:wrap;gap:22px 40px;justify-content:flex-end;align-items:flex-start}
@media (max-width:991px){.rp-acc__marks{justify-content:flex-start}}
.rp-acc__group{display:flex;flex-direction:column;gap:10px}
.rp-acc__label{margin:0!important;font-size:12px!important;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#888!important;max-width:260px}
.rp-acc__row{display:flex;gap:26px;align-items:flex-start}
.rp-mark{margin:0;width:118px;text-align:center}
.rp-mark img{display:block;margin:0 auto;width:auto}
.rp-mark--round img{height:84px}
.rp-mark--wide img{height:58px;margin:13px auto}
.rp-mark figcaption{margin-top:9px;font-size:12px;line-height:1.35;color:#777}

/* ---- insurance ------------------------------------------------------- */
.rp-ins__in{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
@media (max-width:991px){.rp-ins__in{grid-template-columns:1fr;gap:30px}}
.rp-ins .sec-title{margin-bottom:14px}
.rp-ins__sub{font-size:21px;font-weight:700;color:var(--uterpy-base);margin:0 0 16px}
.rp-ins p{font-size:17px;line-height:1.7;color:#555}
.rp-ins__box{background:#f7f5f4;border-radius:16px;padding:36px}
.rp-ins__label{font-weight:700;color:var(--uterpy-black)!important;margin:0}

/* ---- how it works ---------------------------------------------------- */
.rp-step{background:#fff;border:1px solid #ece7e4;border-radius:14px;padding:30px 26px}
.rp-step__n{display:inline-grid;place-items:center;width:46px;height:46px;border-radius:50%;background:var(--uterpy-base);
  color:#fff;font-weight:700;font-size:19px;margin-bottom:16px}
.rp-step h3{font-size:20px;line-height:1.3;margin:0 0 10px;font-weight:700}
.rp-step p{margin:0;font-size:16px;line-height:1.65;color:#5b5b5b}

/* ---- find a clinic --------------------------------------------------- */
.rp-places{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
@media (max-width:991px){.rp-places{grid-template-columns:repeat(2,1fr)}}
@media (max-width:575px){.rp-places{grid-template-columns:1fr}}
.rp-place{display:flex;gap:12px;align-items:flex-start;padding:20px;border:1px solid #ece7e4;border-radius:14px;background:#fff;
  color:var(--uterpy-black);text-decoration:none;transition:border-color .2s,transform .2s}
.rp-place:hover{border-color:var(--uterpy-base);transform:translateY(-2px)}
.rp-place .rp-ico{color:var(--uterpy-base);margin-top:2px}
.rp-place b{display:block;font-size:18px}
.rp-place small{display:block;margin-top:3px;font-size:14px;color:#777;line-height:1.4}

/* ---- final CTA ------------------------------------------------------- */
/* Light, so it does not merge with their red newsletter band right below. */
.rp-final{background:#fff4f3;border-top:1px solid #f3dcd9;padding:64px 0}
.rp-final__in{display:flex;flex-wrap:wrap;gap:26px 40px;align-items:center;justify-content:space-between}
.rp-final h2{color:var(--uterpy-black);font-size:38px;line-height:1.2;margin:0 0 10px;font-weight:700}
.rp-final p{color:#555;font-size:18px;margin:0;max-width:560px}
.rp-final__btns{display:flex;flex-wrap:wrap;gap:12px}
.rp-btn{display:inline-flex;align-items:center;gap:9px;padding:16px 26px;border-radius:999px;font-weight:700;font-size:16px;text-decoration:none}
.rp-btn--wa{background:#25D366;color:#fff}
.rp-btn--wa:hover{background:#128C7E;color:#fff}
.rp-btn--ghost{background:#fff;color:var(--uterpy-base);border:1.5px solid var(--uterpy-base)}
.rp-btn--ghost:hover{background:var(--uterpy-base);color:#fff}

/* ---- floating WhatsApp, and the phone's sticky bar ------------------- */
.rp-float{position:fixed;right:20px;bottom:104px;z-index:9990;display:flex;align-items:center;gap:10px;padding:14px 20px;
  border-radius:999px;background:#25D366;color:#fff;font-weight:700;font-size:15px;text-decoration:none;
  box-shadow:0 14px 34px -12px rgba(18,140,126,.6)}
.rp-float:hover{background:#128C7E;color:#fff}
.rp-sticky{display:none}
@media (max-width:767px){
  .rp-float{display:none}
  .rp-sticky{position:fixed;left:10px;right:10px;bottom:10px;z-index:9990;display:flex;align-items:center;justify-content:center;
    gap:10px;padding:15px;border-radius:14px;background:#25D366;color:#fff;font-weight:700;font-size:16px;text-decoration:none;
    box-shadow:0 10px 30px -10px rgba(0,0,0,.35)}
  body{padding-bottom:78px}
}

/* ================= design upgrade, 2026-09-19 ================= */

/* ---- spotlight cards (ported from 21st.dev "Feature Grid Spotlight Cards") */
.rp-spot{position:relative;overflow:visible;border-radius:16px;transition:border-color .3s,transform .3s,box-shadow .3s}
.rp-spot:before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .3s;
  background:radial-gradient(220px circle at var(--mx,50%) var(--my,0%),rgba(192,0,0,.09),transparent 70%)}
.rp-spot:hover{border-color:#f0c9c4;transform:translateY(-4px);box-shadow:0 22px 40px -28px rgba(120,20,20,.35)}
.rp-spot:hover:before{opacity:1}
.rp-spot>*{position:relative}
.rp-x{position:absolute!important;width:14px;height:14px;pointer-events:none;opacity:.55}
.rp-x:before,.rp-x:after{content:"";position:absolute;background:var(--uterpy-base)}
.rp-x:before{left:0;right:0;top:50%;height:1px}
.rp-x:after{top:0;bottom:0;left:50%;width:1px}
.rp-x--a{top:-7px;left:-7px}
.rp-x--b{bottom:-7px;right:-7px}
.rp-card__i{width:58px;height:58px;border-radius:16px;background:#fff4f3;border:1px solid #f3dcd9;transition:background .3s,color .3s}
.rp-spot:hover .rp-card__i{background:var(--uterpy-base);color:#fff;border-color:var(--uterpy-base)}

/* ---- steps on a rail (ported from 21st.dev "How It Works Steps") ------- */
.rp-steps{list-style:none;margin:10px 0 0;padding:0;display:grid;grid-template-columns:repeat(4,1fr);gap:28px;position:relative}
.rp-steps:before{content:"";position:absolute;left:12.5%;right:12.5%;top:30px;height:2px;
  background:repeating-linear-gradient(90deg,var(--uterpy-base) 0 10px,transparent 10px 18px);opacity:.45}
.rp-steps .rp-step{position:relative;text-align:center;background:none;border:0;padding:0 8px}
.rp-steps .rp-step__n{position:relative;z-index:1;width:62px;height:62px;margin:0 auto 20px;border-radius:50%;
  background:#fff;border:2px solid var(--uterpy-base);color:var(--uterpy-base);font-size:18px;letter-spacing:.02em;
  box-shadow:0 0 0 8px #f7f5f4}
.rp-steps .rp-step:first-child .rp-step__n{background:var(--uterpy-base);color:#fff}
@media (max-width:991px){
  .rp-steps{grid-template-columns:1fr;gap:0}
  .rp-steps:before{left:30px;right:auto;top:10px;bottom:10px;width:2px;height:auto;
    background:repeating-linear-gradient(180deg,var(--uterpy-base) 0 10px,transparent 10px 18px)}
  .rp-steps .rp-step{text-align:left;padding:0 0 28px 88px}
  .rp-steps .rp-step__n{position:absolute;left:0;top:0;margin:0}
}

/* ---- buttons: pill with a shine sweep (Uiverse-style) ------------------ */
.rp-btn{justify-content:center;min-height:54px;padding:0 26px;transition:background .2s,color .2s,transform .15s}
.rp-btn:active{transform:scale(.98)}
.rp-btn .rp-ico{width:20px;height:20px}
.rp-shine{position:relative;overflow:hidden;isolation:isolate}
.rp-shine:after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:40%;z-index:-1;
  background:linear-gradient(100deg,transparent,rgba(255,255,255,.45),transparent);transform:skewX(-18deg);
  animation:rp-shine 4.5s ease-in-out infinite}
@keyframes rp-shine{0%,70%{left:-60%}100%{left:130%}}
.rp-btn--ghost{background:#fff;color:var(--uterpy-black);border:1.5px solid var(--uterpy-black)}
.rp-btn--ghost:hover{background:var(--uterpy-black);color:#fff}

/* ---- floating WhatsApp: pulse ring --------------------------------------- */
.rp-float{bottom:24px}
.rp-pulse{position:absolute;inset:0;border-radius:inherit;border:2px solid #25D366;animation:rp-pulse 2.4s ease-out infinite;pointer-events:none}
@keyframes rp-pulse{0%{opacity:.7;transform:scale(1)}100%{opacity:0;transform:scale(1.18,1.5)}}

/* ---- brand red: their theme ships #f45144, the 24/7 guideline is Classic
   Red #C00000. One variable, so every red on their page follows. ------- */
:root{--uterpy-base:#C00000;--uterpy-base-rgb:192,0,0}

/* ---- no black bands (his rule): top bar, numbers, reviews, footer ------ */
.main-header-one.style2 .main-header-one__top,.main-header-one.style2 .main-header-one__top-inner{background:#f7f5f4!important}
.main-header-one.style2 .main-header-one__top::before,.main-header-one.style2 .main-header-one__top-left::before{display:none!important}
.main-header-one__top{border-bottom:1px solid #ece7e4}
.main-header-one.style2 .main-header-one__top *{color:#3b3533!important}
.main-header-one.style2 .main-header-one__top [class^="icon-"]:before,.main-header-one.style2 .main-header-one__top [class*=" icon-"]:before{color:var(--uterpy-base)!important}
.site-footer--two .shape1,.site-footer--two .shape2,.site-footer--two .shape3{display:none!important}
.site-footer--two__pattern{background-image:none!important}
@media (max-width:767px){.rp-chips li{font-size:12.5px;padding:5px 10px 5px 8px}.rp-chips{gap:6px;margin-bottom:14px}}
.main-header-one__top,.main-header-one__top a,.main-header-one__top p,.main-header-one__top span,.main-header-one__top h6{color:#3b3533!important}
.counter-one--two .counter-one__inner-bg{background:#fff4f3;border:1px solid #f3dcd9}
.counter-one--two .counter-one__single-bottom p,.counter-one--two h3,.counter-one--two .odometer,.counter-one--two .counter-one__single-top span{color:var(--uterpy-black)!important}
.testimonial-one--two.testimonial-one:before{background-color:#f7f5f4}
.site-footer--two__pattern{background:#f7f5f4}
.site-footer--two,.site-footer--two p,.site-footer--two a,.site-footer--two li,.site-footer--two h3,.site-footer--two h4,
.site-footer--two .footer-widget__title,.site-footer__bottom-text p{color:#3b3533!important}
.site-footer--two a:hover{color:var(--uterpy-base)!important}
.site-footer__bottom{border-top:1px solid #e7e1da}

@media (prefers-reduced-motion:reduce){
  .rp-shine:after,.rp-pulse{animation:none;display:none}
  .rp-steps:before{transform:none!important;transition:none}
  .main-slider-two .active .rp-hero-text,.main-slider-two .active .rp-trust{animation:none}
  .rp-film:hover,.rp-services .services-one__single:hover .services-one__single-img img{transform:none}
  .rp-spot,.rp-spot:hover{transform:none}
}
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

    # --------------------------------------------------- 39. their map bug
    # Their page calls initMap on DOMContentLoaded, before the async Maps API
    # has loaded, so every visit throws "google is not defined". The API's own
    # callback=initMap already calls it once the library is ready.
    h = sub(h, r"document\.addEventListener\('DOMContentLoaded', function \(\) \{\s*initMap\(\);\s*\}\);", '',
            '39', 'Map: removed the early initMap call that threw "google is not defined"')
    h = one(h, 'function initMap() {', "function initMap() {\n            if (typeof google === 'undefined') return;",
            '39', 'Map: initMap guarded')

    # Light footer (his rule: no black backgrounds), so it takes the red logo.
    h = one(h, 'clinic-logo-white.svg" class="w-25"', 'clinic-logo.svg" class="w-25"', '2',
            'Footer logo in colour for the light footer')

    # ---------------------------------------------------- 5. floating WhatsApp
    h = one(h, '</body>', floating() + '</body>', '5', 'Floating WhatsApp button and mobile sticky bar')

    io.open(index, 'w', encoding='utf-8').write(h)

    # ------------------------------------------------ our files, then paths
    io.open(os.path.join(OUT, 'assets', 'repositioning.css'), 'w', encoding='utf-8').write(REPOSITIONING_CSS)
    rp = os.path.join(OUT, 'assets', 'rp')
    os.makedirs(rp, exist_ok=True)
    for f in ('c7n-urgent.webp', 'c7n-injury.webp', 'c7n-lab.webp', 'c7n-specialist.webp', 'c7n-roomvisit.webp'):
        shutil.copyfile(os.path.join('src', 'assets', f), os.path.join(rp, f))
    shutil.copyfile(os.path.join('src', 'assets', 'px-resort-lereve.webp'), os.path.join(rp, 'resort.webp'))
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
