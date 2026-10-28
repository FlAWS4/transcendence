# MapLibre GL JS — dépendance du globe continu

Relevé du **27 septembre 2026**. Version locale **5.24.0**, dernière version stable de la branche 5 à cette date (`maplibre-gl@5` résout vers `5.24.0`). La branche 6 existe ; le choix de la branche 5 conserve le bundle UMD `maplibregl` et correspond au [guide officiel OpenFreeMap](https://openfreemap.org/quick_start/). Il ne s’agit pas de déclarer la branche 5 comme dernière version majeure.

Fichiers téléchargés sans modification depuis les chemins versionnés du paquet :

| Fichier | Source | SHA-256 |
| --- | --- | --- |
| `maplibre-gl.js` | `https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js` | `45a9b07a9189ce56054c620a947ccf41e291e58c95e9b61533b740aaa65ee5cb` |
| `maplibre-gl.css` | `https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css` | `ab1e70d59ec40465bae7e7030da2f3ccf28133fd502e62bd598eefbadfd7a732` |
| `maplibre-LICENSE.txt` | `https://unpkg.com/maplibre-gl@5.24.0/LICENSE.txt` | `ee5fc05a0677eaf69601d2c7db0d9ecd6cc27c3abc1d0733bc9ed34707cf8ef2` |

Licence principale BSD 3-Clause, avec notices des dépendances incluses dans le fichier de licence. Syntaxe du bundle contrôlée par `node --check`.

## API vérifiée dans la version utilisée

Sources primaires : [version 5.24.0](https://github.com/maplibre/maplibre-gl-js/releases/tag/v5.24.0), [Map](https://github.com/maplibre/maplibre-gl-js/blob/v5.24.0/src/ui/map.ts), [caméra](https://github.com/maplibre/maplibre-gl-js/blob/v5.24.0/src/ui/camera.ts), [fonctionnement du globe](https://github.com/maplibre/maplibre-gl-js/blob/v5.24.0/developer-guides/globe.md).

- Style personnalisé : `{version:8, projection:{type:'globe'}, sources:{...}, layers:[...]}`. Alternativement, `map.setProjection({type:'globe'})` après chargement du style.
- Le même objet `Map` conserve la surface et les interactions à tous les zooms. Sa projection interne se rapproche de Mercator à grande échelle ; aucun panneau de carte supplémentaire n’est nécessaire.
- `flyTo({center:[longitude,latitude], zoom:17.8, duration:3200, curve:1.2, padding:{top,right,bottom,left}, offset:[x,y], essential:false})` anime la caméra ; `easeTo` accepte aussi centre, zoom, durée, padding et décalage. `stop()` interrompt les mouvements en cours.
- `padding` modifie le point de fuite de manière persistante. Ne pas utiliser `retainPadding`, absent de cette API 5.24.0 : recalculer le padding lors des changements ordinateur/mobile/RTL/panneau et le réinitialiser explicitement si nécessaire.
- Un zoom cible absolu simplifie les transitions de latitude : les contrôles du globe compensent automatiquement la taille apparente de la planète pendant le déplacement.
- `essential:false` laisse `flyTo` respecter `prefers-reduced-motion`. Le repli sans animation ignore `offset` dans cette version ; préférer le padding pour une composition qui doit rester identique en mouvements réduits.
- `maxZoom` est configurable dans `Map`. Les géométries vectorielles peuvent être agrandies au-delà du dernier niveau natif de la source ; cela n’ajoute pas de données absentes.

## Fond OpenFreeMap

[OpenFreeMap](https://openfreemap.org/) autorise son service public sans clé et les usages commerciaux ; l’attribution reste requise. Son [guide](https://openfreemap.org/quick_start/) prévoit les styles personnalisés hébergés par l’application. Les [conditions](https://openfreemap.org/tos/) consultées, datées du 9 septembre 2026, décrivent un service sans garantie et n’autorisent pas une collecte automatisée massive de contenu.

Les fichiers du [dépôt officiel des styles](https://github.com/hyperknot/openfreemap-styles/blob/main/styles/liberty/style.json) confirment :

```js
sources: {
  openmaptiles: {type:'vector', url:'https://tiles.openfreemap.org/planet'}
},
glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf'
```

Le schéma est celui d’OpenMapTiles : notamment `water`, `waterway`, `landcover`, `landuse`, `park`, `boundary`, `building`, `transportation`, `transportation_name`, `place`, `poi`. La source fournit l’attribution ; si elle est définie manuellement, conserver les liens correspondant à **OpenFreeMap © OpenMapTiles Data from OpenStreetMap**. Le style propre à Horizon n’a pas besoin de reprendre les sprites, couleurs ou relief du style Liberty.

Le téléchargement du TileJSON et du style public depuis Python a reçu une réponse Cloudflare 403/1010 ; aucun contournement n’a été tenté. Cela ne constitue pas une vérification de leur chargement dans un navigateur normal. Le rendu et la disponibilité des tuiles doivent être contrôlés dans l’aperçu intégré avant d’annoncer son bon fonctionnement. Les dépendances ci-dessus sont locales ; les tuiles et glyphes restent des ressources réseau, avec repli d’erreur à gérer dans le contrôleur.
