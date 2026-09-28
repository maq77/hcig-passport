# Contract: Word-for-Word Content Preservation

Governs text handling across TMASI Global v2 and v3. Establishes verification rules to ensure zero unauthorized alterations to client copy.

## 1. Absolute Directives

1. Every sentence, heading, bullet point, and statistic on `tmasi.net` is immutable.
2. No marketing flourishes, artificial intelligence fluff, or synthetic claims may be introduced.
3. Typography adjustments, spacing fixes, layout restructuring, and punctuation corrections (such as removing invalid replacement characters or non-breaking spaces) are allowed only when text semantics and vocabulary remain identical.
4. Grammar corrections must be explicitly recorded in `docs/tmasi-worklog.md`.

## 2. Source Content Inventory

All production text extracts directly from `tmasi-live/backup-2026-09-26/public_html/`:

- Hero Taglines:
  - "Your Care. One Call Away."
  - "TMASI Global: Core Values"
  - "Care Without Borders"
- Statistics:
  - "30,000+ Cases Handled"
  - "570+ Medical Repatriations"
  - "24/7 Operations Desk"
- Core Values:
  - "Integrity & Trust"
  - "Rapid Response"
  - "Clinical Excellence"
  - "Global Accessibility"
- Executive Biographies:
  - Dr. Amr Abbass biography extracted verbatim from `dr-amba.php`.
  - Dr. Ahmed Nouh biography extracted verbatim from `dr-ahmed.php`.
- News Posts:
  - Text from `tmasi sponsor/news 1 content.txt` (Hansa Medica Group).
  - Text from `tmasi sponsor/news 2 content.txt` (ITIC Global 2026 Istanbul).
  - Historical posts from `news1.php`, `news2.php`, `news3.php`, `news4.php`.

## 3. Automated Validation Protocol

A build assertion script (`scripts/check-tmasi-content.mjs`) validates generated output against source texts:

```javascript
// Verification Assertion
// Compares target DOM nodes against baseline string sets
export function verifyContentIntegrity(renderedDom, baselineStrings) {
  for (const str of baselineStrings) {
    const found = renderedDom.textContent.includes(normalize(str));
    if (!found) {
      throw new Error(`Content integrity failure: Missing required string "${str}"`);
    }
  }
}
```

## 4. Dash Policy

Em dashes and en dashes are strictly prohibited in all output. Any legacy hyphen, dash entity, or Windows-1252 corrupted character must be represented as a clean full stop, colon, or standard comma.
