# Fiches projets à volets — 7 octobre 2026

## Demande et périmètre

L’utilisateur demande d’appliquer aux fiches projets la même structure que la fiche profil choisie, en adaptant les rubriques. Le détail projet reprend donc le sommaire latéral, la lecture dans une seconde colonne et le sélecteur mobile ancré ; le dock principal garde ses destinations globales. Cette modification concerne seulement les détails de projets, pas le Journal ni l’agencement des profils.

Le découpage réalisé à partir du corpus existant est **Vue d’ensemble · Réalisation · Médias · Équipe**. Vue d’ensemble présente le résumé et les technologies/tags ; Réalisation conserve l’intégralité des paragraphes déjà écrits ; Médias montre l’illustration existante avec un libellé explicite de démonstration, sans la présenter comme une capture réelle ; Équipe rassemble les auteurs et coauteurs déjà reliés au projet, avec accès à leurs profils. Aucun média, dépôt, lien de démonstration, membre ou résultat de projet supplémentaire n’est inventé.

L’identité conserve la vignette, le titre, le campus, la date illustrative, le favori et l’accès à la carte du campus. Le titre de projet, plus long qu’un nom de personne, utilise une taille adaptée à la colonne. Les thèmes, tokens et langues FR/EN/AR sont conservés ; la composition suit le RTL en arabe. À 840 px et en dessous, les actions occupent toute la largeur sous l’identité et le sélecteur de rubrique ouvre son panneau vers le bas, dans l’espace disponible avant la recherche et le dock. Les mouvements réduits et le clavier sont pris en compte.

## Navigation

Les liens d’origine restent valables et ouvrent la vue d’ensemble. Chaque volet possède un lien direct, par exemple `#projects/minishell-under-the-prompt?tab=team`. Les valeurs reconnues sont overview, implementation, media et team ; une valeur inconnue revient à overview.

L’historique du navigateur retrace les changements de volet. Le bouton Retour quitte l’ensemble de la visite du projet vers sa véritable origine : liste, profil ou autre contenu. Le retour projet → auteur → profil → Retour au projet doit restituer le volet initial ; profil → projet → plusieurs volets → Retour au profil doit préserver le volet et les filtres de ce profil. Le dé garde ses remplacements successifs de projets sans perdre la profondeur de retour. Les filtres globaux, favoris et recherche ne changent pas de périmètre.

Le Journal continue d’utiliser son rendu d’article précédent. Le retrait du CTA Découvrir sur les cartes Projets réalisé juste avant est conservé ; leurs liens restent actifs.

## Sources et vérification

Nouveaux fichiers : `project-ui.mjs`, `projects.css`, `tests/project-sections.test.mjs`. Le raccord se fait dans `welcome.mjs`, les deux entrées HTML et `content-preview.mjs`. `profiles.css` reste en version8 sans modification dans cette intégration. Le composant auteurs et la règle de profondeur de retour existants sont réutilisés.

L’état précédent79 des sources touchées est conservé dans `archive/pre-project-sections-20261007/`, avec manifeste ; toutes les archives précédentes restent disponibles. Versions initiales : contrôleur `project-sections-80`, aperçu48, projet UI1/CSS1.

Syntaxe des modules welcome/project-ui vérifiée. Six fichiers de tests passent : volets projets, volets profils, données des profils/auteurs, découverte aléatoire, contexte de lecture et transitions. Les tests des nouveaux volets couvrent la normalisation des liens, les valeurs inconnues et la séparation des profondeurs d’historique Projet/Profil. Les contrôles visuels et d’interaction de la suite sont décrits ci-dessous ; les tests de logique seuls ne valent pas validation visuelle. Aucun report Figma, téléphone physique ni donnée réelle dans cette séquence.


## Contrôle navigateur et finition — 7 octobre 2026

Dans Chrome, les cartes de la rubrique Projets n’affichent plus Découvrir et leur titre ouvre toujours la fiche. Le projet d’un profil conserve lui aussi son lien de carte sans ce CTA. Les sources de cette étape79 sont conservées dans `archive/pre-project-card-cta-removal-20261007/` ; le Journal garde son appel de lecture.

La fiche projet80 est examinée en1280×900 français clair : vignette et identité compactes à gauche, sommaire sous les actions, contenu à droite. Vue d’ensemble garde résumé et technologies ; Réalisation contient les deux paragraphes initiaux, et Médias signale explicitement l’illustration de démonstration. Équipe → Leïla → Retour au projet retrouve bien Équipe. Un départ depuis le profil de Leïla filtré sur minishell, puis plusieurs rubriques du projet et Retour au profil, restitue `tab=projects&project=minishell`.

