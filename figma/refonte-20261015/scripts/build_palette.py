"""Colour variables for Figma from the observed light/dark pairs (Figma rebuild of 15 October 2026).

Every colour actually painted by the prototype is read in a light dump and, for the same element (stable key k),
in the dark dump of the same state, format and language. Each distinct (light, dark) pair becomes one variable of
the « 42 · Couleurs » collection (modes Clair / Sombre). Pairs equal to a CSS custom property of the site take its
name and code syntax; the others are named by role and values under « dérivées/… ».

Usage: python3 build_palette.py  → ../palette.json
"""
import collections, json, re, sys
from figlib import (DOM, BASE, load, parse_color, hex_of, parse_shadows, border_side, parse_gradients, figma_var_name,
                    CLEAR_DARK, LIGHT_ONLY_KINDS, img_tint, dialog_backdrop, pseudo_style, gradient_layers)

KINDS = ('fond', 'texte', 'bordure', 'icône', 'ombre')


def node_colors(n, pseudos=True):
    """(kind, rgba) colours painted by one dumped element (with its ::before/::after unless pseudos is False)."""
    s = n.get('s', {})
    out = []
    bg = parse_color(s.get('bg'))
    if bg and bg[3] > 0.001:
        out.append(('fond', bg))
    if n.get('runs') or n.get('tag') in ('input', 'textarea'):
        c = parse_color(s.get('color'))
        if c:
            out.append(('texte', c))
    for side in ('bT', 'bR', 'bB', 'bL'):
        b = border_side(s.get(side))
        if b:
            out.append(('bordure', b[2]))
    if n.get('tag') == 'svg':
        for prop in ('stroke', 'fill'):
            c = parse_color(s.get(prop))
            if c and c[3] > 0.001:
                out.append(('icône', c))
        if not any(k == 'icône' for k, _ in out):
            c = parse_color(s.get('color'))
            if c:
                out.append(('icône', c))
    for sh in parse_shadows(s.get('shadow')):
        out.append(('ombre·i' if sh['inset'] else 'ombre', sh['color']))   # inset and drop shadows paired apart
    for g in parse_gradients(s.get('bgImage')):
        for _, c in g.get('stops', []):
            out.append(('dégradé', c))
    if n.get('tag') == 'img' and img_tint(n):
        out.append(('icône', img_tint(n)))
    for pseudo in (('before', 'after') if pseudos else ()):
        ps = n.get(pseudo) or {}
        c = parse_color(ps.get('bg'))
        if c and c[3] > 0.001:
            out.append(('fond', c))
        for g in parse_gradients(ps.get('bgImage')):
            for _, c2 in g.get('stops', []):
                out.append(('dégradé', c2))
    return out


def pair_colors(lc, dc, dark_present):
    """(kind, light, dark) for the colours of one element, paired by kind as dom2fig.py pairs them:
    background, text and icon by their first value; each border side with the first dark side; shadows and
    gradient stops by order (the last dark stop for extra light stops). A paint missing from the dark element is
    transparent in the dark theme (CLEAR_DARK); a paint only in the dark theme is transparent in the light one."""
    L, D = collections.defaultdict(list), collections.defaultdict(list)
    for k, c in lc:
        L[k].append(c)
    for k, c in dc:
        D[k].append(c)
    out = []
    for kind, cs in L.items():
        ds = D.get(kind, [])
        for i, c in enumerate(cs):
            if kind.startswith('ombre'):
                d = ds[i] if i < len(ds) else (CLEAR_DARK if dark_present else None)
            elif ds:
                d = ds[0] if kind in ('fond', 'texte', 'bordure') else ds[min(i, len(ds) - 1)]
            else:
                d = CLEAR_DARK if (dark_present and kind in LIGHT_ONLY_KINDS) else None
            if d is not None:
                out.append((kind.replace('·i', ''), c, d))
    for kind, ds in D.items():
        extra = ds[len(L.get(kind, [])):] if kind.startswith('ombre') else (ds if kind not in L and kind in ('fond', 'bordure') else [])
        for d in extra:
            out.append((kind.replace('·i', ''), (0.0, 0.0, 0.0, 0.0), d))   # shown only in the dark theme
    return out


def css_pairs():
    """(light hex, dark hex) → CSS custom property names (../css-color-vars.json, resolved light/dark values)."""
    pairs = collections.defaultdict(list)
    try:
        rows = json.loads((BASE / 'css-color-vars.json').read_text())
    except OSError:
        return pairs
    for name, lh, dh in rows:
        pairs[(lh, dh)].append(name)
    return pairs


def css_name(names, invariant=False):
    """Theme-varying pairs take the semantic role (--h42-color-…); colours identical in both themes take the
    primitive when one exists (a decorative pink is « Primitives/pink », not « Rôles/error »)."""
    if invariant:
        prims = [n for n in names if figma_var_name(n).startswith('Primitives/')]
        if prims:
            best = sorted(prims, key=lambda x: (len(x), x))[0]
            return figma_var_name(best), best
    best = sorted(names, key=lambda x: (0 if 'color' in x else 1, len(x), x))[0]
    return figma_var_name(best), best


