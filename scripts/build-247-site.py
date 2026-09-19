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


def hero_content():
    """Section 6, copied from the brief."""
    return '''<div class="main-slider-two__content">
    <div class="tagline">
        <div class="border-box"></div>
        <div class="text-box"><p>24/7 Medical Care &bull; Cashless Insurance &bull; Multilingual Support</p></div>
    </div>
    <div class="title"><h1>Urgent Medical Care. Right Inside Your Hotel.</h1></div>
    <p class="rp-hero-text">24/7 Clinic operates a network of on-site urgent care clinics inside hotels and resorts across Egypt&rsquo;s leading tourist destinations, giving international travelers fast access to medical care without unnecessary hospital visits.</p>
    <div class="main-slider-one__content-btn">
        <div class="btn-one"><a class="thm-btn rp-btn-wa" href="%s" target="_blank" rel="noopener" data-ev="whatsapp_medical_click">WhatsApp Us 24/7</a></div>
        <div class="btn-two"><a href="#rp-find">Find Your Clinic</a></div>
    </div>
    <p class="rp-trust">%sInternationally Accredited Urgent Care Network</p>
</div>
''' % (wa(WA_HOME), svg('shield'))


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
    """Section 9, four cards."""
    cards = [
        ('pin', 'Inside Your Resort', 'No need to search for an unfamiliar medical facility in another part of the city.'),
        ('clock', 'Fast Access to Medical Care', 'Our hotel-based model gives travelers direct access to medical support where they are staying.'),
        ('stethoscope', 'Treatment On-Site', 'Many common urgent and primary care conditions can be assessed and treated without a hospital visit.'),
        ('hospital', 'Hospital Transfer Only When Needed', 'If higher-level care is required, our team coordinates the appropriate hospital, ambulance or next medical step.'),
    ]
    body = ''.join('<div class="rp-card"><span class="rp-card__i">%s</span><h3>%s</h3><p>%s</p></div>'
                   % (svg(i), t, d) for i, t, d in cards)
    return '''<!--Start Repositioning Why Hotel-->
<section class="rp-sec rp-sec--tint">
    <div class="container">
        <div class="sec-title text-center"><h2 class="sec-title__title">Why Leave Your Hotel When Medical Care Is Already There?</h2></div>
        <div class="rp-grid rp-grid--4">%s</div>
    </div>
</section>
''' % body


def services():
    """Section 10, six cards, replacing the old service emphasis."""
    cards = [
        ('stethoscope', 'Urgent Medical Care', 'Assessment and treatment of sudden illness, fever, infections, gastrointestinal conditions, dehydration, respiratory problems and other urgent conditions.'),
        ('bandage', 'Injuries &amp; Minor Procedures', 'Treatment of wounds, burns, sprains, minor trauma, dressings, suturing and other minor procedures where clinically appropriate.'),
        ('flask', 'Diagnostics &amp; Laboratory Tests', 'Medical assessment with access to laboratory tests and diagnostic services when required.'),
        ('drip', 'IV Therapy &amp; Medication', 'Doctor-prescribed medication, injections and IV therapy when medically indicated.'),
        ('specialist', 'Specialist Consultation', 'Access to specialist physicians and coordinated consultations where further medical assessment is required.'),
        ('bed', 'Hotel Room Doctor Visit', 'When appropriate, a doctor visit can be arranged directly in the guest&rsquo;s hotel room.'),
    ]
    body = ''.join('<div class="rp-card"><span class="rp-card__i">%s</span><h3>%s</h3><p>%s</p></div>'
                   % (svg(i), t, d) for i, t, d in cards)
    return '''<!--Start Repositioning Services-->
<section class="rp-sec">
    <div class="container">
        <div class="sec-title text-center"><h2 class="sec-title__title">What We Can Treat On-Site</h2></div>
        <div class="rp-grid rp-grid--3">%s</div>
        <div class="rp-cta-row"><a class="thm-btn" href="/services">View All Medical Services</a></div>
    </div>
</section>
''' % body


def insurance():
    """Section 11. Cashless care is never promised universally."""
    items = ['Insurance verification', 'Guarantee of Payment coordination', 'Direct communication with the insurer',
             'Medical documentation', 'Billing coordination', 'Cashless treatment where approved']
    ticks = ''.join('<li>%s%s</li>' % (svg('check'), t) for t in items)
    return '''<!--Start Repositioning Insurance-->
<section class="rp-sec rp-ins">
    <div class="container rp-ins__in">
        <div>
            <div class="sec-title"><h2 class="sec-title__title">Travelling With Medical Insurance?</h2></div>
            <p class="rp-ins__sub">We Can Coordinate Directly With Your Insurer</p>
            <p>24/7 Clinic works with international travel insurers and assistance companies worldwide.</p>
            <p>Where insurance approval and policy conditions allow, we can arrange cashless medical treatment, meaning the patient may not need to pay the full medical cost upfront and claim it back later.</p>
        </div>
        <div class="rp-ins__box">
            <p class="rp-ins__label">Our team can assist with:</p>
            <ul class="rp-ticks rp-ticks--col">%s</ul>
            <div class="rp-cta-row rp-cta-row--left">
                <a class="thm-btn rp-btn-wa" href="%s" target="_blank" rel="noopener" data-ev="whatsapp_insurance_click">Check Your Insurance on WhatsApp</a>
                <a class="rp-link" href="/insurance">Learn About Insurance &amp; Cashless Care</a>
            </div>
        </div>
    </div>
</section>
''' % (ticks, wa(WA_INSURANCE))


