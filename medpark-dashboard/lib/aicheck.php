<?php
/* ==========================================================================
   Automated AI visibility checks.

   Added 2026-09-03.

   BE HONEST ABOUT WHAT THIS CAN AND CANNOT DO. That is the whole design
   constraint, and the AI page already said so before this file existed.

   What can be automated: engines that expose an API which actually searches
   the web while answering. Asking such an API a question is a good proxy for
   what the consumer product says, and it is repeatable, timestamped and
   recorded.

   What cannot: the consumer ChatGPT interface, Google's AI Overviews and
   Copilot have no public API for their search product. An answer from a
   vendor's API is not guaranteed to be the answer their chat interface gives
   the same day, because the products use different retrieval, different
   system prompts and different freshness. Those stay a monthly human check,
   and the page says which is which rather than implying full coverage.

   Every result records the engine, the model and the exact prompt, so a
   number in a report can always be traced back to what produced it.
   ========================================================================== */
declare(strict_types=1);

/* The engines this file knows how to drive.

   'auto'   whether it can be run without a person
   'key'    the settings field holding its credential
   'note'   what the reader needs to know about this engine's answer
   ------------------------------------------------------------------------ */
function mp_ai_engines(): array {
    return array(
        'Claude' => array(
            'auto'  => true,
            'key'   => 'anthropic_api_key',
            'model' => 'claude-opus-5',
            'note'  => 'Answers with Anthropic\'s own web search tool, so the answer is grounded in '
                     . 'pages found at the time of the check.',
        ),
        'Perplexity' => array(
            'auto'  => true,
            'key'   => 'perplexity_api_key',
            'model' => 'sonar',
            'note'  => 'The closest of all of these to the consumer product, because search is what '
                     . 'the product is.',
        ),
        'Gemini' => array(
            'auto'  => true,
            'key'   => 'gemini_api_key',
            'model' => 'gemini-2.5-flash',
            'note'  => 'Grounded with Google Search. Not the same thing as an AI Overview in the '
                     . 'search results, which has no API at all.',
        ),
        'ChatGPT' => array(
            'auto'  => false, 'key' => '', 'model' => '',
            'note'  => 'No public API for the consumer search product. Check by hand, in a fresh '
                     . 'session with no history.',
        ),
        'Google AI Overview' => array(
            'auto'  => false, 'key' => '', 'model' => '',
            'note'  => 'Part of the search results page. No API. Check by hand.',
        ),
        'Copilot' => array(
            'auto'  => false, 'key' => '', 'model' => '',
            'note'  => 'No public API for the consumer product. Check by hand.',
        ),
    );
}

/* Which engines can actually run right now: automatable and holding a key. */
function mp_ai_ready_engines(): array {
    $out = array();
    foreach (mp_ai_engines() as $name => $e) {
        if (!$e['auto']) continue;
        if ($e['key'] === '' || trim(mp_get($e['key'])) === '') continue;
        $out[$name] = $e;
    }
    return $out;
}

/* ---------------------------------------------------------------------------
   One HTTP call, shared by every engine. Never throws: a failed check is a
   recorded failure, not a broken page.
   ------------------------------------------------------------------------ */
function mp_ai_post(string $url, array $headers, array $body, int $timeout = 90): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, array(
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_POSTFIELDS     => json_encode($body),
        CURLOPT_TIMEOUT        => $timeout,
        CURLOPT_CONNECTTIMEOUT => 15,
    ));
    $raw  = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);

    if ($raw === false) return array('ok' => false, 'msg' => $err !== '' ? $err : 'no response', 'data' => null);
    $data = json_decode((string)$raw, true);
    if (!is_array($data)) return array('ok' => false, 'msg' => 'unreadable response (HTTP ' . $code . ')', 'data' => null);
    if ($code < 200 || $code >= 300) {
        $m = '';
        if (isset($data['error']['message'])) $m = (string)$data['error']['message'];
        elseif (isset($data['error']) && is_string($data['error'])) $m = (string)$data['error'];
        return array('ok' => false, 'msg' => 'HTTP ' . $code . ($m !== '' ? ': ' . $m : ''), 'data' => $data);
    }
    return array('ok' => true, 'msg' => '', 'data' => $data);
}

/* ---------------------------------------------------------------------------
   Claude, with Anthropic's server-side web search so the answer is grounded in
   pages rather than in training data. Raw HTTP because this host has no
   Composer, which is the same reason lib/geoip.php parses MaxMind by hand.
   ------------------------------------------------------------------------ */
