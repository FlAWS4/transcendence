# Vérification Figma de Projets — synthèse v4 (17 octobre 2026)

**Périmètre.** Deux sections, 20 cadres :
- « Médias » (`project-media`) : 4 cadres ;
- « Commentaires » (`project-comments`) : 16 cadres (Commentaires, avec un fil, tri ouvert, suggestions de mention).

Les cadres Ordinateur de Médias et de Commentaires venaient d'être reconstruits (appels 433 à 435). Les captures Figma de section datent d'environ 6 h UTC. Un vérificateur a relevé 18 défauts.

**Recoupement**, sans outil Figma ni Chrome :
- planches et agrandissements des 16 défauts bloquants et visibles rouverts ;
- code relu : `dom2fig.py`, `render.js`, `figlib.py`, `assets.py`, `layout.py`, `build_palette.py`, `capture_lib.py`, `capture_projects.py`, `section_frames.py`, ainsi que le CSS et le JS du prototype en cause ;
- relevés `dom/*/` interrogés ;
- conversion à blanc en mémoire avec le code de 12 h 22 UTC, puis lecture des scènes régénérées à 12 h 27.

Mesures : [`v4/synthese/controles_synthese.json`](v4/synthese/controles_synthese.json).

## Bilan

- **17 défauts confirmés**, regroupés en 12 causes : 16 sont bloquants ou visibles, 1 est mineur.
- **Aucun défaut écarté.** La poignée native du champ (mineur) n'est pas retenue.
- **Une cause rectifiée.** Le vérificateur pensait que `outline` n'était pas relevé. `capture_lib.py` le relève bien (`styleOf`) ; c'est `dom2fig.py` qui l'ignore.
- **Le code a changé pendant cette relecture.** Entre 12 h 13 et 12 h 22 UTC, une autre session a modifié `dom2fig.py`, `render.js` et `capture_lib.py` (correctifs datés du 17 octobre).
  - Ces correctifs couvrent 7 causes sur 12, dont les 3 bloquantes.
  - Les scènes et les appels de toutes les zones ont été régénérés à 12 h 27 (appels 526 à 609 au moment de la relecture).
  - Les scènes montrent les bonnes positions (voir la section « Corrigés dans le code »). Rien n'est encore envoyé, ni vérifié sur une capture Figma.
- **Restent ouverts** :
  - 4 causes dans Figma : anneau de focus, glyphe ☺, chasse fixe des SVG, trait hérité des illustrations ;
  - 1 cause mineure : fond limité à la hauteur de l'écran ;
  - 1 correction de l'outil de contrôle.

| # | Cause | Cadres v4 | Gravité | État (12 h 27) |
|---|---|---|---|---|
| A | Calque fixe jugé « ancré en bas » d'après son centre : la colonne latérale descend de H − 960 | 10 Ordinateur | bloquant | corrigé, `fixed_y()` |
| B | Défilement non retranché aux calques fixes et collants (états relevés page défilée) | 6 | bloquant | corrigé, `fixed_y()` et `inflow_positions()` |
| C1 | Valeur et texte indicatif des champs absents | 4 et 12 | bloquant et visible | corrigé, `field_runs()` |
| C2 | Anneau de focus (`outline`) non converti | 4 | visible | **ouvert** |
| D | Texte qui commence en milieu de ligne, après une @mention | 4 Mobile | visible | corrigé, `text_nodes()` |
| E | z-index d'un descendant ignoré : le commentaire passe sur le menu du tri | 4 | visible | corrigé, `z_index()` et `zsort()` |
| F | Remplissage CSS de « J'aime » pressé perdu | 8 | visible | corrigé, `fc` et `fillIcon()` |
| G | Titre coupé « Derrière une ligne / de commande » | 10 Ordinateur | visible | corrigé, à confirmer |
| H | ☺ rendu en emoji couleur | 16 | visible | **ouvert** |
| I | Textes `monospace` des SVG en police proportionnelle | 4 | visible | **ouvert** |
| J | Trait de `svg{stroke:currentColor}` absent des illustrations | 4 | visible | **ouvert, à confirmer** |
| K | Fond d'atmosphère limité à la hauteur de l'écran | 20 | mineur | **ouvert** |

## Correctifs restants, par priorité

### 1. Outil `section_frames.py` : états défilés (pas un défaut Figma)

