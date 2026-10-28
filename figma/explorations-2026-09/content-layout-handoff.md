# Agencement des rubriques et recherche du dock — 4 octobre 2026

Report réalisé dans la [piste active](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=115-2). Il suit la décision explicite de reprendre **l’agencement de la première étude** pour les trois rubriques, avec Grille/Liste et recherche globale. La précision finale place la loupe **à côté du menu, à la même hauteur**. Palette, typographie des contenus et visuels existants conservés. Les trois études restent des archives intactes.

Les propositions intermédiaires de rangées distinctes pour Parcours et Journal ont été remplacées avant écriture. Le texte des cartes et leurs illustrations ne sont pas réinventés. Les composants historiques sont conservés ; les nouveaux composants dérivés portent l’agencement actif.

## Réalisation

Six listes ordinateur/mobile partagent désormais un index centré de 1 100 px sur ordinateur, une grille de trois colonnes de 348 px et un espacement de 28 px. Les couvertures suivent le ratio 1,5. Sur mobile, l’index conserve 342 px à x=24, une colonne et des couvertures au ratio 1,65. Titres, descriptions et métadonnées gardent leurs corps existants ; les cartes grandissent avec le texte.

Le compteur se place à gauche de la barre de contrôle et Grille/Liste à droite, au-dessous du séparateur. Les anciennes recherches locales sont masquées. Tous les contenus restent présents : quatre Projets, deux Parcours, deux articles Journal.

| Vue | Ordinateur | Mobile |
| --- | --- | --- |
| Projets, grille | `328:4892` | `328:5253` |
| Parcours, grille | `347:4492` | `347:4696` |
| Journal, grille | `347:4904` | `347:5112` |
| Projets, démonstration Liste | `411:7100` | `411:7627` |
| Recherche Paris, overlay FR | `418:7375` | `418:7476` |

Les deux nouveaux exemples Liste sont reliés au choix Liste de Projets ; leur choix Grille retourne au cadre original. Images de 280 px et intervalle de 32 px sur ordinateur ; proportion 30/70 et intervalle de 18 px sur mobile. Le texte reste entier, sans diminution du corps. Les contrôles Liste de Parcours et Journal demeurent illustratifs dans ce report.

Le dock est reporté dans les 16 cadres actifs, les huit copies du raccord d’entrée et les deux nouveaux exemples Liste. Il comprend un menu de **510 × 76** et une loupe circulaire de **60 px**, séparés de 12 px : groupe de 582 px centré, x=429/y=852 dans un cadre 1440 × 960. En mobile 390 × 844 : menu **298 × 73**, loupe **50 px**, intervalle de 10 px ; groupe de 358 px à x=16/y=754. Le cercle passe à gauche en RTL. Les huit pistes d’opacité du raccord sont conservées.

## Recherche illustrée

Quatorze loupes des cadres LTR ouvrent une superposition FR : champ Paris et panneau de trois résultats — 42 Paris, « Derrière une ligne de commande », « Apprendre à poser la bonne question ». Ce relevé suit la dernière précision utilisateur : **Paris correspond au campus et aux contenus rattachés**, pas aux adresses qui contiennent ce mot. Lyon n’apparaît donc pas.

Le menu ouvert mesure 680 × 76 sur ordinateur et 358 × 73 sur mobile. Le panneau arrive 14 px au-dessus. Des clés natives reproduisent l’expansion de la barre sur ordinateur, le fondu des commandes et l’arrivée du panneau, jusqu’à 0,48 s. La croix et le fond ferment chaque overlay et conservent le cadre appelant. Le lecteur n’a pas été rejoué : il s’agit d’un raccord configuré et audité, pas d’une interaction validée en navigateur.

Ces états n’offrent ni saisie réelle, ni moteur, ni IA, ni pagination. Les quatre accueils RTL conservent leur navigation historique par sélection ; leur loupe est illustrative pour éviter une ouverture arbitraire de la démonstration française. La nouvelle matrice complète de contenus arabes reste hors du report.

## Vérifications et preuves

- 75 cadres de parcours sur la page, soit les 71 précédents et quatre démonstrations ; aucune suppression d’ancienne exploration.
- Audit de 84 destinations : aucune manquante.
- Six grilles et deux listes à hauteur automatique, aucun texte configuré pour tronquer, aucun champ local visible ; défilement vertical et dock fixe.
- Captures examinées des trois grilles dans les deux formats, des deux Listes, des deux recherches et de l’accueil arabe mobile clair/sombre.
- Correction ciblée des contours des nouveaux contrôles et de leurs icônes à 17 px après examen des captures. Le contour réutilise la variable de bordure existante ; aucun token de couleur historique changé.
- Les composants historiques de cartes, les articles, les fenêtres campus et les IDs actifs sont conservés. Les animations d’entrée restent présentes.
- Aucun nouveau rejeu du lecteur ni export vidéo : l’animation est contrôlée par ses valeurs d’images clés, les captures montrent son état final.

Preuves conservées : [Projets ordinateur](content-layout-proof/projects-fr-desktop.png), [accueil arabe sombre mobile](content-layout-proof/home-ar-dark-mobile.png). Les autres captures ont été examinées dans l’outil sans export local supplémentaire.

Les IDs des composants, géométries, loupes ouvrantes et limites sont dans [content-layout-state.json](content-layout-state.json). Les relevés précédents restent historiques : [dock commun](dock-navigation-handoff.md), [pages et fenêtres campus](content-preview-handoff.md).

