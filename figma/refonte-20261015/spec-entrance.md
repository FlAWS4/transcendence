# Spécification — Arrivée et décryptage (refonte Figma du 15 octobre 2026)

Relevé exact de l’écran d’arrivée et du décryptage du prototype actif, pour les redessiner dans Figma en vrais calques (textes, formes), sans approximation. **Relevé de l’existant, en lecture seule** : rien n’est décidé ni modifié dans le prototype.

- **Source relevée :** `site/index.html`, servi sur `http://127.0.0.1:8765/`. Contrôleur `welcome.mjs?v=audit-fixes-146`, `design-review-selection.css?v=1` et `.mjs?v=1`, `entrance.css?v=dark-secondary-25`. Les empreintes des 18 fichiers concernés sont dans `reference/entrance/index.json` (`sources`). Elles n’ont pas changé pendant les captures.
- **Moteur du message :** `entrance.mjs` importe `../decryption-examples/scanner-return-random.mjs`. Ce fichier appelle `scanner-return-together.mjs` avec `resolution: 'random'`, c’est le n°22. Le modèle vient de `shared.mjs` et `../horizon-decryption-engine.mjs` (phrase, clé 42, alphabet de 76 caractères, 6 800 ms).
- **Méthode :** Chrome sans interface, via `scripts/capture_lib.py` et `helper.py`. Le temps est piloté sans toucher au prototype : seules les images de l’entrée sont mises en file, le minuteur des libellés est retenu, les animations Web sont figées à un instant voulu. Mouvements réduits **désactivés**. Le globe est bloqué, retenu ou réel selon l’état. Script : [`scripts/capture_entrance.py`](scripts/capture_entrance.py).
- **Canvas :** toutes les commandes de `CanvasRenderingContext2D` sont interceptées avant le chargement : méthodes, propriétés, dégradés, rognages rectangulaires. Seule la dernière image est conservée, c’est-à-dire tout ce qui suit le dernier `clearRect` plein cadre. Chaque relevé est **rejoué** dans la page sur un canvas neuf, puis comparé octet par octet au canvas réel : **56/56 identiques** (0 octet différent).
- **Repère de toutes les coordonnées :** px CSS de la page, origine en haut à gauche de la fenêtre, sans défilement. Ordinateur 1440 × 960 à DPR 1 ; mobile 390 × 844 à DPR 2, captures PNG de 780 × 1688 px.

## 1. États, fichiers et instants

Chaque état existe en ordinateur et mobile, en clair et sombre, sauf mention contraire. Les noms suivent `<état>--<desktop|mobile>--<langue>-<thème>`.

| État | Nœud du plan | Instant ou déclencheur exact | Canvas |
|---|---|---|---|
| `arrival-scan-binary` | arrival | Horloge de l’entrée à **300 ms** : binaire au repos (le faisceau entre à 600 ms) | oui |
| `arrival-scan-hex` | arrival | **1 300 ms**, descente : progression du scan 0,25, faisceau à mi-hauteur (position 0,5). Hexadécimal au-dessus, binaire au-dessous | oui |
| `arrival-scan-return` | arrival | **2 700 ms**, remontée : progression 0,75, position 0,5. Hexadécimal au-dessus, chiffré au-dessous | oui |
| `arrival-encrypted` | arrival | **3 650 ms** (fin du double scan, l’entrée attend). Libellés FR. Existe aussi en `en-light`, `ar-light`, `ar-dark` | oui |
| `arrival-labels-en` / `-ar` | arrival | 3 650 ms, après 1 puis 2 changements du cycle des libellés, fondu terminé (> 320 ms). Le site reste en `fr`/`ltr` | oui |
| `entry-signin` | entry-signin | Se connecter, fenêtre « Connexion — prototype » sur le message chiffré. Aussi en `en-light`, `ar-light`, `ar-dark` | oui (sous la fenêtre) |
| `entry-signup` | entry-signup | Visiter → écran d’erreur (globe bloqué) → compte → Créer un compte. L’entrée revient d’abord au message chiffré, puis ouvre la fenêtre. **Aucun accès depuis l’arrivée** | oui (sous la fenêtre) |
| `decrypt-mid` | decrypt | Après « Simuler une connexion réussie » : **5 150 ms**, soit (3 650 + 6 650) / 2. Les 13 lettres tournent encore | oui |
| `decrypt-final` | decrypt | **6 800 ms** : BEYOND THE CODE, à 650 ms du maintien de 1,3 s | oui |
| `member-transition` | opening | *Complément* : parcours connecté, 225 ms après le début de l’ouverture. La phrase s’efface, le 42 apparaît | oui |
| `visitor-transition` | opening | Visiter (sans déchiffrement) : apparition du 42 à **79 ms sur 600** (progression 0,502) | non |
| `opening-logo` | opening | 42 seul : fin de l’apparition (600 ms), cercle non tracé | non |
| `opening-ring-drawing` | opening | Cercle à **105 ms sur 800** : `stroke-dashoffset` 49,94, soit la moitié du cercle | non |
| `opening-ring` | opening | Cercle complet (800 ms, dashoffset 0) | non |
| `world-wait` | world-wait | Module du globe retenu par le banc (jamais servi) : « Le monde se prépare… » | non |
| `reveal-mid` | reveal | Vrai globe WebGL ; t = 0,5 du révélé de 1,2 s, p = 0,5001 (ordinateur) / 0,5 (mobile) | non |
| `reveal-end` | reveal | t = 0,99, p = 0,9997 : globe entier, anneau à 0,08 % d’opacité | non |
| `entry-error` | entry-error | Module du globe bloqué : « Le monde n’a pas pu se préparer. », trois boutons, compte. Aussi en `en-light`, `ar-light`, `ar-dark` | non (scène masquée) |

Au total, 94 captures. Fichiers :

