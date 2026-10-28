# Profils, auteurs et filtres — 6 octobre 2026

## Décisions explicites

L’utilisateur accepte de remplacer Parcours par **Profils** pour mieux mettre en avant les étudiants et alumni, et demande les auteurs des projets, y compris tous les coauteurs. Il ajoute ensuite des filtres par projet et par statut, précise la définition de **Transcender : tronc commun terminé, spécialisation en cours**, puis demande la sélection multiple. « Tous les projets/profils » doit désélectionner les choix précis. Enfin, le filtre Projets doit comporter des catégories dépliables : Tronc commun et Spécialisation, complétées par les projets personnels déjà présents dans la maquette.

## Profils et relations intégrés

Six profils fictifs, avec portraits SVG illustrés locaux, présentation, campus, statut, spécialités, projets, parcours et contributions au journal. Les anciens récits sont conservés intégralement dans les profils de Leïla et Caio. Les anciennes URL de parcours ouvrent ces profils ; leurs favoris sont migrés et dédupliqués.

Les cartes et détails des projets montrent le portrait et le nom de chaque auteur, avec un lien indépendant vers son profil. Deux projets collectifs servent d’exemples. Le journal possède aussi une signature liée. La navigation profil → projet → coauteur et son retour conservent la page d’origine et sa position. Les liens auteurs et favoris ne sont pas imbriqués dans le lien du projet.

La recherche globale couvre les six profils, leurs présentations, leurs étapes et anciens récits ; les noms des auteurs retrouvent aussi leurs projets et articles. Le corpus actif comporte quatre projets, six profils et deux articles, en plus des campus/pays. Paris donne quatre résultats ; France quatorze, paginés. Leïla retrouve son profil, MiniShell et Noé, dont la présentation la cite.

## Filtres

- Projets : Tronc commun (libft, minishell, cub3d, so_long, Born2beroot, ft_irc), Spécialisation (ft_linear_regression), Projets personnels.
- Profils : Étudiants, Transcender, Alumni. Les exemples comprennent trois étudiants, Noé comme Transcender et deux alumni.
- Plusieurs choix se combinent par union dans un même filtre. Le résultat respecte aussi le pays/campus et les favoris.
- Tous réinitialise les choix précis ; décocher le dernier revient à Tous. Les sélections des deux rubriques sont mémorisées séparément dans ce navigateur.
- Un ancien réglage à choix unique migre vers une liste de choix. Les valeurs inconnues sont ignorées.
- Journal garde uniquement Affichage/Trier. Un filtre local ne restreint pas la recherche générale ni la lecture d’un résultat.
- Les types sans exemple restent des états vides honnêtes, avec accès à la réinitialisation. Aucun faux projet libft, so_long, Born2beroot ou ft_linear_regression n’a été ajouté.

Le menu garde le verre, les thèmes et les cœurs rouges. Les versions intermédiaires, ainsi que toutes les anciennes études, sont archivées.

## Fichiers et archives

Données/relations : profile-data.mjs et assets/profile-avatars/. Rendu : profile-ui.mjs et profiles.css. Catégories et sélection : content-filters.mjs, content-preferences.mjs et content-controls.mjs. Raccord : welcome.mjs, partagé par index.html et content-preview.html.

Archives de cette séquence : pre-profiles-20261006, pre-profiles-search-20261006, profiles-before-title-focus-20261006, profiles-before-transcender-20261006, pre-content-categories-20261006, pre-category-controls-20261006, pre-multiple-categories-20261006, pre-multiple-content-filters-20261006, pre-grouped-content-filters-20261006 et pre-grouped-categories-20261006. Les contrôles gardent également leurs propres états intermédiaires.

## Vérifications des profils

89 tests passaient lors de l’intégration initiale : données, migration des favoris, placement des menus, contexte de lecture, transitions et recherche. Rendus de structure FR/EN/AR contrôlés, sans liens interactifs imbriqués ni récit retiré. Navigation et historique relus séparément.

Chrome : grille/liste ordinateur, profil → projet collectif → second auteur → retour ; deux profils à Paris ; recherche Leïla et Paris ; ancien lien de parcours ; favori profil après rechargement puis retrait. Liste/profil en format390×844 ; projets, profil et contribution au journal en320×640 arabe sombre ; grille anglaise sombre. Aucun débordement horizontal sur les vues mesurées. Le titre reçoit le focus sans bordure de contrôle.

## Limites

Les personnes, portraits, biographies, dates et collaborations sont des exemples de conception, pas des étudiants réels. Aucun compte, éditeur de profil, service de favoris partagé, classement communautaire ou moteur IA ajouté. La recherche reste lexicale et structurée. Pas de téléphone physique, clavier virtuel, nouveau test du détail urbain ni report Figma dans cette séquence.

Les formats indiqués sont ceux de l’émulation ; la largeur de contenu peut être inférieure de10px à cause de la scrollbar. Le navigateur est remis à son format habituel après les vérifications.


## Vérification finale des catégories et versions actives

**108 tests automatisés passent**, sans échec ni test ignoré : filtres, profils, préférences/migrations, placement des menus, contexte de lecture, transitions et recherche. Syntaxe des contrôleurs vérifiée. Le composant des groupes est aussi contrôlé avec des scénarios DOM : groupes repliés, compteurs, sélection sans fermeture, réinitialisation, focus, langue et clavier.

Dans Chrome sur la page principale : Étudiants + Transcender → quatre profils, Tous → six avec les autres cases décochées ; Journal masque bien le filtre local. Projets : cub3d → un exemple, so_long → état vide et réinitialisation. Le Tronc commun se déplie sans sélectionner ; minishell + cub3d → deux contenus ; ft_linear_regression peut être ajouté depuis Spécialisation sans retirer les autres choix. Le groupe replié garde son compteur2 et la spécialisation son compteur1. Les trois choix sont restaurés après rechargement de l’aperçu. Tous revient aux quatre projets et remet les trois compteurs à0.

