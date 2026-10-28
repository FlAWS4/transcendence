# Vue rapprochée d’un campus — 27 septembre 2026

> **Document historique — proposition remplacée le 27 septembre 2026.** L’utilisateur veut zoomer directement dans le même globe et refuse le panneau de carte séparé. L’accueil actif utilise maintenant `integrated-globe.mjs` avec MapLibre et OpenFreeMap, du globe au quartier dans une seule scène ; voir les [notes actuelles](NOTES.md#correction-active--zoom-continu-dans-le-globe--27-septembre-2026). Les fichiers Leaflet décrits ci-dessous sont conservés mais ne sont plus chargés par cet accueil. L’ancienne proposition reste jouable dans [l’archive autonome avec carte séparée](../horizon-welcome-separate-city/index.html). Les réalisations et contrôles ci-dessous concernent uniquement cette étape antérieure.

## Demande et réalisation

L’utilisateur demande qu’un clic sur un campus descende franchement vers sa ville et sa position, avec le genre de mouvement de caméra d’une carte de Call of Duty. Il n’a pas demandé de reprendre des éléments graphiques ou des données du jeu, ni explicitement un fond satellite.

Le module `city-map.mjs` propose une vraie carte urbaine interactive : arrivée au niveau ville (zoom 13), puis descente centrée sur les coordonnées du campus après application des corrections documentées (zoom 18, environ 3,2 secondes). Les rues et les emprises de bâtiments proviennent d’OpenStreetMap ; aucun quartier ou bâtiment n’est inventé. Le repère rose et les tons adoucis reprennent les variables de l’accueil. Il s’agit d’une carte vue du dessus, pas d’une reconstitution 3D ou de photographies satellite.

Le glissement, la molette, le pincement et les commandes clavier sont gérés par Leaflet. Une interaction interrompt l’arrivée animée. Le zoom minimal 11 et Échap ferment cette vue et appellent le contrôleur pour revenir au pays. Le contrôleur principal garde la responsabilité du parcours Pays → Monde et du filtrage des sections. Fermer annule les temporisations, interrompt le mouvement et détruit la carte et ses événements.

FR/EN/AR et RTL sont disponibles pour les éléments ajoutés ; les noms figurant dans le fond OpenStreetMap restent ceux de son rendu standard. Les coordonnées et la géographie ne sont pas inversées. La préférence de mouvements réduits supprime l’arrivée animée ; les transitions Leaflet sont également neutralisées par CSS. Le thème modifie uniquement le rendu visuel des tuiles, pas leurs positions ou leurs données.

## Intégration

Charger `city-map.css` après les styles de l’accueil. Ce fichier importe la feuille Leaflet locale. Le conteneur passé au module doit avoir une position et une taille définies par le contrôleur de l’accueil ; son contenu remplit cet espace. Le module charge automatiquement le moteur Leaflet local lors de la première ouverture.

```js
import {createCityMap} from './city-map.mjs';

const city = createCityMap({
  container: document.getElementById('city-map'),
  locale: 'fr',
  reducedMotion: false,
  onExit: campus => selectCountry(campus.country),
  onZoomChange: ({zoom, minZoom, maxZoom}) => updateZoomControls(zoom, minZoom, maxZoom)
});
await city.open({id: 'paris', name: '42 Paris', coordinates: [longitude, latitude]});
```

Méthodes : `open(campus)`, `close()`, `zoomBy(factor)`, `setLocale(locale)`, `setReducedMotion(boolean)`, `refreshLayout()`, `destroy()`. `onExit` reçoit le campus quitté une seule fois, après fermeture. Les coordonnées suivent l’ordre GeoJSON `[longitude, latitude]` ; `coords` est aussi accepté. Le contrôleur utilise le champ `name` du relevé du réseau, sans traduire ou inventer un nom de campus. Si une correction documentée est appliquée, le contrôleur fournit `locationSource:{url,precision:'campus'|'address'}` : le libellé devient « Emplacement cartographié du campus » ou « Repère de l’adresse du campus », sans attribuer ces nouvelles coordonnées au réseau 42.

Le statut de chargement propose un réessai et un retour au pays si le moteur ou le fond ne charge pas. Les tuiles sont demandées seulement pour la vue courante et avec un tampon limité ; les images ne sont pas téléchargées pour une utilisation hors ligne, ni enregistrées dans le dépôt. Le navigateur conserve son cache HTTP, son User-Agent et un Referer vers l’origine de l’aperçu.

## Sources et dépendances

- [Leaflet 1.9.4, version stable et fichiers officiels](https://leafletjs.com/download.html) : moteur et CSS conservés dans `vendor/`, avec licence BSD 2-Clause dans `LEAFLET_LICENSE.txt`. Les empreintes SHA-256 des deux fichiers correspondent aux empreintes publiées : JS `20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=`, CSS `p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=`. Le repère est un élément HTML propre au projet, sans icônes image Leaflet nécessaires.
- [API Leaflet, notamment `flyTo`, `stop`, `TileLayer` et `remove`](https://leafletjs.com/reference.html) : animation et interactions documentées.
- [Conditions du serveur de tuiles OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/) consultées le 27 septembre 2026 : service public pour consultation interactive raisonnable, attribution visible, cache et Referer conservés, pas de téléchargement massif ou hors ligne. URL HTTPS recommandée utilisée. Disponibilité sans garantie ; une application diffusée largement devra dimensionner son fournisseur en fonction du trafic réel.
- [Données et attribution OpenStreetMap](https://www.openstreetmap.org/copyright) : crédit visible sur la carte, avec lien, jamais masqué derrière une commande. La précision du repère dépend des coordonnées du réseau ou de la correction documentée transmise par le contrôleur ; la simple présence d’un bâtiment sur le fond ne suffit pas à identifier un campus.

Une vue satellite a été étudiée, mais n’est pas utilisée. Le service classique Esri répond sans clé, alors que [ses conditions actuelles](https://goto.arcgis.com/termsofuse/viewsummary) et [les indications Esri Leaflet](https://github.com/Esri/esri-leaflet) impliquent une licence ou identité ArcGIS pour utiliser son contenu : ne pas confondre accès technique et autorisation. [VersaTiles](https://versatiles.org/) propose une alternative ouverte, mais les tuiles de détail vérifiées pour Tokyo et Rio n’étaient pas disponibles ; elle ne répondait donc pas à la couverture mondiale attendue. Aucun asset de Call of Duty, Google ou Esri n’est embarqué.

## Vérifications et limites

- Syntaxe du module vérifiée avec `node --check`.
- Empreintes et licence de Leaflet contrôlées ; téléchargement des deux dépendances depuis le CDN indiqué par son site officiel.
- L’agent principal rapporte les contrôles navigateur intégrés suivants : arrivée sur Paris jusqu’au zoom 18 sur ordinateur et mobile 390 × 844, tuiles réelles affichées, attribution visible, clair/sombre, Échap vers la France avec focus rendu au globe, console sans erreur. Le parcours à la molette Monde → France → Paris → ville a également été joué. Ces vérifications précèdent les dernières corrections de certaines coordonnées : voir les notes générales pour leur vérification finale.
- Relecture des changements rapides de campus : les événements de chargement et de mouvement sont attachés au numéro d’ouverture courant, pour qu’une ancienne réponse réseau ne modifie pas la nouvelle vue. Le contrôleur ferme l’ancienne carte avant la prochaine transition. Au clavier en mode de mouvement réduit, le déplacement utilise explicitement une mise à jour sans animation.

Cette vue dépend du réseau pour les rues et bâtiments. Une absence de couverture ou de connexion est signalée, sans remplacer les données par un décor fictif ; cette panne n’a pas été forcée dans le navigateur. Une carte web au zoom 18 ne garantit pas une position de campus exacte au bâtiment près : le repère porte un libellé de provenance et de précision adapté aux données reçues. Le pincement sur appareil physique, les performances mesurées, la préférence de mouvement forcée et l’accessibilité complète ne sont pas vérifiés par la seule lecture du code. Les archives, Figma et l’introduction n°22 restent hors de ce module.
