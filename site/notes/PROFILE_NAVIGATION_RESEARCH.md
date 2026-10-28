# Navigation des fiches de profil — recherche du 7 octobre 2026

## Intention et état

L’utilisateur souhaite remplacer la longue fiche déroulante par plusieurs sections : présentation, projets, parcours et contributions au journal. Il précise son idée de menu : à l’ouverture d’un profil, « Profils » glisserait à gauche et de nouvelles entrées propres à la personne apparaîtraient à droite, par transformation animée du dock. Il demande ensuite une recherche professionnelle pour évaluer cette approche avant de la retenir.

**État de la recherche initiale : proposition étudiée, non intégrée et non validée.** Cette note ne décide ni du nombre final de sections ni du futur comportement du dock. La recherche elle-même ne modifie pas le site ou Figma ; les prototypes séparés demandés ensuite sont décrits en fin de note.

## Ce que recommandent les sources

- [Apple — Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) : la barre d’onglets représente les grandes sections de l’application. Apple recommande de la garder visible pendant la navigation et d’éviter des boutons présents dans certains contextes seulement, pour préserver la prévisibilité. L’exception mentionnée concerne une vue modale temporaire et autonome. Ces consignes visent les plateformes Apple ; elles constituent un repère, pas une interdiction universelle applicable à tout site.
- [Google — Layouts and navigation patterns](https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns) : les destinations principales appartiennent au même niveau de hiérarchie ; les onglets secondaires organisent les contenus voisins des vues enfants. Les associations familières facilitent la compréhension. Google ne traite pas explicitement la transformation imaginée ici.
- [Nielsen Norman Group — Tabs, Used Right](https://www.nngroup.com/articles/tabs-used-right/) : des onglets conviennent à quelques groupes de contenu clairement nommés. Leurs comportements doivent rester cohérents ; mélanger un accès qui quitte la page avec des onglets qui changent son contenu crée de l’incertitude. Les onglets internes doivent être visuellement distingués de la navigation entre pages. L’article recommande de placer les onglets internes au-dessus de leur panneau ; cette recommandation ne signifie pas que toute navigation mobile basse serait déconseillée.
- [Nielsen Norman Group — Local Navigation](https://www.nngroup.com/articles/local-navigation/) : la navigation globale demeure stable tandis que la navigation locale suit la catégorie consultée. Cette dernière doit rester repérable et clairement distincte de la première. Des tests cités montrent qu’une navigation locale trop dominante peut être prise pour l’ensemble des destinations disponibles.
- [Nielsen Norman Group — The Role of Animation and Motion in UX](https://www.nngroup.com/articles/animation-purpose-ux/) : une animation courte peut rendre visible un changement d’état ou de niveau, notamment par transformation ou déplacement. Elle complète les repères ; elle ne remplace pas une navigation visible et des libellés clairs.
- [Apple — Motion](https://developer.apple.com/design/human-interface-guidelines/motion) : le mouvement doit servir une intention, rester bref, pouvoir être réduit et ne pas être l’unique support d’une information essentielle. Il faut éviter de bloquer les interactions pendant son exécution.

Sources consultées le 7 octobre 2026. Synthèse paraphrasée ; aucune étude trouvée ici ne mesure directement ce concept dans Horizon.

## Interprétation pour Horizon

Diviser une fiche riche en sections paraît cohérent. Remplacer le dock global est une décision plus risquée : les accès Explorer, Projets et Journal cesseraient d’être immédiatement disponibles, et le même mot « Projets » pourrait désigner tous les projets puis seulement ceux de Leïla. Ce risque est une **inférence de conception**, pas un échec constaté sur le prototype.

L’option conventionnelle la plus prudente est de conserver le dock global et d’ajouter une navigation locale près de l’identité du profil, au-dessus du contenu. Cette solution demande de composer deux niveaux visuels, mais préserve leurs fonctions respectives.

Le menu transformé peut rester une piste à comparer. L’animation pourrait rendre la descente dans la hiérarchie compréhensible ; son état final doit toutefois fonctionner sans avoir vu ce mouvement, notamment après ouverture d’un lien direct.

## Conditions d’un éventuel prototype comparatif

1. Afficher explicitement le profil consulté et l’étendue de ses rubriques.
2. Traiter « ← Tous les profils » comme un retour distinct, séparé des onglets locaux ; ne pas le présenter comme une rubrique équivalente à Présentation ou Projets.
3. Prévoir un accès évident aux autres grandes sections, puis vérifier son coût réel d’utilisation.
4. Garder les sections locales stables d’un profil à l’autre, leurs libellés lisibles et la sélection identifiable sur petit écran et en arabe.
5. Préserver retour navigateur, lien direct, focus clavier et compréhension sans animation ; proposer un mouvement bref et réversible, compatible avec la réduction des mouvements.

Comparer les deux solutions sans expliquer leur mécanisme aux participants : ouvrir les projets de Leïla ; rejoindre ensuite tous les projets ; trouver son parcours ; retourner à l’annuaire puis à Explorer ; ouvrir directement une rubrique d’un profil. Observer erreurs de destination, hésitations, retours inutiles et compréhension du périmètre, en plus du temps et de la préférence esthétique. Aucun de ces tests utilisateurs n’a encore été réalisé.

## Suite du 7 octobre — Essais demandés et conservés

L’utilisateur demande explicitement de tester plusieurs options et de les répertorier dans les archives. Trois [prototypes interactifs séparés](../../studies/profile-navigation-studies/index.html) sont réalisés : Repères permanents (dock global + rubriques sous l’identité), Dock contextuel (transformation proposée par l’utilisateur + retour et Menu Horizon) et Double niveau (rubriques locales au-dessus du dock global). Ils partagent contenus fictifs, palette et matière, avec liens directs et retour navigateur.

Les contrôles techniques et visuels sont consignés dans les [notes des essais](../../studies/profile-navigation-studies/NOTES.md). Le [registre des archives](../../studies/research-archive/index.html) les relie aux explorations précédentes. Aucun choix de variante ni validation par des utilisateurs n’est déduit ; le dock du site actif reste inchangé par cette étude.


## Nouvelle suite du 7 octobre — Catégories et quatrième essai

L’utilisateur remplace les catégories locales par **Vue d’ensemble · Projets · Parcours · Contribution**. À propos, Compétences et Distinctions (42 Awards) structurent la première. Il précise ensuite qu’aucun des trois essais ne l’a convaincu et demande un quatrième. L’assistant propose **Sommaire latéral** : identité et rubriques à gauche sur ordinateur, sélecteur ancré sur mobile, navigation globale inchangée.

Cette proposition et les catégories sont réalisées dans les [quatre essais comparables](../../studies/profile-navigation-studies/index.html). La [première série intacte](../../studies/profile-navigation-studies/archive/initial-20261007/index.html) reste consultable. Les contrôles de rendu/interactions et leurs limites sont consignés dans les notes. Cela ne constitue ni une nouvelle étude professionnelle ni une conclusion d’utilisabilité ; aucun choix ou report sur le site actif n’est déduit.


## Choix explicite du 7 octobre — Sommaire latéral

L’utilisateur choisit finalement **l’essai04**, après avoir demandé de corriger la fidélité de la piste01 à sa vignette et d’ajouter aux projets d’un profil les mêmes filtres par type que la rubrique principale. Le quatrième agencement est donc retenu pour les fiches actives : sommaire latéral sur ordinateur, sélecteur compact ancré sur mobile, navigation globale conservée. L’intégration est suivie dans [PROFILES_NOTES.md](PROFILES_NOTES.md) ; les quatre pistes et leurs états antérieurs demeurent accessibles. Ce choix utilisateur ne change pas rétroactivement les constats de la recherche ni les limites des essais précédents.
