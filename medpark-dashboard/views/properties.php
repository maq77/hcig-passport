<?php
/* ==========================================================================
   Properties.

   Added 2026-09-04. Adding a website to this system is a row here and one line
   pasted onto that website. No second install, no second database, no second
   set of numbers that disagree with these.

   THE ONE THING THAT CANNOT CHANGE
   A property's key is what every stored row carries. Changing it after data
   exists would orphan every visit, every enquiry and every request belonging to
   it, so the form offers it once and never again. The public token in the
   script tag is separate precisely so that something can still be changed
   later without touching a single stored row.
   ========================================================================== */

$sites = mp_sites();
$kinds = mp_partner_kinds();   /* unused here, but keeps the include honest */

/* Where the tracker is served from, which is wherever this dashboard lives.
   Derived rather than configured, so it stays right when the hub moves. */
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host   = (string)($_SERVER['HTTP_HOST'] ?? '');
$base   = rtrim(str_replace('\\', '/', dirname((string)($_SERVER['SCRIPT_NAME'] ?? '/'))), '/');
$hubUrl = $scheme . '://' . $host . $base;

$tagFor = function (array $s) use ($hubUrl): string {
    return '<script src="' . $hubUrl . '/t.js?s=' . rawurlencode((string)$s['token'])
         . '" defer></script>';
};
?>

<div class="qa" role="group" aria-label="Properties">
  <span class="qa__btn" title="Every website this system measures.">
    <?php echo ui_icon('globe', 15); ?>
    <?php echo count($sites); ?> registered
  </span>
  <a class="qa__btn" href="#add" title="Register a website and get the line to paste on it.">
    <?php echo ui_icon('sparkles', 15); ?> Add a website
  </a>
  <a class="qa__btn" href="?p=group&amp;r=<?php echo e($R['preset']); ?>"
     title="Every property on one screen."><?php echo ui_icon('gauge', 15); ?> Management dashboard</a>
</div>

<div class="card card--pad0">
  <h3>Registered websites
      <span class="hint">each one gets the same dashboard, measured the same way</span></h3>
  <?php
    if (!$sites) {
        ui_empty('No websites registered', 'Add the first one below.', 'globe');
    } else {
        echo '<div class="tw"><table><thead><tr><th>Website</th><th>Key</th>'
           . '<th>Hosts it answers on</th><th>Collecting</th><th></th></tr></thead><tbody>';
        foreach ($sites as $key => $s) {
            /* Is anything actually arriving? The most useful column here: a
               registered property sending nothing usually means the tag was
               never pasted, or was pasted on a host that is not registered. */
            $was = mp_current_site();
            mp_current_site($key);
            $last = mp_q("SELECT MAX(at) FROM a_pageviews WHERE site = :site")->fetchColumn();
            $total = (int)mp_q("SELECT COUNT(*) FROM a_pageviews WHERE site = :site")->fetchColumn();
            mp_current_site($was);

            $live = $last && (time() - (int)strtotime((string)$last)) < 86400 * 2;
            echo '<tr>'
               . '<td><strong>' . e((string)$s['label']) . '</strong>'
               . '<div class="muted" style="font-size:11.5px">' . e((string)$s['site_url']) . '</div></td>'
               . '<td class="muted" style="font-size:11.5px">' . e($key) . '</td>'
               . '<td class="muted" style="font-size:11.5px">'
               . e(implode(', ', mp_site_domains($s))) . '</td>'
               . '<td>' . ($total > 0
                   ? '<span class="pill pill--' . ($live ? 'ok' : 'wait') . '">'
                     . ($live ? 'yes' : 'stopped') . '</span>'
                     . '<div class="muted" style="font-size:11.5px">' . mp_num($total) . ' page views</div>'
                   : '<span class="pill pill--off">nothing yet</span>') . '</td>'
               . '<td class="n">'
               . '<a class="btn btn--sm" href="?p=ceo&amp;r=' . e($R['preset']) . '&amp;site=' . e($key) . '">Open</a>'
               . '</td></tr>';
        }
        echo '</tbody></table></div>';
    }
  ?>
