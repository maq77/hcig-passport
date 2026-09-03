<?php
/* ===========================================================================
   MaxMind DB reader.

   Added 2026-09-03, to put country and city on every visit.

   WHY IT IS WRITTEN BY HAND
   The official library needs Composer. There is no Composer on this hosting
   and adding one is a dependency, an update path and a security surface for
   what is, in the end, a binary search tree and a small decoder. This file
   reads the format directly and has no dependencies at all.

   WHERE IT RUNS
   Only at import time, on the dashboard side. A visitor request never opens
   this file. The address arrives in the spool, is resolved here, and is
   discarded before anything is written to a table.

   HOW IT WORKS
   A MaxMind database is three parts: a binary search tree, a data section,
   and a metadata block at the end marked by a magic string. A lookup walks
   the bits of the address through the tree until it reaches a record that
   points into the data section, then decodes the map found there.

   THE FILE ITSELF
   GeoLite2-City.mmdb, about 60 MB, downloaded by tools/geoip-update.sh and
   kept outside the web root. Free, refreshed weekly by MaxMind.
   =========================================================================== */
declare(strict_types=1);

const MMDB_MARKER = "\xAB\xCD\xEFMaxMind.com";

function mpa_geo_path(): string { return MP_DATA_DIR . '/GeoLite2-City.mmdb'; }

function mpa_geo_ready(): bool {
    $p = mpa_geo_path();
    return is_file($p) && filesize($p) > 100000;
}

/* Age of the database in days, so the dashboard can say when it is stale.
   MaxMind rebuild it twice a week; anything past a month is worth a warning. */
function mpa_geo_age(): ?int {
    if (!mpa_geo_ready()) return null;
    $t = @filemtime(mpa_geo_path());
    return $t ? (int)floor((time() - $t) / 86400) : null;
}

/* ---------------------------------------------------------------------------
   Open once per process and keep the handle and metadata in a static.
   ------------------------------------------------------------------------ */
function &mpa_mmdb(): array {
    static $db = null;
    if ($db !== null) return $db;

    $db = array('ok' => false, 'h' => null, 'err' => '');
    if (!mpa_geo_ready()) { $db['err'] = 'database not installed'; return $db; }

    $h = @fopen(mpa_geo_path(), 'rb');
    if (!$h) { $db['err'] = 'cannot open database'; return $db; }

    $size = (int)filesize(mpa_geo_path());

    /* The metadata block sits at the end, after the last magic marker. It is
       never more than 128 KB from the end, so only the tail is scanned. */
    $tailLen = min($size, 131072);
    fseek($h, $size - $tailLen);
    $tail = (string)fread($h, $tailLen);
    $at = strrpos($tail, MMDB_MARKER);
    if ($at === false) { fclose($h); $db['err'] = 'not a MaxMind database'; return $db; }

    $metaStart = ($size - $tailLen) + $at + strlen(MMDB_MARKER);

    $db['h'] = $h;
    $db['size'] = $size;
    /* Pointers inside the metadata block are relative to its own start. */
    $meta = mpa_mmdb_decode($db, $metaStart, $metaStart);
    if (!is_array($meta['value'])) { fclose($h); $db['err'] = 'unreadable metadata'; return $db; }
    $m = $meta['value'];

    $db['node_count']  = (int)($m['node_count'] ?? 0);
    $db['record_size'] = (int)($m['record_size'] ?? 0);
    $db['ip_version']  = (int)($m['ip_version'] ?? 6);
    $db['type']        = (string)($m['database_type'] ?? '');
    $db['built']       = (int)($m['build_epoch'] ?? 0);

    if ($db['node_count'] === 0 || !in_array($db['record_size'], array(24, 28, 32), true)) {
        fclose($h); $db['h'] = null; $db['err'] = 'unsupported database layout'; return $db;
    }

    $db['node_bytes']  = intdiv($db['record_size'], 4);          /* both records */
    $db['tree_size']   = $db['node_count'] * $db['node_bytes'];
    /* 16 bytes of zeros separate the tree from the data section. */
    $db['data_start']  = $db['tree_size'] + 16;
    $db['ipv4_root']   = null;
    $db['ok'] = true;
    return $db;
}

