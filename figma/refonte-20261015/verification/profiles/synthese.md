# Vérification Figma de Profils — synthèse (18 octobre 2026)

**Périmètre.** Page « 04 · Profils », 8 sections, 66 cadres : 33 construits en clair, 33 clones sombres. Les captures Figma de section (v3) datent du 17 octobre, 19 h 40 UTC, après la chaîne 741 à 756. Trois comparateurs ont relevé 33 défauts :
- « people » : 20 cadres ;
- « filter-people » et « profile » : 22 cadres ;
- « profile-projects », « profile-journey », « profile-contribution », « message-dialog » et « report » : 24 cadres.

C'est la première passe sur Profils.

**Recoupement**, sans outil Figma ni Chrome :
- planches et agrandissements rouverts pour tous les défauts bloquants et visibles, puis pour le soulignement et le compteur ;
- code relu :
  - `dom2fig.py` : `z_index`, `zsort`, `stacking_context`, `hoist_z`, `build_one`, `rlm`, `text_nodes` ;
  - `render.js` (textes), `layout.py`, `make_call.py`, `capture_lib.py`, `sim_figma.mjs` ;
- CSS et JS du prototype relus : `sticky-header.css`, `welcome.css`, `profiles.css`, `project-filter-dialog.css`, `profile-ui.mjs` ;
- relevés `dom/profiles/` interrogés ;
- conversions à blanc en mémoire, sans écrire de scène.

Mesures : [`synthese-controles.json`](synthese-controles.json).

**Le code a changé pendant la relecture.** Une autre session a modifié `dom2fig.py` à 05 h 27, puis à 05 h 31 UTC :
- ajouts : `stacking_context()`, `hoist_z()` et la hauteur du fond ;
- polices de secours des symboles, qui ne servent pas dans Profils.

Elle a ensuite régénéré 92 scènes (05 h 33) et écrit les appels 800 à 888. L'envoi a commencé : 887 est parti à 05 h 37. Pour Profils, les appels 832 à 849 n'étaient pas encore partis à 05 h 38.

## Bilan

- **32 défauts confirmés**, regroupés en 6 causes. **1 défaut écarté** : le flou du sélecteur de rubriques (voir « Écarté »).
- **Aucun défaut bloquant ou visible écarté.**
- **Les deux causes bloquantes sont corrigées dans le code et prêtes à l'envoi** : appels 832 à 849, soit 20 cadres clairs et leurs 20 clones.
- **L'avertissement des comparateurs est levé** : régénérer ne masque plus la barre. Avec le code de 05 h 31, les 33 conversions à blanc sont conformes :
  - barre au-dessus du fondu ;
  - contenu sous le fondu ;
  - menu « Trier » au-dessus des cartes ;
  - fond à la hauteur du cadre.

| # | Cause | Cadres (clairs + sombres) | Gravité | État à 05 h 38 |
|---|---|---|---|---|
| A | Fondu de l'en-tête (`#app::after`, z 6) peint par-dessus « Principal », qui contient la barre « Monde » (z 8) | 17 + 17 | bloquant (11 + 11) ; mineur sous un voile (6 + 6) | corrigé (`hoist_z`), appels 832 à 849 prêts |
| B | Menu « Trier » sous les cartes : cadres du 16 octobre jamais régénérés après le correctif `_z`/`zsort` | 2 + 2 | bloquant | appels 833, 834 et 849 prêts |
| C | Campus arabes « 42 Rio » dans Figma, « Rio 42 » sur le site | 2 + 2 | mineur | à soumettre à l'utilisateur |
| F | Fond « atmosphère » limité à la hauteur de l'écran (cause K) | 33 + 33 aujourd'hui ; 13 + 13 après l'envoi | mineur | corrigé dans le code ; 13 cadres restent à régénérer |
| D | Soulignement de « Réinitialiser » dans la couleur du texte et collé aux lettres | 6 + 6 | mineur | ouvert (relevé) |
| E | Espace fine insécable de « 0 / 1 000 » devenue une espace normale | 2 + 2 | mineur | ouvert (relevé) |

## Correctifs par priorité

### 1. A — Barre « Monde » masquée par le fondu de l'en-tête (bloquant)

