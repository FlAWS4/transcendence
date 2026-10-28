"""Shared helpers for the profiles checks (verification only; reads sources, writes nothing outside verification/profiles).
Same box and scale as scripts/section_frames.py (v3: 40-unit export margin, one scale from the longer side)."""
import gzip, json, pathlib
from PIL import Image
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
AREA = 'profiles'

def load(sid, fi, fig_png=None):
    lay = json.loads((BASE / 'layouts' / f'{AREA}.json').read_text())
    sec = next(s for s in lay['sections'] if s['id'] == sid)
    frames = [f for row in sec['rows'] for f in row]
    f = frames[fi]
    fig = Image.open(fig_png or (BASE / 'call-results' / f'{AREA}-{sid}-v3.png')).convert('RGB')
    kx, ky = fig.width / (sec['w'] + 80), fig.height / (sec['h'] + 80)
    k = kx if fig.width >= fig.height else ky
    o = 40 * k
    name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
    full = BASE / 'reference' / AREA / f'{name}--full.png'
    vp = BASE / 'reference' / AREA / f'{name}.png'
    src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
    site = Image.open(src).convert('RGB')
    dpr = site.width / f['w']
    return dict(sec=sec, f=f, fig=fig, k=k, o=o, name=name, src=src, site=site, dpr=dpr, frames=frames)

def dom(name, light_fallback=True):
    p = BASE / 'dom' / AREA / f'{name}.json.gz'
    if not p.exists() and light_fallback:
        p = BASE / 'dom' / AREA / (name.rsplit('-', 1)[0] + '-light.json.gz')
    return json.load(gzip.open(p)), p.name
