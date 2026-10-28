# Le chemin en étapes (`chemin-en-etapes`)

Essai n° 3 de l’étude [Essais du filtre de la version B](../../NOTES.md) (26 octobre 2026).

**État : réalisé et vérifié le 26 octobre 2026 au soir, à montrer à l’utilisateur.** Il n’est ni choisi ni intégré : la version B (`site-b/`) ne change pas. Une première version a été interrompue par la pause demandée à 14 h 52. Elle centrait le texte dans la place qui suit le globe, soit 22 px à côté de l’axe. La reprise le centre sur le milieu de la pastille, comme le demande la règle commune.

Résumé de la carte : le filtre montre tout le chemin, les étapes encore à choisir en grisé (« Monde › Continent › Pays › Campus », puis « Europe › France › Campus »…). Il a une largeur fixe et il est centré sur l’axe. Sur téléphone, il montre l’étape actuelle et la suivante.

## L’idée

Le filtre ne reste plus vide : il montre tout le chemin géographique, du monde au campus. Les étapes déjà choisies sont écrites dans la couleur du texte. Les étapes qui restent à choisir apparaissent en grisé, comme des cases à remplir. Le chemin se remplit au fil de la sélection, et le filtre garde la même place et la même taille à chaque niveau.

| Niveau | Français | Anglais | Arabe (de droite à gauche) |
| --- | --- | --- | --- |
| Monde | Monde ⌄ › *Continent › Pays › Campus* | World ⌄ › *Continent › Country › Campus* | العالم ⌄ ‹ *القارة ‹ الدولة ‹ الفرع* |
| Continent | Europe ⌄ › *Pays › Campus* | Europe ⌄ › *Country › Campus* | أوروبا ⌄ ‹ *الدولة ‹ الفرع* |
| Pays | Europe › France ⌄ › *Campus* | Europe › France ⌄ › *Campus* | أوروبا ‹ فرنسا ⌄ ‹ *الفرع* |
| Campus | Europe › France › 42 Paris ⌄ | Europe › France › 42 Paris ⌄ | أوروبا ‹ فرنسا ‹ 42 Paris ⌄ |

En italique : les étapes à choisir, en grisé. Le chevron ⌄ marque l’étape actuelle, c’est-à-dire le sélecteur du filtre, inchangé.

## Ce qui change

1. **Les mots des étapes à choisir.** « Pays », « Campus », « Country », « الدولة » et « الفرع » sont les intitulés que la copie donne déjà aux deux listes de son sélecteur (`scope-selectors.mjs`). La copie n’a aucun mot pour un continent : « Continent » (français et anglais) et « القارة » (arabe) sont nouveaux.
2. **Le continent devant le pays.** Il s’affiche dès qu’un pays ou un campus est choisi. C’est un **texte simple, pas un bouton** : aucune commande de la copie ne mène d’un campus directement à son continent. On y remonte, comme avant, niveau par niveau, par le bouton ← ou la touche Échap. Le continent vient du catalogue des campus de la copie (`campuses.json`, le même fichier) et de `continents.mjs`.
3. **Le pays devant un campus** reste le bouton de la copie, au même comportement : il remonte au pays. Il passe du gris à la couleur du texte, puisqu’il s’agit d’une étape choisie.
4. **Les étapes à choisir** ne sont pas interactives : ce ne sont pas des commandes, elles ne reçoivent pas le focus et les lecteurs d’écran ne les lisent pas (`aria-hidden`). Elles prennent le gris propre au thème, plus clair que le gris renforcé du verre du filtre. Contrastes mesurés sur les captures : 6,7:1 en clair et 6,5:1 en sombre ; les étapes choisies font 17,2:1 et 14,9:1. En couleurs forcées, elles passent en `GrayText`.
5. **Une largeur fixe : le plus long chemin complet** parmi toutes les indications (« Monde », les 4 continents, les 30 pays et les 58 campus), dans la langue du moment. Il est mesuré sur des copies invisibles du filtre, comme le fait déjà la copie. À 1440 × 900, la pastille mesure 406 px en français, 418 px en anglais et 422 px en arabe, contre 345, 357 et 363 px dans la copie. Le plus long chemin est « Asie › Émirats arabes unis › 42 Abu Dhabi ». La hauteur est fixée elle aussi, sur le chemin le plus haut. En arabe, la pastille de la copie passait de 51 à 54 px de haut à un campus à 1440 × 900 (de 49 à 48 px à 390 × 844), et son ← descendait de 1,5 px ; l’essai garde 54 px (49 px sur téléphone).
6. **La forme courte**, quand le chemin complet ne tient pas dans la barre (téléphones) ou quand la copie passe dans sa forme compacte. Elle montre l’étape actuelle et la suivante : « Monde › Continent », « Europe › Pays », « France › Campus ». À un campus, il n’y a plus d’étape suivante : seul « 42 Paris » s’affiche, et le bouton du pays est masqué, comme dans la forme compacte de la copie. Sa largeur est celle de la plus longue forme courte. À 390 × 844, il faudrait 274 px en français et en anglais, et la barre n’en laisse que 272 (voir les limites) ; en arabe, 266 px suffisent.
7. **Le filtre sur l’axe de la page.** Après la pastille, une place vide de la largeur du ← ferme la barre (44 px, 38 px sur téléphone). La pastille se trouve ainsi au milieu de la barre, donc sur l’axe de la page, à chaque niveau, « Monde » compris. Quand le menu latéral s’affiche, c’est l’axe de la colonne à côté de lui. Le ← garde une place fixe, cachée à « Monde » comme dans la copie. En mode lecture, la copie retire le ←, et la place vide disparaît avec lui.
8. **Le texte centré dans le filtre**, sur le milieu de la pastille. Un chemin trop long pour être centré sans toucher le globe commence juste après le globe et occupe la place restante.
   - En français à 1440 × 900, c’est le cas de 11 états sur 94.
   - Le décalage va jusqu’à 21,9 px, pour « Asie › Émirats arabes unis › 42 Abu Dhabi ».
   - « Monde › Continent › Pays › Campus » est décalé de 11,6 px.
   - En anglais, 8 états sont décalés, dont « World › … » de 14,3 px. En arabe, seulement 2.
