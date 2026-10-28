"""Résumé lisible de parcours-correspondance.json -> ../parcours-correspondance.md"""
import json, pathlib, collections, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import plib

OUT = pathlib.Path(__file__).resolve().parent.parent
D = json.loads((OUT / 'parcours-correspondance.json').read_text())
FMTS = ('desktop', 'mobile')
FMT_FR = {'desktop': 'ordinateur', 'mobile': 'mobile'}
S = D['screens']
L = D['links']
FR = plib.frames()


def z(h):
    return '%g, %g, %g × %g' % (h['x'], h['y'], h['w'], h['h']) if h else '—'


def short(name):
    return name.replace(' — Ordinateur · Clair', '').replace(' — Mobile · Clair', '')


per = collections.OrderedDict()
for l in L:
    per.setdefault((l['from'], l['to'], l['via'], l['fmt']), []).append(l)


def cat(ls):
    st = collections.Counter(x['status'] for x in ls)
    if 'retrouvée' in st or 'grisé' in st:
        return 'zone'
    if 'libellé différent' in st:
        return 'libellé'
    if 'automatique' in st:
        return 'auto'
    return list(st)[0]


cnt = collections.Counter()
ecart = collections.defaultdict(list)
ecart_edges = collections.Counter()
for k, ls in per.items():
    cnt[(k[3], cat(ls))] += 1
    if any((x.get('evidence') or {}).get('écart') for x in ls):
        ecart_edges[k[3]] += 1
    for x in ls:
        e = (x.get('evidence') or {}).get('écart')
        if e and not x['from'].startswith('g-'):
            ecart[k[3]].append((k, x, e))
entries = collections.Counter(l['fmt'] for l in L)
glob_entries = collections.Counter(l['fmt'] for l in L if l['from'].startswith('g-') and l.get('hotspot'))
frames_fmt = collections.Counter(f['fmt'] for f in FR)
with_frame = {fmt: sum(1 for v in S.values() if v[fmt]) for fmt in FMTS}
closes = {fmt: sum(1 for v in S.values() for c in (v.get('close') or {}).get(fmt, []) if c.get('close')) for fmt in FMTS}
close_total = {fmt: sum(1 for v in S.values() for c in (v.get('close') or {}).get(fmt, [])) for fmt in FMTS}

o = []
w = o.append
w('# Parcours cliquables : correspondance plan du site → cadres Figma')
w('')
w('Relevé hors ligne du 19 octobre 2026, préparatoire aux pages « 09 · Parcours · ordinateur » et « 10 · Parcours · mobile ». '
  'Aucun appel Figma, aucune modification du dépôt : lecture du plan du site (`site-map-data.js`, relevé du %s), des plans de pages '
  '(`layouts/*.json`, cadres français clairs), des relevés du site (`dom/<zone>/<état>--<format>--fr-light.json.gz`), des scènes envoyées à Figma '
  '(`scenes/`) et du registre des cadres (`figma-ledger.json`).' % D['meta']['planSurvey'])
w('')
w('Fichier de données : `parcours-correspondance.json` (même dossier). Les identifiants Figma (`figmaId`) viennent du registre et n’ont pas été relus dans le fichier.')
w('')
w('## En bref')
w('')
w('| | Ordinateur | Mobile |')
w('|---|---|---|')
w('| Cadres FR clairs dans les plans | %d | %d |' % (frames_fmt['desktop'], frames_fmt['mobile']))
w('| Écrans du plan (65) qui ont au moins un cadre | %d | %d |' % (with_frame['desktop'], with_frame['mobile']))
w('| Liens du plan (110) : zone retrouvée | %d | %d |' % (cnt[('desktop', 'zone')], cnt[('mobile', 'zone')]))
w('| … dont l’arrivée est relevée sur une autre page (au moins un départ) | %d | %d |' % (ecart_edges['desktop'], ecart_edges['mobile']))
w('| Liens du plan : même bouton trouvé, libellé différent (Retour) | %d | %d |' % (cnt[('desktop', 'libellé')], cnt[('mobile', 'libellé')]))
w('| Liens du plan : sans zone | %d | %d |' % (cnt[('desktop', 'sans zone')], cnt[('mobile', 'sans zone')]))
w('| Liens du plan : automatiques (sans zone par nature) | %d | %d |' % (cnt[('desktop', 'auto')], cnt[('mobile', 'auto')]))
w('| Liens du plan : sans cadre de départ (aperçu direct) | %d | %d |' % (cnt[('desktop', 'sans cadre de départ')], cnt[('mobile', 'sans cadre de départ')]))
w('| Entrées `links` (les éléments toujours présents sont détaillés cadre par cadre) | %d | %d |' % (entries['desktop'], entries['mobile']))
w('| … dont zones d’éléments toujours présents | %d | %d |' % (glob_entries['desktop'], glob_entries['mobile']))
w('| Fenêtres et panneaux : cadres avec zone « Fermer » | %d / %d | %d / %d |' % (closes['desktop'], close_total['desktop'], closes['mobile'], close_total['mobile']))
IT = D['implicitLinks']
def ic(lst, fmt, st='retrouvée'):
    return sum(1 for l in lst if l['fmt'] == fmt and l.get('status', 'retrouvée') == st)
