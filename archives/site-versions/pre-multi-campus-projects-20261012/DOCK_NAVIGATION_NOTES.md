# Navigation par dock — 4 octobre 2026

## Décision et périmètre

Après trois [études séparées](../navigation-studies/index.html), l’utilisateur choisit explicitement la première : barre flottante basse commune aux formats, globe centré dans Explorer puis médaillon de contexte lors de la lecture. Il demande aussi de mettre à jour les visuels Figma.

Deux précisions explicites encadrent le travail : **garder les trois pistes comme archives du parcours de réflexion** et **modifier seulement l’agencement, sans changer couleurs ou style**. Les études restent donc intactes ; leurs différences graphiques ne sont pas reprises dans le site.

## Intégration web

L’[accueil principal](index.html) et le [raccourci de lecture](content-preview.html) portent data-navigation="dock". Les archives antérieures n’ont pas cet attribut et conservent leur disposition.

- Barre basse de 510 × 78 px au maximum, centrée ; largeur disponible sur mobile, même rectangle dans Explorer, les listes et les articles.
- Composant visuel repris du dock mobile existant : couleurs, ombres, icônes et libellés compacts. Typographies des contenus, couleurs des thèmes, globe et illustrations conservés.
- Globe centré horizontalement ; filtre au-dessus. Contenu centré, largeur maximale 1240 px, marges mobiles existantes.
- La même scène MapLibre devient un médaillon de 32 px dans le chemin géographique. Au niveau Pays/Campus, il montre une découpe de la vue conservée.
- Réduction par translation/échelle et découpe CSS ; les dimensions logiques du canvas ne changent pas en changeant de rubrique. Aucun reset de caméra ni nouvelle sélection n’est ajouté.
- La scène reste dans le document et suit le filtre au défilement. Quand le dialogue campus emprunte cette scène, les règles du dock cessent de s’appliquer ; fermeture et retour réutilisent la restauration existante.
- FR/EN/AR, RTL, filtres liés, recherche éditoriale, lecture, liens directs et entrée restent dans leur contrôleur partagé. Mouvement réduit désactive les transitions.

Fichiers : règles de disposition ajoutées à content-preview.css ; dock-navigation.css et dock-navigation.mjs pour le médaillon ; raccords limités dans welcome.mjs et les deux HTML actifs. welcome.css, styles/couleurs du moteur et données ne sont pas modifiés par cette intégration. Le moteur reste v30.

Versions chargées : welcome.mjs **dock-navigation-40**, content-preview.css **dock-5**, dock-navigation.mjs **v2**, dock-navigation.css **v1**, raccourci content-preview.mjs **v7**. welcome.css reste **theme-metrics-24**.

## Vérifications web

Dans Chrome :

- 1440 × 960 : Explorer → Projets → article → retour ; géométrie du dock et dimensions logiques de la scène identiques entre rubriques. Médaillon aligné à son emplacement.
- Projet → visite Paris en sombre : rues et bâtiments visibles, un seul canvas, aucune transformation/découpe du dock dans la fenêtre. Fermeture → Explorer : positions des repères visibles rétablies. Le Japon, caché derrière le globe, n’est pas utilisé comme preuve de position visible.
- Mobile 390 × 844, arabe sombre : dock RTL, Explorer → Parcours, médaillon, filtre Paris et retour à la carte joués. Menu et dimensions de scène stables ; aucun débordement horizontal.
- Paysage 667 × 390 : carte campus, filtre et commandes examinés, sans débordement.
- Accueil principal : entrée visiteur → globe → lien direct vers « Apprendre à poser la bonne question », focus sur le titre puis retour Explorer.
- Pour ce titre sur la version finale rechargée, clair/sombre conservent exactement x, y, largeur et hauteur. Le titre de Minishell a aussi été contrôlé. Aucun changement de métrique typographique n’est ajouté pour le dock.
- Relevés calculés du fond, de la marque et des commandes comparés aux styles précédents : valeurs de couleur et typographie conservées. Les fonds et textes des cartes continuent à utiliser leurs styles existants.
- Aucune erreur ni alerte console relevée lors des parcours contrôlés.

