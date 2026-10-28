# Affichage, tri et favoris — 6 octobre 2026

## Demande et réalisation

L’utilisateur demande un bouton commun pour choisir Grille ou Liste, un bouton Trier à côté, puis la possibilité de mettre les contenus en favoris. Les trois rubriques Projets, Parcours et Journal partagent ces commandes. La palette, la typographie des contenus et le verre dépoli existants restent conservés.

- **Affichage** ouvre une liste ancrée avec Grille et Liste. Le choix conservé par l’ancienne paire de boutons est repris.
- **Trier** propose du plus récent au plus ancien, l’ordre inverse et « Le plus de favoris ». Une option « Mes favoris uniquement » permet de retrouver les contenus enregistrés dans le périmètre géographique courant.
- Un cœur indépendant du lien est ajouté sur chaque carte et dans chaque détail. Un clic sur le cœur conserve la page ouverte. L’état est partagé entre grille, liste et détail.
- Affichage, tri, filtre des favoris et favoris sont conservés dans ce navigateur. Les autres onglets ouverts se mettent à jour lors d’un changement enregistré.
- Menus ancrés, clic extérieur, Échap, flèches, Début/Fin et retour du focus ; traductions FR/EN/AR et positions logiques RTL. Les menus disparaissent à la navigation et au redimensionnement.

## Données et limites

Les huit contenus existants sont fictifs et ne possédaient pas de date. Des dates illustratives sont donc isolées dans `samplePublicationDates`, puis affichées sur les cartes et les détails pour rendre le tri chronologique vérifiable. Le menu et le titre des dates indiquent leur caractère illustratif.

Aucun compteur communautaire n’est inventé. Dans ce prototype sans backend ni compte réel, le tri « Le plus de favoris » utilise uniquement le favori local (0 ou 1), puis la date décroissante pour départager. Le menu précise cette portée. La future popularité partagée demandera des données serveur ; elle n’est pas présentée comme raccordée.

Si le stockage est bloqué, l’interface continue avec l’état de la session. Les favoris ne sont pas synchronisés entre appareils. Aucune IA ni fonctionnalité sociale supplémentaire n’est intégrée.

## Architecture

- `content-preferences.mjs` : préférence de vue, tris, dates illustratives, stockage validé, favoris connus seulement ; tris stables, dates absentes en dernier.
- `content-controls.mjs` : menus et boutons accessibles, traductions.
- `content-controls.css` : contrôles et cœurs reprenant les variables de verre existantes.
- `welcome.mjs` : composition des cartes et détails, conservation du périmètre géographique, restitution du focus après favori.
- Les cartes sont maintenant des articles contenant un lien et un bouton indépendant. Aucun bouton n’est placé à l’intérieur d’un lien.

Les imports versionnés sont ajoutés au contrôleur partagé ; les deux entrées HTML chargent la nouvelle feuille. L’ancienne paire de boutons reste dans les sources HTML statiques jusqu’à l’initialisation du module et dans les archives.

## Vérifications

**11 tests automatisés passent** dans `tests/content-preferences.test.mjs` : migration de la vue, ajout/retrait, rechargement, données corrompues ou inconnues, stockage refusé, snapshots protégés, restauration inter-onglets, chronologie réelle, tri local, portée géographique, dates manquantes et couverture des huit exemples. Syntaxe du contrôleur vérifiée.

**Chrome ordinateur :** rendu examiné, aucun débordement horizontal ; ajout du favori Lyon depuis la carte sans navigation, Lyon en premier après le tri par favoris, favori et tri conservés après rechargement. Le contrôle mobile/RTL et le détail restent à compléter dans la vérification d’intégration au moment de ce relevé. Aucun téléphone physique, service serveur ou report Figma.

## Conservation

Les sources remplacées `welcome.mjs`, `content-layout.css` et `content-preview-data.mjs` sont sauvegardées dans [l’archive avant les contrôles](archive/pre-content-controls-20261006/). Les anciennes études de navigation, menus, recherche et verre restent intactes.


