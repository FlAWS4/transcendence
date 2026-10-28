# Menu en quatre étapes — 7 octobre, ajusté le11 octobre 2026

L’utilisateur demande de conserver l’agencement PC, puis de placer tous les textes sous les icônes, de ne garder ensuite que le texte sélectionné, et enfin les seules icônes dans une fenêtre extrêmement petite. La hauteur doit rester constante. Cette demande remplace la règle du 5 octobre « toujours à côté » et le passage direct au seul libellé actif introduit avec Awards.

## Réalisation

Les deux entrées actives chargent [responsive-dock.css](../responsive-dock.css). Les anciens blocs compacts de floating-search.css et awards.css sont retirés après archivage, pour conserver une seule définition des paliers. Aucun contrôleur actif n’est modifié.

| Largeur intérieure du menu | Affichage |
| --- | --- |
| Plus de 560 px | Texte à côté des icônes, composition PC existante |
| Plus de 340 à 560 px | Tous les textes sous les icônes |
| Plus de 280 à 340 px | Texte du bouton actif sous son icône ; autres icônes centrées |
| Jusqu’à 280 px | Icônes seules, boutons de largeur égale |

Ces seuils sont des réglages d’implémentation de l’assistant, calculés sur l’espace réel du dock. Ils ne sont pas des seuils de fenêtre imposés par l’utilisateur. Le menu conserve **60 px**, chaque bouton et la pastille **48 px**, avec **6 px** au-dessus et au-dessous. Les étapes verticales utilisent une icône de20px, un intervalle de2px et une ligne de18px avec texte11px, soit40px au total. Le libellé arabe des profils reste entier à la limite contrôlée.

Les textes masqués gardent leur nom accessible : hauteur0 et opacité0, sans display:none. Le filtre géographique continue de suivre le mode compact réel via `--dock-compact-item`, présent uniquement dans les deux derniers paliers. La recherche, le verre, les couleurs, le fondu au défilement et la préférence de mouvements réduits gardent leurs règles.

La pastille utilise les dimensions finales des emplacements en CSS dans tous les modes, avec inversion RTL. Cela corrige une mesure intermédiaire qui pouvait rester trop large en agrandissant la fenêtre après une sélection compacte. Le déplacement garde450ms en mode complet et350ms en compact.

## Vérifications historiques du7 octobre (seuils560/440/300)

- Chrome1280×900 : composition PC examinée, 60/48px conservés ; entrée principale rechargée avec la nouvelle feuille, visiteur → article du Journal → Explorer joué.
- Aperçu550×800 FR clair, puis486×800 AR et EN sombres : cinq libellés sous les icônes, tous entiers. Le plus long libellé AR mesure79,73px dans un bouton86,53px. Pastille correctement alignée après compact → complet et changement de langue.
-390×844 FR et360×700 AR : seul le texte actif reste dessous. Profils → Awards joué dans les deux sens de lecture ; pastille alignée à moins de0,02px dans les mesures finales.
-320×640 FR clair et AR sombre : icônes seules, nom accessible complet conservé, navigation Awards → Profils jouée. Aucun débordement horizontal relevé.
- Limites contrôlées :606px de fenêtre = horizontal,605px = cinq libellés dessous ;486px = cinq libellés,485px = actif seul ;338px = actif seul,337px = icônes seules. Hauteur60px et pas de débordement à chaque mesure. Sur337px, Tab puis Entrée ouvre Profils depuis Projets avec les textes visuellement masqués.
- Recherche Paris en anglais sombre486px : quatre résultats, panneau et champ examinés ; Échap ferme et rend le focus à la recherche. Les deux fichiers de tests existants `dock-search.test.mjs` et `content-transitions.test.mjs` passent. Aucun nouveau test unitaire ne duplique ces règles CSS.
- Revue indépendante de la première passe : recherche, accessibilité, RTL, hauteur et marqueur compact examinés ; problème de chemins de l’archive signalé puis corrigé. Les derniers ajustements de taille de texte et de géométrie sont contrôlés dans Chrome par l’agent principal.

Pas de téléphone physique, de lecteur d’écran réel, de nouvelle préférence de mouvements réduits forcée, de mesure FPS ni de report Figma. Les contrôles techniques ne constituent pas une acceptation esthétique de l’utilisateur.

## Archives et versions

