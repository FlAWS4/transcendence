# Relevés de la refonte Figma — état des captures par variante

Généré par `scripts/status.py` le 2026-10-17 à 04:19 à partir des index `reference/<zone>/index.json` (passe `variants-20261015`, `scripts/variants.py`). Chaque capture comprend la capture d’écran de la fenêtre (`reference/<zone>/<nom>.png`), le relevé DOM (`dom/<zone>/<nom>.json.gz`, clés stables par élément, lignes de texte, SVG complets) et, pour les listes, fiches et panneaux défilants, la capture pleine hauteur (`<nom>--full.png`).

Nom : `<état>--<desktop|mobile>--<fr|en|ar>-<light|dark>`. Ordinateur 1440 × 960, mobile 390 × 844 (DPR 2) sauf mention. Légende : ✓ capturé et vérifié par le script ; — non demandé ; ✗ échec (raison) ; … à faire.

## Explorer (`explorer`)

| État | ordi FR☀ | ordi FR☾ | ordi EN☀ | ordi AR☀ | ordi AR☾ | mobile FR☀ | mobile FR☾ | mobile EN☀ | mobile AR☀ | mobile AR☾ |
|---|---|---|---|---|---|---|---|---|---|---|
| `explore` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `explore-country` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `explore-campus` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `campus-sheet` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `campus-sheet-expanded` | — | — | — | — | — | ✓ | ✓ | ✓ | ✓ | — |
| `campus-sheet-mulhouse` | ✓ | ✓ | — | — | — | — | — | — | — | — |
| `scope-popover` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `scope-popover-list` | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — | — |
| `about-dialog` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `explore-noglobe` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `campus-window` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |

76 captures sur 76 demandées.

## Projets (`projects`)

| État | ordi FR☀ | ordi FR☾ | ordi EN☀ | ordi AR☀ | ordi AR☾ | mobile FR☀ | mobile FR☾ | mobile EN☀ | mobile AR☀ | mobile AR☾ |
|---|---|---|---|---|---|---|---|---|---|---|
| `projects` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `projects-list` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `projects-sort-open` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `filter-projects` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `filter-projects-expanded` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `projects-last-page` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `projects-empty` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `project` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `project-single` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `project-implementation` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `project-media` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `project-test` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `project-test-saved` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `project-comments` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `project-comments-thread` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `comment-menu` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `comments-sort-open` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `mention-picker` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `project-local-menu` | — | — | — | — | — | ✓ | ✓ | ✓ | ✓ | — |
| `campus-choice` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `report` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `viewer` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |

176 captures sur 176 demandées.

## Profils (`profiles`)

| État | ordi FR☀ | ordi FR☾ | ordi EN☀ | ordi AR☀ | ordi AR☾ | mobile FR☀ | mobile FR☾ | mobile EN☀ | mobile AR☀ | mobile AR☾ |
|---|---|---|---|---|---|---|---|---|---|---|
| `people` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `people-list` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `people-sort-open` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `filter-people` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `filter-people-expanded` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `people-last-page` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `profile` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `profile-projects` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `profile-projects-filter` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `profile-journey` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `profile-contribution` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `profile-local-menu` | — | — | — | — | — | ✓ | ✓ | ✓ | ✓ | — |
| `message-dialog` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `report-profile` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `profile-alumni` | ✓ | ✓ | — | — | — | — | — | — | — | — |
| `profile-transcender` | ✓ | ✓ | — | — | — | — | — | — | — | — |

116 captures sur 116 demandées.

## Éléments communs et compte (`shell`)

| État | ordi FR☀ | ordi FR☾ | ordi EN☀ | ordi AR☀ | ordi AR☾ | mobile FR☀ | mobile FR☾ | mobile EN☀ | mobile AR☀ | mobile AR☾ |
|---|---|---|---|---|---|---|---|---|---|---|
| `search-open` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `account-visitor` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `account-settings` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `account-theme` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `account-language` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `signin-dialog` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `signup-dialog` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `account-member` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `messages` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `notifications` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `awards` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `back-to-top` | — | — | — | — | — | ✓ | ✓ | ✓ | ✓ | — |
| `dock-320` | — | — | — | — | — | ✓ | — | — | — | — |
| `dock-300` | — | — | — | — | — | ✓ | — | — | — | — |

