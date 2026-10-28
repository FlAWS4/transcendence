# Vérification Figma des éléments communs : synthèse (17 octobre 2026)

## Périmètre

Zone « communs » (page 08 · Éléments communs) : 3 sections et 10 cadres.
- Recherche ouverte : 4 cadres.
- Menu du bas à 300 et 320 px : 4 cadres, dont les 2 sombres, qui n'ont pas de capture du site.
- Remonter en haut : 2 cadres.

Un comparateur a relevé 8 défauts. Pour les recouper :
- **Planches** : les 6 défauts « bloquant » et « visible » ont été rouverts, avec des agrandissements dans `_synthese/`. Les 2 défauts mineurs ont été contrôlés par des échantillons de pixels et par les agrandissements de `_zoom/`.
- **Code relu** :
  - `dom2fig.py` : `fixed_y`, `inflow_positions`, `text_nodes`, `split_run`, `field_runs`, `pseudo_frame`, `zsort`, `clamp_text` ;
  - `capture_lib.py` (EXTRACT_JS), `figlib.parse_gradients`, `render.js` ;
  - côté site : `sticky-header.css`.
- **Relevés et sorties** : relevés `dom/shell/` interrogés, conversions à blanc en mémoire, lecture des scènes et des appels régénérés.

Travail en lecture seule. Rien n'a été écrit hors de ce dossier. Aucun outil Figma ni Chrome n'a été utilisé.

## Bilan

- **8 défauts confirmés**, aucun écarté. Ils se rattachent à 6 causes.
- Pendant et après la comparaison, de 12 h 13 à 12 h 35 UTC, la méthode a été corrigée en parallèle pour les 4 causes des défauts bloquants et visibles.
- Ces corrections sont **vérifiées dans les scènes régénérées à 12 h 27** et dans les appels 603 et 606 ; les appels 602 à 607 ont été générés en même temps. L'envoi a commencé à 12 h 34.
- **Deux points restent à corriger, et le premier est urgent** :
  1. le nouvel ordre des calques fait passer le fond « atmosphère » sous un bandeau fixe mesuré sur toute la hauteur de la page ;
  2. la troncature des résumés, en cours, s'écarte encore de Chrome sur un cas.

> **Urgent.** Les lots en cours d'envoi, toutes zones confondues, contiennent ce bandeau. On l'a vérifié dans les appels 559, 570, 603, 604 et 606, et dans 602, déjà envoyé entre 12 h 34 et 12 h 41. Une fois rendus, ces cadres perdront la teinte du fond. Il faut soit corriger avant de continuer les envois, soit prévoir l'appel ciblé décrit au point 1. À 12 h 41, `pseudo_frame`, `parse_gradients` et `clamp_text` étaient encore inchangés sur ces points.

## Correctifs par priorité

### 1. Bandeau fixe `#app::after` mesuré sur toute la page : il masque le fond « atmosphère » (à corriger maintenant)

**Défauts**
- Défaut mineur relevé : « Fond » uni dans Remonter en haut, en clair et en sombre.
- Après le renvoi, le fond disparaît aussi des cadres Recherche et Menu du bas, ainsi que de toutes les pages de contenu reconverties (Projets, Profils, Chroniques, Compte).
- Écart attendu : 3 à 5 niveaux.

**Sur le site** (`sticky-header.css`), `.app[data-navigation=dock]::after` a les propriétés suivantes :
- `position: fixed`, `inset: 0 0 auto`, `z-index: 6` ;
- hauteur : 166 px à 390 × 844, 188 px à 1440 × 960, 159 px à 300 ou 320 × 640, 158 px et 124 px en lecture ;
- dégradé : fond de page plein jusqu'à 130, 136 ou 124 px, puis 82 % à 142,6, 154,2 ou 136,25 px, et transparent à 100 %.

**Cause**
- `pseudo_frame()` traite `fixed` comme `absolute`. Le bloc conteneur devient la boîte de `#app`, haute de 2 826 px. Avec `top` 0 et `bottom` calculé à 678 px (844 − 166), le calque mesure 2 148 px. Il mesure 1 794 px sur ordinateur, et 4 657 ou 4 760 px à 300 ou 320 px.
- Sur 328 relevés clairs où le bandeau est visible, 310 sont faux. Les 18 autres ne sont justes que parce que la page est aussi haute que l'écran.
- `figlib.parse_gradients()` ignore les positions en px et répartit les arrêts à 0, ⅓, ⅔ et 1. Le fond de page reste donc opaque sur les 716 premiers px.
- Jusqu'au 16 octobre, ce calque passait sous « Fond ». Depuis `zsort()` (17 octobre), « Fond » (z-index −1) passe dessous. Cet ordre est juste, mais avec cette hauteur le fond atmosphère est entièrement couvert. C'est vérifié dans les scènes de 12 h 27 et dans les appels.

