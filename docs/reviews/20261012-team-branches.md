# Revue des branches de Mohammed et Hasan — 12 octobre 2026

Demande de Rachid : analyser les deux branches et conseiller quoi faire de leurs contributions. **Recommandation : conserver les deux travaux, stabiliser le backend de Hasan et adapter la CI de Mohammed avant intégration par PR.** Une fusion sans conflit ne suffirait pas à obtenir une application fonctionnelle. Cette revue ne décide pas la stack collective et n'intègre aucun code.

## État vérifié

Références actualisées par `git fetch origin` le 12 octobre. Répertoire de travail initialement propre, branche courante `rel-hass` conservée.

| Branche | Commit examiné | Travail distinct de main |
| --- | --- | --- |
| `main` | `95330f1fd72c88bc5953e4d7608492d6fd7949cc` | Initialisation documentaire. |
| `mshariar` — Mohammed Abrar Shariar | `e192236a3c20843ee9ce21122f74b0f84918bedf` | Un commit ; `.github/workflows/ci.yml`, 94 lignes. |
| `hchowdhu` — Hasan, selon la branche et les rôles du projet | `4db950b9d933c4d85ebff59e32247b936f64a607` | Quatre commits ; dix fichiers backend, dont documentation, manifestes, TypeScript et lockfile. |
| `rel-hass` — Rachid | `bc0ddf2d290c482118abd1e1691eb3523b09f5f4` | Prototypes Horizon, recherches, archives et continuité. |

L'API GitHub retourne **aucune PR, tous états confondus, et aucune exécution Actions**. `main` est signalée `protected: false`, sans règle effective retournée par `/rules/branches/main` ; l'endpoint de protection classique répond « Branch not protected ». Les conventions de VERSIONING.md ne sont donc pas actuellement imposées par ces protections. Aucun réglage GitHub n'est modifié.

Les ajouts occupent des chemins distincts. Les comparaisons `git merge-tree` en lecture seule ne révèlent pas de conflit textuel entre ces contributions. `git diff --check` passe sur les deux branches examinées. Aucun checkout, merge, cherry-pick, commit, push, tag, release ou message aux membres n'est réalisé.

## Mohammed — garder le squelette et le raccorder aux vrais projets

Le workflow prépare trois jobs indépendants : frontend, backend et Docker. Les déclencheurs PR vers `main` et push sur `main` sont cohérents avec le workflow d'équipe. Les références officielles `actions/checkout@v7` et `actions/setup-node@v7` ont de nouveau été vérifiées via l'API GitHub : elles existent.

