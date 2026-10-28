# 42 Horizon — accueil plus chaleureux

## Demande et statut — 27 septembre 2026

L’utilisateur trouve la direction artistique trop froide et demande un accueil plus accueillant **en conservant la charte 42**. Il précise que le mobile doit avoir sa propre composition, avec une **barre de navigation flottante en bas, arrondie et animée**. Il choisit explicitement de **garder l’accueil épuré autour du globe**, puis demande de rendre le globe lui-même plus accueillant.

Cette exploration web reste une **proposition locale**, sans acceptation esthétique finale ni publication. Le moteur actif est **v27**. L’entrée lance le double scan n°22 dès l’arrivée, attend sur le message chiffré, puis joue uniquement le décryptage après validation de la connexion simulée. Le slogan reste lisible 1,3 s ; révélation du 42 en 0,6 s, cercle en 0,8 s, puis raccord de 1,2 s au **même globe WebGL préchargé**, redimensionné et révélé à l’intérieur du cercle. Ce raccord remplace l’ancien fondu plein écran. Les huit accueils et l’entrée sont maintenant reportés dans Figma, avec ses limites de prototype vectoriel ; les archives de recherche restent conservées.

**Correction explicite suivante :** l’utilisateur refuse le panneau de carte séparé et veut descendre **directement dans le même globe**. L’aperçu actif utilise désormais une seule scène MapLibre, avec un seul canvas, du monde jusqu’au quartier du campus. La proposition précédente avec Leaflet reste consultable dans [son archive autonome](../../archives/early-prototypes/separate-city-map/index.html) ; elle n’est plus le comportement actif. Les sections historiques ci-dessous conservent ses étapes et leurs contrôles, sans les attribuer au nouveau moteur.

**Précision active suivante :** la navigation est maintenant organisée en **trois niveaux bornés**, choisis explicitement. Cliquer sur un pays puis un campus descend dans le même globe ; le chemin complet **Monde › pays › campus**, la flèche de retour et Échap permettent de remonter. La molette, le pincement et les boutons de zoom restent dans le niveau choisi. Les niveaux Monde et Pays partagent désormais le même fond local précis ; le détail distant s’active uniquement au niveau Campus. Cette réalisation remplace les transitions automatiques par seuil de zoom décrites dans les sections historiques.

**Moteur actif v27 — choix explicite « Zoom immédiat, préparation progressive » :** le clic lance le déplacement sans attendre la préparation graphique complète du quartier. Les données des 3 km et de l’emprise visible continuent à se charger en parallèle. Le détail apparaît dès qu’une première vue urbaine est prête ; le recul conserve son fondu lié au zoom, y compris depuis le minimum manuel. La section « Départ immédiat et préparation progressive — moteur v27 » décrit cet état. Les préparations bloquantes v17/v21 et leurs mesures sont conservées comme historique, pas comme description du moteur actif.

## Correction de fluidité — 27 septembre 2026

À la suite des ralentissements, scintillements et du déplacement au dézoom signalés par l’utilisateur, le moteur réduit le travail des repères et du masque, stabilise les libellés durant les gestes et redresse la caméra avant le retour au globe. Les vérifications, les chiffres mesurés et leurs limites figurent dans [PERFORMANCE_NOTES.md](PERFORMANCE_NOTES.md). Le gain mesuré porte sur les mutations DOM, pas sur les FPS. Le diagnostic optionnel se lance avec `index.html?perf=1` ; il n’est pas chargé dans l’aperçu normal.

## Réalisation active

- Globe géographique manipulable, océan bleuté en clair et sombre en thème nuit, continents turquoise et repères roses. Les niveaux Monde et Pays utilisent le même fond local complet ; le niveau Campus ajoute le détail vectoriel distant dans la même surface. Le clic sur un campus anime la caméra vers le zoom **17,8**, avec une inclinaison de **34°**, pour révéler les rues et les bâtiments autour de sa position. Les trois niveaux sont choisis explicitement, sans ouvrir d’encart de carte.
- Entrée avec double scan automatique, attente chiffrée puis connexion simulée pour le décryptage n°22, ou exploration en visiteur sans décryptage. La géographie et la carte se préparent en arrière-plan dès le premier affichage ; les commandes d’entrée restent disponibles pendant cette préparation. Aucune authentification réelle n’est effectuée.
- Accueil sans cartes, photos ou accroche éditoriale. Fond clair, diffusion légère de rose et de turquoise ; menu vertical sur ordinateur et globe à droite en FR/EN, disposition opposée en arabe sans miroir de la géographie.
- Mobile jusqu’à 700 px : globe centré en portrait, quatre rubriques dans une capsule en bas, indicateur glissant, espaces de sécurité et commandes adaptées à la hauteur disponible. Les contenus s’ouvrent dans un panneau au-dessus de la barre ; en paysage compact, le globe et les commandes se répartissent horizontalement.
- Rubriques Explorer, Projets, Parcours et Le journal ; filtrage des exemples selon le périmètre. Sélecteur pays/campus disponible indépendamment de l’orientation du globe. Boutons de zoom et retour, rotation par glissement et commandes clavier.
- FR/EN/AR, interface RTL, thème clair par défaut et sombre. Le bloc de marque conserve l’ordre 42 puis nom ; arabe affiché en AR. Cet aperçu avec connexion simulée mais sans région de connexion simulée ne couvre pas le cas anglais avec connexion IP dans le monde arabe.
- Réduction des mouvements prise en compte dans le CSS, les animations des contenus et les déplacements du globe. En cas d’activation pendant un déplacement vers une destination, la destination est appliquée directement.

## Navigation bornée et fond commun Monde/Pays — principes conservés depuis v12

Le fil géographique affiche tous les niveaux parcourus, par exemple **Monde › France › 42 Paris**. Ses ancêtres sont cliquables ; le dernier élément garde le chevron qui ouvre le sélecteur des 58 campus et sa recherche. Le niveau courant porte `aria-current="page"`, le chemin a un nom accessible FR/EN/AR et ses séparateurs suivent le RTL. Les noms officiels, dont Codam et 1337, sont conservés ; les noms longs se tronquent visuellement sur mobile sans supprimer leur texte accessible. La flèche et Échap remontent d’un niveau. Le zoom ne change plus le pays ou le campus sélectionné.

Les contraintes sont centralisées dans [navigation-policy.mjs](../navigation-policy.mjs) et appliquées aux demandes de caméra natives par `transformConstrain`, y compris à la cible de molette/pincement. Un simple écrêtage après rendu laisserait s’accumuler une cible hors limite ; la contrainte actuelle agit avant le déplacement.

| Niveau | Zoom autorisé au repos | Déplacement du centre de caméra |
| --- | --- | --- |
| Monde | Du cadrage calculé pour le format à ce cadrage **+ 1,8** ; les deux bornes sont compensées selon la latitude pour conserver la taille apparente du globe. | Longitude rebouclée, latitude limitée à **−75° / +75°**. |
| Pays | De `countryZoom − 0,25` à `countryZoom + 2,1`, avec un plafond absolu de **9,5**. | Rectangle géographique du pays utilisé pour le cadrage, élargi pour inclure tous ses campus, puis marge de **3 %** par axe avec un minimum de **0,05°**. |
| Campus | **14,5 à 19**, arrivée à **17,8**. | Centre limité à un rayon géodésique de **3 km** autour des coordonnées retenues du campus. |

Ces bornes portent sur **le centre de caméra**, pas sur tous les pixels visibles. Le cadre peut donc montrer des alentours au-delà du rayon de 3 km. Le niveau Pays utilise un rectangle, pas le contour politique du pays : des pays voisins ou de l’eau peuvent rester visibles. Les longitudes sont traitées en intervalle continu près de l’antiméridien. Les réglages numériques sont des choix de réalisation du prototype, pas une garantie de précision géographique des campus.

**Séquence historique v12, remplacée par les séquences suivantes, désormais v27 :** les vols duraient **1,5 s vers un pays**, **2,8 s vers un campus** et **2 s vers le monde**, hors préférence de mouvement réduit. Si un détail était affiché avant un départ vers Pays/Monde ou vers un autre campus, un fondu préalable de **200 ms**, caméra immobile, s’ajoutait avant le vol. Le niveau Pays étant local en v11, l’approche d’un campus préparait toujours son détail si nécessaire ; la sélection du même campus conservait le détail déjà révélé. La suspension des gestes pendant le trajet, le fil utilisable pour remplacer la destination et le relâchement temporaire des bornes locales restent actifs. Les boutons de zoom reflètent les limites du niveau une fois au repos.

Le fond actif provient de **Natural Earth 5.1.1, Admin 0 Countries au 1:10 millions**, avec **258 entités géographiques** et les 30 pays du catalogue présents. Le fichier principal [world-countries.topo.json.gz](../geography/world-countries.topo.json.gz) pèse **2 006 643 octets** (environ 2,01 Mo) ; ce poids est celui de l’asset, pas une mesure de mémoire ou de vitesse de chargement. La [provenance et la construction](../geography/PROVENANCE.md) documentent la source officielle, le domaine public, la simplification sphérique à seuil de 10 mètres et la quantification. Le nom « 10m » du jeu désigne son échelle, pas une précision géographique de dix mètres. Natural Earth conserve ses généralisations de côtes ; ce fond ne certifie pas les positions des campus au bâtiment près.

