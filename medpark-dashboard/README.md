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

The metrics table takes a site column and the same code serves every property in
the group. That is the intended second phase, after this one has proved itself.
