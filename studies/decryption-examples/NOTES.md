# Parcours de recherche — vingt-deux animations de déchiffrement

Dernière mise à jour : **27 septembre 2026**. Décision explicite de l’utilisateur du 14 septembre : conserver tous les essais comme archive pour montrer le parcours de recherche. **La suppression initialement prévue est annulée.**

**Choix actuel — 27 septembre 2026 :** l’utilisateur retient explicitement le [n°22, scanner à résolution aléatoire](scanner-return-random.html), dans son état courant : départ simultané des lettres à 3 650 ms, puis résolutions dans un ordre pseudo-aléatoire de 6 050 à 6 650 ms. Cette décision remplace la sélection du n°20 du 16 septembre. Elle concerne l’animation visuelle ; l’intégration au prototype principal, au parcours complet et à Figma reste à réaliser. Tous les essais restent conservés.

**Historique du choix précédent :** le 16 septembre 2026, l’utilisateur avait retenu le [n°20, scanner vertical aller-retour](scanner-return.html), avec l’onde progressive corrigée le 15 septembre. Le 27 septembre, il demande deux variantes : démarrage du déchiffrement simultané sur tous les caractères, puis résolution légèrement décalée de gauche à droite pour le [n°21](scanner-return-ordered.html), ou dans un ordre aléatoire pour le [n°22](scanner-return-random.html). Les deux essais sont réalisés séparément, puis le n°22 est choisi. Le n°20 reste intact comme base de comparaison et trace de la recherche.

## Parcours de recherche

1. Première exploration : quatre propositions séparées pour comparaison — rouleaux, panneaux basculants, onde et terminal. Leur suppression après comparaison était alors demandée.
2. Extension : l’utilisateur demande les quatre pistes supplémentaires proposées — tracé continu, profondeur, ruban et grille — ainsi que d’autres idées. Prismes, orbites, iris et ligne élastique portent la collection à douze.
3. Archivage : l’utilisateur remplace la consigne de suppression par une conservation durable de l’ensemble, pour garder la trace de cette recherche. Ce choix de conservation ne constitue pas une sélection d’animation pour le produit.
4. Recherche de fluidité : après la proposition de découpes obliques, du tissage et de la lentille, l’utilisateur répond « ok », puis « fais les autres aussi ». Les trois pistes sont donc réalisées séparément, sans remplacer les douze premières. Leur réalisation n’est pas une acceptation du résultat visuel final.
5. Scanner et défilement : l’utilisateur précise ensuite une nouvelle piste avec deux balayages successifs, binaire → hexadécimal puis hexadécimal → caractères encore chiffrés, suivis d’un déchiffrement façon hacker avec caractères qui défilent. Le seizième essai répond à cette demande sans remplacer l’onde initiale ni les trois nouveaux rendus.

6. Correction du défilement : l’utilisateur demande des changements rapides de caractères sur place, puis précise que la référence est **le troisième essai, l’onde de déchiffrement**. Le n°17 (`scanner-scramble`) changeait presque toutes les lettres ensemble et a été explicitement refusé. Le n°18 (`scanner-wave`) reprend la cascade rapide du n°3 après les deux scans. Les n°16 et 17 restent conservés comme versions précédentes. Cette correction ne vaut pas acceptation du n°18.

7. Synchronisation : l’utilisateur demande que le déchiffrement se fasse en même temps partout et que les traits sous les lettres soient retirés. Le n°19 conserve les scans et la cadence rapide du n°18, mais partage une seule progression entre tous les caractères. Le n°18 reste conservé comme version précédente.

8. Aller-retour vertical : l’utilisateur demande une version identique au n°19, avec un scanner vertical sur toute la largeur du texte et un seul aller-retour à la place de deux scans distincts. Le n°20 ajoute cette comparaison ; le n°19 reste disponible comme piste actuelle.

9. Durée finale — **15 septembre 2026** : l’utilisateur trouve le déchiffrement final des n°19 et 20 trop rapide. Les deux pages existantes passent de 650 ms à **1 800 ms**, sans nouveau numéro. Leurs sources initiales sont conservées séparément pour restituer l’état du 14 septembre.

