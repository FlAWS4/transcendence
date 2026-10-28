# Vérification Figma des Chroniques — synthèse v5 (18 octobre 2026)

**Périmètre.** 32 cadres, soit 16 clairs et leurs 16 clones sombres, en 5 sections : liste (8), chronique (8), médias (4), auteurs (4), commentaires (8).
- Captures Figma : v3 du 17 octobre à 19 h 08 (liste, médias, auteurs, commentaires) et v4 à 19 h 54 (chronique).
- Références du site : reprises après la correction du 17 au soir, sauf pour la liste (16 octobre, 22 h 34).
- Deux vérificateurs ont relevé 21 défauts.

**Recoupement**, sans outil Figma ni Chrome :
- planches et agrandissements des défauts bloquants et visibles rouverts ;
- zone de la barre de périmètre découpée dans les 32 planches : [`v5/_synthese/barre_*.png`](v5/_synthese/) ;
- code relu :
  - `dom2fig.py` : `zsort`, `build_one`, `pseudo_frame`, `flex_layout`, `symbol_ref`, `with_symbols` ;
  - `render.js` (auto-layout), `symbols_call.py`, `font_outlines.py`, `layout.py`, `capture_lib.py` ;
- ordre d'empilement du site lu dans les relevés `dom/journal/` ;
- ☺ mesuré dans les captures 2× : [`v5/_synthese/sourire_police.png`](v5/_synthese/sourire_police.png) et `.json` ;
- conversions à blanc, en mémoire (`python3 -B`), avec des copies figées de `dom2fig.py` (5 h 27 et 5 h 31 UTC) :
  - elles portent sur les 201 cadres de toutes les mises en page ;
  - elles sont comparées aux scènes du 17 octobre : [`v5/_synthese/resultat_hoist.json`](v5/_synthese/resultat_hoist.json), écrit à 5 h 32 ;
- lecture des appels 799 et 850 à 860, générés à 5 h 33.

## Bilan

- **21 défauts sur 21 confirmés.** Ils représentent 62 occurrences dans les cadres et se regroupent en 4 causes : 1 bloquante, 2 visibles, 1 mineure. Aucun défaut signalé n'est écarté.
- **La limite connue 9 est fausse pour ☺.** Chrome dessine ce symbole en Liberation Sans, pas en DejaVu Sans. Elle reste juste pour ↗.
- **Le code a changé pendant la synthèse.** Entre 5 h 27 et 5 h 33 UTC, une autre session :
  - a corrigé `dom2fig.py` pour les 4 causes ;
  - a régénéré les scènes ;
  - a écrit les appels 799 à 888.

  À 5 h 35, aucun de ces appels n'avait de résultat dans `call-results/`. Les correctifs sont donc constatés dans le code et dans les appels, pas encore dans Figma.

| # | Cause | Cadres | Gravité | État à 5 h 35 UTC |
|---|---|---|---|---|
| P | Le fondu de l'en-tête (`#app::after`, z 6) est peint au-dessus de « Principal », qui contient la barre de périmètre (z 8) | 22 | bloquant | corrigé (`hoist_z`) ; appels 850 à 860 prêts |
| C | La liste arabe sur ordinateur n'a pas été renvoyée depuis le correctif RTL | 2 | visible | appel 851 et clone 860 prêts |
| S | ☺ est dessiné en DejaVu Sans au lieu de Liberation Sans | 8 | visible | corrigé (`SYMBOL_FONTS`) ; 291:12 redessiné par l'appel 799 |
| N | Le fond d'atmosphère s'arrête à la hauteur de l'écran | 30 | mineur | corrigé ; 22 cadres dans les appels, 8 restent |

**Défauts de la synthèse v2.**
- **Corrigés** : A, B, D, E, F, G, I, L et M.
- **Résolu par la correction du site** : J.
- **K** : résolu dans les chroniques arabes. Sur la liste arabe, il n'est pas vérifiable, car les références sont périmées (§ 4).
- **H** : corrigé seulement en partie. Le symbole est monochrome, mais sa police est fausse (cause S).
- **Non corrigés dans les cadres v5** :
  - C : le cadre n'a pas été renvoyé ;
  - N : le correctif n'avait pas encore été appliqué.

## Correctifs, par priorité

### 1. P — Barre de périmètre sous le fondu de l'en-tête (bloquant, 22 cadres)

**Constat.** La pilule « Monde » / « العالم » manque dans tous les cadres convertis depuis le 17 octobre à 18 h 29 :
- appels 731 à 740 et 794 à 796 ;
- liste mobile ×4, chronique sur ordinateur ×4, chronique mobile en arabe ×2, médias et auteurs sur ordinateur ×4, commentaires ×8.

Elle reste présente dans les 10 cadres du 16 octobre.

