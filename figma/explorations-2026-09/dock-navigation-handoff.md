# Report Figma — dock commun et globe centré

Date : **4 octobre 2026**. Demande explicite de l’utilisateur : reprendre **l’agencement de la première étude**, puis précision **aucun changement de couleurs ou de style**. Les trois études locales et les anciennes explorations Figma restent des archives conservées.

[Accueil ordinateur](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=115-4) · [Accueil mobile](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=123-162) · [Page Projets](https://www.figma.com/design/yFrdllVm6nrKZJ2c99MMjT?node-id=328-4892).

## Réalisation

Les **huit accueils** et **huit pages de contenu** de la page `115:2` sont réagencés avec leurs IDs conservés. La page compte toujours **71 cadres**. Aucun ancien écran ni exploration n’est supprimé.

- Dock flottant identique entre Explorer et les contenus : bureau **510 × 78**, position **465,860** dans 1440 × 960 ; mobile **350 × 78**, position **20,744** dans 390 × 844. Les huit pages de contenu conservent le dock fixe au défilement.
- Le dock bureau réemploie les icônes, fonds, contours, variables et métriques typographiques du dock mobile existant. Nouveau jeu dérivé `Welcome/Dock/Desktop` (`383:1488`) ; la bibliothèque historique reste intacte.
- Globe vectoriel actuel recentré : diamètre visible **448**, centre **720,470** sur ordinateur ; diamètre **331**, centre **195,384.5** sur mobile. Les repères sont repositionnés avec leurs dimensions et textes existants conservés.
- Filtre centré à **y130 / y107** ; même emplacement dans Explorer et les rubriques. Emplacement du symbole de **32 × 32** : icône d’origine dans Explorer, réduction du globe existant dans les contenus. Le médaillon ne remplace ni un pays ni un campus dans le chemin.
- Contenu ordinateur élargi à **1240** et centré à **x100** ; mobile conservé à **x24**, largeur 342. Les cartes ont une version dérivée de 606 px ; les alias de traduction, illustrations vectorielles et liens des instances sont conservés. Les images vectorielles changent de taille avec leur contenant, sans nouvelle direction graphique. Typographie UI inchangée.
- Identité 42/HORIZON, Jost, Noto Sans Arabic, couleurs, thèmes et illustrations existants conservés. Aucune variable ni style partagé n’a été recoloré ou redéfini.
- Les huit copies d’accueil utilisées par les quatre raccords natifs n°22 reçoivent la géométrie finale correspondante. Durée de 1,2 s conservée ; cercle initial de 200 px bureau / 174 px mobile, arrivée centrée, sans glissement horizontal vers l’ancienne colonne latérale. Calques historiques masqués conservés.

## Vérifications

Audit API : seize cadres présents, **39 destinations de réactions existantes**, aucune destination absente ; alias de traduction des cartes maintenus ; huit docks de contenu fixes ; aucun remplissage image dans ces seize cadres, UI et géographie toujours éditables. Les overlays de filtres restent centrés et leurs réactions d’ouverture sont conservées. La fenêtre campus et les listes de langues gardent leur fonctionnement antérieur.

Captures examinées : accueil et Projets FR ordinateur ; accueil et article FR mobile ; accueils AR sombre ordinateur/mobile ; Projets EN ordinateur ; article FR sombre ordinateur. Aucun chevauchement nouveau constaté entre globe, filtre, commandes et dock sur ces rendus. Les modes temporaires de capture sont rétablis.

Preuves persistantes : [FR ordinateur](dock-proof/home-fr-desktop.png), [AR sombre mobile](dock-proof/home-ar-dark-mobile.png), [Projets FR ordinateur](dock-proof/projects-fr-desktop.png), [FR mobile](dock-proof/home-fr-mobile.png), [AR sombre ordinateur](dock-proof/home-ar-dark-desktop.png). Le détail des IDs, mutations et audits est dans [dock-navigation-state.json](dock-navigation-state.json).

## Limites conservées et vérification non effectuée

La maquette reste vectorielle et statique : aucun globe WebGL libre ni quartier interactif ajouté. Les huit pages de contenu restent des compositions LTR existantes avec variables FR/EN/AR ; elles ne constituent pas huit nouveaux écrans RTL. Les accueils RTL conservent leur changement de sélection du dock, sans nouveau parcours de contenus arabes ajouté.

Les interactions n’ont pas été rejouées dans le lecteur Figma durant ce report. Les raccords sont contrôlés par leur géométrie et leurs images clés ; aucune nouvelle vidéo n’a été exportée. Les descendants des copies RTL conditionnellement cachées n’ont pas pu être inspectés dans le contexte de lecture final ; les accueils RTL finaux, eux, ont été examinés en sombre.

Un lot complémentaire visant à désactiver des réactions transitoires et remplacer le symbole de ces copies RTL a été refusé par le contrôle automatique : « L’action modifie des réactions interactives et remplace des composants Figma, dépassant la demande explicite de ne changer que l’agencement. » Ce nettoyage facultatif est **abandonné**, sans contournement ni nécessité d’autorisation pour terminer l’agencement demandé. Le lot refusé n’est pas compté comme réalisé. Aucun défaut visible de l’accueil final n’est déduit de cette limite.

Ce report réalise le choix d’agencement ; il ne signifie pas une nouvelle acceptation des couleurs ni une validation esthétique globale. Aucun fichier de navigation-studies n’est modifié par cette adaptation Figma.

## Correction éditoriale — 4 octobre 2026

À la demande de l’utilisateur, la phrase de la première étude remplace la consigne de manipulation : **« Le réseau, à portée de main. »**. La seule variable modifiée est `i18n/welcome/hint` (`VariableID:264:75`) : FR « Le réseau, à portée de main. », EN « The network, within reach. », AR « الشبكة في متناول يدك. ». Les huit accueils et huit copies de raccord utilisent déjà cette variable partagée.

Valeurs et seize liaisons contrôlées par API ; captures FR ordinateur et AR mobile examinées. Jost / Noto Sans Arabic Regular 14 px et les règles d’auto-layout existantes sont conservés ; seule la largeur naturelle du texte suit sa nouvelle longueur. Aucune position, couleur, police, réaction, page de contenu ou archive d’étude n’a été modifiée manuellement. Les captures persistantes du report d’agencement ci-dessus précèdent cette correction de texte.

## Statistiques à la place de la phrase — 4 octobre 2026

L’utilisateur préfère finalement **« 58 campus · 30 pays »** : ce choix remplace la phrase consignée juste au-dessus, dont l’historique est conservé. La même variable `i18n/welcome/hint` affiche FR « 58 campus · 30 pays », EN « 58 campuses · 30 countries », AR « 58 فرعًا · 30 دولة » dans les huit accueils et huit copies de raccord. Les nombres correspondent au catalogue actuel ; ils restent des valeurs de maquette Figma, tandis que le site les calcule depuis son catalogue.

Seules les trois valeurs textuelles ont changé. API : seize textes actualisés, Jost / Noto Sans Arabic Regular 14 px, hauteur21px conservés. Captures du bloc FR ordinateur et AR mobile examinées. Couleurs, règles de disposition, réactions et archives inchangées ; la largeur naturelle du texte continue de suivre l’auto-layout existant.
