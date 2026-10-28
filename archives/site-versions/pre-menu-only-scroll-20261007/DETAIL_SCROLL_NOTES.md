# Défilement des fiches — 7 octobre 2026

## État courant — lecture naturelle et gauche indépendante, version84

L’utilisateur corrige explicitement l’essai83 : il veut conserver deux défilements possibles, mais **aucun cadre de hauteur limitée autour de la lecture**. La droite doit se comporter comme avant la modification. Cette précision remplace les deux régions bornées de l’état83 documenté plus bas et conservé en archive.

**Réalisé :** Profils, Projets et Journal retrouvent le défilement naturel du document à droite, sans nouvelle hauteur, `max-height` ou `overflow` sur la lecture. Les règles antérieures de largeur, bordure, espacements et hauteur minimale510px restent en vigueur. Sur ordinateur (>840px), seule l’identité/sommaire devient fixe dans le viewport ; sa place et sa largeur sont mesurées depuis la grille. Sa position n’est pas limitée par la fin de cette grille : elle ne remonte donc pas quand le document arrive en bas. La gauche peut défiler jusqu’à sa dernière entrée si nécessaire. À840px et en dessous, la fiche garde son flux mobile normal et son sélecteur.

Le bas de la colonne gauche rejoint16px avant le bas du viewport. Elle garde12px de marge intérieure finale ; une réserve supplémentaire est calculée seulement lorsque la recherche ou le dock **chevauchent réellement sa largeur**, pour permettre de dégager son dernier élément. Sur les fenêtres courtes, le haut peut remonter, sans passer sous l’en-tête, pour garder une zone de défilement utilisable. La note de démonstration est alignée sur la lecture en mode ordinateur afin qu’elle ne passe pas sur le sommaire fixe en fin de document.

**Précision supplémentaire de l’utilisateur :** le bouton « Retour aux profils » appartient lui aussi à la gauche et ne doit pas bouger pendant le défilement droit. Les trois fiches épinglent maintenant leur bouton Retour à sa position initiale, au-dessus de l’identité. Une réserve non interactive, mesurée avant fixation, conserve exactement le départ de la lecture dans le document. Le bouton retrouve son emplacement et son ordre naturels sur mobile. La limite haute de l’identité tient compte du Retour pour ne pas le recouvrir. Un test ciblé couvre la réserve, la position stable, le passage au mobile puis le retour au format ordinateur.

La position de lecture redevient `window.scrollY`, déjà gérée par l’historique. Seul l’offset gauche est enregistré en complément. Les retours et les rendus d’un même profil/publication conservent cette position gauche ; un autre profil commence en haut. Aucun offset interne droit n’est restauré. Le dock conserve son fondu pendant le défilement du document ou de la gauche ; les restitutions programmatiques restent exclues. Les menus retrouvent les limites ordinaires du viewport, puisque la lecture n’est plus un conteneur défilant.

La translation d’entrée/sortie sur le parent aurait créé un nouveau bloc de référence pour la colonne fixe. Pour ces seules fiches, la transition conserve donc le **fondu d’opacité sans translation du parent**. Les listes gardent leur animation existante. Le sens RTL est pris en compte dans le calcul de la colonne. Dimensions recalculées au rendu, au changement de format et après chargement des polices, sans suivi du scroll du document.

**Vérifications techniques :** huit fichiers de tests passent : colonne gauche, transitions, dock/recherche, placement et groupes des filtres, rubriques Profil/Projet/Journal. Les cas ajoutés couvrent absence de scroll interne droit, retours et rendus, passage ordinateur→mobile→ordinateur, calcul identique en haut et en bas d’un long document, RTL, fenêtre courte, footer aligné et réserve conditionnelle du dock. Le fondu des fiches est testé sans `transform` sur le parent. Syntaxe et références vérifiées.

**Premier contrôle navigateur de l’agent principal,1920×1047 :** document0→316px (maximum), droite `scrollTop=0`, gauchey236/offset0 inchangés ; dernier paragraphe entièrement visible, y634–721. Ce contrôle a révélé la note de démonstration qui chevauchait le sommaire : son alignement à droite et l’extension de la gauche jusqu’au bas décrits ci-dessus sont ensuite réalisés. Les contrôles complémentaires de ce dernier état sont centralisés par l’agent principal ; cet agent n’a pas ouvert de nouveau navigateur pour cette correction. Pas de nouveau Figma ni de téléphone physique.

[Archive de l’état83 avant correction](archive/pre-natural-detail-reading-20261007/manifest.json), avec les sources et tests remplacés. Versions actuelles : contrôleur `natural-detail-reading-84`, aperçu52, défilement module/CSS2, transitions3 ; profilsUI10/CSS10, ProjetUI3/JournalUI2 et contrôles10 inchangés. Le journal et le contexte du projet sont tenus par l’agent principal.

## Historique — essai83 remplacé par la précision ci-dessus


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
