# Illustrations et noms de campus cohérents — 17 octobre 2026

## Demande et origine

Pendant la refonte des maquettes Figma, les vérifications écran par écran ont relevé trois rendus du prototype probablement involontaires. L’assistant les a présentés à l’utilisateur. Sa réponse : « Pour les 3 détails je veux que tu fasses ce qu’il y a de plus logique, si il faut changer quelque chose alors change le ».

Le plus logique est de corriger le site pour aligner ces trois cas sur le comportement déjà retenu ailleurs :
1. **Contours des illustrations.** La règle des icônes (`welcome.css` : `svg { fill: none; stroke: currentColor; stroke-width: 1.6 }`) donnait un contour sombre, blanc en sombre, à toutes les formes sans trait propre. Cela touchait les illustrations générées d’une fiche projet ou chronique, de leurs médias et de la visionneuse. Les cartes l’annulent déjà (`.cp-art > svg { stroke: none }`) : la même illustration avait donc deux rendus.
2. **Illustrations en arabe.** Les textes dessinés dans les illustrations (« “ », « & », `$ ./minishell`) héritaient `direction: rtl`. `text-anchor: start` s’ancrait alors au bord droit : le guillemet sortait de la feuille, et le terminal affichait « minishell/. $ » à partir de x = −28.
3. **« Tokyo 42 ».** Dans l’en-tête arabe d’une chronique, le campus était un `<span>` sans isolation. Le bouton « استكشف {campus} » des fiches à campus unique et des chroniques avait le même défaut. L’algorithme bidirectionnel lisait « 42 Tokyo » à l’envers. Les autres noms de campus sont déjà des `<bdi dir="auto">`.

## Réalisation

- `content-preview.css` : `.cp-art > svg` reçoit `direction: ltr` (vignettes des cartes).
- `projects.css` : `.cp-project-media-open>div>svg{stroke:none;direction:ltr}`, pour l’illustration de tête et les médias des fiches et des chroniques.
- `media-viewer.css` : `.media-viewer-illustration svg{stroke:none;direction:ltr}`.
- `project-ui.mjs` : le campus de l’en-tête d’une chronique est un `<bdi dir="auto">` dans son `<span>`. Le libellé « Explorer {campus} » est un `<span>` qui contient le texte et un `<bdi dir="auto">` : un seul élément flexible, donc aucun espace ajouté par le `gap` du bouton.
- Clés de cache : `content-preview.css?v=dock-6`, `projects.css?v=12`, `media-viewer.css?v=2`, `project-ui.mjs?v=42`, `journal-ui.mjs?v=41`, `welcome.mjs?v=audit-fixes-147`, `content-preview.mjs?v=114`. La page de test de la visionneuse suit `media-viewer.css?v=2`.
- Les SVG générés (`content-preview-art.mjs`) ne changent pas. Leur balisage, et donc leur empreinte dans les relevés de la refonte Figma, reste le même.
- Archive de l’état précédent : [`archives/site-versions/pre-illustration-consistency-20261017/`](../../archives/site-versions/pre-illustration-consistency-20261017/README.md), 139 sources exécutables. Pour revenir à l’état 146, retirer les trois règles CSS, rétablir les deux lignes de `project-ui.mjs` et les clés de cache.

## Vérifications

- **Tests** : `node --test site/*.test.mjs site/tests/*.test.mjs` donne **660/660**. Une première version du bouton ajoutait des chaînes avec `append()`, ce que le DOM de test ne gère pas (2 échecs) ; elle utilise maintenant `createTextNode`.
- **Chrome, avant et après** ([`checks/20261017-illustration-consistency/`](../checks/20261017-illustration-consistency/results.json), 11 cas, captures et planches ; part des pixels qui changent) :
  - liste des projets (témoin) : **0 %**, identique au pixel près ;
  - fiche ft_transcendence en clair, en sombre et en arabe : de 0,40 à 0,49 %, dans l’illustration seulement (contours retirés) ;
  - visionneuse : 2,10 %, contours retirés de l’illustration agrandie ;
  - fiche Minishell et chronique en français : 0,84 et 0,88 %, dans l’illustration ; « Explorer 42 Paris » et « Explorer 42 Tokyo » identiques au pixel près ;
  - fiche Minishell en arabe : « استكشف 42 Paris » au lieu de « استكشف Paris 42 » ;
  - chronique en arabe, sur ordinateur et sur mobile : guillemet et « & » à leur place, contours retirés, « 42 Tokyo » dans l’en-tête et dans le bouton ;
  - liste des chroniques en arabe : 0,36 %, guillemet et « & » des vignettes à leur place.

## Limites

- Les autres libellés qui insèrent un nom latin dans une phrase arabe n’ont pas été passés en revue. Seuls les deux cas relevés par les vérifications sont corrigés.
- Le plan du site n’est pas concerné : aucun écran, lien ni bouton n’est ajouté, déplacé ou retiré.
- Version du projet inchangée : 0.0.1 pré-alpha. Aucun commit, push ni publication.

## Suite du 18 octobre — noms de campus des pages profil

**Demande.** La vérification finale des maquettes a relevé, sur les cartes de profil en arabe, « Rio 42 » sur le site contre « 42 Rio » dans Figma. L’assistant a cherché les cas semblables et en a trouvé trois dans `profile-ui.mjs`, le même défaut que l’en-tête des chroniques corrigé la veille. Il a demandé s’il fallait corriger le site de la même façon ; l’utilisateur a répondu « Oui, corriger ».

**Réalisation.**
- `profile-ui.mjs` : une fonction `campusLine()` écrit le nom dans un `<bdi dir="auto">`, pour la ligne campus d’une carte de profil (`p.cp-meta`) et pour les campus de l’historique (`p.cp-profile-campus-name`). Le bouton « Explorer {campus} » d’un profil reçoit, comme celui des fiches, un `<span>` qui contient le texte et le nom isolé.
- Clés de cache : `profile-ui.mjs?v=35`, `project-ui.mjs?v=43`, `journal-ui.mjs?v=42`, `welcome.mjs?v=audit-fixes-148`, `content-preview.mjs?v=115`.
- Archive de l’état précédent : [`archives/site-versions/pre-profile-campus-isolation-20261018/`](../../archives/site-versions/pre-profile-campus-isolation-20261018/README.md), 139 sources.

**Vérifications.**
- Tests : **660/660**.
- Chrome, avant et après ([`checks/20261018-profile-campus-isolation/`](../checks/20261018-profile-campus-isolation/results.json), 8 cas) :
  - liste des profils en arabe : 0,21 % des pixels sur ordinateur en clair, 0,35 % sur mobile en sombre, dans les lignes campus seulement ;
  - profil de Leïla Mansour en arabe : « استكشف 42 Paris » au lieu de « استكشف Paris 42 » ;
  - les trois témoins en français : identiques au pixel près ;
  - onglet Parcours : aucun changement, car aucun profil de démonstration n’a d’historique de campus.
- L’historique de campus est donc contrôlé hors navigateur, avec le DOM des tests (`tests/profile-campus-history.test.mjs`) et un profil fictif passé de Paris à Tokyo : les deux campus sont des `<bdi dir="auto">`, et le bouton contient « استكشف » puis le nom isolé.

**Limites.** Plan du site non concerné ; version 0.0.1 pré-alpha inchangée ; aucun commit, push ni publication.
