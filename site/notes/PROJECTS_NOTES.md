# Fiches projets à volets — 7 octobre 2026

**10 octobre 2026 :** ajout demandé de **Commentaires**, après Équipe, en FR/EN/AR et dans le sélecteur mobile. Saisie, brouillon, ajout et suppression sont des démonstrations locales. [Réalisation, archive et contrôles](COMMENTS_NOTES.md). Les quatre rubriques décrites dans les premières entrées sont l’état historique précédent.

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

L’état précédent79 des sources touchées est conservé dans `archives/site-versions/pre-project-sections-20261007/`, avec manifeste ; toutes les archives précédentes restent disponibles. Versions initiales : contrôleur `project-sections-80`, aperçu48, projet UI1/CSS1.

Syntaxe des modules welcome/project-ui vérifiée. Six fichiers de tests passent : volets projets, volets profils, données des profils/auteurs, découverte aléatoire, contexte de lecture et transitions. Les tests des nouveaux volets couvrent la normalisation des liens, les valeurs inconnues et la séparation des profondeurs d’historique Projet/Profil. Les contrôles visuels et d’interaction de la suite sont décrits ci-dessous ; les tests de logique seuls ne valent pas validation visuelle. Aucun report Figma, téléphone physique ni donnée réelle dans cette séquence.


## Contrôle navigateur et finition — 7 octobre 2026

Dans Chrome, les cartes de la rubrique Projets n’affichent plus Découvrir et leur titre ouvre toujours la fiche. Le projet d’un profil conserve lui aussi son lien de carte sans ce CTA. Les sources de cette étape79 sont conservées dans `archives/site-versions/pre-project-card-cta-removal-20261007/` ; le Journal garde son appel de lecture.

La fiche projet80 est examinée en1280×900 français clair : vignette et identité compactes à gauche, sommaire sous les actions, contenu à droite. Vue d’ensemble garde résumé et technologies ; Réalisation contient les deux paragraphes initiaux, et Médias signale explicitement l’illustration de démonstration. Équipe → Leïla → Retour au projet retrouve bien Équipe. Un départ depuis le profil de Leïla filtré sur minishell, puis plusieurs rubriques du projet et Retour au profil, restitue `tab=projects&project=minishell`.

Lien direct Médias rechargé, rendu320×640 FR clair puis AR sombre examinés. Aucun débordement horizontal relevé ; panneau mobile de180px, défilable et borné avant la capsule basse. La dernière rubrique Équipe est accessible avec flèche bas/Fin/Entrée ; ses auteurs sont traduits en arabe puis en anglais. Ajout/retrait d’un favori vérifié, état initial non favori rétabli. Dé joué depuis Réalisation : un autre projet s’ouvre, puis Retour aux projets quitte toute la visite vers la liste. Français clair et taille habituelle rétablis.

Revue indépendante de la cascade, routes, historique, focus, langues et nettoyage sans défaut concret. La préservation du Journal et du raccord campus est revue dans les sources ; aucun nouveau parcours de carte campus ou rendu des rues n’est revendiqué ici. Aucun test utilisateur comparatif, téléphone physique ni nouveau report Figma.


## Suite du 7 octobre — Défilement indépendant des colonnes

À la demande de l’utilisateur, les fiches ordinateur gardent désormais identité/sommaire et lecture dans deux régions de défilement indépendantes. La gauche reste en place quand la droite défile ; chaque colonne peut défiler selon son contenu. Mobile conserve son flux et le sélecteur actuel. Positions raccordées aux retours, aux rendus et au fondu du dock. [Réalisation, vérifications exactes, limites et archives](DETAIL_SCROLL_NOTES.md). Versions contrôleur83/aperçu51.


### Précision suivante — lecture naturelle, version84

L’utilisateur refuse le cadre de hauteur limitée autour de la lecture : la droite retrouve le défilement naturel du document. Seule l’identité/sommaire reste fixe et peut défiler indépendamment ; elle ne remonte pas en fin de page. L’historique reprend `window.scrollY` pour la lecture et conserve l’offset gauche. Mobile inchangé ; note de démonstration alignée à droite, fondu des fiches sans translation de leur parent. [État actuel, tests et archive de l’essai83](DETAIL_SCROLL_NOTES.md). Contrôles navigateur complémentaires centralisés par l’agent principal.


