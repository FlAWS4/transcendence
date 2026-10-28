# Vérification Figma de l'arrivée — synthèse (16 octobre 2026)

**Périmètre.** Zone « entrance » : 8 sections et 84 cadres, soit 42 rendus clairs et 42 clones en mode Sombre. Quatre vérificateurs ont relevé 25 défauts. Pour les recouper :
- planches « bloquant » et « visible » rouvertes ;
- code relu : `dom2fig.py`, `render.js`, `figlib.py`, `build_palette.py`, `layout.py`, `assets.py`, `globe_assets.py` et `capture_lib.py` ;
- relevés `dom/entrance/` interrogés ;
- deux essais à blanc, sans écriture : appariement de la palette et conversion des 42 scènes.

Travail en lecture seule : aucun correctif appliqué, aucun appel Figma.

**Bilan.** Les 25 défauts sont confirmés et regroupés en 9 causes ; un 10e point concerne l'outil de vérification. Trois causes avancées ont été corrigées et six points écartés (voir la fin).

## Correctifs par priorité

### 1. Peintures « clair seulement » mal traduites en sombre — bloquant, 42 cadres sombres
- **Défauts.**
  - Bande sarcelle en diagonale sur tous les cadres sombres, jusqu'à #154344, au lieu d'un fond uni #1B1B1B.
  - « Visiter » rempli de #202026.
  - Boutons secondaires de l'erreur affichés en pastilles : fond #202026, contour #411F30.
  - Ombres noires sous les boutons, absentes du site en sombre.
  - Liseré du bouton du compte trop clair.
  - Halos rose et sarcelle à 3–4 % restés visibles.
- **Cause, en trois parties.**
  1. `build_palette.py`, `main()`. Une couleur claire est appariée à `same[min(i, len(same)-1)]`. Or `i` est l'indice parmi *toutes* les couleurs de l'élément, pas parmi celles du même type, et il est borné à la dernière couleur sombre. On obtient des paires fausses et il en manque de vraies. Essai sur les 168 états actuels, avec un indice par type :
     - #FFFFFF→#00BABC00 passe de 168 à 0 ;
     - #183D3C12→#00000022 passe de 1 538 à 0 ;
     - #FFFFFFB2→#FFFFFF30 passe de 0 à 1 476 ;
     - 947 couleurs claires n'ont aucun équivalent, alors que l'élément existe en sombre.
  2. `dom2fig.py`, `cref()` et `frame_paints()`. Sans valeur sombre, `cref` prend `palette['fallback']`, la paire la plus fréquente, même quand l'élément sombre existe sans cette peinture. Relevé sur les 42 scènes :
     - 84 arrêts #FFFFFF→#00BABC00 ;
     - 147 arrêts #F7FAFA→Rôles/bg, opaque ;
     - 56 ombres →#00000022 ;
     - 30 fonds #FFFFFF→Rôles/surface ;
     - 8 bordures #DCE5E5→Chaleur/line ;
     - 84 arrêts radiaux liés à aucune variable.
  3. Figma interpole les arrêts sans alpha prémultiplié. Entre #00BABC00 à 8 % et #1B1B1B à 78 %, la teinte sarcelle traverse donc le dégradé. Le modèle prédit (21,62,62) en (720,100) ; la mesure donne (21,62,62).
