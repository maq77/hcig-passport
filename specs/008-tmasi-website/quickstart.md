# Quickstart: TMASI Global Website (v2 & v3)

Commands and verification procedures for building, testing, and reviewing TMASI Global.

## 1. Local Development & Build

Run the main portal generator to build the HCIG Work platform including TMASI preview routes:

```bash
# Install dependencies if needed
npm install

# Build static portal assets
npm run build

# Run integrity and broken link checks
npm run check

# Full test pipeline
npm test
```

## 2. Content Integrity Check

Verify that all text on the rendered templates matches client copy word for word:

```bash
# Run automated verbatim string checker
node scripts/check-tmasi-content.mjs
```

## 3. Visual & Cross-Device Verification

Inspect rendered templates across standard viewport sizes using Playwright:

```bash
# Mobile viewport check (375x667)
npx playwright screenshot --viewport-size=375,667 http://localhost:3000/tmasi/v3 preview-mobile.png

# Desktop viewport check (1440x900)
npx playwright screenshot --viewport-size=1440,900 http://localhost:3000/tmasi/v3 preview-desktop.png
```

## 4. Staging Preview

The preview deploys automatically to Vercel upon pushing to remote:
- Public Preview URL: `https://hcig-passport.vercel.app/tmasi/v3`
- Search Robots Header: Verified as `X-Robots-Tag: noindex, nofollow`