</div>

<div class="card card--pad0">
  <h3>The line to paste <span class="hint">this is the entire installation</span></h3>
  <?php
    if (!$sites) {
        ui_empty('Nothing to paste yet', 'Add a website below and its tag appears here.', 'list');
    } else {
        echo '<div class="tw"><table><thead><tr><th>Website</th><th>Paste this before &lt;/body&gt;</th>'
           . '</tr></thead><tbody>';
        foreach ($sites as $key => $s) {
            echo '<tr><td><strong>' . e((string)$s['label']) . '</strong></td>'
               . '<td><code style="font-size:11.5px;word-break:break-all">'
               . e($tagFor($s)) . '</code></td></tr>';
        }
        echo '</tbody></table></div>';
    }
  ?>
  <p class="card__note">
    That line is the whole installation. No PHP, no database, nothing to upload, and nothing that
    depends on what the website is built with: healthcareig.com runs an end-of-life PHP, 247clinic
    sits behind Cloudflare and Passport is static, and a script tag works on all three. Because the
    tracker is served from here, improving it improves every website at once with no deploy to any
    of them.
  </p>
</div>

<div class="grid g-2-1">
  <div class="card card--pad0" id="add">
    <h3>Add a website</h3>
    <form method="post" style="padding:14px 15px;display:grid;gap:10px">
      <input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
      <input type="hidden" name="act" value="site_save">
      <div class="field">
        <label>Name</label>
        <p class="hint">As you would say it. "24/7 Clinic".</p>
        <input type="text" name="label" required placeholder="24/7 Clinic">
      </div>
      <div class="field">
        <label>Address</label>
        <p class="hint">With https, no trailing slash.</p>
        <input type="text" name="site_url" required placeholder="https://www.247clinic.net">
      </div>
      <div class="field">
        <label>Key</label>
        <p class="hint"><strong>Permanent.</strong> Every stored row carries it, so it can never be
          changed once anything is collected. The bare domain is the safe choice.</p>
        <input type="text" name="site_key" required placeholder="247clinic.net">
      </div>
      <div class="field">
        <label>Public token</label>
        <p class="hint">What appears in the script tag. Can be changed later without touching any
          stored data. Leave blank to use the first part of the domain.</p>
        <input type="text" name="token" placeholder="clinic247">
      </div>
      <div class="field">
        <label>Hosts it answers on</label>
        <p class="hint">One per line. Both the apex and the www form, and any locale host. A beacon
          from a host that is not listed here is refused, so this list is the security boundary.</p>
        <textarea name="domains" rows="3" placeholder="247clinic.net&#10;www.247clinic.net"></textarea>
      </div>
      <div><button class="btn btn--pri" type="submit">Register website</button></div>
    </form>
  </div>

  <div class="card">
    <h3>Adding one, start to finish</h3>
    <ol class="muted" style="font-size:13px;line-height:1.7;padding-left:18px;margin:0">
      <li>Register it on the left. Takes a minute.</li>
      <li>Copy its line from the table above.</li>
      <li>Paste it into that website's footer, before <code>&lt;/body&gt;</code>.</li>
      <li>Open the site once. It appears in the management dashboard within five minutes.</li>
    </ol>
    <p class="card__note">
      Nothing else. No account to create, no tag manager, no cookie banner needed for the default
      tier, and nothing to remove from the site if you change your mind: deleting the line stops it.
    </p>
    <h3 style="margin-top:16px">Its own settings</h3>
    <p class="muted" style="font-size:12.5px;margin:0">
      Each website keeps its own GA4 property, Search Console address, competitors, target keywords,
      KPI targets and alert address. The keys we pay for, such as the Anthropic and MaxMind ones,
      stay shared across the whole installation rather than being duplicated per site.
    </p>
  </div>
</div>

<p class="muted" style="font-size:12.5px;margin-top:14px;max-width:85ch">
  The tracker is currently served from <code><?php echo e($hubUrl); ?></code>. If this system moves
  to another server later, that address is repointed and every registered website follows without
  being touched, because the address is where the tracker lives rather than which website it belongs
  to.
</p>
