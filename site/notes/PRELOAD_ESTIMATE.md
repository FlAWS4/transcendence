# Estimation du préchargement des quartiers de campus

Relevé du **27 septembre 2026**. Cette note compare le préchargement d’un rayon de 3 km autour de tous les campus d’un pays avec celui du seul campus choisi. **Il s’agit d’un calcul et de neuf téléchargements d’échantillonnage, pas d’une implémentation du préchargement ni d’un benchmark CPU/RAM.** Les chiffres structurés sont conservés dans [PRELOAD_ESTIMATE.json](../PRELOAD_ESTIMATE.json).

## Source et périmètre

Le [TileJSON officiel OpenFreeMap](https://tiles.openfreemap.org/planet) relevé indique `minzoom: 0`, **`maxzoom: 14`**, `version: "3.16.0"` et le modèle d’URL `https://tiles.openfreemap.org/planet/20260913_164504_pt/{z}/{x}/{y}.pbf`. Cette dernière version désigne l’instantané des tuiles, distinct de la version de MapLibre. Selon la [spécification officielle MapLibre](https://maplibre.org/maplibre-style-spec/sources/#maxzoom), les vues au-delà du zoom maximal réutilisent les tuiles de ce niveau : il n’est donc pas nécessaire de télécharger des tuiles z15 à z19 pour ce fournisseur.

Les positions proviennent de [campuses.json](../campuses.json), avec les 18 remplacements de [campus-location-overrides.json](../campus-location-overrides.json) appliqués avant le calcul. Le relevé comprend 58 campus dans 30 pays. Les empreintes SHA-256 des deux entrées sont conservées dans le JSON. Les coordonnées non corrigées gardent les limites décrites dans [CAMPUS_SOURCES.md](CAMPUS_SOURCES.md).

## Méthode de comptage

Le calcul compte les tuiles XYZ/Web Mercator **z14 qui intersectent le disque géographique fermé de rayon 3 km** autour de chaque campus. Il emploie une Terre sphérique de rayon `R = 6371,0088 km`, pas un calcul géodésique sur l’ellipsoïde WGS84. Cette approximation géographique peut changer une tuile située exactement à la limite ; les nombres ne constituent pas une mesure du chargement réel de MapLibre.

Avec la latitude centrale `φ`, la longitude centrale `λ` et `δ = 3 / R`, en radians :

1. L’emprise du disque est `φ ± δ` en latitude et `λ ± asin(sin(δ) / cos(φ))` en longitude. Aucun campus de cette série ne nécessite de traitement des pôles ou de l’antiméridien.
2. Conversion vers la grille continue, avec `n = 2^14` : `x = n × (λ + π) / (2π)` ; `y = n × (1 − asinh(tan(φ)) / π) / 2`. Les valeurs entières inférieures des deux extrémités donnent la grille rectangulaire candidate, bornes incluses.
3. Chaque rectangle de tuile est reconverti en limites longitude/latitude. On choisit la longitude `λc` du rectangle la plus proche de `λ`, puis la latitude `φc = atan2(sin(φ), cos(φ) × cos(λc − λ))`, bornée aux latitudes du rectangle.
4. La distance minimale au rectangle est `R × acos(clamp(sin(φ) × sin(φc) + cos(φ) × cos(φc) × cos(λc − λ), −1, 1))`. La tuile est retenue si cette distance vaut au plus `3 + 10^-7 km` ; la petite tolérance traite l’arrondi numérique.
5. Les identifiants `(z, x, y)` sont réunis dans un ensemble pour chaque pays, afin de supprimer les chevauchements entre campus. Un second total garde la grille rectangulaire entière, plus simple à précharger mais plus large que le disque.

| Périmètre | Campus | Tuiles uniques intersectant les disques | Grilles rectangulaires uniques |
| --- | ---: | ---: | ---: |
| Paris | 1 | 21 | 25 |
| Lyon | 1 | 16 | 16 |
| Tokyo / Japon | 1 | 14 | 16 |
| France | 8 | **145** | 166 |
| Maroc | 4 | 56 | 64 |
| Ensemble du réseau | 58 | 926 | 1 066 |

Pour la France : Angoulême 17, Le Havre 21, Lyon 16, Marseille 17, Mulhouse 19, Nice 18, Paris 21, Perpignan 16. La somme et l’union valent toutes deux 145 : **aucune tuile z14 commune entre ces huit disques**. Les 30 totaux par pays et les comptes par campus sont conservés dans le JSON.

## Neuf tuiles effectivement téléchargées

Pour chaque ville, l’échantillon contient la tuile portant le campus, sa voisine est et sa voisine nord. C’est un échantillon spatial de convenance, **pas un tirage représentatif** de tout le disque ou de tout le pays. Les requêtes comportaient `Accept-Encoding: gzip` ; les réponses portaient bien `Content-Encoding: gzip`. La colonne gzip mesure les octets du corps reçu, sans en-têtes HTTP, transport TLS ou autres ressources. La dernière colonne mesure les octets du protobuf après décompression, **pas la mémoire de rendu**.

| Ville / position | URL exacte z/x/y | Corps gzip, octets | Protobuf décompressé, octets |
| --- | --- | ---: | ---: |
| Paris / centre | [14/8297/5633.pbf](https://tiles.openfreemap.org/planet/20260913_164504_pt/14/8297/5633.pbf) | 206 842 | 340 669 |
| Paris / est | [14/8298/5633.pbf](https://tiles.openfreemap.org/planet/20260913_164504_pt/14/8298/5633.pbf) | 218 997 | 353 602 |
| Paris / nord | [14/8297/5632.pbf](https://tiles.openfreemap.org/planet/20260913_164504_pt/14/8297/5632.pbf) | 120 673 | 198 562 |
| Lyon / centre | [14/8408/5843.pbf](https://tiles.openfreemap.org/planet/20260913_164504_pt/14/8408/5843.pbf) | 80 480 | 126 140 |
| Lyon / est | [14/8409/5843.pbf](https://tiles.openfreemap.org/planet/20260913_164504_pt/14/8409/5843.pbf) | 99 293 | 155 339 |
| Lyon / nord | [14/8408/5842.pbf](https://tiles.openfreemap.org/planet/20260913_164504_pt/14/8408/5842.pbf) | 58 215 | 89 916 |
| Tokyo / centre | [14/14549/6451.pbf](https://tiles.openfreemap.org/planet/20260913_164504_pt/14/14549/6451.pbf) | 383 990 | 642 492 |
| Tokyo / est | [14/14550/6451.pbf](https://tiles.openfreemap.org/planet/20260913_164504_pt/14/14550/6451.pbf) | 362 127 | 613 214 |
| Tokyo / nord | [14/14549/6450.pbf](https://tiles.openfreemap.org/planet/20260913_164504_pt/14/14549/6450.pbf) | 396 357 | 669 048 |

## Extrapolations, distinctes des mesures

Unités décimales : 1 Ko = 1 000 octets ; 1 Mo = 1 000 000 octets. Pour chaque ville, l’estimation multiplie son nombre de tuiles par la moyenne des trois corps gzip mesurés. La plage multiplie le même nombre par les minimum et maximum observés ; **elle n’est ni une borne garantie ni un intervalle de confiance**. Les véritables valeurs peuvent en sortir.

| Périmètre complet | Moyenne mesurée par tuile | Projection par la moyenne | Projection par les extrêmes de l’échantillon |
| --- | ---: | ---: | ---: |
| Paris, 21 tuiles | 182,2 Ko | **3,8 Mo** | 2,5–4,6 Mo |
| Lyon, 16 tuiles | 79,3 Ko | **1,3 Mo** | 0,9–1,6 Mo |
| Tokyo, 14 tuiles | 380,8 Ko | **5,3 Mo** | 5,1–5,5 Mo |
| France, 145 tuiles | Échantillon limité à Paris/Lyon | Non retenue comme moyenne nationale | **8,4–31,8 Mo**, en appliquant 58 215–218 997 octets à chaque tuile |

Le poids total de la France, du Maroc et des autres pays **n’a pas été téléchargé ou mesuré**. L’écart entre Paris, Lyon et Tokyo montre pourquoi le seul nombre de tuiles ne donne pas leur poids. Aucune extrapolation réseau globale aux 58 campus n’est revendiquée. Les chiffres excluent les niveaux inférieurs utiles à un vol d’approche, les glyphes, les métadonnées, les éventuelles nouvelles versions de tuiles et les marges du viewport.

## Rayon, viewport et coûts de préparation

La limite de navigation de 3 km concerne **le centre de la caméra**, pas tous les pixels affichés. Au zoom minimal du campus, avec l’inclinaison et les dimensions de l’écran, le viewport peut dépasser le disque. Précharger exactement ces 21 tuiles parisiennes ne garantit donc pas l’absence de nouvelles requêtes pendant toute l’exploration autorisée. Une couverture garantie demanderait de calculer l’union des viewports autorisés, avec leurs marges, et de la mesurer séparément.

Inversement, l’approche initiale du campus ne nécessite pas immédiatement toutes les tuiles du disque. Le nombre réellement demandé dépend du viewport, du zoom, de l’inclinaison, des marges de chargement et de l’état du cache. Cette étude **ne mesure pas ce scénario de référence** : on ne doit pas comparer les 145 tuiles françaises à une prétendue vue initiale de Paris de 21 tuiles.

Précharger les réponses HTTP peut anticiper le réseau. Préparer en plus toutes les géométries dans MapLibre ajoute décompression, décodage, traitement des géométries et libellés, puis buffers de rendu. **Aucun temps CPU, gain de FPS, pic mémoire ou occupation GPU n’a été mesuré ici.** Le ratio protobuf décompressé/corps gzip de l’échantillon, environ 1,56 à 1,68 selon la ville, ne permet pas de déduire la RAM après décodage.

Les neuf réponses comportaient `Cache-Control: public, max-age=315360000`, `Vary: accept-encoding`, un `ETag` propre à la tuile et une URL d’instantané versionnée. Elles permettent la réutilisation HTTP, sans garantir la conservation effective par le navigateur : une éviction reste possible, et une nouvelle URL d’instantané désigne une autre ressource. Relâcher des tuiles décodées ou des buffers du rendu est distinct de supprimer les réponses du cache HTTP. Décharger les campus non choisis ne rembourse pas les octets déjà transférés ; les évincer systématiquement peut aussi rendre le retour à un campus moins rapide.

Les neuf réponses ne comportaient **pas de `Timing-Allow-Origin`**. Les compteurs de taille `transferSize`, `encodedBodySize` et `decodedBodySize` de Resource Timing peuvent donc rester à zéro pour ces ressources distantes ; la collecte dans un worker ne contourne pas cette restriction. Les nombres de cette note viennent des corps téléchargés directement, pas d’un zéro interprété comme une réponse gratuite ou vide.

## Portée de la proposition

Ces mesures soutiennent un préchargement prioritaire du campus choisi ou visé, avec une éventuelle préparation secondaire bornée des autres campus, plutôt qu’une préparation immédiate de tous leurs rendus. Il s’agit d’une **proposition de l’assistant**, sans choix utilisateur ni implantation du préchargement enregistrés par cette note. Le fond unique, la charte et la navigation restent des sujets traités dans les [notes du prototype](NOTES.md).

Les sources primaires utilisées sont le [TileJSON OpenFreeMap](https://tiles.openfreemap.org/planet), les neuf réponses de tuiles liées ci-dessus, le [guide officiel OpenFreeMap](https://openfreemap.org/quick_start/) et la [spécification MapLibre des sources vectorielles](https://maplibre.org/maplibre-style-spec/sources/). Les calculs géographiques et extrapolations sont ceux de cet audit, pas des chiffres publiés par les fournisseurs.


## Frontières et côtes jusqu’au niveau Pays — précision du 27 septembre 2026

L’utilisateur distingue maintenant le besoin de frontières jusqu’au zoom maximal Pays des détails des quartiers. Les exceptions proches d’une frontière doivent être gérées séparément au niveau Campus. Cette section est une **étude de faisabilité**, sans remplacement des données ni modification du moteur actif v10.

Dans le code actuel, `countryZoom()` plafonne l’arrivée à 6,7 et la plage Pays ajoute 2,1 : le plafond effectif est donc **8,8**, malgré le plafond de sécurité 9,5 dans `navigation-policy.mjs`. La France contrôlée sur ordinateur atteint environ 6,77 en butée ; la limite dépend du pays et du format. Le niveau Campus commence à 14,5 et arrive à 17,8 : il n’est pas pertinent de dimensionner le fond mondial pour cette échelle.

Le fond local actuel pèse **110 736 octets JSON**, soit **38 753 octets après compression gzip niveau 9 calculée localement**, avec 8 294 positions dans les arcs TopoJSON. Ce nombre gzip n’est pas une mesure du transfert HTTP du serveur local ni de mémoire de rendu. La source GeoJSON est actuellement préparée avec `maxzoom:4` : un fichier plus riche ne suffirait pas à lui seul, il faudrait également régler sa préparation pour la précision visible au plafond Pays.

La recommandation est de préparer un fond commun aux deux premiers niveaux, comprenant **les terres, côtes et frontières internationales cohérentes**, pas seulement des traits par-dessus l’ancien fond. Il serait chargé dès l’entrée et conservé pendant la session. Une fois prêt, les vues Monde/Pays ne dépendraient plus de nouveaux téléchargements de frontières à chaque changement de zoom ou de pays. Les repères de campus sont déjà locaux ; les détails urbains restent distincts. Précharger les tuiles OpenFreeMap complètes jusqu’au plafond Pays ferait également transférer des données inutiles à ce fond dédié.

Afficher directement une précision suffisante est compatible avec une simplification technique : supprimer des sommets dont l’écart est inférieur au seuil visible au zoom maximal, conserver la topologie des frontières partagées et adapter le dessin aux pixels disponibles. Le [guide MapLibre sur les grands GeoJSON](https://maplibre.org/maplibre-gl-js/docs/guides/large-data/) recommande notamment de réduire les propriétés inutiles, simplifier les géométries et compresser les données. Aucun coût CPU, délai de préparation ou gain FPS de ce nouveau fond n’a été mesuré ici. Supprimer le réseau après préparation initiale ne supprime pas le travail local du moteur.

Un jeu comparatif comme [World Atlas](https://github.com/topojson/world-atlas) permet de mesurer des ordres de grandeur : ses niveaux 110m/50m/10m désignent les échelles 1:110 millions, 1:50 millions et 1:10 millions, **pas des mètres de précision**. La version 2.x est une redistribution de Natural Earth 4.1.0, distincte du [jeu Natural Earth 5.1.1 actuellement proposé](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/). Ces données comparatives ne sont donc pas un choix définitif de source. Leur quantification et leur généralisation doivent être contrôlées au zoom maximal, notamment pour les petits pays et les côtes. Une source datée et cohérente avec le fond urbain reste à sélectionner et valider avant réalisation.

### Comparaison de fichiers effectivement récupérés

Les deux jeux World Atlas **2.0.2** ont été téléchargés pour cette étude. Compression gzip niveau 9 calculée localement (`gzip.compress(..., compresslevel=9, mtime=0)`), hors en-têtes et transport ; aucune compression HTTP du serveur du prototype n’est présumée. Les relevés sont conservés dans [BORDER_PRELOAD_ESTIMATE.json](../BORDER_PRELOAD_ESTIMATE.json).

| Fond mondial comparé | JSON brut | Gzip calculé | Positions dans les arcs |
| --- | ---: | ---: | ---: |
| Fond actuel local | 110 736 octets | 38 753 octets | 8 294 |
| [World Atlas 50m](https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json) | 756 420 octets | 230 099 octets | 80 617 |
| [World Atlas 10m](https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-10m.json) | 3 661 071 octets | 919 959 octets | 477 295 |

Ces tailles soutiennent l’intérêt d’un fond dédié : cet exemple détaillé représente environ **0,92 Mo compressé pour le monde entier**, sans rues ni bâtiments. C’est une mesure de fichier comparatif, **pas le poids validé d’un futur fond répondant à toutes les exigences**. Le nombre de sommets du 10m est environ 58 fois celui du fond actuel ; il ne faut pas traduire le faible poids compressé en coût de rendu négligeable.

Les deux fichiers sont quantifiés avec un pas longitudinal d’environ 0,003600036°. Au zoom Mercator 8,8 et pour une largeur mondiale de `512 × 2^zoom` pixels CSS, un pas représente environ **2,28 pixels horizontalement**. Ce n’est ni une erreur maximale mesurée ni une validation visuelle : cela montre pourquoi un fichier nommé « 10m » ne doit pas être adopté tel quel en promettant une géométrie invisible à la simplification. Un jeu préparé avec une précision et une quantification adaptées, puis vérifié dans le moteur, reste nécessaire. Aucun fond nouveau n’a été intégré pendant cette étude.


### Suite réalisée après cette étude — 27 septembre 2026

L’utilisateur choisit le fond Monde/Pays préparé pendant le message crypté, puis demande explicitement le rayon complet de 3 km au clic campus. Le [moteur actif](NOTES.md) met désormais les deux en œuvre. Le fond final Natural Earth 5.1.1 pèse **2 006 643 octets gzip** ; les 920 Ko ci-dessus restent le poids d’un autre jeu comparatif. Voir [provenance et transformation](../geography/PROVENANCE.md).

Pour le quartier, un protocole MapLibre et un cache commun préchargent les tuiles natives z14 du campus choisi. Paris : **21 tuiles et 8 585 507 octets décompressés** dans le contrôle final. Ce dernier nombre ne remplace pas une mesure du transfert gzip : les en-têtes CORS du fournisseur ne rendent pas la taille encodée disponible dans le relevé navigateur. Les anciens chiffres de transfert et leurs extrapolations restent historiques. Mémoire CPU/GPU totale et débit limité non mesurés.