9. **La ligne sous le filtre** (« 58 campus · 30 pays »…) ne change pas : ses boîtes mesurées sont identiques à celles de la copie.
10. **Arabe** : tout est en miroir. Le ← et le globe sont à droite, les étapes se lisent de droite à gauche et les séparateurs pointent vers la gauche.
11. **Noms accessibles inchangés.** Le chemin (« Chemin géographique »), le sélecteur (« Monde · Choisir un pays ou un campus »…), le ←, le globe, le bouton du pays et le résumé du mode lecture gardent leur texte. Le chemin exposé aux lecteurs d’écran gagne seulement le continent : un élément de liste en texte (« Europe ») devant le pays. Les étapes à choisir n’y figurent pas.

**Rien d’autre ne change** : couleurs du filtre, polices et tailles (une étape à choisir prend la taille et la marge des boutons de la copie), globe et siège, comportement du filtre et du reste de la page. Le mode lecture montre lui aussi le chemin complet, inerte comme le reste du filtre.

## Fichiers

- [essai.js](essai.js) : la fiche. Elle déclare `styles.css` et le module remplacé `scope-pill.mjs`, sans `module.mjs`. Elle propose trois vues en tête de la liste « Page » de la galerie : « Explorer · Monde », « Explorer · 42 Paris » et « Explorer · France (téléphone, forme courte) ».
- [scope-pill.mjs](scope-pill.mjs) : remplace le `scope-pill.mjs` de la copie grâce à la carte d’import du chargeur, sur les deux pages. L’original reste intact dans `baseline/`. Même interface que l’original (`scopeIndications`, `mountScopePill`), appelée par la copie aux mêmes moments : chaque changement du filtre, la langue, la forme, le mode lecture, la taille et les polices.
  - Il ajoute au chemin le continent et les trois étapes à choisir.
  - Il mesure les chemins complets, puis les formes courtes si besoin, et fixe la largeur et la hauteur.
  - Il calcule la marge qui centre le texte (`--chemin-shift`) et la largeur du ← (`--chemin-back`).
- [styles.css](styles.css) : la place vide qui centre la barre, la marge du texte, l’aspect des étapes, leurs couleurs (clair, sombre, couleurs forcées) et la forme courte.

## Voir l’essai

- Galerie : [Comparer](../../index.html?essai=chemin-en-etapes). La copie figée est à gauche, l’essai à droite ; la page, le format, le thème et la langue se règlent au-dessus.
- Liens directs, depuis le dossier de l’étude :
  - `baseline/content-preview.html?essais=chemin-en-etapes&theme=light&lang=fr#explore` (ou `#explore?campus=paris`, `#explore?country=ARE`, `#projects`…) ;
  - `baseline/index.html?essais=chemin-en-etapes` pour l’arrivée.

## Vérifications (26 octobre 2026, soir)

