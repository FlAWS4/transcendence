# Commandes et contenus adaptatifs — 6 octobre 2026

## Demandes retenues

- La pilule verre précédemment portée par la langue passe au **compte**, y compris sur mobile. Les boutons de langue et de thème ne doivent jamais avoir de fond en pilule ; leur focus clavier reste perceptible.
- Projet/Statut, Affichage et Trier doivent rester regroupés au même endroit.
- L’utilisateur demande d’abord de cacher Affichage et d’imposer Grille sur mobile, puis **demande d’adapter d’abord les tailles des textes et éléments**, car la liste paraît disproportionnée. Cette dernière précision est prioritaire : **Liste et Grille restent disponibles et mémorisées**, sans forçage mobile. Le résultat adaptatif est un essai à examiner, pas une validation esthétique finale.

## Première passe — état historique responsive2 / contrôles10

`control-glass.css` applique au compte exactement les jetons de la pilule de langue : voile82% selon le thème, bordure, reflets et flou26px. Les anciennes suppressions du fond du compte sur mobile sont dépassées par le sélecteur ciblé. Langue et thème gardent leur taille interactive, leur réaction à la pression et le contour de focus, mais sans fond, bordure, ombre ou flou au repos, au survol et menu ouvert. Le panneau de langues conserve sa matière et son fond de sélection. Le compte reste absent avant l’entrée.

Les commandes de contenu sont alignées ensemble en fin de ligne, sans marge automatique isolant Trier. Leur groupe ne se coupe plus en deux rangées. Jusqu’à360px : texte11px, icônes14px, chevrons10px, intervalles4px et paddinghorizontal7px ; les cibles gardent au moins42px de hauteur et les libellés complets.

`responsive-content.css` ajuste les cartes jusqu’à850px : titres entre20 et27px selon la largeur réelle de la colonne de texte (`cqi`), résumés14–15px, rôle de profil et espacements progressifs. Sous700px, les grands titres deviennent fluides32–42px ; vignettes de liste64–108px, gaps12–18px, portrait de fiche104–140px. Les favoris des profils suivent la taille du portrait. Tous les textes restent présents, sans masquage ni troncature nouvelle. Couleurs, ordre des contenus et détails hors ajustement typographique sont conservés.

### Vérifications de la première passe

Contrôles dans Chrome :
- Entrée claire et sombre : langue/thème transparents, bordure0, ombre et flou absents ; langue ouverte sans pilule, panneau intact ; compte encore masqué.
- Après entrée : compte en verre82%/flou26px sur ordinateur et mobile, ouverture de « Mon espace » puis fermeture ; rendu clair et arabe sombre320px examiné.
- Avant adaptation, liste Projets390px : titre27px dans une colonne≈220px. Après adaptation : titre≈22,4px dans≈240px, résumé≈14,2px ; textes complets et auteurs visibles.
- Liste Profils320×640 : titre≈20,8px, colonne≈194px, portraits/badges/favoris examinés après défilement. Aucun débordement horizontal.
- Trois commandes sur une même rangée à320px FR et AR sombre, et à700px FR ; gaps4px en320,6px en700. Hauteurs42px FR et≈42,7px AR.
- Bascule Liste → Grille depuis le menu mobile fonctionnelle ; titre en grille320px≈23,3px dans une colonne≈270px, sans débordement.
- Préférence Liste retrouvée au rechargement durant les contrôles, puis Grille restaurée à la fin. Format temporaire retiré, français clair et onglet principal actualisé.

Revue indépendante de cascade, RTL, conteneurs et placement du favori. Contrôleur `welcome.mjs` et module des commandes identiques aux états avant essai de grille forcée ; aucun comportement JavaScript nouveau conservé, aucun test unitaire ajouté pour ces changements CSS. Pas de téléphone physique, de nouvelle mesure de performance ni de report Figma.

### Versions et archives de la première passe

À cette étape : **responsive-content2**, **content-controls CSS10**, **control-glass2**, **readable-glass2**. Contrôleur **contextual-discovery-71**, aperçu39 et commandes module7 inchangés.

Archives :
- `archive/pre-account-pill-20261006/` : boutons avant déplacement de matière.
- `archive/pre-mobile-content-controls-20261006/` : sources avant regroupement, premier regroupement et essai de grille forcée retiré.
- `archive/pre-responsive-content-20261006/` : styles/entrées antérieurs et première passe responsive avant correction de spécificité des profils.

Toutes les explorations précédentes restent présentes.


## Suite du 6 octobre — tailles et espacements continus

L’utilisateur signale que le compteur, par exemple « 4 contenus », remonte alors que la rangée contient encore de la place, et que la réduction des éléments reste visible par paliers. Il précise que **les titres étaient seulement un exemple**. Cette correction reprend donc aussi les résumés, métadonnées, boutons, icônes, portraits, vignettes et espacements. Elle remplace les règles typographiques en `cqi` de la première passe ; les anciennes sources restent archivées.