10. Onde progressive — **15 septembre 2026** : l’utilisateur corrige ensuite le déchiffrement simultané et demande une progression comme une onde. Les pages n°19 et 20 passent à **1 200 ms par lettre**, avec des départs décalés sur **1 800 ms**, toujours sans traits. L’étape simultanée à 1 800 ms reste archivée ; les vingt numéros sont conservés.

11. Sélection — **16 septembre 2026** : « On va partir sur le numéro 20 ». Le scanner vertical aller-retour avec l’onde progressive est retenu pour la suite de 42 Horizon. Le journal de bord est complété à la demande de l’utilisateur depuis sa dernière entrée, sans réécrire les passages antérieurs. Les vingt essais et leurs états intermédiaires archivés restent conservés. Cette étape est documentaire ; aucune intégration ni nouveau contrôle navigateur.

12. Départ commun et résolutions décalées — **27 septembre 2026** : l’utilisateur souhaite modifier légèrement le n°20 et comparer deux ordres de résolution finale. Les nouveaux n°21 et 22 conservent son scanner vertical aller-retour ; toutes les lettres commencent à se déchiffrer à 3 650 ms, puis se fixent de 6 050 à 6 650 ms, de gauche à droite ou dans un ordre pseudo-aléatoire. La galerie passe à vingt-deux essais. Le n°20 et les étapes précédentes sont conservés sans modification. À cette étape de comparaison, avant la décision ci-dessous, aucune nouvelle sélection n’était encore exprimée ; aucune intégration au prototype principal n’est réalisée.

13. Sélection du n°22 — **27 septembre 2026** : l’utilisateur choisit explicitement la résolution aléatoire dans son état courant. Le n°22 remplace donc le n°20 comme animation retenue pour la suite. Les vingt-deux essais restent conservés, dont les n°20 et 21. L’enregistrement de ce choix est documentaire : aucune animation modifiée, aucun nouveau test et aucune intégration au prototype principal, au parcours complet ou à Figma.

## Série 3 — fluidité et esprit 42

Retour du **14 septembre 2026** : l’utilisateur apprécie certains essais et demande de nouvelles idées, plus fluides visuellement et dans l’esprit 42. Il n’a pas encore nommé ses variantes préférées.

La lecture du code relève des paliers collectifs entre les représentations et, dans plusieurs rendus, des accélérations/arrêts ou écrasements répétés pour chacune des 42 rotations. Cela peut expliquer la perception de coupures sans constituer une mesure de performance. Direction proposée : conserver un même geste et sa vitesse à travers binaire → hexadécimal → symboles → phrase ; garder la clé 42 dans le calcul sans imposer 42 arrêts visibles.

- **[Découpes obliques](diagonal.html)** : trois fragments diagonaux par caractère. Un même mouvement ouvre puis réunit les fragments à travers les trois conversions, avec des masques complémentaires et un fin accent turquoise dans l’encre. Les glyphes sont mis en cache ; les états au repos sont dessinés d’un seul tenant pour éviter les coutures d’anticrénelage.
- **[Tissage du code](weave.html)** : petits rubans de bits qui s’entrecroisent et se rassemblent progressivement en hexadécimal, symboles puis lettres ; lecture visuelle de la construction collective.
- **[Lentille](lens.html)** : trois passages optiques se chevauchent, réfractent les caractères et transforment les quatre représentations déjà mises en cache. Les frontières courbes des conversions accompagnent la déformation.

La [charte 42 locale](../../docs/42%20-%20Charte%20graphique%202024.pdf), pages 3, 17–18 et 37, a été relue et examinée visuellement : valeurs de marque, noir/blanc, couleurs secondaires et interface épurée/dynamique. Les mouvements ci-dessus sont des interprétations proposées par l’assistant, pas des animations officielles tirées d’une charte de mouvement. Les douze rendus archivés restent inchangés. À cette étape du 14 septembre, les nouvelles pistes sont autorisées comme essais ; aucun résultat n’est encore accepté pour le produit.

Ces trois essais calculent réellement le texte final par `decode(octetsChiffrés, KEY)` avec la clé 42 du moteur partagé. Ils montrent binaire → hexadécimal → `ru%43t 9xu s4tu` → `BEYOND THE CODE`, sans afficher les 42 positions intermédiaires. Les espaces restent des séparations de mots dès le départ. La chronologie de présentation est propre à chaque rendu, sur la durée commune de 6,8 s ; le moteur et les anciennes animations ne changent pas.

