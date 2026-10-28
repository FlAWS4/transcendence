# Vérification Figma de Projets — synthèse v5 (18 octobre 2026)

**Périmètre.** 11 sections, 94 cadres : liste des projets (24), filtre (8), fiche (14), Réalisation (4), Médias (4), Tester le projet (8), menu d'un commentaire (4), choix du campus (4), Commentaires (16), Signaler (4), visionneuse (4).

Les captures Figma des sections datent de 00 h 37–00 h 38 UTC, après l'appel 798 (fiche « Mobile · Clair · العربية »). Quatre vérificateurs ont relevé 22 défauts.

**Recoupement**, sans outil Figma ni Chrome :
- planches et agrandissements rouverts pour les 13 défauts bloquants ou visibles, plus des recadrages à la même échelle (`v5/_synthese/*.png`) ;
- code relu : `dom2fig.py` (version de 06 h 00), `render.js` (05 h 51), `capture_lib.py` (05 h 51), `make_call.py`, `assets.py` ;
- relevés `dom/projects/` interrogés ;
- couleur du texte indicatif mesurée sur les captures du site ;
- conversions à blanc en mémoire (`python -B`) avec le code actuel ;
- correctifs proposés essayés sur une copie hors du dépôt. Le diff est dans [`v5/_synthese/proposition-dom2fig-P2-P4-P5.diff`](v5/_synthese/proposition-dom2fig-P2-P4-P5.diff) et le résultat de l'essai dans `v5/_synthese/essai-proposition-dom2fig.txt`.

Mesures : [`v5/_synthese/controles_synthese.json`](v5/_synthese/controles_synthese.json).

## Bilan

- **22 défauts confirmés**, regroupés en 12 causes : 13 sont bloquants ou visibles, 9 sont mineurs. **Aucun n'est écarté.**
- **Deux régressions** viennent des correctifs du 17 octobre au soir :
  - la barre « Monde » est masquée par le fondu de l'en-tête (58 cadres) ;
  - le titre arabe de la fiche est mis en page de droite à gauche (4 cadres).
- **Le code a changé pendant la synthèse.** Une autre session a modifié le code de 05 h 31 à 06 h 00 UTC, puis régénéré les appels. Cinq causes sont corrigées dans le code, mais pas encore envoyées ni vérifiées dans Figma : P1, P3, P8, P9 et P10.
- **Restent ouverts dans le code** :
  - 5 causes bloquantes ou visibles : titres de la vue Liste, titre arabe, campus en arabe, visionneuse mobile, texte indicatif de Signaler ;
  - 2 causes mineures : espace fine du compteur, curseur de saisie.
- **Les envois ont repris.** Les appels 799 à 801 sont partis, le dernier à 06 h 10, et 802 était en cours d'envoi à 06 h 14. Huit appels portent des défauts ouverts : 802, 803, 930, 810, 811, 827, 828 et 830. Ceux qui partent avant les correctifs seront à renvoyer.

| P | Cause | Cadres | Gravité | État (06 h 12 UTC) |
|---|---|---|---|---|
| 1 | Barre « Monde » sous le fondu `#app::after` | 58 | bloquant | corrigé (`hoist_z`), à envoyer |
| 2 | Titres bridés de la vue Liste trop étroits | 4 | bloquant | **ouvert** |
| 3 | Cadres du 16 octobre jamais régénérés : menu « Trier » sous les cartes | 2 | bloquant | régénérés à 06 h 02 (931), à envoyer |
| 4 | Marque RLM ajoutée à la valeur arabe de la variable partagée du titre de la fiche | 4 | visible | **ouvert** |
| 5 | Coupe d'un nom de campus en milieu de ligne jugée avec la direction de `<bdi>` | 2 | visible | **ouvert** |
| 6 | Illustration rognée au `viewBox` dans une boîte « contain » | 2 | visible | **ouvert** |
| 7 | Couleur du texte indicatif supposée `--h42-color-muted` | 4 | visible (sombre) | **ouvert** |
| 8 | `cref()` des cadres construits depuis la capture sombre : anneau de focus clair | 2 | visible | corrigé (06 h 00), à envoyer |
| 9 | Couleur et décalage du soulignement non relevés | 8 | visible (sombre) | corrigé (05 h 51), à envoyer |
| 10 | Fond « atmosphère » limité à la hauteur de l'écran | cadres pleine hauteur | mineur | corrigé (05 h 31), à vérifier |
| 11 | U+202F remplacé par une espace au relevé | 4 | mineur | **ouvert** |
| 12 | Curseur de saisie absent | 4 | mineur | **ouvert**, facultatif |