- `reference/entrance/<nom>.png` : 94 PNG, versionnés. Index : [`reference/entrance/index.json`](reference/entrance/index.json), avec l’instant, les faits, le nœud du plan, le résultat du rejeu et un résumé du canvas.
- `dom/entrance/<nom>.json.gz` : 94 relevés DOM produits par `snap(..., dom=True)`. On y trouve la boîte, les textes et leurs lignes, les styles calculés et les variables. Ils ne sont pas versionnés.
- `dom/entrance/<nom>.canvas.json` : 56 relevés de canvas, non versionnés.
- Planches de contrôle : `dom/entrance/_sheets/*.png`.
- Preuves des polices : `dom/entrance/_fonts.json`.

**Contenu d’un `.canvas.json`.**

- `canvas` : attributs `width`/`height`, boîte CSS, DPR, styles du canvas et de la scène (opacité, transformation, filtre), `dataset` de la scène (phase, texte rendu, position du faisceau, ordre de résolution).
- `frame` : `initialState` et la liste brute des commandes de la dernière image. Chaque appel de dessin porte l’état complet sous `st` : matrice, police, couleurs, `globalAlpha`, alignement, ligne de base, filtre, ombre, composition, `letterSpacing`, lissage, rognage.
- `sprites` : commandes des petits canvas hors écran dessinés par l’image. Chaque `fillText` porte ses `metrics` et `alphabeticOffset`.
- `redraw` : liste prête pour Figma.
  - `glyphs` : un élément par caractère, avec texte, police, taille effective, `scaleX`, couleur, opacité, point d’ancrage, **ligne de base alphabétique**, encre, chasse et rognage.
  - `lines` : regroupement des glyphes par ligne de base.
  - `beam` et `beamSummary` : barre de scan.
  - `clips` : rognages.
- `layoutFromRules` : cellules recalculées avec les règles du moteur. Elles concordent au centième avec les commandes.
- `replay` : résultat du contrôle octet par octet.

## 2. Polices réellement utilisées (preuves)

| Usage | Demandé par le code | Rendu dans la capture | Preuve |
|---|---|---|---|
| Lettres du message (chiffré, rotation, BEYOND THE CODE) | `500 192px Jost, sans-serif`, dessiné dans des sprites à 192 px puis réduit | **Jost Medium**, `assets/jost-1.ttf`, *Version 3.710*. UPM 1000, ascendante 1070, descendante −375, hauteur de capitale 700, hauteur d’x 460 | `document.fonts.check('500 192px Jost')` vrai ; FontFace `Jost 500 loaded` ; pixels différents du repli `sans-serif` ; `fontLoaded: true` sur chaque `fillText` des sprites |
| Bits (binaire) et octets (hexadécimal) | `400 44.16px` / `400 82.56px ui-monospace, SFMono-Regular, monospace` | **DejaVu Sans Mono Book 2.37** : ni `ui-monospace` ni SFMono-Regular n’existent sur Linux, Chrome prend sa police à chasse fixe par défaut | Rendu identique au pixel près à `"DejaVu Sans Mono"` et à `monospace`, différent des 8 autres polices installées (`_fonts.json`) |
| Boutons, textes, statut | `Jost, sans-serif` (variable `--h42-font-family`) | **Jost Regular**, `jost-0.ttf` | `CSS.getPlatformFontsForNode` |
| Titre des fenêtres | même famille, graisse 500 | **Jost Medium** | idem |
| Textes arabes (libellés, fenêtres, écran d’erreur) | `Jost, sans-serif` ; Jost n’a pas de glyphes arabes | **Noto Sans Arabic Regular**, police système de repli. Elle sert même pour le titre en graisse 500 : aucun Medium n’est installé. Espaces et tirets en Jost | idem (`facts.platformFonts` des états `ar-*`) |

Taille effective des lettres : **86 px** sur ordinateur, `min(86, largeur de la scène / 11,2)` ; **48 px** sur mobile, `min(48, largeur / 7)` lorsque la scène mesure moins de 700 px. Bits : 0,23 × taille, soit **19,78 px** / **11,04 px**. Octets hexadécimaux : 0,43 × taille, soit **36,98 px** / **20,64 px**.

**Pour Figma.**

- Jost Medium existe dans Google Fonts. Vérifier qu’il s’agit de la même version (3.710, mêmes métriques) avant de l’employer.
- DejaVu Sans Mono n’est pas proposée par Figma. Ses chiffres 0–9 sont fournis en contours vectoriels exacts dans [`assets/entrance/dejavu-sans-mono-digits.json`](assets/entrance/dejavu-sans-mono-digits.json) : unités de police, UPM 2048, chasse 1233, ligne de base à y = 0. Un [spécimen SVG](assets/entrance/dejavu-sans-mono-digits.svg) les accompagne.
  - Script : `scripts/font_outlines.py`.
  - Comparés à FreeType à 800 px, seuls des pixels de bord diffèrent (1,1 à 2 %), et l’écart minimal tombe au décalage nul.
  - Les octets du message n’utilisent que des chiffres (0x25 à 0x78) : pas de A–F.
- **Limite :** sur un autre système, la police à chasse fixe dépend des polices installées. Sur macOS, `ui-monospace` donne SF Mono. Ce cas n’est pas vérifié.

## 3. Canvas du message

### 3.1 Cadre

