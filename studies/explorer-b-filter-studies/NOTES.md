# Essais du filtre de la version B — 26 octobre 2026

## Demande et statut

Le 26 octobre 2026, vers 13 h 35, l’utilisateur demande : « Tu dois aussi me changer le filtre : la plupart du temps il y a beaucoup d’espace vide. Propose-moi des solutions pour qu’il ne soit pas vide, qu’il soit centré, mais qu’en même temps il ne se déplace pas à chaque fois qu’on sélectionne un pays ou un campus. » L’assistant propose quatre solutions ; l’utilisateur répond : « Fais-moi des essais avec toutes les propositions pour que je me fasse une idée, ensuite tu archiveras ça avec le reste ».

Le filtre est la pastille de portée de la version B (`#scope-bar` : le bouton ← `#scope-back`, le chemin `#scope-path` avec le siège du médaillon et le globe « Revenir au monde » `#reset`, la piste « Monde ⌄ » `#scope-picker` et, sous la pastille, la ligne `#globe-status`/`#globe-hint`). Depuis la retouche §T de la [spécification de B](../../site-b/notes/EXPLORER-B-REFINEMENTS-20261025.md), `scope-pill.mjs` fixe sa largeur sur la plus longue indication de la langue (par exemple « Émirats arabes unis › 42 Abu Dhabi »). Mesures sur la copie de cette étude, à 1440 × 900 :

- à « Monde », la pastille mesure 345 px et son contenu (globe et « Monde ⌄ ») 136 px : **209 px restent vides** (226 sur 357 px en anglais, 240 sur 363 px en arabe) ;
- le bouton ← caché garde sa place, si bien que la pastille est **décalée de 26 px de l’axe de la page** à « Monde » (vers la gauche en arabe ; 21,5 px à 390 × 844), point déjà noté dans la [liste de fin](../../docs/VERIFICATIONS-FINALES.md), § 5.

**Statut (26 octobre, soir) : l’étude est complète, prête à être montrée à l’utilisateur.**

- L’après-midi, le socle a été construit et vérifié : la copie figée de la version B, le chargeur des essais et la galerie. Les quatre essais étaient alors vides.
- Commencés avant la pause de 14 h 52, les quatre essais ont été terminés et vérifiés le soir par leurs auteurs, en **mode rapide** : quelques captures clés, toutes regardées, et les boîtes du filtre mesurées à chaque étape. Ce n’est pas une vérification complète (voir « Vérifications réalisées »).
- La galerie a ensuite été parcourue comme l’utilisateur s’en servira : chaque « Comparer » sur ordinateur et sur téléphone, en clair et en sombre, en français et en arabe, chaque « Ouvrir l’essai » et la copie seule.
- Aucun essai n’est choisi par l’utilisateur ni intégré : la version B (`site-b/`) et la version A (`site/`) ne sont pas modifiées. Rien n’est commité.

**Choix de l’utilisateur (26 octobre, vers 21 h 55)** : « Je parle du chemin en étapes, mais sans la partie continent, car il y a déjà Monde qui est censé être ce niveau de filtre. » Sur téléphone, au niveau d’un campus, il garde « le pays et le campus » (« France › 42 Paris »). L’essai 03 est donc retenu avec ces deux changements, reporté dans la version B (§Y de la [spécification](../../site-b/notes/EXPLORER-B-REFINEMENTS-20261025.md)) ; les quatre essais restent ici tels qu’ils ont été comparés, et l’étude rejoint le [registre des recherches](../research-archive/index.html).

## Règles communes aux quatre essais

- Le filtre ne bouge ni ne change de taille quand le filtre change : validation, remontée d’un niveau, bouton ←, globe « Revenir au monde », recherche, filtre des pages de contenu.
- Son centre est sur l’axe de la page à chaque niveau, « Monde » compris (l’axe de la colonne à côté du menu latéral quand celui-ci s’affiche).
- Le bouton ← garde une place fixe ; le texte est centré dans le filtre.
- Miroir en arabe ; français, anglais et arabe ; thèmes clair et sombre.
- Noms accessibles inchangés, sauf si l’essai a besoin de les compléter (le dire dans son README).

## Les quatre essais

Chaque essai vit dans `essais/<id>/`. Son README détaille l’idée, les changements, les fichiers, les vérifications et les limites ; le résumé de sa carte est le champ `resume` de sa fiche `essai.js`, écrit par l’auteur de l’essai. Ce sont des propositions de l’assistant : aucune n’est choisie.

| N° | Essai | Résumé de la carte | État | Accès |
| --- | --- | --- | --- | --- |
| 01 | Les chiffres dans le filtre (`chiffres-dans-le-filtre`) | Les chiffres de la ligne sous le filtre passent dans le filtre, après le lieu (« Monde · 58 campus · 30 pays », « 42 Paris · France ») ; la ligne disparaît et le filtre, de largeur fixe, se centre sur l’axe de la page. | Réalisé, vérifié en mode rapide | [Comparer](index.html?essai=chiffres-dans-le-filtre) · [README](essais/chiffres-dans-le-filtre/README.md) |
| 02 | Un filtre plus court (`filtre-plus-court`) | Le filtre ne montre que le lieu choisi, centré, à la largeur du plus long nom ; au niveau campus, le pays passe sur la ligne sous le filtre, d’où il ramène toujours au pays. | Réalisé, vérifié en mode rapide | [Comparer](index.html?essai=filtre-plus-court) · [README](essais/filtre-plus-court/README.md) |
| 03 | Le chemin en étapes (`chemin-en-etapes`) | Le filtre montre tout le chemin, les étapes encore à choisir en grisé (« Monde › Continent › Pays › Campus », puis « Europe › France › Campus »…) ; largeur fixe, centré sur l’axe ; sur téléphone, l’étape actuelle et la suivante. | Réalisé, vérifié en mode rapide | [Comparer](index.html?essai=chemin-en-etapes) · [README](essais/chemin-en-etapes/README.md) |
| 04 | Seulement centrer le texte (`texte-centre`) | Même largeur fixe qu’aujourd’hui : seul le texte est centré dans le filtre, et le filtre sur l’axe de la page, le bouton ← à une place fixe. | Réalisé, vérifié en mode rapide | [Comparer](index.html?essai=texte-centre) · [README](essais/texte-centre/README.md) |

