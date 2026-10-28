# Trois études de navigation — 4 octobre 2026

## Origine et statut

L’utilisateur signale que le menu latéral change de dimensions entre Explorer et les contenus, que son déplacement vers le bas sur mobile crée une rupture, et que le globe n’est pas centré sur ordinateur. Après une première discussion sans modification, il indique une préférence pour la première proposition et demande **trois versions simplifiées à part pour voir le rendu**.

Ces études répondent à cette demande de comparaison. La préférence pour la première piste ne vaut pas autorisation de remplacer l’accueil actif, ni acceptation définitive du design.

## Ouvrir les aperçus

[Galerie](index.html) — serveur local : http://127.0.0.1:8765/studies/navigation-studies/index.html

| Piste | Composition et transition |
| --- | --- |
| [01 · Le point d’ancrage](01-dock.html) | Barre flottante en bas sur les deux formats. Le globe centré devient un petit médaillon dans le sélecteur de contexte lorsqu’une rubrique s’ouvre. |
| [02 · L’atlas vivant](02-atlas.html) | Même barre basse permanente. Une grande page arrondie monte devant le globe, qui s’efface derrière elle. |
| [03 · Le bandeau éditorial](03-editorial.html) | Navigation horizontale en haut sur les deux formats. Le contenu remplace le globe dans l’espace central, avec un indicateur sous la rubrique active. |

Les liens 01 / 02 / 03 en haut permettent de changer de piste ; la flèche retourne à la galerie. Explorer, Projets, Parcours et Journal fonctionnent. Les cartes ouvrent un exemple de lecture, avec retour à la liste. Le bouton lune/soleil change le thème. Le sélecteur propose Monde, France et 42 Paris et filtre les exemples. On peut tourner le globe avec un glissement ou les flèches du clavier.

## Réalisation

- HTML/CSS/JavaScript locaux, dans ce dossier séparé ; aucun fichier de l’accueil actif ni de Figma modifié pour ces études.
- Même identité et mêmes contenus pour comparer les compositions : logo 42 existant, HORIZON en Jost, turquoise et rose, clair/sombre.
- Globe SVG orthographique : D3 et topojson-client locaux, contours du world.json local (177 entités), cinq repères de démonstration. Le sélecteur oriente l’illustration, sans descente vers une carte urbaine.
- Les huit contenus fictifs et leurs illustrations SVG sont importés en lecture depuis les modules existants de horizon-welcome ; chaque liste montre jusqu’à trois cartes.
- Routes de rubrique et d’article par fragment d’URL. Le périmètre et le thème ne sont pas persistés entre les pages de comparaison.
- Les préférences de mouvements réduits sont prises en compte par les transitions CSS et l’orientation du globe.
- index.html / index.css : galerie ; trois fichiers HTML : compositions ; shared.css : styles communs et variantes ; app.mjs : navigation ; globe.mjs : illustration interactive.

## Vérifications effectuées

Chrome, ordinateur 1440 × 960 et viewport mobile 390 × 844 :

- Les trois pistes sont ouvertes et leurs rendus examinés ; passage Explorer → contenus → Explorer joué.
- Les rectangles du menu et de ses boutons restent identiques entre les rubriques, à viewport fixe, dans les trois pistes sur les deux formats.
- Globe centré horizontalement ; première piste : position finale du médaillon alignée sur son emplacement dans le sélecteur.
- Première piste : liste → article → retour ; filtre 42 Paris donnant un projet ; rotation réelle par glissement confirmée par modification de la géométrie SVG.
- Deuxième piste : montée de page et Journal mobile sombre examinés. Troisième piste : navigation haute et pages ordinateur/mobile examinées.
- Aucun débordement horizontal relevé sur les vues contrôlées ; galerie également examinée sur les deux formats.
- Aucune erreur ni alerte console relevée lors des parcours. Syntaxe des deux modules vérifiée.

Ce sont des contrôles navigateur avec tailles simulées, pas des essais sur téléphone physique. Aucun test de performance, de pincement réel ou de préférence de mouvements réduits forcée n’est revendiqué.

## Limites volontaires

Il s’agit de maquettes interactives françaises, destinées à comparer la navigation et les transitions. Elles ne reprennent pas l’entrée cryptée, l’authentification, les 58 campus interactifs, MapLibre et la visite de quartier, les langues/RTL ou tous les comportements du site principal. Les nombres 58 campus / 30 pays reprennent le catalogue du prototype principal ; le globe de ces études n’affiche que cinq repères illustratifs.

Aucune publication, intégration à l’accueil principal ou mise à jour Figma n’est incluse. La suite dépend du retour de l’utilisateur sur ces aperçus.

## Sélection et conservation — suite du 4 octobre 2026

Après examen, l’utilisateur choisit explicitement **la première piste**, demande son report dans Figma et précise deux contraintes : **conserver les trois pistes comme archives du parcours de réflexion**, et **modifier uniquement l’agencement sans changer les couleurs ni le style existants**.

Les huit fichiers de rendu de cette galerie restent dans leur état de comparaison. Le texte « aucun choix n’est encore arrêté » appartient donc à l’état historique de la galerie. Le choix retenu et sa réalisation ultérieure sont consignés ici, sans réécrire les essais. Le [manifeste SHA-256](ARCHIVE_MANIFEST.json) identifie ces huit fichiers.

L’intégration utilise la carte et les styles du site actif, et non le globe SVG simplifié ou les couleurs des études. Voir les [notes du dock intégré](../../site/notes/DOCK_NAVIGATION_NOTES.md). Les différences de rendu des études ne sont pas une décision de nouvelle palette.
