# Pages de contenu — report Figma, finalisé le 4 octobre 2026

**Agencement actuel — 4 octobre 2026 :** la première étude est reportée sur les huit accueils et huit pages de contenu : dock bas commun, globe centré et médaillon contextuel de 32 px. Palette, polices et visuels existants conservés sur demande explicite ; archives intactes. Les raccords d’entrée reçoivent la nouvelle géométrie. API et captures contrôlées, sans nouveau rejeu du lecteur. [Report, preuves et limites](dock-navigation-handoff.md) · [Relevé](dock-navigation-state.json).


L’utilisateur demande à voir une navigation qui donne la place principale aux contenus, puis rappelle explicitement de mettre Figma à jour. Le premier report ajoute quatre pages distinctes et préserve les anciens accueils. Le 28 septembre, l’intégration des grandes pages dans le site principal s’accompagne du complément Figma Parcours et Journal décrit ci-dessous. **La réalisation et ses contrôles ne constituent pas une acceptation esthétique définitive.** Les modules de `horizon-welcome/index.html` et de son accès direct `content-preview.html` sont les références fonctionnelles.

## Visite campus — ajout du 28 septembre, finalisé le 4 octobre

La demande explicite remplace le lien de l’article vers Explorer par une fenêtre de visite du campus. Les deux liens « Explorer le campus » du détail Minishell ouvrent désormais une **superposition** ; la croix et le fond la ferment sans navigation ni réinitialisation du défilement. La fenêtre ne contient aucun retour Pays/Monde.

| Format | Article et action | Fenêtre | Capture |
| --- | --- | --- | --- |
| Ordinateur | article `328:5152`, action `328:5219` | [357:4920](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=357-4920) | [PNG](assets/campus-map-desktop.png) |
| Mobile | article `328:5536`, action `328:5604` | [357:4968](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=357-4968) | [PNG](assets/campus-map-mobile.png) |

Le composant partagé `Content/CampusMapDialog` (`356:1404`, deux variantes) reprend le titre, le repère Paris, les commandes et les crédits du site. Ces éléments restent éditables. Seul le fond urbain est une **capture réelle du canvas Paris** ; le mobile utilise un recadrage de la même image. La capture initiale au WebGL vide a été remplacée par la capture correctement rendue. Aucun écran complet n’est aplati dans la maquette.

Les axes des huit fondus de bord étaient inversés ; ils sont corrigés le 4 octobre et les deux captures finales sont examinées. L’audit relève 36 descendants par fenêtre, dont 9 instances, 5 textes Jost sans police manquante et une seule image de contenu. Les réactions des deux liens sont de type OVERLAY, avec ouverture par fondu de 0,2 s, sans remise à zéro du scroll ; les quatre fermetures sont de type CLOSE. Les 69 cadres précédents sont conservés : **71 cadres** au total, soit huit pages de contenu et deux fenêtres de visite en plus des autres parcours.

**Limites :** le zoom animé, le déplacement et le cache WebGL restent fonctionnels dans le site, pas dans Figma. Les boutons de zoom/recentrage de cette fenêtre Figma sont illustratifs ; l’ouverture par fondu n’est pas une simulation du vol cartographique. Le lecteur Figma a renvoyé ERR_CONNECTION_TIMED_OUT pendant le contrôle du 4 octobre : les réactions sont vérifiées par API et les rendus par captures, sans nouveau parcours navigateur revendiqué. [Audit final](campus-map-audit.json).

Les deux imports de capture temporaires `351:2` et `353:2` sont supprimés après transfert de l’image ; le fichier local `capture-campus-temporary.html` est retiré. Le réglage preserveDrawingBuffer n’existait que dans ce fichier de capture. Les archives de conception sont préservées.

## Complément du 28 septembre

Quatre listes FR sont ajoutées, sans nouvelle composition ni contenu inventé. Elles reprennent exactement les deux récits fictifs de Parcours et les deux articles illustratifs du Journal, avec les SVG `path` et `journal` du site. Chaque rubrique possède sa sélection de menu, son titre, son introduction et le compteur « 2 contenus ». Les cartes restent illustratives dans Figma ; leurs détails sont consultables sur le site.