**Correctif**
- Dans `dom2fig.py`, `pseudo_frame(…, vp=(vw, vh))` : pour `position == 'fixed'`, le bloc conteneur devient l'écran (`ob = 0`, `pw, ph = vw, vh`). x et y sont alors en coordonnées d'écran.
- Dans `_convert.build_one`, boucle des pseudo-éléments, pour un pseudo-élément fixe :
  - appliquer la règle de `fixed_y` à `y_écran` : ajouter H − vh si le cadre est pleine hauteur et que `y_écran > vh/2`, ou ajouter `sy` pour un cadre de la hauteur de l'écran ;
  - puis `pf['x'] = x − x0` et `pf['y'] = y_cadre − y0`.
  - Résultat attendu : 390 × 166 en (0, 0), 1440 × 188 et 300 × 159.
- Dans `figlib.parse_gradients()`, garder une position en px et la convertir dans `frame_paints` selon la longueur de la ligne du dégradé (|w·sin a| + |h·cos a|, la même que dans `render.js`). Arrêts attendus : 0 / 0,783 / 0,859 / 1 sur mobile et 0 / 0,723 / 0,820 / 1 sur ordinateur. C'est sans effet visible en haut de page, mais le bandeau devient identique.
- Pour les cadres déjà envoyés, un seul appel ciblé suffit plutôt que de tout renvoyer :
  - pour chaque calque « Après · Application » plus haut que son écran, `resize(w, h)` avec le `h` calculé du relevé (`after.h`) ;
  - replacer ses arrêts ;
  - les clones sombres portent le même nom.

### 2. Résumés limités à 2 lignes : correctif en cours à ajuster avant la prochaine régénération (mineur)

**Défaut** : Figma coupe lettre à lettre, par exemple « discussion pour compre… » au lieu de « discussion pour… ». Cadres concernés : Remonter en haut et Recherche mobile, en clair et en sombre, ainsi que toutes les cartes.

**Cause** : dans `render.js`, `textTruncation = 'ENDING'` avec `maxLines`. Chrome garde sa coupure de mots, puis pose « … ».

**En cours** : `clamp_text` (`dom2fig.py`, 12 h 35) écrit le texte visible dans les trois langues, ce qui donne le bon résultat dans 195 cas sur 210. Un écart demeure :
- le test `meas(cand) <= width + 0.1` accepte « modifier et lancer les outils », qui mesure 160,09 px dans une boîte de 160 px ;
- Chrome renvoie ce mot à la ligne, donc Figma affichera « …lancer les ou… » au lieu de « …lancer les… » ;
- 15 textes bornés français sur 210 sont concernés.

**Correctif**
- Écrire `<= width`. On obtient alors 0 écart sur 210 textes français et 194 anglais, comparés aux lignes mesurées du relevé.
- Mieux encore : pour la langue du relevé, couper d'après les largeurs mesurées des lignes, avec `split_run` sur `run['l']`. Pour l'anglais et l'arabe, faire de même avec leurs propres relevés (dans `pair_strings`). En arabe, la seule mesure Noto laisse 3 coupures différentes sur 114.

### 3. Calques fixes et collants d'un relevé défilé (bloquant, 2 cadres Remonter en haut ; corrigé, à renvoyer)

**Défauts**
- Bouton « Remonter en haut », champ « Chercher dans Horizon », dé et menu du bas hors du cadre.
- En-tête posé à y = 1 400.
- Barre « Monde » hors du cadre, ainsi que la position du « Fond ».

**Cause** : le relevé est pris défilé (`scroll [0, 1400]`), donc en coordonnées de document. L'ancien `fixed_y` ajoutait H − vh = 1 982 px sans retirer le défilement :
- 2 054 → 4 036 ;
- 2 167 → 4 149 ;
- 1 484 → 3 466 ;
- 1 400 → 3 382.

L'en-tête `sticky` restait à 1 400.

**Correctif, fait vers 12 h 22**
- Calque `fixed` : `yv = y − sy`, puis ajout de H − vh seulement si `yv > vh/2`.
- Calque `sticky` : y du même élément dans un relevé de la zone pris en haut (`inflow_positions`).

**Vérifié** dans la scène et l'appel 606 :

| Calque | y |
|---|---|
| En-tête | 0 |
| « Monde » | 84 |
| Bouton | 2 636 |
| Champ et dé | 2 692 |
| Menu | 2 749 |
| Fond | 0 |