Rendus finalisés sur ordinateur clair et320×640 clair puis arabe sombre. Le panneau commence9px sous son bouton, reste dans la largeur disponible et défile avant le dock : bord inférieur497,67px, capsule à505,68px dans le contrôle mobile. Aucun débordement horizontal mesuré. Le clavier atteint les catégories et leurs choix ; le menu reste ouvert après cochage et après Tous. L’émulation est retirée, français/thème clair et filtres Tous rétablis ; la page principale charge la version courante.

Versions : welcome grouped-categories-67 ; aperçu35 ; contrôles module7/CSS8 ; filtres3 ; préférences5 ; profils données2/UI3/CSS2 ; recherche13/données4. Archives complémentaires : pre-grouped-category-controls-20261006 et les étapes de sélection simple/multiple, conservées à côté des précédentes.

Le contrôle avec un locator de l’outil pouvait faire défiler la page pour cibler une case, ce qui fermait normalement le panneau. La validation de sélection continue utilise le clavier réel de l’onglet ; aucune fermeture du menu après cochage n’y est observée. La protection des déplacements provoqués par le rendu est bornée à une seule frame.


## Suite du 7 octobre 2026 — Cadet et annuaire essentiel

### Décisions et réalisation

L’utilisateur demande de remplacer le statut étudiant par **Cadet**, puis de limiter les cartes de l’annuaire Profils à **la photo, le statut, le prénom et le nom, le pseudo Intra et le campus**. Ces éléments constituent désormais le contenu des cartes, en grille comme en liste. Spécialité, résumé, tags, projet mis en avant, texte d’appel à découvrir et cœur de favori sont retirés des cartes. Les fiches détaillées conservent leur présentation complète, leurs projets, leur parcours, leurs contributions et leur bouton de favori. Les portraits existants restent des illustrations de démonstration.

Les badges, filtres et descriptions courtes utilisent **Cadet** en français et en anglais, **كاديت** en arabe. La clé interne `student` reste conservée pour préserver les filtres et préférences enregistrées. Transcender et Alumni gardent leur sens et leur fonctionnement ; les statistiques générales d’effectif des campus ne changent pas de terminologie.

Les six profils reçoivent des pseudos fictifs : `lmansour`, `nlaurent`, `imorel`, `hmizuno`, `lcosta` et `cmendes`. Leur nature de démonstration est signalée ; aucun lien vers un compte Intra supposé n’est créé. La recherche lexicale prend désormais en compte le pseudo du profil et ceux des auteurs de chaque projet ou article.

L’utilisateur fournit ensuite les règles qu’il a déduites pour les pseudos : huit caractères au maximum, première lettre du prénom suivie du nom, espaces du nom remplacés par des tirets, puis ajout progressif de lettres du prénom en cas de collision. Pour les exemples, le nom est tronqué si nécessaire afin de respecter les huit caractères. **Ces règles proviennent de l’observation de l’utilisateur et ne sont pas vérifiées comme une règle officielle de l’Intra.** L’utilisateur confirme explicitement l’exemple Leïla Mansour → `lmansour`. Les vrais identifiants devront provenir de l’Intra. Aucun générateur de pseudos, authentification ou accès Intra n’est ajouté.

### Mise en page et vérifications

En liste mobile, une réserve sous le portrait contient le badge placé à l’extérieur de son cercle, même avec des cartes désormais plus courtes. L’espace auparavant réservé au cœur dans les métadonnées est retiré pour ces cartes. Les autres contenus et les fiches conservent leur agencement.

Contrôles Chrome effectués : Cadet filtre trois profils et Tous retrouve les six ; grille ordinateur et liste à 320 px examinées. Chaque badge reste dans les limites de sa carte, avec 24 px entre les cartes et sans débordement horizontal relevé. La fiche de Leïla conserve présentation, parcours, projets et favori. La recherche `lmansour` renvoie deux résultats, son profil et MiniShell.

Les quatre suites existantes `profile-data`, `content-filters`, `content-preferences` et `dock-search-data` passent ; syntaxe des modules modifiés contrôlée. Un contrôle des six pseudos confirme leur unicité, la composition initiale + nom et la limite de huit caractères. La page est rétablie sur les six profils en grille, français clair et format habituel de 1 920 px, sans débordement ; `@lmansour` est visible. Ces vérifications portent sur le prototype et les données fictives. Pas de contrôle sur téléphone physique ni de report Figma dans cette suite ; aucune acceptation esthétique finale déduite.

### Sources et continuité

États remplacés conservés dans `archive/pre-cadet-status-20261007/` et `archive/pre-essential-profiles-20261007/`, en plus de toutes les explorations précédentes. Les sections datées du 6 octobre ci-dessus décrivent les états historiques et leurs vérifications.

Versions de cette suite : contrôleur `essential-profiles-73`, aperçu 41, profils CSS 3/UI 5/données 4, filtres 4, préférences 6, données de recherche 5. La feuille responsive 5 reste inchangée.

## Suite du 7 octobre 2026 — Année d’arrivée et promotion

L’utilisateur ajoute l’année d’arrivée au campus et le numéro de promotion aux informations des profils. Il demande initialement les deux dans le filtre, puis retire explicitement la promotion de ce filtre. Les deux informations figurent dans les cartes Grille/Liste et dans l’en-tête de la fiche ; le menu **Profil** contient seulement les catégories dépliables **Statut** et **Année d’arrivée**, avec le même composant que les catégories de Projets.