**Cause.**
- **Sur le site**, l'empilement se fait dans un seul contexte :
  - `#app` est en `relative`, sans z-index ;
  - `main` est statique, donc il ne crée pas de contexte ;
  - ordre de peinture : atmosphère (−1) < `#content-sheet` (5) < fondu `#app::after` (6) < `#globe` (7) < `#scope-bar` (8) < en-tête (10) < menu du bas (20) ;
  - le fondu est opaque sur ses 84 à 136 premiers px, selon l'écran, là où se trouve la barre.
- **Dans `dom2fig.py`**, depuis le correctif du 17 au soir, `::after` reçoit `_z = 6` et passe après les enfants :
  - `zsort` range alors les enfants d'« Application » ainsi : Fond < Principal (0) < fondu < En-tête ;
  - un cadre Figma forme toujours son propre contexte. La barre (8) et le menu du bas (20) restent donc enfermés dans « Principal », sous le fondu.
- Le problème touche **89 scènes au total** : Chroniques 11, Projets 35, Profils 18, Compte et Éléments communs 24, Explorer 1.

**Correctif** (`dom2fig.py`, présent depuis 5 h 27) :
- `stacking_context(n, par)` indique si l'élément crée un contexte d'empilement ;
- sinon, `build_one()` marque le cadre `_nsc` ;
- `hoist_z(ch)`, appelée avant `zsort(ch)`, s'applique quand un descendant à z-index d'un cadre `_nsc` doit passer au-dessus ou au-dessous d'un frère à z-index :
  - tous ces descendants remontent au niveau du cadre, décalés de sa position ;
  - un cadre qui rogne ne libère que ses descendants fixes ;
  - un cadre resté vide et sans peinture est supprimé.

**Contrôle à blanc.**
- Dans les 16 scènes des Chroniques, l'ordre devient Fond < Contenu < fondu < Barre de périmètre < En-tête < Menu du bas, comme sur le site.
- Sur les 201 cadres convertis :
  - aucune erreur ;
  - les barres sous un fondu passent de 89 à 0 ;
  - les seules autres différences sont un nœud de moins (« Principal ») ou un texte de plus (relevés repris avec `<bdi>`) ;
  - aucun auto-layout ne change.

**À faire.**
1. Envoyer les appels 850 à 860 : 12 cadres clairs et leurs 12 clones.
2. Envoyer les appels des autres zones (800 à 849, 861 à 888).
3. Lancer `record_frames.py`, puis prendre les captures v6.

**Remarques.**
- « Principal » disparaît de l'arbre des calques, puisqu'il est vide et sans peinture. Aucun script n'en dépend.
- `stacking_context()` ignore `blend` (mix-blend-mode) et `clip` (clip-path), pourtant relevés. Il faudrait les ajouter. `isolation`, `mask` et `contain` ne sont pas relevés par `capture_lib.styleOf`. Rien de tout cela ne change les Chroniques.
- Comme avant, un descendant à z-index n'est pas remonté au-dessus de frères statiques (z 0) qui le suivent. Les Chroniques n'ont aucun cas de ce genre.

### 2. C — Rangées d'auteurs RTL de la liste arabe sur ordinateur (visible, 2 cadres)

**Constat.** Les rangées à plusieurs auteurs sont tassées à gauche : de 132,6 px pour London et de 60 px pour Tokyo. Les rangées à un seul auteur sont justes.

**Cause.**
- Le cadre `179:14357` vient de l'appel 374, avec la scène du 16 octobre à 22 h 48, qui porte `al.pa = MIN` avec `rtl: 1`.
- Le correctif de `flex_layout()` (MIN et MAX inversés dans une rangée RTL) n'a jamais été envoyé pour ce cadre.
- Son clone `214:8080` vient de l'appel 430.

**Correctif** : sans changement de code.
- L'appel 851, en deux parties, donne `pa: MAX` aux 5 rangées et garde la barre au-dessus du fondu.
- Le clone est refait dans l'appel 860.
- `render.js` trie les enfants par x, et MAX les cale à droite.

### 3. S — ☺ en Liberation Sans (visible, 8 cadres ; et 12 scènes de Projets)

**Constat.** Dans Figma, le glyphe mesure 12,5 px et il est gras. Sur le site, il est fin et mesure 8,5 px.

**Mesures.**
- Dans les 12 relevés français et anglais, la ligne « ☺ Emoji » mesure 51,91 px. C'est exactement « Emoji » en Jost (37,61 px) plus ☺ en Liberation Sans (14,29 px). Avec DejaVu Sans, on obtiendrait 52,21 px.
- Dans les captures 2×, l'encre du symbole mesure 8,5 × 8,5 px, comme celle de Liberation Sans. Celle de DejaVu Sans mesure 12,5 px (planche `sourire_police.png`).
- La pile `Jost, sans-serif` mène à Arial, que fontconfig remplace par Liberation Sans. Cette police contient U+263A, mais pas U+2197.
- « ↗ » seul mesure 11,73 px, la largeur de DejaVu Sans : la limite 9 reste donc valable pour ↗.

