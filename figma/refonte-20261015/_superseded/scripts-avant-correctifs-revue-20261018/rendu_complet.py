"""Full render of the « passe complète » (18 October 2026): the offline steps in their order, with the Figma sends between
them (couriers, scripts/courier-workflow.js). Each step prints the calls it wrote.

  python3 rendu_complet.py plan        → layouts/<key>.json again (English rows, screen-high frames) for every page
  python3 rendu_complet.py sections    → section calls (new sections of the English rows, sizes); then layout.py record
  python3 rendu_complet.py library     → components collect, library and library calls (simulated); then components.py record
  python3 rendu_complet.py scenes      → per page: text-variable calls first, then the screen calls (instances where the
                                         library is recorded), then the dark clones
  python3 rendu_complet.py chains      → courier chains of the calls written since a given number (argument)

The pages and their states are those of the current layouts (layouts/*.json): the same states are planned again.
"""
import json
import pathlib
import re
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
BASE = HERE.parent
sys.path.insert(0, str(HERE))


def keys():
    """key → (area, page key, states) from the current layouts."""
    out = {}
    for lf in sorted((BASE / 'layouts').glob('*.json')):
        lay = json.loads(lf.read_text())
        states = sorted({f['state'] for s in lay['sections'] for r in s['rows'] for f in r})
        out[lay.get('key') or lf.stem] = (lay.get('area') or lf.stem, lay['page'], states)
    return out


def plan():
    import layout
    for key, (area, page, states) in keys().items():
        layout.plan(area, page, key if key != area else None, states)


def sections():
    import layout
    for key in keys():
        layout.sections_call(key)


def library():
    import components
    components.collect()
    components.build_library()
    for f in components.library_calls():
        print(f)


def scenes(only=None):
    import components
    import layout
    led = json.loads((BASE / 'figma-ledger.json').read_text())
    if (led.get('components') or {}).get('library'):
        components.MODE = 'emit'   # instances of the recorded library variants
    for key in keys():
        if only and key not in only:
            continue
        layout.scenes(key)
        layout.dark(key)


def chains(since):
    """Strings calls first (one chain, in order), then one chain per page for its screen calls (split calls of one screen
    stay in order), the dark clones of a page last in its chain."""
    calls = sorted(p.name for p in (BASE / 'calls').glob('*.js') if int(p.name.split('-')[0]) >= since)
    strings = [c for c in calls if '-variables-textes' in c]
    pages = {}
    for c in calls:
        if c in strings:
            continue
        text = (BASE / 'calls' / c).read_text()
        m = re.search(r'"page":"([^"]+)"', text) or re.search(r"getNodeByIdAsync\('([^']+)'\)", text)
        pages.setdefault(m.group(1) if m else '?', []).append(c)
    out = [[{'file': c} for c in strings]] if strings else []
    for page, cs in pages.items():
        cs.sort(key=lambda c: ('-dark-' in c, c))
        out.append([{'file': c} for c in cs])
    print(json.dumps(out, ensure_ascii=False))


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    if cmd == 'plan':
        plan()
    elif cmd == 'sections':
        sections()
    elif cmd == 'library':
        library()
    elif cmd == 'scenes':
        scenes(sys.argv[2:] or None)
    elif cmd == 'chains':
        chains(int(sys.argv[2]))
    else:
        print(__doc__)
