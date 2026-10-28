# Pagination des listes — 13 octobre 2026

## Suite du13 octobre — pagination compacte et24 profils par page

L’utilisateur signale que tous les numéros ne peuvent pas rester affichés avec100 pages. Le premier algorithme bornait déjà l’affichage à sept emplacements au-delà de sept pages, mais jusqu’à sept boutons numériques pouvaient occuper deux lignes en mobile. Le rendu courant affiche **au plus cinq numéros**, avec première/dernière page et page courante accompagnée de ses voisines ; les intervalles sont remplacés par des ellipses non interactives. Début : `1 2 3 … 7` ; milieu : `1 … 49 50 51 … 100`. Jusqu’à cinq pages, tous les numéros restent visibles. Précédent/Suivant et les liens natifs sont conservés.

L’utilisateur demande ensuite plus de profils par page et choisit explicitement **24** parmi les quantités proposées. Projets/Chroniques restent à12. Avec les78 exemples actuels, cela donne **quatre pages de profils (24/24/24/6)** et sept pages dans les deux rubriques éditoriales. Les liens anciens vers une page de profils supérieure à4 sont ramenés à4 ; le corpus n’est pas gonflé de nouveau. Le paramètre de rubrique est explicite au raccord ; les calculs purs utilisent aussi la rubrique du premier enregistrement quand il est présent.

[Sources exactes et lecteur de la pagination précédente](../../archives/site-versions/pre-compact-pagination-20261013/README.md). Les quinze cas des tests pagination/corpus passent avec ces nouvelles quantités ; les quinze cas historiques de retour/routage/indépendance du globe passent aussi. Le [contrôle Chrome](../checks/20261013-compact-pagination-browser.json), avec [banc](../checks/20261013-compact-pagination-browser.py), passe28 états :100 pages dans chaque rubrique (contenu supplémentaire injecté uniquement dans une réponse HTTP de test), première/milieu/dernière, Précédent et saut à1, FR clair/AR sombre320px, nombres sur une ligne et aucun débordement. Le vrai corpus est parcouru sur ses quatre pages de profils sans doublon ni oubli, avec borne d’ancienne URL et retour fiche/page2/défilement200. Captures examinées. La première tentative mesurait le haut d’éléments de hauteurs différentes ; la mesure des centres verticaux corrige le banc, sans changement du rendu. Son résultat est conservé séparément.

## Première mise en place, avant ces précisions

L’utilisateur demande une pagination pour Projets, Profils et Chroniques. L’assistant retient comme choix courant **12 éléments par page**, avec des numéros et les accès Précédent / Suivant. La première limite était définie dans `CONTENT_PAGE_SIZE` ; `PROFILE_PAGE_SIZE` vaut désormais24 selon le choix ci-dessus. Il ne s’agit pas d’une limite du catalogue.

## Réalisation

- Le périmètre géographique, les catégories, les favoris et le tri s’appliquent à la liste complète avant le découpage. Une publication multicampus garde un seul emplacement par ID. Le dé de découverte continue d’utiliser tous les résultats filtrés.
- `#projects?page=2` (et les deux autres rubriques) ouvre une page donnée. La page1 omet ce paramètre. Valeurs invalides → page1 ; une valeur supérieure au nombre de pages est ramenée à la dernière page disponible, URL comprise.
- Les changements de rubrique, géographie, catégories, tri ou filtre de favoris reviennent à la page1. Langue, thème et affichage grille/liste conservent la page. Modifier un favori ramène à la première page seulement si cette action change la sélection ou son ordre (favoris seuls ou tri par favoris).
- Ouvrir une fiche conserve la provenance de liste dans l’historique, dont la page, la position de lecture et les critères qui déterminent les résultats. Le retour natif et les boutons de retour existants retrouvent cette entrée. Si un favori modifié dans la fiche affecte la sélection ou le tri d’origine, le retour repart à la page1, en haut de liste ; un retour ordinaire ou un changement d’affichage conserve page et défilement. Les liens de pagination déplacent le focus vers le titre accessible et annoncent la page.
- Le pied de liste FR/EN/AR comporte un repère « Page1 sur1 » même avec un seul résultat paginé ; Précédent/Suivant sont alors désactivés. Aucun résultat masque le pied. Les cibles initiales faisaient au moins44px ; leur taille est réduite à la demande suivante décrite en fin de note. Les numéros sont bornés et séparés par des ellipses lorsque nécessaire.

Le corpus initial comportait cinq projets, six profils et deux chroniques. Une première extension à26 exemples par rubrique permettait trois pages ; à la demande suivante de voir environ sept pages, il compte désormais78 exemples par rubrique, soit six pages de12 puis une page de6. L’étape à26 est conservée et consultable. Cette extension est distincte du mécanisme de pagination. Ce prototype reste local, sans API de pagination serveur.

## Sources et préservation

`content-pagination.mjs` fournit le calcul pur, `content-pagination-ui.mjs` le rendu accessible et `content-pagination.css` ses styles partagés. `welcome.mjs` raccorde la page à la liste, aux filtres et à l’historique.