w('| Liens implicites : onglets fiche → onglet (zone / sans zone / onglet par défaut) | %d / %d / %d | %d / %d / %d |' % (
    ic(IT['tabs'], 'desktop'), ic(IT['tabs'], 'desktop', 'sans zone'), ic(IT['tabs'], 'desktop', 'même cadre'),
    ic(IT['tabs'], 'mobile'), ic(IT['tabs'], 'mobile', 'sans zone'), ic(IT['tabs'], 'mobile', 'même cadre')))
w('| Liens implicites : ouverture de la recherche, étapes automatiques de l’entrée, Remonter en haut | %d, %d, %d | %d, %d, %d |' % (
    ic(IT['searchOpener'], 'desktop'), sum(1 for l in IT['sequences'] if l['fmt'] == 'desktop'), ic(IT['backToTop'], 'desktop'),
    ic(IT['searchOpener'], 'mobile'), sum(1 for l in IT['sequences'] if l['fmt'] == 'mobile'), ic(IT['backToTop'], 'mobile')))
w('')
w('Toutes les zones retrouvées se trouvent dans le cadre et dans un nœud de la scène envoyée à Figma (même boîte, ou contenue dans l’instance '
  'qui la porte : menu du bas, carte, recherche, barre de périmètre). Le calcul a aussi été contrôlé à l’œil en dessinant les zones sur les captures du site (voir « Vérifications »).')
w('')
w('## Lire le fichier JSON')
w('')
w('- `screens.<id>.desktop|mobile` : cadres qui montrent l’écran, avec `name` (nom exact), `page`, `state`, taille, `height` (« pleine » ou « écran »), `role` '
  '(`base`, `variante`, `étape`, `origine`) et `figmaId`. `screens.<id>.base` donne le cadre de base par format. Fenêtres et panneaux : `close` (zone du bouton Fermer, '
  '`closeTo` = cadre de l’écran du dessous, `other` = Annuler ou Retour).')
w('- `links` : un objet par lien du plan et par format, avec `fromFrame`, `toFrame`, `via` (libellé français du plan), `hotspot` (x, y, w, h en pixels du cadre), '
  '`status` et `evidence` (élément du relevé, nœud de la scène, raison du choix des cadres, `écart`, `recouvertPar`). Les liens des éléments toujours présents '
  'ont une entrée par cadre de départ (`fromScreen`). Champs facultatifs : `altHotspots` (autres zones du même lien), `alsoFrom` (même commande sur les variantes '
  'du départ), `before` (action sur place qui précède le lien).')
w('- `implicitLinks` : liens que le plan implique sans les lister : ouverture de la recherche depuis chaque page, onglets (fiche → onglet, comme la page du plan), '
  'enchaînements automatiques des étapes de l’entrée, « Remonter en haut ».')
w('- `tabBars` : pour chaque cadre de fiche, zones des onglets (ordinateur) ou du sélecteur « Dans ce … » (mobile) et cadre d’arrivée.')
w('- `globals` : zones du logo, du menu du bas (5 boutons), de la recherche, du dé, du compte (et, en membre, bulle et cloche) et de « Remonter en haut » dans chaque cadre '
  'après l’entrée ; `startFrame` marque les cadres de base des pages et onglets.')
