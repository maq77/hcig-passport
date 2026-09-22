/**
 * Test proof suite for Spec 003 (AI Visibility)
 * Verifies all functional requirements, schema parity, word counts, and compliance rules.
 */

const assert = require('assert');
const path = require('path');
const { loadQuestions, loadLog, analyzeResponse, recordCheck, getTrendReport } = require('./tracker');
const { loadAnswerBlocks, validateAnswerBlock, generateAnswerMarkup } = require('./markup');
const { generateMedParkLLMS, generate247ClinicLLMS, generateHCIGLLMS } = require('./gen-llms');

console.log('Running Spec 003 AI Visibility Proof Suite...\n');

// 1. Question Set Coverage (FR-001, FR-004)
const qData = loadQuestions();
assert.ok(Array.isArray(qData.questions), 'Questions must be an array');
assert.ok(qData.questions.length >= 10, 'Must have at least 10 tracked questions');
const langs = new Set(qData.questions.map(q => q.language));
assert.ok(langs.has('en') && langs.has('de') && langs.has('pl') && langs.has('cs'), 'Must cover EN, DE, PL, and CS');
const hasContested = qData.questions.some(q => q.type === 'contested');
assert.strictEqual(hasContested, true, 'Must include contested questions HCIG currently loses (FR-004)');
console.log('✔ Assertion 1 passed: Question set covers 4 languages with contested queries.');

// 2. Failed checks logged as failed, never as "not cited" (FR-003)
const testLog = { version: '1.0.0', summary: {}, history: [] };
const failedCheck = {
  checkId: 'chk-test-fail',
  date: '2026-09-22',
  assistant: 'chatgpt',
  questionId: 'q-en-01',
  language: 'en',
  status: 'failed',
  cited: false,
  errorReason: 'Rate limit / timeout',
  namedBrands: [],
  competitorsCited: []
};
recordCheck(failedCheck, testLog);
assert.strictEqual(testLog.summary.failedChecks, 1, 'Failed check must increment failedChecks count');
assert.strictEqual(testLog.summary.successfulChecks, 0, 'Failed check must not count as successful check');
assert.strictEqual(testLog.summary.overallCitationRate, 0, 'Failed check must not skew citation rate');
console.log('✔ Assertion 2 passed: Failed assistant checks are logged as failed, never as "not cited".');

// 3. Response analysis and competitor extraction (FR-002)
const sampleResponse = 'For emergency hospital treatment, El Gouna Hospital and MedPark Health Hub provide emergency services.';
const analysis = analyzeResponse(sampleResponse, ['El Gouna Hospital', 'Nile Hospital Hurghada']);
assert.strictEqual(analysis.cited, true, 'Must identify MedPark Health Hub');
assert.ok(analysis.namedBrands.includes('MedPark Health Hub'), 'Must record MedPark Health Hub');
assert.ok(analysis.competitorsCited.includes('El Gouna Hospital'), 'Must extract competitor El Gouna Hospital');
console.log('✔ Assertion 3 passed: Response analysis accurately identifies our brands and competitors.');

// 4. Answer-first blocks word count 40 to 60 words (FR-005)
const blocksData = loadAnswerBlocks();
assert.ok(Array.isArray(blocksData.blocks) && blocksData.blocks.length >= 6, 'Must have at least 6 answer blocks');
for (const block of blocksData.blocks) {
  const val = validateAnswerBlock(block);
  assert.strictEqual(val.valid, true, `Block ${block.id} must pass validation: ${val.errors.join(', ')}`);
  assert.ok(val.wordCount >= 40 && val.wordCount <= 60, `Block ${block.id} word count ${val.wordCount} must be 40 to 60`);
}
console.log('✔ Assertion 4 passed: All service answer blocks are strictly 40 to 60 words.');

// 5. Word-for-word parity between visible answer text and JSON-LD schema (FR-006)
for (const block of blocksData.blocks) {
  const markup = generateAnswerMarkup(block);
  assert.strictEqual(markup.schemaTextMatchesExact, true, `Block ${block.id} schema text must match visible text exactly`);
  assert.strictEqual(markup.jsonLd.mainEntity[0].acceptedAnswer.text, block.answer);
}
console.log('✔ Assertion 5 passed: Word-for-word parity confirmed between visible copy and JSON-LD schema.');

// 6. Exact building naming & accreditation compliance (FR-007, Rule 1)
for (const block of blocksData.blocks) {
  const text = `${block.question} ${block.answer}`;
  assert.strictEqual(/[\u2014\u2013]/.test(text), false, `Block ${block.id} must not have em or en dashes`);
  if (text.includes('Sahl Hasheesh')) {
    assert.ok(text.includes('MedPark Health Hub'), `Block ${block.id} must name Sahl Hasheesh as MedPark Health Hub`);
  }
  if (text.includes('El Quseir')) {
    assert.ok(text.includes('MedPark Hospital'), `Block ${block.id} must name El Quseir as MedPark Hospital`);
  }
}
console.log('✔ Assertion 6 passed: Exact building names and compliance standards verified.');

// 7. llms.txt generation and compliance (FR-008)
const mpLLMS = generateMedParkLLMS();
const c7LLMS = generate247ClinicLLMS();
const hcLLMS = generateHCIGLLMS();
for (const [name, content] of [['MedPark', mpLLMS], ['24/7 Clinic', c7LLMS], ['HCIG', hcLLMS]]) {
  assert.strictEqual(/[\u2014\u2013]/.test(content), false, `${name} llms.txt must have no em/en dashes`);
  assert.ok(content.includes('Official Partner of Global Healthcare Accreditation'), `${name} llms.txt must have exact GHA phrasing`);
  assert.ok(content.includes('Official Partner of German Medical Wellness Association'), `${name} llms.txt must have exact DMWV phrasing`);
}
assert.ok(mpLLMS.includes('MedPark Health Hub') && mpLLMS.includes('MedPark Hospital'), 'MedPark llms.txt must name both facilities');
assert.ok(mpLLMS.includes('El Quseir'), 'MedPark llms.txt must spell El Quseir correctly');
console.log('✔ Assertion 7 passed: llms.txt generated cleanly across all properties.');

// 8. Trend report generation (FR-010, SC-002)
const trendReport = getTrendReport(loadLog());
assert.ok(trendReport.includes('HCIG AI CITATION TREND REPORT'), 'Trend report must contain header');
assert.ok(trendReport.includes('Overall Citation Rate:'), 'Trend report must contain overall citation rate');
console.log('✔ Assertion 8 passed: Trend logging and reporting works as expected.');

console.log('\nAll 8 assertions passed! Spec 003 AI Visibility verification complete.\n');
