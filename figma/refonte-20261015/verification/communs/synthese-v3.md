# Vérification Figma des éléments communs : synthèse v3 (18 octobre 2026)

## Périmètre

Zone « communs » (page 08 · Éléments communs) : 3 sections et 10 cadres. Les exports `call-results/communs-*-v2.png` datent du 17 octobre, 19 h 07, après les appels 777 à 782.

Un comparateur a relevé 10 défauts « visible », aucun « bloquant ». Pour les recouper :
- **Planches** : les 8 planches ont été rouvertes, des plus différentes aux moins différentes, avec les agrandissements de `v3/_zoom/`. Les 2 cadres sombres du menu du bas n'ont pas de capture du site : ils sont jugés d'après le cadre clair, dont ils sont les clones (limite 6).
- **Code relu** :
  - `dom2fig.py` : `zsort`, `build`, `build_one`, `_convert`, `pseudo_frame`, puis `stacking_context` et `hoist_z`, apparus à 05 h 27 ;
  - `render.js` : l'ordre de la scène est l'ordre de peinture ;
  - `capture_lib.py` (`styleOf`) et `section_frames.py` ;
  - côté site : `sticky-header.css`, `welcome.css`, `content-preview.css`.
- **Contrôles à blanc, en mémoire** :
  - `dom2fig.py` actuel (empreinte `3faeee6a162c`, 05 h 31 UTC), avec et sans `hoist_z`, sur les 201 cadres des mises en page ;
  - lecture des scènes et des appels régénérés à 05 h 33 (799 à 888, pas encore envoyés).

Travail en lecture seule. Rien n'a été écrit hors de ce fichier et de `v3/`. Aucun outil Figma ni Chrome n'a été utilisé.

## Bilan

- **10 défauts confirmés**, aucun écarté. Ils ont **une seule cause** : la barre « Monde » est peinte sous le fondu de l'en-tête.
- Pendant la synthèse, de 05 h 27 à 05 h 33 UTC, la méthode a été corrigée en parallèle (`hoist_z`) et les appels ont été régénérés. Le correctif est **vérifié à blanc**. Il reste à l'envoyer, puis à cloner, capturer et revérifier.
- Sur les 6 points de la passe précédente, 5 sont corrigés dans Figma. Le point 3 ne l'est que partiellement, et ce qui en reste est la cause n° 1.
- Le contrôle de g-dock reste illisible, et la chaîne du 18 prévoit la même capture.

## Revérification de la passe précédente

Constats du comparateur, recoupés dans les scènes pour les points 1, 3, 4 et 6.

| Point du 17 octobre | Dans Figma (exports de 19 h 07) | Mesures |
|---|---|---|
| 1. Bandeau `#app::after` et fond « atmosphère » | Corrigé | 390 × 166, 1440 × 188 et 300 ou 320 × 159 en (0, 0) ; en haut des cadres, meanRGB ≤ 0,6 et channelOff12 = 0 % |
| 2. Résumés limités à 2 lignes | Corrigé | 32 textes bornés coupés comme dans Chrome |
| 3. Calques fixes du relevé défilé | Partiellement : la barre « Monde » est à y = 84 mais cachée | Voir la cause n° 1 |
| 4. Boutons du menu dans le champ ouvert | Corrigé | Le champ ne contient plus que la loupe, « Paris » et la croix |
| 5. Noms de campus coupés | Corrigé | Mêmes coupures que dans Chrome |
| 6. Texte saisi « Paris » | Corrigé | Jost 16, en #1B1B1B en clair et en blanc en sombre |
| Contrôle de g-dock après renvoi | Non corrigé | Export de 460 × 3 000 px, soit 0,27 px par px du site |

## Correctifs par priorité

### 1. Barre « Monde » peinte sous le fondu de l'en-tête (10 cadres ; corrigé dans la méthode, à envoyer)

**Défauts** : la pastille « Monde ˅ » et son médaillon manquent sous l'en-tête, en clair comme en sombre.
- Recherche ouverte :
  - sur ordinateur, en (648,44 ; 84), 143 × 48 ;
  - sur mobile, en (130,94 ; 84), 128 × 46.
- Menu du bas :
  - à 300 px, en (85,94 ; 78) ;
  - à 320 px, en (95,94 ; 78).
- Remonter en haut : en (130,94 ; 84), en haut du cadre. C'est la part restante du point 3.

