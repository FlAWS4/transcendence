# Vérification Figma d'Explorer — synthèse (16 octobre 2026)

**Périmètre.** Zone « explorer » : 8 sections et 52 cadres (FR clair et sombre, ordinateur et mobile ; arabe pour Monde, Pays, Campus et Sans globe). Quatre vérificateurs ont relevé 29 défauts. Pour les recouper :
- planches et agrandissements des 22 défauts « bloquant » et « visible » rouverts ;
- code relu : `capture_lib.py`, `capture_explorer.py`, `dom2fig.py`, `figlib.py`, `render.js`, `assets.py`, `layout.py`, `globe_svg.py` et `globe_assets.py`, ainsi que le CSS du prototype concerné ;
- relevés `dom/explorer/` et `reference/explorer/index.json` interrogés ;
- essais à blanc, sans écriture dans le projet : conversion arabe avec le relevé sombre FR, mesures de texte avec `jost-0.ttf`.

Travail en lecture seule : aucun correctif appliqué, aucun appel Figma.

**Bilan.** 28 défauts confirmés et regroupés en 14 causes. Un défaut est écarté (flou du bord du globe, toléré) et deux ne sont confirmés qu'en partie (voir la fin). Aucun correctif n'exige de nouveau relevé : les données manquantes se retrouvent dans les relevés actuels, dans l'index des captures ou dans le CSS. Une correction durable du relevé est proposée en plus.

## Correctifs par priorité

### 1. Fenêtre « Autour du campus » : globe Monde à la place du plan — bloquant, 4 cadres
- **Défaut.** La carte montre le globe Monde entier ; le repère « 42 Paris » tombe sur le Niger. L'emplacement « Canvas · Map · à remplacer » manque.
- **Cause.** `dom2fig.globe_asset()` choisit entre globe et plan d'après la seule route de la page. Ici, la route est `#projects/minishell-under-the-prompt`, sans `campus=`, donc le globe Monde est choisi. Le canvas se trouve pourtant dans `#campus-map-dialog > #campus-map-viewport`.
- **Correctif.**
  - `globe_asset(dump, fmt, n, byI)` remonte les ancêtres du canvas. Si l'un d'eux est `#campus-map-dialog` ou `.campus-map-viewport`, elle renvoie `None`. L'emplacement prend alors la taille du canvas : 1078 × 576 en (181, 189), 364 × 599 en (13, 102).
  - Reconvertir les 2 scènes, puis refaire les 2 clones sombres.

### 2. Logos des campus agrandis et rognés (`object-fit: contain` ignoré) — bloquant, 8 cadres
- **Défaut.**
  - Paris : logo de 382 × 268 rogné à 90 px de haut ; il n'en reste que deux pavés.
  - Mulhouse : logo de 382 × 149 ; « Grand Est » est coupé.
- **Cause.** Le relevé contient `objectFit: 'contain'`, mais `dom2fig` (branche `img`) ne le transmet pas. `render.js` (branche S/P) applique donc toujours `Math.max(k, kh)`, c'est-à-dire « cover ».
- **Correctif.**
  - `dom2fig.build_one`, branche `img` : poser `node['fit'] = 'contain'` si `objectFit` vaut `contain` ou `scale-down`.
  - `render.js` : `const kk = n.fit === 'contain' ? Math.min(k, kh) : Math.max(k, kh)`, centré comme aujourd'hui.
  - Tailles attendues : 128 × 90 pour Paris, 231 × 90 pour Mulhouse.

### 3. Logo de 42 Paris noir au lieu de blanc (filtre SVG) — bloquant, 6 cadres
- **Cause.**
  - `paris-logo-official.svg` peint ses formes en #000105 et les blanchit par un `feColorMatrix` (`filter="url(#filter-1)"`).
  - L'import SVG de Figma ignore ce filtre. L'appel 094 a envoyé le fichier tel quel (composant `77:7905`).
