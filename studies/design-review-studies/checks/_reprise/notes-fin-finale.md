
## Combinaisons

Le 15 octobre, l’utilisateur décide de ne pas faire contrôler d’avance toutes les combinaisons possibles : **seule la sélection finale de l’utilisateur sera testée en combinaison**, une fois son choix fait. Les trois contrôles prévus (sélection compatible, tous les essais, ensembles susceptibles d’interagir) et la passe d’intégration ne sont donc pas lancés. La sélection retenue le jour même est testée plus bas.

Pendant les vérifications individuelles, plusieurs combinaisons ont déjà été contrôlées, dont les mélanges les plus susceptibles d’interagir :

- les quatre essais d’Explorer ensemble, avant et après un changement de langue et de thème : un seul titre « 42 Paris », aucune erreur ;
- les illustrations adaptées au sombre avec les rôles de couleur, le contour de Visiter et les illustrations variées ; la paire exclusive avec les illustrations atténuées est bien ignorée ;
- le contour de Visiter avec les rôles de couleur ;
- le voile sous la pile basse avec la recherche repliée, à 390 × 844 et 320 × 640 ;
- les titres plus affirmés avec les textes plus lisibles et la signature de marque, puis avec l’échelle unifiée (70 titres sur 6 vues, aucun débordement) ;
- l’échelle unifiée avec les textes plus lisibles et les titres plus affirmés : une pastille rognée par cette combinaison y a été corrigée, puis 380 contrôles des tailles minimales et 152 contrôles de titres passent ;
- le pseudo manquant avec les textes plus lisibles, les titres plus affirmés, l’échelle unifiée et une colonne sous 360 px ;
- la page Awards « à venir » avec 17 essais actifs : son message reste identique au pixel près.

Ces contrôles ne garantissent pas tous les mélanges : la galerie peut tout combiner, mais un conflit reste possible tant que la sélection retenue n’est pas testée.

## Sources et conservation

- [Socle et adaptations](SNAPSHOT.md) : copie figée du prototype du 14 octobre, **137 fichiers**, dont **11 adaptés** avec leurs originaux dans `originals/` ; [manifeste](snapshot-manifest.json) des empreintes et stockage isolé. Le prototype actif `horizon-welcome/` n’est pas modifié.
- Chaque essai vit dans `essais/<id>/` : `essai.css`, `essai.mjs`, `essai.json` (fiche lue par la galerie) et, pour trois essais typographiques, `early.js`. Le chargeur commun tient en trois fichiers : [boot.js](essais/boot.js), [styles.js](essais/styles.js) et [modules.mjs](essais/modules.mjs). Les polices Jost 700/800 et italiques sont dans [essais/_partage/](essais/_partage/fonts.css) avec leur licence OFL ; Jost reste un substitut, Futura PT n’est pas installée.
- Chaque essai a ses contrôles dans `checks/<id>/` : scripts de l’auteur et du vérificateur, mesures (`results.json` et contre-vérifications), captures `avant-*.png` et `apres-*.png`. Outils communs : [helper.py](checks/helper.py), [check-baseline.py](checks/check-baseline.py) et le [contrôle de la galerie](checks/galerie/check.py).
- Galerie : [index.html](index.html), [gallery.css](gallery.css) et [gallery.mjs](gallery.mjs).
- [checks/_reprise/](checks/_reprise/) garde les comptes rendus de réalisation et de vérification des agents, le script de la dernière série, la surveillance mémoire et le générateur de ces notes.
- Les captures de l’avis (une centaine) restent temporaires, hors du dépôt ; chaque essai garde ses propres captures avant/après.
- La collection figure en tête du [registre des recherches](../research-archive/index.html).

## Vérifications réalisées

- **Socle** : 137 empreintes, 11 originaux et 206 références relatives contrôlés le 15 octobre, après la dernière vérification, sans manque ni sortie de l’étude (`python3 -I snapshot.py --verify` ; [preuve initiale](snapshot-verification.json)).
- **Équivalence** : avant la réalisation des essais, la copie sans essai et le prototype actif donnent **0 pixel d’écart** sur cinq états (Projets et Profils ordinateur clair, fiche projet mobile sombre, Chroniques mobile arabe, Explorer avec le vrai globe) ; [résultats](checks/baseline/results.json).
- **Essais** : les 19 essais sont réalisés, contrôlés par leur auteur, puis revérifiés par un second agent chargé de les contredire : **8 validés tels quels, 10 corrigés par leur vérificateur et 1 avec réserves** (le globe dans l’espace libre). Les vérificateurs ont rejoué les mesures, les formats 1440 × 900, 390 × 844 et 320 × 640, et les changements de langue et de thème sans rechargement ; ils ont corrigé les défauts trouvés dans les dossiers des essais.
- **Galerie** : [contrôle](checks/galerie/check.py) avec les fiches finales — 19 cartes sans fiche provisoire, dont 10 marquées « Revient sur une décision » ; 38 captures accessibles ; comparateur chargé des deux côtés (copie sans essai, copie avec l’essai) ; avertissement des paires exclusives ; aucun débordement à 1440, 390 et 320 px et aucune erreur de console ([résultats](checks/galerie/results.json), captures examinées).

Les contrôles utilisent Chrome sans interface et des formats émulés. Aucun téléphone physique, lecteur d’écran réel ou audit WCAG complet n’est revendiqué.

## Incidents

- **14 octobre au matin, mémoire saturée deux fois**, avec un plantage de VS Code : des profils de Chrome sans interface restés dans `/tmp` (en mémoire vive), puis plusieurs Chrome de contrôle sans plafond. Depuis, les profils sont gardés hors de `/tmp` et supprimés à la fermeture, et chaque Chrome tourne sous un plafond de 2,6 Go. Avec l’accord de l’utilisateur, 112 anciens profils sont supprimés.
- **Coupures réseau de l’API vers 13 h 30 puis vers 19 h** : les agents en cours sont perdus, leurs fichiers restent intacts. Les séries reprennent en unités plus petites, chaque étape étant relancée jusqu’à quatre fois ; après la seconde coupure, les étapes terminées sont relues dans un fichier de résultats au lieu d’être refaites.
- **Accélération demandée par l’utilisateur à 14 h 31** : jusqu’à trois Chrome de contrôle à la fois, démarrés seulement avec 3 Go libres. Le soir, avec un navigateur ouvert et l’échange plein, la garde descend à deux Chrome, puis à un seul sous 2 Go disponibles.
- **Pause demandée par l’utilisateur à 14 h 39**, reprise à 18 h 05.
- **Limite d’utilisation de la session atteinte à 20 h 34** : la dernière vérification est reprise le 15 octobre vers 3 h 55, après sa réinitialisation.

## Suite

La sélection de l’utilisateur est testée en combinaison, puis intégrée au prototype actif le 15 octobre, à sa demande, après archivage de l’état précédent ([notes d’intégration](../horizon-welcome/DESIGN_REVIEW_SELECTION_NOTES.md)). Les dix autres essais restent consultables dans la galerie ; la galerie compare toujours chaque essai à la copie figée du 14 octobre.
