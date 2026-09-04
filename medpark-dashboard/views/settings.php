<?php
/* Settings. Every credential slot the dashboard can use, blank until filled.
   Each field says exactly where the value comes from, so access can be handed
   to someone else without a call. Values are written to a file outside the web
   root and are never rendered back into the page for the secret fields. */
$s = mp_settings();
$saGiven = mp_get('google_sa_json') !== '';
$saEmail = '';
if ($saGiven) {
    $j = json_decode(mp_get('google_sa_json'), true);
    $saEmail = isset($j['client_email']) ? $j['client_email'] : '';
}
?>

<div class="card" style="margin-bottom:16px">
  <h3>Connection status</h3>
  <table>
    <thead><tr><th>Source</th><th>Status</th><th>What it needs</th><th>Last run</th></tr></thead>
    <tbody>
    <?php foreach ($conn as $k => $c):
      $last = mp_last_run($k); ?>
      <tr>
        <td><b><?php echo e($c['name']); ?></b></td>
        <td><?php echo ui_pill($c['ready'], 'Ready', 'Waiting for access'); ?></td>
        <td style="color:var(--ink-2)"><?php echo e($c['needs']); ?></td>
        <td style="color:var(--ink-3)">
          <?php echo $last ? e(str_replace('T', ' ', substr((string)$last['ran_at'], 0, 16))) . ' ' . ($last['status'] === 'ok' ? '' : '(failed)') : 'never'; ?>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>

<form method="post">
<input type="hidden" name="csrf" value="<?php echo e(mp_csrf()); ?>">
<input type="hidden" name="act" value="save_settings">

