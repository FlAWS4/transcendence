# Parcours cliquables : correspondance plan du site → cadres Figma

Relevé hors ligne du 19 octobre 2026, préparatoire aux pages « 09 · Parcours · ordinateur » et « 10 · Parcours · mobile ». Aucun appel Figma, aucune modification du dépôt : lecture du plan du site (`site-map-data.js`, relevé du 15 octobre 2026 · prototype 0.0.1 pré-alpha, état audit-fixes-146 avec la sélection de l’avis sur le design), des plans de pages (`layouts/*.json`, cadres français clairs), des relevés du site (`dom/<zone>/<état>--<format>--fr-light.json.gz`), des scènes envoyées à Figma (`scenes/`) et du registre des cadres (`figma-ledger.json`).

Fichier de données : `parcours-correspondance.json` (même dossier). Les identifiants Figma (`figmaId`) viennent du registre et n’ont pas été relus dans le fichier.

## En bref

| | Ordinateur | Mobile |
|---|---|---|
| Cadres FR clairs dans les plans | 81 | 84 |
| Écrans du plan (65) qui ont au moins un cadre | 53 | 55 |
| Liens du plan (110) : zone retrouvée | 94 | 93 |
| … dont l’arrivée est relevée sur une autre page (au moins un départ) | 15 | 17 |
| Liens du plan : même bouton trouvé, libellé différent (Retour) | 6 | 6 |
| Liens du plan : sans zone | 3 | 4 |
| Liens du plan : automatiques (sans zone par nature) | 6 | 6 |
| Liens du plan : sans cadre de départ (aperçu direct) | 1 | 1 |
| Entrées `links` (les éléments toujours présents sont détaillés cadre par cadre) | 251 | 251 |
| … dont zones d’éléments toujours présents | 159 | 158 |
| Fenêtres et panneaux : cadres avec zone « Fermer » | 28 / 28 | 28 / 28 |
| Liens implicites : onglets fiche → onglet (zone / sans zone / onglet par défaut) | 10 / 0 / 3 | 6 / 4 / 3 |
| Liens implicites : ouverture de la recherche, étapes automatiques de l’entrée, Remonter en haut | 21, 12, 0 | 21, 12, 2 |

Toutes les zones retrouvées se trouvent dans le cadre et dans un nœud de la scène envoyée à Figma (même boîte, ou contenue dans l’instance qui la porte : menu du bas, carte, recherche, barre de périmètre). Le calcul a aussi été contrôlé à l’œil en dessinant les zones sur les captures du site (voir « Vérifications »).

## Lire le fichier JSON

- `screens.<id>.desktop|mobile` : cadres qui montrent l’écran, avec `name` (nom exact), `page`, `state`, taille, `height` (« pleine » ou « écran »), `role` (`base`, `variante`, `étape`, `origine`) et `figmaId`. `screens.<id>.base` donne le cadre de base par format. Fenêtres et panneaux : `close` (zone du bouton Fermer, `closeTo` = cadre de l’écran du dessous, `other` = Annuler ou Retour).
- `links` : un objet par lien du plan et par format, avec `fromFrame`, `toFrame`, `via` (libellé français du plan), `hotspot` (x, y, w, h en pixels du cadre), `status` et `evidence` (élément du relevé, nœud de la scène, raison du choix des cadres, `écart`, `recouvertPar`). Les liens des éléments toujours présents ont une entrée par cadre de départ (`fromScreen`). Champs facultatifs : `altHotspots` (autres zones du même lien), `alsoFrom` (même commande sur les variantes du départ), `before` (action sur place qui précède le lien).
- `implicitLinks` : liens que le plan implique sans les lister : ouverture de la recherche depuis chaque page, onglets (fiche → onglet, comme la page du plan), enchaînements automatiques des étapes de l’entrée, « Remonter en haut ».
- `tabBars` : pour chaque cadre de fiche, zones des onglets (ordinateur) ou du sélecteur « Dans ce … » (mobile) et cadre d’arrivée.
- `globals` : zones du logo, du menu du bas (5 boutons), de la recherche, du dé, du compte (et, en membre, bulle et cloche) et de « Remonter en haut » dans chaque cadre après l’entrée ; `startFrame` marque les cadres de base des pages et onglets.
- `unmatched` : écrans sans cadre, cadres qui ne sont pas l’état de base d’un écran, relevés sans cadre. `conflicts` : zones qui se recouvrent dans un même cadre avec des arrivées différentes.

