# Contenu de démonstration pour la pagination

## Suite du13 octobre — sept pages par rubrique

L’utilisateur demande ensuite encore plus de contenu pour obtenir **sept pages dans chacune des trois rubriques**. Le corpus courant compte **78 projets,78 profils et78 chroniques**, soit234 entrées de découverte. À cette étape, chaque liste avait six pages de12 éléments et une dernière page de6. La précision suivante choisit24 profils/page : le même corpus actuel donne donc quatre pages de profils (24/24/24/6), tandis que Projets/Chroniques gardent sept pages. [Règles et contrôles courants](CONTENT_PAGINATION_NOTES.md).

[demo-content-expanded.mjs](../demo-content-expanded.mjs) ajoute52 profils,52 projets et52 chroniques au corpus précédent, sans réécrire celui-ci. Les variations sont composées à partir de textes courts FR/EN/AR : huit thèmes de projets avec sept perspectives de travail, et treize thèmes éditoriaux avec quatre angles de récit. Les ID restent uniques. Chaque nouveau profil a un projet et un article ; auteurs, responsables et campus sont reliés. Le corpus couvre désormais les58 campus et30 pays du catalogue, avec28 cadets,25 transcenders et25 alumni.

Cette extension est volontairement un jeu de données fictives pour examiner la pagination. Elle réutilise les portraits et illustrations locaux, garde les comptes sociaux vides et n’invente aucun pseudo Intra. Les dates illustratives sont fixes ; Explorer et42 Awards ne reçoivent pas de fausses publications.

L’étape26 éléments est conservée avec [sources, notes et lecteur à trois pages](../../archives/site-versions/pre-seven-page-demo-content-20261013/README.md). Ce lecteur réutilise le moteur déjà figé d’une archive précédente et les données locales exactes de l’étape26 ; il n’ajoute pas une nouvelle copie complète du runtime. Les exemples initiaux et le corpus intermédiaire sont comparés intégralement dans les tests.

Les tests [corpus](../tests/demo-content.test.mjs) et [profils](../tests/profile-data.test.mjs) passent sur cet état. Ils couvrent unicité, traductions, dates, relations,58 campus, filtrage et pages12/12/12/12/12/12/6 pour les trois tris. [Le contrôle Chrome réel](../checks/20261013-seven-page-content-browser.json), avec [script reproductible](../checks/20261013-seven-page-content-browser.py), parcourt les21 pages, vérifie Précédent→page6→saut7→fiche→retour7 dans les trois rubriques, puis neuf nouveaux détails FR/EN/AR. Il contrôle aussi la relation auteur→profil→projets, le choix Tirana/Zürich, le filtre Tirana sans globe et le lecteur conservé26 éléments. Aucun doublon, débordement horizontal ou exception JavaScript détecté ; empreintes des sources stables pendant cette passe.

Captures examinées : pages7 [Projets](../checks/20261013-seven-page-content-projects-page7.png), [Profils](../checks/20261013-seven-page-content-people-page7.png), [Chroniques](../checks/20261013-seven-page-content-journal-page7.png) et détails320px en arabe [Projet](../checks/20261013-seven-page-content-projects-detail-ar.png), [Profil](../checks/20261013-seven-page-content-people-detail-ar.png), [Chronique](../checks/20261013-seven-page-content-journal-detail-ar.png). Limites : Chrome isolé avec mouvements réduits, pas de téléphone physique ni contenu réel publié. Version projet **0.0.1 pré-alpha** inchangée.

## 13 octobre 2026 — première étape à trois pages, conservée

L’utilisateur demande d’ajouter du contenu pour parcourir plusieurs pages dans chaque menu concerné. Le corpus de **Projets, Profils et Chroniques comptait alors26 éléments par rubrique**, soit trois pages de12,12 et2 éléments avec la pagination existante. Explorer reste la carte du réseau ; aucun résultat, candidature ou lauréat n’est inventé dans42 Awards.

Les cinq projets, six profils, deux chroniques et deux anciens récits de parcours restent intégralement conservés, avec leurs ID, textes et relations. L’ajout comprend **21 projets,20 profils et24 chroniques fictifs**. Ce n’est ni un import Intra, ni une création de comptes, ni une publication réelle. Il sert à examiner la navigation avec un corpus plus fourni ; aucune acceptation générale des textes ou du design n’est déduite.

## Données ajoutées

[demo-content-seed.mjs](../demo-content-seed.mjs) regroupe les données supplémentaires sans import circulaire ; [content-preview-data.mjs](../content-preview-data.mjs) et [profile-data.mjs](../profile-data.mjs) les ajoutent aux exemples d’origine. Les ID éditoriaux commencent par `demo-project-` ou `demo-journal-`, et tous les nouveaux enregistrements portent `demo:true`.

