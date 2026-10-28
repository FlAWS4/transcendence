# Vérification Figma du compte : synthèse v2 (18 octobre 2026)

## Périmètre

Zone « compte » (page 07 · Compte et réglages) : 9 sections, 36 cadres. Les exports `call-results/compte-*-v2.png` datent du 18 octobre, 00 h 20 UTC, après les envois du 17 au soir (appels 757 à 776). Deux vérificateurs ont fait 18 signalements (6 + 12). Planches, mesures et agrandissements : `v2/<section>/`.

Recoupement, en lecture seule, sans outil Figma ni Chrome :
- **planches rouvertes** pour tous les défauts bloquants et visibles : Thème et Paramètres sombres, barre « Monde » des cadres sombres et des deux fenêtres ;
- **code relu** :
  - `dom2fig.py` : `cref`, `by_dark`, `pick_dark`, `frame_paints`, `focus_ring`, `build`, `zsort`, `stacking_context`, `hoist_z` ;
  - `figlib.py` (`CLEAR_DARK`, `gradient_layers`), `build_palette.py` (`pair_colors`), `layout.py` (`DARK_RENDER`, `scenes`, `dark`), `capture_lib.py` (`full_shot`) ;
- **relevés** `dom/shell/` : styles du panneau et de ses ancêtres, fenêtres en clair et en sombre ;
- **scènes et appels** régénérés le 18 à 05 h 33 (chaîne 3 de `courier-correctifs-18oct.json`, appels 861 à 880) ;
- **conversions à blanc**, en mémoire, avec le `dom2fig.py` de 05 h 31 : `v2/_synthese/`.

Rien n'a été écrit hors de ce fichier et de `v2/`.

## Bilan

- **14 signalements confirmés, 4 écartés** (verre des panneaux mobiles). Les confirmés se regroupent en 4 causes.
- **Urgent** : le seul défaut bloquant est nouveau et n'est pas corrigé dans le code. Les appels 864, 866, 867 et 869 de la chaîne en cours le reproduisent. À 05 h 57, ils n'étaient pas encore partis.
- La barre « Monde » est déjà corrigée dans le code (`hoist_z`). La chaîne 3 l'envoie : 861 à 863 étaient partis à 05 h 54.

| # | Cause | Cadres | Gravité | État à 05 h 57 UTC |
|---|---|---|---|---|
| 1 | `cref()` en mode SWAP : transparents mal appariés, repli sur la couleur claire | 4 visibles ; 4 sans effet visible ; 2 hors zone | bloquant | non corrigé ; correctif vérifié à blanc |
| 2 | Barre « Monde » sous le fondu `#app::after` | 4 nets, 8 sous le voile, 14 masqués par le panneau | visible | corrigé (`hoist_z`) ; appels 861 à 880 en cours |
| 3 | Cadres « Ordinateur » du 16 octobre jamais régénérés | 7 clairs et 3 clones | mineur | absents des chaînes |
| 4 | Fenêtres sombres clonées avec la géométrie claire | 4 | mineur | non corrigé ; correctif vérifié à blanc |

## Correctifs par priorité

### 1. Couleurs claires dans les cadres construits depuis la capture sombre (bloquant, nouveau)

**Constat** (`theme/zoom/panneau-theme-mobile-sombre.png`, `settings/zoom/panneau-parametres-{ordinateur,mobile}-sombre.png`) :
- dans Thème et Paramètres, Ordinateur et Mobile · Sombre, la rangée « Clair » porte le fond turquoise du thème clair, environ RGB (33, 67, 70) ;
- la rangée « Sombre » n'a aucun fond. Sa coche rose et sa graisse Medium sont justes, mais le panneau semble dire « Clair ».
- Sur le site, seule « Sombre » est surlignée, en prune : environ (85, 45, 68).

