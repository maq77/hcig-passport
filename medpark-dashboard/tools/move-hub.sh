#!/bin/bash
# =============================================================================
# Move the hub to another server or another directory.
#
# The whole system is two directories and nothing else: the application, and a
# data directory that sits beside the web root. There is no service to
# provision, no database server, no extension to install. That is most of why
# SQLite was chosen over MySQL, and this script is where that pays off.
#
#   ./move-hub.sh check                 what is here, and is it sound
#   ./move-hub.sh pack   /path/out.tgz  a consistent copy of everything
#   ./move-hub.sh verify /path/out.tgz  prove the copy is complete and readable
#
# WHAT TO DO WITH THE RESULT
#   1. Copy the archive to the new server and unpack it so that the layout is
#      the same: <docroot>/dashboard and <parent-of-docroot>/dashboard-data.
#   2. Move the four cron lines across, correcting the paths.
#   3. Point the tracker hostname at the new server in DNS.
#
# Every tracked website keeps working through step 3 without being touched,
# because the script tag names a hostname rather than a server. That is the
# entire migration.
# =============================================================================
set -u

PHP="${PHP:-/opt/cpanel/ea-php81/root/usr/bin/php}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"          # .../public_html/dashboard
DATA="$(cd "$HERE/../.." && pwd)/dashboard-data"  # matches lib/bootstrap.php

action="${1:-check}"
target="${2:-}"

say() { printf '%s\n' "$*"; }

check() {
  say "application : $HERE"
  say "data        : $DATA"
  say ""
  if [ ! -d "$HERE" ] || [ ! -f "$HERE/index.php" ]; then
    say "PROBLEM: no dashboard at that path"; return 1
  fi
  if [ ! -d "$DATA" ]; then
    say "PROBLEM: no data directory at that path"; return 1
  fi

  say "application size : $(du -sh "$HERE" 2>/dev/null | cut -f1)"
  say "data size        : $(du -sh "$DATA" 2>/dev/null | cut -f1)"
  say "database         : $(ls -lh "$DATA/metrics.sqlite" 2>/dev/null | awk '{print $5}')"
  say "secrets present  : $([ -f "$DATA/secrets.php" ] && echo yes || echo 'no, the install would ask for a password')"
  say "geo database     : $([ -f "$DATA/GeoLite2-City.mmdb" ] && echo yes || echo 'no, country and city would be blank until downloaded')"
  say ""

  say "integrity check  : $("$PHP" -r '
      $d = new PDO("sqlite:" . $argv[1]);
      echo $d->query("PRAGMA integrity_check")->fetchColumn();
  ' "$DATA/metrics.sqlite" 2>&1)"

  say "registered sites :"
  "$PHP" -r '
      require $argv[1] . "/lib/bootstrap.php";
      foreach (mp_sites() as $k => $s) {
          echo "  " . $s["label"] . "  key=" . $k . "  token=" . $s["token"] . PHP_EOL;
      }
  ' "$HERE" 2>&1

  say ""
  say "cron lines to carry across:"
  crontab -l 2>/dev/null | grep -E 'dashboard|heartbeat' | sed 's/--key=[a-f0-9]*/--key=<same key>/' | sed 's/^/  /'
}

pack() {
  [ -n "$target" ] || { say "usage: move-hub.sh pack /path/out.tgz"; return 1; }

  # A consistent copy of the database first. A plain file copy of a live SQLite
  # database is not guaranteed to be consistent; the online backup API is.
  local snap="$DATA/backups/move-$(date -u +%Y%m%d-%H%M%S).sqlite"
  mkdir -p "$DATA/backups"
  "$PHP" -r '
      $src = new SQLite3($argv[1], SQLITE3_OPEN_READONLY);
      $dst = new SQLite3($argv[2]);
      $ok  = $src->backup($dst);
      $src->close(); $dst->close();
      exit($ok ? 0 : 1);
  ' "$DATA/metrics.sqlite" "$snap" || { say "PROBLEM: could not snapshot the database"; return 1; }
  say "snapshot: $snap"

  # The application, and the data directory with the live database swapped for
  # the snapshot. Old backups are left behind: they are history, not state.
  local staging
  staging="$(mktemp -d)"
  mkdir -p "$staging/dashboard" "$staging/dashboard-data"
  cp -a "$HERE/." "$staging/dashboard/"
  cp -a "$DATA/secrets.php" "$staging/dashboard-data/" 2>/dev/null
  cp -a "$snap" "$staging/dashboard-data/metrics.sqlite"
  cp -a "$DATA"/*.mmdb "$staging/dashboard-data/" 2>/dev/null
  cp -a "$DATA/sites.json" "$staging/dashboard-data/" 2>/dev/null
  cp -a "$DATA/.a-seed" "$staging/dashboard-data/" 2>/dev/null

  tar czf "$target" -C "$staging" dashboard dashboard-data
  rm -rf "$staging"
  say "packed: $target  ($(ls -lh "$target" | awk '{print $5}'))"
  say ""
  say "unpack on the new server so that it becomes:"
  say "  <docroot>/dashboard"
  say "  <parent of docroot>/dashboard-data     (never inside the web root)"
  say "then chmod 700 dashboard-data and 600 its secrets.php and metrics.sqlite"
}

verify() {
  [ -n "$target" ] || { say "usage: move-hub.sh verify /path/out.tgz"; return 1; }
  [ -f "$target" ] || { say "PROBLEM: no such archive"; return 1; }

  local tmp
  tmp="$(mktemp -d)"
  tar xzf "$target" -C "$tmp" || { say "PROBLEM: archive will not unpack"; rm -rf "$tmp"; return 1; }

  say "contains dashboard      : $([ -f "$tmp/dashboard/index.php" ] && echo yes || echo NO)"
  say "contains the database   : $([ -f "$tmp/dashboard-data/metrics.sqlite" ] && echo yes || echo NO)"
  say "contains the secrets    : $([ -f "$tmp/dashboard-data/secrets.php" ] && echo yes || echo 'no, a password would be set on first open')"

  say "database integrity      : $("$PHP" -r '
      $d = new PDO("sqlite:" . $argv[1]);
      echo $d->query("PRAGMA integrity_check")->fetchColumn();
  ' "$tmp/dashboard-data/metrics.sqlite" 2>&1)"

  say "rows carried across     :"
  "$PHP" -r '
      $d = new PDO("sqlite:" . $argv[1]);
      foreach (array("a_pageviews","a_events","a_sessions","chat_leads","metrics","sites") as $t) {
          try { $n = (int)$d->query("SELECT COUNT(*) FROM $t")->fetchColumn(); }
          catch (Throwable $e) { $n = -1; }
          printf("  %-14s %d%s", $t, $n, PHP_EOL);
      }
  ' "$tmp/dashboard-data/metrics.sqlite" 2>&1

  rm -rf "$tmp"
  say ""
  say "If those counts match the live ones from 'check', the copy is complete."
}

case "$action" in
  check)  check ;;
  pack)   pack ;;
  verify) verify ;;
  *)      say "usage: move-hub.sh [check|pack <out.tgz>|verify <out.tgz>]"; exit 1 ;;
esac