w('- `unmatched` : écrans sans cadre, cadres qui ne sont pas l’état de base d’un écran, relevés sans cadre. `conflicts` : zones qui se recouvrent dans un même cadre '
  'avec des arrivées différentes.')
w('')
w('**Coordonnées.** ' + D['meta']['coordonnees'])
w('')
w('## Couverture des écrans')
w('')
w('Cadre de base : l’état nommé comme l’écran, ou à défaut l’état stable (arrivée : message chiffré au repos). Les autres cadres sont listés dans le JSON.')
w('')
w('| Écran du plan | Type | Base ordinateur | Base mobile | Autres cadres (ord. / mob.) |')
w('|---|---|---|---|---|')
for nid, v in S.items():
    b = v['base']
    others = '%d / %d' % (len(v['desktop']) - (1 if b['desktop'] else 0), len(v['mobile']) - (1 if b['mobile'] else 0))
    bd = short(b['desktop']) if b['desktop'] else ('—' if not v['desktop'] else '(variantes seules)')
    bm = short(b['mobile']) if b['mobile'] else ('—' if not v['mobile'] else '(variantes seules)')
    extra = ''
    if v.get('sharedWith'):
        extra = ' (cadre de la fiche)'
    w('| `%s` %s%s | %s | %s | %s | %s |' % (nid, v['name'], extra, v['kind'], bd, bm, others))
w('')
w('**Écrans sans cadre.**')
w('')
for fmt in FMTS:
    lst = D['unmatched']['screensWithoutFrame'][fmt]
    w('- %s (%d) : %s.' % (FMT_FR[fmt].capitalize(), len(lst), ' ; '.join('`%s` (%s)' % (x['id'], x['reason']) for x in lst)))
w('')
w('Les six liens externes s’ouvrent par une URL (action « ouvrir le lien ») ; l’aperçu direct n’est pas un écran du parcours : il ouvre la liste des projets.')
w('')
w('## Liens sans zone retrouvée')
w('')
for (fr, to, via, fmt), ls in per.items():
    if cat(ls) != 'sans zone':
        continue
    x = ls[0]
    note = (x.get('evidence') or {}).get('note') or ''
    w('- %s · `%s` → `%s` « %s » : %s' % (FMT_FR[fmt], fr, to, via, note))
w('')
w('Automatiques (pas de clic : « après un délai » dans Figma) : déchiffrement → logo, logo → globe, logo → « Le monde se prépare… », attente → globe, attente → erreur, '
  'globe → Explorer, dans les deux formats. Les deux suites qui partent du « cercle complet » (globe prêt ou non) et de « Le monde se prépare… » (prêt ou échec) '
  'ne peuvent pas être toutes deux « après un délai » sur le même cadre : il faudra en choisir une par cadre. L’aperçu direct (`content-preview` → Projets) n’a pas de cadre de départ.')
w('')
w('## Boutons Retour : même zone, libellé différent')
w('')
w('Les fiches relevées ont été ouvertes par un lien direct : leur bouton affiche « Retour aux projets », « Retour aux profils » ou « Retour aux chroniques ». '
  'Les retours qui dépendent de l’origine (« Retour au profil », « Retour aux projets » depuis un profil, « Retour au projet », « Retour à l’article »…) '
  'ont la zone de ce même bouton, statut « libellé différent » : aucun cadre ne montre ces libellés. Piste, non décidée : l’action « Back » de Figma, '
  'qui revient au cadre précédent, reproduit ce comportement sans multiplier les zones.')
w('')
for (fr, to, via, fmt), ls in per.items():
    if cat(ls) == 'libellé' and fmt == 'desktop':
        x = ls[0]
        w('- `%s` → `%s` « %s » : le cadre affiche « %s »' % (fr, to, via, (x.get('evidence') or {}).get('libelléAffiché', '')))
w('')
w('## Arrivées relevées sur une autre page')
w('')
w('Chaque fenêtre n’a été relevée qu’une fois, sur une page donnée. Selon la décision du 18 octobre (« mener à l’écran relevé exact, pas une superposition »), '
  'le lien mène à ce cadre, même quand le départ est une autre page. Fenêtres concernées (deux formats) :')