## 8 octobre 2026 — Exemple à cinq et équipes sans plafond d’affichage

L’utilisateur demande un projet et un article avec plus de deux auteurs, cite ft_transcendence à quatre ou cinq personnes et précise qu’Horizon ne doit pas limiter le nombre de collaborateurs. Un nouvel exemple fictif **ft_transcendence · Construire à cinq** (`ft-transcendence-building-together`) réunit Leïla, Noé, Inès, Haru et Luiza. Il est rattaché à Paris pour la découverte, avec une date de publication illustrative du 8 octobre 2026, des textes FR/EN/AR et l’illustration réseau de démonstration existante. Les autres projets sont conservés. Le filtre ft_transcendence rejoint Tronc commun, y compris dans les profils. Le corpus actif contient désormais cinq projets, deux articles et six profils.

Le modèle garde la liste complète des collaborateurs. La byline compacte montre les deux premiers puis un lien **+N** qui rejoint directement Équipe, avec un nom accessible annonçant le total. C’est un choix d’affichage proposé par l’assistant, pas une limite de collaboration. La rubrique Équipe affiche chaque personne et son lien de profil ; sans destination vers la liste complète, une byline compacte conserve elle aussi tous les auteurs. Le Journal partage ce rendu et utilise sa rubrique Auteurs. Les relations inverses ajoutent le projet dans chacun des cinq profils.

Les sources remplacées, tests, notes et dépendances UI sont conservés dans [pre-collective-authors-20261008](../../archives/site-versions/pre-collective-authors-20261008/manifest.json). Cette archive prend aussi en compte l’essai intermédiaire de l’article à deux auteurs ; son état initial à un auteur reste dans pre-compact-editorial-grids-20261008. L’étude de navigation antérieure utilise désormais le corpus archivé pour conserver ses huit exemples.

Vérification technique : les 41 fichiers de tests actifs Horizon passent, dont les relations auteur/projet/article, les contributions des profils, les filtres, les dates/favoris, la recherche et les bylines avec 0, 1, 2, 5, 7 et 50 personnes. Les cas compacts vérifient les liens et libellés FR/EN/AR, la conservation des tableaux et l’absence de personnes masquées sans accès complet. Paris retourne 5 résultats actifs, France 15. Une revue indépendante du composant, des données, des styles et du raccord de navigation ne relève aucun défaut concret ; les trois tests spécifiques aux bylines sont également rejoués. Les contrôles navigateur de l’intervention sont consignés séparément ; aucun résultat visuel n’est déduit des tests.

Versions : données éditoriales 2, données profils 8, UI profils 17/CSS 15, UI Projet 8, UI Journal 7, filtres 8/préférences 8, sections Profil 3. Le contrôleur et les entrées web sont versionnés avec l’intervention principale du 8 octobre. Il s’agit toujours de données de démonstration, sans gestion de collaborateurs côté serveur ni publication.


## Suite du 8 octobre 2026 — Identifier la personne responsable et la placer en premier

L’utilisateur demande d’indiquer la personne qui dirige chaque projet ou article, puis précise explicitement que le site doit la placer automatiquement en premier. Le champ optionnel **leadAuthorId** renseigne cette responsabilité. Il doit désigner une personne de la liste d’auteurs ; s’il manque ou ne correspond à personne, aucun rôle n’est inventé et l’ordre initial est conservé. La première personne n’est jamais considérée responsable par défaut, même dans un exemple à auteur unique.

Le rendu affiche désormais le responsable en premier dans les cartes et les rubriques complètes Équipe/Auteurs, suivi des autres collaborateurs dans leur ordre relatif. Le tableau source n’est pas modifié. Les cartes affichent le repère court **Responsable**, avec le libellé complet accessible et au survol ; les rubriques détaillées affichent **Responsable du projet** ou **Responsable de l’article**, en FR/EN/AR. Le résumé à deux auteurs et le +N conservent le compte exact et l’accès à toutes les personnes, sans plafond de collaboration. Cette précision utilisateur remplace l’ordre purement initial du premier essai collectif ci-dessus.