### Réalisation actuelle

- La barre utilise un retour à la ligne naturel : compteur et commandes restent côte à côte tant qu’ils tiennent ; le groupe Projet/Statut, Affichage, Trier descend entier lorsque la place manque. L’ancienne largeur complète forcée sous700px est retirée.
- Les tailles de texte utilisent désormais des rampes `rem + vw` sur toute la plage de largeur. Le changement du nombre de colonnes ne modifie donc plus leur taille par un changement de conteneur. Les grands titres, introductions, titres et résumés des cartes, rôles, biographies et textes d’articles évoluent progressivement. Les petites informations conservent une taille stable : métadonnées, dates et compteur12px, badges11px, noms d’auteurs compacts13px.
- Les trois commandes passent progressivement de11 à13px entre320 et900px ; icônes, chevrons, espacements et marges intérieures suivent une rampe. Leur hauteur interactive minimale reste42px, leurs libellés restent présents et le groupe ne se divise pas.
- Vignettes, portraits, illustrations associées, intervalles de liste, barre de commandes, colonne « À propos », sections et récit des profils suivent aussi des rampes. La revue indépendante repère encore le saut de l’avatar intérieur72%→100% à700px : il est remplacé par une largeur continue bornée64–122,4px. Le badge de statut garde11px, y compris dans la liste étroite.
- Le logo, les textes et icônes de l’en-tête, ses intervalles et les libellés du menu et du filtre ont des tailles continues. Les hauteurs des commandes, le dock60px et sa pastille48px, les positions verticales du filtre et son raccord au mode compact restent conservés.
- Palette, matières, thèmes, cœurs rouges, textes complets et règles FR/EN/AR sont conservés. Liste/Grille restent disponibles et mémorisées, sans forçage mobile. Aucun nouveau comportement JavaScript.

Les changements **structurels** restent possibles : nombre de colonnes de la grille, empilement d’une fiche et forme du cadre des portraits. Le travail supprime les paliers de dimension des éléments ciblés ; il ne rend pas toute la composition identique entre ordinateur et mobile.

### Vérifications de cette suite

Contrôles Chrome effectués par l’agent principal, complétés par une revue indépendante des sources et de leur cascade :

- Liste Projets aux largeurs320,359,360,361,390,450,500,699,700,701,849,850 et851px : aucun débordement horizontal relevé. Le compteur reste à côté des commandes à390px et aux largeurs supérieures contrôlées ; il passe sur sa rangée en320–361px quand l’espace disponible ne suffit plus. Les commandes restent groupées.
- Au seuil699/700/701px, le titre de carte mesure respectivement≈27,539/27,550/27,572px, le résumé≈14,569/14,570/14,572px, le texte des commandes≈12,308/12,310/12,315px et la vignette≈149,34/149,50/149,79px : plus de saut typographique ou de vignette à cet ancien seuil.
- Liste Profils aux mêmes trois largeurs : avatar intérieur≈122,40px et badge11px conservés. Grille320px : titre≈23,04px. Rendus de la liste320px et de la fiche390px examinés.
- Fiche de profil en320,390,699,700,701,849 et851px : aucun débordement ; textes courants16–17px et portrait104–183,7px selon la largeur contrôlée.
- Article du Journal : corps16px en320px,≈16,862/16,863/16,866px en699/700/701px et18px en1200px. La citation conserve sa propre taille héritée, sans être écrasée par la règle des paragraphes.
- Captures Projets390/700px, Profils Liste320px, fiche390px et arabe sombre320px examinées. Le menu Affichage fonctionne et la grille est choisie à nouveau pendant les contrôles.
- Vérification finale : onglet principal en français clair et grille, format temporaire retiré ; rendu ordinateur1920px examiné, dock60px et aucun débordement.

Ces contrôles concernent le navigateur de bureau redimensionné : pas de téléphone physique, de clavier virtuel ni de nouveau report Figma. Aucun nouveau test unitaire ajouté pour ces ajustements CSS. Aucune acceptation esthétique finale déduite de la vérification technique.

### Versions et archives actuelles

**responsive-content5** et **content-controls CSS11** remplacent la première passe2/10 ; matières2, contrôleur **contextual-discovery-71**, aperçu39 et commandes module7 inchangés.

`archive/pre-fluid-toolbar-type-20261006/` conserve les CSS et deux entrées précédentes, la première correction de retour à la ligne avant les tailles fluides (`content-controls-before-fluid.css`) et la passe responsive avant les derniers espacements et l’avatar intérieur (`responsive-content-before-spacing.css`). Toutes les autres études et archives mentionnées plus haut restent conservées.


## Suite du 8 octobre — deux cartes Projets et Journal sur mobile

