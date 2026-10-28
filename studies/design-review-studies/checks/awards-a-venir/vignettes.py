"""Trial awards-a-venir: 16:10 centre crops of the mobile captures for the gallery card (no Chrome).
The card shows the top of each capture, where Awards looks identical with and without the trial.
Run after check.py: python3 -I studies/design-review-studies/checks/awards-a-venir/vignettes.py"""
import json
from pathlib import Path
from PIL import Image
HERE = Path(__file__).resolve().parent
results = json.loads((HERE / 'results.json').read_text())
view = next(v for v in results['views'] if v['vue'] == 'mobile')
box, (width, height), scale = view['contentBox'], view['viewport'], 2
cx, cy = width / 2, box['y'] + box['h'] / 2
w, h = 320, 200  # CSS px, 16:10, the whole note with a margin
crop = tuple(round(v * scale) for v in (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2))
for side in ('avant', 'apres'):
    Image.open(HERE / f'{side}-mobile.png').crop(crop).save(HERE / f'{side}-centre-mobile.png')
print('crop (device px)', crop)