Les affectations sont des choix de démonstration de l’assistant : Leïla pour minishell, Inès pour le raycasting, Haru pour le serveur IRC, Caio pour le jardin d’idées et Luiza pour ft_transcendence ; Inès pour les deux articles. Luiza reste cinquième dans les données du projet collectif et Inès quatrième dans celles de l’article collectif, ce qui permet de constater le réordonnancement d’affichage. Il ne s’agit pas de responsabilités réelles de ces personnes fictives.

L’état collectif sans responsable est conservé dans [pre-author-responsibility-20261008](../../archives/site-versions/pre-author-responsibility-20261008/manifest.json), avec données, UI, styles, dépendances et tests. Les quatre fichiers de tests auteurs/données/sections Projet/Journal passent après ce changement, ainsi que la syntaxe et le contrôle de diff. Les tests couvrent la priorité d’un responsable au-delà des deux premières personnes, l’ordre relatif des autres, la non-mutation, les libellés des deux contextes en trois langues, les références absentes ou invalides et l’auteur unique. Les contrôles visuels sont consignés avec l’intervention principale. Versions : données éditoriales 3, UI profils 18/CSS 16, UI Projet 9, UI Journal 8 ; données profils 8, filtres 8 et sections Profil 3 inchangés.


## Suite du 8 octobre — Chef de projet

À la demande explicite de l’utilisateur, « Chef de projet » remplace le libellé français complet et le badge compact des projets. Équipe, cartes, titres de survol et noms accessibles utilisent le même terme. Le rôle des articles, les traductions EN/AR et l’ordre des personnes restent inchangés. [Sources avant renommage](../../archives/site-versions/pre-project-lead-label-20261008/README.md).

Trois fichiers de tests existants passent (auteurs, sections Projet, sections Journal), ainsi que le contrôle de diff. Chrome : badge entier en grille deux colonnes à 320 px, puis section Équipe de ft_transcendence avec Luiza en premier. Format habituel rétabli. Caches : contrôleur project-lead-label-100, aperçu68, UI profils22/Projet13/Journal12.


## Suite du 10 octobre — Contenu sans répétition du menu

À la demande de l’utilisateur, les noms de rubriques ne sont plus répétés visuellement dans la lecture à droite ; les noms accessibles et les sous-titres utiles restent présents. L’image principale des Chroniques apparaît aussi dans Article, Médias restant la galerie complète. [Réalisation commune, preuves et état intermédiaire conservé](DETAIL_CONTENT_NOTES.md).


## 11 octobre — Filtres, médias et discussion

Suite des demandes du10 : [Filtrer](CONTENT_CONTROLS_NOTES.md) rassemble Projets, Technologies et Savoir-faire ; [Vue d’ensemble et Réalisation](DETAIL_CONTENT_NOTES.md) accueillent les images et médias du récit. [Commentaires](COMMENTS_NOTES.md) comprend réponses, édition, emojis et réactions par pouces, sans publication réelle. Les vérifications et les derniers contrôles visuels empêchés par l’indisponibilité du navigateur sont détaillés dans ces notes.


## 11 octobre — Équipe dans Vue d’ensemble et Tester le projet

**Demandes explicites :** déplacer Équipe dans Vue d’ensemble et ajouter une rubrique pour tester le projet. À la question sur une démonstration intégrée ou un nouvel onglet, l’utilisateur demande **de voir les deux** ; aucune préférence finale n’est déduite.