**En un coup d’œil**, à « Monde » (mesures dans les vues de la galerie, contrôle du soir ; positions en px de la page affichée) :

| | Copie | 01 | 02 | 03 | 04 |
| --- | --- | --- | --- | --- | --- |
| Filtre, 1440 × 900, français | « Monde ⌄ », puis la ligne « 58 campus · 30 pays » | « Monde · 58 campus · 30 pays ⌄ », sans ligne | « Monde ⌄ », puis la ligne | « Monde ⌄ › Continent › Pays › Campus », puis la ligne | « Monde ⌄ », puis la ligne |
| Largeur, 1440 × 900, français / arabe | 345 / 363 px | 315 / 332 px | 264 / 276 px | 406 / 422 px | 345 / 363 px |
| Largeur, 390 × 844, français / arabe | 293 / 293 px | 272 / 272 px | 249 / 261 px | 272 / 266 px | 272 / 272 px |
| Centre du filtre − axe de la page | +26 px (−26 en arabe ; ±21,5 à 390 × 844) | 0 | 0 | 0 | 0 |
| Centre du texte − centre du filtre, 1440 × 900, français | −78,9 px | +4,5 px | 0 | +11,6 px | 0 |
| Fichiers de l’essai | — | `styles.css` et `scope-pill.mjs` remplacé | `styles.css` et `scope-pill.mjs` remplacé | `styles.css` et `scope-pill.mjs` remplacé | `styles.css` seul |

Les quatre gardent la boîte de leur filtre et celle du ← d’un niveau à l’autre : leurs auteurs l’ont mesuré à chaque étape de leurs parcours (validation, ←, globe, recherche, filtre des pages de contenu), et le contrôle de la galerie le retrouve entre « Monde », 42 Paris et l’Afrique.

### 01 · Les chiffres dans le filtre

**Ce qui change** (détails dans le [README](essais/chiffres-dans-le-filtre/README.md)) :

- Les chiffres de la ligne passent dans le filtre, après le nom et un « · », en gris atténué, à la taille du nom : « Monde · 58 campus · 30 pays », « Europe · 32 campus · 14 pays », « France · 8 campus ». Au campus, le pays suit le campus : « 42 Paris · France » au lieu de « France › 42 Paris ».
- La ligne sous le filtre est masquée : la bande de l’Explorer commence sous le filtre à tous les niveaux et gagne 30,3 px à 1440 × 900 (28,8 px à 390 × 844).
- Largeur fixe sur la plus longue indication « nom · chiffres » : 315 px en français, 326 en anglais et 332 en arabe à 1440 × 900 (345, 357 et 363 dans la copie). Une place vide de la largeur du ← ferme la barre : le filtre est sur l’axe.
- Le bouton du filtre couvre toute la place qui suit le globe et son texte est placé au milieu du filtre : le panneau « Où veux-tu aller ? » s’ouvre toujours au même endroit.
- Noms accessibles complétés, puisque le texte visible doit figurer dans le nom : « Monde · 58 campus · 30 pays · Choisir un pays ou un campus » ; l’info-bulle et le résumé du mode lecture de même.

**Limites :**

- Sur téléphone, pour rester centré, le filtre garde la place du ← des deux côtés : 272 px au lieu de 293 à 390 px de large. Des indications finissent alors par « … » : 3 sur 93 en français, 7 en anglais (dont l’état par défaut, « World · 58 campuses · 30 countries »), 2 en arabe. Le texte entier reste dans le nom accessible et l’info-bulle.
- Le texte bouge quand sa longueur change ; le filtre, non. Les textes longs restent à 21 px du globe (16 px sur téléphone) et s’écartent du centre : 4,5 px à « Monde » en français à 1440 × 900, 16,5 px pour « World… », 18,5 px à 390 × 844, 22 px pour un texte coupé.
- Le pays devant un campus n’est plus un bouton : on remonte au pays par le ← ou par le panneau.
- Le survol, l’ouverture et l’anneau de focus colorent toute la place qui suit le globe (259 px au lieu des 87 px du nom) ; cet état n’a pas été photographié.
- Les chiffres s’affichent sur toutes les pages qui montrent le filtre (Projets, Profils, Chroniques, mode lecture), pas seulement dans l’Explorer : choix de l’essai, à confirmer par l’utilisateur.
- Le catalogue `campuses.json` est lu une seconde fois ; jusqu’à son arrivée, le filtre garde sa largeur naturelle, comme la copie.
- Non vérifié par l’auteur : 667 × 375 et 320 px, Firefox et Safari, vrais téléphones, lecteurs d’écran, couleurs forcées, survol réel, animations. Le thème sombre à 1440 × 900, qu’il n’avait pas vu, l’a été depuis dans la galerie, à « Monde ».

### 02 · Un filtre plus court

**Ce qui change** (détails dans le [README](essais/filtre-plus-court/README.md)) :

- Le filtre ne montre que le nom du lieu choisi, centré avec son chevron : « Monde », un continent, un pays ou le campus seul (« 42 Paris »).
- Au niveau campus, dans l’Explorer, le pays passe sous le filtre, à la place des chiffres, dans leur taille et leur couleur. C’est le bouton de l’ancêtre « France › » de la copie, avec la même action : un clic ramène au pays. Aux autres niveaux, la ligne garde les chiffres de la copie.
- Largeur fixe sur le plus long nom seul (« Émirats arabes unis ») : 264 px en français et 276 en anglais à 1440 × 900 (345 et 357 dans la copie), 261 px en arabe à 390 × 844 (293). La hauteur est fixée elle aussi, sur le nom le plus haut.
- Une place vide de la largeur du ← ferme la barre : le filtre est sur l’axe. Le sélecteur occupe tout le milieu du filtre : son survol et l’ancrage du panneau ne bougent plus.
- Noms accessibles et ordre de lecture inchangés.

**Limites :**