- **Correctif.**
  - a. Créer une seule fonction d'appariement, par exemple `figlib.pair_paints(n, dn)`, utilisée à la fois par `build_palette.py` et `dom2fig.py` :
    - indice par type, sans borne ;
    - dégradés appariés couche par couche, seulement si la structure est identique (nombre de couches, type, nombre d'arrêts) ;
    - peinture absente en sombre alors que l'élément existe : valeur sombre `#00000000`, appliquée à tous les arrêts d'une couche claire seule ;
    - couche présente seulement en sombre : valeur claire `#00000000`, ce qui étend aux dégradés la convention existante.
  - b. `cref(kind, c, dark)` doit distinguer deux cas : « aucun élément sombre », où le repli reste permis, et « peinture absente en sombre », qui donne transparent. Aucun repli quand `dn` existe.
  - c. Régénérer `palette.json` et créer les nouvelles variables dérivées (`make_call.py palette`). Reconvertir et renvoyer les 7 lots (`layout.py scenes entrance`), puis refaire les clones (`layout.py dark entrance`).
  - d. **Option immédiate**, en 1 appel et sans nouveau rendu. Mettre la valeur Sombre :
    - de `dérivées/dégradé/FFFFFF-00BABC00` à `#1B1B1B00` (avec `#00000000`, Figma assombrirait la bande) ;
    - de `dérivées/ombre/183D3C12-00000022` à `#00000000`.

    D'après l'essai d'appariement, ces deux variables ne servent qu'au repli. La bande et les ombres sombres disparaissent, y compris dans l'atmosphère des autres zones. « Visiter » et les boutons de l'erreur nécessitent toujours a à c : ils utilisent de vraies variables CSS.
- Ce correctif règle aussi trois écarts non signalés :
  - 2e ombre de la fenêtre modale en sombre ;
  - anneau rose à 10 % des repères du globe ;
  - halos de l'atmosphère placés à leurs positions claires en sombre. Ils sont cachés à l'arrivée mais visibles ailleurs.

### 2. Révélation : voile opaque sans trou, globe absent, anneau final en trop — bloquant, 8 cadres
- **Défauts.**
  - Le cercle est vide : ni globe, ni repères, ni étiquettes.
  - À la « fin », l'anneau reste visible, alors que le site l'a effacé (opacité 0,0008).
- **Cause, en trois parties.**
  1. `dom2fig.py` ignore `meta.reveal.veil.mask`, c'est-à-dire `radial-gradient(circle at 720px 480px, transparent 180,5px, #000 182,5px)`. Rayons du trou : 181,5 et 267,0 sur ordinateur, 137,2 et 190,9 sur mobile. `#entrance-veil` devient un cadre plein, posé au-dessus du globe (z 8 contre 7), qui cache tout.
  2. Les composants globe manquaient lors du rendu (lots 018 et 019). Ils existent maintenant : `33:19` pour l'ordinateur (appel 023) et `45:20` pour le mobile (lot 033 en 8 morceaux, terminé à 5 h 18).
  3. La branche `is_ring` de `build()` ne lit pas l'opacité du cercle. Les relevés de la révélation n'ont pas de `svgKids` ; l'opacité figure dans le SVG (`opacity: 0.000837…`) et dans `meta.symbol.circleOpacity`.
- **Correctif.**
  - a. `dom2fig.build()`, pour `id == 'entrance-veil'` : analyser le masque et ajouter `hole: [cx − x, cy − y, (r0 + r1) / 2]`.
  - b. `render.js`, dans `build()` : si `n.hole`, créer un rectangle n.w × n.h et une ellipse de diamètre 2r, puis `figma.subtract([rect, disque], parent)`. Appliquer ensuite `fills = paints(n.f, n.w, n.h)` : la boîte reste la même, donc les dégradés aussi. Ajouter dans `sim_figma.mjs` des fonctions factices `createRectangle`, `createEllipse` et `subtract`.
  - c. Branche `is_ring` : prendre l'opacité de `svgKids[0].op`, sinon de l'expression `opacity:\s*([\d.e-]+)` dans `base['svgs'][svgRef]`, multipliée par `opacity(n)`. Sous 0,01, renvoyer `[]` ; sinon, poser `node['o']`.
  - d. Rendre de nouveau les 8 cadres : les deux globes sont au registre, et les nœuds `S globe:…` sont déjà dans les scènes.

    Le correctif ponctuel `globe_assets.py reveal` ne suffit pas, pour deux raisons :
    - il ne perce pas le voile, donc le globe reste caché ;
    - son masque reprend la boîte de l'anneau : rayon 189 au lieu de 181,5, et 278 au lieu de 267.

### 3. Outil de vérification `section_frames.py` — pas un défaut Figma, à corriger avant les zones suivantes
- **Cause.** Les 8 captures de section ont une marge de 40 unités. Échelles mesurées et calculées par l'outil :

  | Sections | Échelle mesurée | Échelle de l'outil |
  |---|---|---|
  | arrival | 0,37033 | 0,37751 |
  | les cinq autres sections (entry-signin, entry-signup, decrypt, world-wait, reveal, entry-error) | 0,70431 | 0,71770 |
  | opening | 0,63301 | 0,64522 |

  L'outil calcule `k = W / w` avec l'origine en 0. Ses découpes glissent donc d'environ 40 px, et les taux de pixels différents (jusqu'à 35 %) sont faux. Par ailleurs, le seuil « écart de luminance > 40 » laisse passer les dérives de teinte : la bande sarcelle (écart ≈ 28) ne compte que pour 0,5 %.
