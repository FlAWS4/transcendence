# Étude « Halo et lumière » — Explorer de la version B

Proposition de design pour la page Explorer de la version B (`site-b/`), réalisée le 24 octobre 2026 dans le cadre d’une comparaison de directions. C’est une **maquette** : elle redessine le cadre réel du site (en-tête, barre de lieu, menu bas, capsule de recherche, dé) avec les feuilles de style de `site/`, et propose ce qui se passe entre la barre de lieu et le menu. Elle ne modifie ni `site/` ni `site-b/`, qu’elle lit seulement. Rien ici n’est accepté par l’utilisateur ni intégré au site.

## Ouvrir

- Maquette : http://127.0.0.1:8765/studies/explorer-b-design/halo/index.html (dépôt servi depuis sa racine).
- Le panneau « Étude · Halo et lumière » (en bas à gauche, réductible) change l’état, le thème et la langue, et ouvre un aperçu à la taille d’un écran (1440×900, 1280×720, 390×844, 320×640, 667×375).
- Adresses directes : `?v=l1|l2|l3|paris|lyon|mulhouse&theme=light|dark&lang=fr|en|ar`, `&panel=0` pour masquer le panneau (captures). États de contrôle supplémentaires : `l1w` (curseur sur Monde), `monde` (les 30 pays), `l2am`, `l2af`, `asie`, `l3mar`.
- `&shapes=b` affiche les silhouettes livrées dans `site-b/explorer-shapes.mjs` au lieu de celles de l’étude (sans points de campus, voir plus bas).
- [Planche des silhouettes](shapes.html) de l’étude, avec la position des campus et le point d’ancrage des noms.

La maquette se joue : flèches (inversées en arabe), Début/Fin, Entrée ou clic sur le centre pour valider, clic sur un voisin pour le placer au centre, glisser au doigt, Échap ou ← de la barre de lieu pour remonter, bande des autres campus sur la fiche. Le filtre des contenus n’existe pas ici.

## L’idée

Les lieux ne sont plus dans des cases : chaque continent, pays ou campus est une silhouette posée sur un halo de lumière, le long d’un horizon courbe (le bord de l’ancien globe). Le monde est un petit globe ; les continents ont la terre turquoise et rose pâle de l’accueil du 27 septembre et leurs campus en points roses ; les pays portent leur drapeau incrusté dans leur forme, le nom écrit par-dessus avec un liseré clair (sombre en thème sombre) ; les campus sont leur logo officiel, posé directement sur la page, le nom en dessous. Le lieu au centre est éclairé (halo, flaque de lumière à ses pieds, bouton Valider) ; ses voisins, plus petits, descendent le long de l’horizon.

Valider un campus ne recouvre pas Explorer : le logo glisse au centre et la fiche se déplie autour de lui, dans la même bande, sans panneau. À gauche les photos (pile de tirages) et les contacts, au centre le logo, le nom, le pays, les chiffres disponibles et le site officiel, à droite l’adresse et les Piscines ; en bas, les autres campus du pays. Quand un campus n’a ni photos ni contacts (56 sur 58), sa place dans son pays remplace les photos et une seule phrase dit ce qui n’est pas encore renseigné.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Cadre réel du site (balisage relevé sur `site/content-preview.html`, styles de `site/`) et scène de l’étude. |
| `halo.css` | Jetons et styles de la direction (préfixe `hx-`) ; styles du panneau d’étude (`study-`). |
| `halo.js` | Données réelles, modèle des niveaux, rendu, gestes, fiche campus, mesures de la bande, panneau. |
| `shapes-standin.js` | Silhouettes de l’étude : monde (globe orthographique), 4 continents, 30 pays, avec points de campus, ancrage du nom et fondu des bords coupés par un méridien. |
| `build-shapes-standin.cjs` | Générateur de `shapes-standin.js` (Node, d3 et topojson de `shared/map-data/`). Arguments : chemin d’une copie de Natural Earth 10 m `ne_10m_admin_0_countries.geojson` (seulement pour les régions de l’ONU) et fichier de sortie. |
| `shapes.html` | Planche de contrôle des silhouettes. |

## Données (lecture seule)

- Campus, pays, adresses : `site/campuses.json` ; sites : `site/campus-websites.json` ; fiches riches (Paris, Mulhouse) : `site/campus-profiles.json` et leurs photos dans `site/assets/campuses/`.
- Continents : `site-b/continents.mjs` (copie de secours dans `halo.js` si le module ne charge pas).
- Logos : `site-b/campus-logos.json` et `site-b/assets/campus-logos/` (fichiers officiels non modifiés). L’affichage retire seulement la plaque blanche : un masque est calculé à l’ouverture à partir des pixels sombres, et le logo est peint dans l’encre du thème.
- Drapeaux : `site-b/assets/flags/<iso2>.svg` (flag-icons 7.5.0), repli sur le CDN jsDelivr de la même version.
- Silhouettes : celles de l’étude par défaut, car `site-b/explorer-shapes.mjs` (livré pendant l’étude) ne donne que `{viewBox, d}` : ni position des campus, ni ancrage du nom.

## Vérifications faites

- 41 états capturés dans Chrome sans interface (via `studies/design-review-studies/checks/helper.py`, un seul Chrome, captures hors dépôt dans le dossier `design-shots/halo/` du bloc-notes de la session) : niveaux 1 à 3, Paris, Lyon et Mulhouse, clair et sombre, 1440×900, 1280×720, 390×844, 320×640, 667×375, français, anglais et arabe. Aucune erreur de console, aucun défilement horizontal.
- Parcours clavier et souris joués : Entrée sur Europe ouvre les pays avec le curseur sur le premier, flèches jusqu’à France, Entrée, Fin puis ←, Entrée sur 42 Paris ouvre la fiche, trois Échap remontent avec le curseur sur le lieu quitté ; clic sur un voisin le place, clic sur le centre valide.
- Transition du campus capturée à 120, 300, 500 et 1 200 ms.
- Contrastes calculés : texte secondaire 6,1:1 (clair) et 8,9:1 (sombre), liens 5,2:1 et 7,3:1, Valider et site officiel 7,2:1 (clair) et 4,5:1 (sombre, règle déjà retenue pour l’accent d’accès), noms sur drapeaux 17:1 avec leur liseré.

## Limites

- Maquette seulement : pas de filtre des contenus, d’historique ni d’URL du site ; le cadre est statique (compte, recherche et dé ne s’ouvrent pas).
- Silhouettes de remplacement : frontières de fait de Natural Earth telles quelles ; la Russie est coupée à 58° E et fondue. Le module définitif devra fournir les points de campus et l’ancrage des noms.
- Logos : le masque est calculé dans le navigateur ; en production il vaudrait mieux le préparer avec les fichiers. Les logos en couleur (`ink` différent de `dark`, aucun en France) gardent leurs couleurs sur une petite plaque claire.
- Non vérifié : lecteurs d’écran réels, couleurs forcées, téléphone physique, mesure des performances.