- Téléphone en paysage (667 × 375), au campus, avec un pays long (42 Abu Dhabi) : environ 6 px séparent le pays, sous le filtre, du titre de la fiche, et la zone cliquable du pays mord sur la boîte du titre (les lettres ne se chevauchent pas). Si l’essai est retenu, il faudra réserver la place de cette ligne ; la fiche du campus descendrait d’environ 30 px.
- Pages de contenu : elles n’ont pas de ligne sous le filtre, donc le pays d’un campus n’y est pas affiché ; il reste à un geste par le ← et par la fenêtre de choix.
- Le pays sous le filtre, gris comme les chiffres, ne ressemble pas à un lien ; seul le survol, non capturé, le signale.
- Au clavier, le pays (sous le filtre) est atteint avant le campus (dans le filtre) : l’ordre du chemin, pas celui de l’écran.
- Le nom et son chevron sont centrés ensemble : le nom seul est à 12 px du centre (9,5 px sur téléphone).
- Sous 390 px de large, d’après le calcul de l’auteur (non vu à l’écran), le filtre rétrécit dès 375 px en arabe et en anglais et dès 360 px en français, et le plus long nom finit par « … ».
- Non vérifié par l’auteur : Firefox et Safari, vrai téléphone, lecteur d’écran, couleurs forcées. L’arrivée `index.html`, qu’il n’avait pas vue, l’a été depuis dans la galerie (l’entrée, puis « Visiter », à 1440 × 900 en français clair).

### 03 · Le chemin en étapes

**Ce qui change** (détails dans le [README](essais/chemin-en-etapes/README.md)) :

- Le filtre montre tout le chemin, les étapes encore à choisir en grisé : « Monde ⌄ › Continent › Pays › Campus », « Europe ⌄ › Pays › Campus », « Europe › France ⌄ › Campus », « Europe › France › 42 Paris ⌄ ». En anglais « Continent », « Country », « Campus » ; en arabe « القارة », « الدولة », « الفرع », en miroir.
- Le continent, ajouté devant le pays, est un texte simple : aucune commande de la copie ne mène d’un campus à son continent. Les étapes à choisir sont inertes et absentes de l’arbre d’accessibilité. Le pays devant un campus reste le bouton de la copie, passé du gris à la couleur du texte.
- Largeur fixe sur le plus long chemin complet (« Asie › Émirats arabes unis › 42 Abu Dhabi ») : 406 px en français, 418 en anglais et 422 en arabe à 1440 × 900 (345, 357 et 363 dans la copie). La hauteur est fixée aussi : 54 px en arabe à 1440 × 900.
- Sur téléphone, une forme courte montre l’étape actuelle et la suivante (« Monde › Continent », « France › Campus ») ; à un campus, « 42 Paris » seul. 272 px en français et 266 en arabe à 390 × 844.
- Une place vide de la largeur du ← ferme la barre : le filtre est sur l’axe. La ligne sous le filtre ne change pas. Les noms accessibles ne changent pas ; le chemin lu gagne seulement le continent. Contraste des étapes grisées : 6,7:1 en clair, 6,5:1 en sombre.

**Limites :**

- À 390 px, la plus longue forme courte demande 274 px pour 272 : « Émirats arabes u… › Campus », en français comme en anglais. L’arabe tient.
- À un campus sur téléphone, seul « 42 Paris » s’affiche : le bouton du pays est masqué alors que la copie montre « France › 42 Paris », il n’est plus un arrêt du clavier, et la pastille y est plus vide que dans la copie (143 px vides contre 117 en arabe). Une variante qui montrerait « France › 42 Paris », non réalisée, reste à décider.
- Le continent n’est pas cliquable : depuis un campus, on remonte niveau par niveau, comme dans la copie.
- Les chemins les plus longs commencent après le globe : 11,6 px du centre à « Monde » en français, jusqu’à 21,9 px.
- La pastille est plus large que dans la copie (+61 px en français) : c’est le prix du chemin complet. Le mode lecture montre aussi les étapes grisées.
- Le catalogue `campuses.json` est lu une seconde fois, pour le continent de chaque pays.
- Non vérifié par l’auteur : la forme compacte de la copie (dock de 340 px ou moins), 320 px, le rendu en couleurs forcées, Firefox et Safari, vrai téléphone, lecteur d’écran réel.

### 04 · Seulement centrer le texte

**Ce qui change** (détails dans le [README](essais/texte-centre/README.md)) :

- Seul l’alignement change : la pastille garde la largeur fixe de la copie (345 px en français à 1440 × 900).
- Son texte est centré dans la pastille : au bout opposé au globe, une place de 44 px, la taille du siège du globe, l’équilibre. Le texte tombe ainsi juste au-dessus de la ligne de chiffres, qui ne change pas.
- Une place vide de la taille du ← ferme la barre : la pastille est sur l’axe et le ← a une place fixe.
- Une feuille de cinq règles, sans module ; aucun nom accessible ne change.
- Choix de lecture de l’assistant, à confirmer par l’utilisateur : le texte est centré sur toute la pastille. Centré dans la seule place qui suit le globe, il serait à 22 px de l’axe ; cette variante n’a pas été réalisée.

**Limites :**

- Sur téléphone, la pastille raccourcit pour rester centrée : 272 px au lieu de 293 à 390 px, 202 au lieu de 205 à 320 px. Quatre indications françaises sur 93 finissent alors par « … » (42 Abu Dhabi, 42 Antananarivo, 42 Gyeongsan, 42 Luxembourg), trois anglaises et une arabe ; la copie n’en coupe aucune.
- Le texte bouge selon sa longueur, et avec lui le panneau « Choisir un pays ou un campus », ancré sous le sélecteur (676,4 px au lieu de 623,5 à « Monde », 1440 × 900).
- Les plus longues indications partent du globe, jusqu’à 22 px du centre.
- Hérité de la copie, non corrigé : en arabe, la pastille passe de 51 à 54 px de haut au campus à 1440 × 900 (de 49 à 48 px à 390 × 844), et le ← bouge de 1,5 px (0,5 px). Voir « Limites et suites ».
- Non vérifié par l’auteur : l’anglais à l’écran, Firefox et Safari, vrais téléphones, lecteurs d’écran, couleurs forcées, survol réel, animations. Le thème sombre à 1440 × 900, qu’il n’avait pas vu, l’a été depuis dans la galerie, à « Monde ».

## Ouvrir et comparer

Servir le dépôt avec le serveur local habituel (`python3 -m http.server 8765 --bind 127.0.0.1` depuis la racine), puis ouvrir `http://127.0.0.1:8765/studies/explorer-b-filter-studies/`.