<div class="grid g2" style="margin-bottom:16px">

  <div class="card">
    <h3>Google, one service account for three products</h3>
    <p style="color:var(--ink-2);font-size:13px;margin:-6px 0 16px">
      A single service account unlocks GA4, Search Console and Business Profile. Create it once in
      Google Cloud Console, download the JSON key, then grant that account read access in each product.
    </p>

    <div class="field">
      <label>Service account JSON</label>
      <p class="hint">Google Cloud Console, IAM and admin, Service accounts, Keys, Add key, JSON.
        Paste the whole file. Enable the Analytics Data API, Search Console API and Business Profile
        Performance API on the same project.</p>
      <textarea name="google_sa_json" placeholder='{"type":"service_account","project_id":"...","client_email":"...","private_key":"..."}'><?php echo e(mp_get('google_sa_json')); ?></textarea>
      <?php if ($saEmail): ?>
        <p class="hint" style="margin-top:7px;color:var(--ok)">
          Loaded. Grant <b><?php echo e($saEmail); ?></b> Viewer access in GA4, and add it as a user
          in Search Console and Business Profile.</p>
      <?php endif; ?>
    </div>

    <div class="field">
      <label>GA4 property ID</label>
      <p class="hint">GA4, Admin, Property settings. A number like 123456789. Not the G- measurement ID.</p>
      <input type="text" name="ga4_property_id" value="<?php echo e(mp_get('ga4_property_id')); ?>" placeholder="123456789">
    </div>

    <div class="field">
      <label>GA4 measurement ID</label>
      <p class="hint">The G- code already on the site. Recorded here for reference.</p>
      <input type="text" name="ga4_measurement_id" value="<?php echo e(mp_get('ga4_measurement_id')); ?>">
    </div>

    <div class="field">
      <label>Search Console property</label>
      <p class="hint">Exactly as it appears in Search Console, including the trailing slash.
        For a domain property use the form sc-domain:medparkhospitals.com</p>
      <input type="text" name="gsc_site_url" value="<?php echo e(mp_get('gsc_site_url')); ?>">
    </div>

    <div class="field">
      <label>Business Profile location IDs</label>
      <p class="hint">Two, comma separated. Hurghada first, then El Quseir. Found in the Business
        Profile API, or in the URL when the listing is open in the Business Profile manager.</p>
      <input type="text" name="gbp_location_ids" value="<?php echo e(mp_get('gbp_location_ids')); ?>" placeholder="12345678901234567890, 09876543210987654321">
    </div>

    <div class="field">
      <label>Business Profile account ID</label>
      <p class="hint">Optional. Only needed if the two branches sit under different accounts.</p>
      <input type="text" name="gbp_account_id" value="<?php echo e(mp_get('gbp_account_id')); ?>">
    </div>
  </div>

  <div class="card">
    <h3>Our own analytics</h3>
    <p class="hint">Sessions, pages, referrers, country and every event, collected on this server
      rather than by Google. Nothing here can be blocked by an ad blocker, and no visitor address
      is ever stored or sent anywhere.</p>

    <div class="field">
      <label>Collect first-party analytics</label>
      <p class="hint">On by default. The cookieless tier stores nothing at all on a visitor's
        device, so it needs no permission from anyone and is the foundation every other number
        on the dashboard is compared against.</p>
      <select name="analytics_on">
        <option value="1"<?php echo mp_get('analytics_on') === '1' ? ' selected' : ''; ?>>On</option>
        <option value="0"<?php echo mp_get('analytics_on') !== '1' ? ' selected' : ''; ?>>Off</option>
      </select>
    </div>

    <div class="field">
      <label>MaxMind account ID</label>
      <p class="hint">Free account at maxmind.com. Needed for country and city. Everything else
        works without it.</p>
      <input type="text" name="maxmind_account" value="<?php echo e(mp_get('maxmind_account')); ?>" placeholder="1234567">
    </div>

    <div class="field">
      <label>MaxMind licence key</label>
      <p class="hint">Generated under Account, then Manage License Keys. After saving, run
        <code>tools/geoip-update.sh</code> once to download the database. A weekly cron keeps it
        current.
        <?php if (function_exists('mpa_geo_ready') && mpa_geo_ready()): ?>
          <strong>Database installed<?php $a = mpa_geo_age(); echo $a !== null ? ', ' . (int)$a . ' days old' : ''; ?>.</strong>
        <?php else: ?>
          <strong>Database not installed yet.</strong>
        <?php endif; ?>
      </p>
      <input type="text" name="maxmind_key" value="<?php echo e(mp_get('maxmind_key')); ?>">
    </div>

    <div class="field">
      <label>Keep raw rows for</label>
      <p class="hint">Days. Individual visits and events are removed past this; the daily totals
        are kept for good, so year-on-year comparisons survive the pruning.</p>
      <input type="text" name="analytics_retain" value="<?php echo e(mp_get('analytics_retain')); ?>" placeholder="730">
    </div>

    <div class="field">
      <label>Consent banner</label>
      <p class="hint">Off until the wording is approved. Leaving it off changes nothing: the site
        collects the cookieless tier either way. Turning it on adds the option for a visitor to
        accept, which is what makes returning visitors measurable across days.</p>
      <select name="consent_banner_on">
        <option value="0"<?php echo mp_get('consent_banner_on') !== '1' ? ' selected' : ''; ?>>Off, cookieless only</option>
        <option value="1"<?php echo mp_get('consent_banner_on') === '1' ? ' selected' : ''; ?>>On, ask for consent</option>
      </select>
    </div>
  </div>

  <div class="card">
    <h3>Everything else</h3>

    <div class="field">
      <label>PageSpeed Insights API key</label>
      <p class="hint">Optional. Speed checks already work without one. A key only raises the rate
        limit, which matters when the group version checks many sites at once.</p>
      <input type="text" name="psi_api_key" value="<?php echo e(mp_get('psi_api_key')); ?>" placeholder="AIza...">
    </div>

    <div class="field">
      <label>SEMrush API key <span class="tag">not needed</span></label>
      <p class="hint">Left here in case you ever buy it, but nothing depends on it. Keyword discovery
        runs on Google's own suggest endpoint, which is free and needs no key, and Search Console
        gives real positions for your own site rather than SEMrush's estimates. The one thing a paid
        tool would add is backlink data.</p>
      <input type="text" name="semrush_api_key" value="<?php echo e(mp_get('semrush_api_key')); ?>">
    </div>

    <div class="field">
      <label>Competitor sites</label>
      <p class="hint">One domain per line. Checked daily for speed, technical setup and whether they
        serve German. No paid tool required.</p>
      <textarea name="competitor_sites" style="min-height:74px"><?php echo e(mp_get('competitor_sites')); ?></textarea>
    </div>

    <div class="field">
      <label>SEMrush database</label>
      <p class="hint">The country database to query. eg for Egypt, de for Germany, pl for Poland.</p>
      <input type="text" name="semrush_database" value="<?php echo e(mp_get('semrush_database')); ?>">
    </div>

    <div class="field">
      <label>Yandex Metrica counter</label>
      <p class="hint">Already installed on the site and currently unused. This counter is live.</p>
      <input type="text" name="yandex_counter_id" value="<?php echo e(mp_get('yandex_counter_id')); ?>">
    </div>

    <div class="field">
      <label>Yandex OAuth token</label>
      <p class="hint">oauth.yandex.com, create an app with the metrika:read scope, then generate a token.</p>
      <input type="text" name="yandex_oauth_token" value="<?php echo e(mp_get('yandex_oauth_token')); ?>">
    </div>

    <div class="field">
      <label>Site address</label>
      <p class="hint">The canonical address. Health and speed checks run against this.</p>
      <input type="text" name="site_url" value="<?php echo e(mp_get('site_url')); ?>">
    </div>

    <div class="field">
      <label>Brand name</label>
      <input type="text" name="brand_name" value="<?php echo e(mp_get('brand_name')); ?>">
    </div>
  </div>
