# 42 Horizon — plan de la bibliothèque graphique

Date : 2026-09-14
Fichier de travail : [42 Horizon dans Figma Design](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT)
Statut : bibliothèque et exemples vérifiés, accueil convivial décliné en français, anglais et arabe. Les essais de propagation graphique ont réussi ; les liaisons du sélecteur de langue ont été validées par l'API Figma. Les parcours du site ne sont pas tous conçus, traduits ou développés.

## État de réalisation

La bibliothèque Figma contient désormais **205 variables dans cinq collections**, huit styles de texte Jost et huit styles International, un style d'ombre, **21 familles de composants, logo, mot-symbole et globe inclus**, et **23 icônes**. Le socle graphique reste recensé dans [figma-state-v2.json](figma-state-v2.json) et [figma-tokens.json](figma-tokens.json) ; l'extension linguistique est recensée dans [figma-locales-state.json](figma-locales-state.json). Le [guide Modifier le style](modifier-le-style.md) donne les noms exacts à rechercher et les réglages usuels. Les preuves de vérification graphique figurent dans [verification-v2.json](verification-v2.json).

- [Réglages du style](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=46-2) — cadre `46:2`.
- [Palette de référence](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=46-50) — cadre `46:50`.
- [Nouvelle piste immersive](piste-immersive.md) — page `115:2`, prototype bureau et mobile vérifié.
- [Piste conviviale](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=39-10) — cadre `39:10`.
- [Terrain de jeu clair](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=74-2) — cadre `74:2`.
- [Terrain de jeu sombre](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=74-280) — cadre `74:280`.
- [Guide des langues](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=110-348) — cadre `110:348`, également accessible depuis la couverture.

| Collection exacte | ID | Variables | Modes |
| --- | --- | --- | --- |
| `42 · Primitives` | `VariableCollectionId:3:2` | 34 | `Valeur` (`3:0`) |
| `42 · Couleurs` | `VariableCollectionId:3:3` | 43 | `Clair` (`3:1`), `Sombre` (`3:2`) |
| `42 · Mesures` | `VariableCollectionId:3:4` | 35 | `Valeur` (`3:3`) |
| `42 · Typographie` | `VariableCollectionId:45:2` | 20 | `Valeur` (`45:0`) |
| `42 · Langues` | `VariableCollectionId:95:2` | 73 | `Français` (`95:0`), `English` (`95:1`), `العربية` (`95:2`) |

Ces éléments sont des ressources de **Figma Design**. Leur présence ne constitue pas une application développée ni la conception de toutes les pages du site.

## Objectif

Construire une base réutilisable suffisamment complète pour poursuivre les maquettes sans redessiner chaque contrôle. Les couleurs, les thèmes, la typographie et les mesures communes doivent pouvoir évoluer depuis leurs définitions centrales. Une modification doit se répercuter sur les composants et les écrans qui leur sont reliés.

La nouvelle [piste immersive](piste-immersive.md) met en scène une entrée cryptée puis un accueil limité au globe et aux commandes essentielles. La piste conviviale précédente, avec personnes et projets au premier plan, reste conservée pour comparaison. Cette bibliothèque prépare les pages futures ; elle ne fige ni leur liste ni les fonctionnalités encore en discussion.

Le travail concerne Figma Design. Il n'existe pas de bibliothèque de composants applicatifs à synchroniser ni de configuration Code Connect. Le prototype web antérieur sert de référence pour la rotation et le zoom du globe. Un export [tokens.css](../../shared/brand/tokens.css), généré par [export-tokens.py](export-tokens.py) depuis `figma-tokens.json`, reprend les **132 variables graphiques**. Les **50 textes traduits** sont stockés séparément dans [locales.json](locales.json). Ces deux exports sont des instantanés manuels, sans synchronisation automatique avec Figma ou l'application.

## Point de départ et palette

Le relevé initial contenait trois collections, les styles Jost, des boutons, une navigation, une carte de contenu, le logo et le globe. L'extension ajoute la collection de typographie, les rôles et familles de composants détaillés dans ce document. Leur vérification comprend des modifications réelles de variables suivies de leur restauration, décrites à la fin du document.

La palette construite reprend les 16 primitives initiales, dont quatre valeurs de transparence, les quatre couleurs secondaires de la charte 42 et 14 entrées complémentaires pour les exemples d'interface, le dégradé et les opacités. Les hexadécimaux de la charte servent de référence.