## Série 4 — scanner, puis recherche de la révélation finale

### N°16 — défilement vertical, version précédente

Le [scanner et le défilement](scanner-flow.html) suivent l’ordre explicitement demandé. La composition reste fixe ; une seule ligne verticale traverse les deux lignes mobiles simultanément. Le faisceau entre et sort doucement aux extrémités, sans fondu du texte.

| Temps | Rendu |
| --- | --- |
| 0–600 ms | Binaire |
| 600–1 850 ms | Premier scan de gauche à droite : binaire → hexadécimal |
| 1 850–2 150 ms | Hexadécimal stable |
| 2 150–3 400 ms | Deuxième scan de gauche à droite : hexadécimal → `ru%43t 9xu s4tu` |
| 3 400–3 800 ms | Caractères encore chiffrés, sans défilement |
| 3 800–6 500 ms | Défilement vertical continu avec une accélération puis un freinage, décalé jusqu’à 200 ms entre positions |
| 6 500–6 800 ms | `BEYOND THE CODE` immobile |

Chaque position parcourt réellement 42 caractères de l’alphabet commun en sens inverse. La vitesse varie une fois sur la course entière, sans arrêt à chaque caractère. Il n’y a pas de troisième balayage. Le déchiffrement de référence est calculé depuis les quinze octets chiffrés avec `decode(bytes, model.KEY)` ; les deux espaces restent visuellement vides dès l’entrée. Les glyphes sont mis en cache pour le défilement.

### N°17 — substitutions collectives, version précédente

Le [scanner et les lettres changeantes](scanner-scramble.html) garde les deux scans du n°16 et remplace le défilement par des substitutions à coordonnées fixes. Les 42 changements restent étalés sur 2,5 s, avec seulement 200 ms de décalage entre lettres. **L’utilisateur refuse ce résultat**, trop éloigné de l’onde n°3 : cette étape reste un état historique de la recherche.

### N°18 — cascade de l’onde, version précédente

Le [scanner et l’onde](scanner-wave.html) conserve les deux scans, puis reprend précisément la cadence de révélation du n°3 : démarrage à `3650 + position × 2400` ms, 42 substitutions en **650 ms par lettre**. La position suit la largeur cumulée du texte ; sur mobile, la vague parcourt la première ligne puis la deuxième. Quelques caractères changent rapidement sur place, deviennent turquoise et sont soulignés par une courte impulsion ; ils retrouvent leur couleur normale une fois déchiffrés. Les lettres déjà fixées restent immobiles. Aucun défilement vertical ni troisième faisceau. Le résultat final est calculé avec `decode(bytes, model.KEY)` et reste **BEYOND THE CODE** à 6,8 s.

Les rendus n°3, 16 et 17 restent intacts. La nouvelle page est un essai à examiner, pas une animation acceptée ou intégrée au produit.

### N°19 — onde progressive, comparaison horizontale

Le [scanner n°19](scanner-sync.html) garde les deux balayages du n°18. Depuis la dernière correction du **15 septembre**, chaque lettre effectue ses 42 substitutions sur place pendant **1 200 ms**. Son départ suit `3650 + index / (count - 1) × 1800` ms, avec quinze positions, espaces compris : première lettre de **3 650 à 4 850 ms**, dernière de **5 450 à 6 650 ms**. La vague dure **3 s**, de gauche à droite, et parcourt la première ligne puis la deuxième sur mobile. Les glyphes actifs restent turquoise, leurs coordonnées fixes et les traits sous les lettres absents. Les lettres déjà déchiffrées restent immobiles ; la phrase exacte est complète à 6 650 ms et reste affichée jusqu’à 6 800 ms.

Les finales simultanées à 650 ms du 14 septembre et à 1 800 ms du 15 septembre sont remplacées, mais leurs sources restent dans [scanner-sync-650ms.mjs](scanner-sync-650ms.mjs) et [scanner-sync-1800ms-simultaneous.mjs](scanner-sync-1800ms-simultaneous.mjs). Le chemin `scanner-sync.html` reste stable pour préserver les liens. L’état n°18 reste inchangé ; aucune intégration au prototype principal n’est effectuée.

### N°20 — scanner vertical aller-retour, sélection historique du 16 septembre

