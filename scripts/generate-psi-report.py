import json, glob, os

files = {
    'Home': r'D:\Healthcare international group\.hive\reports\psi\lh-home_.json',
    'El Quseir Hospital': r'D:\Healthcare international group\.hive\reports\psi\lh-medparkhospital.json',
    'Health Hub': r'D:\Healthcare international group\.hive\reports\psi\lh-homehealthhub_php_.json',
    'Emergency & Urgent Care': r'D:\Healthcare international group\.hive\reports\psi\lh-homeemergency_urgent_care__.json',
    'Polish Home': r'D:\Healthcare international group\.hive\reports\psi\lh-homepl__.json'
}

prev = {
    'Home': {'perf': 97, 'lcp': '5.8 s'},
    'El Quseir Hospital': {'perf': 62, 'lcp': '13.7 s'},
    'Health Hub': {'perf': 73, 'lcp': '7.5 s'},
    'Emergency & Urgent Care': {'perf': 76, 'lcp': 'N/A'},
    'Polish Home': {'perf': 77, 'lcp': 'N/A'}
}

results = []
for label, fpath in files.items():
    data = json.load(open(fpath, 'r', encoding='utf-8'))
    url = data.get('finalUrl', data.get('requestedUrl', ''))
    cats = data.get('categories', {})
    perf = int(cats.get('performance', {}).get('score', 0) * 100)
    a11y = int(cats.get('accessibility', {}).get('score', 0) * 100)
    audits = data.get('audits', {})
    lcp_val = audits.get('largest-contentful-paint', {}).get('displayValue', 'N/A')
    cls_val = audits.get('cumulative-layout-shift', {}).get('displayValue', 'N/A')
    tbt_val = audits.get('total-blocking-time', {}).get('displayValue', 'N/A')
    
    lcp_items = audits.get('largest-contentful-paint-element', {}).get('details', {}).get('items', [])
    elem_info = {}
    phase_info = []
    if len(lcp_items) > 0 and 'items' in lcp_items[0]:
        elem_node = lcp_items[0]['items'][0].get('node', {})
        elem_info = {
            'selector': elem_node.get('selector', 'N/A'),
            'snippet': elem_node.get('snippet', 'N/A')
        }
    if len(lcp_items) > 1 and 'items' in lcp_items[1]:
        phase_info = lcp_items[1]['items']
        
    opps = []
    for k, a in audits.items():
        if a.get('details', {}).get('type') == 'opportunity':
            savings = a.get('details', {}).get('overallSavingsMs', 0)
            savings_bytes = a.get('details', {}).get('overallSavingsBytes', 0)
            if savings > 0 or savings_bytes > 0:
                opps.append({
                    'id': k,
                    'title': a.get('title', k),
                    'savingsMs': savings,
                    'display': a.get('displayValue', '')
                })
    opps.sort(key=lambda x: x['savingsMs'], reverse=True)
    
    results.append({
        'label': label,
        'url': url,
        'perf': perf,
        'a11y': a11y,
        'lcp': lcp_val,
        'cls': cls_val,
        'tbt': tbt_val,
        'prev_perf': prev[label]['perf'],
        'prev_lcp': prev[label]['lcp'],
        'elem': elem_info,
        'phases': phase_info,
        'top_opps': opps[:3]
    })

out = []
out.append('# MedPark Mobile PageSpeed & LCP Analysis')
out.append('')
out.append('Source: Local Lighthouse audits in .hive/reports/psi/lh-*.json.')
out.append('')
out.append('## Performance Summary Table')
out.append('')
out.append('| Page | Current Perf | Prev Perf | A11y | LCP | Prev LCP | CLS | TBT |')
out.append('|---|---|---|---|---|---|---|---|')
for r in results:
    out.append('| ' + r['label'] + ' | ' + str(r['perf']) + '/100 | ' + str(r['prev_perf']) + '/100 | ' + str(r['a11y']) + '/100 | ' + r['lcp'] + ' | ' + r['prev_lcp'] + ' | ' + r['cls'] + ' | ' + r['tbt'] + ' |')

out.append('')
out.append('## Per-Page LCP Element & Opportunities')
out.append('')

for r in results:
    out.append('### ' + r['label'] + ': ' + r['url'])
    out.append('- Metrics: Performance ' + str(r['perf']) + '/100, Accessibility ' + str(r['a11y']) + '/100, LCP ' + r['lcp'] + ', CLS ' + r['cls'] + ', TBT ' + r['tbt'])
    if r['elem'].get('selector'):
        out.append('- LCP Selector: `' + r['elem']['selector'] + '`')
        out.append('- LCP Snippet: `' + r['elem']['snippet'] + '`')
    if r['phases']:
        out.append('- LCP Phase Breakdown:')
        for p in r['phases']:
            timing = p.get('timing', 0)
            out.append('  - ' + str(p.get('phase')) + ': ' + f'{timing:.0f} ms (' + str(p.get('percent')) + ')')
    if r['top_opps']:
        out.append('- Top Opportunities:')
        for o in r['top_opps']:
            out.append('  - ' + o['title'] + ': ' + o['display'])
    out.append('')

report_path = r'D:\Healthcare international group\.hive\reports\medpark-psi-2026-09-18.md'
os.makedirs(os.path.dirname(report_path), exist_ok=True)
with open(report_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print('Report successfully written to:', report_path)