| | Ordinateur 1440 × 960 | Mobile 390 × 844 |
|---|---|---|
| Scène `#entrance-scene` | `position:absolute; left:50%; top:50%; transform:translate(-50%,-50%)`, largeur `min(1100px, 100% − 96px)`, hauteur 320 px, `direction:ltr`, `z-index:2` | ≤ 700 px : largeur `100% − 48px`, hauteur 240 px |
| Boîte de la scène et du canvas | x 170, y 320, 1100 × 320 | x 24, y 302, 342 × 240 |
| Attributs du canvas | `width=1100 height=320` (DPR 1) | `width=684 height=480` (DPR 2) |
| Fond du canvas | transparent : seul le fond de l’entrée apparaît (§ 9) | idem |
| Taille des lettres | 86 px | 48 px |
| Lignes | 1 ligne, centre y = 480 | 2 lignes : « BEYOND » centre y 388,88 ; « THE CODE » centre y 455,12 (pas 1,38 × 48 = 66,24) |
| Ligne de base alphabétique | **y 504,55** | **y 402,58** et **y 468,82** |
| Bloc de texte (règles du moteur) | x 309,57 → 1130,43 ; y 424,10 → 535,90 (centre ± 0,65 × taille) | x 73,92 → 316,08 ; y 357,68 → 486,32 |

**Règles de placement des lettres** (`scanner-return-together.mjs`, `refresh`) :

- chaque caractère de **BEYOND THE CODE** occupe une cellule. Sa largeur vaut la chasse de la **lettre claire** en Jost Medium à la taille effective, plus 0,02 × taille ;
- la ligne est centrée dans la scène. Les espaces sont des cellules vides : 27,52 px sur ordinateur, 15,36 px sur mobile. Sur mobile, l’espace d’indice 6 sépare les deux lignes et n’appartient à aucune ;
- chaque glyphe est centré sur sa cellule (`textAlign:center`, centre de chasse) ;
- le point « middle » se trouve à centre de ligne + 0,045 × taille. La **ligne de base alphabétique** est à centre de ligne + 0,2855 × taille (+24,55 px / +13,70 px). Le décalage middle → alphabétique de Jost Medium vaut 0,2405 em, mesuré par Chrome ;
- **compression horizontale seule** : si la chasse du glyphe dépasse 0,98 × la largeur de la cellule, le glyphe est réduit en largeur au facteur `0,98 × cellule / chasse`. La hauteur ne change pas. Au repos, cela concerne `%` (0,7431) et `9` (0,8364), sur les deux formats. En cours de rotation, le facteur varie à chaque image : il est donné par `scaleX` dans `redraw.glyphs`.

Message chiffré `ru%43t 9xu s4tu` et phrase finale `BEYOND THE CODE`. Les centres sont identiques pour les deux textes. La « chasse affichée » est la largeur d’avance après compression éventuelle.

**Ordinateur** (taille 86 px, ligne de base y 504,55) :

| # | Clair | Chiffré | Cellule : x · largeur | Centre x | Chiffré : chasse affichée · échelle x | Clair : chasse affichée · échelle x |
|---|---|---|---|---|---|---|
| 0 | B | `r` | 309,57 · 53,41 | 336,27 | 31,90 · 1 | 51,68 · 1 |
| 1 | E | `u` | 362,97 · 50,83 | 388,38 | 46,87 · 1 | 49,11 · 1 |
| 2 | Y | `%` | 413,80 · 53,41 | 440,50 | 52,34 · **0,7431** | 51,68 · 1 |
| 3 | O | `4` | 467,20 · 70,78 | 502,59 | 54,09 · 1 | 69,06 · 1 |
| 4 | N | `3` | 537,98 · 69,06 | 572,51 | 49,54 · 1 | 67,34 · 1 |
| 5 | D | `t` | 607,04 · 62,01 | 638,04 | 23,31 · 1 | 60,29 · 1 |
| 6 | (espace) | | 669,05 · 27,52 | | | |
| 7 | T | `9` | 696,56 · 45,06 | 719,10 | 44,16 · **0,8364** | 43,35 · 1 |
| 8 | H | `x` | 741,63 · 65,70 | 774,48 | 39,99 · 1 | 63,98 · 1 |
| 9 | E | `u` | 807,33 · 50,83 | 832,75 | 46,87 · 1 | 49,11 · 1 |
| 10 | (espace) | | 858,16 · 27,52 | | | |
| 11 | C | `s` | 885,68 · 61,15 | 916,25 | 36,46 · 1 | 59,42 · 1 |
| 12 | O | `4` | 946,82 · 70,78 | 982,21 | 54,09 · 1 | 69,06 · 1 |
| 13 | D | `t` | 1017,60 · 62,01 | 1048,61 | 23,31 · 1 | 60,29 · 1 |
| 14 | E | `u` | 1079,61 · 50,83 | 1105,02 | 46,87 · 1 | 49,10 · 1 |

**Mobile** (taille 48 px ; lignes de base y 402,58 pour les indices 0–5, y 468,82 pour les indices 7–14) :

| # | Clair | Chiffré | Cellule : x · largeur | Centre x | Chiffré : chasse affichée · échelle x | Clair : chasse affichée · échelle x |
|---|---|---|---|---|---|---|
| 0 | B | `r` | 94,68 · 29,81 | 109,58 | 17,81 · 1 | 28,85 · 1 |
| 1 | E | `u` | 124,49 · 28,37 | 138,67 | 26,16 · 1 | 27,41 · 1 |
| 2 | Y | `%` | 152,86 · 29,81 | 167,76 | 29,22 · **0,7431** | 28,84 · 1 |
| 3 | O | `4` | 182,66 · 39,50 | 202,42 | 30,19 · 1 | 38,55 · 1 |
| 4 | N | `3` | 222,17 · 38,54 | 241,44 | 27,64 · 1 | 37,58 · 1 |
| 5 | D | `t` | 260,71 · 34,61 | 278,02 | 13,01 · 1 | 33,65 · 1 |
| 7 | T | `9` | 73,92 · 25,15 | 86,50 | 24,65 · **0,8364** | 24,19 · 1 |
| 8 | H | `x` | 99,07 · 36,67 | 117,41 | 22,32 · 1 | 35,71 · 1 |
| 9 | E | `u` | 135,74 · 28,37 | 149,93 | 26,16 · 1 | 27,41 · 1 |
| 10 | (espace) | | 164,11 · 15,36 | | | |
| 11 | C | `s` | 179,47 · 34,13 | 196,54 | 20,35 · 1 | 33,17 · 1 |
| 12 | O | `4` | 213,60 · 39,50 | 233,35 | 30,19 · 1 | 38,54 · 1 |
| 13 | D | `t` | 253,10 · 34,61 | 270,41 | 13,01 · 1 | 33,65 · 1 |
| 14 | E | `u` | 287,71 · 28,37 | 301,90 | 26,16 · 1 | 27,41 · 1 |