- **Correctif.**
  - Immédiat (1 appel) : remplir en #FFFFFF tous les vecteurs de `77:7905`. Le logo est blanc dans les deux thèmes, et sa case reste #1D1D1F.
  - Durable, dans `assets.py`, `normalise_file()` : repérer un `feColorMatrix` dont la sortie est une couleur constante (`0 0 0 0 R / 0 0 0 0 G / 0 0 0 0 B / 0 0 0 A 0`). Donner cette couleur aux `fill` et `stroke` peints du groupe filtré, puis retirer `filter=` et `<filter>`.

### 4. Sélecteurs « Pays » et « Campus » vides — bloquant, 4 cadres
- **Cause.**
  - `capture_lib` (EXTRACT_JS) ne relève une valeur que pour `input` et `textarea`.
  - Les `<option>` sont écartées, car leur boîte est nulle, et la flèche native n'est pas dans le DOM.
  - Les libellés existent pourtant déjà : `reference/explorer/index.json`, `checks.popover`. Valeurs `""`, donc première option : « Tous les pays / Tous les campus », « All countries / All campuses », « جميع الدول / جميع الفروع ».
- **Correctif.**
  - Immédiat, `dom2fig` (au chargement des trois langues, avant `pair_strings`) : pour chaque `select` de `#scope-popover`, créer un run avec ce libellé. Position mesurée sur la capture du site : texte à 17 px du bord (bordure 1 + marge intérieure 12 + 4 px internes de Chrome), ligne de base à 30 px sur 49. En RTL, le texte est aligné à droite. Le texte est alors lié aux variables FR/EN/AR.
  - Flèche native : instance `i-down` d'environ 19 px (chevron de 8 × 5 px), centrée à w − 9,5 px et h/2 (miroir en RTL), couleur `cref('icône', color, couleur sombre)`.
  - Durable, `capture_lib` : pour `select`, relever `el.selectedOptions[0].text` et sa largeur (`measureText`), ainsi que `appearance`. Cela couvre aussi `content-report-1-reason` (signalements de Projets et Profils), qui est probablement vide lui aussi.

### 5. Flèches de direction des campus en trop — visible, 8 cadres Pays
- **Défaut.** Une flèche s'affiche dans chaque repère (« 42↑Paris ») et à côté de chaque point compact.
- **Cause.** `capture_lib` n'écarte que les éléments dont l'opacité propre est ≤ 0,01. `.hg-campus-arrow` (opacity 0) est donc écartée, mais son `svg` enfant (opacity 1) est gardé et rattaché au repère (`1kl8k69-88`).
- **Correctif.**
  - Immédiat, `dom2fig.build_one` : ignorer un `svg` dans deux conditions réunies :
    - son parent DOM (sa clé sans le dernier segment) manque au relevé ;
    - son parent relevé est un `.hg-marker` sans `hg-offscreen`.
  - Durable, EXTRACT_JS : écarter un élément si son opacité cumulée est ≤ 0,01. Le calcul se fait avec un cache par élément : opacité × opacité cumulée du parent.

### 6. Anneaux `box-shadow: 0 0 0 Npx` absents — visible, 36 cadres
- **Défauts.**
  - Halo de 5 px des points : Monde, Pays, « Où veux-tu aller ? ».
  - Réticule sans halo de 9 px ni anneau rose de 4 px : Campus, Fiche campus, Fenêtre.
- **Cause.**
  - `render.js` pose ces ombres (flou 0, décalage 0, étalement N) sur des cadres sans `clipsContent`.
  - Figma n'applique l'étalement d'une ombre portée qu'aux rectangles, aux ellipses et aux cadres qui rognent leur contenu.
  - Avec `showShadowBehindNode = false`, rien ne dépasse du nœud.
- **Correctif**, dans `render.js`, branche des cadres, après `effects`. Pour chaque ombre `D` à étalement seul, quand `!n.c` :
  - cadre sans enfant (les points) : `f.clipsContent = true` ;
  - cadre avec enfants (le réticule) :
    - retirer l'ombre des effets ;
    - insérer en premier enfant un cadre « Halo » de (w + 2N) × (h + 2N), placé en (−N, −N) ;
    - ce cadre n'a pas de remplissage et porte un contour INSIDE de N px, lié à la couleur de l'ombre, avec un rayon r + N par coin ;
    - si le parent est en auto-layout, `layoutPositioning = 'ABSOLUTE'`.