| Groupe | Primitive | Valeur ou référence |
| --- | --- | --- |
| Neutres | `white` | `#FFFFFF` |
| Neutres | `ink` | `#1B1B1B` |
| Neutres | `charcoal` | `#202026` |
| Neutres | `graphite` | `#29292E` |
| Neutres | `muted` | `#5B5B60` |
| Neutres | `line` | `#E3E3E3` |
| Turquoises | `teal` | `#00BABC` |
| Turquoises | `tealDeep` | `#04809F` |
| Turquoises | `mist` | `#E7FEFE` |
| Turquoises | `pale` | `#E6F4F1` |
| Turquoises | `slate` | `#324B4B` |
| Turquoises | `cadet` | `#95B0B0` |
| Transparents | `white/clear`, `ink/clear` | Versions transparentes des neutres, pour les fondus |
| Voiles | `white/veil`, `ink/veil` | Blanc et encre à 90 % d'opacité |
| Secondaires | `pink` | `#ED3491` |
| Secondaires | `cobalt` | `#96A3EB` |
| Secondaires | `cerulean` | `#173D7A` |
| Secondaires | `violet` | `#6000BC` |
| Interface | `ui/green` | `#2DD57A` |
| Interface | `ui/orange` | `#ED730A` |
| Interface | `ui/pink` | `#EC3391` |
| Interface | `ui/violet` | `#7300FF` |
| Interface | `ui/slate` | `#475B67` |
| Dégradé | `gradient/indigo` | `#170D7A` |
| Opacités | `ink/75`, `ink/50`, `ink/25`, `ink/5` | Encre à 75 %, 50 %, 25 % et 5 % d'opacité |
| Opacités | `white/75`, `white/50`, `white/25`, `white/5` | Blanc à 75 %, 50 %, 25 % et 5 % d'opacité |

Ces 34 entrées constituent une palette technique : les variantes d'opacité ne sont pas des couleurs supplémentaires de marque. Les photos restent des images ; une variable de couleur ne recolore pas leur contenu. Le logo utilise `color/logo` (`VariableID:65:2`), encre en clair et blanc en sombre.

## Variables sémantiques et thèmes

Conserver une chaîne lisible : primitive → rôle de couleur → propriété du composant → instance dans l'écran. Les composants doivent utiliser des rôles, sans hexadécimaux isolés. Le tableau décrit les usages de conception ; les noms exacts construits sont consignés dans `figma-tokens.json` et dans le guide utilisateur. Les usages futurs du tableau ne constituent pas des variables supplémentaires déjà livrées.

| Famille | Rôles à couvrir | Application |
| --- | --- | --- |
| Actions | principale, principale au survol, appuyée, secondaire, discrète, texte sur action, action désactivée | Boutons, liens et commandes |
| Surfaces | page, carte, surface douce, champ, surface au survol, sélection, fenêtre de dialogue, voile de fond | Fonds et hiérarchie des panneaux |
| Textes et icônes | principal, secondaire, atténué, lien, texte sur accent, texte inversé, texte désactivé | Libellés, paragraphes, légendes et pictogrammes |
| Bordures | discrète, contrôle, survol, sélection, focus, désactivée | Champs, cartes, séparateurs et focus visible |
| Catégories | projets, parcours, journal, Awards : fond et texte associés | Repères éditoriaux ; choix d'affectation encore ajustable |
| États | neutre, information, confirmation, attention, erreur : fond, texte et bordure | Alertes, messages de formulaire et badges de statut |
| Globe | terre, grille, repère, repère sélectionné, fondu transparent, voile | Carte et transition avec le menu |

Les rôles existants `color/bg`, `color/surface`, `color/soft`, `color/text`, `color/muted`, `color/border`, `color/accent`, `color/link`, `color/onAccent`, `color/inverse`, `color/onInverse`, `color/land`, `color/grid`, `color/fade-clear` et `color/fade-veil` forment le point de départ. Conserver leurs liens ou les migrer explicitement afin de préserver les écrans existants.

La collection `42 · Couleurs` possède deux modes : **Clair** et **Sombre**. Chaque rôle dispose d'une valeur ou d'un alias dans les deux modes. Les composants héritent du mode de leur cadre dans les exemples vérifiés. Les deux thèmes ont été inspectés sur le terrain de jeu et les accueils conviviaux desktop et mobile.

Pour les états, utiliser la palette 42 avec un libellé explicite et, si utile, une icône. Une erreur rose ou une information bleue ne doit pas dépendre uniquement de sa couleur pour être comprise. La confirmation d'une action de formulaire ne doit pas suggérer qu'un étudiant doit approuver une publication.

