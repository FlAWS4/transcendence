# Captures « recherche ouverte » avant le correctif d'opacité (17 octobre 2026)

Relevés et captures de l'état `search-open` (zone shell) pris le 16 octobre. Le relevé gardait les enfants d'éléments
d'opacité nulle : les boutons du menu du bas, masqués derrière la recherche ouverte, étaient dessinés dans le champ de
recherche (vérification du 17 octobre). `capture_lib.py` ignore désormais tout le sous-arbre d'un élément d'opacité
≤ 0,01 ; l'état est relevé à nouveau. Ces fichiers sont conservés pour l'historique.
