# Catégories de filtres dépliables — 13 octobre 2026

## Demande actuelle et réalisation

L’utilisateur demande d’abord d’améliorer le panneau **Filtrer** de Projets et d’appliquer le même rendu à Profils, avec un bouton renommé **Filtrer**. Il **rejette explicitement la première proposition visuelle** : il veut que chaque catégorie possède une commande permettant de tout sélectionner et puisse se déplier pour choisir individuellement. Cette précision remplace le panneau de cartes de critères, conservé dans l’archive ci-dessous.

Le panneau courant présente des catégories **repliées à l’ouverture**. Chaque ligne a deux commandes distinctes : le titre, le compteur et la flèche déplient/replient les choix ; **Tout sélectionner / Tout désélectionner** agit sur l’ensemble de la catégorie sans la déplier. Une sélection partielle affiche un état mixte visuel et accessible. Replier conserve tous les choix en brouillon.

- Projets : **Projets**, **Technologies**, **Savoir-faire**. À l’intérieur de Projets, **Tronc commun** et **Spécialisation** possèdent à leur tour sélection collective et déploiement. **Projets personnels** reste un choix direct, selon la demande antérieure.
- Profils : **Statut** et **Rentrée**, avec les mêmes commandes collectives et individuelles.

Le panneau garde **Appliquer**, **Annuler**, **Réinitialiser**. Aucune sélection n’atteint les contenus avant Appliquer ; Réinitialiser vide le brouillon puis demande l’application pour confirmer. Échap, la croix, Annuler ou un geste commencé et terminé sur le fond ferment sans appliquer et rendent le focus. Les groupes utilisent de vrais boutons de divulgation (`aria-expanded`, `aria-controls`) et des boutons collectifs (`aria-pressed=false/mixed/true`) ; les critères individuels restent des cases natives. Le panneau est un `dialog` natif.

FR/EN/AR et RTL sont conservés, y compris **1 critère sélectionné / 1 criterion selected**. Les options défilent dans le corps ; le pied demeure visible. La palette et les surfaces de verre restent celles du site. Le bouton affiche **Filtrer / Filter / تصفية** dans les deux rubriques.

Les critères gardent leur logique : réunion des choix au sein d’une facette, croisement des facettes, combinaison avec pays/campus/favoris/tri. Les nouveaux exemples de pagination indiquent leur `projectType` explicitement ; `content-filters.mjs?v=12` le valide parmi les types existants, avec repli sur les anciens IDs, sans déduction depuis les tags.

## Sources et conservation

`content-controls.mjs?v=15` ouvre `project-filter-dialog.mjs?v=3`, avec `presentation:'dialog'` et `kind:'projects'` ou `kind:'people'`. La CSS active est `project-filter-dialog.css?v=3`. Les options/groupes et valeurs restent fournis par le contrôleur ; `onApply(values)` renvoie un tableau de critères. Les noms historiques `createProjectFilterDialog` et `projectFilterDialogSections` sont conservés, avec prise en charge des deux types.

L’état initial avant la première proposition reste dans [pre-filter-dialog-refresh-20261013](../../archives/site-versions/pre-filter-dialog-refresh-20261013/README.md), avec lecteur historique partagé prépagination. La **première proposition rejetée**, ses sources exactes, tests et note sont dans [pre-filter-accordion-20261013](../../archives/site-versions/pre-filter-accordion-20261013/README.md), avec lecteur partagé précompte. Les empreintes et sources d’origine sont préservées ; aucune ancienne exploration n’est supprimée.

## Contrôles automatiques

Les **12 cas** du dialogue passent : facettes et choix uniques, brouillon Profil appliqué puis rouvert, annulation/Échap/croix/focus, remise à zéro confirmée ou annulée, collectifs Projets avec technologies/savoir-faire conservés, sélection collective de **chaque** catégorie et sousgroupe sans déploiement, repli/choix individuel/états mixtes des parents, indépendance Statut/Rentrée, langues/RTL, singulier, écouteurs obsolètes et fermeture par le fond.