**Placement d’un calque texte Figma.** Créer un calque par caractère en Jost Medium à la taille effective, avec une hauteur de ligne automatique (1070 + 375 = 1,445 em). Le haut du calque se place à `ligneDeBase − 1,07 × taille` : y 412,53 sur ordinateur, y 351,22 et 417,46 sur mobile. Le centre se place sur « Centre x ». Pour une échelle x inférieure à 1, vectoriser le glyphe puis réduire sa largeur autour de son centre.

Les boîtes d’encre exactes de chaque glyphe, mesurées par `measureText` dans Chrome, sont dans `redraw.glyphs[].ink` ; elles servent à vérifier le calage.

### 3.2 Couleurs du canvas

| | Clair | Sombre |
|---|---|---|
| Encre : lettres au repos, binaire, hexadécimal, phrase finale | `--h42-color-text` = **#1B1B1B** | **#FFFFFF** |
| Accent : faisceau et lettres en rotation | `--h42-color-accent` = **#00BABC** (42 Blue) | **#ED3491** (Royal Pink ; surcharge `.entrance-scene` du thème sombre) |

Paramètres communs à tous les tracés :

- opacité 1 et composition `source-over` ;
- ni ombre, ni filtre, ni espacement de lettres, ni dégradé : aucun `createLinearGradient` ou `createRadialGradient` n’a été appelé ;
- lissage d’image actif, qualité `low`.

Les glyphes passent par des sprites de 192 px réduits à la taille effective. Le rendu web est donc très légèrement plus doux qu’un texte vectoriel Figma.

### 3.3 Représentations dessinées

- **Binaire** : 8 bits par lettre, en 2 colonnes × 4 rangées. L’octet se lit de gauche à droite puis de haut en bas, bit de poids fort en premier. Exemple : `r` = 0x72 = 01 11 00 10.
  - Les colonnes se placent au centre de la cellule **± 0,105 × taille** : ±9,03 px sur ordinateur, ±5,04 px sur mobile.
  - Les points « middle » des rangées sont à centre de ligne **+ (k − 1,5) × 0,24 × taille**, k = 0…3 : −30,96 / −10,32 / +10,32 / +30,96 px sur ordinateur, −17,28 / −5,76 / +5,76 / +17,28 px sur mobile.
  - La ligne de base alphabétique est 0,26 em sous le point middle : ordinateur y 454,18 / 474,82 / 495,46 / 516,10 ; mobile y 374,47 / 385,99 / 397,51 / 409,03 puis 440,71 / 452,23 / 463,75 / 475,27.
  - Couleur encre. Toutes les positions sont dans `redraw.glyphs` (kind `binary`).
- **Hexadécimal** : deux chiffres majuscules par lettre, centrés sur la cellule. Le point middle est à centre de ligne + 0,025 × taille ; la ligne de base est à y 491,75 sur ordinateur, à y 395,44 et 461,68 sur mobile. Couleur encre. Certains octets sont légèrement comprimés en largeur (0,9689, d’après `scaleX`). Octets du message : `72 75 25 34 33 74 · 39 78 75 · 73 34 74 75`.
- **Chiffré** : tableau ci-dessus, couleur encre.
- **Déchiffrement** (`decrypt-mid`) : les 13 lettres sont en **accent** tant qu’elles tournent, en **encre** une fois fixées.
  - À 5 150 ms le texte est `WZshdV mcY TfXW`.
  - Compressions : `W` 0,5966 (cellule B), `m` 0,6451 (T), `Y` 0,9637 (E), `W` 0,5678 (dernier E).
- **Final** (`decrypt-final`) : BEYOND THE CODE en encre, centres et lignes de base du tableau, aucune compression.

### 3.4 Barre de scan

Elle n’existe que pendant le scan (600–3 400 ms). Elle est composée de **cinq rectangles pleins de la couleur d’accent**, superposés en `source-over`, **sans flou ni dégradé** : la « lueur » est obtenue par deux rectangles translucides.

| Couche | Rectangle | Opacité |
|---|---|---|
| Halo | hauteur **0,30 × taille** (25,8 px / 14,4 px), centré sur y | 0,07 × o |
| Cœur | hauteur **6 px**, centré sur y | 0,16 × o |
| Ligne | hauteur **1,5 px**, centrée sur y | 1 × o |
| Butée gauche | **1,5 × 6 px** au bord gauche | 1 × o |
| Butée droite | **1,5 × 6 px** au bord droit | 1 × o |

- **Étendue horizontale** : du bord gauche du bloc de texte − 0,24 × taille au bord droit + 0,24 × taille. Sur ordinateur, x 288,93 → 1151,08 (862,15 px) ; sur mobile, x 62,40 → 327,60 (265,20 px).
- **Position verticale** : `y = (haut du bloc − 0,24 × taille) + (hauteur du bloc + 0,48 × taille) × pos`, avec `pos = (1 − cos(2π·p)) / 2` et `p = (t − 600) / 2 800`. y va de 403,46 à 556,54 sur ordinateur et de 346,16 à 497,84 sur mobile ; le faisceau descend jusqu’à 2 000 ms puis remonte.
- **Opacité o** : `smoothstep(p / 0,05) × smoothstep((1 − p) / 0,05)`, soit une entrée sur 600–740 ms et une sortie sur 3 260–3 400 ms. Aux instants capturés, o = 1.
- **États capturés**, pos = 0,5 :
  - ordinateur : y = **480**. Halo y 467,10–492,90, cœur 477–483, ligne 479,25–480,75, butées x 288,93 et 1149,58 ;
  - mobile : y = **422**. Halo 414,80–429,20, cœur 419–425, ligne 421,25–422,75, butées x 62,40 et 326,10.
