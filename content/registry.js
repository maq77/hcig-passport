/**
 * HCIG Studio: the estate registry.
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
 * Status vocabulary. This IS the review gate. Keep it honest.
 * ------------------------------------------------------------
 *   planned   scoped, not started
 *   draft     being built, not ready for anyone to look at
 *   review    with the reviewer, waiting on her
 *   changes   changes requested, back with us
 *   approved  signed off, cleared to deploy to the company's hosting
 *   live      deployed to the company's real hosting
 *   blocked   waiting on someone outside the team
 *
 * Rule: a status is a statement of fact, not a hope. If you are unsure whether
 * something is approved, it is not approved.
 */

const REVIEWER = 'Irina Rise, Marketing Director';
const OWNER = 'Mohamed Amin';

/* ------------------------------------------------------------------ status */

const STATUS = {
  planned: { label: 'Planned', tone: 'neutral', icon: 'circle-dashed', blurb: 'Scoped. Not started.' },
  draft: { label: 'Draft', tone: 'neutral', icon: 'pencil', blurb: 'Being built. Not ready to review.' },
  review: { label: 'In review', tone: 'info', icon: 'eye', blurb: 'With the reviewer. Waiting on her.' },
  changes: { label: 'Changes requested', tone: 'warn', icon: 'rotate', blurb: 'Feedback received. Back with us.' },
  approved: { label: 'Approved', tone: 'ok', icon: 'check', blurb: 'Signed off. Cleared to deploy.' },
  live: { label: 'Live', tone: 'live', icon: 'globe', blurb: 'Deployed to the company hosting.' },
  blocked: { label: 'Blocked', tone: 'stop', icon: 'lock', blurb: 'Waiting on someone outside the team.' },
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
        name: 'Website v2',
        status: 'live',
        updated: '2026-09-05',
        summary:
          '56 pages, English, German and Polish, one template system.',
        detail: [
          'One v2 template layer replaced the 2019 theme. Every page keeps its own hero, images and video.',
          'Rollback is two lines: the old markup is still in every file.',
        ],
        stages: [
          {
            name: 'Live site',
            note: 'Built on the server before Studio existed. No staging copy here.',
            items: [
              { slug: 'english', name: 'English', kind: 'link', href: 'https://www.medparkhospitals.com/', status: 'live', note: '56 pages' },
              { slug: 'german', name: 'German', kind: 'link', href: 'https://www.medparkhospitals.com/de/', status: 'live', note: 'Strings marked NEW need a native reader' },
              { slug: 'polish', name: 'Polish', kind: 'link', href: 'https://www.medparkhospitals.com/pl/', status: 'live', note: 'Strings marked NEW need a native reader' },
            ],
          },
        ],
      },
      {
        slug: 'location-pages',
        name: 'Location pages',
        status: 'live',
        updated: '2026-09-07',
        summary:
          'Six pages written for a place, not a service.',
        detail: [
          'Aimed at how a guest searches. "krankenhaus hurghada" is the strongest non-brand term the site has.',
        ],
        stages: [
          {
            name: 'Live pages',
            items: [
              { slug: 'hurghada', name: 'Hospital Hurghada', kind: 'link', href: 'https://www.medparkhospitals.com/hospital-hurghada/', status: 'live' },
              { slug: 'sahl-hasheesh', name: 'Hospital Sahl Hasheesh', kind: 'link', href: 'https://www.medparkhospitals.com/hospital-sahl-hasheesh/', status: 'live' },
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
                name: 'The strategy document',
                kind: 'link',
                href: 'https://claude.ai/code/artifact/190b3075-4158-42cc-835e-44ab2785cce8',
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
        status: 'draft',
        updated: '2026-09-08',
        summary: 'Three pages, one per resort cluster.',
        detail: ['Proposal written. Designs and a live demo next, reviewed here first.'],
        stages: [
          {
            name: 'Documents',
            items: [
              { slug: 'proposal', name: 'Proposal', kind: 'html', src: 'docs/247clinic-landing-pages-proposal.html', status: 'draft' },
              { slug: 'plan', name: 'Working plan', kind: 'md', src: 'docs/247clinic-hotel-landing-pages-plan.md', status: 'draft' },
            ],
          },
          { name: 'UI kit', note: 'Design system, components, page blocks.', items: [] },
          { name: 'Live demo', note: 'Clickable, for review and live edits.', items: [] },
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