Chrome sans interface (version 156), piloté par l’outil commun [`helper.py`](../../../design-review-studies/checks/helper.py), mouvements réduits émulés, une seule session à la fois, chaque session fermée. Mode rapide, choisi par l’utilisateur : quelques captures clés, toutes regardées, et les boîtes du filtre mesurées à chaque étape. Positions en px dans la fenêtre (x · y · largeur · hauteur). L’axe est le centre de la barre ; il est égal à la position `left` que la copie lui donne. Les scripts et les captures restent hors du dépôt.

### Explorer, 1440 × 900, français, clair

Le curseur est amené au bon endroit avec les flèches, puis le niveau est validé par le bouton fixe « Valider » ou par la touche Entrée.

| Étape | Action | Pastille | ← | Pastille − axe | Texte − pastille |
| --- | --- | --- | --- | --- | --- |
| Monde › Continent › Pays › Campus | ouverture | 517 · 84 · 406 · 48 | 465 · 86 · 44 · 44 (caché) | 0 | +11,6 |
| Europe › Pays › Campus | clic sur « Valider » | 517 · 84 · 406 · 48 | 465 · 86 · 44 · 44 | 0 | 0 |
| Europe › France › Campus | Entrée | 517 · 84 · 406 · 48 | 465 · 86 · 44 · 44 | 0 | 0 |
| Europe › France › 42 Paris | clic sur « Valider » | 517 · 84 · 406 · 48 | 465 · 86 · 44 · 44 | 0 | 0 |
| Europe › France › Campus | ← | 517 · 84 · 406 · 48 | 465 · 86 · 44 · 44 | 0 | 0 |
| Monde › … | globe « Revenir au monde » | 517 · 84 · 406 · 48 | 465 · 86 · 44 · 44 (caché) | 0 | +11,6 |
| Monde › … | recherche ouverte | 517 · 84 · 406 · 48 | 465 · 86 · 44 · 44 (caché) | 0 | +11,6 |
| Europe › France › 42 Lyon | recherche « Lyon », résultat 42 Lyon | 517 · 84 · 406 · 48 | 465 · 86 · 44 · 44 | 0 | 0 |
| Europe › France › Campus | bouton « France » du filtre | 517 · 84 · 406 · 48 | 465 · 86 · 44 · 44 | 0 | 0 |
| Europe › Pays › Campus | Échap dans le sélecteur | 517 · 84 · 406 · 48 | 465 · 86 · 44 · 44 | 0 | 0 |
| *Copie, à chaque niveau* | | *573,5 · 84 · 345 · 48* | *521,5 · 86 · 44 · 44* | *+26* | *—* |

La place vide de la pastille, hors globe et texte, tombe de 219 à 38 px à « Monde ». Aux autres niveaux, elle passe de 218 à 131 px à « Europe », de 221 à 117 px à « France » et de 135 à 116 px à « 42 Paris ».

### Autres pages et formats

- **390 × 844, arabe, sombre (téléphone émulé)** : forme courte, « العالم ‹ القارة », « أوروبا ‹ الدولة », « فرنسا ‹ الفرع », « 42 Paris », puis ← et globe.
  - La pastille est à 62 · 84 · 266 · 49 et le ← à 333 · 86,5 · 38 · 44 aux 6 étapes.
  - La pastille est centrée sur l’axe (195), et le texte centré dans la pastille.
  - Dans la copie, la pastille mesurait 293 px, était décalée de −21,5 px et passait de 49 à 48 px de haut au campus.
- **1280 × 720, français, clair (menu latéral)**, mêmes 10 étapes qu’à 1440 × 900 : la pastille est à 537 · 84 · 406 · 48 et le ← à 485 · 86 · 44 · 44 partout. Elle est centrée sur l’axe de la colonne (740 ; le milieu de la fenêtre est à 640).
- **Projets, 1440 × 900, français, clair** : « Monde », puis le sélecteur du filtre (pays France, puis campus 42 Paris), ←, globe. La pastille reste à 517 · 84 · 406 · 48 et le ← à 465 · 86 · 44 · 44 aux 5 étapes, centrée.
- **Mesures sans capture**, par l’adresse, avec rechargement ou changement d’ancre :
  - anglais sombre à 1440 × 900 : 511 · 84 · 418 · 48 ;
  - arabe clair à 1440 × 900 : 509 · 84 · 422 · 54, avec le ← à droite (939) ;
  - mode lecture (fiche projet) : 529 · 40 · 382 · 48, sans ← ni place vide, centrée ;
  - 667 × 375 (menu latéral) : forme complète, 203,5 · 70 · 350 · 46, sur l’axe de la colonne (378,5) ;
  - arrivée `index.html` puis « Visiter » : 517 · 84 · 406 · 48 ;
  - à 390 × 844 en français : 59 · 84 · 272 · 46.