Le [scanner vertical aller-retour](scanner-return.html) reprend le n°19 et remplace ses deux balayages horizontaux par une **barre horizontale unique sur toute la largeur du message**, qui se déplace verticalement. Elle descend de 600 à 2 000 ms et transforme le binaire en hexadécimal ; elle remonte de 2 000 à 3 400 ms et transforme l’hexadécimal en caractères encore chiffrés. Une trajectoire cosinusoïdale sur le trajet complet assure le freinage et le changement de direction à vitesse nulle, sans disparition ni saut du faisceau au demi-tour. Sur mobile, le même faisceau traverse le bloc des deux lignes. Seuls son entrée et son départ final s’estompent ; la transformation du texte est révélée par masquage géométrique.

La suite est identique au n°19 : depuis la dernière correction du **15 septembre**, une onde progressive de **3 650 à 6 650 ms**, avec 42 changements sur place en **1 200 ms par lettre** et des départs étalés sur **1 800 ms**, sans traits dessous. **BEYOND THE CODE** reste ensuite affiché jusqu’à 6 800 ms. Les finales simultanées précédentes sont conservées dans [scanner-return-650ms.mjs](scanner-return-650ms.mjs) et [scanner-return-1800ms-simultaneous.mjs](scanner-return-1800ms-simultaneous.mjs). Les autres essais restent inchangés. **Cette version avait été retenue explicitement le 16 septembre ; le choix du n°22 le 27 septembre remplace cette sélection.** Le n°20 reste conservé comme état historique autonome, sans intégration au prototype principal ni au parcours complet.

### N°21 et 22 — départ simultané, n°22 retenu le 27 septembre

Ces deux variantes répondent à la demande du **27 septembre 2026**. Elles conservent les scans, le demi-tour doux, les glyphes, les positions fixes et la disposition mobile du n°20. Le changement porte sur la finale : les treize lettres commencent ensemble à **3 650 ms** et effectuent chacune les 42 rotations inverses du même alphabet. Les deux espaces restent vides et ne consomment aucun rang de résolution.

- **[N°21 — résolution de gauche à droite](scanner-return-ordered.html)** : les lettres se fixent dans l’ordre de lecture, première ligne puis deuxième sur mobile.
- **[N°22 — résolution aléatoire](scanner-return-random.html)** : les mêmes instants de résolution sont affectés aux lettres dans un ordre mélangé. La permutation est déterministe, avec une graine 42, afin que le curseur, le rejeu, les changements de thème et le redimensionnement conservent le même déroulement. L’ordre des indices est `4,12,11,14,5,3,7,2,13,9,1,8,0` ; seuls les rangs de fin sont mélangés, pas les rotations qui déchiffrent les caractères.

Le premier caractère se fixe à **6 050 ms**, les suivants toutes les **50 ms**, et le dernier à **6 650 ms**. Les durées individuelles vont donc de **2 400 à 3 000 ms**, avec un étalement total des fins de **600 ms**. Les caractères actifs sont turquoise, sans traits dessous ; une lettre résolue retrouve sa couleur normale et reste immobile. **BEYOND THE CODE** demeure affiché jusqu’à **6 800 ms**. Ce réglage a d’abord été proposé pour comparer les deux demandes ; **l’utilisateur choisit ensuite le n°22 dans cet état le 27 septembre**. Le n°21 reste une variante de comparaison conservée.

Le rendu commun est [scanner-return-together.mjs](scanner-return-together.mjs). Les modules [scanner-return-ordered.mjs](scanner-return-ordered.mjs) et [scanner-return-random.mjs](scanner-return-random.mjs) sélectionnent leur ordre respectif. Le code historique [scanner-return.mjs](scanner-return.mjs) n’est pas modifié. Les deux nouvelles pages restent autonomes, sans intégration au prototype principal ni à Figma.

## État

La galerie [index.html](index.html) réunit vingt-deux exemples, avec les filtres **Tous · 22**, **Archive initiale · 12** et **Nouvelles pistes · 10**. Les dix pistes récentes sont décrites ci-dessus. L’archive initiale conserve :

