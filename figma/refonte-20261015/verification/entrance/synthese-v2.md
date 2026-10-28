# Vérification Figma de l'arrivée — synthèse v2 (16 octobre 2026)

**Périmètre.** Seconde vérification de la zone « entrance », après les appels 039 à 049 :
- 8 sections et 84 cadres, soit 42 clairs et 42 clones sombres ;
- captures de section de 9 h 37.

Quatre comparateurs ont relevé 10 défauts : aucun bloquant, 5 visibles et 5 mineurs. Pour les recouper :
- planches « visible » rouvertes : déchiffrement, mi-révélation, halos des repères, contrôle croisé sur Explorer ;
- pixels mesurés sur les captures de section 19:2 et 19:11 ;
- code relu : `render.js`, `dom2fig.py`, `layout.py`, `make_call.py`, `sim_figma.mjs`, `section_frames.py` ;
- essai à blanc de `dom2fig.convert()` sur les 42 scènes claires (`python3 -B`, sans écriture), comparé aux scènes envoyées ;
- documentation de l'API Figma : `Effect`, `Variable`, `VariableBindableEffectField`.

Travail en lecture seule : aucun correctif appliqué, aucun appel Figma. Seule autre écriture : `v2/arrival/synthese/glyphes_resserres_noirs_clair.png`.

**Bilan.**
- 7 défauts confirmés, regroupés en 4 causes. Un 5e point concerne l'outil de contrôle.
- Un défaut de plus a été trouvé pendant la synthèse : « % » et « 9 » noirs à l'arrivée. Il a la même cause que le correctif 2.
- Les 3 signalements de bandes dans les dégradés clairs sont acceptés comme limite de Figma (voir la fin).

## Points de la passe précédente

| Point | État en v2 |
|---|---|
| 1. Bande sarcelle en sombre | Corrigé : fonds unis #1B1B1B dans tous les cadres sombres |
| 2. « Visiter » plein | Corrigé : intérieur transparent, contour #708383 |
| 3. Ombres des boutons en sombre | Corrigé |
| 4. Voile `::backdrop` | Corrigé : couleur et flou équivalents |
| 5. Révélation | Corrigé : globe sous le voile percé, trou au bon rayon, anneau effacé à la fin |
| 6. Lettres du décryptage en sombre | Corrigé : #ED3491 |
| 7. Resserrement `scaleX` | Forme corrigée (largeurs à ±0,9 px). **Régression de couleur en clair** : voir le correctif 2 |
| 8. Logo 42 | Corrigé : découpe nette, #000000 en clair et #FFFFFF en sombre |
| 9. Interligne « normal » | Corrigé : écart ≤ 1,2 px en latin, de −0,4 à +1,0 px en arabe (≈ 6 px avant) |
| 10. Titre mobile | Corrigé : deux lignes |
| 11. Erreur en sombre | Corrigé : boutons secondaires sans fond. Liseré du compte à (74,74,76), contre (77,77,80) sur le site |
| Nouveau : libellés de la mi-révélation | **Non corrigé dans Figma.** `dom2fig.py` est corrigé, mais la scène n'a pas été renvoyée (correctif 3) |

## Correctifs par priorité

### 1. Étalement des ombres ignoré sur les cadres — visible, 8 cadres de la révélation, et au-delà de l'arrivée

**Défaut.** Les points roses des repères n'ont pas leur anneau `0 0 0 5px rgba(237,52,145,.12)`, réduit à 3,4 px à mi-parcours. Il manque en clair comme en sombre. Au bord du point « Brésil », on mesure (255,255,255) dans Figma contre (253,229,242) sur le site.

**Cause.**
- L'API Figma n'accepte `spread` que sur les rectangles et les ellipses, ou sur les cadres, composants et instances qui ont un remplissage visible et `clipsContent`.
- `render.js` crée `.hg-marker-dot` comme un cadre sans enfant, avec `clipsContent = !!n.c`, donc faux.
- L'ombre 0/0/0, privée de son étalement, reste cachée sous le point. La scène porte pourtant bien l'effet.

