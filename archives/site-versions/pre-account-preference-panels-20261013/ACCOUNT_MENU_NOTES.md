# Menu du compte et commandes d’en-tête — 13 octobre 2026

L’utilisateur demande l’avatar du connecté et un panneau compte semblable au sélecteur de thème, puis de déplacer langue/thème dans ce panneau et de réserver leurs anciens emplacements à Messagerie/Notifications. Il précise ensuite que **langue et thème doivent déjà être dans le panneau avant connexion**, sans Messagerie ni Notifications. Cette précision remplace explicitement l’ancienne absence de bouton compte sur l’entrée cryptée.

## Réalisation locale

`account-menu.mjs` et `account-menu.css` fournissent le même panneau FR/EN/AR sur l’entrée et dans les rubriques. L’icône générique ouvre les réglages en visiteur. Le chemin connecté simulé utilise l’avatar illustré du profil fictif existant **Leïla Mansour** ; aucun portrait personnel réel n’est inventé.

Le membre simulé dispose de Compte, Paramètres, Thème, Langue et Déconnexion. Compte ouvre sa fiche existante, Paramètres donne accès aux trois modes de thème et aux trois langues. Ces commandes réutilisent le contrôleur de thème et la localisation partagés ; les anciens sélecteurs extérieurs sont masqués. L’avatar mesure36px dans une cible44px.

Messagerie et Notifications n’apparaissent que pour le membre simulé et ouvrent des panneaux ancrés avec des états vides explicites. Messagerie permet d’ouvrir Profils. Aucune conversation, notification, donnée distante, permission ou persistance d’authentification n’est ajoutée.

Avant l’entrée, Se connecter réutilise le dialogue et le déchiffrement simulés existants, via `entrance.signIn()`. Après un accès visiteur, Se connecter ouvre un dialogue indiquant clairement le profil fictif utilisé ; la confirmation active seulement l’identité locale. Déconnexion restaure l’icône visiteur et masque les deux commandes réservées au membre.

Le panneau se ferme par Échap, clic dehors et sortie du focus. Échap restaure le déclencheur concerné ; flèches, Home et End permettent de parcourir les boutons. Les changements de langue/thème conservent le panneau et le contrôle sélectionné. Largeur bornée par la fenêtre, hauteur maximale calculée et défilement interne permettent de conserver les réglages en petite fenêtre.

## Préservation et vérifications

[L’état précédent reste consultable](archive/pre-account-menu-20261013/preview.html#projects), avec langue/thème séparés, ancien dialogue compte et première proposition de filtres. [Le README de l’archive](archive/pre-account-menu-20261013/README.md) précise les dépendances et contrôles.

Les sept cas de `tests/account-menu.test.mjs` passent : visiteur/membre, avatar fourni, réglages et focus, états vides, Échap et déclencheur, flèches/clic extérieur, simulation de connexion déléguée, déconnexion locale et nettoyage. Il s’agit d’un DOM simulé ; les dimensions et le rendu sont contrôlés séparément dans Chrome par l’agent principal. Syntaxe des modules et du contrôleur vérifiée. Aucun téléphone physique testé à cette étape.

Une correction incidente préserve aussi les filtres ouverts lors de l’arrivée ou de l’échec asynchrone de la carte : ces mises à jour du même périmètre n’effacent plus le brouillon du panneau. Un changement géographique volontaire conserve son comportement de fermeture.

## Contrôle Chrome du 13 octobre

Les19 états de [la preuve navigateur](checks/20261013-account-browser.json) passent avec des clics pointeur réels : compte invité visible sur l’entrée cryptée, thème/langue accessibles avant connexion, modes Clair/Sombre/Système, FR/EN/AR, connexion simulée par les deux entrées, accès membre même si le globe échoue, avatar chargé, Compte vers Leïla, panneaux Messagerie/Notifications, Échap/focus, clic extérieur et déconnexion. Les captures ordinateur français et320px arabe sombre sont examinées ; panneaux bornés et aucun débordement horizontal. [Banc reproductible](checks/20261013-account-browser.py). Le premier passage s’est interrompu sur une clé JSON absente après déconnexion, correctement absente avec l’avatar retiré ; [la trace initiale](checks/20261013-account-browser-attempt-1.json) est conservée. Ce défaut du banc a été corrigé, sans changement applicatif. Connexion et messagerie restent simulées/non raccordées. Mouvements réduits, aucun téléphone physique.