function mp_ai_ask_claude(string $prompt, string $model): array {
    $key = trim(mp_get('anthropic_api_key'));
    if ($key === '') return array('ok' => false, 'msg' => 'no Anthropic key set', 'answer' => '', 'urls' => array());

    $r = mp_ai_post('https://api.anthropic.com/v1/messages',
        array('content-type: application/json',
              'x-api-key: ' . $key,
              'anthropic-version: 2023-06-01'),
        array(
            'model'      => $model,
            'max_tokens' => 2000,
            'tools'      => array(array('type' => 'web_search_20260209', 'name' => 'web_search')),
            'messages'   => array(array('role' => 'user', 'content' => $prompt)),
        ));
    if (!$r['ok']) return array('ok' => false, 'msg' => $r['msg'], 'answer' => '', 'urls' => array());

    /* The reply is a list of blocks: thinking, server tool calls, their
       results, and the text. Only the text is the answer; the search result
       blocks carry the pages it looked at. */
    $text = ''; $urls = array();
    foreach ((array)($r['data']['content'] ?? array()) as $block) {
        if (($block['type'] ?? '') === 'text') {
            $text .= (string)($block['text'] ?? '');
        }
        if (($block['type'] ?? '') === 'web_search_tool_result') {
            $content = $block['content'] ?? array();
            /* On an error this is an object, not a list. Branch before indexing. */
            if (is_array($content) && !isset($content['error_code'])) {
                foreach ($content as $hit) {
                    if (isset($hit['url'])) $urls[] = (string)$hit['url'];
                }
            }
        }
    }
    return array('ok' => true, 'msg' => '', 'answer' => $text, 'urls' => $urls);
}

/* Perplexity. Its API is its search product, which makes it the closest thing
   here to what a person would see. */
function mp_ai_ask_perplexity(string $prompt, string $model): array {
    $key = trim(mp_get('perplexity_api_key'));
    if ($key === '') return array('ok' => false, 'msg' => 'no Perplexity key set', 'answer' => '', 'urls' => array());

    $r = mp_ai_post('https://api.perplexity.ai/chat/completions',
        array('content-type: application/json', 'authorization: Bearer ' . $key),
        array('model' => $model,
              'messages' => array(array('role' => 'user', 'content' => $prompt))));
    if (!$r['ok']) return array('ok' => false, 'msg' => $r['msg'], 'answer' => '', 'urls' => array());

    $text = (string)($r['data']['choices'][0]['message']['content'] ?? '');
    $urls = array();
    foreach ((array)($r['data']['citations'] ?? array()) as $u) {
        if (is_string($u)) $urls[] = $u;
    }
    foreach ((array)($r['data']['search_results'] ?? array()) as $s) {
        if (isset($s['url'])) $urls[] = (string)$s['url'];
    }
    return array('ok' => true, 'msg' => '', 'answer' => $text, 'urls' => $urls);
}

/* Gemini, grounded with Google Search. Not an AI Overview, which has no API. */
function mp_ai_ask_gemini(string $prompt, string $model): array {
    $key = trim(mp_get('gemini_api_key'));
    if ($key === '') return array('ok' => false, 'msg' => 'no Gemini key set', 'answer' => '', 'urls' => array());

    $r = mp_ai_post(
        'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($model) . ':generateContent',
        array('content-type: application/json', 'x-goog-api-key: ' . $key),
        array('contents' => array(array('parts' => array(array('text' => $prompt)))),
              'tools'    => array(array('google_search' => new stdClass()))));
    if (!$r['ok']) return array('ok' => false, 'msg' => $r['msg'], 'answer' => '', 'urls' => array());

    $text = '';
    foreach ((array)($r['data']['candidates'][0]['content']['parts'] ?? array()) as $p) {
        $text .= (string)($p['text'] ?? '');
    }
    $urls = array();
    foreach ((array)($r['data']['candidates'][0]['groundingMetadata']['groundingChunks'] ?? array()) as $c) {
        if (isset($c['web']['uri'])) $urls[] = (string)$c['web']['uri'];
    }
    return array('ok' => true, 'msg' => '', 'answer' => $text, 'urls' => $urls);
}

function mp_ai_ask(string $engine, string $prompt): array {
    $engines = mp_ai_engines();
    if (!isset($engines[$engine]) || !$engines[$engine]['auto']) {
        return array('ok' => false, 'msg' => 'this engine has no API and must be checked by hand',
                     'answer' => '', 'urls' => array());
    }
    $model = (string)$engines[$engine]['model'];
    switch ($engine) {
        case 'Claude':     return mp_ai_ask_claude($prompt, $model);
        case 'Perplexity': return mp_ai_ask_perplexity($prompt, $model);
        case 'Gemini':     return mp_ai_ask_gemini($prompt, $model);
    }
    return array('ok' => false, 'msg' => 'unknown engine', 'answer' => '', 'urls' => array());
}

/* ---------------------------------------------------------------------------
   Reading the answer.

   POSITION, DEFINED ONCE, HERE: the number of different competitors named
   before us, plus one. Named first is position 1. It is a definition rather
   than a measurement, so it is written down and used everywhere instead of
   being decided differently by whoever reads the answer.
   ------------------------------------------------------------------------ */
function mp_ai_terms(string $setting): array {
    $raw = str_replace(array("\r\n", "\r", "\n"), ',', mp_get($setting));
    $out = array();
    foreach (explode(',', $raw) as $t) {
        $t = trim($t);
        if ($t !== '') $out[] = $t;
    }
    return $out;
}

