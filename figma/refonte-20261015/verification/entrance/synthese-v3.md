# Vérification Figma de l'arrivée — synthèse v3 (16 octobre 2026)

**Périmètre.** Troisième passe, limitée aux trois sections modifiées depuis la v2 :
- révélation (19:20) : appels 140 (4 cadres clairs, moteur corrigé) et 141 (4 clones sombres) ;
- arrivée (19:2) et déchiffrement (19:11) : appel 139 (72 glyphes resserrés reliés à leur variable) ;
- captures de section de 15 h 00, soit 48 cadres : 24 clairs et 24 clones sombres.

Les trois vérificateurs n'ont relevé aucun défaut. Pour recouper, sans outil Figma ni Chrome :
- planches rouvertes : révélation (mi-parcours et fin), binaire mobile en clair et en sombre, « vers le logo (membre) » mobile sombre, zooms des glyphes et des libellés ;
- différence pixel à pixel des captures v2 et v3, cadre par cadre ;
- couleur de l'anneau des 25 points de chaque cadre de la révélation, comparée au site ;
- mesures de `section_frames.py` rejouées avec quatre variantes d'échelle ;
- code relu : `render.js` (`build`, `runJob`), appels 139 à 141, `section_frames.py`, `record_frames.py`, scènes de la révélation.

Mesures : [`v3/synthese/controles_synthese.json`](v3/synthese/controles_synthese.json).

**Bilan.**
- Aucun défaut Figma confirmé.
- Les trois défauts de la v2 sont corrigés, et rien d'autre n'a changé.
- Le rectangle d'appui, le rognage des cadres sans enfant et `resolveForConsumer` sont désormais validés en pixels. La limite notée en v2 est levée ; Explorer, Projets et Profils utilisent le même moteur.
- Restent deux corrections de l'outil de contrôle, puis deux suites : la mise à jour du relevé des identifiants et un contrôle manquant.

## Points de la passe précédente