- **Rognage au faisceau** : deux rectangles pleine largeur du canvas, coupure exacte à y.
  - En descente : le binaire est dessiné sous y, l’hexadécimal au-dessus.
  - En remontée : le chiffré sous y, l’hexadécimal au-dessus.
  - Sur ordinateur, la ligne unique est coupée en deux : la moitié haute de chaque bloc est en hexadécimal, la moitié basse en binaire ou en chiffré. Sur mobile, le faisceau à 422 passe entre les deux lignes.
  - Dans Figma : deux cadres « clip content » aux limites de `redraw.clips`, avec un jeu de glyphes chacun. Certains glyphes de la liste sont entièrement rognés ; ils sont listés mais invisibles.

## 4. Boutons Se connecter / Visiter (arrivée)

| | Ordinateur | Mobile |
|---|---|---|
| Groupe `#entrance-access` | grille 2 colonnes égales, `gap 24`, haut = 50 % + 155 px, centré : x 554,39, y 635, 331,22 × 52 | 1 colonne, largeur 100 % − 48 px, `gap 12`, haut = 50 % + 130 px : x 24, y 552, 342 × 116 |
| Se connecter | x 554,39, y 635, **153,61 × 52** | x 24, y 552, **342 × 52** |
| Visiter | x 732, y 635, 153,61 × 52 | x 24, y 616, 342 × 52 |
| Site en arabe | ordre inversé : Se connecter à x 732, Visiter à x 554,39 | même colonne |

**Boîte commune.**

- `min-height 52`, padding 14 / 28, bordure 1 px, **rayon 12** (échelle unifiée de `design-review-selection.css`, au lieu de 14).
- Texte Jost Regular **16 px**, hauteur de ligne 20 px, centré.
- La colonne mesure 153,61 = 95,61 + 56 + 2. La largeur 95,61 est celle de la plus longue traduction, « تسجيل الدخول » ; chaque libellé réserve la place de ses trois traductions.

**Couleurs.**

| | Clair | Sombre |
|---|---|---|
| Se connecter | fond et bordure **#00BABC**, texte **#1B1B1B**, ombre `0 9px 22px rgba(24,61,60,0.07)` | fond et bordure **#ED3491**, texte **#1B1B1B**, pas d’ombre |
| Visiter | fond **#FFFFFF**, bordure **#DCE5E5**, texte **#1B1B1B**, même ombre | fond transparent, **bordure #708383**, texte **#FFFFFF**, pas d’ombre |

**Libellés.** Chaque libellé est un span `.entrance-action-label` ; seul ce span porte `lang` et `dir`. Largeurs mesurées (texte de 23 px de haut, boîte de 20 px à y 651 sur ordinateur) :

- FR : « Se connecter » 88,45, « Visiter » 42,91 ;
- EN : « Sign in » 47,81, « Visit » 29,17 ;
- AR : « تسجيل الدخول » 95,61, « زيارة » 27,03, en `dir="rtl"`, Noto Sans Arabic.

**Fond cliquable.** Le bouton `#entry-theme-toggle` couvre tout l’écran, sans aucun rendu visible. Il change le thème.

Non capturés (valeurs du CSS) :

- survol : `translateY(-2px)`. En clair, Visiter prend le fond #EAF5F4 et la bordure #BCDCD9 ; Se connecter garde son accent ;
- focus clavier : contour 2 px `--h42-color-focus`, décalé de 5 px.

## 5. Fenêtres entry-signin et entry-signup

Élément `<dialog>` centré par `margin:auto`, largeur `min(420px, 100% − 32px)`, padding 24, **rayon 20**, bordure 1 px.

**Couleurs de la fenêtre.**

| | Clair | Sombre |
|---|---|---|
| Fond | #FFFFFF | **#202026** |
| Bordure | #FFFFFF | `color(srgb 0.2541 0.1235 0.1892)`, environ #412030 |
| Ombre | `0 22px 64px rgba(24,61,60,0.07), 0 3px 12px rgba(24,61,60,0.024)` | `0 16px 48px rgba(0,0,0,0.2)` |
| Voile `::backdrop` | rgba(23,57,56,0.16) | rgba(27,27,27,0.22) |

Dans les deux thèmes, le voile porte `backdrop-filter: blur(7px)` sur le message.

**Dimensions mesurées.**

| | Ordinateur FR | Mobile FR |
|---|---|---|
| Fenêtre Connexion | x 510, y 336,41, **420 × 287,19** | x 19, y 278,41, **352 × 287,19** |
| Fenêtre Création de compte | 420 × 287,19 (même place) | x 19, y 258,61, **352 × 326,78** : titre sur 2 lignes et texte sur 3 |

**En-tête.** Rangée flexible `space-between`, `gap 12`, hauteur 44, marge basse 20.

- Titre h2 en Jost Medium **20 px** (boîte de 29 px), couleur du texte. FR : « Connexion — prototype » (208,73 px) ; « Création de compte simulée » (247,28 px sur ordinateur).
- Croix `#close-dialog` : 44 × 44, ronde, padding 10. Icône `#i-close` de 24 px : traits `m6 6 12 12M6 18 18 6`, épaisseur 1,6, extrémités rondes, couleur du texte.

**Texte.** `.dialog-text` en Jost Regular 16 / 25,6 px. Couleur #536163 en clair, #95B0B0 en sombre. Pas de marge haute visible ; 16 px sous le texte. Sur ordinateur, il tient sur 2 lignes (signin et signup) ; sur mobile, 2 lignes pour signin et 3 pour signup.