L’utilisateur demande de raccourcir les descriptions avec des points de suspension pour rendre possibles deux projets ou deux articles par ligne en Grille. Cette demande remplace, pour ces aperçus, la conservation visuelle de tous les textes décrite le 6 octobre. Il demande ensuite de retirer aussi « Découvrir » dans Le journal.

### Réalisation

- `responsive-content.css` cible seulement l’index Projets/Journal en Grille : trois colonnes au-dessus de 850 px, deux jusqu’au petit format mobile ; l’ancienne colonne unique sous 600 px est surchargée.
- Descriptions limitées visuellement à trois lignes, puis deux sous 600 px, avec ellipse native du navigateur ; titres limités à trois lignes. Les textes restent entiers dans les données et les pages de lecture. Liste et annuaire Profils conservent leurs règles.
- Titres de 18 à 31 px, espacements, arrondis et métadonnées suivent des tailles progressives. Les portraits/auteurs se resserrent sans modifier leurs liens ; le nombre de collaborateurs se gère par le composant d’auteurs partagé, documenté séparément.
- « Découvrir » retiré de la boucle de cartes éditoriales de `welcome.mjs` ; images et titres restent les liens d’ouverture, comme dans Projets. Favoris et liens d’auteurs sont conservés.
- Palette, thèmes et sens de lecture restent hérités des styles existants. `responsive-content.css` doit être chargé en **version 6** dans les deux entrées.

### Préservation et contrôles de source

[Aperçu antérieur](archive/pre-compact-editorial-grids-20261008/preview.html#journal), [sources et empreintes](archive/pre-compact-editorial-grids-20261008/manifest.json). L’archive conserve notamment les styles, le contrôleur avant retrait du lien et les relations d’auteurs antérieures ; les dépendances non modifiées sont partagées avec les sources conservées du prototype. La première passe CSS, avant déplacement de la troncature du titre sur le lien pour préserver son contour de focus, reste aussi conservée.

Syntaxe JavaScript du contrôleur et absence d’erreur `git diff --check` vérifiées ; empreintes des sources archivées et références locales des modules de consultation vérifiées. Revue de cascade effectuée : les nouveaux sélecteurs excluent Liste, Profils et fiches de lecture ; état vide conserve sa largeur complète. Aucun nouveau test unitaire ajouté pour cette correction CSS. Les contrôles visuels et de navigation doivent être consignés après le passage navigateur de l’agent principal ; aucune vérification sur téléphone physique ni nouveau report Figma revendiqués ici.

### Vérification finale — 8 octobre 2026

Chrome : Chroniques à 390 px, deux cartes de 159 px, résumés limités à deux lignes (44 px affichés contre 87/109 px de contenu). Projets à 320 px : deux colonnes, descriptions terminées par ellipse, badges Responsable et lien +3 examinés. +3 ouvre Équipe avec Luiza d’abord, puis Leïla, Noé, Inès et Haru ; +2 de l’article collectif ouvre Auteurs avec Inès d’abord, puis Haru, Luiza et Caio. Aucune largeur horizontale débordante relevée sur ces grilles. Les fiches complètes conservent tous les auteurs. Le long identifiant ft_transcendence peut se couper à 320 px ; son texte complet demeure accessible. Pas de téléphone physique.


## 11 octobre — Extraits communs à Projets et Chroniques en Grille et Liste

L’utilisateur constate que les textes des Chroniques ne sont pas raccourcis comme ceux des projets. L’inspection trouve les mêmes règles dans les deux rubriques, mais **limitées à la Grille** ; les affichages étant indépendants, la Liste pouvait conserver tout l’extrait. Sans accès au navigateur pour reproduire son état exact, cette limite de portée est corrigée : titres sur3 lignes maximum, résumés sur3 lignes, ramenés à2 à600px et moins, en Grille comme en Liste. Le titre et le résumé source restent entiers, comme l’article et le projet ouverts.

La correction de responsive-content.css7 porte sur les aperçus dans #content-index uniquement. Grilles, métadonnées, boutons, typographies et tailles ne changent pas. Une revue indépendante fait séparer les propriétés d’interligne et de largeur propres à la Grille pour conserver les métriques précédentes de la Liste ; aucun autre conflit de cascade relevé. Les fiches détaillées, placées hors de cet index, sont exclues. [CSS précédent conservé](archive/pre-list-excerpt-clamp-20261011/README.md). Pas de test qui recopie le CSS ni de rendu navigateur revendiqué ; examiner les longues Chroniques dans les deux affichages reste nécessaire. Contrôleur114/aperçu82.

Les autres ajustements du même échange sont consignés séparément : [commandes à icônes seules](CONTENT_CONTROLS_NOTES.md#11-octobre--commandes-réduites-aux-icônes) et [couronne / +N](PROFILES_NOTES.md#suite-du-11-octobre--couronne-et-collaborateurs-sur-fenêtre-très-étroite).
