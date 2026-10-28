# Menu du compte et commandes d’en-tête — 13 octobre 2026

L’utilisateur demande l’avatar du connecté et un panneau compte semblable au sélecteur de thème, puis de déplacer langue/thème dans ce panneau et de réserver leurs anciens emplacements à Messagerie/Notifications. Il précise ensuite que **langue et thème doivent déjà être dans le panneau avant connexion**, sans Messagerie ni Notifications. Cette précision remplace explicitement l’ancienne absence de bouton compte sur l’entrée cryptée.

## Réalisation locale

`account-menu.mjs` et `account-menu.css` fournissent le même panneau FR/EN/AR sur l’entrée et dans les rubriques. L’icône générique ouvre les réglages en visiteur. Le chemin connecté simulé utilise l’avatar illustré du profil fictif existant **Leïla Mansour** ; aucun portrait personnel réel n’est inventé.

Le membre simulé dispose de Compte, Paramètres, Thème, Langue et Déconnexion. Compte ouvre sa fiche existante, Paramètres donne accès aux trois modes de thème et aux trois langues. Ces commandes réutilisent le contrôleur de thème et la localisation partagés ; les anciens sélecteurs extérieurs sont masqués. L’avatar mesure36px dans une cible44px.

Messagerie et Notifications n’apparaissent que pour le membre simulé et ouvrent des panneaux ancrés avec des états vides explicites. Messagerie permet d’ouvrir Profils. Aucune conversation, notification, donnée distante, permission ou persistance d’authentification n’est ajoutée.

Avant l’entrée, Se connecter réutilise le dialogue et le déchiffrement simulés existants, via `entrance.signIn()`. Après un accès visiteur, Se connecter ouvre un dialogue indiquant clairement le profil fictif utilisé ; la confirmation active seulement l’identité locale. Déconnexion restaure l’icône visiteur et masque les deux commandes réservées au membre.

Le panneau se ferme par Échap, clic dehors et sortie du focus. Échap restaure le déclencheur concerné ; flèches, Home et End permettent de parcourir les boutons. Les changements de langue/thème conservent le panneau et le contrôle sélectionné. Largeur bornée par la fenêtre, hauteur maximale calculée et défilement interne permettent de conserver les réglages en petite fenêtre.

## Préservation et vérifications

