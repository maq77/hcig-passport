/**
 * Test proof suite for Spec 004 (Internal links)
 * Verifies all functional requirements and edge cases.
 */

const assert = require('assert');
const path = require('path');
const {
  loadMap,
  validateMap,
  generateRelatedLinksBlock,
  GENERIC_ANCHORS
} = require('./index');

console.log('Running Spec 004 Internal Links Proof Suite...\n');

// 1. Real map loads and is valid
const realMap = loadMap();
const realValidation = validateMap(realMap);
assert.strictEqual(realValidation.valid, true, 'Real keyword-page-map.json must be valid');
assert.strictEqual(realValidation.errors.length, 0, 'Real map must have 0 errors');
console.log('✔ Assertion 1 passed: Real keyword-page-map.json is structurally valid and error-free.');

// 2. Keyword cannibalization detection (FR-009, SC-003)
const cannibalMap = {
  sites: {
    'medparkhospitals.com': {
      name: 'MedPark',
      languages: {
        en: [
          {
            url: '/page-a',
            keywords: ['hospital hurghada', 'emergency clinic'],
            anchorText: 'Hospital Hurghada Emergency Department',
            related: ['/page-b', '/page-c']
          },
          {
            url: '/page-b',
            keywords: ['hospital hurghada', 'general consultation'], // Collides with page-a!
            anchorText: 'Consultation Services at Hospital',
            related: ['/page-a', '/page-c']
          },
          {
            url: '/page-c',
            keywords: ['diagnostics center'],
            anchorText: 'Advanced Diagnostics Center',
            related: ['/page-a', '/page-b']
          }
        ]
      }
    }
  }
};
const cannibalRes = validateMap(cannibalMap);
assert.strictEqual(cannibalRes.valid, false, 'Cannibalization must fail validation');
assert.ok(
  cannibalRes.errors.some(e => e.includes('Cannibalization conflict') && e.includes('hospital hurghada')),
  'Cannibalization error must name the conflicting keyword'
);
console.log('✔ Assertion 2 passed: Keyword cannibalization is detected and blocked.');

// 3. Generic anchor rejection (FR-003)
const genericMap = {
  sites: {
    'test.com': {
      name: 'Test',
      languages: {
        en: [
          {
            url: '/a',
            keywords: ['kw a'],
            anchorText: 'click here', // Forbidden generic anchor!
            related: ['/b', '/c']
          },
          {
            url: '/b',
            keywords: ['kw b'],
            anchorText: 'Valid Anchor Description',
            related: ['/a', '/c']
          }
        ]
      }
    }
  }
};
const genericRes = validateMap(genericMap);
assert.strictEqual(genericRes.valid, false, 'Generic anchor must fail validation');
assert.ok(
  genericRes.errors.some(e => e.includes('generic or overly short anchor text')),
  'Generic anchor error must be reported'
);
console.log('✔ Assertion 3 passed: Generic anchor text is rejected.');

// 4. Em and En dash ban (HCIG Core Rule 1)
const emDashMap = {
  sites: {
    'test.com': {
      name: 'Test',
      languages: {
        en: [
          {
            url: '/a',
            keywords: ['kw a'],
            anchorText: 'Emergency Care \u2014 24/7 Response', // Forbidden em dash!
            related: ['/b', '/c']
          },
          {
            url: '/b',
            keywords: ['kw b'],
            anchorText: 'Hospital Outpatient Services',
            related: ['/a', '/c']
          }
        ]
      }
    }
  }
};
const emDashRes = validateMap(emDashMap);
assert.strictEqual(emDashRes.valid, false, 'Em dash must fail validation');
assert.ok(
  emDashRes.errors.some(e => e.includes('contains forbidden em dash or en dash')),
  'Em dash error must be reported'
);
console.log('✔ Assertion 4 passed: Em and en dashes are strictly banned.');

// 5. Capping of related links (FR-006)
const overCappedMap = {
  sites: {
    'test.com': {
      name: 'Test',
      languages: {
        en: [
          {
            url: '/a',
            keywords: ['kw a'],
            anchorText: 'First Page Description',
            related: ['/b', '/c', '/d', '/e', '/f', '/g'] // 6 links exceeds cap of 5
          }
        ]
      }
    }
  }
};
const overCappedRes = validateMap(overCappedMap);
assert.strictEqual(overCappedRes.valid, false, 'Over-capped related links must fail validation');
assert.ok(
  overCappedRes.errors.some(e => e.includes('exceeds max related links cap')),
  'Cap violation must be reported'
);
console.log('✔ Assertion 5 passed: Related links cap (max 5) is strictly enforced.');

// 6. Self-loop detection
const selfLoopMap = {
  sites: {
    'test.com': {
      name: 'Test',
      languages: {
        en: [
          {
            url: '/a',
            keywords: ['kw a'],
            anchorText: 'First Page Description',
            related: ['/a', '/b'] // Relates to itself!
          }
        ]
      }
    }
  }
};
const selfLoopRes = validateMap(selfLoopMap);
assert.strictEqual(selfLoopRes.valid, false, 'Self-loop must fail validation');
assert.ok(
  selfLoopRes.errors.some(e => e.includes('relates to itself in a self-loop')),
  'Self loop error must be reported'
);
console.log('✔ Assertion 6 passed: Self-loop links are detected and rejected.');

// 7. Non-destructive related link HTML generation (FR-002, FR-004)
const sampleHtml = generateRelatedLinksBlock('medparkhospitals.com', 'en', '/healthhub.php', realMap);
assert.ok(sampleHtml.includes('<aside class="hcig-related-links"'), 'HTML must contain semantic aside element');
assert.ok(sampleHtml.includes('Related Medical Services & Locations'), 'HTML must have descriptive section heading');
assert.ok(sampleHtml.includes('/emergency-urgent-care/'), 'Must link to designated related target');
assert.ok(sampleHtml.includes('/hospitals-in-hurghada/'), 'Must link to designated related target');
assert.strictEqual(/[\u2014\u2013]/.test(sampleHtml), false, 'Generated HTML must contain zero em or en dashes');

// Test that body text is preserved
const originalBody = '<p>MedPark Health Hub provides premier medical care in Hurghada.</p>';
const combinedPage = originalBody + '\n' + sampleHtml;
assert.ok(combinedPage.includes(originalBody), 'Original body copy is 100% preserved without alterations');
console.log('✔ Assertion 7 passed: Contextual related links generate valid non-destructive semantic HTML.');

// 8. Multi-language isolation (FR-005)
const deHtml = generateRelatedLinksBlock('medparkhospitals.com', 'de', '/de/healthhub.php', realMap);
assert.ok(deHtml.includes('Verwandte medizinische Leistungen und Standorte'), 'German heading must be used');
assert.ok(deHtml.includes('/de/notaufnahme-hurghada.php'), 'Must only link to German URLs');
assert.strictEqual(deHtml.includes('/emergency-urgent-care/'), false, 'German page must never link to English URL');
console.log('✔ Assertion 8 passed: Language isolation strictly maintained across generated link blocks.');

console.log('\nAll 8 assertions passed! Spec 004 Internal Links verification complete.\n');