Plusieurs statuts ou années se combinent par union dans leur catégorie ; les deux catégories se croisent. Par exemple, Cadet + 2024 ne garde que les Cadets arrivés en 2024. Tous les profils réinitialise tous les critères. Les années disponibles sont dérivées du corpus, présentées de la plus récente à la plus ancienne ; elles ne dépendent pas du campus sélectionné. Les anciens choix de statut restent compatibles avec les préférences enregistrées. Le dé utilise les mêmes candidats filtrés ; la recherche globale retrouve aussi les années et promotions comme informations textuelles, sans être restreinte par le filtre local.

Les six valeurs sont **illustratives**, sans accès à l’Intra ni validation de promotions réelles : Leïla et Noé 2024/promotion8, Inès 2022/6, Haru 2024/7, Luiza 2024/4, Caio 2022/3. Les années restent cohérentes avec les récits fictifs déjà présents. Libellés FR/EN/AR, nombres isolés dans les fiches RTL ; aucune palette modifiée.

Les cinq fichiers de tests content-filters, content-preferences, profile-data, dock-search-data et random-discovery passent. Les cas ajoutés couvrent groupes, années dérivées, cumul des catégories, choix multiples, Tous et restauration des préférences. Première inspection Chrome : les six cartes affichent leurs valeurs et le menu contient bien Statut/Année d’arrivée, sans catégorie Promotion. Les sources remplacées et tests antérieurs sont conservés dans `archive/pre-profile-cohorts-20261007/`.

Versions : contrôleur `profile-arrival-74`, aperçu42, profils données5/UI6/CSS4, filtres5/préférences7, recherche-données6. Contrôles génériques7 et responsive5 inchangés. Prototype uniquement ; pas de données réelles, téléphone physique ni report Figma.

La discussion suivante sur une fiche divisée en sections et un dock transformable reste une **proposition non intégrée**. Voir la [recherche sur la navigation contextuelle](PROFILE_NAVIGATION_RESEARCH.md) : intention utilisateur, recommandations professionnelles, avis de l’assistant et critères d’un éventuel essai.

### Vérification navigateur complémentaire — 7 octobre 2026

Dans un onglet temporaire de content-preview partageant le contrôleur74, les catégories Statut et Année d’arrivée sont dépliées au clavier. Sélection2024 → quatre profils ; ajout de Cadet → trois ; ajout de Transcender → quatre. Tous les profils retrouve les six et décoche les statuts comme l’année. Aucune catégorie Promotion n’est présente. Le menu reste ouvert pendant ces sélections.

La fiche de Leïla affiche bien Arrivée au campus2024 / Promotion8 ; son rendu ordinateur est examiné. Les cartes en grille puis en liste sont examinées en français clair à320×640 : informations lisibles, retour à la ligne naturel en liste, pas de débordement horizontal (document310px pour viewport320px ; blocs de faits194px dans la liste, sans dépassement). Le choix Grille et Tous sont rétablis, le format temporaire retiré puis l’onglet de contrôle fermé. Les autres onglets sont conservés.

Quelques ciblages par l’outil expiraient ou faisaient refermer le panneau ; la séquence au clavier a permis de vérifier les interactions ci-dessus. Ce contrôle ciblé n’est pas une nouvelle matrice RTL/thèmes, ni un test sur téléphone physique.

## Suite du 7 octobre 2026 — Intégration du sommaire latéral choisi

L’utilisateur choisit explicitement **l’essai 4, Sommaire latéral**, après les quatre prototypes conservés dans `../profile-navigation-studies/`. La fiche du site actif adopte ses quatre volets **Vue d’ensemble · Projets · Parcours · Contribution**. Sur ordinateur, identité et sommaire restent dans la colonne de début de lecture ; le contenu change dans la colonne voisine. En arabe la composition suit le sens RTL. À 840 px et en dessous, l’identité devient compacte et un sélecteur ouvre les rubriques dans un panneau ancré vers le bas. Le dock principal garde son rôle global. Le panneau respecte l’espace disponible avant la capsule de recherche et le dock, avec défilement interne si nécessaire.

La vue d’ensemble distingue À propos, Compétences et Distinctions (42 Awards). Les textes et compétences viennent des profils fictifs existants ; aucune récompense n’est inventée. Les projets, récits et contributions existants restent accessibles dans leur volet. Le favori du profil, ceux des projets, les liens auteurs et le bouton campus sont conservés. Aucun nouveau compteur, contenu, compte ou droit d’édition n’est ajouté.

Le volet Projets réutilise le **même composant de filtre Projet** que la rubrique globale : catégories repliables Tronc commun/Spécialisation et choix direct Projets personnels, choix multiples par union et Tous qui efface les critères. Il ne reçoit pas de boutons Affichage/Trier supplémentaires. Son corpus est d’abord limité aux projets de la personne ; sélectionner cub3d chez un auteur n’ayant que minishell produit un état vide honnête. Les choix de la fiche ne modifient pas le filtre général.

Les volets et filtres locaux sont partageables dans le fragment d’URL : par exemple `#people/profile-leila-mansour?tab=projects&project=minishell`. Le retour navigateur d’un projet restitue le volet et les choix de son profil d’origine. Les changements de volet font partie de l’historique, tandis que le bouton Retour quitte la visite complète du profil. Les anciens liens de parcours ouvrent maintenant le volet Parcours du profil correspondant ; un ancien paramètre `tab=journal` ouvre Contribution. La route globale Journal conserve son sens.

Le composant de contrôles accepte un préfixe d’identifiants et une liste de contrôles, avec ses valeurs par défaut inchangées pour les listes principales. Le sélecteur local dispose d’Échap, des flèches verticales, de Home/End et de la restitution du focus ; les animations respectent la réduction des mouvements. Les écouteurs de fiche sont retirés à chaque remplacement du rendu.

