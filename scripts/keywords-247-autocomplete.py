"""Google autocomplete evidence for the 24/7 Clinic keyword map (T-011).

Asks Google's public suggest endpoint what people type after each seed, per
language, per destination and per hotel. Saves the raw answers so every keyword
in docs/247clinic-keywords.md can be traced to a real suggestion. No volumes:
autocomplete shows what is searched, not how often.

Run: python scripts/keywords-247-autocomplete.py
Out: docs/247clinic-keywords-autocomplete.json
"""
import json, time, urllib.parse, urllib.request, datetime, pathlib

SEEDS = {
    'en': ['doctor', 'clinic', 'urgent care', 'hotel doctor', 'dentist', 'pharmacy'],
    'de': ['arzt', 'klinik', 'notarzt', 'hotelarzt', 'zahnarzt', 'apotheke'],
    'pl': ['lekarz', 'przychodnia', 'szpital', 'dentysta', 'apteka'],
    'cs': ['lékař', 'klinika', 'pohotovost', 'zubař', 'lékárna'],
}
PLACES = ['hurghada', 'sahl hasheesh', 'soma bay', 'abu soma', 'marsa alam', 'el quseir', 'el alamein']
HOTELS = ['premier le reve', 'steigenberger ras soma', 'amwaj beach club']
TOPIC = {
    'en': ['travel insurance doctor egypt', 'doctor egypt hotel', 'fit to fly certificate egypt', 'diving medical certificate egypt'],
    'de': ['auslandskrankenversicherung ägypten arzt', 'arzt ägypten hotel', 'tauchtauglichkeit ägypten'],
    'pl': ['ubezpieczenie turystyczne egipt lekarz', 'lekarz egipt hotel'],
    'cs': ['cestovní pojištění egypt lékař', 'lékař egypt hotel'],
}


def suggest(q, hl):
    url = 'https://suggestqueries.google.com/complete/search?' + urllib.parse.urlencode(
        {'client': 'firefox', 'hl': hl, 'q': q, 'ie': 'utf-8', 'oe': 'utf-8'})
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as r:
        raw = r.read().decode(r.headers.get_content_charset() or 'utf-8', 'replace')
    return json.loads(raw)[1]


out = {'date': datetime.date.today().isoformat(), 'source': 'Google autocomplete, suggestqueries.google.com, client=firefox', 'results': {}}
queries = []
for hl, seeds in SEEDS.items():
    for s in seeds:
        for p in PLACES:
            queries.append((hl, f'{s} {p}'))
    queries.append((hl, f'{seeds[0]} ' + HOTELS[0]))
for hl in SEEDS:
    for h in HOTELS:
        queries.append((hl, h + ' ' + {'en': 'doctor', 'de': 'arzt', 'pl': 'lekarz', 'cs': 'lékař'}[hl]))
for hl, qs in TOPIC.items():
    for q in qs:
        queries.append((hl, q))

for hl, q in queries:
    try:
        out['results'].setdefault(hl, {})[q] = suggest(q, hl)
    except Exception as e:  # recorded, never hidden
        out['results'].setdefault(hl, {})[q] = {'error': str(e)}
    time.sleep(0.25)

path = pathlib.Path(__file__).resolve().parent.parent / 'docs' / '247clinic-keywords-autocomplete.json'
path.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
ok = sum(1 for l in out['results'].values() for v in l.values() if isinstance(v, list))
hits = sum(1 for l in out['results'].values() for v in l.values() if isinstance(v, list) and v)
print(f'{len(queries)} queries, {ok} answered, {hits} with suggestions -> {path.name}')
