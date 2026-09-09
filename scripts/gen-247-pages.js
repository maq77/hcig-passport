#!/usr/bin/env node
/**
 * 24/7 Clinic: in-hotel landing pages.
 *
 *   node scripts/gen-247-pages.js     ->  src/247-lp-<slug>-d<N>.html
 *
 * THREE designs, ONE content table. Irina picks a direction, or asks for parts
 * of one inside another, and the words, numbers, coordinates and images only
 * ever exist once, in `scripts/lp/data.js`.
 *
 *   design-1  Clean and clinical   white, split hero, card grid
 *   design-2  Bold and cinematic   full-bleed film, big type, motion
 *   design-3  Concierge            calm, Calisto MT headlines, timeline
 *
 * While the direction is being chosen, only Premier Le Reve is registered in
 * HCIG Work. The other two clinics are generated so the moment a design is
 * approved they are one registry edit away.
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const { CLINICS } = require('./lp/data');

const DESIGNS = [
  require('./lp/design-1'),
  require('./lp/design-2'),
  require('./lp/design-3'),
];

let n = 0;
for (const c of CLINICS) {
  DESIGNS.forEach((d, i) => {
    const file = `247-lp-${c.slug}-d${i + 1}.html`;
    fs.writeFileSync(path.join(SRC, file), d.render(c));
    n += 1;
    if (c.slug === 'le-reve') console.log(`  src/${file}   ${d.NAME}`);
  });
}

console.log(`\n  ${n} pages: ${CLINICS.length} clinics x ${DESIGNS.length} designs.`);
console.log('  Only the three Premier Le Reve designs are registered while one is chosen.\n');