Les terres, les côtes et les frontières sont rendues dans **la même carte MapLibre et le même canvas** aux niveaux Monde et Pays. Le worker extrait aussi un maillage de frontières partagées pour éviter de tracer deux fois les limites voisines. Les sources GeoJSON locales utilisent `maxzoom: 10` et `tolerance: 0.2`. MapLibre prépare encore ses géométries et ses tuiles locales : l’absence de téléchargement de tuiles distantes à ces niveaux ne promet pas un coût nul de préparation ou de rendu GPU. Le petit fond antérieur [world.json](../../shared/map-data/world.json), 177 pays et 110 736 octets, est conservé pour les archives, mais n’est plus chargé par l’accueil v11.

Le style initial contient uniquement les couches locales : **aucune source OpenFreeMap, URL de glyphes ou couche de texte cartographique distante n’est installée avant la première sélection Campus**. Le pays utilise donc le même fond que le Monde, sans remplacement à son arrivée. Les ressources initiales du site et l’asset géographique doivent néanmoins être chargés ; ce n’est pas une garantie de fonctionnement hors ligne sans cache. Les repères et noms des 58 campus viennent toujours de l’annuaire local distinct.

### Entrée n°22 et préparation en arrière-plan — v11

[entrance.mjs](../entrance.mjs) réutilise directement le moteur conservé du n°22. **Précision utilisateur du 27 septembre : le double scan démarre dès l’arrivée, sans connexion.** L’animation joue les deux passes binaire → hexadécimal → chiffré de 0 à 3,65 s, puis conserve le message chiffré. Les boutons restent disponibles. Seule la confirmation d’une connexion **simulée** déclenche la résolution des caractères, de 3,65 à 6,8 s : tous commencent ensemble et se résolvent dans l’ordre pseudo-aléatoire choisi. Une confirmation précoce attend la fin du scan déjà en cours ; elle ne le rejoue pas. L’accès visiteur interrompt le scan et rejoint directement le parcours commun logo/cercle/globe. Un retour au message après erreur conserve la progression du scan.

**Raccord plus expressif demandé dans le même échange :** après résolution complète, **BEYOND THE CODE reste 1,3 s**, puis se resserre et s’efface pendant la révélation du 42 (600 ms, masque vertical, flou léger et échelle). Le cercle se trace en 800 ms. Une fois la carte prête, il se déplace et s’agrandit en 1,2 s jusqu’au centre et au rayon CSS de la sphère préchargée : **le même globe WebGL apparaît dans le cercle**, avec masque extérieur ; il n’y a plus de fondu plein écran vers une seconde image. La géométrie est fournie par le moteur, et la position du filtre reste fixe. Le visiteur suit ces trois étapes communes sans déchiffrement ni maintien du slogan. Un redimensionnement termine immédiatement le raccord afin de restituer la mise en page réelle.

La préférence de mouvements réduits présente directement le message chiffré et supprime les délais et déplacements après confirmation. Un onglet masqué suspend le scan ou le déchiffrement. Les libellés restent FR/EN/AR ; les sources de l’archive n°22 sont inchangées. **Seize contrôles ciblés du véritable contrôleur d’entrée passent depuis la correction de démarrage visible décrite en fin de document**, avec horloge, DOM et rendu simulés : scan initial, attente chiffrée, connexion précoce/tardive, maintien du slogan, raccord, visiteur, onglet masqué, mouvements réduits et retour après erreur. Ils ne remplacent pas l’examen visuel dans le navigateur.

Après le premier affichage de l’entrée, [geography-worker.mjs](../geography-worker.mjs) télécharge le TopoJSON compressé, le décompresse avec `DecompressionStream`, le parse puis produit les entités et le maillage de frontières hors du fil principal. Si cette API manque, il charge le même TopoJSON brut de repli, plus lourd (**5 392 533 octets**), sans télécharger les deux variantes dans le parcours normal. Le contrôleur [geography-loader.mjs](../geography-loader.mjs) mutualise la demande et son résultat ; la préparation déclenchée à l’entrée puis sa consultation au moment d’ouvrir l’accueil ne lancent pas deux chargements.

Les bibliothèques locales D3/MapLibre et les données du réseau se chargent en parallèle. La carte est créée derrière l’entrée : le contenu principal est `inert` et masqué avec `visibility: hidden`, tout en gardant ses dimensions. L’ouverture attend le statut `ready` du premier état local rendu, puis **conserve la même instance de carte**. Si la préparation dure davantage que l’animation, le message d’attente reste visible ; une erreur ou un délai dépassé propose de réessayer ou de revenir au message. Le délai du worker et celui de préparation de la carte sont bornés à 45 secondes chacun, sans garantie d’une durée totale de 45 secondes. Le diagnostic d’entrée est disponible avec `?perf=1`.

### Historique : détail Campus, rayon complet et retours — v12

Au premier campus, `ensureGlobeDetail()` ajoute la source OpenFreeMap, ses couches et l’URL de glyphes ; ces ressources n’étaient pas présentes dans le style initial. Le détail commence à se préparer **pendant le vol, à opacité zéro**, sur le fond local toujours visible. [detail-gate.mjs](../detail-gate.mjs) attend le rayon complet en cache, un nouveau rendu, la caméra immobile, la source et les tuiles chargées, sans erreur retenue. Le premier `render` prêt déclenche le **fondu de 450 ms** ; `idle` reste un secours.

Depuis un campus détaillé, revenir vers Pays ou Monde efface d’abord le détail pendant **200 ms, caméra immobile**, puis masque ses couches avant le départ. L’arrivée Pays demeure entièrement locale. Le même masquage protège un changement vers un autre campus ; la nouvelle vue prépare ensuite son détail pendant le vol. Une interruption annule l’attente précédente, les thèmes conservent l’opacité et la réduction des mouvements supprime les durées. Une source distante déjà installée reste disponible pour les visites suivantes, mais ses couches restent masquées aux niveaux Monde/Pays.

À la demande explicite suivante de l’utilisateur, [campus-preload.mjs](../campus-preload.mjs) prépare désormais **toutes les tuiles qui intersectent le disque de 3 km du campus sélectionné**, dès le clic. Pas de préparation des autres campus du pays. Le niveau natif **z14** est aussi le minimum et le maximum de la source distante ; le fond local suffit pendant les échelles intermédiaires du vol. Les vues Campus 14,5–19 réutilisent ces données natives par surzoom.

Le protocole MapLibre personnalisé partage le même cache de buffers avec le préchargeur et déduplique les téléchargements en cours ; chaque livraison au worker copie son buffer pour préserver l’original. Six requêtes au maximum, dont quatre d’anticipation, priorité aux demandes de la vue. Le cache est plafonné à **24 Mio** de buffers protobuf, conservé et borné entre visites ; quitter Campus annule son anticipation. Les erreurs et l’éviction de données empêchent de déclarer le rayon prêt. Le bouton Réessayer conserve les données utiles et reprend les manquantes ; une erreur de rendu reste distincte d’un disque prêt et relance explicitement la source via l’API publique setUrl.

Paris couvre **21 tuiles**, Lyon 16, Tokyo 14. Dans le contrôle final Paris, 21 téléchargements alimentent **8 585 507 octets de buffers décompressés** ; après dézoom et déplacement de 240 m environ, le compteur réseau reste à 21 et les lectures du moteur dans le cache passent de 2 à 4. Cela ne mesure ni le transfert gzip, ni toute la RAM/VRAM. Le traitement local des tuiles et de nouveaux glyphes reste possible ; les pixels du viewport peuvent aussi dépasser les 3 km autorisés au centre. Aucun gain FPS ni absence absolue de chargement visible n’est promis. L’étude historique reste dans [PRELOAD_ESTIMATE.md](PRELOAD_ESTIMATE.md).

### Correction polaire — v12

Le cercle et les traits autour de l’Antarctique provenaient de 748 segments de fermeture géométrique affichés comme frontières. Le worker les retire du maillage de lignes, sans modifier les pays de sélection. La fente jusqu’au pôle venait du découpage Mercator : une petite calotte dessine directement sur la sphère les terres au sud de **85,23° S**, dans le même contexte WebGL. Thèmes, horizon, visibilité et ressources GPU sont gérés ; pas de second canvas. Les sources, tests et limites de la mince zone proche de 85,051° S sont détaillés dans [POLAR_NOTES.md](POLAR_NOTES.md). Le contrôle Chrome clair/sombre avec zoom ne retrouve plus le cercle ni la longue fente.

### Vérifications techniques de v11 et v12

- **48 tests du moteur et du style passent** : 10 de politique de navigation, 26 du contrôle de préparation/fondu et 12 du style. Les nouveaux cas vérifient l’absence de source/glyphes distants au départ, le thème local, l’installation paresseuse idempotente du détail et le maillage de frontières séparé.
- **4 tests du chargeur géographique passent** : mutualisation du chargement et du résultat, nouvel essai après erreur, expiration d’un worker silencieux et échec de création du worker. Ils utilisent un worker simulé ; ils ne mesurent ni le débit réel ni le rendu de l’entrée.
- Syntaxe moteur/style/diagnostic valide ; les styles locaux, thèmes et états d’opacité ont été vérifiés avec le validateur exact MapLibre 5.24. Les contrôles géographiques reproductibles sont consignés dans [geography/PROVENANCE.md](../geography/PROVENANCE.md) et [CHECKS.json](../geography/CHECKS.json).
- Chrome : entrée visiteur et n°22 mobile terminés, préparation pendant l’écran crypté, Monde/Pays locaux, Paris complet puis déplacement dans le cache, retours et rendus polaires clair/sombre contrôlés. **9 tests de préchargement campus et 10 tests polaires** passent également, soit **71 contrôles automatisés** au total. Les résultats et limites sont consignés dans PERFORMANCE_NOTES.md ; les relevés v8–v10 ci-dessous restent historiques.

