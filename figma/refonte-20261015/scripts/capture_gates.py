"""Gate checks of the full recapture (18 Oct. 2026, audit plan, step 12), read-only on the dumps of ../dom and ../reference.

  python3 capture_gates.py [area ...]      (default: every area)

A. every capture record of the area was made with the current capture_lib.py (variants.LIB) and its dump exists;
B. U+202F (narrow no-break space) kept in the texts: dumps that hold one;
C. clock: the texts of <time> elements are the same in fr-light and fr-dark of a state, and EN/AR show the same hh:mm;
D. light/dark geometry: boxes that move by more than 0.5 px between fr-light and fr-dark of a state (expected: only the
   states built from their dark capture, layout.DARK_RENDER, and project-comments-thread mobile);
E. docked globe: content states (app[data-section] set, outside Explorer) must have app[data-globe-docked="true"];
F. resize recorded on every <textarea>.
"""
import collections, gzip, hashlib, json, pathlib, re, sys

BASE = pathlib.Path('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015')
DOM, REF = BASE / 'dom', BASE / 'reference'
LIB = hashlib.sha256((BASE / 'scripts' / 'capture_lib.py').read_bytes()).hexdigest()[:12]
sys.path.insert(0, str(BASE / 'scripts'))
try:
    import layout
    DARK = getattr(layout, 'DARK_RENDER', {})
except Exception as e:   # noqa: BLE001
    DARK = {}
    print('layout.DARK_RENDER not read:', e)
AREAS = ['shell', 'projects', 'profiles', 'journal', 'explorer']


def load(p):
    return json.loads(gzip.decompress(p.read_bytes()))


def parse(name):
    st, fmt, var = name.split('--')[:3]
    lang, theme = var.split('-')
    return st, fmt, lang, theme


def main(areas):
    for area in areas:
        print('=' * 20, area)
        idx = json.loads((REF / area / 'index.json').read_text())
        recs = [r for r in idx['states'] if r.get('pass') == 'variants-20261015']
        stale = [r['name'] for r in recs if r.get('lib') != LIB]
        missing = [r['name'] for r in recs if not (DOM / area / (r['name'] + '.json.gz')).exists()]
        print('A. records %d, old capture_lib %d%s, dumps missing %d%s' % (len(recs), len(stale), (' ' + ', '.join(stale[:6]) + ('…' if len(stale) > 6 else '')) if stale else '',
                                                                       len(missing), (' ' + ', '.join(missing[:6])) if missing else ''))
        dumps = {}
        for p in sorted((DOM / area).glob('*--*--*.json.gz')):
            dumps[p.name[:-len('.json.gz')]] = p
        nn, times, boxes, docked, grips = [], {}, {}, [], []
        for name, p in dumps.items():
            try:
                st, fmt, lang, theme = parse(name)
            except ValueError:
                continue
            d = load(p)
            nodes = d['nodes']
            if any(' ' in (n.get('text') or '') for n in nodes):
                nn.append(name)
            times[name] = [n.get('text') for n in nodes if n.get('tag') == 'time']
            boxes[name] = {n['k']: (n['x'], n['y'], n['w'], n['h']) for n in nodes if 'k' in n}
            app = next((n for n in nodes if n.get('id') == 'app'), {})
            # the Explorer page itself (data-section explore, e.g. the member screens of the shell area) keeps its globe undocked
            if app.get('data-section') and app.get('data-section') != 'explore' and area != 'explorer' and app.get('data-globe-docked') != 'true':
                docked.append(name)
            for n in nodes:
                if n.get('tag') == 'textarea' and 'resize' not in n:
                    grips.append(name); break
        print('B. U+202F in %d dumps: %s' % (len(nn), ', '.join(sorted(nn)) or '—'))
        bad = []
        for name, t in times.items():
            st, fmt, lang, theme = parse(name)
            if lang == 'fr' and theme == 'light' and t:
                other = times.get('%s--%s--fr-dark' % (st, fmt))
                if other is not None and other != t:
                    bad.append('%s/%s fr: %s ≠ %s' % (st, fmt, t[:3], other[:3]))
                hm = sorted(set(re.findall(r'\d{1,2}[:h]\d{2}', ' '.join(x or '' for x in t))))
                for lg in ('en', 'ar'):
                    o = times.get('%s--%s--%s-light' % (st, fmt, lg))
                    if o:
                        hm2 = sorted(set(re.findall(r'\d{1,2}[:h]\d{2}', ' '.join(x or '' for x in o).translate(str.maketrans('٠١٢٣٤٥٦٧٨٩', '0123456789')))))
                        if hm2 and hm and [h.replace('h', ':').zfill(5) for h in hm] != [h.replace('h', ':').zfill(5) for h in hm2]:
                            bad.append('%s/%s %s: %s ≠ %s' % (st, fmt, lg, hm, hm2))
        print('C. clock: %s' % ('; '.join(bad) if bad else 'ok (%d dumps with <time>)' % sum(1 for t in times.values() if t)))
        moved = []
        for name, b in boxes.items():
            st, fmt, lang, theme = parse(name)
            if lang == 'fr' and theme == 'light':
                o = boxes.get('%s--%s--fr-dark' % (st, fmt))
                if o is None:
                    continue
                n = sum(1 for k, v in b.items() if k in o and max(abs(v[i] - o[k][i]) for i in range(4)) > 0.5)
                if n:
                    moved.append('%s/%s %d%s' % (st, fmt, n, ' (DARK_RENDER)' if (area, st) in DARK or st in (DARK.get(area) or ()) else ''))
        print('D. light/dark geometry: %s' % ('; '.join(moved) if moved else 'identical'))
        print('E. content states without the docked globe: %s' % (', '.join(docked) or '—'))
        print('F. <textarea> without resize: %s' % (', '.join(grips) or '—'))


if __name__ == '__main__':
    main(sys.argv[1:] or AREAS)