**Coordonnées.** pixels du cadre (origine en haut à gauche). Cadre à la hauteur de l’écran (h ≤ 964 ordinateur, ≤ 848 mobile) : page vue depuis scroll[1], y = y_document − scroll[1]. Cadre pleine hauteur : document entier ; couches fixes dont le haut est sous la mi-hauteur de l’écran déplacées en bas du cadre (y + hauteur du cadre − hauteur de l’écran), comme dom2fig.fixed_y. Zone = partie visible (découpée par les ancêtres overflow et le cadre).

## Couverture des écrans

Cadre de base : l’état nommé comme l’écran, ou à défaut l’état stable (arrivée : message chiffré au repos). Les autres cadres sont listés dans le JSON.

| Écran du plan | Type | Base ordinateur | Base mobile | Autres cadres (ord. / mob.) |
|---|---|---|---|---|
| `arrival` Arrivée : message chiffré | page | Arrivée : message chiffré · message chiffré au repos | Arrivée : message chiffré · message chiffré au repos | 5 / 5 |
| `entry-signin` Connexion — prototype | overlay | Connexion — prototype | Connexion — prototype | 0 / 0 |
| `entry-signup` Création de compte simulée | overlay | Création de compte simulée | Création de compte simulée | 0 / 0 |
| `decrypt` Déchiffrement : BEYOND THE CODE | step | Déchiffrement : BEYOND THE CODE · à mi-parcours | Déchiffrement : BEYOND THE CODE · à mi-parcours | 2 / 2 |
| `opening` Logo 42, puis cercle | step | Logo 42, puis cercle · logo seul | Logo 42, puis cercle · logo seul | 3 / 3 |
| `world-wait` « Le monde se prépare… » | step | « Le monde se prépare… » | « Le monde se prépare… » | 0 / 0 |
| `reveal` Le cercle devient le globe | step | Le cercle devient le globe · à mi-parcours | Le cercle devient le globe · à mi-parcours | 1 / 1 |
| `entry-error` Le monde n’a pas pu se préparer | page | Le monde n’a pas pu se préparer | Le monde n’a pas pu se préparer | 0 / 0 |
| `content-preview` Aperçu direct (sans arrivée) | page | — | — | 0 / 0 |
| `g-logo` Logo 42 Horizon | global | — | — | 0 / 0 |
| `g-dock` Menu du bas | global | — | (variantes seules) | 0 / 2 |
| `g-search` Recherche | global | Recherche · ouverte | Recherche · ouverte | 0 / 0 |
| `g-die` Dé | global | — | — | 0 / 0 |
| `g-account` Compte (en-tête) | global | — | — | 0 / 0 |
| `g-back-top` Remonter en haut | global | — | Remonter en haut | 0 / 0 |
| `explore` Explorer · Monde | page | Explorer · Monde | Explorer · Monde | 0 / 0 |
| `explore-country` Explorer · Pays | page | Explorer · Pays | Explorer · Pays | 0 / 0 |
| `explore-campus` Explorer · Campus | page | Explorer · Campus | Explorer · Campus | 0 / 0 |
| `campus-sheet` Fiche campus | overlay | Fiche campus | Fiche campus | 1 / 1 |
| `campus-website` Site officiel du campus | external | — | — | 0 / 0 |
| `campus-directions` Itinéraire (Google Maps) | external | — | — | 0 / 0 |
| `campus-contacts` Contacts et sources officielles | external | — | — | 0 / 0 |
| `scope-popover` « Où veux-tu aller ? » | overlay | « Où veux-tu aller ? » | « Où veux-tu aller ? » | 0 / 0 |
| `about-dialog` « Une nouvelle façon d’explorer » | overlay | « Une nouvelle façon d’explorer » | « Une nouvelle façon d’explorer » | 0 / 0 |
| `campus-source` Source officielle des campus | external | — | — | 0 / 0 |
| `explore-noglobe` Explorer sans le globe | page | Explorer sans le globe | Explorer sans le globe | 0 / 0 |
| `campus-window` Fenêtre « Autour du campus » | overlay | Fenêtre « Autour du campus » | Fenêtre « Autour du campus » | 0 / 0 |
| `viewer` Visionneuse de médias | overlay | Visionneuse de médias | Visionneuse de médias | 0 / 0 |
| `report` Signaler | overlay | Signaler | Signaler | 1 / 1 |
| `comment-menu` Menu à trois points d’un commentaire | overlay | Menu à trois points d’un commentaire | Menu à trois points d’un commentaire | 0 / 0 |
| `projects` Liste des projets | page | Liste des projets | Liste des projets | 4 / 4 |
| `filter-projects` Filtrer les projets | overlay | Filtrer les projets | Filtrer les projets | 2 / 2 |
| `project` Fiche projet | page | Fiche projet | Fiche projet | 1 / 2 |
| `project-overview` Vue d’ensemble (cadre de la fiche) | tab | Fiche projet | Fiche projet | 1 / 1 |
| `project-implementation` Réalisation | tab | Réalisation | Réalisation | 0 / 0 |
| `project-media` Médias | tab | Médias | Médias | 0 / 0 |
| `project-test` Tester le projet | tab | Tester le projet | Tester le projet | 1 / 1 |
| `project-comments` Commentaires | tab | Commentaires | Commentaires | 3 / 3 |
| `campus-choice` Choisir un campus | overlay | Choisir un campus | Choisir un campus | 0 / 0 |
| `repo-link` Dépôt du projet | external | — | — | 0 / 0 |
| `people` Liste des profils | page | Liste des profils | Liste des profils | 3 / 3 |
| `filter-people` Filtrer les profils | overlay | Filtrer les profils | Filtrer les profils | 1 / 1 |
| `profile` Fiche profil | page | Fiche profil | Fiche profil | 2 / 1 |
| `profile-overview` Vue d’ensemble (cadre de la fiche) | tab | Fiche profil | Fiche profil | 2 / 0 |
| `profile-projects` Projets | tab | Projets | Projets | 1 / 1 |
| `profile-journey` Parcours | tab | Parcours | Parcours | 0 / 0 |
| `profile-contribution` Contribution | tab | Contribution | Contribution | 0 / 0 |
| `message-dialog` Envoyer un message | overlay | Envoyer un message | Envoyer un message | 0 / 0 |
| `social-links` Réseaux et liens | external | — | — | 0 / 0 |
| `journal` Liste des chroniques | page | Liste des chroniques | Liste des chroniques | 0 / 0 |
| `article` Chronique | page | Chronique | Chronique | 0 / 0 |
| `article-article` Article (cadre de la fiche) | tab | Chronique | Chronique | 0 / 0 |
| `article-media` Médias | tab | Médias | Médias | 0 / 0 |
| `article-authors` Auteurs | tab | Auteurs | Auteurs | 0 / 0 |
| `article-comments` Commentaires | tab | Commentaires | Commentaires | 1 / 1 |
| `awards` Page 42 Awards | page | Page 42 Awards | Page 42 Awards | 0 / 0 |
| `account-visitor` Panneau du compte · visiteur | overlay | Panneau du compte · visiteur | Panneau du compte · visiteur | 0 / 0 |
| `settings` Paramètres | overlay | Paramètres | Paramètres | 0 / 0 |
| `theme` Thème | overlay | Thème | Thème | 0 / 0 |
| `language` Langue | overlay | Langue | Langue | 0 / 0 |
| `signin-dialog` Connexion simulée | overlay | Connexion simulée | Connexion simulée | 0 / 0 |
| `signup-dialog` Création de compte simulée | overlay | Création de compte simulée | Création de compte simulée | 0 / 0 |
| `account-member` Panneau du compte · membre | overlay | Panneau du compte · membre | Panneau du compte · membre | 0 / 0 |
| `messages` Messagerie | overlay | Messagerie | Messagerie | 0 / 0 |
| `notifications` Notifications | overlay | Notifications | Notifications | 0 / 0 |

