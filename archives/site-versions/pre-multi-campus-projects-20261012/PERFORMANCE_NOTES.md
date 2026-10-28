# Performances et stabilité du globe continu

Relevé du **27 septembre 2026**. L’utilisateur signale des problèmes d’optimisation visibles, un globe qui descend pendant le dézoom et des scintillements pendant la manipulation. Cette note concerne le moteur actif de [l’accueil](index.html), avec une seule scène MapLibre du monde au quartier. Les 58 campus, le zoom continu, la charte et la composition mobile sont conservés.

**Résultat de la première passe d’optimisation :** la rotation produit environ **25 % de mutations DOM en moins par événement de rendu MapLibre** dans le parcours comparé. La cadence rAF médiane et son p95 restent identiques : **aucun gain de FPS n’est démontré**. Ces mesures, conservées plus bas, précèdent la navigation bornée et le fond Monde local ajoutés ensuite. Elles ne constituent pas une nouvelle comparaison de cette dernière version, ni une validation de fluidité à 60 FPS ou une acceptation finale du prototype.

## État actif v27 : départ immédiat et préparation progressive

**Décision explicite du 27 septembre : « Zoom immédiat, préparation progressive ».** Le maintien des 3 km en données brutes reste demandé ; la préparation graphique intégrale avant le départ est abandonnée. Les étapes v17/v21, leurs attentes, leurs copies 2D et leurs mesures ci-dessous restent historiques. Le fond précis Monde/Pays préparé derrière l’entrée, les trois niveaux bornés et le candidat aléatoire unique restent actifs.

### Séquencement actif et disponibilité des détails

Le clic démarre le vol sans attendre une promesse de préchargement ou de préparation GPU. Le rayon brut charge en parallèle, avec priorité aux demandes visibles du moteur. La caméra rejoint 14,5 / 0°, puis enchaîne directement **2 200 ms** jusqu’à 17,8 / 34°. Aucun `run()` du préparateur de quartier, aucune taille CSS temporaire et aucun canvas 2D de couverture ne font partie du chemin actif. Le module historique est conservé mais n’est plus importé.

Le gate vérifie un rendu frais, la portée Campus et la disponibilité de la source urbaine courante. En mode progressif, il autorise le mouvement et n’attend pas `areTilesLoaded()` pour toutes les sources ni la complétude des PBF du rayon. Une erreur pertinente reste bloquante pour la révélation. Durant l’approche effective, une vue prête tôt utilise la rampe nominale **14,5 → 16,2** ; si elle est prête plus tard, la rampe commence au zoom courant et dispose d’au moins 1,2 niveau, dans la limite de 17,8. À partir de 16,6, ou hors d’un vrai segment d’approche, la première vue prête apparaît par fondu natif de **450 ms**. Ainsi un pan à zoom fixe ne peut pas rester bloqué à l’opacité zéro par une rampe qui n’avancerait jamais. Les mouvements réduits suppriment les durées.

Les expressions de peinture restent composées avec les opacités du thème et du zoom, sans setter à chaque frame. Si les tuiles arrivent après la caméra, la vue locale peut rester affichée puis laisser apparaître le détail ; le moteur ne rejoue ni déplacement ni attente GPU du quartier. Ce compromis est celui choisi explicitement par l’utilisateur, pas une promesse de détail instantané sur tout réseau.

### Conservation du cache et clics répétés

L’audit du bundle **MapLibre 5.24.0** identifie un coût concret : modifier `layout.visibility` passe par la mise à jour/recharge de la source et vide son cache décodé hors champ. Les opacités constantes et expressions dépendant seulement du zoom utilisées ici ne déclenchent pas cette remise en page. Après l’activation initiale, le moteur conserve donc le layout des couches distantes et applique une peinture transparente ; les couches mondiales restent installées sans bascule de visibilité. La source urbaine native **z14** ne nécessite pas de pyramide distante aux échelles Monde/Pays.

Trois tests causaux utilisent le vrai `Style` / `TileManager` / cache du bundle local, avec source réseau simulée : une bascule de visibilité retire effectivement les tuiles témoins, alors que les cycles de masquage par opacité, rampes et thèmes les conservent. Ils vérifient l’invalidation de cache, pas un gain FPS ou une durée réseau.

Un nouveau clic sur le même campus recentre seulement si nécessaire, sans nouveau périmètre ni chargement, y compris si le rayon brut est encore partiel. L’option explicite `{retry:true}` reprend les données manquantes ; seule une erreur de la vue relance son gate/source sans nouvel itinéraire. Les téléchargements devenus anciens ne possèdent aucune continuation de caméra. Les flèches de bord restent désactivées pendant les voyages.

### Recul relatif, y compris depuis le minimum manuel

Les durées restent **2 200 ms vers Pays/Monde** et **1 400 ms avant un autre campus**. Aux zooms élevés, le recul accepté conserve le détail jusqu’à 16,6 et l’efface jusqu’à 14,5. Près du minimum manuel, la cible vaut `max(14.01, min(14.5, zoomInitial - 0.75))` ; elle est donc **14,01 depuis 14,5**, avec un recentrage simultané sur le campus d’origine. Cela élargit l’emprise d’environ **1,40×** tout en récupérant la marge de déplacement du centre ; le rayon de préchargement n’est pas étendu et aucun parent distant inférieur à z14 n’est demandé pour ce geste. La limite manuelle reste 14,5–19.

Le fondu suit le zoom réel ; le trajet suivant ne commence qu’à la fin de cette rampe. Les anciens callbacks, le remplacement de destination, le resize et la réduction de mouvements restent annulables. Le resize pendant l’approche conserve maintenant la progression et son échéance ; pendant le recul, il masque avant d’appliquer une nouvelle emprise.

Le test de couverture échantillonne **58 campus × 4 formats × 3 zooms de départ × 101 positions**, en utilisant l’interpolation de centre de MapLibre et une origine au bord des 3 km. C’est un contrôle géométrique de l’emprise brute, pas la preuve que toutes ses tuiles sont déjà décodées ou affichées sans chargement.

### Contrôles reproductibles et limites de v27

**177 tests passent dans 15 fichiers : 153 carte active, 8 entrée, 16 préparation GPU historique inactive.** Répartition active : approche/clic/réessai 8, recul 14, préchargeur 18, gate 32, chargeur géographique 4, resize/géométrie écran 14, navigation 10, calotte 5, contours 5, candidat/durée 5, style/cache 17, préparation Monde 8 et direction 13. Les tests du module historique ne sont pas comptés comme preuve de préchauffage du nouveau parcours.

Le cache brut partagé conserve son plafond de **48 Mio** ; le cache décodé reste plafonné à **96 tuiles par source**, avec dimensionnement interne dynamique. Ces limites ne sont pas un budget mesuré de RAM/VRAM totale. Un candidat aléatoire peut rester partiel si le campus sélectionné et lui ne tiennent pas ensemble dans le budget. Le décodage et les glyphes peuvent encore arriver pendant le mouvement ; la préparation GPU exhaustive des 3 km n’est plus revendiquée.

Le diagnostic 19 expose les phases de trajet, l’alpha demandé et les valeurs de peinture réellement évaluées par le moteur épinglé ; son échantillon vivant est mis à jour sur `render`. Le contrôle de déplacement progressif relève séparément état du rayon brut, téléchargements et requêtes de rendu ; il ne transforme plus une nouvelle demande de décodage en échec de navigation. Aucun de ces contrôles n’est chargé sans `?perf=1`. Les mesures navigateur finales v27, FPS et durées réseau ne sont pas déduites de cette mise à jour technique ; les observations Chrome sont consignées séparément après leur exécution.

## Historique v21 : détails liés à la hauteur de caméra

**La préparation bloquante ci-dessous est remplacée par v27.** Ses délais et contrôles restent attribués à cette version.


Le fond précis Natural Earth commun Monde/Pays, les trois niveaux bornés, le cache de quartier v17 et l’anticipation d’un seul candidat aléatoire v18 restent actifs. Les sections suivantes conservent leurs étapes historiques et leurs mesures datées. Les nouvelles séquences et les contrôles v21 ne sont pas une nouvelle mesure des FPS, du débit ou de la mémoire totale.