- **Correctif.**
  - Calculer `k = W / (w + 80)` avec un décalage de `40·k`, ou détecter le cadre blanc comme `verification/entrance/aligned_frames.py`.
  - Ajouter dans `index.json` l'écart moyen par canal et la part de pixels dont un canal s'écarte de plus de 12.

### 4. Lettres du canvas en sombre (décryptage à mi-parcours) — visible, 2 cadres
- **Cause.** `build_palette.py` ne lit que le DOM, donc jamais les couleurs du canvas. `cref('texte', #00BABC, #ED3491)` ne trouve aucune paire et renvoie l'hexadécimal clair : 26 occurrences dans les 42 scènes.
- **Correctif**, à faire avec le point 1b dans `cref()`. Quand la clé `(type, clair, sombre)` manque, reprendre une variable de mêmes valeurs claire et sombre, quel que soit son type. Privilégier les variables CSS, ici `Rôles/access-accent`.
  - Autre solution : faire lire `dom/*/*.canvas.json` par `build_palette.py`.

### 5. Voile des fenêtres modales (`::backdrop`) absent — visible, 8 cadres (connexion, création de compte)
- **Cause.** Le voile n'existe que dans `meta.state.dialog.backdrop`, pas comme nœud du relevé :
  - clair : rgba(23,57,56,0,16) ;
  - sombre : rgba(27,27,27,0,22) ;
  - flou : blur(7px).
- **Correctif.**
  - `dom2fig.build()`, pour `tag == 'dialog'` : renvoyer `[voile, cadre]`. Le voile est un cadre plein écran de remplissage `cref('fond', clair, sombre)` avec l'effet `{'t': 'B', 'b': 14}`.
  - `build_palette.py` : ajouter la paire tirée des métadonnées claire et sombre, qui donnera `dérivées/fond/17393829-1B1B1B38`.

### 6. Compression horizontale des glyphes du canvas (`scaleX`) — visible, 22 cadres
- **Cause.** `canvas_scene()` ignore `g['scaleX']`. Valeurs concernées :
  - décryptage : W 0,5966 ; m 0,6451 ; Y 0,9637 ; W 0,5678 ;
  - arrivée : « % » 0,7431 et « 9 » 0,8364 ;
  - « 39 » hexadécimal : 0,9689, effet négligeable.
- **Correctif.**
  - `canvas_scene()` : poser `node['sx']` quand `scaleX < 0,995`.
  - `render.js`, branche texte :
    1. `v = figma.flatten([t], parent)`, puis réappliquer le remplissage lié ;
    2. avec `cx = n.x + n.w/2`, faire `v.resize(v.width·sx, v.height)` puis `v.x = cx − (cx − v.x)·sx`.
  - Pour les chiffres DejaVu, multiplier l'avance et la largeur de l'instance par `scaleX`.
  - Ajouter une fonction `flatten` factice dans `sim_figma.mjs`.

### 7. Découpe du logo pendant son apparition (`clip-path`) — visible pour 4 cadres (parcours visiteur), mineur pour 4 (logo membre)
- **Cause.** `capture_lib.styleOf` n'enregistre pas `clipPath`. L'information existe pourtant dans `meta.symbol.logoClip` : `inset(0px 0px 49.8125%)` et `inset(0px 0px 9.92719%)`. Aucun nouveau relevé n'est donc nécessaire.
- **Correctif.**
  - `dom2fig.build()`, pour `.entrance-logo` : analyser `inset()`, avec 1 à 4 valeurs en px ou en %. Envelopper le cadre du logo dans un cadre `c: 1` placé en (x + l, y + t), de taille (w − l − r, h − t − b). L'enfant est décalé de (−l, −t). Le flou et l'opacité restent à l'intérieur, ce qui coupe net le flou.
  - Plus tard : ajouter `clipPath` et `mask` dans `styleOf`.

### 8. Textes en interligne « normal » trop bas — visible pour l'arabe (≈ 6 px, 4 cadres), mineur pour le latin (2 à 3 px, tous les cadres)
- **Cause.** `text_nodes()` centre une boîte de 1,2 em mais laisse `lh` vide. Figma applique alors la hauteur AUTO de la police :
  - Jost : 1,445 em ;
  - Noto Sans Arabic : 2,112 em, avec la ligne de base à 1,374 em (hhea 1374 / −738, lu dans la police installée).

  Écarts prévus : +0,1225·fs en latin et +6,8 px en arabe. Écarts mesurés en arabe : 5,9 à 6,5 px.
