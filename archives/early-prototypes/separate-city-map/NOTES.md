# 42 Horizon — accueil plus chaleureux

## Demande et statut — 27 septembre 2026

L’utilisateur trouve la direction artistique trop froide et demande un accueil plus accueillant **en conservant la charte 42**. Il précise que le mobile doit avoir sa propre composition, avec une **barre de navigation flottante en bas, arrondie et animée**. Il choisit explicitement de **garder l’accueil épuré autour du globe**, puis demande de rendre le globe lui-même plus accueillant.

Cette exploration web est une **proposition réalisée et contrôlée**, pas encore une direction approuvée par l’utilisateur. Elle reste séparée des archives, du prototype de déchiffrement et de Figma V9. Le n°22 reste l’animation choisie ; son raccordement à l’introduction complète n’est pas réalisé ici.

## Réalisation

- Globe géographique manipulable, avec des océans blancs légèrement rosés, des continents turquoise doux, des ombres discrètes, un halo et des repères roses dans des pastilles blanches. La grille et les frontières restent fines. La navigation Monde → Pays → Campus est conservée.
- Accueil sans cartes, photos ou accroche éditoriale. Fond clair, diffusion légère de rose et de turquoise ; menu vertical sur ordinateur et globe à droite en FR/EN, disposition opposée en arabe sans miroir de la géographie.
- Mobile jusqu’à 700 px : globe centré en portrait, quatre rubriques dans une capsule en bas, indicateur glissant, espaces de sécurité et commandes adaptées à la hauteur disponible. Les contenus s’ouvrent dans un panneau au-dessus de la barre ; en paysage compact, le globe et les commandes se répartissent horizontalement.
- Rubriques Explorer, Projets, Parcours et Le journal ; filtrage des exemples selon le périmètre. Sélecteur pays/campus disponible indépendamment de l’orientation du globe. Boutons de zoom et retour, rotation par glissement et commandes clavier.
- FR/EN/AR, interface RTL, thème clair par défaut et sombre. Le bloc de marque conserve l’ordre 42 puis nom ; arabe affiché en AR. Cet aperçu sans connexion ni région simulée ne couvre pas le cas anglais avec connexion IP dans le monde arabe.
- Réduction des mouvements prise en compte dans le CSS, les animations des contenus et les déplacements du globe. En cas d’activation pendant un déplacement vers une destination, la destination est appliquée directement.

## Références et périmètre graphique

Le PDF local [Charte graphique 2024](../../../docs/42%20-%20Charte%20graphique%202024.pdf) a été relu et ses pages utiles examinées : noir/blanc p. 17 ; couleurs secondaires p. 18 ; palette « Bubbly », inclusion et rose p. 21 ; dégradés p. 22 ; exemples UI p. 30–35. Les teintes principales utilisées sont le turquoise `#00BABC`, le rose UI `#EC3391` et leurs mélanges transparents avec le blanc ou le fond sombre. La capsule et son animation sont une interprétation proposée, pas un composant officiel imposé par la charte.

Le dessin du logo est repris du SVG existant. Jost reste le substitut provisoire du projet ; la police Futura PT exacte n’est pas fournie. L’arabe utilise ici les polices de repli du navigateur, sans nouvelle police téléchargée.

Les captures actuelles des accueils Figma ordinateur `115:4` et mobile `123:162` ont été consultées pour comparer la composition. Aucun nœud Figma n’a été modifié.

## Fichiers et lancement

- `index.html` : structure, logo existant et icônes.
- `welcome.css` : couleurs locales, compositions ordinateur/mobile, thèmes et transitions.
- `welcome.mjs` : langues, navigation, panneaux, sélecteurs et contenus de démonstration.
- `globe.js` : copie adaptée du moteur antérieur, exposée sous `createWelcomeGlobe` pour préserver l’archive.
- `campuses.json`, `campus-location-overrides.json` : annuaire daté et corrections de localisation documentées dans [CAMPUS_SOURCES.md](CAMPUS_SOURCES.md).
- `city-map.mjs`, `city-map.css`, `vendor/` : carte urbaine et Leaflet local ; détails dans [CITY_MAP_NOTES.md](CITY_MAP_NOTES.md).

