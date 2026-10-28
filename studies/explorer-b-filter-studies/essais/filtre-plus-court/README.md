# Un filtre plus court (`filtre-plus-court`)

Essai n° 2 de l’étude [Essais du filtre de la version B](../../NOTES.md) (26 octobre 2026).

**État : réalisé et vérifié techniquement le 26 octobre 2026 au soir, en mode rapide (captures clés), à montrer à l’utilisateur.** C’est une proposition de l’assistant : elle n’est ni choisie ni intégrée, et la version B (`site-b/`) ne change pas.

Résumé de la carte : Le filtre ne montre que le lieu choisi, centré, à la largeur du plus long nom ; au niveau campus, le pays passe sur la ligne sous le filtre, d’où il ramène toujours au pays.

## L’idée

- Le filtre ne montre plus que le nom du lieu choisi, centré : « Monde », un continent, un pays ou, au niveau campus, le campus seul (« 42 Paris »).
- Au niveau campus, le pays quitte le filtre (l’ancêtre « France › ») et descend sur la ligne sous le filtre, qui affiche alors « France ». Un clic sur ce pays ramène au pays, comme l’ancêtre aujourd’hui.
- Aux autres niveaux, la ligne reste celle d’aujourd’hui : « 58 campus · 30 pays » à « Monde », « 32 campus · 14 pays » pour l’Europe, « 8 campus » pour la France (chiffres des données de la copie).
- Le filtre garde une largeur fixe : celle du plus long nom seul de la langue, parmi le monde, les continents, les pays et les campus, sans le pays devant un campus. C’est « Émirats arabes unis » en français, « United Arab Emirates » en anglais et « الإمارات العربية المتحدة » en arabe.
- Le filtre est donc plus court qu’aujourd’hui : à 1440 × 900 en français, il passe de 345 à 264 px.
- Il est centré sur l’axe de la page à chaque niveau, « Monde » compris. Il ne bouge pas et ne change pas de taille quand le filtre change.

## Ce qui change

1. **La largeur.** Le `scope-pill.mjs` de l’essai remplace celui de la copie, par la carte d’import du chargeur. Il mesure chaque nom une fois, comme la copie, sur une copie invisible du filtre dans sa langue, sa forme et ses polices, mais sans le pays devant un campus. Il garde le plus large.
   - À « Monde », 1440 × 900, français, le filtre passe de 345 à 264 px ; le vide n’est plus tout entier à droite du nom, il se répartit des deux côtés.
   - En anglais, la largeur passe de 357 à 276 px ; en arabe à 390 × 844, de 293 à 261 px.
2. **La hauteur, fixée elle aussi.** Le module donne au filtre la hauteur du nom le plus haut.
   - En arabe, les noms arabes se composent plus haut que les noms latins des campus : 49 px contre 46 px sur téléphone.
   - Sans cela, le filtre perdait 3 px au niveau campus et le ← remontait de 1,5 px.
3. **Le filtre sur l’axe.** Après le filtre, une place vide de la largeur du ← ferme la barre : 44 px, ou 38 px sur téléphone, plus l’écart de la barre.
   - Le filtre devient ainsi le milieu de la barre, que la copie centre déjà sur l’axe de la page. Quand le menu latéral s’affiche, c’est l’axe de la colonne à côté de lui.
   - Le ← garde sa place à tous les niveaux. À « Monde », il est caché mais garde sa place, comme dans la copie.
   - En mode lecture, la copie retire le ← : la place vide disparaît avec lui.
4. **Le texte au milieu.** Au bout du filtre opposé au globe, une marge égale au siège du globe (6 + 32 + 6 = 44 px) l’équilibre.
   - Le nom et son chevron sont centrés ensemble entre ces deux places. Le nom seul se trouve donc à 12 px du centre, la moitié du chevron et de son écart (9,5 px sur téléphone).
   - Le bouton du nom (le sélecteur) occupe tout le milieu du filtre, et toute sa hauteur. Son survol, son anneau de focus et l’ancrage de la fenêtre « Choisir un pays ou un campus » ne bougent donc plus avec le nom.
5. **Le pays sous le filtre (Explorer, niveau campus).**
   - C’est le même bouton que l’ancêtre « France › » de la copie, avec la même action ; il est seulement placé ailleurs par la feuille de style. Le séparateur › est masqué.
   - Il est centré sous le filtre, à la place des chiffres des autres niveaux, dans leur taille (14 px, 13 px sur téléphone) et leur couleur. Son texte est à la hauteur des chiffres. Sur les écrans bas (520 px de haut ou moins), où la copie décale les chiffres de 2 px, le pays suit le même décalage.
   - Après le clic, la copie met le focus sur le sélecteur, comme quand l’ancêtre disparaît.
   - Il reste hors du flux : la bande de l’Explorer et la fiche du campus sont placées exactement comme dans la copie.
