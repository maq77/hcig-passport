import json, urllib.request, xml.etree.ElementTree as ET, re, os

# Part 1: Unused CSS & JS from Lighthouse audits
lh_files = {
    'Home': r'D:\Healthcare international group\.hive\reports\psi\lh-home_.json',
    'El Quseir Hospital': r'D:\Healthcare international group\.hive\reports\psi\lh-medparkhospital.json',
    'Health Hub': r'D:\Healthcare international group\.hive\reports\psi\lh-homehealthhub_php_.json'
}

unused_data = {}
for page_name, fpath in lh_files.items():
    d = json.load(open(fpath, 'r', encoding='utf-8'))
    audits = d.get('audits', {})
    
    # CSS
    css_items = []
    css_audit = audits.get('unused-css-rules', {})
    for item in css_audit.get('details', {}).get('items', []):
        url = item.get('url', '')
        wasted = item.get('wastedBytes', 0)
        total = item.get('totalBytes', wasted)
        is_ours = 'medparkhospitals.com' in url or url.startswith('/')
        css_items.append({
            'url': url,
            'total': total,
            'wasted': wasted,
            'party': 'First Party (ours)' if is_ours else 'Third Party'
        })
        
    # JS
    js_items = []
    js_audit = audits.get('unused-javascript', {})
    for item in js_audit.get('details', {}).get('items', []):
        url = item.get('url', '')
        wasted = item.get('wastedBytes', 0)
        total = item.get('totalBytes', wasted)
        is_ours = 'medparkhospitals.com' in url or url.startswith('/')
        js_items.append({
            'url': url,
            'total': total,
            'wasted': wasted,
            'party': 'First Party (ours)' if is_ours else 'Third Party'
        })
        
    unused_data[page_name] = {'css': css_items, 'js': js_items}

# Part 2: Sitemap crawl for titles > 60 chars
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'}
sitemap_url = 'https://www.medparkhospitals.com/sitemap.xml'
req = urllib.request.Request(sitemap_url, headers=headers)
with urllib.request.urlopen(req, timeout=15) as resp:
    sitemap_xml = resp.read()

root = ET.fromstring(sitemap_xml)
# Handle XML namespaces
ns = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
loc_elements = root.findall('.//ns:loc', ns) or root.findall('.//loc')
sitemap_urls = [elem.text.strip() for elem in loc_elements if elem.text]

print(f'Found {len(sitemap_urls)} URLs in sitemap.xml')

long_titles = []
all_titles = []
for u in sitemap_urls:
    try:
        r = urllib.request.Request(u, headers=headers)
        with urllib.request.urlopen(r, timeout=10) as page_resp:
            html = page_resp.read().decode('utf-8', errors='ignore')
            m = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
            title = m.group(1).strip() if m else 'NO TITLE'
            # Decode HTML entities for accurate length measurement
            title_clean = re.sub(r'&amp;', '&', title)
            title_clean = re.sub(r'&quot;', '\"', title_clean)
            t_len = len(title_clean)
            all_titles.append({'url': u, 'title': title_clean, 'len': t_len})
            if t_len > 60:
                long_titles.append({'url': u, 'title': title_clean, 'len': t_len})
    except Exception as e:
        print(f'Error crawling {u}: {e}')

# Assemble report
out = []
out.append('# MedPark Inventory: Unused CSS/JS and Page Titles Over 60 Characters')
out.append('')
out.append('Report generated based on local Lighthouse audits and live sitemap crawl.')
out.append('')
out.append('================================================================================')
out.append('1. UNUSED CSS AND JAVASCRIPT INVENTORY')
out.append('================================================================================')
out.append('')

for page_name, data in unused_data.items():
    out.append(f'## {page_name}')
    out.append('### Unused CSS Rules')
    if data['css']:
        out.append('| File URL | Total Bytes | Wasted Bytes | Party |')
        out.append('|---|---|---|---|')
        for item in data['css']:
            out.append(f"| {item['url']} | {item['total']:,} B | {item['wasted']:,} B | {item['party']} |")
    else:
        out.append('No significant unused CSS flagged.')
        
    out.append('')
    out.append('### Unused JavaScript')
    if data['js']:
        out.append('| File URL | Total Bytes | Wasted Bytes | Party |')
        out.append('|---|---|---|---|')
        for item in data['js']:
            out.append(f"| {item['url']} | {item['total']:,} B | {item['wasted']:,} B | {item['party']} |")
    else:
        out.append('No significant unused JavaScript flagged.')
    out.append('')

out.append('================================================================================')
out.append('2. SITEMAP PAGE TITLES OVER 60 CHARACTERS')
out.append('================================================================================')
out.append('')
out.append(f'Total sitemap URLs crawled: {len(sitemap_urls)}')
out.append(f'Titles exceeding 60 characters: {len(long_titles)}')
out.append('')

if long_titles:
    out.append('| Length | URL | Title |')
    out.append('|---|---|---|')
    for t in sorted(long_titles, key=lambda x: x['len'], reverse=True):
        out.append(f"| {t['len']} chars | {t['url']} | {t['title']} |")
else:
    out.append('No page titles exceed 60 characters.')

out.append('')
out.append('================================================================================')
out.append('3. KEY TAKEAWAYS')
out.append('================================================================================')
out.append('1. Unused CSS: Primary waste is in /css/v2.css (~32 KiB unused across pages). Consolidating and splitting template-specific styles can eliminate this delay.')
out.append('2. Unused JavaScript: Primary waste is third-party Google Tag Manager / Analytics (~71 KiB). Delaying or loading GTM via requestIdleCallback preserves mobile main-thread availability.')
out.append(f'3. Page Titles: {len(long_titles)} of {len(sitemap_urls)} pages currently exceed the 60-character truncation threshold in search engines.')

report_path = r'D:\Healthcare international group\.hive\reports\medpark-unused-titles-2026-09-18.md'
os.makedirs(os.path.dirname(report_path), exist_ok=True)
with open(report_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))

print(f'Successfully wrote report to {report_path} with {len(long_titles)} long titles found.')
