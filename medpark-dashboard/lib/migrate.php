<?php
/* ==========================================================================
   Schema migration to the multi-site shape.

   Added 2026-09-04.

   THE PROBLEM THIS SOLVES
   The analytics tables carried a `site` column from the first day, which is
   why multi-site is cheap. The older tables did not: metrics, the heatmap
   tables, keywords, the assistant tables and the run log all assumed one
   property. Worse, several of them carry a UNIQUE key that does not include
   the site, so two properties writing the same day and metric would silently
   overwrite each other rather than sit side by side.

   SQLite cannot alter a UNIQUE constraint in place, so those tables are
   rebuilt: create the new shape, copy every row in, count both, and only then
   drop the old one. A count mismatch aborts the whole migration and leaves the
   database exactly as it was.

   SAFETY, IN ORDER
     1. A snapshot of the database is taken first, through SQLite's online
        backup API, because a plain file copy of a live SQLite database is not
        guaranteed to be consistent. If the snapshot cannot be taken, the
        migration does not run at all.
     2. Every step is inside one transaction. SQLite makes DDL transactional,
        so a failure anywhere rolls back everything.
     3. Every rebuilt table is row-counted before and after.
     4. The migration is idempotent: a table that already has a `site` column
        is skipped, so running it twice is harmless.
   ========================================================================== */
declare(strict_types=1);

function mp_col_exists(PDO $db, string $table, string $col): bool {
    try {
        foreach ($db->query("PRAGMA table_info(" . $table . ")") as $r) {
            if (strcasecmp((string)$r['name'], $col) === 0) return true;
        }
    } catch (Throwable $e) { return false; }
    return false;
}

function mp_table_exists(PDO $db, string $table): bool {
    $st = $db->prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=:n");
    $st->execute(array(':n' => $table));
    return (bool)$st->fetchColumn();
}

function mp_row_count(PDO $db, string $table): int {
    try { return (int)$db->query("SELECT COUNT(*) FROM " . $table)->fetchColumn(); }
    catch (Throwable $e) { return -1; }
}

/* A consistent snapshot, kept beside the database. Returns the path or ''.

   Not VACUUM INTO: this server runs SQLite 3.26 and that statement arrived in
   3.27, so it is a syntax error here. Verified on the box rather than assumed,
   after the first migration attempt refused to run because its backup failed.
   That refusal is the design working: no backup, no migration.

   The online backup API copies a live database page by page and is consistent
   by construction. The fallback holds the write lock for the length of a file
   copy, which is the same guarantee by cruder means, and matters only if the
   sqlite3 extension is ever missing. */
function mp_db_snapshot(string $tag = 'pre-migration'): string {
    $dir = MP_DATA_DIR . '/backups';
    if (!is_dir($dir)) { @mkdir($dir, 0700, true); }
    $path = $dir . '/metrics-' . $tag . '-' . gmdate('Ymd-His') . '.sqlite';

    if (class_exists('SQLite3') && method_exists('SQLite3', 'backup')) {
        try {
            $src = new SQLite3(MP_DB, SQLITE3_OPEN_READONLY);
            $dst = new SQLite3($path);
            $ok  = $src->backup($dst);
            $src->close();
            $dst->close();
            if ($ok && is_file($path) && filesize($path) > 0) { @chmod($path, 0600); return $path; }
            @unlink($path);
        } catch (Throwable $e) { @unlink($path); }
    }

    try {
        $db = mp_db();
        $db->exec('BEGIN IMMEDIATE');           /* no other writer can start */
        $db->exec('PRAGMA wal_checkpoint(TRUNCATE)');  /* fold the WAL in first */
        $ok = @copy(MP_DB, $path);
        $db->exec('COMMIT');
        if ($ok && is_file($path) && filesize($path) > 0) { @chmod($path, 0600); return $path; }
        @unlink($path);
    } catch (Throwable $e) {
        try { mp_db()->exec('ROLLBACK'); } catch (Throwable $e2) {}
    }
    return '';
}

/* The tables that only need a column, because nothing about them is unique
   per property in a way that could collide. */
function mp_migrate_add_column_tables(): array {
    return array('ai_checks', 'chat_sessions', 'chat_messages', 'chat_leads', 'runs', 'issues');
}