Le moteur et le fond du globe sont locaux dans `../../../shared/map-data/` (D3 7.9, TopoJSON 3.1, Natural Earth / D3 Maps). Le SVG 42, les tokens existants et Jost sont réutilisés sans modification. L’annuaire contient désormais **58 campus dans 30 pays** ; les cinq lieux initiaux gardent leurs contenus de démonstration. 18 positions ont été corrigées à partir de sources cartographiques et des adresses officielles ; les 40 autres gardent les coordonnées du réseau, sans vérification individuelle du bâtiment. Les tuiles de la vue urbaine nécessitent Internet. Les projets, parcours et articles restent fictifs, sans API Intra ni base de données.

Depuis la racine du projet :

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Ouvrir <http://127.0.0.1:8765/site/index.html>. Ne pas lancer un second serveur si celui du projet fonctionne déjà. Aucun hébergement public n’a été créé.

## Vérifications — 27 septembre 2026

- Syntaxe JavaScript des deux fichiers vérifiée avec `node --check` ; relecture indépendante du moteur et de ses interactions.
- Rendu Chrome examiné sur ordinateur 1920 × 1047, mobile 390 × 844, petit écran 320 × 568 et paysage 667 × 375. Aucun débordement du document dans les mesures effectuées. Barre basse, indicateur actif, panneaux et fermeture examinés, dont petit écran en arabe sombre.
- Navigation entre les quatre rubriques, changements rapides, passage FR → AR → EN → FR et thèmes clair/sombre joués. Ordre RTL, marque et repères contrôlés visuellement.
- France → Paris par les repères, Tokyo par le sélecteur, filtrage des projets par campus, retour au monde, zoom par bouton, rotation par glissement souris et retour par Échap joués. Le repère sélectionné transmet le focus au globe. Une fiche d’exemple s’ouvre ; Échap ferme la boîte et rend le focus à son bouton d’origine.
- Corrections pendant les contrôles : contour SVG hérité des icônes, hauteur minimale du mobile, espaces de sécurité, ancrage RTL des repères, focus après sélection, thème changé pendant le chargement, texte de présentation masqué derrière les panneaux, retour du défilement en haut et arrêt des animations lors d’un changement de préférence.
- Les huit sources de référence relevées avant le travail (ancien globe, scène, déchiffrement principal et moteurs du n°22) sont identiques octet pour octet après les modifications.

Limites : pas de mesure de FPS, pas de contrôle sur téléphone physique ni de geste pincé joué ; la réduction des mouvements a été relue dans le code mais pas forcée dans le navigateur. Aucun audit exhaustif d’accessibilité ni contrôle de tous les navigateurs. Les contrôles ne prouvent ni intégration au parcours complet ni acceptation de cette proposition.

## Correction des bords au zoom — 27 septembre 2026

L’utilisateur signale les bords nets du globe zoomé et demande une transition progressive. La coupure rectangulaire venait des limites du SVG. Un masque transparent sur ses quatre côtés fait maintenant apparaître le fond réel, en clair comme en sombre. Il s’applique au SVG seul ; les repères HTML, leur focus et les commandes restent hors du masque.

La largeur du fondu augmente continûment entre les zooms 1 et 1,55, puis reste plafonnée : 14 % de la largeur jusqu’à 180 px horizontalement, 18 % de la hauteur jusqu’à 150 px verticalement. À zoom 1, elle vaut zéro et conserve le contour entier. Le réglage suit le zoom et le redimensionnement dans `render()`, sans nouveau relevé DOM par frame. Seul `globe.js` est modifié pour cette correction.

Vérification : coupure reproduite avant modification ; syntaxe JS valide ; rendu après correction examiné sur ordinateur clair 1920 × 1047 au niveau France et mobile sombre 390 × 844 au niveau Paris. Sélection des repères, retour au monde et boutons de zoom joués. Les valeurs observées passent de 0 au niveau Monde à un fondu intermédiaire au premier cran de zoom, puis au fondu complet. Le masque des repères reste absent ; aucun débordement horizontal relevé sur le mobile contrôlé. Pas de nouveau contrôle sur appareil physique, Safari ou Firefox.


## Navigation complète, annuaire et vue urbaine — 27 septembre 2026

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