Les tests de catégories, filtres, géographie et indépendance du globe passent sur le corpus enrichi. Les anciens scénarios de régression utilisent toujours les références aux neuf publications et six profils originaux, sélectionnés par IDs dans `tests/legacy-content-fixture.mjs` ; les nouveaux exemples ont leurs contrôles séparés. Un nouveau cas de type explicite vérifie le filtrage des projets ajoutés et le rejet des valeurs malformées.

```sh
node --test site/tests/project-filter-dialog.test.mjs site/tests/content-category-groups.test.mjs site/tests/content-filters.test.mjs site/tests/content-geography.test.mjs site/tests/map-independent-filter.test.mjs
```

Un contrôle de reprise a relevé que l’achèvement tardif du globe pouvait fermer un brouillon ouvert. Les rendus incidents de catalogue, disponibilité et échec de carte gardent maintenant les contrôles ouverts ; un callback de carte correspondant au même périmètre les conserve également. Une vraie nouvelle sélection géographique continue de remplacer le contexte. Ce correctif est couvert par le septième cas d’indépendance de la carte.

## Première proposition — vérifiée puis rejetée

La première proposition utilisait de grandes cartes de groupes, des cases visibles directement et des compteurs. Ses parcours Appliquer/Annuler/Réinitialiser, profils Statut+Rentrée et arabe à 320 px ont été joués dans Chrome avec globe bloqué. Ses [résultats](../checks/20261013-filter-dialog-browser.json), [Projets FR](../checks/20261013-filter-projects-fr.png), [Profils FR](../checks/20261013-filter-profiles-fr.png), [Projets AR](../checks/20261013-filter-projects-ar.png) et [Profils AR](../checks/20261013-filter-people-ar.png) sont conservés comme preuves de **cette proposition rejetée**, pas comme validation du rendu actuel.

## Accordéons — vérification Chrome finale

Les [24 cas du navigateur](../checks/20261013-filter-accordion-browser.json) passent ; le [script reproductible](../checks/20261013-filter-accordion-browser.py) est conservé. Les huit empreintes des sources concernées sont identiques au début et à la fin du contrôle, réalisé avec **26 projets / 26 profils / 26 chroniques**, avant l’extension suivante du corpus.

Sur ordinateur FR clair : catégories initialement repliées, sélection collective sans déploiement, choix individuel qui rend le groupe mixte, propagation aux sousgroupes/parents, brouillon annulé ou appliqué, Réinitialiser annulé puis confirmé, singulier, Statut et Rentrée combinés. Le clavier natif joue **Entrée** pour replier, **Espace** pour sélectionner toute une catégorie et **Échap** pour fermer avec retour du focus. Un premier envoi CDP d’Entrée sans son événement texte ne simulait pas une activation native complète ; la tentative est conservée séparément, puis le banc corrigé passe. Aucun changement produit n’a été nécessaire pour ce point.

Dix captures ont été examinées : [Projets repliés](../checks/20261013-filter-accordion-projects-folded-fr.png), [dépliés avec états mixtes](../checks/20261013-filter-accordion-projects-expanded-fr.png), [Profils repliés](../checks/20261013-filter-accordion-profiles-folded-fr.png), [Profils dépliés](../checks/20261013-filter-accordion-profiles-expanded-fr.png), Projets et Profils en arabe sombre à **320 × 640** repliés/dépliés, [paysage arabe 640 × 360](../checks/20261013-filter-accordion-landscape-ar.png) et brouillon conservé après préparation du globe. Aucun débordement horizontal relevé ; le corps défile si nécessaire et le pied reste dans l’écran.

La requête du module cartographique est ensuite suspendue dans une nouvelle page. Le filtre Profils est ouvert, Statut déplié et Cadet coché en brouillon. Après reprise, **le vrai globe atteint l’état prêt** et [le même dialogue reste ouvert](../checks/20261013-filter-accordion-draft-after-map-ready.png), avec le même élément DOM, le critère coché et le déploiement conservé. Aucune exception JavaScript non traitée n’est observée dans ces scénarios.

Contrôle Chrome automatisé avec formats mobiles simulés, sans téléphone physique. Travail local de prototype, **0.0.1 pré-alpha** inchangée ; aucune publication ou modification Figma.