def main():
    files = sorted(DOM.glob('*/*--*-light.json.gz'))
    counts = collections.Counter()           # (kind, Lhex, Dhex) → n
    contexts = collections.defaultdict(set)  # (kind, Lhex, Dhex) → areas
    seen = 0
    for f in files:
        area = f.parent.name
        stem = f.name[:-len('.json.gz')]
        m = re.match(r'(.+)--(desktop|mobile)--(fr|en|ar)-light$', stem)
        if not m:
            continue
        state, fmt, lang = m.groups()
        light = load(area, state, fmt, lang, 'light'); dark = load(area, state, fmt, lang, 'dark')
        if not dark:
            continue
        seen += 1
        for n in light['nodes']:
            dn = dark['byKey'].get(n.get('k'))
            groups = [(node_colors(n, False), node_colors(dn, False) if dn else [], dn is not None)]
            for which in ('before', 'after'):
                lp = n.get(which); dp = (dn or {}).get(which)
                if lp:
                    groups.append((node_colors({'tag': 'div', 's': pseudo_style(lp)}, False),
                                   node_colors({'tag': 'div', 's': pseudo_style(dp)}, False) if dp else [], dn is not None))
            for lc, dc, dark_present in groups:
                lc = [x for x in lc if x[0] != 'dégradé']; dc = [x for x in dc if x[0] != 'dégradé']
                for kind, c, d in pair_colors(lc, dc, dark_present):
                    key = (kind, hex_of(c), hex_of(d))
                    counts[key] += 1; contexts[key].add(area)
            # 18 Oct.: Chrome's resize grip over a resizable box (dom2fig.resizer_grip): black and white at 153/255, the same in
            # both themes; one variable each, so the grip layers are bound like every other paint
            rz = n.get('resize') or ('auto' if n.get('tag') == 'textarea' else 'none')
            if rz != 'none' and (n.get('s', {}).get('overflow') or 'visible').split()[0] != 'visible':
                for c in ('#00000099', '#FFFFFF99'):
                    key = ('icône', c, c); counts[key] += 1; contexts[key].add(area)
            # gradient stops: layer by layer, as dom2fig.frame_paints pairs them
            styles = [(n.get('s', {}), dn.get('s', {}) if dn else None)]
            for which in ('before', 'after'):
                if n.get(which):
                    dp = (dn or {}).get(which)
                    styles.append((pseudo_style(n[which]), pseudo_style(dp) if dp else ({} if dn else None)))
            for ls_, ds_ in styles:
                for g in gradient_layers(ls_.get('bgImage'), (ds_ or {}).get('bgImage') if ds_ is not None else None, ds_ is not None):
                    for _p, c, d in g.get('stops', []):
                        if d is not None:
                            key = ('dégradé', hex_of(c), hex_of(d)); counts[key] += 1; contexts[key].add(area)
            bl = dialog_backdrop(n, light)
            if bl and bl[0]:
                bd = dialog_backdrop(dn, dark) if dn else None
                key = ('fond', hex_of(bl[0]), hex_of(bd[0] if bd and bd[0] else CLEAR_DARK))
                counts[key] += 1; contexts[key].add(area)
    # Light colour without a dark counterpart: most frequent pairing for that kind, else the same colour.
    fallback = {}
    by_light = collections.defaultdict(collections.Counter)
    for (kind, lh, dh), n in counts.items():
        by_light[(kind, lh)][dh] += n
    for (kind, lh), c in by_light.items():
        fallback[kind + '|' + lh] = c.most_common(1)[0][0]
    css = css_pairs()
    variables = {}
    mapping = {}
    for (kind, lh, dh), n in sorted(counts.items(), key=lambda kv: -kv[1]):
        names = css.get((lh, dh))
        if names:
            name, cssvar = css_name(names, lh == dh)
        else:
            name, cssvar = 'dérivées/%s/%s-%s' % (kind, lh.lstrip('#'), dh.lstrip('#')), None
        v = variables.setdefault(name, {'name': name, 'light': lh, 'dark': dh, 'css': cssvar, 'kinds': {}, 'uses': 0, 'areas': set()})
        v['kinds'][kind] = v['kinds'].get(kind, 0) + n
        v['uses'] += n; v['areas'] |= contexts[(kind, lh, dh)]
        mapping['%s|%s|%s' % (kind, lh, dh)] = name
    out = {'source': 'paires clair/sombre observées dans dom/*/ (%d états appariés)' % seen,
           'vars': sorted(({**v, 'areas': sorted(v['areas'])} for v in variables.values()), key=lambda v: (-v['uses'], v['name'])),
           'map': mapping, 'fallback': fallback}
    (BASE / 'palette.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))
    css_n = sum(1 for v in variables.values() if v['css'])
    print('paired states', seen, '| variables', len(variables), '| from CSS', css_n, '| derived', len(variables) - css_n)


if __name__ == '__main__':
    main()