### Approche préparée, puis révélation en mouvement

Le trajet atteint d’abord le campus à **zoom 14,5 / pitch 0**. Les PBF de la couverture v17 — déplacement de 3 km, viewport et coins de préparation — doivent être disponibles. La même instance MapLibre prépare ensuite le quartier au zoom 17,8 dans le viewport élargi, sous la copie 2D déjà utilisée en v17, avec backing WebGL plafonné à 1 024². Après restauration du viewport, elle prépare trois poses centrées sur le campus aux zooms **15, 16 et 17**, puis rend de nouveau la vue sûre 14,5. Il ne s’agit ni de trois nouveaux rayons de téléchargement ni de trois nouveaux contextes WebGL.

Après cette préparation, une descente réelle de **1 600 ms** rejoint **17,8 / 34°**. Son alpha global vaut `smoothstep((zoom − 14,5) / 3,3)`, borné à 0–1. Le style compose cette rampe avec ses opacités d’origine. Pour respecter la syntaxe MapLibre, il construit une interpolation de zoom de premier niveau, avec les anciens arrêts et 33 échantillons de la rampe, plutôt que d’imbriquer des expressions `zoom`. Ces propriétés sont installées une fois au début du segment ; aucun setter de peinture n’est appelé à chaque déplacement. Les variations de thème préservent la rampe active.

Les durées de mouvement totalisent **2,8 s** vers un campus et **3–3,4 s** entre deux campus, selon leur distance ; elles excluent l’attente de données et de préparation ainsi que l’éventuel fondu de départ entre quartiers. La préparation peut donc créer une **pause visible au zoom 14,5** avant la dernière descente. Anticiper les PBF du candidat ne supprime pas ce coût de décodage/rendu. Les plafonds de temps du module restent 25 s pour l’ensemble et 12 s par pose, avec remise en état et erreur explicite ; ce ne sont pas des durées usuelles promises.

### Recul sur la carte visible

La tentative v19 commençait un fondu temporisé de 350 ms dès le début du recul ; avec l’easing, une grande partie du détail pouvait avoir disparu avant un déplacement visible suffisant. Elle est remplacée par un recul de **1 400 ms jusqu’à 14,5**, sans changer le centre exploré et avec redressement du pitch. Le détail est conservé jusqu’à **15,5**, puis suit `smoothstep(zoom − 14,5)` jusqu’à zéro. Un départ depuis un zoom inférieur à 15,5 utilise sa hauteur initiale comme haut de rampe. Une approche interrompue conserve son alpha courant au début du retour.

Seule l’arrivée à **14,5** autorise le masquage des couches puis le vol local vers Pays ou Monde. Un délai écoulé ou un événement moveend à un zoom encore élevé ne peut pas masquer prématurément une vue immobile. Les PBF du campus restent protégés pendant le recul, puis son travail prioritaire est libéré au départ du trajet local. Le rayon brut existant n’est pas élargi pour ce geste. Le fondu immobile de 200 ms reste utilisé lorsque nécessaire entre deux campus distincts ; il ne remplace plus le recul détaillé Campus → Pays/Monde.

### Interruptions et observations possibles

Les générations de destination et de préparation empêchent les anciens callbacks de déclencher une descente tardive. Le remplacement de caméra ignore le moveend synchrone de l’ancien segment. Un resize pendant l’approche masque avant le changement de viewport, revient à 14,5, puis prépare la nouvelle vue ; pendant le recul, il masque avant le resize puis continue vers la destination locale. La préférence de mouvements réduits supprime les segments animés et prépare la vue finale. Ces branches sont couvertes par tests ; elles ne constituent pas un contrôle sur téléphone physique.

Le diagnostic `?perf=1`, version17, expose `detailOpacity` — alpha calculé à partir du zoom, distinct de `opacityTarget` — et les phases `approach` / `outbound`. Son historique borné à 48 points relève zoom, opacité, mouvement et disponibilité des tuiles pendant ces segments. Le contrôle de fond local autorise désormais le bref recul détaillé d’un retour, avant que ses couches soient masquées. Les captures et observations navigateur v21 sont ajoutées séparément après leur exécution.

### Contrôles automatisés et limites de cette révision

**136 tests carte passent dans 13 fichiers**, exécutés individuellement le 27 septembre 2026 ; **144 tests avec les 8 contrôles d’entrée**. Répartition carte : approche 3, recul 8, préchargeur 18, préparation rendu 15, gate 28, chargeur géographique 4, resize/géométrie écran 13, navigation 10, calotte 5, contours 5, candidat/durée 5, style 14 et préparation Monde 8. Les nouveaux cas vérifient l’ordre des étapes réelles du moteur, les poses intermédiaires sous couverture, l’annulation sans reprise tardive, le retour entièrement visible avant sa rampe, les redimensionnements et les mouvements réduits. Le validateur officiel local de style accepte les deux rampes en clair et sombre : **quatre validations, zéro erreur**.

Le budget **48 Mio concerne uniquement les buffers bruts** ; il est partagé entre campus sélectionné et prochain candidat. Le plafond MapLibre reste **96 tuiles décodées par source**, sans mesure RAM/VRAM totale. Les nouvelles poses préparent les vues d’approche centrées sur le campus, pas tous les déplacements possibles à chaque zoom. De nouveaux décodages, glyphes ou évictions restent possibles lors d’une autre orientation, d’un autre niveau de zoom ou après plusieurs destinations. Aucun résultat v17 ou v18 n’est réattribué à cette séquence ; aucun gain FPS ni délai maximal réseau n’est démontré par les tests.

## Historique : trois niveaux bornés et premier fond Monde local

La précision suivante de l’utilisateur conduit à séparer la sélection d’un niveau de son zoom. **Cliquer sur un pays puis un campus descend ; le chemin complet Monde › pays › campus, la flèche et Échap remontent.** Molette, pincement, clavier et boutons de zoom restent dans le niveau courant. Le dernier élément du fil ouvre toujours le sélecteur/recherche des 58 campus. Il porte `aria-current="page"` ; le fil est adapté au mobile et au RTL, avec des noms officiels conservés.

La politique pure [navigation-policy.mjs](navigation-policy.mjs) contraint la demande native de caméra via `transformConstrain`, avant le déplacement. Au Monde, la plage couvre le cadrage du format jusqu’à **+1,8 niveau de zoom**, avec compensation de latitude ; la latitude du centre reste dans **±75°**. Au Pays, la plage va de **`countryZoom − 0,25` à `countryZoom + 2,1`**, plafonnée à **9,5** ; le centre reste dans un rectangle incluant tous ses campus, augmenté de **3 %** avec une marge minimale de **0,05°** par axe. Au Campus, le zoom reste entre **14,5 et 19**, le centre dans un rayon géodésique de **3 km**. Ces limites concernent le centre, pas tous les pixels du viewport ; la limite pays est rectangulaire, pas polygonale. Les détails et limites géographiques figurent dans [NOTES.md](NOTES.md).

Les vols vers Pays/Campus/Monde durent respectivement **1,5 / 2,8 / 2 s** ; la préférence de mouvement réduit les remplace par une arrivée directe. Les gestes et les boutons de zoom sont temporairement suspendus pendant le vol explicite ; le fil et le sélecteur restent actifs pour changer la destination. Les contraintes locales sont relâchées pendant le trajet, puis réappliquées à l’arrivée. Le bouton de retour dépend du niveau sélectionné, et les boutons de zoom de la disponibilité effective du zoom dans ce niveau.

Le fichier existant [world.json](../map-data/world.json), **177 pays, 110 736 octets**, est maintenant utilisé comme source GeoJSON du fond Monde, avec océan, terres et frontières locaux, dans **la même scène et un seul canvas MapLibre**. Le moteur prépare toujours ces géométries dans ses workers. Les couches détaillées distantes sont masquées au Monde stabilisé ; leur préparation à opacité nulle et leur révélation contrôlée sont décrites plus bas. Le détail déjà affiché reste présent pendant un retour jusqu’à l’arrivée au Monde. Son fond terrestre opaque recouvre la géométrie simplifiée avant le dessin de l’eau OpenMapTiles.

