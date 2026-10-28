# Fiches campus — réalisation du 5 octobre 2026

Les sections du 5 octobre ci-dessous décrivent leur état historique. La [suite du 8 octobre](#suite-du-8-octobre-2026--identité-gestes-et-deux-fiches-documentées) précise les demandes suivantes, la réalisation actuelle et la portée des nouveaux contrôles.

## Choix et précision utilisateur

L’utilisateur choisit d’abord la première proposition : un panneau progressif, latéral sur ordinateur et extensible sur mobile. Une première version avec des contenus liés est réalisée et contrôlée, puis il précise les informations attendues : nom, pays, photos, adresse, contacts, site officiel, itinéraire, date d’ouverture et prochaines Piscines. Il ajoute ensuite des statistiques du campus. Cette liste remplace le contenu éditorial proposé ; le panneau progressif reste retenu.

## État actif

La fiche suit cette liste avec une galerie et ses crédits, une adresse copiable, des contacts cliquables, un site résolu selon la langue, un itinéraire Google Maps, une date d’ouverture, trois indicateurs étudiants/promotions/alumni et un calendrier. Elle existe en FR/EN/AR, avec disposition RTL et thèmes clair/sombre. Sur ordinateur, le panneau de 480 px se place au bord de l’écran ; sur mobile, le volet de 74svh peut s’étendre jusqu’à la hauteur de l’écran moins 20 px. La fermeture ou la touche Échap conserve la carte.

Les valeurs absentes sont indiquées explicitement, jamais remplacées par zéro ni par les comptes des contenus fictifs. Chaque statistique pourra recevoir une date et une source. Les dates de Piscines terminées sont exclues, les sessions en cours sont marquées ; une année d’ouverture seule n’acquiert pas de jour ou de mois inventé.

Paris est l’exemple enrichi de cette itération : deux photos du site officiel, trois contacts, l’année 2013, deux sessions à l’hiver 2027 et une note sur l’été annoncé sans jours précis. Les statistiques restent non renseignées. Les 57 autres campus gardent leur identité, leur pays, leur adresse, leur site et leur itinéraire, avec des sections à compléter. Voir le [relevé et la couverture](CAMPUS_PROFILES_SOURCES.md). Les calendriers ne sont pas synchronisés automatiquement.

## Sources et versions

- campus-details.mjs?v=5 ; campus-details.css?v=6 ; campus-profiles.json?v=1.
- welcome.mjs?v=campus-profile-57 ; content-preview.mjs?v=25.
- Le marqueur appelle le même composant depuis Explorer et la fenêtre campus d’un article ; le moteur de carte v30 reste inchangé.
- Fiche initiale, avant le panneau : archive/pre-progressive-campus-20261005/.
- Panneau intermédiaire avec les contenus liés : archive/progressive-campus-related-20261005/. Ses modules, styles, contrôleur, tests et notes restent consultables ; 28 tests passaient avant son remplacement.
- Les autres études sont intactes. Aucun report Figma n’est demandé pendant cette itération.

## Vérifications

31 tests passent : 15 pour la fiche, 8 pour la résolution des liens et 8 pour la session de carte. Ils couvrent l’appel réel du contrôleur welcome vers la fiche Paris en FR/EN/AR, les photos locales, les contacts et leur source, l’année 2013, les dates contrôlées avec une horloge fixe, l’exclusion des sessions terminées, la navigation dans la galerie, la copie native et un cas d’échec simulé, l’affichage des statistiques absentes par un tiret et la conservation d’un véritable zéro.

Chrome : le panneau latéral de Paris est examiné sur ordinateur en clair, avec la galerie 1/2 → 2/2, le défilement interne et sa croix persistante, l’adresse, les contacts, les liens, l’ouverture, les statistiques et les Piscines. Le volet précédent a été déployé en 390 × 844, en clair puis en arabe sombre ; la copie d’adresse a réussi et le lien de Paris s’est replié vers l’anglais. Les contrôles finaux sur petit écran seront consignés ci-dessous.

Aucun contrôle sur téléphone physique ou avec un clavier virtuel, aucune publication ni modification Figma. Les données de 57 campus et les statistiques réelles restent à renseigner ; la fonctionnalité d’affichage ne les invente pas.


### Vérification finale sur petit écran

Dans Chrome, Paris en arabe sombre320×640 : volet déployé à300×620px, marges10px, aucun débordement horizontal du document ni du panneau. Photos chargées àla demande, contacts et sources, chiffres non renseignés, dates et note de calendrier examinés. La croix reste visible après1441px de défilement interne. L’ordre du compteur de galerie est isolé enRTL. Lyon vérifie les rubriques non renseignées et son itinéraire fondé sur son adresse. L’ouverture d’une nouvelle fiche réinitialise sa lecture en haut ; cette correction évite de retrouver la position de la fiche précédente.

Le serveur local, trouvé arrêté lors de la dernière actualisation, est relancé au port8765. L’aperçu principal est actualisé et le parcours visiteur rejoué. Aucun changement de données Intra ni envoi de message externe.

Dernier contrôle dans l’accueil principal, version57 : fiche Paris défilée de1067px, fermeture puis réouverture → scrollTop0 ; titre «Le campus en chiffres», CSSfiche6/en-tête2 et un seul canvas confirmés. La fiche Paris reste ouverte pour examen dans l’onglet principal.

## Suite du 8 octobre 2026 — identité, gestes et deux fiches documentées

### Demandes et réalisation

L’utilisateur remplace l’en-tête visible « Le Campus » par un emplacement pour le logo officiel, suivi des photos, de l’adresse/localisation et des contacts. Il déplace Itinéraire dans Adresse, retire l’indication visible « S’ouvre dans un nouvel onglet » et conserve la structure à partir de Date d’ouverture. Il demande ensuite de retirer le bouton de déploiement mobile au profit du geste du doigt, puis de réduire l’action Itinéraire et de renseigner deux fiches, Paris et Mulhouse.

La fiche suit cet ordre. Le titre du dialogue reste disponible aux technologies d’assistance sans apparaître au-dessus du logo. Le modèle `profile.logo` accepte une source locale, un texte alternatif et une surface claire ou sombre. En attendant le chargement, en l’absence de logo ou en cas d’échec, le nom officiel du campus reste écrit en tête ; il est masqué seulement après le chargement effectif de l’image. Les logos officiels blancs de Paris et Mulhouse utilisent une surface sombre, sans recoloration. Pays, crédits des photos, sources et résolution du site selon la langue restent disponibles.

Sous l’adresse, **Copier l’adresse et Itinéraire** partagent une rangée compacte, avec retour à la ligne si nécessaire. Itinéraire utilise le nom et l’adresse de la fiche dans Google Maps. Le site officiel reste avec les Contacts. Le texte visible signalant le nouvel onglet est retiré ; les indications accessibles des autres liens externes restent dans leurs noms. Ouverture, chiffres et prochaines Piscines conservent leur ordre.

Sur mobile jusqu’à 700 px, `campus-sheet.mjs` pilote le volet tactile entre **74svh** et la hauteur disponible moins **20 px**. Un glissement vers le haut l’accompagne jusqu’au déploiement ; un glissement vers le bas le replie quand la lecture commence en haut. Après avoir défilé le contenu, le geste garde le défilement natif ; un nouveau geste depuis le haut peut ensuite replier. La poignée reste utilisable depuis toute position de lecture. Les liens, boutons de galerie, champs, mouvements horizontaux et gestes multipoints ne sont pas interceptés. Les gestes annulés, la fermeture, le redimensionnement et le démontage nettoient la hauteur temporaire. Aucun bouton « Déployer la fiche » ne subsiste. Les transitions respectent la préférence de mouvement réduit.

### Données officielles et états inconnus

Le [relevé de provenance actualisé](CAMPUS_PROFILES_SOURCES.md) détaille les URL officielles, ressources, contacts, dates et limites. `campus-profiles.json` renseigne maintenant **Paris et Mulhouse**, avec date de consultation du 8 octobre :

- **Paris** : signe 42 officiel, deux photos conservées, adresse et trois courriels confirmés, ouverture 2013, **5 000+ étudiants en 2025**, deux Piscines datées à l’hiver 2027 et note sur l’été annoncé sans jours précis.
- **Mulhouse** : logo 42 Mulhouse Grand Est, quatre photos officielles, adresse KMØ, courriel général, téléphone public, contact accessibilité et formulaire, ouverture novembre 2021, **413 étudiants en 2024**. Les deux Piscines publiées de 2026 sont terminées au 8 octobre ; la fiche l’explique sans inventer de session suivante.

Les effectifs sont des chiffres historiques datés, pas des compteurs en direct. Le PDF de Mulhouse ne précise pas actif ou cumulé. **Les totaux de promotions et d’alumni restent non renseignés dans les deux fiches**, faute de chiffre officiel fiable établi par le relevé. Les 56 autres campus gardent les informations du catalogue et les états à compléter. Aucun compte Intra, calendrier synchronisé ni publication distante ajouté.

### Préservation

Les étapes restent consultables avec leurs sources :

- [Fiche avant le nouvel en-tête et les gestes](../../archives/site-versions/pre-campus-logo-sheet-20261008/preview.html) ;
- [premier emplacement de logo](../../archives/site-versions/campus-logo-placeholder-20261008/preview.html), avant le repli textuel et les logos officiels ;
- [premier Itinéraire dans Adresse](../../archives/site-versions/campus-full-width-directions-20261008/preview.html), avant son format compact ;
- [relevé initial des données](../../archives/site-versions/pre-campus-profile-sources-20261008/CAMPUS_PROFILES_SOURCES.md).

Les deux états du 5 octobre et toutes les autres études restent conservés. Les versions d’import consignées plus haut sont historiques ; les entrées web actuelles portent leurs nouveaux paramètres de cache.

### Vérifications acquises et limites au 8 octobre

La **première passe de structure**, avant l’ajout des vrais logos, des nouvelles données et des actions compactes, est examinée dans Chrome en français clair **1 280 × 900** et **390 × 844**, puis en arabe sombre **320 × 640** : aucun débordement horizontal relevé, ordre logo/photos/adresse/contacts, absence du bouton Déployer, galerie Paris 1/2 → 2/2 et copie de l’adresse confirmés. Ces contrôles ne sont pas attribués au dernier rendu enrichi.

Le banc navigateur utilise le composant et ses styles dans un cadre mobile **390 × 640**. **Sept scénarios de gestes synthétiques passent** : montée de 473,6 à 620 px avec état intermédiaire à 553,6 px, descente de 620 à 473,6 px, défilement natif non empêché, poignée après lecture, annulation, fermeture/réouverture et bouton photo exclu du geste. **Dix tests unitaires du contrôleur tactile passent**, couvrant également gestes horizontaux/multipoints, petites distances, changement de format et nettoyage des événements. Ces événements de test ne remplacent pas un essai au doigt sur téléphone physique.

Les recherches officielles, la validité des données et l’intégrité des six photos/deux SVG sont vérifiées séparément, comme détaillé dans le relevé des sources. Le contrôle visuel final des logos dans la fiche, des actions compactes et de Mulhouse reste à consigner après leur examen par l’agent principal. Aucun téléphone physique, clavier virtuel, nouveau report Figma ni publication revendiqué.

### Addendum visuel final — 8 octobre 2026

Dernière fiche contrôlée dans Chrome à 320 × 640 : logo officiel de Paris blanc sur graphite, photo chargée, adresse puis deux boutons compacts alignés, Contacts. Même format pour Mulhouse : logo 42 Mulhouse Grand Est, KMØ et galerie jouée jusqu’à 4/4. Données accessibles contrôlées : quatre contacts, ouverture en novembre 2021, effectif de 413 daté de 2024, note de Piscines sans date future inventée. Les libellés de nouvel onglet restent accessibles mais ne sont plus visibles.

Un débordement réel de 5 000+ à 320 px a été trouvé : taille désormais relative à la largeur de chaque tuile (`clamp(18px,30cqi,28px)`), état précédent conservé dans `archives/site-versions/campus-stat-sizing-20261008`. Nouvelle capture examinée : nombre entier dans sa tuile, sans chevauchement. CSS 10 dans les deux entrées. Le cycle fermeture/réouverture et retour de la carte vers le projet ont été rejoués. Aucun nouveau geste sur téléphone physique ; les preuves synthétiques ci-dessus gardent cette limite.

Revue indépendante finale : aucun défaut fonctionnel concret ; 41 fichiers de tests actifs passent. Les sources individuelles des contacts de Mulhouse sont présentes dans les données et le relevé de sources ; l’interface affiche encore une source commune au bloc Contacts.

### Précision du 8 octobre — molette et pavé tactile sur ordinateur

L’utilisateur signale que faire défiler la fiche ne lui rend pas toute la hauteur auparavant obtenue avec le bouton. Il précise ensuite utiliser **la molette ou le pavé tactile sur ordinateur**, avec la disposition mobile. Le défaut est reproduit dans Chrome à 320 × 640 avant correction : la fiche reste à 473,59 px de haut pendant que sa lecture passe de 271,33 à 591,33 px. Le contrôleur ne traitait jusque-là que les événements tactiles ; le petit déplacement de la poignée ne prouvait donc pas le déploiement du panneau.

Le contrôleur reçoit désormais les événements de molette jusqu’à 700 px. Faire défiler vers le bas agrandit progressivement **toute la fiche** de 74svh à la hauteur disponible moins 20 px, puis laisse la lecture native continuer. Revenir vers le haut pendant la lecture garde cette lecture native pendant toute la séquence ; **une nouvelle séquence depuis le début du contenu** peut replier le panneau. Une pause de 180 ms délimite les séquences de molette/pavé tactile. Les deltas en lignes/pages sont normalisés ; les mouvements horizontaux, le zoom par pincement avec Ctrl, les champs et les contrôles vidéo restent natifs. Les hauteurs CSS retenues sont conservées.

La poignée accepte aussi le glissement à la souris ou au stylet, y compris après lecture, avec capture puis libération du pointeur. Les boutons photo marqués `data-campus-sheet-swipe` peuvent amorcer un glissement tactile vertical : le clic consécutif à ce glissement est bloqué, tandis qu’un simple toucher continue à ouvrir la photo. Les autres liens et boutons conservent leur exclusion du geste tactile. Le lecteur de médias utilise un dialogue séparé, ajouté au document : ses événements ne traversent pas le dialogue campus. Fermer ou démonter la fiche ferme aussi son lecteur de médias et nettoie gestes, captures et temporisations.

Le module `campus-sheet.mjs?v=2` et **18 cas de tests ciblés** couvrent l’expansion, le relais vers la lecture, le retour au début sans repli prématuré, l’annulation, les boutons média, la poignée souris/stylet et les nettoyages. Syntaxe et vérification d’espaces passent. Le [contrôleur tactile précédent et ses tests](../../archives/site-versions/pre-campus-sheet-inputs-20261008/README.md) restent conservés avec leurs empreintes. **Le rejeu navigateur de cette correction est encore à consigner par l’agent principal** ; ces contrôles automatisés ne revendiquent pas un essai sur téléphone physique.

### Rejeu Chrome après correction de la molette — 8 octobre

L’agent principal joue la fiche Mulhouse dans Chrome à **320 × 640** avec la molette : toute la fiche s’agrandit, avec **10 px en haut et 10 px en bas**, puis le mouvement suivant fait défiler son contenu. Le retour au début dans la même séquence conserve la grande hauteur ; une nouvelle remontée replie ensuite la fiche, dont le bord supérieur revient à **156 px**. Les captures confirment le déplacement du panneau entier.

La photo ouvre le lecteur séparé en **1/4**, puis Suivant affiche **2/4**. Échap ferme seulement ce lecteur et rétablit le focus sur la photo, sans fermer la fiche campus. Ces contrôles complètent les gestes synthétiques et la revue indépendante du contrôleur, qui ne relève pas de défaut concret. Ils concernent le navigateur de bureau redimensionné ; aucun téléphone physique n’a été utilisé. Les autres contrôles des médias sont consignés dans [les notes du lecteur partagé](MEDIA_VIEWER_NOTES.md#contrôles-chrome-du-8-octobre).

Contrôle automatisé final après raccord des caches et des derniers libellés arabes : les **43 fichiers de tests actifs passent**, sans échec. Versions campus : module **9**, CSS **11**, gestes **2** ; lecteur média **1**, contrôleur principal **media-members-98** / aperçu **66**. La revue finale de l’intégration ne relève pas de défaut concret dans le nettoyage à la fermeture ou au remplacement de fiche.


### Flèches de galerie fixes — 8 octobre 2026

L’utilisateur signale que la flèche gauche se déplace selon le numéro de photo et précise qu’il parle des fiches campus. Défaut reproduit sur Paris : le compteur proportionnel passe de 25,61 à 27,04 px entre 1/2 et 2/2, déplaçant la flèche gauche d’environ 1,43 px. Le compteur réserve désormais une largeur calculée une seule fois selon la longueur localisée du total, avec texte centré et sans réduction flex. L’isolation gauche→droite du compteur en arabe reste en place ; le nombre de chiffres du total détermine la place réservée aux galeries plus longues.

Chrome : Paris 1/2 → 2/2 → 1/2, ordinateur et 320 × 640 ; abscisses des deux flèches identiques à chaque étape, compteur stable à 35,99 px. À 320 px, les boutons restent à x148,68 / x242. Mulhouse en arabe au même format : 1/4 → 2/4 → 3/4 → 4/4 → 1/4, abscisses stables x40,67 / x133,99. Rendus ordinateur français et mobile français/arabe examinés. Le défilement nécessaire pour amener les commandes à l’écran ne constitue pas le défaut horizontal corrigé. Test existant `campus-details.test.mjs` passé et revue indépendante sans défaut concret. Aucun essai sur téléphone physique ni galerie réelle à dix images ; ce dernier cas est pris en charge par le calcul, sans contrôle visuel revendiqué.

Sources précédentes et empreintes conservées dans [l’archive du compteur](../../archives/site-versions/pre-fixed-campus-photo-controls-20261008/README.md). Imports actifs : campus module10/CSS12, contrôleur `fixed-campus-photo-controls-101`, aperçu69. Format habituel et français clair rétablis, fiche Mulhouse ouverte. Travail local uniquement ; version du projet 0.0.1 pré-alpha maintenue.
