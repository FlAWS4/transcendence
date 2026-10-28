# Globe vectoriel de l’Explorer — refonte Figma (15-16 octobre 2026)

Globe de la page Explorer redessiné en **chemins SVG éditables** pour remplacer, dans les maquettes Figma, le rendu WebGL MapLibre du prototype actif (`site/`, lu sans modification). Mêmes caméra, géographie, couleurs et repères que les captures de référence `../../reference/explorer/`.

Ces fichiers sont des **ressources pour Figma**. Ils ne sont ni importés dans Figma par ce travail, ni utilisés par le site.

Tout est produit par [`../../scripts/globe_svg.py`](../../scripts/globe_svg.py) :

```sh
cd figma/refonte-20261015/scripts
python3 globe_svg.py                      # SVG + globe-params.json (≈ 10 s)
python3 globe_svg.py --compare            # + rendus Inkscape et planches compare-*.png (≈ 40 s)
python3 globe_svg.py --capture-medallion  # recapture le médaillon réel (capture_lib, serveur local :8765)
```

## Fichiers

| Fichier | Contenu | Taille | Groupes (`id`) |
| --- | --- | ---: | --- |
| `globe-monde--desktop.svg` | Vue Monde au repos, 1440 × 960 | 43 081 car. | `sphere`, `land`, `borders`, `outline`, `markers` |
| `globe-monde--mobile.svg` | Vue Monde au repos, 390 × 844 (px CSS) | 43 549 car. | idem |
| `globe-pays-france--desktop.svg` | Vue Pays France, 1440 × 960 | 43 749 car. | `sphere`, `land`, `borders`, `fade`, `markers` |
| `globe-pays-france--mobile.svg` | Vue Pays France, 390 × 844 | 43 472 car. | idem |
| `globe-medaillon.svg` | Disque Monde seul, 32 × 32 px (viewBox 320) | 10 809 car. | `sphere`, `land`, `outline` |
| `globe-params.json` | Caméras, couleurs clair/sombre et sources, repères FR/EN/AR, mesures | — | — |
| `compare-*.png` | Planches de comparaison avec les captures | — | — |
| `medaillon-capture/` | Médaillon réel capturé le 16 octobre (×1, ×8, clair/sombre) et `state.json` | — | — |

Chaque SVG est autonome (`width`, `height`, `viewBox`), à la taille de l’écran. Un import en (0, 0) dans le cadre Figma superpose donc le disque, les côtes et les repères à leurs positions sur le site. Les couleurs codées en dur sont celles du **thème clair**. Les valeurs sombres et l’origine de chaque couleur sont dans `globe-params.json` → `colors`.

Contenu des groupes :

- **`sphere`** : l’océan (`ocean`), un disque pour la vue Monde et tout le cadre pour la vue Pays.
- **`land`** : une seule forme, `land-union`, union des 258 pays. Les faces cachées sont supprimées et la découpe suit l’horizon (arcs du disque).
- **`borders`** : `borders-countries`, les frontières partagées, et `borders-coast`, les côtes. Le site trace le maillage TopoJSON complet, côtes comprises, dans la même couche.
- **`outline`** : `silhouette`, contour géométrique du disque, **sans peinture** (le site ne dessine aucun contour). Dans le médaillon, `medallion-border` reproduit la bordure de 1 px de `span.scope-medallion`.
- **`fade`** (vue Pays) : deux rectangles en dégradé de la couleur du fond, `fade-x` et `fade-y`. Superposés, ils reproduisent exactement le masque du canevas sur un fond uni.
- **`markers`** : un groupe par repère (`marker-ALB`, `marker-paris`…), avec `…-pill`, `…-halo`, `…-dot` et `…-label`, en Jost 500.

## Paramètres relevés

### Projection : perspective verticale, pas orthographique

Le style déclare `projection: {type: 'globe'}` (`globe-style.mjs`). Dans MapLibre GL 5.24 (`vendor/maplibre-gl.js`), cela vaut `["interpolate", ["linear"], ["zoom"], 11, "vertical-perspective", 12, "mercator"]`. Aux zooms utilisés (1,37 à 4,95), c’est donc une **perspective verticale** : une sphère vue par une caméra à distance finie.