**Écrans sans cadre.**

- Ordinateur (12) : `content-preview` (point d’entrée séparé, content-preview.html : il ouvre directement la liste des projets, dont le cadre sert de départ) ; `g-logo` (élément toujours présent : zone donnée dans chaque cadre, voir globals) ; `g-dock` (présent dans les cadres des pages ; cadres dédiés seulement en mobile étroit) ; `g-die` (élément toujours présent : zone donnée dans chaque cadre, voir globals) ; `g-account` (élément toujours présent : zone donnée dans chaque cadre, voir globals) ; `g-back-top` (n’existe qu’en mobile, à 840 px et moins) ; `campus-website` (site externe) ; `campus-directions` (site externe, Google Maps) ; `campus-contacts` (liens externes : courriel, téléphone, sources) ; `campus-source` (site externe) ; `repo-link` (site externe : dépôt) ; `social-links` (liens externes ; aucun profil fictif n’en a).
- Mobile (10) : `content-preview` (point d’entrée séparé, content-preview.html : il ouvre directement la liste des projets, dont le cadre sert de départ) ; `g-logo` (élément toujours présent : zone donnée dans chaque cadre, voir globals) ; `g-die` (élément toujours présent : zone donnée dans chaque cadre, voir globals) ; `g-account` (élément toujours présent : zone donnée dans chaque cadre, voir globals) ; `campus-website` (site externe) ; `campus-directions` (site externe, Google Maps) ; `campus-contacts` (liens externes : courriel, téléphone, sources) ; `campus-source` (site externe) ; `repo-link` (site externe : dépôt) ; `social-links` (liens externes ; aucun profil fictif n’en a).

