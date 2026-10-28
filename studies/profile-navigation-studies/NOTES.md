# Quatre navigations de profil — 7 octobre 2026

## Origine et statut

Après la [recherche UX](../../site/notes/PROFILE_NAVIGATION_RESEARCH.md), l’utilisateur demande explicitement de tester plusieurs options et de les répertorier dans les archives. Cette galerie reste une étude séparée. L’utilisateur choisit ensuite explicitement la quatrième piste, Sommaire latéral ; son intégration au site actif est suivie dans PROFILES_NOTES.md. Le dock général est conservé.

- [Galerie](index.html)
- [Registre des explorations](../research-archive/index.html)
- [01 — Repères permanents](demo.html?variant=1#profiles) : dock global conservé, rubriques locales sous l’identité du profil.
- [02 — Dock contextuel](demo.html?variant=2#profiles) : le bouton Profils rejoint la gauche et devient un retour ; les rubriques de la personne remplacent les autres destinations. Un accès Menu Horizon distinct permet de retrouver les rubriques globales.
- [03 — Double niveau](demo.html?variant=3#profiles) : dock global conservé et surface locale séparée au-dessus, avec contexte du profil.
- [04 — Sommaire latéral](demo.html?variant=4#profile/overview) : identité et rubriques à gauche sur ordinateur, sélecteur ancré sur mobile, dock global conservé.
- [Première série intacte](archive/initial-20261007/index.html) : état avant les nouvelles catégories et la quatrième piste, sources et dépendances locales comprises.

La deuxième variante reprend l’intention précise de l’utilisateur. Les première, troisième et quatrième sont des propositions de comparaison de l’assistant. L’utilisateur indique que les trois premières ne l’ont pas convaincu et demande un quatrième essai ; il choisit ensuite explicitement la quatrième piste. Ce choix ne constitue pas un résultat de test d’utilisabilité.

## Périmètre des essais

Les variantes partagent le même corpus fictif, la même identité visuelle et les mêmes destinations. Elles permettent d’ouvrir un profil, de choisir Vue d’ensemble/Projets/Parcours/Contribution, de revenir à l’annuaire et de rejoindre les rubriques globales. Les liens directs et le retour navigateur permettent de comparer aussi les situations où la transition n’a pas été vue. Explorer est un aperçu léger pour tester la navigation, pas une copie du globe MapLibre.

La barre de laboratoire est distincte de l’interface testée : sélection des variantes, retour à la galerie et thème. Les préférences du site principal ne sont pas modifiées. Les variantes sont prévues pour ordinateur et petit écran, avec prise en compte des mouvements réduits. Cette étude est en français ; elle ne constitue pas une intégration FR/EN/AR, une authentification ou un moteur de recherche.

La palette, Jost, les portraits et les données sont repris de l’état local du 7 octobre. Les dépendances utiles sont copiées dans ce dossier pour éviter qu’une modification ultérieure du site transforme silencieusement les essais archivés. Le manifeste liste les sources et leurs empreintes. Les études de navigation, de menus, de recherche, de verre et de déchiffrement précédentes restent accessibles et ne sont pas réécrites.

## Petit parcours comparatif

Dans chaque variante, partir de l’annuaire : ouvrir Leïla, puis ses projets ; rejoindre ensuite tous les projets du site ; retrouver son parcours ; revenir à Explorer. Refaire l’essai depuis un lien direct vers ses projets. Tester aussi le retour navigateur et le clavier.

Observer les erreurs de destination, hésitations et retours inutiles, et vérifier si la personne distingue toujours le contenu de Leïla de celui de tout Horizon. La préférence visuelle se recueille séparément. Les contrôles techniques de l’assistant ne sont pas des tests utilisateurs ; aucun résultat d’utilisabilité comparative n’est annoncé avant ces essais.

## Vérification technique de la première série (conservée dans l’archive)

Galerie examinée dans Chrome sur ordinateur clair et en320×640 sombre : les trois pistes sont lisibles, les liens de lancement et d’arrivée directe sont exposés ; aucun débordement horizontal sur le petit format relevé. L’index des archives est aussi examiné sur ordinateur et320×640. Le français et le thème clair sont rétablis.

Les trois compositions de profil sont examinées sur ordinateur en clair et à320×640 en sombre ; la deuxième est aussi examinée en clair sur petit écran et en sombre sur ordinateur. Les rubriques, le contexte et les commandes restent dans la largeur disponible (document305px pour viewport320px, avec scrollbar). Les menus locaux de la troisième piste occupent501–543px et le dock global560–620px dans la capture mobile : surfaces distinctes sans chevauchement entre elles. Les pages conservent une réserve de défilement en bas pour accéder à tout le contenu.

Parcours joués : annuaire→Leïla→Projets ; Menu Horizon→les quatre projets globaux→retour navigateur vers les projets de Leïla ; Présentation→Parcours→Journal (état vide honnête) dans la première piste ; projets locaux→projets globaux et retour dans la troisième. La sélection d’une autre piste conserve la personne et la section par lien direct. Entrée, rejeu et retour vers l’annuaire joués dans la deuxième piste ; aucun élément transitoire laissé après la fin du mouvement. La trajectoire intermédiaire n’a pas été mesurée image par image et aucun gain FPS n’est revendiqué.

Une revue source indépendante a relevé deux problèmes corrigés : le lien d’évitement changeait involontairement la route ; le rejeu pouvait écraser une navigation intervenue avant sa seconde frame. Les éléments transitoires respectent aussi les libellés masqués en mode compact. Le contrôle visuel repère Présentation tronqué dans le dock contextuel ordinateur : largeur jusqu’à620px et répartition selon les libellés corrigées. Les cinq libellés sont ensuite mesurés sans troncature, dont Présentation70px visibles pour70px de contenu. Hauteur60px et disposition compacte conservées. Version finale des styles/contrôleur de démonstration : **v2**.

Syntaxe des deux contrôleurs valide ;39 références HTML contrôlées, imports locaux et fichiers de police résolus. Pas de tests unitaires supplémentaires pour cette étude réversible. Clavier et mouvements réduits sont pris en charge dans le code et revus, mais aucune nouvelle session clavier complète ni préférence système de mouvement réduit forcée dans le navigateur. Pas de téléphone physique ni RTL. La galerie est laissée ouverte au format habituel, en français clair. Ces contrôles ne démontrent pas la supériorité d’une variante.

## Suite du 7 octobre — Catégories et quatrième piste

L’utilisateur fixe les catégories **Vue d’ensemble · Projets · Parcours · Contribution** et demande À propos, Compétences et Distinctions (42 Awards) dans la vue d’ensemble. « Compétence » étant cité deux fois, l’assistant conserve une seule section. Les quatre pistes partagent cette structure pour rester comparables. Les biographies et compétences viennent du corpus fictif existant. Aucune récompense n’est inventée : l’absence de donnée est explicitement affichée. Contribution rassemble pour l’instant les articles liés à la personne ; les autres formes éventuelles de contribution restent à préciser, sans les inventer.

L’utilisateur ne retient aucune des trois premières pistes et demande une quatrième. **Sommaire latéral** est la réponse proposée par l’assistant : une fiche à volets, avec identité et sommaire à gauche sur ordinateur et une rubrique ouverte à droite ; sur mobile, un sélecteur compact ouvre les rubriques dans un panneau ancré. Le dock global reste distinct. Cette étude n’est pas intégrée au site actif.

Avant toute modification, les 26 fichiers de la première série ont été copiés intégralement dans **profile-navigation-studies-initial-20261007**, au même niveau de dossier pour conserver les liens relatifs. La galerie et le registre des archives donnent accès à cet état. Les anciennes études des autres collections ne sont pas modifiées.

**Contrôles de cette suite :** quatrième fiche examinée à1280×900 dans les deux thèmes et à320×640 en clair et sombre. À1280px, les rectangles de l’identité, du sommaire, du contenu et du dock sont identiques après changement de thème. Aucun débordement horizontal relevé. Les trois anciennes compositions sont également examinées à320px sombre avec Vue d’ensemble sélectionnée : libellé entier, autres rubriques accessibles par leurs icônes. Le dock contextuel ordinateur est mesuré sans troncature des cinq libellés.

Le panneau mobile ouvert chevauchait d’abord le dock de quelques pixels. Correction de sa hauteur selon l’espace réellement disponible, recalculée à l’ouverture, au défilement et au redimensionnement ; une liste trop haute défile intérieurement. Contrôle après correction à320×640 : bord inférieur du panneau547,31px, haut du dock560px, soit12,69px d’écart. La dernière entrée Contribution est ouvrable. Choix Projets → contenu local ; Contribution → Journal global → retour navigateur ; annuaire → Inès → sa contribution joués. Leïla affiche un état vide honnête ; Inès affiche son article lié. Retour du focus au sélecteur après choix constaté.

La galerie à quatre pistes est examinée sur ordinateur et320px ; la première série archivée est ouverte jusqu’au profil avec son ancien menu Présentation/Projets/Parcours/Journal. Les25 empreintes du manifeste historique correspondent aux fichiers archivés. Revue source indépendante,71 références HTML locales vérifiées sans cible manquante, syntaxe du contrôleur valide. Les données et assets n’ont pas été modifiés. Versions de cette suite : demoCSS/JS **v4**, galerieCSS **v2** (contrôleur galerie inchangé).

Limites : pas de test utilisateur comparatif, téléphone physique, traduction RTL, mesure de cadence ni nouveau parcours clavier complet. La réduction des mouvements est prévue et revue dans le code, sans préférence système forcée. Aucun report Figma ni intégration au site actif. La quatrième piste reste une proposition à examiner.

## Conserver cette recherche

Ne pas supprimer cette galerie après le choix d’une variante. Une future intégration au site devra archiver l’état comparé et décrire le choix séparément. Fichiers d’entrée : index.html et demo.html ; styles/contrôleurs propres à l’étude, données et assets locaux. Aucun report Figma demandé ou réalisé dans cette séquence.


## Suite du 7 octobre — Piste 01 fidèle à sa vignette

L’utilisateur relève que le premier essai diffère de son image de présentation et demande de suivre cette dernière. L’écart est confirmé : la vignette présente une identité compacte avec portrait rond et des onglets textuels soulignés ; le prototype utilisait un grand portrait carré arrondi et une capsule à icônes.

La piste01 reprend maintenant le portrait rond96px sur ordinateur/72px sur petit écran, une identité plus compacte et les quatre libellés textuels sur une ligne fine, avec soulignement de la rubrique active. Onglets et contenu partagent une largeur maximale800px. Les informations récemment demandées et les blocs de la vue d’ensemble restent présents. Palette conservée, turquoise/rose selon thème. Les variantes02/03/04 gardent leur rendu.

Chrome : rendu1280×900 clair et320×640 sombre examinés ; onglets entièrement visibles, sans débordement horizontal, ouverture Projets et soulignement actif contrôlés. Revue source indépendante : surcharge CSS limitée à la piste01, liens/ARIA/focus/clavier existants conservés. Aucun nouveau test clavier complet ni téléphone physique. Avant modification, les26 fichiers sont conservés dans [l’état avant raccord à la vignette](archive/pre-underlined-tabs-20261007/demo.html?variant=1#profile/overview), lié depuis galerie et registre. Version de cette correction : demoCSS/JS v5. Aucun choix final ni intégration au site actif déduit.


## Décision du 7 octobre — Piste 04 retenue et filtres Projet

Après la correction de la vignette01, l’utilisateur demande les mêmes filtres Projet que dans la rubrique principale, puis choisit explicitement **l’essai04**. **Sommaire latéral** est désormais intégré aux fiches actives, en FR/EN/AR, avec le dock global conservé ; [réalisation et vérifications](../../site/notes/PROFILES_NOTES.md). Les quatre essais restent comparables et consultables.

Les projets de chaque personne disposent du filtre Projet : choix multiples, catégories repliables Tronc commun et Spécialisation, Tous qui réinitialise. À sa précision suivante, une case permet de sélectionner ou retirer tous les types d’une catégorie en conservant les autres choix ; elle devient partielle si seuls certains types sont cochés. Projets personnels est un choix direct sans volet. Le filtre s’applique après limitation à l’auteur : aucun projet d’une autre personne ne peut être ajouté aux résultats. Les choix des essais sont conservés séparément, par personne, dans la session de comparaison. Aucun bouton Affichage/Trier supplémentaire n’est ajouté aux fiches.

Le composant partagé est copié localement pour conserver l’étude ; son adaptation garde la destruction des écouteurs, le placement sous le sélecteur mobile et avant le dock. La hauteur des résultats est réservée pendant le choix pour éviter qu’une liste devenue vide ne déplace le panneau. Les modifications suivantes doivent préserver ces adaptations, et non écraser le module avec celui du site.

Chrome : sélection du tronc commun, état partiel après retrait de libft, choix personnel direct et état vide de Leïla examinés dans la piste04 en sombre, puis Tous/clair rétablis. Rendu du panneau ouvert devant l’état vide contrôlé. Sur le site actif, mêmes choix joués dans la rubrique générale et une fiche, dont 320×640 FR clair/AR sombre. La sélection collective, les retours profil/projet, les liens directs et les traductions sont détaillés dans les notes actives. Syntaxe des modules des essais contrôlée ; revue indépendante sans problème concret, 42 références locales sans cible manquante. Pas de téléphone physique, nouvelle matrice exhaustive des quatre pistes ou de Figma.

États autonomes conservés avec dépendances et manifestes : [avant les filtres](archive/pre-project-filters-20261007/index.html), puis [avant la sélection collective](archive/pre-group-selection-20261007/index.html), en plus de la première série et du rendu01 avant correction de vignette. Versions de cette étape : demoJS8/CSS6, filtres et contrôles JS/CSS8, galerieCSS2/JS1. Ce choix de direction explicite ne vaut pas validation de chaque ajustement ultérieur.


## Suite du 7 octobre — Libellé Rentrée

À la précision de l’utilisateur, **Rentrée** remplace les libellés d’arrivée dans les cartes, les identités de profil et la catégorie de filtre française. Les données fictives, la clé `arrivalYear`, les autres traductions et les quatre compositions sont conservées. Les sources précédentes et leur manifeste restent consultables dans [l’archive avant renommage](archive/pre-rentree-labels-20261007/manifest.json).

Versions raccordées : demoJS9, filtresJS9 ; demoCSS6, contrôlesJS/CSS8 et galerieCSS2/JS1 inchangés. Syntaxe des modules, imports locaux et empreintes contrôlés ; aucun nouveau contrôle navigateur propre aux quatre études pour cette correction de texte.
