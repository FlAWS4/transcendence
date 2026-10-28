"""Difference map of one frame (v5 helper): python3 diffmap5.py <section> <frame idx> <out png> [--dy N] [--h H] [--ref ...]
Site and Figma at the board scale (CSS px), |difference| amplified, plus the bounding boxes of the clusters of changed
pixels (> 40 levels) listed on stdout, largest first."""
import json, sys, pathlib
from PIL import Image, ImageChops, ImageDraw, ImageFilter
BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
args = sys.argv[1:]; opt = {}
for o in ('--dy', '--h', '--ref'):
    if o in args:
        i = args.index(o); opt[o] = args[i + 1]; del args[i:i + 2]
sid, fi, outp = args[0], int(args[1]), args[2]
dy = float(opt.get('--dy', 0))
lay = json.loads((BASE / 'layouts' / 'projects.json').read_text())
sec = next(s for s in lay['sections'] if s['id'] == sid)
f = [f for row in sec['rows'] for f in row][fi]
fig = Image.open(BASE / 'call-results' / f'projects-{sid}-v5.png').convert('RGB')
k = fig.width / (sec['w'] + 80) if fig.width >= fig.height else fig.height / (sec['h'] + 80)
name = f"{f['state']}--{f['fmt']}--{f['lang']}-{f['theme']}"
full = BASE / 'reference' / 'projects' / f'{name}--full.png'; vp = BASE / 'reference' / 'projects' / f'{name}.png'
ref = opt.get('--ref')
src = vp if ref == 'vp' else full if ref == 'full' else pathlib.Path(ref) if ref else (full if (full.exists() and f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4) else vp)
site = Image.open(src).convert('RGB')
W = int(f['w']); Hs = int(round(site.height * W / site.width)); H = int(float(opt.get('--h', min(Hs, f['h']))))
site = site.resize((W, Hs), Image.LANCZOS).crop((0, 0, W, H))
ox, oy = 40 * k + f['x'] * k, 40 * k + (f['y'] + dy) * k
crop = fig.transform((W, H), Image.Transform.EXTENT, (ox, oy, ox + W * k, oy + H * k), Image.Resampling.BICUBIC)
# compare at the export scale (blur the site like the export) to avoid flagging text sharpness
sk = site.resize((max(1, int(W * k)), max(1, int(H * k))), Image.LANCZOS).resize((W, H), Image.BICUBIC)
diff = ImageChops.difference(sk, crop).convert('L')
mask = diff.point(lambda v: 255 if v > 40 else 0).filter(ImageFilter.MaxFilter(9))
amp = diff.point(lambda v: min(255, v * 4))
board = Image.new('RGB', (W * 3 + 40, H), (60, 60, 60))
board.paste(sk, (0, 0)); board.paste(crop, (W + 20, 0)); board.paste(Image.merge('RGB', (amp, amp.point(lambda v: v // 3), amp.point(lambda v: v // 3))), (2 * W + 40, 0))
board.save(outp)
# clusters
import collections
px = mask.load(); seen = set(); boxes = []
for y in range(0, H, 3):
    for x in range(0, W, 3):
        if px[x, y] and (x, y) not in seen:
            q = collections.deque([(x, y)]); seen.add((x, y)); x0 = x1 = x; y0 = y1 = y; n = 0
            while q:
                cx, cy = q.popleft(); n += 1
                x0, x1, y0, y1 = min(x0, cx), max(x1, cx), min(y0, cy), max(y1, cy)
                for nx, ny in ((cx + 3, cy), (cx - 3, cy), (cx, cy + 3), (cx, cy - 3)):
                    if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen and px[nx, ny]:
                        seen.add((nx, ny)); q.append((nx, ny))
            boxes.append((n, x0, y0, x1, y1))
boxes.sort(reverse=True)
print(outp, 'src', src.name, 'k=%.3f' % k)
for b in boxes[:12]:
    print('  cluster n=%d  x %d-%d  y %d-%d' % b)
