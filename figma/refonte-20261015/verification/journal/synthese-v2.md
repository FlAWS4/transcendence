# Vérification Figma des Chroniques — synthèse v2 (17 octobre 2026)

**Périmètre.** 32 cadres, soit 16 clairs et leurs 16 clones sombres, répartis en 5 sections :
- liste : 8 cadres ;
- chronique : 8 ;
- médias : 4 ;
- auteurs : 4 ;
- commentaires : 8.

Les captures Figma de section datent de 4 h 23 UTC (`call-results/journal-*-v2.png`). Deux vérificateurs ont relevé 20 défauts.

**Recoupement**, sans outil Figma ni Chrome :
- planches et agrandissements des 16 défauts bloquants et visibles rouverts ;
- code relu : `dom2fig.py`, `render.js`, `assets.py`, `make_call.py`, `svg_text_outlines.py`, ainsi que le CSS et le JS du prototype en cause ;
- relevés `dom/journal/` et des autres zones interrogés ;
- conversion à blanc en mémoire avec le code actuel ;
- lecture des appels régénérés à 12 h 27 (556 à 565). Les appels 558 à 560 sont partis pendant la relecture.

Mesures : [`v2/synthese/controles_synthese.json`](v2/synthese/controles_synthese.json) et [`v2/synthese/guillemet_police.png`](v2/synthese/guillemet_police.png).

## Bilan

- **19 défauts confirmés**, regroupés en 14 causes : 16 sont bloquants ou visibles, 3 sont mineurs.
- **Un défaut non retenu** : la poignée native du champ.
- **Une cause rectifiée.** Le guillemet est dessiné en Liberation Serif, et non en Noto Serif.
- **Le code a changé pendant la vérification.** Entre 12 h 13 et 12 h 29 UTC, une autre session a modifié `dom2fig.py`, `render.js` et `capture_lib.py`, et créé `svg_text_outlines.py`. Ces correctifs couvrent 8 causes sur 14, dont les 2 bloquantes. Les cadres v2 contrôlés sont antérieurs à ces correctifs.
- **Un cadre manque au renvoi.** Le correctif de la cause C est dans le code, mais la liste arabe sur ordinateur ne figure pas parmi les appels régénérés.

| # | Cause | Cadres | Gravité | État (12 h 40) |
|---|---|---|---|---|
| A | Calque fixe jugé « ancré en bas » d'après son centre : la colonne latérale descend de H − 960 | 10 Ordinateur | bloquant | corrigé, `fixed_y()`, appels régénérés |
| E | Texte qui commence en milieu de ligne, après une @mention : mots superposés | 2 Mobile | bloquant | corrigé, `text_nodes()`, appels régénérés |
| B | `line-clamp` : Figma coupe au caractère près (« où e… ») | 4 Mobile | visible | corrigé, `clamp_text()`, appels régénérés |
| C | Rangées d'auteurs RTL tassées à gauche | 2 Ordinateur arabe | visible | corrigé dans le code, **non renvoyé** |
| D | Titre « Montrer ce qui / n'est pas encore fini » | 10 Ordinateur | visible | corrigé, marge de 0,28 px |
| F | Texte indicatif du champ absent | 8 | visible | corrigé, `field_runs()` |
| G | Remplissage de « J'aime » pressé perdu | 4 | visible | corrigé, `fc` et `fillIcon()` |
| H | ☺ rendu en emoji couleur | 8 | visible | **ouvert** |
| I | « “ » et « & » des illustrations dans une police de secours | 20 | visible | **ouvert**, outil prêt |
| J | Trait de `svg{stroke:currentColor}` absent des illustrations d'en-tête et de Médias | 12 | visible | **ouvert, à confirmer** |
| K | Glyphes de l'illustration non décalés en arabe | 8 arabe | visible | **ouvert, à confirmer** |
| L | Coupures des paragraphes arabes | 2 Mobile arabe | mineur | corrigé, boîte serrée |
| M | « 42 Tokyo » au lieu de « Tokyo 42 » dans l'en-tête arabe | 4 arabe | mineur | **ouvert, à confirmer** |
| N | Fond d'atmosphère limité à la hauteur de l'écran | 30 | mineur | **ouvert** |