**Cause** : `dom2fig.cref()`, branche `SWAP`.
- En SWAP, le relevé principal est le sombre ; l'« autre » relevé est le clair.
- `pick_dark()`, `frame_paints()` et `gradient_layers()` marquent pourtant une peinture absente selon le sens clair → sombre :
  - `CLEAR_DARK` (#1B1B1B00) pour une peinture absente de l'autre relevé ;
  - (0, 0, 0, 0) pour une peinture présente seulement dans l'autre.
- Après l'échange, ces marques tombent du mauvais côté de la clé :
  - `palette.json` contient `fond|#00BABC30|#1B1B1B00` et `fond|#00000000|#ED349138` (convention de `build_palette.pair_colors`) ;
  - `cref` cherche `fond|#00BABC30|#00000000` et `fond|#1B1B1B00|#ED349138`, ne trouve rien et renvoie `{'h': lh}`, c'est-à-dire la couleur **claire** ;
  - les scènes du 18 à 05 h 33 portent ainsi « Clair » `#00BABC30` et « Sombre » `#1B1B1B00`, en brut. Les appels 864, 866, 867 et 869 aussi.

**Portée**, sur les 10 cadres de `DARK_RENDER` :
- **visible** : Paramètres et Thème, Ordinateur et Mobile · Sombre ;
- **sans effet visible** : les 8 cadres sombres du compte ont des ombres claires brutes (#183D3C06 sur le panneau, #183D3C12 sur « Se connecter » et « Créer un compte ») et 10 arrêts du « Fond » non liés ;
- **hors zone, visible** : « Commentaires · suggestions de mention » (Projets), Ordinateur et Mobile · Sombre. L'anneau de focus y est #008E90, le turquoise du clair, au lieu du lavande #96A3EB. C'est pourtant pour lui que ces cadres sont construits depuis la capture sombre (commentaire de `DARK_RENDER`).

**Correctif** : dans `cref()`, branche SWAP, garder les cas `c is None` et `dark_c is None`. Remplacer ensuite l'échange `c, dark_c = dark_c, c`, qui renvoie vers le code commun, par le code ci-dessous. La branche claire ne change pas.

```python
lc, dc = dark_c, c                                    # c : couleur du relevé sombre, celle que montre le cadre
l2 = (0.0, 0.0, 0.0, 0.0) if lc[3] <= 0.001 else lc   # « absent en clair » selon build_palette
d2 = CLEAR_DARK if dc[3] <= 0.001 else dc             # « absent en sombre »
for l_, d_ in ((lc, dc), (l2, dc), (lc, d2), (l2, d2)):   # paire brute d'abord : un arrêt vraiment transparent garde sa clé
    lh, dh = hex_of(l_), hex_of(d_)
    name = palette()['map'].get('%s|%s|%s' % (kind, lh, dh)) or any_kind(lh, dh)
    if name:
        return {'v': name}
return {'h': hex_of(c)}                               # sans variable : la couleur sombre, pas la claire
```

**Vérifié à blanc** (`v2/_synthese/cref_check.py` et `.json`) sur les 10 cadres de `DARK_RENDER` :
- géométrie identique ;
- couleurs brutes : de 1 à 3 par cadre du compte, puis aucune ; arrêts non liés : de 10 à 0 par cadre ;
- « Clair » → `dérivées/fond/00BABC30-1B1B1B00`, transparent en Sombre ;
- « Sombre » → `dérivées/fond/00000000-ED349138`, prune en Sombre ;
- ombres → `dérivées/ombre/183D3C06-1B1B1B00` et `dérivées/ombre/183D3C12-1B1B1B00` ;
- anneau des suggestions de mention → #96A3EB brut. La paire `--h42-color-focus` manque toujours à la palette.

**Garde-fou** : `layout.scenes()` signale toute couleur brute d'une scène `theme='dark'`, sauf exceptions listées (l'anneau de focus).

**Reste à faire** :
- Si 864, 866, 867 et 869 ne sont pas encore partis, les retirer de la chaîne 3. Sinon, ils seront à renvoyer.
- Corriger `cref`, puis `layout.scenes('compte', names=[…])` pour les quatre cadres Paramètres et Thème · Sombre : 8 appels.
- Les 4 autres cadres sombres du compte, sans effet visible, ne valent un renvoi que pour la cohérence des variables : 8 appels.
- Signaler à la zone Projets les deux cadres sombres « Commentaires · suggestions de mention ».

### 2. Barre « Monde » sous le fondu de l'en-tête (visible ; corrigé dans le code, envoi en cours)

**Constat**, confirmé sur les planches : la pilule manque dans les cadres convertis le 17 au soir.
- **Nette sur le site** : visiteur, Paramètres, Thème et membre, Ordinateur · Sombre (`account-visitor/zoom/monde-ordinateur-sombre.png`).
- **Floutée sous le voile** : Connexion et Création de compte, 4 cadres chacune. Elle n'est perceptible qu'avec un contraste étiré (`signup-dialog/zoom/barre-perimetre-absente-*.png`) : gravité mineure, alors qu'un vérificateur l'avait jugée « visible ».
- **Sans effet** : dans les 14 cadres mobiles du visiteur, des Paramètres, du Thème, de la Langue, du membre, de la Messagerie et des Notifications, le panneau la couvre aussi sur le site.

**Cause** (cause 1 de la synthèse communs v3) :
- `#app::after` (z 6) est peint après « Principal » ;
- `zsort` ne trie que des frères, et la barre (z 8) reste un enfant de « Principal ».

**Correctif fait** : `stacking_context` et `hoist_z`, dans le `dom2fig.py` de 05 h 31. Contrôle des 19 scènes du compte de 05 h 33 :
- « Application » contient, dans l'ordre : Fond, Contenu, Après · Application (188 ou 166 px), Barre de périmètre (y 84), En-tête, Menu du bas ;
- plus aucun calque « Principal » ;
- l'appel 880 clone les 7 cadres restants.

**Reste à faire** :
- laisser finir la chaîne 3, puis capturer (`compte-*-v3.png`) et revérifier ;
- ne renvoyer aucun cadre du compte avec un `dom2fig.py` antérieur à 05 h 31.

### 3. Cadres « Ordinateur » du 16 octobre jamais régénérés (mineur)

**Constat** : entre 0 et 136 px, la bande d'en-tête est teintée par l'atmosphère.
- En clair, +1 à +3 niveaux : (250, 252, 252) au lieu de (247, 250, 250).
- En sombre, le halo turquoise monte jusqu'en haut à droite : (27 ; 30,6 ; 30,7) au lieu de (27, 27, 27).

**Cadres** :
- Ordinateur · Clair : visiteur `164:232`, Paramètres `172:22114`, Thème `179:28538`, Langue `189:3553`, membre `213:10060`, Messagerie `223:8333`, Notifications `232:9547` ;
- clones Ordinateur · Sombre : Langue `239:16598`, Messagerie `239:24410`, Notifications `239:26377`.

**Cause** : leurs scènes datent du 16 octobre à 22 h 32 (appels 345 à 363).
- Le fondu y mesure 1 793,7 ou 1 795,7 px et passe sous « Fond ». « Fond » s'arrête à 960 px.
- Les régénérations du 17 et du 18 suivaient la liste des défauts signalés. Ces cadres n'en faisaient pas partie.
- Ils ne sont pas dans la chaîne du 18 : l'appel 880 ne clone que les cadres mobiles et les fenêtres. Ils gardent donc la pilule, mais aussi la bande.

**Correctif** :
- régénérer les 7 scènes avec le code actuel : `layout.scenes('compte', names=[les 7 noms])` ;
- recloner : `layout.dark('compte', names=['Langue — Ordinateur · Sombre', 'Messagerie — Ordinateur · Sombre', 'Notifications — Ordinateur · Sombre'])`, soit environ 15 appels en tout ;
- vérifié à blanc (`v2/_synthese/desk_check.json`) : les 7 donnent Fond, Contenu, un fondu de 188 px, la barre à y 84 au-dessus du fondu, En-tête et Menu du bas. Avec un `dom2fig.py` antérieur à 05 h 31, ils auraient perdu la barre ;
- l'envoyer avec le renvoi de la cause 1 ;
- pour éviter la récidive : choisir les cadres à renvoyer en comparant la conversion actuelle (en mémoire, toutes les mises en page) à la scène envoyée, plutôt qu'en suivant la liste des défauts.

### 4. Fenêtres sombres clonées avec la géométrie claire (mineur)

**Constat** : Connexion et Création de compte, Ordinateur et Mobile · Sombre.
- Les boutons mesurent 53 px au lieu de 51.
- La fenêtre est plus haute de 4 px : 303,19 au lieu de 299,19 ; pour la création sur mobile, 342,78 au lieu de 338,78.
- Le contenu est 2 px trop haut.

**Cause** : ce sont des clones du cadre clair (`layout.dark`). Or, en sombre, `.dialog-option` perd sa bordure de 1 px au profit d'un anneau intérieur (`inset 0 0 0 1px`, blanc à 12 %), d'après les relevés `dom/shell/sign{in,up}-dialog--*--fr-dark`.

**Correctif** : dans `layout.py`, ajouter `('shell', 'signin-dialog')` et `('shell', 'signup-dialog')` à `DARK_RENDER`.
- **À faire après la cause 1.** Sans elle, la bordure claire du bouton principal serait peinte en #00BABC brut dans le cadre sombre.
- Vérifié à blanc (`v2/_synthese/dialog_check.txt`) :
  - fenêtre en y 330,41 (272,41 et 252,61 sur mobile), de 299,19 px de haut (338,78 pour la création sur mobile) ;
  - boutons de 51 px, bordure claire transparente en Sombre ;
  - anneau lié à `dérivées/ombre/00000000-FFFFFF1F` ; aucune couleur brute.
- Coût : 4 cadres, environ 8 appels. Le clonage ne les reprend plus.
- À défaut, accepter l'écart comme limite des clones.

## Écartés

**Verre des panneaux sur mobile** (4 signalements : visiteur, Paramètres, Thème et Langue ; membre ; Messagerie ; Notifications ; en clair et en sombre).
- **Sur le site** : sur les captures mobiles, le contenu sous le panneau reste net. Il est seulement voilé à environ 18 % par le fond blanc à 82 % : Chrome n'y applique visiblement pas `backdrop-filter: blur(26px) saturate(1.15)`.
- **Styles relevés** : ce sont les mêmes que sur ordinateur, où Chrome floute.
  - Le panneau est absolu (z 50) dans l'en-tête collant (z 10).
  - Aucun filtre, opacité, transformation ni découpe n'est relevé sur ses ancêtres.
  - Son contenu ne déborde pas.
- **Cause probable** : le rendu de Chrome en émulation mobile (`mobile: true`, DPR 2, `capture_lib`), pas la conversion. La maquette applique le flou du CSS.
- **Proposition** : en faire une limite connue, à confirmer par l'utilisateur. Savoir si un vrai téléphone rend le panneau de la même façon relève du prototype, hors de ce périmètre.

## Défauts de la passe précédente

| Point | État |
|---|---|
| « Thème … Clair » dans les panneaux visiteur et membre sombres | Corrigé (« Sombre ») |
| Coche et graisse sur « Clair » (Paramètres et Thème sombres) | Corrigé, mais le fond de sélection est inversé : cause 1 |
| Fenêtres descendues en bas du cadre | Corrigé : y 328 sur ordinateur ; 270 (connexion) et 250 (création) sur mobile |
| Campus et résumés coupés, police de « $ ./minishell » | Corrigés |
| Bande d'en-tête et voile `#app::after` | Corrigé dans les cadres régénérés ; il reste la cause 3 |
| Géométrie claire des fenêtres sombres | Non corrigé : cause 4 |
| Verre des panneaux mobiles | Écarté |
| Champs sans texte ni indication | Sans objet : la zone n'a aucun champ |

## Fichiers

Dans `v2/_synthese/` :
- `cref_check.py` et `cref_check.json` : correctif de `cref`, à blanc, sur les 10 cadres de `DARK_RENDER` ;
- `desk_check.py` et `desk_check.json` : les 7 cadres « Ordinateur · Clair » convertis avec le code actuel ;
- `dialog_check.py` et `dialog_check.txt` : les fenêtres construites depuis la capture sombre.

Lancer chaque script avec `PYTHONDONTWRITEBYTECODE=1` et le dossier `scripts/` en argument.