**Cause.** `symbol_ref()` prenait tous les symboles dans DejaVu Sans.

**Correctif** (`dom2fig.py`, présent depuis 5 h 31) :
- `SYMBOL_FONTS` associe ☺ à Liberation Sans Regular et ↗ à DejaVu Sans ;
- la référence devient `glyph:liberation-sans-263a`, avec les métriques de cette police (avance 2091, ascendante 1854, descendante 434).
- L'appel 799 redessine `291:12` sur place (même identifiant) et renomme la section.
- Tous les cadres qui contiennent ☺ font partie des appels :
  - Chroniques : 856 à 859 ;
  - Projets : 815 à 825.

  Aucune ancienne instance ne restera donc déformée par le changement de boîte, de 2135 × 2384 à 2091 × 2288 unités.

**À faire.**
- Envoyer 799 en premier.
- Corriger la limite 9 dans le [README de la refonte](../../README.md) (§ 17 octobre, « symboles ☺ et ↗ »).

### 4. K — Références périmées de la liste arabe (outil de contrôle, 4 cadres)

Ce n'est pas un défaut de Figma.
- Les captures et les relevés `journal--{desktop,mobile}--ar-{light,dark}` datent du 16 octobre (22 h 34 et 22 h 35). Ils sont antérieurs à la règle `.cp-art > svg { direction: ltr }` (`content-preview.css`, l. 229).
- Ils montrent donc « “ » hors de la feuille et « & » sur le bord de la carte. Figma les dessine à leur place, comme le site actuel.

**À faire.** Reprendre ces 4 états (`capture_journal.py`) avant la v6. Les appels 851 et 852 n'en dépendent pas, car l'illustration est le composant partagé `171:31`.

### 5. N — Reliquat du fond d'atmosphère (mineur, 8 cadres)

**Correctif** (`build_one()`, présent depuis 5 h 27) :
- dans un cadre plus haut que l'écran, un calque fixe sans enfant qui couvre l'écran prend `h = H` ;
- les dégradés sont en % et s'étirent donc avec lui ;
- la géométrie propre au sombre est déjà portée par des couches transparentes en clair.

**Contrôle.** Le Fond prend `h = H` dans les 15 cadres plus hauts que l'écran.

**Ce qui reste.** Les appels en refont 11, soit 22 cadres avec les clones. Restent les 4 cadres du 16 octobre et leurs clones, dont la pilule est intacte :
- Liste Ordinateur FR (`172:17073` / `214:6251`) ;
- Chronique Mobile FR (`211:9000` / `214:10075`) ;
- Médias Mobile (`212:6287` / `214:10687`) ;
- Auteurs Mobile (`212:6421` / `214:11056`).

**À faire.** Les rendre de nouveau quand le quota le permet : `layout.scenes('journal', names=[…])`, puis le clonage sombre.

### 6. Hors zone : crédits de la carte d'Explorer (latent)

- Avec `zsort` (17 octobre), les crédits de la carte (z 5) passent sous le globe (z 7). La conversion actuelle de `explore*` donne : Fond, crédits, fondu, Globe…
- Or `order()` les plaçait juste au-dessus du globe vectoriel, qui est opaque (correctif du 16 octobre).
- Aucun effet aujourd'hui : les cadres d'Explorer datent du 16 octobre, et l'appel 887 ne refait que la fenêtre du campus.

**Correctif, avant tout nouveau rendu de ces états.** Dans `build()`, donner aux `.map-credit` `_z = z_index(#globe) + 0,5`, la même règle que `order().zz`.

## Non retenu

- Médaillon du globe dans les 10 cadres du 16 octobre (limite 4).
- Glyphes de la liste arabe (§ 4).
- Dates des commentaires, anticrénelage, décalages de 1 px au plus, poignée du champ (limites 4 et 5).

## Limites

- Aucun outil Figma ni Chrome n'a été utilisé. L'état décrit est celui de `dom2fig.py` à 5 h 31, et des scènes et des appels à 5 h 33. L'autre session peut encore les modifier.
- Écritures :
  - ce fichier ;
  - `v5/_synthese/` : `sourire_police.*`, `barre_planches.py`, `barre_*.png`, `controle_hoist.py` et `resultat_hoist.json`.
- Consigne de lecture seule : `PROJECT_CONTEXT.md`, le journal, le README et le relevé ne sont pas mis à jour. Le plan du site n'est pas concerné.
