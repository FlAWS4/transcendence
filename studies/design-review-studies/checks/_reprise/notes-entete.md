# Essais issus de l’avis sur le design — 14 octobre 2026

## Demande et statut

Le 14 octobre, l’utilisateur demande un avis sur le design du prototype actuel ; l’assistant le donne sans modifier le site. L’utilisateur demande ensuite de réaliser **tous ces changements à part, comme les essais faits auparavant avec Codex**, pour savoir ce qui lui convient.

Cette collection réalise les propositions de l’avis sous forme de **19 essais facultatifs et séparés**, appliqués à une copie figée du site. Quatre problèmes reçoivent deux réponses possibles, à comparer entre elles. Chaque essai se compare à cette copie, seul ou avec d’autres. Ce sont des propositions de l’assistant, réalisées et vérifiées techniquement. Les 19 essais sont terminés et vérifiés le 15 octobre ; **l’utilisateur en retient neuf le même jour, qui sont intégrés au prototype actif** ([notes d’intégration](../horizon-welcome/DESIGN_REVIEW_SELECTION_NOTES.md)) ; les dix autres restent des propositions. Les essais qui reviennent sur une décision explicite antérieure sont signalés dans la galerie et dans le tableau ci-dessous. Le projet reste en **0.0.1 pré-alpha** ; rien n’est commité, poussé ni publié.

## Ouvrir et comparer

La [galerie](index.html) est l’entrée commune. Servir le dépôt avec le serveur local habituel (`python3 -m http.server 8765 --bind 127.0.0.1` depuis la racine), puis ouvrir `http://127.0.0.1:8765/studies/design-review-studies/`.

- **Comparer** : le bouton « Comparer » d’une carte affiche côte à côte la copie du site figée le 14 octobre et l’essai, sur la page où la différence se voit le mieux. Page, format (ordinateur 1440 × 900, mobile 390 × 844, petit mobile 320 × 640, paysage 667 × 375), thème et langue se règlent au-dessus des deux vues. L’affichage « Une grande vue, en bascule » superpose les deux états pour repérer les écarts fins.
- **Ma sélection** : cocher plusieurs essais pour les voir ensemble ; la sélection reste mémorisée dans ce navigateur. Deux paires sont exclusives (« Une colonne sous 360 px » / « Deux colonnes allégées à 320 px », « Illustrations adaptées au sombre » / « Illustrations atténuées en sombre ») : si les deux sont cochés, seul le premier dans l’ordre de la galerie s’applique, et la galerie le signale.
- **Liens directs** : `baseline/content-preview.html?essais=id1,id2&theme=dark&lang=ar#projects` ouvre la copie avec ces essais, ce thème et cette langue ; `baseline/index.html` joue l’arrivée complète. Sans paramètre, la copie s’affiche comme le prototype du 14 octobre. Les préférences, favoris et commentaires de la copie sont séparés de ceux du prototype actif.

Les vues de la galerie sont réduites à l’échelle de la page ; « Ouvrir l’essai » et « Ouvrir la copie du 14 octobre » les ouvrent en grand dans un nouvel onglet.