Les corrections finales comprennent `color/action/quiet` lié à `cerulean` en clair, `color/input/border` lié à `ui/slate` en clair, des erreurs formulées en texte neutre avec un repère rose et un contour de focus extérieur visible.

Changer `color/accent` agit sur les usages reliés à cet accent. Les boutons principaux utilisent un rôle distinct : `color/action/primary` (`VariableID:42:2`), actuellement lié à `violet` en clair et `cobalt` en sombre. Les textes correspondants utilisent `color/action/on-primary` (`VariableID:42:3`). Cette distinction évite qu'une correction locale modifie aussi les liens, le globe ou les catégories.

## Typographie, mesures et effets

Jost est l'alternative géométrique retenue à Futura PT, absente des polices disponibles. Les textes doivent utiliser les styles partagés suivants, avec une couleur liée séparément à une variable.

La police Futura souhaitée pour le nom **HORIZON** n'est toujours pas disponible. Un fichier TTF ou OTF utilisable avec autorisation est nécessaire pour la remplacer. Le nom reste provisoirement en **Jost Medium, en majuscules** ; cette solution ne doit pas être présentée comme la police Futura officielle.

| Style existant | Taille / interligne | Graisse | Usage |
| --- | --- | --- | --- |
| Display | 72 / 76 | Medium | Grand titre de présentation |
| H1 | 48 / 54 | Medium | Titre de page |
| H2 | 28 / 34 | Medium | Section |
| H3 | 20 / 28 | Medium | Carte ou panneau |
| Body | 16 / 24 | Regular | Texte courant |
| Small | 14 / 20 | Regular | Aide et information secondaire |
| Label | 14 / 20 | Medium | Libellé de contrôle |
| Eyebrow | 11 / 16 | SemiBold | Repère éditorial court |

Prévoir une variante de grand titre adaptée au mobile sans réduire tous les textes uniformément. Documenter les graisses et styles supplémentaires réellement utilisés pendant l'extension, plutôt que créer des doublons locaux.

Les mesures construites comprennent les espacements 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 et 96 ; les rayons 0, 4, 8, 12, 20, 32 et 999 ; une hauteur de contrôle de 44 ; des hauteurs compacte de 36 et grande de 52 ; des avatars de 32, 48 et 80 ; une icône de 20 ; des bordures de 1 et 2. Les rôles `radius/button`, `radius/card`, `radius/input`, `radius/dialog`, `space/control-padding` et `space/card-padding` sont présents. Le guide donne leurs IDs et aliases actuels.

Les usages suivants restent les repères pour compléter les mesures au fil des besoins ; ils ne supposent pas que chaque dimension ci-dessous possède déjà sa propre variable :

- Contrôles : hauteur, marge horizontale, écart icône/texte, taille d'icône, épaisseur de bordure et contour de focus.
- Formulaires : écart entre libellé et champ, aide et champ ; espacement entre champs ; hauteur minimale de zone de texte.
- Cartes et fenêtres de dialogue : marge intérieure, écart entre contenus, rayon et largeur maximale.
- Navigation : hauteur d'élément, écart entre éléments, marge latérale et largeur du menu selon le format.
- Avatars : tailles compacte, standard et mise en avant ; dimensions des images cohérentes entre cartes.
- Mise en page : marge de page, gouttière et largeur de contenu, avec valeurs desktop et mobile explicites lorsque nécessaires.

Lier ces mesures aux propriétés prises en charge par Figma : espacements, marges, dimensions, rayons et bordures. Utiliser l'auto-layout pour que les libellés, les textes longs et les éléments optionnels réorganisent le composant. Centraliser l'ombre flottante existante et l'effet de fenêtre de dialogue dans des styles partagés.

## Composants construits et couverture de conception

Le relevé v2 recense les familles ci-dessous. Les nombres désignent les variantes présentes, sans présumer d'un comportement applicatif. Pour les propriétés exactes, consulter `figma-state-v2.json`.

