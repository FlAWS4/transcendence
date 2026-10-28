# Fiches campus — réalisation du 5 octobre 2026

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