**Étendue** (ombres à étalement présentes dans les scènes) :
- arrivée : 100 points et 22 anneaux de pastilles, ces derniers à 3 % et donc invisibles ;
- Explorer : 242 points et 74 anneaux ;
- onglet sélectionné « Vue d'ensemble » : anneau intérieur de 1 px à 32 %, posé sur des cadres avec enfants. On le trouve 31 fois dans Projets, 19 dans Profils et 2 dans Explorer. À confirmer par la vérification de ces zones.

`sim_figma.mjs` ne signale rien.

**Correctif** (`render.js`, `build()`, branche cadre) :
- a. Définir `const sp = (n.e || []).some(e => (e.t === 'D' || e.t === 'I') && e.s);`. Remplacer la l. 218 par `f.clipsContent = !!n.c || (sp && !(n.ch || []).length && f.fills.length > 0);`. Cette ligne précède déjà l'affectation de `f.effects` (l. 227).
- b. Cadre avec enfants et sans `n.c` :
  - après la construction des enfants, insérer en position 0 un rectangle « Fond et ombres » de n.w × n.h, avec les mêmes rayons ;
  - lui transférer les remplissages, les ombres et le flou d'arrière-plan du cadre, puis les retirer du cadre ;
  - garder sur le cadre le flou de calque ;
  - si `n.al` : `rect.layoutPositioning = 'ABSOLUTE'`, puis x = y = 0.

  Le principe est celui du voile percé (l. 229 à 236).
- c. `sim_figma.mjs` : compter un avertissement pour tout effet à étalement posé sur un FRAME sans `clipsContent` ou sans remplissage.
- d. Reconstruire le moteur (`build_renderer.cjs`, `make_call.py renderer`), puis rendre la révélation (correctif 3).
- e. Cadres déjà envoyés (Explorer, puis Projets et Profils) : lire d'abord `effects[0].spread` sur un point existant.
  - S'il vaut encore 5, un appel de correction par page suffit : a, puis réaffecter `effects`, et b pour les autres cadres.
  - Sinon, il faut un nouveau rendu.

  Les appels en attente embarquent l'ancien moteur.

### 2. Glyphes resserrés noirs dans les cadres clairs — visible sur 2 cadres, mineur sur 14

**Défaut.**
- Déchiffrement à mi-parcours, ordinateur et mobile en clair : W, m, Y et W sont #000000 au milieu de lettres #00BABC. Les clones sombres sont justes (#ED3491).
- Arrivée, 10 cadres clairs (remontée, repos en FR et en AR, libellés EN et AR) : « % » et « 9 » sont #000000 au lieu de #1B1B1B, alors que les autres glyphes mesurent (27,27,27). Ce défaut n'a pas été signalé par le comparateur de l'arrivée. Preuve : `v2/arrival/synthese/glyphes_resserres_noirs_clair.png`.
- Connexion et création de compte, 4 cadres clairs : même cas, flouté sous le voile.

**Cause.** C'est une régression du correctif 7.
- Branche `n.sx` de `render.js` (l. 153 à 164) : après `figma.flatten`, l'instruction `v.fills = [p]` réapplique la peinture de `solid()`. Cette peinture est liée à la variable, mais sa couleur de base est noire (l. 23).
- Sur ce vecteur aplati, la variable n'est pas résolue dans le cadre clair, dont le mode Clair est posé avant la construction. Figma affiche donc la couleur de base.
- Le clone, lui, l'a résolue lors du passage en mode Sombre (appel 049).
- Les chiffres DejaVu sont recolorés de la même façon, mais dans des instances : ils sont justes (26 à 27).

**Correctif.**
- a. **Immédiat**, en 1 appel et sans nouveau rendu, sur la page `1:8`. Pour chaque VECTOR dont le nom contient « · resserré × » :
  - relire la variable liée (`fills[0].boundVariables.color.id`) ;
  - réaffecter `setBoundVariableForPaint({ type: 'SOLID', color: c }, 'color', variable)`, avec `c = variable.resolveForConsumer(nœud).value`.

  Les clones sombres restent justes.
