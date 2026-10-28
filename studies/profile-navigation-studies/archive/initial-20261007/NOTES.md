# Trois navigations de profil — 7 octobre 2026

## Origine et statut

Après la [recherche UX](../../../../site/notes/PROFILE_NAVIGATION_RESEARCH.md), l’utilisateur demande explicitement de tester plusieurs options et de les répertorier dans les archives. Cette galerie est une étude séparée : aucun choix final n’est déduit et le menu du site principal n’est pas remplacé.

- [Galerie](index.html)
- [Registre des explorations](../../../research-archive/index.html)
- [01 — Repères permanents](demo.html?variant=1#profiles) : dock global conservé, rubriques locales sous l’identité du profil.
- [02 — Dock contextuel](demo.html?variant=2#profiles) : le bouton Profils rejoint la gauche et devient un retour ; les rubriques de la personne remplacent les autres destinations. Un accès Menu Horizon distinct permet de retrouver les rubriques globales.
- [03 — Double niveau](demo.html?variant=3#profiles) : dock global conservé et surface locale séparée au-dessus, avec contexte du profil.

La deuxième variante reprend l’intention précise de l’utilisateur. Les première et troisième sont des propositions de comparaison de l’assistant. Aucune préférence esthétique ou validation d’utilisabilité n’est attribuée à l’utilisateur à ce stade.

## Périmètre des essais

Les variantes partagent le même corpus fictif, la même identité visuelle et les mêmes destinations. Elles permettent d’ouvrir un profil, de choisir Présentation/Projets/Parcours/Journal, de revenir à l’annuaire et de rejoindre les rubriques globales. Les liens directs et le retour navigateur permettent de comparer aussi les situations où la transition n’a pas été vue. Explorer est un aperçu léger pour tester la navigation, pas une copie du globe MapLibre.

La barre de laboratoire est distincte de l’interface testée : sélection des variantes, retour à la galerie et thème. Les préférences du site principal ne sont pas modifiées. Les variantes sont prévues pour ordinateur et petit écran, avec prise en compte des mouvements réduits. Cette étude est en français ; elle ne constitue pas une intégration FR/EN/AR, une authentification ou un moteur de recherche.

La palette, Jost, les portraits et les données sont repris de l’état local du 7 octobre. Les dépendances utiles sont copiées dans ce dossier pour éviter qu’une modification ultérieure du site transforme silencieusement les essais archivés. Le manifeste liste les sources et leurs empreintes. Les études de navigation, de menus, de recherche, de verre et de déchiffrement précédentes restent accessibles et ne sont pas réécrites.

## Petit parcours comparatif

Dans chaque variante, partir de l’annuaire : ouvrir Leïla, puis ses projets ; rejoindre ensuite tous les projets du site ; retrouver son parcours ; revenir à Explorer. Refaire l’essai depuis un lien direct vers ses projets. Tester aussi le retour navigateur et le clavier.

Observer les erreurs de destination, hésitations et retours inutiles, et vérifier si la personne distingue toujours le contenu de Leïla de celui de tout Horizon. La préférence visuelle se recueille séparément. Les contrôles techniques de l’assistant ne sont pas des tests utilisateurs ; aucun résultat d’utilisabilité comparative n’est annoncé avant ces essais.

## Vérification technique

Galerie examinée dans Chrome sur ordinateur clair et en320×640 sombre : les trois pistes sont lisibles, les liens de lancement et d’arrivée directe sont exposés ; aucun débordement horizontal sur le petit format relevé. L’index des archives est aussi examiné sur ordinateur et320×640. Le français et le thème clair sont rétablis.

Les trois compositions de profil sont examinées sur ordinateur en clair et à320×640 en sombre ; la deuxième est aussi examinée en clair sur petit écran et en sombre sur ordinateur. Les rubriques, le contexte et les commandes restent dans la largeur disponible (document305px pour viewport320px, avec scrollbar). Les menus locaux de la troisième piste occupent501–543px et le dock global560–620px dans la capture mobile : surfaces distinctes sans chevauchement entre elles. Les pages conservent une réserve de défilement en bas pour accéder à tout le contenu.

Parcours joués : annuaire→Leïla→Projets ; Menu Horizon→les quatre projets globaux→retour navigateur vers les projets de Leïla ; Présentation→Parcours→Journal (état vide honnête) dans la première piste ; projets locaux→projets globaux et retour dans la troisième. La sélection d’une autre piste conserve la personne et la section par lien direct. Entrée, rejeu et retour vers l’annuaire joués dans la deuxième piste ; aucun élément transitoire laissé après la fin du mouvement. La trajectoire intermédiaire n’a pas été mesurée image par image et aucun gain FPS n’est revendiqué.

Une revue source indépendante a relevé deux problèmes corrigés : le lien d’évitement changeait involontairement la route ; le rejeu pouvait écraser une navigation intervenue avant sa seconde frame. Les éléments transitoires respectent aussi les libellés masqués en mode compact. Le contrôle visuel repère Présentation tronqué dans le dock contextuel ordinateur : largeur jusqu’à620px et répartition selon les libellés corrigées. Les cinq libellés sont ensuite mesurés sans troncature, dont Présentation70px visibles pour70px de contenu. Hauteur60px et disposition compacte conservées. Version finale des styles/contrôleur de démonstration : **v2**.

Syntaxe des deux contrôleurs valide ;39 références HTML contrôlées, imports locaux et fichiers de police résolus. Pas de tests unitaires supplémentaires pour cette étude réversible. Clavier et mouvements réduits sont pris en charge dans le code et revus, mais aucune nouvelle session clavier complète ni préférence système de mouvement réduit forcée dans le navigateur. Pas de téléphone physique ni RTL. La galerie est laissée ouverte au format habituel, en français clair. Ces contrôles ne démontrent pas la supériorité d’une variante.

## Conserver cette recherche

Ne pas supprimer cette galerie après le choix d’une variante. Une future intégration au site devra archiver l’état comparé et décrire le choix séparément. Fichiers d’entrée : index.html et demo.html ; styles/contrôleurs propres à l’étude, données et assets locaux. Aucun report Figma demandé ou réalisé dans cette séquence.
