# Fiches du Journal à volets — 7 octobre 2026

## Demande et adaptation

L’utilisateur demande d’appliquer au Journal la structure à volets des fiches Profils et Projets. Le découpage réalisé est adapté à la lecture : **Article · Médias · Auteurs**. Article est le volet initial et contient le résumé, les thèmes/tags et **tous les paragraphes du texte existant**. Médias montre l’illustration locale déjà associée à l’article, signalée comme démonstration ; Auteurs relie les personnes déjà associées au corpus, Inès ou Haru, à leur profil.

Aucun article, texte, auteur, photographie ou autre média supplémentaire n’est inventé. Le listing du Journal et ses CTA restent inchangés. Les fiches Projets gardent leurs quatre rubriques ; les fiches Profils conservent leur organisation. L’identité latérale de l’article reprend vignette, titre, campus, date illustrative, favori et accès à la carte du campus. Sur mobile le sélecteur de rubrique est ancré sous l’identité, avec son panneau limité à l’espace disponible avant la recherche et le dock. Les langues FR/EN/AR, le RTL, les thèmes et les préférences de mouvements réduits sont conservés.

## Navigation et partage

Les anciennes URL des articles ouvrent toujours leur contenu, maintenant dans Article. Les liens `?tab=article`, `?tab=media` et `?tab=authors` ouvrent le volet correspondant ; une valeur inconnue revient à Article. La forme canonique du volet initial n’ajoute pas de paramètre.

L’historique du navigateur suit les changements de volet. Le bouton Retour quitte toute la visite de l’article vers son origine. Ainsi Journal → Auteurs → profil → Retour à l’article retrouve le volet Auteurs ; profil → Contribution → article → plusieurs volets → Retour au profil retrouve Contribution. La profondeur de retour du Journal est distincte de celles des Projets et Profils. Un article remplacé par le dé conserve son origine. Le favori, la carte campus et la recherche globale restent raccordés aux mêmes données et contrôleurs.

## Réutilisation et sources

`journal-ui.mjs` configure la composition partagée extraite du rendu des projets dans `project-ui.mjs`, avec ses trois rubriques, ses libellés et des identifiants DOM propres au Journal. La sortie des fiches Projets est conservée. `journal.css` complète uniquement les règles de conteneur/titre/RTL ; les styles et interactions communs restent ceux de `projects.css`. Les écouteurs de navigation sont nettoyés à chaque remplacement de fiche et à sa fermeture.

Sources touchées : welcome.mjs, project-ui.mjs, index.html, content-preview.html et content-preview.mjs. Nouveaux fichiers : journal-ui.mjs, journal.css et tests/journal-sections.test.mjs. L’état80 précédent est conservé dans `archive/pre-journal-sections-20261007/` avec manifeste. Toutes les archives précédentes restent disponibles. La feuille des profils est seulement référencée en version9 conformément au travail distinct de l’agent principal ; elle n’a pas été modifiée dans cette intégration.

Versions initiales : contrôleur `journal-sections-81`, aperçu49, Journal UI1/CSS1, rendu partagé Projet UI2, Projets CSS1.

## Vérifications

Syntaxe des modules welcome, project-ui et journal-ui vérifiée. Six fichiers de tests passent : volets du Journal, Projets et Profils, relations auteurs/profils, découverte aléatoire et transitions. Les cas ajoutés couvrent les anciennes URL sans volet, les valeurs inconnues, les trois rubriques et l’indépendance des profondeurs de retour. Une revue indépendante vérifie identifiants, ARIA, nettoyage des écouteurs, portée des styles et conservation du rendu Projets, sans défaut concret relevé.

Contrôles Chrome terminés : Article français clair à1280×900, identité et volet Auteurs à320×640 français clair, sélecteur mobile arabe sombre. Tous les paragraphes existants sont présents dès Article ; aucun débordement horizontal n’est relevé à320px. Les flèches puis End donnent accès à la dernière rubrique ; le panneau reste au-dessus de la recherche et du dock. Le passage Médias au clavier et le rechargement de son lien direct conservent ce volet. Le favori est ajouté puis retiré.

Article → Auteurs → Inès → Retour à l’article retrouve Auteurs. Depuis Inès → Contribution, ouvrir l’article, visiter Médias puis Auteurs et revenir au profil restitue Contribution. La page principale est rouverte sur l’article via l’entrée visiteur ; français clair, grille des profils et format habituel sont rétablis. Ces essais portent sur le prototype et le navigateur de bureau redimensionné, sans téléphone physique, clavier virtuel, nouveau parcours de carte, nouveau tirage aléatoire ou report Figma.


## Suite du 7 octobre — Défilement indépendant des colonnes

À la demande de l’utilisateur, les fiches ordinateur gardent désormais identité/sommaire et lecture dans deux régions de défilement indépendantes. La gauche reste en place quand la droite défile ; chaque colonne peut défiler selon son contenu. Mobile conserve son flux et le sélecteur actuel. Positions raccordées aux retours, aux rendus et au fondu du dock. [Réalisation, vérifications exactes, limites et archives](DETAIL_SCROLL_NOTES.md). Versions contrôleur83/aperçu51.


### Précision suivante — lecture naturelle, version84

L’utilisateur refuse le cadre de hauteur limitée autour de la lecture : la droite retrouve le défilement naturel du document. Seule l’identité/sommaire reste fixe et peut défiler indépendamment ; elle ne remonte pas en fin de page. L’historique reprend `window.scrollY` pour la lecture et conserve l’offset gauche. Mobile inchangé ; note de démonstration alignée à droite, fondu des fiches sans translation de leur parent. [État actuel, tests et archive de l’essai83](DETAIL_SCROLL_NOTES.md). Contrôles navigateur complémentaires centralisés par l’agent principal.


## 8 octobre 2026 — Un article collectif à quatre auteurs

À la demande d’un exemple avec plus de deux auteurs, **Montrer ce qui n’est pas encore fini** (`journal-share-the-unfinished`) est désormais attribué aux profils fictifs Haru, Luiza, Caio et Inès. Son texte, son illustration, sa date et son campus sont conservés. La carte montre deux auteurs et un lien **+2** vers Auteurs ; cette rubrique présente les quatre liens et les contributions inverses sont disponibles dans chacun des profils. La liste de données et le rendu complet n’imposent aucun maximum de collaborateurs. Les autres articles restent présents.

Sources, fonctionnement commun, versions et vérifications automatisées sont consignés dans [les notes Projets](PROJECTS_NOTES.md#8-octobre-2026--exemple-à-cinq-et-équipes-sans-plafond-daffichage). La limite de deux concerne uniquement l’aperçu compact avec accès à la liste complète. Les données antérieures et l’essai intermédiaire à deux personnes sont archivés.