- b. **Méthode** : appliquer la même logique dans la branche `n.sx`, juste après `flatten`, à la place de `if (p) v.fills = [p]`. Le nom de la variable vient de `n.col` (via `S.VN`), et la couleur de base de `V[nom].resolveForConsumer(v).value`. Ajouter `resolveForConsumer` aux variables simulées de `sim_figma.mjs`.
- c. Contrôler ensuite les captures des sections 19:11 et 19:2. Si le noir persiste, remplacer l'aplatissement par des instances de contours Jost, comme pour les chiffres DejaVu : `font_outlines.py`, `assets.py`, puis un nœud `S` redimensionné dans `canvas_scene()`.

### 3. Libellés des repères coupés à mi-révélation — visible, 2 cadres clairs et 2 clones

**Défaut.** Les libellés passent sur deux lignes (« Can/ada », « Alba/nie », « Luxembo/urg ») et la seconde ligne sort de la pastille.

**Cause.** Les scènes `entrance--reveal-mid--*.json` ont été converties à 5 h 35, avant le correctif d'échelle de `dom2fig.py` (9 h 39). La taille (14 ou 12 px) et l'interligne (20 px) n'y sont pas réduits, alors que les boîtes sont mesurées après `scale(0,68)` ou `scale(0,7187)`.

**Vérifié à blanc** avec le `dom2fig.py` actuel :
- libellés en 9,518 px et interligne de 13,6 px sur ordinateur, 8,625 px et 14,38 px sur mobile ;
- « Albanie » : boîte de 34,18 px pour 32,18 px de texte ;
- étalement des points de 3,4 et 3,59 px, ombres des pastilles réduites à 0 3,4 12,24 ;
- hors révélation, les 38 autres scènes claires de l'arrivée restent identiques aux envois, à une exception près : le flou du logo de `member-transition` et `visitor-transition` (4 scènes) augmente de 1 % et de 7,6 %, car il est désormais multiplié par l'échelle du logo ;
- la fin de la révélation ne diffère que par un bruit d'arrondi sur les rayons (3,9999999999999996).

**Correctif**, à faire après le correctif 1 :
1. `make_call.py resync-strings` ;
2. `layout.py scenes entrance reveal` : les 4 scènes claires, la fin comprise pour les halos ;
3. `node sim_figma.mjs` ;
4. envoi ;
5. `layout.py dark entrance reveal`.

Facultatif : appliquer `r2()` aux rayons dans `frame_paints()`.

### 4. Géométrie des ombres claire conservée en sombre — mineur, 8 cadres sombres

**Défaut.** En sombre, deux ombres sont plus courtes que sur le site. L'écart n'est visible qu'à fort contraste.

| Ombre | Cadres sombres | Figma (géométrie claire) | Site en sombre |
|---|---|---|---|
| Lueur rose des pastilles de repère | 4 de la révélation | 0 5 18 | 0 8 26 |
| Bouton du compte | 4 de l'erreur | 0 9 22 | 0 12 26 |

**Cause.**
- `frame_paints()` n'apparie que la couleur des ombres. Le décalage et le flou viennent du relevé clair.
- Le clone sombre ne change que le mode des couleurs.
- Dans les relevés, 4 paires suffisent :
  - (5,18) → (8,26) ;
  - (9,22) → (12,26) ;
  - (22,64) → (16,48) ;
  - (28,90) → (16,48).
- Elles concernent 1 212 ombres : 32 à l'arrivée, les autres dans Explorer, Projets et Profils.

**Correctif.**
- `build_palette.py` et `make_call.py palette` : créer des variables FLOAT Clair/Sombre dans « 42 · Couleurs », par exemple « Effets/ombre-y/9-12 » et « Effets/ombre-flou/22-26 ».
  - À la mi-révélation, les valeurs sont multipliées par k.
  - Portée : `EFFECT_FLOAT`.
  - Elles doivent être dans cette collection, la seule que le clone bascule.
