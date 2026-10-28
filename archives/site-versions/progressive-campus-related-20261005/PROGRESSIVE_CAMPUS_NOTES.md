# Fiche campus progressive — 5 octobre 2026

## Décision et réalisation

Après les trois propositions de CAMPUS_CARD_IDEAS.md, l’utilisateur choisit explicitement la première. La fiche devient un panneau latéral sur ordinateur, à droite en français/anglais et à gauche en arabe ; sur mobile, un volet bas peut se déployer jusqu’à presque toute la hauteur. Elle reste une superposition à la carte existante.

La fiche présente identité et pays, une invitation à découvrir les contenus du lieu, adresse officielle copiable avec retour accessible, puis lien officiel avec la résolution de langue déjà vérifiée. « Ce qui se crée ici » montre un aperçu illustré par rubrique effectivement disponible et un accès à sa liste filtrée. Les huit exemples existants restent clairement signalés comme fictifs ; aucun effectif ni activité réelle n’est déduit du nombre de contenus. Les campus sans exemples affichent un état vide au lieu d’onglets inutiles.

Le catalogue ne contient aucune photo attribuée aux campus ni présentation éditoriale spécifique. Le repère graphique abstrait ne représente pas le bâtiment ; aucune photo générique n’est présentée comme celle d’un campus. Des photos créditées et de vrais textes pourront remplacer cette identité provisoire quand les données seront disponibles. Les autres propositions restent conservées.

## Intégration

- Composant campus-details.mjs?v=3, CSS campus-details.css?v=4.
- Contrôleur welcome.mjs?v=progressive-campus-54, raccourci content-preview.mjs?v=22.
- Liens vers les contenus : fermeture de la fiche puis libération de la carte temporaire avant navigation, pour rendre le canvas au globe et préserver sa restauration.
- Liens ordinaires vers les contenus avec URL complète de rubrique/campus ; Ctrl/Cmd conserve le comportement natif.
- Site officiel, fallback linguistique, source réseau et message de langue manuelle conservés.
- Ancien module, CSS, test et contrôleurs conservés dans archive/pre-progressive-campus-20261005/. Les études de navigation, recherche et verre restent intactes.

## Vérifications

Premiers contrôles Chrome : panneau Paris sur ordinateur, puis volet 390 × 844 ; déploiement de 74svh à hauteur écran moins20px, fermeture, copie de l’adresse avec retour arabe et lien anglais de repli. Depuis la fiche ouverte au-dessus de la carte d’un projet, le lien Parcours ferme les deux dialogues et ouvre un seul contenu filtré Paris ; retour Explorer effectué. Le rendu clair et arabe sombre est examiné. Une règle globale de positionnement des illustrations a été contenue aux vignettes ; la largeur maximale native du dialogue a été neutralisée pour retrouver des marges mobiles égales.

Contrôles finaux et tests consignés à la fin du travail. Aucun téléphone physique, clavier virtuel, collecte photographique ni report Figma réalisé.
