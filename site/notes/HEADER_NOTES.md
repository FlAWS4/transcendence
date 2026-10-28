# En-tête conservé pendant le défilement

## 5 octobre 2026 — première étape, en-tête adhérent

Demande : garder le logo, la langue, le thème et le compte visibles lorsque les pages de contenu défilent.

La feuille `sticky-header.css?v=1` rend uniquement l’en-tête direct de l’application en dock adhérent au haut du viewport (`position: sticky; top: 0`). Sa hauteur reste réservée dans le flux : aucun espace de remplacement ni calcul JavaScript, et aucune modification des coordonnées initiales des titres, du filtre ou du globe. Les marges responsives existantes sont conservées.

Le centre transparent de l’en-tête continue de laisser passer les clics ; seuls la marque et les commandes latérales les capturent. La couche existante (z-index 10), les surfaces en verre, les couleurs, les règles FR/EN/AR et la visibilité pendant l’introduction restent inchangées. Aucun backdrop n’est ajouté au parent de la liste des langues. Les fenêtres modales continuent d’utiliser leur couche supérieure.

La feuille est chargée dans `index.html` et `content-preview.html`, après les styles du verre. Les deux entrées HTML antérieures sont conservées dans `archives/site-versions/pre-sticky-header-20261005/`. Les études séparées sont intactes. Pour retirer cette seule proposition, retirer son lien CSS dans les deux entrées ; ne pas restaurer aveuglément un ancien HTML qui pourrait contenir des versions de modules dépassées.

## Vérifications locales

- Inspection de toutes les feuilles chargées : l’en-tête hérite toujours de son z-index et de ses marges existants ; aucune règle ultérieure ne rétablit `position: relative`.
- Les pages de contenu ont une application de hauteur automatique et `overflow: clip`, qui ne crée pas de conteneur de défilement intermédiaire. Explorer et l’introduction restent dans un écran sans défilement.
- Les deux liens CSS sont présents une seule fois. Le contrôle comparé aux archives ne trouve que cet ajout : versions des scripts et reste du HTML inchangés au moment de la vérification.
- Aucun changement aux hauteurs du filtre : 84 px sur ordinateur, 72 px sur mobile courant, adaptations basses 65/62 px et masquage dans les détails conservés.

## Vérification visuelle à compléter

Le rendu n’a pas été rejoué par l’agent chargé de cette feuille. Le contrôle navigateur central doit examiner : scroll d’un index puis d’un article, logo et commandes visibles, liste de langues accessible pendant le scroll, filtre cliquable en haut, retour Explorer, entrée principale et fenêtre campus au-dessus de l’en-tête. Vérifier également mobile et arabe RTL. Aucun contrôle de téléphone physique ni nouveau report Figma n’est revendiqué.


## 5 octobre 2026 — filtre fixe et disparition progressive des contenus

Précision explicite : le filtre fait partie de l’en-tête et doit rester immobile ; le contenu doit disparaître progressivement derrière cet ensemble. La feuille passe en `sticky-header.css?v=2`.

Le filtre devient fixe sans changer ses coordonnées responsives : 84 px sur ordinateur, 72 px sur mobile courant, 65/62 px dans les formats mobiles bas, 72 px sur ordinateur très bas. Le masquage dans les détails reste actif. La scène empruntée par le médaillon devient également fixe dans `#main`, avec les mêmes 100vw/100svh et le même cadrage. Le contrôleur `dock-navigation.mjs?v=fixed-header-3` calcule alors sa destination dans les coordonnées du viewport ; un redimensionnement ou changement de langue après défilement ne réintroduit plus la distance déjà parcourue dans le document. La branche des anciens positionnements absolus est conservée. Le portail campus ne correspond pas au sélecteur CSS et reste ignoré par la synchronisation tant que la carte est hors de l’application.

Un voile dégradé fixe reprend exactement la couleur de fond du thème. Sur les listes, il couvre entièrement la zone des commandes et du filtre, puis s’efface jusqu’à 188 px sur ordinateur et 154 px sur mobile courant, avec adaptations aux écrans bas. Sur les articles, il est raccourci à la hauteur de l’en-tête puisque le filtre est absent. Le contenu initial reste sous la fin du fondu ; aucun espace supplémentaire n’est ajouté. Le fondu est spatial et continu, sans temporisation liée aux petites pauses du défilement. Il est absent dans Explorer et pendant l’introduction, et accompagne la sortie temporaire des contenus.

Les couches restent constantes dans les deux sens : contenu5, voile6, globe7, filtre8, en-tête10. Le globe reste donc derrière le filtre et visible dans son cercle ajouré, au-dessus des lignes qui défilent. Les commandes d’Explorer (zoom, état de chargement et lien de prototype) sont aussi placées au-dessus de la carte pour préserver leurs clics. Le voile et le centre de l’en-tête ne capturent aucune interaction. Les popovers et fenêtres supérieures conservent leur fonctionnement et aucun flou n’est ajouté à un parent des listes de langue.

