"""Frame-by-frame comparison of a whole page from its section exports (Figma rebuild, 18 October 2026, full pass).

  python3 verify_page.py <area> <dir of section exports> <out dir>
The exports are named <section id>.png (get_screenshot of the section node, longer side = section side + 80, i.e. scale 1).
Runs section_frames.py on each section (boards and index.json in <out dir>/<section id>/), then writes <out dir>/index.json
(every frame with its section and metrics) and prints the frames sorted by mean error, the frames missing an export and
those whose capture is missing. Frames held for the tabular-figure styles (tabular-styles.json) and their dark versions
are marked « tenu »: their Figma frame is still the render made before the full pass.
"""
import json, pathlib, subprocess, sys
from figlib import BASE


def main(area, src, out):
    src, out = pathlib.Path(src), pathlib.Path(out)
    out.mkdir(parents=True, exist_ok=True)
    lay = json.loads((BASE / 'layouts' / f'{area}.json').read_text())
    tab = json.loads((BASE / 'tabular-styles.json').read_text())
    held = set()
    for e in tab.values():
        held.update(e['frames'])
    rows_all = [f for s in lay['sections'] for r in s['rows'] for f in r]
    hk = {(f['state'], f['fmt'], f['lang']) for f in rows_all if f['theme'] == 'light' and f['name'] in held}
    rows, absent = [], []
    for s in lay['sections']:
        png = src / f"{s['id']}.png"
        if not png.exists():
            absent.append(s['id'])
            continue
        r = subprocess.run([sys.executable, '-B', str(BASE / 'scripts' / 'section_frames.py'), area, s['id'], str(png), str(out / s['id'])],
                           capture_output=True, text=True, cwd=BASE / 'scripts')
        if r.returncode:
            print('section %s: %s' % (s['id'], r.stderr.strip()[-400:]))
            continue
        for row in json.loads((out / s['id'] / 'index.json').read_text()):
            f = next(x for x in rows_all if x['name'] == row['frame'])
            row['section'] = s['id']
            row['tenu'] = (f['state'], f['fmt'], f['lang']) in hk
            rows.append(row)
    (out / 'index.json').write_text(json.dumps(rows, ensure_ascii=False, indent=1))
    key = lambda r: -(sum(r.get('meanRGB') or [0]) / 3)
    print('%d cadres comparés, sections sans export : %s' % (len(rows), absent or 'aucune'))
    for r in sorted(rows, key=key):
        m = r.get('meanRGB')
        print('%-7s %-5s changed %-7s mean %-18s off12 %-7s %s' % (r['section'][:7], 'tenu' if r['tenu'] else '', r.get('changed'), m, r.get('channelOff12'),
                                                                 r['frame'] + ('' if r.get('board') else '  (pas de capture du site)')))


if __name__ == '__main__':
    main(*sys.argv[1:4])
