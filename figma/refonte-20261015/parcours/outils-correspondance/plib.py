"""Outils de lecture pour la correspondance des parcours (lecture seule)."""
import json, gzip, re, pathlib

REF = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
SITEMAP = pathlib.Path('/home/le-rif/Bureau/Transcendence/docs/site-map/site-map-data.js')


# ---------------------------------------------------------------- JS literal parser (site-map-data.js)
def parse_js_literal(src):
    i = 0
    n = len(src)

    def ws():
        nonlocal i
        while i < n:
            c = src[i]
            if c in ' \t\r\n':
                i += 1
            elif src.startswith('//', i):
                j = src.find('\n', i)
                i = n if j < 0 else j + 1
            elif src.startswith('/*', i):
                j = src.find('*/', i)
                i = n if j < 0 else j + 2
            else:
                break

    def value():
        nonlocal i
        ws()
        c = src[i]
        if c == '{':
            i += 1
            obj = {}
            while True:
                ws()
                if src[i] == '}':
                    i += 1
                    return obj
                key = key_()
                ws()
                assert src[i] == ':', (i, src[i - 40:i + 40])
                i += 1
                obj[key] = value()
                ws()
                if src[i] == ',':
                    i += 1
                elif src[i] == '}':
                    pass
                else:
                    raise ValueError((i, src[i - 40:i + 40]))
        if c == '[':
            i += 1
            arr = []
            while True:
                ws()
                if src[i] == ']':
                    i += 1
                    return arr
                arr.append(value())
                ws()
                if src[i] == ',':
                    i += 1
        if c in '\'"':
            return string()
        m = re.match(r'-?\d+(\.\d+)?', src[i:])
        if m:
            i += len(m.group(0))
            return float(m.group(0)) if '.' in m.group(0) else int(m.group(0))
        for lit, v in (('true', True), ('false', False), ('null', None)):
            if src.startswith(lit, i):
                i += len(lit)
                return v
        raise ValueError((i, src[i - 40:i + 40]))

    def string():
        nonlocal i
        q = src[i]
        i += 1
        out = []
        while src[i] != q:
            if src[i] == '\\':
                nx = src[i + 1]
                out.append({'n': '\n', 't': '\t'}.get(nx, nx))
                i += 2
            else:
                out.append(src[i])
                i += 1
        i += 1
        return ''.join(out)

    def key_():
        nonlocal i
        if src[i] in '\'"':
            return string()
        m = re.match(r'[A-Za-z_$][\w$]*', src[i:])
        i += len(m.group(0))
        return m.group(0)

    return value()


def site_map():
    src = SITEMAP.read_text()
    j = src.index('window.HORIZON_SITE_MAP')
    j = src.index('=', j) + 1
    return parse_js_literal(src[j:])


# ---------------------------------------------------------------- layouts
def frames(lang='fr', theme='light'):
    out = []
    for f in sorted((REF / 'layouts').glob('*.json')):
        d = json.loads(f.read_text())
        for s in d['sections']:
            for r in s['rows']:
                for c in r:
                    if c['lang'] == lang and c['theme'] == theme:
                        out.append(dict(c, area=d['area'], key=d['key'], page=d['page'], section=s['id']))
    return out


def ledger_ids():
    d = json.loads((REF / 'figma-ledger.json').read_text())
    ids = {}
    for page, v in d['frames'].items():
        for name, nid in v.items():
            ids[(page, name)] = nid
    return ids