Lien direct Médias rechargé, rendu320×640 FR clair puis AR sombre examinés. Aucun débordement horizontal relevé ; panneau mobile de180px, défilable et borné avant la capsule basse. La dernière rubrique Équipe est accessible avec flèche bas/Fin/Entrée ; ses auteurs sont traduits en arabe puis en anglais. Ajout/retrait d’un favori vérifié, état initial non favori rétabli. Dé joué depuis Réalisation : un autre projet s’ouvre, puis Retour aux projets quitte toute la visite vers la liste. Français clair et taille habituelle rétablis.

Revue indépendante de la cascade, routes, historique, focus, langues et nettoyage sans défaut concret. La préservation du Journal et du raccord campus est revue dans les sources ; aucun nouveau parcours de carte campus ou rendu des rues n’est revendiqué ici. Aucun test utilisateur comparatif, téléphone physique ni nouveau report Figma.


## Suite du 7 octobre — Défilement indépendant des colonnes

À la demande de l’utilisateur, les fiches ordinateur gardent désormais identité/sommaire et lecture dans deux régions de défilement indépendantes. La gauche reste en place quand la droite défile ; chaque colonne peut défiler selon son contenu. Mobile conserve son flux et le sélecteur actuel. Positions raccordées aux retours, aux rendus et au fondu du dock. [Réalisation, vérifications exactes, limites et archives](DETAIL_SCROLL_NOTES.md). Versions contrôleur83/aperçu51.


### Précision suivante — lecture naturelle, version84

L’utilisateur refuse le cadre de hauteur limitée autour de la lecture : la droite retrouve le défilement naturel du document. Seule l’identité/sommaire reste fixe et peut défiler indépendamment ; elle ne remonte pas en fin de page. L’historique reprend `window.scrollY` pour la lecture et conserve l’offset gauche. Mobile inchangé ; note de démonstration alignée à droite, fondu des fiches sans translation de leur parent. [État actuel, tests et archive de l’essai83](DETAIL_SCROLL_NOTES.md). Contrôles navigateur complémentaires centralisés par l’agent principal.


## 8 octobre 2026 — Exemple à cinq et équipes sans plafond d’affichage

L’utilisateur demande un projet et un article avec plus de deux auteurs, cite ft_transcendence à quatre ou cinq personnes et précise qu’Horizon ne doit pas limiter le nombre de collaborateurs. Un nouvel exemple fictif **ft_transcendence · Construire à cinq** (`ft-transcendence-building-together`) réunit Leïla, Noé, Inès, Haru et Luiza. Il est rattaché à Paris pour la découverte, avec une date de publication illustrative du8 octobre2026, des textes FR/EN/AR et l’illustration réseau de démonstration existante. Les autres projets sont conservés. Le filtre ft_transcendence rejoint Tronc commun, y compris dans les profils. Le corpus actif contient désormais cinq projets, deux articles et six profils.

Le modèle garde la liste complète des collaborateurs. La byline compacte montre les deux premiers puis un lien **+N** qui rejoint directement Équipe, avec un nom accessible annonçant le total. C’est un choix d’affichage proposé par l’assistant, pas une limite de collaboration. La rubrique Équipe affiche chaque personne et son lien de profil ; sans destination vers la liste complète, une byline compacte conserve elle aussi tous les auteurs. Le Journal partage ce rendu et utilise sa rubrique Auteurs. Les relations inverses ajoutent le projet dans chacun des cinq profils.

Les sources remplacées, tests, notes et dépendances UI sont conservés dans [pre-collective-authors-20261008](archive/pre-collective-authors-20261008/manifest.json). Cette archive prend aussi en compte l’essai intermédiaire de l’article à deux auteurs ; son état initial à un auteur reste dans pre-compact-editorial-grids-20261008. L’étude de navigation antérieure utilise désormais le corpus archivé pour conserver ses huit exemples.

Vérification technique : les41 fichiers de tests actifs Horizon passent, dont les relations auteur/projet/article, les contributions des profils, les filtres, les dates/favoris, la recherche et les bylines avec0,1,2,5,7et50 personnes. Les cas compacts vérifient les liens et libellés FR/EN/AR, la conservation des tableaux et l’absence de personnes masquées sans accès complet. Paris retourne5 résultats actifs, France15. Une revue indépendante du composant, des données, des styles et du raccord de navigation ne relève aucun défaut concret ; les trois tests spécifiques aux bylines sont également rejoués. Les contrôles navigateur de l’intervention sont consignés séparément ; aucun résultat visuel n’est déduit des tests.

Versions : données éditoriales2, données profils8, UI profils17/CSS15, UI Projet8, UI Journal7, filtres8/préférences8, sections Profil3. Le contrôleur et les entrées web sont versionnés avec l’intervention principale du8 octobre. Il s’agit toujours de données de démonstration, sans gestion de collaborateurs côté serveur ni publication.