[L’état antérieur consultable](../../archives/site-versions/pre-content-pagination-20261013/preview.html#projects) conserve les listes complètes, les filtres indépendants de la carte et les anciens panneaux de filtres. [Le README de l’archive](../../archives/site-versions/pre-content-pagination-20261013/README.md) précise les sources, dépendances et limites.

La revue finale a reproduit un retour incorrect à la page2 après modification d’un favori depuis une fiche alors que les favoris déterminaient la liste. [Le contrôleur avant correction](../../archives/site-versions/pre-favorites-pagination-return-20261013/README.md) est conservé avec son empreinte et un lien vers le lecteur figé qui présente ce comportement antérieur.

## Vérifications

Les huit cas de `tests/content-pagination.test.mjs` passent :35 entrées sur trois pages, bornes/URL invalides, liste vide, déduplication des publications multicampus, filtres/tri/favoris avant pagination, profils/chroniques, numéros bornés et libellés localisés. Les sept cas existants de `tests/map-independent-filter.test.mjs` passent après extension de leur environnement pour l’annonce de page. Syntaxe du contrôleur vérifiée.

Les trois régressions de `tests/content-pagination-history.test.mjs` passent sur les fonctions réelles du contrôleur : favoris seuls ou tri par favoris modifiés dans une fiche → retour page1/défilement0 ; favori sans effet sur la liste et changement grille/liste → page2/défilement460 conservés ; catégorie modifiée → page1/défilement0.

Le [premier contrôle Chrome](../checks/20261013-pagination-browser.json), avec29 entrées temporaires par rubrique substituées uniquement dans la réponse HTTP, passe : pages12/12/5, numéros/Précédent/Suivant, lien direct et bornes, fiche puis retour à la page2 et au défilement180px, maintien de la page après langue/thème/affichage, retour page1 après tri/géographie. Rendu français ordinateur et arabe320px examinés sans débordement. [Banc](../checks/20261013-pagination-browser.py). Le corpus réel et son extension à sept pages sont contrôlés séparément dans [les notes de données](DEMO_CONTENT_NOTES.md). Aucun téléphone physique.

Le [contrôle Chrome du retour favoris](../checks/20261013-favorites-pagination-browser.json) joue ensuite le correctif avec26 favoris réels du catalogue : départ page2, retrait depuis la fiche puis retour page1/défilement0 ; sans modification, retour page2/défilement180 conservé. [Banc](../checks/20261013-favorites-pagination-browser.py).


## Dernière précision du13 octobre — flèches de pagination

L’utilisateur demande de remplacer Précédent/Suivant par des flèches. Les deux commandes utilisent désormais des SVG cohérents avec les autres icônes, dans les mêmes cibles de44px. Noms accessibles et infobulles conservent les traductions ; l’icône s’inverse en arabe pour suivre le sens de navigation. Liens, destinations et états désactivés aux extrémités restent inchangés. [Le composant compact avec les mots reste consultable](../../archives/site-versions/pre-pagination-arrows-20261013/README.md).

Les15 états du [contrôle Chrome des flèches](../checks/20261013-pagination-arrows-browser.json) passent avec clics pointeur : début, Suivant→2, Précédent→1, dernière page désactivée puis retour6, en français1280/320px et arabe320px. Texte visible absent, SVG présent, cible44px, nom accessible identique à l’infobulle, inversion RTL et aucun débordement. Captures françaises et arabes examinées. [Banc](../checks/20261013-pagination-arrows-browser.py).


## Suite du13 octobre — flèches fixes et boutons plus étroits

L’utilisateur refuse que les flèches changent de position selon la largeur et juge les boutons numériques trop larges. La grille garde désormais **une seule rangée dans tous les formats** : flèche précédente, numéros, flèche suivante. Le groupe centré mesure264px ; ses colonnes de flèches restent fixes même lorsque le nombre de numéros change. L’ordre s’inverse naturellement en arabe. Le passage précédent à deux lignes sous600px est retiré.

Les numéros mesurent au minimum28px de large pour36px de haut, les flèches32×36px ; un nombre plus long peut conserver sa largeur naturelle. Espacement4px, ellipses10px et focus visible. Les règles de pagination et les quantités par page ne changent pas. Feuille `content-pagination.css?v=3` ; calcul2 et renduUI3 conservés. [Ancien composant44px avec seconde rangée mobile consultable](../../archives/site-versions/pre-fixed-pagination-row-20261013/preview.html), [sources exactes et empreintes](../../archives/site-versions/pre-fixed-pagination-row-20261013/README.md).

Les **30 états Chrome** passent : redimensionnements1280/841/840/601/600/390/320px puis retour, première/milieu/dernière de100 pages en FR/EN/AR, clics réels Précédent/Suivant, trois rubriques et retour au corpus réel. Une seule rangée, flèches aux mêmes positions relatives, aucun débordement ; captures françaises/arabe320px et arabe ordinateur examinées. [Banc](../checks/20261013-pagination-fixed-row-browser.py), [preuves et empreintes inchangées](../checks/20261013-pagination-fixed-row-browser.json). Le premier contrôle exigeait28px exactement pour tous les numéros ; «100» sélectionné mesure28,42px avec sa graisse, sans débordement. L’assertion est corrigée pour accepter cette largeur naturelle, sans nouvelle modification du CSS ; la tentative est conservée. Pas de téléphone physique.
