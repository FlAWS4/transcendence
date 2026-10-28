# Contenu au premier plan — aperçu du 27 septembre 2026

## Statut et périmètre

**Suite du 28 septembre :** cette navigation est désormais intégrée dans [index.html](index.html), après l’entrée animée. Cet aperçu reste un raccourci direct utilisant le même contrôleur. Le bouton d’article « Explorer le campus » ouvre maintenant une carte en fenêtre, limitée au quartier, sans quitter la lecture. Voir [CONTENT_INTEGRATION_NOTES.md](CONTENT_INTEGRATION_NOTES.md). Les paragraphes ci-dessous décrivent la proposition initiale du 27 septembre.


L’utilisateur demande de voir la proposition de navigation après avoir explicitement donné la priorité au contenu. [content-preview.html](content-preview.html) est une **exploration séparée**, pas le remplacement accepté de l’accueil actif. Elle ouvre directement Projets pour faciliter l’examen, sans rejouer l’introduction. [index.html](index.html) garde sa composition ; les deux sélecteurs géographiques et les fiches campus, explicitement demandés, sont intégrés aux deux aperçus.

Lancement depuis la racine : `python3 -m http.server 8765 --bind 127.0.0.1`, puis `http://127.0.0.1:8765/work/visualizations/horizon-welcome/content-preview.html`.

## Proposition réalisée

- Projets, Parcours et Journal deviennent des pages avec défilement naturel. Menu latéral compact sur ordinateur, barre flottante basse sur mobile ; FR/EN/AR et RTL, thèmes clair/sombre.
- Quatre projets, deux parcours et deux articles fictifs, explicitement signalés, dans cinq campus. Illustrations SVG locales, sans photos ni données personnelles.
- Liste → lecture complète → retour à la liste avec position et recherche conservées ; liens propres dans le fragment URL. Exemple : `#projects/minishell-under-the-prompt?country=FRA&campus=paris`.
- Le contexte Monde/Pays/Campus reste filtrable. La recherche éditoriale porte sur les sujets/technologies ; le filtre géographique n’a plus de champ de recherche.
- Explorer retrouve **la même instance de carte et sa caméra** lorsque le périmètre n’a pas changé. Les contenus cachent la carte, sans reconstruire le WebGL ; aucun mécanisme de pause GPU ni gain FPS n’est revendiqué. Un changement géographique demandé dans les contenus déplace la carte correspondante en arrière-plan.
- Les entrées d’historique gardent la position de lecture. Retour navigateur ferme une éventuelle fiche pour éviter de conserver un campus devenu étranger à la route.

## Contrôles

Chrome : liste bureau, ouverture d’un projet, retour avec position à environ 787 px conservée ; Parcours/Journal ; filtre France puis Paris ; choix Tokyo depuis tous les pays inférant Japon ; une seule carte. Pages mobiles 390 × 844 FR clair/AR sombre et barre basse examinées, sans débordement horizontal. Les fenêtres de filtre contiennent exactement deux `select`, aucun champ de recherche, environ 285 px de hauteur au format contrôlé. L’ancienne règle `height:auto` faisait étirer le dialogue : remplacée par `height:max-content`.

Les détails de fiche campus, la flèche et les sélecteurs sont documentés dans [NOTES.md](NOTES.md). Les textes et composants de cet aperçu n’ont pas d’API éditoriale, d’authentification réelle ni de production associée. Aucun test sur téléphone physique ni réseau ralenti ; pas d’acceptation esthétique déduite des vérifications.

Contrôle supplémentaire de caméra : après déplacement manuel Paris au zoom 17,8, centre `[2.3186021634360596,48.89668527500001]` identique avant et après Projets→article→Explorer ; une seule carte, zéro resize, cinq requêtes de rendu avant/après. Le périmètre et la boîte de carte sont restés identiques sur ce parcours mobile.


## Report Figma

Quatre écrans Projets/Minishell ordinateur/mobile, deux fiches Paris et les deux sélecteurs sont reportés dans Figma. [Parcours et limites](../../figma/content-preview-handoff.md), [relevé technique](../../figma/content-preview-state.json). Le lecteur a été contrôlé pour liste → détail → retour, France → Paris, conservation après fermeture/réouverture du filtre, puis ouverture et fermeture de la fiche. Les pages ajoutées sont FR/LTR ; les cartes urbaines et les autres contenus restent fonctionnels seulement dans cet aperçu web.

Les liens des fiches utilisent désormais la langue choisie, puis l’anglais, puis la langue locale parmi les URL vérifiées. Détails et exception Luanda dans [NOTES.md](NOTES.md).