| Point | État en v3 |
|---|---|
| 1. Étalement des ombres | **Corrigé.** Les anneaux des points sont présents en clair et en sombre : 3,4 px à mi-parcours (3,59 sur mobile), 5 px à la fin. Écart médian de l'anneau au site : 1 à 5 niveaux, contre 24 à 26,5 en v2. Les 22 pastilles ont leur rectangle d'appui (appel 140, `backed: 22`). L'anneau de 1 px à 3 % est présent en clair. |
| 2. Glyphes resserrés noirs | **Corrigé.** Arrivée : dans les 10 cadres clairs, le pixel le plus sombre de « % » et « 9 » passe de 0 à 27 (#1B1B1B), comme les autres glyphes. Déchiffrement à mi-parcours : W, m, Y et W sont en #00BABC (moyenne 124,7) et non plus en #000000. Les clones sombres sont inchangés. |
| 3. Libellés à mi-révélation | **Corrigé.** Ils tiennent sur une ligne dans les 4 cadres : 9,518 px avec un interligne de 13,6 sur ordinateur, 8,625 px avec 14,38 sur mobile. Leurs largeurs d'encre sont à environ 1 px du site. |

**Rien d'autre n'a changé.** Comparaison des captures v2 et v3, de même taille :
- arrivée : 2 565 pixels (écart maximal de 27), uniquement dans les zones de « % » et « 9 » des 10 cadres clairs. Les 18 autres cadres sont identiques ;
- déchiffrement : 3 262 pixels, uniquement dans les 2 cadres clairs à mi-parcours. Les 10 autres sont identiques ;
- révélation : 71 406 pixels, tous dans la zone du globe des 8 cadres (points, pastilles, ombres, libellés) ;
- aucun pixel n'a changé hors des cadres : titres, notes et fond de section.

## Correctifs par priorité

Aucun ne demande d'appel Figma.

### 1. Outil `section_frames.py` : échelle anisotrope — pas un défaut Figma

**Cause.** `kx` et `ky` sont calculés chacun sur son axe. Or l'export fixe exactement son plus grand côté (3000 px) et arrondit l'autre au pixel près.
- L'échelle tirée du petit côté est fausse de 0,01 à 0,03 %.
- La découpe dérive donc de 0,4 à 0,7 px de capture au bas de la révélation et du déchiffrement, et de 0,2 px à droite de l'arrivée.
- Les taux « changed » s'en trouvent gonflés. Ainsi « vers le logo (membre) — Mobile · Clair » affiche 0,83 %, alors que ce cadre est identique à la v2 ; avec une échelle unique, il tombe à 0,10 %.

**Correctif** (`section_frames.py`, calcul de l'échelle) :
- quand |kx − ky| / kx < 1 %, prendre `k` du plus grand côté de la capture, soit `kx` si `fig.width >= fig.height`, sinon `ky` ;
- l'appliquer aux deux axes, avec une origine de 40·k.

Ne pas prendre `kx` dans tous les cas, comme le proposaient deux vérificateurs. À l'arrivée (1578 × 3000), c'est la hauteur qui est exacte : `kx` y aggrave les taux, par exemple de 0,91 à 1,37 % pour « libellés en arabe — Mobile · Clair ».

### 2. Outil : liseré clair des cadres sombres — pas un défaut Figma

**Cause.** À l'export, le pixel du bord d'un cadre sombre mêle le cadre et le fond blanc de la section, au prorata de sa couverture.
- Exemple : bord gauche à x = 622,22, mesuré à 84 pour 78 attendus.
- Le pixel suivant vaut 27 : Figma n'a donc aucun contour.
- Le rééchantillonnage bicubique étale ce mélange sur environ 2 px de capture, soit 3 à 5 px du site.
- Ce liseré représente environ la moitié du taux des cadres sombres.

**Correctif** (`section_frames.py`, mesures) :
- calculer `changed`, `meanRGB` et `channelOff12` sans une bordure de `m = ceil(1,5 / k)` px du site, soit 5 px à 1/2,7 et 3 px à 0,704 ;
- appliquer ce retrait à `site` comme à `crop` ;
- garder la planche entière et écrire `border` dans index.json.

Rejoué avec le correctif 1, le taux maximal passe de 2,65 à 1,65 % à l'arrivée, de 1,47 à 0,61 % au déchiffrement et de 1,44 à 0,67 % à la révélation. Les cadres clairs ne bougent pas.

### 3. Relevé des identifiants : révélation périmée — tenue

**Constat.** `figma-ledger.json` (mis à jour à 14 h 33) donne encore les 8 cadres de la révélation que les appels 140 et 141 ont supprimés (option `final` de `runJob` et boucle des clones) :
- anciens : 70:1187, 70:1268, 73:1205, 73:1286, 77:2367, 77:2438, 77:2506, 77:2577 ;
- nouveaux : 106:16184, 106:16273, 106:16356, 106:16444, 108:1259, 108:1337, 108:1409, 108:1487.

**Correctif.** Lancer `python3 scripts/record_frames.py` à la fin des chaînes. C'est l'étape 2 déjà prévue de la reprise ; le dernier appel l'emporte pour chaque nom.

### 4. Contrôle manquant : connexion et création de compte — à confirmer

**Constat.**
- Les sections 19:5 et 19:8 contiennent 8 glyphes resserrés clairs et 8 sombres, flous sous le voile.
- L'appel 139 les couvre : 72 vecteurs, soit les 36 nœuds `sx` des 16 scènes claires, multipliés par deux pour les clones.
- Faute de capture v3 de ces sections, ce n'est pas vérifié en pixels.

**À faire.** Lors de la prochaine capture, exporter 19:5 et 19:8, puis vérifier que « % » et « 9 » ont, sous le voile, la teinte des glyphes voisins.

## Écartés ou non comptés

- **Lueur rose des pastilles en sombre** : la géométrie claire est gardée. L'écart est de 3 à 4 niveaux au plus. C'est le correctif 4 de la v2, non retenu pour l'instant.
- **Côtes et frontières du globe vectoriel** : les traits sont plus nets et plus clairs. Ils causent des écarts de 10 à 22 niveaux sous quelques anneaux (Royaume-Uni, Canada sur mobile, Arménie, Tchéquie). Ces écarts existaient déjà en v2 ; l'anneau lui-même est juste.
- **Halo et tuiles floues du globe WebGL** à la fin, sur mobile : ils viennent du site.
- **Bandes des dégradés clairs** : c'est une limite de Figma, acceptée en v2.
- **Point sarcelle de 3 × 2 px** au sommet de l'anneau, dans « vers le logo (membre) » sur mobile : c'est un artefact de Chrome (`stroke-dasharray` à 100).
- **Taux plus élevés qu'en v2** pour des cadres identiques au pixel près (déchiffrement, fins de la révélation) : ils viennent de l'outil (correctifs 1 et 2).
- **« 9 » plus gras sur le site** (remarque de la v2) : non confirmé, son encre fait 98 à 101 % de celle du site.
- **Textes flous et chiffres binaires plus gris** à l'arrivée : ils tiennent à l'export à 1/2,7.

## Limites

- Aucun outil Figma ni Chrome n'a été utilisé. Le rectangle d'appui et la liaison des glyphes sont attestés par les pixels et par les retours des appels 139 et 140.
- Seules les sections 19:2, 19:11 et 19:20 ont une capture v3. Les autres sections de l'arrivée n'ont reçu que l'appel 139 (voir le correctif 4).
- Écritures : ce fichier et `v3/synthese/controles_synthese.json`. Les scripts de mesure restent hors du dépôt.
- En raison de la consigne de lecture seule, `PROJECT_CONTEXT.md`, le journal, le README de la refonte et le relevé ne sont pas mis à jour. Le plan du site n'est pas concerné.