**Constat.** Certaines captures du site sont prises page défilée :
- « tri ouvert » : 169 px sur ordinateur, 530 px sur mobile ;
- « suggestions de mention » sur mobile : 207 px ;
- ailleurs : « Menu à trois points » (324 et 676 px), visionneuse mobile (163 px), « Remonter en haut » (1 400 px).

L'outil les compare au haut du cadre Figma. En v4, les taux en étaient gonflés : de 4,7 à 9,8 %, contre 2,8 à 6,2 % une fois recalés. Avec les scènes corrigées, qui montrent la page en haut, la comparaison deviendra fausse.

**Correctif** (boucle des cadres) :
- lire `scroll` dans le relevé du cadre : `dom/<zone>/<état>--<format>--<langue>-<thème>.json.gz` ;
- comparer la capture du site à la bande [sy ; sy + hauteur mesurée] du cadre Figma, en plaçant le haut de la découpe à `y0 + sy·ky` ;
- masquer dans les deux images les boîtes des calques fixes et collants du relevé, en coordonnées d'écran, puisque la convention les place ailleurs ;
- sur la planche, poser la capture du site à y = sy et tracer les deux bords de la bande ;
- écrire `scrollY` dans `index.json`.

### 2. Anneau de focus — visible, 4 cadres « suggestions de mention »

**Cause.** Le relevé du champ porte `outline: 2px solid rgb(0, 142, 144) off 3px` (en sombre : `rgb(150, 163, 235)`). C'est le seul `outline` de tous les relevés.
- `frame_paints()` ne lit pas cette propriété.
- La paire #008E90 / #96A3EB (`--h42-color-focus`) n'a jamais été peinte, donc elle manque à `palette.json`. `cref()` rendrait #008E90 dans les deux thèmes.

**Correctif.**
- `dom2fig.build()`, après `build_one()` : si `s.outline` a une largeur w > 0 et un décalage d, ajouter après le cadre du champ un frère « Anneau de focus » :
  - position (x − d − w, y − d − w), taille (W + 2(d + w)) × (H + 2(d + w)) ;
  - sans remplissage, contour INSIDE de w ;
  - rayons r + d + w (18 → 23 px) ;
  - couleur `cref('bordure', clair, sombre)` ;
  - c'est un frère et non un enfant, car le champ rogne son contenu (`overflow: auto`). Il reprend le `_z` du champ.
- `any_kind()` : sans paire observée, chercher la paire dans `css-color-vars.json` et prendre le nom CSS, ici `Rôles/focus`.
- Vérifier que `Rôles/focus` existe dans Figma : sinon `render.js` peint en magenta et la signale dans `missing.vars`.
- Facultatif : le curseur après « Bravo @in » (1 × 23 px, couleur du texte).

### 3. Glyphe ☺ — visible, 16 cadres (et les commentaires des Chroniques)

**Cause.** « ☺ Emoji » forme un seul run en Jost 14 px. Jost n'a pas U+263A :
- Chrome le dessine en DejaVu Sans, monochrome, de la couleur du texte ;
- Figma prend un emoji couleur.

**Correctif** (`dom2fig.text_nodes()`), même méthode que les chiffres du scan :
- repérer les caractères absents de la table `cmap` de Jost, lue avec `font_outlines.TTF`, hors arabe ;
- dessiner chacun en glyphe vectoriel : composant « Glyphe/DejaVu Sans ☺ » tiré de `DejaVuSans.ttf` (glyphe 3858, avance 2135/2048 em, glyphe simple : contrôlé) ;
- le poser sur la ligne de base du run et le colorer comme le texte (`col`, `st: 0`) ;
- placer « Emoji » à : x du run + largeur du run − largeur mesurée de « Emoji ».

Variante plus simple : `setRangeFontName` sur ce caractère, avec une police monochrome présente dans Figma, comme pour l'arabe. Il faut d'abord vérifier qu'une telle police existe.

### 4. Textes `monospace` des SVG — visible, 4 cadres (et d'autres écrans)

**Cause.** `assets.py` transmet `font-family="monospace"` tel quel. Chrome dessine ces textes en DejaVu Sans Mono. Figma ne l'a pas et prend une police proportionnelle. Ressources concernées :
- le schéma `minishell-flow-demo.svg` : 9 textes, dont MINISHELL avec un letter-spacing de 4 ;
- l'illustration de Minishell `11myu71-1682` (« $ ./minishell »), présente aussi dans les cartes ;
- `rqcd84-1681`, l'illustration de la visionneuse ;
- `1jtwtz9-1629`, l'illustration des Chroniques. Elle contient aussi du `Georgia,serif`, absente de ce poste ; la police de secours de Chrome reste à identifier (probablement Liberation Serif, par la police serif par défaut).

