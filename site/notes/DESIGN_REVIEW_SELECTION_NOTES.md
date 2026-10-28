# Sélection issue de l’avis sur le design — 15 octobre 2026

## Demande et réalisation

Le 14 octobre, l’utilisateur fait réaliser à part les propositions de l’avis sur le design : 19 essais séparés sont construits et vérifiés sur une copie figée du prototype ([étude](../../studies/design-review-studies/NOTES.md)). Le 15 octobre, il retient neuf essais (numéros 01, 03, 07, 09, 12, 13, 15, 18 et 19 de la galerie) et fait tester leur combinaison. Il demande ensuite : « Je veux que tu appliques tous les changements à l'original ». **Les neuf essais retenus sont intégrés au prototype actif**, à partir de l’état `audit-fixes-146` du même jour. Les dix autres restent des essais, consultables dans la [galerie](../../studies/design-review-studies/index.html).

Ce qui change pour un visiteur :

- **Globe dans l’espace libre (01)** : sur ordinateur, tablette et téléphone en paysage, le globe du niveau Monde est réduit pour tenir entre la ligne de statistiques et la ligne d’état (ou la recherche), avec au moins 16 px d’air, toujours centré. Les téléphones en portrait gardent le globe précédent.
- **Étiquettes du globe en Jost (03)** : les repères du globe prennent la police du site au lieu de celle de la carte ; taille, graisse et couleur sont inchangées.
- **Une colonne sous 360 px (07)** : Projets et Chroniques passent à une carte par ligne sous 360 px de large ; à 390 px, rien ne change.
- **Sans « pseudo à renseigner » (09)** : la mention provisoire disparaît des profils qui n’ont pas de pseudo Intra ; aucun pseudo n’est inventé.
- **Rôles de couleur unifiés (12)** : les boutons principaux reprennent le traitement de Se connecter (42 Blue en clair, Royal Pink en sombre, texte encre) ; les « Annuler » encore colorés deviennent neutres.
- **Contour de « Visiter » en sombre (13)** : Visiter à l’arrivée et Créer un compte dans le menu du compte reçoivent un contour fin en sombre. Leur texte, encore Royal Pink à l’intégration, passe ensuite en blanc à la demande de l’utilisateur ([suite du 15 octobre](ACTION_AND_COPY_NOTES.md#suite-du-15-octobre--texte-blanc-pour-visiter-et-créer-un-compte-en-sombre)).
- **Textes plus lisibles (15)** : les petits textes utiles ne descendent plus sous 13 px et les petites actions passent à 14 px ; les petits textes colorés prennent un accent plus lisible (#0C7677 en clair, #F485BD en sombre).
- **Échelle et arrondis unifiés (18)** : les principaux composants suivent une échelle courte de tailles (12, 14, 16, 20, 28 et 35 px), trois arrondis et deux niveaux d’ombre.
- **Page Awards « à venir » (19)** : une phrase centrée, « Les 42 Awards arrivent bientôt. », en français, anglais et arabe, sous l’icône de trophée du menu.

En retenant ces essais puis en demandant leur application, l’utilisateur revient sur des choix explicites antérieurs, signalés dans les fiches des essais : rayon du globe (4 octobre, « globe un peu plus petit au départ » ; 13 octobre, centre exact avec rayon inchangé) ; deux cartes par ligne à 320 px et adaptation des tailles avant toute grille mobile (6 et 8 octobre) ; page sans paliers de taille (6 octobre, en partie, par l’échelle unifiée) ; page Awards limitée à l’en-tête et au menu (7 octobre) ; couleurs de la charte limitées à Se connecter et au retour Monde (13 octobre). Pour Visiter et Créer un compte en sombre, l’intégration conserve le texte rose et les dimensions notés le 13 octobre et n’ajoute que le contour ; le texte passe ensuite en blanc, l’utilisateur précisant qu’il ne voulait pas de rose.

## Fichiers et chargement

- **Ajoutés :** `design-review-selection.css` (30 433 octets : les neuf feuilles d’essais fusionnées dans l’ordre de l’étude, conditions entre essais rendues permanentes) et `design-review-selection.mjs` (4 226 octets : repli des lignes de pseudo absent dans la grille des profils, message de la page Awards et suivi de la langue).
- **Modifiés :** `index.html` et `content-preview.html`, deux lignes chacun — la feuille après `content-report.css?v=3`, dernière feuille, et le module après le module principal. Nouveaux identifiants de cache : `design-review-selection.css?v=1` et `design-review-selection.mjs?v=1`. Les autres identifiants ne changent pas (contrôleur `audit-fixes-146`, aperçu 113).
- **Non modifiés :** tous les autres fichiers du prototype, les tests et `welcome-panels.html` ; l’ancien accueil à panneaux ne charge pas la sélection.
- **Noms neutres dans le prototype**, par rapport aux essais : `--essai-globe-*` devient `--globe-fit-*`, `--essai-lt-accent` devient `--readable-text-accent`, `.essai-awards-a-venir` devient `.awards-coming-soon`, `data-pseudo-manquant="replie"` devient `data-pending-login="collapsed"`.

Le [paquet préparé et son plan](../../studies/design-review-studies/integration-20261015/PLAN.md) restent dans l’étude.

## État précédent conservé

[Archive de l’état 146](../../archives/site-versions/pre-design-review-selection-20261015/README.md) : 137 sources, 11 originaux adaptés et stockage séparé. Avant l’intégration, elle s’affichait comme le prototype actif dans Chrome (6 vues, 7 états, 0 pixel d’écart). Les états 144 et 145 restent archivés.

## Vérifications

- **Paquet :** sur la copie de l’étude, il donne le même rendu que les neuf essais, au pixel près, dans 36 états répartis sur 27 vues, hors bruit WebGL du globe ([préparation](../../studies/design-review-studies/checks/_integration-20261015/preparation/)).
- **Périmètre :** des 137 sources archivées, seules `index.html` et `content-preview.html` changent, de deux lignes chacune ; les deux fichiers ajoutés sont identiques au paquet (empreintes SHA-256).
- **Tests :** 660 cas sur 62 fichiers passent, avant comme après l’intégration ([résultats](../checks/20261015-design-review-selection/tests-apres.json)).
- **Références :** 163 références locales sans manque et 20 ressources servies identiques aux sources ([relevé](../checks/20261015-design-review-selection/references-apres.json)).
- **Chrome :** l’effet de l’intégration sur l’original (archive → original intégré) est comparé à celui des neuf essais sur la copie (copie → copie avec essais), dans 13 vues. Explorer avec le vrai globe à 1440 × 900 (FR), 1366 × 768 (AR) et 390 × 844 (sombre), Projets à 320 × 640 (AR), Profils en grille à 1440 et 340 px, la page Awards en français puis arabe et anglais sans rechargement, et l’arrivée en sombre : **même effet et rendu identique au pixel près à la combinaison testée** (186, 212, 191, 533, 517, 480, 96 à 100 et 112 éléments changés, 0 pixel d’écart). Menu du compte en sombre, écran d’erreur de l’arrivée et panneau de tri ouvert près du bas : différences dues aux seules corrections du 15 octobre, déjà visibles entre la copie et l’archive sans aucun essai ; là où les éléments existent des deux côtés, l’effet est le même. L’ancien accueil à panneaux est identique avant et après (0 pixel). Aucune erreur de console ni défilement horizontal. [Résultats](../checks/20261015-design-review-selection/results-apres.json).
- **Différences avec la copie de l’étude**, attendues puisque l’original a reçu entre-temps les corrections du 15 octobre : fond encre de « Créer un compte » en sombre (texte à 4,51:1 et contour à 4,32:1, au lieu de 3,84:1 et 3,68:1 sur la copie), compte visible sur l’écran d’erreur de l’arrivée, panneau de tri des commentaires ouvert vers le haut près du bas de l’écran. L’arrivée en sombre et le menu du compte en clair sont identiques au pixel près à la copie avec les essais.

Preuves et scripts : [checks/20261015-design-review-selection/](../checks/20261015-design-review-selection/).

## Limites

- **Globe :** sur un téléphone en paysage, le disque ne mesure qu’environ 41 px de diamètre ; à 667 × 375 en arabe, l’air au-dessus tombe à 15 px, le globe étant déjà à sa taille minimale. Sur les portables courants, le rayon baisse nettement (171 px à 1366 × 768). Les vues Pays du Canada et du Brésil sont moins zoomées.
- **Textes plus lisibles :** les libellés du dock mobile restent à 11 px ; à 390 px, un nom d’auteur (« Arun Suri ») passe sur deux lignes, coupé à l’espace ; à 320 px en arabe et en portrait, le globe recouvrait déjà le bas de la ligne d’état et ce recouvrement grandit un peu.
- **Échelle unifiée :** en arabe, en vue Liste des Profils, la pastille « Alumni » passe sur deux lignes ; sur la page profil à 1024 × 768, le menu de gauche ne passe plus en mode compact. Ce n’est qu’un démonstrateur : la vraie consolidation des feuilles reste un travail structurel.
- La limite de contraste de « Créer un compte » en sombre, relevée sur la copie de l’étude, ne vaut plus sur l’état 146 (texte à 4,51:1).
- Contrôles faits dans Chrome sans interface, avec des formats émulés : aucun téléphone physique ni lecteur d’écran réel.

## Revenir en arrière

Retirer les quatre lignes ajoutées (deux par page d’entrée) suffit à retrouver l’état 146 ; les deux fichiers ajoutés peuvent alors être supprimés. L’[archive](../../archives/site-versions/pre-design-review-selection-20261015/README.md) conserve cet état complet.