# ---------------------------------------------------------------- DOM + frame geometry
class Frame:
    def __init__(self, f):
        self.f = f
        self.area, self.state, self.fmt = f['area'], f['state'], f['fmt']
        p = REF / 'dom' / self.area / f"{self.state}--{self.fmt}--fr-light.json.gz"
        self.path = p
        self.d = json.loads(gzip.decompress(p.read_bytes()))
        self.vw, self.vh = self.d['viewport']
        self.sy = float((self.d.get('scroll') or [0, 0])[1] or 0)
        self.W, self.Hf = f['w'], f['h']
        self.full = f['h'] > (844 if self.fmt == 'mobile' else 960) + 4
        dh = self.d['doc'][1]
        self.H = max(dh, self.vh) if self.full else self.vh
        self.nodes = self.d['nodes']
        self.byI = {n['i']: n for n in self.nodes}
        self.kids = {}
        for n in self.nodes:
            self.kids.setdefault(n['p'], []).append(n)
        self.meta = self.d.get('meta') or {}
        self._shift = {}
        for n in self.nodes:   # nodes are in document order: parents first
            self._shift[n['i']] = self._compute_shift(n)

    def _fixed_y(self, n, y):
        pos = n.get('s', {}).get('position')
        if not self.full or pos not in ('fixed', 'sticky'):
            return y
        sy, vh, H = self.sy, self.vh, self.H
        if pos == 'fixed':
            yv = y - sy
            return yv + (H - vh) if (H > vh and yv > vh / 2) else yv
        if sy <= 0.5:
            return y
        return y - sy if y - sy <= vh / 4 else y   # (inflow case not replicated: full frames are never scrolled)

    def _compute_shift(self, n):
        par = self._shift.get(n['p'], 0.0)
        yf = self._fixed_y(n, n['y'])
        return (yf - n['y']) if yf != n['y'] else par

    def box(self, n):
        """Box of node n in frame coordinates."""
        oy = 0 if self.full else self.sy
        return [round(n['x'], 2), round(n['y'] + self._shift[n['i']] - oy, 2), round(n['w'], 2), round(n['h'], 2)]

    def ancestors(self, n):
        out = []
        p = n['p']
        while p != -1 and p in self.byI:
            out.append(self.byI[p])
            p = self.byI[p]['p']
        return out

    def clip_box(self, n):
        """Visible part of n: intersection with clipping ancestors and the frame; None if empty or hidden."""
        x, y, w, h = self.box(n)
        x0, y0, x1, y1 = x, y, x + w, y + h
        for a in self.ancestors(n):
            cls = (a.get('cls') or '').split()
            if a['tag'] == 'details' and not a.get('open') and n['tag'] != 'summary':
                # content of a closed <details> is not drawn (except its summary subtree)
                summ = [c for c in self.kids.get(a['i'], []) if c['tag'] == 'summary']
                if not any(s['i'] == n['i'] or s in self.ancestors(n) for s in summ):
                    return None
            ov = (a.get('s', {}).get('overflow') or '').split(' ')[0]
            if ov in ('hidden', 'clip', 'auto', 'scroll'):
                ax, ay, aw, ah = self.box(a)
                x0, y0, x1, y1 = max(x0, ax), max(y0, ay), min(x1, ax + aw), min(y1, ay + ah)
        x0, y0, x1, y1 = max(x0, 0), max(y0, 0), min(x1, self.W), min(y1, self.Hf)
        if x1 - x0 < 1 or y1 - y0 < 1:
            return None
        return [round(x0, 2), round(y0, 2), round(x1 - x0, 2), round(y1 - y0, 2)]

    def text(self, n):
        return ' '.join(r['t'] for r in n.get('runs') or []) or n.get('text') or ''

    def deep_text(self, n, limit=400):
        out = []
        stack = [n]
        while stack:
            m = stack.pop(0)
            t = ' '.join(r['t'] for r in m.get('runs') or [])
            if t:
                out.append(t)
            stack = self.kids.get(m['i'], []) + stack
        return ' '.join(out)[:limit]

    def is_hidden_cls(self, n):
        cls = (n.get('cls') or '').split()
        return any(c in ('sr-only', 'visually-hidden', 'screen-reader-text') for c in cls)


# ---------------------------------------------------------------- scenes (what the converter sent to Figma)
class Scene:
    def __init__(self, area, state, fmt, lang='fr'):
        p = REF / 'scenes' / f'{area}--{state}--{fmt}--{lang}.json'
        self.path = p
        self.ok = p.exists()
        self.items = []
        if not self.ok:
            return
        d = json.loads(p.read_text())
        self.w, self.h = d.get('w'), d.get('h')

        def walk(n, ox, oy, path):
            x, y = ox + float(n.get('x', 0) or 0), oy + float(n.get('y', 0) or 0)
            nm = n.get('n') or (n.get('tx') if n.get('t') == 'T' else '') or ''
            item = {'t': n.get('t'), 'n': nm, 'tx': n.get('tx'), 'x': x, 'y': y, 'w': float(n.get('w', 0) or 0), 'h': float(n.get('h', 0) or 0),
                    'path': path + [nm], 'dom': n.get('dom'), 'v': n.get('v'), 'c': n.get('c') if n.get('t') == 'C' else None}
            self.items.append(item)
            for c in n.get('ch') or []:
                walk(c, x, y, path + [nm])
        for c in d.get('ch') or []:
            walk(c, 0.0, 0.0, [])

    def match(self, box, tol=1.5):
        """Scene nodes whose absolute box equals box within tol px (frames, components, texts)."""
        x, y, w, h = box
        out = []
        for it in self.items:
            if it['t'] == 'T':
                continue
            if abs(it['x'] - x) <= tol and abs(it['y'] - y) <= tol and abs(it['w'] - w) <= tol and abs(it['h'] - h) <= tol:
                out.append(it)
        return out

    def inside(self, box, tol=1.5):
        """Scene nodes (any type) lying within box."""
        x, y, w, h = box
        return [it for it in self.items if it['x'] >= x - tol and it['y'] >= y - tol and it['x'] + it['w'] <= x + w + tol and it['y'] + it['h'] <= y + h + tol]