**Correctif** (`assets.py`) : une nouvelle fonction, appelée par `normalise_file()` et pour les illustrations en ligne.
- Remplacer chaque `<text>` dont la famille, propre ou héritée d'un `<g>`, est `monospace` par un `<path>` :
  - contours de `DejaVuSansMono.ttf`, avec `font_outlines.TTF` et `svg_path()` ;
  - échelle = taille / 2048 ; décalage horizontal = x + avance cumulée ; ligne de base = y ;
  - avance de 1233/2048 em, plus le letter-spacing ;
  - le fill est gardé, ainsi que le trait hérité.
- Tous les glyphes utiles sont simples, donc lisibles par le lecteur actuel (contrôlé).
- Pour `Georgia,serif` : identifier la police de secours sur la capture, puis la vectoriser de même. Si c'est Liberation Serif, Tinos, de même dessin, existe dans Figma.
- Ces ressources figurent déjà dans le relevé des identifiants : les recréer sous une nouvelle clé, puis relancer les cadres qui les utilisent.

### 5. Trait hérité des illustrations — visible, 4 cadres ; à confirmer par l'utilisateur

**Cause.** La règle globale de `welcome.css`, `svg{fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}`, atteint dans les fiches toutes les formes et tous les textes sans trait propre :
- 13 à 15 éléments par illustration ;
- trait #1B1B1B en clair, blanc en sombre.

`assets.py` garde le SVG tel quel (il a un `xmlns`) : ce trait est perdu.

**Probablement involontaire côté site.** Dans les cartes (`cp-cover`), la même illustration n'a pas de trait ; dans les fiches, elle en a un. À faire confirmer par l'utilisateur avant de le reproduire. S'il corrige le site, il n'y a rien à faire dans Figma.