Le calque existe et il est bien placé, mais « Après · Application » le recouvre : ce fondu est plein, en Rôles/bg, jusqu'à 130, 136 ou 124 px. Au premier passage, la barre était visible (`_zoom/ancienne_passe_search_mobile_clair_haut.png`).

**Sur le site** : ces calques sont tous peints dans le contexte d'empilement de `#app`, créé par `.app { isolation: isolate }` dans `welcome.css`. Leur ordre :
- contenu (5) ;
- fondu `#app::after` (6) ;
- globe (7) ;
- barre (8) ;
- en-tête (10) ;
- menu du bas (20).

Le commentaire de `sticky-header.css` le dit : « above content (5), below map/filter (7/8) and header (10) ». `main` est statique et sans z-index : il ne crée pas de contexte.

**Cause** : `dom2fig.py` garde `main` comme cadre « Principal », parce que c'est une balise de conteneur, et `zsort()` ne trie que des frères.
- La barre (`_z` 8) reste dans « Principal » (`_z` 0).
- « Principal » est peint avant son frère « Après · Application » (`_z` 6).
- Le défaut est apparu le 17 au soir : depuis le correctif du bandeau, `::after` est peint après les enfants et garde son z-index.

**Portée** : 131 des 201 cadres des mises en page, en comptant les cadres clairs et les cadres sombres construits depuis la capture sombre. Leurs clones sombres s'y ajoutent.
- Projets : 49.
- Profils : 33.
- Compte et Éléments communs : 31.
- Chroniques : 16.
- Fenêtre campus d'Explorer : 2.

**Correctif, fait dans `dom2fig.py` entre 05 h 27 et 05 h 31** :
- `stacking_context(n, par)` dit si l'élément crée un contexte d'empilement. C'est le cas d'un élément fixe ou collant, positionné avec un z-index, d'opacité inférieure à 1, avec transform, filter ou backdrop-filter, d'un élément flex ou grid avec un z-index, et d'un `dialog`.
- `build_one` marque `_nsc` les cadres qui n'en créent pas, puis appelle `hoist_z(ch)` avant `zsort(ch)`.
- `_convert` applique `zsort(hoist_z(nodes))` à la racine, et `strip_z` retire `_nsc`.
- `hoist_z` agit quand un descendant à z-index d'un tel cadre doit croiser un frère à z-index, c'est-à-dire quand son z dépasse celui d'un frère positif, ou passe sous celui d'un frère négatif.
  - Tous ses descendants à z-index remontent alors à côté de lui, convertis aux coordonnées de ce niveau, puis sont triés avec lui.
  - Un cadre qui rogne ne cède que ses descendants fixes.
  - Un cadre vidé et sans peinture est retiré.

**Vérifié à blanc** :
- **Les 5 états communs** : « Application » contient, dans cet ordre, « Fond », « Contenu », « Après · Application », « Barre de périmètre », « En-tête », « Remonter en haut » (seulement dans cet écran) et « Menu du bas ». La barre est en (130,94 ; 84), (648,44 ; 84), (85,94 ; 78) et (95,94 ; 78).
- **Les 201 cadres, avec et sans `hoist_z`** : 131 cadres changent, sans qu'aucune position ni taille ne bouge. Les seules inversions entre calques qui se chevauchent sont :
  - la barre, qui passe au-dessus du fondu dans les 131 cadres ;
  - le menu « Actions du commentaire » (z 6), qui passe au-dessus de la réponse suivante sur 1,4 px, dans l'état « menu d'un commentaire » sur ordinateur. C'est l'ordre du site.
- **Structure** : seul « Principal » disparaît, dans 131 cadres, vidé et sans peinture. « Contenu », la barre et « Menu du bas » deviennent des enfants d'« Application ».
- **Appels régénérés** (799 à 888, chaîne `courier-correctifs-18oct.json`) : les 82 appels qui contiennent le fondu et la barre placent la barre après le fondu, et aucun ne contient plus « Principal ». Pour les communs, ce sont les appels 881 à 885, et 886 pour les clones.

**Reste** : envoyer la chaîne du 18, cloner, capturer et revérifier les 10 cadres.

Pour un cadre déjà envoyé qu'on ne renverrait pas, un appel ciblé suffit :
- déplacer « Barre de périmètre » de « Principal » vers « Application », juste après « Après · Application » ;
- ajouter à son x et à son y la position de « Principal » ;
- faire de même dans les clones sombres, qui portent les mêmes noms.

### 2. Capture de contrôle de g-dock illisible (outil ; non corrigé)

