#!/usr/bin/env node
/**
 * The SEO files 247clinic.net has to deploy alongside the landing pages.
 *
 *   node scripts/gen-247-seo.js   ->  docs/247clinic-deploy/
 *
 * These are not part of HCIG Work. HCIG Work is noindex from top to bottom and
 * that is correct for a demo. These are the real files for the real domain, so
 * that going live is a copy rather than a rewrite.
 *
 *   sitemap-clinics.xml   the three pages, with their films declared
 *   llms.txt              a plain summary for the chat tools that read it
 */

const fs = require('fs');
const path = require('path');
const { CLINICS, PHONE, SINCE, NETWORK, STORIES, SERVICE_FILMS } = require('./lp/data');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', '247clinic-deploy');
const SITE = 'https://www.247clinic.net';
const TODAY = new Date().toISOString().slice(0, 10);

fs.mkdirSync(OUT, { recursive: true });

const x = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Video entries matter more than usual here. The clinic's own films are the
   only thing on these pages a competitor cannot copy, and a declared film is
   eligible for the video results as well as the blue links. */
function videosFor(c) {
  const films = [
    ['The clinic film', `24/7 Clinic at ${c.hotel}, ${c.area}. Urgent care inside the resort, open 24 hours.`, 'v-commercial.mp4'],
    ['Meet the team', `The doctors and nurses at the 24/7 Clinic serving ${c.hotel}.`, c.teamFilm.toLowerCase().replace('vstaff', 'v-staff') + '.mp4'],
  ];
  if (c.walkLoop) {
    films.push(['How to find us', `The walk from ${c.hotelShort} reception to the 24/7 Clinic, filmed.`, 'v-howtofind.mp4']);
  }
  return films
    .map(
      ([title, desc, file]) => `    <video:video>
      <video:thumbnail_loc>${SITE}/assets/og/${c.slug}.jpg</video:thumbnail_loc>
      <video:title>${x(title)}</video:title>
      <video:description>${x(desc)}</video:description>
      <video:content_loc>${SITE}/assets/video/${file}</video:content_loc>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
    </video:video>`
    )
    .join('\n');
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${CLINICS.map(
  (c) => `  <url>
    <loc>${SITE}${c.url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <image:image>
      <image:loc>${SITE}/assets/og/${c.slug}.jpg</image:loc>
      <image:title>${x(`24/7 Clinic at ${c.hotel}, ${c.area}`)}</image:title>
    </image:image>
${videosFor(c)}
  </url>`
).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(OUT, 'sitemap-clinics.xml'), sitemap);

const llms = `# 24/7 Clinic

> Urgent care clinics inside hotels and resorts in Egypt. Open 24 hours, every
> day. ${NETWORK} clinics nationwide, treating international visitors since ${SINCE}.

Telephone: ${PHONE}
Languages: English, German, Italian, French
Payment: most international travel insurers billed directly, paperwork handled

## What the clinics treat

Emergencies, sudden illness, fever and stomach upset, sunburn, ear infections,
dental pain and dental emergencies, diving and scooter accidents, IV infusions,
prescriptions, laboratory tests, and transfer to hospital when it is needed.
No appointment is required at any location.

## Free for hotel guests

Blood pressure and blood sugar are checked free of charge for guests of the
host hotel, without an appointment.

## Clinic locations

${CLINICS.map(
  (c) => `### ${c.hotel}, ${c.area}
${SITE}${c.url}
24/7 Urgent Care Clinic serving guests of ${c.hotel} in ${c.area}, on the Red
Sea coast of Egypt. Open 24 hours. Telephone ${PHONE}.`
).join('\n\n')}

## Films

${STORIES.length} guest stories and ${SERVICE_FILMS.length} films of the treatments
themselves are published on the clinic pages, filmed at the clinics.
`;

fs.writeFileSync(path.join(OUT, 'llms.txt'), llms);

console.log(`\n  docs/247clinic-deploy/sitemap-clinics.xml   ${CLINICS.length} pages, films declared`);
console.log(`  docs/247clinic-deploy/llms.txt              for the assistants that read it\n`);