Les sources remplacées sont archivées dans `archive/pre-profile-sections-20261007/` avec manifeste de provenance. Les quatre études et leurs versions antérieures restent disponibles. Fichiers ajoutés : `profile-sections.mjs` pour la normalisation des volets/filtres et le retour de visite, ainsi que ses tests. Syntaxe de welcome, profile-ui et content-controls vérifiée ; neuf fichiers de tests passent (profils, sections, filtres, préférences, placement des menus, contexte de lecture, transitions, découverte et données de recherche). **Les contrôles visuels et d’interaction navigateur de cette intégration sont en cours au moment de cette entrée**, à compléter dans le bilan du projet ; ces tests de logique ne valent pas validation du rendu.

Versions initiales de l’intégration : contrôleur `profile-sections-77`, aperçu45, profils UI7/CSS6, contrôles8, sections1. Pas de modification de Figma ni de données réelles dans cette séquence.

### Vérification et précision des groupes de projets — 7 octobre 2026

Le contrôle navigateur de l’intégration confirme la fiche FR claire sur ordinateur : portrait108×108 et titre plafonné38px, après neutralisation des anciennes règles responsive de fiche. Le filtre local cub3d produit zéro projet chez Leïla ; ajouter minishell retrouve son projet en gardant le menu ouvert. Profil → projet → retour restaure le volet et ses critères ; le lien direct conserve les critères après rechargement. Retour aux profils quitte correctement la fiche après plusieurs volets. En320×640 arabe sombre, le sélecteur ouvert garde12px avant la capsule basse et aucun débordement horizontal n’est relevé ; Parcours arabe et traduction anglaise fonctionnent. Ces vérifications ont été effectuées par l’agent principal dans Chrome. Les actions Favori/Campus sont ensuite déplacées sur une rangée de toute la largeur sous l’identité mobile pour réduire la hauteur sans retirer d’information.

L’utilisateur demande ensuite de pouvoir sélectionner tous les projets d’une sous-catégorie et de rendre Projets personnels direct, sans sous-menu. Les groupes **Tronc commun** et **Spécialisation** reçoivent une première case **Tous les projets…**. Elle sélectionne ou retire les types de son groupe en conservant les autres choix, et annonce un état partiel (`mixed`) lorsqu’une partie seulement est cochée. **Projets personnels** devient une case directe sans chevron. Le choix global Tous les projets efface toujours tous les critères. Cette modification est partagée entre rubrique Projets et volet d’un profil ; Statut et Année d’arrivée ne reçoivent pas de nouvelle sélection collective.

Sources précédentes conservées dans `archive/pre-project-group-selection-20261007/`. Les tests ciblés passent pour la normalisation, les états partiels/complets, le retrait d’un groupe sans toucher aux autres, la remise à zéro, le choix personnel direct et la limitation aux projets de l’auteur. Les filtres, préférences et placements existants passent également ; syntaxe des contrôleurs vérifiée. La vérification navigateur des nouveaux choix collectifs reste à compléter au moment de cette entrée. Versions : contrôleur `profile-groups-78`, aperçu46, UI8/CSS7, filtres6, contrôles JS9/CSS12, sections2. Les études archivées sont mises à jour séparément par l’agent principal en préservant leurs états antérieurs.


### Contrôle final de la sélection collective — 7 octobre 2026

Chrome, version78 : dans la rubrique Projets, tout le tronc commun coche six types et affiche trois contenus ; retirer libft met la case collective à l’état partiel. Ajouter Projets personnels retrouve quatre contenus ; compléter puis retirer le groupe conserve le choix personnel et son unique contenu. Tous retrouve les quatre et décoche les critères. La case personnelle n’a ni chevron ni groupe enfant.

Dans la fiche de Leïla en320×640, le groupe complet conserve son seul projet ; Projets personnels donne zéro, avec le panneau toujours ouvert. Aucun contenu extérieur à l’auteur n’apparaît. Le panneau français clair est visible, défilable, borné avant la capsule basse. En arabe sombre, le choix collectif Spécialisation coche ft_linear_regression et sa valeur se retrouve dans le lien direct ; le panneau suit RTL. Les actions Favori/Campus partagent désormais une rangée pleine largeur sous l’identité mobile. Les essais séparés reçoivent le même comportement, avec leurs copies précédentes conservées.

Français clair, Tous et taille habituelle rétablis. Revue source indépendante sans problème concret et42 références locales des essais valides. Les tests ciblés décrits ci-dessus passent ; pas de nouveau parcours campus, téléphone physique, test utilisateur comparatif ou report Figma pour cette suite.


## Suite du 7 octobre — Annuaire en grille plus dense

L’utilisateur trouve les photos trop grandes et souhaite plus de profils par ligne. Le CSS de l’annuaire en grille reçoit des colonnes automatiques d’au moins180px et des espaces de20px : cinq cartes dans les1100px utiles de l’ordinateur, trois à768px ; deux colonnes sont conservées jusqu’à320px. Les portraits passent de166,4px mesurés sur ordinateur à88px maximum et64px minimum. Le statut reprend sa place dans le flux, avec8px sous l’avatar ; les noms utilisent une taille continue18–22px, les autres informations demandées restent présentes.

Le changement est limité à `data-section=people` avec `data-view=grid`. Liste, fiches, auteurs des projets, palette et portraits source ne sont pas modifiés. `auto-fill` évite d’agrandir de nouveau une carte lorsque peu de résultats restent. Sources précédentes dans [archive/pre-compact-profile-grid-20261007/manifest.json](archive/pre-compact-profile-grid-20261007/manifest.json), profilsCSS8 dans les deux entrées web.

Chrome : cinq colonnes204px en1920×1047, trois colonnes218px à768×900, deux colonnes128px à320×640. Rendus ordinateur clair et petit écran FR clair/AR sombre examinés ; aucun débordement horizontal ni collision portrait/statut, écart8px mesuré sur les six cartes. La liste arabe mobile conserve une colonne et son agencement. Revue de cascade indépendante sans défaut concret. Pas de nouveau test unitaire pour ces règles visuelles, ni téléphone physique ou report Figma.