**Défaut** : l'export de la section fait 460 × 3 000 px pour 1 600 × 10 879, soit 0,27 px par px du site, et ses textes sont illisibles. La chaîne du 18 demande la même capture après 886 (`161:10`, `max 3000`).

**Correctif** :
- Après `record_frames.py`, capturer séparément chacun des 4 cadres de g-dock avec `get_screenshot` et `maxDimension` 3 000. On obtient 0,58 px par px pour 5 138 px de haut, ou davantage si le serveur accepte une valeur plus grande. Les cadres sombres deviennent ainsi lisibles eux aussi.
- Ajouter à `section_frames.py` un mode `--frame "<nom du cadre>" <png>` pour la capture d'un seul cadre :
  - échelle = largeur du PNG / `f['w']` ;
  - origine en (0, 0), sans marge de section ;
  - planche et mesures inchangées.

### 3. `isolation` non relevée dans les contextes d'empilement (préventif)

**Constat** : sur le site, `isolation: isolate` crée un contexte pour `.app`, `.hg-integrated`, `.scope-path`, `.dock-shell`, `[data-brand-wordmark]`, `.city-map`, `.campus-map-viewport`, `.cp-cover` et `.cp-profile-portrait`.
- `capture_lib.styleOf` ne relève pas `isolation`.
- `stacking_context()` ignore aussi `mix-blend-mode` et `clip-path`, pourtant relevés (`blend`, `clip`).

**Sans effet aujourd'hui** : à la racine, les seuls frères de `#app` sont des `<dialog>` (rang 10⁶) et `#scope-popover` (z 40). Leur rang dépasse le plus grand z-index de `#app` (20). Le contrôle des 201 cadres ne montre aucune remontée hors de ces conteneurs.

**Risque** : un relevé futur avec un calque du `body` de z-index plus petit viderait « Application » de tous ses calques à z-index.

**Correctif** :
- `capture_lib.py`, `styleOf` : ajouter `iso: keep(s.isolation, 'auto')`.
- `dom2fig.stacking_context()` : renvoyer vrai aussi si `s.get('iso') == 'isolate'`, si `s.get('blend')` ou si `s.get('clip')`.
- D'ici une nouvelle capture : appliquer la même règle aux classes ci-dessus, relevées dans les feuilles du site, et au moins à `.app`.
- Garde-fou dans `hoist_z.pull()` : ne pas retirer un cadre vidé dont le parent est en auto-layout, car Figma redistribuerait ses voisins. Aucun cas aujourd'hui.

### 4. Masques du relevé défilé (outil, mineur)

**Défaut** : `section_frames.py` ne masque que les nœuds `fixed` ou `sticky`. La pastille « Chercher dans Horizon » et le dé sont des enfants absolus de `.dock-shell`, placés hors de sa boîte. Ils restent donc dans la bande comparée de « Remonter en haut » : de 2,6 à 3,3 % de pixels différents.

**Correctif** : masquer aussi les nœuds dont un ancêtre (`p`) est fixe ou collant, avec la même limite de 0,6 écran.

## À savoir pour la prochaine passe

- **Fond pleine hauteur** (05 h 27, cause K de Projets v4 et cause N de Chroniques v2).
  - Dans un cadre en pleine hauteur, le « Fond » fixe couvre maintenant tout le cadre, avec ses dégradés en % de sa boîte, comme sur les captures pleine page du site.
  - Les références des communs sont des captures d'écran. Il faut donc s'attendre à un écart de teinte de quelques niveaux en haut des cadres et dans la bande de « Remonter en haut ».
  - Le site lui-même s'écarte déjà de 1 à 6 niveaux dans les gouttières entre ses captures écran et pleine page de la liste des projets. Ce n'est pas un défaut.
- **Barre « Monde »** : elle doit apparaître dans les 10 cadres, au-dessus du fondu et sous l'en-tête. Son médaillon reste une limite connue.
- **Structure** : le calque « Principal » n'existe plus dans les écrans de contenu.

## Écartés

Aucun. Les 2 cadres sombres du menu du bas n'ont pas de capture du site. Jugés d'après le cadre clair, dont ils sont les clones, ils présentent la même absence de la barre.

## Fichiers

Dans `v3/_synthese/` :
- `hoistcheck.py` et `hoistcheck.json` : conversions à blanc des 201 cadres, avec et sans `hoist_z` (calques retirés ou déplacés, inversions d'ordre) ;
- `communs_scenes.py` : premiers niveaux des scènes des 5 états communs.

Les agrandissements du comparateur sont dans `v3/_zoom/`.
