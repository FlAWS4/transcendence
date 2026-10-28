# Appel 980 (essai du globe ancré) — 18 octobre 2026

Première partie envoyée avec une recopie **inexacte** : le coursier a écrit en caractères arabes les échappements `\uXXXX`
de la plage arabe du moteur (sens identique, contrôle DIFF). Elle a créé le cadre provisoire 444:32095, que l'appel 981
remplace (même nom de construction). Les parties 2 et 3 n'ont pas été envoyées. Le moteur construit désormais cette plage
par `String.fromCodePoint`, sans caractère littéral ni échappement.