function mpa_mmdb_bytes(array $db, int $offset, int $len): string {
    if ($len <= 0) return '';
    fseek($db['h'], $offset);
    return (string)fread($db['h'], $len);
}

/* ---------------------------------------------------------------------------
   The search tree

   Each node holds two records, left for a zero bit and right for a one. A
   record value below the node count is another node; equal to it means the
   address is not in the database; above it is an offset into the data section.
   ------------------------------------------------------------------------ */
function mpa_mmdb_record(array $db, int $node, int $bit): int {
    $rs   = $db['record_size'];
    $base = $node * $db['node_bytes'];

    if ($rs === 24) {
        $b = mpa_mmdb_bytes($db, $base + ($bit ? 3 : 0), 3);
        if (strlen($b) < 3) return $db['node_count'];
        return (ord($b[0]) << 16) | (ord($b[1]) << 8) | ord($b[2]);
    }

    if ($rs === 32) {
        $b = mpa_mmdb_bytes($db, $base + ($bit ? 4 : 0), 4);
        if (strlen($b) < 4) return $db['node_count'];
        return (ord($b[0]) << 24) | (ord($b[1]) << 16) | (ord($b[2]) << 8) | ord($b[3]);
    }

    /* 28 bit records share a middle byte: the high nibble belongs to the left
       record, the low nibble to the right. */
    $b = mpa_mmdb_bytes($db, $base, 7);
    if (strlen($b) < 7) return $db['node_count'];
    if ($bit === 0) {
        return ((ord($b[3]) >> 4) << 24) | (ord($b[0]) << 16) | (ord($b[1]) << 8) | ord($b[2]);
    }
    return ((ord($b[3]) & 0x0F) << 24) | (ord($b[4]) << 16) | (ord($b[5]) << 8) | ord($b[6]);
}

/* An IPv4 address in an IPv6 database lives under ::/96, so the first 96 bits
   are zeros. Walking them once and caching the node saves that work on every
   later lookup, which is most of them. */
function mpa_mmdb_ipv4_root(array &$db): int {
    if ($db['ipv4_root'] !== null) return $db['ipv4_root'];
    $node = 0;
    for ($i = 0; $i < 96 && $node < $db['node_count']; $i++) {
        $node = mpa_mmdb_record($db, $node, 0);
    }
    $db['ipv4_root'] = $node;
    return $node;
}

/* ---------------------------------------------------------------------------
   The decoder

   Returns array('value' => mixed, 'next' => int). `$base` is where pointers
   are measured from: the data section for normal lookups, the start of the
   metadata block when reading metadata.
   ------------------------------------------------------------------------ */
