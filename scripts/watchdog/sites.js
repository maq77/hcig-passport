/**
 * Watchdog: the site registry.
 *
 * Each entry defines one site the watchdog crawls. Every site is independent:
 * its own data, its own results. The group view reads across all of them.
 *
 * Fields:
 *   id         short identifier, used in filenames and reports
 *   name       display name
 *   origin     the scheme + host (no trailing slash)
 *   seedPaths  starting URLs (paths, not full URLs)
 *   noindex    paths that are deliberately noindex and must never be reported
 *   skipPaths  paths the crawler must not visit at all (admin, dashboard, etc.)
 */
const SITES = [
  {
    id: 'medpark',
    name: 'MedPark Hospitals',
    origin: 'https://www.medparkhospitals.com',
    seedPaths: ['/'],
    noindex: ['/dashboard/'],
    skipPaths: ['/dashboard/', '/api/', '/cron/'],
  },
  {
    id: '247clinic',
    name: '24/7 Clinic',
    origin: 'https://www.247clinic.net',
    seedPaths: ['/'],
    noindex: [],
    skipPaths: ['/admin/', '/api/'],
  },
  {
    id: 'hcig-work',
    name: 'HCIG Work',
    origin: 'https://hcig-passport.vercel.app',
    seedPaths: ['/'],
    // The entire portal is noindex by design (check.js enforces this)
    noindex: ['*'],
    skipPaths: [],
  },
];

module.exports = { SITES };