/* The tables that must be rebuilt, because their UNIQUE key has to grow a
   site column. Each entry: the new table body, the columns to copy, and the
   indexes to recreate afterwards. */
function mp_migrate_rebuild_tables(): array {
    return array(

        'metrics' => array(
            'body' => "id INTEGER PRIMARY KEY AUTOINCREMENT,
                       site TEXT NOT NULL DEFAULT '',
                       day TEXT NOT NULL,
                       source TEXT NOT NULL,
                       metric TEXT NOT NULL,
                       dim TEXT NOT NULL DEFAULT '',
                       dim2 TEXT NOT NULL DEFAULT '',
                       value REAL NOT NULL DEFAULT 0,
                       UNIQUE(site, day, source, metric, dim, dim2)",
            'cols' => 'id, day, source, metric, dim, dim2, value',
            'idx'  => array(
                "CREATE INDEX IF NOT EXISTS idx_metrics_day ON metrics(site, day)",
                "CREATE INDEX IF NOT EXISTS idx_metrics_lookup ON metrics(site, source, metric, day)",
            ),
        ),

        'heat_clicks' => array(
            'body' => "id INTEGER PRIMARY KEY AUTOINCREMENT,
                       site TEXT NOT NULL DEFAULT '',
                       day TEXT NOT NULL,
                       page TEXT NOT NULL,
                       device TEXT NOT NULL DEFAULT '',
                       gx INTEGER NOT NULL,
                       gy INTEGER NOT NULL,
                       hits INTEGER NOT NULL DEFAULT 0,
                       UNIQUE(site, day, page, device, gx, gy)",
            'cols' => 'id, day, page, device, gx, gy, hits',
            'idx'  => array("CREATE INDEX IF NOT EXISTS idx_heat_page ON heat_clicks(site, page, day)"),
        ),

        'heat_scroll' => array(
            'body' => "id INTEGER PRIMARY KEY AUTOINCREMENT,
                       site TEXT NOT NULL DEFAULT '',
                       day TEXT NOT NULL,
                       page TEXT NOT NULL,
                       device TEXT NOT NULL DEFAULT '',
                       bucket INTEGER NOT NULL,
                       hits INTEGER NOT NULL DEFAULT 0,
                       UNIQUE(site, day, page, device, bucket)",
            'cols' => 'id, day, page, device, bucket, hits',
            'idx'  => array(),
        ),

        'heat_targets' => array(
            'body' => "id INTEGER PRIMARY KEY AUTOINCREMENT,
                       site TEXT NOT NULL DEFAULT '',
                       day TEXT NOT NULL,
                       page TEXT NOT NULL,
                       label TEXT NOT NULL,
                       hits INTEGER NOT NULL DEFAULT 0,
                       UNIQUE(site, day, page, label)",
            'cols' => 'id, day, page, label, hits',
            'idx'  => array(),
        ),

        'heat_hours' => array(
            'body' => "id INTEGER PRIMARY KEY AUTOINCREMENT,
                       site TEXT NOT NULL DEFAULT '',
                       day TEXT NOT NULL,
                       dow INTEGER NOT NULL,
                       hour INTEGER NOT NULL,
                       kind TEXT NOT NULL DEFAULT 'visit',
                       hits INTEGER NOT NULL DEFAULT 0,
                       UNIQUE(site, day, dow, hour, kind)",
            'cols' => 'id, day, dow, hour, kind, hits',
            'idx'  => array(),
        ),

        'kw_targets' => array(
            'body' => "id INTEGER PRIMARY KEY AUTOINCREMENT,
                       site TEXT NOT NULL DEFAULT '',
                       term TEXT NOT NULL,
                       lang TEXT NOT NULL DEFAULT 'en',
                       target_pos INTEGER NOT NULL DEFAULT 1,
                       landing TEXT NOT NULL DEFAULT '',
                       note TEXT NOT NULL DEFAULT '',
                       added_at TEXT NOT NULL,
                       UNIQUE(site, term, lang)",
            'cols' => 'id, term, lang, target_pos, landing, note, added_at',
            'idx'  => array(),
        ),

        'keywords' => array(
            'body' => "id INTEGER PRIMARY KEY AUTOINCREMENT,
                       site TEXT NOT NULL DEFAULT '',
                       seen_at TEXT NOT NULL,
                       term TEXT NOT NULL,
                       seed TEXT NOT NULL DEFAULT '',
                       lang TEXT NOT NULL DEFAULT 'en',
                       source TEXT NOT NULL DEFAULT 'suggest',
                       UNIQUE(site, term, lang)",
            'cols' => 'id, seen_at, term, seed, lang, source',
            'idx'  => array("CREATE INDEX IF NOT EXISTS idx_kw_lang ON keywords(site, lang, seen_at)"),
        ),
    );
}

