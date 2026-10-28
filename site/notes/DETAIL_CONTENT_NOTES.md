# Article illustré et rubriques sans doublon — 10 octobre 2026

L’utilisateur précise que l’image principale des Chroniques doit apparaître dans **Article**, tandis que **Médias** rassemble tous les médias. Il demande aussi de ne plus répéter le nom de la rubrique dans la colonne de droite, par exemple Article ou Médias.

Le premier média, identique à celui de la vignette latérale, ouvre désormais Article. Il conserve sa légende, ses crédits lorsqu’ils sont renseignés et l’ouverture de la visionneuse. Une illustration fictive reste signalée comme telle ; aucune image réelle n’est inventée. Le composant traite également une vidéo principale si les données en fournissent une. Médias utilise toujours la collection entière ; le corpus courant ne contient qu’une illustration par article.

Les titres qui répètent la rubrique sélectionnée sont masqués **visuellement** dans les fiches Projets, Chroniques et Profils. Leurs noms accessibles, IDs et relations aria-labelledby restent présents. Les sous-parties utiles — À propos, En quelques mots, thèmes, paragraphes titrés, etc. — sont conservées. Le menu ordinateur et le sélecteur mobile donnent le contexte visible. Ni route, ni comportement de retour, ni titre de dialogue ou de carte ne changent.

Sources : extraction de mediaFigure dans project-ui.mjs pour partager image Article et galerie ; règles ciblées dans projects.css et profiles.css. Caches à cette étape : contrôleur article-media-104 / aperçu72, Projet UI15 / Journal UI14, Projets CSS4 / Profils CSS18. Ce sont des paramètres de cache, pas une version du projet.

