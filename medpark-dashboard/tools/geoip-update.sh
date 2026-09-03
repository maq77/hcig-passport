#!/bin/bash
# ===========================================================================
# Download the MaxMind GeoLite2 city database.
#
# Added 2026-09-03, so our own analytics can report country and city without
# sending a single visitor address to anyone. The file lives outside the web
# root and is read locally by lib/geoip.php.
#
# MaxMind rebuild GeoLite2 twice a week. Once a week is plenty, and running it
# more often than twice a week is against their terms.
#
# Install as a cron job:
#   17 4 * * 3 /bin/bash /home/USER/public_html/dashboard/tools/geoip-update.sh
#
# Credentials come from the dashboard settings, so there is nothing to keep in
# sync and nothing secret written into this file.
# ===========================================================================
set -u

PHP="${PHP:-/opt/cpanel/ea-php81/root/usr/bin/php}"
[ -x "$PHP" ] || PHP="$(command -v php || true)"
if [ -z "$PHP" ]; then echo "No PHP binary found." >&2; exit 1; fi

HERE="$(cd "$(dirname "$0")" && pwd)"
BOOT="$HERE/../lib/bootstrap.php"
if [ ! -f "$BOOT" ]; then echo "Cannot find the dashboard at $BOOT" >&2; exit 1; fi

setting() {
  "$PHP" -r "require '$BOOT'; echo mp_get('$1');" 2>/dev/null
}

ACCOUNT="$(setting maxmind_account)"
KEY="$(setting maxmind_key)"
DATA="$("$PHP" -r "require '$BOOT'; echo MP_DATA_DIR;" 2>/dev/null)"

if [ -z "$KEY" ]; then
  echo "No MaxMind licence key in Settings. Add one and run this again." >&2
  exit 1
fi
if [ -z "$DATA" ] || [ ! -d "$DATA" ]; then
  echo "Cannot find the data directory." >&2
  exit 1
fi

TARGET="$DATA/GeoLite2-City.mmdb"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/geoip.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT

# MaxMind moved to basic authentication. The older licence-key-in-the-URL form
# still answers for now, so it is kept as a fallback rather than a first try.
NEW_URL="https://download.maxmind.com/geoip/databases/GeoLite2-City/download?suffix=tar.gz"
OLD_URL="https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=${KEY}&suffix=tar.gz"

echo "Downloading GeoLite2 City..."
CODE=000
if [ -n "$ACCOUNT" ]; then
  CODE=$(curl -sSL -u "${ACCOUNT}:${KEY}" -o "$TMP/db.tar.gz" -w '%{http_code}' "$NEW_URL" || echo 000)
fi
if [ "$CODE" != "200" ]; then
  echo "Basic authentication returned $CODE, trying the licence key URL..."
  CODE=$(curl -sSL -o "$TMP/db.tar.gz" -w '%{http_code}' "$OLD_URL" || echo 000)
fi

if [ "$CODE" != "200" ]; then
  echo "Download failed with HTTP $CODE." >&2
  echo "A 401 means the account ID or licence key is wrong." >&2
  echo "A 403 usually means the key has not finished activating; wait five minutes." >&2
  exit 1
fi

SIZE=$(wc -c < "$TMP/db.tar.gz" 2>/dev/null || echo 0)
if [ "$SIZE" -lt 1000000 ]; then
  echo "The download is only $SIZE bytes, which is not a database:" >&2
  head -c 400 "$TMP/db.tar.gz" >&2; echo >&2
  exit 1
fi

tar -xzf "$TMP/db.tar.gz" -C "$TMP" || { echo "Could not unpack the archive." >&2; exit 1; }

FOUND="$(find "$TMP" -name 'GeoLite2-City.mmdb' -type f | head -n 1)"
if [ -z "$FOUND" ]; then echo "No .mmdb file inside the archive." >&2; exit 1; fi

# Move into place in one step. A half-written database would be read by the
# importer as a corrupt one, so it is never written directly to the target.
mv "$FOUND" "$TARGET.new" && mv "$TARGET.new" "$TARGET"
chmod 600 "$TARGET"

echo "Installed $(wc -c < "$TARGET") bytes at $TARGET"

# Prove it works rather than assuming it does. A database that downloads but
# cannot be read is worse than one that is missing, because nothing complains.
"$PHP" -r "
require '$BOOT';
\$r = mpa_geo_lookup('8.8.8.8');
if ((\$r['country'] ?? '') === '') { echo \"Installed, but a test lookup returned nothing.\n\"; exit(1); }
echo 'Test lookup: 8.8.8.8 is in ', \$r['country'], ' ', \$r['city'], \"\n\";
"