**Correctif, si l'utilisateur garde ce rendu.**
- `dom2fig`, branche `svgRef` : quand le trait calculé de la racine est une couleur et que la racine n'a pas d'attribut `stroke` :
  - employer la clé `svgRef + '~trait'` ;
  - noter le trait (#1B1B1B, 1,6) et sa variable, `cref('icône', …)` → `Rôles/logo` ;
  - les cartes gardent le composant sans trait.
- `assets.py`, pour ces clés :
  - ajouter sur la racine `stroke`, `stroke-width="1.6"`, ainsi que `stroke-linecap` et `stroke-linejoin` à `round`. L'épaisseur est en unités du viewBox : l'échelle 745/800 donne les 1,49 px de Chrome ;
  - dans l'appel, lier à la variable chaque trait de cette couleur, pour qu'il soit blanc dans les clones sombres.
- Ressources concernées :
  - `11myu71-1682` : Médias, fiche à campus unique, visionneuse, fenêtre campus d'Explorer ;
  - `kz2k1m-1697` : fiche de ft_transcendence ;
  - `rqcd84-1681` et `1jtwtz9-1629`.

### 6. Fond d'atmosphère limité à la hauteur de l'écran — mineur

**Cause.** `.atmosphere` est fixe et haute de 100vh, soit 960 ou 844 px.
- Dans la capture pleine hauteur du site, 100vh vaut la hauteur de la page.
- Dans Figma, le dégradé s'arrête à 960 ou 844 px : on voit une marche d'environ 4 niveaux en sombre.

**Correctif** (`dom2fig`, `build_one`) : dans un cadre pleine hauteur, un calque fixe sans enfant qui couvre l'écran prend h = H. Conditions : yv ≈ 0, |h − vh| < 1 et w ≈ vw.

## Corrigés dans le code : contrôles après l'envoi (priorités 7 à 13)

Aucun changement de code n'est à faire pour ces causes. Il faut envoyer les appels régénérés, puis vérifier sur une nouvelle capture, avec l'outil corrigé (1) pour les états défilés.

### 7. A — Ancrage des calques fixes (bloquant)

- **Correctif présent** (`fixed_y()`) : un calque est ancré en bas si son bord haut, en coordonnées d'écran, est sous la mi-hauteur.
- **Constaté dans les scènes** : colonne latérale à 236 dans les 5 états Ordinateur. Les dialogues de connexion de Compte sont revenus en haut (titre à 361 et à 303).
- **À contrôler** : la colonne doit être alignée sur l'illustration ou sur le champ. Contrôler aussi les fiches de Profils, des Chroniques et la fenêtre campus.

### 8. B — États défilés (bloquant)

- **Correctif présent** : `fixed_y()` retranche `scroll` ; `inflow_positions()` remet les éléments collants à leur place dans le flux.
- **Constaté dans les scènes** :
  - en-tête à 0, « Retour aux projets » à 152 ;
  - « Monde » à 40 et à 84 ;
  - menu du bas à 1229, 1561 et 1518 ;
  - sélecteur mobile à 380 ;
  - visionneuse mobile en haut.
- **À contrôler** : ces positions dans les 6 cadres, ainsi que dans « Menu à trois points » et « Remonter en haut ».

### 9. C1 — Valeur et texte indicatif (bloquant ou visible)

- **Correctif présent** : `field_runs()`, avec la couleur `--h42-color-muted` lue dans les variables du relevé.
- **Constaté dans les scènes** :
  - « Écrivez votre commentaire… » en `Rôles/muted`, en (543 ; 342,8) sur ordinateur et en (42 ; 576,6) sur mobile ;
  - « Bravo @in » en `Rôles/logo`.
- **À contrôler** : les 12 cadres avec texte indicatif et les 4 avec saisie, en clair et en sombre.

### 10. D — Texte en milieu de ligne (visible)

- **Correctif présent** (`text_nodes()`) : chaque ligne devient un texte d'une ligne.
- **Constaté dans les scènes** : « pour le découpage » à x = 222,72 et « des redirections. » à x = 24.
- **À contrôler** : la ligne continue dans les 4 cadres mobiles.
- **Limite** : les textes ainsi découpés ne sont plus liés aux variables FR/EN/AR. Exemples : la légende de la visionneuse mobile, la messagerie et les notifications de Compte.

### 11. E — Ordre d'empilement (visible)

- **Correctif présent** : `z_index()` et `zsort()`. Le `_z` est gardé quand l'enveloppe est aplatie.
- **Constaté dans les scènes** : `#project-comment-sort-menu` vient après la liste des commentaires.
- **À contrôler** : le menu passe au-dessus et le commentaire n'est visible que voilé.
- **Limite** : un `_z` ne remonte qu'entre les enfants d'un même cadre.

### 12. F — « J'aime » pressé (visible)

- **Correctif présent** : `fc` dans `dom2fig`, `fillIcon()` dans `render.js`.
- **Constaté dans les scènes** : `fc` vaut `dérivées/icône/2563EB-2563EB`, une variable qui existe dans le relevé.
- **À contrôler** : pouce plein bleu dans les 8 cadres. Aucune icône relevée ne mélange formes pleines et creuses ; tout remplir est donc sans risque.

### 13. G — Titre (visible, à confirmer)

- **Correctif présent** : la marge vaut 0,3 px plus la valeur absolue du letter-spacing.
- **Constaté dans les scènes** : largeur de 252,95 au lieu de 252,25. Chrome mesure 251,95 px, et `jost-1.ttf` le confirme.
- **À contrôler** : « Derrière une ligne de / commande ».
- Si « de » passe encore à la ligne, il faudra donner à `fitLines()` le texte de chaque ligne (`split_run()`) et une sonde de texte, au lieu d'une marge fixe.

## Non retenu

- **Poignée de redimensionnement** du champ (mineur) : contrôle natif, absent du relevé, comme la flèche des listes déroulantes.
- Le vérificateur n'a pas compté, à juste titre :
  - le médaillon du globe (limite 3) ;
  - l'heure 06:01 au lieu de 06:00 des captures sombres ;
  - l'anticrénelage ;
  - le menu du bas en bas des cadres non défilés.

## Limites

- Aucun outil Figma ni Chrome. Les 7 correctifs présents sont constatés dans les scènes, pas encore dans Figma.
- L'état décrit est celui du code à 12 h 22 et des scènes à 12 h 27. La numérotation des appels changeait pendant la relecture.
- La capture Figma de Commentaires est à 0,425 px par px de cadre. Les petits textes y sont flous : seuls leur présence, leur position et leurs coupures ont été contrôlées.
- Présence de `Rôles/focus` dans Figma non vérifiable ici.
- Écritures : ce fichier et `v4/synthese/controles_synthese.json`.
- Consigne de lecture seule : `PROJECT_CONTEXT.md`, le journal, le README de la refonte et le relevé ne sont pas mis à jour. Le plan du site n'est pas concerné.
