# Matières de verre — 5 octobre 2026

## Demande et choix

L’utilisateur demande des exemples de menus en verre transparent, limités au menu et à la capsule. Quatre modèles séparés sont réalisés avec le même agencement et la palette Horizon existante. Il choisit ensuite explicitement **le verre dépoli**. La galerie garde les quatre pistes pour l’historique ; aucune variante n’est supprimée.

## Comparatif conservé

[Ouvrir les quatre modèles](index.html). Les commandes permettent de comparer les thèmes, les largeurs 320/390/560 px et un fond mobile commun. Les rubriques sont sélectionnables et les capsules deviennent des champs de démonstration, avec une seule croix et fermeture par Échap. Elles ne lancent pas de recherche réelle.

| Piste | Fond clair / sombre | Flou | Intention |
| --- | --- | --- | --- |
| Verre clair | blanc 12 % / graphite 14 % | 5 px | Laisser reconnaître davantage le fond. |
| **Verre dépoli, choisi** | **blanc 32 % / graphite 32 %** | **26 px** | Diffuser le contenu derrière sans aplat opaque. |
| Verre fumé | graphite 12 % / graphite 44 % | 10 px | Ajouter une légère teinte. |
| Verre poli | dégradé neutre translucide | 14 px | Renforcer les reflets de bord. |

Saturation du dépoli : 1,15. Texte opaque et sélection translucide turquoise en clair / rose en sombre. Le menu et la capsule reçoivent exactement le même matériau. Les formes du fond servent uniquement à comparer les effets ; elles ne remplacent pas le fond du site. Effet CSS de transparence et de flou, sans réfraction physique. Repli plus opaque si le flou d’arrière-plan est indisponible.

## Vérifications du comparatif

Syntaxe JavaScript contrôlée. Dans Chrome : quatre modèles examinés en clair puis sombre ; fond mis en mouvement et arrêté ; largeur 320 px ; sélection Journal, ouverture de la recherche et saisie Paris, croix unique puis Échap. Page responsive examinée à 390 × 844, sans débordement horizontal ; ouverture et saisie rejouées après nettoyage de la feuille CSS. Les règles appliquées donnent bien les quatre flous distincts. Le dock des nouveaux modèles partage la correction de croissance continue du bouton et du libellé. Les études précédentes restent inchangées.

Pas de contrôle sur téléphone physique, de clavier virtuel, d’audit complet de contraste sur tous les fonds ou de report Figma de ces études. La préférence de réduction des mouvements est respectée par le CSS, sans nouvelle émulation forcée dans cette session.

## Intégration retenue

Le choix du dépoli est intégré au menu actif et à sa capsule ; preuves et limites dans [les notes du dock](../../site/notes/FLOATING_SEARCH_NOTES.md). Les études de [menus](../menu-studies/index.html) et de [recherche](../search-studies/index.html) sont conservées avec leurs sources.