6. **Pages de contenu et mode lecture.** Ces pages n’ont pas de ligne sous le filtre : le filtre y montre le campus seul, comme la forme compacte de la copie sur téléphone. Le pays reste à un geste, car le ← y ramène au pays, et la fenêtre de choix le propose.

**Rien d’autre ne change** : couleurs, polices, globe et son siège, comportement du filtre et du reste de la page.

## Noms accessibles et ordre de lecture

- **Noms inchangés.** Le sélecteur s’appelle toujours « Monde · Choisir un pays ou un campus », le pays « France », la barre « Chemin géographique », le ← « Revenir au niveau précédent » et le globe « Revenir au monde ».
- **Ordre inchangé.** Le pays garde sa place dans la liste du chemin, avant le campus. Au clavier, l’ordre est donc : ←, globe, « France » (sous le filtre), puis « 42 Paris » (dans le filtre).
- **Mode lecture.** Le résumé pour les lecteurs d’écran dit toujours « France › 42 Paris ».

## Fichiers

- [`essai.js`](essai.js) : la fiche, qui déclare la feuille de style et le module remplacé. Elle propose aussi deux vues à la galerie : Explorer à « Monde », et 42 Paris avec le pays sous le filtre.
- [`scope-pill.mjs`](scope-pill.mjs) : la copie modifiée de `baseline/scope-pill.mjs`, qui fixe la largeur et la hauteur. `welcome.mjs` l’appelle comme avant.
- [`styles.css`](styles.css) : la place vide de la barre, la disposition symétrique du filtre, l’ancêtre masqué dans le filtre et le pays sous le filtre.

## Vérifications (26 octobre 2026, soir)

Chrome sans interface piloté par l’outil commun [`helper.py`](../../../design-review-studies/checks/helper.py), mouvements réduits, sur la copie de l’étude servie par le serveur local. Chaque page est chargée à neuf. Le dernier passage a été fait après les dernières retouches de l’essai. Toutes les captures ont été regardées.

Boîtes mesurées en px CSS (x, y, largeur × hauteur). Le centre du filtre est comparé à l’axe, c’est-à-dire au centre de la barre.

| Format | Parcours | Filtre | ← | Centre / axe |
| --- | --- | --- | --- | --- |
| 1440 × 900, français, clair | Monde, Europe, France, 42 Paris (clic sur « Valider »), puis le pays sous le filtre, ←, globe, recherche « Lyon » | 588, 84, 264 × 48 | 536, 86, 44 × 44 | 720 / 720 |
| 1440 × 900, Projets | Monde, puis 42 Paris par le filtre de la page | 588, 84, 264 × 48 | 536, 86, 44 × 44 | 720 / 720 |
| 1280 × 720, français, clair (menu sur le côté) | Monde, 42 Paris | 608, 84, 264 × 48 | 556, 86, 44 × 44 | 740 / 740 |
| 667 × 375, français, clair (menu sur le côté) | Monde, 42 Paris, 42 Abu Dhabi | 254, 70, 249 × 46 | 211, 71, 38 × 44 | 378,5 / 378,5 |
| 390 × 844, arabe, sombre | Monde, Europe, France, 42 Paris (touche Entrée) | 64,5, 84, 261 × 49 | 330,5, 86,5, 38 × 44 | 195 / 195 |
| 1440 × 900, anglais, clair | World, 42 Abu Dhabi | 582, 84, 276 × 48 | 530, 86, 44 × 44 | 720 / 720 |
| Fiche projet en mode lecture, 1440 × 900 | Monde | 600, 40, 240 × 48 | retiré, comme dans la copie | 720 / 720 |

**Le filtre et le ←.** Leurs boîtes sont identiques à chaque étape d’un même format. Le centre du nom et de son chevron tombe sur l’axe, à 0,01 px près.

**Le sélecteur.** Sa boîte ne change pas non plus d’un niveau à l’autre :

- 638, 87, 164 × 42 à 1440 × 900 ;
- 112,5, 86, 165 × 45 en arabe à 390 × 844. Avant d’être étiré sur la hauteur du filtre, il perdait 3 px de haut au niveau campus.

**La copie, pour comparer.**

- À 1440 × 900 en français : filtre 573,5, 84, 345 × 48, centre 746, soit 26 px à droite de l’axe ; ← en 521,5.
- À 1280 × 720 : centre 766 pour un axe à 740.
- À 390 × 844 en arabe : filtre 27, 84, 293 × 49, centre 173,5 pour un axe à 195, soit −21,5 px.

**La ligne sous le filtre.**

