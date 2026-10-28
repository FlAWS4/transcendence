# Capsule de recherche et filtre de lecture — 5 octobre 2026

## Demandes et décisions

Après les trois menus séparés, l’utilisateur souhaite garder la recherche en bas sur mobile sans prendre de largeur au dock. Quatre propositions deviennent des modèles limités aux menus, dans [search-studies](../search-studies/index.html) : languette, deux faces, invitation intégrée et capsule flottante. La capsule flottante est **choisie explicitement** ; il signale ensuite les deux croix visibles après saisie.

Il reconfirme que **tous les essais doivent être conservés**, même les pistes abandonnées. Cette règle générale est désormais inscrite dans AGENTS.md. Les trois études de menu, les quatre études de recherche et les explorations plus anciennes restent consultables ; les sources actives remplacées sont aussi instantanées dans archive/pre-floating-search-20261005 et archive/pre-reading-filter-20261005. Ces instantanés de sources ne sont pas des entrées autonomes.

Il demande enfin de remonter davantage le filtre et de le supprimer des articles et autres vues détaillées. Le filtre est utile pour sélectionner une collection ; le contenu ouvert conserve déjà son campus dans ses métadonnées et son lien de visite.

## Réalisation

- Capsule de texte centrée à 13 px au-dessus du dock, hauteur tactile 44 px, largeur 200 px. Aucun emplacement horizontal réservé. Texte FR/EN/AR ; même palette, verre et effacement au défilement que le menu existant.
- Ouverture : la capsule descend et s’élargit pendant que la navigation cède sa place au champ. Recherche globale, pagination, focus, Échap et adaptation au clavier virtuel existants conservés. La recherche reste lexicale/structurée ; aucune IA ajoutée.
- Une seule croix explicite ferme la recherche. Le bouton natif d’effacement de input[type=search] est masqué dans les navigateurs WebKit/Blink, dans le site et les modèles.
- La navigation garde les noms à côté des icônes. Sous 440 px de largeur intérieure, seul le nom actif reste visible ; les autres boutons gardent leurs noms accessibles. Pas d’étape avec les textes sous les icônes. La hauteur existante et les couleurs sont conservées.
- Les commandes du globe, sa note et le bas des articles laissent l’espace nécessaire à la capsule. Petit portrait de hauteur ≤520 px : commandes verticales déplacées au-dessus, sans toucher au paysage large.
- Filtre : y106 px sur ordinateur et y83 px en mobile courant, soit 12 px de plus que la correction précédente ; y65 px en mobile bas. Les formats très courts préservent leur séparation avec l’en-tête (y62 px pour le petit paysage). Position partagée entre Explorer et listes.
- Les vues détaillées portent data-reading=true. Le filtre devient invisible, inert et aria-hidden ; son globe miniature est également invisible. L’ancre reste mesurable pour le retour. La règle du globe ne concerne que #main > .globe-stage : une carte déplacée dans la fenêtre campus garde son rendu. L’espace libéré remonte le contenu de lecture. Retour à la liste/Explorer : filtre et globe de contexte rétablis.

## Vérifications

37 tests passent : recherche, index/données et transitions de contenu. Relecture indépendante de la cascade, de la géométrie du dock compact et des routes de lecture.

Chrome :
- Capsule et ouverture examinées sur ordinateur ; saisie Paris → trois résultats, une seule croix visible, fermeture fonctionnelle.
- Mobile 390 × 844 : dock compact, passage Projets, clair/sombre, recherche Paris, croix unique et Échap.
- Arabe sombre 320 × 480 : libellé et ordre RTL, recherche ouverte ; aucun chevauchement capsule/commandes et largeur de document 320 px. Écart vertical mesuré de 13 px entre commandes et capsule.
- Filtre à y106 px dans Explorer/Projets sur ordinateur ; article Minishell : filtre/globe cachés, focus au titre, contenu remonté ; retour par « Retour à la liste » : filtre visible à y106.
- Mobile 390 × 844 : filtre à y83 px dans Projets puis Explorer.
- Modèle de capsule : saisie Paris, croix unique examinée, fermeture par Échap. Le format temporaire du navigateur est réinitialisé.

Le serveur local arrêté pendant le contrôle a été relancé à la même adresse 127.0.0.1:8765. Aucun contrôle sur téléphone physique/clavier virtuel, aucun nouveau parcours de la fenêtre campus, aucun report Figma de ces dernières modifications. Pas de nouvelle approbation esthétique globale déduite.

Versions courantes : welcome.mjs **reading-filter-52**, dock-search.mjs **floating-search-11**, aperçu **20**, floating-search.css **2**, globe-framing.css **reading-filter-6**. Les CSS de dock antérieurs restent en dépendance ; dock-navigation.css **globe-seat-3** conserve le cercle ajouré.


## Suite du 5 octobre — verre dépoli et mouvement compact

L’utilisateur demande des exemples de verre transparent, puis choisit explicitement **le verre dépoli** parmi les [quatre matières conservées](../glass-studies/index.html). Il signale aussi le saut des icônes du dock compact, la différence clair/sombre des commandes de zoom, et demande le même effet pour la barre de saisie et les résultats de recherche.

