"""Text styles with tabular figures the user makes by hand in Figma (18 October 2026).

The site sets font-variant-numeric: tabular-nums on some texts (campus sheet, comments, media viewer, profiles, street
map). The Plugin API cannot turn on the OpenType feature tnum (openTypeFeatures is read-only, a text style has no such
field): the user chose to create these styles in Figma himself, and render.js applies them by name (« … · chiffres
tabulaires »), never creating them. This script converts every scene of the layouts, keeps the texts marked « tn » by
dom2fig, and lists the styles they need with their settings, as render.js names them (tsName).

  python3 tabular_styles.py            → ../tabular-styles.json and ../STYLES-CHIFFRES-TABULAIRES.md
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
BASE = HERE.parent
sys.path.insert(0, str(HERE))
import dom2fig  # noqa: E402
import layout  # noqa: E402


def r2(v):
    return round(v * 100) / 100


def ts_name(fam, style, fs, lh, ls, tc):
    """Same name as render.js tsName()."""
    cat = ('Arabe' if fam == 'Noto Sans Arabic' else 'Code' if fam in ('IBM Plex Mono', 'Cousine') else
           'Titres' if fs >= 24 else 'Sous-titres' if fs >= 18 else 'Corps' if fs >= 15 else 'Libellés' if fs >= 13 else 'Petits')
    num = lambda v: ('%g' % r2(v))
    n = cat + '/' + num(fs) + ' · ' + style + (' · ' + num(lh) if lh else '') + ((' · ' + ('+' if ls > 0 else '') + num(ls)) if ls else '')
    return n + (' · capitales' if tc == 'UPPER' else '')


def main():
    found = {}
    for lf in sorted((BASE / 'layouts').glob('*.json')):
        lay = json.loads(lf.read_text())
        area = lay.get('area', lf.stem)
        seen = set()
        for s in lay['sections']:
            for row in s['rows']:
                for f in row:
                    if f['theme'] != 'light' and not layout.dark_render(area, f):
                        continue
                    key = (area, f['state'], f['fmt'], f['lang'], f['theme'])
                    if key in seen:
                        continue
                    seen.add(key)
                    full = f['h'] > (844 if f['fmt'] == 'mobile' else 960) + 4
                    try:
                        scene, _ = dom2fig.convert(area, f['state'], f['fmt'], f['lang'], full, theme=f['theme'])
                    except Exception as e:   # a missing capture: reported, not fatal
                        print('  skip', key, repr(e)[:100], file=sys.stderr)
                        continue

                    def walk(nodes):
                        for n in nodes:
                            if n.get('t') == 'T' and n.get('tn'):
                                fn = n['fn']
                                name = ts_name(fn[0], fn[1], n['fs'], n.get('lh'), n.get('ls') or 0, n.get('tc')) + ' · chiffres tabulaires'
                                e = found.setdefault(name, {'family': fn[0], 'style': fn[1], 'size': n['fs'], 'lineHeight': n.get('lh'),
                                                            'letterSpacing': n.get('ls') or 0, 'textCase': n.get('tc'), 'texts': 0, 'examples': [], 'frames': []})
                                e['texts'] += 1
                                if len(e['examples']) < 4 and n['tx'] not in e['examples']:
                                    e['examples'].append(n['tx'][:40])
                                fr = f['name']
                                if fr not in e['frames']:
                                    e['frames'].append(fr)
                            walk(n.get('ch') or [])
                    walk(scene['ch'])
    (BASE / 'tabular-styles.json').write_text(json.dumps(found, ensure_ascii=False, indent=1))
    lines = ['# Styles « chiffres tabulaires » à créer dans Figma', '',
             'Le site affiche certains nombres en chiffres tabulaires (`font-variant-numeric: tabular-nums`). L’API de Figma ne sait pas '
             'activer cette option ; chaque style ci-dessous est donc à créer à la main dans le fichier « 42 Horizon — Maquettes '
             '(octobre 2026) », sous **exactement** ce nom, avec ces réglages et, dans les détails du texte (Type details → Numbers), '
             '**Tabular figures**. Le moteur les appliquera ensuite par leur nom.', '',
             '| Nom exact du style | Police | Taille | Interligne | Interlettrage | Casse | Textes | Exemples |', '|---|---|---|---|---|---|---|---|']
    for name, e in sorted(found.items()):
        lines.append('| `%s` | %s %s | %s px | %s | %s | %s | %d | %s |' % (
            name, e['family'], e['style'], ('%g' % r2(e['size'])), ('%g px' % r2(e['lineHeight'])) if e['lineHeight'] else 'Auto',
            ('%g px' % r2(e['letterSpacing'])) if e['letterSpacing'] else '0', 'Capitales' if e['textCase'] == 'UPPER' else '—',
            e['texts'], ' ; '.join('« %s »' % x for x in e['examples'])))
    (BASE / 'STYLES-CHIFFRES-TABULAIRES.md').write_text('\n'.join(lines) + '\n')
    print(len(found), 'styles,', sum(e['texts'] for e in found.values()), 'texts')
    for name, e in sorted(found.items()):
        print('  %-60s %3d textes  %s' % (name, e['texts'], e['examples'][:2]))


if __name__ == '__main__':
    main()
