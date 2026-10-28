# 42 — piste immersive « BEYOND THE CODE »

**Suite du 5 octobre :** effacement complet du menu choisi pour le web (retour 400/350 ms, navigation sans faux défilement). Les 26 filtres Figma sont alignés à y118 ordinateur / y95 mobile ; quatre fenêtres remontées et capture mobile contrôlée. [Report ciblé](content-layout-handoff.md), état `scrollAndFilter20261005` ; aucune nouvelle animation du lecteur Figma.

**État courant — suite du 4 octobre 2026 :** capsules de 60/64 px, verre 95 % et flou 22 px commun menu/loupe, contraste sombre graphite. Globe centré dans toute la page (816 px bureau, 358,8 px mobile), filtre compact ancré et lien Voir la carte retiré. Huit copies du raccord adaptées ; 75 cadres conservés. Le flou radial du globe reste propre au site et les deux essais web de transparence au défilement ne sont pas départagés. Report au repos, audit/captures sans nouveau rejeu du lecteur : [détails et preuves](content-layout-handoff.md#suite-du-4-octobre--capsules-verre-et-globe-dans-toute-la-page), [relevé actuel](content-layout-state.json). Les sections antérieures racontent les étapes précédentes.


**Agencement actuel — 4 octobre 2026 :** la première étude est reportée sur les huit accueils et huit pages de contenu : dock bas commun, globe centré et médaillon contextuel de 32 px. Palette, polices et visuels existants conservés sur demande explicite ; archives intactes. Les raccords d’entrée reçoivent la nouvelle géométrie. API et captures contrôlées, sans nouveau rejeu du lecteur. [Report, preuves et limites](dock-navigation-handoff.md) · [Relevé](dock-navigation-state.json).


Date : 2026-10-04
Statut : synchronisation du site vers Figma achevée pour l’entrée et les huit accueils. Bibliothèque dédiée, deux thèmes, mobile avec barre basse, listes de langues ancrées et déchiffrement n°22 natif sont réalisés. Les rendus et animations exportées ont été examinés ; le parcours connecté mobile FR clair, ainsi que langue, thème et sélection Projets sur ordinateur, ont été joués dans le navigateur Figma. Les limites sont détaillées ci-dessous ; aucune acceptation esthétique ni publication n’est déduite.

**Suite du 27 septembre :** une proposition distincte de pages Projets/Minishell ordinateur et mobile est ajoutée, avec deux sélecteurs Pays/Campus liés et deux fiches Paris. Les nouvelles pages mettent le contenu au premier plan ; Explorer conserve les accueils existants. Les listes de langue partagées sont portées à trois lignes de 42 px espacées de 4 px, soit 148 px au total. La page compte 65 cadres de parcours après ajout, sans suppression. Voir [le point de synchronisation des contenus](content-preview-handoff.md), ses captures et [le relevé technique](content-preview-state.json). Cette proposition n’est pas une acceptation définitive du nouveau menu.

**Complément du 28 septembre :** quatre listes Parcours et Journal FR ordinateur/mobile sont ajoutées à partir des contenus fictifs et SVG du site. Les quatre rubriques sont reliées depuis les quatre accueils LTR et entre les huit pages de contenu, avec retour Explorer selon la branche visiteur/membre. Quatre captures examinées, interface Jost et réactions auditées ; aucun détail supplémentaire ni contenu réel inventé. La page possède désormais **69 cadres**, anciens écrans conservés. IDs et limites dans [le point de synchronisation](content-preview-handoff.md#complément-du-28-septembre).

**Finalisation du 4 octobre — visite campus :** deux fenêtres de visite Paris ordinateur/mobile sont raccordées aux liens « Explorer le campus » des détails Minishell. Ouverture par superposition, fermeture par croix/fond sans changer de rubrique ; aucun retour Pays/Monde. Fond urbain réel capturé, UI éditable et fondus de bord corrigés ; zoom/recentrage restent illustratifs dans Figma. Deux captures finales et audit API passés, sans nouveau rejeu navigateur (lecteur Figma inaccessible). **71 cadres** au total ; les deux imports de capture temporaires et le harness local sont retirés. Voir [le report et les limites](content-preview-handoff.md#visite-campus--ajout-du-28-septembre-finalisé-le-4-octobre) et [l’audit](campus-map-audit.json).

## Ouvrir la piste

- [Prototype ordinateur](https://www.figma.com/proto/yFrdllVm6nrKZJ2c99MMjT?node-id=115-3&starting-point-node-id=115%3A3) — entrée `115:3`.
- [Prototype mobile](https://www.figma.com/proto/yFrdllVm6nrKZJ2c99MMjT?node-id=123-145&starting-point-node-id=123%3A145) — entrée `123:145`.
- [Page de conception Figma](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=115-2) — page `115:2`, dans le fichier `yFrdllVm6nrKZJ2c99MMjT`.

Les anciennes pistes sont conservées. Cette page explore une nouvelle entrée et un accueil très épuré ; elle ne remplace pas les autres maquettes ni leur documentation.

## Synchronisation du 27 septembre 2026

À la demande explicite de l’utilisateur, **le site sert de source à Figma**. Les huit accueils gardent leurs IDs et leur distinction format, langue et session. Leur composition reprend le globe turquoise, le thème clair renouvelé et le sombre, le menu sélectionné teinté, le filtre au-dessus du globe et quatre commandes : moins, réinitialisation, plus, visite aléatoire. Sur mobile, le globe reste centré et la navigation devient une barre basse flottante arrondie ; elle n’est pas une réduction du menu ordinateur.

| Format | Connecté LTR | Visiteur LTR | Connecté RTL | Visiteur RTL |
| --- | --- | --- | --- | --- |
| Ordinateur 1440 × 960 | `115:4` | `119:178` | `125:243` | `125:296` |
| Mobile 390 × 844 | `123:162` | `125:198` | `125:349` | `125:402` |

Les mutations sont consignées dans [le premier relevé](welcome-frames-state.json), [le deuxième lot](welcome-batch-2.json) et [le troisième lot](welcome-batch-3.json). Les huit accueils ont été contrôlés ; les captures de référence couvrent ordinateur/mobile en FR clair et AR sombre. Les modes temporaires du contrôle sombre ont été rétablis après inspection.

L’[extension de bibliothèque](welcome-library-notes.md), sur `5:3`, ajoute des composants dédiés sans modifier les couleurs ni les dessins des anciennes pistes : navigation à 16 variantes, éléments de menu, filtre, boutons d’icônes, commandes et globe vectoriel ordinateur/mobile. Les couleurs suivent les modes clair/sombre, les libellés FR/EN/AR et les familles Jost/Noto Sans Arabic restent liés aux variables. **48 réactions** font évoluer la sélection entre les quatre rubriques, avec Smart Animate de 0,48 s ; les 16 onglets déjà sélectionnés n’ont pas d’action. Le dé est turquoise en clair, rose en sombre ; la graisse du filtre suit aussi le thème. Voir [le résultat des finitions](welcome-polish-result.json).

**Dix listes de langues** de 176 × 140 remplacent les grands popups centrés sur les deux entrées et les huit accueils. Elles sont ancrées sous leur bouton, avec une coche et les choix FR/EN/AR. Les 60 actions de choix et les fermetures sont raccordées ; les anciens popups restent conservés sans appelant sur le parcours actif. Le [relevé des listes](language-menu-state.json) donne composants, variables et positions. La page compte **47 cadres de parcours au premier niveau : les 37 initiaux et dix overlays transparents** ; les conteneurs et clones imbriqués de transition ne sont pas un nouveau parcours.

**Entrée mise à jour :** le double scan se joue à l’arrivée, puis le message reste chiffré. La confirmation simulée déclenche le déchiffrement seul. Toutes les lettres commencent ensemble et se stabilisent dans l’ordre déterministe n°22 choisi par l’utilisateur. Le slogan reste lisible, s’efface vers le 42, puis le cercle est réellement tracé et s’agrandit jusqu’au globe de l’accueil. Le 42 rejoint l’en-tête pendant ce raccord. Les anciens enfants des quatre cadres de naissance sont conservés masqués ; les nouvelles compositions rejoignent les huit accueils selon langue et session.

| Phase actuelle | Durée native |
| --- | --- |
| Double scan à l’arrivée, puis attente chiffrée | 3,65 s |
| Déchiffrement après confirmation | 3,15 s |
| Maintien lisible de BEYOND THE CODE | 1,3 s |
| Phrase → logo 42 | 0,6 s |
| Tracé du cercle | 0,8 s |
| Cercle → globe et accueil | 1,2 s |

Les [preuves vidéo](entrance-proof/README.md) couvrent le scan mobile, le maintien final, la phrase vers le logo et le raccord en ordinateur FR clair et mobile AR sombre. Les timings et réactions de quatorze cadres sont audités ; quatre contrôles du plan natif passent. Le [relevé d’entrée](entrance-sync-state.json) distingue mutation, images exportées et lecture du parcours.

**Vérification dans le navigateur Figma :** accueil `115:4` FR clair → liste ancrée → sélection AR → accueil RTL `125:243`, puis thème sombre via le sélecteur de thème existant et clic Projets. Le déplacement de la sélection sombre est confirmé. Sur mobile FR clair, le parcours complet a été joué : scan d’arrivée `123:145` → Se connecter → panneau explicitement simulé → confirmation → déchiffrement `128:371` → nouvel accueil `123:162`. Un clic Projets déplace ensuite la sélection turquoise de la barre basse. Le parcours visiteur final et la matrice complète langues/thèmes/formats n’ont pas été rejoués.

**Portée du report :** le globe Figma est une géographie vectorielle figée. Rotation, zoom encadré Monde/Pays/Campus, calcul des 58 campus, préchargement et cache WebGL sont des fonctions du site, pas du prototype Figma. Les assets de niveau Pays préparés, dont la France, n’ont pas été insérés ; les vues Campus et les contenus des rubriques ne sont pas portés. Les boutons de carte dessinés n’exécutent pas ces fonctions. La sélection du menu est interactive, sans page de contenu associée dans ce report.

Le rendu natif utilise Cousine pour les glyphes monospace et une approximation du scanner échantillonnée à 50 ms. Dans Figma, une confirmation très rapide commence immédiatement le déchiffrement ; le site attend la fin d’un scan inachevé. Les vidéos contrôlent les phases visibles, sans prouver la cadence du navigateur ou d’un téléphone physique. Les [notes de synchronisation](welcome-sync-handoff.md) réunissent ces limites et les sources.

**Règle V8 conservée :** ligne arabe en AR partout, en EN si la région de connexion simulée est `Arab world`, jamais en FR. Le campus consulté ne commande pas cette visibilité. Le dessin du symbole 42 et l’ordre 42 puis nom sont inchangés ; aucune IP réelle ni authentification n’est traitée par Figma.

## Direction réalisée

L'entrée conserve uniquement le **message crypté et son double scan d’arrivée**, les actions **Se connecter** et **Explorer en visiteur**, ainsi que les commandes **langue/thème**. Il n'y a ni marque (42, HORIZON ou ligne arabe), ni préambule, ni phrase d'invitation, dans les trois langues et les deux formats. La phrase et sa révélation restent sans cercles.

Le logo 42 apparaît seul au centre. Un cercle se trace autour de lui puis s’élargit jusqu’au globe de l’accueil. Sur ordinateur, le globe rejoint la droite en français/anglais ou la gauche en arabe ; sur mobile, il reste centré. Pendant ce raccord, le 42 rejoint l’en-tête et le menu apparaît.

L'accueil ne conserve que les éléments essentiels : **globe, filtre, commandes de carte, menu, logo 42 et nom HORIZON, langue, profil et thème**. Dans le parcours visiteur, l'icône de compte ouvre le panneau de connexion simulée. Les cartes éditoriales des pistes précédentes ne sont pas reprises dans cette composition.

## Parcours visiteur

1. L'entrée joue le double scan puis conserve la phrase brouillée, sans cercles.
2. **Explorer en visiteur** déclenche directement la séquence logo centré → tracé du cercle → agrandissement vers le globe de l’accueil public épuré.
3. La phrase **n'est jamais déchiffrée dans ce parcours** : le visiteur n'obtient pas la révélation « BEYOND THE CODE ».

L'accès public reste possible sans connexion. L'entrée mystérieuse ne constitue pas une énigme à résoudre pour consulter le site.

## Parcours avec connexion simulée

1. **Se connecter** ouvre un panneau qui indique explicitement le caractère simulé de la connexion.
2. **Simuler une connexion réussie** déclenche l'effet visuel de déchiffrement.
3. La phrase devient **BEYOND THE CODE**, toujours en anglais dans les trois langues, et reste lisible pendant 1,3 s, sans cercle.
4. La phrase s’efface vers le 42 centré ; le cercle se trace autour du logo, puis s’agrandit et rejoint le globe de l’accueil avec accès au profil.

**Annuler** ferme le panneau sans déclencher la révélation. Il s'agit d'une **maquette Figma** : aucun compte n'est authentifié, aucune session réelle n'est créée et aucun système de connexion n'est développé par ce prototype. Le déchiffrement est une mise en scène visuelle.

## Transition V2 : dimensions et rythme

**Historique du 14 septembre, remplacé par les timings du 27 septembre ci-dessus.** Les sections V2 à V9 conservent les réalisations et contrôles de leurs états successifs ; leurs totaux ne sont pas les totaux actuels.

Le cercle apparaît par animation de **taille et d'opacité** ; son contour n'est pas animé comme un tracé. Son diamètre est de **560 px sur ordinateur** et **280 px sur mobile**. Le globe formé au centre a un diamètre visible de **780 px sur ordinateur** et **340 px sur mobile**.

La séquence commune, à partir du logo centré, dure **2,39 secondes** :

| Phase | Durée configurée |
| --- | --- |
| Pause sur le logo seul | 0,12 s |
| Apparition et agrandissement du cercle | 0,50 s |
| Pause | 0,10 s |
| Formation du globe centré | 0,65 s |
| Pause | 0,12 s |
| Glissement vers l'accueil, déplacement du logo et apparition du menu | 0,90 s |

Cette durée n'inclut ni le temps passé sur l'entrée ou le panneau de connexion, ni la révélation du slogan dans le parcours connecté simulé.

Huit cadres ont été ajoutés, portant la piste de **29 à 37 cadres**. Les liens d'entrée ordinateur et mobile restent inchangés.

| Format et parcours | Cercle autour du logo | Globe centré |
| --- | --- | --- |
| Ordinateur, connecté simulé | `142:462` | `144:582` |
| Ordinateur, visiteur | `142:509` | `144:630` |
| Mobile, connecté simulé | `142:556` | `144:678` |
| Mobile, visiteur | `142:603` | `144:726` |

## Correction d'alignement V3

**Relevé historique :** le préambule et l'invitation décrits dans cette itération ont été supprimés en V9. Les contrôles de centrage ci-dessous restent les preuves de la correction V3.

La correction stabilise la phrase entre l'entrée, le déchiffrement et la révélation, puis aligne son centre visible avec celui du logo 42. Le masquage du préambule ne déplace plus la phrase et le mobile conserve deux lignes dès l'entrée brouillée.

| Réglage | Ordinateur | Mobile |
| --- | --- | --- |
| Conteneur fixe de la phrase | 1 120 × 110 px | 342 × 116 px |
| Ancre dans le cadre | `(720, 480)` | `(195, 422)` |
| Police dans toutes les étapes de phrase | Jost Medium | Jost Medium |
| Taille / interligne | 92 / 110 px | 48 / 58 px |
| Composition | Une ligne | Deux lignes dès le texte brouillé |

Le préambule possède un positionnement absolu indépendant : il ne participe plus au flux vertical qui place la phrase. Les mêmes dimensions et métriques typographiques sont conservées pendant toutes les étapes du déchiffrement.

Le centrage tient compte des **contours visibles des lettres et du dessin interne du logo 42**, mesurés avec `absoluteRenderBounds`, et pas seulement des boîtes pouvant contenir des marges. L'audit numérique des **huit états de phrase et douze états de logo** relève un écart maximal de centre **inférieur à 0,001 px**. Cette mesure confirme l'alignement géométrique des éléments visibles. L'inspection des captures intermédiaires du prototype dans Chrome confirme l'absence de saut vertical perceptible sur ordinateur et mobile. Le préambule arabe conserve le même emplacement de la phrase et la connexion mobile arrive sur l'accueil RTL `125:349` ; le parcours ordinateur arrive sur `115:4`.

Aucun cadre n'a été ajouté : la piste reste à **37 cadres**. Les timings de la transition, dont la séquence de **2,39 secondes**, et les liens d'entrée restent inchangés. **Un remplacement de police nécessitera un nouveau contrôle visuel du centrage**, des retours à la ligne et de la transition vers le logo.

## Correction V4 des commandes

Les **28 barres de commandes** de cette piste utilisent désormais des boutons de langue, de thème et de profil de **44 × 44 px**. Sur l'accueil, le bouton de langue mesurait auparavant 80 px de large sur ordinateur et 64 px sur mobile ; sur l'entrée, il mesurait 80 px dans les deux formats. Les dimensions communes rendent les commandes régulières et évitent que le libellé court de langue occupe une place différente des icônes.

| Réglage | Ordinateur | Mobile |
| --- | --- | --- |
| Dimensions de chaque bouton | 44 × 44 px | 44 × 44 px |
| Espacement entre boutons | 16 px | 8 px |
| Marges conservées | 48 px | 24 px |
| Barre d'accueil, trois commandes | 164 × 44 px | 148 × 44 px |
| Barre d'entrée, deux commandes | 104 × 44 px | 96 × 44 px |

Les dimensions et espacements sont liés aux variables existantes. L'ordre des commandes dans la composition arabe est conservé. Cette correction n'ajoute **aucune variable, aucun composant et aucune page**.

Dans les **20 instances de l'icône de compte**, la tête et le corps utilisent maintenant tous deux `color/action/quiet` (`VariableID:42:10`). Les **40 tracés** suivent ainsi la même couleur : bleu dans le thème clair et turquoise dans le thème sombre.

L'audit API est passé pour l'ensemble des 28 barres et des 40 tracés ; les captures françaises et arabes ont été contrôlées. **La vérification V4 dans Chrome est terminée.** Sur ordinateur, les commandes françaises et anglaises sont régulières en clair et en sombre, avec 60 px entre leurs centres. Sur mobile, les passages français → arabe → anglais conservent des centres espacés de 52 px, le bon ordre RTL et le format 390 × 844. Le thème sombre reste actif au retour vers l'anglais ; le compte visiteur ouvre le panneau de connexion simulée et Annuler le referme. Les 37 cadres, les timings, les liens et les résultats de validation V3 restent inchangés.

## Ajout V5 du nom HORIZON

**État historique avant V6.** L'ordre interne inversé en arabe décrit ci-dessous a été corrigé en V6 et le composant comporte désormais une ligne arabe. Les mesures et vérifications V5 restent les preuves de cet état antérieur.

À la demande de l'utilisateur du **14 septembre 2026**, le nom HORIZON apparaît dans l'en-tête des deux entrées, dans les deux panneaux de connexion simulée et dans les huit accueils. L'entrée affiche le nom seul. Sur l'accueil, HORIZON se place à **16 px des contours visibles du symbole 42**, vers l'intérieur de la page : à droite du symbole en français/anglais, à gauche en arabe. Le mot reste latin en majuscules dans les trois langues ; le symbole 42 et les commandes conservent leur position.

Le nouveau composant partagé **`Brand/Horizon`** (`171:6`) se trouve sur la page de composants `5:3`. Il réutilise les styles de texte et les variables existantes, sans nouvelle variable ni page. La bibliothèque compte désormais **21 familles de composants et 205 variables**.

| Variante | Composant / texte | Style | Taille / interligne |
| --- | --- | --- | --- |
| Desktop | `171:2` / `171:3` | `42/H2` | 28 / 34 px |
| Mobile | `171:4` / `171:5` | `42/H3` | 20 / 28 px |

Le nom reste provisoirement en **Jost Medium** : la police exacte **Futura PT Heavy Oblique** reste en attente. Les liaisons communes sont `i18n/brand/name` (`VariableID:95:3`), `color/logo` (`VariableID:65:2`), `font/family` (`VariableID:45:3`) et `font/medium` (`VariableID:45:5`).

| Emplacement des 12 instances | Ordinateur | Mobile |
| --- | --- | --- |
| Entrée | `115:3` | `123:145` |
| Panneau de connexion | `118:64` | `128:487` |
| Accueil connecté LTR | `115:4` | `123:162` |
| Accueil visiteur LTR | `119:178` | `125:198` |
| Accueil connecté RTL | `125:243` | `125:349` |
| Accueil visiteur RTL | `125:296` | `125:402` |

Les panneaux de connexion utilisent un agencement automatique qui absorbe la nouvelle ligne : leur hauteur en français est de **364 px sur ordinateur** et **360 px sur mobile**. La piste conserve **37 cadres**.

**L'audit API V5 est passé** : 37 cadres, 12 instances HORIZON toutes en Jost Medium avec les alias de texte `VariableID:95:3` et de couleur `VariableID:65:2`. Toutes les réactions restent identiques au relevé avant modification (signature `e797d9ca`). Les positions, dimensions et contours visibles du 42 et de la phrase sont inchangés, ainsi que les 28 barres de commandes.

Les captures Figma contrôlées couvrent les entrées ordinateur/mobile en clair, les accueils ordinateur/mobile LTR et RTL en clair, et le panneau de connexion ordinateur en clair. Dans **Chrome sur mobile**, les vérifications couvrent l'entrée française en clair et sombre, puis le panneau sombre avec le nom et les actions lisibles. La connexion simulée rejoint `123:162` : le 42 apparaît seul pendant la transition, puis glisse vers l'accueil sombre portant 42 HORIZON. Le passage **français → arabe (`125:349`) → anglais (`123:162`)** conserve HORIZON en latin et le thème sombre.

**Limites de cette vérification V5 :** le parcours visiteur et le parcours ordinateur n'ont pas été rejoués dans le navigateur. Leurs réactions ont été contrôlées et sont inchangées ; les essais des itérations précédentes restent des vérifications antérieures. Cette réalisation n'est pas une acceptation définitive de l'identité par l'utilisateur.

## V6 — ordre du logo et essai bilingue

**État historique avant V7.** L'ordre interne 42 puis noms est conservé. L'affichage de la ligne arabe dans tous les contextes, essayé ci-dessous, est remplacé par la condition campus/langue V7 ; les vérifications V6 restent les preuves de l'état précédent.

Le **14 septembre 2026**, l'utilisateur a précisé que le logo doit conserver son ordre interne en arabe : le **42 reste à gauche des noms**, et seul le bloc change de côté dans l'en-tête. Les versions [anglaise](https://42abudhabi.ae/) et [arabe](https://42abudhabi.ae/ar/) du site 42 Abu Dhabi ont été inspectées dans Chrome : elles montrent le même logo bilingue, avec le nom arabe au-dessus du latin. Cette référence précise l'agencement ; elle ne fixe pas le nom arabe de Horizon.

L'utilisateur hésitait entre traduction et transcription. **أفق est une traduction proposée par l'assistant, intégrée comme essai dans la maquette**, sans décision explicite définitive de marque. Elle est affichée au-dessus de HORIZON dans les trois langues de l'interface. Le symbole 42 garde son dessin.

Les quatre accueils RTL (`125:243`, `125:296`, `125:349`, `125:402`) ont été corrigés en conservant l'emprise horizontale visible du bloc, le gap de 16 px et sa marge droite visible de **64 px sur ordinateur** et **24 px sur mobile**. Les noms suivent désormais le 42 de gauche à droite. Les scènes centrales de la transition restent centrées ; Smart Animate rejoint la nouvelle position finale du 42.

Le composant partagé **`Brand/Horizon` (`171:6`)** conserve ses deux variantes. Les deux nouveaux textes arabes, `181:4` sur ordinateur et `181:5` sur mobile, partagent la propriété **`Arabic name#181:0`**, de valeur proposée `أفق`. Ils utilisent le style `42/International/Label`, en **Noto Sans Arabic Medium 14 / 24 px** ; le mode arabe `95:2` est fixé uniquement sur ces textes pour qu'ils conservent cette police lorsque l'interface est en français ou en anglais. Leur couleur suit `color/logo` (`VariableID:65:2`), comme le latin.

HORIZON garde **Jost Medium 28 / 34 px sur ordinateur et 20 / 28 px sur mobile** ; Futura PT Heavy Oblique reste en attente. La hauteur du composant bilingue passe à **58 px sur ordinateur** et **52 px sur mobile**. La modification se propage aux **12 instances** déjà recensées en V5. Aucune page, variable ou famille de composants n'est ajoutée : **37 cadres, 205 variables et 21 familles** sont conservés.

Les **dix en-têtes sont recentrés**. Les panneaux de connexion s'adaptent à la ligne arabe : leur hauteur en français est maintenant de **388 px sur ordinateur** et **384 px sur mobile**.

**L'audit API V6 est passé** : 37 cadres, 12 instances bilingues, ordre 42 puis noms dans les huit accueils avec un gap visible de 16 px. Les 28 barres de commandes et toutes les réactions restent inchangées (signature `e797d9ca`), ainsi que les centres des étapes centrales de l'animation. Les deux textes arabes sources conservent Noto Sans Arabic Medium et leur mode arabe fixé ; les 24 textes des instances partagent l'alias de couleur `VariableID:65:2`.

**La vérification ciblée V6 est terminée.** Les captures ont été contrôlées. Dans Chrome sur mobile, l'entrée française puis arabe a été examinée, puis le parcours visiteur arabe a été rejoué : `123:145` → `128:442` → `125:402`, **sans révélation du slogan**. L'accueil arabe affiche le 42 à gauche des deux noms, en clair et en sombre. Le retour vers l'accueil LTR `125:198` a été constaté après sélection de English ; la capture affichait toutefois du français, donc **le passage effectif à l'anglais n'est pas confirmé par cet essai V6**.

Les **parcours connecté et ordinateur n'ont pas été rejoués pour V6**. Les contrôles V5 restent des preuves de l'état antérieur. L'essai bilingue ne vaut pas validation définitive du nom arabe par l'utilisateur.

## V7 — visibilité réservée aux campus arabes en anglais/arabe

**Interprétation historique remplacée par V8.** L'utilisateur a précisé ensuite que le critère réel est la localisation de la connexion via IP, et non le campus, puis confirmé l'affichage systématique en version arabe. Les règles, noms de variantes et contrôles V7 ci-dessous décrivent uniquement cet état antérieur.

Le **14 septembre 2026**, l'utilisateur a corrigé la portée de la ligne arabe : elle ne doit apparaître que dans les **versions anglaise et arabe des campus arabes**. Cette décision explicite remplace la visibilité bilingue générale essayée en V6. HORIZON reste affiché ; le 42 garde sa place à gauche du nom, quelle que soit la langue. **أفق reste une proposition de traduction**, sans choix définitif de marque.

| Contexte consulté | Français | Anglais | Arabe |
| --- | --- | --- | --- |
| Vue globale, aucun campus actif, ou campus non arabe | HORIZON seul | HORIZON seul | HORIZON seul |
| Campus arabe | HORIZON seul | أفق au-dessus de HORIZON | أفق au-dessus de HORIZON |

La piste immersive ne possède pas de sélection de campus active. Ses **12 instances** utilisent donc la variante de composant **`Campus=Global or non-Arabic`**, qui est la valeur par défaut ; l'autre option est `Campus=Arabic`. Ce choix décrit le campus consulté ; il ne se déduit pas de la langue seule, du pays de l'utilisateur ou du campus de son compte. La liste des campus concernés et l'éventuel comportement du niveau Pays ne sont pas encore définis.

Le même ensemble `Brand/Horizon` (`171:6`) compte **quatre variantes `Size × Campus`** :

| Campus | Desktop | Mobile |
| --- | --- | --- |
| `Global or non-Arabic` (défaut) | `171:2` | `171:4` |
| `Arabic` | `193:2` | `193:6` |

La nouvelle variable booléenne **`i18n/brand/arabic-line-eligible` (`VariableID:190:734`)** vaut `false` en français, `true` en anglais et en arabe. Elle commande les conteneurs `193:3` et `193:7` des variantes `Arabic`, qui héritent de la langue courante ; leurs textes `193:4` et `193:8` gardent un mode arabe fixé pour conserver Noto Sans Arabic. Les variantes globales gardent les conteneurs `190:735` et `190:736` toujours masqués, sans liaison de langue. La combinaison donne **campus arabe ET langue EN/AR**, sans espace vide dans les variantes globales en anglais ou en arabe.

Par défaut, les variantes `Brand/Horizon` reviennent à **127 × 34 px sur ordinateur** et **91 × 28 px sur mobile**. Les panneaux de connexion mesurent **364 px sur ordinateur** et **360 px sur mobile** en français. Une variable est ajoutée ; aucune nouvelle page ni famille de composants. Les totaux vérifiés sont **206 variables dans 5 collections, 21 familles et 37 cadres**, avec quatre variantes `Brand/Horizon`.

**Les vérifications V7 par API et captures Figma sont terminées.** La matrice de six combinaisons campus/langue a été contrôlée dans les deux formats : ligne arabe visible uniquement pour `Campus=Arabic` en anglais/arabe, masquée en français dans tous les cas et masquée dans les trois langues pour `Global or non-Arabic`. Les copies temporaires utilisées pour ce contrôle ont été supprimées.

L'audit des **12 instances actuelles** confirme leur variante globale et leurs dimensions compactes de 127 × 34 px ou 91 × 28 px. Les huit accueils conservent le 42 à gauche du nom et le gap visible de 16 px. Les 28 barres de commandes et les centres des étapes d'animation sont inchangés par rapport à V6. Les captures contrôlées de la piste couvrent l'entrée ordinateur française `115:3`, l'accueil mobile arabe `125:349` et le panneau ordinateur `118:64`.

**Aucun parcours navigateur n'a été rejoué pour V7 et aucun sélecteur de campus n'est implémenté.** La matrice valide le composant dans les contextes configurés pour le contrôle, sans navigation réelle vers un campus. Les essais et audits V5/V6 restent propres à leurs versions.

## V8 — localisation de connexion et langue

**La règle de visibilité V8 reste active aux emplacements portant le nom.** Le relevé des 12 instances et des dix conteneurs ci-dessous décrit l'état avant V9 ; cette dernière retire uniquement les deux marques d'entrée et leurs conteneurs.

Le **14 septembre 2026**, l'utilisateur a corrigé le critère : il s'agit de la **localisation de la connexion dans le monde arabe, estimée via l'adresse IP**, et non du campus consulté. En réponse à la clarification, il a confirmé explicitement que **la version arabe doit toujours afficher la ligne arabe, quelle que soit l'IP**. Cette règle remplace V7 :

**Ligne arabe visible = langue AR OU (langue EN ET connexion localisée dans le monde arabe).** En français, elle reste masquée.

| Région de connexion | Français | Anglais | Arabe |
| --- | --- | --- | --- |
| Autre ou inconnue | HORIZON seul | HORIZON seul | أفق au-dessus de HORIZON |
| Monde arabe | HORIZON seul | أفق au-dessus de HORIZON | أفق au-dessus de HORIZON |

L'ensemble **`Brand/Horizon` (`171:6`)** conserve quatre variantes, renommées **`Size × Connection region`**. L'option `Other or unknown` est la valeur par défaut ; `Arab world` représente une connexion localisée dans le monde arabe. La propriété `Campus` a été supprimée ; son absence a été vérifiée. Le campus, le rôle du compte et le filtre du globe ne commandent pas cette visibilité.

| Connection region | Desktop | Mobile |
| --- | --- | --- |
| `Other or unknown` (défaut) | `171:2` | `171:4` |
| `Arab world` | `193:2` | `193:6` |

La variable booléenne **`VariableID:190:734`**, renommée `i18n/brand/arabic-line-arab-world`, fournit l'éligibilité par langue pour `Arab world` : FR=`false`, EN=`true`, AR=`true`. La nouvelle variable **`VariableID:199:2`**, `i18n/brand/arabic-line-other-region`, fournit l'éligibilité pour `Other or unknown` : FR=`false`, EN=`false`, AR=`true`. Les textes arabes gardent leur police Noto Sans Arabic et HORIZON reste en Jost Medium provisoire. Le dessin et l'ordre interne 42 puis nom sont conservés. **أفق reste une proposition de traduction**, sans validation définitive de marque.

**Figma simule la région de connexion par un réglage de variante ; aucune IP réelle n'est détectée, localisée ni traitée.** La liste géographique de référence et le mécanisme de géolocalisation IP restent à définir pour une implémentation réelle. L'option inconnue suit la première ligne de la table ; elle conserve l'affichage arabe lorsque la langue est AR.

Les **12 instances actuelles** gardent la région simulée `Other or unknown`. Les quatre accueils RTL affichent ainsi la ligne arabe malgré une région hors du monde arabe ou inconnue. Dix conteneurs **`HORIZON · Alignment`** (`200:738` à `200:747`) assurent le centrage automatique du nom lorsque la ligne arabe apparaît ou disparaît, sans déplacer le logo ni les commandes. Les panneaux de connexion mesurent **364 px sur ordinateur** et **360 px sur mobile** en français.

**Les vérifications V8 par API et captures Figma sont terminées.** La matrice de six combinaisons région/langue a été contrôlée dans les deux formats ; les copies temporaires de contrôle ont été supprimées. Les huit accueils conservent le 42 à gauche du nom et un gap visible de 16 px. Les 28 barres de commandes et les centres des étapes d'animation restent inchangés. La capture de l'accueil mobile arabe `125:349` a été contrôlée.

Les totaux vérifiés sont **207 variables dans 5 collections, 21 familles de composants et 37 cadres**, avec quatre variantes HORIZON. **Aucun parcours Chrome n'a été rejoué pour V8 et aucune IP réelle n'a été détectée.** Ces contrôles valident les états configurés dans Figma, sans démontrer une géolocalisation ou un parcours applicatif réel. Les audits V5/V6/V7 restent les preuves de leurs états antérieurs.

## V9 — entrée cryptée épurée

À la demande de l'utilisateur du **14 septembre 2026**, l'entrée conserve uniquement la **phrase cryptée**, les actions **connexion/visiteur** et les commandes **langue/thème**. Elle ne porte aucune marque — ni 42, ni HORIZON, ni ligne arabe — et n'affiche plus les accroches **« LE MONDE EST À PORTÉE DE MAIN »** et **« Un lien. Des milliers de possibilités. »**, ni leurs traductions. Le centre de la phrase, les boutons et les interactions sont conservés.

Les deux marques d'entrée et leurs conteneurs (`172:710` / `200:738`, `172:712` / `200:739`) ont été retirés. Les **16 textes** de préambule et d'invitation ont été supprimés des **huit cadres de message** : les deux entrées, les quatre étapes de déchiffrement et les deux révélations. Ces cadres ne contiennent plus aucune marque ni accroche. Les variables `VariableID:121:12` et `VariableID:121:13` restent conservées comme historique ; aucune occurrence liée à ces variables ne subsiste dans la piste.

Les deux panneaux de connexion et les huit accueils gardent leur identité. La règle V8 y reste active : ligne arabe en AR, en EN si la région de connexion simulée est `Arab world`, jamais en FR. Le logo 42 apparaît toujours dans la séquence centrale qui suit les cadres de message, puis le cercle et le globe se forment.

**Vérifications V9 terminées par API et captures Figma.** Les captures de l'[entrée ordinateur `115:3`](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=115-3) et de l'[entrée mobile `123:145`](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=123-145) ont été inspectées après le retrait complet : seuls la phrase cryptée, les deux accès et langue/thème restent visibles. L'audit confirme le retrait dans les huit cadres et la géométrie inchangée de tous les autres nœuds (signature `d95e3e37`), ainsi que les réactions inchangées (`e797d9ca`).

La piste conserve **37 cadres, 10 instances HORIZON et huit conteneurs d'alignement**. Les composants et les variables V8 restent inchangés. **Aucun parcours navigateur n'a été rejoué pour V9** ; les contrôles portent sur les états Figma et leurs captures.

À l’étape V9, la nouvelle animation était réalisée uniquement dans un prototype web distinct, décrit ci-dessous. Depuis la synchronisation du 27 septembre, le parcours Figma actif emploie le n°22 natif décrit en tête ; ce paragraphe conserve l’état historique V9.

## Prototype web — déchiffrement avec lettres, chiffres et symboles

**Prototype historique autonome.** L’accueil web raccordé et le report Figma du 27 septembre sont décrits en tête et dans leurs notes propres.

Le [prototype web dédié](../../archives/early-prototypes/decryption/horizon-decryption.html) réalise la séquence demandée : **binaire → hexadécimal → texte chiffré contenant des symboles → BEYOND THE CODE**. L’assistant propose une rotation de 42 positions sur un alphabet étendu de 76 caractères ; le texte chiffré exact est `ru%43t 9xu s4tu`. Les deux premières représentations montrent les mêmes octets, puis 42 rotations inverses déchiffrent réellement les caractères. La chronologie logique dure **6,8 s**, sans caractères tirés au hasard. Pour répondre à la demande de transitions moins brusques, l’encre des glyphes se transforme géométriquement : chaque quartet rejoint son chiffre hexadécimal, puis les deux chiffres se recomposent en un caractère. Ces deux mouvements durent 900 ms chacun et sont calculés par un rendu Canvas 2D.

L’interface reprend l’entrée V9 sans marque ni accroche, avec langues/thèmes et connexion simulée. Le visiteur contourne le déchiffrement vers le 42 ; après connexion simulée, la phrase finale reste visible avec Rejouer pour examen. Le prototype ne comprend ni globe, ni accueil complet, ni authentification réelle, ni traitement IP. **Figma V9 conserve son ancien message crypté et ses cadres de révélation.**

**Huit tests moteur, contrôles de syntaxe et vérifications Chrome ciblées sont terminés.** Des captures d’instants du même moteur et du même rendu montrent les deux transformations sur ordinateur/mobile et un bloc mobile stable. Le parcours connecté ordinateur a été joué jusqu’au texte final, contrôlé en clair et sombre ; Annuler et Visiteur ont aussi été rejoués. Aucun FPS n’a été mesuré, aucune réduction des mouvements forcée et aucune nouvelle matrice de langues exécutée pour cette correction. Les [notes dédiées](../../archives/early-prototypes/decryption/decryption-notes.md) donnent les fichiers, les ressources, le lancement local et le détail des preuves. Le mécanisme de rotation reste une **proposition de l’assistant**, sans acceptation finale de l’utilisateur.

## Langues, thèmes et arabe

Les langues **Français**, **English** et **العربية**, ainsi que les thèmes clair et sombre, utilisent des **modes partagés pendant l'exécution du prototype**. Cette organisation évite de créer douze copies de chaque scène pour toutes les combinaisons de langue, thème et format. Les cadres distincts servent aux étapes du parcours, aux formats ordinateur/mobile et aux compositions LTR/RTL nécessaires.

Le menu arabe dispose d'une composition RTL dédiée. Sur ordinateur, le globe rejoint la gauche, au lieu de la droite en français et en anglais ; sur mobile, il reste centré au-dessus de la barre basse. **La géographie du globe n'est pas inversée** et le symbole 42 conserve son dessin. Le slogan BEYOND THE CODE reste inchangé.

Les tests **V1** dans Chrome avaient confirmé les deux parcours sur ordinateur et mobile, le changement de thème sans navigation, la traduction arabe dès l'entrée et l'arrivée automatique sur l'accueil RTL. Sur mobile, le passage arabe → anglais conservait le format 390 × 844 et fermait le sélecteur, avec conservation du thème choisi. **La transition V2 a été vérifiée séparément** : visiteur sur ordinateur sans révélation, connexion simulée sur mobile avec format 390 × 844 conservé et visiteur arabe arrivant sur le bon accueil RTL. Le cercle, le globe centré et le glissement sont visibles dans les captures intermédiaires.

## Textes partagés et repères techniques

La collection **42 · Langues** (`VariableCollectionId:95:2`) conserve les **13 variables de texte** créées pour la piste : douze pour l'entrée, le panneau et les actions, plus le libellé court de langue. Depuis V9, celles du préambule et de l'invitation sont historiques et ne sont plus utilisées dans la page immersive.

Les modes restent Français (`95:0`), English (`95:1`) et العربية (`95:2`). Les libellés FR/EN/AR sont conservés dans [immersive-copy.json](immersive-copy.json), qui contient notamment :

| Clé | Français | English | العربية |
| --- | --- | --- | --- |
| `preamble` (historique) | LE MONDE EST À PORTÉE DE MAIN | THE WORLD IS WITHIN REACH | العالم بين يديك |
| `invitation` (historique) | Un lien. Des milliers de possibilités. | One connection. Thousands of possibilities. | صلة واحدة. آلاف الاحتمالات. |
| `language_short` | FR | EN | ع |

Les anciennes accroches sont conservées dans `VariableID:121:12` (préambule) et `VariableID:121:13` (invitation), sans occurrence dans la piste depuis V9. Le libellé court de langue utilise toujours `VariableID:124:188`. Le relevé des cadres, variables et menus se trouve dans [immersive-state.json](immersive-state.json). Ces fichiers locaux sont des instantanés de travail ; ils ne se synchronisent pas automatiquement avec une application.

## Ce que couvre le prototype

La maquette couvre l'entrée, les choix visiteur/connexion simulée, la révélation du slogan, l'apparition du logo et du cercle, la formation du globe centré, son glissement vers l'accueil et les contrôles de langue et de thème.

L'audit **V2** avait confirmé 37 cadres sans chevauchement, aucune destination de navigation manquante et aucun cercle sur les huit états de phrase. Les centres du logo, du cercle et du globe coïncidaient pendant leur transformation. Les réactions des commandes invisibles pendant la transition restent désactivées. Les vérifications V2 dans le navigateur étaient terminées, sans arrivée incorrecte ni chevauchement persistant observé.

La **V3** corrige en plus l'alignement visible de la phrase et du dessin interne du logo. Son audit numérique et sa validation visuelle dans le navigateur sont terminés : entrée, déchiffrement, slogan, logo, cercle et globe restent centrés jusqu'au glissement prévu vers l'accueil. Sur mobile, les deux lignes sont présentes dès l'entrée, y compris avec le préambule arabe.

La **V4** uniformise les dimensions et les espacements des commandes ainsi que la couleur des deux parties de l'icône de compte. Son audit API, ses contrôles de captures et sa vérification dans le navigateur sont terminés. Les commandes et leurs interactions restent cohérentes entre les langues et les thèmes contrôlés.

La **rotation du globe**, le **zoom encadré par niveau** et des **contenus de démonstration des rubriques** existent maintenant dans [l’accueil web](../../site/index.html). Ils ne sont pas reproduits fonctionnellement dans Figma : seul l’état de sélection du menu y est interactif. Les contrôles de carte dessinés ne constituent pas leur implémentation applicative. L’authentification réelle, les données de production, les permissions et les autres parcours du site restent des travaux distincts.

Cette direction visuelle ne modifie pas la règle de confiance communautaire : les publications ne nécessitent toujours pas de validation préalable de l'étudiant. Le rôle et le périmètre géographique restent distincts.
