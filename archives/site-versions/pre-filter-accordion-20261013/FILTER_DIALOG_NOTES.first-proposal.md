# Panneau de filtres commun — 13 octobre 2026

## Demande et résultat

L’utilisateur demande d’améliorer le rendu du panneau **Filtrer** de Projets, d’appliquer le même rendu au filtre des profils et de renommer son bouton **Profil** en **Filtrer**.

Le panneau partagé conserve le verre et les couleurs du thème. Son en-tête regroupe un pictogramme de filtre, un titre clair, une courte explication et une fermeture de 44 px. Les critères sont répartis dans des groupes encadrés avec des compteurs de sélection : **Projets / Technologies / Savoir-faire**, ou **Statut / Rentrée** dans Profils. Les choix offrent une cible d’au moins 44 px, une case avec coche explicite, un fond sélectionné et un état partiel pour les sélections collectives de projets. Le tronc commun se répartit sur deux colonnes lorsque la place le permet ; le mobile conserve une colonne lisible.

La zone des choix défile indépendamment. Le pied reste disponible avec le nombre total de critères, **Réinitialiser**, **Annuler** et **Appliquer** ; il se réorganise sur mobile. Le panneau est un `dialog` natif : Échap, fermeture, annulation ou clic commencé et terminé sur le fond rejettent le brouillon et rendent le focus au bouton d’origine. Les libellés, groupes et actions existent en FR/EN/AR, avec direction RTL en arabe.

Les modifications restent en brouillon jusqu’à **Appliquer**. **Réinitialiser** vide uniquement le brouillon, puis demande l’application pour confirmer. Ces règles sont maintenant communes aux projets et profils. Les facettes conservent leur logique antérieure : plusieurs choix au sein d’un groupe sont réunis, les groupes se croisent, et la géographie/favoris/tri restent composables. Le changement ne crée aucun nouveau critère métier.

## Contrat et sources

`content-controls.mjs?v=14` ouvre `project-filter-dialog.mjs?v=2` avec `presentation:'dialog'` et `kind:'projects'` ou `kind:'people'`. Les options/groupes et valeurs restent fournis par le contrôleur ; la sortie `onApply(values)` reste un tableau de critères. La feuille de style est `project-filter-dialog.css?v=2`. Les deux filtres de projets (liste principale et contributions d’un profil) gardent le même composant.

Les noms historiques `createProjectFilterDialog` et `projectFilterDialogSections` sont conservés pour compatibilité, mais prennent en charge les deux types. Le bouton affiche **Filtrer / Filter / تصفية** dans les deux rubriques.

L’état exact précédent des trois sources est préservé dans [pre-filter-dialog-refresh-20261013](archive/pre-filter-dialog-refresh-20261013/README.md), avec empreintes. Le lecteur historique partagé `pre-content-pagination-20261013/preview.html` conserve le panneau Projets initial et le menu Profils précédent avec leurs dépendances. Aucune ancienne étude n’est supprimée.

## Contrôles

Huit tests du dialogue passent : facettes et choix uniques, brouillon Profil appliqué puis rouvert, Annuler/Échap/fermeture et focus, remise à zéro confirmée ou annulée dans les deux types, choix collectifs Projets avec état mixte et technologies/savoir-faire préservés, trois langues/RTL, destruction des écouteurs obsolètes et fermeture par le fond. Les tests existants de catégories et filtres passent aussi.

```sh
node --test site/tests/project-filter-dialog.test.mjs site/tests/content-category-groups.test.mjs site/tests/content-filters.test.mjs
```

Ces tests utilisent un DOM simulé pour les interactions et le cycle de vie. Ils ne remplacent pas l’examen réel du verre, des dimensions et du défilement. La passe navigateur est réalisée par l’agent principal après raccord dans les deux entrées ; ses captures/résultats sont à consigner dans `checks/` avec le périmètre réellement contrôlé.

Travail local de prototype, **0.0.1 pré-alpha** inchangée ; aucune publication ou modification Figma.