L’[état intermédiaire précédent](../../archives/site-versions/pre-inline-article-media-20261010/preview.html#journal/journal-an-evening-debugging) conserve les commentaires simples et l’affichage indépendant, avec titre Article visible et sans grande image dans Article. Runtime, originaux, tests et manifeste conservés ; stockage de l’archive isolé.

Quatre fichiers de tests ciblés passent après ce changement : médias détaillés, sections Projet, Chroniques et Profil. Revue indépendante du diff sans blocage concret. Chrome : Article puis Médias examinés sur ordinateur, image Article ouverte puis Échap et focus rendu à l’image ; même interaction à320×640, rendu français clair examiné. Arabe sombre mobile et absence de débordement vérifiés (document310px pour viewport320px). Fiche Leïla examinée sur ordinateur : titre Vue d’ensemble absent visuellement, sous-parties conservées. Entrée principale104 → visiteur → article avec son image jouée. Lecteur historique ouvert : pas d’image Article, titre visible et liens restant dans l’archive confirmés.

Français clair et format habituel rétablis. Aucun téléphone physique, nouvel audit lecteur d’écran, nouveau report Figma ou publication. Les suites sur les réponses et réactions des commentaires sont décrites dans [COMMENTS_NOTES.md](COMMENTS_NOTES.md).

## Suite du 10 octobre — Image principale des projets et médias dans le récit

L’utilisateur demande ensuite la même présence de l’image principale dans **Vue d’ensemble** des projets et la possibilité de placer des médias au fil de **Réalisation**. Ce raccord est réalisé dans la composition partagée : Vue d’ensemble affiche le même média principal que la vignette ; Article conserve son image d’ouverture. Les médias intégrés à un passage sont affichés après son texte, sans changer les paragraphes existants. Le même schéma fonctionne dans Article des Chroniques.

Le champ facultatif `body[].media` reprend les objets déjà admis dans `entry.media` : `type` image ou vidéo, `src`, texte alternatif `alt`, légende `caption`, crédit `credit`, et `poster` facultatif pour une vidéo. Les textes peuvent être localisés en FR/EN/AR. Les sources sont filtrées avec la même validation d’URL web que les médias principaux ; aucun HTML saisi n’est injecté dans les textes ou légendes.

La rubrique **Médias** rassemble les médias principaux puis ceux des passages, dans l’ordre de lecture, avec dédoublonnage par type et URL résolue. Une même image peut rester placée dans plusieurs passages avec une légende propre à chaque placement ; elle ne paraît qu’une fois dans la galerie commune. La visionneuse utilise cette collection et s’ouvre à l’index du média cliqué. Si aucun média principal explicite n’est fourni, l’illustration de couverture antérieure reste principale, même si des médias existent dans le corps du récit ; elle figure alors en tête de la galerie.

`getEntryMedia()` conserve sa portée antérieure, limitée aux médias principaux. Le nouvel agrégateur pur `collectEntryMedia()` fournit `items`, `hasPrimaryMedia` et `bodyMedia` ; chaque placement contient son média local et l’index correspondant dans la collection. Le rendu ajoute l’éventuelle illustration de couverture avant cette collection, sans modifier les données sources.

Un seul exemple est ajouté : le premier passage de Minishell affiche un [schéma SVG original](../assets/minishell-flow-demo.svg) en quatre étapes — lecture, analyse, exécution, résultat. L’alternative textuelle et la légende FR/EN/AR précisent qu’il s’agit d’une illustration créée pour ce récit fictif, et non d’une capture réelle du projet. Les textes précédents et les autres médias du corpus sont conservés ; aucune nouvelle vidéo n’est ajoutée au corpus actif. La création des projets/articles et le choix éventuel de WordPress ou d’un autre outil restent à discuter plus tard ; aucun éditeur ou CMS n’est développé dans cette suite.

### Sources et conservation

Sources modifiées : [project-ui.mjs](../project-ui.mjs), [projects.css](../projects.css), [content-preview-data.mjs](../content-preview-data.mjs), [tests médias](../tests/detail-media.test.mjs), avec le nouvel SVG. Les quatre sources précédentes sont conservées dans [pre-project-inline-media-20261010](../../archives/site-versions/pre-project-inline-media-20261010/README.md), avec manifeste et empreintes. C’est une archive ciblée de sources, distincte du lecteur historique complet lié plus haut. Les anciens essais restent conservés.

### Vérifications de cette suite

**Contrôles effectués sans navigateur :** les trois fichiers de tests médias détaillés, sections Projet et sections Chroniques passent. Quatre nouveaux cas couvrent l’agrégation et le dédoublonnage d’URL relatives/absolues, les légendes locales et l’absence de mutation, le maintien du média principal avec seulement des médias intégrés, le placement dans Réalisation/Article et le refus des URL exécutables ou non admises. Syntaxe, contrôle de diff, validité XML du SVG et quatre empreintes archivées vérifiés.

**Contrôle navigateur final non effectué — reprise du11 octobre :** accès au navigateur de contrôle indisponible dans la session. Restent à vérifier Vue d’ensemble → Réalisation → Médias sur Minishell, l’ouverture du schéma au deuxième élément de la visionneuse, le retour du focus après Échap, puis les rendus petit écran et RTL. Ces parcours ne sont pas encore revendiqués comme vérifiés dans cette suite ; les contrôles Chrome du premier raccord Article, décrits plus haut, restent des preuves distinctes. Aucun téléphone physique, report Figma ou publication.


**Reprise du11 :** les96 cas de10 fichiers ciblés passent, dont médias, catégories, préférences, rubriques, commentaires et auteurs. Le raccord partagé est présent dans les deux entrées ; aucune vérification visuelle supplémentaire n’est revendiquée depuis l’interruption.


## 11 octobre — Retrait des images de gauche dans Projet et Chroniques

L’utilisateur demande de retirer l’image de la colonne gauche des projets, puis précise de faire pareil pour les articles. Le rendu partagé ne crée plus la vignette de l’identité : titre, métadonnées et actions commencent la fiche. Une classe dédiée remet cette identité sur une colonne en mobile et dans les deux densités ordinateur, sans espace réservé à l’image. Le portrait Profil et les vignettes des cartes restent distincts de ce changement.

Les médias restent dans **Vue d’ensemble** des projets, **Article** des Chroniques, **Réalisation** et **Médias**, avec leur visionneuse commune. Aucun fichier image n’est supprimé. [État précédent archivé](../../archives/site-versions/pre-detail-sidebar-image-removal-20261011/README.md), avec sources, test antérieur et empreintes.

Vérification :12 cas passent dans les3 fichiers existants sections Projet, sections Chroniques et médias détaillés. Trois attentes qui comptaient encore la vignette gauche ont été actualisées, sans nouvelle suite de tests. Le banc DOM Node signale le dépassement de son seuil de10 écouteurs AbortSignal ; les nettoyages et contrôles passent, aucun diagnostic de fuite navigateur n’en est déduit. Syntaxe et diff contrôlés, revue de portée CSS indépendante. **Aucun rendu navigateur vérifié**, CUA restant indisponible ; la disposition finale mobile/RTL reste à examiner visuellement. Caches : `text-detail-118`, aperçu86, ProjetUI29, JournalUI28, projects.css7. Aucun nouveau Figma ni publication.

L’aperçu118 répond HTTP200. La première requête a expiré pendant la revue automatique d’autorisation, puis une relance bornée a réussi ; ce délai ne démontre pas une panne du serveur. Références locales des nouveaux imports/CSS et9 empreintes de l’archive contrôlées.


## 11 octobre — Retrait des mentions illustratives des en-têtes

L’utilisateur demande de retirer les indications telles que **Projet illustratif** de tous les contenus qui en possèdent. Les préfixes **Projet illustratif / Article illustratif / Parcours fictif** et leurs équivalents anglais/arabe sont retirés des neuf contenus éditoriaux : cinq projets, deux chroniques et deux anciens récits de parcours, soit27 accroches. Chaque intitulé garde son thème, par exemple **Systèmes**, **Vie de campus**, **Dans l’atelier** ou **Les débuts**.

La correction est portée par les données communes : cartes, fiches, contenus associés aux profils et recherche reçoivent la même accroche. Textes de récit et légendes ne sont pas réécrits ; la nature fictive du corpus reste documentée. Les essais historiques utilisent déjà des copies locales ou des données archivées. [Cinq sources précédentes conservées](../../archives/site-versions/pre-content-demo-label-removal-20261011/README.md).

Contrôles : comparaison des neuf objets à l’archive (seules les27 accroches changent, thèmes non vides), syntaxe et fichier de tests de recherche existant réussis ; audit indépendant des emplacements et dépendances. Aperçu121 et données5 répondent HTTP200, nouveau wrapper88 confirmé et fichier de données servi identique au fichier local. Cinq empreintes d’archive vérifiées. **Rendu navigateur non examiné**, outil CUA indisponible. Contrôleur `content-labels-121`, aperçu88, données5 ; autres modules/styles conservés. Prototype **0.0.1 pré-alpha**, sans publication ni nouveau Figma.


### Précision suivante — retirer toute la ligne d’accroche

L’utilisateur corrige l’interprétation précédente : **« Dans l’atelier » et les autres thèmes doivent aussi disparaître**. Les neuf propriétés `eyebrow` éditoriales sont maintenant retirées ; les cartes, fiches Projet/Chroniques, anciens récits et contributions de profils ne créent plus cette ligne. Campus/date, titres, résumé et tags utiles restent affichés. La recherche affiche le campus seul pour ces contenus. La première suppression limitée aux préfixes est un état intermédiaire conservé, pas la règle actuelle.

[Archive de la correction suivante](../../archives/site-versions/pre-content-topic-label-removal-20261011/README.md) : données, contrôleur, ProfilUI et empreintes. Comparaison des neuf objets strictement identiques hors `eyebrow`,27 sous-titres de recherche FR/EN/AR contrôlés, fichiers de tests recherche/profils réussis. Les anciennes études restent indépendantes avec leur copie ou import archivé. ProjetUI retire également le paragraphe d’accroche ; sources précédentes dans [l’archive commune Équipe/Tester](../../archives/site-versions/pre-project-overview-team-testing-20261011/README.md). Contrôleur122, aperçu89, données6, ProfilUI28, ProjetUI31, JournalUI30 ; pas de rendu navigateur disponible.
