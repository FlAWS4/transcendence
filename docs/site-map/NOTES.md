# Plan du site — prototype actif

## Demande

15 octobre 2026, demande explicite de l’utilisateur : rendre visuelle la structure actuelle du site, **pour toute l’équipe**. Il s’agit de schématiser toute l’architecture : quelle page est accessible depuis quelle page, et tout le chemin depuis l’arrivée avec le déchiffrement jusqu’aux pages les plus profondes. Le plan sera **mis à jour au fur et à mesure**.

Le même jour, l’assistant propose d’inscrire cette mise à jour dans AGENTS.md pour que chaque session la fasse quand la navigation change ; l’utilisateur répond « oui tu peux le faire ». La règle « Plan du site — demande explicite du 15 octobre 2026 » d’[AGENTS.md](../../AGENTS.md) fixe quand et dans quelles limites ; la section « Mettre le plan à jour » ci-dessous en donne le détail.

## Réalisation

- [index.html](index.html) : page interactive, publiée comme page privée de l’utilisateur ([lien](https://claude.ai/artifact/E6tF3uWb11KkUEgr1ySBYy)). Seuls l’utilisateur et les personnes à qui il la partage peuvent l’ouvrir.
  - Vue **Schéma** et vue **Liste** (par défaut sur téléphone), en français et en anglais, thèmes clair et sombre.
  - Cliquer un écran montre d’où on y arrive, où il mène, et le chemin le plus court depuis l’arrivée, compté en actions.
  - Chaque case porte ce nombre minimal d’actions.
  - Ouverte depuis le dépôt (`http://127.0.0.1:8765/docs/site-map/`), la page propose aussi « Ouvrir dans le prototype local ».
- [site-map-data.js](site-map-data.js) : les données, séparées de la page pour les mises à jour. Elles comptent un écran par entrée de `nodes` et un lien par entrée de `edges`. L’en-tête du fichier décrit chaque champ.
- [check-site-map.mjs](check-site-map.mjs) : contrôle de cohérence entre le plan et le code.

Relevé du 15 octobre 2026 sur l’état `audit-fixes-146` du prototype : **65 écrans, 110 liens**, jusqu’à 6 actions depuis l’arrivée. Le plus profond est le menu à trois points d’un commentaire, qui demande de publier d’abord un commentaire. Le plan est mis à jour le soir même pour l’intégration de la sélection de l’avis sur le design (voir la dernière section).

Le plan est organisé en neuf groupes :

- l’Entrée ;
- les éléments présents partout après l’entrée ;
- Explorer ;
- Projets, Profils et Chroniques ;
- les fenêtres communes ;
- 42 Awards ;
- le Compte.

Il décrit ce qu’on atteint depuis `index.html` et `content-preview.html` du prototype actif. Les études séparées non intégrées n’en font pas partie : essais Awards, espaces connectés, essais de l’avis sur le design non retenus, commandes du globe.

## Règles de lecture et de saisie

- **Types d’écran** :
  - page ;
  - onglet d’une fiche ;
  - fenêtre ou panneau par-dessus ;
  - étape automatique de l’entrée ;
  - site externe ;
  - élément toujours présent.
- **Fermer** une fenêtre ou un panneau ramène toujours à l’écran du dessous. Ces retours ne sont pas saisis. Les boutons Retour des fiches le sont, avec leur condition.
- **Onglets** : le lien depuis leur fiche est implicite. L’onglet ouvert par défaut ne coûte aucune action.
- **Éléments toujours présents** :
  - `direct` : utilisables en une action depuis toute page ou tout onglet après l’entrée. C’est le cas du logo, du menu du bas, du dé, du compte et de « Remonter en haut ».
  - `opener` : il faut d’abord les ouvrir, comme la recherche.
  - `notFrom` / `onlyFrom` : limites par rubrique. Par exemple, le bouton de la rubrique en cours ne fait rien, et le dé ne tire que dans la rubrique courante.
- **Visiteur ou membre** : `requires` et `sets` suivent la connexion simulée. Le chemin le plus court tient compte de cet état. Par exemple, la Messagerie demande d’être membre.
- **`cost`** : sert quand un lien demande plusieurs actions, par exemple « publier, puis les trois points ».
- **Aperçu direct** : `content-preview.html` est un point d’entrée séparé (`altStart`), sans chemin depuis l’arrivée.

## Mettre le plan à jour

**Ce qui déclenche une mise à jour.** Tout changement, quelle qu’en soit l’origine (travail en cours, autre session, Codex, coéquipier, travail antérieur), qui rend inexact ou incomplet ce qu’enregistre `site-map-data.js` pour ce qu’on atteint depuis `index.html` et `content-preview.html` :

- écrans et étapes de l’entrée, leur type, l’onglet ouvert par défaut ;
- éléments toujours présents et leurs exceptions (`notFrom`, `onlyFrom`) ;
- liens et leurs libellés (`via`), en français et en anglais ; boutons Retour et leurs conditions ;
- adresses `#…`, leurs paramètres et les exemples d’adresse ;
- conditions d’accès : visiteur ou membre, rubrique, origine de la visite, format, état du globe, données de démonstration (par exemple « aucun profil fictif n’a de réseaux », « seul minishell a une image dans le récit ») ;
- nombre d’actions (`cost`) ;
- contenus et chiffres notés : 78 éléments par rubrique, éléments par page, état simulé ou vide, fichiers cités dans `src`.

Les changements du CSS, des données de démonstration ou des limites du globe comptent s’ils modifient l’un de ces éléments. Ne comptent pas : un changement visuel qui ne masque, n’ajoute ni ne déplace aucune commande du plan ; un texte que le plan ne reprend pas ; les études et archives non intégrées. En cas de doute, chercher dans `site-map-data.js` les fichiers (`src`) et libellés touchés. Ne pas enrichir le plan sans demande. Lors d’une demande en lecture seule, signaler l’écart sans corriger le plan.

**Étapes.**

1. Corriger `site-map-data.js`, en français et en anglais. Le plan suit le prototype : un écart non voulu se signale au lieu d’être recopié, et le prototype ne se modifie pas pour suivre le plan sans demande.
2. Lancer le contrôle de cohérence depuis la racine du dépôt, en gardant son résultat daté :

   ```sh
   node docs/site-map/check-site-map.mjs --json docs/site-map/checks/AAAAMMJJ-data-check.json
   ```

   Il signale :
   - les identifiants en double et les liens vers des écrans inconnus ;
   - les écrans sans chemin depuis l’arrivée ;
   - les rubriques de `welcome.mjs` et les onglets de `project-ui.mjs`, `profile-sections.mjs` et `journal-ui.mjs` absents du plan ou disparus du code ;
   - les exemples d’adresse de fiche sans entrée correspondante dans les données de démonstration.

   **Il ne compare au code ni les libellés, ni les conditions, ni les chiffres, ni l’entrée, le compte et les fenêtres** : les vérifier dans le code modifié. S’il ne trouve plus une liste du code, par exemple après une remise en forme, adapter le contrôle et non le prototype, en gardant sa version précédente (`check-site-map.AAAAMMJJ-avant.mjs`).
3. Si un parcours ou un libellé joué par `checks/navigation-check.py` change, rejouer les cas concernés vers un **nouveau dossier daté**, serveur local du README lancé :

   ```sh
   python3 docs/site-map/checks/navigation-check.py docs/site-map/checks/AAAAMMJJ-navigation [cas…]
   ```

   - Les noms de cas placés après le dossier limitent le passage (liste `CASES` dans le script).
   - N’adapter un cas qu’à un changement voulu, après avoir copié la version précédente du script (`checks/navigation-check.AAAAMMJJ-avant.py`).
   - Si la page du plan ou la disposition du schéma change, rejouer de même `checks/browser-check.py` vers un nouveau dossier daté.
   - Ces contrôles utilisent l’outil Chrome partagé de `studies/design-review-studies/checks/helper.py` : profils hors de `/tmp`, plafond mémoire, attente de place libre. Le message « Waiting for the shared headless Chrome slot… » signale cette attente, pas un blocage.
   - Sans serveur ou sans Chrome, dire dans le bilan ce qui n’a pas été rejoué ; le contrôle de cohérence reste obligatoire.
4. Mettre à jour `meta` (date et état relevé : identifiant `welcome.mjs?v=…` d’`index.html`, plus les ajouts chargés à côté) et les chiffres repris dans le README. Ajouter ici une section datée « Mise à jour du … » : changements, contrôles, constats devenus faux. Ne pas effacer les sections précédentes, et distinguer une mise à jour partielle d’un relevé complet.
5. **Republier** au même lien avec l’outil Artifact de Claude, en envoyant la page **et** ses données. Sans les données, l’ancien `site-map-data.js` reste en ligne.
   - Depuis une autre conversation : `read` du lien, puis liste des fichiers publiés (`list`, `scope: files`), puis `publish` avec `url: https://claude.ai/artifact/E6tF3uWb11KkUEgr1ySBYy`, `file_path: docs/site-map/index.html` et `files: {"site-map-data.js": "docs/site-map/site-map-data.js"}`, sans `icon` ni `force`.
   - Ne jamais publier le plan sur une nouvelle page. Si c’est impossible (Codex, droits insuffisants sur la page de l’utilisateur), inscrire « republication du plan en attente » dans PROJECT_CONTEXT.md et ici ; la session suivante qui dispose de l’outil la fait et retire la mention.
6. Cette republication n’est pas une publication au sens de VERSIONING.md. Le partage reste du ressort de l’utilisateur, et cette maintenance n’autorise pas à elle seule de commit, de push ni de message à l’équipe.

## Constats issus du relevé

Ce sont des observations sur le prototype, sans demande de correction. Celles marquées (Chrome) sont confirmées par le contrôle des parcours ; les autres viennent de la lecture du code.

- **Menu du bas** : le bouton de la rubrique en cours ne fait rien, même depuis une fiche. Sur une fiche projet, « Projets » ne ramène pas à la liste ; on en sort par Retour (Chrome).
- **Libellé de Retour** : il dépend de l’origine de la visite.
  - Depuis une carte de liste : « Retour aux projets » (Chrome).
  - Depuis l’équipe d’un projet : « Retour au projet » (Chrome).
  - Depuis la Contribution d’un profil : « Retour au profil » (Chrome).
  - Depuis les auteurs d’une chronique : « Retour à l’article » (Chrome).
  - Une fiche ouverte par la recherche, le compte ou un lien direct revient à la liste de sa rubrique.
- **Arrivée** : elle ne propose que Se connecter et Visiter, sans compte ni menu (Chrome).
  - « Créer un compte » n’est accessible que par le compte de l’écran d’erreur du globe, ou après l’entrée (Chrome).
  - Un lien direct fait d’abord passer par l’arrivée, puis ouvre l’adresse demandée (Chrome).
- **Connexion simulée après l’entrée** : elle fait passer en membre sur la même page, sans rejouer le déchiffrement (Chrome).
- **Commentaires** : ils démarrent vides, sans menu à trois points avant une publication (Chrome).
- **Données de démonstration** :
  - aucun profil fictif n’a de réseaux ;
  - aucun projet n’a de dépôt par défaut ;
  - le bloc Distinctions des profils ne mène pas à 42 Awards.
- **Recherche** : elle renvoie des campus, des projets, des profils et des chroniques, mais aucun pays.
- **Code inaccessible** :
  - l’ancien bouton générique `#content-back` et le détail `#content-detail` ne sont plus atteignables ;
  - `welcome-panels.html` n’est relié à rien.

## Vérifications du 15 octobre

- **Cohérence des données** : `check-site-map.mjs` passe. Il compte 65 écrans, tous reliés à l’arrivée sauf le point d’entrée séparé et les éléments toujours présents. Les cinq rubriques et les 13 onglets du code sont présents, et les exemples d’adresse existent. [Résultat](checks/20261015-data-check.json).
- **Parcours dans le vrai prototype** : `checks/navigation-check.py` joue 15 cas dans Chrome sans interface, chacun dans un Chrome neuf, en lecture seule. **15/15 passent** au passage final, sans relance après plantage. Les cas couvrent :
  - l’entrée : premier écran, visite avec lien direct, connexion, panne du globe et ses trois boutons ;
  - le menu du bas, Awards, les cartes et les boutons Retour ;
  - les onglets, les fenêtres campus, Signaler et Envoyer un message ;
  - les filtres, le compte visiteur puis membre, la recherche et la fenêtre d’Explorer ;
  - avec le vrai globe, le marqueur de 42 Paris, qui ouvre la fiche campus dans Explorer et dans la fenêtre « Autour du campus ».

  [Résultats](checks/20261015-navigation/navigation-results.json).
- **Rendu de la page** : `checks/browser-check.py` rend la page dans le même squelette que la page publiée, sur 11 états :
  - 1440, 1180, 390 et 320 px ;
  - clair et sombre ;
  - français et anglais ;
  - Schéma, Liste et feuille mobile.

  Aucun débordement horizontal et aucune erreur. Les captures sont examinées. [Résultats et captures](checks/20261015-render/).
- **Version locale** : servie par le serveur du dépôt à 1440, 390 et 320 px, en UTF-8, sans débordement ni erreur ; le lien vers le prototype local fonctionne. [Résultats](checks/20261015-render/local-served-results.json).
  - Ouverte ainsi, la page n’a pas le squelette de la page publiée. Elle porte donc elle-même `meta charset`, `meta viewport` et la règle qui masque les éléments `hidden`. Sans ces lignes, le premier essai local montrait des accents cassés et le panneau de détail sous le schéma.
  - Elle reste en mode de compatibilité, faute de `<!doctype>`, que la page publiée ne doit pas contenir ; le rendu contrôlé est correct.
- **Premiers passages échoués, conservés ici pour mémoire** :
  - les défauts venaient du script de contrôle : mauvais conteneur des fiches, ancien bouton Retour masqué lu à la place du vrai, libellé « Signaler » suivi d’un texte de mesure caché, « Compte » confondu avec le bouton du compte ;
  - Chrome sans interface s’est aussi arrêté plusieurs fois (signal d’abandon) en préparant WebGL ; d’où un Chrome neuf par cas.
  - Aucun de ces échecs ne révélait un défaut du prototype.

## Limites

- **Origine du relevé** : la lecture du code par trois agents en lecture seule, puis les vérifications ci-dessus. Les 110 liens n’ont pas tous été cliqués : les 15 parcours couvrent les principaux.
- **Conditions de contrôle** : Chrome sans interface, formats émulés, mouvements réduits. Pas de téléphone physique ni de lecteur d’écran.
- **Modifications parallèles** : pendant le relevé, une autre session a modifié le prototype vers 16 h 08–16 h 09 (corrections de l’audit, états 145 puis 146). Ces corrections ne changent pas la structure de navigation. Le plan et les parcours correspondent à l’état `audit-fixes-146`.
- **Polices** : la page publiée charge Jost et IBM Plex Mono depuis Google Fonts, avec des polices de secours.

## Mise à jour du 15 octobre, soir — sélection de l’avis sur le design intégrée

Première application de la règle d’AGENTS.md. Mise à jour partielle, pas un nouveau relevé complet.

- **Changement constaté** : vers 16 h 57, une autre session intègre au prototype actif les neuf essais retenus par l’utilisateur. Deux fichiers sont ajoutés (`design-review-selection.css` et `.mjs`), et deux lignes changent dans chaque page d’entrée. Le contrôleur reste `audit-fixes-146`. Voir [les notes de l’intégration](../../site/notes/DESIGN_REVIEW_SELECTION_NOTES.md). Le plan, publié à 16 h 43, décrivait donc une page Awards vide qui n’existait plus.
- **Ce qui change dans le plan** :
  - **42 Awards** : la page passe de « vide » à « à venir ». Elle montre, sous l’icône du trophée, la phrase « Les 42 Awards arrivent bientôt. », sans lien. La recherche, le dé et le filtre y restent masqués. Un état `soon` est ajouté à la page et à l’en-tête des données.
  - **Profils** : les cartes montrent le pseudo seulement quand il existe ; la mention provisoire disparaît.
  - **Données** : l’état relevé (`meta`) devient « audit-fixes-146 avec la sélection de l’avis sur le design ».
  - **Pied de la page** : il reprend la nouvelle procédure.
  - Les écrans, les liens et les chemins restent les mêmes : **65 écrans, 110 liens**, jusqu’à 6 actions.
- **Ce qui n’entre pas dans le plan** : les autres essais intégrés sont visuels ou n’ajoutent, ne masquent ni ne déplacent aucune commande du plan. Il s’agit de la taille du globe, de la police des étiquettes, d’une colonne sous 360 px, des couleurs, des contours, des tailles de texte et de l’échelle.
- **Vérifications** :
  - contrôle de cohérence réussi ([résultat](checks/20261015-integration-data-check.json)) ;
  - **16/16 parcours** passent dans le prototype intégré, chacun dans un Chrome neuf, sans relance ([résultats](checks/20261015-integration-navigation/navigation-results.json)). Le 16e cas, ajouté pour l’occasion, vérifie la page Awards et les cartes de profils. La version précédente du script est conservée dans [navigation-check.20261015-avant.py](checks/navigation-check.20261015-avant.py) ;
  - rendu de la page sur 11 états, sans débordement ni erreur ([résultats et captures](checks/20261015-integration-render/)).
- **Republication** : au même lien, avec `site-map-data.js` (version 3 de la page publiée).

## Mise à jour du 23 octobre — tri du dépôt

Mise à jour partielle, pas un nouveau relevé complet. À la demande de l’utilisateur, le dépôt est rangé en dossiers explicites ([compte rendu](../reorganization-20261023/README.md)).

- **Changements** :
  - le plan passe de `work/visualizations/site-map/` à `docs/site-map/`, et le prototype actif de `work/visualizations/horizon-welcome/` à `site/` ; l’adresse locale du plan devient `http://127.0.0.1:8765/docs/site-map/` ;
  - le scanner du déchiffrement et son moteur sont copiés dans `site/decryption/`, et `entrance.mjs` les charge de là : la source de l’écran « Déchiffrement » devient `decryption/scanner-return-random.mjs` (auparavant `../decryption-examples/scanner-return-random.mjs`) ;
  - `welcome-panels.html`, signalé plus haut comme relié à rien, quitte le prototype pour `archives/early-prototypes/welcome-panels/`.
- **Ce qui change dans le plan** : le champ `src` de l’écran « Déchiffrement », l’emplacement du prototype dans « Ce que montre ce plan » (`site/`), les chemins du pied de page et de la procédure, et `localBase` (`../../site/`). Écrans, liens, libellés, adresses `#…` et chiffres restent les mêmes : **65 écrans, 110 liens**, jusqu’à 6 actions. `meta` n’est pas modifié : ce n’est pas un nouveau relevé.
- **Vérifications** :
  - contrôle de cohérence réussi ([résultat](checks/20261023-data-check.json)) ;
  - rendu de la page sur 11 états, sans débordement ni erreur, captures examinées ([résultats et captures](checks/20261023-render/)) ;
  - les parcours de `checks/navigation-check.py` ne sont pas rejoués : aucun parcours ni libellé ne change. Les chemins du script et de l’outil Chrome partagé sont corrigés pour la nouvelle arborescence.
- **Republication** : au même lien, avec `site-map-data.js` (version 4 de la page publiée).