Les six liens externes s’ouvrent par une URL (action « ouvrir le lien ») ; l’aperçu direct n’est pas un écran du parcours : il ouvre la liste des projets.

## Liens sans zone retrouvée

- mobile · `g-search` → `profile` « Résultat « Profil » » : le résultat « Leïla Mansour 42 Paris · Cadet · Systèmes Profil » est sous la partie visible de la liste défilante
- ordinateur · `campus-sheet` → `campus-website` « Site officiel du campus » : le lien est dans le relevé, plus bas dans le volet : hors de la partie visible (défilement interne) dans les cadres de la fiche campus
- mobile · `campus-sheet` → `campus-website` « Site officiel du campus » : le lien est dans le relevé, plus bas dans le volet : hors de la partie visible (défilement interne) dans les cadres de la fiche campus
- ordinateur · `profile-overview` → `social-links` « Un lien de « Réseaux et liens » » : aucun profil fictif n’a de réseaux (constat du plan) : aucun lien dans les cadres
- mobile · `profile-overview` → `social-links` « Un lien de « Réseaux et liens » » : aucun profil fictif n’a de réseaux (constat du plan) : aucun lien dans les cadres
- ordinateur · `profile-contribution` → `article` « Carte d’une chronique » : Leïla Mansour n’a écrit aucune chronique : le cadre affiche « Pas encore de contribution aux chroniques. »
- mobile · `profile-contribution` → `article` « Carte d’une chronique » : Leïla Mansour n’a écrit aucune chronique : le cadre affiche « Pas encore de contribution aux chroniques. »

Automatiques (pas de clic : « après un délai » dans Figma) : déchiffrement → logo, logo → globe, logo → « Le monde se prépare… », attente → globe, attente → erreur, globe → Explorer, dans les deux formats. Les deux suites qui partent du « cercle complet » (globe prêt ou non) et de « Le monde se prépare… » (prêt ou échec) ne peuvent pas être toutes deux « après un délai » sur le même cadre : il faudra en choisir une par cadre. L’aperçu direct (`content-preview` → Projets) n’a pas de cadre de départ.

## Boutons Retour : même zone, libellé différent

