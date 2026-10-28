# Capsule, contrôles et lisibilité — 5 octobre 2026

## Demandes explicites

La capsule « Chercher dans Horizon » doit former le panneau des résultats au lieu de descendre vers le champ. L’utilisateur demande également une barre de défilement personnalisée, le style du menu sur le filtre et les langues, une solution au contraste sur les fonds colorés, et une remontée plus visible du filtre. Les fiches campus font l’objet de propositions seulement, consignées séparément dans [CAMPUS_CARD_IDEAS.md](CAMPUS_CARD_IDEAS.md).

## Réalisation

- La capsule constitue désormais l’unique surface de verre du panneau des résultats. Son bord inférieur reste ancré ; elle s’élargit et grandit vers le haut sur 480 ms. Son libellé s’efface puis les contenus apparaissent sans étirement. Le dock devient le champ de saisie en place. Le mouvement inverse replie le panneau en capsule.
- Le panneau conserve sa hauteur naturelle, son plafond de hauteur et son défilement. Un ResizeObserver suit aussi le panneau ; les dimensions alimentent la surface décorative sans modifier la taille du contenu mesuré. La saisie et la pagination n’exécutent pas une nouvelle animation d’ouverture. Les focus, états inert/aria et annulations de recherche existants sont conservés.
- Le filtre, son retour, la langue et leurs listes ouvertes partagent le matériau. Le cercle ajouré de 32 px reste masqué radialement, sans flou sur le parent du globe. Aucun changement de langue, de filtres ni de données.
- Pour résoudre le contraste, le voile neutre est renforcé à **82 %** dans les deux thèmes, avec flou 26 px et reflets conservés. Les textes secondaires et les icônes accentuées des seules surfaces de verre sont renforcés dans la palette existante. Le comparatif historique conserve le dépoli à 32 %. Calculs sRGB sur fonds uniformes extrêmes, sélection comprise : principaux ≥10,07/7,35 et secondaires ≥4,90/4,79 en clair/sombre ; ce n’est pas un audit complet de tous les états ou des animations.
- Barre de défilement : rail transparent de 10 px, poignée visible de 6 px arrondie, accents Horizon au survol, défilements de page et internes. Firefox reçoit la variante standard fine ; plateformes tactiles seules et couleurs forcées conservent leur rendu natif. Aucune réservation de gouttière ni changement d’overflow.
- Filtre : **106 → 84 px** sur ordinateur ; **83 → 72 px** sur mobile courant, avec 4 px sous les commandes de l’en-tête. Les formats contraints restent à 65/62 px mobile et 72 px ordinateur bas. Les règles sont communes à Explorer et aux listes ; articles toujours masqués. L’en-tête transparent couvrait le nouveau filtre : ses zones vides laissent maintenant passer les clics, ses enfants visibles restant interactifs.

## Vérifications

37 tests recherche/données/transitions passent ; syntaxe du contrôleur contrôlée. Chrome ordinateur et 390 × 844, puis arabe sombre 320 × 640 :

- Ouverture intermédiaire mesurée : surface 277,45 ×59,51 px, puis finale Paris 678,67 ×263,11 ; même bord inférieur à886 px. Fermeture intermédiaire :438,42 ×172,03, bord inférieur toujours886. Aucun translateY de la capsule.
- Panneau et surface finale ont les mêmes rectangles. Paris donne trois résultats. Séquence clavier ouverture → Échap → réouverture fonctionnelle, focus dans le champ. Une seule croix.
- Recherche42 en arabe : panneau440px, contenu639px, surface exactement adaptée ; défilement interne et aucun débordement horizontal. Pas de test du clavier virtuel réel.
- Matériau82% et blur26px mesurés. Surfaces et contenus clairs/sombres examinés ; panneau transparent sur sa surface unique, pas de double couche. Scrollbars visibles sur la page et les résultats RTL.
- Langues claires ouvertes et sélection arabe ; filtre ouvert clair/sombre sur mobile après correction de l’interception par l’en-tête. Masque radial conservé.
- Filtre mesuré à84px sur ordinateur et72px en390×844 ; arabe320×640 :65px, commandes d’en-tête finissant à62. Explorer et Projets conservent65px ; article : visibility:hidden. La taille temporaire du navigateur est réinitialisée.
- L’onglet principal chargeait encore floating-search.css?v=2. Il a été actualisé puis ouvert en visiteur : nouveaux fichiers chargés, filtre à84px.

Pas de téléphone physique, nouveau parcours campus, simulation forcée des mouvements réduits/couleurs forcées ou report Figma. Les styles conservent les replis correspondants ; aucune publication.

## Fichiers et conservation

Versions : welcome.mjs **capsule-panel-53**, dock-search.mjs **capsule-panel-12**, aperçu **21**, floating-search.css **capsule-panel-5**, globe-framing.css **raised-filter-8** ; nouveaux control-glass.css, scrollbars.css et readable-glass.css **1**. dock-search.css **frosted-glass-19** reste la base.

Archives : archive/pre-capsule-panel-20261005 et archive/pre-raised-filter-20261005, avec les études antérieures toujours accessibles. Aucun essai supprimé ni fiche campus modifiée.

## Dernière précision — champ sans cerclage intérieur

L’utilisateur n’aime pas le contour qui entoure la zone d’écriture. Le contour intérieur est retiré ; seul le bord extérieur existant reçoit une teinte discrète au focus. Version finale floating-search.css **capsule-panel-6**, état précédent conservé dans archive/pre-search-field-focus-20261005. Chrome ordinateur : recherche Paris sur l’illustration sombre de Minishell, absence d’outline et de box-shadow sur le champ vérifiée et rendu examiné ; focus et croix conservés. Aucun contrôleur modifié pour cette précision.