Les mêmes positions ont été retrouvées par une conversion à blanc avec ce code.

**Même cause ailleurs** : 7 états de Projets et Profils pris défilés en français, régénérés eux aussi à 12 h 27. Il s'agit de comment-menu et comments-sort-open (ordinateur et mobile), mention-picker, viewer et profile-local-menu (mobile).

### 4. Boutons du menu dessinés dans le champ de recherche ouvert (bloquant, 4 cadres ; corrigé, à renvoyer)

**Cause** : jusqu'au correctif, `capture_lib.py` écartait un élément d'opacité ≤ 0,01 mais gardait ses enfants, rattachés à la `nav`. Ici, `.main-nav.has-dock-search[data-search-open=true] > button[data-section]` a `opacity: 0`, ce qui donnait 10 `svg` et `span` orphelins.

**Correctif, fait à 12 h 13** : un ensemble `transparent` écarte tout le sous-arbre.
- Les 8 relevés `search-open` ont été repris à 12 h 14 ; les anciens sont dans `_superseded/captures-recherche-avant-opacite-20261017/`.
- Les captures du site sont identiques : aucun pixel ne s'écarte de plus de 10 niveaux.

**Vérifié**
- 0 nœud orphelin, contre 10 auparavant.
- La scène ne garde que la loupe, « Paris » et la croix.
- Les relevés back-to-top, dock-300 et dock-320 n'ont aucun nœud orphelin : inutile de les reprendre.

### 5. Noms de campus coupés en fin de ligne (visible, 6 cadres et listes de Projets ; corrigé, à renvoyer)

**Cause** : un run sur deux lignes devenait un seul texte qui partait de la ligne la plus à gauche. Résultat : « 42 » posé sur « 42 Paris », et « 42 Abu » sur « 1337 Khouribga ».

**Correctif, fait** : `text_nodes` passe par `split_run`. Chaque ligne devient un texte d'une ligne, à sa position mesurée.

**Vérifié** :
- « 42 » en (142,98 ; 353) puis « Tokyo » en (26 ; 373) ;
- « 42 Abu » puis « Dhabi » ;
- « 42 » puis « Luanda » ;
- à 300 px, « 42 » en x = 218,8 puis « Bangkok » en x = 22.

**Garde-fou conseillé** : la condition ne regarde que le départ de la première ligne.
- Aujourd'hui, seuls des `<bdi>` inline (142 runs) et des paragraphes de commentaire placés après une mention (16 runs) la déclenchent.
- Un paragraphe centré dont la première ligne est plus courte serait pourtant coupé, et perdrait sa liaison FR/EN/AR.
- Il faut donc limiter la règle à `display: inline`, ou à un run précédé d'un autre contenu sur sa ligne.

### 6. Texte saisi « Paris » absent (visible, 4 cadres ; corrigé, à renvoyer)

**Cause** : la valeur de l'`<input>` est dans `n['text']`, sans run.

**Correctif, fait** : `field_runs()` est appelée dans `_convert`.

**Vérifié** : « Paris » en Jost 16/24, couleur « Rôles/logo » (#1B1B1B / #FFFFFF, comme le site) :
- en (64, 2 767) sur mobile ;
- en (434, 2 492) sur ordinateur.

## Écartés

Aucun.

Deux remarques du comparateur sont aujourd'hui dépassées : « `fixed_y` inchangé » et « `inflow_positions` jamais appelée ». Sa remarque sur « Après · Application », alors sans effet visible, devient la cause n° 1.

## Contrôle après renvoi

- **g-dock** : l'export fait 460 × 3 000 px pour 1 600 × 10 879, soit 0,27 px par px du site, ce qui rend les textes illisibles. Il faut exporter la section en deux moitiés ou cadre par cadre.
- **Passe suivante** : revoir les points 1 à 6, en clair et en sombre. Pour la teinte du fond, s'appuyer sur `meanRGB` et `channelOff12` en haut des cadres.

## Fichiers

Agrandissements de cette synthèse, dans `_synthese/` :
- `back-top_clair_haut.png` ;
- `back-top_clair_y1340.png` ;
- `back-top_sombre_y1340.png` ;
- `back-top_clair_bas.png` ;
- `back-top_clair_bas_site_vs_figma.png` ;
- `search_mobile_clair_bas.png` ;
- `search_mobile_sombre_bas.png` ;
- `search_mobile_{clair,sombre}_champ_site_vs_figma.png`.

Ceux du comparateur sont dans `_zoom/`.