Les fiches relevées ont été ouvertes par un lien direct : leur bouton affiche « Retour aux projets », « Retour aux profils » ou « Retour aux chroniques ». Les retours qui dépendent de l’origine (« Retour au profil », « Retour aux projets » depuis un profil, « Retour au projet », « Retour à l’article »…) ont la zone de ce même bouton, statut « libellé différent » : aucun cadre ne montre ces libellés. Piste, non décidée : l’action « Back » de Figma, qui revient au cadre précédent, reproduit ce comportement sans multiplier les zones.

- `project` → `profile` « Retour au profil » : le cadre affiche « Retour aux projets »
- `profile` → `projects` « Retour aux projets » : le cadre affiche « Retour aux profils »
- `profile` → `journal` « Retour aux chroniques » : le cadre affiche « Retour aux profils »
- `profile` → `project` « Retour au projet » : le cadre affiche « Retour aux profils »
- `profile` → `article` « Retour à l’article » : le cadre affiche « Retour aux profils »
- `article` → `profile` « Retour au profil » : le cadre affiche « Retour aux chroniques »

## Arrivées relevées sur une autre page

Chaque fenêtre n’a été relevée qu’une fois, sur une page donnée. Selon la décision du 18 octobre (« mener à l’écran relevé exact, pas une superposition »), le lien mène à ce cadre, même quand le départ est une autre page. Fenêtres concernées (deux formats) :

- `campus-sheet` → `viewer` « Une photo » : la fenêtre d’arrivée est relevée sur #projects/minishell-under-the-prompt, le départ est #explore?country=FRA&campus=paris.
- `explore-country` → `scope-popover` « Pastille du pays ▾ » : la fenêtre d’arrivée est relevée sur #explore, le départ est #explore?country=FRA.
- `explore-campus` → `scope-popover` « Pastille du campus ▾ » : la fenêtre d’arrivée est relevée sur #explore, le départ est #explore?country=FRA&campus=paris.
- `campus-window` → `campus-sheet` « Viseur du campus » : la fenêtre d’arrivée est relevée sur #explore?country=FRA&campus=paris, le départ est #projects/minishell-under-the-prompt.
- `comment-menu` → `report` « Signaler » : la fenêtre d’arrivée est relevée sur #projects/ft-transcendence-building-together, le départ est #projects/minishell-under-the-prompt?tab=comments.
- `campus-choice` → `campus-window` « Un campus de la liste » : la fenêtre d’arrivée est relevée sur #projects/minishell-under-the-prompt, le départ est #projects/ft-transcendence-building-together.
- `profile` → `viewer` « Portrait » : la fenêtre d’arrivée est relevée sur #projects/minishell-under-the-prompt, le départ est #people/profile-leila-mansour.
- `profile-overview` → `campus-window` « Explorer + nom du campus, bloc « À 42 » » : la fenêtre d’arrivée est relevée sur #projects/minishell-under-the-prompt, le départ est #people/profile-leila-mansour.
- `article` → `campus-window` « Explorer + nom du campus » : la fenêtre d’arrivée est relevée sur #projects/minishell-under-the-prompt, le départ est #journal/journal-share-the-unfinished.
- `article` → `report` « Signaler » : la fenêtre d’arrivée est relevée sur #projects/ft-transcendence-building-together, le départ est #journal/journal-share-the-unfinished.
- `article-article` → `viewer` « Illustration principale » : la fenêtre d’arrivée est relevée sur #projects/minishell-under-the-prompt, le départ est #journal/journal-share-the-unfinished.
- `article-media` → `viewer` « Une image de la galerie » : la fenêtre d’arrivée est relevée sur #projects/minishell-under-the-prompt, le départ est #journal/journal-share-the-unfinished?tab=media.
- `article-comments` → `comment-menu` « Publier, puis les trois points » : la fenêtre d’arrivée est relevée sur #projects/minishell-under-the-prompt?tab=comments, le départ est #journal/journal-share-the-unfinished?tab=comments.
- Éléments toujours présents : le panneau du compte et la recherche sont relevés sur la liste des projets ; depuis une autre page, leur cadre montre cette liste en dessous.

