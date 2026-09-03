# MedPark performance dashboard

Reporting for MedPark Health Group. Runs on the existing cPanel hosting, PHP 8.1
and SQLite, no external services and nothing to pay for.

## Where it lives

| What | Path |
|---|---|
| Application | `public_html/dashboard/` |
| Credentials | `~/dashboard-data/secrets.php`, mode 0600, above the web root |
| Data | `~/dashboard-data/metrics.sqlite`, mode 0600, above the web root |

Nothing under `dashboard-data` is reachable from a browser. `lib/` and `views/`
are includes and return 404 if requested directly.

## First run

Open `/dashboard/` and set the login. There is no default password.

## Data sources

| Source | Needs | Works without it |
|---|---|---|
| Site health | nothing | yes, from the first minute |
| PageSpeed | nothing, a free API key avoids rate limits | yes, but the shared server IP is often throttled |
| GA4 | property ID plus a Google service account | no |
| Search Console | verified property plus the same service account | no |
| Business Profile | location IDs plus the same service account | no |
| Yandex Metrica | OAuth token, counter already live on the site | no |
| SEMrush | API key, optional | no |
| AI visibility | nothing, results recorded monthly by hand | yes |

One Google service account covers GA4, Search Console and Business Profile.
Create it once, then grant that account read access in each product.

## Our own analytics

Sessions, pageviews, visitors, referrers, campaigns, country, city, engaged time
and every event, collected on this server rather than by Google. Not blockable by
an ad blocker, no sampling, no fourteen month retention limit, and no visitor
address ever stored.

### How it collects

```
browser    accumulates the whole page visit in memory
           one beacon on pagehide, not one request per event
              |
endpoint   /track/a.php appends ONE line to a spool file
           no database, no bootstrap, no transaction. ~1ms
              |
spool      ~/dashboard-data/a-spool.ndjson, 0600, 12 MB ceiling
              |
importer   import.php every 5 minutes, one transaction
           builds sessions, then the daily rollups
              |
dashboard  reads rollups for charts, raw tables for filtering
```

The endpoint never touches the database. That is not a detail: the first
behaviour beacon opened a SQLite write transaction per request on a public URL,
and on shared hosting that can hold PHP workers until the account hits its
process limit. Nothing on the visitor path may do that again.

### Identity, two tiers

| Tier | Identifier | What works |
|---|---|---|
| Default | daily rotating hash of address, agent and language | everything except recognising someone across days |
| After consent | first-party identifier | adds returning visitors and the full journey to an enquiry |

The default stores nothing at all on the visitor's device and cannot link one
day to the next, because the salt rotates daily. The browser sends no session
identifier either: the importer groups a visitor's pageviews and starts a new
session after 30 minutes of inactivity.

The consent bar is written (`js/mp-consent.js`) but deliberately not loaded on
any page. It is visible copy and waits for approval. Nothing is blocked by that,
because the default tier runs either way.

### Cron jobs

Every five minutes, to drain the spool:

```
*/5 * * * * /opt/cpanel/ea-php81/root/usr/bin/php /home/USER/public_html/dashboard/import.php --key=KEY >/dev/null 2>&1
```

Once a week, to refresh the geography database:

```
17 4 * * 3 /bin/bash /home/USER/public_html/dashboard/tools/geoip-update.sh
```

Same key as `collect.php`, shown on the Settings page.

### Country and city

MaxMind GeoLite2, free, downloaded to `~/dashboard-data/GeoLite2-City.mmdb` and
read locally by `lib/geoip.php`, which parses the format directly so there is no
Composer dependency. No address is sent to MaxMind or anyone else; only the
database is downloaded.

Add the account ID and licence key in Settings, then run
`tools/geoip-update.sh` once. Everything else works without it; only country and
city are blank until it is installed.

### Tables

| Table | One row per |
|---|---|
| `a_visitors` | person, as far as we can honestly tell |
| `a_sessions` | visit, with acquisition, geography and device |
| `a_pageviews` | page opened, keeping the order within the visit |
| `a_events` | action: every button, section, video, form and error |
| `a_daily` | metric per day, pre-aggregated so charts never scan raw rows |
| `a_runs` | import bookkeeping |

Every table carries `site`, so the group rollout is a rollout and not a
migration. Raw rows are pruned past `analytics_retain` days (730 by default);
the rollups are kept for good, so long comparisons survive the pruning.

The headline numbers are also mirrored into the existing `metrics` table under
the source `own`. That is deliberate duplication of about twenty rows a day, and
it means the CEO page, the KPI page and the exported report read our own traffic
with no changes at all.

### Adding an event

Nothing to change server side. `mp-analytics.js` classifies controls
automatically, so a new phone or WhatsApp link is tracked the moment it is added
to a page. For a named block, add `data-mp-section="Insurance"` to it; without
that, sections are detected from headings and ids.

Other scripts can record their own:

```js
window.mpAnalytics.event('name', 'category', 'label', value);
```

## Daily collection

Add as a cron job, once a day:

```
/opt/cpanel/ea-php81/root/usr/bin/php /home/USER/public_html/dashboard/collect.php --key=KEY
```

The key is shown on the Settings page. It is derived from the password hash, so
changing the password changes the key and the cron line has to be updated.

## Adding a data source

Write `mp_pull_<name>($from, $to)` in `lib/connectors.php` returning
`['ok'=>bool, 'msg'=>string, 'rows'=>int]`, store values with `mp_metric_put()`,
and register it in `mp_pull_all()` and `mp_connectors_status()`. No schema change
is needed, the metrics table is deliberately generic.

## Group rollout

The analytics tables already carry a `site` column on every row, so adding the
next property is a matter of pointing its pages at the same collector. The older
`metrics` table still needs the column added, which is a one-off migration.

That is the intended second phase, after this one has proved itself.
