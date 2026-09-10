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
        status: 'approved',
        updated: '2026-09-01',
        summary: '15 scored findings, six of them P0.',
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
              { slug: 'open-items', name: 'What is still open', kind: 'md', src: 'docs/247clinic-open-items.md', status: 'review', note: 'Every note kept off the pages, with the evidence' },
              { slug: 'video-plan', name: 'Where every film goes', kind: 'md', src: 'docs/247clinic-video-plan.md', status: 'review', note: 'The 16 films mapped to sections. Ready to apply to whichever design wins' },
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
            note: 'Three designs, each built for all three clinics. Pick one, or ask for parts of one inside another. Every page links to the others.',
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
            ],
          },
        ],
      },
      {
        slug: 'website',
        name: 'Website',
        status: 'planned',
        updated: '2026-09-08',
        summary: 'New site. Brief not yet given.',
        detail: [
          'Cloudflare sits in front of this domain, which changes the deploy playbook.',
          'Reuse the MedPark v2 architecture.',
        ],
        stages: [],
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
    ],
  },

  {
    slug: 'tmasi',
    name: 'TMASI Global',
    short: 'TMASI',
    logo: 'LTMASI',
    accent: '#009A9C',
    accentInk: '#0F205C',
    what: 'Medical assistance and case coordination. Care Without Borders.',
    where: 'Global',
    projects: [],
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