## Correctifs restants, par priorité

### 1. C — Renvoyer la liste arabe sur ordinateur (visible, 2 cadres)

**Cause.** `flex_layout()` traduisait `justify: normal` (début de ligne) par `pa: 'MIN'`, soit le bord gauche, et `render.js` ignore `rtl`. En arabe, le début de ligne est le bord droit.

**Correctif présent** (`dom2fig.py`, l. 747-749) : MIN et MAX sont inversés pour une rangée RTL. Sur `journal/journal` ordinateur arabe, la conversion actuelle donne MAX pour les 5 rangées ; la scène envoyée donnait MIN.

**À faire.** Cet état manque aux appels 556 à 565 : seules les listes mobiles française et arabe y figurent. Le clonage sombre (565) ne le reprend pas non plus.
- Générer son appel comme 556 à 565 : cadre final « Liste des chroniques — Ordinateur · Clair · العربية », section `170:1332`, cadre actuel `179:14357`.
- Recloner « … · Sombre · العربية » (`214:8080`).
- Le reste de la scène ne change pas, à part `fit: contain` sur les icônes et l'ordre Fond / « Après · Application ».

### 2. I — Glyphes « “ » et « & » vectorisés (visible, 20 cadres)

**Cause.** `assets.py` transmet l'illustration `1jtwtz9-1629` (composant `171:31`) avec ses `<text>`. `figma.createNodeFromSvg` en fait des calques texte et remplace « Georgia,serif » et « monospace » par une police de secours.

**Polices réellement dessinées** :
- **« “ » : Liberation Serif Regular.** C'est la police serif par défaut de Chrome (Times New Roman → Liberation Serif) ; Georgia est absente de ce poste. Comparé au masque rose de la capture, le glyphe donne une IoU de 0,76 en Liberation Serif, contre 0,44 en Noto Serif et 0,13 en DejaVu Serif. Le vérificateur avait déduit Noto Serif de `fc-match serif` : ce n'est pas la police que Chrome emploie.
- **« & » : DejaVu Sans Mono Bold.**

**Outil prêt.** `scripts/svg_text_outlines.py` (autre session, 12 h 29) remplace chaque `<text>` par les contours de ses glyphes, avec sens, ancrage et letter-spacing. Il n'est encore appelé par aucun script.

**Correctif** (`assets.plan()`, branche des illustrations, et `normalise_file()`) :
- appeler `outline_texts(svg, {'font-weight': '400', 'direction': 'ltr'})`. Ce sont les valeurs héritées relevées : `400 16px Jost` et `ltr` dans les cartes comme dans les fiches ;
- créer le composant sous une nouvelle clé et l'inscrire dans `figma-ledger.json`, pour les rendus futurs ;
- dans Figma, remplacer les instances de `171:31` par le nouveau composant (`swapComponent`), en un seul appel sur la page 05 · Chroniques, au lieu de reconstruire 20 cadres. Contrôler d'abord sur un cadre que l'échelle de l'instance est conservée.

Les illustrations de Projets relèvent de la même cause (synthèse Projets v4, § 4).

### 3. H — Glyphe ☺ (visible, 8 cadres)

**Correctif.** Celui de la [synthèse Projets v4](../projects/synthese-v4.md), § 3 : glyphe vectoriel de DejaVu Sans, la police de Chrome, coloré comme le texte.
- Dans les 16 scènes des Chroniques, ☺ est le seul caractère absent de Jost, hors arabe.
- La variable « Chroniques/☺ Emoji » doit alors porter le texte sans le symbole : « Emoji » / « Emoji » / « رمز تعبيري ».

### 4. J, K, M — Signaler trois comportements du site avant de les reproduire