94 captures sur 94 demandées.

## Chroniques (`journal`)

| État | ordi FR☀ | ordi FR☾ | ordi EN☀ | ordi AR☀ | ordi AR☾ | mobile FR☀ | mobile FR☾ | mobile EN☀ | mobile AR☀ | mobile AR☾ |
|---|---|---|---|---|---|---|---|---|---|---|
| `journal` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `article` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `article-media` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `article-authors` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `article-comments` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| `article-comments-thread` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |

52 captures sur 52 demandées.

## Concordance des relevés entre variantes

Pour chaque état et format : nombre d’éléments relevés par variante, part des clés stables (`k`) présentes dans toutes les variantes, et faits d’interface comparés (bouton Remonter en haut, fenêtres, panneaux, menus ouverts). Une clé absente d’une variante signale un élément propre à cette langue ou à ce thème (ex. la ligne arabe « أفق » du logo).

| Zone | État | Format | Éléments par variante | Clés communes | Différences d’interface |
|---|---|---|---|---|---|
| explorer | `about-dialog` | desktop | FR☀ 138 · FR☾ 138 · EN☀ 138 · AR☀ 139 | 137/140 (97 %) | — |
| explorer | `about-dialog` | mobile | FR☀ 135 · FR☾ 135 · EN☀ 135 · AR☀ 136 | 135/136 (99 %) | — |
| explorer | `campus-sheet` | desktop | FR☀ 172 · FR☾ 172 · EN☀ 172 · AR☀ 174 | 172/174 (98 %) | — |
| explorer | `campus-sheet` | mobile | FR☀ 173 · FR☾ 173 · EN☀ 173 · AR☀ 175 | 173/175 (98 %) | — |
| explorer | `campus-sheet-expanded` | mobile | FR☀ 173 · FR☾ 173 · EN☀ 173 · AR☀ 175 | 173/175 (98 %) | — |
| explorer | `campus-sheet-mulhouse` | desktop | FR☀ 161 · FR☾ 161 | 161/161 (100 %) | — |
| explorer | `campus-window` | desktop | FR☀ 169 · FR☾ 169 · EN☀ 169 · AR☀ 170 | 169/170 (99 %) | — |
| explorer | `campus-window` | mobile | FR☀ 174 · FR☾ 174 · EN☀ 174 · AR☀ 175 | 174/175 (99 %) | — |
| explorer | `explore` | desktop | FR☀ 127 · FR☾ 127 · EN☀ 127 · AR☀ 128 · AR☾ 128 | 126/129 (97 %) | — |
| explorer | `explore` | mobile | FR☀ 124 · FR☾ 124 · EN☀ 124 · AR☀ 125 · AR☾ 125 | 124/125 (99 %) | — |
| explorer | `explore-campus` | desktop | FR☀ 82 · FR☾ 82 · EN☀ 82 · AR☀ 83 | 82/83 (98 %) | — |
| explorer | `explore-campus` | mobile | FR☀ 82 · FR☾ 82 · EN☀ 82 · AR☀ 83 | 82/83 (98 %) | — |
| explorer | `explore-country` | desktop | FR☀ 102 · FR☾ 102 · EN☀ 102 · AR☀ 103 | 102/103 (99 %) | — |
| explorer | `explore-country` | mobile | FR☀ 101 · FR☾ 101 · EN☀ 101 · AR☀ 102 | 101/102 (99 %) | — |
| explorer | `explore-noglobe` | desktop | FR☀ 64 · FR☾ 64 · EN☀ 64 · AR☀ 65 | 64/65 (98 %) | — |
| explorer | `explore-noglobe` | mobile | FR☀ 64 · FR☾ 64 · EN☀ 64 · AR☀ 65 | 64/65 (98 %) | — |
| explorer | `scope-popover` | desktop | FR☀ 141 · FR☾ 141 · EN☀ 141 · AR☀ 142 | 140/143 (97 %) | — |
| explorer | `scope-popover` | mobile | FR☀ 138 · FR☾ 138 · EN☀ 138 · AR☀ 139 | 138/139 (99 %) | — |
| projects | `campus-choice` | desktop | FR☀ 190 · FR☾ 190 · EN☀ 190 · AR☀ 191 | 190/191 (99 %) | — |
| projects | `campus-choice` | mobile | FR☀ 195 · FR☾ 195 · EN☀ 195 · AR☀ 196 | 195/196 (99 %) | — |
| projects | `comment-menu` | desktop | FR☀ 180 · FR☾ 180 · EN☀ 180 · AR☀ 181 | 180/181 (99 %) | — |
| projects | `comment-menu` | mobile | FR☀ 187 · FR☾ 187 · EN☀ 187 · AR☀ 188 | 187/188 (99 %) | — |
| projects | `comments-sort-open` | desktop | FR☀ 187 · FR☾ 187 · EN☀ 187 · AR☀ 188 | 187/188 (99 %) | — |
| projects | `comments-sort-open` | mobile | FR☀ 192 · FR☾ 192 · EN☀ 192 · AR☀ 193 | 192/193 (99 %) | — |
| projects | `filter-projects` | desktop | FR☀ 498 · FR☾ 498 · EN☀ 498 · AR☀ 499 | 498/499 (99 %) | — |
| projects | `filter-projects` | mobile | FR☀ 480 · FR☾ 480 · EN☀ 480 · AR☀ 481 | 480/481 (99 %) | — |
| projects | `filter-projects-expanded` | desktop | FR☀ 548 · FR☾ 548 · EN☀ 548 · AR☀ 549 | 548/549 (99 %) | — |
| projects | `filter-projects-expanded` | mobile | FR☀ 530 · FR☾ 530 · EN☀ 530 · AR☀ 531 | 530/531 (99 %) | — |
| projects | `mention-picker` | desktop | FR☀ 158 · FR☾ 158 · EN☀ 158 · AR☀ 159 | 158/159 (99 %) | — |
| projects | `mention-picker` | mobile | FR☀ 163 · FR☾ 163 · EN☀ 163 · AR☀ 164 | 163/164 (99 %) | — |
| projects | `project` | desktop | FR☀ 161 · FR☾ 161 · EN☀ 161 · AR☀ 162 · AR☾ 162 | 161/162 (99 %) | — |
| projects | `project` | mobile | FR☀ 166 · FR☾ 166 · EN☀ 166 · AR☀ 167 · AR☾ 167 | 166/167 (99 %) | — |
| projects | `project-comments` | desktop | FR☀ 124 · FR☾ 124 · EN☀ 124 · AR☀ 125 | 124/125 (99 %) | — |
| projects | `project-comments` | mobile | FR☀ 129 · FR☾ 129 · EN☀ 129 · AR☀ 130 | 129/130 (99 %) | — |
| projects | `project-comments-thread` | desktop | FR☀ 176 · FR☾ 176 · EN☀ 176 · AR☀ 177 | 176/177 (99 %) | — |
| projects | `project-comments-thread` | mobile | FR☀ 181 · FR☾ 181 · EN☀ 181 · AR☀ 182 | 181/182 (99 %) | — |
| projects | `project-implementation` | desktop | FR☀ 113 · FR☾ 113 · EN☀ 113 · AR☀ 114 | 113/114 (99 %) | — |
| projects | `project-implementation` | mobile | FR☀ 118 · FR☾ 118 · EN☀ 118 · AR☀ 119 | 118/119 (99 %) | — |
| projects | `project-local-menu` | mobile | FR☀ 166 · FR☾ 166 · EN☀ 166 · AR☀ 167 | 166/167 (99 %) | — |
| projects | `project-media` | desktop | FR☀ 114 · FR☾ 114 · EN☀ 114 · AR☀ 115 | 114/115 (99 %) | — |
| projects | `project-media` | mobile | FR☀ 119 · FR☾ 119 · EN☀ 119 · AR☀ 120 | 119/120 (99 %) | — |
| projects | `project-single` | desktop | FR☀ 137 · FR☾ 137 · EN☀ 137 · AR☀ 138 | 137/138 (99 %) | — |
| projects | `project-single` | mobile | FR☀ 142 · FR☾ 142 · EN☀ 142 · AR☀ 143 | 142/143 (99 %) | — |
| projects | `project-test` | desktop | FR☀ 116 · FR☾ 116 · EN☀ 116 · AR☀ 117 | 116/117 (99 %) | — |
| projects | `project-test` | mobile | FR☀ 121 · FR☾ 121 · EN☀ 121 · AR☀ 122 | 121/122 (99 %) | — |
| projects | `project-test-saved` | desktop | FR☀ 109 · FR☾ 109 · EN☀ 109 · AR☀ 110 | 109/110 (99 %) | — |
| projects | `project-test-saved` | mobile | FR☀ 114 · FR☾ 114 · EN☀ 114 · AR☀ 115 | 114/115 (99 %) | — |
| projects | `projects` | desktop | FR☀ 449 · FR☾ 449 · EN☀ 449 · AR☀ 450 · AR☾ 450 | 449/450 (99 %) | — |
| projects | `projects` | mobile | FR☀ 431 · FR☾ 431 · EN☀ 431 · AR☀ 432 · AR☾ 432 | 431/432 (99 %) | — |
| projects | `projects-empty` | desktop | FR☀ 83 · FR☾ 83 · EN☀ 83 · AR☀ 84 | 83/84 (98 %) | — |
| projects | `projects-empty` | mobile | FR☀ 83 · FR☾ 83 · EN☀ 83 · AR☀ 84 | 83/84 (98 %) | — |
| projects | `projects-last-page` | desktop | FR☀ 262 · FR☾ 262 · EN☀ 262 · AR☀ 263 | 262/263 (99 %) | — |
| projects | `projects-last-page` | mobile | FR☀ 258 · FR☾ 258 · EN☀ 258 · AR☀ 259 | 258/259 (99 %) | — |
| projects | `projects-list` | desktop | FR☀ 449 · FR☾ 449 · EN☀ 449 · AR☀ 450 | 449/450 (99 %) | — |
| projects | `projects-list` | mobile | FR☀ 431 · FR☾ 431 · EN☀ 431 · AR☀ 438 | 419/450 (93 %) | — |
| projects | `projects-sort-open` | desktop | FR☀ 464 · FR☾ 464 · EN☀ 464 · AR☀ 465 | 464/465 (99 %) | — |
| projects | `projects-sort-open` | mobile | FR☀ 446 · FR☾ 446 · EN☀ 446 · AR☀ 447 | 446/447 (99 %) | — |
| projects | `report` | desktop | FR☀ 179 · FR☾ 179 · EN☀ 179 · AR☀ 180 | 179/180 (99 %) | — |
| projects | `report` | mobile | FR☀ 184 · FR☾ 184 · EN☀ 184 · AR☀ 185 | 184/185 (99 %) | — |
| projects | `viewer` | desktop | FR☀ 152 · FR☾ 152 · EN☀ 152 · AR☀ 153 | 152/153 (99 %) | — |
| projects | `viewer` | mobile | FR☀ 157 · FR☾ 157 · EN☀ 157 · AR☀ 158 | 157/158 (99 %) | — |
| profiles | `filter-people` | desktop | FR☀ 568 · FR☾ 568 · EN☀ 568 · AR☀ 569 | 568/569 (99 %) | — |
| profiles | `filter-people` | mobile | FR☀ 568 · FR☾ 568 · EN☀ 568 · AR☀ 569 | 568/569 (99 %) | — |
| profiles | `filter-people-expanded` | desktop | FR☀ 590 · FR☾ 590 · EN☀ 590 · AR☀ 591 | 590/591 (99 %) | — |
| profiles | `filter-people-expanded` | mobile | FR☀ 590 · FR☾ 590 · EN☀ 590 · AR☀ 591 | 590/591 (99 %) | — |
| profiles | `message-dialog` | desktop | FR☀ 155 · FR☾ 155 · EN☀ 155 · AR☀ 156 | 155/156 (99 %) | — |
| profiles | `message-dialog` | mobile | FR☀ 160 · FR☾ 160 · EN☀ 160 · AR☀ 161 | 160/161 (99 %) | — |
| profiles | `people` | desktop | FR☀ 530 · FR☾ 530 · EN☀ 530 · AR☀ 531 · AR☾ 531 | 530/531 (99 %) | — |
| profiles | `people` | mobile | FR☀ 530 · FR☾ 530 · EN☀ 530 · AR☀ 531 · AR☾ 531 | 530/531 (99 %) | — |
| profiles | `people-last-page` | desktop | FR☀ 200 · FR☾ 200 · EN☀ 200 · AR☀ 201 | 200/201 (99 %) | — |
| profiles | `people-last-page` | mobile | FR☀ 200 · FR☾ 200 · EN☀ 200 · AR☀ 201 | 200/201 (99 %) | — |
| profiles | `people-list` | desktop | FR☀ 530 · FR☾ 530 · EN☀ 530 · AR☀ 531 | 530/531 (99 %) | — |
| profiles | `people-list` | mobile | FR☀ 530 · FR☾ 530 · EN☀ 530 · AR☀ 531 | 530/531 (99 %) | — |
| profiles | `people-sort-open` | desktop | FR☀ 545 · FR☾ 545 · EN☀ 545 · AR☀ 546 | 545/546 (99 %) | — |
| profiles | `people-sort-open` | mobile | FR☀ 545 · FR☾ 545 · EN☀ 545 · AR☀ 546 | 545/546 (99 %) | — |
| profiles | `profile` | desktop | FR☀ 140 · FR☾ 140 · EN☀ 140 · AR☀ 141 · AR☾ 141 | 140/141 (99 %) | — |
| profiles | `profile` | mobile | FR☀ 145 · FR☾ 145 · EN☀ 145 · AR☀ 146 · AR☾ 146 | 145/146 (99 %) | — |
| profiles | `profile-alumni` | desktop | FR☀ 140 · FR☾ 140 | 140/140 (100 %) | — |
| profiles | `profile-contribution` | desktop | FR☀ 99 · FR☾ 99 · EN☀ 99 · AR☀ 100 | 99/100 (99 %) | — |
| profiles | `profile-contribution` | mobile | FR☀ 104 · FR☾ 104 · EN☀ 104 · AR☀ 105 | 104/105 (99 %) | — |
| profiles | `profile-journey` | desktop | FR☀ 122 · FR☾ 122 · EN☀ 122 · AR☀ 123 | 122/123 (99 %) | — |
| profiles | `profile-journey` | mobile | FR☀ 127 · FR☾ 127 · EN☀ 127 · AR☀ 128 | 127/128 (99 %) | — |
| profiles | `profile-local-menu` | mobile | FR☀ 145 · FR☾ 145 · EN☀ 145 · AR☀ 146 | 145/146 (99 %) | — |
| profiles | `profile-projects` | desktop | FR☀ 133 · FR☾ 133 · EN☀ 133 · AR☀ 134 | 133/134 (99 %) | — |
| profiles | `profile-projects` | mobile | FR☀ 138 · FR☾ 138 · EN☀ 138 · AR☀ 139 | 138/139 (99 %) | — |
| profiles | `profile-projects-filter` | desktop | FR☀ 182 · FR☾ 182 · EN☀ 182 · AR☀ 183 | 182/183 (99 %) | — |
| profiles | `profile-projects-filter` | mobile | FR☀ 187 · FR☾ 187 · EN☀ 187 · AR☀ 188 | 187/188 (99 %) | — |
| profiles | `profile-transcender` | desktop | FR☀ 140 · FR☾ 140 | 140/140 (100 %) | — |
| profiles | `report-profile` | desktop | FR☀ 158 · FR☾ 158 · EN☀ 158 · AR☀ 159 | 158/159 (99 %) | — |
| profiles | `report-profile` | mobile | FR☀ 163 · FR☾ 163 · EN☀ 163 · AR☀ 164 | 163/164 (99 %) | — |
| shell | `account-language` | desktop | FR☀ 469 · FR☾ 469 · EN☀ 469 · AR☀ 470 | 467/474 (98 %) | — |
| shell | `account-language` | mobile | FR☀ 451 · FR☾ 451 · EN☀ 451 · AR☀ 452 | 449/456 (98 %) | — |
| shell | `account-member` | desktop | FR☀ 481 · FR☾ 481 · EN☀ 481 · AR☀ 482 | 481/482 (99 %) | — |
| shell | `account-member` | mobile | FR☀ 463 · FR☾ 463 · EN☀ 463 · AR☀ 464 | 463/464 (99 %) | — |
| shell | `account-settings` | desktop | FR☀ 482 · FR☾ 482 · EN☀ 482 · AR☀ 483 | 478/489 (97 %) | — |
| shell | `account-settings` | mobile | FR☀ 464 · FR☾ 464 · EN☀ 464 · AR☀ 465 | 460/471 (97 %) | — |
| shell | `account-theme` | desktop | FR☀ 469 · FR☾ 469 · EN☀ 469 · AR☀ 470 | 467/472 (98 %) | — |
| shell | `account-theme` | mobile | FR☀ 451 · FR☾ 451 · EN☀ 451 · AR☀ 452 | 449/454 (98 %) | — |
| shell | `account-visitor` | desktop | FR☀ 468 · FR☾ 468 · EN☀ 468 · AR☀ 469 | 468/469 (99 %) | — |
| shell | `account-visitor` | mobile | FR☀ 450 · FR☾ 450 · EN☀ 450 · AR☀ 451 | 450/451 (99 %) | — |
| shell | `awards` | desktop | FR☀ 45 · FR☾ 45 · EN☀ 45 · AR☀ 45 | 45/45 (100 %) | — |
| shell | `awards` | mobile | FR☀ 45 · FR☾ 45 · EN☀ 45 · AR☀ 45 | 45/45 (100 %) | — |
| shell | `back-to-top` | mobile | FR☀ 433 · FR☾ 433 · EN☀ 433 · AR☀ 434 | 433/434 (99 %) | — |
| shell | `dock-300` | mobile | FR☀ 427 | 427/427 (100 %) | — |
| shell | `dock-320` | mobile | FR☀ 428 | 428/428 (100 %) | — |
| shell | `messages` | desktop | FR☀ 465 · FR☾ 465 · EN☀ 465 · AR☀ 466 | 465/466 (99 %) | — |
| shell | `messages` | mobile | FR☀ 447 · FR☾ 447 · EN☀ 447 · AR☀ 448 | 447/448 (99 %) | — |
| shell | `notifications` | desktop | FR☀ 462 · FR☾ 462 · EN☀ 462 · AR☀ 463 | 462/463 (99 %) | — |
| shell | `notifications` | mobile | FR☀ 444 · FR☾ 444 · EN☀ 444 · AR☀ 445 | 444/445 (99 %) | — |
| shell | `search-open` | desktop | FR☀ 490 · FR☾ 490 · EN☀ 490 · AR☀ 491 | 490/491 (99 %) | — |
| shell | `search-open` | mobile | FR☀ 472 · FR☾ 472 · EN☀ 472 · AR☀ 473 | 472/473 (99 %) | — |
| shell | `signin-dialog` | desktop | FR☀ 461 · FR☾ 461 · EN☀ 461 · AR☀ 462 | 461/462 (99 %) | — |
| shell | `signin-dialog` | mobile | FR☀ 443 · FR☾ 443 · EN☀ 443 · AR☀ 444 | 443/444 (99 %) | — |
| shell | `signup-dialog` | desktop | FR☀ 461 · FR☾ 461 · EN☀ 461 · AR☀ 462 | 461/462 (99 %) | — |
| shell | `signup-dialog` | mobile | FR☀ 443 · FR☾ 443 · EN☀ 443 · AR☀ 444 | 443/444 (99 %) | — |
| journal | `article` | desktop | FR☀ 117 · FR☾ 117 · EN☀ 117 · AR☀ 118 · AR☾ 118 | 117/118 (99 %) | — |
| journal | `article` | mobile | FR☀ 122 · FR☾ 122 · EN☀ 122 · AR☀ 123 · AR☾ 123 | 122/123 (99 %) | — |
| journal | `article-authors` | desktop | FR☀ 130 · FR☾ 130 · EN☀ 130 · AR☀ 131 | 130/131 (99 %) | — |
| journal | `article-authors` | mobile | FR☀ 135 · FR☾ 135 · EN☀ 135 · AR☀ 136 | 135/136 (99 %) | — |
| journal | `article-comments` | desktop | FR☀ 120 · FR☾ 120 · EN☀ 120 · AR☀ 121 | 120/121 (99 %) | — |
| journal | `article-comments` | mobile | FR☀ 125 · FR☾ 125 · EN☀ 125 · AR☀ 126 | 125/126 (99 %) | — |
| journal | `article-comments-thread` | desktop | FR☀ 172 · FR☾ 172 · EN☀ 172 · AR☀ 173 | 172/173 (99 %) | — |
| journal | `article-comments-thread` | mobile | FR☀ 177 · FR☾ 177 · EN☀ 177 · AR☀ 178 | 177/178 (99 %) | — |
| journal | `article-media` | desktop | FR☀ 104 · FR☾ 104 · EN☀ 104 · AR☀ 105 | 104/105 (99 %) | — |
| journal | `article-media` | mobile | FR☀ 109 · FR☾ 109 · EN☀ 109 · AR☀ 110 | 109/110 (99 %) | — |
| journal | `journal` | desktop | FR☀ 434 · FR☾ 434 · EN☀ 434 · AR☀ 435 · AR☾ 435 | 434/435 (99 %) | — |
| journal | `journal` | mobile | FR☀ 420 · FR☾ 420 · EN☀ 420 · AR☀ 421 · AR☾ 421 | 420/421 (99 %) | — |

