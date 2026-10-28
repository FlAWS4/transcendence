# 42 Awards — trois interfaces à essayer

## Origine et statut — 8 octobre 2026

L’utilisateur demande de construire des interfaces pour tester le cadrage des **42 Awards** : éditions en cours dans son campus et ailleurs, vote mondial, candidature par catégories, dates, historique de chaque campus et du Monde, conditions de participation, de vote et de résultats. Il a confirmé la qualification mondiale des lauréats locaux, sans candidature directe au Monde. Le [cadrage détaillé](../../site/notes/AWARDS_NOTES.md) distingue ces demandes des modalités encore ouvertes.

Cette collection ajoute **trois prototypes comparables et séparés**. Aucun de ces trois agencements n’est choisi par l’utilisateur à cette étape. La page Awards de l’[aperçu Horizon courant](../../site/content-preview.html#awards) reste distincte de ces études. Le registre des recherches reçoit une neuvième collection ; les huit précédentes et leurs états historiques restent accessibles.

Il s’agit d’une réalisation locale de recherche, au stade **0.0.1 pré-alpha** du projet, sans authentification, candidature, vote, publication ou report Figma réels. Les numéros 01–03 désignent des pistes d’interface, pas des versions publiées du projet.

## Accès et variantes

[Ouvrir la galerie](index.html). Elle présente des miniatures en HTML/CSS, les différences d’organisation et cinq tâches communes. Les miniatures représentent les agencements sur ordinateur ; la troisième montre le périmètre « Autres campus » que l’on peut sélectionner dans l’essai.

| Piste | Accès | Organisation proposée |
| --- | --- | --- |
| 01 — Vue d’ensemble | [Essayer](demo.html?variant=1#overview) | Duo Mon campus / Monde au premier plan, navigation locale horizontale, puis autres campus et accès aux archives. |
| 02 — Sommaire latéral | [Essayer](demo.html?variant=2#overview) | Navigation locale à gauche, lecture à droite. Sur mobile, un sélecteur de rubrique remplace le sommaire latéral. |
| 03 — Éditions à explorer | [Essayer](demo.html?variant=3#overview) | Sélecteur Mon campus / Monde / Autres campus et cartes d’éditions. Les cinq rubriques restent accessibles. |

Les trois partagent **Vue d’ensemble · Participer · Calendrier · Historique · Règlement**, les données, les parcours et le dock global Horizon. Les autres entrées du dock ouvrent les pages correspondantes de l’aperçu existant ; elles ne sont pas des copies intégrées à cette collection. Le bandeau de recherche permet de changer de piste, revenir à la galerie ou ouvrir **Tester les états**.

Les interfaces sont en **français seulement**, avec thèmes clair/sombre et règles CSS pour ordinateur/mobile, y compris 320 px. Cette collection ne réalise pas encore les traductions anglais/arabe ni le RTL demandés pour le projet complet. Les contrôles navigateur effectués sont à consigner séparément ci-dessous.

## Parcours disponibles

- **Consulter les éditions.** Les cartes affichent leur phase, une prochaine date et une action liée à l’état de l’édition et au compte simulé. Une fiche présente les projets, l’équipe et les étapes du calendrier. La sélection d’un campus ne change pas le campus d’appartenance du compte.
- **Voir les autres campus.** Mulhouse et Tokyo servent d’exemples actifs. Leur consultation reste ouverte ; le compte de Paris ne peut pas voter dans leurs éditions locales, y compris par un lien direct vers leur vote. Les campus sans édition de démonstration ont un état vide explicite.
- **Participer.** Choisir un projet de son portfolio de démonstration, sélectionner une ou plusieurs catégories proposées, rédiger une présentation, enregistrer un brouillon, prévisualiser avec l’équipe puis confirmer. Les candidatures apparaissent dans « Mes candidatures ». Les catégories compatibles et la présentation sont vérifiées par le modèle local. Aucun dépôt direct au Monde.
- **Voter.** Pendant la période ouverte, sélectionner un projet dans une ou plusieurs catégories, consulter le récapitulatif puis confirmer. Le parcours propose le vote à Paris et au Monde pour le compte simulé ; les autres campus et les périodes closes affichent un motif d’indisponibilité. Les choix et le vote confirmé sont distincts dans l’état local.
- **Suivre les dates.** Choisir une édition pour voir candidatures ou qualifications, votes et annonce des résultats. Les dates détaillées mentionnent l’heure et le fuseau **UTC**. « Suivre cette édition » mémorise une préférence locale ; aucun rappel ni événement de calendrier externe n’est envoyé.
- **Explorer l’historique.** Filtrer les éditions publiées par campus ou Monde, année et catégorie, puis ouvrir le palmarès d’une édition. Les projets, équipes, catégories et liens vers le règlement restent consultables. Le filtre d’un campus sans archive de démonstration reste vide.
- **Comprendre les conditions.** Règlement propose Participation / Vote / Résultats avec sélection de l’édition. Les candidatures, votes et résultats ont des liens vers la partie correspondante. Le contexte de l’édition est affiché, mais le texte reste un modèle de démonstration commun ; ce n’est pas encore un système de versions historiques de règlements adoptés.
- **Changer de profil simulé.** Le compte Leïla Mansour appartient à Paris. Le mode Visiteur permet la consultation et propose une connexion simulée avant les actions personnelles. Aucun identifiant Intra, mot de passe ni compte réel n’est utilisé.

## Données et modalités de démonstration

`data.mjs` contient un instantané des **58 noms de campus** du catalogue local Horizon, **8 projets fictifs**, **4 catégories** et **11 éditions fictives** : automne 2026, printemps 2026 et automne 2025 pour Paris, Mulhouse et Tokyo, plus Monde 2026 et Monde 2025. Les autres campus restent sélectionnables sans inventer d’édition ou de palmarès.

Les catégories proposées pour ces essais sont Meilleur projet, Interface & expérience, Innovation technique, Documentation & transmission. La liste définitive n’est pas adoptée. Les présentations, équipes, candidatures, dates et distinctions sont fictives ; les exemples de palmarès ne décernent aucun prix réel aux personnes présentées.

La **qualification campus → Monde** suit la décision de l’utilisateur. Le Monde 2026 utilise ici les lauréats fictifs du **printemps 2026**, dont les résultats sont déjà publiés lorsque commence la simulation du 8 octobre. Les éditions locales de l’automne 2026 ne qualifient pas rétroactivement ce Monde. La fiche d’un candidat mondial permet de consulter l’édition locale qualificative.

Les autres valeurs servent uniquement à jouer les parcours : un choix par catégorie de vote, catégories facultatives avec au moins un choix pour confirmer, sélection et vote modifiables avant clôture, scores non présentés avant les résultats. Ces valeurs ne constituent pas un règlement adopté. Électorat, statuts éligibles, limites de candidature, équipes de plusieurs campus, auto-vote, vote pour son campus au Monde, barème, égalités, récompenses et modalités précises de qualification restent à définir.

Les palmarès sont **préparés dans les données** et révélés selon la date simulée. Ils ne sont pas calculés à partir des votes locaux. Une candidature enregistrée pendant l’essai ne devient pas automatiquement lauréate ni candidate mondiale. Les contrôles du modèle restent des comportements de prototype, pas des permissions de serveur.

## Quatre moments à essayer

Le bouton **Tester les états** change l’horloge fictive. L’horloge réelle de l’ordinateur ne détermine pas la phase de l’édition. Chaque édition possède ses propres dates : les campus peuvent donc présenter des phases différentes au même moment.

| Moment simulé, à 12:00 UTC | Paris · automne 2026 | Monde 2026 |
| --- | --- | --- |
| 8 octobre 2026, état initial | Candidatures ouvertes | Votes ouverts |
| 22 octobre 2026 | Votes ouverts | Votes ouverts |
| 2 novembre 2026 | Résultats à venir | Résultats à venir |
| 8 novembre 2026 | Résultats publiés | Résultats publiés |

Le modèle distingue aussi À venir et Candidatures closes / préparation des votes selon les dates d’une édition. Les instants d’ouverture et de clôture annoncés sont inclus ; les résultats deviennent accessibles à leur instant d’annonce. Les dates de cette étude ne fixent aucune cadence réelle annuelle ou bimestrielle.

## État local, navigation et réinitialisation

- Les interactions sont enregistrées dans `sessionStorage`, sous **`horizon-awards-study-1-v1`**, **`horizon-awards-study-2-v1`** ou **`horizon-awards-study-3-v1`**. Chaque variante possède son compte simulé, sa date, ses brouillons, candidatures, choix, votes confirmés et éditions suivies. Un essai ne modifie pas celui des autres variantes.
- **Réinitialiser cet essai**, dans Tester les états, remet la variante courante à son état initial. Il ne supprime pas les sources ni les autres recherches. Aucun stockage distant n’existe.
- Le thème est commun à la galerie et aux essais via `localStorage`, clé **`horizon-awards-studies-theme`**. Le clair est le défaut. La galerie écoute les changements de thème dans les autres onglets.
- Les liens utilisent `?variant=1`, `2` ou `3` et des routes `#overview`, `#participate`, `#calendar`, `#history`, `#rules`, `#campuses`, `#edition/<id>`, `#candidate/<édition>/<projet>`, `#vote/<id>`, `#results/<id>`. Les paramètres d’une route permettent de garder l’édition ou la partie du règlement dans un lien direct.
- Le prototype fonctionne sans service extérieur pour ses données et ses rendus. Les liens vers l’aperçu Horizon et les autres recherches nécessitent de conserver l’arborescence du dépôt. Le catalogue source référencé dans `data.mjs` documente la provenance des noms ; la liste est embarquée dans la collection.

## Sources et conservation

| Fichiers | Rôle |
| --- | --- |
| `index.html`, `gallery.css`, `gallery.mjs` | Galerie, miniatures en CSS, parcours de comparaison et thème. |
| `demo.html`, `demo.css`, `app.mjs` | Structure, variantes d’agencement, navigation, interactions et stockage local. |
| `data.mjs`, `model.mjs`, `model.test.mjs` | Données fictives, phases, contrôle des actions et tests du modèle. |
| `icons.mjs` | Icônes SVG et échappement des textes. |
| `assets/` | Police Jost locale, logo 42 officiel déjà utilisé par Horizon et portrait SVG fictif de Leïla. |
| `manifest.json` | Inventaire des fichiers ; empreintes SHA-256 des assets uniquement. |

Les six assets sont identiques aux copies déjà conservées dans `connected-experience-studies/assets`. Le logo est également identique à `shared/brand/logo-42.svg`, les fichiers Jost à `shared/assets`. Les dessins des projets sont générés par le HTML/CSS local, sans image IA ni nouveau téléchargement. Jost reste le choix provisoire du projet ; aucune installation de Futura PT n’est revendiquée.

**Conserver les trois essais, leurs sources et dépendances.** Une intégration future devra préserver cette recherche et archiver l’état remplacé si nécessaire. Cette collection n’écrase ni les expériences connectées précédentes ni la page Awards actuelle. Les fichiers applicatifs continuant d’être ajustés pendant la vérification initiale, le manifeste les inventorie sans empreinte volatile ; les assets stables ont une empreinte et une taille. Le manifeste n’inclut pas sa propre empreinte.

## Vérifications

### Contrôles source effectués pendant la construction

- Syntaxe de `gallery.mjs` vérifiée par `node --check`.
- Galerie : 26 références locales présentes, 10 identifiants uniques et trois liens `demo.html?variant=N#overview` contrôlés.
- Le modèle chargé depuis Node confirme les quatre états Paris/Monde consignés dans le tableau ci-dessus et les comptes de données (58 campus, 8 projets, 4 catégories, 11 éditions).
- Provenance des six assets vérifiée par comparaison octet pour octet avec les copies locales existantes.
- Registre : 9 cartes, 8 collections précédentes toujours présentes, 22 identifiants uniques et 19 références locales présentes. Aucun nouveau contrôle navigateur du registre.
- Manifeste : inventaire des 18 fichiers présents, six empreintes et tailles d’assets vérifiées ; liens locaux de cette note présents. Les fichiers applicatifs sont volontairement inventoriés sans empreinte volatile.

### Contrôles effectués — 8 octobre 2026

Les **10 tests du modèle passent**, avec `node model.test.mjs` ; le lancement `node --test` passe également. Ils couvrent les noms des 58 campus, les bornes des phases, les droits selon compte/campus/période, les candidatures et catégories incompatibles, les bulletins partiels/invalides, les archives séparées et les qualifications mondiales antérieures à l’édition concernée. Syntaxe des modules, imports, références HTML, identifiants uniques, inventaire et six empreintes d’assets contrôlés.

Dans Chrome, format ordinateur habituel (1920 px de viewport, captures avec barre de défilement) et petit format **320 × 640** :

- Trois vues d’ensemble examinées sur ordinateur : duo de cartes, sommaire gauche et parcours par édition. Piste03 : bascule Monde puis autres campus jouée, carte de l’édition et droit de consultation corrects.
- Piste01 : projet Minishell Atlas, catégorie, présentation, enregistrement du brouillon, aperçu de l’équipe puis confirmation. Une candidature apparaît dans Mes candidatures ; focus rendu au contenu après fermeture.
- Vote Monde : choix de Lumen, récapitulatif et confirmation ; sélection ultérieure de Cortex signale qu’une nouvelle confirmation est nécessaire. Piste02 : scénario du 22 octobre, vote Paris joué jusqu’à confirmation.
- Lien direct vers le vote Mulhouse : accès refusé au compte Paris avec motif de consultation seulement. Mode visiteur : vote Monde refusé, puis connexion simulée jouée vers le parcours de vote.
- Historique Paris2025 → palmarès → règlement Résultats → calendrier : ancienne édition correctement sélectionnée. Filtre Codam sans archive → état vide, réinitialisation → Monde → seule édition mondiale2025 publiée au 8 octobre.
- Scénario du 2 novembre : Monde affiche l’attente et l’annonce du7 novembre ; scénario du8 novembre : palmarès révélé. Les titres, auteurs et prix sont examinés dans les cartes mobiles sombres.
- Dix-huit combinaisons (trois variantes × vue d’ensemble, participation, vote Monde, historique, règlement et calendrier) montent à320px sans erreur console ni débordement horizontal détecté. Ce contrôle DOM est distinct des captures examinées : première vue mobile claire, piste03 Monde sombre, palmarès mobile sombre et formulaire de la piste02 clair. Aucun téléphone physique.
- Le lien d’évitement joué au clavier garde la route et donne le focus au contenu. Les dialogues natifs, retours de focus et noms accessibles des icônes sont contrôlés sur les parcours joués ; pas d’audit exhaustif au lecteur d’écran ni de préférence système de mouvement réduit forcée.
- Galerie finale : les trois miniatures sont rapprochées des interfaces réelles (titres, ordre des rubriques, cartes côte à côte et couleurs), puis examinées ensemble sur ordinateur. Première miniature et introduction examinées à320px : largeur du document305px, sans débordement. Les27 références locales du HTML final sont présentes. Format habituel du navigateur et thème clair rétablis pour la livraison.

La revue indépendante et les essais ont conduit à corriger : contexte du calendrier des archives ; lien de qualification vers la bonne édition mondiale ; libellés des dates de qualification du Monde ; distinction sélection/vote confirmé ; fermeture d’un dialogue au changement de route ; focus après rerendu ; lien d’évitement ; catégories incompatibles expliquées et désactivées ; noms accessibles du dock et du compte en mobile. Le rendu du palmarès a révélé une collision entre le nom CSS d’une illustration et celui de son décor, causant un débordement à347px ; corrigée puis mesurée à305px de document pour320px de viewport. Résumés des cartes limités à deux lignes, présentation complète conservée dans la fiche.

Les actions de test des trois variantes sont réinitialisées par leur commande avant livraison. Aucun contrôle serveur, authentification réelle, traduction/RTL, test sur téléphone physique ou publication. Les vérifications ne constituent pas une sélection d’interface par l’utilisateur.

Commandes locales utiles, depuis la racine du dépôt :

```sh
python3 -m http.server 8765 --bind 127.0.0.1
node --test studies/awards-studies/model.test.mjs
```

Puis ouvrir `/studies/awards-studies/index.html` sur ce serveur. Un serveur déjà actif au même port peut être réutilisé ; cette commande n’ajoute aucun service permanent.