- Les chiffres puis le pays : à 1440 × 900, leur texte commence à y = 142 à chaque niveau, en 14 px et dans la même couleur, centré sur l’axe.
- À 390 × 844 en arabe : y = 142, en 13 px.
- À 667 × 375 : y = 127 à « Monde » comme au campus, une fois le décalage de 2 px corrigé.
- Au niveau campus, la boîte du pays ne croise aucun élément de la fiche du campus, sauf à 667 × 375 avec un pays long (voir les limites).
- À 1440 × 900, la capture de 42 Paris ne diffère de celle de la copie que dans le rectangle du ←, du filtre, de leurs ombres et de la ligne (x 507 à 932, y 76 à 157) : sous y = 160, la fiche du campus est identique au pixel près.

**Navigation.**

- « Valider » mène à chaque niveau.
- Le clic sur « France » sous le filtre ramène au niveau pays, focus sur le sélecteur.
- Le ← remonte à l’Europe, le globe ramène à « Monde ».
- La recherche « Lyon » ouvre 42 Lyon, avec « France » sous le filtre.

**Console.** Aucune erreur JavaScript ni requête en échec, et aucune requête hors de l’étude et de `shared/`. La seule ligne est le `favicon.ico` absent (404), que le navigateur journalise au premier chargement de la session, quelle que soit la page.

**Dernières retouches.** Les captures du dernier passage sont identiques au pixel près à celles du passage précédent, sauf deux :

- Projets à « Monde » : 120 pixels du filtre, avec un écart d’au plus 3 sur 765 (lissage) ;
- 42 Paris à 667 × 375, où le pays descend de 2 px pour rejoindre la ligne des chiffres.

**Captures**, conservées hors du dépôt, dans le bloc-notes de la session (`filter-trials/filtre-plus-court/final2/` pour le dernier passage, `long/` pour les pays longs) :

- 1440 × 900 : « Monde », Europe, France, 42 Paris ;
- Projets à « Monde » et à 42 Paris ;
- 1280 × 720 : « Monde » et 42 Paris ;
- 390 × 844 en arabe sombre : « Monde » et 42 Paris ;
- 667 × 375 : 42 Paris, puis 42 Abu Dhabi en français et en anglais ;
- 390 × 844 en français : 42 Abu Dhabi.

## Limites

- **Téléphone en paysage (667 × 375), au niveau campus.** La bande de l’Explorer reste celle de la copie : la ligne du pays se loge entre le filtre et le haut de la fiche du campus.
  - Avec un pays long (42 Abu Dhabi : « Émirats arabes unis », « United Arab Emirates »), il ne reste qu’environ 6 px entre le pays et les lettres du titre « 42 Abu Dhabi ».
  - La zone cliquable du pays, haute de 31 px, mord sur la boîte du titre, qui n’est pas cliquable. Les lettres ne se chevauchent pas, mais c’est serré.
  - Si l’essai est retenu, il faudra réserver la place de cette ligne dans la bande de l’Explorer au niveau campus, comme pour les chiffres. La fiche du campus descendrait alors d’environ 30 px ; ce n’est pas fait ici.
- **Pages de contenu.** Le pays d’un campus n’y est plus affiché dans le filtre ; il reste accessible par le ← et par la fenêtre de choix.
- **Lisibilité du lien.** Le pays sous le filtre ne ressemble pas à un lien (texte gris, comme les chiffres). Seul le survol le signale : d’après les feuilles de style, le texte fonce et prend le fond de survol des commandes du filtre. Ce survol n’a pas été capturé.
- **Ordre visuel et ordre clavier.** Le pays, sous le filtre, est atteint au clavier avant le campus, au-dessus. C’est l’ordre du chemin, mais pas celui de la lecture à l’écran.
- **Le nom légèrement décalé.** Le nom et son chevron sont centrés ensemble : le nom seul est à 12 px du centre, ou 9,5 px sur téléphone.
- **Téléphones de moins de 390 px de large.** La barre compte, en plus du filtre, le ← et la place vide qui l’équilibre : 2 × 38 px, plus 2 × 5 px d’écart.
  - Quand la barre dépasse sa largeur maximale (la largeur de l’écran moins 32 px), le filtre rétrécit. Il reste fixe et centré, mais le nom le plus long finit alors par « … », comme dans la copie quand elle manque de place.
  - Par calcul, cela arrive dès 375 px de large en arabe et en anglais (filtre de 4 px plus étroit), et dès 360 px en français (7 px). En arabe, la barre de l’essai (347 px) est même un peu plus large que celle de la copie (336 px).
  - Ces largeurs n’ont pas été vérifiées à l’écran.
- **Non vérifié.** L’entrée `index.html`, Firefox et Safari, un vrai téléphone, un lecteur d’écran et les couleurs forcées.