### 7. Textes d'une ligne tronqués ou renvoyés à la ligne — visible, 20 cadres (et 2 mineurs)
- **Défauts.**
  - « Fran… » : Pays, Campus, Fiche campus.
  - « لوكسمبورغ » sur deux lignes : Monde mobile en arabe.
  - « استكشف محيط الفرع. » sur deux lignes : Campus en arabe.
  - Mineur : « …avec / des positions » coupé ailleurs dans « Une nouvelle façon d'explorer » (mobile).
- **Cause**, dans `dom2fig.text_nodes()` :
  - Une ligne avec `text-overflow: ellipsis` reçoit la largeur mesurée exacte et `ml = 1` : le moindre écart de chasse dans Figma tronque. Or les 522 textes à ellipse des relevés FR tiennent tous en entier : leur largeur mesurée égale celle du texte (±0,11 px).
  - Une ligne centrée ou alignée à droite reçoit la largeur mesurée + 2 px. Le Noto Sans Arabic de Figma dépasse cette marge.
  - Un texte de plusieurs lignes reçoit la boîte de contenu + 0,4 px. « …réseau 42, avec des » mesure 302,26 px (Jost, RAQM) : le navigateur renvoie « des » à la ligne dans 302 px, Figma le garde dans 302,4 px.
- **Correctif.**
  - Une ligne, sans `line-clamp` : émettre `aw: 1` avec la largeur mesurée. `render.js` passe en `WIDTH_AND_HEIGHT`, puis recale x selon l'alignement : x + (w − largeur)/2 au centre, x + w − largeur à droite. `ml` seulement si le texte était tronqué : relever `scrollWidth > clientWidth`.
  - Plusieurs lignes : émettre `nl`. `render.js` ajuste la largeur par pas de 0,1 px jusqu'à retrouver `nl` lignes, entre la plus longue ligne mesurée et la boîte + 2 px.

### 8. Pseudo-éléments : verre sans flou, poignée déplacée, décalages de 1 px — visible, 20 cadres et tous les écrans avec le dock
- **Défauts.**
  - La carte transparaît nettement à travers le dock et le fil géographique, surtout en sombre.
  - La poignée de la feuille mobile est collée en haut à gauche de sa zone.
  - Le verre du dock mesure 634 × 58 en (−1, −1), et la croix du réticule est décalée de 1 px.
- **Cause**, dans `dom2fig.pseudo_frame()` :
  - le style transmis à `frame_paints` omet `backdrop` ;
  - un pseudo-élément statique (`top` et `left` à `auto`) est placé en (0, 0), sans l'alignement flex de son propriétaire ;
  - les décalages partent de la boîte de bordure du propriétaire : sa bordure est ignorée, même transparente ;
  - la taille omet la bordure du pseudo-élément.
- **Correctif.**
  - Ajouter `s['backdrop'] = ps.get('backdrop')` : effet B de 52.
  - Pseudo-élément non positionné : appliquer `j:` et `a:` du flex du propriétaire. Pour la poignée, le décalage devient (8, 20).
  - Ajouter aux décalages la bordure du propriétaire, en lisant sa largeur même transparente.
  - Taille : si les deux décalages d'un axe sont en px, prendre la boîte de remplissage − début − fin ; sinon, la taille calculée + les bordures propres.
  - Le verre du dock et du fil revient dans Projets, Profils et Commun. À vérifier : les cases à cocher (`input::after` en grille) de Projets et Profils.

### 9. Icônes tournées ou en miroir — visible, 18 cadres
- **Défauts.**
  - Le séparateur du fil affiche « ⌄ » au lieu de « › », ou de « ‹ » en arabe.
  - En arabe, le bouton retour affiche « ← » au lieu de « → ».
