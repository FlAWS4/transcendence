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