L’état antérieur est conservé dans `archives/site-versions/pre-header-filter-fade-20261005/` : CSS, contrôleur de raccord, contrôleur principal et deux entrées HTML avant modification. Les autres essais sont intacts.

### Vérifications et limites de cette suite

- Syntaxe du module de raccord contrôlée avec Node.
- Cinq contrôles comportementaux ciblés passent : ancre fixe initiale ; mêmes translations après840px de défilement ; nouvelle position de filtre après défilement ; ancien placement absolu ; absence de mutations lorsque la carte est dans le portail campus. Contrôles mathématiques du contrôleur, pas simulation d’un rendu WebGL.
- Inspection des sélecteurs : dimensions de la carte inchangées, portail exclu, masque du cercle conservé, règles de lecture non surchargées, aucune capture de clics par le voile.
- La première étape de l’en-tête a été mesurée par le contrôle navigateur central à y0 après840px de scroll. La présente suite demande encore son contrôle visuel central : fondu, miniature au scroll et après changement de langue/redimensionnement, retour Explorer, commandes de zoom, puis mobile/RTL et fenêtre campus. Aucun contrôle sur téléphone physique ni report Figma.


### Vérification navigateur centrale — 5 octobre

Dans Chrome, l’en-tête reste à y=0 après 840px de défilement d’un article. Avec le filtre fixe et le fondu final, la grille Projets défilée de693px garde le filtre à84px sur ordinateur ; la liste mobile défilée de720px le garde à72px. Le médaillon reste centré dans son ancre (translations inchangées au scroll). Le filtre s’ouvre après défilement, et sa sélection reste fonctionnelle. Les rendus clair et sombre sont examinés, ainsi que le changement FR→AR et le retour aux dimensions ordinaires.

En320×640, lecture d’un article défilé de542px : en-tête à0, filtre toujours masqué, fondu raccourci à78px. Carte Lyon depuis cet article → fiche → fermeture fiche → fermeture carte → Explorer rejoués ; portail et retour conservent le canvas unique. Le fondu est visible spatialement derrière les commandes, sans clignotement dépendant de pauses. Pas de téléphone physique, de mesureFPS ni de nouveau reportFigma.


## 6 octobre 2026 — contexte géographique figé pendant la lecture

L’utilisateur remplace la règle de masquage des articles : le filtre doit remonter dans l’en-tête et y rester, sans être manipulable. Les reflets et les proportions du menu restent tels quels, à sa demande.

Le filtre et le globe miniature restent visibles. Sur ordinateur, le contexte monte à 40 px (32 px entre 701 et 1050 px), dans la rangée du logo et des commandes. Sur mobile, il se compacte à 37–39 px de hauteur, immédiatement sous les commandes : y68 sur 390×844, y62 sur 320×640, y54 sur écran bas. Les ancêtres et les chevrons sont retirés visuellement dans les petits formats ; le résumé accessible conserve le chemin complet. Le périmètre de la liste est conservé : ouvrir un article n’impose pas son campus au filtre.

Les commandes du chemin et la flèche de retour deviennent inert pendant la lecture, avec un résumé textuel distinct disponible aux technologies d’assistance. Les gardes des actions bloquent aussi l’ouverture du sélecteur et les changements de géographie. Le chargement asynchrone du globe ne peut pas réactiver ce sous-groupe inert. Le retour à une rubrique rétablit les interactions et la position habituelle. Le focus ne revient plus dans un filtre verrouillé.

La remontée et son retour utilisent une translation de 700 ms, avec la courbe existante. Le contrôleur de globe reçoit la géométrie finale de l’ancre, corrigée de la translation animée : il ne poursuit pas les positions intermédiaires. Une interruption repart de la position affichée ; redimensionnement et mouvement réduit suppriment le décalage temporaire. Les couches restent globe7, filtre8, header10. Le fondu et l’espace de lecture mobiles couvrent le contexte supplémentaire.

### Vérifications

- 11 tests ciblés passent pour inert/résumé, retour, géométrie pendant le mouvement, inversion, ancienne promesse terminée tardivement, resize et mouvements réduits. Il s’agit de tests du contrôleur, pas de lecture d’écran réelle.
- Chrome ordinateur : article Lyon avec chemin Monde/France/42 Lyon visible à y40, puis retour liste interactif ; miniature conservée dans son cercle.
- Chrome 390×844 : contexte compact à y68 ; après 711 px de défilement il reste à y68, header à y0. La touche Tab depuis la recherche va directement à Retour à la liste, en sautant les commandes géographiques verrouillées.
- Chrome 320×640 arabe sombre : contexte à y62, commandes d’en-tête terminées à y62, aucun débordement horizontal ; résumé traduit et rendu examinés.
- L’ensemble des contrôles de lecture, préférences, recherche et transitions compte 59 tests passés à ce stade. Pas de téléphone physique, de nouveau lecteur d’écran ni de report Figma.

