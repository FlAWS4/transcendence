"""Frame ids of the rebuilt screens, from the raw results of the calls (Figma rebuild, 16 October 2026).

  python3 record_frames.py      → updates figma-ledger.json « frames » {page name: {frame name: node id}}
Reads call-results/*.json in call order: screen calls return {"frames": [{"id", "name"}]} (intermediate parts of a split
screen carry a « ⟦build …⟧ » name and are skipped), dark-clone calls return {"ids": {name: id}}. A later call wins,
so a rebuilt screen keeps its newest id. Failed calls ({"is_error": true}) are ignored.
17 Oct.: frames are grouped by page. Keyed by name alone, two screens of the same name on two pages (« Médias »,
« Commentaires » in Projets and in Chroniques) overwrote each other; the page comes from the call file (X.page of a
screen call, the page a dark-clone call opens). Results whose call file is gone stay under « (page inconnue) ».
"""
import json, re
from figlib import BASE

LEDGER = BASE / 'figma-ledger.json'
CALLS = BASE / 'calls'


def page_of(name, pages):
    """Page name of the call that produced call-results/<name>.json."""
    for f in (CALLS / 'done' / name, CALLS / name):
        if f.exists():
            text = f.read_text()
            m = (re.search(r'^const X = \{"page":"(\d+:\d+)"', text, re.M) or re.search(r"^const page = await figma\.getNodeByIdAsync\('(\d+:\d+)'\)", text, re.M)
                 or re.search(r'"page":"(\d+:\d+)"', text))   # calls of the stored-renderer era: X is the last argument of R()
            if m:
                return pages.get(m.group(1), m.group(1))
    return '(page inconnue)'


def main():
    led = json.loads(LEDGER.read_text())
    pages = {v: k for k, v in led['pages'].items() if isinstance(v, str)}
    old = led.get('frames', {})
    frames = {}
    for f in sorted((BASE / 'call-results').glob('*.json')):
        try:
            res = json.loads(f.read_text())
        except ValueError:
            continue
        if not isinstance(res, dict) or res.get('is_error'):
            continue
        pairs = [(fr.get('name'), fr.get('id')) for fr in res.get('frames') or [] if isinstance(fr, dict)]
        pairs += list((res.get('ids') or {}).items())
        # 18 Oct.: the call that creates variables (969, « Effets/… ») also answers {"ids": {name: VariableID}}: not frames
        pairs = [(n, i) for n, i in pairs if n and isinstance(i, str) and not n.startswith('⟦build') and not i.startswith('VariableID:')]
        if pairs:
            page = frames.setdefault(page_of(f.name[:-len('.json')], pages), {})
            for name, nid in pairs:
                page[name] = nid
    # entries that no call result gives (cover, guide and foundations were recorded by hand) are kept on their page
    olds = [(None, k, v) for k, v in old.items() if isinstance(v, str)]
    olds += [(p, k, v) for p, d in old.items() if isinstance(d, dict) for k, v in d.items() if isinstance(v, str)]
    known = {n for v in frames.values() for n in v}
    kept = []
    for p, k, v in olds:
        if k not in known:
            page = p or (k if k in led['pages'] else 'Fondations' if k.startswith('Fondations') else '(page inconnue)')
            frames.setdefault(page, {})[k] = v; kept.append(k)
    if kept:
        print('kept from the previous registry:', kept)
    led['frames'] = frames
    LEDGER.write_text(json.dumps(led, ensure_ascii=False, indent=1))
    print('frames in the ledger:', sum(len(v) for v in frames.values()), 'on', len(frames), 'pages:', {k: len(v) for k, v in frames.items()})


if __name__ == '__main__':
    main()