## Suite du 7 octobre — Liste alignée sur la typographie de la Grille

L’utilisateur demande ensuite de réduire aussi la Liste et de se caler sur les dimensions du texte en Grille. La correction est limitée à l’annuaire `people` en vue `list` : même rampe18–22px pour les noms, pseudo13px, portraits64–88px. La colonne du portrait occupe88–104px ; le statut est placé dans le flux avec7px sous la photo et peut revenir à la ligne. Nom, pseudo, campus, statut, arrivée et promotion sont conservés. Grille, fiches, auteurs, listes Projets/Journal et palette restent inchangés.

Chrome à1920×1047 : nom22px et pseudo13px en Grille comme en Liste, avatar88px, première ligne136,33px de hauteur. À320×640 : nom18px, avatar64px, aucun débordement horizontal sur les six cartes. Rendus FR clair et AR sombre examinés ; tous les statuts restent sous le portrait, sans transformation RTL résiduelle ni chevauchement. Une revue indépendante confirme la portée et la priorité des règles face aux anciens styles responsive et RTL. Préférence Grille, français clair et taille habituelle rétablis.

Version profilsCSS9 dans les deux entrées, chargée avec contrôleur81/aperçu49. L’étatCSS8 est conservé dans [archive/pre-compact-profile-list-20261007/manifest.json](archive/pre-compact-profile-list-20261007/manifest.json). Aucun test unitaire ajouté pour cette correction CSS, ni téléphone physique ou nouveau report Figma.

## Suite du 7 octobre — Réseaux sociaux et liens des profils

L’utilisateur demande explicitement que les profils puissent afficher des liens vers GitHub, Facebook, X, Instagram, LinkedIn et d’autres réseaux. Le prototype actif reçoit un bloc **Réseaux et liens** dans **Vue d’ensemble**, après À propos. Les liens renseignés prennent la forme de boutons compacts avec nom du réseau et symbole de destination externe, adaptés au retour à la ligne. La palette et les autres rubriques sont conservées ; les cartes de l’annuaire restent limitées aux informations d’identité déjà choisies.

Chaque profil possède désormais un tableau optionnel `socialLinks`. Une entrée prend la forme `{platform, url, label?}` : `github`, `facebook`, `x`, `instagram` et `linkedin` ont un nom de réseau explicite ; `custom` et les clés inconnues utilisent le libellé fourni, sinon le domaine. Ce format peut accueillir un site personnel ou un autre réseau. Le rendu n’invente aucun compte à partir du pseudo Intra. **Aucune URL sociale n’ayant été fournie, les six profils fictifs conservent un tableau vide**, avec « Aucun lien renseigné » et une explication discrète dans le bloc. Les études de l’expérience connectée, réalisées séparément, explorent la future saisie ; aucun éditeur ou compte réel n’est ajouté au site actif dans cette correction.

Le normaliseur accepte seulement les URL web absolues `http`/`https`, sans identifiants intégrés, et retire les doublons. Les protocoles exécutables, contenus embarqués, chemins relatifs et valeurs invalides ne deviennent pas des liens. Les libellés restent du texte. Chaque destination s’ouvre dans un nouvel onglet, annoncé dans le nom accessible FR/EN/AR, avec `rel="noopener noreferrer"`. Les noms sont isolés avec `bdi` dans les interfaces RTL ; focus et réduction des mouvements sont pris en compte.

Six fichiers de tests passent : liens sociaux (quatre scénarios couvrant absence de données, URL rejetées, réseaux/personnalisation, libellés hostiles et traductions), données des profils, rubriques des profils/projets/articles et recherche. Syntaxe des modules et cohérence des imports versionnés vérifiées. Complément de l’agent principal : bloc Réseaux et liens vide examiné à320×640 en français clair, sans débordement ; ajout/enregistrement/aperçu d’un lien fictif contrôlé dans les études séparées. Pas de nouveau rendu de liens renseignés dans le catalogue actif, de téléphone physique ni de modification Figma.