[Ancien menu consultable](../../archives/site-versions/pre-four-stage-dock-20261007/preview.html#explore), [sources exactes et empreintes](../../archives/site-versions/pre-four-stage-dock-20261007/manifest.json). Le contrôleur original est conservé ; ses copies `viewer-*` adaptent uniquement les chemins pour ouvrir l’archive à son emplacement. Les autres dépendances restent conservées dans le prototype parent. L’archive garde son URL lors de la navigation ; Profils puis Explorer avec catalogue et globe chargés ont été rejoués. La première passe responsive est aussi conservée dans `responsive-dock-first-pass.css`. Les galeries de recherche existantes restent intactes.

Versions : responsive-dock **3**, floating-search **four-stage-dock-8**, awardsCSS **2** ; contrôleur **awards-entry-91** et aperçu **59** inchangés. Aucun commit ni publication.

## 11 octobre — Prolonger les deux paliers intermédiaires

L’utilisateur demande de conserver le deuxième niveau plus longtemps et confirme qu’il parle de largeur. Le seuil2→3 descend de440 à340px intérieurs. Il demande ensuite la même chose pour le troisième niveau : premier essai à260px, puis précision explicite que le passage aux icônes seules doit arriver à une largeur légèrement supérieure. Le seuil3→4 est donc remonté à **280px**, entre l’ancien300 et l’essai260. Ces nombres sont les réglages de l’assistant correspondant aux précisions ; pas d’acceptation globale des finitions déduite.

Seuls ces deux seuils et les références de cache des deux entrées changent. Seuil PC560px, hauteur60px, boutons/pastille48px, textes11px/18px, couleurs et transitions conservés. Le filtre suit toujours `--dock-compact-item` au passage vers le seul nom actif. CSS **responsive-dock6** ; contrôleur `project-repository-124` et aperçu91 inchangés.

Contrôle final dans Chrome sans interface, profil temporaire isolé, après indisponibilité de CUA : **21 mesures**, soit390/387/386/320/319/318/280px dans chacune des trois langues ; français clair, anglais et arabe sombres. Les étapes sont respectivement2/2/3/3/3/4/4. Les textes visibles tiennent entièrement ; menu60px, boutons48px, aucun débordement horizontal et pastille à moins d’un pixel de son bouton. Sept mesures supplémentaires remontent les seuils en RTL avec Awards sélectionné. Captures du français étroit, de l’anglais390px et de l’arabe390/320/280px examinées ; les captures finales319/318px complètent le contrôle de la dernière correction.

La matrice précédente, sur l’essai260, avait aussi vérifié les limites PC607/606px et les paliers intermédiaires. Les seuils sont des largeurs de contenu : les équivalences de fenêtre peuvent varier légèrement avec les arrondis de bordure et le moteur du navigateur. À320px le nom sélectionné reste maintenant présent ; le dernier passage est mesuré à318px dans ce Chrome, contre298px dans l’essai260.

Les deux fichiers existants `dock-search.test.mjs` et `content-transitions.test.mjs` passent. Revue indépendante du CSS, des références et des archives ; aucune modification JavaScript ni nouveau test unitaire miroir du CSS. Aucun téléphone physique, lecteur d’écran réel, test FPS ni report Figma. Ces vérifications ciblent le menu et ne revalident pas toutes les fonctionnalités modifiées précédemment le11octobre.

Complément avant partage : entrée principale → Visiteur → Projets, saisie Paris et Échap avec retour du focus contrôlés dans Chrome. À280px, Entrée active Profils alors que les noms sont masqués. Les deux aperçus intermédiaires chargent leur menu ; références SVG corrigées vers leur propre document après revue. Les deux entrées actives, la CSSv6 et les deux accès archivés répondent HTTP200, avec contenu identique aux fichiers locaux. Les12 empreintes du manifeste sont vérifiées. Le profil Chrome de contrôle est distinct du navigateur de l’utilisateur.

[Sources et manifeste avant modification](../../archives/site-versions/pre-longer-second-dock-stage-20261011/README.md), avec les trois états exacts :560/440/300,560/340/300,560/340/260. L’ancien menu reste rejouable dans l’aperçu complet archivé du10octobre ; deux accès dédiés permettent également de revoir les étapes intermédiaires, sur ce même environnement historique conservé. Version projet **0.0.1 pré-alpha** ; demande suivante de pousser les changements sur `rel-hass`, sans nouvelle release.

Partage du11octobre confirmé : commit `fc09e4f` sur `origin/rel-hass`, hash distant exact vérifié après le push demandé. Version0.0.1 pré-alpha conservée, sans fusion, tag ni release.
