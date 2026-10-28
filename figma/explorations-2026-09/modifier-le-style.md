# Modifier le style de 42 Horizon

Date : 2026-09-14
Statut : bibliothèque et exemples vérifiés, avec accueil convivial en français, anglais et arabe. Les essais de propagation graphique ont réussi ; les 36 liens du sélecteur de langue ont été validés par l'API Figma.

Ce guide concerne **Figma Design** : il permet de modifier les maquettes et leurs composants. Il ne modifie pas une application développée. L'ancien prototype web reste un fichier distinct, sans synchronisation automatique ni Code Connect.

## Ouvrir les bons repères

- [Réglages du style](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=46-2) — cadre `46:2`.
- [Palette de référence](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=46-50) — cadre `46:50`.
- [Nouvelle piste immersive — BEYOND THE CODE](piste-immersive.md) — entrée, révélation et accueil épuré, avec modes partagés.
- [Accueil, piste conviviale](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=39-10) — cadre `39:10`.
- [Planche des 23 icônes](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=47-2) — cadre `47:2`.
- [Terrain de jeu clair](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=74-2) — cadre `74:2`.
- [Terrain de jeu sombre](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=74-280) — cadre `74:280`.
- [Guide des langues](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=110-348) — cadre `110:348`, accessible aussi depuis la couverture.

Le cadre « Réglages » sert de repère. Pour changer une valeur partagée, ouvrir les **Variables** du fichier ; modifier simplement le texte d'une légende sur cette planche ne change pas la variable.

## Les cinq collections

La bibliothèque Figma contient **205 variables** : 132 pour le socle graphique et 73 pour l'extension linguistique. Rechercher les noms suivants dans le panneau Variables ; les IDs servent à identifier les mêmes ressources dans les exports.

| Collection | Contenu | ID exact | Mode(s) |
| --- | --- | --- | --- |
| `42 · Primitives` | 34 couleurs et valeurs d'opacité | `VariableCollectionId:3:2` | `Valeur` : `3:0` |
| `42 · Couleurs` | 43 rôles d'interface | `VariableCollectionId:3:3` | `Clair` : `3:1` ; `Sombre` : `3:2` |
| `42 · Mesures` | 35 dimensions, espacements et rayons | `VariableCollectionId:3:4` | `Valeur` : `3:3` |
| `42 · Typographie` | 20 valeurs de police, graisse, taille et interligne | `VariableCollectionId:45:2` | `Valeur` : `45:0` |
| `42 · Langues` | 63 textes, langue courante, police et huit interlignes | `VariableCollectionId:95:2` | `Français` : `95:0` ; `English` : `95:1` ; `العربية` : `95:2` |

Une primitive est une valeur de palette, par exemple `violet`. Un rôle indique son usage, par exemple `color/action/primary`. L'alias relie les deux. Les composants utilisent ces rôles, puis les écrans utilisent des instances des composants.

## Changer la couleur des boutons