- **Cause.** `dom2fig` ne garde du `transform` que l'échelle (`own_scale`), et `render.js` ne tourne pas les instances.
- **Correctif.**
  - `own_matrix(n)` renvoie (a, b, c, d) divisé par l'échelle.
  - Branches `I` et `S` : poser `node['tf']` si la matrice n'est pas l'identité.
  - `render.js`, après `place()` : `relativeTransform = [[a, c, cx − (a·w + c·h)/2], [b, d, cy − (b·w + d·h)/2]]`, où (cx, cy) est le centre de la boîte relevée.
- **Hors Explorer.**
  - En arabe, de nombreuses icônes sont en miroir dans Projets, Profils et Commun.
  - En FR, quelques icônes sont tournées de 180° : `1pci56f-81`, `zhjh88-105`, `1ehl152-105`.

### 10. Adresse sur une ligne — visible, 6 cadres
- **Cause.**
  - `capture_lib` réduit les espaces du texte des runs (`/\s+/ → ' '`), ce qui supprime les sauts de ligne de `white-space: pre-line`.
  - `text_nodes` donne alors toute la boîte de contenu (426 px) au texte, qui tient sur une ligne.
- **Correctif.**
  - Immédiat, dans `text_nodes` : pour `pre`, `pre-line`, `pre-wrap` et `break-spaces` avec `nl > 1`, retrouver les coupures. Il suffit de répartir les mots pour que chaque ligne ait la largeur relevée, en les mesurant avec `jost-0.ttf` et RAQM. L'essai donne « KMØ / 30 rue François Spoerry / 68100 Mulhouse » et « 96, boulevard Bessières / 75017 PARIS / France », à 0,01 px près. Joindre les lignes par `\n`, y compris dans les valeurs EN/AR quand elles diffèrent.
  - Durable : garder `\n` dans le relevé pour ces valeurs de `white-space`. À contrôler aussi : les commentaires `pre-wrap` de Projets.

### 11. Crédits de la carte masqués — visible, 16 cadres
- **Cause.**
  - `.map-credit` (z-index 5) est sous `#globe` (z-index 7), comme dans le CSS.
  - Sur le site, le `mask-image` de `.hg-faded` rend le canvas transparent sur les bords, ce qui laisse voir les crédits.
  - Dans Figma, le fondu du globe Pays est peint en `Rôles/bg` opaque (`globe_svg.py`, groupe `fade`), et l'emplacement du plan est opaque à 60 %.
- **Correctif.** Dans `dom2fig.order()`, placer `.map-credit` juste au-dessus de `#globe` (clé : z du globe + 0,5). C'est le rendu visible du site. À terme : faire du fondu un masque alpha dans les composants Pays.

### 12. Fond sombre de « Sans globe » en arabe — visible, 2 cadres
- **Cause.**
  - Explorer n'a pas de relevé AR sombre pour `explore-noglobe`, `explore-country` et `explore-campus` (6 cadres AR sombres).
  - `convert()` apparie donc sans élément sombre : les deux dégradés radiaux propres au sombre manquent, et l'arrêt à 70 % reste lié à `Rôles/bg`, opaque.
  - Pour Pays et Campus, la carte cache le fond.
- **Correctif.**
  - Dans `convert()`, à défaut de relevé sombre dans la langue, prendre le relevé sombre FR. N'apparier que les nœuds de même clé, même balise et même classe.
  - L'essai à blanc apparie 64 nœuds sur 65, et 102 sur 103. « Fond » retrouve ses 5 couches et les mêmes variables que le FR.
  - Reconvertir les cadres AR clairs, puis refaire leurs clones.
  - Autre solution : `capture_explorer.py … variants=ar-dark only=explore-noglobe,explore-country,explore-campus`.

### 13. Creux du médaillon absent dans le fil — visible, 16 cadres
- **Cause.**
  - `styleOf` ne relève pas `mask-image`.
  - Le `::before` de `.scope-path` est percé d'un disque de 32 px : `radial-gradient(circle at var(--scope-seat-x) 50%, transparent 15.5px, #000 16px)`. Le disque est à 22 px du bord de départ, soit `calc(100% − 22px)` en RTL. La carte non floutée y apparaît.