[L’état précédent reste consultable](../../archives/site-versions/pre-account-menu-20261013/preview.html#projects), avec langue/thème séparés, ancien dialogue compte et première proposition de filtres. [Le README de l’archive](../../archives/site-versions/pre-account-menu-20261013/README.md) précise les dépendances et contrôles.

Les sept cas de `tests/account-menu.test.mjs` passent : visiteur/membre, avatar fourni, réglages et focus, états vides, Échap et déclencheur, flèches/clic extérieur, simulation de connexion déléguée, déconnexion locale et nettoyage. Il s’agit d’un DOM simulé ; les dimensions et le rendu sont contrôlés séparément dans Chrome par l’agent principal. Syntaxe des modules et du contrôleur vérifiée. Aucun téléphone physique testé à cette étape.

Une correction incidente préserve aussi les filtres ouverts lors de l’arrivée ou de l’échec asynchrone de la carte : ces mises à jour du même périmètre n’effacent plus le brouillon du panneau. Un changement géographique volontaire conserve son comportement de fermeture.

## Contrôle Chrome du 13 octobre

Les19 états de [la preuve navigateur](../checks/20261013-account-browser.json) passent avec des clics pointeur réels : compte invité visible sur l’entrée cryptée, thème/langue accessibles avant connexion, modes Clair/Sombre/Système, FR/EN/AR, connexion simulée par les deux entrées, accès membre même si le globe échoue, avatar chargé, Compte vers Leïla, panneaux Messagerie/Notifications, Échap/focus, clic extérieur et déconnexion. Les captures ordinateur français et320px arabe sombre sont examinées ; panneaux bornés et aucun débordement horizontal. [Banc reproductible](../checks/20261013-account-browser.py). Le premier passage s’est interrompu sur une clé JSON absente après déconnexion, correctement absente avec l’avatar retiré ; [la trace initiale](../checks/20261013-account-browser-attempt-1.json) est conservée. Ce défaut du banc a été corrigé, sans changement applicatif. Connexion et messagerie restent simulées/non raccordées. Mouvements réduits, aucun téléphone physique.

## Précision du 13 octobre — Thème et Langue séparés

L’utilisateur signale explicitement que les deux entrées ouvrent à tort tous les paramètres. La cause était leur appel commun à l’écran `settings`. **Thème** ouvre désormais seulement Clair/Sombre/Système ; **Langue** seulement Français/English/العربية. **Paramètres** conserve les deux catégories. Le titre traduit correspond au sous-panneau ; Retour rejoint le menu et remet le focus sur l’entrée utilisée. La sélection réutilise toujours les contrôleurs partagés et conserve son sous-panneau et son focus après mise à jour. Aucun CSS, stockage, parcours de connexion ou droit membre n’est modifié. Module compte2, CSS1.

[L’état exact avant cette correction reste consultable dans un lecteur autonome](../../archives/site-versions/pre-account-preference-panels-20261013/preview.html) ; module, CSS, tests et notes d’origine sont conservés avec empreintes. Ce lecteur isole le composant et reproduit encore les deux catégories à partir de Thème ou Langue ; identité et callbacks simulés, aucun stockage actif partagé.

Les **neuf cas** de `tests/account-menu.test.mjs` passent. Deux nouveaux scénarios vérifient la séparation en visiteur/membre, Paramètres inchangé, le retour vers chaque entrée, les mises à jour FR/EN/AR et les trois thèmes sans changer d’écran, focus et clavier.

Les **15 états Chrome ciblés** de [la preuve navigateur](../checks/20261013-account-panels-browser.json) passent, avec clics pointeur : entrée visiteur sur ordinateur, thème sombre et conservation après navigation, langues FR/EN/AR, mode Système, Échap/Retour/focus, membre simulé à320px, Paramètres avec les deux catégories, déconnexion et ancien lecteur. Les cinq captures associées sont examinées, dont langue arabe avant connexion, thème et langue du membre mobile ; aucun débordement horizontal ni panneau hors fenêtre. Les cinq sources suivies sont inchangées pendant le banc. [Script reproductible](../checks/20261013-account-panels-browser.py). Le globe est volontairement bloqué pour isoler cette interaction ; Chrome avec mouvements réduits, aucun téléphone physique ni connexion réelle.


## Suite du13 octobre — pseudo et accès en tête du panneau

Demandes explicites successives : afficher le pseudo sous le nom du connecté, retirer l’indication «Menu du compte», reprendre pour Se connecter le bouton de l’arrivée, ajouter Créer un compte, placer les deux accès au-dessus des réglages et retirer Visiteur.

Le membre montre désormais le `intraLogin` fourni, précédé de@, sous son nom ; aucun pseudo n’est inventé si le champ manque. Le texte utilise un élément isolé LTR pour conserver son ordre en arabe et peut se replier. Le titre général reste uniquement accessible aux lecteurs d’écran ; la croix rejoint l’identité du membre. Le visiteur n’a plus de bloc d’identité : Se connecter et Créer un compte apparaissent avant Paramètres/Thème/Langue. Les deux accès réutilisent directement `entrance-action`, respectivement principal et secondaire, sans dupliquer son style.

Créer un compte ouvre un dialogue distinct traduit, avec Annuler et confirmation **explicitement simulée**. Comme la connexion, la confirmation utilise le profil fictif Leïla ; aucun compte réel, donnée personnelle ni stockage serveur n’est créé. Depuis l’entrée, elle suit la séquence de déchiffrement existante ; depuis l’aperçu, elle active le membre local. Les deux nouveaux accès disparaissent alors au profit de Compte et Se déconnecter.

Les neuf tests existants du compte et les19 tests d’entrée passent ; revue indépendante ciblée sans défaut concret. Les **11 états Chrome** passent : identité et pseudo, absence des mentions visibles, ordre des deux accès, égalité exacte des styles calculés entre Se connecter du panneau et de l’entrée, création/annulation depuis l’entrée, confirmation puis Continuer sans le globe, création depuis l’aperçu en arabe, connexion existante anglaise et déconnexion. Rendus FR ordinateur et AR sombre320px examinés. [Banc](../checks/20261013-account-identity-browser.py), [preuve avec sources inchangées](../checks/20261013-account-identity-browser.json). Globe bloqué intentionnellement ; mouvements réduits et formats mobiles simulés, aucun téléphone physique.

[L’ancien panneau reste consultable](../../archives/site-versions/pre-account-identity-actions-20261013/preview.html), avec sources exactes et manifeste. Caches : compte3/CSS2, entrée `account-access-8` (CSS17 inchangée), contrôleur `account-identity-137`, aperçu104. Aucun commit, partage ou publication ; prototype0.0.1 pré-alpha.


## Suite du13 octobre — Palette et libellés sans mention de démonstration

À la demande explicite de l’utilisateur, les boutons de connexion/création suivent désormais les accents turquoise clair/rose sombre et utilisent la même famille dans l’entrée, le compte et les dialogues. « Profil de démonstration » et les notices de simulation sont retirés, ainsi que les équivalents FR/EN/AR dans le reste de l’interface. Le nom et le pseudo restent présents ; la logique de connexion demeure locale. [Réalisation, contrôles, limites et état précédent conservé](ACTION_AND_COPY_NOTES.md). Cette précision remplace les descriptions de notices visibles dans les entrées historiques ci-dessus.


## Suite du 13 octobre — Retour explicite à 139

La section précédente décrit la passe 140, désormais remplacée à la demande de l’utilisateur. Les boutons de l’entrée et du compte retrouvent exactement leur palette, leurs dimensions et leur disposition 139 ; les dialogues retrouvent leur composition antérieure. Les notices de simulation et de profil fictif reviennent. Seules les mentions explicites du type « profil de démonstration » restent retirées ; nom, pseudo et fonctionnement local sont conservés. Aucun élargissement de style n’est retenu.

La règle de périmètre strict est consignée dans [AGENTS.md](../../AGENTS.md). La [revue de 137 sources](../checks/20261013-explicit-scope-rollback/source-review.json) est conforme et les [177 tests ciblés](../checks/20261013-explicit-scope-rollback-tests.json) passent ; les [24 relevés Chrome](../checks/20261013-explicit-scope-rollback/browser-results.json) passent, avec styles et structure des dialogues identiques à 139 sur l’entrée et l’aperçu, FR clair/sombre à 1280 px et AR sombre à 320 px, focus clavier et notices restaurées. Captures examinées ; Chrome isolé, mouvements réduits et mobile émulé, sans téléphone physique ni lecteur d’écran réel. [Périmètre exact, archives 139/140 et versions](ACTION_AND_COPY_NOTES.md). Prototype local 0.0.1 pré-alpha, sans nouveau commit, push ou publication.