- Rayon de la sphère : `R = 512 · 2^zoom / (2π · cos(latitude du centre))` (fonction `gi()`).
- Distance de la caméra au point central : `f = 0,5 / tan(fov/2) · hauteur = 1,5 × hauteur`, avec `fov = 0,6435011 rad` (36,87°).
- Projection d’un point (λ, φ), le centre étant (λ0, φ0) : `x = cx + s·cosφ·sin(λ−λ0)`, `y = cy − s·(cosφ0·sinφ − sinφ0·cosφ·cos(λ−λ0))`, avec `s = f·R / (R + f − R·cos c)`, où `c` est l’angle au centre. Un point est visible si `cos c > R / (R + f)`.
- Rayon du disque à l’écran : `d = R / √(1 + 2R/f)`. Cette formule est aussi en commentaire dans `design-review-selection.css`.

La différence avec un globe orthographique de même disque est nette. Le centre est agrandi d’environ 20 % sur ordinateur, et le bord comprimé, car la calotte visible ne fait que 79,5° de rayon au lieu de 90°. Projeter les repères en orthographique les déplacerait de **21,7 px en moyenne (24,5 px au plus) sur ordinateur** et de 12,5 px (14,4 px) sur mobile. Avec la perspective verticale, les 25 repères Monde et les 8 campus français tombent à **≤ 0,33 px** des positions relevées dans le DOM, elles-mêmes arrondies au demi-pixel par le site.

### Caméras

| Vue | Centre (lng, lat) | Zoom | `--hg-radius` | R (px) | f (px) | Disque : centre, rayon | Horizon |
| --- | --- | ---: | ---: | ---: | ---: | --- | ---: |
| Monde ordinateur 1440 × 960 | 6, 18 | 1,905859 | 0,270429 | 321,074 | 1440 | (720, 480), 267,012 px | 79,50° |
| Monde mobile 390 × 844 | 6, 18 | 1,372683 | 0,46 | 221,872 | 1266 | (195, 422), 190,921 px | 81,42° |
| France ordinateur | 3,811131, 45,936665 | 4,949058 | — | 3619,406 | 1440 | (720, 480), 1474,3 px (hors écran) | 44,33° |
| France mobile | idem | 3,649498 | — | 1470,384 | 1266 | (195, 422), 806,6 px (hors écran) | 57,50° |

Sources :

- **Centre Monde `[6, 18]`** : `integrated-globe.mjs` (`reset()`, `prepareWorldRender`). Le centre est à 50 % / 50 % (`globe-framing.css`, sans compensation verticale depuis le 13 octobre), sans marge (padding).
- **Zoom Monde** : `log2(min(l, h)/600) + 1,88 + log2(--hg-radius / 0,425)` (`readLayout()`).
- **`--hg-radius` sur ordinateur** : il est ajusté par `design-review-selection.css` (essai « globe dans l’espace libre ») entre la ligne de statistiques (168,3 px) et la ligne d’état (196 px avec les textes plus lisibles). Le disque voulu vaut `min(480 − 168,3, 480 − 196) − 17 = 267 px`.
- **`--hg-radius` sur mobile portrait** : 0,46 (`globe-framing.css`, l’ajustement ne s’y applique pas).
- **Vue Pays** :
  - **centre** : centroïde sphérique des 8 campus français, coordonnées corrigées par `campus-location-overrides.json` ;
  - **zoom** : `countryZoom()`, avec l’emprise de la France métropolitaine `[-4,78489, 42,32566] → [8,20031, 51,08755]` ;
  - **validation** : les positions des 8 campus dans les relevés `explore-country` confirment ce cadrage (écart ≤ 0,33 px).

### Couleurs

Les couleurs de la carte sont **codées dans `globe-style.mjs`** (palettes `light` et `dark`). Elles ne sont pas des variables CSS. Les valeurs ont été vérifiées au pixel près sur les captures.