w('')
seen = set()
pages_ = []
for fmt in FMTS:
    for (k, x, e) in ecart[fmt]:
        key = (k[0], k[1], k[2])
        if key in seen:
            continue
        seen.add(key)
        both = any((kk[0], kk[1], kk[2]) == key for (kk, _, _) in ecart['desktop' if fmt == 'mobile' else 'mobile'])
        line = '- `%s` → `%s` « %s »%s : %s.' % (k[0], k[1], k[2], '' if both else ' (%s seulement)' % FMT_FR[fmt], e)
        if 'la fenêtre d’arrivée' in e:
            w(line)
        else:
            pages_.append(line)
w('- Éléments toujours présents : le panneau du compte et la recherche sont relevés sur la liste des projets ; depuis une autre page, leur cadre montre cette liste en dessous.')
w('')
w('Pages :')
w('')
for line in pages_:
    w(line + ' Aucun cadre « statut Alumni » en mobile.')
w('- Recherche, « Résultat « Chroniques » » : le seul résultat visible (« Suivre un événement · Ce que nous transmettons ») ouvre une autre chronique que celle du cadre « Chronique ».')
w('')
w('## Zones en conflit (une zone, plusieurs arrivées)')
w('')
cc = collections.Counter()
for c in D['conflicts']:
    k = 'retour' if ('Retour' in c['a']['via'] and 'Retour' in c['b']['via']) else '%s → %s « %s » / %s → %s « %s »' % (c['a']['from'], c['a']['to'], c['a']['via'], c['b']['from'], c['b']['to'], c['b']['via'])
    cc[k] += 1
for k, v in cc.items():
    if k == 'retour':
        w('- Boutons Retour : %d paires de liens sur la même zone (fiches projet, profil et chronique, deux formats), voir ci-dessus.' % v)
    elif k.startswith('entry-error'):
        w('- Écran d’erreur, icône du compte : « Compte, puis Se connecter » et « Compte, puis Créer un compte » (%d cadres). Sur le site, l’icône ouvre un menu qui n’a pas de cadre.' % v)
    elif k.startswith('scope-popover'):
        w('- « Où veux-tu aller ? », liste « Pays » : « Tous les pays » et « Choisir un pays » (%d cadres), deux choix de la même liste native, dont les options ne sont pas dessinées.' % v)
    else:
        w('- %s (%d cadres)' % (k, v))
w('')
w('## Choix faits')
w('')
w('- **Cadres de base.** État nommé comme l’écran ; arrivée = « message chiffré au repos » (état stable) ; déchiffrement = « à mi-parcours » (premier cadre) ; '
  'ouverture = « logo seul » (commun aux deux accès) ; cercle → globe = « à mi-parcours ».')
w('- **Entrée.** Ordre automatique des cadres (`implicitLinks.sequences`, « après un délai ») : scan binaire → hexadécimal → remontée → message au repos → libellés anglais → '
  'libellés arabes → message au repos (boucle des libellés) ; déchiffrement à mi-parcours → phrase finale → vers le logo (membre) → logo seul ; « Visiter » → parcours visiteur → logo seul ; '
  'logo seul → tracé du cercle → cercle complet → (globe prêt) cercle → globe à mi-parcours → fin → Explorer. « Réessayer » mène au « logo seul ». '
  'Les boutons Se connecter et Visiter sont visibles sur les six cadres de l’arrivée (`alsoFrom`). Le fond de l’arrivée change le thème sur le site : non relié (le thème passe par les modes).')
w('- **Fiche projet.** Base = ft_transcendence (plusieurs campus, carte 1 de la liste). Les onglets relevés sont ceux de minishell : les liens d’onglets, '
  '« Explorer 42 Paris » et l’illustration partent donc du cadre « projet à campus unique » (minishell), pour que l’arrivée montre la même fiche. '
  'La carte de minishell (carte 2) mène à ce cadre (`altHotspots`).')
