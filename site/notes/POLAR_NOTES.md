# Correction de l’Antarctique — 27 septembre 2026

L’utilisateur signale un cercle blanc, des traits radiaux et une portion triangulaire claire ou sombre près du pôle Sud. Deux causes distinctes sont identifiées et corrigées dans l’aperçu local, sans modifier les assets Natural Earth, les côtes sources ni les polygones utilisés pour la sélection.

## Tracé des frontières

L’anneau principal de l’Antarctique se ferme par le méridien +180°, le pôle Sud et le méridien −180°. Cette fermeture est nécessaire au polygone, mais ne décrit pas une côte. `topojson.mesh` l’incluait dans la couche de lignes ; la projection Mercator transformait sa portion à −90° en cercle et ses côtés en traits radiaux.

[polar-geometry.mjs](../polar-geometry.mjs) expose `removePolarBorderSeams(borders)`. Le worker l’applique au mesh destiné au dessin des lignes : **748 segments artificiels sont retirés**, dont 723 au pôle et 25 sur les deux côtés du méridien de fermeture. La vraie côte est conservée et ses deux morceaux sont raccordés au point de départ original. Les anneaux des pays et les autres portions du mesh restent inchangés. Ce traitement est identique pour le TopoJSON compressé et son repli brut.

## Remplissage polaire

Le second défaut vient de la limite de Mercator, autour de **85,051° de latitude**. MapLibre étend jusqu’au pôle le contenu qui touche cette limite. Or 29 sommets de vraie côte antarctique du fichier local la dépassent, entre environ −159,37° et −155,50° de longitude, avec une latitude minimale de −85,22194°. L’océan visible à la limite était donc prolongé en pointe jusqu’au pôle. Le [guide officiel du globe](https://github.com/maplibre/maplibre-gl-js/blob/main/developer-guides/globe.md#data-near-the-poles) décrit ce mécanisme ; la [clarification officielle liée à l’issue 5433](https://github.com/maplibre/maplibre-gl-js/pull/8333) confirme qu’une mise à jour documentaire ne constitue pas une correction du moteur.

[polar-cap-layer.mjs](../polar-cap-layer.mjs) ajoute une petite couche de remplissage directement sur la sphère, **uniquement au sud de −85,23°**. Cette zone est intérieure aux terres du jeu source ; elle n’ajoute pas de terrain au-delà d’une côte. Le maillage contient **1 801 sommets et 3 420 triangles**, avec une orientation extérieure cohérente. Il utilise la matrice `mainMatrix` et le plan `clippingPlane` fournis à la couche custom par l’[API publique de rendu](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/CustomRenderMethodInput/), vérifiés également dans la source embarquée de MapLibre 5.24.

La couche est ajoutée avant les frontières. Elle reprend les couleurs de terre des thèmes clair et sombre, avec un fondu de thème ; elle est masquée lorsque les détails du campus sont visibles, pendant la transition vers Mercator et derrière l’horizon. Elle conserve les états WebGL utilisés par les couches suivantes, libère ses buffers à la suppression et reconstruit ses ressources après restauration du contexte graphique. Aucun réseau ni second canvas n’est ajouté.

## Vérifications et portée

**Dix tests automatisés passent : cinq pour les lignes et cinq pour la calotte.** Ils couvrent la suppression exacte des 748 segments, la continuité de côte, les données non mutées, l’idempotence, la sélection polaire intacte, les coordonnées sur la sphère, l’orientation des triangles, 144 points de calotte dans les terres sources, le masquage selon la visibilité/projection/horizon, les couleurs et le cycle des ressources GPU. Les assertions WebGL de cycle de vie utilisent un contexte simulé ; elles ne remplacent pas le contrôle du shader dans un navigateur.

Dans Chrome, l’intégration a été examinée en **clair et sombre**, au globe entier et avec zoom : **aucun cercle ni longue fente visible au pôle dans les vues contrôlées**. Ce constat ne constitue pas une garantie pour tous les angles, GPU ou appareils. Aucun nouveau gain FPS ni contrôle sur téléphone physique n’est revendiqué.

La fine zone comprise entre **85,051° S et 85,23° S** reste soumise au découpage Mercator du fond standard. Le remplissage custom supprime le prolongement de la fente jusqu’au pôle ; il ne reconstruit pas exactement cette petite portion côtière manquante. Cette correction visuelle ne promet donc pas une précision ou une continuité métrique uniforme dans la région. La [provenance géographique](../geography/PROVENANCE.md) conserve les autres limites du jeu Natural Earth.

Pour rejouer les tests depuis la racine :

```sh
node --test site/polar-geometry.test.mjs site/polar-cap-layer.test.mjs
```

Avec le runner Node de cet environnement, la commande peut agréger le résultat par fichier. Exécuter directement chacun des deux fichiers affiche le détail des dix cas.
