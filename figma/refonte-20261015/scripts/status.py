#!/usr/bin/env python3
"""Writes ../capture-status.md from the four zone indexes of the variants pass (no Chrome).

    python3 figma/refonte-20261015/scripts/status.py

For each zone: one row per state, one column per format x variant: ✓ captured (pass of variants.py), "—" not
requested, otherwise the recorded failure or "à faire". Then the versions and source fingerprints actually seen,
page errors, overflows and anomalies recorded by the runs, and the notes kept in NOTES below.
"""
import collections, gzip, importlib, json, pathlib, sys, time

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from variants import PASS, STAR, REF, BASE, LIB  # noqa: E402

ZONES = [('explorer', 'Explorer'), ('projects', 'Projets'), ('profiles', 'Profils'), ('shell', 'Éléments communs et compte'), ('journal', 'Chroniques')]
COLS = [(fmt, v) for fmt in ('desktop', 'mobile') for v in STAR]
SHORT = {'fr-light': 'FR☀', 'fr-dark': 'FR☾', 'en-light': 'EN☀', 'ar-light': 'AR☀', 'ar-dark': 'AR☾'}
NOTES = [  # observations of the pass (16 Oct 2026), kept by hand
    ('', 'Chaque variante est un chargement neuf (stockage vidé, about:blank, `open_app(theme=, lang=)` ; Compte > Paramètres '
         'pour la langue et le thème hors FR clair), puis les mêmes actions. Mouvements réduits émulés (aucun fondu en cours de capture). '
         'Les relevés DOM sont pris au même endroit de l’interface dans chaque variante ; quand une action fait défiler la page '
         '(menu ⋮, tri et suggestions des commentaires, visionneuse sur mobile), l’élément visé est placé au même endroit de la fenêtre, '
         'donc la valeur de défilement (`scrollY`) varie avec la longueur des textes (plus longue en arabe).'),
    ('', 'Contenu saisi identique dans toutes les langues (lien de dépôt, commentaire « Très clair, merci @Inès Morel… », réponse, '
         '« Bravo @in ») : c’est du contenu d’utilisateur, pas un texte d’interface ; dates relatives et libellés restent localisés.'),
    ('', 'Les commentaires reçoivent un identifiant aléatoire (crypto.randomUUID) qui apparaît dans les clés `k` : il est remplacé par '
         '`uuid-1`, `uuid-2`… (dans l’ordre d’apparition) pour que la même clé désigne le même élément dans chaque variante ; '
         'la correspondance est gardée dans `meta.keyNormalization`.'),
    ('explorer', 'Globe réel (WebGL) : un Chrome neuf par capture. Le premier passage enchaînait les pages du globe dans un seul Chrome '
                 'et a été tué par le plafond mémoire (2,6 Go, OOM) : rien n’a été enregistré de ces essais. Une préparation du globe a '
                 'échoué une fois à froid (about-dialog mobile FR clair) puis a réussi au rechargement (`checks.globeRetries`).'),
    ('explorer', 'Monde au repos : les repères affichés en étiquette ou en simple point diffèrent selon la langue (largeur des noms, '
                 'gestion des chevauchements), pas selon le thème ; liste exacte dans `checks.visibleMarkers`.'),
    ('explorer', '`explore-campus` et les fiches : capture seulement quand l’indication « Explore les alentours du campus. » est stable '
                 '2,5 s (rues chargées depuis tiles.openfreemap.org). `campus-sheet-expanded` (mobile) : déployée par une vraie molette '
                 'de 600 px sur la feuille, sans attribut posé par script. Les captures `--full.png` des fiches agrandissent la fenêtre '
                 'à la hauteur du contenu du volet : la carte derrière y est recomposée à cette hauteur (référence pour le volet seulement).'),
    ('explorer', '« liste des pays dépliée » : la liste du champ Pays est une liste native de Chrome, dessinée hors du DOM. '
                 '`scope-popover-list` (ordinateur seulement) est une capture d’écran sans relevé, la liste des pays dans l’ordre réel '
                 'est dans `checks.countryOptions`. Sur mobile, le sélecteur tactile natif n’est pas dessiné dans une capture sans '
                 'interface : non capturable (seule la fenêtre ouverte, `scope-popover`, est relevée).'),
    ('explorer', '`explore-noglobe` : aperçu direct avec `integrated-globe.mjs` bloqué ; même message et même état que '
                 '« Continuer sans le globe » depuis l’écran d’erreur de l’arrivée (filtre Pays / Campus actif, dé grisé).'),
    ('projects', 'Observation sur le prototype (non corrigée, lecture seule) : dans l’illustration de Minishell, le texte SVG '
                 '« $ ./minishell » hérite du sens RTL en arabe et déborde à gauche de la fenêtre du terminal (fiche, Médias, visionneuse) ; '
                 'en thème clair ce texte est sombre sur le fond sombre du terminal, alors qu’il est clair en thème sombre.'),
    ('projects', '`comment-menu` : le bouton ⋮ est placé à 42 % de la hauteur de la fenêtre ; ainsi, sur mobile, la page dépasse le seuil '
                 '(0,75 × hauteur) du bouton Remonter en haut dans toutes les langues (un premier cadrage centré le laissait masqué en '
                 'français et visible en arabe ; recapturé). `project-test` et `project-test-saved` : page remise en haut après les clics.'),
    ('', 'capture_lib.py a changé pendant la passe : `svgKids` (15 oct., 22 h 13), lignes de texte mesurées sans les espaces '
         '(16 oct., 04 h 15), voile `::backdrop` des fenêtres modales et `s.clip` (`clip-path`, 16 oct., 05 h 16–05 h 18). '
         'Les états à fenêtre ont d’abord été refaits pour le voile (explorer : about-dialog, campus-sheet, campus-sheet-expanded, '
         'campus-sheet-mulhouse, campus-window ; projects : campus-choice, report, viewer — filter-projects et filter-projects-expanded '
         'l’avaient déjà ; profiles : filter-people, filter-people-expanded, message-dialog, profile-projects-filter, report-profile ; '
         'shell : signin-dialog, signup-dialog), puis toutes les autres captures avec la même version, pour que `s.clip` '
         '(éléments masqués `.sr-only`, titres de section, scène du globe) figure partout. Version de chaque relevé : champ `lib`.'),
    ('', 'Écarts attendus entre variantes (pas des défauts de capture) : l’option cochée des panneaux Paramètres, Thème et Langue '
         'est celle de la variante ; sur mobile en vue Liste, l’arabe affiche un second auteur au lieu de « +1 » sur certaines cartes '
         '(ajustement des auteurs à la place disponible) ; la ligne arabe « أفق » du logo n’existe qu’en arabe.'),
]