Le menu Projet propose désormais **Vue d’ensemble / Réalisation / Médias / Tester le projet / Commentaires**, avec traductions EN/AR et même menu mobile. Vue d’ensemble contient un bloc Équipe complet, responsable couronné en premier, puis tous les collaborateurs liés à leur profil ; le cas sans auteur est explicite. Les Chroniques conservent leur rubrique Auteurs. Le +N des projets cible directement le bloc Équipe avec `focus=team` ; les anciens liens `tab=team` sont normalisés vers cette destination. Le retour navigateur restaure la position enregistrée, y compris0, au lieu de répéter ce déplacement. Le filtre géographique et la profondeur de retour gardent leurs règles.

**Étape historique, remplacée par le dépôt ci-dessous. Comparer les modes conservés :** ouvrir [l’aperçu archivé](../../archives/site-versions/pre-project-repository-link-20261011/preview.html). La rubrique présente le Pong d’essai intégré à la page, puis un lien ouvrant la même démo dans un nouvel onglet. Cet exemple sert à essayer les interfaces et ne représente pas l’exécution du projet fictif des auteurs. Les quatre autres projets n’ayant pas de version exécutable fournie, leur rubrique affiche « Pas encore de version testable ». Aucun déploiement externe ni hébergement de code utilisateur n’est ajouté.

[project-trial.mjs](../project-trial.mjs) monte une iframe limitée aux scripts, sans privilège d’origine, et un lien `noopener noreferrer`. Changement de rubrique : suppression de l’iframe et arrêt de son observateur. Les thèmes passent par message parent sans recharger la partie ; langue et thème initiaux viennent de la fiche. [Pong : sources, règles et16 contrôles simulés](../project-demos/pong/NOTES.md). Le jeu démarre sur action explicite, gère clavier/souris/tactile, pause et score ; quitter son terrain ou masquer la page le met en pause.

**Vérifications :** huit fichiers ciblés réussissent (rubriques Projet/Chroniques, médias/équipe, démo, routage Équipe, contexte géographique, données profils et recherche). Sept cas de démo couvrent états vides, URL/langues/thèmes, confinement, nettoyage et signal déjà annulé ; cinq cas du routeur couvrent liens anciens/+N/nouvelle rubrique/profils et restauration du défilement à0 ou220 sans resaut vers Équipe. Les deux nouveaux cas de rendu contrôlent l’équipe jusqu’à50 personnes et la séparation avec Auteurs des Chroniques. Revue indépendante suivie de la garde de cycle de vie et de la correction du retour au scroll0. Sept URL locales répondent HTTP200, six corps de réponse identiques aux sources. Syntaxe et empreintes des archives vérifiées. **Aucun rendu intégré, chargement réel de l’iframe ou jeu navigateur vérifié : CUA indisponible**, aucun téléphone physique.

[Neuf sources avant changement conservées](../../archives/site-versions/pre-project-overview-team-testing-20261011/README.md) ; les accroches corrigées dans la même passe sont consignées dans [DETAIL_CONTENT_NOTES.md](DETAIL_CONTENT_NOTES.md). Caches de cette étape : contrôleur `project-testing-122`, aperçu89, données6, ProfilUI28, ProjetUI31/CSS8, JournalUI30, trial1 et Pong1. Projet **0.0.1 pré-alpha**, sans commit, publication ni nouveau Figma.


## 11 octobre — Tester le projet depuis un dépôt

Après une question sur la complexité d’exécuter un cub3D avancé dans le navigateur, l’utilisateur décide que **Tester le projet** doit accueillir un lien de dépôt fourni par l’auteur, GitHub par exemple. Il choisit explicitement **de tester la saisie maintenant**, plutôt que de la réserver entièrement au futur formulaire de projet. Ce choix remplace les deux modes actifs du Pong ; aucune plateforme d’exécution ni conversion WebAssembly n’est demandée ou réalisée.

La rubrique conserve sa place et son nom dans le menu. Elle affiche **Dépôt du projet**, l’adresse, **Voir le dépôt** en nouvel onglet et les instructions facultatives. Sans lien valide, elle présente **Aucun dépôt renseigné**. Les cinq projets fictifs n’ont aucun dépôt inventé ; on peut ajouter un lien dans chacun d’eux. Le bouton **Ajouter un lien / Modifier le lien** ouvre un formulaire dans la page : URL, instructions, **Enregistrer / Annuler**, puis **Retirer le lien** pour une valeur existante. Le formulaire précise qu’il s’agit d’un essai auteur local.