- **Comparer** : le bouton d’une carte fait remonter la page jusqu’à la comparaison et affiche côte à côte la copie figée (à gauche, sans essai) et la même page avec l’essai (à droite). Elle s’ouvre toujours sur « Explorer · Monde », l’état le plus vide de la copie.
- **La page** : les vues proposées par l’essai viennent en tête de la liste « Page » :
  - 01 : « Explorer · 42 Paris (le pays après le campus) », puis « Explorer · 42 Abu Dhabi sur téléphone, en arabe (« … ») » ;
  - 02 : « Explorer · 42 Paris (le pays sous le filtre) » ;
  - 03 : « Explorer · 42 Paris », puis « Explorer · France (téléphone, forme courte) » ;
  - 04 : « Explorer · 42 Paris ».

  Suivent les vues communes : l’Explorer à « Europe », à « France », à « Émirats arabes unis » et au campus 42 Abu Dhabi, qui porte la plus longue indication ; Projets à « Monde » et à « 42 Paris » ; une fiche projet en mode lecture ; l’arrivée `index.html`.
- **Les réglages** : le format (1440 × 900, 1280 × 720, 390 × 844, 667 × 375 ; à 1280 × 720 et à 667 × 375, la version B montre le menu sur le côté), le thème et la langue. Chaque changement, comme le bouton « Recharger », recharge entièrement les deux pages (paramètre `chargement`, ignoré par la copie et par le chargeur), pour que les deux vues partent du même état. Les deux vues de téléphone proposées par 01 et 03 règlent elles-mêmes le format (et, pour 01, le thème sombre et l’arabe) ; ces réglages restent ensuite choisis, pour les autres vues comme pour les autres essais, jusqu’à ce qu’on les change.
- **Quoi regarder** : à « Monde », la copie montre « Monde ⌄ » contre le globe, le reste du filtre vide, et le filtre décalé de 26 px vers la droite de l’axe (vers la gauche en arabe). Chaque essai doit avoir son filtre sur l’axe et le ← à une place fixe, et ne rien déplacer quand on change de niveau. Un déplacement ne se voit qu’en changeant de niveau dans une même page : dans une vue, qui reste interactive, ou, plus confortablement, dans la page ouverte en grand.
- **Ouvrir la copie** et **Ouvrir l’essai** : la même page en grand dans un nouvel onglet, avec le thème et la langue choisis ; le format est alors celui de la fenêtre. Chaque carte a aussi son lien « Ouvrir l’essai », qui suit la page et les réglages du moment.
- **Liens directs** : `baseline/content-preview.html?essais=id1,id2&theme=dark&lang=ar#explore?country=FRA` ouvre la copie avec ces essais, ce thème et cette langue ; `baseline/index.html?essais=…` joue l’arrivée. Sans paramètre, la copie s’affiche comme la version B du commit 46279b0, dans le dernier thème choisi pour l’étude. `index.html?essai=<id>` ouvre la galerie directement sur la comparaison d’un essai.
- **Limites des vues** : elles sont réduites à la largeur de la galerie (une page de 1440 × 900 y paraît à 0,4 environ dans une fenêtre d’ordinateur, à 0,2 environ sur un téléphone, où les deux vues s’empilent) et gardent le pointeur de l’ordinateur (pas de toucher émulé dans une vue de mobile) ; elles partagent le stockage de l’étude, donc un changement de thème dans l’une se répercute dans l’autre. Après « Comparer », la page remonte jusqu’à la comparaison, mais le focus du clavier reste sur le bouton de la carte.

## La copie figée (`baseline/`)

- **Source :** la version B telle qu’enregistrée dans le commit `46279b0` (poussé sur `rel-hass`), **avant la reprise du menu latéral dans le style du premier menu de A (§X)**, alors en cours dans `site-b/`. Les fichiers viennent d’un export en lecture seule de ce commit ; chacun est comparé à git.
- **Contenu : 253 fichiers**, ce que chargent les deux pages : l’analyse part de `index.html` et de `content-preview.html` et suit les liens des pages, les imports statiques et dynamiques, les JSON lus par `fetch`, les `@import` et `url()` des styles et les chemins d’images écrits dans les données ; s’y ajoutent les deux dossiers dont le code compose les noms (`assets/flags/`, `assets/profile-avatars/`) et les notes de licence et de provenance des images recopiées (`assets/flags/LICENSE`, `assets/flags/PROVENANCE.md`, `assets/campus-logos/PROVENANCE.md`). **245 fichiers sont identiques au commit, 8 sont adaptés** (ci-dessous).
- **Non recopiés (72 fichiers, liste dans le [manifeste](snapshot-manifest.json), champ `excluded`) :** `notes/`, `tests/`, `tools/` et les `*.test.mjs` (64 fichiers), `README.md`, et ce que les pages ne chargent jamais : `campus-details.mjs` et `campus-sheet.mjs` (la fiche campus de A, remplacée dans B par `explorer-campus.mjs` ; seule sa feuille `campus-details.css` reste liée), `campus-website-locale-evidence.json` et `project-demos/pong/` (4 fichiers).
- **`shared/` n’est pas recopié :** la copie utilise le dossier `shared/` du dépôt (polices Jost, `tokens.css`, logo 42), identique le 26 octobre à celui du commit 46279b0 (16 fichiers comparés). S’il change plus tard, la copie suivra.

### Adaptations (8 fichiers)

Chaque fichier adapté est le fichier du commit avec exactement ces changements, que `snapshot.py --verify` contrôle.

1. **Liens qui casseraient un dossier plus bas** (5 par page) : `../shared/` devient `../../../shared/`.
   - `index.html` : lignes 10 (`../shared/assets/jost-1.ttf`, préchargement), 11 (`../shared/brand/tokens.css`), 12 (`../shared/assets/jost.css`), 82 (`../shared/brand/logo-42.svg`, le 42 de l’entrée) et 88 (`../shared/brand/logo-42.svg`, le 42 de l’en-tête) ; lignes 9, 10, 11, 79 et 85 dans le commit.
   - `content-preview.html` : lignes 10, 11, 12, 82 et 89, mêmes adresses ; lignes 9, 10, 11, 79 et 86 dans le commit.
   - Aucun autre lien ne sort de la copie : les modules, les styles et les données ne nomment que des fichiers du même dossier ou de ses sous-dossiers (310 références relatives contrôlées, toutes dans l’étude ou dans `shared/`).
