# Contrôle natif de l’entrée — 27 septembre 2026

Exports Figma après la finition demandée : scanner à l’arrivée, maintien chiffré, déchiffrement uniquement après confirmation, slogan lisible et cercle raccordé au globe.

| Preuve | Cadre exporté | Images examinées |
| --- | --- | --- |
| `arrivalMobile.mp4` | `123:145` | 0 / 0,8 / 1,8 / 2,2 / 3 / 3,6 s : binaire, descente du scanner, hexadécimal, retour, chiffré au repos. |
| `holdMobile.mp4` | `128:384` | 0 / 0,6 / 1,2 s : BEYOND THE CODE complet, centré et lisible sur deux lignes. |
| `logoMobile.mp4` | `128:397` | 0 / 0,2 / 0,4 s : phrase qui s’efface, apparition et stabilisation du 42. |
| `birthDesktop.mp4` | `144:582` | 0 / 0,2 / 0,4 / 0,6 / 0,8 / 1 s : cercle initial, expansion jusqu’à la géographie finale, 42 vers l’en-tête, puis interface. FR clair. |
| `birthMobileAR.mp4` | `144:678` | Mêmes instants : raccord mobile en AR sombre, marque à droite, globe sans inversion géographique, barre basse et repères. |

Chaque vidéo a sa planche `-sheet.png`. Les cinq planches ont été ouvertes et examinées. Exports à 5 images/s, qualité basse, largeur 640 pour l’ordinateur et 390 pour le mobile. Les planches mobiles réduisent la largeur à 195 px pour comparer les phases. Les durées MP4 incluent l’image de fin et un arrondi au pas de 0,2 s : ne pas les présenter comme une mesure précise des délais du prototype.

L’audit des réactions et timelines donne : scan 3,65 s sans navigation automatique après l’arrivée ; déchiffrement 3,15 s après confirmation ; maintien final 1,3 s ; phrase→logo 0,6 s ; cercle 0,8 s ; cercle→globe 1,2 s. Le visiteur évite déchiffrement et slogan. Les quatre cadres de naissance conservent leurs anciens calques masqués et portent chacun deux compositions liées à la langue, vers les huit accueils existants.

Le cadre `144:678` a reçu temporairement les modes AR/sombre pour son export, puis ses modes explicites ont été rétablis à `{}`. Aucun accueil source n’a été modifié par cette finition. Une première reconstruction a été refusée automatiquement à cause de la suppression de calques historiques ; le patch finalement appliqué est additif et ne supprime aucun nœud existant.

Après les exports, le parcours connecté mobile FR clair a été rejoué dans le navigateur Figma : entrée `123:145`, scan, connexion explicitement simulée, déchiffrement `128:371`, nouvel accueil `123:162`, puis déplacement de la sélection turquoise vers Projets dans la barre basse. Le parcours visiteur final et la matrice complète n’ont pas été rejoués. Le globe reste une géographie vectorielle figée, sans WebGL ni préchargement dans Figma. Si une confirmation Figma arrive avant la fin du scan, elle commence immédiatement le déchiffrement ; le site attend la fin du scan. Ces limites sont conservées dans [le relevé d’entrée](../entrance-sync-state.json).