Le modèle optionnel est `entry.repository = {url, instructions?}` ; les instructions initiales peuvent être une chaîne ou un objet FR/EN/AR. L’éditeur d’essai enregistre un texte libre commun, sans traduction automatique. L’URL doit être absolue HTTP/HTTPS avec hôte, sans identifiant ni mot de passe ; GitHub n’est pas une restriction de fournisseur. Les instructions sont du texte brut avec retours à la ligne, limité à5000 caractères dans la saisie proposée. Validation visible et accessible, liens `noopener noreferrer`, URL en LTR et texte libre suivant son propre sens.

Les valeurs enregistrées sont séparées par ID de projet dans sessionStorage (`horizon-project-repository-v1:`), avec repli en mémoire si ce stockage échoue. Le retrait explicite persiste pour ne pas faire réapparaître un lien initial. Le brouillon en mémoire survit aux changements de langue/rubrique ; Annuler le jette sans changer la valeur enregistrée. Ce mécanisme ne fournit **aucun compte, contrôle des droits auteur, publication partagée ou vérification du contenu du dépôt**. Le futur système de création/édition et son CMS restent à définir.

**Conservation :** [ancien comparatif autonome](../../archives/site-versions/pre-project-repository-link-20261011/preview.html), avec les sept sources originales, leur copie du jeu et les six raccords précédents ; [manifestes et accès](../../archives/site-versions/pre-project-repository-link-20261011/README.md). Le Pong indépendant original reste également présent. Les tests et preuves de l’ancien essai restent datés dans son archive.

