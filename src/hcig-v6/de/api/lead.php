<?php
// HCIG v6 lead endpoint (2026-10-30). PHP 7.1+. Receives the site's forms as JSON, drops bots (hidden field, too fast,
// too many from one address), keeps every lead in a CSV outside public_html and emails it. No secrets in this file.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function out($ok, $code = 200) { http_response_code($code); echo json_encode(['ok' => $ok]); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(false, 405);
$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 30000) out(false, 413);
$d = json_decode($raw, true);
if (!is_array($d) || !isset($d['fields']) || !is_array($d['fields'])) out(false, 400);
// bots: the hidden field is filled, or the form was sent less than 2.5 s after the page opened
if (!empty($d['hp']) || (isset($d['t']) && (int)$d['t'] < 2500)) out(true);
$clean = function ($s, $max) { $s = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', (string)$s)); return function_exists('mb_substr') ? mb_substr($s, 0, $max) : substr($s, 0, $max); };
$kind = preg_replace('/[^a-z0-9-]/', '', strtolower((string)($d['kind'] ?? 'contact'))) ?: 'contact';
$page = $clean($d['page'] ?? '', 200); $lang = preg_replace('/[^a-z]/', '', (string)($d['lang'] ?? ''));
$fields = []; $email = '';
foreach (array_slice($d['fields'], 0, 20) as $f) {
  if (!is_array($f) || count($f) < 2) continue;
  $k = $clean($f[0], 80); $v = $clean($f[1], 4000);
  if ($v === '') continue;
  $fields[] = [$k, $v];
  if ($email === '' && filter_var($v, FILTER_VALIDATE_EMAIL)) $email = $v;
}
if (!$fields || $email === '') out(false, 422);
// store outside the web root: /home/<user>/hcig-leads
$dir = dirname(rtrim($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__, 2), '/')) . '/hcig-leads';
if (!is_dir($dir)) @mkdir($dir, 0700, true);
$ip = $_SERVER['REMOTE_ADDR'] ?? '';
$rate = $dir . '/rate-' . md5($ip . date('Y-m-d-H')) . '.txt';
$n = is_file($rate) ? (int)file_get_contents($rate) : 0;
if ($n >= 8) out(false, 429);
@file_put_contents($rate, (string)($n + 1));
$row = [date('c'), $kind, $lang, $page, $email, json_encode($fields, JSON_UNESCAPED_UNICODE)];
$fh = @fopen($dir . '/leads.csv', 'a');
if ($fh) { fputcsv($fh, $row); fclose($fh); }
// email
$to = 'partner@healthcareig.com, marketing.hcig@gmail.com';
$subject = 'HCIG website: ' . $kind . ' enquiry';
$body = "New " . $kind . " enquiry from healthcareig.com\n\n";
foreach ($fields as $f) $body .= $f[0] . ': ' . $f[1] . "\n";
$body .= "\nPage: https://healthcareig.com" . $page . "\nLanguage: " . $lang . "\nTime: " . date('Y-m-d H:i') . "\n";
$headers = "From: HCIG Website <no-reply@healthcareig.com>\r\nReply-To: " . str_replace(["\r", "\n"], '', $email) . "\r\nContent-Type: text/plain; charset=UTF-8\r\nX-Mailer: HCIG-v6";
$sent = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers, '-fno-reply@healthcareig.com');
// the lead is kept in the CSV even if mail fails
out($fh || $sent);
