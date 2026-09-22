/**
 * AI Visibility Markup & Schema Generator (Spec 003)
 *
 * Enforces:
 * 1. 40 to 60 word answer-first copy (FR-005).
 * 2. Word-for-word parity between visible text and FAQPage JSON-LD schema (FR-006).
 * 3. Exact building names and partnership wording (FR-007, Core Memory).
 */

const fs = require('fs');
const path = require('path');

const BLOCKS_PATH = path.join(__dirname, '..', '..', 'data', 'answer-blocks.json');

function loadAnswerBlocks(customPath) {
  const filePath = customPath || BLOCKS_PATH;
  if (!fs.existsSync(filePath)) {
    throw new Error(`Answer blocks not found at ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function countWords(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function validateAnswerBlock(block) {
  const errors = [];
  const wc = countWords(block.answer);

  if (wc < 40 || wc > 60) {
    errors.push(`Block ${block.id}: word count ${wc} is outside the required 40 to 60 word range`);
  }

  const allText = `${block.question} ${block.answer}`;
  if (/[\u2014\u2013]/.test(allText)) {
    errors.push(`Block ${block.id}: contains forbidden em dash or en dash`);
  }

  // Exact building naming check
  if (allText.includes('Sahl Hasheesh') && !allText.includes('MedPark Health Hub')) {
    errors.push(`Block ${block.id}: Sahl Hasheesh location must be named MedPark Health Hub`);
  }
  if (/El[\s-]Quseir|Al[\s-]Owina/i.test(allText)) {
    if (!allText.includes('MedPark Hospital')) {
      errors.push(`Block ${block.id}: El Quseir facility must be named MedPark Hospital`);
    }
    if (!allText.includes('El Quseir')) {
      errors.push(`Block ${block.id}: spelling must strictly be "El Quseir"`);
    }
  }

  // Exact accreditation phrasing check
  if (/accredited by GHA|certified by GHA|GHA accredited/i.test(allText)) {
    errors.push(`Block ${block.id}: GHA must only be phrased as Official Partner, never accredited by`);
  }
  if (/accredited by DMWV|certified by DMWV/i.test(allText)) {
    errors.push(`Block ${block.id}: DMWV must only be phrased as Official Partner, never accredited by`);
  }

  return {
    valid: errors.length === 0,
    errors,
    wordCount: wc
  };
}

function generateAnswerMarkup(block) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': block.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': block.answer
        }
      }
    ]
  };

  const visibleHtml = [
    '<!-- Start Answer-First Block (Spec 003) -->',
    '<section class="hcig-answer-first" aria-label="Direct answer">',
    '  <div class="container hcig-answer-first__inner">',
    '    <p class="hcig-answer-first__q"><strong>' + block.question + '</strong></p>',
    '    <p class="hcig-answer-first__a">' + block.answer + '</p>',
    '  </div>',
    '</section>',
    '<script type="application/ld+json">',
    JSON.stringify(jsonLd, null, 2),
    '</script>',
    '<!-- End Answer-First Block -->'
  ].join('\n');

  return {
    visibleHtml,
    jsonLd,
    schemaTextMatchesExact: jsonLd.mainEntity[0].acceptedAnswer.text === block.answer
  };
}

module.exports = {
  loadAnswerBlocks,
  countWords,
  validateAnswerBlock,
  generateAnswerMarkup
};