1. Ouvrir **Variables** dans la navigation gauche de Figma. Si cette entrée n'est pas encore disponible dans l'interface, désélectionner les calques puis ouvrir **Local variables** dans la barre latérale droite. [Aide Figma — gestion des variables](https://help.figma.com/hc/en-us/articles/15145852043927-Create-and-manage-variables-and-collections)
2. Choisir **42 · Couleurs** et rechercher **`color/action/primary`**.
3. Dans la colonne **Clair**, remplacer l'alias actuel `violet` par la couleur souhaitée. La colonne **Sombre** reste indépendante et utilise actuellement `cobalt`.
4. Adapter **`color/action/on-primary`** si nécessaire : c'est la couleur du texte et de l'icône sur le bouton. Vérifier leur lisibilité sur le nouveau fond.
5. Examiner un bouton sur l'accueil et dans une fenêtre de dialogue. Vérifier également les états de survol et d'appui, qui ont leurs propres rôles.

| Réglage | Variable exacte | ID | Alias Clair / Sombre |
| --- | --- | --- | --- |
| Fond principal | `color/action/primary` | `VariableID:42:2` | `violet` / `cobalt` |
| Texte sur fond principal | `color/action/on-primary` | `VariableID:42:3` | `white` / `ink` |
| Fond au survol | `color/action/hover` | `VariableID:42:4` | `cerulean` / `teal` |
| Texte au survol | `color/action/on-hover` | `VariableID:42:5` | `white` / `ink` |
| Fond pendant l'appui | `color/action/pressed` | `VariableID:42:6` | `ink` / `white` |
| Texte pendant l'appui | `color/action/on-pressed` | `VariableID:42:7` | `white` / `ink` |
| Fond secondaire | `color/action/secondary` | `VariableID:42:8` | `pale` / `graphite` |
| Texte secondaire | `color/action/on-secondary` | `VariableID:42:9` | `ink` / `white` |
| Action discrète | `color/action/quiet` | `VariableID:42:10` | `cerulean` / `teal` |
| Fond indisponible | `color/action/disabled` | `VariableID:42:11` | `line` / `graphite` |
| Texte indisponible | `color/action/on-disabled` | `VariableID:42:12` | `muted` / `cadet` |

**`color/accent` ne pilote pas le fond des boutons principaux.** Ce rôle partagé (`VariableID:4:20`) reste lié à `teal` dans les deux thèmes. Modifier uniquement `color/action/primary` permet de changer les boutons sans recolorer tous les usages de l'accent.

## Changer les autres couleurs

Dans **42 · Couleurs**, modifier le rôle de l'élément souhaité. Les alias Clair/Sombre sont recensés dans [figma-tokens.json](figma-tokens.json).

| Élément à modifier | Variable | ID |
| --- | --- | --- |
| Fond de page | `color/bg` | `VariableID:4:14` |
| Surface générale | `color/surface` | `VariableID:4:15` |
| Surface douce | `color/soft` | `VariableID:4:16` |
| Texte principal | `color/text` | `VariableID:4:17` |
| Texte secondaire | `color/muted` | `VariableID:4:18` |
| Bordure générale | `color/border` | `VariableID:4:19` |
| Liens | `color/link` | `VariableID:4:21` |
| Fond d'une carte | `color/card/background` | `VariableID:42:22` |
| Bordure d'une carte | `color/card/border` | `VariableID:42:23` |
| Navigation active | `color/nav/active` | `VariableID:42:24` |
| Navigation au survol | `color/nav/hover` | `VariableID:42:25` |
| Contour de focus | `color/focus` | `VariableID:42:13` |
| Fond d'un champ | `color/input/background` | `VariableID:42:14` |
| Bordure d'un champ | `color/input/border` | `VariableID:42:15` |
| Indication de saisie | `color/input/placeholder` | `VariableID:42:16` |
| Catégorie projet | `color/project` | `VariableID:39:6` |
| Catégorie personne/parcours | `color/people` | `VariableID:39:7` |
| Catégorie journal | `color/journal` | `VariableID:39:8` |
| Erreur | `color/error` | `VariableID:42:17` |
| Confirmation | `color/success` | `VariableID:42:18` |
| Attention | `color/warning` | `VariableID:42:19` |
| Information | `color/info` | `VariableID:42:20` |
| Fond derrière une fenêtre de dialogue | `color/overlay` | `VariableID:42:21` |
| Terres du globe | `color/land` | `VariableID:4:25` |
| Grille du globe | `color/grid` | `VariableID:4:26` |
| Début transparent du fondu | `color/fade-clear` | `VariableID:20:4` |
| Voile du fondu | `color/fade-veil` | `VariableID:20:7` |
| Logo clair/sombre | `color/logo` | `VariableID:65:2` |

Pour remplacer une couleur partout où sa primitive est utilisée, ouvrir **42 · Primitives** et changer cette primitive. Par exemple, `violet` (`VariableID:39:5`, `#6000BC`) est partagé par plusieurs usages : le changer peut toucher les boutons, le focus, la navigation et les projets en thème clair. Changer uniquement le rôle voulu garde les autres usages indépendants.

Les photos ne changent pas avec la palette. Les messages d'état restent accompagnés de textes explicites ; leur sens ne repose pas uniquement sur la couleur. Le logo conserve sa déclinaison encre en clair et blanche en sombre.

Les champs utilisent `ui/slate` pour leur bordure en clair et `cadet` en sombre. Les erreurs combinent un texte neutre explicite et un repère rose. Le focus possède un contour extérieur visible : conserver ce repère lors d'un changement de palette.

## Modifier les arrondis et les espacements

Ouvrir **42 · Mesures** et privilégier les rôles ci-dessous. Un alias peut être remplacé par une autre mesure existante.

| Réglage | Variable | ID | Valeur actuelle |
| --- | --- | --- | --- |
| Arrondi des boutons | `radius/button` | `VariableID:42:42` | Alias `radius/999` |
| Arrondi des cartes | `radius/card` | `VariableID:42:43` | Alias `radius/20` |
| Arrondi des champs | `radius/input` | `VariableID:42:44` | Alias `radius/12` |
| Arrondi des fenêtres de dialogue | `radius/dialog` | `VariableID:42:45` | Alias `radius/20` |
| Marge intérieure des contrôles | `space/control-padding` | `VariableID:42:46` | Alias `space/16` |
| Marge intérieure des cartes | `space/card-padding` | `VariableID:42:47` | Alias `space/24` |
| Hauteur de contrôle standard | `control/height` | `VariableID:4:39` | 44 |
| Hauteur compacte | `size/control-small` | `VariableID:42:35` | 36 |
| Grande hauteur | `size/control-large` | `VariableID:42:36` | 52 |
| Taille d'icône | `size/icon` | `VariableID:42:40` | 20 |
| Épaisseur de bordure | `stroke/thin` | `VariableID:42:33` | 1 |
| Épaisseur du focus | `stroke/focus` | `VariableID:42:34` | 2 |

Exemple : remplacer l'alias de `radius/button` par `radius/12` rend les boutons moins arrondis. Modifier directement la primitive `radius/12` affecterait aussi les autres éléments qui utilisent cette même primitive.

Après un changement de mesure, vérifier un libellé long et un écran mobile. Les dimensions qui ne sont pas reliées à la variable choisie ne changent pas automatiquement.

## Modifier la typographie

La collection **42 · Typographie** contient `font/family` (`VariableID:45:3`, valeur `Jost`), `font/regular` (`VariableID:45:4`, `Regular`), `font/medium` (`VariableID:45:5`, `Medium`) et `font/strong` (`VariableID:45:6`, `SemiBold`).

Les huit styles Jost sont reliés aux variables de famille, graisse, taille et interligne. Un essai a confirmé que trois textes reliés au style Body suivent un changement de taille de 16 à 17, puis le retour à 16.

| Style | Taille / interligne | Variable de taille — ID | Variable d'interligne — ID |
| --- | --- | --- | --- |
| Display | 72 / 76 | `type/Display/size` — `VariableID:45:7` | `type/Display/line` — `VariableID:45:8` |
| H1 | 48 / 54 | `type/H1/size` — `VariableID:45:9` | `type/H1/line` — `VariableID:45:10` |
| H2 | 28 / 34 | `type/H2/size` — `VariableID:45:11` | `type/H2/line` — `VariableID:45:12` |
| H3 | 20 / 28 | `type/H3/size` — `VariableID:45:13` | `type/H3/line` — `VariableID:45:14` |
| Body | 16 / 24 | `type/Body/size` — `VariableID:45:15` | `type/Body/line` — `VariableID:45:16` |
| Small | 14 / 20 | `type/Small/size` — `VariableID:45:17` | `type/Small/line` — `VariableID:45:18` |
| Label | 14 / 20 | `type/Label/size` — `VariableID:45:19` | `type/Label/line` — `VariableID:45:20` |
| Eyebrow | 11 / 16 | `type/Eyebrow/size` — `VariableID:45:21` | `type/Eyebrow/line` — `VariableID:45:22` |

Modifier la taille et l'interligne du style voulu ensemble si nécessaire. Si la famille change, choisir une police disponible avec les graisses employées, puis revoir les retours à la ligne et les contrôles. Les IDs des styles eux-mêmes sont conservés dans [figma-state-v2.json](figma-state-v2.json).

Pour le nom **HORIZON**, la police Futura souhaitée reste indisponible : un fichier TTF ou OTF utilisable avec autorisation est nécessaire. Le nom emploie provisoirement **Jost Medium en majuscules**. Cette substitution ne change pas le symbole 42.

Les accueils traduits utilisent huit styles **International** distincts, dont les IDs figurent dans [figma-locales-state.json](figma-locales-state.json). Leur police est liée à `i18n/font/family` : Jost en français et anglais, Noto Sans Arabic en arabe. Leurs interlignes adaptés évitent de comprimer l'écriture arabe dans les dimensions du français.

## Tester Clair et Sombre

1. Sélectionner le cadre de l'écran ou de la démonstration à examiner.
2. Dans **Appearance / Apparence**, ouvrir **Apply variable mode / Appliquer un mode de variable**.
3. Choisir **42 · Couleurs**, puis **Clair** ou **Sombre**. Les calques en mode **Auto** héritent du thème de leur parent. [Aide Figma — modes de variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)
4. Examiner les textes, les boutons, le focus, les champs, les cartes et le fondu du globe. Refaire la comparaison sur le mobile.

Si une couleur ne suit pas, inspecter la propriété de remplissage ou de bordure concernée : elle peut utiliser une couleur locale, un remplacement d'instance ou un mode fixé dans un calque enfant. Vérifier son lien et l'héritage du mode avant de recolorer le calque manuellement.

Cette bascule vérifie l'apparence dans l'éditeur. Les commandes d'un prototype doivent être reliées pour fonctionner ; elles ne sont pas créées automatiquement par les variables.

## Modifier une langue ou une traduction

Cette fonction couvre **l'accueil convivial et le sélecteur de langue réutilisable**. Les autres maquettes, dont le portfolio et les accueils exploratoires par rôle, ne sont pas traduites.

### Ouvrir les douze versions

| Langue | Ordinateur clair | Ordinateur sombre | Mobile clair | Mobile sombre |
| --- | --- | --- | --- | --- |
| Français | [39:10](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=39-10) | [70:151](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=70-151) | [70:280](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=70-280) | [70:398](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=70-398) |
| English | [100:287](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=100-287) | [100:417](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=100-417) | [100:547](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=100-547) | [100:665](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=100-665) |
| العربية | [100:2000](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=100-2000) | [100:2130](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=100-2130) | [100:2260](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=100-2260) | [100:2378](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=100-2378) |

Les menus de langue possèdent 36 liaisons vers ces écrans. Leur structure a été validée par l'API : une sélection de langue conserve le thème clair/sombre et le format ordinateur/mobile de départ. Le parcours **français → arabe → thème sombre → anglais** a aussi réussi par clics réels dans Chrome sur ordinateur, avec conservation du format desktop et du thème sombre. Sur mobile, le parcours français → arabe → anglais a réussi par clics réels dans Chrome : format 390 px et thème clair conservés, menu fermé après chaque choix, passage RTL puis LTR vérifié.

### Changer un texte partagé

1. Dans **Variables**, ouvrir **42 · Langues**.
2. Rechercher le texte par son nom `i18n/…`, puis modifier sa valeur dans la colonne **Français**, **English** ou **العربية**.
3. Vérifier la version ordinateur et mobile correspondante. Les textes sont partagés là où ils utilisent la même variable ; certains libellés mobiles ont une variable distincte pour tenir dans l'espace disponible.

| Texte ou réglage | Nom exact | ID |
| --- | --- | --- |
| Nom du projet | `i18n/brand/name` | `VariableID:95:3` |
| Titre d'accueil | `i18n/hero/title` | `VariableID:95:8` |
| Introduction ordinateur | `i18n/hero/description` | `VariableID:95:9` |
| Action principale | `i18n/action/explore-campuses` | `VariableID:95:10` |
| Navigation Explorer | `i18n/nav/explore` | `VariableID:95:12` |
| Navigation Projets | `i18n/nav/projects` | `VariableID:95:13` |
| Navigation Parcours | `i18n/nav/journeys` | `VariableID:95:14` |
| Navigation Journal | `i18n/nav/journal` | `VariableID:95:15` |
| Étiquette sur la photo | `i18n/story/tag` | `VariableID:95:23` |
| Introduction mobile | `i18n/hero/description-mobile` | `VariableID:95:42` |
| Titre du sélecteur | `i18n/language/label` | `VariableID:95:48` |
| Langue courante | `i18n/language/current` | `VariableID:95:53` |
| Police de la langue | `i18n/font/family` | `VariableID:95:54` |

Les 50 textes se trouvent dans [locales.json](locales.json), avec leurs valeurs `fr`, `en` et `ar`. Les dix autres variables linguistiques gèrent la langue courante, la police et huit interlignes. Les noms natifs **Français**, **English** et **العربية** restent affichés tels quels dans chaque langue.

### Respecter la composition arabe

La version arabe possède une **mise en page RTL dédiée**, avec lecture et navigation de droite à gauche. Le composant `Nav` propose `Direction=LTR` et `Direction=RTL`. Les huit interlignes `i18n/type/…/line` adaptent les styles International à Noto Sans Arabic.

Le mode **العربية** de la collection change les textes et réglages qui lui sont liés ; il ne déplace pas automatiquement tous les blocs d'une maquette française. Pour partir d'une composition arabe prête à l'emploi, dupliquer l'un des cadres arabes ci-dessus. Les photos et la géométrie du globe conservent leur orientation ; HORIZON et le symbole 42 restent inchangés.

## Réutiliser les composants

Depuis **Assets / Ressources**, insérer une instance du composant. Modifier ses propriétés exposées pour changer le texte, la variante ou une icône. Conserver l'instance reliée à son composant principal pour recevoir les évolutions communes.

| Famille dans le relevé | ID principal | Ressource construite |
| --- | --- | --- |
| `Button` | `13:2` | 18 variantes, libellé et icône optionnelle |
| `Nav` | `13:11` | 10 variantes : cinq états × `Direction=LTR/RTL` |
| `MenuItem` | `59:73` | 4 variantes de menu |
| `Field` | `50:30` | 28 variantes de champs |
| `SelectMenu` | `59:801` | Menu d'options |
| `Checkbox` | `51:60` | 9 variantes |
| `Switch` | `53:75` | 6 variantes |
| `Avatar` | `54:11` | 9 variantes |
| `Badge` | `56:30` | 16 variantes |
| `Tab` | `57:27` | 5 variantes |
| `GeographicScope` | `58:776` | 3 niveaux : monde, pays, campus |
| `Pagination` | `60:32` | 6 variantes |
| `Alert` | `60:972` | 5 variantes |
| `Dialog` | `61:37` | 3 variantes |
| `StoryCard` | `62:23` | 9 variantes de cartes éditoriales |
| `ContentState` | `63:61` | 4 variantes d'état de contenu |
| `Card` | `14:2` | Carte de contenu initiale |
| `Logo` | `15:2` | Logo 42 |
| `Globe` | `19:8` | Globe |
| `LanguageMenu` | `97:143` | Sélecteur réutilisable, variantes français/anglais/arabe |

Le relevé fournit aussi les 23 icônes et les clés exactes des propriétés des composants. Par exemple, le bouton expose `Label#13:0`, `Show icon#48:0` et `Icon#48:13`. Ces identifiants techniques sont utiles pour l'automatisation ; dans l'éditeur, utiliser les libellés affichés.

## Ce qui a été vérifié

La bibliothèque comprend 20 familles de composants, logo et globe inclus, ainsi que 23 icônes. Les essais graphiques réels suivants sont consignés dans [verification-v2.json](verification-v2.json) :

- Le fond principal a été changé de violet à bleu `cerulean`, puis restauré, sur le bouton source, le terrain de jeu, une fenêtre de dialogue et l'accueil convivial.
- La taille Body a été changée de 16 à 17, puis restaurée sur trois textes ; le rayon d'une carte a suivi un changement de 20 à 8, puis le retour à 20.
- Les versions claires et sombres ont été inspectées sur les terrains de jeu, l'accueil convivial desktop et le mobile.

Les valeurs de référence sont restaurées. Pour comparer les exemples, ouvrir les terrains de jeu ci-dessus ou les accueils [desktop sombre](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=70-151), [mobile clair](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=70-280) et [mobile sombre](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=70-398).

L'extension linguistique ajoute 12 écrans et 36 liens de langue validés par l'API, recensés dans `figma-locales-state.json`. Les captures arabes ordinateur/mobile, claires et sombres, ont été inspectées : les quatre entrées de navigation, les titres, les cartes et l'étiquette sur la photo sont lisibles. Les parcours desktop français → arabe → sombre → anglais et mobile français → arabe → anglais ont été testés par clics réels, avec maintien du format et du thème.

## Export pour le code

Le fichier [tokens.css](../../shared/brand/tokens.css) est disponible. Il est généré par [export-tokens.py](export-tokens.py) à partir de [figma-tokens.json](figma-tokens.json). Il reprend les **132 variables graphiques**, leurs aliases et les thèmes ; par exemple, l'action principale devient `--h42-color-action-primary`. Il ne contient pas les 73 variables de la collection Langues.

L'export est un **instantané manuel**. Après une modification dans Figma, il faut récupérer un nouvel export JSON puis régénérer le CSS. Depuis la racine du projet :

```sh
python3 figma/explorations-2026-09/export-tokens.py
```

La commande suivante vérifie que le CSS correspond au JSON local sans modifier le fichier :

```sh
python3 figma/explorations-2026-09/export-tokens.py --check
```

Ces commandes ne se connectent pas à Figma. Elles ne synchronisent pas l'application et n'intègrent pas automatiquement les composants dans du code.

Les **50 textes traduits** sont conservés dans un instantané manuel séparé, [locales.json](locales.json). Modifier ce JSON ne modifie pas automatiquement les textes Figma, et modifier Figma ne met pas automatiquement ce JSON à jour. `figma-locales-state.json` conserve les IDs, modes, polices, interlignes, cadres et liaisons de cette extension.

## Portée de la bibliothèque

La bibliothèque et les exemples cités sont vérifiés dans le périmètre décrit. La traduction couvre uniquement l'accueil convivial et son sélecteur réutilisable. Les autres parcours du site ne sont pas tous conçus, traduits ou développés ; il ne s'agit pas d'un audit exhaustif de toute l'application.

La bibliothèque facilite les prochaines maquettes. Elle ne définit pas à elle seule les droits du staff ou des administrateurs, ne rend pas les actions fonctionnelles et ne modifie pas la règle de confiance communautaire. Le détail du périmètre et des vérifications figure dans [design-system-plan.md](design-system-plan.md).
