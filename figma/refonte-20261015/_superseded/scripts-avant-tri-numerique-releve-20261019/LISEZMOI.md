# Relevé des cadres avant le tri numérique des résultats (19 octobre 2026)

`record_frames.py` lisait `call-results/*.json` dans l'ordre alphabétique des noms de fichiers, en laissant le dernier résultat l'emporter pour un même cadre. Depuis que les appels ont dépassé le numéro 999, « 889-….json » se classe après « 1642-….json » : pour les cadres rendus une première fois par un appel à trois chiffres (passes du 16 et du 17 octobre), le relevé gardait l'identifiant de l'ancien rendu, supprimé depuis. Constaté le 19 octobre vers 4 h UTC en préparant les exports cadre par cadre de « Liste des profils ».

- `record_frames.py` : version remplacée (tri alphabétique).
- `figma-ledger.avant-tri-numerique.json` : relevé avant le dernier enregistrement de la nuit (copie faite avant `record_frames.py`, après les cadres clairs de Profils).
- `figma-ledger.tri-alphabetique-19oct-3h30.json` : relevé produit par l'ancienne version après les clones sombres de Profils.

Remplacé par la version de `scripts/`, qui classe les résultats par numéro d'appel.