w('- **Cadre d’arrivée.** Pour une page : celui dont l’adresse correspond au lien cliqué (cartes, auteurs, résultats) ; pour une fenêtre : celle relevée sur la même page que le départ '
  '(Signaler depuis un profil → « Signaler · depuis un profil » ; Filtrer de l’onglet Projets d’un profil → « Projets · filtre local ouvert ») ; sinon le cadre de base.')
w('- **Cartes.** Zone principale = image de la carte, titre en zone alternative ; cartes de profils : la carte entière (pas de lien dans le relevé). '
  'Inès Morel et Noé Laurent mènent à leurs cadres « statut Alumni » et « statut Transcender » (ordinateur seulement).')
w('- **Liens en deux actions.** Commentaires : départ = cadre « avec un fil », et `before` donne le bouton « Ajouter » du cadre vide qui y mène. Dépôt : départ = « lien enregistré », '
  '`before` = « Enregistrer ». Connexion et création de compte simulées → panneau membre directement (la page en membre intermédiaire n’a pas de cadre). '
  'Compte de l’écran d’erreur → fenêtres de connexion ou de création (menu non relevé).')
w('- **Éléments toujours présents.** Liens donnés depuis le cadre de base de chaque page et onglet après l’entrée (plus le cadre minishell), avec les exceptions du plan '
  '(bouton de la rubrique en cours, dé selon la rubrique, recherche et dé masqués sur 42 Awards). Aucun lien global depuis les fenêtres et panneaux ; leurs zones restent dans `globals`. '
  'Liens du membre (avatar, bulle, cloche) : depuis les trois panneaux membre, seuls cadres en membre. Le dé de « Explorer sans le globe » est grisé (opacité 0,42) : statut « grisé ».')
w('- **Recherche.** Ouverture depuis chaque page (`implicitLinks.searchOpener`) vers « Recherche · ouverte », relevée avec la saisie « Paris » ; résultats choisis pour ouvrir un cadre relevé '
  '(42 Paris → Explorer · Campus, « Derrière une ligne de commande » → minishell, Leïla Mansour → sa fiche).')
w('- **Fermer.** Bouton Fermer (ou « Fermer la carte », « Fermer le média », « Fermer les filtres », « Fermer la recherche ») ; menu à trois points : le bouton à trois points, qui le rebascule. '
  'Arrivée = cadre de la page sous la fenêtre (même adresse). Paramètres, Thème et Langue : « Retour » mène à l’accueil du panneau.')
w('- **Mobile.** Les onglets sont dans le sélecteur « Dans ce projet / ce profil / cet article » : les liens d’onglets partent des cadres « sélecteur ouvert » (projet ft_transcendence, profil de Leïla). '
  'Aucun cadre ne montre le sélecteur ouvert d’une chronique : les onglets des chroniques n’ont pas de zone en mobile, et « Commentaires » du sélecteur projet est masqué par son défilement.')
w('- **Visibilité.** Une zone compte si au moins 30 % de l’élément est dessiné dans le cadre (découpe par le cadre et les blocs défilants). '
  'Le résultat « Leïla Mansour » de la recherche mobile (14 px visibles) est donc « sans zone ».')
w('')
w('## Cadres qui ne sont pas l’état de base d’un écran')
w('')
w('Tous les cadres FR clairs correspondent à un écran du plan : aucun n’est hors plan. %d ne sont pas l’état de base de leur écran :' % len(D['unmatched']['variantFrames']))
w('')
grp = collections.OrderedDict()
for v in D['unmatched']['variantFrames']:
    grp.setdefault((v['screen'], v['nature']), []).append(v)
for (scr, nat), vs in grp.items():
    names = sorted({short(v['name']) for v in vs})
    fm = sorted({FMT_FR[v['fmt']] for v in vs})
    w('- `%s` (%s, %s) : %s' % (scr, nat, ' et '.join(fm), ' ; '.join(names)))
w('')
w('Ils servent quand une zone n’existe que là (variantes `alsoFrom`, départs imposés) ou comme cadres d’actions sur place que le plan ne liste pas (tri, vue Liste, pagination, filtres déployés, '
  'suggestions de mention). Ces actions sur place n’ont pas été reliées.')