function mp_ai_evaluate(string $answer, array $brand, array $rivals): array {
    $hay = mb_strtolower($answer);

    $first = null;
    foreach ($brand as $b) {
        $p = mb_strpos($hay, mb_strtolower($b));
        if ($p !== false && ($first === null || $p < $first)) $first = $p;
    }

    $found = array(); $before = array();
    foreach ($rivals as $c) {
        $p = mb_strpos($hay, mb_strtolower($c));
        if ($p === false) continue;
        $found[] = $c;
        if ($first !== null && $p < $first) $before[] = $c;
    }

    return array(
        'mentioned'   => $first !== null ? 1 : 0,
        'position'    => $first !== null ? count($before) + 1 : null,
        'competitors' => implode(', ', $found),
    );
}

/* Our own site among the pages the engine actually looked at. Being cited is a
   stronger result than being mentioned: it means the answer points at us. */
function mp_ai_cited_url(array $urls): string {
    $host = strtolower((string)preg_replace('~^https?://(www\.)?~', '', trim(mp_get('site_url'), '/')));
    if ($host === '') return '';
    foreach ($urls as $u) {
        if (stripos((string)$u, $host) !== false) return substr((string)$u, 0, 300);
    }
    return '';
}

/* ---------------------------------------------------------------------------
   Run the configured prompts against every ready engine and record the result.

   Bounded on purpose: a shared host will kill a long request, so the run stops
   when it approaches its time budget and reports how far it got. Running it
   again continues from a clean slate rather than resuming, which is fine
   because each result is an independent observation.
   ------------------------------------------------------------------------ */
function mp_ai_run_all(int $maxSeconds = 100): array {
    $t0      = microtime(true);
    $engines = mp_ai_ready_engines();
    $prompts = array_values(array_filter(array_map('trim', explode("\n", mp_get('ai_prompts')))));
    $brand   = mp_ai_terms('ai_brand_terms');
    $rivals  = mp_ai_terms('ai_competitors');

    if (!$engines) {
        return array('ok' => false, 'ran' => 0, 'saved' => 0, 'errors' => array(),
                     'msg' => 'No engine can be run automatically yet. Add an Anthropic, Perplexity '
                            . 'or Gemini API key in Settings. The other engines have no public API '
                            . 'for their search product and stay a manual check.');
    }
    if (!$prompts) {
        return array('ok' => false, 'ran' => 0, 'saved' => 0, 'errors' => array(),
                     'msg' => 'No prompts to ask. Add them in Settings.');
    }
    if (!$brand) {
        return array('ok' => false, 'ran' => 0, 'saved' => 0, 'errors' => array(),
                     'msg' => 'No brand terms set, so an answer could not be judged. Add them in Settings.');
    }

    $ins = mp_db()->prepare(
        "INSERT INTO ai_checks (site, checked_at, engine, prompt, mentioned, rank_position,
                                cited_url, competitors, notes)
         VALUES (:site,:t,:e,:p,:m,:r,:u,:c,:n)");

    $ran = 0; $saved = 0; $errors = array(); $stopped = false;
    foreach ($engines as $name => $meta) {
        foreach ($prompts as $prompt) {
            if (microtime(true) - $t0 > $maxSeconds) { $stopped = true; break 2; }

            $ran++;
            $res = mp_ai_ask($name, $prompt);
            if (!$res['ok']) { $errors[] = $name . ': ' . $res['msg']; continue; }

            $v = mp_ai_evaluate((string)$res['answer'], $brand, $rivals);
            $ins->execute(array(
                ':site' => mp_current_site(),
                ':t' => gmdate('Y-m-d'),
                ':e' => $name,
                ':p' => mb_substr($prompt, 0, 300),
                ':m' => $v['mentioned'],
                ':r' => $v['position'],
                ':u' => mp_ai_cited_url((array)$res['urls']),
                ':c' => mb_substr($v['competitors'], 0, 300),
                /* The evidence, kept with the result. A recorded number whose
                   answer nobody can read again is not evidence. */
                ':n' => 'auto · ' . (string)$meta['model'] . ' · '
                      . mb_substr(trim(preg_replace('~\s+~u', ' ', (string)$res['answer']) ?? ''), 0, 600),
            ));
            $saved++;
        }
    }

    $msg = $saved . ' of ' . $ran . ' checks recorded across ' . count($engines) . ' '
         . (count($engines) === 1 ? 'engine' : 'engines') . '.';
    if ($stopped) $msg .= ' Stopped at the time limit, so run it again to finish the rest.';
    if ($errors)  $msg .= ' Failed: ' . implode('; ', array_slice($errors, 0, 3)) . '.';

    return array('ok' => $saved > 0, 'ran' => $ran, 'saved' => $saved,
                 'errors' => $errors, 'msg' => $msg);
}