| Entrée du relevé | ID du composant ou ensemble | Variantes consignées |
| --- | --- | --- |
| `Button` | `13:2` | 18 |
| `Nav` | `13:11` | 10 : cinq états × `Direction=LTR/RTL` |
| `Card` | `14:2` | Composant initial |
| `Logo` | `15:2` | Composant |
| `Horizon` | `171:6` | 4 : Desktop/Mobile × Other or unknown/Arab world ; latin 28/34 et 20/28, arabe conditionnel 14/24 |
| `Globe` | `19:8` | Composant |
| `Field` | `50:30` | 28 ; texte, recherche, zone de texte et sélecteur |
| `Checkbox` | `51:60` | 9 |
| `Switch` | `53:75` | 6 |
| `Avatar` | `54:11` | 9 |
| `Badge` | `56:30` | 16 |
| `Tab` | `57:27` | 5 |
| `GeographicScope` | `58:776` | 3 |
| `MenuItem` | `59:73` | 4 |
| `SelectMenu` | `59:801` | Composant |
| `Pagination` | `60:32` | 6 |
| `Alert` | `60:972` | 5 |
| `Dialog` | `61:37` | 3 |
| `StoryCard` | `62:23` | 9 |
| `ContentState` | `63:61` | 4 |
| `LanguageMenu` | `97:143` | 3 : français, anglais, arabe |

La signature du 14 septembre 2026 utilise `Brand/Horizon` dans les 10 emplacements des panneaux de connexion et des accueils de la piste immersive. Depuis la correction V9 demandée par l’utilisateur, les deux pages d’entrée au message crypté sont sans marque, dans toutes les langues. La V8 remplace le critère de campus de V7 par la **localisation de la connexion via l’adresse IP**, selon la correction de l’utilisateur. La ligne arabe est **toujours visible en arabe**, visible en anglais seulement si la connexion est localisée dans le monde arabe, et masquée en français. Dans Figma, la propriété `Connection region` simule cette région : `Other or unknown` par défaut, ou `Arab world`. Aucune IP réelle n’est détectée par la maquette.

Les conteneurs de la variante `Arab world` utilisent `i18n/brand/arabic-line-arab-world` (`VariableID:190:734`, FR=false, EN=true, AR=true). Ceux de `Other or unknown` utilisent `i18n/brand/arabic-line-other-region` (`VariableID:199:2`, FR=false, EN=false, AR=true). La bibliothèque compte **207 variables** et conserve ses **21 familles**. Les 10 instances restantes sont configurées en région simulée `Other or unknown` ; leurs quatre accueils arabes affichent donc la ligne arabe.

Le 42 reste à gauche des noms même en RTL. La proposition « أفق » conserve la propriété `Arabic name#181:0`, le style 42/International/Label et Noto Sans Arabic Medium 14/24, avec mode arabe fixé uniquement sur les textes. Les styles latins 42/H2 et 42/H3, le texte `i18n/brand/name` et la couleur `color/logo` restent partagés ; Jost Medium est provisoire. Sans ligne arabe, les variantes mesurent 127 × 34 et 91 × 28 px ; avec la ligne, 127 × 58 et 91 × 52 px. Huit conteneurs d’alignement centrent les instances des en-têtes d’accueil quand la ligne apparaît ou disparaît. Le choix de traduction n’est pas une décision de marque définitive. Les 12 combinaisons format × région de connexion × langue ont été contrôlées par API et captures. Voir [piste-immersive.md](piste-immersive.md) et `immersive-state.json`, champs `brandV8` (règle de visibilité) et `brandV9` (portée sans marque sur le message crypté).

La planche d'icônes `47:2` contient 23 composants : `search`, `close`, `plus`, `minus`, `check`, `chevron_down`, `chevron_right`, `arrow_left`, `arrow_right`, `info`, `warning`, `user`, `globe`, `eye`, `upload`, `edit`, `heart`, `message`, `sun`, `moon`, `menu`, `lock`, `notification`.

## Extension linguistique de l'accueil convivial

La collection **42 · Langues** (`VariableCollectionId:95:2`) comprend **75 variables** : 63 textes, `i18n/language/current` (`VariableID:95:53`), `i18n/font/family` (`VariableID:95:54`), huit interlignes `i18n/type/…/line` (`VariableID:95:55` à `VariableID:95:62`) et les deux booléens de visibilité du nom arabe (`VariableID:190:734`, `VariableID:199:2`). Les modes sont Français (`95:0`), English (`95:1`) et العربية (`95:2`).

Huit styles **International** — Display, H1, H2, H3, Body, Small, Label et Eyebrow — adaptent la police et les interlignes selon la langue : **Jost** pour le français et l'anglais, **Noto Sans Arabic** pour l'arabe. Les noms natifs Français, English et العربية restent identiques dans le sélecteur. Le nom HORIZON et le symbole 42 sont conservés.

L'accueil convivial compte **12 écrans** : trois langues × ordinateur/mobile × clair/sombre. La version arabe possède une mise en page RTL dédiée ; le globe et les photos ne sont pas inversés. Le simple changement d'un mode de variable ne reproduit donc pas à lui seul toute cette composition RTL.