Chaque nouveau profil a une introduction, un rôle, une biographie, trois étapes de parcours, un projet et une chronique reliés. Les26 profils comprennent10 cadets,8 transcenders et8 alumni. Les introductions et récits sont courts, rédigés en français, anglais et arabe. Les dates, statuts et promotions sont explicitement illustratifs. Aucun pseudo Intra ni compte social réel n’est attribué : les nouveaux profils affichent l’état existant « Pseudo Intra à renseigner ».

Le corpus couvre **25 campus de20 pays** du catalogue local. Six nouveaux projets réunissent plusieurs campus ; leurs associations restent explicites dans `campusIds`, avec un responsable parmi les auteurs. Les chroniques conservent leur campus éditorial unique. Les nouveaux projets utilisent un `projectType` explicite parmi les types déjà proposés ; technologies et savoir-faire restent dans les vocabulaires existants. Le filtre accepte ce champ validé et conserve les associations historiques par ID.

Les six portraits SVG locaux et les illustrations existantes sont réutilisés. Aucune image générée ni dépendance distante supplémentaire. Les projets Libft utilisent une illustration générique : la variante terminal contenant le mot « minishell » ne leur est pas attribuée.

## Préservation et contrôles

- [Sources précédentes et empreintes](../../archives/site-versions/pre-demo-pagination-content-20261013/README.md), avec un [lecteur de l’ancien corpus](../../archives/site-versions/pre-content-pagination-20261013/preview.html).
- [Tests du nouveau corpus](../tests/demo-content.test.mjs) : comparaison intégrale des exemples et relations d’origine avec l’archive, unicité,78 enregistrements, traductions, dates, campus, auteurs/responsables, types/filtres, contributions inverses et pagination réelle12/12/2 pour les trois tris.
- [Tests profils actualisés](../tests/profile-data.test.mjs) :26 personnes et52 publications, biographies, portraits locaux, relations, parcours hérités et immutabilité. Les régressions qui décrivent un scénario historique peuvent sélectionner les ID d’origine avec [legacy-content-fixture.mjs](../tests/legacy-content-fixture.mjs) ; ces références pointent les données actives, sans copie figée.
- [Contrôle Chrome du corpus réel](../checks/20261013-demo-content-browser.json), [script reproductible](../checks/20261013-demo-content-browser.py) : neuf pages sans doublon, neuf détails en FR/EN/AR, projet→auteur→contributions, choix des trois campus d’un nouveau projet et filtre Maroc/Khouribga avec le globe bloqué. Aucun débordement horizontal ni exception JavaScript détecté.
- [Complément de rendu final](../checks/20261013-demo-content-final-browser.json), [script](../checks/20261013-demo-content-final-browser.py) : illustration Libft corrigée et tous les liens de pagination accessibles sans être masqués par le dock après défilement. Les premières captures avaient précédé la fin du défilement ; aucun changement de pagination n’a été nécessaire.

Captures examinées : pages3 [Projets](../checks/20261013-demo-content-projects-page3-final.png), [Profils](../checks/20261013-demo-content-people-page3.png), [Chroniques](../checks/20261013-demo-content-journal-page3-final.png), et détails320px en arabe [Projet](../checks/20261013-demo-content-projects-detail-ar.png), [Profil](../checks/20261013-demo-content-people-detail-ar.png), [Chronique](../checks/20261013-demo-content-journal-detail-ar.png). La capture arabe Projet précède uniquement le remplacement de son illustration générique, contrôlé ensuite sur la page3.

Les deux fichiers de tests ciblés passent. Le premier essai navigateur a été arrêté par une syntaxe `await` du banc ; ses neuf contrôles de pagination étaient déjà passants. L’essai complet corrigé et le complément final sont conservés séparément avec leurs empreintes. Chrome est isolé, avec mouvements réduits ; pas de téléphone physique, de publication serveur ni de vérification des rues distantes par cette passe. Version projet maintenue à **0.0.1 pré-alpha**.


## Revue avant partage du13 octobre

La revue relève encore l’ancienne limitation à cinq campus dans À propos. Les trois textes FR/EN/AR indiquent maintenant des exemples fictifs répartis dans le réseau, sans modifier le corpus. [Textes précédents consultables et sources exactes](../../archives/site-versions/pre-about-corpus-copy-20261013/README.md). Contrôleur138/aperçu105 ; les639 cas actifs passent sur les sources finales et les ressources servies correspondent aux fichiers locaux. [Preuve](../checks/20261013-pre-push-final-tests.json).