| Écran | Nœud | Capture |
| --- | --- | --- |
| Parcours ordinateur | [347:4492](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=347-4492) | [PNG](assets/content-preview-people-desktop.png) |
| Parcours mobile | [347:4696](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=347-4696) | [PNG](assets/content-preview-people-mobile.png) |
| Journal ordinateur | [347:4904](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=347-4904) | [PNG](assets/content-preview-journal-desktop.png) |
| Journal mobile | [347:5112](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=347-5112) | [PNG](assets/content-preview-journal-mobile.png) |

Les menus des quatre accueils LTR et des huit pages de contenu relient désormais Explorer, Projets, Parcours et Journal. Le départ d’un accueil mémorise sa branche visiteur/membre ; les changements de rubrique conservent cette valeur pour le retour Explorer. Les 48 éléments de menu sont audités, sans destination absente ; une rubrique déjà sélectionnée n’a pas d’action inutile. Les quatre nouvelles compositions sont examinées, avec deux cartes, défilement vertical et navigation fixe. L’interface reste en Jost, sans police manquante. Le guillemet décoratif de l’illustration Journal utilise Noto Serif en repli de Georgia indisponible ; l’esperluette utilise Cousine Bold. Les couleurs et tracés du SVG sont conservés.

Les 65 cadres précédents sont préservés ; la page compte maintenant **69 cadres**. Pas de matrice supplémentaire EN/AR, de nouveaux détails Figma ni de simulation du filtrage éditorial.

## Pages et liens

Fichier `yFrdllVm6nrKZJ2c99MMjT`, page `115:2`. Les textes sont des exemples de démonstration ; ils ne décrivent ni étudiants réels ni résultats attribués à des campus.

| Écran | Nœud | Capture |
| --- | --- | --- |
| Projets ordinateur | [328:4892](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=328-4892) | [PNG](assets/content-preview-desktop-list.png) |
| Détail Minishell ordinateur | [328:5152](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=328-5152) | [PNG](assets/content-preview-desktop-detail.png) |
| Projets mobile | [328:5253](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=328-5253) | [PNG](assets/content-preview-mobile-list.png) |
| Détail Minishell mobile | [328:5536](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=328-5536) | [PNG](assets/content-preview-mobile-detail.png) |

Le menu des quatre accueils LTR mène aux listes correspondantes. La première carte ouvre Minishell ; le retour retrouve la liste. Explorer et « Voir la carte » reviennent à l’accueil. Les pages possèdent un défilement vertical et une navigation fixe : menu compact ordinateur, barre basse mobile. Les cartes réutilisent quatre illustrations SVG éditables issues du site. Les styles, couleurs et textes restent liés aux variables existantes ; la bibliothèque ajoute des composants de carte, d’illustration et une navigation compacte sans réécrire l’ancienne navigation.

