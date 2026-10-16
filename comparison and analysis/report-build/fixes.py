def apply(p, rep):
    t = open(p, encoding='utf8').read()
    for a, b in rep:
        n = t.count(a)
        assert n >= 1, (p, a[:90], n)
        t = t.replace(a, b)
    open(p, 'w', encoding='utf8').write(t)
    print(p, 'ok', len(rep))

R = [
('<li>Now 3.88 t, and offered as 4x2 or 4x4.<sup class="s">5</sup></li>', '<li>Now listed at 3.88 t, 4x2 or 4x4.<sup class="s">5</sup></li>'),
('<td>Together they cost about the same as one Dutch spec MAN ambulance (C, est. €200k to €250k).</td>', '<td>Together they cost only about 20% more than one Dutch spec MAN ambulance (C, est. €190k to €240k).</td>'),
('Score 6.1. Built for German disaster units: two patients, off road. Heavy at 5.38 t and costs more than B with less clinical kit. Only worth it for desert or beach rescue.', 'Score 6.2. Built for German disaster units: two patients, off road. Heavy at 5.38 t and costs more than B with less clinical fit out. Only worth it for desert tracks and rough roads.'),
('<dd>Sprinter 315 CDI, 4x2 (4x4 offered)</dd>', '<dd>Sprinter 315 CDI, 4x2 (4x4 listed)</dd>'),
('<dt>Est. price</dt><dd>€200k to €250k</dd>', '<dt>Est. price</dt><dd>€190k to €240k</dd>'),
('<tr><th>Medical kit listed</th><td>Mounting points only</td><td>Defibrillator, monitor, suction, nebuliser, ventilator prep, splints</td><td>Not listed</td><td>Not listed</td></tr>',
 '<tr><th>Medical kit in text</th><td>Mounting points only</td><td>Defibrillator, monitor, suction, nebuliser, ventilator prep, splints</td><td>Not listed. Storage for ECG unit and Lucas 3</td><td>Not listed. Rails for devices, reimplantation box space</td></tr>'),
('EN 1789 classes: A1 and A2 patient transport, B emergency ambulance, C mobile intensive care unit.<sup class="s">14</sup></p>',
 'EN 1789 classes: A1 and A2 patient transport, B emergency ambulance, C mobile intensive care unit.<sup class="s">14</sup> Germany uses a Type B body for A as a civil protection transport vehicle. Every datasheet states the equipment is an example and can be changed.</p>'),
('<rect x="141.7" y="42.5" width="26.9" height="5" rx="1" fill="#BBBCBD"/>', '<rect x="136.3" y="42.5" width="26.9" height="5" rx="1" fill="#BBBCBD"/>'),
('<text x="141.7" y="41.4" font-weight="500" font-size="2.7" fill="#565759">€200k to €250k</text>', '<text x="136.3" y="41.4" font-weight="500" font-size="2.7" fill="#565759">€190k to €240k</text>'),
('for €110M in 2021. That is €73k per vehicle on a bulk order.<sup class="s">8</sup> Base Sprinter 316 CDI van listed at €39k to €43k net in 2020.<sup class="s">15</sup> A single order costs more than bulk.',
 'for €110M in 2021, an average of €73k across mixed vehicles, not a price per ambulance.<sup class="s">8</sup> The base Sprinter 316 CDI van listed at €39k to €43k net in 2020. Prices have risen since.<sup class="s">15</sup> A single order costs more than bulk. A stretcher table, 3.88 t or 4x4 each add cost.'),
('<tr><th><span class="lt">C</span>MAN TGE</th><td class="num">€200k to €250k</td><td>German emergency ambulances (RTW Type C) cost €260k to €300k in 2024 and 2025, incl. 19% VAT and medical kit.<sup class="s">13</sup> That is about €220k to €250k net. Base TGE 3.180 van about €49.6k net.<sup class="s">16</sup> Powered loading adds cost.</td></tr>',
 '<tr><th><span class="lt">C</span>MAN TGE</th><td class="num">€190k to €240k</td><td>German emergency ambulances cost about €270k each in 2025, incl. 19% VAT and medical kit, often on larger box bodies.<sup class="s">13</sup> C is a panel van, so it sits below that. Base TGE 3.180 van about €49.6k net.<sup class="s">16</sup> Powered loading and Dutch radio add cost.</td></tr>'),
('<p class="lead">WAS does not publish prices. Each band below is built from public tenders, government orders and base vehicle price lists. Treat them as planning numbers until WAS quotes.</p>',
 '<p class="lead">WAS does not publish prices. Each band is built from public tenders, government orders and base vehicle price lists, for the vehicle with a standard medical kit. Treat them as planning numbers until WAS quotes.</p>'),
('<tr><th>C + D</th><td class="num">€350k to €440k</td><td class="num">€415k to €521k</td></tr>', '<tr><th>C + D</th><td class="num">€340k to €430k</td><td class="num">€403k to €510k</td></tr>'),
('<tr><th>Service and parts in Egypt</th><td class="num">15%</td><td class="num">7</td>', '<tr><th>Service and parts in Egypt</th><td class="num">15%</td><td class="num">8</td>'),
('<td class="num"><b>6.1</b></td><td class="num"><b>8.0</b></td><td class="num"><b>5.8</b></td>', '<td class="num"><b>6.2</b></td><td class="num"><b>8.0</b></td><td class="num"><b>5.8</b></td>'),
('<td>B and D are built for hot countries. C is a Dutch spec vehicle.</td>', '<td>B and D are built for hot countries. D assumes the heavy duty AC option is ordered.</td>'),
('<td>Sprinter workshop in Hurghada. MAN van service unproven.</td>', '<td>Sprinter workshop in Hurghada. A needs 4x4 parts. MAN van service unproven.</td>'),
('<text x="0" y="28">A · KTW 4x4</text><rect x="26" y="24.5" width="35.4" height="4.6" rx="1" fill="#BBBCBD"/><text x="63" y="28" font-weight="800">6.1</text>',
 '<text x="0" y="28">A · KTW 4x4</text><rect x="26" y="24.5" width="35.8" height="4.6" rx="1" fill="#BBBCBD"/><text x="63.4" y="28" font-weight="800">6.2</text>'),
('<h3>Value index: score per €100k</h3>', '<h3>Value index: quality per €100k</h3>'),
('<text x="0" y="6">B · Hot-Country</text><rect x="26" y="2.5" width="47" height="4.6" rx="1" fill="#000"/><text x="74.5" y="6" font-weight="800">8.6</text>',
 '<text x="0" y="6">B · Hot-Country</text><rect x="26" y="2.5" width="47" height="4.6" rx="1" fill="#000"/><text x="74.5" y="6" font-weight="800">8.0</text>'),
('<text x="0" y="17">D · Allrounder</text><rect x="26" y="13.5" width="26.2" height="4.6" rx="1" fill="#12C0C6"/><text x="54" y="17" font-weight="800">4.8</text>',
 '<text x="0" y="17">D · Allrounder</text><rect x="26" y="13.5" width="29.4" height="4.6" rx="1" fill="#12C0C6"/><text x="57.2" y="17" font-weight="800">5.0</text>'),
('<text x="0" y="28">A · KTW 4x4</text><rect x="26" y="24.5" width="26.2" height="4.6" rx="1" fill="#BBBCBD"/><text x="54" y="28" font-weight="800">4.8</text>',
 '<text x="0" y="28">A · KTW 4x4</text><rect x="26" y="24.5" width="28.8" height="4.6" rx="1" fill="#BBBCBD"/><text x="56.6" y="28" font-weight="800">4.9</text>'),
('<text x="0" y="39">C · MAN TGE</text><rect x="26" y="35.5" width="14.2" height="4.6" rx="1" fill="#BBBCBD"/><text x="42" y="39" font-weight="800">2.6</text>',
 '<text x="0" y="39">C · MAN TGE</text><rect x="26" y="35.5" width="17.6" height="4.6" rx="1" fill="#BBBCBD"/><text x="45.4" y="39" font-weight="800">3.0</text>'),
('Weighted score divided by the middle of each price band. B gives the most ambulance per euro. D and A tie, but D is a full emergency ambulance and A is not.',
 'Score without the price criterion, divided by the middle of each price band, so price is not counted twice. B gives the most ambulance per euro. D edges A and is a full emergency ambulance.'),
('Clinical 35%, price 10%: D 8.4, B 7.6, C 6.4, A 6.0. Price 30%: B 8.5, D 8.0, A 6.1, C 5.2.', 'Clinical 35%, price 10%: D 8.4, B 7.6, C 6.4, A 6.1. Price 30%: B 8.5, D 8.0, A 6.2, C 5.2.'),
('<td>Full emergency ambulance. Same capability as C at a lower price and with local service.</td>', '<td>Full emergency ambulance. Clinical level like C, with mechanical instead of powered loading, a lower price and local service.</td>'),
('<tr><th>Desert, safari camps, beach access</th>', '<tr><th>Desert tracks, safari camps, rough roads</th>'),
('<td>Only factory 4x4 with rough road chassis and underbody guard. B can be ordered 4x4 for less.<sup class="s">5</sup></td>', '<td>Only factory 4x4 with rough road chassis and underbody guard. WAS also lists B as 4x4: get a price.<sup class="s">5</sup></td>'),
('Order B with the 4x4 option before choosing A. A only if two patients off road is a real need.', 'Price B with 4x4 before choosing A. A only if two patients off road is a real need.'),
('<td>Parts and know how for the WAS 300 interior already exist in Egypt.</td>', '<td>Regulators and crews in Egypt know the WAS 300. Confirm that the Cairo partner stocks conversion parts for private buyers.</td>'),
('<li>Heaviest at 5.38 t: more fuel, heavier licence class in many countries.</li>', '<li>Heaviest at 5.38 t: more fuel, tyre and brake wear.</li>'),
('<b>Verdict.</b> Buy only if desert or beach rescue with two patients is a real, regular need.', '<b>Verdict.</b> Buy only if desert track rescue with two patients is a real, regular need.'),
('5,380 kg · score 6.1 · est. €115k to €140k', '5,380 kg · score 6.2 · est. €115k to €140k'),
('<li>Lowest price and best value index (8.6).</li>', '<li>Lowest price and best value index (8.0).</li>'),
('<li>Light, so easy in towns and resort roads. 4x4 now offered.<sup class="s">5</sup></li>', '<li>Light, so easy in towns and resort roads. 4x4 now listed.<sup class="s">5</sup></li>'),
('4,250 kg · score 5.8 · est. €200k to €250k', '4,250 kg · score 5.8 · est. €190k to €240k'),
('<li>Highest price. Value index 2.6, the lowest.</li>', '<li>Highest price. Value index 3.0, the lowest.</li>'),
('<li>Heavy duty AC listed as "possible": make it part of the order.</li>', '<li>Heavy duty AC listed as "possible": make it part of the order. Its heat score assumes this.</li>'),
('<div class="a">Only for desert, safari or beach calls. If yes, order B with the 4x4 option first. A is heavier and costs more for less clinical kit.</div>',
 '<div class="a">Only for desert tracks and safari calls. If yes, price B with 4x4 first. A is heavier and costs more for less clinical fit out. No van of this size works on soft beach sand.</div>'),
('<div class="a">D, the Allrounder, as the emergency ambulance. B, the Hot&#8209;Country Sprinter, for transfers. Combined score 8.2 and 8.0, the top two.</div>',
 '<div class="a">D, the Allrounder, as the emergency ambulance. B, the Hot&#8209;Country Sprinter, for transfers. Scores 8.2 and 8.0, the top two. Also ask WAS to quote two D units: once B gets a stretcher table and 3.88 t, the price gap narrows.</div>'),
('<div class="a">Yes for the Sprinter models. Mercedes-Benz Egypt has an authorised workshop in Hurghada. WAS has a sales partner in Cairo. Confirm the Hurghada site takes Sprinter vans.</div>',
 '<div class="a">The base van, yes: Mercedes-Benz Egypt has an authorised workshop in Hurghada. The ambulance conversion (control panel, roof AC, stretcher table) is WAS work. Require wiring diagrams, diagnostic access and a spare parts kit with delivery.</div>'),
('<div class="a">Not as a standard Euro 6 engine. The quote must state an engine and emission level made for Egyptian fuel. WAS has built 1,000 for Egypt and knows this market.</div>',
 '<div class="a">Not as a standard Euro 6 engine. The quote must state an engine and emission level made for Egyptian fuel. On a two vehicle order WAS may use stock European chassis, so ask how the 2026 Egypt batch was built, or source an Egypt spec chassis locally.</div>'),
("<tr><th>Crew injury on B's manual ramp</th>", "<tr><th>Conversion repairs far from Cairo</th><td class=\"num\"><span class=\"tag warn\">Medium</span></td><td>WAS to supply wiring diagrams, diagnostic access and a spare parts kit: control module, relays, stretcher latches, AC parts.</td></tr>\n      <tr><th>Crew injury on B's manual ramp</th>"),
('<h1>Six risks, each with a control.</h1>', '<h1>Seven risks, each with a control.</h1>'),
('<li>3.88 t chassis. Price for 4x4 as an option.</li>', '<li>3.88 t chassis. Price for 4x4 as an option. Price the same order as a second D.</li>'),
('<li>Ask for warranty, spare parts kit, crew training and delivery date.</li>', '<li>Ask for warranty, conversion spare parts kit, wiring diagrams, crew training and delivery date.</li>'),
('<li>B: datasheet says 3,500 kg and 4x2. WAS website now says 3,880 kg, 4x2 or 4x4.</li>', '<li>B: datasheet says 3,500 kg and 4x2. WAS product page now says 3,880 kg, 4x2 or 4x4.</li>'),
('Research was cross checked by a second, independent AI research model. Claims that could not be confirmed were left out.', 'Research and this report were cross checked by a second, independent AI research model. Its corrections were checked before use. Claims that could not be confirmed were left out.'),
]
apply('report.html', R)