**Accès actuel :** [Tester le projet](http://127.0.0.1:8765/site/content-preview.html?review=124#projects/ft-transcendence-building-together?tab=test). Caches : trial2, ProjetUI33/CSS10, JournalUI32, contrôleur `project-repository-124`, aperçu91. Prototype **0.0.1 pré-alpha**, sans nouveau Figma, commit ni publication.

**Vérifications de cette version :** les10 tests du dépôt passent (URL, saisie/erreurs/enregistrement, restauration après rechargement du module, séparation par projet, annulation/retrait, brouillons/langue, stockage indisponible, données invalides, texte littéral et cycle de vie). Les trois fichiers existants rubriques Projet/routage Équipe/médias passent aussi. Revue indépendante CSS/structure suivie de `dir=auto` pour les instructions ; retour du focus autorisé à ramener le champ à l’écran, avec marges de défilement pour les commandes fixes. Cinq syntaxes JS et15 empreintes d’archive valides. Quatre URL répondent HTTP200 (aperçu, module, CSS et archive), corps servis identiques aux fichiers locaux. **Aucun rendu visuel ou parcours navigateur réel vérifié**, CUA restant indisponible ; les interactions ont été jouées au DOM simulé.


## 12 octobre — Un projet partagé entre plusieurs campus

Après sa question sur les travaux d’étudiants de campus différents, l’utilisateur demande de commencer par mettre en place la proposition pour les **projets**. Le prototype conserve une seule publication, une équipe et un identifiant, associés à plusieurs campus. La distinction entre campus des auteurs et sujet éditorial des articles reste une proposition à discuter ; les règles d’éligibilité aux Awards ne sont pas déduites de ces associations.

Le champ explicite `campusIds` appartient au projet : il représente ses campus de réalisation/publication, sans recalcul depuis les profils actuels. Un changement ultérieur de campus d’un auteur ne déplace donc pas le projet. Ce premier raccord utilise des exemples statiques ; la saisie et la validation des associations dans le futur éditeur restent à réaliser, comme le reste de l’outil de publication différé. Le champ historique `campus` reste un repli pour les anciens projets sans tableau ; un tableau vide explicite ne reprend pas ce repli.

- **ft_transcendence** : Paris, Lyon, Tokyo et Rio, pour les cinq auteurs existants ; aucun campus prioritaire déduit de la cheffe de projet.
- **Un jardin de petites idées** : Rio et São Paulo, pour ses deux auteurs existants.
- Les trois autres projets restent associés à un seul campus. Le corpus reste à cinq projets.

Le même projet apparaît dans chaque campus associé et dans chaque pays concerné, **une seule fois** par liste, recherche ou tirage aléatoire. Le compteur, les filtres et le dé utilisent la même sélection. Les cartes, fiches et projets d’un profil présentent tous les campus. Une recherche géographique trouve le projet depuis chacun d’eux et ouvre le contexte correspondant ; pour un projet multicampus, une recherche par titre ou un lien vers ce projet depuis un profil garde le contexte compatible, sinon le Monde, sans imposer arbitrairement le premier campus. Les identifiants restent les mêmes : favoris, commentaires et lien de dépôt ne sont pas copiés par campus.

**Explorer un campus** ouvre un choix avec noms et pays localisés en FR/EN/AR ; choisir une ligne ouvre la fenêtre carte existante au-dessus du même projet, sans changer sa route ni son filtre. Campus unique : accès direct conservé. Échap, fermeture, focus de retour et nettoyage à la navigation sont gérés. Les noms de campus conservent leur sens d’écriture au sein de l’interface arabe.

**Vérifications :** 587 cas passent dans les56 fichiers actifs Horizon, archives exclues ; [résultats et empreintes](../checks/20261012-multi-campus-tests.json). Revue indépendante du modèle, recherche, routes, UI et styles ;162 références locales contrôlées sans manque. Chrome isolé : Monde5, France3 sans double ft_transcendence, Brésil2 sans double jardin, Tokyo2, Lyon2, São Paulo1 ; choix des quatre campus FR/EN/AR, Échap/focus, ouverture de Lyon depuis un filtre Tokyo avec retour à la même fiche. Favori et commentaire local retrouvés en passant de Tokyo à Rio. Recherche Tokyo et recherche par titre jouent les destinations attendues. Grille et fiche320px FR clair/AR sombre sans débordement horizontal ; captures examinées, dont les dialogues. [Scénarios navigateur](../checks/20261012-multi-campus-browser.py), [résultats](../checks/20261012-multi-campus-browser.json). Aucun téléphone physique, compte réel ni nouvelle vérification du rendu des rues distantes.

**Conservation :** [état précédent consultable](../../archives/site-versions/pre-multi-campus-projects-20261012/preview.html#projects), avec196 originaux inchangés vérifiés et un lecteur aux préférences isolées. Médias, fontes et bibliothèques partagés sont explicités dans son [README](../../archives/site-versions/pre-multi-campus-projects-20261012/README.md). Le défaut historique du dock est également conservé dans cet état ; sa correction active est décrite dans [DETAIL_SCROLL_NOTES.md](DETAIL_SCROLL_NOTES.md#12-octobre--le-menu-local-ne-masque-plus-le-menu-principal).

Caches actifs : contrôleur `multi-campus-projects-125`, aperçu92, données7, recherche-données8, géographie1, ProjetUI34/CSS11, ProfilUI30 et JournalUI33. Les deux entrées partagent ces sources. Prototype **0.0.1 pré-alpha**, travail local sans nouveau Figma, commit, push ou publication.

**Complément navigateur de la même passe :** l’entrée principale125 est jouée via Visiteur jusqu’au projet avec la préférence de mouvements réduits. Les deux premières tentatives avec l’animation ordinaire n’ont pas fourni de résultat concluant dans le délai du banc ; cette animation n’est donc pas revérifiée ici. Les cartes de projets du profil Leïla affichent les quatre campus et sont examinées sur ordinateur ; leur lien vers ft_transcendence garde le filtre Tokyo. Minishell conserve son bouton direct **Explorer42 Paris**, sans choix intermédiaire. [Scénarios](../checks/20261012-multi-campus-main-browser.py), [résultats](../checks/20261012-multi-campus-main-browser.json), [capture du profil](../checks/20261012-multi-campus-profile.png).