Le composant réutilisable `LanguageMenu` (`97:143`) et ses menus superposés possèdent **36 liens de langue validés par l'API**. Les destinations conservent le format et le thème de l'écran de départ. Le parcours **français → arabe → thème sombre → anglais** a également été testé par clics réels dans Chrome sur ordinateur : le format desktop et le thème sombre ont été conservés. Sur mobile, le parcours français → arabe → anglais a également réussi par clics réels dans Chrome : largeur de 390 px et thème clair conservés, menu fermé après chaque choix, passage RTL puis LTR vérifié.

Cette extension couvre **l'accueil convivial et le sélecteur réutilisable uniquement**. Les autres accueils exploratoires, le portfolio et les autres maquettes ne sont pas traduits. Les liens des 12 écrans et la procédure de modification sont disponibles dans [modifier-le-style.md](modifier-le-style.md).

Le tableau suivant conserve la couverture prévue à comparer à cette réalisation. Une possibilité décrite ici n'est pas déclarée testée si elle n'a pas été vérifiée explicitement.

Chaque famille doit présenter ses variantes utiles, ses propriétés modifiables et un exemple en clair et en sombre. Le thème est géré par les variables, sans fabriquer deux bibliothèques indépendantes.

| Famille | Variantes et états prévus | Propriétés à exposer |
| --- | --- | --- |
| Bouton | Principal, secondaire, discret ; normal, survol, appuyé, focus, désactivé, chargement | Libellé, icône optionnelle, taille, largeur adaptée au contenu ou au conteneur |
| Navigation | Normal, actif, survol, focus, désactivé ; présentation desktop et mobile | Libellé, icône, état actif |
| Carte de contenu | Projet, personne/parcours, publication ; avec ou sans image ; normale et interactive | Catégorie, titre, description, auteur, image, lien |
| Avatar | Photo, initiales, image absente ; tailles compacte, standard et mise en avant | Image, initiales, taille ; aucun statut de présence supposé |
| Badge | Catégorie, rôle et statut explicite ; fond doux et contour | Libellé, ton, icône optionnelle |
| Champ texte | Vide, rempli, survol, focus, erreur, désactivé, lecture seule | Libellé, valeur d'exemple, indication, aide, erreur, icône optionnelle |
| Recherche | Vide, rempli, focus, désactivé | Libellé, saisie, icône et commande d'effacement |
| Zone de texte | Vide, remplie, focus, erreur, désactivée | Libellé, contenu, aide et hauteur minimale |
| Sélecteur | Fermé, ouvert, sélectionné, focus, erreur, désactivé | Libellé, option sélectionnée, liste d'options et aide |
| Case à cocher | Non cochée, cochée, indéterminée ; focus et désactivée | Libellé, aide, sélection |
| Interrupteur | Activé, désactivé ; focus et indisponible | Libellé et état ; ne pas confondre « désactivé » et « indisponible » |
| Onglets | Normal, sélectionné, survol, focus, indisponible | Libellé, sélection, orientation si nécessaire |
| Fil géographique | Monde, pays, campus ; étape actuelle et étapes précédentes accessibles | Noms du pays et du campus, niveau actuel, retour |
| Alerte | Neutre, information, confirmation, attention, erreur | Titre, message, icône, fermeture et action optionnelles |
| Fenêtre de dialogue | Message simple, confirmation, formulaire court | Titre, contenu, fermeture, actions principale et secondaire |
| Pagination | Première page, page intermédiaire, dernière page ; version compacte | Page actuelle, pages disponibles, précédent/suivant et états indisponibles |

Les éléments imbriqués doivent réutiliser ces mêmes composants : bouton dans une fenêtre de dialogue, avatar dans une carte, badge dans un profil. Les composants servent à dessiner les fonctions futures ; leur présence ne signifie pas que ces fonctions sont développées ou reliées dans le prototype.

## Règles produit à préserver

Le rôle visiteur, étudiant, staff ou admin adapte les contenus et les accès visibles. La sélection Monde → Pays → Campus filtre les contenus sans accorder de droits supplémentaires. Les responsabilités staff/admin restent des hypothèses à préciser.

Les publications reposent sur la confiance et la vérification communautaire, sans validation préalable de l'étudiant. Chaque auteur peut modifier ses propres publications ; modifier les autres éléments du profil nécessite l'autorisation de l'étudiant. Les composants de statut et les exemples de formulaire doivent respecter cette distinction.