### Complément — menus sur écran court

Le contrôle d’intégration en arabe sombre à 320 × 640 a révélé un panneau de tri allant de y361 à y643, derrière la capsule de recherche et le dock. Cet état intermédiaire est conservé dans `archive/pre-content-menu-placement-20261006/`.

Le placement mesure désormais l’espace entre l’en-tête/filtre fixes et la recherche/navigation. Le menu reste ancré à son déclencheur : dessous s’il tient, dessus sinon, ou dans le côté le plus grand avec une hauteur bornée et un défilement interne. Le clavier révèle l’option ciblée en déplaçant seulement ce défilement interne. Un déplacement de la page ou un redimensionnement ferme le panneau ; faire défiler le panneau ne le ferme pas.

**8 tests supplémentaires passent**, soit **19 tests du module de contenus**. Le cas reproduit numériquement choisit une ouverture au-dessus (183 px disponibles, y118–301), sans chevaucher le bouton ni le dock. Le contrôle visuel final du correctif reste à effectuer par l’agent d’intégration au moment de cette note.


Le rejeu du placement en arabe sombre 320 × 640 mesure le panneau au-dessus, de y119,67 à y298,43 (hauteur 178,76 px), avant la capsule à y505,68. Une fermeture ponctuelle au clavier motive un durcissement : seul un déplacement réel de plus de 0,5 px depuis l’ouverture ferme le menu, pas un simple événement de défilement. Deux tests supplémentaires couvrent les événements sans mouvement et les écarts fractionnaires, soit **21 tests** des préférences et du placement. Le rejeu final du clavier reste à confirmer.


### Vérification d’intégration centrale — 6 octobre

Chrome 390×844 : menus Affichage/Trier ancrés examinés, passage Liste, ordre ancien→récent vérifié sur les quatre projets (15/21/28 septembre, 3 octobre), Lyon en premier au tri local des favoris. « Mes favoris uniquement » donne un contenu ; après rechargement, la liste, le tri et le cœur restent enregistrés. Le retrait dans le détail conserve l’article et son focus, puis le retour liste affiche l’état vide ; « Afficher tous les contenus » rétablit les quatre exemples. Les favoris de test sont retirés et le tri récent/grille rétabli.

Chrome 320×640 arabe sombre : rendu et absence de débordement examinés. La première version du tri était recouverte par le dock ; après correction, le panneau s’ouvre au-dessus du bouton, de y119,67 à y298,43, entre le contexte (fin111,67) et son bouton (début307,43). La capsule de recherche commence à505,68. L’ouverture au clavier avec Flèche haut cible « Mes favoris uniquement », fait défiler le panneau de36,67px et conserve cette option visible dans ses limites. Le contrôle direct de Fin via le locator du navigateur recentrait le document avant d’envoyer la touche et fermait le panneau ; ce parcours précis n’est donc pas revendiqué comme vérifié. Les tests du placement et du seuil de déplacement couvrent les cas limites.

Pas de téléphone physique ni de nouveau report Figma.

Contrôle final : **69 tests passent** dans les six suites préférences, placement, contexte, transitions et recherche. L’onglet principal est actualisé et son entrée visiteur rejouée ; Projets charge le contrôleur content-controls-60, le module de commandes v3 et la feuille v2, avec Affichage/Trier et le cœur visibles. Format temporaire du navigateur réinitialisé.


### Précision utilisateur — 6 octobre : Trier s’ouvre vers le bas

L’utilisateur demande que la liste de tri descende sous son bouton, comme celle de l’affichage. Le choix automatique du côté est remplacé pour **Trier seulement** par une ouverture descendante, avec le même écart de 9 px. La hauteur reste bornée avant le dock ; le contenu du panneau défile si nécessaire. Affichage conserve son fonctionnement, les tris/favoris et le verre ne changent pas. Ancien état et tests conservés dans [pre-sort-downward-20261006](archive/pre-sort-downward-20261006/).

