# Découverte contextuelle et filtre compact — 6 octobre 2026

## Décisions et précisions

L’utilisateur veut étendre le dé du campus aléatoire aux quatre rubriques. Il accepte la proposition de le placer à côté de « Chercher dans Horizon », au-dessus du dock, plutôt qu’en haut à droite. Les contenus tirés respectent le pays, le campus, les catégories et les favoris actifs. Explorer conserve son voyage et son prochain campus préparé.

Le dé reste disponible dans les fiches. Dernière précision, qui remplace l’essai intermédiaire du singleton toujours actif : aucun résultat → grisé ; plusieurs résultats → actif, autre contenu ; un seul résultat → ouvrable une fois, puis grisé sur sa fiche. Une fiche singleton ouverte manuellement peut être tirée une fois. Revenir à la liste permet de rouvrir ce résultat. Le tirage et son historique sont locaux à la session de page.

L’utilisateur simplifie le chemin géographique, puis précise qu’il faut conserver le pays au niveau campus : **Monde → France → France › 42 Paris** (états successifs, sans Monde devant le pays). Il demande ensuite d’appliquer partout la réduction responsive déjà présente en lecture : à **1050 px et moins**, seul le périmètre le plus précis est visible, dans Explorer, les listes et les fiches. Au-dessus, le pays précède le campus. Les noms officiels restent conservés. La flèche permet toujours de remonter dans Explorer et les listes ; les fiches gardent le contexte non manipulable demandé précédemment.

## Réalisation

- Le bouton existant `#random-campus` quitte les commandes du globe et rejoint `.dock-shell`. Une capsule200px, un intervalle8px et un dé44px forment une rangée252px centrée, inversée en RTL.
- Le dé reprend le verre et le fondu au scroll du dock ; il est caché pendant l’entrée et la recherche ouverte. La capsule se recentre lorsqu’elle forme la surface des résultats.
- `contentCandidates()` est partagé par la liste et le tirage : aucun élargissement implicite du périmètre.
- `random-discovery.mjs` gère les cycles par contexte, les changements de corpus, les exclusions du contenu courant quand il existe des alternatives et la disponibilité du singleton déjà tiré. Aucun changement du moteur campus.
- Les découvertes successives remplacent la fiche dans l’historique et gardent sa destination de retour ainsi que la position de la liste d’origine. Les contenus restent utilisables indépendamment du WebGL ; Explorer attend sa préparation.
- Libellés et explications des états indisponibles FR/EN/AR.
- L’ancêtre Monde reste caché ; le pays apparaît devant le campus sur grand écran. Les deux règles responsive d’ancêtres dans `globe-framing.css` s’appliquent désormais à toutes les pages. Le contexte complet reste accessible en lecture.

## Vérifications

**122 tests passent** : 108 contrôles existants des profils, catégories, préférences, menus, lecture, transitions et recherche, plus14 du tirage. Syntaxe du contrôleur vérifiée ; revue indépendante du filtrage, de la disponibilité et de l’historique, sans défaut important relevé.

Chrome, page principale :
- Tirages successifs de projets puis retour direct à la liste.
- France remplace Monde ; choix Paris affiche France › 42 Paris ; clic France remonte au pays.
- Paris/Projets : un contenu, dé actif dans la liste, puis fiche ouverte et dé grisé avec motif « Seul résultat déjà découvert ».
- Paris/Profils : Leïla puis Noé, dé toujours actif ; retour à la liste. Paris/Journal vide : dé grisé. France/Journal : ouverture de l’article de Lyon puis dé grisé.
- Explorer : candidat préparé Penang, clic → Malaisie/42 Penang, un canvas conservé. Pas de nouveau contrôle de qualité des tuiles urbaines ou de mesure FPS.
- Mobile390×844 : rangée200/8/44px, filtre réduit à42 Paris dans les quatre rubriques et dans un profil. Recherche Paris →4 résultats ; dé caché, panneau recentré, fermeture fonctionnelle.
- Arabe sombre320×640 : rangée inversée, dé44px, pas de débordement horizontal ; tirage depuis Noé vers Leïla.
- Largeur1000px : liste Projets réduite au campus ; retour au format ordinateur : France › 42 Paris réapparaît.
- Entrée rechargée : dé absent avant le parcours visiteur. Format temporaire retiré, français clair restauré et onglet principal marqué comme livrable.