function mpa_mmdb_decode(array $db, int $offset, int $base): array {
    $ctrl = mpa_mmdb_bytes($db, $offset, 1);
    if ($ctrl === '') return array('value' => null, 'next' => $offset + 1);
    $c    = ord($ctrl);
    $type = $c >> 5;
    $size = $c & 0x1F;
    $p    = $offset + 1;

    /* Type 0 means the real type is in the following byte, plus seven. */
    if ($type === 0) {
        $ext  = mpa_mmdb_bytes($db, $p, 1);
        $type = ord($ext !== '' ? $ext : "\0") + 7;
        $p++;
    }

    /* Pointers carry their size differently from everything else. */
    if ($type === 1) {
        $ss  = ($size >> 3) & 0x03;
        $vvv = $size & 0x07;
        if ($ss === 0) {
            $b = mpa_mmdb_bytes($db, $p, 1); $p += 1;
            $ptr = ($vvv << 8) | ord($b !== '' ? $b : "\0");
        } elseif ($ss === 1) {
            $b = str_pad(mpa_mmdb_bytes($db, $p, 2), 2, "\0"); $p += 2;
            $ptr = (($vvv << 16) | (ord($b[0]) << 8) | ord($b[1])) + 2048;
        } elseif ($ss === 2) {
            $b = str_pad(mpa_mmdb_bytes($db, $p, 3), 3, "\0"); $p += 3;
            $ptr = (($vvv << 24) | (ord($b[0]) << 16) | (ord($b[1]) << 8) | ord($b[2])) + 526336;
        } else {
            $b = str_pad(mpa_mmdb_bytes($db, $p, 4), 4, "\0"); $p += 4;
            $ptr = (ord($b[0]) << 24) | (ord($b[1]) << 16) | (ord($b[2]) << 8) | ord($b[3]);
        }
        $target = mpa_mmdb_decode($db, $base + $ptr, $base);
        return array('value' => $target['value'], 'next' => $p);
    }

    /* Everything else uses the extended size convention. */
    if ($size === 29) {
        $b = mpa_mmdb_bytes($db, $p, 1); $p += 1;
        $size = 29 + ord($b !== '' ? $b : "\0");
    } elseif ($size === 30) {
        $b = str_pad(mpa_mmdb_bytes($db, $p, 2), 2, "\0"); $p += 2;
        $size = 285 + ((ord($b[0]) << 8) | ord($b[1]));
    } elseif ($size === 31) {
        $b = str_pad(mpa_mmdb_bytes($db, $p, 3), 3, "\0"); $p += 3;
        $size = 65821 + ((ord($b[0]) << 16) | (ord($b[1]) << 8) | ord($b[2]));
    }

    switch ($type) {
        case 2:  /* utf8 string */
            return array('value' => mpa_mmdb_bytes($db, $p, $size), 'next' => $p + $size);

        case 3:  /* double */
            $b = mpa_mmdb_bytes($db, $p, 8);
            $v = (strlen($b) === 8) ? unpack('E', $b)[1] : 0.0;
            return array('value' => $v, 'next' => $p + 8);

        case 4:  /* bytes */
            return array('value' => mpa_mmdb_bytes($db, $p, $size), 'next' => $p + $size);

        case 5: case 6: case 9: case 10:  /* unsigned integers of various widths */
            $b = mpa_mmdb_bytes($db, $p, $size);
            $v = 0;
            for ($i = 0; $i < strlen($b); $i++) $v = ($v << 8) | ord($b[$i]);
            return array('value' => $v, 'next' => $p + $size);

        case 7:  /* map */
            $out = array();
            for ($i = 0; $i < $size; $i++) {
                $k = mpa_mmdb_decode($db, $p, $base);
                $v = mpa_mmdb_decode($db, $k['next'], $base);
                $out[(string)$k['value']] = $v['value'];
                $p = $v['next'];
            }
            return array('value' => $out, 'next' => $p);

        case 8:  /* signed 32 bit */
            $b = mpa_mmdb_bytes($db, $p, $size);
            $v = 0;
            for ($i = 0; $i < strlen($b); $i++) $v = ($v << 8) | ord($b[$i]);
            if ($size === 4 && $v > 0x7FFFFFFF) $v -= 0x100000000;
            return array('value' => $v, 'next' => $p + $size);

        case 11: /* array */
            $out = array();
            for ($i = 0; $i < $size; $i++) {
                $v = mpa_mmdb_decode($db, $p, $base);
                $out[] = $v['value'];
                $p = $v['next'];
            }
            return array('value' => $out, 'next' => $p);

        case 14: /* boolean, carried in the size field */
            return array('value' => $size > 0, 'next' => $p);

        case 15: /* float */
            $b = mpa_mmdb_bytes($db, $p, 4);
            $v = (strlen($b) === 4) ? unpack('G', $b)[1] : 0.0;
            return array('value' => $v, 'next' => $p + 4);
    }

    /* Cache containers and end markers carry nothing we need. */
    return array('value' => null, 'next' => $p + $size);
}

/* ---------------------------------------------------------------------------
   The public call

   Always returns the same three keys. A missing database, a private address or
   an address the database does not know all return blanks, so the caller never
   has to check anything.
   ------------------------------------------------------------------------ */