## Correctifs par priorité

### 1. Barre « Monde » masquée par le fondu de l'en-tête — bloquant, 58 cadres (régression)

**Cadres touchés.**
- Liste des projets (12 cadres) :
  - Mobile, en français et en arabe ;
  - Ordinateur, en arabe ;
  - vue Liste, tri ouvert et dernière page, sur mobile.
- Fiche projet (8 cadres) :
  - Ordinateur, en français et en arabe ;
  - Mobile, en arabe ;
  - projet à campus unique, sur ordinateur.
- Réalisation, Médias, Tester le projet et Choisir un campus, sur ordinateur.
- Tester le projet · lien enregistré et Menu à trois points, sur ordinateur et mobile.
- Commentaires : les 16 cadres.
- Sous un voile, la barre devrait apparaître floutée : Signaler (4 cadres), Choisir un campus, Filtrer les projets sur mobile (mineur).

Les cadres construits avant le 17 octobre au soir montrent la barre.

**Cause** (`dom2fig.py`).
- Le fondu `#app::after` est fixe, avec un z-index de 6. C'est un frère de « Principal », peint après lui depuis le 17 octobre au soir.
- La barre (fixe, z-index 8) restait un enfant de « Principal ». L'élément `main` ne crée pas de contexte d'empilement, mais `zsort()` ne trie qu'entre frères (limite E de la v4).

**Code actuel.** `stacking_context()` et `hoist_z()` (05 h 31) sont appelés dans `build_one()` et `_convert()`.
- La conversion à blanc donne l'ordre Fond (hauteur H), Contenu, Après · Application, Barre de périmètre (y = 40 ou 84), En-tête, Menu du bas.
- 8 états ont été contrôlés, y compris en arabe et page défilée.

**Action.**
- Aucun changement de code.
- Envoyer les appels régénérés, puis le clonage sombre en dernier.
- Contrôler la pastille et son médaillon dans les 58 cadres.

### 2. Titres de la vue Liste amputés du dernier mot — bloquant, 4 cadres

**Cadres touchés.** Vue Liste, Ordinateur et Mobile, en clair et en sombre : 21 titres d'une ligne sur 24.

**Cause** (`dom2fig.text_nodes()`, branche des textes bridés, ligne 760).
- La boîte du texte vaut `width + 0.4`.
- En vue Liste, le lien est ajusté au texte (`flow-root`, largeur égale à la ligne).
- Figma compte l'interlettrage négatif après la dernière lettre, Chrome non. Il manque donc 0,98 px à 28 px, et 0,7 px à 20 px.
- Mesures avec Jost Medium :
  - « Ce qui relie nos messages » demande 299,82 px dans Figma, pour une boîte de 299,23 ;
  - sur mobile, 214,18 px pour 213,85.
- Le dernier mot passe en ligne 2, rognée par le cadre « Titre ».
- `render.js` n'applique pas `fitLines()` quand `ml` est présent.
- Le défaut est toujours dans les appels 803 et 930, ce dernier régénéré à 06 h 02.

**Correctif.**
- `text_nodes()` : `t['w'] = r2(width + 0.4 + max(0.0, -t.get('ls', 0.0)))`, soit la marge des paragraphes depuis le 17 octobre.
- Garde-fou facultatif :
  - si `clamped`, `vis == txt` et `nl < clamped`, poser `nl`, `wmin` et `wmax = width + 2 + |ls|` ;
  - `render.js`, ligne 213 : `if (n.nl && n.w && !n.aw && (!n.ml || n.nl < n.ml)) fitLines(t, n);`.

**Essai sur une copie.**
- Les titres passent à 300,21 et 214,55 px.
- Sur les cinq zones, seules changent les largeurs des titres bridés.

**À régénérer :** 803 et 930.

### 3. Cadres du 16 octobre jamais régénérés — bloquant, 2 cadres (menu « Trier »)

**Cadres touchés.** Liste des projets · tri ouvert, Ordinateur, en clair et en sombre. Le menu est peint sous la troisième carte ; les autres cadres du 16 octobre ont aussi le défaut 10.

**Cause.**
- Les cadres en français sur ordinateur de la liste, ainsi que plusieurs cadres mobiles (fiche, onglets, choix du campus), n'avaient pas été renvoyés depuis le 16 octobre (appels 248 et 431).
- Les correctifs d'ordre z du 17 octobre ne les avaient donc jamais atteints.

**Code actuel.**
- `#content-sort-menu` est le dernier enfant de « Contenu », en (961 ; 257).
- Ces cadres ont été régénérés à 06 h 02 : appels 929 à 936, 939, et clone 940.
- Seul reste l'état vide, haut d'un écran et sans défaut.

