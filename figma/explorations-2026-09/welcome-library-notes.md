# Extension bibliothèque accueil — 27 septembre 2026

Report autorisé du site vers Figma. Cette extension n’est pas une refonte du site ni une acceptation esthétique de l’utilisateur.

## Sources et découverte

Source : `site/`, CSS `nav-filter-16`, mesures DOM fournies par l’agent principal. Ajout en cours de tâche du bouton de campus aléatoire, repris depuis le SVG `i-dice` du site, à droite de Zoomer.

L’audit live a confirmé les collections Couleurs (Clair `3:1`, Sombre `3:2`) et Langues (FR `95:0`, EN `95:1`, AR `95:2`). Aucun Code Connect local. Les composants NavigationItem/GeographicScope historiques ont une composition différente ; ils sont conservés. Brand/42 et Brand/Horizon restent réutilisables sans modification. Les recherches de bibliothèque ont trouvé Navigation Pill/IconButton de Simple Design System et Material, mais leur système de tokens et leur composition ne correspondent pas à la source Horizon. Aucun import de kit externe.

Les anciennes icônes au trait 2 px diffèrent des SVG web à 1,6 px ; quinze SVG exacts du site sont importés sous `Welcome/Icon/*` pour ne pas changer les archives. Un fond technique invisible d’import a été rendu visible par le premier traitement de teinte ; la revue de composition l’a détecté et les conteneurs ont été corrigés. La capture suivante est la vérification retenue.

## Réalisation

Sur la page `5:3`, zone de composants `264:823` à partir de x2940 ; aucun écran de la page115:2 n’a été modifié par cette sous-tâche.

- 83 variables ajoutées lors de la construction, puis deux rôles de finition : **85 variables pour cette extension accueil**, hors extension des listes de langues. Primitives et sémantiques propres à l’accueil, mesures manquantes, chaînes de texte, couleurs des boutons d’entrée ; anciennes valeurs conservées. Les nouveaux rôles couleur sont aliassés aux primitives, avec scopes explicites. Les syntaxes de code reprennent les variables CSS disponibles ou le rôle de la règle CSS/JS lorsque la source utilise une valeur littérale ou une expression.
- 9 styles de texte `42/Welcome/*`, liés à la variable de famille internationale, et 3 effets de surface/navigation. Jost Regular/Medium et Noto Sans Arabic Regular/Medium disponibles et chargés.
- `Welcome/NavigationItem` : 8 variantes Desktop/Mobile × LTR/RTL × Default/Active, propriétés Label et Icon.
- `Welcome/Navigation` : 16 variantes Desktop/Mobile × LTR/RTL × explore/projects/people/journal ; libellés liés aux langues. Noms enfants stables `nav/explore`, `nav/projects`, `nav/people`, `nav/journal` pour les réactions d’écran.
- `Welcome/Scope` : 4 variantes format/direction ; texte lié à Monde/World/العالم. Le chemin complet est assemblé au niveau écran lorsque nécessaire.
- `Welcome/IconButton` : 40 et 44 px, propriété Icon. `Welcome/MapControls` : 4 commandes, dimensions finales 174×48 ordinateur et 218×52 mobile. Enfants : `zoom-out`, `reset`, `zoom-in`, `random-campus`.
- `Welcome/WorldGeo` : variantes 538,451² ordinateur et 341,384² mobile. SVG vectoriels dérivés par l’agent géographique des données et caméras du site. Import découpé à cause de la limite outil de 50 000 caractères, sans simplification supplémentaire. Couleurs océans/terres/frontières liées aux nouveaux rôles.

Les valeurs sont dans [welcome-library-state.json](welcome-library-state.json). Les scripts enregistrent les transactions déjà réalisées ; ne pas les relancer sans lire le ledger et les nœuds actuels. Le fractionnement des SVG est enregistré dans `welcome-assets/world-chunks.json`.

## Finitions appliquées

Le [résultat des finitions](welcome-polish-result.json) confirme **48 réactions** de sélection : chaque variante mène aux trois autres rubriques de même format et même direction. Les 16 onglets déjà sélectionnés restent sans action. L’indicateur partagé se déplace avec Smart Animate de 0,48 s, courbe `(0,22 ; 1 ; 0,36 ; 1)` ; toutes les destinations sont valides. Ces réactions changent la sélection, sans créer de pages de contenu.

`color/welcome/random-icon` (`VariableID:295:756`) lie tous les tracés du dé au turquoise `#008E90` en clair et au rose `#ED3491` en sombre. `type/welcome/scope-style` (`VariableID:295:757`) relie les deux styles de filtre et les quatre libellés à Medium en clair, Regular en sombre. Les primitives historiques restent inchangées.

Les listes de langues forment une extension séparée : composant `287:776`, deux variantes LTR/RTL, 26 variables, deux styles de texte et un effet. Leur [ledger](language-menu-state.json) contient les dix instances ancrées, leurs actions et leurs contrôles ; ces nombres ne sont pas inclus dans les 85 variables Welcome ci-dessus.

## Vérification et limites

Composition de contrôle `276:327` examinée en clair FR et sombre AR : carte mobile, filtre, quatre commandes et barre basse. Polices vérifiées explicitement, aucune famille inattendue dans les dix textes de cette composition. Tous les tracés restent éditables et les couleurs réagissent au thème.

Les huit accueils ont été assemblés et contrôlés dans le travail principal. Un parcours navigateur Figma confirme accueil FR clair → liste ancrée → AR → thème sombre → sélection Projets ; le déplacement de l’indicateur est visible. Après le parcours connecté mobile FR clair, la sélection turquoise de Projets a aussi été jouée dans la barre basse. L’audit des 16 variantes ne relève aucune erreur de police. Le globe vectoriel reste une représentation figée de la caméra ; il ne simule pas la manipulation WebGL ni le préchargement. Aucune publication ni acceptation utilisateur n’est déduite de cette validation.
