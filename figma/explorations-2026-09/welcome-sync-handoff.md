# Synchronisation site → Figma — état du 27 septembre 2026

**Report achevé pour l’entrée et les huit accueils.** L’utilisateur a repris explicitement le travail après la suspension initiale faute de tokens. Les contrôles ci-dessous décrivent ce qui a été réalisé et vérifié ; ils ne valent ni acceptation esthétique ni publication.

Fichier `yFrdllVm6nrKZJ2c99MMjT`, page active `115:2` — `12 · BEYOND THE CODE`. Bibliothèque dédiée sur `5:3`. Entrées conservées : ordinateur `115:3`, mobile `123:145`. Voir [la piste active et son historique](piste-immersive.md) et [le relevé technique](immersive-state.json).

**Suite du 27 septembre — contenus, filtres et fiches :** quatre pages Projets/Minishell ordinateur et mobile, deux sélecteurs Pays/Campus liés, deux fiches Paris et finition des listes de langue sont maintenant ajoutés. Les anciennes compositions sont préservées. Le parcours représentatif, les captures, contrôles et limites sont consignés dans [le nouveau point de synchronisation](content-preview-handoff.md) et [son relevé](content-preview-state.json). Les listes de langue passent de 140 à 148 px de haut (trois lignes de 42 px et 4 px entre elles) ; la page compte désormais 65 cadres de parcours. Les chiffres de 47 cadres et 140 px ci-dessous décrivent l’étape précédente.