22 tests de préférences et de placement passent. Chrome 320×640 : bouton terminé à y351,20, panneau de y360,20 à497,67, capsule de recherche à505,68 ; direction below, défilement interne actif. L’ouverture clavier sur la dernière option la rend visible après 50 px de défilement interne, sans fermer le panneau. Rendu examiné, format temporaire réinitialisé. Versions : contrôleur sort-downward-61, aperçu29, module content-controls4 ; CSS inchangé. Pas de téléphone physique ni nouveau report Figma.


### Précision utilisateur — 6 octobre : cœurs toujours rouges

L’utilisateur demande une couleur rouge constante pour les cœurs des favoris. Un jeton local `--horizon-favorite-heart: #e53935` colore uniquement ces icônes : cartes, détails et les deux options de favoris du menu Trier. Le contour reste rouge au repos ; le cœur se remplit du même rouge après ajout. Le texte, les surfaces et l’accent du bouton Trier restent inchangés. Même teinte dans les deux thèmes, CSS des contrôles v3. Sources précédentes conservées dans [pre-red-favorites-20261006](archive/pre-red-favorites-20261006/).

Vérification Chrome ordinateur : contours calculés rgb(229,57,53), remplissage none ou rgb(229,57,53) selon la sélection, en clair et en sombre ; rendus examinés. Couleur des deux icônes du tri contrôlée dans les styles calculés ; sélecteurs communs aux cartes et détails audités. Le favori créé pour le contrôle est retiré. Pas de nouveau test automatisé pour cette correction CSS ciblée, ni de nouveau contrôle mobile ou report Figma. Page principale actualisée.


## Regroupement et première adaptation mobile — 6 octobre

Projet/Statut, Affichage et Trier restent regroupés, y compris en320px FR/AR. À la dernière précision utilisateur, Liste/Grille restent disponibles : adapter d’abord les textes et proportions plutôt que retirer la liste. Essai de grille forcée retiré et archivé. [Réalisation, mesures et limites](RESPONSIVE_CONTENT_NOTES.md).


## Suite du 7 octobre — Libellé Favoris raccourci

À la demande de l’utilisateur, le bouton détaillé affiche simplement **Favoris** (Favorites / المفضلة), que l’élément soit enregistré ou non. Cœur et état pressé restent distincts ; le nom accessible et le titre annoncent toujours Ajouter/Retirer et le contenu ciblé. Contrôle navigateur mobile : ajout puis retrait sur Leïla, libellé visible conservé et état initial rétabli. ContrôlesJS11 ; [source précédente](archive/pre-short-favorite-label-20261007/manifest.json) préservée.


## 10 octobre — Affichage indépendant par rubrique

L’utilisateur précise que changer Affichage dans Projets ne doit pas modifier les autres menus. **Grille/Liste est désormais mémorisé séparément pour Projets, Profils et Chroniques.** Le choix suit la rubrique, pas le campus consulté. Les projets à l’intérieur d’un profil ne possèdent pas de commande Affichage propre ; aucune nouvelle commande n’y est ajoutée. Tri, filtres et favoris conservent leur comportement.

Le stockage v2 contient layoutBySection ; snapshot(section) et setPreference(name,value,section) ciblent la rubrique. À la première migration, l’ancien choix commun initialise les trois valeurs pour préserver le rendu existant, puis chaque changement est indépendant. Les anciennes clés ne sont pas écrasées. Le contrôleur actualise le rendu et le menu à chaque navigation, restauration ou rechargement. Cache module11, contrôleur comments-display-103 et aperçu71.