**Constat.** La pastille de périmètre manque dans les 17 cadres clairs reconstruits le 17 octobre (appels 741 à 755), et dans leurs clones (756) :
- **à l'écran** :
  - Liste des profils — Mobile · العربية ;
  - Fiche profil : Ordinateur, Ordinateur · العربية, Mobile · العربية, statut Alumni, statut Transcender, sélecteur de rubriques ouvert ;
  - Projets — Ordinateur ;
  - Parcours — Ordinateur et Mobile ;
  - Contribution — Ordinateur ;
- **sous le voile d'une fenêtre** :
  - Filtrer les profils · déployée — Ordinateur ;
  - Projets · filtre local ouvert — Ordinateur ;
  - Envoyer un message et Signaler, Ordinateur et Mobile.

Dans « Filtrer · déployée — Mobile », la fenêtre la cache des deux côtés.

**Cause.** `zsort()` ne trie que des frères.
- `#app::after` est fixe, avec un z-index de 6 ; il mesure 124 px en lecture, 158 px sur mobile, 166 ou 188 px dans les listes. Depuis le correctif du 17 au soir, il est trié après « Principal ».
- « Principal » (`main`) est statique et sans z-index (`_z` 0). Il renferme la barre (fixe, z 8), le menu du bas (z 20) et le contenu (z 5).
- Sur le site, `main` ne crée pas de contexte d'empilement : la barre passe au-dessus du fondu. C'est l'intention écrite dans `sticky-header.css` : « above content (5), below map/filter (7/8) and header (10) ».
- C'est une régression : les scènes du 16 peignaient le fondu en premier.

**Correctif présent** (`dom2fig.py`, 05 h 27) :
- `stacking_context(n, par)` marque `_nsc` les cadres qui ne créent pas de contexte d'empilement ;
- `hoist_z()`, appelé avant `zsort()` dans `build_one()` et à la racine, remonte leurs descendants à z-index quand l'un d'eux doit croiser un frère à z-index ;
- un cadre qui rogne ne cède que ses calques fixes ; un cadre vidé et sans peinture est retiré.

