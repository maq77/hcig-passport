/**
 * HCIG Work: the estate registry.
 *
 * THIS FILE IS THE SINGLE SOURCE OF TRUTH FOR THE WHOLE PORTAL.
 * Every page on the site is generated from it. To add a company, a project or a
 * deliverable, edit this file and run `npm run build`. Never hand-write a page.
 *
 * Shape
 * -----
 *   COMPANIES[]                       one per group brand
 *     .projects[]                     one per piece of work
 *       .stages[]                     "UI kit", "Live demo", "Documents" ...
 *         .items[]                    the things a reviewer actually opens
 *
 * Item kinds
 * ----------
 *   html   a source file in this repo, wrapped into a full page and hosted here
 *   md     a markdown file in this repo, rendered to a readable page and hosted here
 *   link   something that already lives somewhere else (live site, artifact, doc)
 *
 * Hiding a project
 * ----------------
 * `hidden: true` keeps a project in this file, fully intact, and takes it off
 * every listing, count, navigation and search result. Its own pages and URLs
 * stay live, so a held link still opens, but nothing on the site points at it
 * and nobody finds it by looking. Delete the one word to list it again.
 *
 * Flagships
 * ----------
 * `flagship: { rank, line }` on a project lifts it out of its company folder and
 * onto `/big-projects`, the front door for work that changes how the whole group
 * operates rather than one website. Three at most; the moment everything is a
 * flagship, nothing is. `line` is the one sentence that says why it matters to
 * the group, not to its own company.
 *
 * Status vocabulary. This IS the review gate. Keep it honest.
 * ------------------------------------------------------------
 *   planned   Not started        agreed, not begun
 *   draft     Being built        in progress, not ready to show
 *   review    Waiting for Irina  sent, waiting on her
 *   changes   Needs changes      she asked for changes
 *   approved  Approved           she said yes, ready to go live
 *   live      Live on their site published and checked on the real site
 *   blocked   Stuck on someone   waiting on a person outside the team
 *
 * Every label says WHOSE MOVE IT IS. That is the whole point of the word.
 *
 * Rule: a status is a statement of fact, not a hope. If you are unsure whether
 * something is approved, it is not approved.
 */

const REVIEWER = 'Irina Rise, Marketing Director';
const OWNER = 'Mohamed Amin';

/* ------------------------------------------------------------------ status */

const STATUS = {
  planned:  { label: 'Not started',      tone: 'neutral', icon: 'circle-dashed', blurb: 'Agreed, not begun.',            whose: 'Nobody yet' },
  draft:    { label: 'Being built',      tone: 'neutral', icon: 'pencil',        blurb: 'In progress. Not ready to see.', whose: 'Us' },
  review:   { label: 'Waiting for Irina', tone: 'info',   icon: 'eye',           blurb: 'Sent. Waiting on her.',          whose: 'Irina' },
  changes:  { label: 'Needs changes',    tone: 'warn',    icon: 'rotate',        blurb: 'She asked for changes.',         whose: 'Us' },
  approved: { label: 'Approved',         tone: 'ok',      icon: 'check',         blurb: 'She said yes. Ready to go live.', whose: 'Us, to deploy' },
  live:     { label: 'Live on their site', tone: 'live',  icon: 'globe',         blurb: 'Published and checked.',         whose: 'Done' },
  blocked:  { label: 'Stuck on someone', tone: 'stop',    icon: 'lock',          blurb: 'Waiting on a person outside the team.', whose: 'Someone else' },
};

/** The order a project moves through. Drives the progress rail on a project page. */
const PIPELINE = ['planned', 'draft', 'review', 'approved', 'live'];

/* --------------------------------------------------------------- companies */