**38 tests existants passent** : 14 de redimensionnement, 8 de session campus et 16 d’entrée. Ils vérifient les contrats du moteur ; les transitions CSS sont vérifiées dans le navigateur. Syntaxe du contrôleur et du nouveau module vérifiée.

Le navigateur a d’abord réutilisé un ancien HTML de l’accueil principal. Après rechargement, les URL de styles/scripts et data-navigation="dock" ont été contrôlés avant les vérifications finales. Si un onglet montre encore le menu latéral, effectuer une actualisation complète.

Pas de test sur téléphone physique, de mesure FPS ni de test forcé de préférence de mouvements réduits. Aucun gain de performance chiffré revendiqué.

## Figma et archives

Le report Figma est terminé : 8 accueils, 8 pages de contenu et les huit copies des raccords d’entrée réagencés. Audit de 71 cadres et 39 destinations valides ; captures FR/EN/AR et clair/sombre examinées, sans nouveau rejeu du lecteur. Voir [le report détaillé](../../figma/dock-navigation-handoff.md) et [dock-navigation-state.json](../../figma/dock-navigation-state.json), avec leurs limites RTL. La carte web reste interactive ; sa représentation Figma demeure vectorielle ou capturée selon les écrans, avec les limites propres au prototype.

Les huit fichiers de rendu des trois études sont conservés ; [manifeste d’archive](../navigation-studies/ARCHIVE_MANIFEST.json). Aucune publication de l’application ni authentification réelle ajoutée.


## Complément éditorial du 4 octobre

À la demande de l’utilisateur, la phrase Monde devient « Le réseau, à portée de main. », issue de la première étude. Traductions : « The network, within reach. » et « الشبكة في متناول يدك. ». Contrôleur courant network-copy-41 ; raccourci v8. Figma reprend ces trois valeurs dans i18n/welcome/hint (huit accueils et huit raccords). Styles et archives conservés. Syntaxe/textes sources contrôlés, captures Figma FR ordinateur et AR mobile examinées ; accès Chrome expiré pour ce dernier contrôle web, sans nouveau rejeu revendiqué.


## Statistiques et transition inverse — suite du 4 octobre

**Décision qui remplace la phrase précédente :** l’utilisateur préfère les statistiques « 58 campus · 30 pays ». scopeHint utilise les tailles du catalogue chargé (58 et 30 dans le fichier actuel), avec valeurs initiales identiques avant chargement, et traductions EN/AR. Seul le niveau Monde est concerné. Figma reprend cet état dans i18n/welcome/hint, huit accueils et huit raccords ; captures FR ordinateur et AR mobile examinées.

**Retour demandé vers Explorer :** content-transitions.mjs complète le fondu/montée d’entrée par un fondu/descente de 10 px sur 360 ms. Le rectangle et l’opacité sont capturés avant de changer de route. Le contenu est maintenu temporairement en position fixe à cet endroit, inerte, pendant le retour du globe ; fin et annulation retirent tous les styles temporaires. Une ancienne fin d’animation ne peut pas nettoyer la suivante. Les mouvements réduits suppriment ou interrompent cet effet.

Huit tests dans tests/content-transitions.test.mjs passent : capture avant annulation, entrée, article défilé, sorties interrompues, fin tardive, nettoyage et mouvements réduits. Syntaxe contrôlée. Accès Chrome expiré lors des tentatives de contrôle : **pas de nouveau rejeu visuel web revendiqué** pour cet effet. Aucun changement de couleur ni de caméra ; archives conservées.

Versions courantes : contrôleur **return-transition-42**, raccourci **v9**, nouveau module content-transitions.mjs **v1**, CSS dock **v2** ; autres versions inchangées.


## Suite du 4 octobre — rubriques, vues et recherche générale

L’utilisateur précise ensuite le contenu du choix initial : agencement de la première étude pour les trois rubriques, choix Grille/Liste et dock avec loupe animée. Les recherches locales sont retirées. Cette suite remplace les dimensions du dock et la composition des index décrites plus haut ; couleurs, cartes, entrée et archives restent conservées. Voir [la réalisation et ses contrôles](CONTENT_LAYOUT_NOTES.md).
