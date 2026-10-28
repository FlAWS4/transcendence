# Revue de la préparation CI de mshariar — 7 octobre 2026

Demande de Rachid : sauvegarder le travail Horizon dans sa branche personnelle `rel-hass` et vérifier ce que mshariar a poussé. Revue du commit **e192236a3c20843ee9ce21122f74b0f84918bedf**, récupéré depuis `origin/mshariar`. La branche `main` reste sur95330f1. Aucun fichier de mshariar n’est modifié ni intégré par cette revue.

Source : [configuration CI au commit examiné](https://github.com/LeR1f/ft_transcendence/blob/e192236a3c20843ee9ce21122f74b0f84918bedf/.github/workflows/ci.yml).

## Résultat

Le commit ajoute seulement `.github/workflows/ci.yml`. Il prépare trois jobs : Frontend, Backend et Docker. Il n’ajoute pas de tests applicatifs. Ce workflow ne peut pas encore valider le dépôt dans son état actuel.

### Bloquant pour l’exécution : les entrées des trois jobs manquent

- **Frontend, lignes23–48 :** aucun dossier `frontend`, aucun `frontend/package.json` ni `frontend/package-lock.json` dans le commit. La configuration du cache npm exige le lockfile ; `npm ci`, lint, test et build n’ont ensuite aucun projet ni scripts à exécuter.
- **Backend, lignes56–81 :** même absence pour `backend/package.json` et `backend/package-lock.json`, et donc pour les commandes npm prévues.
- **Docker, fin du fichier :** aucun fichier Compose (`compose.yaml`, `compose.yml`, `docker-compose.yaml` ou `.yml`) ni Dockerfile. `docker compose config` ne peut pas valider de configuration ; le build n’est pas préparé.

Ces absences sont vérifiées dans l’arbre Git du commit, et non déduites de notre copie de travail. Une PR vers `main` déclencherait les jobs sur ce contenu incomplet.

### Pourquoi le push de mshariar n’a pas lancé de test

Le workflow écoute uniquement les pushes vers `main` et les PR ciblant `main`. Un push sur `mshariar` ou `rel-hass` seul ne déclenche rien. Aucun `workflow_dispatch` n’est défini. L’API GitHub retourne une liste vide pour les exécutions Actions du dépôt et pour les PR ouvertes lors de cette vérification.

Le filtre des branches correspond à un modèle de vérification à la PR ; il n’est pas une erreur en soi. Il faut toutefois distinguer un fichier de workflow poussé d’une exécution réussie.

### Versions des actions

Les tags [actions/checkout v7](https://github.com/actions/checkout/tree/v7) et [actions/setup-node v7](https://github.com/actions/setup-node/tree/v7) existent, vérifiés via l’API des références GitHub. Ils ne constituent pas un défaut de cette revue. Node22 est une cible choisie par ce fichier ; la stack applicative collective reste à décider dans les documents du projet.

## Suite proposée

Conserver ce fichier comme préparation de CI, puis le raccorder aux chemins, lockfiles et scripts réellement créés lorsque la structure frontend/backend et Docker sera choisie. Pour vérifier dès maintenant les prototypes, une CI distincte peut lancer leurs fichiers de tests Node et leurs contrôles adaptés, sans annoncer un frontend/backend de production déjà disponible. Ce sont des propositions de l’assistant, pas des changements appliqués à la branche de mshariar.

## Vérifications et limites

- YAML chargé et structure `on`/`jobs` inspectée avec PyYAML BaseLoader.
- Arbre Git, auteurs et diff examinés : un seul fichier ajouté par mshariar.
- Références v7 officielles, PR ouvertes et exécutions Actions consultées par API GitHub.
- Dans notre prototype actif : `node --test` sur les39 fichiers `.test.mjs` de `site`, hors archives ;39 réussites,0 échec. Cela ne prouve pas l’exécution du workflow de mshariar.

Les commandes npm et Docker de son workflow ne sont pas lancées : leurs projets et configurations sont absents. Aucune exécution Actions, approbation humaine, fusion, publication de version ou notification à mshariar n’est revendiquée.
