# Filtrer sans dépendre du globe — 13 octobre 2026

## Demande et réalisation

L’utilisateur demande que les contenus puissent toujours être filtrés par pays et campus lorsque le globe ne se charge pas. Le catalogue local `campuses.json` alimente maintenant les 58 campus / 30 pays, les index de lieux, la recherche et les sélecteurs dès son chargement, indépendamment de la géographie, de MapLibre et de WebGL.

Le périmètre de contenu et sa route sont distincts du périmètre courant de la carte. Changer Pays/Campus met immédiatement à jour la liste et l’URL ; les actions retour Campus → Pays → Monde et le retour navigateur restent disponibles. Un campus choisi dans la liste globale déduit son pays. Un changement de pays enlève le campus précédent. Les règles existantes des fiches restent conservées : le contexte de lecture est consultable, pas modifiable depuis une fiche.

Un globe encore en préparation ou une nouvelle tentative ne remet plus le filtre au Monde. Quand il devient prêt, il rejoint la dernière destination sélectionnée. Les clics dans une carte disponible continuent d’alimenter le même contexte ; choisir de nouveau un campus garde le recentrage préexistant sans créer une nouvelle entrée d’historique.

L’entrée principale conserve **Réessayer** et **Revenir au message** dans son état d’erreur et ajoute **Continuer sans le globe**, traduit en FR/EN/AR. Cette action ouvre la navigation en gardant l’identité de démonstration visiteur/membre ; un visiteur n’obtient aucun déchiffrement. Une nouvelle tentative de chargement du module cartographique utilise un paramètre de tentative distinct pour éviter qu’un échec d’import précédent reste mémorisé par le navigateur. Le dialogue **Explorer le campus** continue de proposer son propre réessai.

Les trois listes gardent leurs contenus de démonstration et leurs règles géographiques, notamment les projets multicampus sans doublon. Le globe aléatoire et le zoom restent réservés à une carte prête. Le catalogue local demeure nécessaire : cette correction n’est ni un mode hors connexion complet ni un remplacement du moteur cartographique.

## Sources et conservation

- Contrôleur : `welcome.mjs` ; entrée : `entrance.mjs?v=optional-globe-6`.
- Archive exacte avant modification : [pre-map-independent-filter-20261013](../../archives/site-versions/pre-map-independent-filter-20261013/README.md), avec empreintes SHA-256 du contrôleur, de l’entrée et de son test. Le contrôleur archivé contient déjà le retrait simultané des en-têtes de listes. Les dépendances et lecteurs historiques restent conservés.
- Tests : `tests/map-independent-filter.test.mjs` et `entrance.test.mjs`.

## Vérifications automatiques

Sept cas dédiés réussissent : catalogue complet et filtrage pendant préparation pendante ; filtrage des trois rubriques après échec ; liens directs/retour historique/normalisation ; callback Monde initial ou de reprise sans perte du filtre ; application de la route après l’entrée ; nouvelle tentative du seul catalogue après échec ; conservation du brouillon de filtres lors d’un rendu incident de catalogue/carte. Ce dernier contrôle est ajouté pendant le travail suivant sur le panneau Filtrer : la fin de chargement pouvait auparavant fermer le dialogue ouvert.

Les 19 cas de l’entrée réussissent, dont trois ajouts : continuer sans globe dans les trois langues, réessai réussi après échec simulé, identité membre conservée. Les contrôles existants des sélecteurs, de la géographie multicampus et de la navigation depuis les profils passent également, ainsi que la syntaxe du contrôleur.

```sh
node --test site/tests/map-independent-filter.test.mjs site/entrance.test.mjs site/scope-selectors.test.mjs site/tests/profile-navigation-scope.test.mjs site/tests/content-geography.test.mjs
```

Le banc utilise les données et fonctions actuelles avec une carte simulée pour isoler les pannes et les courses de chargement. Pour reproduire : bloquer uniquement `integrated-globe.mjs*` dans le navigateur, ouvrir l’aperçu puis choisir des pays/campus ; pour l’entrée principale, passer par Visiteur puis Continuer sans le globe. Garder `campuses.json` disponible. Une suspension, suivie d’une reprise de cette requête, permet de contrôler la conservation du filtre choisi avant le globe.

## Vérification dans Chrome

Les [20 cas de panne simulée](../checks/20261013-map-independent-browser.json) passent : Projets/Profils/Chroniques, Lyon, retour Monde, Tokyo avec Japon déduit, lien direct, arabe à 320 px, Explorer et choix de Rio, entrée puis continuation sans globe. Les captures ont été examinées. Le premier écran d’erreur a révélé une superposition du message et des trois boutons ; le parent a corrigé le flux dans `entrance.css?v=16`, puis [revérifié les dimensions en français et arabe](../checks/20261013-map-independent-entry-layout-browser.json). L’ancienne CSS demeure dans `archives/site-versions/pre-content-pagination-20261013/entrance.css`.

La [requête de module maintenue en attente puis reprise](../checks/20261013-map-independent-slow-browser.json) confirme que Tokyo reste sélectionné avant et après l’arrivée du vrai canvas. Le [réessai réel](../checks/20261013-map-independent-retry-browser.json) confirme ensuite : module bloqué → erreur d’entrée → déblocage → Réessayer → carte prête, filtre Lyon et ses deux projets historiques conservés ; retour Monde avec les cinq projets historiques et globe visible. Les URL de tentative distinctes sont observées, sans exception JavaScript dans ces contrôles. Ces nombres décrivent le corpus avant son enrichissement demandé ensuite pour la pagination.

Les scripts reproductibles et captures portent le préfixe `checks/20261013-map-independent-`. Contrôles Chrome de bureau automatisé, y compris format mobile simulé ; aucun téléphone physique ni garantie du service de tuiles distant.

Travail local de prototype, version du projet **0.0.1 pré-alpha** inchangée ; aucun compte, backend ou report Figma ajouté.
