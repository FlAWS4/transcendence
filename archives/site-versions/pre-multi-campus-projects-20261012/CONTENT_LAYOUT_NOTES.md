# Rubriques et recherche dans le dock — 4 octobre 2026

> État historique de la première intégration. Les dimensions, versions et premiers réglages de contraste ci-dessous sont remplacés par [les ajustements suivants du 4 octobre](INTERFACE_POLISH_NOTES.md). Recherche, contenus et choix Grille/Liste restent valables.

## Décisions utilisateur

Après avoir demandé de retravailler la disposition actuelle, l’utilisateur précise finalement vouloir **reprendre l’agencement de la première étude** pour Projets, Parcours et Journal. Il ajoute un choix **Grille / Liste**, puis retire les recherches propres à chaque rubrique puisque la nouvelle recherche est générale.

Il demande également de reprendre la barre de navigation de la première étude et d’ajouter une **loupe transformant le menu en barre de recherche animée**. Il précise ensuite que la loupe doit rester **séparée du menu et au même niveau**. Il confirme la portée : **tout Horizon — campus, projets, parcours et journal**. La contrainte précédente de conserver les couleurs et les styles reste appliquée ; les trois études sont des archives intactes.

## Réalisation web

- Même composition pour les trois index : contenu centré de 1 100 px au maximum, introduction de 780 px, ligne de compteur et boutons Grille/Liste, puis grille de trois colonnes ; deux sous 850 px, une sous 600 px. Toutes les entrées restent visibles (l’étude simplifiée masquait une carte à certaines tailles, ce comportement n’est pas repris).
- Illustrations ratio 1,5 sur ordinateur et 1,65 sur mobile. Polices, tailles de titres, textes, couleurs, illustrations et pages de lecture existantes conservés.
- Vue Liste : rangées image/texte, même ordre et mêmes contenus, empilement des rangées sur mobile. Le choix est commun aux rubriques et mémorisé localement, avec repli en mémoire si le stockage est indisponible.
- Dock inspiré de la première piste : icône à côté du nom sur ordinateur, au-dessus sur mobile ; ajout de la loupe. Même taille entre Explorer, index et article. Menu de 510 px et bouton rond de 60 px séparés de 12 px, soit un ensemble de 582 px maximum et 76 px de haut. Sur mobile : hauteur 73 px, loupe de 50 px, espace de 10 px et marges de 16 px (12 px sous 360 px). Les largeurs s’adaptent à la surface disponible hors barre de défilement. Les surfaces/couleurs viennent des tokens existants.
- Ouverture : les rubriques s’effacent avec un léger décalage, la barre s’élargit jusqu’à 680 px et le champ prend leur place. La loupe rejoint visuellement la barre tandis que le champ et les résultats apparaissent. Fermeture inverse ; transitions désactivées si mouvements réduits.
- Recherche locale dans le catalogue de 58 campus et les huit contenus fictifs, FR/EN/AR, accents et diacritiques ignorés. Titres/tags prioritaires ; noms de pays localisés. Pages de huit résultats, compteur du total et bouton « Voir plus » jusqu’à épuisement. Une requête correspondant à un campus ou un pays utilise les relations géographiques : Paris donne son campus et deux contenus, sans Lyon malgré son adresse « rue de Paris » ; France donne douze résultats. Aucun backend ou contenu réel ajouté.
- Résultat campus → Explorer vers ce campus ; résultat contenu → article et contexte du campus associé. La recherche porte sur tout le corpus, indépendamment du filtre géographique ouvert. Anciennes recherches de rubrique retirées ; les anciennes URL q sont normalisées sans filtre invisible.
- Échap/croix rétablissent la loupe ; flèches et Entrée parcourent/ouvrent les résultats. Le focus suit l’article ou la carte après sélection. Fermeture extérieure et navigation annulent les réponses périmées. La fenêtre visible du navigateur borne le panneau et remonte le dock lors d’un clavier virtuel.

Les pages continuent à défiler dans le document. Le moteur cartographique v30, le portail de visite campus et les animations de changement de rubrique sont conservés. Le type et la vue de l’index restent portés par son propre élément pendant la sortie vers Explorer, évitant un changement de grille au milieu du fondu.

## Fichiers et versions

- content-layout.css?v=2 : composition commune et deux présentations.
- dock-search.mjs?v=4 et dock-search.css?v=dark-contrast-5 : UI animée, clavier/focus et séparation du dock sombre.
- dock-search-data.mjs?v=3 : recherche pure et classement.
- welcome.mjs?v=dock-search-47 : raccords au catalogue et aux routes, choix de vue, anciennes recherches retirées.
- content-preview.mjs?v=14 : raccourci vers le même contrôleur.

## Vérifications