**Complément du 28 septembre :** Parcours et Journal possèdent maintenant leurs listes FR ordinateur/mobile, avec les quatre contenus fictifs déjà présents dans le site. Les menus relient les rubriques depuis les quatre accueils LTR et entre les huit pages. Les quatre nouvelles compositions sont examinées et leurs destinations auditées ; la page compte 69 cadres, sans suppression. Voir [le complément détaillé](content-preview-handoff.md#complément-du-28-septembre).

## Report réalisé

Le site `site/` est la source de la composition et des nouvelles commandes. Les huit accueils ont reçu le globe sans grille historique, les deux thèmes, la sélection teintée du menu, le filtre séparé au-dessus du globe et les quatre commandes de carte. Le mobile possède sa composition propre avec globe centré et barre basse arrondie. Les IDs des destinations sont conservés.

| Format | Connecté | Visiteur |
| --- | --- | --- |
| Ordinateur LTR, 1440 × 960 | `115:4` | `119:178` |
| Mobile LTR, 390 × 844 | `123:162` | `125:198` |
| Ordinateur RTL | `125:243` | `125:296` |
| Mobile RTL | `125:349` | `125:402` |

La [bibliothèque Welcome](welcome-library-notes.md) comprend navigation, boutons, filtre, commandes et géographie vectorielle, avec variables de couleur et styles liés aux modes existants. Les anciens composants restent conservés. La navigation possède 16 variantes et **48 transitions Smart Animate de 0,48 s** entre rubriques ; les onglets déjà sélectionnés restent sans action. Le dé suit le turquoise clair et le rose sombre ; le filtre utilise Medium en clair et Regular en sombre.

**Dix listes de langues ancrées**, sur les deux entrées et les huit accueils, remplacent les popups centrés. Dimensions 176 × 140, trois choix FR/EN/AR, indicateur de sélection et fermeture après choix. Les anciens popups sont conservés sans appelant sur le parcours actif. La page compte **47 cadres de parcours au premier niveau : 37 initiaux + dix overlays**.

**Entrée n°22 native :** double scan à l’arrivée (3,65 s), puis message chiffré au repos. Après confirmation simulée : déchiffrement seul (3,15 s), maintien du slogan (1,3 s), phrase vers logo 42 (0,6 s), tracé du cercle (0,8 s) et agrandissement vers le globe réel de l’accueil (1,2 s). Le 42 rejoint l’en-tête et les commandes apparaissent pendant le raccord. Le visiteur évite déchiffrement et slogan. Les quatre cadres de naissance existants sont réutilisés ; leurs anciens enfants sont conservés masqués.

La **règle V8** reste active : ligne arabe partout en AR, en EN si région de connexion simulée `Arab world`, jamais en FR. Le campus ne commande pas sa visibilité. Brand/42 et Brand/Horizon sont réutilisés, sans inverser le symbole ni la géographie. Jost et Noto Sans Arabic restent les familles Figma ; la région et l’authentification sont simulées.

## Preuves et contrôles

| Élément | Relevé durable |
| --- | --- |
| Huit accueils | [Premier lot](welcome-frames-state.json), [deuxième lot](welcome-batch-2.json), [troisième lot](welcome-batch-3.json) |
| Bibliothèque, styles et tokens | [Ledger bibliothèque](welcome-library-state.json), [finitions appliquées](welcome-polish-result.json) |
| Dix listes de langues / 60 actions | [Ledger langues](language-menu-state.json) |
| Entrée, phases et routes | [État d’entrée](entrance-sync-state.json), [audit des réactions](entrance-route-audit.json) |
| Animations examinées | [Cinq vidéos et planches](entrance-proof/README.md) |
| Géographie source | [Projection](welcome-assets/projection-verification.json), [assets](welcome-assets/README.md) |

Les huit accueils sont contrôlés ; les captures de référence couvrent ordinateur/mobile FR clair et AR sombre. Les modes temporaires sont restaurés après les contrôles. La bibliothèque a aussi été examinée en composition FR claire / AR sombre, avec correction des fonds SVG invisibles et vérification des polices.

Dans le navigateur Figma, le parcours ciblé **accueil `115:4` FR clair → liste ancrée → AR `125:243` → thème sombre → Projets** a été joué. Le changement de route et le déplacement de la sélection sombre sont confirmés. Les autres combinaisons sont couvertes par les relevés structurels et les captures, sans prétendre que tous les parcours ont été joués.

Les exports natifs montrent le double scan mobile, le slogan encore visible à 1,2 s, la transition vers le 42, puis le cercle devenant le globe en ordinateur FR clair et mobile AR sombre. Les réactions et timings de quatorze cadres sont audités ; les quatre contrôles du plan passent. **Le parcours connecté mobile FR clair a été rejoué dans le navigateur Figma** : arrivée `123:145`, scan, Se connecter, panneau de simulation, confirmation, déchiffrement `128:371`, nouvel accueil `123:162`, puis sélection Projets dans la barre basse. Le parcours visiteur final et la matrice complète n’ont pas été rejoués.

## Limites du report

- Le globe Figma est une représentation vectorielle figée. Rotation, zoom Monde/Pays/Campus, calcul des 58 campus, visite aléatoire réelle, préchargement et cache WebGL restent exécutés par le site.
- Les assets de niveau Pays préparés, dont la France, ne sont pas insérés dans le parcours. Les vues Campus et les contenus des rubriques ne sont pas portés. La navigation Figma anime la sélection, sans ouvrir ces contenus.
- Les glyphes monospace utilisent Cousine ; le scanner est échantillonné à 50 ms. Une confirmation Figma pendant le scan commence immédiatement le déchiffrement, alors que le site attend la fin du scan.
- Les vidéos valident les phases visibles ; elles ne mesurent ni FPS, ni temps de chargement, ni comportement sur téléphone physique. Le sélecteur de thème Figma historique est conservé.

Le site a reçu en parallèle le candidat aléatoire préchargé, la liste de langues ancrée et les voyages entre campus plus doux : **116 tests** au relevé v18, puis **144 tests** au contrôle de clôture après les nouvelles phases d’entrée. Ces nombres concernent le web et doivent être distingués des contrôles Figma. Les derniers parcours web consignent Urduliz ordinateur FR clair, Firenze mobile sombre et les entrées AR/FR sombres, avec un canvas, sans débordement ni erreur dans la session. Les [notes web](../../site/notes/NOTES.md) et [mesures](../../site/notes/PERFORMANCE_NOTES.md) restent la référence applicative.

## Repères pour une prochaine intervention

Lire AGENTS.md, PROJECT_CONTEXT.md et les relevés concernés, puis inspecter les nœuds actuels avant toute mutation. Les scripts de bibliothèque sont des transactions historiques, pas des migrations idempotentes à rejouer. `entrance-sync-build.mjs` cible désormais le patch additif `entrance-sync-refine.mjs` ; l’ancien constructeur est protégé contre une reconstruction de l’entrée existante.

Les collections restent Couleurs `VariableCollectionId:3:3` (Clair `3:1`, Sombre `3:2`) et Langues `VariableCollectionId:95:2` (FR `95:0`, EN `95:1`, AR `95:2`). Les cadres RTL imposent AR. Brand/42 `15:2` et Brand/Horizon `171:6` restent les sources d’identité. Le symbole 42 possède une boîte de sécurité : contrôler son dessin visible, pas seulement sa boîte.

**Trace de la préparation initiale :** avant reprise, l’audit trouvait huit anciens accueils et une bibliothèque de 207 variables, cinq collections, 21 familles et 23 icônes. Aucune mutation n’avait été effectuée pendant cette préparation suspendue ; ces totaux sont historiques. Le [relevé source initial](welcome-sync-spec.json), fondé sur CSS `nav-filter-16` et moteur v17, est conservé comme référence de départ et ne représente pas toutes les demandes ajoutées pendant la synchronisation. Aucune publication n’a été demandée.
