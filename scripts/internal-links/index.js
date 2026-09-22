/**
 * HCIG Internal Linking Engine (Spec 004)
 *
 * Provides:
 * 1. Validation of the keyword-to-page map (cannibalization, generic anchors, em/en dash ban).
 * 2. Crawl and audit of built HTML pages for orphan pages and dead-ends.
 * 3. Contextual related-link module generation without altering approved body sentences.
 */

const fs = require('fs');
const path = require('path');

const MAP_PATH = path.join(__dirname, '..', '..', 'data', 'keyword-page-map.json');

const GENERIC_ANCHORS = new Set([
  'click here',
  'read more',
  'learn more',
  'here',
  'more',
  'link',
  'view',
  'this page',
  'more info',
  'hier klicken',
  'mehr erfahren',
  'kliknij tutaj',
  'wiecej'
]);

function loadMap(customPath) {
  const filePath = customPath || MAP_PATH;
  if (!fs.existsSync(filePath)) {
    throw new Error(`Keyword page map not found at ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

/**
 * Validate the keyword map.
 * Checks for:
 * - Keyword cannibalization (FR-009)
 * - Generic anchor text (FR-003)
 * - Em/en dashes (Rule 1)
 * - Valid related links in same language (FR-005)
 * - Max links cap (FR-006)
 */
function validateMap(mapData) {
  const errors = [];
  const warnings = [];

  if (!mapData || !mapData.sites) {
    return { valid: false, errors: ['Invalid map data structure: missing sites object'] };
  }

  for (const [siteKey, site] of Object.entries(mapData.sites)) {
    if (!site.languages) {
      errors.push(`Site ${siteKey} has no languages defined`);
      continue;
    }

    for (const [lang, pages] of Object.entries(site.languages)) {
      if (!Array.isArray(pages)) {
        errors.push(`Site ${siteKey} language ${lang} must be an array of pages`);
        continue;
      }

      const keywordToUrl = new Map();
      const pageUrls = new Set(pages.map(p => p.url));

      for (const page of pages) {
        if (!page.url || !page.keywords || !page.anchorText) {
          errors.push(`Site ${siteKey} [${lang}]: Page missing url, keywords or anchorText`);
          continue;
        }

        // Check for em dashes or en dashes
        const combinedText = `${page.url} ${page.keywords.join(' ')} ${page.intent || ''} ${page.anchorText}`;
        if (/[\u2014\u2013]/.test(combinedText)) {
          errors.push(`Site ${siteKey} [${lang}] page ${page.url} contains forbidden em dash or en dash`);
        }

        // Check for generic anchor text
        const anchorLower = page.anchorText.trim().toLowerCase();
        if (GENERIC_ANCHORS.has(anchorLower) || anchorLower.length < 5) {
          errors.push(`Site ${siteKey} [${lang}] page ${page.url} uses generic or overly short anchor text: "${page.anchorText}"`);
        }

        // Check keyword cannibalization
        for (const kw of page.keywords) {
          const normKw = kw.trim().toLowerCase();
          if (keywordToUrl.has(normKw)) {
            const existingUrl = keywordToUrl.get(normKw);
            if (existingUrl !== page.url) {
              errors.push(`Cannibalization conflict in ${siteKey} [${lang}]: Keyword "${normKw}" claimed by both ${existingUrl} and ${page.url}`);
            }
          } else {
            keywordToUrl.set(normKw, page.url);
          }
        }

        // Check related links
        if (!Array.isArray(page.related) || page.related.length < 2) {
          warnings.push(`Site ${siteKey} [${lang}] page ${page.url} offers fewer than 2 related links`);
        } else if (page.related.length > 5) {
          errors.push(`Site ${siteKey} [${lang}] page ${page.url} exceeds max related links cap (${page.related.length} > 5)`);
        }

        // Check related links point to pages on the same site in same language
        for (const relUrl of (page.related || [])) {
          if (relUrl === page.url) {
            errors.push(`Site ${siteKey} [${lang}] page ${page.url} relates to itself in a self-loop`);
          }
          if (!pageUrls.has(relUrl)) {
            warnings.push(`Site ${siteKey} [${lang}] page ${page.url} references related URL ${relUrl} not in current map`);
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generate semantic HTML block for related internal links.
 * Non-destructive: Does not alter existing sentences.
 */
function generateRelatedLinksBlock(siteKey, lang, currentUrl, mapData) {
  const site = mapData?.sites?.[siteKey];
  if (!site || !site.languages || !site.languages[lang]) return '';

  const pages = site.languages[lang];
  const currentPage = pages.find(p => p.url === currentUrl);
  if (!currentPage || !Array.isArray(currentPage.related) || currentPage.related.length === 0) {
    return '';
  }

  const titles = {
    en: 'Related Medical Services & Locations',
    de: 'Verwandte medizinische Leistungen und Standorte',
    pl: 'Powiazane uslugi medyczne i lokalizacje',
    cs: 'Souvisejici lekarske sluzby a lokality'
  };

  const sectionTitle = titles[lang] || titles.en;

  const items = [];
  for (const relUrl of currentPage.related) {
    const targetPage = pages.find(p => p.url === relUrl);
    if (!targetPage) continue;
    items.push(`    <li class="hcig-related-links__item"><a href="${targetPage.url}" class="hcig-related-links__link">${targetPage.anchorText}</a></li>`);
  }

  if (items.length === 0) return '';

  return [
    '<!-- Start HCIG Contextual Internal Links (Spec 004) -->',
    '<aside class="hcig-related-links" aria-label="' + sectionTitle + '">',
    '  <div class="container hcig-related-links__inner">',
    '    <h4 class="hcig-related-links__title">' + sectionTitle + '</h4>',
    '    <ul class="hcig-related-links__list">',
    items.join('\n'),
    '    </ul>',
    '  </div>',
    '</aside>',
    '<!-- End HCIG Contextual Internal Links -->'
  ].join('\n');
}

/**
 * Audit internal links across built HTML files.
 * Identifies orphan pages and dead ends.
 */
function auditEstateLinks(distDir) {
  if (!fs.existsSync(distDir)) {
    return { error: `Directory ${distDir} does not exist.` };
  }

  function walk(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) walk(abs, out);
      else if (e.name.endsWith('.html')) out.push(abs);
    }
    return out;
  }

  const htmlFiles = walk(distDir);
  const rel = (abs) => abs.slice(distDir.length).replace(/\\/g, '/');

  function toCleanUrl(filePath) {
    let r = rel(filePath);
    if (r.endsWith('/index.html')) {
      r = r.slice(0, -11) || '/';
    } else if (r.endsWith('.html')) {
      r = r.slice(0, -5);
    }
    return r.replace(/\/+$/, '') || '/';
  }

  const incomingLinks = new Map();
  const outgoingLinks = new Map();

  for (const file of htmlFiles) {
    const url = toCleanUrl(file);
    incomingLinks.set(url, new Set());
    outgoingLinks.set(url, new Set());
  }

  for (const file of htmlFiles) {
    const fromUrl = toCleanUrl(file);
    const content = fs.readFileSync(file, 'utf8');

    for (const m of content.matchAll(/\bhref="([^"#?]+)"/g)) {
      let target = m[1];
      if (/^(https?:|data:|mailto:|tel:|\/\/)/.test(target)) continue;
      if (!target.startsWith('/')) continue;

      let normTarget = target.replace(/\/index\.html$/, '').replace(/\.html$/, '').replace(/\/+$/, '') || '/';

      if (outgoingLinks.has(fromUrl)) {
        outgoingLinks.get(fromUrl).add(normTarget);
      }
      if (incomingLinks.has(normTarget)) {
        incomingLinks.get(normTarget).add(fromUrl);
      }
    }
  }

  const orphans = [];
  const deadEnds = [];

  for (const [url, inSet] of incomingLinks.entries()) {
    // Root pages and system pages are excluded from orphan consideration
    if (inSet.size === 0 && url !== '/' && !url.includes('not-found') && !url.includes('_error')) {
      orphans.push(url);
    }
  }

  for (const [url, outSet] of outgoingLinks.entries()) {
    if (outSet.size === 0 && !url.includes('not-found') && !url.includes('_error')) {
      deadEnds.push(url);
    }
  }

  return {
    totalPages: htmlFiles.length,
    orphans,
    deadEnds,
    inboundStats: Array.from(incomingLinks.entries()).map(([url, s]) => ({ url, count: s.size }))
  };
}

module.exports = {
  loadMap,
  validateMap,
  generateRelatedLinksBlock,
  auditEstateLinks,
  GENERIC_ANCHORS
};

if (require.main === module) {
  const mapData = loadMap();
  const val = validateMap(mapData);
  console.log('=== HCIG KEYWORD MAP VALIDATION ===');
  if (val.valid) {
    console.log('Map is valid. Zero cannibalization, zero generic anchors, zero em/en dashes.');
  } else {
    console.error('Validation errors:', val.errors);
  }
  if (val.warnings.length) {
    console.warn('Warnings:', val.warnings);
  }

  const distDir = path.join(__dirname, '..', '..', 'dist');
  if (fs.existsSync(distDir)) {
    const audit = auditEstateLinks(distDir);
    console.log(`\n=== HCIG ESTATE LINK AUDIT (${audit.totalPages} pages) ===`);
    console.log(`Orphan pages (0 incoming links): ${audit.orphans.length}`);
    if (audit.orphans.length > 0) {
      console.log('Orphans:', audit.orphans.slice(0, 10));
    }
    console.log(`Dead-end pages (0 outgoing links): ${audit.deadEnds.length}`);
  }
}
