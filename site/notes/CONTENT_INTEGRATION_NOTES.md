# Pages de contenu et visite campus — 28 septembre 2026

## Décisions et périmètre

Après la proposition séparée, l’utilisateur demande « Fais la suite du coups ». L’assistant annonce et réalise son intégration dans l’accueil principal. Cette poursuite ne vaut pas acceptation esthétique globale. L’utilisateur précise ensuite explicitement que **« Explorer le campus » doit ouvrir une popup de carte**, avec la même approche animée, en restant au niveau Campus ; aucun retour Pays/Monde dans cette fenêtre.

[index.html](../index.html) garde le scan initial, la connexion simulée et le raccord cercle → globe, puis sert les pages complètes Projets/Parcours/Journal. [content-preview.html](../content-preview.html) garde son accès direct aux mêmes pages, via le contrôleur partagé `welcome.mjs`. L’ancienne composition en petits panneaux est conservée dans [welcome-panels.html](../../archives/early-prototypes/welcome-panels/welcome-panels.html) et son contrôleur distinct.

Les huit contenus demeurent fictifs. Aucune API éditoriale, authentification réelle, publication ou nouvelle fonctionnalité de communauté n’est ajoutée.

## Navigation et entrée

La route initiale reste en attente pendant l’entrée : le monde est préparé et révélé avant d’appliquer un lien direct vers une page ou un campus. Le focus rejoint ensuite le titre de l’article. FR/EN/AR, RTL, thèmes et barre basse mobile sont conservés. Liste → détail → retour conserve recherche et position sans rechargement ; après rechargement d’un article, le bouton retour ouvre une nouvelle liste.

Un changement géographique depuis une lecture ramène au début de la liste, sans retirer le focus des sélecteurs. Les paramètres de campus/pays invalides sont normalisés dans l’URL. La couche des pages de contenu est ramenée sous l’en-tête et sous le filtre géographique : le menu de langue mobile et le filtre ordinateur restent cliquables sur toute leur surface.

## Carte en fenêtre

`campus-map-dialog.mjs` et son CSS créent un dialogue dédié. Le bouton de l’article est un vrai bouton `aria-haspopup=dialog`, sans modification de la route ni du filtre. La fenêtre possède nom/pays, fermeture, carte, zoom −/+, recentrage, aide sur le rayon et attributions. La fiche d’informations existante peut encore s’ouvrir au-dessus depuis le viseur ; la flèche hors champ recentre.

Le moteur expose `beginCampusPreview(id)` : capture de la caméra et du périmètre avant déplacement du conteneur, `start()` après montage, `restore()` après remise à sa place. **La même carte, le même canvas et les mêmes caches sont réutilisés.** Crédits et repères suivent le conteneur. La vue commence au-dessus de la ville à 12,5, rejoint 14,5 puis reprend l’approche existante jusqu’à 17,8. Les détails se préparent progressivement, sans bloquer le départ.

Le niveau Campus est verrouillé : pas de fil Monde/Pays, de bouton retour, de choix d’un autre campus ni de visite aléatoire ; Home ne remonte pas et Échap ferme le dialogue. Après l’approche, zoom 14,5–19 et déplacement du centre dans le rayon de 3 km, comme Explorer. Les limites de l’écran peuvent montrer au-delà de ce rayon. La visite ne modifie ni le campus choisi dans les contenus ni le candidat aléatoire global.

Fermer interrompt le trajet, restaure caméra, filtre et position de lecture et rend le focus au bouton d’origine. Si une animation d’Explorer était déjà en cours avant l’ouverture, la restitution termine sur sa destination légale plutôt que sur une position intermédiaire. Un redimensionnement peut adapter le cadrage et demander de nouvelles tuiles ; la réutilisation du canvas ne promet pas zéro rendu ou zéro téléchargement.

## Vérifications