Le style conserve la source OpenFreeMap et peut en charger les **métadonnées**, même au Monde. Le détail et les glyphes Pays/Campus restent dépendants du réseau. La vue demandée est désormais préparée en transparence puis révélée lorsqu’elle satisfait les conditions de disponibilité ; **aucun préchargement complet du rayon de 3 km, des vues voisines ou des 58 quartiers n’est réalisé**. Une fois le détail affiché, de nouveaux gestes ou zones peuvent encore faire apparaître des tuiles au fur et à mesure. Ni l’absence de tout scintillement ni un gain GPU ou FPS ne sont établis.

### Vérifications de la navigation bornée, avant la correction du flash

- Les **10 tests unitaires** de [navigation-policy.test.mjs](navigation-policy.test.mjs) passent. Ils couvrent les niveaux, les marges et campus inclus, les longitudes autour de l’antiméridien, la compensation de latitude, les contraintes en vol et l’absence de mutation des entrées.
- Le diagnostic MapLibre passe ses **5 étapes avec assertions** : maximum Monde, minimum Monde, France conservée malgré une demande extrême, Paris conservé avec zoom minimum et rayon de 3 km, retour explicite au Monde avec fond local. Le parcours a été rejoué après la correction du collecteur réseau. Ces appels de caméra programmatiques ne prouvent pas à eux seuls le comportement d’un pincement réel.
- Sur un nouveau chargement au Monde, la molette atteint la limite supérieure ; un cran supplémentaire reste à la butée et le premier petit geste inverse repart immédiatement. Après zoom puis rotation, **aucune requête de tuile distante n’est observée** par le collecteur contrôlé. Après une visite France → Paris → retour Monde, une nouvelle rotation ne fait pas augmenter son compteur de tuiles terminées. Ce constat porte sur ce parcours ; il ne signifie pas zéro requête HTTP pour la page ni une mesure de débit, de latence ou de FPS.
- Contrôles Chrome sur ordinateur **1900 × 971** et mobile **390 × 844**, FR/AR et clair/sombre : un seul canvas, absence de débordement horizontal relevée, fil complet conservé. Paris en français sombre, Monde en arabe sombre et niveau Pays en français clair sont examinés. Les retours **France/Monde par le chemin** sont joués, dont le remplacement d’un vol Paris par Monde. Le clic sur le repère France rend le focus au globe ; Échap pendant un vol vers Paris revient en France. Le fil complet est également contrôlé après l’arrivée à Paris.
- Syntaxe des cinq modules vérifiés et tests de politique **10/10** valides ; aucune erreur ni aucun avertissement dans la console du parcours contrôlé. Pas de téléphone physique, de pincement réel, de panne réseau simulée ni de nouveau comparatif FPS. Les mesures ci-dessous restent attachées à leur version et à leur format d’origine.

## Corrections réalisées

### Préparer le détail sans recouvrir les côtes locales

Le défaut suivant a été reproduit sur ordinateur : en cliquant sur un pays depuis le Monde, le fond terrestre détaillé devenait visible avant l’eau vectorielle et produisait une surface turquoise qui masquait provisoirement les côtes. La correction conserve le fond local pendant le vol Pays et **n’active les couches détaillées qu’après l’arrivée**, à opacité zéro. Les couches sont alors visibles du point de vue du style et chargent leurs ressources, mais leur peinture reste transparente.

[detail-gate.mjs](detail-gate.mjs) distingue les phases `local`, `waiting`, `revealing`, `detail` et `error`. La révélation exige : un rendu postérieur à la préparation, `idle`, `!map.isMoving()`, `map.isSourceLoaded('openmaptiles')`, `map.areTilesLoaded()` et aucune erreur pertinente retenue. Le rendu frais évite de valider seulement l’état d’un cache antérieur. Les erreurs de source, ou les erreurs de métadonnées/glyphes sans identifiant de source, empêchent la révélation ; `areTilesLoaded()` seul accepterait des tuiles en erreur. La protection mémorise ces erreurs pendant la vie du module ; elle ne constitue pas un système automatique de nouvelle tentative réseau.

Une fois la vue prête, le multiplicateur d’opacité passe de zéro à un avec des transitions de peinture natives de **450 ms**, ou immédiatement si les mouvements sont réduits. Une nouvelle destination invalide l’attente précédente. Une première approche Campus peut préparer les ressources en transparence pendant le vol, puis attend l’arrêt et la disponibilité de la vue pour les montrer. Un détail déjà révélé, ou déjà en cours de fondu, reste présent lors des trajets Pays ↔ Campus ; il est masqué à la fin du retour Monde.

[globe-style.mjs](globe-style.mjs) expose `setGlobeDetailOpacity(map, amount, {duration})`, séparément de la visibilité. Le fond détaillé, l’eau, les surfaces, lignes, textes et extrusions sont tous modulés. Les courbes `interpolate` utilisant `zoom` restent au niveau racine et conservent leurs seuils. Les opacités sont recalculées depuis leurs valeurs de base, sans multiplication cumulative. `applyGlobeTheme` conserve le multiplicateur et met à jour les bases du thème ; la géométrie locale, les sources et la caméra ne sont pas remplacées.

Vérifications : **7 tests** de [style-gating.test.mjs](style-gating.test.mjs) et **10 tests** de [detail-gate.test.mjs](detail-gate.test.mjs) passent ; les **10 tests** de politique restent valides. Les tests de préparation couvrent les rendus frais, les conditions de disponibilité, les erreurs, l’invalidation des attentes, les vues déjà détaillées et la destruction du module. Huit combinaisons clair/sombre et opacité 0/0,25/0,5/1 passent également le validateur de style extrait du bundle MapLibre **5.24.0** ; `fill-extrusion-opacity` accepte les transitions dans cette version.

Sur ordinateur, le contrôle avant/après montre les côtes conservées durant l’approche Pays. Le diagnostic suit `waiting` à opacité cible 0, puis `revealing` à cible 1 après disponibilité des tuiles, et `detail` après environ 450 ms. La visite de Paris termine au zoom 17,8 avec la phase `detail`. Le parcours Monde → France est aussi joué avec redimensionnement **390 × 844** et thème sombre activé pendant le vol : côtes conservées pendant l’approche, puis détails et libellés à l’arrivée. Le retour au Monde par le chemin, le rétablissement du format ordinateur et du thème clair terminent avec le chemin Monde et le statut de chargement masqué. Un seul canvas, pas de débordement horizontal relevé, console sans erreur ni avertissement dans ce parcours. Ces contrôles Chrome ne constituent ni un essai sur téléphone physique ni une nouvelle mesure FPS.

Un incident de module momentanément absent a également été corrigé : `welcome.mjs` importe maintenant le moteur **`v=8`** dynamiquement dans son bloc de gestion d’erreurs. Un échec d’import est ainsi rendu visible au lieu de laisser le message initial de préparation. Ce correctif de démarrage est distinct des conditions de disponibilité des tuiles.

### Caméra au dézoom

La sélection d’un campus vise le zoom **17,8** avec une inclinaison de **34°**. Le zoom natif conservait ensuite cette inclinaison, même une fois revenu à l’échelle du globe. En projection perspective, la caméra inclinée vise un point de surface : le centre apparent de la sphère se retrouve plus bas. Le centrage CSS vertical restait à 50 % ; le défaut ne venait pas d’un déplacement du conteneur.

[integrated-globe.mjs](integrated-globe.mjs) utilise maintenant le hook `transformCameraUpdate` :

```js
const u = clamp((next.zoom - 12) / 5.8, 0, 1);
return {pitch: Math.min(next.pitch, 34 * u * u * (3 - 2 * u))};
```