Limites : pas de téléphone physique, de nouveau report Figma, de recherche IA ni de corpus réel ajouté. Le nouveau dé n’est pas un tirage dans les résultats textuels de la recherche générale : il reste contextuel à la rubrique et à ses filtres, et se masque pendant la recherche.

## Versions et archives

Actives : `welcome.mjs?v=contextual-discovery-70`, aperçu38, `random-discovery.mjs?v=2`, `contextual-discovery.css?v=2`, cadrage `compact-scope-10`.

Archives conservées :
- `archive/pre-contextual-discovery-20261006/` : contrôleur, entrées et cadrage précédents.
- `archive/contextual-discovery-before-singleton-20261006/` : module/tests et contrôleurs intermédiaires avant la règle finale du résultat unique.

Toutes les études antérieures restent présentes. Aucune acceptation esthétique finale ni publication n’est déduite des contrôles techniques.


## Précisions finales du 6 octobre — marge et bascule commune avec le dock

L’utilisateur trouve le filtre de lecture trop proche du bouton de langue. L’écart était réellement nul : filtre et bas du bouton à68px sur390×844. Il demande aussi de garder Pays › Campus jusqu’à la transformation effective du menu en dock compact, dans les listes **et** les fiches. Cette précision **remplace le seuil de viewport1050px** appliqué plus haut.

Le filtre lit maintenant le mode fixé par la propre règle de conteneur du menu (`@container(max-width:440px)`, largeur intérieure du menu). Le contrôleur synchronise `data-compact-scope` au redimensionnement ; il ne possède pas de seuil de viewport concurrent. La mise à jour conserve le raccord du petit globe et déplace le focus hors d’un ancêtre masqué si nécessaire.

En lecture mobile, filtre, espace du contenu et fondu descendent de16px. Positions finales : **84px** en mobile courant, **80px** en petit mobile haut, **78px** si hauteur≤720px, **70px** si hauteur≤520px. Les listes et Explorer gardent leurs hauteurs précédentes.

Contrôles Chrome supplémentaires :
- **500×844** : menu complet et France ›42 Paris, dans la fiche puis dans la liste.
- **480×844** : menu compact et42 Paris seul, dans les deux vues.
- **320×640** : filtre78px, bas langue62px, écart16px ; rendu examiné.
- **390×844** : filtre84px, bas langue68px, écart16px.
- **667×390** : filtre70px, bas langue54px, écart16px ; chemin complet car menu non compact, aucun débordement horizontal.
- Format temporaire retiré et page principale laissée en français clair, contrôleur71.

Versions finales : `welcome.mjs?v=contextual-discovery-71`, aperçu39, cadrage `compact-scope-11`, en-tête4. Tirage2 et CSSdé2 inchangés. Sources de cette correction conservées dans `archive/pre-reading-scope-spacing-20261006/`. Syntaxe du contrôleur recontrôlée ; les122 tests décrits plus haut précèdent ces derniers ajustements de raccord et CSS, vérifiés dans le navigateur. Pas de nouveau report Figma ni de téléphone physique.


### Disponibilité de l’aperçu — 6 octobre 2026

L’utilisateur signale « Failed to load page » lors de l’actualisation dans VS Code. Aucun processus de serveur ni écoute au port8765 n’est trouvé. Le serveur statique est relancé, limité à127.0.0.1, avec `python3 -m http.server 8765 --bind 127.0.0.1 --directory /home/le-rif/Bureau/Transcendence`. Chrome recharge ensuite l’entrée et le parcours visiteur. L’aperçu intégré de VS Code n’a pas été contrôlé directement ; la cause de l’arrêt du serveur reste inconnue. Aucun changement du site.


## Alignement mobile commun — 6 octobre 2026

L’utilisateur demande que la pilule géographique soit, en format mobile, à la même hauteur dans les rubriques que dans une fiche de profil. Les positions de lecture deviennent donc communes à Explorer, Projets, Profils, Journal et leurs fiches :84px en mobile courant,80px en petit mobile haut,78px en mobile court et70px en paysage bas. Une seule variable `--mobile-scope-top` pilote les deux états. Les hauteurs propres aux commandes interactives et au contexte de lecture restent conservées ; c’est le bord supérieur de la pilule qui s’aligne.

Le fondu des listes suit ce déplacement :130/166,126/162,124/159 et116/140px selon les quatre formats. Leurs contenus disposaient déjà de suffisamment d’espace ; aucune modification de padding ni du placement sur ordinateur. La réduction du pays suit toujours le mode compact réel du dock et les fiches restent non manipulables.