Les23 tests de préférences passent, dont indépendance, rechargement, migration, valeurs invalides, maintien des autres réglages et restauration de stockage. Sept fichiers de tests ciblés passent avec l’ajout Commentaires. Chrome : Projets en Liste → Profils en Grille → Chroniques en Grille → retour Projets et rechargement toujours en Liste. Les états initiaux de test sont rétablis. Une première passe navigateur utilisait un module chargé pendant les travaux ; le cache final est renouvelé avant ce contrôle.

[Sources précédentes](archive/pre-independent-display-20261010/README.md) et [lecteur complet avant les deux changements](archive/pre-comments-20261010/preview.html) conservés. Pas de nouvelle esthétique d’Affichage, téléphone physique ni publication.

## Suite du 10 octobre — Filtrer les projets dans un dialogue

Après l’ajout demandé du filtrage par technologies, l’utilisateur remplace le long menu Projet par un bouton unique **Filtrer**, qui ouvre une petite page de choix avec **Projets · Technologies · Savoir-faire**. Les trois rubriques sont visibles dans un même dialogue ; il ne s’agit pas de trois boutons indépendants. Le raccord est utilisé dans la liste générale des Projets et dans les projets d’un profil. L’interface et le modèle sont communs, mais les sélections restent indépendantes : préférences de la rubrique générale d’un côté, critères locaux du profil et de son URL de l’autre. Le filtre local reste limité aux projets de la personne consultée.

### Choix et portée

- **Projets** conserve les types du tronc commun, de spécialisation et Projets personnels. Les cases collectives du tronc commun et de spécialisation sélectionnent ou retirent uniquement leurs types ; un groupe partiellement sélectionné est signalé. Projets personnels reste un choix direct.
- **Technologies** propose uniquement les six valeurs explicitement renseignées dans les cinq projets fictifs : C, C++, TypeScript, CSS, POSIX et Sockets.
- **Savoir-faire** rassemble les sept valeurs de démonstration issues des tags existants : Parsing, Raycasting, Textures, IRC, Web, Accessibilité et Collaboration. Ce classement sert à l’essai des filtres ; il ne constitue pas une taxonomie officielle du cursus.

Les sélections sont multiples. Les choix d’une même rubrique se combinent par **OU** ; les trois rubriques se croisent par **ET**, ainsi qu’avec le périmètre pays/campus et les autres filtres applicables. Une rubrique sans sélection ne restreint pas les résultats. Les types sans projet de démonstration restent disponibles et peuvent produire un résultat vide, sans exemple inventé. Les technologies et savoir-faire ne sont pas déduits du texte pendant la recherche : le corpus porte des identifiants explicites `technologies` et `skills`.

Le bouton garde le libellé court **Filtrer / Filter / تصفية**. Son nom accessible et son infobulle exposent les choix appliqués ; l’indication d’état filtré reste présente. Les commandes Affichage, Trier et le filtre des Profils gardent leurs menus existants.

### Brouillon et interactions

À l’ouverture, le dialogue copie les valeurs appliquées dans un brouillon local. Cocher une option ou un groupe ne modifie pas encore la liste derrière le dialogue. **Appliquer** transmet une seule fois la sélection au contrôleur ; **Annuler**, la croix, Échap et un clic sur l’arrière-plan ferment sans appliquer. **Réinitialiser** vide seulement le brouillon : il faut encore appliquer pour enlever les filtres actifs, et annuler conserve l’état antérieur.

Le dialogue natif assure la modalité et la navigation au clavier. Le focus rejoint son titre à l’ouverture, puis revient au bouton Filtrer à la fermeture lorsqu’il est toujours présent. Les cases natives gardent leurs états sélectionné et partiel. Les trois langues, la direction RTL, les thèmes et une mise en page bornée avec lecture interne sont pris en charge. Le redimensionnement laisse le dialogue ouvert ; les anciens écouteurs des menus ancrés ne ferment plus celui-ci lorsque l’on interagit dans son contenu. Une fenêtre très basse permet de parcourir l’ensemble du formulaire pour conserver l’accès aux actions.