Accès directs : [Projets ordinateur](https://www.figma.com/proto/yFrdllVm6nrKZJ2c99MMjT?node-id=328-4892&starting-point-node-id=328%3A4892), [Projets mobile](https://www.figma.com/proto/yFrdllVm6nrKZJ2c99MMjT?node-id=328-5253&starting-point-node-id=328%3A5253), [premier accueil](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=115-4).

Réalisation de maquette, sans publication ni acceptation esthétique générale déduite. Les fonctions complètes restent dans le prototype web.

## Suite du 4 octobre — capsules, verre et globe dans toute la page

L’utilisateur demande ensuite un menu sombre plus distinct du fond, puis des capsules moins épaisses, une transparence cohérente entre thèmes/menu/loupe, la suppression de « Voir la carte », un filtre ancré et un globe occupant la page. Le réglage **de repos retenu pour le report** est un fond blanc en clair ou graphite `#29292E` en sombre, à **95 %**, avec un flou d’arrière-plan commun de **22 px**. Les essais intermédiaires 32/56 px et 70 % ne décrivent pas l’état final de cette maquette.

Le menu mesure désormais **510 × 60**, accompagné d’une loupe de **52 px** à 12 px : groupe de 574 px à x=433/y=868. Sur mobile : menu **302 × 64**, loupe de **46 px**, intervalle de 10 px ; groupe de 358 px à x=16/y=763. Sélections de 48/50 px et rayons de capsule. Les 26 instances actives/raccords/exemples utilisent ces dimensions. Les accents, textes et icônes restent conservés.

Douze variables dédiées définissent ce traitement, sans réécrire les anciennes surfaces partagées. Le contour sombre reprend le mélange blanc 14 %/graphite 86 %, soit environ `#47474B` ; les ombres noires sont 0/14/36 à 1/3 et0/3/10 à 0,2. Menu et loupe partagent strictement le même fond et le même flou. Les deux états de recherche suivent la hauteur de capsule et le contraste sombre. Le panneau conserve ses trois résultats Paris.

Le globe vectoriel est centré dans le viewport : **816 px** sur 1440 × 960, **358,8 px** sur 390 × 844. Les repères sont repositionnés sans agrandir leurs libellés. Huit accueils et huit copies d’entrée sont adaptés ; le diamètre initial du cercle est conservé dans les valeurs des images clés. **Le flou radial progressif du site n’est pas reproduit dans Figma**, afin de conserver une seule géographie vectorielle. Les commandes restent nettes.

« Voir la carte » et son espace sont masqués dans les huit contenus et les deux exemples Liste. Les documents ordinateur remontent de 24 px ; les mobiles commencent directement au contenu. Le filtre Explorer remonte à y124/y99. Une nouvelle famille dédiée `435:1899` conserve les anciens composants : 320 px de large, padding 16, rayon 18, contrôles 48 px, textes et traductions conservés. La hauteur Figma est 258 px pour conserver sa typographie, contre environ 249 px dans le site. Les quatre overlays actifs sont ancrés à 8 px sous le filtre **de référence Explorer**, sans voile sombre. Ils restent partagés : Figma ne recalcule pas leur position pour chaque cadre appelant comme le site.

La piste conserve 75 cadres. Audit API : 88 destinations présentes ; les 12 destinations de la nouvelle famille sont également valides. Les traductions et les réactions originales des 48 champs sont conservées après adaptation. Les captures sont examinées ; les modes temporaires d’export sombre sont rétablis. Aucun nouveau rejeu du lecteur ni export vidéo.

L’utilisateur demande de **tester les deux effets de transparence au défilement** : fond seul ou ensemble du menu. Ces comparaisons restent dans deux essais web séparés ; **aucun choix final n’est déduit** et aucun cadre Figma supplémentaire n’est ajouté. Les maquettes montrent le repos.

Preuves finales : [accueil arabe sombre mobile, capsules](content-layout-proof/home-ar-dark-mobile-capsule.png), [recherche française sombre mobile, capsules](content-layout-proof/search-fr-dark-mobile-capsule.png). Les captures antérieures restent conservées comme étapes historiques. Les nouvelles valeurs et IDs figurent dans `capsuleUpdate20261004` du [relevé](content-layout-state.json).


## 5 octobre — deuxième essai choisi et filtre aligné

L’utilisateur choisit l’effacement complet du menu et de la loupe, avec un retour plus rapide. Le site applique désormais ce choix sans paramètre : maintien 400 ms après le dernier mouvement, retour 350 ms, effacement 220 ms. Les retours hauts et restaurations de position liés à la navigation ne déclenchent plus le fondu. Ces interactions restent web ; Figma conserve le rendu de repos déjà reporté.

À sa demande, les 26 filtres/contextes des accueils, contenus et raccords sont maintenant à la même hauteur : **y118 sur ordinateur, y95 sur mobile**, centrés dans leur cadre. Les quatre fenêtres partagées passent à y173,333 / y148,333, soit 8 px sous la référence. Dimensions, couleurs, textes, réactions et archives conservés. Les 30 IDs modifiés et leurs rectangles sont consignés dans `scrollAndFilter20261005`. Une capture de Projets mobile est examinée après l’écriture ; aucun nouveau rejeu du lecteur.