const COMPANIES = [
  {
    slug: 'medpark',
    name: 'MedPark Health Group',
    short: 'MedPark',
    logo: 'LOGOMP',
    accent: '#12C0C6',
    accentInk: '#0A2A4A',
    site: 'https://www.medparkhospitals.com',
    what: 'Two full hospitals on the Red Sea coast.',
    where: 'Hurghada and El Quseir, Egypt',
    projects: [
      {
        slug: 'website-v2',
        name: 'Website redesign',
        status: 'review',
        updated: '2026-09-10',
        summary: '44 pages, English, German and Polish. Built and working, not yet approved.',
        detail: [
          'The live site is the old design again. The redesign serves only on ?preview=2 and sends noindex there, so it reaches no visitor and no crawler.',
          'It can be edited freely in the meantime. Any change shows immediately on the preview links below.',
          'Publishing is deleting one if() per page. Rolling back is putting it back.',
          '9 September: the hero film no longer shows a play button on a phone. iPhones draw one over any video that is showing a poster and has not started, and in Low Power Mode it never went away.',
          '9 September: the packages section is rebuilt. Four services, each a card with a picture and a headline. Clicking one opens the package cards in a viewer.',
          '9 September: a third version adds motion to the home page. Headlines climb into place, cards arrive in turn, photographs open with a wipe. It is a layer over the same page, so the plain version is untouched.',
          'The packages section is now on the German and Polish home pages too, in their own languages. All three read from one file, so a change happens once.',
          'His own service pictures are in. The four covers went from 891 KB to 254 KB and the card takes their shape, so nothing is cropped.',
          '11 September: every preview page is joined up. Opening one with ?preview=2 carries it through every link, so the whole draft walks as one site instead of falling back to the old design on the first click.',
          'Medical Services hides its sentence until the card is pointed at, and the sentence is white on its own panel rather than pale grey over a photograph.',
          'Advanced Hospital Capabilities is a tile grid now, three across and two on a phone, every tile the same size. The four triage cards are a plain two by two.',
          'News reads newest first everywhere. The home page was showing the three oldest posts from May 2025 under the heading Latest News.',
          'The new package artwork replaced the old, and the set went from 32 MB to 1.7 MB with no loss on screen.',
        ],
        checklist: [
          { text: 'Approve the redesign so it can go live', done: false, who: 'Irina' },
          { text: 'Send the four service pictures for the packages section', done: true, who: 'Us' },
          { text: 'Native German and Polish reader for the packages section wording', done: false, who: 'Irina' },
          { text: 'Native German and Polish reader for every string marked NEW', done: false, who: 'Irina' },
          { text: 'Restore the six location pages and their hreflang rows on publish', done: false, who: 'Us' },
        ],
        stages: [
          {
            name: 'Preview the redesign',
            note: 'These serve the new design. Nobody else can reach it and Google cannot index it.',
            items: [
              { slug: 'english', name: 'English', kind: 'link', href: 'https://www.medparkhospitals.com/?preview=2', status: 'review' },
              { slug: 'motion', name: 'English, with motion', kind: 'link', href: 'https://www.medparkhospitals.com/?preview=3', status: 'review', note: 'The same page with animation. Compare it against the plain one above' },
              { slug: 'german', name: 'German', kind: 'link', href: 'https://www.medparkhospitals.com/de/?preview=2', status: 'review', note: 'Now carries the packages section. Strings marked NEW need a native reader' },
              { slug: 'polish', name: 'Polish', kind: 'link', href: 'https://www.medparkhospitals.com/pl/?preview=2', status: 'review', note: 'Now carries the packages section. Strings marked NEW need a native reader' },
            ],
          },
          {
            name: 'What visitors see today',
            note: 'The old design, indexable, unchanged.',
            items: [
              { slug: 'live-now', name: 'The site as it stands', kind: 'link', href: 'https://www.medparkhospitals.com/', status: 'live', note: '50 URLs in the sitemap' },
            ],
          },
        ],
      },
      {
        slug: 'location-pages',
        name: 'Location pages',
        status: 'review',
        updated: '2026-09-08',
        summary: 'Six pages written for a place, not a service. Waiting on the redesign.',
        detail: [
          'They exist only in the new design, so while it is unapproved they redirect to the branch page covering the same place and render on ?preview=2.',
          'Aimed at how a guest searches. "krankenhaus hurghada" is the strongest non-brand term the site has.',
        ],
        stages: [
          {
            name: 'Preview',
            note: 'Live the moment the redesign is approved.',
            items: [
              { slug: 'hurghada', name: 'Hospital Hurghada', kind: 'link', href: 'https://www.medparkhospitals.com/hospital-hurghada/?preview=2', status: 'review' },
              { slug: 'sahl-hasheesh', name: 'Hospital Sahl Hasheesh', kind: 'link', href: 'https://www.medparkhospitals.com/hospital-sahl-hasheesh/?preview=2', status: 'review' },
            ],
          },
        ],
      },
      {
        slug: 'seo-aeo-strategy',
        name: 'Red Sea SEO and AEO strategy',
        status: 'approved',
        updated: '2026-09-07',
        summary:
          '"Hospital, Not Hotel Clinic". Architecture, keywords, GBP, AI citation.',
        detail: [
          'Written against live Search Console data. Items 1, 5 and 8 of twelve are done.',
        ],
        stages: [
          {
            name: 'Documents',
            items: [
              {
                slug: 'plan',
                name: 'Hospital, Not Hotel Clinic',
                kind: 'html',
                src: 'docs/medpark-redsea-strategy.html',
                status: 'approved',
                note: 'Four parts, twelve-item sequence',
              },
            ],
          },
        ],
      },
      {
        slug: 'site-audit',
        name: 'Site audit',
        status: 'live',
        updated: '2026-09-18',
        summary: 'Fixes going live. Colour contrast fixed site-wide on 18 September.',
        detail: [
          'Contrast raised to the accessible minimum on grey text, the red emergency buttons and every WhatsApp button. Home page accessibility 95 to 98.',
          'Measured on five pages. Mobile speed 76 to 88. The El Quseir hero photo is next.',
        ],
        stages: [
          {
            name: 'Documents',
            items: [
              {
                slug: 'audit',
                name: 'Full audit of medparkhospitals.com',
                kind: 'md',
                src: 'docs/medpark-site-audit.md',
                status: 'approved',
              },
            ],
          },
        ],
      },
      {
        slug: 'performance-dashboard',
        name: 'Performance dashboard',
        status: 'live',
        updated: '2026-09-06',
        summary:
          'GA4, Search Console and PageSpeed, collecting nightly.',
        detail: [
          'No Google account needed to read it. Appointment requests, partner attribution, silent-failure alerts.',
        ],
        stages: [
          {
            name: 'Live tool',
            items: [
              { slug: 'dashboard', name: 'Dashboard', kind: 'link', href: 'https://www.medparkhospitals.com/dashboard/', status: 'live', note: 'Credentials held separately' },
            ],
          },
        ],
      },
      {
        slug: 'speed-and-crawlability',
        name: 'Speed and crawlability',
        status: 'draft',
        updated: '2026-09-07',
        due: '2026-09-30',
        summary: 'Pass 1 shipped. Mobile home LCP 13.6 s to 5.8 s.',
        detail: [
          'The cause was one line calling load() on the 2.9 MB hero video, which overrides preload="none".',
          'Open: duplicate .php URLs, the favicon, 372 JPEGs against 59 WebP.',
        ],
        stages: [],
      },
      {
        slug: 'ai-assistant',
        name: 'AI assistant',
        status: 'planned',
        updated: '2026-09-07',
        // held back 2026-09-08 at his request, to be shown when he is ready
        hidden: true,
        flagship: { rank: 3, line: 'Answering guests in their own language, day and night. Built once at MedPark, then reused across the group.' },
        summary: 'Raise the assistant to standard before it returns to v2.',
        detail: ['A working v1 exists, switched off on v2. Start with the real recorded conversations.'],
        stages: [],
      },
      {
        slug: 'google-business-profile',
        name: 'Google Business Profile',
        status: 'blocked',
        updated: '2026-09-07',
        summary: 'Suspensions, optimisation, and linking to the site.',
        detail: [
          'Only an Owner can grant API access. We hold Manager. A transfer request starts a seven day clock.',
          'Primary category to Hospital is the largest ranking lever left.',
          'Never create a second listing. The 271 and 187 reviews are the asset.',
        ],
        stages: [],
      },
    ],
  },

  {
    slug: '247clinic',
    name: '24/7 Clinic',
    short: '24/7',
    logo: 'LOGO247',
    accent: '#C00000',
    accentInk: '#000000',
    site: 'https://www.247clinic.net',
    what: 'Urgent care inside hotels and resorts.',
    where: 'Resorts across Egypt',
    projects: [
      {
        slug: 'hotel-landing-pages',
        name: 'In-hotel landing pages',
        status: 'review',
        updated: '2026-09-09',
        summary: 'One page per hotel clinic, built to be found on Google. Three designs to choose from.',
        detail: [
          'Approved by Irina on 2026-09-08. The URL structure, the page plan and the one template approach all stand.',
          'Rebuilt 2026-09-09: simpler, white, fewer sections, less text.',
          'The clinic’s own films run throughout, at original quality. A rail of six guest films, one team film per clinic, and a Watch video button on the hero.',
          'The free health check, free blood pressure and blood sugar for every hotel guest, is now a band under every hero.',
          'Three designs of the Premier Le Rêve page, all from one content table. Irina picks a direction, or asks to merge parts.',
          'The other two clinics are built in all three designs already, so approval is a registry edit, not new work.',
          'The page carries no review notes. It reads exactly as it will read on 247clinic.net.',
          'Structural patterns match the MedPark redesign: floating WhatsApp pill, help card grid, video lightbox.',
          'Every open question lives in one document instead, linked above.',
        ],
        checklist: [
          { text: 'Approve the URL structure and page plan', done: true, who: 'Irina' },
          { text: 'Build the design system and the three demo pages', done: true, who: 'Us' },
          { text: 'Choose a design, or which parts to merge', done: false, who: 'Irina' },
          { text: 'Confirm the published guest reviews may be reused on the landing pages', done: false, who: 'Irina' },
          { text: 'Settle the phone number: the site says 122 112 2246, the films say 122 222 8247', done: false, who: 'Irina' },
          { text: 'Replace the placeholder WhatsApp number shared by every clinic', done: false, who: 'Irina' },
          { text: 'Confirm whether "Steigenberger soma bay" is the same property as Ras Soma', done: false, who: 'Irina' },
          { text: 'Supply photographs, opening hours and the walking route for Steigenberger and Amwaj', done: false, who: 'Irina' },
          { text: 'Fix Premier Le Rêve coordinates, currently copied from Long Beach Resort', done: false, who: 'Us' },
          { text: 'Create or confirm the GA4 property for 247clinic.net', done: false, who: 'Us' },
          { text: 'Fix the four site bugs the pages depend on: sitemap 500, no real 404, blank titles, canonical', done: false, who: 'Us' },
        ],
        stages: [
          {
            name: 'Documents',
            items: [
              { slug: 'proposal', name: 'Proposal', kind: 'html', src: 'docs/247clinic-landing-pages-proposal.html', status: 'approved', note: 'The short version, for reading' },
              { slug: 'plan', name: 'Full plan, all seven answers', kind: 'md', src: 'docs/247clinic-hotel-landing-pages-plan.md', status: 'approved', note: 'URLs, keywords, wireframe, SEO, tracking' },
              { slug: 'review-pack', name: 'Everything in one place', kind: 'md', src: 'docs/247clinic-review-pack.md', status: 'review', note: 'The whole 24/7 project on one page, updated 2026-09-19' },
              { slug: 'open-items', name: 'What is still open', kind: 'md', src: 'docs/247clinic-open-items.md', status: 'review', note: 'Every note kept off the pages, with the evidence' },
              { slug: 'video-plan', name: 'Where every film goes', kind: 'md', src: 'docs/247clinic-video-plan.md', status: 'review', note: 'The 16 films mapped to sections. Ready to apply to whichever design wins' },
              { slug: 'brief', name: 'Their repositioning brief', kind: 'md', src: 'docs/247clinic-website-brief.md', status: 'approved', note: 'WEBSITE.docx as received, kept word for word' },
              { slug: 'brief-alignment', name: 'The two briefs, and what they change', kind: 'md', src: 'docs/247clinic-brief-alignment.md', status: 'review', note: 'One real conflict on URLs, what is now fixed, and what is still needed from them' },
              { slug: 'brief-compliance', name: 'Both briefs, checked line by line', kind: 'md', src: 'docs/247clinic-brief-compliance.md', status: 'review', note: '44 machine checks per page. 43 pass. The one that fails is the one that decides ranking' },
              { slug: 'seo', name: 'SEO, and what to do at deploy', kind: 'md', src: 'docs/247clinic-seo-handover.md', status: 'review', note: 'Schema, share cards, sitemap, llms.txt, and an honest read on what will rank' },
              { slug: 'ai-images', name: 'Generating images with Gemini', kind: 'md', src: 'docs/ai-images-guide.md', status: 'review', note: 'What it costs, where we use it, and the one thing it must never be used for' },
            ],
          },
          /* The kit is parked while a design is being chosen. It documents the
             first design language, which three rebuilds have since moved past,
             and it referenced photography that no longer exists now that no
             frame is ever cut from a film. It is rewritten once a direction is
             picked, against the design that actually wins. */
          {
            name: 'UI kit',
            note: 'Rewritten once a design is chosen.',
            items: [],
          },
          {
            name: 'Live demo',
            note: 'Four designs, each built for all three clinics. Design 4 is the strict reading of the brief. Every page links to the others.',
            items: [
              { slug: 'design-1', name: 'Design 1. Clean and clinical', kind: 'page', src: '247-lp-le-reve-d1.html', ownTitle: true, status: 'review', note: 'Premier Le Reve. White, split hero, card grid. The MedPark language in 24/7 colours' },
              { slug: 'design-2', name: 'Design 2. Bold and cinematic', kind: 'page', src: '247-lp-le-reve-d2.html', ownTitle: true, status: 'review', note: 'Premier Le Reve. Full-bleed film, big type, icons that draw themselves' },
              { slug: 'design-3', name: 'Design 3. Editorial motion', kind: 'page', src: '247-lp-le-reve-d3.html', ownTitle: true, status: 'review', note: 'Premier Le Reve. The film stands up as you scroll, and his walk film is scrubbed by the scroll wheel' },

              /* The other two clinics in each design. They are registered
                 because every page now links out to its siblings, and a link
                 that 404s would break the rule that a demo reads as live. */
              { slug: 'design-1-steigenberger', name: 'Design 1. Steigenberger Ras Soma', kind: 'page', src: '247-lp-steigenberger-d1.html', ownTitle: true, status: 'review', note: 'Soma Bay, in design 1' },
              { slug: 'design-1-amwaj', name: 'Design 1. Amwaj Beach Club', kind: 'page', src: '247-lp-amwaj-d1.html', ownTitle: true, status: 'review', note: 'Abu Soma, in design 1' },
              { slug: 'design-2-steigenberger', name: 'Design 2. Steigenberger Ras Soma', kind: 'page', src: '247-lp-steigenberger-d2.html', ownTitle: true, status: 'review', note: 'Soma Bay, in design 2' },
              { slug: 'design-2-amwaj', name: 'Design 2. Amwaj Beach Club', kind: 'page', src: '247-lp-amwaj-d2.html', ownTitle: true, status: 'review', note: 'Abu Soma, in design 2' },
              { slug: 'design-3-steigenberger', name: 'Design 3. Steigenberger Ras Soma', kind: 'page', src: '247-lp-steigenberger-d3.html', ownTitle: true, status: 'review', note: 'Soma Bay, in design 3' },
              { slug: 'design-3-amwaj', name: 'Design 3. Amwaj Beach Club', kind: 'page', src: '247-lp-amwaj-d3.html', ownTitle: true, status: 'review', note: 'Abu Soma, in design 3' },

              /* Design 4 is the control: a strict reading of Irina's brief with
                 nothing added. It is the one to compare the other three against
                 when deciding what to cut. */
              { slug: 'design-4', name: 'Design 4. To the brief', kind: 'page', src: '247-lp-le-reve-d4.html', ownTitle: true, status: 'review', note: 'Premier Le Reve. Only what she asked for, in her words. No film at all' },
              { slug: 'design-4-steigenberger', name: 'Design 4. Steigenberger Ras Soma', kind: 'page', src: '247-lp-steigenberger-d4.html', ownTitle: true, status: 'review', note: 'Soma Bay, in design 4' },
              { slug: 'design-4-amwaj', name: 'Design 4. Amwaj Beach Club', kind: 'page', src: '247-lp-amwaj-d4.html', ownTitle: true, status: 'review', note: 'Abu Soma, in design 4' },
            ],
          },
        ],
      },
      {
        slug: 'website',
        name: 'Website',
        status: 'review',
        updated: '2026-09-19',
        summary: 'A new 24/7 Clinic website: our design on their brand book, every word from their brief.',
        detail: [
          'New direction on 2026-09-19: a new design built on the 24/7 brand guideline. Their live site is a reference only.',
          'The content is fixed. Every sentence comes from their brief, WEBSITE.docx, word for word. The build refuses to run if a line drifts.',
          'The homepage is built. The other pages of the brief follow once the homepage is approved.',
          'German, Polish and Czech versions follow the English.',
          'Everything in one place: the review pack below.',
        ],
        checklist: [
          { text: 'Build the new homepage from the brief', done: true, who: 'Us' },
          { text: 'Keyword map with real Google evidence, 4 languages', done: true, who: 'Us' },
          { text: 'Review the new homepage', done: false, who: 'Mohamed' },
          { text: 'Confirm 20 years and 28 clinics for the numbers block', done: false, who: 'Irina' },
          { text: 'Settle the phone number and the WhatsApp number per clinic', done: false, who: 'Irina' },
          { text: 'Supply the CAUCQ mark', done: false, who: 'Irina' },
          { text: 'Build the remaining pages of the brief', done: false, who: 'Us' },
          { text: 'German, Polish and Czech versions', done: false, who: 'Us' },
        ],
        stages: [
          {
            name: 'Documents',
            items: [
              { slug: 'review-pack', name: 'Everything in one place', kind: 'md', src: 'docs/247clinic-review-pack.md', status: 'review', note: 'What is live, what we did, what needs review, what is left' },
              { slug: 'keywords', name: 'Keyword map', kind: 'md', src: 'docs/247clinic-keywords.md', status: 'review', note: 'Google autocomplete evidence in English, German, Polish and Czech' },
              { slug: 'brief', name: 'Their repositioning brief', kind: 'md', src: 'docs/247clinic-website-brief.md', status: 'approved', note: 'WEBSITE.docx as received, kept word for word' },
              { slug: 'site-audit', name: 'What is wrong with the site today', kind: 'md', src: 'docs/247clinic-site-audit.md', status: 'review', note: 'Measured on their live pages, not guessed' },
            ],
          },
          {
            name: 'Preview',
            note: 'The primary design: their layout carrying the brief content. Twelve pages. Nothing is deployed to 247clinic.net.',
            items: [
              { slug: 'home', name: 'Homepage', kind: 'link', href: 'https://hcig-passport.vercel.app/247clinic/website-preview', status: 'review', note: 'Their layout carrying the brief content, our film on the first slide' },
              { slug: 'services', name: 'Medical Services', kind: 'link', href: 'https://hcig-passport.vercel.app/247clinic/website-preview/services/', status: 'review', note: 'Brief section 17. Their live URL kept' },
              { slug: 'insurance', name: 'Insurance & Cashless Care', kind: 'link', href: 'https://hcig-passport.vercel.app/247clinic/website-preview/insurance/', status: 'review', note: 'Brief section 18. Their live URL kept' },
              { slug: 'our-clinics', name: 'Find a Clinic', kind: 'link', href: 'https://hcig-passport.vercel.app/247clinic/website-preview/our-clinics/', status: 'review', note: 'Brief section 19. Their live URL kept' },
              { slug: 'about-us', name: 'About Us', kind: 'link', href: 'https://hcig-passport.vercel.app/247clinic/website-preview/about-us/', status: 'review', note: 'Brief section 26. Their live URL kept' },
              { slug: 'contact-us', name: 'Contact', kind: 'link', href: 'https://hcig-passport.vercel.app/247clinic/website-preview/contact-us/', status: 'review', note: 'Brief section 27. Their live URL kept' },
              { slug: 'faq', name: 'FAQ', kind: 'link', href: 'https://hcig-passport.vercel.app/247clinic/website-preview/faq/', status: 'review', note: 'Brief section 28' },
              { slug: 'beauty', name: 'Beauty & Wellness', kind: 'link', href: 'https://hcig-passport.vercel.app/247clinic/website-preview/beauty-wellness/', status: 'review', note: 'Brief section 29' },
              { slug: 'hotel-clinics', name: 'The Hotel Clinic Concept', kind: 'link', href: 'https://hcig-passport.vercel.app/247clinic/website-preview/hotel-clinics/', status: 'review', note: 'Brief section 22. New page' },
              { slug: 'accreditation', name: 'International Accreditation', kind: 'link', href: 'https://hcig-passport.vercel.app/247clinic/website-preview/accreditation/', status: 'review', note: 'Brief section 23. New page' },
              { slug: 'for-hotels', name: 'For Hotels & Resorts', kind: 'link', href: 'https://hcig-passport.vercel.app/247clinic/website-preview/for-hotels/', status: 'review', note: 'Brief section 24. New page' },
              { slug: 'for-insurance', name: 'For Insurance & Assistance', kind: 'link', href: 'https://hcig-passport.vercel.app/247clinic/website-preview/for-insurance/', status: 'review', note: 'Brief section 25. New page' },
              { slug: 'new-home', name: 'Our own design (parked)', kind: 'link', href: 'https://hcig-passport.vercel.app/247clinic/new', status: 'review', note: 'The direction not chosen on 19 Sep. Kept, not deleted' },
            ],
          },
        ],
      },
      {
        slug: 'website-v3',
        name: 'Website v3, bespoke premium',
        status: 'draft',
        updated: '2026-09-24',
        summary: 'A new premium design with the brief’s words exactly. Home first, then every page.',
        detail: [
          'Built from scratch at /247clinic/v3. v2 stays as the fallback.',
          'Full-bleed film hero, WhatsApp on every screen, insurer and hotel logos, the clinic’s own films.',
          'Content is WEBSITE.docx word for word. A checker fails the build on any other sentence.',
          'Uploads to 247clinic.net as plain files. Nothing has to run on their server.',
          'Home is reviewed first. The 30 hotel pages and the inner pages follow its approved patterns.',
          'Home built 2026-09-23: film hero, green WhatsApp and red call everywhere, the Medcierge floating WhatsApp, insurer and hotel logos, patient films, clinic map, 20 / 30 / 300.',
          'Dashed boxes mark where your dedicated designs go. The list is linked below.',
          'The home is ready for Mohamed to review. Irina sees it after his notes are in.',
          'Round 2, 23 September: image hero, the film in its own facilities and accreditation section, new header and footer, real WhatsApp green, colour insurer and hotel logos in two rows, Find a Clinic on Google Maps, their blog posts, a resort photo behind the last call to action. CAUCQ removed: accredited by UCA only, part of HCIG.',
          'Rounds 3 and 4, 24 September: repeated wording removed, a photo carousel in the hero, two-line descriptions that open on an arrow, a numbers band, the phone layout rebuilt, less space between sections, smooth scrolling. A live editor now lets Mohamed change words, order, spacing and pictures himself.',
        ],
        checklist: [
          { text: 'Approve the v3 spec', done: true, who: 'Mohamed' },
          { text: 'Supply Calisto MT web font files', done: true, who: 'Mohamed' },
          { text: 'Supply the dedicated designs for the design slots', done: false, who: 'Mohamed' },
          { text: 'Build and verify the home', done: true, who: 'Us' },
          { text: 'Review the home', done: false, who: 'Mohamed' },
          { text: 'Inner pages, 6 destination pages, 30 hotel pages', done: false, who: 'Us' },
          { text: 'Create a GA4 property for 247clinic.net', done: false, who: 'Us' },
        ],
        stages: [
          {
            name: 'Plan',
            items: [
              { slug: 'spec', name: 'What v3 is, and every decision', kind: 'md', src: 'specs/007-247clinic-v3/spec.md', status: 'approved', note: 'The approval document' },
              { slug: 'plan', name: 'How it is built, phase by phase', kind: 'md', src: 'specs/007-247clinic-v3/plan.md', status: 'approved', note: 'Stack, phases, review gates, risks' },
            ],
          },
          {
            name: 'Preview',
            note: 'Home first. Inner pages follow your notes on it.',
            items: [
              { slug: 'home', name: 'Homepage v3', kind: 'link', href: 'https://hcig-passport.vercel.app/247clinic/v3', status: 'draft', note: 'The whole brief home, word for word, in the new design' },
              { slug: 'slots', name: 'Where your designs go', kind: 'md', src: 'docs/247clinic-v3-design-slots.md', status: 'draft', note: 'Eight dashed boxes: hero still, CAUCQ mark, six service cards' },
              { slug: 'gaps', name: 'What the brief does not say', kind: 'md', src: 'docs/247clinic-v3-gaps.md', status: 'draft', note: 'Every line left out rather than written' },
            ],
          },
        ],
      },
    ],
  },

  {
    slug: 'hcig',
    name: 'Healthcare International Group',
    short: 'HCIG',
    logo: 'LOGOHCIG',
    accent: '#12C0C6',
    accentInk: '#565759',
    site: 'https://healthcareig.com',
    what: 'The group. 40 years, 600,000 patients, 135 on-site clinics.',
    where: 'Cairo, Egypt and Clearwater, Florida',
    projects: [
      {
        slug: 'passport',
        name: 'HCIG Passport',
        status: 'review',
        updated: '2026-09-01',
        // held back 2026-09-08 at his request, to be shown when he is ready
        hidden: true,
        flagship: { rank: 1, line: 'One patient record across every property in the group. The largest single change to how HCIG operates.' },
        summary:
          'One patient record, from resort clinic to hospital bed.',
        detail: [
          'Figures are illustrative placeholders. The patient shown is fictional.',
        ],
        stages: [
          {
            name: 'Documents',
            items: [
              {
                slug: 'business-case', name: 'Business case', kind: 'page', src: 'business-case.html',
                status: 'review', note: 'Includes a live revenue model',
                build: { artifact: 'hcig-passport.html', title: 'HCIG Passport - Business Case', favicon: '\u{1FA7A}' },
              },
              {
                slug: 'business-model', name: 'Business model canvas', kind: 'page', src: 'bmc.html',
                status: 'review',
                build: { artifact: 'hcig-business-model.html', title: 'HCIG Passport - Business Model', favicon: '\u{1F4CA}' },
              },
            ],
          },
          {
            name: 'UI kit',
            items: [
              {
                slug: 'ui-kit', name: 'Interface library', kind: 'page', src: 'ui-kit.html',
                status: 'review', note: '74 screens, light and dark',
                build: { artifact: 'hcig-ui-kit.html', title: 'HCIG Passport - Interface Library', favicon: '\u{1F4F1}', renumber: true },
              },
            ],
          },
        ],
      },
      {
        slug: 'tracking-platform',
        name: 'Group tracking platform',
        status: 'live',
        updated: '2026-09-04',
        flagship: { rank: 2, line: 'Every HCIG website reporting into one place. Adding the next property is one line.' },
        summary: 'One tracking system for every HCIG website.',
        detail: [
          'Phase 1 and 2 live. Registry, hub collector, tracker, group roll-up, partner attribution, alerts.',
          'MedPark is cut over. The next site is one line.',
        ],
        stages: [],
      },
      {
        slug: 'medcierge-website',
        name: 'Elite Medical Concierge website',
        status: 'review',
        updated: '2026-09-14',
        summary: 'medcierge.com rebuilt. Light design, 3D hero, scroll motion, readable by search and AI.',
        detail: [
          'Built from the live site on 2026-09-14. 9 pages, 34 images, every section kept.',
          'Homepage: 3D photo hero, moving partner logos, a sideways facilities tour, and a map that lights up the coast.',
          'Served noindex here. One command builds the indexable version for their hosting.',
        ],
        stages: [
          {
            name: 'Preview',
            note: 'The whole site, as it would go live.',
            items: [
              { slug: 'home-new', name: 'New website · navy and gold', kind: 'link', href: 'https://hcig-passport.vercel.app/medcierge-home/', status: 'review', note: 'Real Next.js website: home, services, 12 destinations, 50 hotel pages, partners, insurance, about, contact. Original wording, live Google map, desktop and phone' },
              { slug: 'site', name: 'Design 1 preview', kind: 'link', href: 'https://hcig-passport.vercel.app/medcierge', status: 'review', note: 'Light cream and gold, 9 pages, English and German' },
              { slug: 'site-v2', name: 'Design 2 preview · navy and gold', kind: 'link', href: 'https://hcig-passport.vercel.app/medcierge-v2', status: 'draft', note: '24 pages in English, German and Polish, light and dark mode. Home page rebuilt with hero and coast films' },
            ],
          },
          {
            name: 'Documents',
            items: [
              { slug: 'change-list', name: 'What changed, and what needs a yes', kind: 'md', src: 'docs/medcierge-change-list.md', status: 'draft', note: '17 open questions' },
            ],
          },
        ],
      },
    ],
  },

  {
    slug: 'tmasi',
    name: 'TMASI Global',
    short: 'TMASI',
    logo: 'LTMASI',
    accent: '#009A9C',
    accentInk: '#0F205C',
    site: 'https://tmasi.net',
    what: 'Medical, travel and insurance assistance. Care Without Borders.',
    where: 'Egypt, Germany, Spain, UAE and USA',
    projects: [
      {
        slug: 'urgent-edits',
        name: 'Urgent edits on tmasi.net',
        status: 'blocked',
        updated: '2026-09-26',
        summary: 'UI and UX fixes, news in four languages, favicon, share image, a sharp map and logo, technical fixes. Every word untouched.',
        detail: [
          'Server access set up 2026-09-26. The server accepts our key; one unlock step on this laptop remains.',
          '14 defects found on the live site, including a broken favicon and share image, a soft world map with two pins on the wrong countries, no canonical or hreflang, and every page marked English.',
          'Every word stays exactly as written. Every change is logged for the final email.',
          'Two news posts received: the Hansa Medica Group partnership at the Grand Egyptian Museum, and the ITIC Global 2026 sponsorship in Istanbul. Their photos arrived the same day.',
        ],
        checklist: [
          { text: 'Answer the questions on the edits', done: true, who: 'Mohamed' },
          { text: 'Send the new news posts', done: true, who: 'Mohamed' },
          { text: 'Add the photos for the two news posts', done: true, who: 'Mohamed' },
          { text: 'Unlock the server key on this laptop', done: false, who: 'Mohamed' },
          { text: 'Back up the live site, then apply the edits', done: false, who: 'Us' },
        ],
        stages: [
          {
            name: 'Documents',
            items: [
              { slug: 'worklog', name: 'Everything done and fixed', kind: 'md', src: 'docs/tmasi-worklog.md', status: 'draft', note: 'Kept from day one, for the final email' },
            ],
          },
        ],
      },
      {
        slug: 'website-v3',
        name: 'Website v3, rebuilt from scratch',
        status: 'draft',
        updated: '2026-09-26',
        summary: 'A new tmasi.net: the same words in a new design, found by search and AI, in seven languages.',
        detail: [
          'Spec written 2026-09-26, with every decision answered in ten rounds of questions.',
          'Partners first, the dark world map as the hero on light pages, a page per service and per office, seven languages.',
          'Every word kept exactly as on the live site. Design slots mark where Reham, the graphic designer, adds cards and images.',
        ],
        checklist: [
          { text: 'Answer the open decisions', done: true, who: 'Mohamed' },
          { text: 'Approve the spec', done: false, who: 'Mohamed' },
          { text: 'Planning documents and keyword map', done: false, who: 'Us' },
          { text: 'Home preview on HCIG Work', done: false, who: 'Us' },
        ],
        stages: [
          {
            name: 'Plan',
            items: [
              { slug: 'spec', name: 'What v3 is, and every decision', kind: 'md', src: 'specs/008-tmasi-website/spec.md', status: 'draft', note: 'Every decision answered. Waiting for approval' },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'medone',
    name: 'MedOne Group',
    short: 'MedOne',
    logo: 'LMEDONE',
    accent: '#565759',
    accentInk: '#000000',
    what: 'Travel medical services and care coordination.',
    where: 'Egypt',
    projects: [],
  },
  {
    slug: 'one-medical-center',
    name: 'One Medical Center',
    short: 'One Medical',
    logo: 'LONEC',
    accent: '#565759',
    accentInk: '#000000',
    what: 'Urgent care and outpatient.',
    where: 'Clearwater, Florida',
    projects: [],
  },
  {
    slug: 'one-medical-spa',
    name: 'One Medical Spa',
    short: 'One Spa',
    logo: 'LONESPA',
    accent: '#565759',
    accentInk: '#000000',
    what: 'Aesthetic and medical wellness.',
    where: 'Clearwater, Florida',
    projects: [],
  },
  {
    slug: 'uca-mena',
    name: 'UCA MENA',
    short: 'UCA MENA',
    logo: 'LUCA',
    accent: '#565759',
    accentInk: '#000000',
    what: 'Urgent Care Association for Egypt and the MENA region.',
    where: 'Egypt and MENA',
    projects: [],
  },
  {
    slug: 'scmg',
    name: 'Shakankiry Clinics Medical Group',
    short: 'SCMG',
    logo: 'LSCMG',
    accent: '#565759',
    accentInk: '#000000',
    what: 'Travel medical services.',
    where: 'Egypt',
    projects: [],
  },
];

module.exports = { COMPANIES, STATUS, PIPELINE, REVIEWER, OWNER };