- `dom2fig.frame_paints()` : ajouter `gv: {y: {v: nom}, b: {v: nom}}` sur toute ombre appariée dont la géométrie sombre diffère de plus de 0,25 px. `compress()` indexe déjà ces `{v}`.
- `render.js`, `effects()` : appeler `setBoundVariableForEffect(fx, 'offsetY' | 'radius' | 'offsetX' | 'spread', V[nom])`. L'API admet `radius`, `color`, `spread`, `offsetX` et `offsetY`.
- Cadres déjà envoyés : 1 appel par page, qui lie ces variables d'après la géométrie claire, clones compris.
- Autre option : accepter l'écart.

### 5. Outil `section_frames.py` — pas un défaut Figma

**Cause.** La boîte de la section est détectée par un seuil (> 6), l'échelle est la moyenne `(kx + ky) / 2`, et la découpe se fait en pixels entiers. À l'arrivée, l'outil retient une origine (15, 16) et une échelle de 0,3701, au lieu de 14,82 et 1/2,7. Les découpes glissent donc d'environ 1 px de capture, soit 2,7 px du site :
- liserés clairs au bord des planches sombres ;
- taux « changed » gonflés, jusqu'à 4,8 %.

**Correctif.**
- Calculer `k = largeur de la capture / (sec.w + 80)` et une origine de `40·k` sur les deux axes. La marge de 40 unités est constatée sur les 8 captures.
- Découper en sous-pixel avec `Image.transform` (EXTENT), au lieu d'un recadrage entier suivi d'un redimensionnement.

## Écartés ou acceptés
- **Bandes concentriques des dégradés clairs** (world-wait ×2, révélation et erreur ×8) : acceptées.
  - Elles sont réelles : 1 à 2 niveaux, visibles seulement à contraste ×12, déjà présentes en v1.
  - Elles viennent du moteur de rendu de Figma, qui compose en 8 bits et sans tramage des dégradés à 3–8 %.
  - Aucun correctif fiable n'existe sans image collée, ce que la méthode exclut.
- **« Nœuds arabes en Jost »** (note de l'arrivée) : inexact.
  - 042, 043 et 048 portent `rtl: 1`, et le moteur pose le style « Arabe/… » (Noto Sans Arabic) sur les plages arabes.
  - Aucune police ne manque dans les retours. Seuls les espaces restent en Jost.
- **Ombre de la fenêtre en sombre** (22/64 au lieu de 16/48) : écart ≤ 1 niveau, non compté. Le correctif 4 la règle aussi.
- **Liserés et taux élevés des planches de l'arrivée** : faux positifs de l'outil (correctif 5).
- **Écarts propres au site ou au rendu réduit**, non retenus :
  - point sarcelle de 0,9 px au sommet du cercle sur mobile ;
  - tuiles floues et liseré du limbe du globe WebGL ;
  - « 9 » plus gras sur le site ;
  - chiffres binaires plus gris à 1/2,7.

## Ordre d'application conseillé
1. **Code.**
   - `render.js` : correctifs 1a, 1b, 2b et 4.
   - `sim_figma.mjs` : correctifs 1c et 2b.
   - Pour le correctif 4 : `dom2fig.py`, `build_palette.py` et `make_call.py`.
   - Reconstruire ensuite le moteur.
2. **Correctif immédiat 2a** (1 appel), puis contrôle des sections 19:11 et 19:2.
3. **Révélation** : les 4 scènes claires et leurs clones (correctifs 1 et 3), soit environ 3 à 5 appels.
4. **Explorer, Projets et Profils** : lecture d'un point existant, puis correction page par page ou nouveau rendu.
5. **Correctif 4**, s'il est retenu : 1 appel pour les variables, puis 1 par page.
6. **`section_frames.py`**, à corriger avant la vérification suivante.

## Limites
- Aucun outil Figma n'a été utilisé. La variable non résolue sur le vecteur aplati est déduite des pixels (#000000 est la couleur de base de `solid()`) et du clone sombre, qui est juste. `resolveForConsumer` et le rectangle d'appui restent à valider sur un cadre avant l'envoi complet.
- Les captures de section datent de 9 h 37.
- `PROJECT_CONTEXT.md` et le journal ne sont pas mis à jour, à cause de la consigne de lecture seule. Le plan du site n'est pas concerné.