### Raccord et archives

[content-controls.mjs](content-controls.mjs) choisit le dialogue uniquement lorsque `getFilter().presentation === 'dialog'`. Les champs `options`, `groups` et `values` restent compatibles. [project-filter-dialog.mjs](project-filter-dialog.mjs) gère la copie locale et la confirmation ; [project-filter-dialog.css](project-filter-dialog.css) porte son rendu. Les groupes `technologies` et `skills`, ainsi que leurs préfixes `tech:` et `skill:`, répartissent les critères ; le reste appartient à Projets. Les deux configurations du contrôleur partagé activent ce mode, et les deux entrées HTML chargent la feuille du dialogue.

La [source des commandes précédant le dialogue](archive/pre-project-filter-dialog-20261010/README.md) est archivée avec son manifeste. Il s’agit d’une copie ciblée de source ; les lecteurs complets et toutes les anciennes explorations restent conservés. Le classement des données et leurs sources précédentes sont également conservés dans [l’archive avant les médias intégrés aux projets](archive/pre-project-inline-media-20261010/README.md).

### Vérifications à cette étape

**Contrôles effectués sans navigateur :** les deux fichiers de tests existants des groupes de catégories et du placement des menus passent après le raccord. Un contrôle pur vérifie les 9 types, 6 technologies et 7 savoir-faire dans les trois langues, l’absence de doublon, de choix perdu et de mutation des options. Une simulation des événements du dialogue couvre brouillon isolé, annulation, réouverture sans choix abandonnés, réinitialisation différée, confirmation unique, sélection collective et partielle, Échap, retour du focus et direction RTL. Syntaxe et contrôle de diff passent. La revue indépendante des événements et du cycle de vie ne relève pas de défaut concret.

**Contrôle navigateur final non effectué — reprise du11 octobre :** accès au navigateur de contrôle indisponible dans la session. Restent à confirmer dans le rendu réel l’ouverture depuis la rubrique Projets et depuis un profil, la combinaison des trois facettes, Appliquer/Annuler/Réinitialiser, les états vides, les retours et rechargements, ainsi que l’accès aux actions à320px en clair/sombre et RTL. La simulation de transactions ne constitue pas un contrôle visuel ni un essai sur téléphone physique. Aucun compte réel, permission serveur, report Figma ou publication n’est ajouté par ce changement.


**Reprise du11 :** les96 cas de10 fichiers ciblés passent, dont médias, catégories, préférences, rubriques, commentaires et auteurs. Le raccord partagé est présent dans les deux entrées ; aucune vérification visuelle supplémentaire n’est revendiquée depuis l’interruption.


## 11 octobre — Commandes réduites aux icônes

À la demande de l’utilisateur, Filtrer, Affichage et Trier gardent seulement leur icône lorsque la place manque. La bascule dépend de la **largeur réelle de leur barre, à 320 px ou moins**, dans l’index et dans les projets d’un profil ; elle ne dépend pas directement de la largeur de la fenêtre. Les libellés et chevrons des déclencheurs sont masqués ensemble, les boutons restent de44×44px. Au-dessus, les textes et tailles progressives existants reviennent. Les panneaux gardent toutes leurs options et leurs textes. Infobulles et noms accessibles complets FR/EN/AR conservent fonction et sélection.

Sources : content-controls.mjs/CSS13 ; [état précédent conservé](archive/pre-icon-only-content-controls-20261011/README.md). Menus/groupes testés et interaction DOM simulée en trois langues, avec sélection, focus et filtre local ; revue indépendante de cascade/placement/RTL sans défaut concret. La suite de32 cas dans6 fichiers couvre également auteurs et rubriques. Aucun rendu navigateur final possible ; le seuil exact et le menu ouvert sous ce seuil restent à examiner visuellement. Contrôleur114/aperçu82, sans publication.
