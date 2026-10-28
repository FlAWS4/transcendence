# Quatre transitions HORIZON ↔ AWARDS — 8 octobre 2026

L’utilisateur n’apprécie pas la transformation actuelle et demande des essais. Cette galerie est une nouvelle recherche séparée : aucune piste choisie ni animation du site remplacée.

## Propositions

1. **Fondu velouté** : disparition puis apparition avec un flou léger ; 850 ms.
2. **Passage vertical** : les mots entiers se relaient dans une fenêtre masquée ; 900 ms.
3. **Le R comme repère** : seule lettre commune, le R reste visible puis rejoint sa position dans le mot suivant ; les autres lettres sortent avant son déplacement et entrent ensuite ; 1 200 ms.
4. **Balayage lumineux** : un trait fin sépare les parties visibles des deux mots, puis disparaît à la fin ; 1 050 ms.

Durées et effets proposés par l’assistant, à comparer. Chaque carte possède deux destinations explicites, Rejouer et un curseur qui pilote les mêmes images que la lecture animée. Les deux commandes communes permettent une comparaison simultanée ; vitesse normale, ralentie ou rapide, thème clair/sombre. Une inversion en cours conserve la progression complémentaire.

## Identité et fonctionnement

- Symbole officiel `../../../../shared/brand/logo-42.svg` conservé, sans transformation de son dessin ; blanc en sombre par le traitement déjà utilisé dans le prototype.
- Jost Medium locale, espacement −0,035 em, proportion symbole/texte 58/25 et intervalle 22/25, comme l’en-tête. Le format de démonstration agrandit cet ensemble sans modifier ses proportions.
- Couleurs issues des jetons existants, turquoise en clair et rose en sombre. L’espace du mot réserve la largeur maximale des deux noms pour stabiliser le symbole dans cette comparaison.
- Aucun caractère aléatoire, shader, image générée ou dépendance nouvelle. CSS et module JavaScript locaux ; calcul de positions depuis les métriques de la police réellement chargée.
- Noms accessibles stables, boutons et curseurs au clavier. La réduction des mouvements termine immédiatement la transition demandée ; le curseur reste utilisable manuellement. Masquer l’onglet termine aussi la destination.

## Préservation et vérification

Les sources actives de l’en-tête et toutes les anciennes explorations restent intactes. Références de conception : `../../../../site/notes/BRAND_WORDMARK_NOTES.md`, `brand-wordmark.mjs`, `brand-wordmark.css` et styles de la marque actuelle.

Syntaxe JavaScript, absence d’erreur de diff et existence des références locales contrôlées. Un contrôle direct des fonctions de rendu parcourt **808 images calculées**, dans les deux sens : valeurs finies, opacités bornées et huit paires début/fin exactes. La continuité d’inversion des positions, opacités et flous est contrôlée numériquement à six instants pour les trois premières variantes. La quatrième utilise deux zones de découpe complémentaires de part et d’autre du même trait. Ces contrôles portent sur les calculs ; ils ne remplacent pas le rendu de la police dans le navigateur.

La revue source corrige aussi deux cas : inverser le R conserve maintenant son déplacement vertical exact, et masquer l’onglet ne change pas la destination d’une carte restée au repos. Les contrôles navigateur sont à consigner par l’agent principal : aucune vérification mobile, du rendu ou sur téléphone physique n’est revendiquée dans cette première livraison.

Lancement depuis la racine du dépôt : `python3 -m http.server 8765 --bind 127.0.0.1`, puis [ouvrir la galerie](http://127.0.0.1:8765/studies/brand-transition-studies/index.html).

## Contrôle Chrome — 8 octobre 2026

Galerie examinée en clair sur ordinateur (1 910 px puis 1 280 px) et en sombre à 320 × 640. Boutons communs joués dans les deux sens : quatre états finaux 42 AWARDS puis 42 HORIZON confirmés. Les quatre curseurs ont été placés à 50 % au retour ; captures des deux paires examinées : extinction du fondu, ouverture verticale, R isolé, zones de découpe complémentaires du balayage. Rejouer de la piste 03 joué sur mobile. État final AWARDS lisible, largeur de page de 305 px pour une fenêtre de 320 px sans dépassement. Thème clair et format habituel rétablis, galerie laissée ouverte. Pas de téléphone physique, de mesure FPS ni de validation utilisateur de l’un des essais. Animation active inchangée.
