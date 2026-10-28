# Note de clôture consolidée — site → Figma

27 septembre 2026. Le brouillon initial est remplacé par ce bilan factuel. Les documents Figma spécialisés sont actualisés ; PROJECT_CONTEXT.md et BOARDING_JOURNAL.md sont maintenus par l’agent principal. Aucun état « préparé » ne doit être confondu avec les réalisations ci-dessous.

## Réalisation

La synchronisation est achevée pour l’entrée et les huit accueils de la page `115:2`, avec une extension de bibliothèque sur `5:3`. Les anciennes pistes et la règle V8 sont conservées. Le site reste la source du report ; aucune acceptation esthétique ni publication n’est déduite.

Les huit destinations gardent leurs IDs : ordinateur connecté/visiteur LTR `115:4` / `119:178`, mobile LTR `123:162` / `125:198`, ordinateur RTL `125:243` / `125:296`, mobile RTL `125:349` / `125:402`. Nouveau globe, deux thèmes, filtre au-dessus, sélection teintée du menu et composition mobile avec barre basse sont présents. Les trois relevés de mutation couvrent bien les huit cadres : [premier](welcome-frames-state.json), [deuxième](welcome-batch-2.json), [troisième](welcome-batch-3.json).

La bibliothèque possède 16 variantes de navigation et **48 transitions Smart Animate** de 0,48 s ; les onglets déjà actifs restent sans action. Le dé est turquoise en clair et rose en sombre, la graisse du filtre suit le thème. L’extension accueil ajoute 85 variables, neuf styles de texte et trois effets, hors extension langues. Voir [bibliothèque](welcome-library-state.json), [notes](welcome-library-notes.md) et [finitions](welcome-polish-result.json).

**Dix listes de langues ancrées** sont raccordées aux deux entrées et aux huit accueils : 176 × 140, trois choix, coche, 60 actions auditées. Les anciens popups centrés sont conservés sans appelant actif. La page comporte **47 cadres de parcours au premier niveau : 37 initiaux + dix overlays**. Voir [relevé langues](language-menu-state.json).

**Entrée n°22 :** scan automatique 3,65 s à l’arrivée, puis attente chiffrée ; confirmation → déchiffrement 3,15 s → slogan lisible 1,3 s → phrase/42 0,6 s → cercle 0,8 s → globe 1,2 s. Le visiteur contourne déchiffrement et slogan. Les quatre cadres de naissance existants sont réutilisés avec leurs anciens enfants conservés masqués. Le raccord rejoint la géographie et la position exactes des huit accueils selon session/langue. Voir [relevé d’entrée](entrance-sync-state.json), [routes](entrance-route-audit.json) et [vidéos](entrance-proof/README.md).

## Vérifications réellement effectuées

- Huit accueils contrôlés ; captures de référence ordinateur/mobile FR clair et AR sombre. Modes temporaires restaurés.
- Bibliothèque examinée en composition FR claire / AR sombre ; correction des fonds d’icônes et aucune erreur de police dans les contrôles consignés.
- Cinq exports natifs examinés : double scan mobile, maintien du slogan, phrase vers le 42, raccord ordinateur FR clair et mobile AR sombre. Quatorze cadres de phase audités et quatre contrôles du plan natif réussis.
- Navigateur Figma ordinateur : `115:4` FR clair → liste ancrée → AR `125:243` → sombre par sélecteur de thème existant → Projets ; sélection déplacée correctement.
- Navigateur Figma mobile FR clair : scan `123:145` → Se connecter → panneau simulé → confirmation → déchiffrement `128:371` → accueil `123:162` ; clic Projets et déplacement turquoise dans la barre basse.

Le parcours visiteur final et la matrice complète langues/thèmes/formats ne sont pas rejoués. Les preuves vidéo ne mesurent ni FPS ni performance sur appareil physique.

## Limites conservées

Le globe Figma est une géographie vectorielle figée. Rotation, zoom encadré, calcul des campus, visite aléatoire réelle, préchargement et cache WebGL restent dans le site. Les assets de niveau Pays préparés, dont la France, ne sont pas insérés ; les vues Campus et contenus des rubriques ne sont pas portés. Les interactions du menu Figma changent sa sélection, sans afficher ces contenus.

Cousine remplace la police monospace système ; le scanner est échantillonné à 50 ms. Une confirmation Figma pendant le scan démarre immédiatement le déchiffrement, alors que le site attend sa fin. Authentification et région de connexion restent simulées.

Règle V8 : ligne arabe partout en AR, en EN si région de connexion simulée `Arab world`, jamais en FR. Le campus consulté ne commande pas sa visibilité ; dessin du 42 et ordre 42 puis nom conservés.

## Travaux web associés

Le candidat aléatoire est préparé avant le clic dans le cache brut partagé de 48 Mio, avec priorité au campus choisi et un seul contexte WebGL. Le clic consomme le candidat effectivement préparé ; le rendu du quartier doit encore se préparer et l’anticipation peut rester partielle. Listes de langues ancrées et voyages entre campus de 3 à 3,4 s sont réalisés.

Le relevé v18 consigne 116 tests. Les contrôles ultérieurs de clôture portent le total à **144 tests** après les nouvelles phases d’entrée. Le navigateur a notamment contrôlé Urduliz sur ordinateur FR clair, Firenze sur mobile sombre, les entrées AR/FR sombres et le raccord en cours, avec un canvas, sans débordement ni erreur dans la session. Les notes web restent la référence applicative ; aucun FPS ni téléphone physique n’est revendiqué.

## Documents actualisés

- [Piste et historique V2–V9](piste-immersive.md) : état courant en tête, historique conservé et limites séparées.
- [Relevé immersif](immersive-state.json) : section `welcomeSync20260927`, liens vers transactions et preuves ; anciens champs historiques préservés.
- [Point de reprise](welcome-sync-handoff.md) : synchronisation achevée, contrôles et limites, trace de la préparation initiale.
- Bibliothèque, entrée et langues : ledgers et notes mis à jour avec leurs preuves réelles.

Les fichiers ne déclarent aucune fonctionnalité WebGL native dans Figma, aucun contenu Pays/Campus ou rubrique qui n’a pas été inséré, aucune authentification réelle ni validation finale de l’utilisateur.
