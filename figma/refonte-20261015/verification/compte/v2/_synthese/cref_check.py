"""Contrôle à blanc (en mémoire) du correctif proposé pour cref() en mode SWAP (cadres sombres construits depuis la
capture sombre). Rien n'est écrit dans le dépôt : sortie JSON dans ce dossier du scratchpad.
Usage : PYTHONDONTWRITEBYTECODE=1 python3 cref_check.py <scripts_dir> <out.json>"""
import json, sys
sys.dont_write_bytecode = True
sys.path.insert(0, sys.argv[1])
import dom2fig as D
from figlib import hex_of, CLEAR_DARK

ORIG = D.cref
CLEAR_LIGHT = (0.0, 0.0, 0.0, 0.0)


def cref_fixed(kind, c, dark_c=None):
    """Proposition : en SWAP, chercher d'abord la paire telle quelle, puis avec les transparents à la convention de
    build_palette (absent en clair = #00000000, absent en sombre = #1B1B1B00) ; sans variable, la couleur du relevé
    sombre (celle que montre le cadre) au lieu de la claire."""
    if not D.SWAP:
        return ORIG(kind, c, dark_c)
    if c is None:
        return None
    if dark_c is None:
        name = D.by_dark(kind, hex_of(c))
        return {'v': name} if name else {'h': hex_of(c)}
    seen = c
    lc, dc = dark_c, c
    pal = D.palette()

    def look(l, d):
        lh, dh = hex_of(l), hex_of(d)
        return pal['map'].get('%s|%s|%s' % (kind, lh, dh)) or D.any_kind(lh, dh)

    l2 = CLEAR_LIGHT if lc[3] <= 0.001 else lc
    d2 = CLEAR_DARK if dc[3] <= 0.001 else dc
    name = None
    for l_, d_ in ((lc, dc), (l2, dc), (lc, d2), (l2, d2)):   # raw pair first, then one side, then both sides
        name = look(l_, d_)
        if name:
            break
    return {'v': name} if name else {'h': hex_of(seen)}


def refs(t, path, out):
    nm = path + [t.get('n', '?')]
    for i, p in enumerate(t.get('f') or []):
        if isinstance(p, dict) and ('v' in p or 'h' in p):
            out.append(('f', ' > '.join(nm[-3:]), i, p))
        elif isinstance(p, dict) and 'st' in p:
            for j, s in enumerate(p['st']):
                out.append(('st', ' > '.join(nm[-3:]), (i, j), {'v': s[2]} if len(s) > 2 else {'h': s[1]}))
    if isinstance(t.get('s'), dict):
        out.append(('s', ' > '.join(nm[-3:]), 0, t['s']))
    for i, e in enumerate(t.get('e') or []):
        if isinstance(e.get('c'), dict):
            out.append(('e', ' > '.join(nm[-3:]), i, e['c']))
    if isinstance(t.get('c'), dict):
        out.append(('tc', ' > '.join(nm[-3:]), 0, t['c']))
    for ch in t.get('ch') or []:
        refs(ch, nm, out)
    return out


def strip_colours(t):
    """Scene without its colour references, to prove that only colours change."""
    if isinstance(t, dict):
        return {k: strip_colours(v) for k, v in t.items() if k not in ('f', 's', 'e', 'c', 'bg')}
    if isinstance(t, list):
        return [strip_colours(v) for v in t]
    return t


pal = D.palette()
vals = {v['name']: (v['light'], v['dark']) for v in pal['vars']}
STATES = [('shell', s, f) for s in ('account-visitor', 'account-member', 'account-settings', 'account-theme') for f in ('desktop', 'mobile')]
STATES += [('projects', 'mention-picker', f) for f in ('desktop', 'mobile')]
report = []
for area, state, fmt in STATES:
    try:
        D.cref = ORIG
        a, _ = D.convert(area, state, fmt, 'fr', True, theme='dark')
        D.cref = cref_fixed
        b, _ = D.convert(area, state, fmt, 'fr', True, theme='dark')
    except FileNotFoundError as err:
        report.append({'state': f'{area}/{state}/{fmt}', 'error': str(err)})
        continue
    finally:
        D.cref = ORIG
    ra = refs({'n': 'cadre', 'ch': a['ch']}, [], [])
    rb = refs({'n': 'cadre', 'ch': b['ch']}, [], [])
    same_geo = json.dumps(strip_colours(a['ch'])) == json.dumps(strip_colours(b['ch']))
    changed = []
    for x, y in zip(ra, rb):
        if x[3] != y[3]:
            ent = {'kind': x[0], 'layer': x[1], 'before': x[3], 'after': y[3]}
            if 'v' in y[3]:
                ent['after_values'] = vals.get(y[3]['v'])
            changed.append(ent)
    raw_a = sum(1 for r in ra if 'h' in r[3] and r[0] != 'st')
    raw_b = sum(1 for r in rb if 'h' in r[3] and r[0] != 'st')
    st_a = sum(1 for r in ra if 'h' in r[3] and r[0] == 'st')
    st_b = sum(1 for r in rb if 'h' in r[3] and r[0] == 'st')
    report.append({'state': f'{area}/{state}/{fmt}', 'sameGeometry': same_geo, 'refs': len(ra) == len(rb),
                   'rawBefore': raw_a, 'rawAfter': raw_b, 'unboundStopsBefore': st_a, 'unboundStopsAfter': st_b,
                   'changed': changed})
json.dump(report, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
for r in report:
    if 'error' in r:
        print(r['state'], 'ERREUR', r['error']); continue
    print(r['state'], 'géométrie identique' if r['sameGeometry'] else 'GÉOMÉTRIE DIFFÉRENTE', '| brutes', r['rawBefore'], '→', r['rawAfter'],
          '| arrêts non liés', r['unboundStopsBefore'], '→', r['unboundStopsAfter'], '| références changées', len(r['changed']))
    for c in r['changed']:
        if c['kind'] != 'st':
            print('    ', c['kind'], c['layer'], c['before'], '→', c['after'], c.get('after_values') or '')
