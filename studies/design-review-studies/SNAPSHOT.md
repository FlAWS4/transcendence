# Socle conservé — 14 octobre 2026

Les essais de cette collection s’appliquent à une **copie figée du prototype Horizon**, prise le 14 octobre 2026 dans l’état local courant (version de travail 0.0.1 pré-alpha, modifications non encore enregistrées dans Git incluses). Le prototype actif sous `horizon-welcome/` n’est pas modifié.

## Entrées

- [baseline/content-preview.html](baseline/content-preview.html#projects) : rubriques et fiches, sans l’arrivée.
- [baseline/index.html](baseline/index.html) : arrivée complète (scan, Se connecter / Visiter, puis globe).

Sans paramètre, la copie s’affiche comme le prototype actif. Les paramètres d’adresse servent à la galerie :

| Paramètre | Effet |
| --- | --- |
| `?essais=id1,id2` | Active un ou plusieurs essais, dans l’ordre défini par [essais/boot.js](essais/boot.js). Deux paires sont exclusives : pour chacune, seul le premier essai demandé s’applique. |
| `?theme=light` ou `dark` | Ouvre la copie dans ce thème (préférence mémorisée dans le stockage réservé à l’étude). |
| `?lang=fr`, `en` ou `ar` | Ouvre la copie dans cette langue, sans changer le prototype actif. |

## Contenu et adaptations

Le [manifeste](snapshot-manifest.json) enregistre les **137 fichiers locaux** recopiés, leur origine, leur taille et leurs empreintes avant et après adaptation : modules, styles, données, médias, polices, symbole 42, bibliothèques cartographiques, géographie et dépendances du déchiffrement. Les archives, tests, captures et anciennes pistes ne sont pas recopiés. Les URL partagées deviennent des fichiers physiques dans `baseline/shared/`.

**11 fichiers sont adaptés** ; leurs octets d’origine restent dans `originals/` :

- chemins des dépendances partagées vers `baseline/shared/` ;
- sept clés ou préfixes de stockage isolés avec `horizon-design-review-studies-20261014-` (thème, préférences de contenu actuelles/anciennes, ancienne disposition, commentaires, signalements, liens de dépôt) : les essais ne lisent ni n’écrivent les favoris, commentaires ou réglages du prototype actif ;
- dans les deux entrées, le chargeur `../essais/boot.js` placé avant le démarrage du thème, puis `../essais/styles.js` et `../essais/modules.mjs` en fin d’en-tête, et un titre propre à l’étude ;
- à la fin de `welcome.mjs`, un pont en lecture seule `window.horizonStudy` (accès au globe, à la langue et à la rubrique, et changement de langue utilisé par `?lang=`). Il est défini une fois le contrôleur initialisé.

Les rues détaillées d’un campus utilisent toujours le fournisseur cartographique distant existant : la copie ne promet pas leur disponibilité hors ligne.

## Chargeur des essais

Chaque essai vit dans `essais/<id>/` : `essai.css` (chargée seulement si l’essai est actif, après toutes les feuilles du socle), `essai.mjs` (comportements éventuels, importés après l’initialisation du socle), `essai.json` (fiche lue par la galerie) et, pour trois essais typographiques, `early.js` exécuté avant les modules du socle. Les polices Jost 700/800 et italiques 500/700/800 utilisées par ces essais sont dans `essais/_partage/` avec leur licence OFL ; Jost reste un substitut, Futura PT n’est pas installée.

## Contrôles

```sh
python3 -I studies/design-review-studies/snapshot.py --verify
python3 -I studies/design-review-studies/checks/check-baseline.py
```

Le premier contrôle vérifie les 137 empreintes, les 11 originaux et **206 références relatives sans manque ni sortie de l’étude** ([preuve](snapshot-verification.json)). Le second compare dans Chrome la copie et le prototype actif sur cinq états (Projets et Profils ordinateur clair, fiche projet mobile sombre, Chroniques mobile arabe, Explorer avec le vrai globe) : **écart de 0 pixel** sans essai, avant la réalisation des essais ; [résultats](checks/baseline/results.json). Pour reproduire la copie depuis les sources actuelles, utiliser un **nouveau** dossier : `snapshot.py --output /tmp/…` refuse d’écraser une étude existante.