- [Rouleaux](rollers.html) : fenêtres masquées, défilement vertical et freinage progressif.
- [Panneaux basculants](flaps.html) : demi-panneaux en perspective autour d’une charnière horizontale.
- [Onde](scanner.html) : balayages et remplacement spatial des représentations ; les rotations suivent le dernier passage.
- [Terminal](terminal.html) : sélection et réécriture des octets, puis déchiffrement par mot.
- [Tracé continu](trace.html) : contours de la police transformés par interpolation de courbes fermées ; résultat final dessiné en contours.
- [Profondeur](depth.html) : travelling à travers trois plans successifs, puis déchiffrement du texte au premier plan.
- [Ruban](ribbon.html) : contraction réelle des groupes de bits en hexadécimal puis en caractères, avec recentrage.
- [Grille](grid.html) : réorganisation par déplacements orthogonaux, puis mise en place des mots.
- [Prismes](prisms.html) : volumes tournant localement sur leurs faces autour d’un axe vertical.
- [Orbites](orbits.html) : trois trajectoires elliptiques, puis arrivées courbes vers la phrase.
- [Iris](iris.html) : diaphragmes fermés/réouverts aux deux conversions ; les 42 rotations se font ensuite iris ouverts, avec un arc de progression.
- [Ligne élastique](elastic.html) : groupes portés par une courbe ondulante et sa tangente ; la ligne finit tendue, avec amplitude nulle.

Chaque page fournit lecture/pause, redémarrage, déplacement temporel, vitesse × 0,5 / × 1 et thème clair/sombre. Un sélecteur donne accès aux vingt-deux versions et un lien revient à la galerie. Les scènes durent 6,8 s et aboutissent à **BEYOND THE CODE**. Elles reprennent les mêmes octets chiffrés et l’alphabet de 76 caractères avec la clé 42. Les rythmes de présentation diffèrent selon l’effet ; rouleaux et clapets ralentissent les 42 rotations, l’onde les déclenche dans le sillage et le terminal les exécute mot par mot.

Le dossier dépend du moteur, des tokens et des ressources de police existants à l’extérieur. Le prototype principal et Figma n’ont pas été modifiés par la création de ces exemples. **Le n°22 est l’animation retenue depuis le 27 septembre**, en remplacement du choix du n°20 du 16 septembre. Les vingt-deux essais restent autonomes et conservés ; l’intégration du n°22 au prototype principal, au parcours complet et à Figma n’est pas encore réalisée.

## Vérifications

**N°21 et 22 — 27 septembre 2026 : contrôles numériques, revue ciblée et vérifications navigateur terminés.**

- Les treize progressions sont nulles à 3 650 ms et positives immédiatement après, sans lettre déjà résolue. Chaque progression reste inférieure à 1 juste avant sa fin et vaut exactement 1 à sa borne explicite. Les fins vont de 6 050 à 6 650 ms par pas de 50 ms ; les deux espaces sont exclus du classement.
- L’ordre de gauche à droite et la permutation pseudo-aléatoire ont été contrôlés : treize indices uniques, aucun espace, permutation non triviale et identique lors de calculs répétés. Le calcul des rangs au montage et le rendu sans progression cumulative conservent l’ordre lors d’un déplacement temporel ou d’un nouveau rendu.
- Les phases et positions du scanner ont été comparées au n°20 avant 3 650 ms, par pas de 0,5 ms : résultats identiques. La revue du diff confirme que les glyphes, le layout, les sprites, les masques et le faisceau du scanner, l’observateur de redimensionnement et la gestion du thème sont conservés. Les deux modules de variante sélectionnent correctement leur mode.
- Conservation : les **58 fichiers historiques contrôlés sont inchangés**. Le n°20 reste disponible dans son état sélectionné le 16 septembre ; les nouveaux rendus sont des fichiers distincts.
- N°21, ordinateur clair : capture à 3 900 ms avec toutes les lettres actives en turquoise, puis à 6 300 ms avec `BEYOND` fixé et la suite encore active. Lecture complète jusqu’à la phrase finale exacte.
- N°21, mobile sombre **390 × 844** : état à 6 300 ms examiné, puis lecture complète jusqu’au résultat exact, sans débordement horizontal.
- N°22, mobile sombre **390 × 844** : toutes les lettres sont actives à 3 900 ms ; à 6 300 ms, la résolution est dispersée (`GIaOND UMH COGE`). Lecture complète jusqu’au résultat exact. Après retour du curseur à 6 300 ms, passage du sombre au clair puis du mobile à l’ordinateur : même texte intermédiaire et même ordre observés ; capture ordinateur à 6 300 ms examinée.
- N°22, ordinateur clair : lecture complète et capture finale `BEYOND THE CODE` exacte, sans débordement. Les deux variantes ont ainsi été jouées intégralement sur ordinateur et mobile sombre.
- Galerie sur ordinateur : compteurs **22/12/10**, filtre des dix nouvelles pistes, ouverture du n°21 depuis la galerie et passage du n°21 au n°22 par le sélecteur vérifiés. Aucune erreur ni aucun avertissement console relevé pendant ces contrôles navigateur.
- Limites : pas de mesure de FPS ni de nouveau contrôle de la préférence de réduction des mouvements. Ces contrôles techniques et visuels sont distincts du choix explicite du n°22 exprimé ensuite par l’utilisateur le 27 septembre ; ils ne constituent pas une intégration au prototype principal. Aucun nouveau test n’est exécuté pour l’enregistrement documentaire de la sélection.