w('')
w('## Relevés sans cadre Figma : le parcours membre')
w('')
rel = D['unmatched']['releveSansCadre']
w('%d relevés du lot « member » (%s) existent dans `dom/shell/` mais aucun cadre ne les montre dans les plans `layouts/*.json`. '
  'Le 18 octobre, l’utilisateur a demandé de « relever les écrans membre » pour le parcours : ces relevés sont faits, les cadres non. '
  'Conséquence : après la connexion simulée, seuls les trois panneaux membre (compte, messagerie, notifications) sont en membre ; les pages (Explorer, listes, fiches, 42 Awards) '
  'et la fiche « Compte » de Leïla n’existent qu’en visiteur.' % (len(rel), ', '.join(sorted({r['state'] for r in rel}))))
w('')
w('## Vérifications')
w('')
sc = collections.Counter()
for l in L + D['implicitLinks']['tabs'] + D['implicitLinks']['searchOpener']:
    s_ = (l.get('evidence') or {}).get('scene')
    if l.get('hotspot') and isinstance(s_, dict):
        sc[s_.get('match')] += 1
w('- Cohérence : chaque cadre cité existe dans les plans avec ce nom et cette page ; chaque zone est dans son cadre ; les 165 cadres ont une scène de même taille et un identifiant au registre.')
w('- Scènes : %d zones de liens ont un nœud de même boîte dans la scène du cadre, %d sont contenues dans l’instance qui les porte, %d sans nœud.' % (sc['exacte'], sc['contenue'], sc.get('aucune', 0)))
FRM = {(f['state'], f['fmt']): f for f in FR}
SCN = {}
allz = []
def addz(state, fmt, h):
    if h:
        allz.append((state, fmt, h))
for l in L:
    if l.get('fromFrame'):
        addz(l['fromFrame']['state'], l['fmt'], l.get('hotspot'))
        for a in l.get('altHotspots', []):
            addz(l['fromFrame']['state'], l['fmt'], a['hotspot'])
    for a in l.get('alsoFrom', []):
        addz(a['state'], l['fmt'], a['hotspot'])
    if l.get('before'):
        addz(l['before']['fromFrame']['state'], l['fmt'], l['before'].get('hotspot'))
for key in ('tabs', 'searchOpener', 'backToTop'):
    for l in D['implicitLinks'][key]:
        if l.get('fromFrame'):
            addz(l['fromFrame']['state'], l['fmt'], l.get('hotspot'))
for b in D['tabBars']:
    fmt = 'desktop' if b['frame']['w'] > 400 else 'mobile'
    for tb in b.get('tabs', []):
        addz(b['frame']['state'], fmt, tb['hotspot'])
    if b.get('picker'):
        addz(b['frame']['state'], fmt, b['picker']['hotspot'])
for v in S.values():
    for fmt in FMTS:
        for c in (v.get('close') or {}).get(fmt, []):
            addz(c['frame']['state'], fmt, (c.get('close') or {}).get('hotspot'))
            for ot in c.get('other', []):
                addz(c['frame']['state'], fmt, ot['hotspot'])
for fmt in FMTS:
    for e in D['globals'][fmt]:
        for gid, v in e['elements'].items():
            for lab, it in v.items():
                addz(e['frame']['state'], fmt, it['hotspot'])
okz = 0
for state, fmt, h in allz:
    f = FRM[(state, fmt)]
    if (state, fmt) not in SCN:
        SCN[(state, fmt)] = plib.Scene(f['area'], state, fmt)
    inside = h['x'] >= -0.01 and h['y'] >= -0.01 and h['x'] + h['w'] <= f['w'] + 0.01 and h['y'] + h['h'] <= f['h'] + 0.01
    node = any(it['t'] != 'T' and it['w'] > 0 and it['w'] * it['h'] < 0.9 * f['w'] * f['h'] and it['x'] <= h['x'] + 1.5 and it['y'] <= h['y'] + 1.5
               and it['x'] + it['w'] >= h['x'] + h['w'] - 1.5 and it['y'] + it['h'] >= h['y'] + h['h'] - 1.5 for it in SCN[(state, fmt)].items)
    okz += 1 if (inside and node) else 0
w('- Toutes zones confondues (liens, zones alternatives, variantes, actions préalables, Fermer, onglets, éléments toujours présents) : %d sur %d sont dans leur cadre '
  'et dans un nœud de la scène plus petit que le cadre.' % (okz, len(allz)))