/* ---------------------------------------------------------------------------
   Run it. Returns a log of what happened, which the health page shows and the
   command line prints, so a migration is never a silent event.
   ------------------------------------------------------------------------ */
function mp_migrate(PDO $db, string $defaultSite): array {
    $log = array();

    $needed = false;
    foreach (array_merge(mp_migrate_add_column_tables(), array_keys(mp_migrate_rebuild_tables())) as $t) {
        if (mp_table_exists($db, $t) && !mp_col_exists($db, $t, 'site')) { $needed = true; break; }
    }
    if (!$needed) return array('skipped: every table already carries a site column');

    $snap = mp_db_snapshot('pre-multisite');
    $log[] = $snap !== '' ? 'snapshot: ' . basename($snap)
                          : 'snapshot FAILED, migration not attempted';
    if ($snap === '') return $log;

    $db->beginTransaction();
    try {
        /* The easy ones. A column with a default, nothing else disturbed. */
        foreach (mp_migrate_add_column_tables() as $t) {
            if (!mp_table_exists($db, $t) || mp_col_exists($db, $t, 'site')) continue;
            $db->exec("ALTER TABLE $t ADD COLUMN site TEXT NOT NULL DEFAULT ''");
            $n = $db->exec("UPDATE $t SET site = " . $db->quote($defaultSite) . " WHERE site = ''");
            $log[] = "$t: added site, backfilled " . (int)$n . " rows";
        }

        /* `issues` is deduplicated by a unique fingerprint. Two properties can
           legitimately have the same issue, so the uniqueness is now per site. */
        if (mp_table_exists($db, 'issues')) {
            $db->exec("DROP INDEX IF EXISTS idx_issue_fp");
            $db->exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_issue_fp ON issues(site, fingerprint)");
            $log[] = "issues: fingerprint uniqueness is now per site";
        }

        /* The rebuilds. */
        foreach (mp_migrate_rebuild_tables() as $t => $spec) {
            if (!mp_table_exists($db, $t) || mp_col_exists($db, $t, 'site')) continue;

            $before = mp_row_count($db, $t);
            $tmp = $t . '__mig';
            $db->exec("DROP TABLE IF EXISTS $tmp");
            $db->exec("CREATE TABLE $tmp (" . $spec['body'] . ")");
            $db->exec("INSERT INTO $tmp (site, " . $spec['cols'] . ")
                       SELECT " . $db->quote($defaultSite) . ", " . $spec['cols'] . " FROM $t");

            $after = mp_row_count($db, $tmp);
            if ($after !== $before) {
                throw new RuntimeException("$t: copied $after of $before rows, aborting");
            }

            $db->exec("DROP TABLE $t");
            $db->exec("ALTER TABLE $tmp RENAME TO $t");
            foreach ($spec['idx'] as $sql) $db->exec($sql);
            $log[] = "$t: rebuilt with site in the unique key, $before rows preserved";
        }

        $db->commit();
        $log[] = 'committed';
    } catch (Throwable $e) {
        $db->rollBack();
        $log[] = 'ROLLED BACK: ' . $e->getMessage();
        $log[] = 'the database is unchanged; the snapshot is at ' . basename($snap);
        return $log;
    }

    /* Cheap insurance: prove the file is still sound after a structural change. */
    try {
        $ok = (string)$db->query("PRAGMA integrity_check")->fetchColumn();
        $log[] = 'integrity check: ' . $ok;
    } catch (Throwable $e) {
        $log[] = 'integrity check could not run: ' . $e->getMessage();
    }

    return $log;
}