**38 tests passent**, zéro échec : 14 sur les données multilingues et relations géographiques, 8 sur la recherche, la pagination et les courses de saisie/annulation, 8 sur les transitions de contenu et 8 sur la session de visite campus. Les tests UI reproduisent notamment une soumission immédiate après nouvelle saisie et une ancienne réponse arrivant après fermeture/réouverture.

Chrome : entrée principale visiteur → Projets jouée avec focus au titre, puis rendus ordinateur1440×960, mobile390×844 et petit format320×720 examinés. Grille/Liste, conservation lors d’un changement de rubrique et d’un rechargement, absence de recherche locale, recherche Paris → article Minishell, retour liste, recherche en arabe « اليابان » → Tokyo par flèche/Entrée, Échap et retour du focus contrôlés. Un seul canvas ; aucune erreur console nouvelle relevée sur ces parcours. Mesures du titre, introduction, barre et titre de carte identiques entre clair et sombre pour Parcours mobile arabe. Les huit empreintes SHA-256 des études et welcome.css sont inchangées.

Contrôle final après séparation de la loupe : Paris affiche trois résultats ; France affiche huit puis douze via « Voir plus », avec focus sur la première nouvelle réponse. Entrée principale mobile → Projets : dock absent avant l’entrée, focus au titre après apparition, un canvas. Loupe et menu alignés sur ordinateur et mobile, RTL sombre contrôlé jusqu’à 320 × 720 ; recherche « فرنسا » et panneau défilant examinés. Aucun débordement horizontal. Le contrôle final Projets → Explorer → Projets conserve exactement le rectangle du dock (582 × 76 px sur ordinateur), avec un canvas et aucune erreur/avertissement console.

Limites : aucun téléphone physique ni clavier virtuel réel testé ; visualViewport contrôlé par le code, pas par une saisie sur appareil. Pas de mesure FPS. La recherche se limite aux données du prototype. Les pays et contenus éditoriaux sont localisés ; les noms de campus restent ceux du catalogue officiel, sans translittération automatique (par exemple « باريس » ne remplace pas encore « Paris »). La sélection de Tokyo et sa route sont contrôlées ; pas de nouvelle mesure de chargement urbain ou des positions de tous les campus. Les choix visuels attendent l’examen de l’utilisateur.

## Figma

Report de la composition, du choix de présentation et du dock dans la piste active : voir [le relevé dédié](../../figma/content-layout-handoff.md). Six index en grille, deux démonstrations Liste et deux états Paris à trois résultats ; dock actualisé sur seize cadres actifs et huit raccords. Audit de 75 cadres et 84 destinations valides ; captures Projets ordinateur et accueil arabe sombre mobile examinées. Figma reste une maquette : recherche illustrative sans moteur ni pagination, Liste raccordée uniquement dans Projets, parcours RTL historiques conservés et lecteur non rejoué.

## Orientation IA

L’utilisateur accepte une approche hybride : résultats directs pour une demande simple comme Paris, recherche conversationnelle et multimodale pour une description vague. Les indices peuvent porter sur tous les types de contenu présents sur Horizon et leurs relations : l’avatar et les images d’un projet sont des exemples, pas une limitation au texte et à l’image. Vidéo, audio, documents, code et données structurées font aussi partie de la portée lorsqu’ils sont présents. Ce besoin est consigné dans [AI_SEARCH_NOTES.md](AI_SEARCH_NOTES.md). Aucun modèle, fournisseur ou backend IA n’est encore raccordé.


## Premier réglage du contraste sombre — étape remplacée le 4 octobre 2026

L’utilisateur signale que le menu se confond avec le fond sombre, contrairement au mode clair. Réglage ciblé réalisé : surface graphite existante #29292E opaque, contour neutre mélangeant 14 % de blanc et 86 % de graphite, ombre noire. Même traitement pour le menu, la loupe séparée et le panneau de recherche ; survol de la loupe légèrement éclairci. Les accents rose/turquoise, la palette globale, les dimensions et toutes les règles claires restent conservés. Seule la feuille dock-search.css et sa version de chargement dans les deux pages sont modifiées. Le contrôleur reste dock-search-47.

Chrome : comparaison avant/après sur Parcours ordinateur ; rectangles du menu, de la loupe et du titre identiques. Fond, contour, ombre, couleur du texte et rectangles du mode clair exactement identiques à la mesure préalable. Mode sombre vérifié à rgb(41,41,46) sur menu et panneau, recherche Paris à trois résultats, ouverture/Échap et passage Parcours → Explorer joués. Mobile 390 × 844 : menu au-dessus des contenus et devant le globe examinés. Correction purement visuelle, sans nouvelle suite automatisée ; pas de mesure FPS ou de contrôle sur appareil physique. Report Figma consigné dans les notes spécialisées.