2. **Stockage du navigateur :** les sept clés de B reçoivent le préfixe `horizon-explorer-b-filter-studies-20261026-`, comme l’avait fait l’étude du 14 octobre avec le sien :
   - thème (`localStorage`) : `theme-bootstrap.js` ligne 5 et `theme-preferences.mjs` ligne 1 ;
   - préférences des contenus, favoris compris, leur ancienne version et l’ancienne clé de présentation (`localStorage`) : `content-preferences.mjs` lignes 14, 15 et 35 ;
   - commentaires (`sessionStorage`) : `comments.mjs` ligne 118 ;
   - signalements (`sessionStorage`) : `content-report.mjs` ligne 1 ;
   - liens de dépôt des projets (`sessionStorage`) : `project-trial.mjs` ligne 7.
   La version B ne garde pas la langue entre deux visites : rien d’autre à séparer. La galerie n’enregistre rien.
3. **Chargeur des essais** (3 lignes par page) : `<script src="../essais/boot.js?v=1">` avant `theme-bootstrap.js` (ligne 8) ; `<script src="../essais/styles.js?v=1">` après la dernière feuille de style, avant les modules (ligne 49) ; `<script src="../essais/modules.mjs?v=1" type="module">` après `design-review-selection.mjs` (ligne 52). Sans `?essais=`, ils n’appliquent rien ; ils lisent seulement `?theme=` et `?lang=`.

Titres, clés de cache `?v=` et tout le reste de la copie sont inchangés.

## Le chargeur des essais (`essais/`)

- **`boot.js`**, en tête de page : lit `?essais=` (un ou plusieurs identifiants séparés par des virgules ; ordre canonique, celui de la galerie, quel que soit l’ordre de l’adresse ; identifiant inconnu ignoré et noté dans `horizonEssais.ignored`), `?theme=light|dark|system` (écrit dans la clé de thème de l’étude avant que la copie ne la lise) et garde `?lang=` pour `modules.mjs` ; écrit la fiche `essais/<id>/essai.js` de chaque essai demandé.
- **`styles.js`**, en fin d’en-tête : retient les essais dont la fiche s’est déclarée, écrit leur `styles.css` après toutes les feuilles de la copie, puis la carte d’import des modules remplacés.
- **`modules.mjs`**, après les modules de la copie : attend que le contrôleur de la copie ait démarré (il masque alors le sélecteur de langue de l’en-tête), applique `?lang=` par le menu de langue de la copie, lance le `module.mjs` de chaque essai avec le crochet du filtre, puis marque `<html data-essais-ready="true">`, essais ou non.
- **`pill.mjs`** : le crochet du filtre, décrit plus bas.
- Les fichiers des essais reçoivent à chaque chargement un jeton `?v=` neuf : une modification est visible au rechargement suivant, sans cache périmé. Les fichiers de la copie gardent leurs clés.

### La fiche `essai.js`

Chaque dossier d’essai a sa fiche, lue avant le chargement de la copie et par la galerie. Le chargeur ne demande que les fichiers déclarés : aucun fichier absent n’est réclamé.

```js
horizonEssais.declare({
 id: 'texte-centre',              // le nom du dossier
 titre: 'Seulement centrer le texte',
 resume: '…',                      // une ligne, sur la carte de la galerie
 styles: false,                    // true dès que styles.css existe
 module: false,                    // true dès que module.mjs existe
 remplace: [],                     // modules de la copie remplacés, par exemple ['scope-pill.mjs']
 vues: [],                         // facultatif : vues proposées en tête de la liste « Page »
});
```

Une vue s’écrit `{ libelle: 'Explorer · France', page: 'content-preview.html', route: 'explore?country=FRA', format: 'mobile', theme: 'dark', lang: 'ar' }` (format : `ordinateur`, `portable`, `mobile` ou `paysage` ; les trois derniers champs sont facultatifs). La carte perd son badge « Vide pour l’instant » dès qu’un fichier est déclaré.

### `styles.css`

Chargée après toutes les feuilles de la copie : à spécificité égale, la règle de l’essai l’emporte. Certaines règles de la copie portent des identifiants, par exemple `:root #app #scope-bar :is(#scope-picker,#scope-name)` dans `design-review-selection.css` : il faut alors une spécificité au moins égale.

### `module.mjs`

```js
export default async function start({ id, pill, study, root, page }) { … }
```

- `id` : l’identifiant de l’essai ; `pill` : le crochet du filtre ; `study` : `window.horizonEssais` (`active`, `requested`, `ignored`, `replacements`, `conflicts`, `trialURL(id, fichier)`…) ; `root` : l’élément `<html>` ; `page` : `'index.html'` ou `'content-preview.html'`.
- La fonction peut être asynchrone : le chargeur l’attend avant de passer à l’essai suivant puis de poser `data-essais-ready`.

### Le crochet du filtre (`pill`)

- **`pill.el`** : les éléments vivants du filtre, les mêmes sur les deux pages :
  `app` (`#app`), `bar` (`#scope-bar`), `back` (`#scope-back`), `path` (`#scope-path`), `medallion` (`#scope-medallion`), `reset` (`#reset`, le globe « Revenir au monde »), `summary` (`#scope-reading-summary`), `trail` (`.scope-trail`), `worldItem` et `world` (`#scope-world-item`, `#scope-world`, toujours masqués dans B), `countryItem`, `country` et `countryName` (le pays devant un campus), `current` (`.scope-current`), `picker` (`#scope-picker`), `name` (`#scope-name`), `status` (`#globe-status`), `hint` (`#globe-hint`, « 58 campus · 30 pays ») et `popover` (`#scope-popover`).
- **`pill.state()`** : `{ level, name, crumb, hint, hintShown, backDisabled, section, reading, compact, rail, lang, dir, theme, viewport: { width, height }, width, fonts }`. `level` vaut `'world'`, `'continent'`, `'country'` ou `'campus'` ; `crumb` est le pays affiché devant un campus, sinon `''` ; `compact` est la forme compacte du filtre (le pays masqué) ; `rail` est le menu sur le côté ; `width` est la largeur que la copie a donnée au filtre, en px, ou `null` tant que le catalogue n’est pas arrivé.
- **`pill.onChange(rappel, { immediate = true })`** renvoie une fonction qui arrête les appels. `rappel(state, raisons)` est appelé tout de suite, avec les raisons `{'start'}` (sauf `immediate: false`), puis au plus une fois par image après chaque changement, une fois que la copie a fini sa propre mise à jour et avant l’affichage. `raisons` est un `Set` de :
  - `'filter'` : le filtre a changé (validation, remontée, ←, globe, recherche, filtre d’une page de contenu, sélecteur du filtre, historique) ou la copie a recalculé sa largeur ;
  - `'page'` : rubrique ou mode lecture ;
  - `'form'` : forme compacte du filtre, menu sur le côté ou en bas ;
  - `'language'`, `'theme'`, `'size'` (taille de la fenêtre) et `'fonts'` (polices chargées).