Pages :

- `journal` → `profile` « Auteur d’une carte (« Rédigé par ») » (mobile seulement) : le lien cliqué ouvre #people/profile-ines-morel ; le cadre d’arrivée montre #people/profile-leila-mansour. Aucun cadre « statut Alumni » en mobile.
- `article-authors` → `profile` « Un auteur » (mobile seulement) : le lien cliqué ouvre #people/profile-ines-morel ; le cadre d’arrivée montre #people/profile-leila-mansour. Aucun cadre « statut Alumni » en mobile.
- Recherche, « Résultat « Chroniques » » : le seul résultat visible (« Suivre un événement · Ce que nous transmettons ») ouvre une autre chronique que celle du cadre « Chronique ».

## Zones en conflit (une zone, plusieurs arrivées)

- Écran d’erreur, icône du compte : « Compte, puis Se connecter » et « Compte, puis Créer un compte » (2 cadres). Sur le site, l’icône ouvre un menu qui n’a pas de cadre.
- Boutons Retour : 24 paires de liens sur la même zone (fiches projet, profil et chronique, deux formats), voir ci-dessus.
- « Où veux-tu aller ? », liste « Pays » : « Tous les pays » et « Choisir un pays » (2 cadres), deux choix de la même liste native, dont les options ne sont pas dessinées.

## Choix faits

- **Cadres de base.** État nommé comme l’écran ; arrivée = « message chiffré au repos » (état stable) ; déchiffrement = « à mi-parcours » (premier cadre) ; ouverture = « logo seul » (commun aux deux accès) ; cercle → globe = « à mi-parcours ».
- **Entrée.** Ordre automatique des cadres (`implicitLinks.sequences`, « après un délai ») : scan binaire → hexadécimal → remontée → message au repos → libellés anglais → libellés arabes → message au repos (boucle des libellés) ; déchiffrement à mi-parcours → phrase finale → vers le logo (membre) → logo seul ; « Visiter » → parcours visiteur → logo seul ; logo seul → tracé du cercle → cercle complet → (globe prêt) cercle → globe à mi-parcours → fin → Explorer. « Réessayer » mène au « logo seul ». Les boutons Se connecter et Visiter sont visibles sur les six cadres de l’arrivée (`alsoFrom`). Le fond de l’arrivée change le thème sur le site : non relié (le thème passe par les modes).
- **Fiche projet.** Base = ft_transcendence (plusieurs campus, carte 1 de la liste). Les onglets relevés sont ceux de minishell : les liens d’onglets, « Explorer 42 Paris » et l’illustration partent donc du cadre « projet à campus unique » (minishell), pour que l’arrivée montre la même fiche. La carte de minishell (carte 2) mène à ce cadre (`altHotspots`).
- **Cadre d’arrivée.** Pour une page : celui dont l’adresse correspond au lien cliqué (cartes, auteurs, résultats) ; pour une fenêtre : celle relevée sur la même page que le départ (Signaler depuis un profil → « Signaler · depuis un profil » ; Filtrer de l’onglet Projets d’un profil → « Projets · filtre local ouvert ») ; sinon le cadre de base.
- **Cartes.** Zone principale = image de la carte, titre en zone alternative ; cartes de profils : la carte entière (pas de lien dans le relevé). Inès Morel et Noé Laurent mènent à leurs cadres « statut Alumni » et « statut Transcender » (ordinateur seulement).
- **Liens en deux actions.** Commentaires : départ = cadre « avec un fil », et `before` donne le bouton « Ajouter » du cadre vide qui y mène. Dépôt : départ = « lien enregistré », `before` = « Enregistrer ». Connexion et création de compte simulées → panneau membre directement (la page en membre intermédiaire n’a pas de cadre). Compte de l’écran d’erreur → fenêtres de connexion ou de création (menu non relevé).
- **Éléments toujours présents.** Liens donnés depuis le cadre de base de chaque page et onglet après l’entrée (plus le cadre minishell), avec les exceptions du plan (bouton de la rubrique en cours, dé selon la rubrique, recherche et dé masqués sur 42 Awards). Aucun lien global depuis les fenêtres et panneaux ; leurs zones restent dans `globals`. Liens du membre (avatar, bulle, cloche) : depuis les trois panneaux membre, seuls cadres en membre. Le dé de « Explorer sans le globe » est grisé (opacité 0,42) : statut « grisé ».
- **Recherche.** Ouverture depuis chaque page (`implicitLinks.searchOpener`) vers « Recherche · ouverte », relevée avec la saisie « Paris » ; résultats choisis pour ouvrir un cadre relevé (42 Paris → Explorer · Campus, « Derrière une ligne de commande » → minishell, Leïla Mansour → sa fiche).
- **Fermer.** Bouton Fermer (ou « Fermer la carte », « Fermer le média », « Fermer les filtres », « Fermer la recherche ») ; menu à trois points : le bouton à trois points, qui le rebascule. Arrivée = cadre de la page sous la fenêtre (même adresse). Paramètres, Thème et Langue : « Retour » mène à l’accueil du panneau.
- **Mobile.** Les onglets sont dans le sélecteur « Dans ce projet / ce profil / cet article » : les liens d’onglets partent des cadres « sélecteur ouvert » (projet ft_transcendence, profil de Leïla). Aucun cadre ne montre le sélecteur ouvert d’une chronique : les onglets des chroniques n’ont pas de zone en mobile, et « Commentaires » du sélecteur projet est masqué par son défilement.
- **Visibilité.** Une zone compte si au moins 30 % de l’élément est dessiné dans le cadre (découpe par le cadre et les blocs défilants). Le résultat « Leïla Mansour » de la recherche mobile (14 px visibles) est donc « sans zone ».