- **Correctif**, dans `text_nodes()`, quand `f['lh']` est vide :
  - `lh` = pas de ligne mesuré, soit `lines[1][1] − lines[0][1]`, ou `lines[0][3]` pour une seule ligne. C'est la zone de contenu de Chrome : 23 px pour 16 px.
  - Émettre ce `lh` comme valeur fixe, avec `top = lines[0][1]`.

  Avec une hauteur fixe, Figma centre les glyphes. C'est déjà juste pour le texte d'état arabe, dont l'interligne vaut 24 px.

### 9. Titre « Création de compte simulée » sur une ligne (mobile) — visible, 2 cadres
- **Cause.** La largeur Figma vaut max(lignes, 246) + 1,5 = 247,5 px. Elle dépasse la largeur du titre sur une ligne (247,28 px), donc Figma ne coupe pas.
- **Correctif.**
  - `text_nodes()` transmet `nl` (nombre de lignes) et `wmin` (largeur de la plus longue ligne).
  - `render.js` : tant que `round(t.height / n.lh) < n.nl`, réduire la largeur de 0,5 px, sans descendre sous `wmin + 0,25`. Ce correctif suppose le point 8.

### 10. Logo 42 en #1B1B1B au lieu de #000000 à l'entrée — mineur
- **Cause.** L'appel `010-fix-logo.js` lie le composant `2:112` à `Rôles/logo`. Or l'entrée affiche le SVG brut : #000000, avec `invert(1)` en sombre.
- **Correctif.** Dans `dom2fig.build()`, branche `img` : pour `logo-42.svg` en entrée, ajouter `col: cref('icône', #000000, #FFFFFF)` et créer la variable correspondante. `render.js` recolore déjà les instances.

## Ordre d'application conseillé
1. Option immédiate 1d (1 appel), si l'utilisateur veut un sombre lisible tout de suite.
2. Code :
   - `figlib` et `build_palette` : points 1a et 5 ;
   - `dom2fig` : points 1b, 2a, 2c, 4, 5, 6, 7, 8, 9 et 10 ;
   - `render.js` : points 2b, 6 et 9 ;
   - fonctions factices de `sim_figma.mjs`.
3. `build_palette.py`, puis `make_call.py palette` et `make_call.py renderer`.
4. Rendu, les deux globes étant au registre :
   1. `layout.py scenes entrance` ;
   2. `node sim_figma.mjs` ;
   3. envoi des 7 lots ;
   4. `layout.py dark entrance`.

   Coût : environ 12 appels.
5. Nouvelle vérification avec `section_frames.py` corrigé (point 3).

## Points écartés ou corrigés
- **Reproduire le `clip-path` circulaire du globe** : inutile. Le voile, une fois percé, recouvre tout ce qui dépasse, car son trou a le même rayon (181,5 et 267).
- **« Appels 023 et 024 non envoyés »** : inexact. L'appel 023 a créé `33:19`. Le 024 a été interrompu (recopie tronquée), puis repris en morceaux par le lot 033, qui a créé `45:20`.
- **« `clip-path` absent du relevé »** : cause corrigée. Il est déjà dans `meta.symbol.logoClip` ; le défaut est maintenu.
- **Taux élevés et bandes blanches des planches d'origine** : faux positifs de l'outil (point 3).
- **Intérieur sarcelle du bouton du compte** : simple conséquence du point 1. Seul le liseré `#FFFFFFB2`, lié à aucune variable, reste un défaut.
- **Calque nommé « Arrivée · الدخول »** : sans effet visuel.
- **Gravités harmonisées** : le fond sarcelle de la révélation et de l'erreur passe de « visible » à « bloquant », comme dans les autres sections.

## Limites
- Aucun outil Figma n'a été utilisé. Trois comportements sont donc déduits de l'API et des rendus observés, sans avoir été rejoués :
  - le centrage des glyphes dans une hauteur de ligne fixe ;
  - `subtract` ;
  - `flatten` suivi de `resize`.

  Les simuler, puis contrôler un cadre avant l'envoi complet.
- L'essai d'appariement porte sur les 168 états de `dom/` ; `palette.json` avait été construit sur 99.
- L'état du registre a été lu à 5 h 23. D'autres envois avaient lieu en parallèle.
- `PROJECT_CONTEXT.md` et le journal ne sont pas mis à jour, à cause de la consigne de lecture seule.