**Onde progressive des n°19 et 20 — 15 septembre 2026 : contrôles ciblés terminés.**

Le timing courant est implémenté : 1 200 ms par lettre, départs étalés sur 1 800 ms, finale complète à 6 650 ms.

- Syntaxe contrôlée ; revue des deux progressions et des quinze fins locales par rendu. Un arrondi flottant à certaines bornes retardait la 42e substitution jusqu’à l’instant suivant ; retour explicite à 1 à la borne ajouté et vérifié pour les quinze lettres/espaces, avec décodage exact. La fin globale est à 6 650 ms.
- N°19, ordinateur : à 5 300 ms, `BEYO` est fixé et la suite reste active ou chiffrée ; à 6 100 ms, `BEYOND THE` est fixé et `CODE` reste en cours. Positions stables et absence de traits examinées, puis lecture de 3 650 ms jusqu’au résultat final exact.
- N°20, mobile sombre 390 × 844 : à 5 700 ms, `BEYOND` est fixé sur la première ligne et la deuxième se déchiffre ; à 6 650 ms, phrase exacte et phase complète. Lecture de l’onde jouée jusqu’à la fin, sans débordement horizontal ni erreur ou avertissement console.
- Libellés du n°19, descriptions 19/20 et introduction de la galerie actualisés pour l’onde ; numéros et compteurs 20/12/8 conservés. Les scans et les anciens rendus ne changent pas. Pas de nouvelle mesure de FPS ni de nouveau contrôle du mode de réduction des mouvements.

Les preuves ci-dessous concernent les étapes simultanées remplacées.

**Étape simultanée allongée à 1 800 ms — 15 septembre 2026 : contrôles ciblés terminés, état remplacé par l’onde.**

- Syntaxe des deux modules vérifiée. La comparaison avec leurs sources archivées relève uniquement le changement de `GLYPH_DURATION`, de 650 à 1 800 ms ; les scans restent inchangés.
- Fonctions de phase et de progression des deux rendus contrôlées : départ à 3 650 ms, déchiffrement encore actif à 5 449 ms, phase complète à 5 450 ms.
- Chrome, n°19 sur ordinateur : encore en déchiffrement à 4 300 ms ; lecture de la finale depuis 3 650 ms jusqu’à la phrase exacte, sans nouvelle erreur console.
- Chrome, n°20 sur mobile sombre **390 × 844** : texte encore brouillé à 4 300 ms, phrase exacte à 5 450 ms sans traits sous les lettres. Lecture de la finale jouée jusqu’à 6 800 ms, résultat exact et console vide.
- Cette passe porte sur l’allongement de la finale. Les contrôles du 14 septembre ci-dessous décrivent les états initiaux, avec une finale de **650 ms pour les n°19 et 20** ; ils ne sont pas présentés comme de nouveaux essais des versions allongées.

**Séries 3 et 4 — 14 septembre 2026 :**