L’inclinaison autorisée décroît progressivement et devient nulle à partir du zoom 12 en dézoomant. Le minimum avec `next.pitch` préserve les vols pays et les retours explicites déjà prévus à 0°. Le hook agit dans la même mise à jour de caméra que les gestes et animations ; aucun `setPitch()` imbriqué dans un événement `zoom` n’est ajouté. La longitude et la latitude ne sont pas recentrées par ce correctif.

L’ancrage natif de la molette et du pincement reste utilisé. Le changement de perspective pendant le redressement n’est pas une preuve d’immobilité parfaite du point visé sur chaque image ; le parcours automatique ci-dessous contrôle l’état final.

Cette correction de perspective est conservée dans la navigation bornée actuelle. Le retour Campus → Pays → Monde se fait désormais explicitement ; atteindre le zoom minimum d’un campus ne fait plus changer de niveau.

### Repères et changements d’interface

- Une couche HTML assure le positionnement des repères. Les objets `MapLibre.Marker` ont été retirés : leur projection et leur callback d’opacité doublaient le travail déjà effectué par notre boucle.
- Les distances sont calculées une fois par repère et par mise à jour. Les largeurs manquantes sont lues ensemble avant les écritures de cette boucle. Position, classes et attribut `hidden` ne sont réécrits que lorsque leur état change ; les positions sont arrondies au demi-pixel.
- Le choix entre libellé et point compact reste stable pendant un geste. Le placement est recalculé au repos et lors d’une invalidation explicite. Un nouveau repère non sélectionné qui apparaît pendant un mouvement reste compact jusqu’au prochain placement.
- Les marges d’apparition et de disparition diffèrent pour réduire les basculements aux limites. L’occlusion utilise aussi le test géométrique exact de MapLibre : une sphère en perspective peut cacher un lieu avant qu’il n’atteigne 90° du centre. Un recalcul ponctuel est conservé sur `projectiontransition`.
- Une signature de dimensions, centre et rayon évite les appels `resize` et les animations de caméra lorsque le cadrage n’a pas changé. Cliquer sur la rubrique déjà active ne relance plus son travail. Les mises à jour du bouton Retour suivent les changements utiles de périmètre ou de disponibilité, sans réécrire son état à chaque centième de zoom.
- Les libellés restent de vrais boutons. Leur molette est transmise au canvas avec les coordonnées écran du point géographique du repère, pour conserver l’accumulation et l’ancrage du gestionnaire natif.

Le réseau contient 58 campus, mais la vue Monde affiche **30 repères de pays** ; une vue pays en contient **8 au maximum**. Les contenus de démonstration ne sont pas reconstruits à chaque image.

### Masque, résolution et relief

Le fondu des bords suit les changements de zoom et de dimensions ; ses valeurs arrondies sont mises en cache. Il n’est plus réécrit à chaque événement `render`. La classe `hg-faded` applique les deux gradients au seul canvas quand le fondu devient utile ; à l’échelle Monde initiale, le canvas n’a pas de masque. Les repères et les crédits restent hors du masque.

Le ratio de pixels du canvas est plafonné **à la création du moteur** à `min(devicePixelRatio, 1.5)` jusqu’à 700 px de largeur, ou `min(devicePixelRatio, 2)` au-delà. La demande WebGL `antialias:true` est conservée : l’optimisation ne consiste pas à désactiver l’anticrénelage MSAA. Le diagnostic relève les attributs effectifs du contexte. La comparaison chiffrée ci-dessous utilise un DPR de 1 : elle ne mesure donc pas le bénéfice du plafond sur un écran à haute densité.

Dans [globe-style.mjs](globe-style.mjs), le relief des bâtiments devient opaque au zoom **17,4**, au lieu de rester translucide. L’apparition entre 16 et 17,4 reste progressive. Dans le moteur 5.24.0, les extrusions opaques sans motif utilisent une passe de géométrie ; les bâtiments translucides en utilisent deux. Ce changement conserve les données de hauteur et la palette ; son gain GPU n’a pas été isolé par les mesures présentes.

## Provenance technique et compatibilité

Le bundle local annonce **MapLibre GL JS 5.24.0** via `getVersion()`. Les fichiers, leurs empreintes et leur provenance sont consignés dans [vendor/maplibre-PROVENANCE.md](vendor/maplibre-PROVENANCE.md). Les mécanismes ci-dessous ont été relus dans les sources correspondant au bundle, notamment sa source map :

