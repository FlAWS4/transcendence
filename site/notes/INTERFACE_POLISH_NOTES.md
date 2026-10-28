# Ajustements du menu, du filtre et du globe — 4 octobre 2026

## Demandes et état retenu

L’utilisateur demande un menu sombre plus distinct du fond, plus fin et plus arrondi, avec la même transparence que la loupe et dans les deux thèmes. Il retire « Voir la carte » des rubriques et veut un filtre ancré comme le sélecteur de langue. Le globe doit pouvoir occuper toute la page avec des extrémités progressivement floutées, tout en démarrant un peu plus petit. Il signale également une bande blanche verticale à droite au zoom.

La précision finale remplace l’interprétation précédente du « flou du menu » : **le menu doit devenir transparent pendant le défilement**. À la question fond seul ou menu entier, l’utilisateur répond **« On teste les deux »**. Deux essais séparés sont donc conservés ; aucune préférence finale n’est déduite. Les réglages intermédiaires de flou 32/56 px et d’opacité 70/50 % sont abandonnés.

## Réalisation commune

- Dock ordinateur : menu 510 × 60 px, boutons 48 px, loupe 52 px, intervalle 12 px ; ensemble 574 px. Mobile : menu 64 px de haut, boutons 50 px, loupe 46 px, intervalle 10 px. Capsules et indicateur arrondis à 999 px. Palette générale et accents conservés.
- Sombre : graphite existant #29292E, contour neutre et ombre noire pour distinguer le menu du fond. Menu et loupe partagent exactement la même surface : opacité 95 % au repos, 78 % pendant le défilement, flou fixe 22 px, en clair comme en sombre. Le panneau de résultats garde son propre fond lisible.
- Défilement réel du document seulement : état actif maintenu jusqu’à 900 ms sans mouvement ; entrée 220 ms et retour 650 ms. Reprendre le défilement pendant le retour inverse progressivement la transition. Les événements de la carte et du panneau de recherche ne sont pas assimilés au défilement de la page. Nettoyage du timer, de la frame et de l’écouteur à la destruction.
- Suppression de la rangée « Voir la carte » et de ses raccords. Contenu remonté ; sur ordinateur, padding supérieur 104 → 80 px. Les liens « Explorer le campus » des articles restent disponibles.
- Filtre Pays/Campus non modal sous son bouton, avec intervalle 8 px, largeur maximale 320 px, marge écran 12 px, repli au-dessus si nécessaire. Champs liés et choix immédiat conservés. Fermeture par croix, Échap, clic extérieur ou sortie clavier ; retour du focus. Repositionnement au scroll/resize et gestion RTL.
- Scène du globe 100vw × 100svh, avec la même taille logique dans les rubriques pour préserver la carte unique et son médaillon. Rayon initial .425 sur ordinateur et .46 sur mobile. Filtre remonté de 6 px sur ordinateur et de 8 px sur mobile courant.
- Flou périphérique du fond de carte : une couche de flou 12 px (8 px mobile) est mélangée par un masque radial progressif. Le centre et les repères HTML restent nets. Ce mélange produit l’effet progressif sans calculer un rayon de flou distinct par pixel. Il ne s’applique ni au médaillon ni à la fenêtre de visite campus.
- La bande droite provenait de la place réservée à la barre de défilement. Le gutter automatique et les dimensions en vw rétablissent la pleine largeur d’Explorer ; le menu conserve aussi son centre et sa largeur lorsque les rubriques retrouvent une barre de défilement.

## Deux essais de transparence

Voir [MENU_SCROLL_STUDIES.md](MENU_SCROLL_STUDIES.md).