## Version de capture_lib.py utilisée

Version actuelle : `afcd9ebe725b` (empreinte du fichier).

- `c6847e540fcd` : 514 capture(s)
## Fenêtres (`dialog`) et voile `::backdrop`

Relevés contenant un nœud `dialog` : 126, dont **126 avec** le champ `backdrop` (fenêtre modale) et **0 sans** (fenêtre ouverte sans `showModal()`, `:modal` faux : pas de voile à relever).

| Zone | État | Fenêtre | Relevés |
|---|---|---|---|
| explorer | `about-dialog` | `dialog` | 8 avec voile |
| explorer | `campus-sheet` | `dialog` | 8 avec voile |
| explorer | `campus-sheet-expanded` | `dialog` | 4 avec voile |
| explorer | `campus-sheet-mulhouse` | `dialog` | 2 avec voile |
| explorer | `campus-window` | `campus-map-dialog` | 8 avec voile |
| profiles | `filter-people` | `content-category-dialog` | 8 avec voile |
| profiles | `filter-people-expanded` | `content-category-dialog` | 8 avec voile |
| profiles | `message-dialog` | `cp-profile-message-dialog` | 8 avec voile |
| profiles | `profile-projects-filter` | `profile-project-category-dialog` | 8 avec voile |
| profiles | `report-profile` | `content-report-1` | 8 avec voile |
| projects | `campus-choice` | `project-campus-choice-1` | 8 avec voile |
| projects | `filter-projects` | `content-category-dialog` | 8 avec voile |
| projects | `filter-projects-expanded` | `content-category-dialog` | 8 avec voile |
| projects | `report` | `content-report-1` | 8 avec voile |
| projects | `viewer` | `media-viewer` | 8 avec voile |
| shell | `signin-dialog` | `dialog` | 8 avec voile |
| shell | `signup-dialog` | `dialog` | 8 avec voile |