| Mécanisme | Source 5.24.0 et portée |
| --- | --- |
| Hook de caméra | [`src/ui/map.ts`](https://github.com/maplibre/maplibre-gl-js/blob/v5.24.0/src/ui/map.ts), [`src/ui/camera.ts`](https://github.com/maplibre/maplibre-gl-js/blob/v5.24.0/src/ui/camera.ts) et [`src/ui/handler_manager.ts`](https://github.com/maplibre/maplibre-gl-js/blob/v5.24.0/src/ui/handler_manager.ts) : le hook est appliqué avant les événements de mouvement. |
| Projection et inclinaison | [`vertical_perspective_transform.ts`](https://github.com/maplibre/maplibre-gl-js/blob/v5.24.0/src/geo/projection/vertical_perspective_transform.ts) : construction de la caméra inclinée et test d’occlusion de la sphère. |
| Travail des marqueurs natifs | [`src/ui/marker.ts`](https://github.com/maplibre/maplibre-gl-js/blob/v5.24.0/src/ui/marker.ts) : projection, transformation DOM et vérification d’opacité différée. |
| Accumulation de molette | [`src/ui/handler/scroll_zoom.ts`](https://github.com/maplibre/maplibre-gl-js/blob/v5.24.0/src/ui/handler/scroll_zoom.ts) : accumulation, lissage et contraintes du zoom natif. |
| Extrusions opaques | `src/webgl/draw/draw_fill_extrusion.ts`, dans la source map du bundle : branche à une passe pour une opacité de 1 sans motif, deux passes sinon. |

`map.transform.isLocationOccluded(LngLat)` est une **dépendance à une interface interne de la version épinglée**, également utilisée par ses marqueurs natifs. Elle ne lit pas le DOM. Revalider cet appel lors d’une migration de MapLibre ; ne pas le présenter comme une garantie d’API publique stable. Les fichiers temporaires ayant servi à lire la source map ne sont pas des dépendances nécessaires au lancement de l’aperçu.

## Diagnostic local facultatif

Ajouter `?perf=1` à l’URL de l’aperçu, par exemple [index.html?perf=1](index.html?perf=1). Avec le serveur décrit dans [NOTES.md](NOTES.md), cela donne `http://127.0.0.1:8765/work/visualizations/horizon-welcome/index.html?perf=1`. Aucun second serveur n’est nécessaire si celui du projet fonctionne déjà.

Le module [perf-diagnostics.mjs](perf-diagnostics.mjs) est chargé uniquement avec ce paramètre. Son panneau propose la rotation de trois secondes, l’approche de Paris, le retour explicite au Monde via la navigation de l’application et la vérification des limites en cinq étapes. L’ancien parcours nommé `zoom-out` déclenche désormais `reset()` ; il ne teste plus un passage automatique entre niveaux à la molette. Le JSON comprend dimensions CSS et physiques du canvas, ratios de pixels, caméra, intervalles rAF, événements `render`, mutations DOM et tâches longues si cette observation est disponible. L’état de navigation expose aussi les bornes, le vol en cours, la distance au campus et la visibilité du détail. Les attributs du contexte existant sont lus sans créer un autre canvas.

Le diagnostic active `collectResourceTiming` uniquement avec `?perf=1` et recueille également les entrées des workers transmises par les événements de source MapLibre. Les tuiles vectorielles sont identifiées par leur URL, distinctement des métadonnées et des glyphes. Un compteur de ressources terminées peut inclure des réponses issues du cache ; il n’est donc pas un compteur de téléchargements effectifs ni un indicateur de fluidité. La mesure initiale qui ne consultait que les ressources du document était insuffisante pour conclure sur les requêtes des workers.

Une préparation cherche à stabiliser caméra et tuiles. Son éventuelle expiration reste inscrite dans le résultat. Masquer l’onglet annule la mesure. Un nombre insuffisant d’intervalles rAF rend la cadence impropre à la comparaison, même si `document.hidden` vaut `false`. Ces parcours programmatiques ne remplacent pas un essai manuel de molette ou de pincement, et le panneau ajoute lui-même une charge de mesure.

## Mesures historiques conservées : première passe d’optimisation

Comparaison effectuée dans Chrome à **1440 × 900, DPR 1**, sur le parcours de rotation, **avant l’ajout du fond Monde local et de la navigation bornée**. Les colonnes Avant/Après décrivent le moteur continu avant puis après la première passe de corrections ; elles ne comparent pas l’ancien moteur SVG au nouveau moteur WebGL.

| Indicateur | Avant | Après |
| --- | ---: | ---: |
| Mutations DOM observées | 3 272 | 2 041 |
| Événements de rendu MapLibre | 95 | 79 |
| Mutations / événement de rendu | 34,44 | 25,84 |
| Mutations de classe | 77 | 16 |
| Mutations de `hidden` | 305 | 6 |
| Intervalle rAF médian | 33,3 ms | 33,3 ms |
| Intervalle rAF p95 | 33,4 ms | 33,4 ms |

Le rapport normalisé passe de `3272 / 95` à `2041 / 79`, soit environ **−25 %**. Les nombres de rendus diffèrent : la baisse brute des mutations ne doit pas être présentée comme un gain équivalent par image, ni comme un gain de temps CPU. Les mutations de classe et de visibilité ont également diminué dans ce parcours.

La cadence rAF observée ne progresse pas. Un événement de rendu MapLibre n’est pas, à lui seul, la preuve d’une image effectivement présentée à l’écran. Ni le temps GPU ni un gain de FPS ne sont établis.

## Vérifications historiques de cette première passe et limites

Les passages automatiques de niveau par dézoom décrits ici correspondent à la version testée avant la navigation bornée ; ils sont remplacés dans l’état actif. Les résultats de caméra, les chiffres et les réserves sont conservés comme trace de cette étape.

- Le parcours automatique de dézoom termine à **pitch 0°**, au zoom minimum **2,1** dans le format mesuré ; ses trois assertions passent. Le point géographique central se projette au centre prévu par le padding, avec une erreur relevée de **0 px**. Cette dernière assertion contrôle le point de caméra, pas une mesure visuelle des contours de la sphère.
- L’approche termine au zoom **17,8**, à **pitch 34°**, avec **un seul canvas**.
- Le rendu de Paris au zoom **17,8**, avec relief opaque, est examiné sur ordinateur **1440 × 900 en clair**, puis au format mobile **390 × 844 en sombre**. Le passage FR → AR conserve Paris et le canvas unique, sans débordement horizontal relevé. Il s’agit d’un contrôle de format dans Chrome, pas d’un essai sur téléphone physique.
- La rotation par glissement est jouée. Le retour au pays par bouton, puis le dézoom à la molette jusqu’au globe entier, sont joués ; le globe est visuellement centré à l’arrivée. Les changements Projets → Parcours sont contrôlés en RTL. Ces essais complètent le parcours automatique, sans mesurer le temps GPU ni démontrer la disparition de tout scintillement.
- Les contrôles de syntaxe des modules modifiés passent.
- Certaines premières exécutions ont fourni un rAF limité à environ **1 Hz** dans l’environnement d’outils, et Chrome a été reconnecté. Ces exécutions ne sont pas retenues comme mesures comparables. La visibilité déclarée de la page ne suffit pas à exclure une limitation externe de cadence.
- Les chiffres retenus concernent uniquement le format et le parcours décrits. Ils ne démontrent pas la fluidité sur téléphone, les performances de toutes les villes, le comportement de tous les GPU, ni une amélioration à 60 FPS. Les tuiles et les glyphes restent des ressources réseau ; leur chargement et leur cache influencent les essais.

Les corrections suppriment du travail redondant et stabilisent des états identifiés. Elles ne permettent pas d’affirmer que toute source possible de scintillement ou de ralentissement a disparu.

## Historique : propositions contre le chargement visible

Lors de la précision utilisateur suivante du 27 septembre, l’apparition des morceaux de carte pendant rotation et zoom/dézoom est identifiée comme le défaut à traiter. À cette étape, le style utilisait les tuiles distantes pour l’eau et les frontières dès le Monde ; le TopoJSON local (110 736 octets) servait seulement au cadrage et à la sélection des pays.

La recommandation associait une géographie mondiale simplifiée embarquée, un préchargement borné des détails de la destination et un affichage contrôlé des détails prêts, dans la même scène. Alternatives : simple réglage du cache (effet limité sur une première visite), ou préparation et maintenance de données par quartier des 58 campus. La première réponse restait une proposition sans modification du moteur. **Depuis, le fond Monde local et la préparation transparente suivie d’une révélation conditionnelle de la vue demandée sont réalisés. Le préchargement complet d’un quartier de 3 km et de ses échelles ne l’est pas.** La réalisation active et ses limites sont documentées au début de cette note.

L’étude séparée [PRELOAD_ESTIMATE.md](PRELOAD_ESTIMATE.md) et ses [données structurées](PRELOAD_ESTIMATE.json) comparent les quartiers de tous les campus d’un pays à celui du seul campus choisi. Les neuf réponses de tuiles échantillonnées sont mesurées ; les poids des disques complets sont extrapolés. La note distingue le rayon du centre de caméra de la couverture réelle du viewport et ne mesure ni le CPU, ni la RAM, ni les FPS.

Points vérifiés dans la source **5.24.0** pour une éventuelle réalisation :

- `cancelPendingTileRequestsWhileZooming:false` peut conserver les niveaux intermédiaires pendant le zoom, mais augmente les requêtes conservées et le travail de rendu.
- `maxTileCacheZoomLevels` agit sur le budget de cache ; `maxTileCacheSize` est un plafond, pas un préchargement. Augmenter le cache consomme de la mémoire et ne prépare pas une destination encore inconnue.
- Aucun `preloadOnly` ou `prefetchZoomDelta` n’est disponible dans cette version. Préparer les tuiles de la destination exige une logique applicative, avec des limites de mémoire et de réseau.
- `areTilesLoaded()` ne suffit pas à valider une image détaillée complète : les tuiles en erreur sont considérées comme terminées. Prévoir erreurs et expiration de l’attente.
- Un fond local supprime les nouvelles attentes réseau du monde simplifié, pas le découpage ni la préparation des géométries par le moteur. Le raccord des côtes simplifiées et détaillées doit être traité : le style détaillé part d’une surface de terre recouverte d’eau, et `landcover` ne couvre pas toutes les terres. La réalisation active conserve ce fond détaillé au-dessus du fond local lors de l’entrée dans un niveau Pays/Campus.


## Suite du 27 septembre 2026 — départ sur fond local et préparation Pays pendant le vol (v9)

Cette suite décrit le comportement **actif du moteur v9**. Elle remplace, sans effacer les contrôles antérieurs, les descriptions v8 plus haut selon lesquelles les pays étaient préparés seulement après l’arrivée, `idle` était obligatoire et le détail restait visible jusqu’à la fin d’un retour Monde ou Pays.

Avant un départ vers **Monde ou Pays**, si un détail est affiché, le moteur appelle `fadeToLocal({duration:200})`. La caméra reste immobile pendant ce fondu ; les couches détaillées sont ensuite masquées, puis seulement le vol commence sur le fond local. Une descente vers Campus conserve au contraire le détail déjà révélé. Un état local, en attente de détails ou en erreur est masqué immédiatement, et la préférence de mouvement réduit supprime la durée de fondu. Les durées de trajet restent de 1,5 s vers Pays, 2,8 s vers Campus et 2 s vers Monde ; les 200 ms s’ajoutent lorsque le fondu préalable est nécessaire.

`fadeToLocal()` renvoie une promesse qui vaut `true` après le masquage effectif. `prepare`, `defer`, `hide`, `destroy` ou un nouveau fondu terminent l’attente précédente avec `false` ; ils ne la laissent pas en suspens. Le moteur ne lance le vol qu’après un résultat positif pour la destination toujours courante. Les timers sont installés avant les écritures pouvant provoquer des callbacks réentrants, et les générations sont vérifiées avant les écritures suivantes. Le fil géographique reste utilisable pour remplacer une destination.

Les couches d’un pays sont désormais **préparées à opacité zéro dès le vol**, tout en laissant les côtes locales visibles. Comme lors d’une première approche Campus, seule la vue demandée est préparée ; il ne s’agit pas d’un préchargement de toutes les vues du quartier. Après au moins un rendu postérieur à la préparation, le premier `render` pour lequel la caméra est arrêtée, la source et les tuiles sont chargées et aucune erreur pertinente n’est retenue déclenche le fondu d’apparition de 450 ms. `idle` reste un recours si ces conditions n’étaient pas encore réunies lors du dernier rendu ; il n’impose plus d’attendre les autres fondus internes de MapLibre.

L’ordre de MapLibre 5.24 a été relu : l’événement `render` est émis après la mise à jour du style et des sources, le placement et le dessin. La vérification d’un rendu frais reste nécessaire pour éviter une décision fondée seulement sur l’état du cache précédent. Les changements de thème gardent le multiplicateur d’opacité et les courbes de zoom déjà documentés.

### Premiers contrôles de v9

- **19 tests detail-gate + 10 tests navigation-policy + 7 tests style-gating passent.** Ils comprennent l’annulation des promesses, le masquage après le fondu, la réduction des mouvements, les callbacks réentrants, la révélation sur `render`, le secours `idle` et une erreur émise pendant la vérification de disponibilité.
- Dans un premier essai Chrome vers la France, la phase `waiting` commence pendant le vol ; la révélation débute **2,3 ms après l’arrivée**. La phase `detail` est atteinte environ **450,5 ms après le début du fondu**. Le cache n’était pas froid : ces valeurs décrivent un essai, pas une attente réseau maximale, une moyenne ou une garantie de réponse immédiate.
- Le suivi couvre **88 événements de rendu pendant la préparation**, **12 pendant le fondu préalable au retour**, puis **110 pendant le trajet vers Monde**. Aucune violation du séquencement contrôlé n’est relevée ; le centre de caméra reste inchangé pendant le fondu préalable. Ces nombres ne constituent pas des FPS et ne mesurent pas les images effectivement présentées à l’écran.

Ces premiers contrôles ne démontrent ni un chargement toujours immédiat, ni l’absence de toute apparition ultérieure de tuiles, ni un gain FPS. Le réseau, le cache, le traitement local des géométries et les ressources du navigateur continuent d’intervenir. Le préchargement complet du rayon de 3 km et des viewports possibles reste distinct de cette préparation de la vue, comme expliqué dans [PRELOAD_ESTIMATE.md](PRELOAD_ESTIMATE.md).


### Complément du contrôle v9 et extension active v10

Le parcours des **cinq étapes de limites** passe de nouveau. Le collecteur cumule **334 événements de rendu pendant les trajets Monde et 23 pendant les fondus préalables**, sans violation des invariants suivants : `detailVisible === false` et opacité cible nulle pendant le trajet Monde ; `!isMoving()` et centre, zoom et inclinaison inchangés pendant le fondu. Ces totaux prolongent le premier relevé ci-dessus et ne sont pas des mesures de FPS.

Une relecture identifie le même risque lors d’un déplacement **Campus A → Campus B** ou vers un campus d’un autre pays. Le moteur actif **v10** applique aussi le fondu immobile préalable et le masquage à ces trajets. Seule une approche d’un campus depuis son propre pays, ou une nouvelle sélection du même campus, conserve le détail déjà révélé. L’import effectif `integrated-globe.mjs?v=10` et cette condition ont été relus dans les fichiers ; les 2,3 ms et les compteurs précédents restent des résultats v9, pas de nouvelles mesures de v10.


### Vérifications finales v10

- Sur ordinateur, **France → Paris au zoom 17,8 → France** confirme le fondu avant le départ et la préparation transparente pendant le vol. La révélation du retour France débute **1,8 ms après l’arrivée dans cet essai avec cache**. Cela ne garantit pas ce délai sur une première visite et ne mesure pas un gain FPS.
- Le trajet **France → Monde**, remplacé après environ **430 ms** par une sélection de France, termine en France sans reprise tardive de l’ancienne destination. Le suivi comprend **248 événements de rendu de préparation Pays, 21 de fondu et 12 de trajet Monde** ; aucune violation des invariants de masquage et d’immobilité décrits plus haut n’est relevée.
- Sur mobile **390 × 844, thème sombre**, le parcours **Luxembourg → France → Paris au zoom 17,8** puis le retour direct au Monde sont joués. Le format ordinateur est rétabli pendant la phase de départ ; le globe termine visuellement centré. Le parcours garde un seul canvas, sans débordement horizontal relevé, et la console ne contient ni erreur ni avertissement.
- La préférence de mouvement réduit n’a pas été forcée dans Chrome lors de cette QA ; ses branches sont vérifiées par les tests du module. Pas de mesure sur téléphone physique ni de nouveau benchmark FPS. Les limites réseau, cache et chargement des zones découvertes ensuite restent présentes.

La protection v10 **Campus A → Campus B**, y compris vers un autre pays, a fait l’objet d’une lecture de la condition du moteur seulement. Aucun trajet entre deux campus n’a été joué durant cette intervention ; les parcours vérifiés ci-dessus ne doivent pas être présentés comme cette validation.


## Fond préparé pendant l’entrée, quartier complet et pôle — v11/v12, 27 septembre 2026

L’utilisateur choisit le fond précis commun Monde/Pays préparé pendant le message crypté, puis demande explicitement le disque complet de 3 km du campus choisi et la correction du défaut antarctique.

Le worker prépare Natural Earth 5.1.1 (258 entités, **2 006 643 octets gzip**) hors du fil principal ; la même carte est initialisée derrière l’entrée. Chrome 1900 × 971 relève une seule tentative, prête vers 2,88 s après navigation (départ vers 0,21 s), durant l’état encrypted ; le parcours visiteur réutilise ce résultat et termine avec un seul canvas. Sur viewport mobile 390 × 844, préparation prête vers 2,96 s puis n°22 joué jusqu’à BEYOND THE CODE, sans débordement. Ces essais utilisent un cache non froid et un ordinateur : aucune durée garantie sur mobile physique ou réseau ralenti.

L’entrée mobile arabe sombre et la barre basse ont été examinées visuellement ; visiteur sans déchiffrement et connexion explicitement simulée fonctionnent. France utilise uniquement le fond local, avec compteur de tuiles distantes à zéro avant le premier campus. Retour France/Monde conserve ce fond et le centrage. Aucun second chargement géographique à l’ouverture de l’accueil.

### Quartier de 3 km

Le protocole commun précharge toutes les tuiles z14 intersectant le disque et sert leurs buffers au moteur. Un premier essai de raccord demandait encore des tuiles z0–13 pendant le vol : 54 téléchargements et 25,9 Mo de buffers décompressés. Ce comportement intermédiaire est **corrigé** en imposant minzoom=maxzoom=14 à la source distante, puisque Monde/Pays sont locaux et Campus limité à 14,5–19.

Contrôle final dans une nouvelle instance Chrome : **21 téléchargements pour Paris, 21/21 tuiles disponibles, 8 585 507 octets de buffers en cache**, aucune défaillance. Le gate arrive à detail, opacité1. Les deux premières demandes de rendu sont satisfaites par le cache ; une requête partagée est dédupliquée. Après dézoom jusqu’à 15,868 et déplacement du centre de 239,76 m, les lectures du cache passent à 4 et le nombre de téléchargements reste à 21. Retour France puis Monde : phase locale, anticipation annulée, compteur inchangé, aucune violation de séquencement relevée et console finale sans erreur/avertissement.

Les 8,59 Mo sont la taille des protobuf **après décompression HTTP**, pas le transfert gzip ni la mémoire totale (géométrie décodée, GPU, cache interne MapLibre et copies de transfert exclus). La taille encodée n’est pas exposée par le fournisseur dans ces relevés. Le cache brut est borné à 24 Mio ; les requêtes simultanées à six, dont quatre d’anticipation, priorité au moteur. Toutes les coordonnées des 58 campus sont couvertes par les tests d’empreinte, pas par 58 visites navigateur.

Complément mobile **390 × 844** sans diagnostic superposé : sélection de Lyon, détail urbain arrivé, chemin Monde › France › 42 Lyon, un canvas, aucun débordement et console sans erreur/avertissement. Format ordinateur rétabli après contrôle.

Les tuiles hors disque mais visibles dans le viewport, le traitement local et les nouveaux glyphes restent possibles. L’objectif vérifié est le préchargement et la réutilisation des données du disque, sans prétendre à un rendu GPU intégral de toutes les vues à l’avance. Erreurs et budget insuffisant ne sont pas déclarés ready ; le réessai conserve le cache utile. Les scénarios d’annulation, reprise, buffers transférés, source et erreurs concurrentes sont contrôlés par tests, pas par une panne réseau provoquée dans Chrome.

### Antarctique

Le défaut initial a été reproduit par rotation vers le Sud : cercle, fermeture radiale et fente en couleur océan. Le mesh nettoyé supprime les faux contours ; une calotte réelle dessinée directement en sphère corrige le secteur prolongé jusqu’au pôle. Après rechargement, rendus clair/sombre et zooms Monde ne retrouvent plus cercle ni longue fente. Voir POLAR_NOTES.md pour les sources, la latitude −85,23°, le contexte GL unique et la fine limite Mercator restante. Aucun campus ni côte du jeu de sélection déplacé.

### Contrôles reproductibles et limites

**71 contrôles automatisés** : 10 navigation, 12 style, 26 gate, 4 chargeur géographique, 9 préchargeur campus, 5 contours polaires, 5 calotte. Les sept fichiers de tests passent ensemble avec node --test ; vérifications syntaxiques et validateur de style MapLibre 5.24 également passés. Les tests géographiques de construction (anneaux, 30 pays du réseau, trous, antiméridien) sont consignés séparément dans geography/CHECKS.json.

66 fichiers de la galerie de déchiffrement inchangés par SHA-256 ; texte antérieur du journal conservé intégralement. Pas de mesure de gain FPS, de mémoire totale, de débit limité, de téléphone physique, de panne réseau navigateur ni de préférence de mouvement forcée pendant cette intervention. Ces limites ne sont pas des validations utilisateur ; aucun changement publié.

## Stabilité, quartier préparé au rendu et mode clair — v17, 27 septembre 2026

**Historique : la préparation GPU bloquante et sa copie 2D sont remplacées par le parcours progressif v27.** Les mesures qui suivent ne décrivent pas cette nouvelle séquence ; les corrections du fond mondial, du resize et les budgets de cache restent conservés.

L’utilisateur précise que le chargement urbain apparaît en déplaçant la carte, même après attente. Le cache v12 contenait les PBF, pas tous les objets de rendu MapLibre. Deux autres causes sont identifiées séparément : le resize effaçait le framebuffer sans redraw synchrone, et la compensation de latitude traversait des niveaux GeoJSON pas encore préparés à la première rotation.

### Réalisation

- Resize seulement si les dimensions changent ; redraw synchrone après les changements de caméra. Le changement de padding seul ne réinitialise pas le canvas. Les vols conservent leur échéance ; les moveend ordinaires ne relancent ni gate ni préchargement.
- Derrière l’entrée : géométries locales z0, z1, vue opposée au zoom initial, puis vue d’accueil. Restauration relue si le viewport change pendant la préparation ; erreur et annulation ne déclarent jamais prêt.
- Couverture campus calculée à partir du déplacement de 3 km et des coins du viewport au minimum autorisé. Le maximum d’inclinaison de 34° constitue une marge conservative à ce niveau. Les coins du carré de préparation sont également inclus. Rayon arrondi au quart de kilomètre supérieur ; cache PBF 48 Mio, six requêtes simultanées dont quatre anticipées.
- Préparation réelle au zoom d’arrivée 17,8 : agrandissement temporaire du viewport CSS de la même carte, ratio de pixels réduit pour limiter le backing buffer à 1 024 × 1 024, rendu du quartier puis restauration du viewport/ratio/caméra et nouvelle frame prête. Une copie 2D stable garde la vue affichée pendant ce travail ; un seul contexte WebGL. Les marqueurs restent figés, les gestes sont suspendus et le chemin de retour reste utilisable. L’annulation restaure immédiatement l’état avant un nouveau trajet. Budget de temps 25 s, au plus 12 s par vue ; erreur explicite et réessai si dépassé.
- Cache MapLibre plafonné à 96 tuiles par source (dimensionnement dynamique jusqu’à ce plafond). Fondu natif des symboles retiré ; le fondu d’arrivée du quartier reste présent. Le statut prêt vient de la fin réelle du gate, pas d’un simple événement sourcedata.

Le passage séquentiel sur chaque tuile a été essayé puis remplacé : il atteignait le délai de 15 s après seulement 8 des 23 poses dans le navigateur de contrôle. La vue élargie prépare les tuiles en parallèle et évite cette dépendance à une frame par pose. Ce chemin séquentiel reste seulement un repli du module si les APIs publiques de viewport sont indisponibles ; MapLibre 5.24 utilise le chemin groupé.

### Vérifications navigateur

Chrome ordinateur, cache non froid : entrée prête vers 3,34 s dans un essai. Avant le premier geste, les deux sources locales disposent de z0 (1 tuile), z1 (4) et z2 (16). Rotation initiale jusqu’à −41° puis −75° : compteurs inchangés, zéro nouvelle tuile distante, aucun resize ni perte de contexte et console sans erreur/avertissement.

Paris ordinateur : 57 PBF dans le rayon conservateur de 5,75 km, **23 606 062 octets décompressés**. Le rendu prépare le disque de 3,5 km à 17,8 ; la vue carrée demande 25 tuiles, dont les 23 intersectant le disque. Vue CSS temporaire de 31 094 px, backing limité à 1 024 px, puis restauration complète. Étape de rendu observée à **5 082 ms**. Huit déplacements vers les points cardinaux et intermédiaires à environ **2,8 km** : **0 nouvelle requête réseau, 0 nouvelle demande de tuile au protocole par le moteur, 0 frame observée avec tuiles incomplètes**. Le rapport observe seulement 25 frames : cadence fortement limitée dans cet environnement, aucun FPS ni fluidité matérielle garanti. Les compteurs démontrent la réutilisation, pas un benchmark de temps de frame.

Après redimensionnements 1 120 × 800, 960 × 760, 1 440 × 900 puis 390 × 844 : zoom Campus 17,8 conservé, une seule surface canvas après préparation, aucun débordement. Couverture mobile réduite à 41 tuiles de Paris déjà présentes, aucun nouveau téléchargement. Le rendu clair du quartier est examiné.

Nouvelle sélection Lyon en portrait 390 × 844, avec changement vers le thème sombre : 33 PBF dans le rayon de 4,75 km, disque de rendu de 3,25 km (20 tuiles), étape de rendu **3 300 ms**, détail prêt, un canvas et aucun débordement. Le cache conserve les anciennes données dans son budget : compteur cumulé Paris/Lyon 90 téléchargements, 27 419 088 octets. Retours au pays puis au Monde : fond local, opacité urbaine nulle, compteur stable à 90 et aucune violation de transition ; Monde centré sur [6,18].

### Mode clair et contrôles automatisés

Surfaces blanches plus nettes, navigation active encre/turquoise et accents roses ciblés. Terre #19B8B5, océan #D9EEEE ; la calotte utilise la même terre. Les quartiers conservent des routes blanches et des bâtiments plus contrastés. Thème sombre et n°22 inchangés ; seuls le fond et les boutons clairs de l’entrée sont ajustés. Entrée, accueil, pays et Projets vérifiés sur ordinateur et portrait 390 × 844 ; Paris clair et Lyon sombre examinés avec les détails.

**104 contrôles** dans dix fichiers : navigation 10, style 12, gate 26, chargeur 4, préchargeur 12, préparation campus 13, resize 9, contours 5, calotte 5, préparation Monde 8. Les tests portent notamment sur frames neuves, erreurs, annulations, restauration dimensions/DPR, retargeting du resize et absence de redémarrage sur un geste ordinaire.

Limites : préparation anticipée des objets de rendu au **zoom d’arrivée uniquement** ; changer de niveau de zoom peut demander de nouveaux décodages, même si les PBF sont en cache. Pas de garantie de cache permanent après d’autres destinations. Pas de préparation de tous les campus d’un pays, ni mesure RAM/VRAM totale, transfert gzip complet, réseau froid/ralenti, téléphone physique ou FPS. Durées ci-dessus ponctuelles et sensibles au navigateur de contrôle. Les tests de timeout/remise en état ne remplacent pas un essai navigateur avec panne réseau provoquée. Mode clair proposé à l’utilisateur, sans acceptation esthétique ni publication.

Contrôle final de l’aperçu principal v17 : accueil clair ouvert après entrée visiteur, un canvas et aucun débordement, format ordinateur rétabli. Les 66 fichiers de la galerie restent identiques par SHA-256 et le préfixe antérieur du boarding est conservé.


## Anticipation d’un campus aléatoire — v18, 27 septembre 2026

Une seule destination est choisie à l’avance. Son téléchargement commence 160 ms après la préparation du monde ou du campus prioritaire et l’arrêt de la caméra ; il ne déplace pas la carte. Le rayon suit la couverture v17 : 3 km autorisés au centre, emprise du viewport et coins de la préparation agrandie.

Le préchargeur partage son cache brut de **48 Mio** entre destination choisie et anticipation. Au maximum six requêtes totales, quatre préchargements dont une anticipation ; renderer prioritaire (0), sélection (1), candidat (2). La sélection du candidat promeut son travail et son signal sans doublon ni annulation des téléchargements utiles. Le candidat suivant attend la fin de la préparation prioritaire, y compris après resize. Les destinations manuelles et annulations restent prioritaires.

Si campus actif et candidat ne tiennent pas ensemble dans le budget, l’anticipation annonce `partial` et laisse la place au campus actif ; les données manquantes se chargent à la sélection. Ce budget ne mesure pas la mémoire CPU/GPU totale. Les buffers anticipés ne constituent pas une préparation WebGL anticipée : le décodage et le rendu du quartier restent à finaliser après le clic. Aucun chargement instantané universel, gain FPS ou temps réseau garanti.

**116 tests dans 11 fichiers**, dont 18 du cache/préchargeur, 5 du candidat et du rythme, 10 du resize. Douze cas ajoutés par rapport à v17 : identité, promotion avec rayon identique ou changé, priorité manuelle, annulation du prochain candidat sans couper le travail promu, cache borné, durée/easing et conservation pendant resize. Audit indépendant de ces points : aucun bug concret identifié.

Contrôle Chrome ordinateur : `data-next-campus=roma`, phase `loading` puis `ready` pendant l’entrée, un canvas ; clic → Monde / Italie / 42 Roma, quartier prêt ; prochain candidat `iskandar-puteri` prêt, clic → Monde / Malaisie / 42 Iskandar Puteri, quartier prêt. Un troisième tirage est interrompu par Monde ; retour visible au Monde et prochain candidat prêt. Aucun nouvel avertissement/erreur console. Cache non froid ; pas de mesure FPS, de débit limité ni de téléphone physique. Le parcours est joué, sa fluidité n’est pas une mesure instrumentée.


## Contrôle navigateur des rampes v21 — 27 septembre 2026

Urduliz, ordinateur 1440 × 960 clair, candidat aléatoire brut prêt avant clic : phase de rendu terminée en environ 8 123 ms dans cette session (cache non froid, pas une durée garantie). Préparation des vues d’approche z15/16/17 confirmée. Durant la descente, échantillon observé au zoom16,92, opacité0,82, caméra en mouvement, tuiles prêtes ; détail plein à17,8. Retour Espagne : rues et bâtiments encore visibles sur plusieurs captures de recul ; opacité1 jusqu’au seuil15,5 puis valeurs0,88 à15,29,0,43 à14,96,0,06 à14,65. La dernière frame à14,5 a une opacité nulle avant la reprise du voyage local.

Firenze, mobile390 ×844 sombre : même échantillon d’approche intermédiaire, détail prêt à17,8 puis retour Monde. Recul observé, opacité1 à15,62,0,89 à15,30 et0,72 à15,15 avant masquage complet. Un canvas WebGL et aucun débordement horizontal à l’arrivée. `transitionFrames.violations` vide dans les deux parcours ; console sans nouvelle erreur/alerte. La cadence de collecte n’est pas suffisante pour annoncer un gain FPS ni garantir toutes les images d’un appareil réel.

Le diagnostic v17 accepte désormais explicitement le détail au niveau Pays pendant la phase `outbound`, et conserve au plus48 points de mouvement avec zoom, opacité et état des tuiles. Aucun de ces contrôles n’est chargé sans `?perf=1`. Le rayon de cache n’est pas augmenté par ces tests.


## Contrôle Chrome du parcours progressif v27 — 27 septembre 2026

Versions réellement rechargées : `progressive-campus-31`, moteur 27, gate 27, sortie 27, diagnostic 19. Session mobile émulée 390 × 844, sans réseau ralenti ni cache navigateur forcé à froid. Le diagnostic vivant expose les peintures évaluées par frame ; le JSON de navigation ne sert qu’aux jalons.

- **Nouveau quartier Nice** : immédiatement après le clic, phase `travel`, rayon encore `loading` à **0/36**. Caméra observée à z4,15 → 8,67 → 12,75, puis approche à **z15,09 / alpha 0,25**, **z16,25 / alpha 1** et z17,75. Pas de plateau de préparation GPU. Une seule surface canvas ; aucune flèche de bord pendant les frames du vol contrôlées.
- **Clic répété Angoulême** : zoom 17,8 conservé, `inFlight:false`, transitions détail 3→3, demandes de rendu 4→4 et téléchargements cumulés 77→77 au relevé immédiat. Aucune reprise du rayon ni du trajet observée.
- **Angoulême → Paris** : départ en recul, puis voyage et approche. Rues encore visibles pendant le recul ; à z16,15, opacité réelle du fond 0,884 et des routes 0,839, canvas visible sans couverture. L’approche passe par z14,78/alpha0,028 puis rejoint le détail. Le premier Angoulême avait révélé les détails tardivement : cela reste possible dans le compromis progressif et ne doit pas être décrit comme un chargement garanti avant l’arrivée.
- **Paris → France depuis le minimum manuel** : zoom 14,5 atteint avec alpha 1. Après le clic France, recul réellement observé jusqu’à 14,01 ; alpha 0,93 à 14,42, 0,61 à 14,29, 0,23 à 14,16 puis 0 à 14,01. Captures intermédiaires avec rues qui diminuent puis s’effacent ; pas de disparition immédiate ni flèche transitoire observée. Le retour haut zoom déjà examiné à l’étape précédente conserve sa courbe de 2,2 s.
- **Menu et stabilité** : FR clair, AR sombre RTL, trois lignes de langue 42 px, aucun débordement horizontal et un canvas. Console finale sans erreur ni avertissement dans cette session.

Les captures sont des observations ponctuelles, pas un enregistrement exhaustif ni une mesure FPS. Pas de téléphone physique, de pincement réel, de perte réseau simulée ni de nouveau benchmark mémoire. Les données brutes continuent à charger dans 48 Mio ; les nouvelles vues et surzooms peuvent encore demander du décodage. Les tests automatisés attestent les règles et les annulations ; ils ne valent pas acceptation esthétique par l’utilisateur.