1. [Fond transparent](../content-preview.html?menu-scroll=background#projects) : fond, contour, ombre, flou de fond et pastille active s’effacent ; textes et icônes restent visibles et utilisables.
2. [Menu effacé](../content-preview.html?menu-scroll=all#projects) : menu et loupe s’effacent ensemble ; pas de cible invisible pour la souris. Un focus visible au clavier (ou dans le champ de saisie) conserve ou rétablit la visibilité ; le simple focus laissé par un clic ne bloque pas l’effacement.

Ces paramètres n’activent les essais que dans l’aperçu direct. L’accueil principal et l’aperçu sans paramètre gardent le traitement commun 95/78 %. Les trois études de navigation initiales restent archivées, sans modification.

## Vérifications

**65 tests passent**, zéro échec : données/recherche et pagination, transitions de rubrique, session campus, sélecteurs liés et gestion du redimensionnement. Les tests de scroll couvrent notamment huit pauses successives de 100 ms, la reprise pendant le retour et le nettoyage après destruction. Syntaxe des modules contrôlée.

Chrome : les deux essais sont joués sur ordinateur. Mesures pendant le mouvement : essai fond, alpha du fond 0 et flou 0 px avec textes/menu à opacité 1 ; essai complet, opacité du conteneur 0 et pointeur désactivé. Retour au repos observé à opacité 1 et flou 22 px. Dernier cas corrigé et rejoué : fermer la recherche à la souris laissait le focus sur la loupe et bloquait le fondu complet ; la garde utilise maintenant :focus-visible. Avec la version CSS 15, le menu atteint bien l’opacité 0 après ce clic, tandis qu’un champ de saisie focalisé conserve l’opacité 1 pendant le scroll. L’effacement complet est aussi joué en mobile 390 × 844 sombre ; les captures montrent la progression du fondu. Les captures sont des observations ponctuelles, pas une mesure FPS.

Dock fin et capsules examinés sur ordinateur/mobile. Après la dernière correction de gutter, Explorer et Projets conservent exactement le même dock 574 × 60 px, x = 673 à 1920 px de large, ainsi que la même scène logique 1920 × 991,333 px. Au mobile, Explorer occupe 390 × 844 px, dock x = 16 / largeur 358, un canvas. Le globe initial, le zoom et l’absence de bande blanche à droite sont examinés. Le moteur cartographique v30 est conservé.

Filtre : choix France et campus liés, conservation de l’ouverture après sélection, Échap et retour du focus contrôlés. Dernier contrôle mobile arabe sombre : panneau x = 12, largeur 320, y = 160, à 8 px sous le déclencheur ; aucune découpe à droite. Pas de téléphone physique ni de nouveau test de clavier virtuel réel. Les deux essais attendent la comparaison et le choix de l’utilisateur ; aucune acceptation esthétique déduite.

## Sources et versions courantes

- welcome.mjs : dock-polish-49 ; entrée content-preview.mjs : 17.
- dock-search.mjs : fluid-glass-9 ; dock-search.css : menu-scroll-studies-15.
- content-layout.css : 3 ; scope-popover.mjs : 2 ; scope-popover.css : 1.
- globe-framing.css : globe-framing-4.
- Données recherche v3, moteur intégré v30 et welcome.css theme-metrics-24 conservés.

Les pages index.html et content-preview.html chargent les mêmes correctifs ; les titres des deux essais les distinguent dans les onglets. Le [report Figma](../../figma/explorations-2026-09/content-layout-handoff.md) et son [relevé](../../figma/explorations-2026-09/content-layout-state.json) consignent les 26 instances de dock, le verre commun au repos, le filtre ancré, la suppression de « Voir la carte » et le cadrage du globe. Les captures finales d’accueil arabe sombre mobile et de recherche mobile sont examinées. Le flou radial reste une limite du report Figma, et son filtre partagé utilise un ancrage fixe de référence Explorer, contrairement au recalcul dynamique du site. Audit final : 75 cadres, 88 destinations présentes et 12 destinations de bibliothèque du filtre valides. Aucune animation des deux essais web ni nouveau rejeu du lecteur n’est revendiqué.


## 5 octobre — choix intégré, retour accéléré et position commune du filtre

L’utilisateur choisit explicitement **le deuxième essai**, avec un retour plus rapide. L’effacement du menu entier et de la loupe devient le comportement normal de l’accueil et du raccourci, sans paramètre. L’essai fond seul reste accessible pour conserver la comparaison. Réglage réalisé : effacement 220 ms, attente après le dernier mouvement **400 ms** (au lieu de 900), retour **350 ms** (au lieu de 650). La protection du focus visible au clavier et du champ de saisie est conservée. Les pauses de 100 ms ne font pas réapparaître le menu.

Le signalement « défiler puis changer de rubrique » est corrigé : les modifications de contenu peuvent réduire la hauteur de la page, puis la navigation remet ou restaure sa position. Le contrôleur suspend l’effet avant ces modifications, annule son état/timer/frame, puis reprend après le scrollTo et le focus avec la position réelle comme référence. Une ancienne navigation ne peut pas réactiver l’écoute avant la plus récente. La même protection couvre le changement pays/campus qui revient en haut de la liste. Le premier vrai mouvement suivant reste détecté.

L’utilisateur demande aussi le filtre à la même position sur toutes les pages et légèrement plus haut. Les surcharges réservées à Explorer sont retirées ; la position commune vaut désormais y118 sur ordinateur, y95 sur mobile courant, y75 sur mobile court et y62 en paysage compact. Le centrage utilise la largeur du viewport pour éviter les 7,5 px de décalage quand une rubrique a une scrollbar. Le filtre conserve son comportement de défilement avec la page ; aucun positionnement sticky ajouté.

**23 tests passent** : 15 recherche/défilement et 8 transitions. Les trois cas ajoutés couvrent clamp/restitution différée, annulation d’une frame de scroll en attente, navigations superposées et destruction. Les tests existants de pauses courtes passent avec le nouveau délai. Syntaxe des modules contrôlée. Chrome : version sans paramètre, effacement au scroll, retour, puis Projets défilé → Parcours avec scroll0, opacité1 et aucun état de défilement ; filtre avec le même rectangle dans les quatre rubriques à 948px de large (centre474, y118). En mobile390×844, Projets et Explorer donnent tous deux x135,8125 / y95 / largeur118,375 / hauteur45,333. Un dernier rejeu du scroll mobile après navigation est bloqué par l’approbation automatique des outils pour limite d’utilisation ; il n’est pas revendiqué. Le format mobile temporaire est retiré. Aucun téléphone physique ni mesure FPS.

Figma : 26 contextes alignés à y118/y95, quatre fenêtres déplacées à 8px sous la référence, 30 IDs et rectangles renvoyés par l’écriture. Capture Projets mobile examinée. [Report](../../figma/explorations-2026-09/content-layout-handoff.md), champ `scrollAndFilter20261005` ; le défilement reste une interaction web, sans nouveau rejeu du lecteur Figma.

Versions courantes : welcome **scroll-navigation-50**, dock-search.mjs **scroll-navigation-10**, dock-search.css **scroll-navigation-16**, content-preview.mjs **18**, globe-framing.css **globe-framing-5**. Les versions et réglages du 4 octobre plus haut sont historiques. Choix du mode accepté par l’utilisateur ; les nouvelles durées proposées restent à apprécier.


## 5 octobre 2026 — Globe derrière le filtre, cercle ajouré

Demande explicite : le globe ne doit plus passer devant le filtre quand on quitte Explorer, puis derrière au retour. L’utilisateur veut retirer l’icône et garder un cercle vide où le globe réduit vient s’insérer.

Réalisé dans l’accueil et l’aperçu : couche du globe constante à 4 sous le filtre à 6, limitée à la scène enfant de main ; le SVG décoratif du filtre est retiré. L’ancre de 32 px est conservée, avec un contour fin et une découpe transparente du fond de la capsule. Le trou suit le côté logique en RTL. Fonds et couleurs existants repris ; dimensions de carte, caméra, géométrie du mouvement et durée de 700 ms inchangées. La fenêtre campus conserve ses styles propres. CSS chargé : dock-navigation.css?v=globe-seat-3.

Vérifications : 23 tests des transitions de contenu et du menu passent. Dans Chrome ordinateur, Explorer → Projets → Explorer joué ; cercle vide et globe inséré examinés, couche calculée 4 dans les deux états contre 6 pour le filtre, cercle 32 px et filtre à y118. Rendus clair et sombre examinés. Le relevé image par image n’a pas abouti (API de mesure non exposée) : pas de capture à mi-course revendiquée. Mobile/RTL, téléphone physique et visite campus non rejoués pour cette seule correction CSS. Aucun nouveau report Figma de ce cercle ou de cette animation.


## 5 octobre — capsule flottante retenue et filtre réservé aux collections

La capsule remplace la loupe latérale dans le site, une seule croix reste après saisie et le menu devient compact sans déplacer ses textes sous les icônes. Le filtre est encore remonté (y106/83) et retiré des articles, avec l’espace de lecture ajusté. Tous les essais sont conservés. Réalisation, versions, 37 tests, contrôles Chrome et limites dans [FLOATING_SEARCH_NOTES.md](FLOATING_SEARCH_NOTES.md). Les mesures y118/y95 des étapes précédentes sont historiques.

## 7 octobre 2026 — Centre du globe progressif sur mobile

L’utilisateur observe que le globe demeure au centre lorsque les commandes du bas s’empilent sur petit écran. Il demande une remontée progressive à mesure que la fenêtre rétrécit, tout en conservant le centrage ordinateur.

`globe-layout.mjs` fournit un centre commun au moteur MapLibre et au raccord du dock. La remontée proposée vaut `64 × clamp((900 − largeur)/540, 0, 1) × clamp((hauteur − 440)/180, 0, 1)` en pixels. Elle est nulle à partir de900px de largeur, croît sans saut jusqu’à64px à360px et moins, et s’atténue sur les fenêtres très basses pour préserver l’en-tête. La première rampe de hauteur sur240px, qui réduisait encore trop le déplacement à640px de haut, reste archivée avec son test.

Le déplacement utilise le padding de projection existant. Les marqueurs restent projetés par la carte ; aucun déplacement séparé du canvas, changement de rayon ou nouvelle instance WebGL. Le masque du flou radial utilise le même centre vertical. L’entrée retrouve la géométrie exacte via l’API existante ; le médaillon utilise le même calcul sur toutes les rubriques. L’activation CSS est limitée à la scène enfant de main : la carte empruntée par la fenêtre campus garde son centrage propre. Le filtre et les commandes ne sont pas déplacés.

Vérifications : six tests du helper couvrent progression, continuité, dimensions basses et absence d’activation dans les autres scènes. Les fichiers layout-resize, campus-preview, marker-projection et entrance passent, syntaxe des modules valide. La dernière correction de rampe est revérifiée par les six tests du helper, sans relancer inutilement les autres suites.

Chrome, français clair :390×844, centre y361,56 au lieu de422 (remontée60,44) ;320×640, y256 au lieu de320 (64) ;667×390, y195 inchangé ;1920×1047, y523,5 inchangé. Captures examinées : les statistiques sont dégagées à390px, mais restent proches du bord inférieur du globe à320px, son diamètre ayant été conservé. Le globe garde son flou progressif et peut passer derrière le filtre comme auparavant. Aucun débordement horizontal sur les dimensions relevées.

Entrée visiteur jusqu’au globe rejouée ; Explorer→Projets puis retour, alignement du centre transformé sur le médaillon vérifié. Projet MiniShell→carte Paris : centre50% et activation responsive absente dans le portail, un canvas. Fermeture→Explorer : centre42,838% rétabli à390×844, repères alignés sur le globe dans la capture, un canvas. Le chargement complet des rues n’est pas l’objet de ce contrôle. Format temporaire retiré, Explorer/français clair restaurés ; onglet principal rechargé. Pas de téléphone physique, nouvelle matrice RTL/sombre, mesure FPS ni report Figma.

Archives : `archives/site-versions/pre-progressive-globe-center-20261007/` et sous-dossier `first-height-ramp/`. Versions finales : welcome `progressive-globe-76`, aperçu44, moteur32, dock `progressive-center-6`, cadrage `progressive-center-13`, helper2. Ajustement réalisé et à examiner, sans acceptation esthétique finale déduite.


## 13 octobre — Propositions de placement des commandes

Demande d’idées, sans choix ni intégration : sur mobile les commandes occupent trop de hauteur ; sur ordinateur elles suivent la longueur du texte. Le groupe `.globe-footer` est centré par sa largeur totale et passe en colonne sur mobile. Dans Chrome isolé, à1280×900, la capsule occupe132×48px dans un groupe280,36px ; à390×844, texte et commandes occupent166×85px. Les captures du diagnostic montrent le globe encore en préparation : elles vérifient la disposition, pas le rendu cartographique final.

Deux [propositions schématiques](../../studies/globe-control-placement/index.html), destinées à la conversation, sont conservées ; [rendu examiné](../../studies/globe-control-placement/placement-comparison.png). Première piste recommandée par l’assistant : colonne au bord droit de la carte, indépendante du texte, sur PC/mobile. Seconde : capsule horizontale centrée seule à une position stable. Dans les deux propositions le texte rejoint le dessous du filtre ; recherche, dé et menu gardent leur zone. Le globe est schématique, les boutons simulent seulement son échelle, les autres éléments servent de repères. Le réglage de texte du comparatif permet de montrer que les commandes restent ancrées. Il ne remplace pas le vrai moteur. Aucun contrôle intégré RTL, paysage ou téléphone physique ; prévoir le panneau de recherche, Réessayer et les attributions lors d’une éventuelle intégration. `#reset` retourne au Monde ; le recentrage de la fenêtre campus est une autre commande.

L’utilisateur signale entre-temps ne plus voir le corpus ajouté, puis constate deux liens avec et sans `content-preview`. Vérification des imports actifs : index et aperçu utilisent le même contrôleur et les mêmes234 entrées. Chrome isolé confirme au Monde78 projets/78 profils/78 chroniques, pages7/4/7 avec12/24/12 éléments par page ; la page7 des projets contient6 éléments. Paris affiche3 projets et une seule page. L’écart de son onglet réel n’est pas reproduit ni attribué avec certitude : ancienne page, autre URL ou filtres restent possibles. Aucun contenu, préférence utilisateur ni source fonctionnelle modifié par cette investigation.

L’utilisateur ne voit pas le comparatif dans la conversation. Un lecteur autonome `globe-control-placement/index.html` est donc ajouté le13 octobre ; le fragment `placements.html` reste conservé. Accès HTTP200 vérifié, réponse identique octet pour octet au rendu navigateur précédemment examiné. Aucun changement des pistes ni du prototype actif ; les réglages Tweak propres à la conversation ne sont pas disponibles dans ce lecteur, les boutons de zoom schématiques restent locaux.


### Suite du 13 octobre — Essais de commandes discrètes

À la demande suivante de l’utilisateur, trois interactions sont réalisées dans une [galerie distincte](../../studies/globe-gesture-studies/index.html) : gestes directs, halo et appui prolongé. Son rappel explicite d’accessibilité conduit à garder les gestes facultatifs, avec commandes par simples clics, quatre flèches, clavier et affichage permanent. Le vrai globe est copié avec ses dépendances et un stockage isolé ; aucune source fonctionnelle active n’est remplacée. [Réalisation, vérifications et limites](../../studies/globe-gesture-studies/NOTES.md). Les deux premiers placements restent consultables, aucune variante n’est encore choisie.


## 13 octobre — Retour au Monde dans le filtre et texte en dessous

**Origine :** après avoir refusé les trois essais et remis leur exploration à plus tard, l’utilisateur demande explicitement ce changement ciblé dans le site actif. Le bouton de retour doit être en haut et s’effacer au changement de menu pour laisser sa place au globe rétréci ; le texte doit rejoindre le dessous du filtre.

Dans `index.html` et `content-preview.html`, le bouton existant `#reset` quitte le groupe de zoom et devient un frère de `#scope-medallion` dans le filtre. L’ancre reste présente et mesure32px ; une cible44px est centrée dessus, sans bouton sous un ancêtre `aria-hidden`. Un espacement logique permanent de6px protège l’accès voisin au sélecteur, en LTR et RTL. Le routage masque uniquement le bouton hors Explorer ; les états de chargement peuvent réactiver son action sans le rendre visible dans une autre rubrique. Libellé accessible et infobulle suivent FR/EN/AR. L’action reste le retour au Monde, distinct du retour au niveau précédent et du recentrage de la fenêtre campus.

Le texte `#globe-hint` et l’éventuel `#campus-retry` se trouvent dans `#globe-status`,10px sous le filtre. Ce bloc est hors du flux : sa longueur ne déplace ni le filtre, ni l’ancre, ni les boutons de zoom. Il reste réservé à Explorer comme auparavant. Le texte peut revenir à la ligne ; Réessayer conserve une cible de44px. En hauteur≤520px, un fond discret empêche les libellés cartographiques de se superposer visuellement au texte. Zoom−/+ reste dans sa capsule existante en bas ; aucune commande par geste des essais rejetés n’est intégrée.

**Vérifications :**

- [28 cas ciblés](../checks/20261013-top-world-tests.json) passent : contexte de lecture11, filtres indépendants de la carte7, transitions10. Aucun nouveau test miroir ajouté pour le seul placement.
- [18 relevés Chrome](../checks/20261013-top-world/results.json) passent : bouton44×44px centré sur l’ancre32px, texte10px sous le filtre, zoom inchangé lorsque le texte s’allonge, masquage/non-focalisation dans Projets/Profils/Chroniques/Awards, mini-globe aligné à moins d’un pixel, restauration sur Explorer, retour au Monde par clic et Entrée, focus conservé. L’entrée principale via Visiteur et l’aperçu sont joués ;390×844,320×640 et667×390, arabe sombre au Monde/campus et animation ordinaire du raccord sont contrôlés.
- [Rendu final en paysage court](../checks/20261013-top-world/landscape-final.json), après ajout limité du fond de texte : géométrie, cible44px et absence de débordement ; [capture](../checks/20261013-top-world/landscape-final.png). Les autres18 observations concernent le code d’interaction inchangé ; leurs empreintes CSS précèdent uniquement cette dernière règle de lisibilité.
- [Six ressources HTTP](../checks/20261013-top-world-http.json) vérifiées identiques aux sources ; revue indépendante sans défaut bloquant. Deux erreurs du banc ont été corrigées (Entrée nécessitait son événement de caractère natif ; un nœud DOM sérialisé vide n’était pas une attente booléenne). Elles ne demandaient pas de changement à l’interface ; preuves intermédiaires conservées.

Captures ordinateur, mobile, paysage, arabe et mini-globe examinées. Pas de téléphone physique, lecteur d’écran réel, nouvelle validation des rues distantes ou audit complet d’accessibilité. Le chargement des rues peut rester en préparation dans la capture campus ; le contrôle porte sur le bouton, le statut et la navigation.

L’[ancien état autonome](../../archives/site-versions/pre-top-world-control-20261013/README.md) conserve137 fichiers et leurs dépendances, avec stockage distinct. Il a été rejoué : globe prêt, texte et trois boutons historiques en bas, aucune erreur JavaScript. Les premières études restent consultables séparément. Contrôleur `top-world-control-139`, aperçu106, dockCSS `world-return-4`, cadrage `top-globe-status-14`. Travail local **0.0.1 pré-alpha**, aucune publication ou nouvelle maquette Figma ; l’utilisateur a demandé ce placement, sans validation esthétique finale déduite.


## Suite du13 octobre — Palette, retrait du zoom et libellés

Les demandes suivantes remplacent la présence des zooms et les anciennes couleurs décrites dans l’étape ci-dessus. Les actions de connexion suivent le turquoise clair/rose sombre existant ; le retour au Monde est neutre, avec focus visible. Les boutons +/− et leur capsule Explorer sont retirés, sans changer le moteur ni le dé. Toutes les mentions du type « X de démonstration » disparaissent de l’interface FR/EN/AR, tandis que les données et interactions restent locales. [Périmètre, archive autonome, tests et preuves navigateur](ACTION_AND_COPY_NOTES.md). Les anciens états sont conservés.


## Suite du 13 octobre — Retour explicite à 139, avec les seuls retraits conservés

À la demande explicite de l’utilisateur, la passe 140 de la section précédente est remplacée : palette, dimensions, disposition et textes 139 sont restaurés, sauf les seules mentions explicites de démonstration dont le retrait est conservé. Les notices voisines de simulation et de profil fictif sont rétablies. Le retour au Monde conserve sa place en haut, son effacement hors Explorer et le texte sous le filtre, déjà demandés en 139 ; son style retrouve exactement 139. Seuls les boutons +/− d’Explorer, leur capsule vide et leur câblage restent retirés. Moteur, dé et commandes campus sont inchangés.

Toutes les feuilles de style sont identiques à 139 dans la [revue de 137 sources](../checks/20261013-explicit-scope-rollback/source-review.json) ; les [177 tests ciblés](../checks/20261013-explicit-scope-rollback-tests.json) passent. Les [24 relevés Chrome](../checks/20261013-explicit-scope-rollback/browser-results.json) et les [2 contrôles complémentaires du globe prêt](../checks/20261013-explicit-scope-rollback/globe-results.json) passent ; captures examinées, retour de 44 px, zooms absents et masquage hors Explorer confirmés. Le contrôle complémentaire remplace le constat de chargement du premier rendu Explorer, sans changement de source. Les [16 ressources HTTP et 153 références locales](../checks/20261013-explicit-scope-rollback/http-references.json) sont conformes. Chrome isolé, mouvements réduits, mobile émulé ; pas de téléphone physique ni de lecteur d’écran réel. La [passe 140 reste archivée](../../archives/site-versions/pre-explicit-scope-rollback-20261013/README.md), sans réécriture de son historique. [Périmètre strict, réalisation et preuves](ACTION_AND_COPY_NOTES.md) ; règle ajoutée à [AGENTS.md](../../AGENTS.md). Travail local 0.0.1 pré-alpha, sans nouveau commit, push, Figma ou publication.


## Suite du 13 octobre — Globe au centre exact

L’utilisateur demande d’ajuster de nouveau la position du globe « pour qu’il soit correctement centré », maintenant que des boutons du bas ont été retirés ; Codex l’interprète comme le centre exact de la fenêtre (précision du 15 octobre : cette lecture n’a pas été confirmée par l’utilisateur). Le décalage vertical en portrait compensait encore les anciennes commandes basses, désormais retirées. La correction de `globe-framing.css` supprime uniquement cette compensation dans la scène principale : centre **50 % de la largeur / 50 % de la hauteur**, rayon et dimensions conservés. Aucun décalage horizontal, taille de marqueur ou comportement du moteur n’est modifié. Le globe emprunté par une fenêtre campus garde son cadrage propre et retrouve le centre principal à sa fermeture.

La [synthèse de vérification](../checks/20261013-globe-recentering/summary.json) couvre **huit comparaisons** FR/AR, ordinateur/portrait/paysage, et **deux emprunts/retours de fenêtre campus**. Les dix cas passent, avec neuf captures examinées : centre à `(195,422)` en 390×844 et `(160,320)` en 320×640, rayon identique à l’état précédent, mini-globe correctement rejoint. Les rues distantes ne sont pas déclarées prêtes par ce contrôle de géométrie. Chrome isolé avec mouvements réduits et formats émulés ; pas de téléphone physique ni de lecteur d’écran.

L’ancienne feuille est conservée dans [le relevé avant correction](../checks/20261013-globe-recentering/globe-framing-before.css) et le [lecteur142](../../archives/site-versions/pre-cycling-entrance-20261013/README.md). Cache `recentered-15`. Le retour Monde conserve sa cible et utilise désormais uniquement une icône colorée, selon la précision de l’utilisateur ; [couleurs et arrivée](ACTION_AND_COPY_NOTES.md). Les essais de commandes refusés restent séparés.