## Historique v8–v10 : transitions entre fond local et détail

**État remplacé par v11 ci-dessus.** Ces versions utilisaient le fond local simplifié au Monde et préparaient du détail distant au Pays. Ce chargement Pays n’existe plus dans l’état actif ; les résultats et incidents suivants sont conservés comme historique, sans être attribués à l’entrée n°22 ou au nouveau fond précis.

Le clic sur un pays pouvait activer le fond terrestre détaillé avant ses polygones d’eau : pendant le chargement, il recouvrait les côtes locales d’une grande surface turquoise. Ce flash a été reproduit visuellement avant correction. La première correction préparait le pays après l’arrivée, ce qui retardait son détail. Depuis **v9, comportement conservé en v10**, le moteur prépare le pays dès le vol, à opacité zéro : le fond local reste visible pendant que les ressources de la vue sont demandées.

Le module [detail-gate.mjs](../detail-gate.mjs) exige un nouveau rendu depuis la préparation, une caméra immobile, `isSourceLoaded('openmaptiles')`, `areTilesLoaded()` et aucune erreur de source/métadonnées/glyphes retenue. **Le premier événement `render` satisfaisant ces conditions déclenche la révélation ; `idle` reste un secours, pas un préalable.** Cela évite d’attendre le fondu interne des symboles alors que la vue est déjà prête. Le détail apparaît par un **fondu de 450 ms** ; la réduction des mouvements supprime cette durée. Une erreur de chargement pendant l’attente conserve le fond local au lieu de révéler des tuiles considérées à tort comme prêtes. Changer de destination invalide une attente antérieure.

Lors d’une première approche directe d’un campus sans détail encore affiché, les couches se préparent également en transparence pendant le vol ; leur révélation attend la vue arrivée et prête. Une descente depuis le pays sélectionné vers l’un de ses campus, ou la sélection du même campus, conserve le détail déjà révélé. **Un départ vers Pays ou Monde, un changement de campus ou un campus d’un autre pays efface d’abord le détail pendant 200 ms, sans déplacer la caméra**, puis masque ses couches avant le vol. Cette protection des changements de campus est ajoutée en v10. La nouvelle vue Pays/Campus est ensuite préparée en transparence pendant le trajet. Le moteur attend le résultat de `fadeToLocal()` : une interruption résout la promesse avec `false`, ce qui empêche une ancienne destination de redémarrer. Les phases locale, en attente ou en erreur n’ajoutent pas ce délai ; les mouvements réduits le suppriment. Les changements de thème préservent le multiplicateur d’opacité et les courbes de zoom.

Ce mécanisme prépare **la vue demandée**, pas tout le disque de 3 km ni toutes les vues et échelles possibles autour des 58 campus. Le préchargement complet du voisinage restait non réalisé à cette étape historique ; v12 le réalise désormais pour le campus choisi. Une fois le détail affiché, les gestes suivants ou une nouvelle zone peuvent encore provoquer l’arrivée visible de tuiles ; cette correction ne prétend pas supprimer ce phénomène partout, ni augmenter les FPS.

La comparaison entre le préchargement du seul campus choisi et celui de tous les campus d’un pays figure dans [PRELOAD_ESTIMATE.md](PRELOAD_ESTIMATE.md), avec ses [données de calcul](../PRELOAD_ESTIMATE.json). Elle distingue les neuf téléchargements d’échantillonnage des extrapolations et ne constitue ni une implémentation du préchargement complet ni une mesure CPU/RAM.

Un incident temporaire de module manquant avait également laissé le message de préparation affiché au démarrage. La correction introduite en **v8**, conservée par l’import alors actif **`v=10`**, place l’import dynamique du moteur dans le bloc de gestion d’erreurs de `welcome.mjs`. Un échec d’import affiche donc l’état d’erreur, au lieu de laisser indéfiniment le statut initial. Ce correctif de démarrage est distinct du fondu cartographique.

Contrôles v9 : **19 tests de préparation/révélation et de retour au fond local**, **10 tests de politique de navigation** et **7 tests de modulation du style** passent. Un premier parcours Chrome vers la France relève le début de révélation **2,3 ms après l’arrivée**, puis la phase `detail` après le fondu d’environ 450 ms. Il s’agit d’un seul essai dont le cache n’est pas froid, pas d’un délai garanti. Les 88 événements de rendu suivis pendant la préparation, puis les 12 rendus du fondu de retour et les 110 rendus du trajet Monde, ne relèvent aucune violation des contrôles de séquencement ; le centre de caméra reste inchangé durant le fondu préalable. Ce comptage n’est pas une mesure de FPS.

Le complément de vérification passe les cinq étapes de limites et cumule **334 rendus de trajet Monde et 23 rendus de fondu**, sans violation : pendant le trajet Monde, les couches détaillées sont masquées et leur opacité cible vaut zéro ; pendant le fondu, `isMoving()` vaut faux et centre, zoom et inclinaison restent inchangés. Ces relevés précèdent l’extension v10 aux changements de campus et ne constituent pas sa validation spécifique.

Contrôles finaux **v10** : France → Paris au zoom **17,8** → France confirme le fondu avant départ et la préparation pendant le vol. La révélation du retour France commence **1,8 ms après l’arrivée dans cet essai avec cache**, sans garantie sur une première visite. Un trajet France → Monde interrompu après environ 430 ms par une nouvelle sélection de France termine bien en France, sans départ tardif vers l’ancienne destination. Le suivi de ce parcours relève **248 rendus de préparation Pays, 21 de fondu et 12 de trajet Monde**, sans violation des invariants précédents.

Sur mobile **390 × 844 sombre**, Luxembourg → France → Paris au zoom 17,8, puis retour direct Monde sont joués. Le format ordinateur est rétabli pendant la phase de départ ; le globe arrive visuellement centré. Un seul canvas, aucun débordement horizontal relevé et console sans erreur ni avertissement sur le parcours. La préférence de mouvement réduit n’a pas été forcée dans Chrome ; sa gestion est couverte par les tests du module. Ces vérifications ne démontrent ni un gain FPS ni l’absence de toute apparition ultérieure de tuiles.

La condition v10 de protection **Campus A → Campus B**, y compris entre pays, a été relue dans le code ; ce trajet n’a pas été joué dans le navigateur pendant cette intervention. Les essais v10 ci-dessus couvrent les retours Pays/Monde, le mobile, le redimensionnement et le remplacement d’une destination.

Contrôles conservés de la correction v8 : les huit combinaisons de thème et d’opacité examinées passent le validateur exact de style MapLibre 5.24. La visite Paris termine au zoom 17,8 avec détail. Le parcours Monde → France est joué avec redimensionnement **390 × 844** et passage au thème sombre pendant le vol : côtes conservées pendant l’approche, puis carte détaillée et libellés à l’arrivée. Le retour Monde par le chemin, le rétablissement du format ordinateur et du thème clair terminent avec le chemin Monde et le statut de chargement masqué. Un seul canvas, aucun débordement horizontal relevé, console sans erreur ni avertissement sur ce parcours. Ces résultats précèdent les changements de séquencement v9 ; ils ne remplacent pas leur contrôle mobile.

### Contrôles historiques de la navigation bornée avant v11

- Les **10 tests unitaires** de [navigation-policy.test.mjs](../navigation-policy.test.mjs) passent : limites Monde/Pays/Campus, compensation de latitude, marges, campus hors rectangle initial, antiméridien, vols et absence de mutation des données fournies.
- Le parcours exécuté avec MapLibre valide **5 étapes avec assertions** : zoom maximal au Monde, zoom minimal au Monde, conservation de la France lors d’une demande de déplacement/zoom extrême, conservation de Paris avec zoom minimal et rayon de 3 km, puis retour explicite au Monde avec fond local. Ces contrôles utilisent des demandes de caméra programmatiques ; ils ne remplacent pas un pincement sur téléphone.
- Chrome contrôlé sur ordinateur **1900 × 971** et mobile **390 × 844**, avec thèmes clair/sombre et FR/AR : un seul canvas, pas de débordement horizontal relevé, fil complet, sélecteur conservé et navigation explicite. Les retours **France/Monde par le chemin** sont joués, dont le remplacement d’un vol Paris par Monde. Le clic sur le repère France rend le focus au globe ; sélectionner Paris puis presser Échap pendant le vol revient en France. Le chemin complet est aussi contrôlé après l’arrivée à Paris.
- La molette atteint la butée Monde sans changer de niveau ; un cran supplémentaire reste à la limite et le premier petit geste inverse repart immédiatement. Le parcours diagnostique complet est rejoué avec toutes ses assertions après correction du collecteur réseau. Aucune erreur ni aucun avertissement dans la console de ce contrôle.
- Les contrôles de syntaxe des cinq modules vérifiés passent, ainsi que les **10/10 tests** de politique de navigation. Aucun nouveau gain FPS n’est mesuré. Pas de test sur téléphone physique, de panne réseau simulée, de visite exhaustive des 58 quartiers ni d’acceptation finale de l’utilisateur. Les mesures antérieures et leurs limites restent dans [PERFORMANCE_NOTES.md](PERFORMANCE_NOTES.md).