**Boutons.** Ils sont *en ligne* (`inline-block`), hauts de 53 (contenu 23 + 28 + 2), avec padding 14 / 28, rayon 12 et Jost 16.

- Principal, « Simuler une connexion réussie » (265,05 px) ou « Simuler la création du compte » (261,36 px) : fond et bordure accent, #00BABC en clair et #ED3491 en sombre, texte #1B1B1B. En clair, il porte l’ombre de niveau 1.
- Annuler (111,17 px) : en clair, fond blanc, bordure #DCE5E5 et texte encre ; en sombre, fond transparent, bordure rgba(255,255,255,0.12) et texte blanc.
- **Disposition selon la langue** :
  - en FR, 265 + 111 > 370 px : les boutons passent l’un sous l’autre, **sans espace**, à y 492,59 et 545,59 ;
  - en EN, ils tiennent sur une ligne : 249,36 + 104,63 px ;
  - en AR, ils tiennent sur une ligne, principal à droite, et mesurent **64 px de haut** (ligne de 34 px de Noto Sans Arabic). Fenêtre sur ordinateur : 420 × 245,19 à y 357,41.
- Sur mobile, tous les boutons prennent 302 px de large (signin AR mobile : 352 × 309,19).

**Contenu.** Aucun champ, la connexion est simulée. Textes FR/EN/AR : § 11.

## 6. Logo 42 et cercle