## Version du prototype relevée

- `design-review-selection.css?v=1 content-preview.mjs?v=113 design-review-selection.mjs?v=1` : 514 capture(s)

Empreinte des sources du prototype au moment des captures (hachage de `horizon-welcome/*.mjs|css|html|js|json` hors tests et de `figma/tokens.css`) :

- `caa67bf3145a49bd` : 514 capture(s)

## Anomalies et remarques

- Aucune erreur de page (console, exceptions) relevée pendant les captures.
- Débordement horizontal : aucun.
- Chaque variante est un chargement neuf (stockage vidé, about:blank, `open_app(theme=, lang=)` ; Compte > Paramètres pour la langue et le thème hors FR clair), puis les mêmes actions. Mouvements réduits émulés (aucun fondu en cours de capture). Les relevés DOM sont pris au même endroit de l’interface dans chaque variante ; quand une action fait défiler la page (menu ⋮, tri et suggestions des commentaires, visionneuse sur mobile), l’élément visé est placé au même endroit de la fenêtre, donc la valeur de défilement (`scrollY`) varie avec la longueur des textes (plus longue en arabe).
- Contenu saisi identique dans toutes les langues (lien de dépôt, commentaire « Très clair, merci @Inès Morel… », réponse, « Bravo @in ») : c’est du contenu d’utilisateur, pas un texte d’interface ; dates relatives et libellés restent localisés.
- Les commentaires reçoivent un identifiant aléatoire (crypto.randomUUID) qui apparaît dans les clés `k` : il est remplacé par `uuid-1`, `uuid-2`… (dans l’ordre d’apparition) pour que la même clé désigne le même élément dans chaque variante ; la correspondance est gardée dans `meta.keyNormalization`.
- **explorer** : Globe réel (WebGL) : un Chrome neuf par capture. Le premier passage enchaînait les pages du globe dans un seul Chrome et a été tué par le plafond mémoire (2,6 Go, OOM) : rien n’a été enregistré de ces essais. Une préparation du globe a échoué une fois à froid (about-dialog mobile FR clair) puis a réussi au rechargement (`checks.globeRetries`).
- **explorer** : Monde au repos : les repères affichés en étiquette ou en simple point diffèrent selon la langue (largeur des noms, gestion des chevauchements), pas selon le thème ; liste exacte dans `checks.visibleMarkers`.
- **explorer** : `explore-campus` et les fiches : capture seulement quand l’indication « Explore les alentours du campus. » est stable 2,5 s (rues chargées depuis tiles.openfreemap.org). `campus-sheet-expanded` (mobile) : déployée par une vraie molette de 600 px sur la feuille, sans attribut posé par script. Les captures `--full.png` des fiches agrandissent la fenêtre à la hauteur du contenu du volet : la carte derrière y est recomposée à cette hauteur (référence pour le volet seulement).
- **explorer** : « liste des pays dépliée » : la liste du champ Pays est une liste native de Chrome, dessinée hors du DOM. `scope-popover-list` (ordinateur seulement) est une capture d’écran sans relevé, la liste des pays dans l’ordre réel est dans `checks.countryOptions`. Sur mobile, le sélecteur tactile natif n’est pas dessiné dans une capture sans interface : non capturable (seule la fenêtre ouverte, `scope-popover`, est relevée).
- **explorer** : `explore-noglobe` : aperçu direct avec `integrated-globe.mjs` bloqué ; même message et même état que « Continuer sans le globe » depuis l’écran d’erreur de l’arrivée (filtre Pays / Campus actif, dé grisé).
- **projects** : Observation sur le prototype (non corrigée, lecture seule) : dans l’illustration de Minishell, le texte SVG « $ ./minishell » hérite du sens RTL en arabe et déborde à gauche de la fenêtre du terminal (fiche, Médias, visionneuse) ; en thème clair ce texte est sombre sur le fond sombre du terminal, alors qu’il est clair en thème sombre.
- **projects** : `comment-menu` : le bouton ⋮ est placé à 42 % de la hauteur de la fenêtre ; ainsi, sur mobile, la page dépasse le seuil (0,75 × hauteur) du bouton Remonter en haut dans toutes les langues (un premier cadrage centré le laissait masqué en français et visible en arabe ; recapturé). `project-test` et `project-test-saved` : page remise en haut après les clics.
- capture_lib.py a changé pendant la passe : `svgKids` (15 oct., 22 h 13), lignes de texte mesurées sans les espaces (16 oct., 04 h 15), voile `::backdrop` des fenêtres modales et `s.clip` (`clip-path`, 16 oct., 05 h 16–05 h 18). Les états à fenêtre ont d’abord été refaits pour le voile (explorer : about-dialog, campus-sheet, campus-sheet-expanded, campus-sheet-mulhouse, campus-window ; projects : campus-choice, report, viewer — filter-projects et filter-projects-expanded l’avaient déjà ; profiles : filter-people, filter-people-expanded, message-dialog, profile-projects-filter, report-profile ; shell : signin-dialog, signup-dialog), puis toutes les autres captures avec la même version, pour que `s.clip` (éléments masqués `.sr-only`, titres de section, scène du globe) figure partout. Version de chaque relevé : champ `lib`.
- Écarts attendus entre variantes (pas des défauts de capture) : l’option cochée des panneaux Paramètres, Thème et Langue est celle de la variante ; sur mobile en vue Liste, l’arabe affiche un second auteur au lieu de « +1 » sur certaines cartes (ajustement des auteurs à la place disponible) ; la ligne arabe « أفق » du logo n’existe qu’en arabe.
