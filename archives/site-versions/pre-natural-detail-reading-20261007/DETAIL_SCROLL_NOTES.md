# Défilement indépendant des fiches — 7 octobre 2026

L’utilisateur demande que, lors de l’ouverture d’un profil, la partie gauche ne défile pas avec la droite. La correction s’applique aux trois fiches qui partagent le sommaire latéral : **Profils, Projets et Journal**, uniquement au-dessus de840px. Les listes conservent le défilement du document. À840px et en dessous, la fiche garde son flux mobile et son sélecteur de rubrique ancré.

## Réalisation

Sur ordinateur, la fiche occupe un cadre limité entre l’en-tête et la recherche/dock. Le bouton Retour et la mention de démonstration gardent leur place. Identité/sommaire et lecture sont deux régions défilantes distinctes : le défilement de la lecture ne déplace pas la gauche ; la colonne gauche peut elle-même défiler lorsque la hauteur disponible ne suffit pas. Aucun contenu ni rubrique n’est supprimé. Les barres de défilement apparaissent selon le débordement, avec les styles existants. Les deux régions sont accessibles au clavier et nommées à partir des titres de la personne et de la rubrique.

`detail-scroll.css` contient ces règles, limitées aux fiches ordinateur. `detail-scroll.mjs` mémorise séparément les positions gauche/droite. Le contrôleur de navigation les enregistre dans l’état historique de la route, puis les restitue au retour. Un nouveau volet commence en haut de sa lecture et conserve la position du sommaire de la même personne ou publication. Un rendu pour favori, filtre ou langue conserve les deux positions pour la même rubrique. Les données d’une autre fiche ne reçoivent pas ces offsets. Les anciennes entrées d’historique qui ne contiennent que `window.scrollY` restent utilisables.

Le passage vers le format mobile retire les arrêts clavier et les zones internes ; leurs offsets reviennent à zéro. Le défilement mobile suit ensuite le document. Le retour au format ordinateur retrouve les régions indépendantes, initialement en haut ; la conversion de la position de lecture entre les deux géométries n’est pas implémentée.

Le menu Projet d’un profil est borné par les limites de la colonne pour rester visible. Le défilement effectif d’une colonne déclenche l’effacement habituel du dock ; ni les événements générés par une restauration ni le défilement des résultats de recherche ne le déclenchent. La sortie vers Explorer conserve aussi la hauteur de la fiche pendant son fondu, en plus de son rectangle et de son opacité.

## Vérifications effectuées

Dans Chrome, en **1920×1047, français clair** :

- Fiche Leïla, Parcours examinée visuellement. Les deux colonnes vont de y182 à y855,67 ; la droite contient868px de lecture pour674px visibles.
- Défilement réel à la souris dans la droite : offset194px ; gauche offset0 et position y182 conservée ; `window.scrollY=0`.
- Passage de Parcours à Projets, puis Retour navigateur : Parcours retrouve194px de lecture, gauche0 et document0.
- Filtre Projet ouvert et tronc commun développé. Sa dernière option, Projets personnels, est atteinte au clavier. Panneau entièrement dans la colonne : x1183–1501,85, y301–796,67, colonne x720–1510/y182–855,67. Rendu examiné.

Huit fichiers de tests passent : nouveau contrôleur des colonnes, dock/recherche, placement et groupes de filtres, transitions, rubriques Profil/Projet/Journal. Les nouveaux cas vérifient positions séparées, restauration par route, rendu de la même rubrique, changement de rubrique/personne, valeurs invalides, transition ordinateur→mobile→ordinateur, absence de faux événement de défilement après restauration, suspension du dock pendant la navigation et conservation/nettoyage de la hauteur de sortie. Syntaxe et empreintes d’archive contrôlées.

Complément de l’agent principal dans Chrome : profil Leïla à320×640 français clair, bloc Réseaux et liens examiné après défilement. Document défilé à640px, deux colonnes internes à0, aucun arrêt clavier interne résiduel et largeur310px pour320px disponibles. Le flux mobile est conservé. Après retour au format habituel1920×991, l’article « Autour d’un bug, une conversation » est examiné : lecture à50,67px après un geste dans la droite, sommaire ày182/offset0 et document0. Le texte reste entièrement atteignable au-dessus du dock. La galerie des trois études est rouverte en clair au format habituel.

**Limites de cette vérification :** pas de nouveau rendu RTL ou sombre de ces fiches pour cette correction, ni de nouveau défilement navigateur d’une fiche Projet ; celle-ci partage les règles et ses rubriques passent les tests. Pas de nouveau parcours carte, téléphone physique ou report Figma. L’accès Chrome a brièvement été indisponible avant ces contrôles complémentaires.

## Sources conservées

[Manifeste de l’état précédent](archive/pre-independent-detail-scroll-20261007/manifest.json) : sources et tests remplacés, plus styles de base des trois fiches. Toutes les anciennes études restent intactes.

Versions : contrôleur `detail-scroll-83`, aperçu51, défilement module/CSS1, contrôles10, dock/recherche `detail-scroll-14`, transitions2. ProfilsUI10/CSS10, ProjetUI3 et JournalUI2 restent inchangés par cette séquence. Aucun choix d’agencement supplémentaire n’est présenté comme accepté.