- Les changements que le rappel fait lui-même dans la page ne le rappellent pas ; une mutation qui ne change rien de ce qu’écrit la copie (ses copies de mesure, les nœuds ajoutés par l’essai) est ignorée.
- Le contrôleur de la copie continue de tourner : son `fit()` réécrit la largeur en ligne de `#scope-path` à chaque changement de langue, de forme, de taille ou de polices. Un essai la réapplique dans `onChange`, la surcharge dans `styles.css`, ou remplace `scope-pill.mjs`.

### Remplacer un module de la copie

- Poser dans le dossier de l’essai une copie du module au même chemin (par exemple `essais/texte-centre/scope-pill.mjs`) et le déclarer : `remplace: ['scope-pill.mjs']`. Avant le chargement de tout module, `styles.js` écrit une carte d’import qui envoie vers cette copie chaque adresse sous laquelle la copie importe le module (table de `styles.js`, produite par `snapshot.py` ; pour `scope-pill.mjs` : `scope-pill.mjs?v=b7`). Le remplacement vaut pour les deux pages et pour les imports statiques comme dynamiques.
- Dans le module remplaçant, les imports relatifs partent du dossier de l’essai : importer les modules de la copie sous `../../baseline/<module>?v=<la même clé que la copie>` pour partager leur instance (par exemple `../../baseline/continents.mjs?v=b1`) ; l’original d’un module remplacé reste accessible sous `../../baseline/<module>?original`, adresse que la carte ne redirige pas (instance séparée).
- Ne peuvent pas être remplacés : `welcome.mjs`, que `index.html` charge par sa propre balise de script (une carte d’import ne redirige pas une balise), et les scripts des pages `content-preview.mjs` et `design-review-selection.mjs`. Un module absent de la table est refusé avec une erreur dans la console.
- Si deux essais actifs remplacent le même module, le premier dans l’ordre canonique le garde ; le conflit est noté dans `horizonEssais.conflicts` et signalé dans la console.

### Dossier de contrôle `_controle`

[`essais/_controle/`](essais/_controle/README.md) n’est pas un essai de design et la galerie ne le montre pas. Il déclare les trois sortes de fichiers, sans changement visible (une feuille, un module, et `scope-pill.mjs` remplacé), pour vérifier le chargeur d’un seul chargement : `baseline/content-preview.html?essais=_controle#explore`.

## Vérifications réalisées (26 octobre 2026)

Chrome sans interface (version 156) piloté par l’outil commun [`helper.py`](../design-review-studies/checks/helper.py), mouvements réduits émulés ; les scripts de contrôle restent hors du dépôt. Toutes les captures citées ont été regardées.

### Le socle (après-midi)

- **Socle :** `python3 -I -B studies/explorer-b-filter-studies/snapshot.py --verify` : 253 fichiers, 245 identiques au commit 46279b0, 8 égaux au commit plus leurs adaptations, 310 références relatives qui restent dans l’étude ou dans `shared/`, 52 modules importés dont la table de `styles.js` correspond aux imports de la copie ; [preuve](snapshot-verification.json).
- **Équivalence avec la version B du commit 46279b0** (servie depuis l’export de ce commit) : `content-preview.html#explore` à 1440 × 900, français, clair, puis « Valider » sur l’Afrique et sur l’Angola, ←, le globe « Revenir au monde » et la rubrique Projets : **0 pixel différent** sur les 6 états, filtre à la même place et de la même taille ; `index.html`, l’entrée puis « Visiter » : 0 pixel différent.
- **Requêtes et console :** pendant ces parcours, la copie ne fait aucune requête hors de l’étude et de `shared/` (polices Jost, `jost.css`, `tokens.css`, logo 42), toutes réussies, sauf `favicon.ico` (404, comme pour `site-b/`) ; aucune erreur dans la console en dehors de cette ligne du navigateur.
- **Stockage :** avec la clé de thème de B réglée sur sombre et un favori dans les préférences de B, la copie s’ouvre en clair et sans ce favori ; après `?theme=dark` et un favori ajouté dans la copie, seules les clés préfixées sont écrites et celles de B sont intactes.
- **`?theme=` et `?lang=` :** arabe clair et anglais sombre à 1440 × 900, arabe sombre à 390 × 844, français à 667 × 375 (menu sur le côté) : filtre dans la langue (« العالم », « World »), arabe en miroir, aucune erreur ; l’entrée `index.html` en arabe (boutons « زيارة » et « تسجيل الدخول »), puis « Visiter » : l’Explorer en arabe, sans erreur.
- **Les quatre essais vides :** actifs, seule leur fiche est chargée, ni feuille ni carte d’import ; 0 pixel différent de la copie. Une capture de référence prise juste après une émulation de mobile différait de 8 pixels sur le point du « i » du bouton ⓘ (lissage) ; la capture faite dans une session neuve est identique.
- **Contrôle du chargeur (`_controle`) :** sur les deux pages, `welcome.mjs` reçoit bien le `scope-pill.mjs` de l’essai (l’original est chargé sous `?original`), la feuille de l’essai vient en dernier et l’emporte (`--scope-fill` calculé `rgb(255 255 255)`), sans changement visible (0 pixel). Appels du crochet : `start` ; `filter` après « Valider » (« Afrique », niveau continent) puis après ← (« Monde ») ; `language` + `filter` en anglais (« World », 357 px) ; `size` puis `fonts` à 390 × 844 ; `size` + `form` à 1280 × 720 (menu sur le côté) ; `theme` ; `page` + `filter` en passant à Projets puis au mode lecture (333 px, sans chevron). Sur `index.html`, le premier appel arrive avant le catalogue (`width` nul), puis `filter` à 345 px.
- **Galerie :** quatre cartes ; vues cachées tant qu’aucun essai n’est choisi ; pour chaque « Comparer », la copie à gauche (aucun essai actif) et l’essai à droite (sa seule fiche), même page, même filtre ; les deux vues ne diffèrent que par le lissage (au plus 5 sur 765 par pixel, sauf 6 pixels du « i » du bouton ⓘ à 1280 × 720, jusqu’à 39) ; une vue de téléphone se place au milieu de son cadre. Formats 390 × 844 arabe sombre, 1280 × 720 anglais clair, 667 × 375 français sombre ; pages 42 Abu Dhabi et arrivée ; lien direct `?essai=` ; liens « Ouvrir » sans le paramètre `chargement` ; à 390 px, ni débordement horizontal ni erreur ; aucune requête hors de l’étude et de `shared/` (hors `favicon.ico`).
- **Corrigé pendant le contrôle :** une deuxième comparaison redonnait à la vue de gauche la même adresse ; elle ne suivait alors que son ancre, et la copie, traitant cette navigation, mettait le focus sur l’Explorer (anneau autour de « Valider » d’un seul côté). Chaque comparaison recharge désormais les deux pages.