### Mouvement du dock

La largeur du bouton changeait immédiatement alors que le libellé s’ouvrait progressivement : son icône, centrée dans le bouton, sautait avant de se replacer. Les quatre boutons gardent maintenant la même base de 48 px, 44 px en très faible largeur ; seule leur part de l’espace libre est animée sur 350 ms. Le libellé utilise la même durée et la même courbe, avec sa largeur intrinsèque lorsque le navigateur le permet, et le repli par largeur maximale ailleurs. Les marges logiques conservent le RTL. La pastille reçoit sa destination compacte directement en CSS, sans garder une mesure intermédiaire du contrôleur.

Chrome 390 × 844 : une étape intermédiaire Projets → Parcours est mesurée avec les deux boutons à 138,18 / 104,48 px, parts d’espace 0,615 / 0,385, libellés à 23,75 / 19 px. Cela confirme une interpolation réelle. Les positions finales de la pastille et du bouton actif concordent à moins de 0,02 px. Les sélections successives Journal → Parcours sont également contrôlées en arabe sombre à 320 × 640. La préférence de mouvement réduit reste couverte par les règles existantes ; pas de nouvelle émulation forcée ni contrôle sur téléphone physique.

La capacité d’animation des tailles intrinsèques est documentée par [Chrome for Developers](https://developer.chrome.com/docs/css-ui/animate-to-height-auto) et protégée par @supports ; le repli ne dépend pas de cette capacité.

### Matériau retenu

Fond blanc en clair / graphite en sombre, **32 % dans les deux thèmes**, flou **26 px**, saturation 1,15. Le menu, la capsule flottante, les commandes du globe et la recherche partagent ce matériau. Bords et reflets neutres issus de l’étude ; sélection toujours turquoise en clair et rose en sombre, désormais translucide. Aucun nouvel agencement ni nouvelle palette. Les formes et les cibles tactiles restent inchangées.

Chrome mobile clair/sombre : fond, flou, contour, ombre et dimensions du menu, de la capsule et du zoom mesurés ; les trois surfaces partagent exactement la même recette dans chaque thème. Un défilement réel a montré menu/capsule à l’opacité intermédiaire commune de 0,4808 puis leur retour à 1, avec parent à 1 ; navigation après défilement sans nouveau signal de scroll. La dernière demande sur les résultats donne lieu au contrôle complémentaire ci-dessous.

37 tests de recherche, données et transitions passent (exécution Node sans isolation pour obtenir le détail du rapport dans cet environnement). Ces tests vérifient les interactions et les données, pas l’apparence du verre. Le comparatif possède son [relevé séparé](../glass-studies/NOTES.md).

Archives préservées : archive/pre-dock-motion-20261005 et archive/pre-frosted-glass-20261005. Tous les anciens menus, recherches et autres essais restent disponibles. Aucun report Figma de cette suite.


### Recherche complète et vérification finale

À sa demande supplémentaire, le panneau des résultats et la barre de saisie reçoivent aussi exactement le dépoli retenu. Le fond du menu passe dans un pseudo-élément : le conteneur de navigation reste transparent, sans filtre et à l’opacité 1, afin que son panneau enfant puisse flouter la page réelle. L’effacement au défilement porte sur ce fond, les boutons, la pastille et la capsule au même rythme ; les surfaces de recherche ouvertes restent protégées. Aucune modification du moteur de recherche.

Chrome, version finale **frosted-glass-19** : recherche Paris ouverte sur 390 × 844 en clair puis sombre, trois résultats, une seule croix, texte lisible ; la barre et le panneau affichent tous deux 32 % et blur(26px) saturate(1.15). Le conteneur parent est bien sans filtre et à l’opacité 1. Recherche fermée, un défilement réel donne simultanément **0,641655** sur fond, quatre boutons, pastille et capsule, avec les deux parents à 1. Recherche réouverte sur ordinateur : panneau de 678,67 px pour une coque de 680 px, trois résultats, absence de débordement et flou visible derrière le panneau. Format temporaire réinitialisé.

Versions finales des deux entrées : dock-search.css **frosted-glass-19**, floating-search.css **dock-motion-4** ; contrôleurs inchangés. L’état avant dépoli des résultats est aussi conservé dans archive/pre-glass-search-20261005. Pas de nouveau parcours campus, de clavier virtuel, de téléphone physique ou de report Figma. La recette choisie est intégrée ; aucune acceptation finale de tous les réglages n’est déduite.


## Suite : capsule devenue panneau et contraste renforcé

L’utilisateur remplace le mouvement descendant par une expansion en panneau de résultats, puis demande scrollbar personnalisée, style du menu sur filtre/langues, correction du contraste et filtre plus haut. Réalisation, nouvelles versions, preuves et limites dans [CAPSULE_PANEL_NOTES.md](CAPSULE_PANEL_NOTES.md). Le voile actif passe à82% ; le comparatif32% et tous les essais restent conservés.