## Documentation utilisateur

Le cadre de réglages `46:2`, la palette `46:50` et le fichier [modifier-le-style.md](modifier-le-style.md) documentent les réglages disponibles. Les terrains de jeu `74:2` et `74:280` présentent les composants dans les deux thèmes. La démonstration de propagation et la comparaison des thèmes ont été effectuées.

### Changer une couleur

1. Ouvrir le fichier Figma Design et l'onglet **Variables** dans la navigation gauche. Si cette interface n'est pas encore disponible, désélectionner les calques et ouvrir **Local variables** dans la barre latérale droite. Ces points d'entrée sont décrits par [l'aide Figma sur les variables](https://help.figma.com/hc/en-us/articles/15145852043927-Create-and-manage-variables-and-collections).
2. Choisir la collection de couleurs. Rechercher le rôle souhaité : par exemple `color/accent` pour l'accent partagé, ou le rôle d'action principale pour les boutons uniquement.
3. Modifier son alias ou sa valeur dans la colonne **Clair** ou **Sombre**. Pour remplacer une couleur de palette partout où elle est utilisée, modifier sa primitive ; pour modifier un seul usage, changer le rôle sémantique.
4. Revenir aux maquettes et observer les éléments reliés. Si l'un d'eux ne suit pas, inspecter son remplissage ou sa bordure : une couleur locale ou un remplacement de valeur doit être relié à la bonne variable.

### Tester les thèmes

1. Sélectionner un cadre d'écran ou le cadre de démonstration des composants.
2. Dans **Appearance / Apparence**, utiliser **Apply variable mode / Appliquer un mode de variable**, choisir la collection de couleurs puis **Clair** ou **Sombre**. Les descendants en mode **Auto** héritent du choix du cadre. [Figma — modes de variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)
3. Examiner les textes, icônes, bordures, états de focus, champs et fenêtres de dialogue dans les deux modes. Vérifier également le fondu entre le menu et le globe.
4. Si un élément conserve le mauvais thème, vérifier qu'il hérite du cadre et que sa couleur utilise bien une variable sémantique. Tester aussi un écran desktop et mobile avec des libellés longs.

Le changement de thème dans l'éditeur vérifie les liaisons. Une commande de thème dans un prototype doit être reliée explicitement ; la bibliothèque ne rend pas automatiquement toutes les actions interactives.

## Vérifications effectuées

Les contrôles consignés dans [verification-v2.json](verification-v2.json) ont réussi :

- Les 132 variables du socle graphique sont réparties dans les quatre collections attendues, tous les modes sont renseignés et les noms destinés au code sont uniques. La collection linguistique ajoute séparément 73 variables, portant le total Figma à 205.
- Le nombre de variantes attendu est présent pour les familles contrôlées. Les huit styles Jost sont reliés à leurs variables de famille, graisse, taille et interligne.
- `color/action/primary` a été changé de `violet` à `cerulean`, puis restauré. Le changement a été observé sur le bouton source `11:2`, le bouton de démonstration `74:7`, le bouton imbriqué de la fenêtre de dialogue `I74:172;61:97` et le bouton d'accueil `39:28`.
- `type/Body/size` a été changé de 16 à 17, puis restauré à 16. Les trois textes contrôlés ont suivi le changement. Le rayon de carte a été changé de 20 à 8, puis restauré à 20 sur l'exemple `74:121`.
- Les captures ont été inspectées sur le terrain de jeu clair `74:2` et sombre `74:280`, l'accueil convivial clair `39:10` et sombre `70:151`, puis son mobile clair `70:280` et sombre `70:398`.
- L'extension linguistique est documentée dans `figma-locales-state.json` : 12 écrans, 36 liens de langue valides et correspondance des modes, thèmes et destinations. Les captures arabes desktop et mobile, en clair et sombre, ont été inspectées : menus traduits, titres, cartes et étiquette de photo lisibles.
- Le parcours desktop français → arabe → sombre → anglais a réussi par clics réels dans Chrome, avec conservation du format et du thème. Le parcours mobile français → arabe → anglais a également réussi par clics réels, avec maintien du format, du thème et fermeture du menu après sélection.

La bibliothèque et ces exemples sont vérifiés dans ce périmètre. Cette vérification ne constitue pas un audit exhaustif d'une application : les autres parcours du site, les permissions détaillées et leur développement restent des travaux distincts. Les ressources servent à poursuivre la conception et les prochaines pages peuvent encore évoluer.
