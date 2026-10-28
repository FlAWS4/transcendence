# Lecteur de médias partagé — 8 octobre 2026

L’utilisateur demande de pouvoir ouvrir les photos et vidéos dans tout le site actif. `media-viewer.mjs` et `media-viewer.css` fournissent le lecteur commun ; les composants campus, profils, projets et Chroniques raccordent leurs médias à cette API. Ces nouveaux fichiers n’écrasent aucune exploration antérieure.

## Contrat d’intégration

```js
import {openMediaViewer} from './media-viewer.mjs?v=1';

const viewer = openMediaViewer({
  items: [{type:'image', src:'./photo.jpg', alt:'Description', caption:'Légende', credit:'Crédit'}],
  index: 0,
  locale: 'fr',
  trigger: button,
});
// À la destruction du composant qui a ouvert ce média :
viewer?.close();
```

Charger également `media-viewer.css?v=1`. Les textes des éléments sont déjà localisés par l’appelant. Types acceptés :

- `image` : `src`, `alt`, `caption`, `credit` optionnel ;
- `video` : mêmes champs, `poster` optionnel ; fichier vidéo direct, sans iframe ni intégration externe ;
- `illustration` : `content` est un `Element` local de confiance, cloné dans le lecteur, avec `alt` et `caption`. Aucune chaîne HTML n’est interprétée. Les SVG clonés utilisent `xMidYMid meet` pour conserver l’illustration entière.

Les sources et affiches doivent être des URL HTTP(S), absolues ou relatives. `javascript:`, `data:`, `blob:` et les fichiers locaux sont refusés. Le lecteur ne transforme pas une adresse YouTube ou autre page web en intégration vidéo. Une source refusée, un chargement échoué ou une liste vide affiche un état d’erreur traduit.

`openMediaViewer` ne lit pas le document à l’import. Il crée un dialogue natif au premier appel, puis réutilise un seul lecteur par document. Le document vient du déclencheur, du contenu d’illustration ou du document courant. Le retour `{element, close()}` donne accès au dialogue et à une fermeture limitée à la session correspondante : une ancienne fiche ne peut pas fermer un média ouvert ensuite par une autre fiche. Sans document disponible, la fonction retourne `null`.

## Comportement

Le dialogue natif s’ouvre au-dessus d’une éventuelle fiche campus. Fermer, cliquer son arrière-plan ou appuyer sur Échap rend le focus au déclencheur encore présent. Échap et l’événement natif `cancel` sont interceptés pour conserver le dialogue sous-jacent. Un ancien événement de fermeture n’efface pas une réouverture immédiate.

Précédent/Suivant et les flèches du clavier parcourent la liste en boucle, avec compteur. L’ordre visuel et les flèches suivent le sens RTL en arabe. Les flèches sur une vidéo conservent leur fonction native de lecture ; aucune navigation de galerie ne les détourne. Les contrôles sont masqués pour un média unique.

La vidéo utilise les commandes natives, `playsInline` et `preload="metadata"`, sans lecture automatique. Changer de média ou fermer appelle pause, remet la position à zéro, retire les sources et l’affiche, recharge l’élément vide puis retire le contenu. Les événements tardifs de l’ancien média ne changent pas le suivant.

L’image, la vidéo ou l’illustration est contenue dans la surface disponible. Le dialogue utilise les couleurs partagées, des boutons de 44 px, une disposition mobile et un pied défilant pour les longues légendes. L’animation d’ouverture est désactivée quand la réduction des mouvements est demandée.

## Vérifications et limites

`node --test tests/media-viewer.test.mjs` passe : **sept cas ciblés** couvrent document absent/singleton, session remplacée, navigation et langues, Échap/cancel/réouverture, arrière-plan/focus, URL et erreurs, configuration/libération vidéo et clone SVG sans mutation de la source.

Ces tests utilisent un DOM simulé et ne prouvent ni le décodage d’un vrai fichier vidéo ni le rendu visuel. Les contrôles navigateur avec images réelles et vidéo de test sont réalisés séparément par l’agent principal ; leurs résultats doivent être consignés après examen. Aucun téléphone physique, hébergement vidéo, téléversement ou nouveau contenu vidéo éditorial n’est déduit de ce lecteur.

### Contrôles Chrome du 8 octobre

L’agent principal examine le lecteur à **320 × 640** depuis la fiche Mulhouse : une photo ouvre la galerie en **1/4**, Suivant affiche **2/4**, puis Échap ferme uniquement le lecteur et rend le focus au bouton photo. La fiche campus reste ouverte. L’illustration de ft_transcendence depuis Médias et le portrait de Luiza s’ouvrent également en grand ; leurs captures mobiles sont examinées, avec l’illustration entière visible.

Le [banc navigateur](tests/media-viewer-browser.html) utilise une vraie vidéo locale déjà conservée dans le projet, `work/figma/entrance-proof/holdMobile.mp4`, sans ajouter de vidéo aux contenus éditoriaux. Les commandes natives sont présentes et aucun démarrage automatique n’a lieu : vidéo en pause, position 0, `readyState` 4 et durée 1,6 s. Un clic sur Lecture lance le fichier et atteint sa fin (`ended` vrai, position 1,6 s). Après fermeture, l’élément est détaché, en pause, revenu à 0 et sans attribut `src`. Ces observations vérifient le décodage et la libération de ce fichier réel dans Chrome.

L’état d’erreur est également examiné en **arabe, thème sombre, 320 px**. Ces contrôles complètent les tests simulés ; aucun essai sur téléphone physique n’est revendiqué.

Après le raccord final des médias et des libellés arabes, `node --test *.test.mjs tests/*.test.mjs` passe sur les **43 fichiers actifs**, sans échec. Imports et caches concordent avec `welcome` **media-members-98** / aperçu **66**. La revue indépendante du lecteur ne relève pas de défaut concret concernant les sessions, les événements tardifs, la libération vidéo et le confinement de l’illustration ; celle de l’intégration confirme les nettoyages lors du remplacement des fiches et le raccord des boutons photo aux gestes campus.

## État précédent consultable

L’[archive avant les médias agrandissables](archive/pre-clickable-media-20261008/preview.html#projects) conserve les fiches et photos non cliquables de l’état 96, avec les données Paris/Mulhouse, les créations collectives et les libellés Chroniques. Les onze sources originales sont intactes ; le lecteur possède son runtime figé, distinct des originaux, et des routes qui restent dans l’archive malgré le `<base>` des assets. [Provenances, vérifications et limites](archive/pre-clickable-media-20261008/README.md).