Contrôles Chrome :390×844 → bord supérieur84px dans la fiche et les quatre rubriques ;320×640 →78px dans Explorer, la liste Profils et une fiche ;320×844 →80px dans liste/fiche ;667×390 →70px dans liste/fiche, sans débordement horizontal. Rendu de la liste Projets et de la fiche examiné. Format temporaire retiré, aperçu principal actualisé. Contrôle CSS et navigateur uniquement pour cette correction, pas de nouveau test unitaire ni de téléphone physique/Figma.

Versions : cadrage `shared-mobile-scope-12`, en-tête5 ; contrôleur71 et autres versions inchangés. Sources remplacées conservées dans `archive/pre-mobile-scope-alignment-20261006/`.


### Nouvel arrêt après la passe responsive — 6 octobre 2026

Nouvelle erreur signalée. Refus de connexion à8765 confirmé hors sandbox, puis lancement du même serveur Python limité à127.0.0.1 via `subprocess.Popen(..., start_new_session=True, stdin=DEVNULL, stdout=log, stderr=STDOUT, close_fds=True)`. Les logs sont temporaires (`/tmp/horizon-preview-8765.log`), le serveur conserve la racine du projet. Il est indépendant de la commande de lancement ; ce n’est pas un service au démarrage et cela ne garantit pas sa survie à une fermeture de session ou un redémarrage. La cause des arrêts précédents n’est pas démontrée.

Vérifié : réponse HTTP200, rechargement Chrome, entrée visiteur puis Projets /4 contenus. Aucun changement des fichiers du site, aperçu VS Code non directement contrôlé.


### Disponibilité — 11 octobre 2026

Nouveau signalement « Failed to load page ». La restriction réseau de la session empêchait le premier diagnostic ; contrôle local hors sandbox : connexion refusée sur127.0.0.1:8765. Relance du serveur Python avec la même racine, `--bind 127.0.0.1`, entrées fermées, sorties vers `/tmp/horizon-preview-8765.log` et nouvelle session de processus détachée. Après le retour de la commande de lancement, une requête indépendante confirme HTTP200 sur index.html, content-preview.html, welcome109, commentsJS7/CSS6 et le module du dialogue Filtrer. L’aperçu reçu référence bien son entrée77.

Aucun code de l’interface n’a changé pour cette remise en route. Le serveur n’est pas un service automatique après redémarrage ; origine de l’arrêt non démontrée. Contrôle du rendu et de l’aperçu intégré non effectué, l’outil navigateur restant indisponible.


### 11 octobre — Accès après les dernières corrections

L’aperçu `content-preview.html?review=114`, le contrôleur `compact-content-114`, ProfilUI24, profiles.css20, content-controls.css13 et responsive-content.css7 répondent HTTP200 sur le serveur local existant. Le graphe des146 références des deux entrées ne comporte aucun fichier manquant. Les imports de la suite commentaires/mentions/thème avaient aussi répondu HTTP200 avant ce raccord. Ces contrôles confirment la disponibilité des fichiers, pas leur rendu navigateur ; CUA reste indisponible. Aucun nouveau service ni publication.


### 11 octobre — Menus, signalements et dimensions des boutons

Après le raccord des actions communautaires, l’aperçu115 et10 fichiers répondaient HTTP200. La précision suivante sur les dimensions de Signaler donne l’aperçu `content-preview.html?review=116` et le contrôleur `community-actions-116`, tous deux disponibles. Les9 dépendances modifiées contrôlées séparément répondent également HTTP200 : ProfilUI26/CSS22, ProjetUI27/CSS6, JournalUI26, Signalement JS/CSS2, contrôlesCSS14, défilementCSS6. Commentaires JS12/CSS8 et mesure d’auteurs1 avaient répondu200 dans le lot précédent. Graphe statique courant :157 références locales dans95 fichiers parcourus, sans manque. Aucun nouveau lancement de serveur ni changement de publication ; CUA reste indisponible, le rendu n’est pas vérifié par ces requêtes.

Dernière précision du même échange : inversion des boutons Signaler/Explorer dans Projet et Chroniques. L’aperçu117, `community-actions-117`, ProjetUI28 et JournalUI27 répondent HTTP200 après raccord ; aperçu JS85, autres assets inchangés. Ordre source contrôlé, sans nouveau rendu navigateur.