- Syntaxe des modules valide ; 16 tests d’entrée et 8 nouveaux tests de session campus passent. Les 18 suites existantes et nouvelles passent lors du contrôle moteur.
- Chrome ordinateur : visiteur → globe → Projets → article ; un seul canvas, aucune erreur console sur les parcours contrôlés.
- Chrome mobile 390 × 844 : connexion simulée en arabe sombre depuis un lien direct Minishell/Paris ; premier instant du scan à 0, déchiffrement après 3,65 s logiques, slogan et raccord conservés, focus final sur le titre. Le trajet campus commence après l’ouverture du site, pas pendant le cercle.
- Article → carte principale : même centre Paris et zoom 17,8 ; compteur de demandes de rendu 4 avant/après, aucun resize supplémentaire sur ce retour.
- Popup FR ordinateur et AR sombre mobile examinées : vraie carte urbaine, un canvas, niveau Campus, contrôles dédiés, pas de débordement. Home conserve Campus ; clic viseur ouvre la fiche distincte ; Échap ferme la carte.
- Fermeture rapide pendant l’approche : route, filtre Monde, centre `[6,18]`, zoom `2.1003299548795553` et scroll `922.6666870117188` restitués au format testé. Aucun second contexte WebGL.
- Menu de langues sur contenu mobile : FR → EN → AR joué après correction de superposition ; textes et carte traduits, thème sombre conservé.

Pas de téléphone physique, de mesure FPS ni de réseau ralenti pendant cette intervention. Les tests simulés couvrent annulation, restitution d’un vol initial, mouvements réduits, dimensions et verrouillage ; ils ne remplacent pas l’essai sur les appareils de l’utilisateur.

### Reprise du 4 octobre

Les huit tests de session campus sont rejoués : huit réussites. Dans Chrome, la caméra de Paris est d’abord déplacée manuellement, puis le parcours Projets → Minishell → Explorer 42 Paris → fermeture est joué. Le centre `[2.3186021634360596,48.89668527500001]` et le zoom `17.8` sont strictement identiques après fermeture ; le scroll revient à `922.6666870117188`, le focus à `detail-campus`, la carte sous `main`, avec un seul canvas et `inFlight:false`. L’URL et le contexte France/Paris restent ceux de l’article.

Le rendu urbain complet n’est pas revérifié dans cette session : le navigateur reçoit `Failed to fetch` pour les données distantes. L’endpoint public OpenFreeMap répond néanmoins HTTP 200 depuis l’hôte ; aucune panne générale du fournisseur n’est déduite et son URL n’est pas modifiée. Les contrôles visuels du 28 septembre restent distincts de cette vérification de restitution. Le lecteur Figma affiche également `ERR_CONNECTION_TIMED_OUT` le 4 octobre ; le nouveau parcours prototype n’a donc pas été rejoué dans ce navigateur.

## Versions et Figma

Contrôleur actif `campus-overlay-37`, moteur v29, dialogue campus v1, pages CSS v4, entrée `visible-scan-5` inchangée. Report Figma et limites dans [content-preview-handoff.md](../../figma/explorations-2026-09/content-preview-handoff.md) et [content-preview-state.json](../../figma/explorations-2026-09/content-preview-state.json).

Fenêtres Figma finales : ordinateur `357:4920` et mobile `357:4968`, ouvertes depuis les deux détails Minishell. Deux rendus examinés le 4 octobre ; fondus corrigés, actions OVERLAY/CLOSE auditées, anciennes compositions conservées. Le fond Paris est une capture statique réelle, recadrée sur mobile ; les commandes de carte y sont illustratives. Huit pages de contenu, deux fenêtres de visite, 71 cadres au total sur la piste. Fichiers temporaires de capture retirés.


## Corrections du 4 octobre — caméra, projection et thèmes

Le zoom manuel Campus suit désormais la même relation que l’approche : 0° à 14,5, progression linéaire jusqu’à 34° à 17,8, puis plafond 34°. Le précédent minimum avec l’angle courant ne pouvait que réduire l’inclinaison, sans la réaugmenter. Les trajets et le recul gardent leur chronologie.