function mpa_geo_lookup(string $ip): array {
    static $cache = array();
    $blank = array('country' => '', 'region' => '', 'city' => '');

    $ip = trim($ip);
    if ($ip === '') return $blank;
    if (isset($cache[$ip])) return $cache[$ip];

    /* Private and reserved ranges are our own traffic, not a visitor. */
    if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
        return $blank;
    }

    $db = &mpa_mmdb();
    if (!$db['ok']) return $blank;

    $packed = @inet_pton($ip);
    if ($packed === false) return $blank;

    if (strlen($packed) === 4) {
        $node = ($db['ip_version'] === 6) ? mpa_mmdb_ipv4_root($db) : 0;
        $bits = 32;
    } else {
        $node = 0;
        $bits = 128;
    }

    $found = 0;
    for ($i = 0; $i < $bits; $i++) {
        if ($node >= $db['node_count']) break;
        $byte = ord($packed[intdiv($i, 8)]);
        $bit  = ($byte >> (7 - ($i % 8))) & 1;
        $node = mpa_mmdb_record($db, $node, $bit);
    }

    /* Equal to the node count means the tree has no answer for this address. */
    if ($node <= $db['node_count']) { $cache[$ip] = $blank; return $blank; }
    $found = $node - $db['node_count'] - 16 + $db['data_start'];

    $rec = mpa_mmdb_decode($db, $found, $db['data_start']);
    $d   = is_array($rec['value']) ? $rec['value'] : array();

    $name = function ($node) {
        if (!is_array($node)) return '';
        $names = $node['names'] ?? null;
        if (is_array($names)) {
            foreach (array('en', 'de', 'ru') as $l) {
                if (!empty($names[$l])) return (string)$names[$l];
            }
        }
        return '';
    };

    $sub = '';
    if (!empty($d['subdivisions']) && is_array($d['subdivisions'])) {
        $sub = $name($d['subdivisions'][0] ?? null);
    }

    /* The two letter code is the stable key; the readable name is for people.
       Storing the code means a country never changes identity when MaxMind
       change how they spell it. */
    $out = array(
        'country' => isset($d['country']['iso_code']) ? (string)$d['country']['iso_code']
                   : (isset($d['registered_country']['iso_code']) ? (string)$d['registered_country']['iso_code'] : ''),
        'region'  => substr($sub, 0, 60),
        'city'    => substr($name($d['city'] ?? null), 0, 60),
    );

    /* One process rarely sees more than a few thousand distinct addresses in
       an import, but the ceiling keeps a very large backfill honest. */
    if (count($cache) < 20000) $cache[$ip] = $out;
    return $out;
}

/* Readable country names for the dashboard. Only the ones that actually appear
   in our traffic are worth carrying; anything else falls back to the code. */
function mpa_country_name(string $code): string {
    static $map = array(
        'EG' => 'Egypt', 'DE' => 'Germany', 'PL' => 'Poland', 'GB' => 'United Kingdom',
        'AT' => 'Austria', 'CH' => 'Switzerland', 'CZ' => 'Czechia', 'SK' => 'Slovakia',
        'RU' => 'Russia', 'UA' => 'Ukraine', 'BY' => 'Belarus', 'NL' => 'Netherlands',
        'BE' => 'Belgium', 'FR' => 'France', 'IT' => 'Italy', 'ES' => 'Spain',
        'PT' => 'Portugal', 'SE' => 'Sweden', 'NO' => 'Norway', 'DK' => 'Denmark',
        'FI' => 'Finland', 'IE' => 'Ireland', 'HU' => 'Hungary', 'RO' => 'Romania',
        'BG' => 'Bulgaria', 'GR' => 'Greece', 'TR' => 'Turkey', 'US' => 'United States',
        'CA' => 'Canada', 'SA' => 'Saudi Arabia', 'AE' => 'United Arab Emirates',
        'KW' => 'Kuwait', 'QA' => 'Qatar', 'JO' => 'Jordan', 'LB' => 'Lebanon',
        'LY' => 'Libya', 'SD' => 'Sudan', 'IL' => 'Israel', 'LT' => 'Lithuania',
        'LV' => 'Latvia', 'EE' => 'Estonia', 'HR' => 'Croatia', 'SI' => 'Slovenia',
        'RS' => 'Serbia', 'AU' => 'Australia', 'IN' => 'India', 'CN' => 'China',
    );
    $code = strtoupper(trim($code));
    if ($code === '') return 'Unknown';
    return $map[$code] ?? $code;
}