**Contrôlé** :
- conversion à blanc des 33 cadres clairs, versions `b1141c07640e` (05 h 27) et `3faeee6a162c` (05 h 31). Ordre obtenu : Fond (−1), Contenu (5), fondu (6), barre (8), en-tête (10), menu du bas (20). Voiles et fenêtres restent au-dessus ;
- scènes écrites à 05 h 33 : 20 sur 20 conformes ;
- `sim_figma.mjs` sur les appels 832 à 848 : OK, sans icône, ressource ni police manquante. Les variables « manquantes » sont un artefact du simulateur : l'appel 744, déjà envoyé, en compte aussi 59 ;
- aucun calque à z-index enfermé sous un frère qui le recouvre, dans 7 des 8 mises en page (toutes sauf l'arrivée).

**Action.** Envoyer les appels 832 à 849, prendre les captures de section v4, puis comparer.

**Vigilance**, sans cas aujourd'hui :
- le critère de croisement ne regarde que les frères qui ont un z-index. Un z positif enfermé dans un cadre et recouvert par un frère suivant sans z-index resterait dessous. Si un tel cas apparaît, il faudra aussi remonter le calque quand un frère suivant recouvre sa boîte ;
- `stacking_context()` ignore `blend` et `clip`, pourtant relevés, ainsi que `isolation`, qui n'est pas relevé. Sans effet ici :
  - seul `#app`, la racine, a `isolation: isolate` ;
  - aucun élément n'a de `mix-blend-mode` ;
  - les `clip-path` ne touchent que des textes masqués et le globe, qui est fixe.

### 2. B — Menu « Trier » peint sous les cartes (bloquant)

**Constat.** Dans « Liste des profils · tri ouvert », sur ordinateur et sur mobile (appels 289 et 290, clones 432), les cartes recouvrent le menu.

**Cause.** Les scènes datent du 16 octobre (22 h 16), avant le correctif `_z`/`zsort` du 17. Les chaînes de correction du 17 ne reprenaient pas cet état.

**Correctif.** Aucun changement de code n'est nécessaire. Dans la scène régénérée à 05 h 33, `#content-sort-menu` est au rang 373, après la 24e carte (rang 343). Le contenu forme un contexte d'empilement de z 5, dans lequel le menu est trié. La barre est au-dessus du fondu.

**Action.** Envoyer les appels 833 et 834, puis le clonage 849.

### 3. C — Campus arabes « 42 Rio » au lieu de « Rio 42 » (mineur, à soumettre)

**Constat.** Dans les 23 cartes arabes, sur ordinateur et sur mobile, le site affiche « Rio 42 ». Le relevé le montre : trois fragments bidi, « Rio » à gauche et « 42 » à droite. Figma écrit « 42 Rio ».

**Cause côté Figma.** Le texte ne contient pas d'arabe, donc `rlm()` ne s'applique pas, et Figma prend la direction de la première lettre forte.

**Cause côté site.** `profile-ui.mjs`, ligne 90, n'isole pas le campus de la carte, alors que les lignes 150 et 185 l'isolent avec `<bdi dir="auto">`. La ligne 200 n'isole pas non plus le campus du bouton « استكشف … », qui s'affiche « استكشف Paris 42 » ; Figma le reproduit fidèlement.

C'est la même famille que les deux libellés corrigés le 17 octobre. La décision de l'utilisateur ne portait cependant que sur ceux-là : la question est à lui soumettre.
- **S'il isole le campus** : les cartes de Figma sont déjà justes. Il faudra reprendre les relevés arabes de Profils (`people` et `profile`), puis régénérer les 4 cadres arabes principaux et leurs clones, en même temps que le point 4.
- **S'il garde ce rendu** : modifier `dom2fig.text_nodes.emit()`. Dans un élément `rtl`, un texte sans arabe reçoit la marque RLM quand ses fragments mesurés sont dans l'ordre inverse. Il faut lire `run['l']` avant `merge_line_rects`. À défaut, le critère peut être un texte qui commence par un chiffre ou un signe neutre. Ces campus ne sont liés à aucune variable de texte : l'effet reste local.

### 4. F — Fond limité à la hauteur de l'écran (mineur)

**Cause.** C'est la cause K de Projets v4 : un calque fixe sans enfant garde la hauteur de l'écran dans un cadre en pleine hauteur.

**Correctif présent** (`build_one`, 05 h 27). Un calque fixe sans enfant qui couvre l'écran prend `h = H` dans un cadre pleine hauteur. Le fond mesure H dans les 33 conversions.

**Restent 13 cadres clairs**, et leurs clones, non repris par les appels 832 à 849 :
- Liste des profils : Ordinateur, Mobile, Ordinateur · العربية ;
- vue Liste et dernière page, chacune sur Ordinateur et Mobile ;
- Filtrer les profils : Ordinateur et Mobile ;
- Fiche profil — Mobile ;
- Projets, Projets · filtre local ouvert et Contribution, tous trois sur Mobile.

Ils sont conformes par ailleurs. Ils gardent aussi l'ancien fondu, mesuré sur toute la page et peint en premier, sans effet visible.

**Action.** Les régénérer quand le quota le permet : environ 18 envois, car les listes partent en deux morceaux, plus un clonage. À grouper avec C si le site change.

### 5. D — Soulignement de « Réinitialiser » (mineur)

**Cadres.** Filtrer les profils, normale et déployée, et Projets · filtre local ouvert, sur ordinateur et sur mobile.

**Cause.**
- Le site déclare `text-decoration-color: var(--cp-line)` et `text-underline-offset: 4px` (`project-filter-dialog.css`, ligne 58).
- `capture_lib.styleOf` ne relève que `textDecorationLine`.
- `dom2fig` pose `td = UNDERLINE`, et `render.js` (lignes 192 et 198) seulement `textDecoration`.

C'est le seul texte souligné de Profils.

**Correctif.**
- `capture_lib.py`, `styleOf` : relever trois valeurs :
  - `decoColor` (`textDecorationColor`), quand elle diffère de `color` ;
  - `uOffset` (`textUnderlineOffset`), quand elle n'est pas `auto` ;
  - `decoW` (`textDecorationThickness`), quand elle n'est pas `auto`.
- `dom2fig.text_nodes.emit` : si le soulignement n'a pas la couleur du texte, ne pas poser `td`. Ajouter à la place un calque « Soulignement » :
  - un rectangle de l'épaisseur relevée (1 px par défaut), de la largeur de la ligne mesurée ;
  - placé à la ligne de base plus le décalage ;
  - rempli par `cref('bordure', clair, sombre)`, donc lié à la variable des filets et juste dans les clones sombres.

  Dans les autres cas, garder `td`.
- Variante : les propriétés `textDecorationColor`, `textDecorationOffset` et `textDecorationThickness` de l'API. Elles sont absentes de la consigne locale `figma-use` et restent à vérifier. La liaison d'une variable n'y est pas garantie, d'où la préférence pour le rectangle.
- Reprendre les relevés de `filter-people`, `filter-people-expanded` et `profile-projects-filter`, puis régénérer 6 cadres clairs et leurs clones. Les fenêtres de filtre de Projets ont le même lien « Réinitialiser ».

### 6. E — Espace fine du compteur « 0 / 1 000 » (mineur)

**Cadres.** Signaler · depuis un profil, sur ordinateur et sur mobile.

**Cause.**
- `Intl.NumberFormat('fr')` (`content-report.mjs`, ligne 74) écrit U+202F.
- `capture_lib.py`, lignes 78 et 123, réduit les blancs par `.replace(/\s+/g, ' ')`. En JavaScript, `\s` couvre U+00A0 et U+202F.

**Correctif.**
- Dans `directText` et dans les runs, écrire `.replace(/[ \t\n\r\f]+/g, ' ')`.
- Jost n'a ni U+202F ni U+2009. Chrome passe à sa police de secours : 0,20 em chez Liberation Sans et chez DejaVu Sans. Figma prend la sienne, comme le montre `bindText` (18 octobre).
- Contrôler le rendu sur un cadre ; s'il n'est pas meilleur, ne rien changer. L'écart est de 2 px.
- À faire dans la même reprise de relevés que D (`report-profile`).

## Écarté

**Panneau « Rubriques du profil » ouvert** (sélecteur mobile, clair et sombre) :
- Figma pose le flou que demande le CSS (`backdrop-filter: blur(26px)`, `profiles.css`, ligne 325).
- Dans la capture, c'est Chrome qui ne l'applique pas : le paragraphe reste net à travers le panneau.
- Ce n'est pas un défaut de la maquette. C'est la même famille que la limite 4 (flou sous un autre flou). On peut le signaler à l'utilisateur comme une observation sur le site.

**Non comptés, à juste titre**, par les comparateurs :
- médaillon du globe dans la pastille ;
- menu du bas et recherche en bas des cadres ;
- bande des états défilés (sélecteur, 8 px) ;
- flèche native et poignée des champs ;
- anticrénelage ;
- pointillés du bord des cadres sombres dans l'export.

## Défauts corrigés ailleurs, revérifiés dans Profils

- **Colonne fixe des fiches** : à y = 236 dans les 10 fiches Ordinateur et derrière les fenêtres. Conforme.
- **Titres et résumés coupés** : coupures identiques au site en français et en arabe. Conforme.
- **Rangées arabes** : en miroir et alignées comme sur le site. Conforme, hors C.
- **Portraits arrondis** : anneau de 3 px, portraits ronds ou arrondis. Conforme.
- **Menu du bas** : en bas des cadres pleine hauteur. Conforme.
- **Menus « Trier » sous les cartes** : présent, voir B, car ces cadres n'avaient pas été régénérés.

## Limites

- Aucun outil Figma ni Chrome : les corrections sont constatées dans les scènes et dans le simulateur, pas encore dans Figma.
- Le code a changé pendant la relecture, dans une autre session. L'état décrit est celui de `dom2fig.py` `3faeee6a162c` (05 h 31), des scènes de 05 h 33 et des appels 832 à 849, non envoyés à 05 h 38.
- La capture de section « people » est à l'échelle 0,156 : les petits textes y sont illisibles. L'ordre des campus (C) vient donc du relevé (fragments bidi) et d'une corrélation à l'export.
- Écritures : ce fichier et `synthese-controles.json`.
- Consigne de lecture seule : `PROJECT_CONTEXT.md`, le journal et le README de la refonte ne sont pas mis à jour. Le plan du site n'est pas concerné.