- **Toutes les indications**, chacune atteinte par l’adresse de la copie (ses 93 états et un retour à « Monde ») : 1440 × 900 en français clair, anglais sombre et arabe clair ; 1280 × 720 en français ; 390 × 844 en français, arabe sombre et anglais.
  - Pour chaque format et chaque langue : une seule boîte de pastille et une seule boîte de ←, aucun écart à l’axe et toujours le bon niveau.
  - Texte centré dans 83 états sur 94 en français à 1440 × 900, 86 en anglais et 92 en arabe.
  - Seul nom coupé : « Émirats arabes unis › Campus » à 390 px, en français et en anglais (voir les limites).
- **La ligne sous le filtre** à 1440 × 900 (français) et à 390 × 844 (arabe), à « Monde », « Europe » et « France » : mêmes boîtes que dans la copie, par exemple 657,82 · 142 · 124,36 · 20,3 pour « 58 campus · 30 pays ».
- **Noms accessibles et arbre d’accessibilité**, copie contre essai, aux quatre niveaux, en français à 1440 × 900 et en arabe à 390 × 844 :
  - les noms et les intitulés sont identiques ;
  - l’arbre lu par Chrome, comparé en français, gagne seulement le texte du continent (« Europe ») devant le pays ; lu pour l’essai en arabe à 1440 × 900, à « France » et à « 42 Paris », il montre de même « أوروبا » ;
  - les étapes à choisir n’y figurent pas ;
  - au clavier, les arrêts sont les mêmes à 1440 px. À 390 px, à un campus, le bouton du pays n’est plus un arrêt, car la forme courte le masque.
- **Galerie** : la carte (titre, résumé, sans badge « Vide ») et les trois vues proposées en tête. Dans la vue « Comparer », la copie seule est à gauche et l’essai actif à droite, sans erreur dans les deux vues.
- **Console** : 0 erreur JavaScript dans tous les parcours ; aucune requête hors de l’étude et de `shared/` (hors `favicon.ico`). L’essai demande sa fiche, sa feuille, son `scope-pill.mjs` et `campuses.json`.

Captures regardées :

- l’Explorer à « Monde », « Europe », « France » et « 42 Paris » (1440 × 900, français, clair), pages entières et pastille agrandie ;
- « العالم » et « 42 Paris » (390 × 844, arabe, sombre) ;
- « Monde » à 1280 × 720 ;
- Projets à 1440 × 900 ;
- « Émirats arabes u… › Campus » à 390 px ;
- la vue « Comparer » de la galerie.

Aucun téléphone réel, lecteur d’écran réel, Firefox ni Safari n’a été essayé ; aucun audit complet d’accessibilité n’est revendiqué.

## Limites

- **Un nom coupé sur téléphone** : à 390 px, la pastille a 2 px de moins que la plus longue forme courte. « Émirats arabes unis › Campus » s’affiche donc « Émirats arabes u… › Campus », en français comme en anglais (« United Arab Emirates »). Le nom complet reste dans le nom accessible et l’infobulle du sélecteur, comme dans la copie. Les autres indications tiennent ; l’arabe tient entièrement.
- **À un campus sur téléphone**, la forme courte n’affiche que « 42 Paris ». Il n’y a pas d’étape suivante, et le bouton du pays est masqué alors que la copie, à 390 px, montre « France › 42 Paris ». La pastille y est donc plus vide que dans la copie : 143 px vides contre 117 en arabe. Le ← remonte toujours au pays. Une variante, non réalisée et à décider, montrerait « France › 42 Paris » à ce niveau.
- **Le continent n’est pas cliquable** : aucune commande n’existe pour lui aujourd’hui. Depuis un campus, il faut remonter deux fois, comme dans la copie.
- **Le texte n’est pas toujours exactement au milieu** : les chemins les plus longs commencent après le globe, avec un décalage de 11,6 px à « Monde » en français et jusqu’à 21,9 px.
- **La pastille est plus large que dans la copie** (+61 px en français) : c’est le prix du chemin complet.
- **Une requête de plus** : `campuses.json`, le même fichier que la copie, pour retrouver le continent de chaque pays.
- **Le mode lecture** montre aussi les étapes à choisir, inertes, dans son badge.
- **Non vérifié** : la forme compacte de la copie (dock de 340 px ou moins), qu’aucun format essayé n’atteint ; 320 px de large ; le rendu en couleurs forcées (la règle existe mais n’a pas été affichée).
- **Copie figée** : elle date d’avant la reprise du menu latéral (§X). Un essai retenu serait à reporter sur la version B en cours.