- Les vingt pages et imports de rendus sont valides. Syntaxe des nouveaux modules vérifiée. Revues statiques des raccords, du cache, des marges et du décodage effectuées ; calculs du scanner n°16 vérifiés, dont les 42 positions finales et l’absence de défilement avant 3 800 ms.
- Découpes : lecture complète sur ordinateur et mobile 390 × 844 ; étapes intermédiaires au curseur, clair/sombre et résultat exact vérifiés sans erreur console. Départ des bits corrigé pour rester intact ; coutures d’anticrénelage finales corrigées puis résultat sombre mobile revérifié.
- Tissage : étapes et lectures complètes contrôlées sur ordinateur et mobile, dont sombre et retour arrière. Le raccord des deux hex vers leur paire a été corrigé puis revérifié à 2 040/2 060 ms sur ordinateur. Résultat exact et aucun débordement mobile ni erreur console relevé.
- Lentille : étapes, lecture complète, sombre et retour arrière contrôlés sur ordinateur ; états 1 250/3 000/4 850/6 800 ms et lecture complète sombre contrôlés sur mobile, sans débordement ni erreur console. Espacement des octets hex corrigé. Le recouvrement des bandes a été limité à la déformation locale pour éviter une variation d’épaisseur hors du champ ; raccord revérifié sur ordinateur à 0/350/5 850/6 050/6 800 ms, sans variation globale d’épaisseur perceptible hors du champ.
- Scanner et défilement : mobile 390 × 844 vérifié au départ, à 1 250/2 000/2 780/3 550/4 750/6 800 ms, puis par lecture complète sombre. Deux scans seulement, ciphertext exact avant le défilement, phase hacker sans faisceau et phrase finale exacte ; aucun débordement ni erreur console. Bits et hex agrandis après le premier contrôle pour améliorer leur lisibilité. Ordinateur : mêmes étapes contrôlées, dont ciphertext exact à 3 550 ms, phase hacker sans troisième scan à 4 750 ms, lecture complète claire, final sombre et retour arrière ; console sans erreur ni avertissement.
- Galerie à l’étape n°16 : compteurs 16/12/4 et sélecteur à seize entrées vérifiés ; rendu, filtres et navigation testés sur mobile sans débordement horizontal. Actualisation finale à seize et filtres 16/12/4 également contrôlés sur ordinateur, avec ouverture du nouveau scanner depuis la galerie.
- Correction n°18 : revue statique de la formule, du parcours des deux lignes, des couleurs et du décodage passée ; cadence et texte intermédiaire comparés visuellement au n°3 à 4 750 ms sur ordinateur. Lecture complète jouée sur ordinateur et mobile 390 × 844 jusqu’au résultat exact ; états sombres mobiles à 4 850/5 650/6 800 ms examinés, progression sur les deux lignes vérifiée, aucun débordement horizontal ni erreur ou avertissement console. Galerie 18/12/6, badges des versions précédentes, filtre des six nouvelles pistes et ouverture du n°18 contrôlés sur ordinateur. Le n°17 avait été contrôlé sur ordinateur (lecture complète et résultat exact) avant le refus utilisateur ; aucune validation mobile complète n’est revendiquée pour cet état.
- Correction n°19, état initial à 650 ms : syntaxe du nouveau rendu et registre à 19 numéros uniques vérifiés. Ordinateur à 3 900 ms : caractères simultanément actifs, sans traits. Mobile sombre 390 × 844 à 4 050 puis 4 300 ms : deux lignes synchronisées, absence de traits, phrase finale exacte et aucun débordement horizontal. Lecture complète mobile terminée avec résultat exact. Deux erreurs de chargement initial dues à l’ouverture avant l’ajout du n°19 au registre ; après cet ajout et actualisation, aucun nouveau message console relevé. Les scans et les autres rendus ne sont pas modifiés.
- N°20, état initial à 650 ms : syntaxe et import contrôlés ; revue indépendante de la continuité de trajectoire, des masques au demi-tour et de la révélation identique au n°19 passée. Ordinateur : descente à 1 300 ms, demi-tour à 2 000 ms et remontée à 2 700 ms examinés, puis lecture complète jusqu’au résultat exact. Mobile sombre 390 × 844 : passages descendant et montant examinés à 1 300 et 2 700 ms sur le bloc des deux lignes, puis lecture complète et final exact contrôlés sans débordement horizontal ni erreur ou avertissement console.
- Limites : pas de mesure de FPS ni de préférence de réduction des mouvements forcée dans le navigateur. Les contrôles visuels ciblés et revues de continuité ne constituent pas une acceptation esthétique par l’utilisateur.

Contrôles historiques des deux premières séries :