**Action.**
- Envoyer 931, puis 940.
- Désormais, régénérer tous les états d'une zone après un correctif du convertisseur.

### 4. Titre h1 arabe mis en page de droite à gauche — visible, 4 cadres (régression)

**Cadres touchés.** Fiche projet en arabe, Ordinateur et Mobile, en clair et en sombre. On lit « · ft_transcendence », et « خمسة » passe à la ligne sur mobile ; la v3 était conforme.

**Cause.**
- `text_nodes()` (lignes 803 et 804) ajoute la marque RLM à `sv['ar']` sans condition.
- Le h1 a `dir="auto"` et commence par une lettre latine : son relevé arabe donne `s.dir = 'ltr'`.
- Il partage la variable « Projets/ft_transcendence · Construire à cinq » avec les titres des cartes, qui sont de droite à gauche. Sa valeur arabe commence par U+200F (`calls/strings-sent.json`).
- `render.js stringVar()` (ligne 101) et `make_call.dedupe_strings()` (ligne 114) mettent à jour en place une variable dont seule la marque RLM diffère.
- Les appels 810 et 811 lient le h1 par le seul nom de la variable.

**Correctif** (`dom2fig.py`, dans le diff).
- `pair_strings()` note la direction de l'élément dans le relevé arabe (`dar`).
- `text_nodes()` :
  - n'ajoute la marque RLM que si `dar == 'rtl'` ;
  - si `dar == 'ltr'` et que la marque changerait la valeur, pas de marque et une variable distincte : nom + « · LTR » ;
  - `dar` est reporté dans la branche des textes bridés et retiré de `t['sv']`.
- Conseillé : retirer la mise à jour en place (`render.js`, ligne 101 ; `make_call.py`, ligne 114), puisque la migration RLM est faite.

**Essai sur une copie.**
- Le h1 passe à « … · LTR », sans marque RLM, en français comme en arabe.
- Les titres des cartes gardent la marque.
- Cinq variables sont concernées dans tout le relevé :
  - celle-ci, dans 7 états de Projets : fiche, choix du campus, sélecteur et Signaler ;
  - 4 variables « Commun/… » de la recherche ouverte, à vérifier dans Éléments communs.

**À régénérer :** 810, 811, puis les cadres français liés à la même variable (809, 826, 827, 828, 933, 934, 939) et les clones.

### 5. Noms de campus coupés en arabe — visible, 2 cadres

**Cadres touchés.** Liste des projets en arabe sur mobile, en clair et en sombre. On lit « Tokyo · 42 Rio » au lieu de « 42 Rio · Tokyo » ; « Dhabi » et « Luanda » sont à gauche.

**Cause** (`text_nodes()`, lignes 853 à 859).
- Le test « suite qui commence en milieu de ligne » lit `s.dir` de l'élément en ligne : `<bdi dir=auto>`, « ltr ».
- Il faudrait la direction du bloc qui pose les lignes : `span.cp-content-campuses`, de type `block`, en « rtl ».
- « 42 Tokyo » a deux boîtes de ligne : [230,98 ; 16,03], puis [331,48 ; 32,52]. Sans découpe, on obtient un seul texte de 2 lignes, aligné à gauche à x = 231.

**Correctif** (dans le diff).
- Dans `_convert()`, `line_dir(n)` donne la direction du premier ancêtre, ou de l'élément lui-même, dont l'affichage n'est ni `inline` ni `contents`.
- Elle est passée à `text_nodes(…, bdir)` et sert au test.

**Essai sur une copie.**
- On obtient « 42 » / « Tokyo » (x = 331,5), « 42 Abu » / « Dhabi », « 42 » / « Luanda ».
- « 42 Le Havre » (dernière page) et « 42 Bangkok » (vue Liste) sont aussi coupés correctement.
- Le français ne change pas. Aucun effet sur Profils, les Chroniques ni Explorer.

**À régénérer :** 802 et son clone.

### 6. Illustration de la visionneuse mobile rognée au `viewBox` — visible, 2 cadres

**Cadres touchés.** Visionneuse de médias, Mobile, en clair et en sombre.

**Cause** (`render.js`, branche S/P avec boîte, lignes 273 à 275).
- Le composant vient de `createNodeFromSvg`, en 800 × 500. Son instance est réduite dans la boîte de 360 × 638 (`meet`), mais rogne encore à ses propres bords.
- Sur le site, le `<svg>` ne rogne qu'à sa boîte. Les cercles (cx 690, cy 66, r 190 et cx 110, cy 457, r 147) dépassent du `viewBox` d'environ 56 px en haut et 47 px en bas.