Les neuf sources remplacées sont conservées avec leurs empreintes dans [archive/pre-profile-social-links-20261007/manifest.json](archive/pre-profile-social-links-20261007/manifest.json). Versions : contrôleur `profile-social-links-82`, aperçu50, profils données6/UI10/CSS10, ProjetUI3 et JournalUI2 pour suivre les imports. Accès de vérification : [fiche Leïla, Vue d’ensemble](content-preview.html#people/profile-leila-mansour). Les variantes de conception restent des propositions, sans acceptation esthétique déduite.


## Suite du 7 octobre — Défilement indépendant des colonnes

À la demande de l’utilisateur, les fiches ordinateur gardent désormais identité/sommaire et lecture dans deux régions de défilement indépendantes. La gauche reste en place quand la droite défile ; chaque colonne peut défiler selon son contenu. Mobile conserve son flux et le sélecteur actuel. Positions raccordées aux retours, aux rendus et au fondu du dock. [Réalisation, vérifications exactes, limites et archives](DETAIL_SCROLL_NOTES.md). Versions contrôleur83/aperçu51.


### Précision suivante — lecture naturelle, version84

L’utilisateur refuse le cadre de hauteur limitée autour de la lecture : la droite retrouve le défilement naturel du document. Seule l’identité/sommaire reste fixe et peut défiler indépendamment ; elle ne remonte pas en fin de page. L’historique reprend `window.scrollY` pour la lecture et conserve l’offset gauche. Mobile inchangé ; note de démonstration alignée à droite, fondu des fiches sans translation de leur parent. [État actuel, tests et archive de l’essai83](DETAIL_SCROLL_NOTES.md). Contrôles navigateur complémentaires centralisés par l’agent principal.

## Suite du 7 octobre — Rapprocher le nom de la photo

L’utilisateur demande de resserrer légèrement la photo et le nom pour remonter le reste de l’identité. La fiche Profil ordinateur perd les12px de marge supplémentaire au-dessus du nom : l’espace entre photo et nom passe ainsi de30px à18px dans la composition courante. Les espacements nom/pseudo/actions restent conservés, ainsi que l’annuaire, les autres fiches et la disposition mobile.

La revue de cascade révèle que les anciennes règles `#profile-detail` dominaient les mesures compactes du module de défilement. Le même fichier CSS raccorde désormais explicitement les deux densités à la fiche : portrait56/32px et nom25/18px seulement quand le contrôleur constate une hauteur insuffisante, avec interligne arabe conservé. Ces règles ne déclenchent pas elles-mêmes la densité et ne modifient aucun contenu.

[CSS12 avant remplacement](archive/pre-profile-identity-spacing-20261007/manifest.json) conservé avec empreinte. **ProfilsCSS13**, imports raccordés par l’agent principal. Vérification de portée et de priorité des sélecteurs effectuée ; rendu réel centralisé par l’agent principal, aucun nouveau navigateur ouvert ni test unitaire ajouté pour cet ajustement CSS.


## Suite du 7 octobre — À 42, actions et changements de campus

Demandes explicites successives : déplacer Campus/Rentrée/Promotion puis Statut dans Vue d’ensemble, placer Explorer avec le campus, écrire le statut comme les autres informations, raccourcir Favoris et ajouter Envoyer un message. Le bloc **À 42** reprend ces informations en liste de définitions ; le badge est conservé uniquement dans l’annuaire. Les actions Favoris et Message restent près du nom. « Rentrée » remplace le libellé français dans les fiches, cartes, filtre Profil, index de recherche et études courantes ; les clés internes, les biographies et les anciennes archives ne sont pas réécrites.

Le compositeur de message est un dialogue FR/EN/AR : destinataire explicite, texte requis après retrait des espaces, limite2000caractères, fermeture/annulation/Échap et retour du focus. Envoyer(démo) conserve seulement le dernier texte par personne dans la mémoire de cet onglet, sans réseau ni compte ; le rechargement le supprime. L’interface annonce cette limite. Le texte est inséré comme texte, jamais comme HTML. Le changement de fiche nettoie le dialogue et ses écouteurs. Les libellés accessibles du favori continuent d’annoncer Ajouter/Retirer malgré le texte visible court.

### Règles des campus retenues

L’assistant propose d’abord un campus actuel et un historique daté ; l’utilisateur précise que **la promotion appartient au campus de première rentrée**, puis accepte les changements dans Parcours. Il demande ensuite Campus actuel dans À42 seulement après un ou plusieurs changements, et précise la cible du bouton Explorer.

Le modèle optionnel `campusHistory` reçoit des entrées ordonnées `{campus, date?}`, de la première rentrée vers les suivantes. `campus` conserve le campus courant utilisé par l’annuaire et la découverte ; `arrivalYear` et `promotionNumber` décrivent la première rentrée. Le sélecteur `getProfileCampusContext` dérive origine, campus actuel, année et promotion. Les répétitions adjacentes ne créent pas un transfert ; A→B→A garde un historique de changements. Sans historique, le profil existant reste sur son campus unique.

À42 affiche Campus/Rentrée/Promotion d’origine, et ajoute Campus actuel seulement après un changement renseigné. Parcours reçoit alors « Historique des campus », avec première rentrée et changements ; les dates conservent leur précision année/mois/jour, les dates invalides ne sont pas inventées. Explorer cible l’origine sans changement et le campus actuel sinon. Le contrôleur transmet le bon identifiant à la fenêtre carte ; les noms sont résolus par le catalogue. Les projets gardent leur campus propre. **Aucun transfert n’a été ajouté aux six exemples.**

### Vérifications et sources

Chrome1920×991 : statut sans badge, quatre champs À42, Campus actuel absent pour Leïla sans transfert, espace photo–nom18px et bloc Explorer au bon endroit. Le bouton Explorer42Paris ouvre le dialogue42Paris, puis fermeture vers la même fiche. Dans l’annuaire, le filtre Profil affiche Statut et Rentrée. À320×640, largeur310px, Retour/identité statiques, aucune flèche ni conteneur latéral résiduel. Le compositeur mobile a été ouvert, rempli et envoyé localement puis fermé ; Favoris ajouté/retiré conserve le texte court. Le défilement et les petites hauteurs sont détaillés dans [DETAIL_SCROLL_NOTES.md](DETAIL_SCROLL_NOTES.md).

Les tests de campus couvrent absence de changement, plusieurs transferts et retourA, stabilité de promotion, dates, FR/EN/AR et destination Explorer. Les suites données, liens sociaux, rubriques, filtres et recherche passent ; revue indépendante du modèle et du raccord sans défaut concret. L’historique avec transfert est testé sur des données synthétiques, sans profil visible inventé. Pas de nouveau rendu RTL/sombre de cette suite active, de téléphone physique ou de report Figma.

États remplacés conservés dans les archives [campus déplacé](archive/pre-profile-campus-overview-20261007/manifest.json), [message](archive/pre-profile-message-action-20261007/manifest.json), [statut texte](archive/pre-profile-status-text-20261007/manifest.json), [libellés Rentrée](archive/pre-rentree-labels-20261007/manifest.json), [historique campus](archive/pre-campus-history-20261007/manifest.json) et [raccords finaux](archive/pre-profile-menu-raccords-20261007/manifest.json). Contrôleur87/aperçu55, profils données7/UI15/CSS13 ; défilement module3/CSS4, contrôles11, filtres7 et recherche-données7.


Finition suivante : les flèches du menu sont rentrées symétriquement et les numéros01/02/etc. sont retirés, à la demande de l’utilisateur. [Détails du menu sans numéros](LOCAL_MENU_NOTES.md) et [preuves des flèches](DETAIL_SCROLL_NOTES.md). Versions finales : contrôleur88/aperçu56, profils données7/UI16/CSS14, ProjetUI7/CSS2, JournalUI6, défilement module3/CSS5. Le filtre Profil/Rentrée a également été réexaminé au format habituel1920×991.


## 8 octobre 2026 — Relations avec les créations collectives

Le projet fictif ft_transcendence à cinq auteurs apparaît dans Projets pour Leïla, Noé, Inès, Haru et Luiza. L’article **Montrer ce qui n’est pas encore fini**, désormais attribué à Haru, Luiza, Caio et Inès, apparaît dans leurs Contributions. Aucune biographie, identité ou ancien parcours n’est réécrit. Les listes d’auteurs restent complètes dans le modèle et les fiches ; les cartes peuvent proposer deux noms puis +N vers la rubrique complète.

Les relations inverses, le filtre ft_transcendence et les liens directs sont couverts par les tests. Les détails de l’exemple, du rendu sans plafond, des archives et des vérifications sont dans [les notes Projets](PROJECTS_NOTES.md#8-octobre-2026--exemple-à-cinq-et-équipes-sans-plafond-daffichage).


## Suite du 10 octobre — Contenu sans répétition du menu

À la demande de l’utilisateur, les noms de rubriques ne sont plus répétés visuellement dans la lecture à droite ; les noms accessibles et les sous-titres utiles restent présents. L’image principale des Chroniques apparaît aussi dans Article, Médias restant la galerie complète. [Réalisation commune, preuves et état intermédiaire conservé](DETAIL_CONTENT_NOTES.md).


## 11 octobre — Favoris dans l’annuaire

L’utilisateur demande le bouton Favoris manquant dans le menu principal des Profils. Chaque carte reçoit le même bouton local que la fiche, comme frère du lien : activer le cœur ne navigue pas vers le profil. Les champs essentiels restent présents. Position logique haut-fin et réserve pour le texte en Liste, zone40px, styles RTL communs ; le filtrage et le tri des favoris réutilisent les préférences existantes. [CSS précédent conservé](archive/pre-profile-directory-favorites-20261010/README.md). Revue de raccord/CSS et tests préférences passés ; rendu et clic final non rejoués, accès navigateur indisponible lors de la reprise du11. Le cœur des favoris est distinct des nouveaux pouces des commentaires.

Le bouton Filtrer des projets d’un profil utilise aussi les trois facettes, avec sélection locale dans l’URL et limitée à ses créations. [Détails et limites](CONTENT_CONTROLS_NOTES.md).


## 11 octobre — Liens de profils et contexte géographique

L’utilisateur signale qu’ouvrir un profil depuis un projet change le filtre Pays/Campus, contrairement à l’ouverture depuis l’annuaire. La cause est le calcul de `relatedRoute`, qui remplaçait ce contexte par le campus de toute destination. Il conserve maintenant le pays et le campus actuels pour une destination de type profil. Le changement s’applique aux noms d’auteurs, aux noms/avatars des commentaires et aux mentions sélectionnées ; le profil reste consultable même s’il appartient à un autre campus. La rubrique, l’identité cible, les onglets locaux et le retour conservent leur fonctionnement. Les destinations projet/article et la recherche globale gardent leurs règles précédentes.

Les 3 tests de [profile-navigation-scope.test.mjs](tests/profile-navigation-scope.test.mjs) exécutent les fonctions actuelles : départ Monde, pays ou campus depuis Projet/Chroniques ; mêmes paramètres dans le lien ; clic simple et clics modifiés ; portée limitée aux profils. Ils passent, sans nouveau parcours navigateur disponible. [Source précédente archivée](archive/pre-profile-link-scope-20261011/README.md). Les [liens d’auteur et mentions](COMMENTS_NOTES.md#suite-du-11-octobre--auteurs-mentions-et-confirmations-discrètes) restent une démonstration locale, pas une connexion Intra.


## Suite du 11 octobre — Couronne et collaborateurs sur fenêtre très étroite

L’utilisateur remplace le tag Chef de projet / Responsable par une **couronne**. Le rendu partagé des auteurs utilise un SVG décoratif de20px (18px dans les aperçus), couleur d’accent existante. Le rôle précis reste dans le survol et le nom accessible du lien ; ordre, noms et responsabilité explicitement désignée sont conservés. Une personne non désignée ne reçoit pas de couronne.

Il précise ensuite que le deuxième collaborateur doit devenir **+1** quand la fenêtre est vraiment petite. À **360px ou moins**, un aperçu compact avec lien vers la liste complète ne garde que le premier auteur, puis un unique **+N** pour toutes les personnes restantes. Deux auteurs donnent +1, cinq donnent +4. Au-dessus, deux auteurs et le compteur habituel reviennent. Une personne seule n’a pas de compteur ; sans destination vers la liste complète, aucun auteur n’est masqué. Les rubriques Équipe/Auteurs restent intégrales, sans plafond de collaborateurs. Le responsable demeure premier lorsqu’il est renseigné.

Les7 cas de [author-byline.test.mjs](tests/author-byline.test.mjs) passent : tailles jusqu’à50, liens, traductions, responsabilité explicite, cas1/2/>2 et absence de destination complète. Revue indépendante sans défaut concret ; [couronne isolée](checks/author-crown-20261011.png) rendue avec Inkscape et examinée en clair/sombre aux deux tailles. Cela ne valide pas le rendu intégré ni le seuil responsive, le navigateur étant indisponible. Sources précédentes : [avant couronne](archive/pre-author-crown-20261011/README.md), [couronne avant aperçu étroit](archive/pre-narrow-author-preview-20261011/README.md). ProfilUI24/CSS20, contrôleur114/aperçu82 ; prototype local inchangé en0.0.1 pré-alpha.


## Suite du 11 octobre — +N avant le retour à la ligne

L’utilisateur précise que le compteur doit apparaître **avant que le deuxième collaborateur passe sur une deuxième ligne**. Le seuil de fenêtre de360px est remplacé par une mesure de la place réelle de chaque carte, en Grille comme en Liste. L’aperçu contient d’abord le premier auteur et +N ; après montage, le contrôleur montre deux auteurs seulement si leur largeur complète et le compteur habituel tiennent ensemble. La rangée ne revient plus à la ligne. Rétrécir, agrandir, changer de vue, de langue ou charger les polices met à jour cette décision. Les noms, la couronne, les liens et les listes complètes restent conservés.

[author-preview-fit.mjs](author-preview-fit.mjs) utilise une sonde invisible de0×0 avec contenu de largeur intrinsèque, dans le même contexte CSS. Elle est hors flux, masquée aux technologies d’assistance et non interactive ; son débordement est contenu. Un ResizeObserver partagé suit les rangées, le contrôleur se synchronise après tous les rendus et nettoie les sondes des cartes retirées. Le focus du deuxième auteur passe sur +N s’il disparaît ; à l’élargissement d’un duo, le focus de +1 revient au deuxième auteur. Une carte cachée attend une largeur exploitable.

Les7 cas de [author-preview-fit.test.mjs](tests/author-preview-fit.test.mjs) passent avec géométrie simulée : largeurs propres à chaque carte, compteur, variations de polices, focus, tolérance subpixel, remplacement et nettoyage. Les7 cas existants des auteurs et les tests des sections Projet/Chroniques passent également. Revue source indépendante effectuée ; **aucun rendu navigateur vérifié**, CUA étant indisponible. [Sources du seuil précédent conservées](archive/pre-measured-author-preview-20261011/README.md).

La même passe ajoute un bouton **Signaler** dans les actions de la fiche Profil ; [dialogue partagé et limites locales](CONTENT_REPORT_NOTES.md). ProfilUI26/CSS22, contrôleur `community-actions-116`/aperçu84.


## 11 octobre — Pays du campus et disposition des actions Profil

Deux demandes explicites : afficher le pays entre parenthèses à côté du campus dans la fiche, puis placer **Envoyer un message au-dessus de Favoris / Signaler**, Favoris à gauche en français/anglais. Réalisé dans la fiche active, avec ordre DOM et clavier Message → Favoris → Signaler ; la rangée suit le sens de lecture arabe. Le groupe peut revenir à la ligne si une largeur extrême l’exige, et conserve les dimensions communes Favoris/Signaler.

Dans Vue d’ensemble → À 42, Campus affiche par exemple **42 Paris (France)**. Campus actuel reçoit également le pays correspondant lorsqu’un transfert est renseigné. Le nom du pays vient du catalogue et suit FR/EN/AR ; aucun suffixe si le pays est inconnu. Les deux textes sont isolés pour le sens d’écriture. Campus d’origine, rentrée/promotion, Explorer, historique et filtre géographique gardent leurs règles. Le compositeur de message reste une démonstration locale.

Sources : `profile-ui.mjs`, `profiles.css`, raccord `welcome.mjs`. Les huit sources précédentes et leurs empreintes sont [conservées ici](archive/pre-profile-campus-actions-20261011/README.md). Imports renouvelés : ProfilUI27/CSS23, ProjetUI30, JournalUI29, contrôleur `profile-campus-actions-119`, aperçu87. Ces numéros sont des caches ; projet toujours en **0.0.1 pré-alpha**.

Vérifications : syntaxe des deux modules modifiés, deux fichiers de tests existants (`profile-campus-history` et `detail-media`) réussis. Contrôle DOM ponctuel dans les trois langues : pays d’origine/actuel pour Paris → Tokyo, pays inconnu omis, Explorer sans suffixe, ordre des trois actions. Revue indépendante du raccord et de la cascade responsive sans défaut concret. Aperçu119 HTTP200, imports HTML actuels et huit empreintes d’archive vérifiés. **Aucun rendu navigateur examiné** : CUA reste indisponible ; disposition réelle sur mobile et en arabe à confirmer visuellement. Aucun nouveau test permanent, Figma ou publication.


## 11 octobre — Couronne à droite du nom

L’utilisateur demande de placer la couronne à droite du nom. Le rendu partagé des auteurs regroupe désormais le nom puis sa couronne dans `.cp-author-name`, en ligne sans retour de l’icône sous le texte. Le rôle reste en dessous, hors de ce groupe, pour que sa longueur ne repousse pas la couronne loin du nom. Le groupe conserve cet ordre physique en arabe ; le nom garde `dir=auto`. Le nom peut se réduire et ses règles de troncature restent en place ; la couronne conserve ses dimensions et son libellé accessible.

Les sélecteurs des trois feuilles de style sont adaptés à cette structure, sans changer les polices ni les tailles. Le contrôleur de +N est inchangé : sa sonde copie le groupe complet, couronne et espacement compris. Les trois fichiers existants auteurs/mesure/médias passent (24 cas) après adaptation des assertions de structure ; revue indépendante sans défaut concret. Les onze sources et raccords précédents sont [archivés avec empreintes vérifiées](archive/pre-crown-beside-name-20261011/README.md).

Caches : ProfilUI29/CSS24, ProjetUI32/CSS9, JournalUI31, responsive8, contrôleur `crown-beside-name-123`, aperçu90. [Aperçu actualisé](http://127.0.0.1:8765/work/visualizations/horizon-welcome/content-preview.html?review=123#projects) HTTP200. **Le rendu intégré n’est pas vérifié** : nouvel essai CUA indisponible ; placement visuel et comportement aux largeurs extrêmes restent à examiner dans le navigateur. Aucun Figma, commit ou publication ; prototype en0.0.1 pré-alpha.