</div>

<div class="grid g2" style="margin-bottom:16px">
  <div class="card">
    <h3>AI visibility prompt set</h3>
    <div class="field">
      <label>Prompts, one per line</label>
      <p class="hint">The questions a real tourist would ask. Keep this list stable, changing it
        breaks month to month comparison.</p>
      <textarea name="ai_prompts" style="min-height:160px"><?php echo e(mp_get('ai_prompts')); ?></textarea>
    </div>
    <div class="field">
      <label>Brand terms that count as a mention</label>
      <input type="text" name="ai_brand_terms" value="<?php echo e(mp_get('ai_brand_terms')); ?>">
    </div>
    <div class="field">
      <label>Competitors to watch for</label>
      <input type="text" name="ai_competitors" value="<?php echo e(mp_get('ai_competitors')); ?>">
    </div>
  </div>

  <div class="card">
    <h3>Asking for reviews</h3>
    <div class="field">
      <label>Review links</label>
      <p class="hint">One per line, as <code>Listing name | link</code>. Each listing has its own
        "write a review" link inside its Google Business Profile. They are never guessed here,
        because a wrong link sends a patient to review the wrong hospital.</p>
      <textarea name="review_links" rows="3" placeholder="MedPark Health Hub, Hurghada | https://..."><?php echo e(mp_get('review_links')); ?></textarea>
    </div>
  </div>

  <div class="card">
    <h3>AI visibility checks</h3>
    <p class="hint" style="margin:0 0 12px;max-width:75ch">A key here lets the AI visibility page run
      its prompts by itself and record the answers. Only engines whose API actually searches the web
      can be automated. ChatGPT's consumer interface, Google's AI Overviews and Copilot have no public
      API for their search product, so those stay a monthly check by hand.</p>
    <div class="field">
      <label>Perplexity API key</label>
      <p class="hint">The closest of these to what a person sees, because search is the product.
        perplexity.ai, API settings.</p>
      <input type="text" name="perplexity_api_key" value="<?php echo e(mp_get('perplexity_api_key')); ?>" placeholder="pplx-...">
    </div>
    <div class="field">
      <label>Google Gemini API key</label>
      <p class="hint">Answers grounded with Google Search. Not the same as an AI Overview in the search
        results, which cannot be automated at all. aistudio.google.com.</p>
      <input type="text" name="gemini_api_key" value="<?php echo e(mp_get('gemini_api_key')); ?>" placeholder="AIza...">
    </div>
    <p class="hint" style="margin:6px 0 0">The Anthropic key below is used for Claude checks as well as
      for the assistant.</p>
  </div>

  <div class="card">
    <h3>Website assistant</h3>
    <div class="field">
      <label>Anthropic API key</label>
      <p class="hint">Optional. The assistant already works without one: it answers from the knowledge
        base and runs the booking flow. With a key it holds a real conversation in all three languages
        instead. console.anthropic.com, API keys.</p>
      <input type="text" name="anthropic_api_key" value="<?php echo e(mp_get('anthropic_api_key')); ?>" placeholder="sk-ant-...">
    </div>
    <div class="field">
      <label>Model</label>
      <p class="hint">Only used when a key is set.</p>
      <input type="text" name="chat_model" value="<?php echo e(mp_get('chat_model')); ?>">
    </div>
    <div class="field">
      <label>Where appointment requests are emailed</label>
      <p class="hint">Comma separated. Every request captured by the assistant is sent here immediately.</p>
      <input type="text" name="staff_email" value="<?php echo e(mp_get('staff_email')); ?>">
    </div>
    <div class="field">
      <label>Urgent case alerts</label>
      <p class="hint">Additional addresses that also receive the immediate alert when the assistant
        detects a possible emergency. Leave blank to use the address above only.</p>
      <input type="text" name="staff_alert_email" value="<?php echo e(mp_get('staff_alert_email')); ?>">
    </div>
    <div class="field">
      <label>Assistant enabled</label>
      <p class="hint">Set to 0 to switch the assistant off across the whole site immediately.</p>
      <input type="text" name="chat_enabled" value="<?php echo e(mp_get('chat_enabled')); ?>">
    </div>
  </div>

  <div class="card">
    <h3>Access and security</h3>
    <div class="field">
      <label>Change password</label>
      <p class="hint">Leave blank to keep the current one.</p>
      <input type="password" name="new_password" autocomplete="new-password" placeholder="New password">
    </div>

    <h3 style="margin-top:22px">Where the credentials live</h3>
    <table>
      <tbody>
        <tr><td>Settings file</td><td style="font-family:ui-monospace,monospace;font-size:12px"><?php echo e(MP_SECRETS); ?></td></tr>
        <tr><td>Database</td><td style="font-family:ui-monospace,monospace;font-size:12px"><?php echo e(MP_DB); ?></td></tr>
        <tr><td>Web root</td><td><?php echo ui_pill(strpos(MP_SECRETS, (string)($_SERVER['DOCUMENT_ROOT'] ?: 'xx')) !== 0, 'Outside, correct', 'Inside, move it'); ?></td></tr>
        <tr><td>File permissions</td><td><?php echo is_file(MP_SECRETS) ? e(substr(sprintf('%o', fileperms(MP_SECRETS)), -4)) : 'not created yet'; ?></td></tr>
      </tbody>
    </table>
    <p style="color:var(--ink-3);font-size:12.5px;margin:14px 0 0">
      Both files sit above public_html, so no browser can reach them even if the dashboard itself
      is misconfigured. Secrets are written server side and never appear in a page the browser caches.
    </p>

    <h3 style="margin-top:22px">Automatic daily collection</h3>
    <p style="color:var(--ink-2);font-size:13px;margin:0 0 10px">
      Add this as a cron job in cPanel, once a day at 05:00, and the dashboard stays current
      without anyone opening it.</p>
    <textarea readonly style="min-height:60px">/opt/cpanel/ea-php81/root/usr/bin/php <?php echo e(dirname(__DIR__)); ?>/collect.php --key=<?php echo e(substr(hash('sha256', mp_get('admin_hash') . 'cron'), 0, 24)); ?></textarea>
  </div>
</div>

<button class="btn btn--pri" type="submit" style="padding:11px 22px">Save settings</button>
</form>