**Correctif.**
- Après `inst.rescale(kk)` : `if (n.t === 'S' && n.fit === 'contain') { try { inst.clipsContent = false; } catch (e) {} }`.
- La boîte garde `clipsContent`, comme le `<svg>`.
- Les autres usages ne changent pas : quand les proportions sont égales (visionneuse sur ordinateur, cartes, fiches), l'instance est posée directement.

**Points à vérifier.**
- Essayer d'abord sur un seul cadre : la surcharge sur une instance n'est pas vérifiable ici.
- À défaut : `assets.py update` avec `clipsContent = false` sur ce composant, et boîte toujours présente pour les illustrations.

**À régénérer :** 830 et son clone.

### 7. Texte indicatif de Signaler — visible en sombre, mineur en clair, 4 cadres

**Cause.**
- `field_runs()` donne `--h42-color-muted` à tout texte indicatif.
- `content-report.css` n'a pas de règle `::placeholder` : Chrome peint sa couleur par défaut. La capture du site mesure (117, 117, 117) en clair comme en sombre.
- Figma montre au contraire #95B0B0 en sombre et #536163 en clair.

**Correctif.**
- `capture_lib.py`, après la ligne 130 : pour un champ qui affiche son indication, relever `getComputedStyle(el, '::placeholder').color`.
- `field_runs()` et `_convert()` prennent cette couleur, en clair et en sombre.
- À défaut, pour les relevés actuels :
  - `--h42-color-muted` seulement sous `.cp-comments-form`, `.cp-search` et `.dock-search-input`, les trois règles du site ;
  - ailleurs, `rgb(117, 117, 117)`.

**Essai de la règle de repli.** Signaler passe à #757575, et les Commentaires gardent `Rôles/muted`. Le signalement d'un profil est concerné de la même façon.

**À régénérer :** 827 et 828.

### 8. Anneau de focus clair dans les cadres sombres — visible, 2 cadres

**Cadres touchés.** Commentaires · suggestions de mention, en sombre.

**Cause.** En mode SWAP, `cref()` rendait la couleur claire #008E90 quand la paire n'avait pas de variable.

**Code actuel** (06 h 00).
- Sans variable, `cref()` garde la couleur de la capture sombre, #96A3EB.
- Appels régénérés : 937 et 938 (818 et 820 sont archivés).