## Références et périmètre graphique

Le PDF local [Charte graphique 2024](../../docs/42%20-%20Charte%20graphique%202024.pdf) a été relu et ses pages utiles examinées : noir/blanc p. 17 ; couleurs secondaires p. 18 ; palette « Bubbly », inclusion et rose p. 21 ; dégradés p. 22 ; exemples UI p. 30–35. Les teintes principales utilisées sont le turquoise `#00BABC`, le rose UI `#EC3391` et leurs mélanges transparents avec le blanc ou le fond sombre. La capsule et son animation sont une interprétation proposée, pas un composant officiel imposé par la charte.

Le dessin du logo est repris du SVG existant. Jost reste le substitut provisoire du projet ; la police Futura PT exacte n’est pas fournie. L’interface arabe utilise les polices de repli du navigateur. Les libellés cartographiques du détail Campus utilisent les glyphes Noto Sans servis par OpenFreeMap, chargés seulement après une sélection Campus ; ce choix ne remplace pas la typographie de l’interface.

Les captures actuelles des accueils Figma ordinateur `115:4` et mobile `123:162` ont été consultées pour comparer la composition. Aucun nœud Figma n’a été modifié.

## Fichiers et lancement

- `index.html` : structure, logo existant et icônes.
- `welcome.css` : couleurs locales, compositions ordinateur/mobile, thèmes et transitions.
- `welcome.mjs` : langues, navigation, panneaux, sélecteurs, contenus de démonstration et préparation de la carte pendant l’entrée.
- `entrance.mjs`, `entrance.css` : entrée raccordée au moteur n°22, accès visiteur/connexion simulée, logo/cercle, attente et fondu vers l’accueil.
- `geography-loader.mjs`, `geography-worker.mjs`, `geography-loader.test.mjs` : téléchargement/décompression/décodage en worker, mutualisation, erreurs et 4 tests.
- `geography/world-countries.topo.json.gz` : asset principal ; `geography/world-countries.topo.json` : repli sans DecompressionStream. [PROVENANCE.md](../geography/PROVENANCE.md), `build.mjs`, `verify.mjs`, `BUILD.json` et `CHECKS.json` documentent leur construction et leurs contrôles.
- `integrated-globe.mjs`, `integrated-globe.css` : moteur actif, caméra continue, périmètres, repères et fondu progressif des bords.
- `navigation-policy.mjs`, `navigation-policy.test.mjs` : règles de zoom/déplacement des trois niveaux et leurs 10 tests unitaires.
- `globe-style.mjs`, `style-gating.test.mjs` : style Horizon, fond commun Monde/Pays, installation paresseuse, opacité liée au zoom, thèmes et conservation du cache décodé ; 17 tests.
- `detail-gate.mjs`, `detail-gate.test.mjs` : préparation transparente de la vue courante, révélation en mouvement ou tardive, annulations et 32 tests.
- `campus-preload.mjs` et ses 18 tests : disque de 3 km plus viewport, cache brut commun borné, anticipation du prochain candidat, priorité, annulation et réessai.
- `campus-outbound.mjs`, `campus-outbound.test.mjs`, `campus-approach.test.mjs`, `layout-resize.test.mjs` : approche progressive, recul relatif, clic répété/réessai et redimensionnement ; respectivement 14, 8 et 14 tests.
- `campus-render-preparation.mjs` et ses 16 tests : préparation graphique historique conservée, **non importée par le moteur actif**.
- `random-campus.mjs` et ses 5 tests : candidat stable jusqu’au clic, exclusion du campus courant et durée des trajets.
- polar-geometry.mjs, polar-cap-layer.mjs et leurs tests : contours et surface sphérique au pôle.
- `perf-diagnostics.mjs` : diagnostic facultatif `?perf=1`, mesures et parcours de vérification des limites.
- `vendor/maplibre-gl.js`, `vendor/maplibre-gl.css`, licence et [provenance](../vendor/maplibre-PROVENANCE.md) : MapLibre GL JS **5.24.0** conservé localement.
- `campuses.json`, `campus-location-overrides.json` : annuaire daté et corrections de localisation documentées dans [CAMPUS_SOURCES.md](CAMPUS_SOURCES.md).
- `globe.js`, `city-map.mjs`, `city-map.css` et Leaflet dans `vendor/` : sources antérieures conservées, **non chargées par l’accueil actif**. Leur [documentation historique](CITY_MAP_NOTES.md) renvoie à la [copie autonome avec carte séparée](../../archives/early-prototypes/separate-city-map/index.html).

Le moteur de rendu MapLibre est local. D3 7.9 et TopoJSON 3.1 sont conservés dans `../../shared/map-data/` ; la géographie active Natural Earth 5.1.1 vient de `geography/`. Elle sert à la résolution du pays, à son cadrage et au fond commun Monde/Pays. Le détail Campus vient des **tuiles vectorielles OpenFreeMap, schéma OpenMapTiles et données OpenStreetMap**. WebGL reste nécessaire. Depuis v18, le candidat aléatoire peut demander ses métadonnées et ses tuiles brutes après préparation du monde, dès l’entrée ; les couches cartographiques distantes et leurs glyphes sont installés à la première sélection Campus. L’attribution reste visible à côté de la scène, hors du masque de fondu. Le SVG 42, les tokens existants et Jost sont réutilisés sans modification.

L’annuaire contient **58 campus dans 30 pays** ; les cinq lieux initiaux gardent leurs contenus de démonstration. 18 positions ont été corrigées à partir de sources cartographiques et des adresses officielles ; les 40 autres gardent les coordonnées du réseau, sans vérification individuelle du bâtiment. Les projets, parcours et articles restent fictifs, sans API Intra ni base de données.

Depuis la racine du projet :

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Ouvrir <http://127.0.0.1:8765/site/index.html>. Ne pas lancer un second serveur si celui du projet fonctionne déjà. Aucun hébergement public n’a été créé.

## Vérifications de la première proposition — 27 septembre 2026

Ces contrôles portent sur le moteur D3/SVG initial. Les vérifications techniques de la version active figurent dans « Navigation active v12 et fond commun Monde/Pays » ci-dessus ; les premières vérifications MapLibre restent conservées plus bas comme historique.

- Syntaxe JavaScript des deux fichiers vérifiée avec `node --check` ; relecture indépendante du moteur et de ses interactions.
- Rendu Chrome examiné sur ordinateur 1920 × 1047, mobile 390 × 844, petit écran 320 × 568 et paysage 667 × 375. Aucun débordement du document dans les mesures effectuées. Barre basse, indicateur actif, panneaux et fermeture examinés, dont petit écran en arabe sombre.
- Navigation entre les quatre rubriques, changements rapides, passage FR → AR → EN → FR et thèmes clair/sombre joués. Ordre RTL, marque et repères contrôlés visuellement.
- France → Paris par les repères, Tokyo par le sélecteur, filtrage des projets par campus, retour au monde, zoom par bouton, rotation par glissement souris et retour par Échap joués. Le repère sélectionné transmet le focus au globe. Une fiche d’exemple s’ouvre ; Échap ferme la boîte et rend le focus à son bouton d’origine.
- Corrections pendant les contrôles : contour SVG hérité des icônes, hauteur minimale du mobile, espaces de sécurité, ancrage RTL des repères, focus après sélection, thème changé pendant le chargement, texte de présentation masqué derrière les panneaux, retour du défilement en haut et arrêt des animations lors d’un changement de préférence.
- Les huit sources de référence relevées avant le travail (ancien globe, scène, déchiffrement principal et moteurs du n°22) sont identiques octet pour octet après les modifications.

Limites : pas de mesure de FPS, pas de contrôle sur téléphone physique ni de geste pincé joué ; la réduction des mouvements a été relue dans le code mais pas forcée dans le navigateur. Aucun audit exhaustif d’accessibilité ni contrôle de tous les navigateurs. Les contrôles ne prouvent ni intégration au parcours complet ni acceptation de cette proposition.

## Correction des bords au zoom — 27 septembre 2026

Étape historique du moteur SVG ; le même besoin de fondu progressif est conservé sur le canvas du moteur actif.

L’utilisateur signale les bords nets du globe zoomé et demande une transition progressive. La coupure rectangulaire venait des limites du SVG. Un masque transparent sur ses quatre côtés fait maintenant apparaître le fond réel, en clair comme en sombre. Il s’applique au SVG seul ; les repères HTML, leur focus et les commandes restent hors du masque.

La largeur du fondu augmente continûment entre les zooms 1 et 1,55, puis reste plafonnée : 14 % de la largeur jusqu’à 180 px horizontalement, 18 % de la hauteur jusqu’à 150 px verticalement. À zoom 1, elle vaut zéro et conserve le contour entier. Le réglage suit le zoom et le redimensionnement dans `render()`, sans nouveau relevé DOM par frame. Seul `globe.js` est modifié pour cette correction.