w('- Contrôle visuel : zones dessinées sur les captures du site pour %d cadres (`verif/`) ; 8 examinées à l’œil, toutes alignées : liste des projets ordinateur pleine hauteur '
  '(menu du bas, recherche et dé en bas du cadre), fiche projet mobile pleine hauteur, menu d’un commentaire mobile (défilé de 676 px), visionneuse mobile (défilée de 163 px), '
  'sélecteur « Dans ce projet » ouvert, fiche campus déployée, Explorer · Monde mobile, recherche ouverte mobile.' % len(list((OUT / 'verif').glob('*.png'))))
w('- Recouvrements : un seul repéré, sur Explorer · Monde mobile, où le repère de la France (14 × 14 px) est sous l’étiquette « Luxembourg ».')
w('')
w('## Volume pour la construction des deux pages')
w('')
vol = {}
for fmt in FMTS:
    frames_ = set()
    n = collections.Counter()
    for l in L:
        if l['fmt'] != fmt:
            continue
        for k in ('fromFrame', 'toFrame'):
            if l.get(k):
                frames_.add(l[k]['state'])
        if l.get('hotspot') and l['status'] != 'grisé':
            n['clic' if l.get('toFrame') else 'url'] += 1
        if l['status'] == 'automatique':
            n['auto'] += 1
        n['alt'] += len(l.get('altHotspots', []))
        n['also'] += len(l.get('alsoFrom', []))
        n['before'] += 1 if (l.get('before') or {}).get('hotspot') else 0
    for key in ('tabs', 'searchOpener', 'sequences', 'backToTop'):
        for l in IT[key]:
            if l['fmt'] != fmt:
                continue
            for k in ('fromFrame', 'toFrame'):
                if l.get(k):
                    frames_.add(l[k]['state'])
            if key == 'sequences':
                n['auto'] += 1
            elif l.get('hotspot'):
                n['impl'] += 1
    for v in S.values():
        for c in (v.get('close') or {}).get(fmt, []):
            if c.get('close'):
                n['close'] += 1
                frames_.add(c['frame']['state'])
            n['close'] += len(c.get('other', []))
    vol[fmt] = (len(frames_), n)
w('| | Ordinateur | Mobile |')
w('|---|---|---|')
w('| Cadres reliés (départ ou arrivée) | %d | %d |' % (vol['desktop'][0], vol['mobile'][0]))
for key, lab in (('clic', 'Zones de lien du plan vers un cadre (éléments toujours présents détaillés)'), ('url', 'Zones vers un site externe'),
                 ('alt', 'Zones alternatives'), ('also', 'Même commande sur les variantes (`alsoFrom`)'), ('before', 'Actions préalables (`before`)'),
                 ('impl', 'Liens implicites avec zone (onglets, recherche, remonter)'), ('close', 'Fermer, Annuler, Retour de panneau'),
                 ('auto', 'Enchaînements automatiques')):
    w('| %s | %d | %d |' % (lab, vol['desktop'][1][key], vol['mobile'][1][key]))
w('| Total des interactions | %d | %d |' % (sum(vol['desktop'][1].values()), sum(vol['mobile'][1].values())))
w('')
w('Les zones des barres d’onglets entre onglets (`tabBars`) s’y ajoutent si les onglets doivent mener les uns aux autres.')
w('')
w('## Limites')
w('')
w('- Hors ligne : les cadres et identifiants n’ont pas été relus dans Figma ; un changement fait dans le fichier après les scènes ne serait pas vu.')
w('- Les zones viennent des relevés du site ; les cadres Figma en sont construits (scènes), aux limites de rendu connues près.')
w('- Les libellés comparés sont ceux du plan : le plan dit « Publier, puis… » pour les commentaires, le bouton du site s’appelle « Ajouter ». Écart signalé, plan non modifié.')
w('- Les options des listes natives (« Où veux-tu aller ? », « Motif du signalement ») ne sont pas dessinées dans les cadres.')
w('')
(OUT / 'parcours-correspondance.md').write_text('\n'.join(o) + '\n')
print('ok', len(o))
