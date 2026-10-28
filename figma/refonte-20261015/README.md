# Refonte des maquettes Figma — 15 au 23 octobre 2026

## Demande et choix

**Demande explicite de l'utilisateur (15 octobre)** : mettre à jour le projet Figma, dont les visuels sont en retard sur le site. Il demande :
- de refaire absolument tout ;
- de tout organiser parfaitement ;
- en priorité, l'arrivée avec le décryptage, Explorer, Projets et Profils.

**Ses choix** :
- **Nouveau fichier**. L'ancien fichier `yFrdllVm6nrKZJ2c99MMjT` reste intact comme archive de recherche.
- **Déclinaisons complètes** :
  - chaque écran sur ordinateur (1440 × 960) et sur mobile (390 × 844), en clair et en sombre, en français ;
  - l'arabe (miroir RTL) pour chaque écran principal ;
  - l'anglais par le mode « English » des textes, sans cadres en double. **Remplacé le 18 octobre** (décision de l'utilisateur, après l'audit des écarts : le site anglais déplace des boîtes) : des **cadres anglais pour chaque état** relevé en anglais, construits comme les rangées arabes.

**Fichier Figma** : [42 Horizon — Maquettes (octobre 2026)](https://www.figma.com/design/2iWoG3h7SegFmchssYAV80), clé `2iWoG3h7SegFmchssYAV80`. Il est dans les brouillons de l'utilisateur (équipe « The Last Dance », offre Pro, siège complet). Les identifiants réels renvoyés par Figma sont dans [`figma-ledger.json`](figma-ledger.json) : ne jamais les deviner.

## Méthode

Le site est la source. Chaque état d'écran est relevé dans le prototype actif, puis redessiné en calques Figma modifiables. Aucune capture d'écran n'est collée dans les maquettes ; les captures servent de référence et de contrôle.

1. **Relevé** (`scripts/capture_lib.py` et `scripts/capture_<zone>.py`, Chrome sans interface avec les garde-fous mémoire de `design-review-studies/checks/helper.py`). Pour chaque état, il produit :
   - une capture PNG (`reference/<zone>/`) ;
   - un relevé complet de chaque élément visible (`dom/<zone>/*.json.gz`, non versionné) : boîte, styles calculés, lignes de texte, SVG complets, tracé des formes, clé stable par élément.

   Chaque état existe en FR clair, FR sombre, EN clair, AR clair, et AR sombre pour les écrans principaux. À l'arrivée, le message dessiné dans un `<canvas>` est relevé glyphe par glyphe (`dom/entrance/*.canvas.json`).
2. **Couleurs** (`scripts/build_palette.py` → `palette.json`) :
   - chaque couleur peinte est appariée entre clair et sombre pour le même élément ;
   - une paire égale à une propriété CSS du site prend son nom (« Rôles/text » ↔ `--h42-color-text`) ;
   - les autres deviennent des « dérivées/<rôle>/<clair>-<sombre> » ;
   - les éléments visibles seulement en sombre (contour, fond, ombre) reçoivent une variable transparente en clair.
3. **Conversion** (`scripts/dom2fig.py` → `scenes/*.json`) : cadres, textes, icônes, illustrations et portraits.
   - Les textes FR/EN/AR sont appariés et liés aux variables « 42 · Textes ».
   - L'auto-layout n'est appliqué que là où les positions mesurées le prouvent.
   - Les chiffres du scan sont les contours exacts de DejaVu Sans Mono (`assets/entrance/`).
4. **Ressources** (`scripts/assets.py`) : icônes intégrées, illustrations, portraits, glyphes et anneau de l'entrée deviennent des composants de la page « Icônes et marque ».
5. **Mise en page** (`scripts/layout.py` → `layouts/<zone>.json`) :
   - une section par écran du plan du site ;
   - une ligne par état, dans l'ordre du parcours ;
   - quatre colonnes : Ordinateur Clair, Ordinateur Sombre, Mobile Clair, Mobile Sombre ;
   - les cadres sombres sont des clones avec le mode « Sombre ».
6. **Appels Figma** (`scripts/make_call.py`, `scripts/render.js`) : chaque appel de `calls/` est autonome. Il contient les données d'un ou plusieurs écrans (`const S`, `const X`), puis le moteur lui-même (`scripts/render.inline.js`).
   - Le moteur est compacté par `scripts/build_renderer.cjs` avec esbuild ; à défaut, `make_call.py` reprend `render.js` sans commentaires.
   - Jusqu'au 15 octobre, le moteur était stocké dans le nœud de texte `4:3` du fichier, puis évalué. Le 16, le classificateur de permissions a refusé d'y installer la version 6, avec le motif « Create RCE Surface ». Ce refus n'est pas contourné : plus rien n'est stocké ni évalué depuis le document (voir `_superseded/appels-moteur-stocke-20261016/`).
   - Tout est rejoué hors ligne avant l'envoi : `node scripts/sim_figma.mjs <appels>`.
7. **Envoi** : le workflow [`scripts/courier-workflow.js`](scripts/courier-workflow.js) confie chaque appel à un agent « coursier » neuf, selon [`COURIER.md`](COURIER.md). Celui-ci recopie l'appel à l'identique, contrôle la recopie (`scripts/verify_sent.py`), consigne le résultat brut dans `call-results/` et arrête sa chaîne à la première erreur.
8. **Contrôle** : `scripts/section_frames.py` découpe chaque cadre d'une capture de section et le met à côté de la capture du site. Depuis le 16 octobre, il détecte la marge de l'export et mesure aussi les dérives de teinte. Depuis le 18 octobre : `--frame <zone> <nom exact du cadre> <png> <dossier>` compare l'export d'un seul cadre (échelle tirée de l'export, origine 0) ; les descendants des calques fixes et collants qui dépassent leur boîte sont masqués aussi (`--own-masks` redonne les masques d'avant) ; un cadre de la hauteur de l'écran est comparé entier à la capture de cette hauteur. Les cadres anglais sombres n'ont pas de capture de référence (aucun relevé `en-dark`). Le workflow [`verification/verify-workflow.js`](verification/verify-workflow.js) confie l'examen à quatre comparateurs, puis à une synthèse des corrections.

### Compléments du 18 octobre (passe complète, voir [PASSE-COMPLETE.md](PASSE-COMPLETE.md))

- **Composants** (`scripts/components.py`) : un élément d'une famille (menu du bas, capsule, dé, fil, marque, bouton du compte, favori, signaler, « +N », pagination, boutons de la barre d'outils, bouton Retour, cartes) devient une instance **seulement si son sous-arbre est identique** à une variante de la bibliothèque (au 0,1 px près, couleurs, effets et mots des trois langues compris) ; sinon il reste à plat. Les variantes sont construites par le même moteur que les écrans (`render.js`, mode bibliothèque), dans les modes de leur scène d'origine. `collect` → `library` → `calls` → envoi → `record` ; ensuite `dom2fig` pose des nœuds d'instance « C ». Une instance repasse à plat quand son parent remonterait ses descendants à `z-index` (`hoist_z`) ou quand son verre est sous un voile. Essai 970 à 975 (Archives) : écrans à plat et avec instances identiques au pixel en clair, sombre et anglais.
- **Verre sous un flou plus faible** (voile `::backdrop` d'une fenêtre) : Figma ignore le flou d'arrière-plan d'un calque sous un autre. `dom2fig.glass_under_blur` marque ces verres ; `render.js glassCopies` leur donne une copie de ce qui est peint avant eux, limitée à leur boîte et reflétée en miroir sur les bords (règle de Chrome), floutée comme un calque. Essais 976 à 978.
- **Saturation du verre** (`saturate(1.15)`, décision de l'utilisateur) : shader d'effet `shaders/saturation-du-verre.main.ts` dans la bibliothèque du compte ; un effet SHADER transforme le rendu de son calque, flou d'arrière-plan compris (essai 441:15353). Chaque verre est séparé en « Verre · flou » (flou + shader) sous « Verre · surface » (`render.js splitGlass`, option `glassSplit`) ; l'effet peut être posé sur place ensuite (`make_call.py saturation`). Construction du shader en attente : service de Figma indisponible.
- **Globe ancré** : relevé avec le vrai globe ; `#globe` est construit depuis le relevé (vue « Monde » du format réduite par la transformation du site, découpe circulaire, repères), les textes de moins d'un pixel étant vectorisés (`render.js`, corps minimal de 1 dans Figma).
- **Textes** : fusion des morceaux d'une ligne coupée par un `<bdi>` dans les écrans de gauche à droite (`bdi_runs`) ; liaison de secours d'un texte relevé en français seulement par les tables de traduction du site (`scripts/site_copy.cjs` → `site-copy.json`) et par les variables déjà envoyées ; espaces fines U+202F (police Noto Sans et interlettrage mesurés dans Figma) ; chiffres tabulaires par des styles créés à la main par l'utilisateur (`scripts/tabular_styles.py`) ; saut des jambages des soulignements ; premières lignes de base calées sur la grille de Chrome (essai 983 : écart moyen 1,334 → 1,248 sur la liste des projets, 5,71 → 5,14 dans les textes ; le calage des boîtes, essai 982, n'apportait rien et multipliait les variantes de composants : retiré).
- **Relevé** : `font-variant-numeric`, `font-feature-settings`, `mask-image`, `text-decoration-skip-ink` ; éléments de moins d'un demi-pixel gardés dans `#globe` ; création de compte de l'arrivée en anglais et en arabe ; lot « member » (écrans principaux après la connexion simulée, pour le parcours membre).
- **Relecture contradictoire et correctifs (après-midi)** : 20 relecteurs et vérificateurs ont confirmé 14 défauts importants et 28 mineurs ; ils sont corrigés par quatre groupes de fichiers, chacun contre-vérifié (`_superseded/scripts-avant-correctifs-revue-20261018/` garde l'état d'avant). Les principaux :
  - **composants** : cartes et paginations deviennent des instances (les « C » imbriqués sont lus à plat pour la signature) ; la famille « barre d'outils » est retirée (.cp-toolbar ne peint rien ; ses boutons restent la famille « declencheur ») ; `components.py record` réunit les résultats de tous les appels d'une famille, enregistre les signatures (`sigs`) et refuse un résultat avec un style tabulaire manquant ou un mode faux ; `library()` ne garde que les identifiants dont la signature correspond ; `COMPONENTS_IDS_FILE` prend la forme `{famille: {variants, sigs}}` ; noms des appels de bibliothèque réduits à `[a-z0-9-]` ; une relance d'appel de bibliothèque interrompu réutilise les jeux déjà faits ; un appel de bibliothèque qui demande un style « chiffres tabulaires » absent échoue avant toute création ;
  - **enchaînement** : `rendu_complet.py chains` rend `{ pre, chains }` (variables de texte et d'ombre d'abord, tri par numéro au-delà de 999) ; `scenes` écrit l'appel des variables d'ombre ; un appel de textes en conflit avec Figma échoue au lieu de créer « nom (2) » ; un texte envoyé par son seul nom et absent de Figma est signalé dans `missing.strings` ;
  - **convertisseur** : liaison de secours sans les textes identiques dans les trois relevés (« Français » de la liste des langues n'est plus lié) ; pas de médaillon du globe sur l'Explorer du membre ; calage des lignes de base suivant Chrome sous les translations entières (lettres d'HORIZON, menu du bas) et, dans la carte, dans le repère local de `.hg-pin` puis sur la grille de l'appareil (libellés des repères : 92 mesurés, 0,004 px au plus) ; ☺ et ↗ calés comme leur texte ; cercle du globe ancré mesuré depuis l'élément ; table de secours relue quand elle change ; fusion `<bdi>` vérifiée dans les deux langues ;
  - **moteur** : verre percé (« Voile percé ») séparable et copie du fond percée sous un voile ; enveloppe « Sans rognage » sans les marqueurs de nom ; mises à jour de variables de texte avec chargement de la police réclamée (moteur et appel de textes) ; `scrollBehavior` compté quand il manque (`stats.scrollErrors`, à vérifier dans Figma pour les parcours) ;
  - **relevé** : test exact de « 0 jobs remaining » (« 10 » le reconnaissait), tâches restantes signalées ; écrans membre en clair, sombre, anglais et arabe, et écran « Compte » du membre (`member-account`) ; `site_copy.cjs` ne lit plus que les modules que chargent les deux pages (718 triplets) ; `tabular_styles.py` arrondit comme `Math.round` et donne les valeurs exactes ; plan des rues des cadres anglais repris du plan français.
  Restent notés : le globe ancré au niveau d'un campus (écran « Compte » du membre) n'a pas de vue des rues ; l'horloge et `mask-composite` demandent de modifier `capture_lib.py`, ce qui invaliderait le relevé : à faire seulement s'il faut relever de nouveau.
- **Globe vectoriel, liserés et fondu (fin d'après-midi)** : Figma rend les traits fins avec une épaisseur quantifiée au quart de pixel (essai 484:18871 : 0,1 px disparaît). L'essai du globe réel (appel 990, `verification/globe-liseres-20261018/`) montre qu'aucun liseré unique ne donne à la fois les îlots et l'encre des côtes du site. `globe_svg.py` sépare donc les petits anneaux (boîte ≤ 1 × 1 px, et les anneaux réduits à un point) dans le chemin `land-islets`, au liseré épais (0,5 ordinateur, 0,3 mobile), des côtes de `land-union`, au liseré fin (0,3 et 0,1) ; estimation sur les captures Figma de l'essai : 458/459 îlots et encre des côtes 1,003 sur ordinateur, 322/324 et 1,017 sur mobile (contre 448 et 301 avant). Le fondu des vues Pays devient un masque alpha de la carte (appels séparés) : avec la copie floutée du bord, l'écart des bandes tombe de 10,2 à 1,9 niveaux d'après la contre-vérification ; le masque reste linéaire comme le CSS. Mise à jour des 4 composants : 33:19 par les appels 1164 (48), puis réparé en place ; les trois autres par 1170 à 1174, régénérés. **Constat en route** : une couleur liée à une variable (Globe/frontières) impose l'alpha de la variable et efface l'opacité de la peinture ; les classes de frontières étaient donc peintes à l'opacité 1 (401/459 îlots mesurés sur 33:19). Le « gain de trait de Figma » de 0,2 px ajusté le 16 venait de là : il passe à 0, et l'opacité de classe est portée par le calque. Après réparation, 33:19 donne 457/459 îlots, côtes 0,984 sur la frange arctique, frontières 0,87 à 1,04. Versions d'avant dans `_superseded/globe-avant-liseres-20261018/` et `_superseded/appels-globe-avant-opacites-20261018/`.
- **Moteur et appels** : `make_call.py` construit à la demande la variante du moteur utile à chaque appel (bibliothèque, copies du verre, espaces fines) ; le moteur ne contient plus aucun caractère invisible ni échappement `\u` (les coursiers en refusaient ou en décodaient : appels 979 et 980) ; les variables de texte nouvelles d'un rendu sont créées par des appels préalables (`make_call.py strings`, appelé par `layout.py scenes`), pour que des chaînes parallèles ne se devancent pas (appel 977).

## Contraintes connues

- **Quota Figma** : sur l'offre Pro, environ 200 appels par jour et 10 par minute. La refonte complète s'étale donc sur plusieurs jours. Chaque appel regroupe plusieurs écrans, jusqu'à environ 44 000 caractères.
- **Envoi d'images** : `upload_assets` puis `curl` vers `mcp.figma.com` avait été refusé par le contrôle de sécurité automatique. Le 16 octobre, l'utilisateur a autorisé l'envoi d'images dans Figma :
  - photos de 42 Paris et 42 Mulhouse : fichiers du prototype ;
  - plan des rues : la carte seule, capturée sans l'interface par [`scripts/capture_maps.py`](scripts/capture_maps.py), en clair et en sombre, en arabe aussi pour « Explorer · Campus » (`assets/maps/`) ;
  - les images sont posées comme remplissage des emplacements, par `upload_assets` avec les identifiants des calques ;
  - **versionnement** (décision de l'utilisateur, 16 octobre) : les PNG ne sont pas versionnés. Il s'agit des captures de `reference/`, des planches de `verification/`, des captures Figma de `call-results/` et des captures archivées de `_superseded/` ; voir [`.gitignore`](.gitignore), qui excluait déjà `dom/`. Les scripts les régénèrent. Restent versionnables, environ 30 Mo : scripts, relevé, scènes, appels, résultats, index, synthèses, `assets/` ;
  - **fait le 16 octobre, 15 h 49 UTC** : les 28 emplacements d'Explorer sont remplis, soit 20 plans (clair, sombre, arabe) et 8 photos. Ils sont renommés « Plan du campus · carte du site » et « Image · … ». Leurs empreintes sont dans `figma-ledger.json` (« images »), pour qu'un nouveau rendu les repose sans renvoi. La fiche campus ne s'écarte plus du site que de 0,3 à 1,3 % des pixels, contre environ 28 % avec les emplacements vides.
  - Sans cet envoi, les photos des campus et la vue Campus avec les rues restent des emplacements nommés « à remplacer ».
  - Le globe est redessiné en vectoriel à partir de la géographie locale.
- **Polices du navigateur** : à l'arrivée, l'arabe et la police à chasse fixe dépendent du système. Figma reproduit ce que Chrome affiche ici :
  - Noto Sans Arabic Regular ;
  - les contours exacts des chiffres DejaVu Sans Mono.

## Avancement

Le détail est dans [`figma-ledger.json`](figma-ledger.json).

**Fait (15 octobre)** :
- pages ;
- 94 variables de couleur Clair/Sombre et 42 dérivées ;
- collection des textes ;
- 18 icônes du sprite, logo 42, HORIZON et AWARDS ;
- 19 ressources ;
- moteur de rendu ;
- premier écran d'essai (liste des projets, en cours de vérification).

**Fait (16 octobre, matin)** :
- **Arrivée et décryptage** : 84 cadres, en 8 sections et 7 lots (appels 014 à 020).
  - 42 cadres clairs, dont les lignes arabes du message chiffré et de l'écran d'erreur.
  - 42 clones sombres (appel 021).
  - Tous les envois réussis au premier essai ; statistiques identiques à la simulation.
- **Logo 42** réparé (appel 010) et 9 couleurs dérivées complémentaires (appel 011).
- **Couverture et guide** créés (appels 012 et 013).
- **Globe vectoriel** :
  - 3 variables « Globe/… » (appel 022) ;
  - composant Monde · ordinateur `33:19` (appel 023), conforme à la capture.

**Défaut trouvé et corrigé** : sur la couverture, le titre et le sous-titre étaient rognés (colonne figée à 10 px de haut par `resize()`). Le guide attribuait aussi à tort les chiffres du scan à Cousine. Correctifs envoyés en 030 et 031.

**Fait (16 octobre, suite)** :
- **Arrivée corrigée** et renvoyée (appels 039 à 049) avec les dix corrections de la première vérification : 42 cadres clairs et 42 clones sombres.
- **Globes** : les 5 composants vectoriels, envoyés par morceaux contrôlés par empreinte.
- **Page « Fondations »** : 148 couleurs clair/sombre et 32 styles de texte.
- **Ressources** d'Explorer et de Projets, icônes de Profils, logos des campus (appel 094).
- **Explorer** : 24 cadres clairs, dont 18 ont leur clone sombre.
- **Projets** : 14 cadres clairs (listes et fenêtres), sans clone sombre pour l'instant.
- **Profils** : sections (appel 091) et 2 cadres clairs.
- **Relevés** : les fenêtres d'Explorer, Projets et Profils ont été relevées à nouveau, avec leur voile `::backdrop`.

**Défaut trouvé, corrigé dans la méthode mais pas encore renvoyé** :
- À la mi-révélation, les libellés des repères passent sur deux lignes : le globe y est réduit par une transformation CSS (échelle 0,68).
- `dom2fig.py` applique maintenant l'échelle cumulée des transformations.
- Seuls les deux cadres `reveal-mid` (ordinateur et mobile) et leurs clones sombres sont concernés.

**Pause du 16 octobre, de 09 h 53 à 13 h 05 UTC, à la demande de l'utilisateur** :
- Les quatre envois déjà partis (066, 099, 107 et la première moitié de 112) sont arrivés et consignés.
- Les coursiers de 067 et 108 ont été arrêtés avant d'envoyer quoi que ce soit : aucun appel n'est resté à moitié envoyé.
- Les 68 appels restants et leurs chaînes, avec les captures de contrôle, sont décrits dans [`courier-reprise.json`](courier-reprise.json).

**Reprise à 13 h 05 UTC, puis seconde pause des envois à 14 h 32** : Explorer s'est achevé (100 à 102), Projets a avancé jusqu'à 075. Une coupure de session a interrompu un coursier entre son envoi de 071 (seconde moitié, réussi) et son enregistrement : le résultat a été repris de la transcription. Les envois restants ont ensuite été suspendus, car les deux vérifications ci-dessous touchaient la méthode commune à Projets et Profils.

**Vérifications du 16 octobre, après-midi** :
- **Arrivée, seconde passe** ([synthèse v2](verification/entrance/synthese-v2.md)) : 10 des 11 défauts de la première passe sont corrigés. Restent 4 causes, plus l'outil de contrôle : étalement des ombres ignoré par Figma sur les cadres, glyphes resserrés noirs dans les cadres clairs, libellés de la mi-révélation, géométrie claire des ombres gardée en sombre.
- **Explorer, première passe** ([synthèse](verification/explorer/synthese.md)) : 28 défauts confirmés, regroupés en 14 causes. Les bloquants :
  - globe à la place du plan dans « Autour du campus » ;
  - logos des campus rognés ;
  - logo de 42 Paris noir ;
  - sélecteurs Pays et Campus vides.

**Correctifs de méthode (16 octobre, après-midi)** :
- `render.js` :
  - étalement des ombres : un cadre sans enfant rogne son contenu, un cadre avec enfants reçoit un rectangle d'appui qui porte fond, bordure, ombres et flou ;
  - glyphes resserrés : couleur de base résolue dans le mode du cadre ;
  - `object-fit: contain` ;
  - rotations et miroirs des icônes ;
  - textes d'une ligne en largeur automatique, nombre de lignes du navigateur conservé ;
  - creux aux bouts arrondis ;
  - opacité nulle.
- `dom2fig.py` :
  - plan de la fenêtre campus, logos en `contain` ;
  - libellés et flèches des sélecteurs (`SELECT_LABELS`) ;
  - flèches cachées des repères retirées ;
  - pseudo-éléments : flou du verre, bordure du propriétaire, alignement flex ;
  - rotations cumulées ;
  - sauts de ligne des adresses et des commentaires ;
  - crédits de la carte au-dessus du globe ;
  - relevé sombre français pour un état arabe sans relevé sombre ;
  - creux du fil de périmètre.
- `assets.py` : filtre `feColorMatrix` de couleur constante.
- `section_frames.py` : échelle et origine exactes, découpe au sous-pixel.
- `sim_figma.mjs` : alerte sur les étalements que Figma ignorerait, transformations, positionnement absolu.
- Coursier : contrôle préalable `verify_sent.py --prior-ok`, qui reprend le résultat d'un envoi identique déjà réussi au lieu de le renvoyer.
- `make_call.py` : les numéros des appels archivés ne sont pas réemployés.
- Les 50 envois écrits avant ces correctifs sont archivés, non envoyés, dans [`_superseded/envois-avant-correctifs-20261016/`](_superseded/envois-avant-correctifs-20261016/).

**Essai et envois** :
- **138** : cadre d'essai « Explorer · Campus — Ordinateur · Clair », comparé au site. Le réticule a son halo et son anneau, le séparateur du fil est tourné, le creux du fil est arrondi et les crédits sont visibles.
- **139** : correctifs ponctuels. Le logo de 42 Paris est passé en blanc (5 peintures) et 72 glyphes resserrés de l'arrivée sont reliés à leur variable.
- **140 à 227**, en cours sur trois chaînes :
  - A : la révélation et ses clones ;
  - B : Explorer, puis Profils ;
  - C : Projets.

  Les 108 appels de scène passent la simulation. Les captures de contrôle de chaque section suivent les clones sombres.
- **Non retenus pour l'instant** :
  - la géométrie des ombres en sombre (correctif 4 de la synthèse v2, mineur) ;
  - les îlots du globe (mineur) ;
  - les bandes des dégradés clairs, qui sont une limite de Figma.

**Soir du 16 octobre : « il manque énormément de visuels »** :
- **Inventaire, par rapport au plan du site** (environ 54 écrans, hors liens externes) :
  - 16 terminés : l'arrivée (8 écrans), Explorer (7) et la fenêtre campus ;
  - 20 en reconstruction : Projets (9), Profils (8), la visionneuse, le signalement et le menu des commentaires ;
  - environ 17 pas commencés : Chroniques (liste, article et ses 4 onglets ; captures à faire), 42 Awards, Compte (9 panneaux) et la recherche. Les captures du compte, d'Awards et de la recherche existent dans `reference/shell/`.
- **Trois défauts trouvés en comparant une liste de Projets et une liste de Profils au site**, avec suspension des envois :
  - titres limités par `line-clamp` coupés de leur dernier mot : ils reçoivent maintenant la largeur de leur boîte ;
  - menu du bas resté au milieu des pages en pleine hauteur : le décalage d'un calque fixe se transmet à sa descendance (`sh` dans `build_one`) ;
  - portraits arrondis restés carrés : une image avec `border-radius` passe toujours par le cadre de rognage, avec son contour.
- **Seconde vérification d'Explorer** : quatre comparateurs terminés, synthèse coupée par la limite de session. Défauts corrigés :
  - fragments bidirectionnels d'une ligne comptés comme des lignes (`merge_line_rects`), ce qui coupait « جوائز 42 » et les lignes d'état dans tous les écrans arabes ;
  - bords du plan des rues sans voile flouté : cartes recapturées avec `.hg-map` visible (anciennes images dans `assets/maps/_avant-voile-20261016/`) ;
  - paragraphe aligné à gauche coupé ailleurs que sur le site ;
  - auto-layout autour d'un pseudo-élément ou d'un enfant positionné (fil de la fenêtre campus) ;
  - bordure absente du padding d'auto-layout.

  Non retenus : flou sous un autre flou (limite de Figma), îlots du globe, ombres en sombre, flèche native des sélecteurs.
- **Images posées par empreinte** : `render.js` reprend les empreintes du relevé (`X.images`, plan par état et photos), et l'appel des clones sombres remplace chaque plan clair par le plan sombre (`SWAP`). Un nouveau rendu n'a donc plus besoin de renvoyer d'images.
- **Envois régénérés** (229 à 311) : 17 cadres d'Explorer, Projets et Profils au complet, avec leurs clones. Les 104 appels de scène passent la simulation, sans ressource manquante. Les envois écrits avant ces correctifs sont archivés dans [`_superseded/envois-avant-correctifs-soir-20261016/`](_superseded/envois-avant-correctifs-soir-20261016/).

**Nuit du 16 au 17 octobre : pages manquantes et sélecteurs mobiles** :
- **Nouvelles pages** :
  - 06 · 42 Awards (1 section) ;
  - 07 · Compte et réglages (9 sections : panneaux visiteur et membre, paramètres, thème, langue, connexion, création de compte, messagerie, notifications) ;
  - 08 · Éléments communs, nouvelle page `158:7` (recherche, menu du bas des petits écrans, remonter en haut) ;
  - 05 · Chroniques (5 sections : liste, chronique, médias, auteurs, commentaires).

  Les trois premières viennent des captures `shell` ; `layout.py plan <zone> <page> <clé> [états…]` répartit une zone de captures sur plusieurs pages. Les Chroniques ont été capturées par `scripts/capture_journal.py` : 52 états, sans échec.
- **Ressources ajoutées** : 9 icônes intégrées du compte et de la recherche (appel 342), l'icône « Auteurs » et l'illustration de la chronique (appel 371).
- **Contrôles sur les captures de section** :
  - Awards s'écarte de 0,2 à 0,7 % des pixels du site ;
  - les Chroniques sur ordinateur, de 1 à 2,7 % ;
  - les Chroniques sur mobile, de 7 à 16 % : le sélecteur « Dans cet article » y apparaissait déplié.
- **Correctif des sélecteurs mobiles** : sur mobile, ce sélecteur est un `<details>` replié. Chrome donne une boîte à son contenu sans le dessiner. `dom2fig.py` ignore maintenant le contenu d'un `<details>` fermé ; il le considère ouvert seulement dans les états `project-local-menu` et `profile-local-menu`. `capture_lib.py` relève désormais `open`.
  - Écrans concernés : fiches projet, profil et chronique sur mobile, et la fenêtre campus.
  - Écrans renvoyés (appels 385 à 432) : Explorer 1, Chroniques 6, Projets 31, Profils 21, avec leurs clones.
  - Les envois écrits avant ce correctif sont archivés dans [`_superseded/envois-avant-details-20261017/`](_superseded/envois-avant-details-20261017/).
- **Filtre de sécurité** : des recopies longues sont coupées. Le second essai suffit souvent ; une chaîne arrêtée après deux coupures est relancée, et le contrôle préalable garantit qu'aucun appel n'est envoyé deux fois.

**17 octobre : tous les écrans construits, puis une vérification par zone et une méthode corrigée** :
- **Envois de la nuit et du matin** (appels 357 à 435) : Compte, Éléments communs, Chroniques, Projets et Profils au complet, avec leurs clones sombres. Toutes les pages du site existent maintenant dans Figma. Trois écrans « Ordinateur » de Projets (Médias, Commentaires, Commentaires · avec un fil) n'avaient pas été générés lors de la régénération de la nuit : ils portent le nom de trois écrans des Chroniques. Ils sont ajoutés par les appels 433 à 435.
- **Registre des cadres** : `record_frames.py` classe désormais les cadres par page (`frames` : page → nom → identifiant). Deux écrans du même nom sur deux pages ne s'écrasent plus.
- **Outil de contrôle** : quand la capture du site ne couvre que la hauteur de l'écran (menus, panneaux, fenêtres), `section_frames.py` ne mesure que cette hauteur (`measuredHeight`, trait rouge sur la planche). Sans cela, Compte et Éléments communs affichaient de 63 à 88 % d'écart. Explorer v3/v4 : de 0,2 à 3 % ; « Autour du campus » : de 0,2 à 0,5 % sur la hauteur de l'écran.
- **Vérification** (comparateurs de `verification/verify-workflow.js` sur Compte, Éléments communs, Chroniques v2, Projets v3 et v4 ; les synthèses ont été coupées par la limite de session puis relancées). Défauts principaux, tous corrigés dans la méthode :
  - colonne fixe des fiches (projet, chronique, profil) descendue de la hauteur de page moins l'écran : `fixed_y()` prenait tout calque fixe dont le centre est sous le milieu de l'écran pour un calque du bas. C'est désormais le bord haut qui décide (menu du bas, recherche, « remonter en haut ») ; les fenêtres centrées restent en haut ;
  - états relevés page défilée (menu d'un commentaire, tris ouverts, suggestions de mention, visionneuse mobile, « remonter en haut ») : le défilement est retiré des calques fixes, et un calque collant reprend sa place dans le flux d'après une capture du même écran prise en haut de page ;
  - menus « Trier » et menu d'un commentaire peints sous les cartes : l'ordre z d'un élément positionné suit les éléments aplatis (`_z`, `zsort`) ;
  - noms de campus et texte d'un commentaire coupés en milieu de ligne, dessinés sur le début de la ligne : une ligne par texte, coupée d'après la largeur mesurée (`split_run`) ;
  - textes saisis et indications des champs absents (« Paris », « Écrivez votre commentaire… ») : `field_runs`, indications dans la couleur `--h42-color-muted` ;
  - boutons du menu du bas dessinés dans la recherche ouverte : `capture_lib.py` ignore maintenant tout le sous-arbre d'un élément d'opacité ≤ 0,01 ; l'état est relevé à nouveau (anciens relevés dans `_superseded/captures-recherche-avant-opacite-20261017/`) ;
  - versions sombres des panneaux Thème, Paramètres et Compte avec l'option « Clair » cochée : ces 8 cadres sont construits à partir de la capture sombre (`convert(theme='dark')`, `DARK_RENDER` dans `layout.py`), avec les mêmes variables de couleur ;
  - résumés coupés par `line-clamp` : le texte visible est écrit comme Chrome le coupe, dans les trois langues (contrôlé sur six cartes) ;
  - titres coupés ailleurs (interlettrage négatif), paragraphes arabes avec un mot de plus par ligne, rangées d'auteurs arabes tassées à gauche, titre arabe qui commence par un mot latin (marque RLM), coches des filtres, icône « J'aime » active, SVG en ligne recadrés au lieu d'être contenus.
- **Illustrations** (contours hérités du CSS, polices génériques des textes SVG) : corrigées à part par un agent, en mettant à jour les 7 composants existants (même identifiant, toutes les instances suivent ; issus de `assets-update/`, `python3 scripts/assets.py update`). Le premier envoi groupé (785) a été recopié de travers par le coursier — tableau tronqué, arrêt ajouté — puis rejeté par le contrôle de recopie, sans modification dans Figma (`_superseded/appel-illustrations-groupe-20261017/`). La mise à jour part donc en un appel par composant (787 à 792, plus 786 pour le schéma), et les coursiers ont pour consigne de ne rien envoyer plutôt qu'une copie inexacte ; une copie inexacte relance un coursier neuf. Dans les tracés, des coursiers écrivent parfois un zéro final (3.230 pour 3.23) : `verify_sent.py` répond alors « EQUIV » (mêmes valeurs, même géométrie), compté comme une recopie exacte (788 et 789).
  - Polices relevées dans Chrome (`CSS.getPlatformFontsForNode`) : « monospace » est DejaVu Sans Mono (Bold pour le « & »), « Georgia, serif » est **Liberation Serif**. Les `<text>` sont vectorisés avec ces polices (`scripts/svg_text_outlines.py`, glyphes composites compris).
  - Bouts et jonctions ronds, épaisseur héritée de 1,6. Le composant partagé reste sans trait quand les cartes n'en ont pas ; seule l'illustration de la visionneuse, toujours tracée, reçoit un trait lié à `Rôles/logo`.
  - Contrôles (`scripts/check_assets_update.py`, `verification/assets-update/results.json`) : simulation 7/7 ; glyphes identiques à FreeType ; positions à 0,35 unité près de Chrome ; rendus comparés aux captures du site (visionneuse 2,78 → 0,70 % de pixels différents en clair ; guillemet et « & » des chroniques : IoU 0,96 et 0,95).
- **Envois de correction** (d'abord les appels 526 à 609, puis 699 à 784 après les correctifs du soir ; chaînes dans `courier-correctifs-17oct.json`) : 79 cadres clairs modifiés, 10 cadres sombres construits depuis la capture sombre et les clones. Tous passent la simulation. 141 appels écrits avant la reconstruction du moteur minifié ne sont pas envoyés (`_superseded/appels-moteur-non-minifie-20261017/`).
- **Coursiers** : jusqu'à 4 essais par fichier quand le filtre de sécurité coupe la recopie ; les coupures tombent toujours dans la même partie du moteur. Ils lisent la consigne `figma-use` dans une copie locale (`scripts/skills/`), car chaque appel au serveur Figma compte dans le quota du jour.
- **Guide de lecture et Fondations** (appels 610 et 611, 12 h 33 UTC) : le guide décrit la page 08, les images, les panneaux sombres et Maj + 1 ; la page Fondations est régénérée (188 couleurs en 14 groupes, 142 styles de texte).
- **Limite de session à 13 h UTC** : 19 des 119 appels de correction sont partis. La synthèse d'Éléments communs a alors montré une **régression** : le fondu fixe sous l'en-tête (`#app::after`, 166 px sur mobile, 188 sur ordinateur, 124 en lecture) était mesuré dans la boîte de `#app`, soit sur toute la page, avec ses arrêts en px répartis au hasard ; depuis l'ordre z, il recouvrait le fond « atmosphère ». Corrigé le soir :
  - `pseudo_frame` : l'écran est le bloc conteneur d'un pseudo-élément fixe, placé selon la règle des calques fixes ;
  - `figlib.parse_gradients` garde les positions en px, `resolve_stops` les place le long de la ligne du dégradé ;
  - `::after` est peint après les enfants et garde son z-index ;
  - largeur des paragraphes latins : à mi-chemin entre la plus longue ligne et la largeur où le mot suivant remonterait (`next_word_threshold`), soit environ ±24 px de marge ; l'arabe garde la boîte serrée ;
  - coupe des résumés : comparaison stricte avec la largeur, comme Chrome (« modifier et lancer les outils », 160,09 px dans 160) ;
  - **anneau de focus** du champ de mention (`focus_ring`), et ce cadre en sombre construit depuis la capture sombre ;
  - **symboles ☺ et ↗**, absents de Jost : Chrome les dessine en DejaVu Sans, Figma en émoji couleur. Ils deviennent des composants vectoriels (`symbols_call.py`, appel 698 : `291:12` et `291:15`, section « Symboles (DejaVu Sans) » de « Icônes et marque »), posés sur la ligne de base du texte.
  - Les 100 appels non envoyés sont gardés dans `_superseded/appels-bandeau-fixe-20261017/`, puis 121 appels écrits avant la création des symboles dans `_superseded/appels-avant-symboles-20261017/`. Les écrans sont régénérés (appels 699 à 784), y compris les 19 déjà envoyés.
- **Correction du site demandée par l'utilisateur, soir du 17 octobre** (« fais ce qu'il y a de plus logique ») : les trois rendus involontaires sont corrigés dans le prototype actif (voir `site/notes/ILLUSTRATION_CONSISTENCY_NOTES.md`). Dans Figma : l'illustration de la visionneuse perd son contour (appel 793) ; les captures des états touchés sont reprises (104, sans échec) ; les deux chroniques arabes sont reconstruites depuis les nouveaux relevés (appels 794 à 796), avec « 42 Tokyo » dans l'en-tête et le bouton.
- **Nettoyage refusé** (appel 797, en attente dans `calls/`) : la suppression de la page technique 4:2 (ancien moteur stocké) et des variables « _pipeline/… » a été refusée par le contrôle des permissions (« Modify Shared Resources »). Rien n'a été modifié. Elle attend l'accord explicite de l'utilisateur ; les coursiers ne retentent plus un refus de permission.
- **Outil de contrôle** : pour un état relevé page défilée, `section_frames.py` compare la capture du site à la bande du cadre qui commence au défilement, calques fixes et collants masqués (`scrollY`, `masked`).
- **Rendus du site probablement involontaires, à soumettre à l'utilisateur** (vérifications Projets v4 et Chroniques v2) :
  - trait hérité de `svg { stroke: currentColor }` (welcome.css) sur les illustrations des fiches, de la visionneuse et de la fenêtre campus, alors que les cartes le neutralisent (`.cp-art > svg { stroke: none }`) ; les composants partagés restent sans trait ;
  - en arabe, les textes des illustrations héritent `direction: rtl` et sortent de leur place ;
  - dans l'en-tête arabe d'une chronique, « 42 Tokyo » s'affiche « Tokyo 42 » (campus sans `<bdi>`).

**18 octobre : vérification finale, une régression corrigée, « aucun écart »** :
- **Police de secours de Figma** : l'appel 710 (fiche projet mobile en arabe) a échoué avec « unloaded font "Noto Sans Symbols2 Regular" » au moment de lier une variable de texte. Aucun texte de nos relevés n'exige cette police, et la même fiche sur ordinateur était passée : le caractère n'est pas identifié. `render.js` (`bindText`) charge maintenant la police que Figma réclame pendant la liaison, puis relie le texte (jusqu'à trois polices par texte, comptées dans `stats.fallbackFonts`). Le simulateur reproduit le refus (`SIM_FALLBACK`) et charge les variables de texte envoyées (`SIM_STRINGS=1`). L'appel 798 (mêmes données) est passé : police chargée une fois, 32 textes liés. 710 est archivé dans `_superseded/appel-710-police-de-secours-20261018/`. Clones sombres de Projets envoyés (730, 31 cadres).
- **Nettoyage fait avec l'accord de l'utilisateur** (« oui ») : la page 4:2 « ⚙ Outils de génération (temporaire) », qui ne contenait que l'ancien moteur stocké (4:3), est supprimée (appel 797, envoyé par la session principale). Aucune variable « _pipeline/… » ne restait. Le refus du 17 est gardé dans `_superseded/nettoyage-refuse-20261017/`. 18 fichiers d'erreur 404 de téléchargements de captures sont retirés de `call-results/`.
- **Vérification finale** (six zones, comparateurs puis synthèses ; coupée par une limite de session puis reprise) : 66 défauts dans les quatre premières zones, puis 14 au Compte. Causes :
  - **régression du 17 au soir** (bloquante, 89 scènes) : depuis que le fondu fixe sous l'en-tête (`#app::after`, z-index 6) est peint après les enfants, la barre de périmètre (z 8), le globe (7) et le menu du bas (20), enfants de `main`, passaient sous lui, car `zsort()` ne trie que des frères. `dom2fig.py` suit maintenant la règle CSS des contextes d'empilement : `stacking_context()` marque les cadres qui n'en créent pas (`_nsc`), et `hoist_z()` fait remonter leurs descendants à z-index à côté d'eux quand l'un d'eux doit croiser un frère ; un cadre qui rogne ne cède que ses calques fixes ; un cadre vidé et sans peinture est retiré, sauf dans un parent en auto-layout. Contrôle à blanc sur les 92 scènes : chaque calque garde sa boîte absolue (la barre arabe gagne même 0,1 px d'exactitude). `.app` (isolation) compte comme contexte d'empilement ; `capture_lib.py` relève désormais `isolation` ;
  - cadres jamais régénérés : menu « Trier » des profils sous les cartes, auteurs arabes de la liste des chroniques ;
  - fond « atmosphère » limité à la hauteur de l'écran dans les cadres en pleine hauteur : un calque fixe sans enfant qui couvre l'écran prend la hauteur du cadre ;
  - **☺ dessiné par Chrome en Liberation Sans** (par Arial), pas en DejaVu Sans : la ligne « ☺ Emoji » mesure 51,9 px sur le site, soit 37,6 px de Jost plus l'avance de Liberation Sans (DejaVu donnerait 52,2). `SYMBOL_FONTS` associe chaque symbole à sa police (↗ reste en DejaVu Sans) ; le composant `291:12` est redessiné sur place (appel 799, `symbols_call.py update`, mêmes instances) ;
  - **couleurs claires dans les cadres sombres rendus depuis la capture sombre** (bloquant) : dans « Thème » et « Paramètres », la rangée « Clair » gardait le fond turquoise. `cref()` essaie maintenant les deux écritures du transparent de chaque côté et, faute de variable, garde la couleur observée en sombre. Les fenêtres de connexion et de création de compte sont rendues depuis la capture sombre (boutons de 51 px en sombre, 53 en clair) ;
  - **soulignement de « Réinitialiser »** (couleur `var(--cp-line)`, 4 px sous le texte) : `capture_lib.py` relève `decoColor`, `uOffset`, `decoW` ; le moteur pose `textDecorationColor` (lié à sa variable : Figma garde la liaison, vérifié sur un texte temporaire supprimé dans le même appel), `textDecorationOffset` et `textDecorationThickness` ;
  - crédits de la carte d'Explorer : ils gardent leur place juste au-dessus du globe vectoriel (règle de `order()`, que `zsort()` aurait défaite au prochain rendu).
- **Correction du site acceptée par l'utilisateur** : en arabe, trois noms de campus des pages profil s'affichaient « Paris 42 » (voir `site/notes/ILLUSTRATION_CONSISTENCY_NOTES.md`, suite du 18 octobre). Relevés arabes de Profils repris (31 captures), puis toute la page Profils régénérée.
- **Relevés repris** : Profils en arabe (31), fenêtres de filtre (40), liste arabe des chroniques (4, références d'avant le correctif des illustrations ; scènes identiques). Les anciens relevés sont gardés dans `_superseded/captures-*-20261018/`.
- **Envois** : 89 scènes régressées, les cadres jamais régénérés, toute la page Profils, les cadres du 16 octobre au fond trop court et les panneaux sombres, soit environ 210 appels (798 à 966) avec leurs clones. Tous passent la simulation. Les appels écrits puis remplacés avant envoi sont archivés (`_superseded/appels-profils-avant-isolement-20261018/`, `appels-filtres-avant-soulignement-20261018/`, `appels-avant-correctif-cref-sombre-20261018/`).
- **Coursiers** : un essai avec un modèle plus léger a recopié un appel avec un fragment omis (`"r":11.0,`) ; le contrôle l'a refusé. L'utilisateur ne veut aucun écart : les coursiers repassent sur le modèle principal ; une copie inexacte n'est jamais gardée (renvoi jusqu'à la copie exacte, le cadre provisoire est remplacé).
- **Exigence de l'utilisateur, 18 octobre : « je ne veux aucun écart »**. Les petits écarts laissés de côté jusqu'ici sont repris un par un (étude `audit-ecarts-restants`) : géométrie des ombres en sombre, poignée des zones de texte, flèche des listes déroulantes, espaces insécables, position des soulignements, îlots du globe, verre que le site ne rend pas, bande d'en-tête des cadres du 16 octobre, heures des captures. Ce que Figma ne peut pas rendre exactement (lissage des polices, anticrénelage) sera mesuré et montré.

**18 octobre, après-midi : reprise après le redémarrage de la machine** (sur demande de l'utilisateur, « reprend ce que tu faisais ») :
- **Redémarrage à 10 h 05** : le relevé complet a été coupé et le dossier temporaire de la session vidé. Les outils de l'audit des écarts ont été reconstitués depuis les journaux des agents, sauf les fichiers faits en ligne de commande. Les huit appels intermédiaires des ombres sombres sont perdus sans avoir été envoyés ; le rendu complet les remplace. Le relevé reprend à 12 h 29 : Explorer et l'arrivée sont refaits, Profils et Chroniques l'étaient déjà ; viennent ensuite la zone commune et Projets.
- **Envois** : 960 à 964 (page Compte) et la fin de l'essai 985 sont arrivés, avec des recopies identiques. 960-2 et 985-2 étaient en fait passés avant la coupure (contrôle `ALREADY_OK`). Toute la série 798 à 966 est donc dans Figma, et le registre des cadres est à jour (`record_frames.py` ne prend plus pour des cadres les variables créées par l'appel 969).
- **Verre séparé en deux calques** (essai 985, cadre `460:17920`, comparé à `447:15558`) : sans shader, la séparation « Verre · flou » / « Verre · surface » n'est pas neutre. L'écart moyen est de 0,014 niveau, mais atteint 27 niveaux aux bords des verres (favori, menu du bas, barre d'outils). Face au site : 1,334 à plat, 1,340 séparé, et 7,92 contre 12,34 sur les pixels touchés. La séparation n'est donc pas utilisée (`figma-ledger.json`, `shaders.saturation-du-verre.splitTest`). Planches : `verification/verre-separe-20261018/`. Le shader reste refusé par Figma (« build service temporarily unavailable », dixième essai à 12 h 47).
- **Bord flouté du globe d'Explorer** (essai 986, `472:18562`) : la copie floutée du globe recouvrait tout le globe et ses repères. Deux causes établies par des essais d'API dans Archives :
  - un calque qui rogne son contenu (ici l'instance du globe) échappe au masque posé sous lui (`474:18605`, `475:18605`, `476:45969`). `render.js` (`unclipMasked`) le place désormais dans un cadre « Sans rognage · … » ;
  - le relevé ne garde aucun élément de taille nulle : les repères avaient perdu le rang de leur conteneur `.hg-pin` (0 × 0 px, z-index 2, au-dessus du bord flouté, z-index 1). `dom2fig.pin_stacking` leur rend ce rang (5 pour un repère hors de l'écran).
  Clones corrigés des cadres d'Explorer (`477:18650` Monde mobile, `477:18800` Pays ordinateur) : l'écart moyen au site passe de 2,09 à 1,65 et de 5,16 à 4,78. Il reste, sur Pays, le fondu de la carte peint en couleur de fond au lieu d'un masque alpha (`globe_svg.py`, avec la mise à jour du globe). Les appels 987 à 989 (même essai par le moteur complet, envoyés après la consigne « continue les envois ») le confirment : `480:18825` (Pays) est identique au pixel près au clone corrigé, `479:18782` (Monde mobile) donne 1,58 contre 2,09, `478:18739` (Monde ordinateur) ne change pas, car le bord y reste hors du globe.
- **Coursiers** : après une question de l'utilisateur sur l'avancement, deux coursiers ont refusé d'envoyer l'appel 987. Ils prennent la dernière demande de l'utilisateur pour la consigne en vigueur, et une note de la session principale ne suffit pas à les convaincre. `courier-workflow.js` accepte désormais un argument `context` facultatif, sans effet sur ce cas. Les envois par coursier ont repris après la consigne de l'utilisateur (« continue les envois »).
- **Contrôles des relevés** (`scripts/capture_gates.py`, étape 12 du plan de l'audit) : Profils, Chroniques et Explorer passent. Horloge identique entre clair et sombre, même instant en anglais et en arabe ; géométrie clair/sombre identique ; globe ancré dans les rubriques ; U+202F gardé (fiche campus, signalement de profil) ; poignée relevée sur chaque `<textarea>`.

**18 octobre, soir : rendu des pages** (après la pause, sur demande de l'utilisateur, « reprend ce qu'on faisait » ; détail dans [PASSE-COMPLETE.md](PASSE-COMPLETE.md)) :
- **Envoyés** : fin de la bibliothèque (cartes de Projets ordinateur), enregistrée (19 familles) ; les quatre globes et les fondus en masque ; les sections des huit pages ; l'arrivée (variables 1175 et 1190, cadres clairs 1176 à 1188).
- **Registre des textes** (`calls/strings-sent.json`) : rempli à la génération, il comptait comme créées dans Figma les variables d'appels archivés ou tenus (22 noms, 3 valeurs). Il est reconstruit depuis `calls/done/` (`make_call.py resync-strings`) ; l'ancien est gardé dans `_superseded/registre-textes-avant-recalage-20261018/`. Le simulateur (`SIM_STRINGS=1`) lit ce registre : il ne voit pas ce défaut, d'où la vérification faite à part.
- **Pages générées et simulées sans manque**, cadres à chiffres tabulaires exclus : Explorer (appels 1216 à 1235), Projets (1236 à 1292), Profils (1293 à 1307), Chroniques (1308 à 1330), Compte (1331 à 1393), Awards (1407 à 1409). Les premiers appels d'Explorer (1191 à 1215) et d'« Éléments communs » (1394 à 1406) sont archivés sans envoi ; « Éléments communs » sera régénéré après l'enregistrement des cartes de Projets à 300 px.
- **Cartes de Projets à 300 px** : séparées des cartes de Profils tenues (54 appels archivés dans `_superseded/appels-bibliotheque-cartes-tenues-20261018/`) et régénérées seules (1410 à 1415), car elles n'ont pas de chiffres tabulaires.
- **Espaces insécables dans les appels** : aucun appel envoyé avant ce soir ne contenait U+202F ni U+00A0. Le premier, l'appel de variables de Projets (1236), est parti avec une recopie inexacte : le coursier a écrit l'espace fine de « 0 / 1 000 » comme une espace ordinaire (contrôle DIFF). Les 9 variables créées sont justes ; « Projets/0 ∕ 1 000 » a gardé son ancienne valeur. Depuis, ces deux caractères voyagent sous forme de jetons visibles `⟦202f⟧` et `⟦00a0⟧` (`make_call.guard_spaces`), remis en place dans Figma par `render.js` et par l'appel des variables de texte ; `resync-strings` les relit. 1236 est remplacé par 1416, et les deux écrans « Signaler » en français (1287, 1288) par 1417 et 1418. L'essai de 1416 sur une maquette de l'API reproduit l'état du fichier : 9 variables reprises, 1 mise à jour, valeur exacte. Les anciens appels sont dans `_superseded/appels-espaces-fines-recopiees-20261018/`, les scripts d'avant dans `_superseded/scripts-avant-jetons-espaces-20261018/`.
- **Envoi terminé (21 h 35 UTC)** : `courier-pages-18oct.json` (« pages » : 9 appels de variables, puis 21 chaînes ; ensuite « sombres », où chaque clone sombre est suivi de l'appel qui place les anciens rendus des cadres tenus à leur emplacement du nouveau plan, 1419 à 1422). Bilan : 237 appels rangés, 228 cadres clairs et 228 sombres rendus (tous les cadres sans chiffres tabulaires), registre des cadres à jour (`record_frames.py`, 594 cadres).
- **Arrivée vérifiée** : contrôle de la page en lecture seule (8 sections, exactement les 100 cadres du plan, aucun cadre ancien ni de construction, aucun marqueur) et six cadres comparés au site (`verification/entrance/v4-echantillon/` : 0,03 à 0,69 % de pixels différents, aux bords des lettres et des formes).
- **Page « Composants »** : les 19 sections de familles se chevauchaient (posées à 560 px d'intervalle par des chaînes parallèles, puis agrandies). Après l'enregistrement des cartes à 300 px (24 variantes, jeu 599:133728, 20 familles), l'appel 1423 les a empilées sans chevauchement, à 160 px d'intervalle, par catégorie (Marque, En-tête, Navigation, Commandes, Listes, Cartes) ; seules les positions des sections ont changé.
- **Éléments communs** régénéré (1424 à 1436) : les deux fenêtres de 300 px portent les instances des cartes.
- **Incidents d'envoi** : 1372 coupé par le filtre de sécurité, passé au deuxième essai ; 1257 envoyé avec une recopie inexacte (liaison « Projets/Angola » omise, contrôle DIFF), renvoyé à l'identique, ce qui a remplacé le cadre ; les recopies fautives ne sont jamais gardées.
- **Vérification au fil des pages** (étape 7) : contrôle de structure en lecture seule (cadres de chaque section comparés au plan, restes de construction, marqueurs), puis sections exportées à l'échelle 1 et comparées au site cadre par cadre (`scripts/verify_page.py`), et tri des différences qui ne sont pas des contours (`scripts/diff_blocks.py` : masque des pixels à plus de 12 niveaux, érodé deux fois en 3 × 3). Les huit pages (cadres rendus) : aucun défaut de construction ; écart moyen de 0,5 à 3,8 niveaux ; hors contours, au plus quelques centaines de pixels, sous les voiles des fenêtres (noyau du flou, saturation absente) ou dans la pastille du globe des cadres pleine hauteur. La section « Liste des projets » (24 278 px) dépasse l'export du serveur : ses cadres sont exportés un par un. Synthèses : `verification/<zone>/synthese-rendu-complet.md`.
- **Artefact des références pleine hauteur** : la capture `--full.png` du site est prise après agrandissement de la fenêtre à la hauteur de la page ; le globe de la pastille « Monde » y est redessiné et montre une autre vue. Figma reproduit la vue à la hauteur de l'écran, celle du visiteur.
- **Shader de saturation** : douzième refus de construction à 20 h 18 UTC (« build service temporarily unavailable »).

**Nuit du 18 au 19 octobre : chiffres tabulaires et cadres tenus** (détail dans [PASSE-COMPLETE.md](PASSE-COMPLETE.md), « Dernière vague ») :
- **Chiffres tabulaires** : l'utilisateur a coché l'option dans les 11 styles créés par l'assistant (« C'est bon ») ; dans Figma, elle s'appelle « Monospace » (Details → Numbers → Style). Vérifié sur un texte d'essai temporaire : « 1111 » et « 0000 » de même largeur dans les 11 styles, `TNUM` actif.
- **Cartes de Profils** : familles mobile (689:828076) et ordinateur (689:20587), 132 variantes chacune, construites et enregistrées (22 familles en tout). Page « Composants » rangée de nouveau (1742 : 22 sections, positions seules).
- **Cadres tenus** : les 98 cadres clairs et leurs 98 sombres sont rendus (Explorer 1539 à 1549 ; Projets 1550 à 1588 et 1604 à 1631, puis 1745 à 1748 ; Chroniques 1589 à 1599 ; Profils 1641 à 1741 ; 1587 et 1600 à 1603, clones de Projets trop lourds pour un seul appel, archivés sans effet). Les 652 cadres du plan sont dans le fichier. Les clones sombres des écrans les plus lourds partent un par appel.
- **Copies sous le verre renommées** « Écran (copie sous le verre) » (1632 à 1640 : 3 772 sur Explorer, 5 200 sur Compte, celles de Projets au premier envoi) ; `render.js` les nomme ainsi depuis le 18 octobre, 23 h 44 UTC.
- **Serveur Figma** : coupures de connexion par salves. Un appel coupé a pu s'exécuter : les premières coupures ont été vérifiées en lecture seule avant tout renvoi ; ensuite, le coursier renvoie de lui-même, chaque appel pouvant être rejoué sans dommage. La page Projets, très lourde, coupe souvent au premier essai (environ un envoi sur deux, systématiquement entre 1 h 50 et 4 h 17 UTC) ; vers 3 h 03 UTC, « An unexpected error occurred » sur quatre appels dans la même minute. Le coursier réessaie ces deux erreurs, sauf pour une partie intermédiaire d'un écran découpé (voir [COURIER.md](COURIER.md)).
- **Registre des cadres** : `record_frames.py` classe désormais les résultats par numéro d'appel (l'ordre alphabétique faisait gagner « 889-… » sur « 1642-… ») ; 306 identifiants recalés. Ancienne version : `_superseded/scripts-avant-tri-numerique-releve-20261019/`.
- **Vérification** : structure de Projets et de Profils en lecture seule (1743, 1744 : 180 et 124 cadres, chacun à sa place, aucun reste) ; comparaison au site des 151 cadres de la nuit qui ont une capture du site (tous les clairs ; les 45 sombres anglais n'en ont pas). Défaut trouvé : le voile `::backdrop` d'une fenêtre était posé au haut du document, et non de l'écran, dans un cadre à la hauteur de l'écran d'un état capturé défilé (visionneuse mobile de Projets, seuls états concernés). `dom2fig.py` corrigé (ancienne version : `_superseded/scripts-avant-voile-defile-20261019/`), cadres renvoyés (1745 à 1748 ; 1749 reprend les variables d'ombre) : plus aucun écart hors contours sur les trois qui ont une capture du site. Restent les limites connues ; le noyau du flou ressort sur les portraits des cartes de Profils sous le voile des filtres (au plus 0,31 % d'un cadre). Synthèses : `verification/<zone>/synthese-rendu-complet.md`.

**Rangement du 16 octobre (16 h UTC), après une remarque de l'utilisateur** :
- **« Icônes et marque »** :
  - les 9 glyphes du scan (1 233 × 2 384 px, en unités de police) se chevauchaient : ils sont rangés en grille de 3 × 3, avec une note d'échelle. Un essai sur une copie temporaire a montré que réduire un composant réduit aussi ses instances, d'où le choix de ne pas les réduire ;
  - les logos blancs de Paris et de Mulhouse sont posés sur un fond sombre ;
  - les sections sont empilées sans chevauchement.
- **Cadre d'essai `12:2`** (15 octobre) : déplacé de la page Projets vers « Archives ».
- **À refaire après les envois** : la page « Typographie » des fondations (32 styles le 16 au matin ; les rendus en ont créé d'autres depuis).

**Reprendre un envoi interrompu** :
1. Relancer `scripts/courier-workflow.js` avec les chaînes du dernier fichier `courier-*.json` (le 18 octobre : `courier-reprise2-18oct.json` ; auparavant `courier-correctifs-17oct.json` et `courier-reprise.json`), en ne gardant que les fichiers encore présents dans `calls/`. Les coursiers utilisent le modèle principal (sans `model` dans les arguments). Depuis une autre session, remplacer `transcripts` par le dossier `subagents` de la nouvelle session. Le contrôle préalable évite de renvoyer un appel déjà passé.
2. `python3 scripts/record_frames.py`.
3. Vérifier les zones renvoyées à partir des nouvelles captures de section (`section_frames.py`, puis `verification/verify-workflow.js`).

**À suivre** : la [passe complète](PASSE-COMPLETE.md). Tous les cadres du plan (652) sont rendus et vérifiés (19 octobre, vers 5 h 10 UTC), cartes de Profils comprises.

Le 19, la page « Typographie » et la documentation de la page « Composants » (22 familles, sans assemblage ni panneau, décision de l'utilisateur) sont faites et vérifiées. Les parcours (pages 09 et 10, [notice](parcours/LISEZMOI.md)) sont alors posés et reliés en partie, puis la suite est mise en pause à la demande de l'utilisateur (11 h 06 UTC).

**Terminé le 23 octobre**, à la reprise demandée par l'utilisateur (section « Reprise du 23 octobre » de la passe complète) :
- les zones des parcours ont été relues en quatre tours (quatre fois sur mobile ; sur ordinateur, trois fois en anglais et une fois en français) ;
- les liens sont posés sur les 362 cadres : 5 050 zones et 6 points de départ par page ;
- une lecture seule des deux pages ne trouve aucun écart avec le plan ;
- le plan des rues des pages Compte en membre est déposé ;
- le guide de lecture est envoyé et vérifié au rendu.

Reste le shader de saturation : nouvel essai le 23 octobre, à la demande de l'utilisateur, encore refusé par Figma (« build service temporarily unavailable »), même pour une mise à jour sans code. Ces contrôles sont une vérification technique, par lecture du fichier et non en mode Présentation, qui ne vaut pas acceptation par l'utilisateur.