Vérification : coupure reproduite avant modification ; syntaxe JS valide ; rendu après correction examiné sur ordinateur clair 1920 × 1047 au niveau France et mobile sombre 390 × 844 au niveau Paris. Sélection des repères, retour au monde et boutons de zoom joués. Les valeurs observées passent de 0 au niveau Monde à un fondu intermédiaire au premier cran de zoom, puis au fondu complet. Le masque des repères reste absent ; aucun débordement horizontal relevé sur le mobile contrôlé. Pas de nouveau contrôle sur appareil physique, Safari ou Firefox.


## Étape historique : navigation complète, annuaire et carte séparée — 27 septembre 2026

La proposition Leaflet décrite dans cette section a été remplacée à la demande explicite de l’utilisateur. Elle reste jouable dans [l’archive autonome](../../archives/early-prototypes/separate-city-map/index.html).

Trois demandes explicites se succèdent : le zoom doit changer de périmètre comme le dézoom ; tous les campus doivent être intégrés ; cliquer sur un campus doit descendre jusqu’à sa ville et sa position, avec un mouvement de carte évoquant Call of Duty.

Le zoom au pointeur conserve maintenant le lieu visé pendant l’agrandissement. Il passe du monde au pays à partir de 1,75, puis au campus proche à partir de 4,2–4,5 selon l’étendue du pays. Les seuils de retour sont distincts pour éviter les oscillations. Les boutons et le clavier visent le centre, la molette et le pincement suivent leur ancrage. Le masque progressif des bords reste actif. Les sélections explicites gardent leur déplacement animé.

Les pays et repères viennent du catalogue officiel du réseau : **58 campus référencés dans 30 pays**, comparés aux 58 fiches du sitemap. Les noms officiels, dont Codam et 1337, sont conservés. La liste se recherche par campus ou pays, se filtre par pays et reste utilisable même pour une destination au dos du globe. Les libellés du globe se compactent lorsqu’ils se chevauchent ; la liste fournit les grands boutons de sélection. Singapour et la Palestine, absents du petit fond Natural Earth, disposent d’un repère et d’un repli de sélection géographique. Les campus sans contenu fictif affichent un état vide explicite. Le catalogue est statique et daté, sans prétendre que toutes les admissions sont ouvertes.

Après sélection d’un campus, le contrôleur laisse 650 ms au déplacement du globe, puis ouvre une carte de la ville qui descend du zoom 13 au zoom 18 en environ 3,2 s. Les rues et bâtiments OpenStreetMap sont réels ; un repère rose marque les coordonnées retenues. L’utilisateur peut interrompre le déplacement et explorer les environs. Les commandes de zoom pilotent alors cette carte. Dézoomer jusqu’à 11 ou presser Échap revient au pays ; continuer à dézoomer revient au monde. Changer de campus ou revenir au monde annule l’arrivée en attente. Sur mobile, la carte occupe son propre cadre au-dessus des commandes et de la barre basse ; elle est masquée quand un panneau de contenu recouvre cet espace, pour conserver les crédits lisibles dans la vue cartographique.

Le fichier officiel est préservé ; les 18 corrections sourcées sont fusionnées au chargement pour le globe et la carte. Le libellé distingue repère publié par le réseau, emplacement cartographié du campus et repère de son adresse. Le zoom ne certifie pas la précision des 40 autres positions. Voir [la provenance](CAMPUS_SOURCES.md) et [le module de carte](CITY_MAP_NOTES.md).

### Vérifications supplémentaires

- Syntaxe des trois fichiers JS valide ; relecture indépendante des transitions et de la fusion des données. Les 58 coordonnées, après les 18 corrections, retrouvent leur pays avec la géométrie et le repli utilisés par le moteur. Identifiants uniques, pays valides, coordonnées bornées ; annuaire et sitemap concordants.
- Ancrage orthographique vérifié numériquement sur 2 000 cas reproductibles avec le calcul réel du moteur : erreur maximale inférieure à 10⁻¹² pixel. Une autre relecture a contrôlé 20 000 configurations. Ces calculs ne constituent pas une mesure de fluidité.
- Monde → France → Paris → carte urbaine joué à la molette. Dézoom de la carte vers la France, puis du pays au monde joué avec les commandes ; Échap rend le focus au globe. Recherche Codam, sélection, filtre des projets et état vide vérifiés.
- Arrivée sur Paris au zoom 18 examinée sur ordinateur 1920 × 1047 et mobile 390 × 844 ; tuiles chargées et crédits visibles. La correction finale place le repère sur le bâtiment École 42, aux coordonnées 48.89669°, 2.31839°. La correction de Singapour a aussi été examinée au zoom 18 sur le Building 1 du SUTD, à 1.34037°, 103.96278°, avec le libellé de provenance adapté. Thèmes clair et sombre, carte mobile arabe et ouverture des contenus contrôlés ; pas de débordement horizontal dans les mesures. Les noms latins disposent d’une direction automatique pour préserver « 42 Paris » en interface arabe ; correction contrôlée visuellement avec « 42 Singapore ». Passage arabe → anglais → français et retour au monde vérifiés, console sans erreur ou avertissement. Les huit archives de référence et le préfixe antérieur du journal sont préservés.
- Limites inchangées : pas de téléphone physique, de pincement réel, de mesure FPS, de mouvement réduit forcé, de panne réseau simulée ni de visite visuelle des 58 villes. Le fond urbain est une carte de rues vue du dessus, pas une vue satellite ou une scène 3D. Figma, les archives et l’introduction n°22 restent séparés.

## Étape historique : première version du zoom continu dans le globe — 27 septembre 2026

La scène unique reste active, mais les durées de vol et les changements automatiques de niveau par zoom décrits ici ont été **remplacés par la navigation bornée explicite** documentée plus haut. Le fond Monde distant de cette étape a également été remplacé par le fond local. Ces contrôles décrivent l’état testé à cette étape, pas le comportement courant de la molette.

Le globe, le pays et la ville utilisent désormais **la même carte, la même caméra et un seul canvas**. Le clic sur un campus déplace et rapproche la caméra pendant environ 4,4 secondes, jusqu’au zoom 17,8 et à une inclinaison de 34°. Les rues et les emprises de bâtiments se révèlent à mesure que la caméra approche. La projection MapLibre passe progressivement du globe à Mercator entre les niveaux 10 et 12, dans la même scène ; aucune seconde carte n’est ouverte. Le dézoom et Échap permettent de retrouver le pays, puis le monde.

Le style conserve les couleurs de la charte, avec une palette adaptée aux échelles monde, pays et quartier. Les bâtiments utilisent les emprises OpenStreetMap et les champs `render_height` / `render_min_height` d’OpenMapTiles : certaines hauteurs peuvent être calculées depuis le nombre d’étages ou estimées par le fournisseur. Ce relief donne une lecture du quartier ; ce n’est pas un relevé architectural exact ni une scène photoréaliste. Les données géographiques restent celles du fournisseur, sans quartiers fictifs créés pour l’animation.

Les changements de thème modifient les couleurs sans recréer la scène. Les changements de langue, de taille et l’ouverture des rubriques ajustent la composition sans remplacer la caméra. Le masque progressif des bords s’applique au canvas, tandis que les repères et les crédits restent lisibles. La barre mobile et les contenus de l’accueil sont conservés.

### Contrôles du nouveau moteur

- Le fond OpenFreeMap et ses détails se chargent dans Chrome. Les réponses 403 constatées lors des lectures Python ne se reproduisent pas dans le navigateur contrôlé.
- Clic vers Paris joué du globe jusqu’au zoom 17,8, avec un seul canvas conservé ; rues, bâtiments et couleurs examinés sur ordinateur et sur mobile **390 × 844**, dont interface arabe sombre.
- Échap ramène au pays France. Le dézoom par les boutons ramène ensuite de la France au monde. La molette Monde → France a été jouée.
- Thème et langue changés sans perdre la position de la caméra. Aucun débordement mobile relevé dans les mesures effectuées.
- La molette depuis le libellé de Paris sélectionne automatiquement le campus au zoom 8,61 ; son ancrage géographique est repris par l’événement natif de la carte. Le passage **Lyon → Projets pendant le vol** atteint le zoom 17,8 et affiche le contenu filtré « Le jardin connecté ».
- Version corrigée rechargée : aucune nouvelle erreur ni aucun avertissement relevé depuis ce rechargement. Les boutons en double issus des conteneurs MapLibre ont été retirés ; leur absence est confirmée dans l’arbre d’accessibilité.

Limites : pas de mesure FPS, de test sur téléphone physique, de pincement réel ni de préférence de mouvement réduit forcée. WebGL et les ressources réseau sont nécessaires au nouveau fond ; aucun fonctionnement hors ligne du détail urbain n’est revendiqué. La précision des 58 positions n’est pas certifiée au bâtiment près. Cette correction répond à la demande d’une scène continue ; elle ne vaut pas acceptation finale de son rendu par l’utilisateur et n’intègre ni Figma ni l’introduction n°22.

## Historique : correction v17 — 27 septembre 2026

**La préparation graphique bloquante et sa copie 2D décrites ici sont remplacées par v27.** Le fond local préparé derrière l’entrée, les corrections de resize et les budgets de cache restent utilisés. Les chiffres ci-dessous appartiennent uniquement au parcours v17.

L’utilisateur signale les morceaux urbains pendant les déplacements même après attente, le refresh initial vers le Sud et les changements de taille ; il demande aussi de reprendre l’ensemble du mode clair.