### Les essais (soir), par leurs auteurs, en mode rapide

Mode rapide, choisi par l’utilisateur : chaque auteur a regardé quelques captures clés et mesuré, à chaque étape de ses parcours, les boîtes du filtre et du ←. Les chiffres complets, la liste des captures et ce qu’elles montrent sont dans les README. **Ce n’est pas une vérification complète** : comme pour la version B, elle est renvoyée à la [liste de fin](../../docs/VERIFICATIONS-FINALES.md).

- **Parcours communs**, à 1440 × 900 en français clair : « Monde », un continent par le bouton fixe « Valider », un pays et un campus (« Valider » ou Entrée), puis ←, le globe « Revenir au monde » et la recherche (« Lyon », puis 42 Lyon) ; Projets filtré par le panneau du filtre ; plusieurs niveaux à 390 × 844 en arabe sombre ; 1280 × 720 avec le menu sur le côté. Pour chaque essai, le filtre et le ← gardent exactement les mêmes boîtes à toutes les étapes d’un même format, et le centre du filtre est sur l’axe (0 px, contre +26 px dans la copie). Seule exception, héritée de la copie : en arabe, au campus, la hauteur du filtre de 04 change (voir « Limites et suites »).
- **Selon les essais** : l’anglais et l’arabe à 1440 × 900 (mesurés), la fiche projet en mode lecture, 667 × 375 (02 avec captures, 03 et 04 par mesure), 320 × 640 (04), l’arrivée `index.html` puis « Visiter » (01, 03 et 04).
- **Toutes les indications** : 03 a parcouru les 93 indications et le retour à « Monde » dans 7 configurations, avec une seule boîte de filtre et de ← par configuration ; 01 et 04 ont mesuré les 93 indications de chaque langue par la méthode de la copie (textes coupés, écarts au centre) ; 02 a mesuré les plus longs noms.
- **Accessibilité** : 03 a comparé à la copie les noms, les intitulés et l’arbre d’accessibilité de Chrome ; 01 complète les noms du bouton du filtre, décrits dans son README ; 02 et 04 ne changent aucun nom.
- **Console et requêtes** : aucune erreur JavaScript, aucune requête en échec ni hors de l’étude et de `shared/` (hors `favicon.ico`).

### La galerie comme l’utilisateur s’en servira (soir)

Parcours fait dans la galerie servie par le serveur local habituel, après la fin des quatre essais, sans rien modifier de la galerie ni du chargeur ; une seule session de Chrome à la fois, fermée à la fin. Les vues ont été photographiées entières, et le filtre de chaque côté agrandi ; toutes ces captures ont été regardées, rassemblées en planches.

- **Galerie dans une fenêtre de 1440 × 900** : les quatre cartes portent leur numéro, leur titre, le résumé de leur auteur, « Comparer » et « Ouvrir l’essai », sans badge « Vide » ; la comparaison reste cachée jusqu’au premier choix.
- **« Comparer » de chaque carte**, dans les formats 1440 × 900 et 390 × 844, en clair et en sombre, en français et en arabe (32 comparaisons) : les deux vues se chargent à la taille, dans le thème et dans la langue choisis, celle de gauche sans essai, celle de droite avec ce seul essai. Le filtre de chaque essai est sur l’axe dans les 8 réglages ; celui de la copie est à +26 px (−26 en arabe) à 1440 × 900 et à ±21,5 px à 390 × 844. Les largeurs mesurées sont celles du tableau « En un coup d’œil ».
- **Vues proposées par les essais** : 42 Paris pour les quatre, à 1440 × 900, où le filtre de chaque essai garde la boîte qu’il a à « Monde » ; « 42 Abu Dhabi sur téléphone, en arabe » (01) et « France (téléphone, forme courte) » (03), qui règlent bien le format, et pour 01 le thème et la langue.
- **Arrivée `index.html`** pour les quatre, puis « Visiter » dans les deux vues : l’Explorer à « Monde », chaque essai actif et centré, la copie à +26 px. L’arrivée de 02, que son auteur n’avait pas vue, se comporte comme les autres.
- **« Ouvrir l’essai » de chaque carte et « Ouvrir la copie »** (nouvel onglet, `rel="noopener"`), ouverts en grand à 1440 × 900 en français clair : à « Monde », après « Valider » (l’Afrique), puis après ←, le filtre garde sa boîte (01 : 315 px à x = 562,5 ; 02 : 264 px à 588 ; 03 : 406 px à 517 ; 04 : 345 px à 547,5 ; tous sur l’axe ; la copie : 345 px à 573,5, +26 px). La copie sans paramètre s’ouvre comme « Ouvrir la copie ».
- **Galerie dans une fenêtre de téléphone (390 × 844)** : aucun défilement horizontal ; tout s’empile et les listes prennent la largeur. « Comparer » de chaque carte en 390 × 844 français clair, puis en 1440 × 900 arabe sombre : vues chargées, essais actifs, mêmes boîtes qu’en grand. Les quatre liens « Ouvrir l’essai », ouverts sur ce téléphone en arabe sombre : page en miroir, filtre sur l’axe.
- **Liens directs** `index.html?essai=<id>` : les quatre ouvrent la bonne comparaison sur « Explorer · Monde », la carte marquée comme courante.
- **Console et requêtes** : 13 490 requêtes au total, toutes dans l’étude ou dans `shared/`, aucune en échec ni en erreur ; aucune erreur, aucun avertissement ni aucune exception dans la console (hors `favicon.ico`). Chaque essai ne fait charger que sa fiche, sa feuille et, pour 01 à 03, son `scope-pill.mjs`.
- **Hauteur en arabe**, page chargée à neuf à « Monde », à la France et à 42 Paris, à 1440 × 900 et à 390 × 844 : la copie mesure 51, 51 puis 54 px (49, 49 puis 48 px), son ← descend de 1,5 px au campus (monte de 0,5 px) ; 01 et 02 restent à 51 px, 03 à 54 px, et tous les trois à 49 px sur téléphone ; 04 suit la copie. Filtre sur l’axe partout.
- **Copie intacte** : `snapshot.py --verify` refait ensuite donne le même résultat que l’après-midi (253 fichiers, 245 identiques au commit, 8 adaptés, aucun problème).
- **Le lien « Notes de l’étude »** ouvre ce fichier brut. Le serveur local l’envoie en `text/markdown` sans jeu de caractères, et Chrome le décode alors en Windows-1252 : accents et guillemets illisibles (« lâ€™utilisateur »). Les galeries des études précédentes lient leurs `NOTES.md` de la même façon. Non corrigé (voir « Limites et suites »).
- **Ce que montrent les captures** : à « Monde », la copie a « Monde ⌄ » contre le globe et un grand vide à droite (à gauche en arabe) ; 01 montre « Monde · 58 campus · 30 pays ⌄ » sans ligne dessous, les points d’étape remontés sous le filtre ; 02 un filtre plus court avec « Monde ⌄ » au milieu ; 03 « Monde ⌄ › Continent › Pays › Campus », les trois dernières étapes en gris ; 04 « Monde ⌄ » au milieu du filtre de la copie, juste au-dessus de « 58 campus · 30 pays ». À 42 Paris : « 42 Paris · France ⌄ » (01), « 42 Paris ⌄ » avec « France » dessous (02), « Europe › France › 42 Paris ⌄ » (03), « France › 42 Paris ⌄ » centré (04). En sombre, les mêmes filtres ; en arabe, les mêmes en miroir, le globe et le ← à droite ; sur téléphone, la forme courte de 03 (« Monde ⌄ › Continent ») et, à 42 Abu Dhabi en arabe, le pays de 01 coupé par « … ».
- **Corrections** : aucune. Rien n’a été modifié dans la galerie, le chargeur, la copie ni les dossiers des essais ; seules ces notes ont été complétées.