| Rôle | Clair | Sombre | Origine |
| --- | --- | --- | --- |
| Sphère (océan) | `#D9EEEE` | `#25232B` | `waterWorld`, couche `h42-world-water` |
| Terres | `#19B8B5` | `#256967` | `landWorld`, couche `h42-world-land`, uniforme jusqu’au zoom 5 |
| Frontières et côtes | `#C4F3EF` | `#A5DBD2` | `border`, couche `h42-world-border` |
| Contour | — | — | aucun : pas de ciel ni d’atmosphère dans le style, bord antialiasé |
| Bordure du médaillon | `rgba(255,255,255,.72)` | `rgba(255,255,255,.25)` | `--control-glass-edge` |
| Fondu (vue Pays) | `#F7FAFA` | `#1B1B1B` | `--h42-color-bg` |
| Point des repères | `#ED3491` | `#ED3491` | `--h42-pink` (halo : même rose à 12 %) |
| Pastille | `#FFFFFF` | `#202026` | `--h42-color-surface` |
| Bord de pastille | `#FFFFFF` | `#412030` | clair : codé en dur (`welcome.css:107`) ; sombre : `--warm-line` = rose 18 % dans `#1B1B1B` |
| Libellé | `#1B1B1B` | `#FFFFFF` | `--h42-color-text` |

Les frontières et les côtes suivent le zoom :

| Vue | Largeur | Opacité |
| --- | ---: | ---: |
| Monde ordinateur | 0,533 px | 0,728 |
| Monde mobile | 0,496 px | 0,726 |
| France ordinateur | 0,746 px | 0,741 |
| France mobile | 0,656 px | 0,736 |

Ces valeurs sont interpolées par `zoom(0, .4, 5, .75, 10, 1.1)` pour la largeur et `zoom(0, .72, 7, .75, 11, .25, 14, 0)` pour l’opacité.

**Pas de dégradé sur le globe** : les pixels d’océan et de terre sont uniformes sur les captures. L’impression de dégradé vient du fond de la page, hors SVG : `linear-gradient(145deg, #FFF 8%, #F7FAFA 70%)`, plus deux halos radiaux, sarcelle à 77 % / 42 % et rose à 8 % / 97 %.

**Flou des bords (« halo »)** : il n’est pas dessiné par la carte. Il vient d’un calque CSS `.hg-map::after` (`globe-framing.css`), au-dessus de la carte et sous les repères :

- `backdrop-filter: blur(12px)` sur ordinateur, `8px` sous 701 px ;
- masque `radial-gradient(ellipse closest-side at 50% 50%, transparent 52%, #0003 72%, #0009 88%, #000 100%)`.

Il est négligeable sur le disque Monde ordinateur (≤ 4 % en haut et en bas). Il est fort sur les côtés du globe mobile, d’où la lueur turquoise, et sur les bords des vues Pays. Il n’est **pas représentable en SVG** : à recréer dans Figma par un flou d’arrière-plan progressif ou masqué.

**Fondu des bords (vue Pays)** : `mask-image` du canevas (`integrated-globe.css`, `refreshFade()`), 180 × 150 px sur ordinateur et 55 × 150 px sur mobile, sans effet sur les repères. Le groupe `fade` le reproduit par deux dégradés de la couleur du fond. C’est exact sur un fond uni ; le vrai fond est légèrement dégradé.

### Repères au repos

Géométrie (`integrated-globe.css`) :

- **Point** : 8 px, avec un halo de 5 px à 12 % (`box-shadow`).
- **Pastille** : hauteur 44 px, rayon 22 px, marges 10/16/10/9 px, bord de 1 px. Elle est décalée de (−13, −22) px par rapport au point géographique. Sa largeur est celle du libellé + 45 px (+ 43 px sur mobile).
- **Libellé** : Jost 500, 14 px / 20 px (12 px / 20 px sur mobile). La ligne de base est calculée avec les métriques de Jost (ascendante 1,07 em, descendante 0,375 em).
- **Ombres** (non incluses dans le SVG) : en clair `0 5px 18px rgba(24,61,60,.09), 0 0 0 1px rgba(24,61,60,.03)` ; en sombre `0 8px 26px rgba(237,52,145,.10)`.

Le choix entre pastille et point seul (« compact ») vient du désencombrement du site : tri par distance au centre, 7 libellés au plus sur ordinateur et 4 sur mobile, sans chevauchement. Il dépend de la largeur des libellés, donc de la langue. Les SVG reprennent l’état **français** relevé dans le DOM des captures :

| Vue | Avec libellé | Points seuls |
| --- | --- | ---: |
| Monde ordinateur | Albanie, Angola, Brésil, Canada, Madagascar, Maroc, Émirats arabes unis | 18 |
| Monde mobile | Angola, Luxembourg, Maroc, Palestine | 21 |
| France ordinateur | 42 Angoulême, 42 Lyon, 42 Marseille, 42 Mulhouse, 42 Paris | Le Havre, Nice, Perpignan |
| France mobile | 42 Le Havre, 42 Lyon, 42 Marseille, 42 Mulhouse | Angoulême, Nice, Paris, Perpignan |