**Action.**
- Envoyer, puis vérifier.
- Facultatif : créer « Rôles/focus » (#008E90 / #96A3EB, `--h42-color-focus`) dans `palette.json` et dans Figma. Aujourd'hui, l'anneau est en couleur fixe dans les deux cadres.

### 9. Soulignement de « Réinitialiser » — visible en sombre, mineur en clair, 8 cadres

**Code actuel** (05 h 44–05 h 51).
- `capture_lib.py` relève `decoColor`, `uOffset` et `decoW`.
- `text_nodes()` les convertit en `tdc`, `tdo` et `tdw`.
- `render.js` les pose avec les propriétés de soulignement de Figma.
- Les relevés des filtres ont été repris à 05 h 52, et les appels 918 à 921 régénérés.

**Conversion à blanc.** `tdc` vaut `Contenus/line` et `tdo` vaut 4.

**Action.** Envoyer, puis vérifier le trait (y ≈ 648, à peine visible en sombre).

### 10. Fond « atmosphère » limité à la hauteur de l'écran — mineur, tous les cadres pleine hauteur

**Code actuel.** `build_one()` (05 h 31) : un calque fixe sans enfant qui couvre l'écran prend la hauteur H du cadre. Toutes les scènes de la zone ont été régénérées.

**Action.** Vérifier la teinte sous 960 et 844 px.

### 11. Espace fine du compteur « 0 / 1 000 » — mineur, 4 cadres

**Cause.** `capture_lib.py`, lignes 81 et 126 : `.replace(/\s+/g, ' ')` remplace U+202F, produit par `Intl.NumberFormat('fr')`, par une espace.

**Correctif.** Utiliser `/[^\S  ]+/g`.

**Limite.** Il faut un nouveau relevé, et les textes qui contiennent une espace insécable changent de variable : à faire avec un relevé général.

### 12. Curseur de saisie absent — mineur, facultatif, 4 cadres

**Correctif.** Dans `field_runs()`, pour un champ ayant le focus (`outline` relevé), ajouter un trait de 1 px sur la hauteur de la ligne, dans la couleur du texte, après la valeur.

## Ordre conseillé

1. **Retenir les appels qui portent encore les défauts 2 et 4 à 7 :**
   - 802, 803, 810, 811, 827, 828, 830, 930 ;
   - pour le défaut 4, aussi 809, 826, 933, 934, 939 ;
   - le clonage sombre 940.
2. **Appliquer les correctifs :**
   - P2, P4 et P5 dans `dom2fig.py`, d'après le diff ;
   - P6 dans `render.js` ;
   - P7 : d'abord la règle de repli de `field_runs()`, puis le relevé.
3. **Régénérer la zone,** passer `sim_figma.mjs`, envoyer, puis cloner en sombre en dernier.
4. **Capturer les sections (v6) et contrôler, dans cet ordre :**
   - la barre « Monde » dans les 58 cadres ;
   - le menu « Trier » sur ordinateur ;
   - les titres de la vue Liste ;
   - les campus et le h1 en arabe ;
   - les cercles de la visionneuse ;
   - le texte indicatif ;
   - l'anneau de focus ;
   - le soulignement ;
   - le fond.

## Défauts des passes précédentes (v3 et v4), revérifiés

**Corrigés dans Figma :**
- colonne fixe des fiches (A) ;
- états défilés (B) ;
- valeur et texte indicatif des champs (C1, hors couleur, voir P7) ;
- texte en milieu de ligne après une @mention (D) ;
- menu du tri des commentaires (E) ;
- « J'aime » pressé (F) ;
- titre « Derrière une ligne de / commande » (G) ;
- textes en chasse fixe des SVG (I) ;
- ☺ et ↗ monochromes (H) ;
- rangées d'auteurs arabes ;
- titre arabe des cartes ;
- point médian sur mobile ;
- coches des filtres ;
- paragraphes arabes ;
- fenêtre de la visionneuse mobile.

**Sans objet :** le trait hérité des illustrations (J), car le site a été corrigé.

**Corrigés en partie :**
- menu « Trier » : bon sur mobile, en attente sur ordinateur (P3) ;
- campus coupés : bons en français, pas en arabe (P5) ;
- anneau de focus : bon en clair, en attente en sombre (P8) ;
- illustration de la visionneuse : taille juste, cercles rognés (P6).

**Non corrigés :**
- titres de la vue Liste (P2) ;
- soulignement (P9, corrigé dans le code depuis) ;
- fond (K, P10, idem) ;
- compteur (P11).

## Écartés et non retenus

- **Aucun défaut bloquant ou visible n'est écarté.** La pastille « Monde » sous un voile est reclassée parmi les mineurs. Elle est floutée : Signaler, Choisir un campus, Filtrer les projets sur mobile. Sa cause est celle de P1.
- **Symboles, hors décompte** (limite 9), mais la prémisse est à revoir :
  - ☺ est dessiné par Chrome en Liberation Sans, ce qu'a déjà repris l'appel 799 ;
  - ↗ a, dans « Tester le projet · lien enregistré », une avance de 8,66 px à 14 px : c'est celle de Noto Sans Math. DejaVu Sans donnerait 11,73 px.
- **Visionneuse mobile :** les 23,6 % et 21,9 % sont un artefact de l'outil. La fenêtre fixe est en haut du cadre, alors que l'outil compare la bande qui commence au défilement. Une fois alignés, on mesure 0,8 % et 4,05 %.
- **Captures de référence de la liste en arabe** : elles datent du 16 octobre, avant la correction du site du 17 (`.cp-art > svg { direction: ltr }`). Elles sont à reprendre ; ce n'est pas un défaut Figma.
- **Non comptés par les vérificateurs**, à juste titre (limites 3 à 5) : médaillon du globe, menu du bas et recherche en bas des cadres, anticrénelage, liserés d'export des cadres sombres, phase des tirets, petits écarts de teinte.

## Limites

- Aucun outil Figma ni Chrome n'a été utilisé.
- L'état décrit est celui du code et des appels à 06 h 12 UTC. Une autre session modifiait le code et envoyait des appels pendant la synthèse.
- Les correctifs P2, P4, P5 et la règle de repli de P7 ont été essayés par conversion en mémoire, sur une copie hors du dépôt. P6 (surcharge `clipsContent` d'une instance) et la partie relevé de P7 ne sont pas essayés.
- **Écritures :** ce fichier et `v5/_synthese/` (outil de recadrage, recadrages, mesures, diff proposé, sortie de l'essai). Le code, les scènes et les appels ne sont pas modifiés.
- Consigne de lecture seule : `PROJECT_CONTEXT.md`, le journal, le README de la refonte et le relevé Figma ne sont pas mis à jour. Le plan du site n'est pas concerné.