Les sources antérieures sont conservées dans [pre-reading-context-20261006](../../archives/site-versions/pre-reading-context-20261006/). Les notes du 5 octobre ci-dessus décrivent les étapes précédentes ; le masquage des articles est remplacé par cette décision.


## Précisions finales du 6 octobre — marge et bascule commune avec le dock

L’utilisateur trouve le filtre de lecture trop proche du bouton de langue. L’écart était réellement nul : filtre et bas du bouton à68px sur390×844. Il demande aussi de garder Pays › Campus jusqu’à la transformation effective du menu en dock compact, dans les listes **et** les fiches. Cette précision **remplace le seuil de viewport1050px** appliqué plus haut.

Le filtre lit maintenant le mode fixé par la propre règle de conteneur du menu (`@container(max-width:440px)`, largeur intérieure du menu). Le contrôleur synchronise `data-compact-scope` au redimensionnement ; il ne possède pas de seuil de viewport concurrent. La mise à jour conserve le raccord du petit globe et déplace le focus hors d’un ancêtre masqué si nécessaire.

En lecture mobile, filtre, espace du contenu et fondu descendent de16px. Positions finales : **84px** en mobile courant, **80px** en petit mobile haut, **78px** si hauteur≤720px, **70px** si hauteur≤520px. Les listes et Explorer gardent leurs hauteurs précédentes.

Contrôles Chrome supplémentaires :
- **500×844** : menu complet et France ›42 Paris, dans la fiche puis dans la liste.
- **480×844** : menu compact et42 Paris seul, dans les deux vues.
- **320×640** : filtre78px, bas langue62px, écart16px ; rendu examiné.
- **390×844** : filtre84px, bas langue68px, écart16px.
- **667×390** : filtre70px, bas langue54px, écart16px ; chemin complet car menu non compact, aucun débordement horizontal.
- Format temporaire retiré et page principale laissée en français clair, contrôleur71.

Versions finales : `welcome.mjs?v=contextual-discovery-71`, aperçu39, cadrage `compact-scope-11`, en-tête4. Tirage2 et CSSdé2 inchangés. Sources de cette correction conservées dans `archives/site-versions/pre-reading-scope-spacing-20261006/`. Syntaxe du contrôleur recontrôlée ; les122 tests décrits plus haut précèdent ces derniers ajustements de raccord et CSS, vérifiés dans le navigateur. Pas de nouveau report Figma ni de téléphone physique.


## Alignement mobile commun — 6 octobre 2026

L’utilisateur demande que la pilule géographique soit, en format mobile, à la même hauteur dans les rubriques que dans une fiche de profil. Les positions de lecture deviennent donc communes à Explorer, Projets, Profils, Journal et leurs fiches :84px en mobile courant,80px en petit mobile haut,78px en mobile court et70px en paysage bas. Une seule variable `--mobile-scope-top` pilote les deux états. Les hauteurs propres aux commandes interactives et au contexte de lecture restent conservées ; c’est le bord supérieur de la pilule qui s’aligne.

Le fondu des listes suit ce déplacement :130/166,126/162,124/159 et116/140px selon les quatre formats. Leurs contenus disposaient déjà de suffisamment d’espace ; aucune modification de padding ni du placement sur ordinateur. La réduction du pays suit toujours le mode compact réel du dock et les fiches restent non manipulables.

Contrôles Chrome :390×844 → bord supérieur84px dans la fiche et les quatre rubriques ;320×640 →78px dans Explorer, la liste Profils et une fiche ;320×844 →80px dans liste/fiche ;667×390 →70px dans liste/fiche, sans débordement horizontal. Rendu de la liste Projets et de la fiche examiné. Format temporaire retiré, aperçu principal actualisé. Contrôle CSS et navigateur uniquement pour cette correction, pas de nouveau test unitaire ni de téléphone physique/Figma.

Versions : cadrage `shared-mobile-scope-12`, en-tête5 ; contrôleur71 et autres versions inchangés. Sources remplacées conservées dans `archives/site-versions/pre-mobile-scope-alignment-20261006/`.


## Compte en pilule, langue et thème sans fond — 6 octobre

Matière de la langue transférée au compte, maintenue sur mobile ; langue/thème transparents même au survol et menu ouvert, focus conservé. Entrée, deux thèmes, compte et langues contrôlés dans Chrome ; sources archivées. Voir [réalisation et limites](RESPONSIVE_CONTENT_NOTES.md).