Le site est la source, mais ces trois rendus semblent involontaires. Il faut les signaler à l'utilisateur sans corriger le site, faute de demande :
- **Trait hérité (J).** `projects.css` (l. 9) ne neutralise pas, pour `.cp-project-media-art > svg`, la règle `svg{fill:none;stroke:currentColor;stroke-width:1.6}` de `welcome.css` (l. 3). `content-preview.css` (l. 221-228) la neutralise pour les cartes (`.cp-art > svg {stroke: none}`). Le trait touche aussi Projets, la visionneuse et la fenêtre campus d'Explorer (relevés : `11myu71-1682`, `kz2k1m-1697`, `rqcd84-1681`).
- **Sens des textes SVG (K).** En arabe, le `<svg>` hérite `direction: rtl`, et `text-anchor: start` ancre alors le texte par la droite. « “ » sort de la feuille et « & » chevauche le bord de la fiche, dans les cartes comme dans l'en-tête.
- **Campus sans `<bdi>` (M).** L'en-tête de la chronique affiche « Tokyo 42 », car un simple `<span>` hérite `dir=rtl`. La liste (`welcome.mjs`, l. 575) et la fiche projet (`project-ui.mjs`, l. 160) isolent le nom et affichent « 42 Tokyo ».

### 5. J — Trait hérité, si l'utilisateur garde ce rendu (visible, 12 cadres)

**Correctif.** Celui de Projets v4, § 5 :
- `dom2fig`, branche `svgRef` : clé `svgRef + '~trait'` quand le trait calculé de la racine est opaque et que le balisage n'en donne pas ;
- `assets.py` : `stroke="#1B1B1B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"` sur la racine. L'épaisseur est en unités du viewBox : 1,49 px à 745/800, 0,68 px sur mobile ;
- chaque trait de cette couleur est lié à la variable de la paire #1B1B1B / #FFFFFF, pour devenir blanc dans les clones sombres.

Les contours des glyphes (2) héritent ce trait, comme sur le site. Seuls les cadres Chronique et Médias sont concernés, et les instances peuvent y être remplacées comme en 2.

### 6. K — Glyphes en arabe, si l'utilisateur garde ce rendu (visible, 8 cadres)

**Correctif.**
- Clé `'~rtl'` quand le `<svg>` est en `rtl` et contient un `<text>`.
- `outline_texts(svg, {'direction': 'rtl', 'font-weight': '400'})` : l'ancrage `start` y devient le bord droit, comme dans Chrome.
- Avec le trait, l'illustration compte jusqu'à quatre variantes. Un jeu de composants « Illustration de chronique » à deux propriétés, Trait (oui / non) et Sens (LTR / RTL), les rangerait proprement.

### 7. D — Largeur des titres sur deux lignes : à renforcer seulement si la v3 montre encore la coupure

**Constat.**
- Boîte envoyée : 233,7 px (plus longue ligne + 0,3 + |letter-spacing|).
- Besoin : Figma mesure « Montrer ce qui n'est » sans le letter-spacing final, soit 233,42 px.
- La marge n'est donc que de 0,28 px, alors que « pas » ne remonterait qu'à 281,49 px.

**Correctif** (`text_nodes()`, cas `nl > 1`) :
- mesurer avec `measure_any()` le seuil de remontée : minimum, sur les lignes non finales, de la largeur de « ligne + espace + premier mot suivant », sans letter-spacing final ;
- donner `w = min(wmax, (plus longue ligne + |ls| + seuil) / 2)`, soit ici min(270 ; 257,5) = 257,5 px ;
- la tolérance passe ainsi de 0,28 à environ 24 px de part et d'autre. Même remarque pour Projets (v4, § 13).

### 8. N — Fond d'atmosphère (mineur, 30 cadres)

**Correctif.** Celui de Projets v4, § 6 : dans un cadre plus haut que l'écran, un calque fixe sans enfant qui couvre l'écran (yv ≈ 0, |h − vh| < 1, w ≈ vw) prend h = H. Les centres des dégradés sont en %, ce qui reproduit la capture pleine hauteur du site. Seuls les cadres Auteurs Ordinateur (960 px) sont épargnés.