Les états EN, AR (clair et sombre) et FR sombre sont listés dans `globe-params.json` → `views.*.markers`. Les positions ne changent pas ; seuls les libellés et le choix pastille / point varient. En arabe, la géographie n’est pas inversée.

### Médaillon (`span.scope-medallion`, 32 px)

Hors de l’Explorer, `dock-navigation.mjs` ne redessine pas de globe. Il ancre **la même scène Monde**, celle de l’ordinateur au repos :

- mise à l’échelle de `32 / (2 × 267,012) = 0,0599225` autour du centre du disque ;
- découpe `clip-path: circle(267,012px)` ;
- passage sous la bordure de 1 px du médaillon.

Le SVG reprend cette caméra dans une `viewBox` de 320 unités affichée à 32 px, soit une précision de 0,05 px :

- **disque** : océan et terres seulement ;
- **frontières** : non reprises, elles ne mesureraient plus que 0,03 px ;
- **bordure** : le groupe `outline` porte celle du médaillon (cercle r = 15,5 px, trait 1 px).

La capture du 16 octobre (`medaillon-capture/`) confirme l’échelle, la découpe et la bordure. Elle montre aussi que la page affiche **les 25 repères réduits** dans le médaillon (pastilles de 5 à 10 × 2,6 px, points d’environ 0,5 px). Ils ne sont pas repris, car la demande portait sur le disque seul. Sur mobile, la scène ancrée est celle du mobile, de perspective très légèrement différente (≤ 0,3 px à 32 px).

## Méthode

1. **Géographie** : `geography/world-countries.topo.json`, Natural Earth 1:10m 5.1.1 (258 pays, 4 658 arcs, 474 776 sommets ; voir `PROVENANCE.md`).
   - Les terres sont l’union des pays : arcs utilisés une seule fois, raboutés comme `topojson.merge`.
   - Les frontières et côtes sont tous les arcs, comme le maillage du site. Les coutures antarctiques sont retirées comme dans `polar-geometry.mjs`.
2. **Projection** de chaque arc avec la caméra ci-dessus.
   - Les parties cachées sont coupées sur la sphère.
   - Les points de coupe sont recalés exactement sur la silhouette.
   - Les terres coupées sont refermées le long de l’horizon, comme le fait `clipRejoin` de d3 : arcs SVG `a` pour la vue Monde, polylignes puis découpe au cadre (+2 px) pour la vue Pays.
3. **Douglas-Peucker en pixels écran, arc par arc.** La même simplification sert aux terres et aux côtes, qui restent donc superposées exactement.
   - La tolérance retenue est la plus petite, par pas de 0,05 px à partir de 0,5 px, qui tient sous 44 500 caractères : **0,75 px** (Monde ordinateur), **0,5 px** (Monde mobile), **0,85 px** (France ordinateur), **0,75 px** (France mobile).
   - Coordonnées arrondies à 0,5 px, commandes relatives.
   - Îlots de moins de 0,75 px² supprimés.
   - Traits raboutés.
4. **Repères** lus dans les relevés DOM des captures (gzip, non versionnés). Sans relevé, le script reprend les repères enregistrés dans `globe-params.json`.
5. **Contrôle** :
   - rendu des SVG par Inkscape 1.4.3, avec la police Jost du dépôt ;
   - composition sur la capture « sans globe » de la même page, qui fournit le même fond et la même interface ;
   - simulation du flou CSS ;
   - comparaison avec les captures claires et sombres.

## Vérifications (16 octobre)

Les mesures sont faites hors repères et hors interface, dans le disque pour la vue Monde et hors fondu pour la vue Pays. Les valeurs sont données en clair / sombre.