def expected(module):
    out = collections.OrderedDict()
    for spec in module.STATES:
        for fmt in spec['formats']:
            variants = spec['variants'](fmt) if callable(spec['variants']) else spec['variants']
            produces = spec['produces'](fmt) if callable(spec['produces']) else spec['produces']
            for state in produces:
                out.setdefault(state, set())
                for v in variants:
                    out[state].add((fmt, v))
    return out


def main():
    lines = [f'# Relevés de la refonte Figma — état des captures par variante',
             '',
             f'Généré par `scripts/status.py` le {time.strftime("%Y-%m-%d à %H:%M")} à partir des index `reference/<zone>/index.json` '
             f'(passe `{PASS}`, `scripts/variants.py`). Chaque capture comprend la capture d’écran de la fenêtre '
             '(`reference/<zone>/<nom>.png`), le relevé DOM (`dom/<zone>/<nom>.json.gz`, clés stables par élément, lignes de texte, SVG complets) '
             'et, pour les listes, fiches et panneaux défilants, la capture pleine hauteur (`<nom>--full.png`).',
             '',
             'Nom : `<état>--<desktop|mobile>--<fr|en|ar>-<light|dark>`. Ordinateur 1440 × 960, mobile 390 × 844 (DPR 2) sauf mention. '
             'Légende : ✓ capturé et vérifié par le script ; — non demandé ; ✗ échec (raison) ; … à faire.',
             '']
    versions, sources, errors, overflow, anomalies, totals = collections.Counter(), collections.Counter(), [], [], [], {}
    for zone, label in ZONES:
        module = importlib.import_module('capture_' + zone)
        exp = expected(module)
        index_path = REF / zone / 'index.json'
        data = json.loads(index_path.read_text()) if index_path.exists() else {'states': []}
        recs = {r['name']: r for r in data['states'] if r.get('pass') == PASS}
        fails = {}
        for f in data.get('failures', []):
            for n in f.get('names', []):
                fails[n] = f['reason']
        extra = sorted({r['state'] for r in recs.values()} - set(exp))
        lines += [f'## {label} (`{zone}`)', '']
        lines.append('| État | ' + ' | '.join(f'{"ordi" if f == "desktop" else "mobile"} {SHORT[v]}' for f, v in COLS) + ' |')
        lines.append('|---|' + '---|' * len(COLS))
        done = want = 0
        for state, cells in list(exp.items()) + [(s, set()) for s in extra]:
            row = []
            for fmt, v in COLS:
                name = f'{state}--{fmt}--{v}'
                if name in recs:
                    row.append('✓'); done += 1
                    if (fmt, v) in cells:
                        want += 1
                elif (fmt, v) not in cells:
                    row.append('—')
                elif name in fails:
                    row.append('✗ ' + fails[name].replace('|', '/')[:90]); want += 1
                else:
                    row.append('…'); want += 1
            lines.append(f'| `{state}` | ' + ' | '.join(row) + ' |')
        totals[zone] = (sum(1 for n in recs if recs[n]['state'] in exp), sum(len(c) for c in exp.values()))
        lines += ['', f'{totals[zone][0]} captures sur {totals[zone][1]} demandées' + (f' (+ {len(extra)} état(s) complémentaire(s) : {", ".join(extra)})' if extra else '') + '.', '']
        for r in recs.values():
            versions[r.get('version')] += 1
            sources[r.get('sources')] += 1
            if r.get('errors'):
                errors.append((r['name'], r['errors'][:2]))
            if r.get('overflow'):
                overflow.append(r['name'])
        for a in data.get('anomalies', []):
            anomalies.append(f'{zone} : {a["at"]} — {a["text"]}')
    lines += ['## Concordance des relevés entre variantes', '',
              'Pour chaque état et format : nombre d’éléments relevés par variante, part des clés stables (`k`) présentes dans toutes '
              'les variantes, et faits d’interface comparés (bouton Remonter en haut, fenêtres, panneaux, menus ouverts). '
              'Une clé absente d’une variante signale un élément propre à cette langue ou à ce thème (ex. la ligne arabe « أفق » du logo).', '',
              '| Zone | État | Format | Éléments par variante | Clés communes | Différences d’interface |', '|---|---|---|---|---|---|']
    for zone, label in ZONES:
        index_path = REF / zone / 'index.json'
        data = json.loads(index_path.read_text()) if index_path.exists() else {'states': []}
        groups = collections.defaultdict(list)
        for r in data['states']:
            if r.get('pass') == PASS and r.get('dom'):
                groups[(r['state'], r['format'])].append(r)
        for (state, fmt), recs in sorted(groups.items()):
            recs.sort(key=lambda r: STAR.index(f'{r["lang"]}-{r["theme"]}'))
            keys = {}
            for r in recs:
                try:
                    keys[f'{r["lang"]}-{r["theme"]}'] = {n['k'] for n in json.loads(gzip.decompress((BASE / r['dom']).read_bytes()))['nodes']}
                except FileNotFoundError:
                    pass
            if not keys:
                continue
            common, union = set.intersection(*keys.values()), set.union(*keys.values())
            ui = {f'{r["lang"]}-{r["theme"]}': r.get('ui') for r in recs if r.get('ui')}
            diffs = []
            if ui:
                for fact in sorted({k for u in ui.values() for k in u}):
                    values = {v: json.dumps(u.get(fact), ensure_ascii=False) for v, u in ui.items()}
                    if fact == 'menus':
                        values = {v: json.dumps(len(u.get(fact) or [])) for v, u in ui.items()}
                    if len(set(values.values())) > 1:
                        diffs.append(f'{fact} : ' + ', '.join(f'{v}={x}' for v, x in values.items()))
            lines.append(f'| {zone} | `{state}` | {fmt} | ' + ' · '.join(f'{SHORT[v]} {len(k)}' for v, k in keys.items())
                         + f' | {len(common)}/{len(union)} ({100 * len(common) // max(1, len(union))} %) | ' + ('; '.join(diffs) if diffs else ('—' if ui else 'non relevé')) + ' |')
    lines += ['']
    libs = collections.Counter()
    for zone, _ in ZONES:
        index_path = REF / zone / 'index.json'
        if index_path.exists():
            for r in json.loads(index_path.read_text())['states']:
                if r.get('pass') == PASS:
                    libs[r.get('lib') or 'avant le 15 oct. 22 h 13 (sans svgKids)'] += 1
    lines += ['## Version de capture_lib.py utilisée', '', f'Version actuelle : `{LIB}` (empreinte du fichier).', '']
    for v, n in libs.most_common():
        lines.append(f'- `{v}` : {n} capture(s)')
    # Dialogs and their ::backdrop veil (capture_lib records it on modal dialogs since 16 Oct, 05:16)
    with_bd, without_bd, per_state = 0, 0, collections.defaultdict(lambda: collections.Counter())
    for zone, _ in ZONES:
        for path in sorted((BASE / 'dom' / zone).glob('*.json.gz')):
            nodes = json.loads(gzip.decompress(path.read_bytes()))['nodes']
            dialogs = [n for n in nodes if n['tag'] == 'dialog']
            if not dialogs:
                continue
            state = path.name.split('--')[0]
            label = ', '.join(sorted({(n.get('id') or (n.get('cls') or 'dialog').split(' ')[0]) for n in dialogs}))
            if any('backdrop' in n for n in dialogs):
                with_bd += 1; per_state[(zone, state, label)]['avec voile'] += 1
            else:
                without_bd += 1; per_state[(zone, state, label)]['sans voile'] += 1
    lines += ['## Fenêtres (`dialog`) et voile `::backdrop`', '',
              f'Relevés contenant un nœud `dialog` : {with_bd + without_bd}, dont **{with_bd} avec** le champ `backdrop` (fenêtre modale) '
              f'et **{without_bd} sans** (fenêtre ouverte sans `showModal()`, `:modal` faux : pas de voile à relever).', '',
              '| Zone | État | Fenêtre | Relevés |', '|---|---|---|---|']
    for (zone, state, label), c in sorted(per_state.items()):
        lines.append(f'| {zone} | `{state}` | `{label}` | ' + ', '.join(f'{n} {k}' for k, n in sorted(c.items())) + ' |')
    lines += ['', '## Version du prototype relevée', '']
    for v, n in versions.most_common():
        lines.append(f'- `{v}` : {n} capture(s)')
    lines += ['', 'Empreinte des sources du prototype au moment des captures (hachage de `horizon-welcome/*.mjs|css|html|js|json` hors tests et de `figma/tokens.css`) :', '']
    for v, n in sources.most_common():
        lines.append(f'- `{v}` : {n} capture(s)')
    if len(versions) > 1 or len(sources) > 1:
        lines += ['', '**La version ou les sources ont changé pendant la passe** : voir les relevés concernés (champs `version` et `sources` des index).']
    lines += ['', '## Anomalies et remarques', '']
    if errors:
        lines.append('Erreurs de page relevées pendant une capture :')
        lines += [f'- `{n}` : {json.dumps(e, ensure_ascii=False)[:200]}' for n, e in errors]
    else:
        lines.append('- Aucune erreur de page (console, exceptions) relevée pendant les captures.')
    lines.append('- Débordement horizontal : ' + (', '.join(f'`{n}`' for n in overflow) if overflow else 'aucun.'))
    for a in anomalies:
        lines.append('- ' + a)
    for zone, text in NOTES:
        lines.append(f'- {("**" + zone + "** : ") if zone else ""}{text}')
    out = BASE / 'capture-status.md'
    out.write_text('\n'.join(lines) + '\n')
    print(out, {z: t for z, t in totals.items()})


if __name__ == '__main__':
    main()