### 9. M — « Tokyo 42 », si l'utilisateur garde ce rendu (mineur, 4 cadres)

**Cause.** `rlm()` ne vise que les textes qui contiennent de l'arabe.

**Correctif** (`text_nodes()`) :
- dans un élément `rtl`, préfixer d'un RLM un texte sans arabe dont la ligne compte plusieurs fragments bidi dans le relevé, avant `merge_line_rects()`. Exemple : « 42 Tokyo » a 3 rectangles, pour « Tokyo », l'espace et « 42 » ;
- un mot latin seul n'est pas touché.

## Corrigés dans le code : contrôles sur la capture v3

Il n'y a aucun changement de code à faire pour ces causes. Les appels 556 à 565 sont en cours d'envoi, et la chaîne prévoit les captures `journal-*-v3.png`.

- **A — Ancrage des calques fixes (bloquant).** `fixed_y()` teste maintenant le bord haut en coordonnées d'écran.
  - Dans les appels : colonne latérale à 236 (241,8 en arabe), comme sur le site ; menu du bas en bas du cadre (1 505 pour H = 1 597).
  - Tous les relevés français clairs plus hauts que l'écran ont été audités. Les calques fixes sont classés selon la convention :
    - en bas : menus du bas et « remonter en haut » ;
    - en haut : colonnes latérales, dialogues, visionneuse, liens de retour et barre de périmètre.
- **E — Mention en milieu de ligne (bloquant).** Appel 564 : « pour ce récit » à x = 240,9 et « d'atelier. » à x = 24. Ces fragments ne sont plus liés aux variables, sans effet ici : un commentaire est le même dans les trois langues.
- **B — `line-clamp`.** Appels 556 et 557 : les 12 extraits français et les 2 extraits arabes coupés sont identiques au site. `ml` reste posé : si Figma passe encore un extrait sur 3 lignes, il le recoupera au caractère près.
- **F — Texte indicatif.** « Écrivez votre commentaire… » est en `Rôles/muted`, lié à la variable « Chroniques/Écrivez votre commentaire… ».
- **G — « J'aime » pressé.** `fc` vaut `dérivées/icône/2563EB-2563EB`. L'icône est un seul tracé à deux sous-chemins fermés, le pouce et la manchette : tous deux sont pleins, comme sur le site. Les points d'« Actions du commentaire » reçoivent aussi `fc`, sans effet visible.
- **L — Paragraphes arabes.** Ils ont désormais une boîte serrée, calée à droite : 322,2 et 324,3 px au lieu de 342,4.
- **D — Titre** : voir la priorité 7.

## Non retenu

- **Poignée de redimensionnement du champ** (mineur) : c'est un contrôle natif, absent du relevé, comme la flèche des listes déroulantes (limite connue 4).
- À juste titre, les vérificateurs n'ont compté ni le médaillon du globe (limite 3), ni l'heure des commentaires sombres (22:40 / 22:33), ni le menu du bas et la recherche posés en bas des cadres.

## Remarque

Dans `palette.json`, la paire de texte #1B1B1B / #FFFFFF porte le nom `Rôles/logo`. Les textes courants sont donc liés à `Rôles/logo` plutôt qu'à `Rôles/text`. C'est sans effet visuel, mais modifier cette variable changerait aussi tous les textes.

## Limites

- Aucun outil Figma ni Chrome n'a été utilisé. Les correctifs présents sont constatés dans les appels, pas encore dans Figma.
- L'état décrit est celui du code à 12 h 29 et des appels à 12 h 40. La chaîne d'envoi progressait pendant la relecture.
- L'export des sections est à 0,505 px par px pour la liste, et à 0,704 pour les autres sections. Les traits fins y sont jugés sur les agrandissements.
- Écritures : ce fichier, `v2/synthese/controles_synthese.json` et `v2/synthese/guillemet_police.png`. Les scripts de mesure restent hors du dépôt.
- Consigne de lecture seule : `PROJECT_CONTEXT.md`, le journal, le README de la refonte et le relevé ne sont pas mis à jour. Le plan du site n'est pas concerné.