Le fond mondial prépare désormais ses échelles parentes et sa face opposée derrière l’entrée. Le resize conserve les vols et redessine le canvas immédiatement. Le quartier choisi précharge une zone comprenant le déplacement autorisé de 3 km et la surface visible, puis prépare son rendu à l’échelle d’arrivée 17,8 dans la même carte masquée par une copie 2D temporaire. La vue de travail s’agrandit en CSS mais son backing WebGL reste limité à 1 024². Tout est restauré avant révélation ; le chemin peut annuler la préparation. Cache brut 48 Mio, cache MapLibre au maximum 96 tuiles/source. Les autres zooms continuent à être décodés à la demande : ne pas présenter cela comme une préparation GPU de tous les niveaux.

Le mode clair utilise maintenant des surfaces blanches nettes, une navigation active encre/turquoise, des accents roses plus ciblés et un globe turquoise plus franc avec océan bleuté. Le mode sombre, la composition épurée, le mobile à barre basse et le n°22 sont conservés. Proposition à examiner, pas une esthétique acceptée.

104 contrôles automatisés passent. Paris : huit déplacements à 2,8 km sans nouvelles demandes réseau/décodage et sans frame de tuiles incomplètes observée. Première rotation polaire sans nouveaux traitements de tuiles ; Paris clair et Lyon sombre mobile contrôlés. Chiffres, limites et essais de resize dans [PERFORMANCE_NOTES.md](PERFORMANCE_NOTES.md#stabilité-quartier-préparé-au-rendu-et-mode-clair--v17-27-septembre-2026). Aucun déploiement.


## Menu sélectionné et filtre au-dessus de la carte — 27 septembre 2026

L’utilisateur demande une sélection claire dérivée de la couleur de l’icône, sur le principe du sombre, et un filtre qui ne recouvre plus le globe. La sélection claire utilise maintenant turquoise 42 à 10% pour le fond et 22% pour le contour, avec une ombre turquoise discrète ; texte encre et icône turquoise légèrement approfondie pour sa lisibilité. Le traitement rose du thème sombre reste identique.

Le filtre passe à 130 px du haut sur ordinateur, la carte commence à 208 px : marge mesurée 30,7 px même après zoom. Les petites variantes mobiles sont corrigées pour conserver un intervalle : 17,7 px aux formats 390 × 844 et 320 × 844 ; 18,7 px en paysage 667 × 390. Les repères sont eux aussi contenus par le parent MapLibre avec overflow:hidden. Les fonctions de navigation, les animations et le moteur v17 ne sont pas modifiés.

Contrôles visuels Chrome : sélection Explorer/Projets et barre mobile, zoom avec filtre séparé, trois formats mobiles sans débordement horizontal, couleurs du sombre conservées. Format ordinateur et accueil clair rétablis. Révision CSS nav-filter-16 ; pas de nouveau test moteur nécessaire pour ce changement visuel. Aucune publication ni validation esthétique finale.


## Campus aléatoire, langues et trajets — 27 septembre 2026

Demandes explicites formulées pendant le report du site dans Figma : ajouter une visite de campus au hasard, préparer la destination avant son clic, remplacer le popup de langue par une liste près du bouton et adoucir les voyages entre campus.

Le quatrième bouton du globe porte un dé. Un candidat est tiré uniformément parmi les 58 campus, en excluant le campus courant. Ce choix reste stable jusqu’au clic : l’anticipation prépare ses données dans le cache partagé, puis le clic consomme exactement cette destination et choisit la suivante. Le chargement du campus visité et le rendu sont prioritaires. Un seul contexte WebGL demeure ; le rendu du quartier est encore préparé après sélection.

La liste de langues est commune à l’entrée et à l’accueil, ancrée à 8 px sous le bouton, large de 176 px, sans fond obscurcissant. Trois choix FR/EN/AR, sélection cochée, fermeture après choix, clic extérieur ou Échap ; navigation clavier et retour au bouton prévus. Le mobile et le RTL utilisent le même ancrage logique.

Les trajets campus → campus passent de 2,8 s à 3–3,4 s selon la distance, avec une courbe quintique progressive aux deux extrémités. Les autres voyages et le déchiffrement n°22 ne changent pas ; réduction des mouvements conservée.

Versions : module `random-prefetch-20`, CSS `language-menu-19`, moteur v18. 116 contrôles automatisés passent. Dans Chrome, Rome est prête pendant l’entrée ; le clic ouvre bien Rome, puis le prochain campus, Iskandar Puteri, est prêt avant son clic. Les deux quartiers arrivent avec détail, un canvas ; interruption d’un troisième voyage par Monde réussie. Listes de langues examinées sur ordinateur et mobile 390 × 844, FR/EN/AR, choix fonctionnels, aucun débordement ni erreur/avertissement console dans cette session. Les touches clavier n’ont pas été rejouées dans le navigateur. Détails et limites dans PERFORMANCE_NOTES.md. Réalisation locale ; aucune publication ni acceptation finale déduite.

## Départ immédiat et préparation progressive — moteur v27, 27 septembre 2026

L’utilisateur accepte l’approche corrigée et le recul via les filtres, mais refuse l’attente avant le départ et le rechargement lors d’un nouveau clic sur le campus courant. Il choisit explicitement **« Zoom immédiat, préparation progressive »**. Cette décision remplace la préparation GPU de tout le quartier comme condition avant le déplacement ; elle conserve l’anticipation des fichiers bruts dans le rayon prévu.

Le moteur lance la caméra dans le même traitement du clic, pendant que [campus-preload.mjs](../campus-preload.mjs) charge les données du campus sélectionné. Le voyage rejoint **14,5 / 0°**, puis enchaîne sans attente programmée une approche de **2,2 s** jusqu’à **17,8 / 34°**. Il n’importe plus le préparateur graphique du quartier, n’agrandit plus son viewport et ne crée plus de copie 2D temporaire. La préparation initiale du fond mondial derrière l’entrée reste distincte et conservée.

La révélation nécessite un **nouveau rendu de la vue cible** et `isSourceLoaded('openmaptiles')`, sans erreur de source/glyphes retenue. Elle n’attend ni le disque brut complet ni la fin du mouvement. Lorsque la vue est prête assez tôt pendant l’approche, le style suit la rampe nominale **14,5 → 16,2** ; une disponibilité plus tardive décale son début au zoom réel pour éviter un saut d’opacité. Une arrivée très tardive, ou une vue prête pendant un simple déplacement manuel, utilise un fondu de **450 ms**, sans relancer la caméra. Une connexion lente peut donc encore laisser le fond local visible à l’arrivée ; la navigation n’est plus retenue par cette attente.

Les couches distantes restent activées dans leur layout après leur première installation. Les masquer passe par **l’opacité de peinture**, y compris entre deux campus et au retour local. Dans MapLibre 5.24, changer leur `visibility` provoquait un rechargement de source et vidait le cache décodé hors champ : ce mécanisme annulait une partie de la préparation précédente. Trois tests utilisant le vrai cache du bundle local vérifient la différence et la conservation des tuiles lors des changements d’opacité, de rampe et de thème. Le fond mondial n’est pas masqué/réactivé pour cette correction.

Depuis un quartier visible, le recul commence immédiatement : **2,2 s par les filtres vers Pays/Monde**, **1,4 s avant un autre campus**. Aux zooms élevés, le détail reste plein jusqu’à **16,6**, puis diminue jusqu’à **14,5** ; le trajet lointain ne reprend qu’après son masquage. Si l’utilisateur est déjà dézoomé, la cible devient `max(14.01, min(14.5, zoomInitial - 0.75))` : au minimum manuel **14,5**, la carte recule donc encore jusqu’à **14,01** et se recentre sur le campus d’origine dans le même mouvement. Le minimum manuel reste 14,5 ; seul ce trajet transitoire descend plus bas. Il reste au-dessus du niveau natif distant **z14**, sans élargir le rayon brut. Un resize pendant le recul masque les détails avant de poursuivre, car la nouvelle emprise peut dépasser celle du départ.

Un clic normal sur le campus courant conserve la vue et ses ressources : il ne fait rien si le centre est déjà correct, sinon il recentre en **650 ms** sans modifier zoom ou inclinaison. Cette règle vaut aussi pendant le téléchargement du reste du rayon. Le bouton **Réessayer** utilise une intention distincte : il reprend les fichiers manquants et ne relance le gate/source visible que si celle-ci est en erreur, sans rejouer le voyage. Une destination remplacée ne peut pas repartir à la fin d’un ancien téléchargement. La flèche de bord est réservée à l’exploration au repos ; elle ne s’affiche pas pendant les voyages.

Le cache brut partagé reste plafonné à **48 Mio**, le cache MapLibre à **96 tuiles par source au maximum**, avec un seul candidat aléatoire anticipé et priorité au rendu puis à la sélection. Les données brutes ne garantissent pas des objets GPU déjà préparés pour tous les déplacements : décodage, glyphes et éviction restent possibles. Le resize en approche conserve désormais le segment et son échéance, sans retour forcé à 14,5 ni nouvelle préparation bloquante. Les mouvements réduits appliquent directement la destination.

**177 contrôles automatisés passent : 153 pour la carte active, 8 pour l’entrée et 16 pour le préparateur graphique historique inactif.** Ils couvrent notamment le départ synchrone malgré des données pendantes, le premier rendu réellement prêt, l’apparition tardive pendant un pan, le clic répété/réessai, les annulations, la conservation du cache, le resize et le recul depuis le minimum. Le calcul de couverture du recul recentré est vérifié sur les 58 campus et quatre formats. Ces contrôles ne sont ni une mesure FPS ni une validation navigateur finale de v27 ; les observations Chrome sont consignées séparément après leur exécution.

## Historique : apparition et disparition pendant le mouvement — moteur v21, 27 septembre 2026

**Séquence remplacée par v27 ci-dessus.** Les attentes GPU, poses intermédiaires et chiffres de cette section décrivent l’itération v21 ; ils ne constituent plus des étapes du moteur actif.


L’utilisateur précise que les rues doivent apparaître **pendant l’approche** et rester visibles **pendant le vrai dézoom**. Le premier raccord v19 déclenchait un fondu de 350 ms trop tôt dans le recul : la caméra avait encore peu bougé lorsque le quartier disparaissait. L’apparition à la fin du vol ne répondait pas non plus à cette intention. Cette tentative est remplacée par deux rampes d’opacité dépendant du zoom.

L’approche rejoint d’abord les coordonnées du campus à **14,5, sans inclinaison**. Elle attend les données brutes du périmètre, puis prépare le même contexte WebGL derrière une copie 2D de cette vue : quartier au zoom d’arrivée **17,8**, vues intermédiaires **15, 16 et 17**, puis restauration de la vue sûre 14,5. La dernière descente dure **1,6 s** jusqu’à **17,8 / 34°** ; le détail passe de transparent à opaque selon cette progression de zoom, avec une courbe douce. Les trajets cumulent 2,8 s de mouvement vers un campus, ou 3–3,4 s entre campus selon la distance, **hors attente de préparation** et éventuel fondu préalable entre deux quartiers.

Pour revenir vers Pays ou Monde depuis un quartier prêt, la caméra recule réellement pendant **1,4 s** et se redresse. Le détail reste entièrement visible jusqu’à **15,5**, puis s’efface entre **15,5 et 14,5**. Ses couches sont masquées avant de poursuivre le voyage local vers Pays (1,5 s) ou Monde (2 s). Le recul reste dans l’emprise déjà préparée ; il n’agrandit pas son rayon de chargement. Si l’approche est interrompue alors que le détail est partiellement visible, le retour conserve d’abord cette opacité, sans saut à l’opacité maximale. Entre deux campus, le masquage préalable de l’ancien quartier reste utile pour traverser les zones non préparées.

Les expressions d’opacité sont installées une fois par segment de mouvement ; le moteur n’écrit pas les propriétés de peinture à chaque frame. Elles conservent les variations de style selon le zoom et fonctionnent dans les deux thèmes. Une nouvelle destination invalide l’ancien travail. Un resize pendant la descente masque les détails, retrouve le zoom sûr et prépare la nouvelle emprise avant de reprendre ; pendant le recul, il masque avant de redimensionner puis poursuit le retour. La réduction des mouvements utilise l’arrivée directe et la préparation de sa vue finale.

**136 contrôles carte passent dans 13 fichiers ; 144 avec les 8 contrôles d’entrée.** Le cycle complet vérifie l’ordre préparation → descente animée → fin du fondu, les annulations, le maintien des détails pendant le recul et le resize. Quatre combinaisons de rampes et thèmes passent le validateur officiel de style sans erreur. Les nouvelles observations navigateur sont consignées séparément ; ces tests ne démontrent ni une fluidité à une cadence donnée ni une disparition de toute attente.

Le cache brut reste partagé et borné à **48 Mio**, la carte à **96 tuiles décodées par source au maximum**. Le candidat aléatoire anticipe ses fichiers, pas tous ses objets GPU. Une pause reste donc possible au zoom sûr 14,5 avant la descente détaillée, y compris si le bouton aléatoire annonçait ses données prêtes. Les trois poses supplémentaires préparent cette approche précise ; elles ne garantissent pas tous les zooms, toutes les orientations ou un cache permanent. Voir [PERFORMANCE_NOTES.md](PERFORMANCE_NOTES.md) pour le mécanisme et les limites mesurables.


## Vérification finale dans Chrome — 27 septembre 2026

Version chargée `arrival-scan-24`, moteur v21, entrée `circle-globe-4`, CSS d’entrée `circle-globe-15`. Double scan observé dès l’ouverture, puis état chiffré stable ; confirmation reprend à 3 650 ms et donne BEYOND THE CODE. Maintien de 1 300 ms contrôlé par l’état de diagnostic et capture du slogan sur mobile arabe sombre. Parcours connecté terminé sur le globe ; parcours visiteur sans décryptage également terminé. Sur mobile 390 × 844 sombre, captures de l’apparition blanche du 42 et du globe à environ 84 % de sa taille finale à l’intérieur du cercle ; styles transitoires rétablis après arrivée, un canvas WebGL, aucun débordement. La géométrie mesurée est centrée en (195 ; 384,5), rayon 170,69 px ; ordinateur (966,84 ; 542), rayon 269,23 px. Pas de nouveau canvas créé par cette entrée.

Urduliz ordinateur clair et Firenze mobile sombre : arrivée au zoom 17,8 avec détail prêt. Le diagnostic relève une opacité intermédiaire de 0,82 au zoom 16,92 **pendant** l’approche, caméra en mouvement et tuiles rendues prêtes. Urduliz → Espagne et Firenze → Monde : recul détaillé observé sur plusieurs images ; opacité pleine au début, puis diminution liée au zoom (par exemple 0,88 à 15,29 ; 0,43 à 14,96 ; 0,06 à 14,65 sur Urduliz), puis trajet local. Aucun défaut de séquencement enregistré, un canvas, aucune nouvelle erreur/alerte console. Ce contrôle n’est pas une mesure de FPS. La préparation Urduliz a pris environ 8,1 s dans cette session, cache non froid : le préchargement des buffers ne supprime pas cette préparation locale ni toute attente.

Menu de langue joué au clavier sur ordinateur : Fin/Entrée vers AR, Échap pour fermer, Début/Entrée vers FR, focus rendu au bouton. Le diagnostic reste réservé à `?perf=1` ; l’aperçu normal n’affiche ni métriques ni contrôles de test. Pas de téléphone physique ni de promesse de durée de chargement.

## Viseur de campus hors champ — 27 septembre 2026

À la demande de l’utilisateur, le viseur du campus sélectionné devient une **flèche de bord orientée vers le campus** quand son emplacement quitte la zone lisible. [campus-direction.mjs](../campus-direction.mjs) utilise la projection écran de la carte et intersecte le rayon centre → campus avec un rectangle intérieur : les marges de fondu, plus **36 px** de sécurité. Le point reste donc orienté correctement près des coins ; il ne résulte pas d’un simple blocage indépendant des deux coordonnées. Le viseur revient lorsque le campus rentre suffisamment dans la zone visible, avec une hystérésis de 6 px pour éviter le scintillement.

Le même bouton conserve son identité et son focus ; ses traits de visée s’effacent au profit d’une flèche rose. Rotation par le chemin angulaire le plus court, libellé horizontal borné dans l’écran, textes accessibles FR/EN/AR et transitions désactivées en mouvements réduits. Un clic recentre le campus en **650 ms**, en gardant le zoom et l’inclinaison courants, sans relancer le chargement ou la préparation du quartier. L’extension ne crée ni canvas ni boucle de rendu propre : elle suit les projections déjà effectuées par le moteur.

**13 tests géométriques passent** : cardinales et diagonales, intersection aux coins, quatre formats, marges du fondu, retour avec hystérésis, projections invalides, petits viewports et continuité de l’angle. Syntaxe du module vérifiée. L’intégration moteur est réalisée ; la vérification visuelle et du recentrage dans le navigateur sera consignée après son exécution. Ces contrôles ne constituent pas une mesure de fluidité.


## Dernières finitions et contrôle navigateur — 27 septembre 2026

**Carte v27.** Le parcours progressif est rejoué dans Chrome mobile 390 × 844 : nouveau campus Nice démarré avec 0/36 tuiles disponibles, détail visible pendant l’approche ; clic répété Angoulême sans nouvelle préparation ; Angoulême→Paris avec recul effectif ; Paris→France depuis 14,5 avec recul jusqu’à 14,01 et fondu observé. Un canvas, aucune nouvelle erreur console. La flèche de bord a été jouée auparavant sur ordinateur et mobile sombre FR/AR : orientation correcte, libellé dans le cadre et recentrage sans changement de zoom ; les vols contrôlés de v27 ne l’affichent pas. Les mesures détaillées et leurs limites sont dans [PERFORMANCE_NOTES.md](PERFORMANCE_NOTES.md).

**Liste de langues.** L’utilisateur précise que le défaut n’est pas la couleur : l’arabe paraît entouré plus épais et deux lignes voisines sélectionnée/survolée se heurtent. La mesure initiale donnait49,33 px pour l’arabe contre 42 px pour FR/EN. La hauteur est désormais fixée à 42 px avec interligne 22 px et séparation 4 px. Un seul pseudo-élément de 42 px glisse en 220 ms entre les lignes au survol ou au focus ; la sélection garde sa couleur existante et sa coche, sans second aplat. La transition est supprimée en mouvements réduits. Les couleurs n’ont pas été changées.

Contrôles Chrome : trois hauteurs égales 42 px, fond unique aux positions 6/52/98 px, passage clavier vers l’anglais voisin du français sélectionné, arabe en sombre, anglais voisin de l’arabe sélectionné en RTL, puis Échap et focus rendu au bouton. Aucun débordement mobile. À l’entrée sur ordinateur 1440 × 960, la ligne arabe et les deux lignes latines mesurent également 42 px ; le rendu et Échap sont contrôlés. Le rendu clavier et les dimensions ont été examinés ; l’outil n’a pas permis d’isoler un simple survol souris, ce dernier n’est donc pas déclaré joué. Cette finition des listes est locale au site ; les menus Figma synchronisés plus tôt conservent leur présentation précédente.

Versions actives : `welcome.mjs?v=progressive-campus-31`, `integrated-globe.mjs?v=27`, `welcome.css?v=language-menu-20`. Pas de publication ni d’acceptation esthétique globale déduite des vérifications.


## Départ visible du double scan — 27 septembre 2026

L’utilisateur signale que l’animation semble apparaître alors qu’elle a déjà commencé. Le contrôleur fixait son origine temporelle pendant le montage, avant le premier paint, et la première callback ajoutait tout le délai écoulé. Le renderer pouvait aussi refaire ses sprites à l’arrivée de Jost au temps déjà avancé. Le lancement du globe en parallèle pouvait accentuer ce saut.

Correction limitée à l’entrée : préchargement de Jost 500 dans le HTML, attente de `fonts.load` puis `fonts.ready` avant d’armer le scan, et première callback visible conservée à t=0. Après une frame longue, le scan n’avance que de 64 ms au maximum au lieu de consommer un passage invisible. Cette limite concerne les deux passes initiales, pas le rythme du décryptage final. Les 3,65 s restent le temps logique du scan ; leur durée réelle peut s’allonger si le navigateur bloque. La reprise après masquage réancre aussi l’horloge sans rattrapage. Police indisponible : repli existant ; connexion et visiteur restent accessibles pendant sa préparation. Aucun changement des sources archivées du n°22 ni du lancement du préchargement géographique.

**16 tests passent** : les huit parcours précédents et huit cas de retard/annulation, avec attente des fontes, première frame retardée de 2,4 s restant à t=0, blocage de 1,8 s n’avançant que de 64 ms, connexion anticipée, visiteur avant les ressources, onglet masqué, fonte échouée et mouvements réduits. La syntaxe du contrôleur est valide.

Chrome ordinateur puis mobile 390 × 844 : état binaire initial observé avant le faisceau, descente et remontée visibles, puis message chiffré en attente. Diagnostic : première frame à 0 ms, globe prêt pendant le scan. Le parcours connecté mobile passe ensuite par décryptage → slogan → 42 → cercle → globe sans revenir aux scans ; aucune erreur ni aucun avertissement console. Contrôle local avec cache navigateur non forcé à froid, sans téléphone physique ni réseau ralenti. Les délais de fontes et de thread sont testés par simulation ; aucune garantie de cadence sur tout appareil.

Versions actives : `welcome.mjs?v=scan-start-32`, `entrance.mjs?v=visible-scan-5`, moteur v27 et CSS langue20 conservés. Figma n’est pas modifié : sa chronologie de conception ne change pas, la correction porte sur le démarrage effectif dans le navigateur.


## Sélecteurs géographiques et fiche campus — 27 septembre 2026

Demandes explicites : remplacer la recherche géographique par un sélecteur Pays et un sélecteur Campus ; ouvrir une fiche au clic sur le nom/viseur du campus courant. L’utilisateur confirme : **premier clic au niveau Pays pour zoomer, clic suivant sur place pour ouvrir la fiche**. Lorsque le repère est une flèche hors champ, le clic **recentre seulement**.

`scope-selectors.mjs` est partagé par l’accueil actif et l’aperçu de navigation. Pays vide = tous les pays ; Campus vide = tous les campus du pays choisi, ou les 58 campus. Le choix d’un pays retire le campus précédent ; un campus choisi dans la liste globale déduit son pays. Application immédiate, fenêtre conservée ouverte, aucune recherche ni liste de boutons. FR/EN/AR, labels associés, clavier natif ; 9 tests ciblés passent. Le dialogue de 420 px a une hauteur de contenu (`max-content`) et reste borné par l’écran.

`campus-details.mjs` affiche nom, pays, adresse exacte et lien officiel. Le nouveau `campus-websites.json` relie56 campus à leur site indiqué par le réseau ; Québec/Nablus conservent un lien explicitement nommé vers leur fiche officielle 42 Network. Les 58 entrées ont une provenance datée, aucune URL n’est déduite d’un nom. Voir [CAMPUS_SOURCES.md](CAMPUS_SOURCES.md). La fiche est superposée à la carte, proche de son centre sur ordinateur et centrée sur mobile ; Échap/croix la ferment. Un clic ne recrée pas le moteur ni le préchargement.

Vérifications Chrome : Pays France→premier clic sur 42 Paris→approche, second clic→fiche avec adresse et site https://www.42.fr/ ; déplacement manuel jusqu’à flèche, clic→recentrage sans dialogue, puis viseur→fiche. Fiche mobile 390 × 844 en AR sombre examinée, lien correct, aucun débordement ni erreur console. Sélecteurs :31 options Pays et9 options Campus France (y compris options globales), choix Tokyo depuis tous les pays→Japon avec2 options Campus, exactement 2 select et 0 champ de recherche. Les suites sélecteurs, direction et entrée passent ; leurs contrôles internes couvrent respectivement 9, 13 et 16 cas. Pas de test sur téléphone physique, ni de garantie sur disponibilité future des sites.

Versions : `welcome.mjs?v=campus-details-34`, moteur v28, CSS `scope-selectors-22`, modules campus-details/site v1. Entrée `visible-scan-5` conservée. Nouvelle navigation séparée : [content-preview.html](../content-preview.html) ; périmètre et preuves dans [CONTENT_PREVIEW_NOTES.md](CONTENT_PREVIEW_NOTES.md). Pas de publication ni d’acceptation esthétique finale déduite.


## Sites des campus selon la langue — 27 septembre 2026

Demande explicite : langue choisie sur Horizon → anglais → langue locale. `campus-website.mjs` applique cet ordre aux seules URL du catalogue `campus-website-locales.json`, chargé avec les campus et enrichi par les preuves de `campus-website-locale-evidence.json`. Les deux contrôleurs partagent le module de fiche. Aucun chemin de traduction n’est construit à partir du domaine. Les liens sont HTTPS ; la langue de destination est portée par `hreflang` et indiquée dans la fiche en cas de repli.

Couverture : 58 campus, 18 URL FR, 44 EN et 7 AR. Québec et Nablus conservent leur fiche réseau anglaise. Luanda propose l’anglais uniquement dans son propre menu ; la fiche garde son URL officielle et explique ce choix manuel. Ce cas ne peut pas être forcé par un lien externe. Les langues absentes du catalogue sont non vérifiées, pas déclarées inexistantes. Lyon EN sans contenu central et le menu invisible du Havre ne sont pas considérés comme traductions utilisables. L’arabe 1337 repose sur le contenu officiel indexé, avec accès direct protégé. Gyeongsan EN a été vérifié dans Chrome après rendu JavaScript.

Vérifications : 8 tests du résolveur passent, 174 combinaisons campus/langue résolues vers une URL HTTPS. Chrome : Paris FR → `https://42.fr/`, interface arabe → `https://42.fr/en/homepage/` avec indication du repli anglais ; Luanda affiche le site portugais et l’instruction pour choisir l’anglais. Aucune disponibilité future des sites externes n’est garantie.

Versions finales : contrôleur actif `campus-sites-35`, aperçu `content-preview.mjs?v=3`, moteur v28, fiche v2, résolveur v1, CSS géographique `scope-selectors-22`. Entrée `visible-scan-5` inchangée. Le report Figma est décrit dans [content-preview-handoff.md](../../figma/explorations-2026-09/content-preview-handoff.md) ; il reprend les écrans représentatifs, pas l’ensemble des comportements WebGL ni les 58 liens.


## Grandes pages intégrées et carte campus en fenêtre — 28 septembre 2026

À la demande de poursuivre, le site principal reprend les pages Projets/Parcours/Journal après son entrée animée. L’ancien accueil à panneaux est conservé dans `welcome-panels.html`. L’aperçu direct et le site partagent désormais un seul contrôleur ; les liens initiaux sont appliqués après le raccord cercle → globe.

Précision explicite : le bouton « Explorer le campus » d’un article doit ouvrir une popup avec approche animée, rester au niveau Campus et conserver la lecture derrière. Réalisé avec le même canvas déplacé temporairement, caméra/périmètre sauvegardés et restitués. Dialogue dédié, fiche d’informations distincte, zoom/recentrage et rayon de 3 km ; aucun retour Pays/Monde. Échap ferme la carte. Détails, cas de restitution, vérifications et limites dans [CONTENT_INTEGRATION_NOTES.md](CONTENT_INTEGRATION_NOTES.md).

Versions : contrôleur `campus-overlay-37`, moteur v29, popup v1 ; entrée inchangée. Huit tests de session campus et contrôles Chrome ordinateur/mobile FR/EN/AR passés. Aucun gain FPS, publication ni acceptation esthétique globale déduits.
