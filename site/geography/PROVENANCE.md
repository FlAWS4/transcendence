# Fond géographique local — 27 septembre 2026

Ce jeu fournit un fond commun de terres, côtes et frontières pour les niveaux Monde et Pays. Il ne contient ni rues, ni bâtiments, ni une nouvelle vérification des coordonnées des campus. Les anciens `world.json` et les archives restent intacts.

## Source et droits

- **Natural Earth, Admin 0 — Countries, échelle 1:10 millions, version 5.1.1.** La [page officielle des données culturelles](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) identifie cette version. Ici, « 10m » signifie **1:10 millions**, et non une précision géographique de dix mètres.
- [GeoJSON officiel fixé au tag v5.1.1](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.1/geojson/ne_10m_admin_0_countries.geojson), téléchargé le 27 septembre 2026. SHA-256 : `239eec57ac17f100a11e2536cffc56752c318b50ae765b0918ff7aab4ce8f255` ; 13 287 234 octets. Le script refuse un autre contenu.
- Les données Natural Earth sont dans le [domaine public](https://www.naturalearthdata.com/about/terms-of-use/). Leurs contours correspondent à la représentation *de facto* du jeu standard ; aucune variante de point de vue ni modification politique n’a été ajoutée.
- Conversion avec **Mapshaper 0.6.113**, dépendance de construction seulement, installée dans `/tmp`, absente du chargement du site. [Documentation officielle](https://mapshaper.org/docs/reference.html), [source et licence MPL-2.0](https://github.com/mbloch/mapshaper).

## Transformation

1. Construire la topologie commune de l’ensemble des 258 entités. Les voisins partagent leurs arcs pendant la simplification.
2. Appliquer Douglas–Peucker en coordonnées sphériques, seuil **10 mètres**, `keep-shapes`, avec la réparation des intersections par défaut. Le relevé Mapshaper retire 5 441 sommets topologiques, soit environ 1,1 %, avec un déplacement maximal mesuré de 9,9993 m et **zéro anneau effondré**. Aucun pays ni îlot n’est volontairement filtré.
3. Garder uniquement `id` et `name`. `feature.id` et `properties.id` sont identiques : `ISO_A3`, ou `ADM0_A3` lorsque Natural Earth porte `ISO_A3=-99`. France et Norvège récupèrent ainsi `FRA` et `NOR`. Palestine garde **`PSE`**, identifiant du catalogue, et non son alias Natural Earth `PSX`. Les 30 identifiants du catalogue sont présents ; certains autres territoires gardent un code propre à Natural Earth.
4. Exporter un TopoJSON, objet **`countries`**, sur une grille de **10 000 000** valeurs. Le pas maximal en longitude est d’environ 0,000036° (environ quatre mètres à l’équateur), très inférieur à une quantification mondiale de 100 000 valeurs. Les limites partagées restent exactement partagées.
5. Exporter aussi un GeoJSON minifié, coordonnées arrondies à **0,00001°**, réparation des éventuelles intersections d’arrondi et convention `gj2008`. Les anneaux extérieurs sont horaires et les trous antihoraires, pour les calculs sphériques de D3. MapLibre sait ingérer cette convention ; il ne faut pas inverser les anneaux avant `geoContains` ou `geoBounds`.
6. Compresser les deux représentations en gzip niveau 9. Les fichiers `.gz` sont des ressources explicites, décodées par le worker ; ils ne nécessitent pas que le serveur local active la compression HTTP.

La tolérance de conversion est petite devant un pixel au zoom Pays 8,8 dans les latitudes du réseau. Elle **ne rend pas la source plus précise** : Natural Earth contient déjà des côtes généralisées. La géométrie ne remplace pas un fond urbain au niveau Campus. Le GeoJSON de contrôle et le TopoJSON représentent les mêmes arcs simplifiés avec des arrondis légèrement différents, de l’ordre de quelques mètres.

## Fichiers livrés

| Fichier | Octets | Usage |
| --- | ---: | --- |
| `world-countries.topo.json.gz` | 2 006 643 | Chargement principal : environ 2,01 Mo, soit 1,91 Mio |
| `world-countries.topo.json` | 5 392 533 | Repli sans `DecompressionStream`, inspection de la topologie |
| `world-countries.geojson` | 11 149 320 | Contrôles géométriques ; non chargé par le parcours normal ou son repli |
| `world-countries.geojson.gz` | 3 803 949 | Variante compressée du GeoJSON, non nécessaire au parcours normal |
| `BUILD.json` | — | Paramètres, empreintes SHA-256 et tailles exactes de construction |
| `CHECKS.json` | — | Résultats de la vérification reproductible |

Ne pas télécharger toutes ces variantes à l’ouverture : le parcours normal utilise uniquement le TopoJSON compressé. Sans `DecompressionStream`, le worker charge le **même TopoJSON brut, environ 5,39 Mo**, puis suit la même conversion et le même nettoyage du tracé polaire. Il ne télécharge plus le GeoJSON de 11,15 Mo en repli. Le nombre d’octets du fichier n’est pas une mesure de mémoire CPU/GPU, de temps de téléchargement ou de fluidité.

La correction du rendu antarctique ne modifie aucun de ces fichiers : le worker retire les segments de fermeture artificiels du mesh destiné aux lignes et une petite couche remplit l’intérieur polaire directement sur la sphère. Les causes, limites et vérifications sont décrites dans [POLAR_NOTES.md](../notes/POLAR_NOTES.md).

## Vérifications et limites

`verify.mjs` contrôle les deux représentations : 258 identifiants uniques, 4 274 polygones, 4 293 anneaux dont 19 trous, coordonnées finies et bornées, fermeture et orientation sphérique de tous les anneaux, 30 pays du catalogue présents, et décompression identique aux fichiers bruts.

Les points de contrôle de **Singapour, Luxembourg, France, Japon et Palestine** se trouvent dans le bon polygone sans que celui-ci couvre le reste du globe. Les Fidji passent les tests sur les deux côtés de l’antiméridien ; leur emprise D3 reste correctement enveloppée. Le trou du Lesotho dans l’Afrique du Sud est conservé.

Les 58 positions du catalogue, après application des corrections existantes, conservent le même résultat de `geoContains` que la source officielle non simplifiée. **54 sont à l’intérieur ; quatre sont déjà hors de la côte généralisée du jeu source : Abu Dhabi, Québec, Málaga et Penang.** Aucun campus n’a été déplacé et aucune côte n’a été inventée pour masquer cet écart. Le moteur doit conserver le repli de sélection vers les campus proches des côtes. Le jeu ne garantit pas l’alignement métrique avec OpenStreetMap au niveau du quartier.

Ces vérifications sont géométriques et locales. Les vérifications du rendu dans MapLibre, du worker, du temps d’entrée et des appareils mobiles appartiennent à l’intégration du moteur et sont consignées dans les notes de l’aperçu ; elles ne sont pas déduites de ce script.

## Reproduire

Depuis la racine du projet, avec Node 20 ou ultérieur et un accès aux sources publiques :

```sh
npm install --prefix /tmp/horizon-geography-build --ignore-scripts --no-audit --no-fund mapshaper@0.6.113
curl -L --fail -o /tmp/horizon-ne-countries-5.1.1.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.1/geojson/ne_10m_admin_0_countries.geojson
node site/geography/build.mjs --source /tmp/horizon-ne-countries-5.1.1.geojson
```

Le script vérifie la version de Mapshaper et l’empreinte du fichier source, reconstruit les quatre assets et lance la vérification. L’option `--mapshaper /chemin/vers/mapshaper/bin/mapshaper` permet une installation temporaire différente. Sans `--source`, le script télécharge la même URL officielle avant de contrôler son empreinte.

Pour vérifier à nouveau les assets sans les reconstruire :

```sh
node site/geography/verify.mjs --source /tmp/horizon-ne-countries-5.1.1.geojson
```

Le fichier source est facultatif pour cette dernière commande ; sans lui, la vérification des assets passe mais `sourceContainmentCompared` vaut `false`. Les tailles et empreintes gzip peuvent dépendre de la version de zlib ; `BUILD.json` enregistre les sorties réellement produites.