## Cadres qui ne sont pas l’état de base d’un écran

Tous les cadres FR clairs correspondent à un écran du plan : aucun n’est hors plan. 64 ne sont pas l’état de base de leur écran :

- `arrival` (variante, mobile et ordinateur) : Arrivée : message chiffré · libellés en anglais ; Arrivée : message chiffré · libellés en arabe
- `arrival` (étape, mobile et ordinateur) : Arrivée : message chiffré · scan · binaire ; Arrivée : message chiffré · scan · hexadécimal ; Arrivée : message chiffré · scan · remontée
- `decrypt` (étape, mobile et ordinateur) : Déchiffrement : BEYOND THE CODE · phrase finale ; Déchiffrement : BEYOND THE CODE · vers le logo (membre)
- `opening` (étape, mobile et ordinateur) : Logo 42, puis cercle · cercle complet ; Logo 42, puis cercle · parcours visiteur ; Logo 42, puis cercle · tracé du cercle
- `reveal` (étape, mobile et ordinateur) : Le cercle devient le globe · fin
- `campus-sheet` (variante, mobile et ordinateur) : Fiche campus · 42 Mulhouse ; Fiche campus · déployée
- `project-comments` (variante, mobile et ordinateur) : Commentaires · avec un fil ; Commentaires · suggestions de mention ; Commentaires · tri ouvert
- `filter-projects` (variante, mobile et ordinateur) : Filtrer les projets · déployée
- `project` (variante, mobile et ordinateur) : Fiche projet · projet à campus unique ; Fiche projet · sélecteur « Dans ce projet » ouvert
- `project-test` (variante, mobile et ordinateur) : Tester le projet · lien enregistré
- `projects` (variante, mobile et ordinateur) : Liste des projets · dernière page ; Liste des projets · tri ouvert ; Liste des projets · vue Liste ; Liste des projets · état vide
- `filter-people` (variante, mobile et ordinateur) : Filtrer les profils · déployée
- `people` (variante, mobile et ordinateur) : Liste des profils · dernière page ; Liste des profils · tri ouvert ; Liste des profils · vue Liste
- `profile` (variante, mobile et ordinateur) : Fiche profil · statut Alumni ; Fiche profil · statut Transcender ; Fiche profil · sélecteur de rubriques ouvert
- `filter-projects` (origine, mobile et ordinateur) : Projets · filtre local ouvert
- `report` (origine, mobile et ordinateur) : Signaler · depuis un profil
- `article-comments` (variante, mobile et ordinateur) : Commentaires · avec un fil
- `g-dock` (variante, mobile) : Menu du bas · fenêtre de 300 px ; Menu du bas · téléphone de 320 px

