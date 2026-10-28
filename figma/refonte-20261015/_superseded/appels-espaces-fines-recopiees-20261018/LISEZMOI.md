# Appels à espace fine insécable, remplacés (18 octobre 2026, vers 20 h 15)

- **1236-variables-textes.js** (variables de texte de Projets) : **envoyé** à 20 h 05 avec une recopie inexacte. Le coursier a écrit l’espace fine insécable (U+202F) de « 0 / 1 000 » comme une espace ordinaire (contrôle DIFF au caractère 784). Résultat : `{"created":9,"reused":1,"updated":0}` (copie dans ce dossier). Les 9 variables créées sont exactes, car leurs valeurs n’ont pas ce caractère. « Projets/0 ∕ 1 000 » a gardé sa valeur antérieure, avec une espace ordinaire. Remplacé par un appel qui porte le caractère sous forme de jeton visible (⟦202f⟧), décodé dans Figma : 9 variables reprises telles quelles, celle-ci mise à jour en place.
- **1287 et 1288** (« Signaler », ordinateur et mobile, en français, deux parts chacun) : jamais envoyés. Leur texte « 0 / 1 000 » contient le même caractère. Ils sont régénérés avec les jetons.

Aucun appel envoyé avant le 18 octobre au soir ne contenait U+202F ni U+00A0. Les scripts d’avant les jetons sont gardés dans ../scripts-avant-jetons-espaces-20261018.
