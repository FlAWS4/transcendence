"""Planche de contrôle : zone de la barre de périmètre (« Monde » / « العالم ») des 16 cadres, site | Figma.
Vérification Chroniques v5, 18 octobre 2026."""
import json, pathlib, subprocess, sys
from PIL import Image, ImageDraw
V5 = pathlib.Path(__file__).resolve().parent.parent
BASE = V5.parents[2]
lay = json.loads((BASE / 'layouts/journal.json').read_text())
tiles = []
for sid in ('journal', 'article'):
    sec = next(s for s in lay['sections'] if s['id'] == sid)
    for row in sec['rows']:
        for f in row:
            if f['fmt'] == 'mobile':
                box = (60, 60, 330, 150)
            else:
                box = (560, 25, 880, 150) if sid == 'journal' else (560, 20, 880, 110)
            out = V5 / '_zoom' / ('_scope_%s_%s_%s_%s.png' % (sid, f['fmt'], f['lang'], f['theme']))
            subprocess.run([sys.executable, str(V5 / '_outils/zoom.py'), sid, f['name'], *map(str, box), '1.6', str(out)], check=True, capture_output=True)
            tiles.append((sid + ' · ' + f['name'], Image.open(out)))
W = max(t.width for _, t in tiles); H = sum(t.height + 26 for _, t in tiles)
sheet = Image.new('RGB', (W, H), (40, 40, 40)); d = ImageDraw.Draw(sheet); y = 0
for name, t in tiles:
    d.text((6, y + 7), name, fill=(255, 220, 120)); sheet.paste(t, (0, y + 26)); y += t.height + 26
sheet.save(V5 / '_zoom' / 'barre_perimetre_16_cadres.png'); print(sheet.size)