- **Correctif.**
  - `pseudo_frame()` pose `hole = [22 ou w − 22, h/2, 15,75]` sur ce pseudo-élément. Le motif est connu : aucun relevé n'est nécessaire. Plus tard, relever `mask` dans `styleOf` et lire ce motif de façon générale.
  - `render.js`, branche `hole` : donner au rectangle les rayons du cadre avant `subtract`, sinon la pilule perd ses bouts arrondis.
  - Le flou d'arrière-plan passe à la forme percée, comme en CSS.

### 14. Globe : îlots absents et frange arctique trop fine — mineur
- **Cause.** Dans `globe_svg.py`, les îlots de moins de 0,75 px² sont supprimés, et la simplification Douglas-Peucker est réglée à 0,75 px (ordinateur) et 0,5 px (mobile). C'est déjà noté dans `assets/globe/README.md`.
- **Correctif.**
  - Garder les îlots sous forme de points d'au moins 1 px.
  - Ajouter sur `land-union` un contour extérieur de 0,5 px, couleur des terres.
  - Renvoyer les composants par morceaux.

## Ordre d'application conseillé
1. **Immédiat** : corriger le composant `77:7905` (point 3), en 1 appel.
2. **Code** :
   - `dom2fig` : points 1, 2, 4, 5, 7, 8, 9, 10, 11, 12 et 13 ;
   - `render.js` : points 2, 6, 7, 9 et 13, plus `if (n.o !== undefined)` ;
   - `assets.py` : point 3 ;
   - fonctions factices de `sim_figma.mjs`, si nécessaire.

   Les correctifs durables du relevé (`capture_lib` : opacité cumulée, `select`, sauts de ligne, `mask`, troncature) peuvent attendre le prochain relevé.
3. **Rendu** :
   1. `layout.py scenes explorer` ;
   2. simulation avec `sim_figma.mjs` ;
   3. envoi d'abord d'un cadre test : Explorer · Campus, ordinateur clair, qui réunit anneaux, textes, icônes, crédits et creux ;
   4. ensuite, le reste par les coursiers ;
   5. enfin, `layout.py dark explorer`.
4. **Nouvelle vérification.**

## Écartés ou nuancés
- **Flou du bord du globe sur mobile** (`.hg-map::after`, flou d'arrière-plan sous masque radial) : écarté.
  - C'est un écart d'ombrage du globe, toléré par les limites connues. Le 3e vérificateur a toléré le même effet sur « Où veux-tu aller ? ».
  - Amélioration facultative : anneaux elliptiques dont le flou d'arrière-plan croît vers l'extérieur.
- **Flèches en trop sur Campus, Fiche campus et Fenêtre** : le calque est présent, mais caché sous le point du réticule ; il n'a pas d'effet visible. Le défaut est maintenu pour Pays.
- **Crédits estompés sur Campus** : c'est l'effet de l'emplacement du plan (limite connue). Le même correctif d'ordre le règle. Le défaut est maintenu pour Pays.
- **Gravité du halo** : signalé « mineur » sur Pays et « Où veux-tu aller ? », il est harmonisé en « visible ». La cause est la même, et il se voit nettement en clair.
- **Point latent, sans effet visible** : `render.js` ignore `o: 0`. C'est le cas de « Après · Application » dans 24 scènes d'Explorer, caché sous « Fond ». Écrire `if (n.o !== undefined)`.
- **Hors défauts (limite connue)** : le remplissage de l'emplacement du plan n'est lié à aucune variable. Il reste donc clair dans les cadres sombres de Campus et de la fiche campus.

## Limites
- Aucun outil Figma n'a été utilisé. Trois comportements sont déduits de l'API, sans avoir été rejoués :
  - la règle d'étalement des ombres (point 6) ;
  - `relativeTransform` avec symétrie (point 9) ;
  - `subtract` avec rayons (point 13).

  Il faut les simuler, puis contrôler le cadre test.
- Mesures de texte : `jost-0.ttf` avec RAQM reproduit les largeurs de Chrome à 0,01 px près. Pour l'arabe, aucune mesure de Figma n'a été faite : seul le constat des planches est retenu.
- `PROJECT_CONTEXT.md` et le journal ne sont pas mis à jour, conformément à la consigne de lecture seule.
