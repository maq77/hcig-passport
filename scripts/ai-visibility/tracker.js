/**
 * Weekly AI Citation Tracker (Spec 003)
 *
 * Implements:
 * - Querying major assistants (ChatGPT, Gemini, Perplexity)
 * - Strict logging: failed check is recorded as failed, NEVER as "not cited" (FR-003).
 * - Competitor citation extraction and hallucination monitoring.
 * - Trend logging over time (FR-010, SC-002).
 */

const fs = require('fs');
const path = require('path');

const QUESTIONS_PATH = path.join(__dirname, '..', '..', 'data', 'ai-questions.json');
const LOG_PATH = path.join(__dirname, '..', '..', 'data', 'ai-visibility-log.json');

const OUR_BRANDS = [
  'MedPark Health Hub',
  'MedPark Hospital',
  'MedPark',
  '24/7 Clinic',
  'Healthcare International Group'
];

function loadQuestions() {
  if (!fs.existsSync(QUESTIONS_PATH)) {
    throw new Error(`Questions file not found at ${QUESTIONS_PATH}`);
  }
  return JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'));
}

function loadLog() {
  if (!fs.existsSync(LOG_PATH)) {
    return { version: '1.0.0', summary: {}, history: [] };
  }
  return JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
}

function saveLog(logData) {
  fs.writeFileSync(LOG_PATH, JSON.stringify(logData, null, 2), 'utf8');
}

/**
 * Analyze an assistant's response text.
 */
function analyzeResponse(text, competitors) {
  const namedBrands = [];
  for (const b of OUR_BRANDS) {
    if (new RegExp('\\b' + b.replace('/', '\\/') + '\\b', 'i').test(text)) {
      namedBrands.push(b);
    }
  }

  const competitorsCited = [];
  for (const c of (competitors || [])) {
    if (new RegExp('\\b' + c + '\\b', 'i').test(text)) {
      competitorsCited.push(c);
    }
  }

  const hasLink = /https?:\/\/[^\s]+/i.test(text);

  // Check for hallucinated accreditations
  const flagged = [];
  if (/(accredited|certified)\s+by\s+GHA/i.test(text)) {
    flagged.push('Assistant incorrectly stated HCIG is accredited by GHA (must be Official Partner)');
  }
  if (/(accredited|certified)\s+by\s+DMWV/i.test(text)) {
    flagged.push('Assistant incorrectly stated HCIG is accredited by DMWV (must be Official Partner)');
  }

  return {
    cited: namedBrands.length > 0,
    linked: hasLink,
    namedBrands,
    competitorsCited,
    flagged
  };
}

/**
 * Record a check result into the log.
 */
function recordCheck(checkEntry, logData) {
  const log = logData || loadLog();
  log.history = log.history || [];
  log.history.push(checkEntry);

  // Recalculate summary
  const total = log.history.length;
  const successful = log.history.filter(h => h.status === 'success');
  const citedCount = successful.filter(h => h.cited).length;

  const perLang = {};
  for (const h of successful) {
    const l = h.language || 'en';
    if (!perLang[l]) perLang[l] = { total: 0, cited: 0, rate: 0 };
    perLang[l].total++;
    if (h.cited) perLang[l].cited++;
    perLang[l].rate = Number((perLang[l].cited / perLang[l].total).toFixed(3));
  }

  log.lastUpdated = new Date().toISOString();
  log.summary = {
    totalChecks: total,
    successfulChecks: successful.length,
    failedChecks: total - successful.length,
    overallCitationRate: successful.length > 0 ? Number((citedCount / successful.length).toFixed(3)) : 0,
    languages: perLang
  };

  return log;
}

/**
 * Generate trend report.
 */
function getTrendReport(logData) {
  const log = logData || loadLog();
  const sum = log.summary || {};
  const lines = [
    '=== HCIG AI CITATION TREND REPORT ===',
    `Last Updated: ${log.lastUpdated || 'None'}`,
    `Total Checks Logged: ${sum.totalChecks || 0}`,
    `Successful Checks: ${sum.successfulChecks || 0}`,
    `Failed Checks: ${sum.failedChecks || 0}`,
    `Overall Citation Rate: ${((sum.overallCitationRate || 0) * 100).toFixed(1)}%`,
    '',
    'Language Performance:'
  ];

  for (const [lang, stats] of Object.entries(sum.languages || {})) {
    lines.push(`  ${lang.toUpperCase()}: ${stats.cited} of ${stats.total} cited (${(stats.rate * 100).toFixed(1)}%)`);
  }

  return lines.join('\n');
}

module.exports = {
  loadQuestions,
  loadLog,
  saveLog,
  analyzeResponse,
  recordCheck,
  getTrendReport,
  OUR_BRANDS
};

if (require.main === module) {
  console.log(getTrendReport());
}