| Problème | Preuve au commit examiné | Correction proposée |
| --- | --- | --- |
| Le job frontend attend un projet absent. | [CI, lignes 24–47](https://github.com/LeR1f/ft_transcendence/blob/e192236a3c20843ee9ce21122f74b0f84918bedf/.github/workflows/ci.yml#L24) ; aucun `frontend/package.json` ou lockfile dans les branches examinées. | Différer ce job jusqu'à un frontend réel, ou définir séparément un job de tests des prototypes lorsque leurs sources sont dans la cible. |
| Le backend manque dans sa branche et main. Celui de Hasan ne satisfait pas encore ses commandes. | [CI, lignes 56–79](https://github.com/LeR1f/ft_transcendence/blob/e192236a3c20843ee9ce21122f74b0f84918bedf/.github/workflows/ci.yml#L56) ; [scripts backend](https://github.com/LeR1f/ft_transcendence/blob/4db950b9d933c4d85ebff59e32247b936f64a607/backend/package.json#L6) : `dev`, `build`, `start`, `check`, mais ni `lint` ni `test`. | Utiliser `npm ci`, `npm run check`, de vrais tests API/OAuth à ajouter, puis `npm run build`. Ajouter lint avec sa configuration si retenu. |
| Le job Docker n'a aucun fichier à valider ou construire. | [CI, lignes 91–94](https://github.com/LeR1f/ft_transcendence/blob/e192236a3c20843ee9ce21122f74b0f84918bedf/.github/workflows/ci.yml#L91) ; aucun Compose/Dockerfile dans les arbres examinés. | Différer ce job ou livrer les conteneurs dans une tâche séparée avec une installation vérifiée. |

**Même réunir Mohammed et Hasan ne rendrait pas cette CI passante.** Ne pas masquer les commandes manquantes avec `--if-present`, des tests vides ou `continue-on-error`. Un job vert doit correspondre à une vérification réellement effectuée. Le push sur une branche personnelle ne déclenche pas ce workflow ; ce n'est pas un bug de son filtre.

La [revue du 7 octobre](20261007-mshariar-ci.md) reste conservée. Le changement depuis cette revue est l'apparition du backend sur la branche de Hasan, pas une correction du fichier CI de Mohammed.

## Hasan — une base API et OAuth qui fonctionne en contrôle isolé

Le code apporte Express/TypeScript, un client Intra côté serveur, un cache de jeton, une pagination des tentatives de projets, des routes de profil et un parcours OAuth avec session. Points utiles vérifiés : validation du login, sélection de champs de réponse, `state` aléatoire contrôlé, régénération de session après connexion, cookie HttpOnly/SameSite=Lax, déconnexion et documentation Swagger.

### Corrections avant une PR de socle exploitable

1. **Rendre l'installation reproductible et protégée contre les ajouts accidentels.** Ni `.gitignore` ni `.env.example` ne figurent sur sa branche ou main, alors que le guide demande de créer `.env`. Ajouter un exemple factice, ignorer les secrets/dépendances/builds et remplacer les placeholders de clone par les commandes du monorepo. La présence d'un `.gitignore` sur `rel-hass` ne protège pas une copie séparée de sa branche. Aucun secret suivi n'a été trouvé dans les dix fichiers examinés ; aucun secret réel n'a été utilisé.
2. **Ajouter des tests versionnés et aligner les erreurs du contrat.** Un étudiant absent côté Intra (`404`) devient actuellement `502` dans [routes.ts](https://github.com/LeR1f/ft_transcendence/blob/4db950b9d933c4d85ebff59e32247b936f64a607/backend/src/routes.ts#L71). Une panne OAuth simulée (`503`) devient `500` HTML par [auth.ts](https://github.com/LeR1f/ft_transcendence/blob/4db950b9d933c4d85ebff59e32247b936f64a607/backend/src/auth.ts#L117), alors que Swagger annonce `502`. Définir les réponses JSON et distinguer absent, indisponible, délai et quota.
3. **Borner les appels Intra et mutualiser le renouvellement du jeton.** [intra42.ts](https://github.com/LeR1f/ft_transcendence/blob/4db950b9d933c4d85ebff59e32247b936f64a607/backend/src/intra42.ts#L12) n'a pas de promesse de renouvellement commune, délai explicite, traitement de `429` ou limite locale de requêtes. Huit lectures simultanées à cache froid ont produit huit demandes de jeton dans la simulation. Ajouter un renouvellement partagé, des délais et une gestion mesurée du quota ; ne pas multiplier les retries sans limite.
4. **Corriger la documentation et la maturité.** [Backend.md](https://github.com/LeR1f/ft_transcendence/blob/4db950b9d933c4d85ebff59e32247b936f64a607/backend/Backend.md#L108) annonce `/apidocumentation`, qui retourne `404` ; le chemin implémenté est [`/api/docs/`](https://github.com/LeR1f/ft_transcendence/blob/4db950b9d933c4d85ebff59e32247b936f64a607/backend/src/swagger.ts#L182), vérifié `200`. Le manifeste et Swagger indiquent `1.0.0`, sans publication ni validation stable démontrée : les aligner sur la convention de développement `0.0.1 pré-alpha` (et le lockfile si le manifeste change), ou documenter explicitement une version technique distincte. Le domaine mentionné n'est pas une preuve de déploiement.

### Conditions avant exposition de données réelles

Les routes [profils](https://github.com/LeR1f/ft_transcendence/blob/4db950b9d933c4d85ebff59e32247b936f64a607/backend/src/routes.ts#L31) et [historique de projets](https://github.com/LeR1f/ft_transcendence/blob/4db950b9d933c4d85ebff59e32247b936f64a607/backend/src/routes.ts#L80) répondent sans session avec les accès serveur de l'application. Le contrôle isolé le confirme, y compris pour les notes et validations. Cela ne prouve pas que les données Intra utilisées seraient privées : **la politique de publication et la visibilité Horizon ne sont simplement pas implémentées**. Ne pas exposer automatiquement ces réponses comme portfolios publics. Décider les champs importables, la visibilité et les droits puis les faire appliquer côté serveur ; à défaut, maintenir cet essai local ou désactiver les routes d'import lors d'une exposition publique. CORS ne remplace pas une autorisation.

Les [sessions](https://github.com/LeR1f/ft_transcendence/blob/4db950b9d933c4d85ebff59e32247b936f64a607/backend/src/server.ts#L26) utilisent le magasin mémoire par défaut et `secure: false`, explicitement prévu pour HTTP local. Ce réglage convient à l'essai mais pas à une publication : stockage de session adapté, HTTPS, cookie sécurisé et configuration du proxy doivent précéder le déploiement. [La documentation officielle express-session](https://expressjs.com/en/resources/middleware/session/) réserve MemoryStore au développement et explique les conditions HTTPS/proxy de `secure`.

Il n'y a pas encore de base de données, de comptes Horizon persistants, de portfolio éditorial, ni de permissions staff/admin. Ces absences limitent le périmètre : elles n'obligent pas Hasan à développer tout le produit avant de faire relire un premier socle local clairement délimité.

## Raccord avec le prototype de Rachid

| Domaine | Écart constaté | Travail utile suivant |
| --- | --- | --- |
| Connexion | OAuth termine sur le JSON `/api/auth/me`. [L'entrée Horizon](../../site/entrance.mjs) déclenche encore le déchiffrement depuis une connexion simulée. | Faire une première tranche connexion 42 → retour Horizon → vérification `/me` → animation après succès ; traiter refus/échec/session expirée, conserver l'accès visiteur. |
| Campus | L'API renvoie une liste d'identifiants numériques ; [le modèle Horizon](../../site/profile-data.mjs) utilise des identifiants locaux et distingue campus d'origine, campus actuel, rentrée et promotion. | Créer une correspondance explicite et préserver les données inconnues. Ne pas déduire une chronologie de transferts de l'ordre du tableau. |
| Statut | Le backend renvoie un `grade` Intra brut. Horizon utilise `student`, `transcender`, `alumni`. Son rendu actuel retombe sur Cadet pour un statut inconnu. | Définir une correspondance vérifiée avec un état inconnu ; ne pas annoncer Cadet par défaut pour une vraie donnée non comprise. |
| Projets | Les routes Intra listent des tentatives et notes individuelles ; Horizon présente des publications avec récit, médias, liens et plusieurs auteurs. | Conserver les tentatives comme source du parcours. Créer séparément les publications Horizon et leurs liens vers Intra, sans inventer coauteurs ni chefs de projet. |
| Identité et actions | La session conserve `id`, `login`, `name` ; commentaires et autres actions du prototype restent locaux/fictifs. | Relier identité Intra et profil Horizon, puis brancher progressivement les actions persistantes avec vérification de leur auteur côté serveur. |

Express diffère de la proposition NestJS du guide d'onboarding. Ce guide dit explicitement que la stack reste à décider : **ce n'est pas une violation d'un choix accepté**. Recommandation : examiner et consigner ce choix avec l'équipe, sans réécrire le backend uniquement pour coller à une ancienne proposition. Ni cette revue ni les commits ne valent validation collective.

## Ordre de travail recommandé

1. **Rachid et l'équipe :** confirmer le périmètre de la première tranche (« connexion 42 et identité courante »), le choix du socle backend, le contrat minimal et les données réellement affichables. Garder toutes les recherches et leurs accès.
2. **Hasan :** préparer une PR de socle corrigé vers `main`, avec configuration factice, erreurs cohérentes, tests reproductibles et limites de développement explicites. Les détails du profil et du portfolio peuvent suivre dans des PR séparées.
3. **Mohammed, en parallèle :** adapter sa CI à ce socle précis, puis actualiser sa PR une fois la base intégrée. Écarter temporairement les jobs sans projet. Un job de tests des prototypes n'est possible que lorsque leurs fichiers sont présents dans la cible ; éviter de mélanger leur import complet à la PR d'authentification.
4. **Revues puis fusions séquentielles :** respecter [VERSIONING.md](../../VERSIONING.md), dont deux approbations indépendantes pour l'authentification. Hasan étant auteur, choisir un autre relecteur technique. Préparer ensemble des PR dépendantes est possible ; ne pas fusionner une CI qui échoue sur la cible réelle. Activer les protections et contrôles obligatoires lorsque ceux-ci existent et réussissent effectivement.
5. **Ensuite :** raccorder la connexion réelle à une nouvelle variante d'intégration Horizon, en conservant le prototype simulé et ses archives. Puis importer les champs de profil au travers de l'adaptateur ; le portfolio persistant constitue un chantier distinct. Sessions de production, HTTPS, permissions et lancement conteneurisé doivent être vérifiés avant publication.

Les quatre commits de `hchowdhu` portent le nom Git « MiTuL » avec une adresse locale. Faire confirmer l'association de cette identité à Hasan et son attribution GitHub avant le squash ; conserver son auteur/co-auteur réel, sans réécrire les commits partagés. Ne pas remplacer ces contributions par des copies attribuées à Rachid. Aucune release ni montée de version n'est justifiée par la seule intégration envisagée.

## Vérifications et limites

Backend extrait dans un dossier temporaire, sans `.env` réel, sous Node **20.20.0** / npm **10.8.2**. `npm ci --ignore-scripts --no-audit --no-fund` installe 138 paquets ; `npm run check` et `npm run build` réussissent. Cette installation désactive les scripts de cycle de vie et ne reproduit pas exactement `npm ci` sous Node22 de la CI proposée.

Un banc HTTP isolé sur loopback, avec appels Intra remplacés par des réponses fictives, vérifie : health `200`, `/me` anonyme `401`, login invalide `400`, `state` erroné `400` sans appel amont, pagination 100+1, redirection OAuth et session régénérée, ancien cookie refusé, déconnexion puis `/me` refusé. Il reproduit aussi l'accès anonyme aux profils/historiques, les huit requêtes de jeton concurrentes, les deux défauts d'erreurs et le chemin Swagger erroné décrits ci-dessus.

Le [banc de vérification](checks/20261012-hasan-smoke.cjs) est conservé avec cette revue. Pour le reproduire, extraire ce commit dans un dossier temporaire sans configuration réelle, installer/compiler son `backend`, y copier le banc puis l'exécuter avec Node. Certaines assertions attendent les défauts observés : ce fichier est une preuve de revue de cette révision, pas la suite d'acceptation du futur backend corrigé.

**Aucune connexion réelle à 42, aucun compte/secrets d'équipe, aucune base réelle ou données d'étudiant n'ont été utilisés.** OAuth navigateur réel, configuration de l'application 42, CORS/cookies entre les origines retenues, HTTPS, Node22, déploiement et attribution des points du sujet restent non vérifiés. Les tests du prototype n'ont pas été relancés : ses sources ne changent pas dans cette revue. Le bilan automatique ne remplace pas les approbations humaines exigées par le guide.

La revue, le contexte, le README anglais et le journal sont actualisés localement. Les branches des contributeurs et le prototype restent inchangés ; version de développement **0.0.1 pré-alpha** maintenue. La demande présente porte sur l'analyse et les conseils, pas sur l'exécution des intégrations proposées.