O = [
('D and B score highest, cost about the same together as the most expensive option alone, and both run on the Mercedes Sprinter that Egypt already services.', 'D and B score highest, cost only about 20% more together than the most expensive option alone, and both run on the Mercedes Sprinter that Egypt already services.'),
('<div class="op-meta">Sprinter 315 CDI · 3.88 t · 4x2 or 4x4</div>', '<div class="op-meta">Sprinter 315 CDI · 3.88 t · 4x2, 4x4 listed</div>'),
('<b>Price.</b> Lowest of the four. Best value index: 8.6 points per €100k.', '<b>Price.</b> Lowest of the four. Best value index: 8.0 quality points per €100k.'),
('<b>Price.</b> Same clinical level as the MAN (C) for about €50k less, with local Sprinter service.', '<b>Price.</b> Clinical level like the MAN (C) for about €45k less, with local Sprinter service.'),
('<td class="num"><b>8.2</b></td><td class="num">4.8</td>', '<td class="num"><b>8.2</b></td><td class="num">5.0</td>'),
('<td class="num"><b>8.0</b></td><td class="num">8.6</td>', '<td class="num"><b>8.0</b></td><td class="num">8.0</td>'),
('<td class="num">€115k to €140k</td><td class="num">6.1</td><td class="num">4.8</td>', '<td class="num">€115k to €140k</td><td class="num">6.2</td><td class="num">4.9</td>'),
('<td class="num">€200k to €250k</td><td class="num">5.8</td><td class="num">2.6</td>', '<td class="num">€190k to €240k</td><td class="num">5.8</td><td class="num">3.0</td>'),
('* Value = score per €100k at the middle of the price band.', '* Value = score without the price criterion, per €100k at the middle of the price band.'),
('<li><b>Together €230k to €295k</b>, about the price of one MAN (C). Landed in Egypt about €273k to €350k.</li>', '<li><b>Together €230k to €295k</b>, about 20% more than one MAN (C). Landed in Egypt about €273k to €350k.</li>'),
('Heaviest at 5.38 t. Only for desert work. B can be ordered 4x4 for less.', 'Heaviest at 5.38 t. Only for desert tracks. WAS also lists B as 4x4.'),
('3. Firm WAS quotes, delivery date and warranty.', '3. Firm WAS quotes, conversion spare parts, delivery date and warranty.'),
]
apply('onepage.html', O)

E = [
('<div class="figs"><div><b>€200k to €250k</b>', '<div class="figs"><div><b>€190k to €240k</b>'),
('<td class="n">7</td><td class="n">5 · 9</td><td style="white-space:nowrap;padding-left:3mm"><span class="bar g" style="width:15.1mm"></span>6.1</td>', '<td class="n">8</td><td class="n">5 · 9</td><td style="white-space:nowrap;padding-left:3mm"><span class="bar g" style="width:15.5mm"></span>6.2</td>'),
('Value view (price 20%): D 8.2, B 8.0, A 6.1, C 5.8.', 'Value view (price 20%): D 8.2, B 8.0, A 6.2, C 5.8.'),
('<h2>About €120k to €145k more than the value pair.</h2>', '<h2>About €110k to €135k more than the value pair.</h2>'),
('<b>Quality pair, D + C.</b> €350k to €440k ex works. About €415k to €521k landed', '<b>Quality pair, D + C.</b> €340k to €430k ex works. About €403k to €510k landed'),
]
apply('elite.html', E)