| Vue | Terres identiques | Décalage optimal | Côtes du SVG à ≤ 1 px de celles du site | Écart moyen |
| --- | ---: | :---: | ---: | ---: |
| Monde ordinateur | 98,97 % / 99,45 % | (0, 0) | 92,6 % / 98,4 % (≤ 2 px : 96,9 % / 99,6 %) | 0,63 / 0,29 px |
| Monde mobile | 98,59 % / 99,32 % | (0, 0) | 94,3 % / 95,8 % | 0,39 / 0,35 px |
| France ordinateur | 99,57 % / 99,77 % | (0, 0) | 98,3 % / 99,6 % | 0,34 / 0,26 px |
| France mobile | 99,01 % / 99,04 % | (0, 0) | 97,3 % / 94,4 % | 0,32 / 0,39 px |
| Médaillon (rendu ×8) | 99,24 % / 99,69 % | — | — | 6,5 / 5,2 sur 255 à 32 px |

**Disque mesuré** (720 rayons, ajustement de cercle) :

| Vue | Capture | SVG | Attendu |
| --- | --- | --- | --- |
| Ordinateur | (720,04 ; 479,87), r = 267,11 | (720,00 ; 479,92), r = 267,12 | (720 ; 480), r = 267,01 |
| Mobile | (194,79 ; 421,90), r = 191,01 | (194,95 ; 421,97), r = 190,94 | (195 ; 422), r = 190,92 |

Repères : position calculée à ≤ 0,33 px de celle du DOM dans les quatre vues. Libellés, pastilles et points superposés aux captures, vérifiés à 4×.

Les planches `compare-*.png` ont trois rangées :

1. **Clair** : capture | SVG composé sur la page sans globe, avec le flou CSS simulé | écarts (rose : terre du site seul ; bleu : terre du SVG seul ; noir : contours SVG).
2. **Agrandissements** de trois zones.
3. **Sombre**, mêmes colonnes.

`compare-medaillon.png` compare le médaillon réel et le SVG, à 32 px et rendus ×8.

## Écarts restants et limites

- **Terres un peu plus fines dans le SVG.** MapLibre trace un liseré antialiasé de 1 px autour des surfaces (`fill-antialias` par défaut). Ses terres paraissent environ 0,5 px plus larges ; les îlots minuscules et les liserés de côte rasants près de l’horizon (côte Est des États-Unis, Arctique) y sont plus visibles. D’où une partie des côtes du site à plus de 1 px de celles du SVG (89 % à ≤ 1 px sur Monde ordinateur). Si besoin, ajouter dans Figma un contour extérieur de 0,5 px, couleur des terres, sur `land-union`.
- **Simplification** : 0,5 à 0,85 px plus l’arrondi à 0,5 px, soit au plus environ 1 px de déplacement. Les îlots sous 0,75 px² sont absents.
- **Flou des bords** : CSS, non exportable en SVG. Les vues mobile et Pays paraîtront plus nettes sur les bords tant qu’il n’est pas recréé dans Figma.
- **Ombres des pastilles et fond de page** non inclus. Le fondu Pays suppose un fond uni `#F7FAFA` / `#1B1B1B`.
- **Libellés** en français seulement dans les SVG ; les autres états sont dans le JSON.
- **Médaillon** : sans les repères réduits que la page affiche, et sur la caméra ordinateur.
- **Vue Campus non vectorisée.** Rues et bâtiments viennent des tuiles OpenFreeMap, avec relief 3D et inclinaison de 34°. Elle reste une image ; seule la vue Pays est vectorisée.
- **Vue Pays France uniquement**. Pour un autre pays, il faudrait ajouter une entrée dans `VIEWS`.
- **Import Figma non testé ici.** Le rendu est contrôlé avec Inkscape. Les SVG n’utilisent que des éléments simples (`path`, `circle`, `rect`, `text`, `linearGradient`, arcs `a`) et `fill="none"` explicite sur les traits.

## Utilisation dans Figma

1. Importer le SVG à la taille du cadre, en (0, 0), sans le redimensionner. Pour le médaillon : 32 × 32 dans le siège du filtre.
2. Relier les couleurs aux variables clair / sombre d’après `globe-params.json` → `colors`. Pour les frontières, garder l’opacité et la largeur indiquées par vue.
3. Recréer au besoin les effets absents :
   - ombres des pastilles ;
   - flou d’arrière-plan progressif des bords (12 px ou 8 px, masque radial de 52 % à 100 %) ;
   - éventuellement le liseré de 0,5 px des terres.
4. Pour une autre langue, reprendre les libellés et l’état pastille / point listés dans `globe-params.json` → `views.<vue>.markers.<variante>`.