Aucun téléphone réel, lecteur d’écran ni audit complet d’accessibilité n’est revendiqué.

## Limites et suites

- `shared/` n’est pas figé avec la copie (voir plus haut).
- **La copie date d’avant la reprise du menu latéral** dans le style du premier menu de A (§X), en cours dans `site-b/` le 26 octobre : un essai retenu serait à reporter sur la version B du moment.
- **Les essais 01, 02 et 03 remplacent tous `scope-pill.mjs`** : ils ne se combinent pas. Demandés ensemble, le chargeur garde le premier dans l’ordre de la galerie et signale le conflit. La galerie montre un essai à la fois.
- **La hauteur du filtre en arabe**, héritée de la copie : au campus, le filtre passe de 51 à 54 px à 1440 × 900 (de 49 à 48 px à 390 × 844) et le ← bouge de 1,5 px (0,5 px). 01, 02 et 03 gardent une hauteur constante (01 et 02 : 51 px à 1440 × 900 ; 03 : 54 px ; tous 49 px à 390 × 844) ; 04 en hérite tel quel. Une hauteur fixe dans la version B réglerait ce point pour l’essai retenu ; c’est à décider.
- **Sur téléphone**, 01, 03 et 04 raccourcissent le filtre pour le garder centré (272 px au lieu de 293 à 390 px), si bien que quelques indications finissent par « … » ; 02, plus court par construction (249 px en français, 261 en arabe), n’en coupe aucune à 390 px.
- **Non vérifié, pour l’ensemble** : Firefox et Safari, de vrais téléphones, les lecteurs d’écran, les couleurs forcées, le survol réel et les animations (tous les contrôles ont tourné avec les mouvements réduits). Les vues de la galerie n’émulent ni le toucher ni la densité d’un téléphone ; « Ouvrir l’essai » montre la page en grand.
- `welcome.mjs` ne peut pas être remplacé (voir plus haut) ; un essai agit par `styles.css`, `module.mjs` et le crochet, ou en remplaçant un module importé.
- **Les notes s’affichent mal depuis la galerie** : le lien « Notes de l’étude » ouvre ce fichier avec des accents illisibles (voir « Vérifications réalisées »). Mieux vaut les lire dans l’éditeur. Pistes, à décider plutôt que d’en créer une ici sans demande : un BOM UTF-8 en tête des notes, une petite page qui les affiche, ou un serveur local qui annonce l’UTF-8.
- Les captures et les scripts de contrôle restent hors du dépôt, dans le dossier temporaire de la session, qui a déjà été vidé par le passé ; ces notes et les README en gardent les résultats, et l’étude se revérifie depuis le dépôt (`snapshot.py --verify`, puis la galerie).
- Le registre des recherches, le README de `studies/`, `PROJECT_CONTEXT.md` et `BOARDING_JOURNAL.md` ne mentionnent pas encore cette étude.
- Suite demandée par l’utilisateur : lui montrer les quatre essais, puis archiver l’étude « avec le reste ».

## Sources

- Copie : [`snapshot.py`](snapshot.py) (construction et contrôle), [`snapshot-manifest.json`](snapshot-manifest.json) (fichiers, empreintes, blobs du commit, adaptations, exclusions, table des imports), [`snapshot-verification.json`](snapshot-verification.json).
- Chargeur : [`essais/boot.js`](essais/boot.js), [`essais/styles.js`](essais/styles.js), [`essais/modules.mjs`](essais/modules.mjs), [`essais/pill.mjs`](essais/pill.mjs).
- Galerie : [`index.html`](index.html), [`gallery.css`](gallery.css), [`gallery.mjs`](gallery.mjs).
- Essais : les README de [01](essais/chiffres-dans-le-filtre/README.md), [02](essais/filtre-plus-court/README.md), [03](essais/chemin-en-etapes/README.md) et [04](essais/texte-centre/README.md), avec leurs fiches `essai.js`, leurs feuilles et, pour 01 à 03, leur `scope-pill.mjs`.