| | Ordinateur | Mobile |
|---|---|---|
| Symbole `#entrance-symbol` | 200 × 200, centré dans la fenêtre : centre (720, 480), boîte 620,380 | 174 × 174, centre (195, 422), boîte 108,335 |
| Logo | `logo-42.svg` (4 chemins de la charte, viewBox 31,1445 × 21,8555, remplissage #000000) en largeur 128 → **128 × 89,81**, à x 656, y 435,09 | largeur 112 → **112 × 78,59**, à x 139, y 382,70 |
| Couleur du logo | clair : noir #000000 ; sombre : `filter: invert(1)`, soit blanc #FFFFFF | idem |
| Cercle | SVG viewBox 200, cercle cx 100 cy 100 **r 96**, `pathLength 100`. Rayon affiché 96 px, épaisseur **1 px**, sans remplissage | rayon 83,52 px, épaisseur 0,87 px |
| Couleur du cercle | **#00BABC** (`--h42-teal`) dans les **deux** thèmes | idem |
| Tracé | `rotate(-90deg)` : départ à midi, sens horaire. `stroke-dasharray 100`, `dashoffset` de 100 à 0 | idem |

Valeurs mesurées pendant les transitions (styles calculés) :

- `visitor-transition`, logo à 79 ms : opacité 0,5019, `blur(3,985px)`, `scale(0,9303)` avec un décalage vertical de +4,98 px, `clip-path: inset(0 0 49,81% 0)`. La moitié basse est masquée ; boîte 660,46,443,21, 119,07 × 83,55.
- `member-transition` à 225 ms :
  - scène à opacité 0,6846, `scale(0,9811)`, `blur(1,261px)`. Les lettres du canvas sont donc à 84,37 px, ligne de base y 504,09 ;
  - logo à opacité 0,9007, `blur(0,794px)`, `scale(0,9861)`, décalage +0,99 px, `inset(0 0 9,93% 0)`.
- `opening-ring-drawing` : dashoffset 49,9363, soit 50,06 % du cercle tracé depuis midi.
- **Point au sommet du cercle avant son tracé** (artefact observé, pas une intention) : le cercle hérite de `stroke-linecap: round` de la règle générale `svg`. Un trait de longueur nulle (dashoffset 100) laisse donc un point turquoise d’environ 0,9 px au sommet du cercle (195 ; 338,5). Il est visible sur mobile (DPR 2) dans `visitor-transition`, `opening-logo` et `member-transition`, mais pas sur ordinateur (DPR 1, aucun pixel dessiné).

## 7. « Le monde se prépare… »

- **Statut** `#entrance-status` : position absolue, haut = 50 % + 150 px sur ordinateur et 50 % + 115 px sur mobile, `inset-inline 24`, centré. Boîte ordinateur y 645, 1392 × 22 (texte 148,91 px à x 645,55) ; mobile y 552, texte à x 120,55.
- Police Jost Regular **15 px**. Couleur #536163 en clair, #95B0B0 en sombre.
- Le logo et le cercle complet restent affichés (§ 6).

## 8. Écran d’erreur

La section `.entrance` passe en **colonne flexible** centrée verticalement (`justify-content: safe center`, `align-items: center`), avec `gap 24` et padding 100 / 24 / 32. La scène et le symbole sont masqués.

**Statut.** Élément statique, `max-width 640`, Jost 15 / 24 px, même couleur que le statut d’attente. FR « Le monde n’a pas pu se préparer. » : 213,14 × 24 à (613,42 ; 463,5) sur ordinateur, (88,42 ; 340,5) sur mobile.

**Boutons.** Rangée flexible `wrap`, `gap 24`, largeur `min(760px, 100%)`. Sur mobile, colonne de 342 px de large, `gap 12`. Ordre : Réessayer (principal, **focus à l’ouverture**), Revenir au message, Continuer sans le globe. Hauteur 53 (**64 en arabe**), padding 14 / 28, rayon 12, Jost 16.

- Ordinateur FR, à y 511,5 : x 428,13 (124,48), 576,61 (192,42), 793,03 (218,84).
- Mobile, à x 24 : y 388,5 / 453,5 / 518,5.

| | Clair | Sombre |
|---|---|---|
| Réessayer | fond et bordure **#1B1B1B**, texte **#FFFFFF**, ombre `0 9px 22px rgba(24,61,60,0.07)` | fond et bordure **#00BABC**, texte #1B1B1B |
| Secondaires | fond #FFFFFF, bordure #DCE5E5, texte #1B1B1B, même ombre | fond et bordure transparents, **texte #00BABC** |

**Compte.** Seul écran de l’entrée où il est visible. Bouton `#profile` de 44 × 44, rond, padding 10, icône `#i-user` de 24 px (trait 1,6).

- Position : ordinateur LTR (1348, 40) ; ordinateur AR (48, 42,88) ; mobile (324, 24).
- Clair : fond `rgba(255,255,255,0.82)`, bordure `rgba(255,255,255,0.72)`, `backdrop-filter: blur(26px) saturate(1.15)`, ombre `0 9px 22px rgba(24,61,60,0.07)` plus reflets intérieurs (`inset 0 1px 0 rgba(255,255,255,0.7)`, `inset 0 -1px 0 rgba(24,61,60,0.043)`).
- Sombre : fond `color(srgb 0.1608 0.1608 0.1804 / 0.82)`, bordure `rgba(255,255,255,0.25)`, ombre `0 12px 26px rgba(0,0,0,0.2)` plus reflets.

## 9. Fond de l’entrée et révélation du globe

**Fond `.entrance`.**

- Clair : `radial-gradient(ellipse at 74% 46%, #00BABC0B, transparent 48%)`, `radial-gradient(ellipse at 22% 86%, #EC339108, transparent 39%)`, `linear-gradient(145deg, #FFFFFF 8%, #F7FAFA 78%)`. Les valeurs calculées sont 0,043 et 0,03.
- Sombre : **#1B1B1B** uni.

**Révélation** (`revealGlobe`, 1 200 ms, `p = t² (3 − 2t)`).

- Le vrai globe préparé est découpé par `clip-path: circle(R at centre)`.
  - Ordinateur : **R = 267,012 px**, centre (720, 480).
  - Mobile : **R = 190,921 px**, centre (195, 422). Le canvas MapLibre fait 585 × 1266, soit un DPR de 1,5 propre au globe.
- Rayon courant `r = r0 + (R − r0) × p`, avec r0 = 0,48 × la largeur du symbole (96 / 83,52).
- Le globe reçoit `scale(r/R)` autour de ce centre et l’opacité `min(1, p/0,32)`.
- Un voile reprenant le fond de l’entrée est masqué par `radial-gradient(circle at centre, transparent r−1 px, #000 r+1 px)`, soit un bord de 2 px.
- Le symbole est agrandi de `r/r0` ; l’épaisseur du cercle grandit avec lui (1,89 px à mi-course sur ordinateur).
- Opacités : logo `1 − min(1, p/0,25)`, nul dès p = 0,25 ; cercle `1 − max(0, (p − 0,65)/0,35)`.

Valeurs relevées :

- `reveal-mid` : ordinateur r = 181,53 (`scale 0,679848`, symbole × 1,89091) ; mobile r = 137,22 (`scale 0,718729`, symbole × 1,64297).
- `reveal-end` : r ≈ R, anneau à 0,0008.

Le contenu du globe (terres, pastilles des pays) est un rendu WebGL en image. Il relève de la zone Explorer et sort du périmètre de ce relevé.

## 10. Chronologie complète (relevée dans le code)

| Étape | Début → fin | Courbe et détail |
|---|---|---|
| Chargement | — | Le thème vient de `localStorage horizon-theme-preference-v1` (défaut clair) **avant** les styles. Le site charge toujours en **français** : `let locale='fr'`, aucune détection de langue. Le globe se prépare en parallèle dès l’image suivante |
| Démarrage du scan | t = 0 | Première image visible, après `document.fonts.load('500 192px Jost')` puis `fonts.ready`. L’horloge avance d’au plus **64 ms par image** pendant le scan |
| Binaire | 0 → 600 ms | statique |
| Descente | 600 → 2 000 ms | `pos = (1 − cos 2πp)/2`, p = (t − 600)/2 800, au-dessus l’hexadécimal ; faisceau en fondu d’entrée de 600 à 740 ms (smoothstep) |
| Remontée | 2 000 → 3 400 ms | au-dessous le chiffré ; fondu de sortie de 3 260 à 3 400 ms |
| Chiffré seul | 3 400 → 3 650 ms | sans faisceau |
| Attente chiffrée | 3 650 ms → action | `SCAN_END = 6 800 × 3 650 / 6 800`. Visiter est possible pendant le scan ; une connexion confirmée pendant le scan attend sa fin |
| Libellés | toutes les **4 000 ms** | FR → EN → AR → FR. Entrant : **320 ms** `cubic-bezier(.22,1,.36,1)`, opacité 0 → 1 et `translateY(6px → 0)`. Sortant : **220 ms** `ease-out`, opacité 1 → 0 et `translateY(0 → −6px)`, `fill: forwards`. Pause au survol du groupe, au focus clavier, fenêtre ouverte ou onglet masqué. Durées choisies par l’assistant le 13 octobre, pas imposées par l’utilisateur |
| Fenêtre de connexion | instantanée | `showModal()`, sans animation |
| Déchiffrement n°22 | 3 650 → 6 800 ms | Progression **linéaire** propre à chaque lettre, de 3 650 ms à sa fixation à **6 050 + 50 × rang** ms. Elle traverse 42 positions à rebours dans l’alphabet de 76 caractères (`steps = ⌊local × 42⌋`). Lettre en accent tant que 0 < local < 1 |
| Ordre de fixation | — | graine 42 : N 6 050 · O(12) 6 100 · C 6 150 · E(14) 6 200 · D(5) 6 250 · O(3) 6 300 · T 6 350 · Y 6 400 · D(13) 6 450 · E(9) 6 500 · E(1) 6 550 · H 6 600 · B 6 650 |
| Maintien du slogan | **1 300 ms** | BEYOND THE CODE immobile, en encre |
| Ouverture, membre | **600 ms** | Logo `cubic-bezier(.22,1,.36,1)`, `fill: backwards`, depuis `{opacité 0, blur(8px), translateY(10px) scale(.86), clip-path inset(0 0 100% 0)}`. En parallèle, la phrase s’efface en **450 ms** `ease-in` : opacité 1 → 0, `scale(1 → .94)`, `blur(0 → 4px)`, puis la scène est masquée |
| Ouverture, visiteur | **600 ms** | Au clic, les boutons et la scène disparaissent **immédiatement** ; même apparition du logo |
| Cercle | **800 ms** | `cubic-bezier(.22,1,.36,1)`, dashoffset 100 → 0. La moitié est tracée à 105 ms |
| Attente du monde | jusqu’à la préparation | Statut « Le monde se prépare… » (seulement si le globe n’est pas prêt). Délai de 45 s une fois le module de carte chargé |
| Erreur | — | Symbole masqué, statut d’erreur, 3 boutons, focus sur Réessayer, compte visible |
| Révélation | **1 200 ms** | smoothstep (§ 9), puis l’accueil apparaît et le focus va au globe |
| Mouvements réduits | — | Pas de scan (chiffré immédiat), pas de rotation (phrase finale immédiate), aucune animation de logo, de cercle, de révélation ou de libellé |

## 11. Textes FR / EN / AR de la zone

Ils ont été relevés dans le code par [`scripts/extract_copy_entrance.mjs`](scripts/extract_copy_entrance.mjs) et se trouvent dans [`copy-entrance.json`](copy-entrance.json) : 30 clés, au format `{"clé": {"fr", "en", "ar", "where"}}`. Le script s’arrête si le code change. Principaux textes visibles :

| Clé | FR | EN | AR |
|---|---|---|---|
| arrival.login | Se connecter | Sign in | تسجيل الدخول |
| arrival.guest | Visiter | Visit | زيارة |
| signin.title | Connexion — prototype | Sign in — prototype | تسجيل الدخول — نموذج أولي |
| signin.description | Cette maquette simule la connexion. Aucune authentification réelle n’est effectuée. | This preview simulates sign-in. No real authentication takes place. | يحاكي هذا النموذج تسجيل الدخول. لا يتم إجراء مصادقة حقيقية. |
| signin.confirm | Simuler une connexion réussie | Simulate a successful sign-in | محاكاة تسجيل دخول ناجح |
| signin.cancel | Annuler | Cancel | إلغاء |
| signup.title | Création de compte simulée | Simulated account creation | إنشاء حساب تجريبي |
| signup.confirm | Simuler la création du compte | Simulate account creation | محاكاة إنشاء حساب |
| worldWait.status | Le monde se prépare… | Getting the world ready… | نجهّز العالم… |
| error.status | Le monde n’a pas pu se préparer. | The world could not be prepared. | تعذّر تجهيز العالم. |
| error.retry / back / continue | Réessayer · Revenir au message · Continuer sans le globe | Try again · Back to the message · Continue without the globe | إعادة المحاولة · العودة إلى الرسالة · المتابعة دون الكرة الأرضية |
| decrypt.phrase / arrival.ciphertext | BEYOND THE CODE / ru%43t 9xu s4tu | identique | identique |

Les noms accessibles (fond cliquable, scène, croix, compte) et la description des libellés alternés figurent aussi dans le JSON.

**Langue du site à l’arrivée.**

- Avec `Emulation.setLocaleOverride` et `Accept-Language` réglés sur `ar` puis `en-US` (`navigator.language` = `ar` / `en-US`), le site reste `lang="fr"`, `dir="ltr"`, libellés FR (`dom/entrance/_fonts.json`) : la langue est fixée dans le code.
- Il n’existe pas de préférence de langue mémorisée.
- L’anglais et l’arabe ne s’atteignent à l’arrivée que par **l’écran d’erreur** : compte → Paramètres → langue, puis Revenir au message. Le scan n’est alors pas rejoué. C’est ce chemin qui a produit les états `en-light`, `ar-light` et `ar-dark` d’`arrival-encrypted`, `entry-signin` et `entry-error`.
- En arabe :
  - `dir="rtl"` et ordre des boutons inversé ;
  - la scène reste `ltr` et le canvas est identique ;
  - la fenêtre a sa croix à gauche et ses boutons sur une ligne ;
  - le compte est en haut à gauche.

## 12. Limites

- Chrome sans interface sur Linux. Les polices à chasse fixe et arabe sont des polices système (§ 2) ; leur rendu changera sur un autre système. Pas de téléphone physique.
- Les sprites du canvas sont réduits depuis 192 px avec un lissage `low`. Un texte vectoriel Figma sera un peu plus net : ce n’est pas un écart de position.
- Survol et focus des boutons, fondu croisé des libellés : non capturés, seulement les états stables. Leurs valeurs CSS sont notées.
- Le panneau du compte ouvert sur l’écran d’erreur n’a pas été capturé : il n’était pas demandé.
- Globe réel en rendu logiciel. Après le premier pas du révélé, la page reste occupée de 17 à 181 s, le temps de son premier rendu. Les captures ont été prises une fois deux images produites. Les géométries (clip, échelle, masque) viennent des styles et sont exactes ; l’image du globe est un rendu, pas un relevé vectoriel.
- `world-wait` et `entry-error` sont provoqués par le banc, qui retient ou bloque le module du globe : ils ne reflètent pas une panne réelle.
- `member-transition` est un complément, au-delà des états demandés.
- `entry-signup` n’est accessible que depuis l’écran d’erreur.
- Le relevé décrit l’état actuel du prototype (empreintes dans `index.json`). Si le prototype change, rejouer les lots :
  - avec Chrome : `fonts`, `scan`, `labels`, `dialogs`, `decrypt`, `opening`, `wait`, `error`, `languages`, `reveal` ;
  - sans Chrome : `sheets` et `index`, puis `extract_copy_entrance.mjs`.