Ils servent quand une zone n’existe que là (variantes `alsoFrom`, départs imposés) ou comme cadres d’actions sur place que le plan ne liste pas (tri, vue Liste, pagination, filtres déployés, suggestions de mention). Ces actions sur place n’ont pas été reliées.

## Relevés sans cadre Figma : le parcours membre

18 relevés du lot « member » (member-account, member-article, member-awards, member-explore, member-journal, member-people, member-profile, member-project, member-projects) existent dans `dom/shell/` mais aucun cadre ne les montre dans les plans `layouts/*.json`. Le 18 octobre, l’utilisateur a demandé de « relever les écrans membre » pour le parcours : ces relevés sont faits, les cadres non. Conséquence : après la connexion simulée, seuls les trois panneaux membre (compte, messagerie, notifications) sont en membre ; les pages (Explorer, listes, fiches, 42 Awards) et la fiche « Compte » de Leïla n’existent qu’en visiteur.

## Vérifications

- Cohérence : chaque cadre cité existe dans les plans avec ce nom et cette page ; chaque zone est dans son cadre ; les 165 cadres ont une scène de même taille et un identifiant au registre.
- Scènes : 332 zones de liens ont un nœud de même boîte dans la scène du cadre, 207 sont contenues dans l’instance qui les porte, 0 sans nœud.
- Toutes zones confondues (liens, zones alternatives, variantes, actions préalables, Fermer, onglets, éléments toujours présents) : 2028 sur 2028 sont dans leur cadre et dans un nœud de la scène plus petit que le cadre.
- Contrôle visuel : zones dessinées sur les captures du site pour 112 cadres (`verif/`) ; 8 examinées à l’œil, toutes alignées : liste des projets ordinateur pleine hauteur (menu du bas, recherche et dé en bas du cadre), fiche projet mobile pleine hauteur, menu d’un commentaire mobile (défilé de 676 px), visionneuse mobile (défilée de 163 px), sélecteur « Dans ce projet » ouvert, fiche campus déployée, Explorer · Monde mobile, recherche ouverte mobile.
- Recouvrements : un seul repéré, sur Explorer · Monde mobile, où le repère de la France (14 × 14 px) est sous l’étiquette « Luxembourg ».

## Volume pour la construction des deux pages

| | Ordinateur | Mobile |
|---|---|---|
| Cadres reliés (départ ou arrivée) | 71 | 73 |
| Zones de lien du plan vers un cadre (éléments toujours présents détaillés) | 236 | 235 |
| Zones vers un site externe | 4 | 4 |
| Zones alternatives | 12 | 7 |
| Même commande sur les variantes (`alsoFrom`) | 55 | 48 |
| Actions préalables (`before`) | 5 | 5 |
| Liens implicites avec zone (onglets, recherche, remonter) | 31 | 29 |
| Fermer, Annuler, Retour de panneau | 43 | 43 |
| Enchaînements automatiques | 18 | 18 |
| Total des interactions | 404 | 389 |

Les zones des barres d’onglets entre onglets (`tabBars`) s’y ajoutent si les onglets doivent mener les uns aux autres.

## Limites

- Hors ligne : les cadres et identifiants n’ont pas été relus dans Figma ; un changement fait dans le fichier après les scènes ne serait pas vu.
- Les zones viennent des relevés du site ; les cadres Figma en sont construits (scènes), aux limites de rendu connues près.
- Les libellés comparés sont ceux du plan : le plan dit « Publier, puis… » pour les commentaires, le bouton du site s’appelle « Ajouter ». Écart signalé, plan non modifié.
- Les options des listes natives (« Où veux-tu aller ? », « Motif du signalement ») ne sont pas dessinées dans les cadres.

