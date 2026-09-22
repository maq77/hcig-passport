/**
 * Watchdog: the site registry.
 *
 * Each entry defines one site the watchdog crawls. Every site is independent:
 * its own data, its own results. The group view reads across all of them.
 *
 * The list lives in hive/config.json under "watchdog.sites" so domains can be
 * added, removed or paused without touching code. The defaults below are the
 * fallback used when config has no list, so the crawler still works standalone.
 *
 * Fields:
 *   id         short identifier, used in filenames and reports
 *   name       display name
 *   origin     the scheme + host (no trailing slash)
 *   seedPaths  starting URLs (paths, not full URLs)
 *   noindex    paths that are deliberately noindex and must never be reported
 *   skipPaths  paths the crawler must not visit at all (admin, dashboard, etc.)
 *   enabled    false pauses the site without deleting its entry
 */

const fs = require('node:fs');
const path = require('node:path');

const CONFIG = path.join(__dirname, '..', '..', 'hive', 'config.json');

/** The fallback list, used when config carries no watchdog.sites. */
const DEFAULT_SITES = [
  {
    id: 'medpark',
    name: 'MedPark Hospitals',
    origin: 'https://www.medparkhospitals.com',
    seedPaths: ['/'],
    noindex: ['/dashboard/'],
    skipPaths: ['/dashboard/', '/api/', '/cron/'],
    enabled: true,
  },
  {
    id: '247clinic',
    name: '24/7 Clinic',
    origin: 'https://www.247clinic.net',
    seedPaths: ['/'],
    noindex: [],
    skipPaths: ['/admin/', '/api/'],
    enabled: true,
  },
  {
    id: 'hcig-work',
    name: 'HCIG Work',
    origin: 'https://hcig-passport.vercel.app',
    seedPaths: ['/'],
    // The entire portal is noindex by design (check.js enforces this)
    noindex: ['*'],
    // Medcierge is a closed project. Its preview pages live under this portal
    // and must not be crawled or reported on until the user reopens it.
    skipPaths: ['/medcierge-v2/', '/medcierge-home/', '/medcierge-next/'],
    enabled: true,
  },
];

/** Fill in the fields an entry may leave out, so callers never see undefined. */
function normaliseSite(s) {
  return {
    id: s.id,
    name: s.name || s.id,
    origin: String(s.origin || '').replace(/\/+$/, ''),
    seedPaths: s.seedPaths && s.seedPaths.length ? s.seedPaths : ['/'],
    noindex: s.noindex || [],
    skipPaths: s.skipPaths || [],
    enabled: s.enabled !== false,
  };
}

/**
 * Read the site list. Config wins; the defaults are the fallback.
 * A site with enabled:false is kept in the list but never crawled.
 */
function loadSites() {
  let configured = null;
  try {
    const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
    if (cfg.watchdog && Array.isArray(cfg.watchdog.sites) && cfg.watchdog.sites.length) {
      configured = cfg.watchdog.sites;
    }
  } catch {
    // No config, or unreadable. Fall back to the defaults rather than failing:
    // a watchdog that cannot start is worse than one running on defaults.
  }
  return (configured || DEFAULT_SITES).map(normaliseSite);
}

/** Only the sites that are switched on. */
function activeSites() {
  return loadSites().filter(s => s.enabled);
}

// Kept as a live getter so callers that read SITES pick up config changes.
const SITES = activeSites();

module.exports = { SITES, loadSites, activeSites, normaliseSite, DEFAULT_SITES };
