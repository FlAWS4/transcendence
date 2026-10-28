"""Shared loader for the profiles verification helpers (sections profile-projects, profile-journey, profile-contribution,
message-dialog, report; read-only on sources, 18 Oct. 2026). Same box and scale as section_frames.py (40-unit export
margin, one scale from the longer side) and the same reference choice (full capture when the frame is taller than the
screen, else the screen capture, with scrollY)."""
import gzip, json, pathlib
from PIL import Image
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
AREA = 'profiles'

def load(sid, fi, src_override=None):
    lay = json.loads((BASE / 'layouts' / f'{AREA}.json').read_text())
    sec = next(s for s in lay['sections'] if s['id'] == sid)
    frames = [f for row in sec['rows'] for f in row]
    f = frames[fi]
    fig = Image.open(BASE / 'call-results' / f'{AREA}-{sid}-v3.png').convert('RGB')
    kx, ky = fig.width / (sec['w'] + 80), fig.height / (sec['h'] + 80)
    k = kx if fig.width >= fig.height else ky
    ox = oy = 40 * k
    name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
    full = BASE / 'reference' / AREA / f'{name}--full.png'
    vp = BASE / 'reference' / AREA / f'{name}.png'
    src = full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp
    if src_override: src = pathlib.Path(src_override)
    site = Image.open(src).convert('RGB') if src.exists() else None
    sy = 0.0
    if src == vp:
        dump = BASE / 'dom' / AREA / f'{name}.json.gz'
        if dump.exists():
            dd = json.loads(gzip.decompress(dump.read_bytes()))
            sy = float((dd.get('scroll') or [0, 0])[1] or 0)
            if sy <= 0.5: sy = 0.0
    return dict(sec=sec, f=f, fig=fig, k=k, ox=ox, oy=oy, name=name, src=src, site=site, sy=sy, frames=frames)

def figma_crop(c, x, y, w, h, W, H):
    k = c['k']; x0, y0 = c['ox'] + (c['f']['x'] + x) * k, c['oy'] + (c['f']['y'] + y) * k
    return c['fig'].transform((W, H), Image.Transform.EXTENT, (x0, y0, x0 + w * k, y0 + h * k), Image.Resampling.BICUBIC)

def site_crop(c, x, y, w, h, W, H):
    site = c['site']; dpr = site.width / c['f']['w']; sy = c['sy']
    box = (round(x * dpr), round((y - sy) * dpr), round((x + w) * dpr), round((y - sy + h) * dpr))
    return site.crop(box).resize((W, H), Image.LANCZOS)