Pour jouer directement : [liste ordinateur](https://www.figma.com/proto/yFrdllVm6nrKZJ2c99MMjT?node-id=328-4892&starting-point-node-id=328%3A4892), [liste mobile](https://www.figma.com/proto/yFrdllVm6nrKZJ2c99MMjT?node-id=328-5253&starting-point-node-id=328%3A5253).

## Pays, campus et fiche

Les filtres des huit accueils et des quatre nouvelles pages ouvrent deux sélecteurs **Pays / Campus**, sans recherche. Le composant `Welcome/ScopeDialog` (`319:922`) comprend 24 variantes : deux formats, LTR/RTL, six états. Le parcours représentatif est Monde → France → Paris ; changer de pays réinitialise le campus, choisir Paris dans la liste globale déduit France. Les libellés sont liés aux trois langues.

Quatre overlays Monde servent d’entrées partagées aux composants interactifs ; les huit cadres France/Paris restent conservés pour référence. L’ouverture utilise une action directe avec conservation des composants, après un défaut constaté des conditions d’ouverture dans le lecteur Figma. Les réactions internes permettent le choix immédiat sans fermer la fenêtre. Le [relevé](content-preview-state.json) contient tous les IDs.

Après Paris, un accès textuel « Fiche du campus » apparaît sous le filtre des quatre accueils LTR. Il ouvre les fiches [ordinateur `330:4463`](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=330-4463) et [mobile `330:4464`](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=330-4464). Nom, pays, adresse officielle et site sont repris du module web. Fermeture par bouton et fond ; lien FR `https://42.fr/` dans un nouvel onglet. Le lien anglais vérifié est `https://42.fr/en/homepage/`, également le repli demandé en arabe, mais ces deux interactions linguistiques ne sont pas ajoutées à la fiche Figma FR. Voir [le relevé des fiches](campus-details-handoff.json) et les [captures ordinateur](assets/campus-details-desktop.png) / [mobile](assets/campus-details-mobile.png).

La règle du site est conservée : au niveau Pays, clic campus → zoom ; une fois arrivé, clic nom/viseur → fiche ; flèche hors champ → recentrage uniquement. **Figma ne simule pas ce trajet.** La visite depuis l’article ajoute désormais le fond urbain statique décrit en tête, sans moteur cartographique. Aucun faux viseur Paris n’est placé au centre d’un globe Monde. Le bouton textuel est un accès représentatif de maquette. Après rechargement du lecteur Figma, le parcours ordinateur **France → Paris → Voir la carte → Fiche du campus → fermeture par la croix** est joué : accès visible, fiche Paris et fermeture confirmés. Le premier essai utilisait une version du lecteur antérieure à l’ajout du bouton ; aucun défaut ne persiste après actualisation.

## Finition et vérification

Les listes de langue partagées font maintenant 176 × 148 : trois lignes de 42 px, espacement de 4 px, une seule plage de sélection et une coche. Les vingt instances des dix overlays ont bien reçu la nouvelle hauteur. Les compositions LTR et RTL sont examinées ; le fond de survol animé du site n’est pas simulé dans Figma.

Les quatre pages, deux fiches et sélecteurs sont examinés visuellement. L’audit des nouvelles pages ne trouve ni police manquante ni destination absente ; elles défilent verticalement avec une navigation fixe. Le parcours **liste ordinateur → Minishell → retour liste** est joué dans le lecteur Figma. Le filtre est également joué depuis cette liste : **France → 42 Paris → fermeture par la croix → réouverture**. Les deux sélections sont conservées et la puce de contexte derrière affiche **42 Paris**. Ce contrôle confirme l’ouverture directe et la conservation de l’état du composant interactif ; il ne démontre pas un zoom cartographique dans Figma.

## Limites du report

- Le globe est une géographie vectorielle figée ; zoom, préparation, cache, visite aléatoire et 58 campus appartiennent au site.
- Les nouvelles compositions Figma couvrent huit pages FR/LTR depuis le complément du 28 septembre. Il n’y a pas de nouvelle matrice complète des pages en arabe ; les anciens accueils RTL restent présents.
- Seul Minishell possède une page de détail Figma. La recherche éditoriale et les sept autres cartes sont illustratives ; les huit détails sont consultables dans le site.
- La piste conserve 71 cadres de parcours : les 47 précédents, 12 overlays de filtre, huit pages, deux fiches et deux fenêtres de visite campus. Aucun ancien cadre de parcours n’est supprimé.
- Aucun compte réel, contenu Intra, publication ou acceptation esthétique finale n’est déduit de ce report.

## Suite du 4 octobre — agencement de la première étude

Les six listes utilisent désormais la grille commune, avec deux démonstrations Liste pour Projets. La recherche locale est retirée ; le dock possède une loupe séparée et deux états illustratifs Paris à trois résultats. La page compte maintenant 75 cadres, sans suppression des 71 précédents. Voir le [report spécialisé](content-layout-handoff.md) et son [relevé](content-layout-state.json) pour les captures, composants dérivés et limites. Les sections antérieures conservent le récit de leur réalisation.