- Mise en archive : consignes de conservation actualisées dans les documents de reprise ; libellé d’archive et présence des douze essais vérifiés dans la galerie Chrome sur ordinateur. Aucun comportement d’animation modifié pour cette décision.
- Extension à douze : syntaxe des nouveaux modules contrôlée ; les douze pages et imports des rendus sont valides. Les huit nouvelles variantes ont été examinées sur ordinateur aux étapes initiales, intermédiaires et finales, avec lecture complète et retour arrière. Aucun avertissement ni erreur console relevé. Thèmes sombres examinés pour profondeur, prismes, élastique et iris.
- Grille : un croisement trop dense des mots au centre a été corrigé en séparant déplacement horizontal et rapprochement vertical, puis revérifié.
- Ruban : largeur mesurée à 1502,13 → 1194,83 → 841,93 → 792,53 px (0/1200/2600/6800 ms, ordinateur) ; centre conservé. Élastique : amplitude finale nulle.
- Chrome mobile 390 × 844 : étapes intermédiaires et finales des huit nouveautés examinées au curseur, sans débordement horizontal ni erreur ou avertissement console ; phrase finale sur deux lignes et commandes accessibles. Cette passe ne constitue pas huit lectures animées complètes sur mobile. Profondeur, prismes et élastique également contrôlés en sombre. La ligne élastique a été corrigée sur mobile : rotation autour du centre des groupes et inclinaison limitée, puis absence de chevauchement revérifiée à 800 ms.
- Galerie ordinateur et mobile : rendu et filtre des douze essais / huit nouveautés contrôlés, sans débordement horizontal ni erreur console. Navigation par le sélecteur des douze variantes et retour à la galerie vérifiés sur mobile.
- Limites de l’extension : aucune mesure de FPS, aucune préférence de réduction des mouvements forcée dans le navigateur et aucun contrôle de tous les instants de chaque animation.

Contrôles de l’itération initiale à quatre, toujours conservés comme preuves de cette itération :

- Syntaxe des modules contrôlée.
- Chrome ordinateur : étapes initiales, transformations et texte final inspectés dans les quatre versions. Lecture complète jouée pour l’onde et le terminal ; contrôles temporels utilisés pour rouleaux et clapets.
- Chrome mobile 390 × 844 : transitions et final des quatre rendus inspectés. Pas de débordement constaté ; clapets et terminal également examinés en sombre.
- Hôte : navigation entre variantes, curseur avant/arrière, lecture/pause, redémarrage et vitesse contrôlés. Le débordement vertical de l’hôte a été corrigé et vérifié ; le compteur de temps reste sur une ligne.
- Rouleaux : correction et vérification des octets `20` dans les cases d’espacement.
- Aucune erreur ni aucun avertissement console relevé pendant les contrôles des quatre rendus. Aucune mesure de FPS et aucune préférence de réduction des mouvements forcée dans le navigateur. Le mode réduit saute au résultat final lorsque la lecture est déclenchée.

## Accès et conservation

Lancer le serveur local depuis la racine du projet avec `python3 -m http.server 8765 --bind 127.0.0.1`, puis ouvrir `/studies/decryption-examples/index.html`.

**Archive à conserver :** garder le dossier `studies/decryption-examples/`, sa galerie, ses vingt-deux rendus et ces notes. Le chemin existant reste inchangé pour préserver les liens. Conserver également les dépendances partagées : moteur de déchiffrement, tokens et ressources de police. Lors de futures explorations, créer des variantes distinctes plutôt qu’écraser les états archivés ; vérifier les dépendances avant toute modification qui pourrait altérer leur restitution. Aucune suppression ni sélection automatique d’une variante n’est prévue.

Les sources [scanner-sync-650ms.mjs](scanner-sync-650ms.mjs) et [scanner-return-650ms.mjs](scanner-return-650ms.mjs) préservent les finales simultanées du 14 septembre. Les copies [scanner-sync-1800ms-simultaneous.mjs](scanner-sync-1800ms-simultaneous.mjs) et [scanner-return-1800ms-simultaneous.mjs](scanner-return-1800ms-simultaneous.mjs) préservent l’étape simultanée allongée du 15 septembre. Ces quatre sources restent archivées sans pages ni numéros supplémentaires ; les pages n°19 et 20 utilisent désormais l’onde progressive de 3 s.