def how_it_works():
    """Section 12, four steps."""
    steps = [
        ('Message Us on WhatsApp', 'Tell us your hotel, location and what happened.'),
        ('We Find the Nearest Medical Option', 'If your hotel has a 24/7 Clinic, we direct you there. If not, our coordination team identifies the most appropriate medical solution.'),
        ('We Check Your Insurance', 'Send us your insurance details and, where applicable, our team can coordinate directly with your insurer.'),
        ('Receive Medical Care', 'Treatment is provided on-site whenever clinically appropriate. If higher-level care is needed, we coordinate the next step.'),
    ]
    body = ''.join('<div class="rp-step"><span class="rp-step__n">%d</span><h3>%s</h3><p>%s</p></div>'
                   % (i + 1, t, d) for i, (t, d) in enumerate(steps))
    return '''<!--Start Repositioning How It Works-->
<section class="rp-sec rp-sec--tint">
    <div class="container">
        <div class="sec-title text-center"><h2 class="sec-title__title">Getting Medical Help Is Simple</h2></div>
        <div class="rp-grid rp-grid--4">%s</div>
        <div class="rp-cta-row"><a class="thm-btn rp-btn-wa" href="%s" target="_blank" rel="noopener" data-ev="whatsapp_medical_click">Get Medical Help Now</a></div>
    </div>
</section>
''' % (body, wa(WA_HOME))


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
    body = ''.join('<a class="rp-place" href="%s">%s<span><b>%s</b><small>%s</small></span></a>'
                   % (h, svg('pin'), d, s) for d, s, h in places)
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
            <a class="rp-btn rp-btn--wa" href="%s" target="_blank" rel="noopener" data-ev="whatsapp_medical_click">%sWhatsApp Us Now</a>
            <a class="rp-btn rp-btn--ghost" href="#rp-find">Find Your Nearest Clinic</a>
        </div>
    </div>
</section>
''' % (wa(WA_HOME), svg('wa'))


def floating():
    """Section 5: floating button on desktop, sticky bar on a phone."""
    return '''<a class="rp-float" href="%s" target="_blank" rel="noopener" data-ev="whatsapp_medical_click">%s<span>Need a Doctor? Chat on WhatsApp</span></a>
<a class="rp-sticky" href="%s" target="_blank" rel="noopener" data-ev="whatsapp_medical_click">%sWhatsApp Medical Support 24/7</a>
''' % (wa(WA_HOME), svg('wa'), wa(WA_HOME), svg('wa'))


REPOSITIONING_CSS = r"""/* Repositioning, applied on top of their own stylesheet.
   Their bundle.min.css is untouched. Delete this file and the site is theirs
   again. Every rule is namespaced rp- so nothing of theirs is overridden by
   accident, except the three hero rules marked below, which exist because the
   headline is now an h1 and their theme only styles an h2 there. */

.rp-ico{width:22px;height:22px;flex:none;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}

/* ---- hero: the headline is the page's first and only h1 ---------------- */
.main-slider-two__content .title h1{color:#fff;font-size:72px;line-height:1.1em;font-weight:700;font-family:var(--uterpy-font-two);margin:0}
@media (max-width:1199px){.main-slider-two__content .title h1{font-size:56px}}
@media (max-width:767px){.main-slider-two__content .title h1{font-size:38px}}
.rp-hero-text{color:rgba(255,255,255,.92);font-size:19px;line-height:1.6;max-width:640px;margin:22px 0 0}
.rp-trust{display:inline-flex;align-items:center;gap:9px;margin:22px 0 0;color:#fff;font-weight:600;font-size:15px;letter-spacing:.02em}
.rp-trust .rp-ico{color:#fff;width:20px;height:20px}
.rp-btn-wa{background:#25D366!important}
.rp-btn-wa:hover{background:#128C7E!important}
/* On a phone their two hero buttons sit side by side and each label wraps onto
   two lines. Stacked and full width, each stays on one. */
@media (max-width:575px){
  .main-slider-two__content .main-slider-one__content-btn{flex-direction:column;align-items:stretch}
  .main-slider-one__content-btn .btn-two{margin-left:0;margin-top:12px}
  .main-slider-one__content-btn a{display:block;text-align:center;white-space:nowrap}
}

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
    starts = [m.start() for m in re.finditer(r'<!--Start Main Slider Two Single-->', h)]
    if len(starts) >= 3:
        s1, s2, s3 = starts[0], starts[1], starts[2]
        slide1 = h[s1:s2]
        c = slide1.find('<div class="main-slider-two__content">')
        v = slide1.find('<div class="main-slider-two__video">')
        if c >= 0 and v > c:
            slide1 = slide1[:c] + hero_content() + slide1[v:]
            # Slide two is "Be Beautiful". Sections 6 and 29: no Beauty & Wellness in the hero.
            h = h[:s1] + slide1 + h[s3:]
            note('6', 'Hero rewritten word for word, headline is now the page h1, Beauty slide removed')
        else:
            print('   SKIPPED, hero content block not found')
    else:
        print('   SKIPPED, fewer than three hero slides')

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
    h = between(h, '<!--Start Services One-->', '<!--Start Banner One-->', why_hotel() + services(),
                '9, 10', 'Why hotel-based care, four cards, then What We Can Treat On-Site, six cards')

    # ----------------------------- 11, 12 and 13, replacing Banner One
    h = between(h, '<!--Start Banner One-->', '<!--Start Counter One -->',
                insurance() + how_it_works() + find_clinic(),
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

    # ---------------------------------------------------- 5. floating WhatsApp
    h = one(h, '</body>', floating() + '</body>', '5', 'Floating WhatsApp button and mobile sticky bar')

    io.open(index, 'w', encoding='utf-8').write(h)

    # ------------------------------------------------ our files, then paths
    io.open(os.path.join(OUT, 'assets', 'repositioning.css'), 'w', encoding='utf-8').write(REPOSITIONING_CSS)
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