Les repères passent de l’événement move à render, après la mise à jour réelle de la projection par MapLibre 5.24. La restauration par jumpTo pouvait sinon les projeter avec la transformation Mercator du campus précédent, avant le redraw du globe. Les deux événements ne sont pas cumulés. Deux régressions reproduisent cet ordre exact, sans événement projectiontransition, avec et sans redimensionnement : ancienne version en échec, correction réussie.

La règle claire .content-sheet h1 imposait letter-spacing: -.035em avec une spécificité supérieure aux titres des pages, contre -.055em en sombre. Elle est retirée : même métrique des titres dans les deux thèmes, règle arabe sans espacement conservée. Les écarts similaires de marque, filtre et libellé de périmètre deviennent également communs aux thèmes. Aucun changement de contenu.

Liens : l’utilisateur confirme finalement leur bon fonctionnement. Aucun changement fonctionnel ; quatre nouveaux tests jouent le vrai clic de marqueur et la fiche dans Explorer et la fenêtre, avec FR/EN/AR, replis, 1337 et l’indication du menu de Luanda.

Vérifications : **222 tests passent dans 21 fichiers**, dont 6 nouveaux cas caméra, 2 régressions de projection, 4 cas de fiche et les 8 tests existants de session campus. La cascade CSS est contrôlée : aucune règle de thème ne modifie les métriques typographiques. Versions des deux entrées actives : contrôleur campus-camera-38, moteur v30, welcome.css theme-metrics-23.

L’utilisateur signale encore le décalage pendant l’intervention, puis **confirme sa disparition après actualisation complète et rejeu Projets → fenêtre campus → fermeture → Explorer**. Cela confirme cette correction uniquement. Chrome de contrôle reste inaccessible : aucun nouveau rendu visuel des titres, capture ou geste réel de zoom/pincement n’est revendiqué par l’assistant. Les simulations ne remplacent pas l’essai sur les appareils de l’utilisateur. Aucun changement Figma ni publication.


### Complément du 4 octobre — défaut de thème reproduit puis vérifié dans Chrome

L’utilisateur voit encore une différence après le premier bilan. Un nouvel onglet charge effectivement l’ancienne feuille welcome.css?v=scope-selectors-22, avec la surcharge claire supprimée sur disque. Sur le parcours path-learning-to-ask, à innerWidth 1294 px / clientWidth 1279 px : clair letter-spacing -2.05919 px et titre sur deux lignes (hauteur 125.8958 px), sombre -3.23587 px et une ligne (62.9479 px).

Le premier rechargement échoue avec connexion locale refusée ; le serveur de développement est relancé sur 127.0.0.1:8765. Les deux entrées actives référencent désormais welcome.css?v=theme-metrics-24, après la fin effective des corrections. Le rechargement confirme cette URL et l’absence de la surcharge claire dans la CSS interprétée.

Clair → sombre → clair joué : sept éléments comparés, avec stricte égalité des styles typographiques, boîtes et rectangles de texte : titre, résumé, métadonnées, illustration, article, marque et filtre. Titre : boîte 880 × 62.9479 px ; texte sur une ligne de 861.2605 px, espacement -3.23587 px dans les deux thèmes. Largeur utile et scroll identiques. Captures claire et sombre examinées, page vérifiée laissée ouverte. Aucun autre changement typographique nécessaire, aucune nouvelle suite moteur lancée pour ce renouvellement de version et aucun nouveau contrôle mobile. Cette vérification complète la limite navigateur du premier contrôle ; elle ne réécrit pas les observations précédentes.


## 4 octobre 2026 — Agencement par dock commun

Après comparaison de trois études conservées, l’utilisateur choisit la première et demande uniquement le changement d’agencement, avec couleurs et style existants. Le menu latéral décrit plus haut est remplacé dans les deux entrées actives par le dock bas commun aux formats ; globe centré puis médaillon de contexte. Lecture, routes et visite campus restent partagées. Voir [DOCK_NAVIGATION_NOTES.md](DOCK_NAVIGATION_NOTES.md) pour la réalisation, les 38 tests et les contrôles Chrome. Les états précédents restent historiques.
