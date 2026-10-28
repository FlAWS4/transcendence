# Contrôle du chargeur (`_controle`)

Dossier de contrôle du chargeur des essais, **pas un essai de design** : la galerie ne le montre pas. Il déclare les trois sortes de fichiers qu’un essai peut fournir, sans rien changer à l’écran, pour qu’un seul chargement de la copie vérifie le mécanisme :

- [styles.css](styles.css) reprend une règle de la copie (`dock-navigation.css`) avec le même blanc écrit autrement : la valeur calculée de `--scope-fill` vaut `rgb(255 255 255)` seulement si la feuille de l’essai vient après toutes celles de la copie ;
- [scope-pill.mjs](scope-pill.mjs) remplace le module de la copie par la carte d’import, réutilise l’original sous une adresse que la carte ne redirige pas (`?original`) et compte les appels de `fit()` ;
- [module.mjs](module.mjs) note dans `window.__essaisControle` le contexte reçu et chaque appel de `pill.onChange()`.

Ouvrir `baseline/content-preview.html?essais=_controle#explore` (ou `baseline/index.html?essais=_controle`) : `document.documentElement.dataset.essaisControle` vaut `scope-pill.mjs`, et `window.__essaisControle` garde les appels. Contrôle du 26 octobre 2026 : voir [NOTES.md](../../NOTES.md), « Vérifications ».
