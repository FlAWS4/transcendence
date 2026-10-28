# Vérifications de fin de projet

Demande de l'utilisateur, le 26 octobre 2026 : « je veux que tu écrives dans un fichier toutes les vérifications à faire à la toute fin du projet ». Le même jour, il a choisi un travail plus rapide : chaque changement reçoit ses tests et quelques captures clés, et les vérifications complètes sont regroupées ici, pour la toute fin du projet.

Ce fichier s'enrichit à chaque nouvelle demande. Ne cocher une case qu'après la vérification réelle, et noter où se trouve sa preuve.

## Préparer

- Serveur local à la racine du dépôt : `python3 -m http.server 8765 --bind 127.0.0.1`.
- **État de référence** de la version B avant ses retouches :
  - le reconstruire depuis [`archives/site-b-versions/`](../archives/site-b-versions/README.md), en suivant les README de chaque état ;
  - le servir à côté, sur le port 8766, pour les comparaisons.
- **Contrôles Chrome sans interface** :
  - outil : `studies/design-review-studies/checks/helper.py` ;
  - un Chrome à la fois, avec `HORIZON_CHROME_MIN_FREE_MB=900` et `HORIZON_CHROME_MEMORY_MAX=1400M` ;
  - scripts lancés avec `python3 -I -B` ;
  - regarder chaque capture.
- **Grille par défaut** :
  - tailles : 1440×900, 1280×720, 390×844, 320×640, 667×375 (petit paysage) ;
  - langues : français, anglais, arabe ;
  - thèmes : clair, sombre ;
  - modes : contraste élevé (forced-colors), mouvements réduits ;
  - fluidité : processeur ralenti quatre fois, **ordinateur branché sur secteur**.
- **Tests** :
  - `bash -c 'node --test site-b/*.test.mjs site-b/tests/*.test.mjs'` ;
  - `bash -c 'node --test site/*.test.mjs site/tests/*.test.mjs'`.
- Le détail de chaque retouche de la version B est dans [EXPLORER-B-REFINEMENTS-20261025.md](../site-b/notes/EXPLORER-B-REFINEMENTS-20261025.md) ; les paragraphes §A à §X y sont cités.

## 1. Version B : Explorer et sélecteur

- [ ] **Niveau 1** :
  - seulement les quatre continents, dans l'ordre de la langue (l'Asie d'abord en arabe) ;
  - filtre « Monde » (« 58 campus · 30 pays ») tant qu'aucun continent n'est validé ;
  - déplacer le curseur ne filtre jamais : adresse, historique et filtre inchangés ;
  - les anciens états d'historique avec « Monde » retombent sur le niveau 1.
- [ ] **Comptes des rubriques** :
  - 78/78/78 sans filtre ;
  - Europe 44/42/42 ;
  - retour à 78/78/78 après une remontée ou une réinitialisation ;
  - la réinitialisation revient sur le premier continent.
- [ ] **Halos (§A)** :
  - plus aucun halo autour des continents, des pays, des campus ni du logo de la fiche, dans aucun état : survol, focus, glisse, glissement à la main, transition ;
  - la flaque de lumière et la lueur de l'horizon sont gardées ;
  - les noms restent lisibles sur les drapeaux (12,6:1 au minimum sur un échantillon).
- [ ] **Voisins sur téléphone, au niveau des campus** : leurs logos sont visibles au bord, sans chevaucher le nom ni « Valider ». À juger : à 320×640, ils ne font que 13 à 28 px.
- [ ] **Navigation sans boutons (§B)** :
  - plus de boutons Précédent/Suivant ;
  - un clic ou un toucher sur un voisin déplace le curseur à toutes les tailles (WCAG 2.5.7), avec une cible d'au moins 24×24 px (WCAG 2.5.8).
- [ ] **Glissement à la main (§C)** :
  - les pieds restent sur la ligne d'horizon à chaque image, la taille varie de façon continue, les noms apparaissent en fondu ;
  - pas de saut au lâcher ;
  - cas à jouer : geste rapide, glissement au-delà des extrémités, glissement vertical qui fait défiler la page, clic avalé après un glissement ;
  - le petit format paysage reste inchangé.
- [ ] **Déplacements au clavier, à la molette, au clic (§L)** : avec une flèche maintenue, Début/Fin, la molette ou un clic sur un voisin, les éléments restent sur la courbe à toutes les vitesses, sans retard ni chevauchement. Un appui simple garde sa durée et son point d'arrivée.
- [ ] **Consigne retirée (§V)** : plus de « Où veux-tu aller ? » ni de « Choisir un pays » à l'écran ; les trois points des étapes restent seuls, centrés et immobiles ; la consigne et l'étape restent lues par les lecteurs d'écran.
- [ ] **Changement de niveau (§D)** :
  - seuls les éléments qui changent font un fondu ;
  - les points des étapes ne bougent pas, seul leur état change ; le bouton ⓘ glisse avec la rangée de points ;
  - l'horizon reste immobile, aussi entre pays et campus ; la flaque aussi entre continents et pays, mais entre pays et campus, où sa largeur change, elle passe en fondu enchaîné sur place ;
  - les transitions de la fiche sont identiques à l'état de référence ;
  - interruptions à jouer : Échap juste après une validation, double Entrée, redimensionnement, changement de langue ;
  - mouvements réduits.
- [ ] **Ligne d'horizon (§I, §U)** :
  - plus basse qu'avant : à l'entrée, l'arc passe nettement sous le 42, à environ 40 px sous lui sur ordinateur, et d'autant moins où la bande est trop courte ;
  - identique aux trois niveaux, à toutes les tailles ;
  - les logos des campus posés dessus ;
  - leurs noms et « Valider » restent dans la bande, et la ligne des points est dégagée.
- [ ] **Noms devant les points des campus (§J)**. Conséquence à montrer : un point placé sous une lettre est caché, comme Tokyo sous le « n » de « Japon ».
- [ ] **Compteurs (§K)** :
  - plus de compteur sous les continents et les pays ;
  - l'indication sous le filtre est inchangée ;
  - les comptes restent dans les noms lus par les lecteurs d'écran.
- [ ] **Bouton ⓘ (§H)** :
  - au bout de la ligne des points ;
  - la bulle s'ouvre au clic, au toucher, avec Entrée et Espace ;
  - elle se ferme par un second clic, par Échap (sans remonter d'un niveau), par un clic ailleurs et au changement de niveau ;
  - elle s'ouvre à côté du bouton ⓘ sur ordinateur, au-dessus de « Valider » sur téléphone ;
  - elle ne recouvre jamais « Valider », la barre de recherche, le menu du bas ni le bord de l'écran ;
  - le carrousel reste décrit pour les lecteurs d'écran.
- [ ] **Bouton « Valider » fixe (§P)** :
  - au centre, à la hauteur de celui des campus, aux trois niveaux ;
  - immobile pendant les flèches, le glissement, la molette et les changements de niveau ;
  - un clic valide le curseur ;
  - un seul arrêt de tabulation par niveau ;
  - l'anneau de focus (option A) apparaît sur le bouton fixe.
- [ ] **Clavier** : parcours complet niveau 1 → Europe → France → 42 Paris → retour, sans arrêt de focus mort.

## 2. Version B : entrée (`index.html`)

- [ ] **Arc (§E, §R)** :
  - plus de cercle autour du 42 ;
  - l'arc se dessine du centre vers les bords, exactement sur l'horizon (mesurer l'écart) ;
  - plus d'ouverture du fond depuis l'arc : rien n'est dévoilé par un masque, chaque élément arrive par sa propre animation.
- [ ] **Vol du 42 et arrivée des continents (§R)** :
  - le 42 monte se poser sur celui de l'en-tête, en haut à gauche (à droite en arabe), sans saut, et rien d'autre ne bouge avant qu'il soit posé ;
  - « HORIZON » apparaît avec la cascade de lettres du passage à « AWARDS » ;
  - en même temps, les continents glissent de la gauche jusqu'à l'Afrique, ou en arabe de la droite jusqu'à l'Asie ;
  - les autres éléments arrivent chacun depuis son bord, en glissant et en fondu, légèrement décalés : commandes de l'en-tête et filtre depuis le haut, menu depuis le bas (ou depuis le côté en colonne), puis recherche et dé ;
  - l'état final est identique à l'arrivée habituelle : curseur et focus sur le premier continent ;
  - sur les écrans peu hauts (1366×768, 1280×720, 320×640), le 42 de l'entrée est placé plus haut, et l'arc passe nettement dessous ;
  - en mode clair comme en sombre, aucun saut du fond au passage de l'entrée à la page.
- [ ] **Cas particuliers** :
  - visiteur, et membre après le déchiffrement et le slogan ;
  - préparation lente : le message « Le monde se prépare… » vient avant l'arc ;
  - erreur de chargement ;
  - mouvements réduits.
- [ ] **À juger avec l'utilisateur** :
  - en petit paysage, l'arc de remplacement traverse un instant le nom et « Valider » ;
  - en contraste élevé, l'arc garde ses couleurs ;
  - pendant l'arrivée (les 2,2 s entre l'arc et la page au repos), les commandes de l'en-tête sont atteignables au clavier ;
  - en mode clair, l'écran de balayage a maintenant le fond de la page (halo turquoise plus marqué et un peu plus haut à droite, halo rose dans le coin en bas à gauche, variante de la page sous 700 px de large), choisi par l'assistant pour qu'aucun saut ne se voie au passage.

## 3. Version B : filtre et pages

- [ ] **Pictogramme du globe (§S)** : celui du bouton « Revenir au monde » apparaît dans le filtre sur toutes les pages : Explorer, rubriques, fiches et mode lecture. Il remet le filtre sur le monde, sauf en lecture.
- [ ] **Le filtre en chemin d'étapes (§T, puis §Y)** :
  - « Monde ⌄ › Pays › Campus », puis « Europe ⌄ › Pays › Campus », « Europe › France ⌄ › Campus » et « Europe › France › 42 Paris ⌄ », les étapes à venir en gris, sans étape « Continent » ; en anglais et en arabe, en miroir ;
  - une seule taille, celle du plus long chemin dans la langue ; le bouton ← et les bords du filtre ne bougent pas quand le filtre change (valider, remonter, ←, le globe, la recherche) ni d'une rubrique à l'autre ;
  - le filtre centré sur l'axe de la page, et sur celui de la colonne à côté du menu latéral ;
  - sur téléphone, la forme courte (l'étape actuelle et la suivante), et « France › 42 Paris ⌄ » au niveau d'un campus ; dans la forme compacte (environ 372 px de large et moins), « 42 Paris ⌄ » seul, comme avant ;
  - le mode lecture montre les étapes, inertes ; les noms lus par les lecteurs d'écran ne changent pas ;
  - aucun texte coupé sur ordinateur ; « … » seulement sur téléphone, avec le nom complet pour les lecteurs d'écran.
- [ ] **Note retirée (§N)** : plus de « Exploration · 42 Horizon » ni de fenêtre « Une nouvelle façon d'explorer » ; leur place reste vide et rien n'a bougé.
- [ ] **Fond sombre (§Q)** : uni #1B1B1B partout, dans les coins comme au centre ; mode clair inchangé.
- [ ] **Menu sur le côté (§W, §X)** :
  - quand la fenêtre est plus large que haute et fait au plus 720 px de haut, le menu passe en colonne à gauche (à droite en arabe), sur toutes les pages, dans le style de l'ancien menu de A en taille moyenne : sans fond, libellés en gris doux, pastille douce qui glisse jusqu'à la rubrique active, icône active inclinée ;
  - libellés de 18 px au-delà de 1050 px de large, de 16 px de 701 à 1050 px, icônes seules à 700 px et moins, avec leur nom en infobulle et pour les lecteurs d'écran ;
  - le bloc est centré en hauteur, avec autant d'air au-dessus qu'en dessous ; les lignes rétrécissent ensemble dans les fenêtres très basses, jusqu'à 32 px ;
  - la recherche et le dé sont deux icônes sous les rubriques : côte à côte avec les libellés, le dé sous la recherche en icônes seules ;
  - le menu ne s'efface plus pendant le défilement d'une page quand il est en colonne ; le menu du bas, si ;
  - la place libérée profite à l'Explorer et aux pages : en colonne, la bande descend jusqu'à la marge du bas de la fenêtre ;
  - passage immédiat entre 720 et 721 px et à la rotation, sans perte d'état : rubrique, focus, recherche ouverte, curseur de l'Explorer ;
  - la recherche s'ouvre depuis son bouton de la colonne, en une seule surface, avec le même fonctionnement (flèches, Entrée, Échap, clic ailleurs) ; le dé fonctionne sur l'Explorer et sur Projets ;
  - sur Awards, la colonne n'a ni recherche ni dé ; le bouton de retour en haut reste dans le coin du bas ;
  - à l'entrée, le 42 ne croise jamais la colonne pendant son vol, et la colonne arrive depuis son côté ;
  - en portrait, le menu reste en bas, identique à avant.
  - **Vu dans Chrome après §X** (captures clés) : 1280×720 en clair et en sombre, 1024×600, 667×375 en français et en arabe sombre, 640×360, 568×320, 844×390 (aussi en anglais), 1280×500 et 1280×400 ; la recherche ouverte depuis la colonne ; une page défilée ; Awards ; le contraste élevé en clair ; l'arrivée du 42 à l'entrée, qui ne croise pas la colonne. **Pas encore vu** : l'anglais aux autres tailles ; 853×480, 1366×657, 1600×700 et 1440×600 ; l'entrée à 667×375 avec la colonne, en anglais, en membre, en mouvements réduits, en erreur et en préparation lente ; le contraste élevé en sombre ; les anneaux de focus en arabe ; les mouvements réduits pour le passage et pour la recherche ; l'espacement du texte ; les niveaux 2 et 3, le glissement, les flèches, la fiche et la bulle ⓘ aux tailles de colonne ; le menu du filtre, du compte, du thème et de la langue avec la colonne ; l'historique et les liens directs dans ces fenêtres.

## 4. Version B : non-régression

- [ ] Suites de tests de la version B et de la version A complètes.
- [ ] **Parcours** :
  - historique (Précédent, Suivant, rechargement) à chaque niveau ;
  - liens directs vers un continent, un pays et un campus ;
  - boutons « Explorer {campus} » des pages ;
  - dé, recherche, fiche des campus.
- [ ] **Console et réseau** :
  - aucune erreur dans la console ;
  - aucune requête hors de `/site-b/` et `/shared/`, sauf `favicon.ico` ;
  - clés de cache cohérentes : chaque module modifié est chargé une seule fois, avec sa nouvelle clé. Contrôle rapide du 26 octobre (Explorer et entrée, 1440×900, 390×844 et 1280×720, français, clair et sombre) : 0 erreur, chaque fichier modifié chargé une fois en `b7` ; restent l'anglais, l'arabe, les autres tailles et les parcours.
- [ ] **Accessibilité** : noms et annonces, zoom à 200 %, espacement du texte (WCAG 1.4.12), tailles des cibles, contrastes.
- [ ] **Fluidité** (processeur ralenti quatre fois, sur secteur) : flèche maintenue, changement de niveau, glissement, entrée. Déjà connu :
  - environ 40 images/s sur téléphone au niveau des pays, flèche maintenue, à cause d'une règle de la barre de recherche héritée de la version A (`dock-search.css`) ;
  - première descente du niveau 1 au niveau 2 à 53–55 images/s, comme avant les retouches.
- [ ] **Limites déjà connues, à revoir** :
  - en paysage 667×375, le bouton « Site officiel » de la fiche est à moitié sous la capsule de recherche (relevé avec la capsule, que la colonne remplace à cette taille) ;
  - en arabe à 640×360, l'anneau de focus passe sous la capsule (relevé avec la capsule, que la colonne remplace à cette taille) ;
  - en petit paysage, le texte est coupé net sous la bande des campus ;
  - en 667×375, « Thème » et « Langue » du menu du compte passaient sous le menu du bas (relevé avant le menu sur le côté, qui le remplace à cette taille : à revoir avec la colonne) ;
  - en contraste élevé, avec la préférence sombre et une palette système claire, le logo 42 devient invisible ;
  - en contraste élevé, en arabe, au niveau des campus, le haut de l'anneau de focus du bouton « Valider » fixe est caché par le nom du campus au centre (relevé à 390×844 par la passe du bouton fixe, interrompue par le plantage de VS Code ; anneau entier avant le bouton fixe ; il redevient entier si le bouton passe au-dessus des éléments) ;
  - menu sur le côté : ses lignes rétrécissent pour tenir dans la hauteur, jusqu'à 35,3 px à 667×375 et 32 px à 568×320 (32 px au minimum) : conforme à WCAG 2.5.8, mais plus petit que les 48/44 px du menu du bas ;
  - menu sur le côté : sous environ 224 px de hauteur libre (par exemple 1280×300), le bloc dépasse la marge du bas ;
  - menu sur le côté, à 667×375 : les résultats de recherche peuvent monter sur le bouton du compte, comme ceux du menu du bas avant ; la bande de l'Explorer passe de 76 à 202 px mais garde la rangée compacte, dont le seuil est à 250 px ;
  - en colonne, le bouton de retour en haut s'efface encore pendant le défilement ; il ne fait pas partie du menu.

## 5. Points à trancher avec l'utilisateur

Relevés par les agents pendant les retouches :

- [ ] Pendant un défilement rapide, un clic sur l'élément qui passe au centre ramène le curseur sur lui au lieu de valider ; Entrée valide bien la cible.
- [ ] Dans la bande de la fiche, la pastille du campus courant garde un léger fond lumineux, non compté comme un halo.
- [ ] Les flèches de photos ‹ 1/2 › de la fiche sont restées, car elles ne font pas partie du sélecteur.
- [ ] Sur téléphone, les extrémités estompées de l'horizon changent légèrement entre pays et campus : le fondu du bord diffère d'un niveau à l'autre.
- [ ] Avec la fenêtre retirée, la version B n'affiche plus la source officielle des campus ni la mention des contenus fictifs : conséquence annoncée dans l'option choisie par l'utilisateur (« La supprimer avec le texte »), à lui rappeler seulement.
- [ ] Le paramètre `onAnnounce`, passé au sélecteur, ne sert plus.
- [ ] À 1440 px, le curseur sur l'Afrique, l'Europe n'apparaît qu'en se déplaçant : Halo montre deux voisins de chaque côté.
- [ ] **Menu sur le côté (§W)**, choix de l'agent à confirmer :
  - le seuil « moins de 720 px » est lu comme « au plus 720 px », pour que 1280×720 ait la colonne ; sinon, une seule valeur à changer ;
  - la page centrée à côté de la colonne : le filtre est à 120 px du centre de la fenêtre à 1280×720 et, à l'entrée, l'arc est décalé d'autant par rapport au 42, resté au centre (on pourrait centrer le 42 sur la bande) ;
  - le bord du menu aligné avec le 42 de l'en-tête : 48 px du bord, 24 px de 701 à 1050 px de large, 32 px dans les fenêtres larges d'au plus 520 px de haut ;
  - en colonne, les icônes de la recherche et du dé ne tournent plus au survol, et l'anneau de focus du dé est à 5 px comme celui des lignes ;
  - la colonne reste visible, atténuée, pendant que la recherche est ouverte ;
  - le bouton de retour en haut est replacé par une règle `!important` dans `responsive-dock.css` ; une correction plus propre serait dans `back-to-top.mjs`.
- [ ] L'en-tête de `explorer-band.mjs` cite encore la note `#about`, retirée par §N.
- [ ] Deux modules sont chargés deux fois, sous deux clés de cache différentes, ce qui crée deux instances de chacun ; c'était déjà le cas avant les retouches :
  - `content-filters.mjs` : `?v=12` depuis `welcome.mjs`, `?v=11` depuis `content-preferences.mjs` et `profile-sections.mjs` ;
  - `content-geography.mjs` : `?v=b1` depuis `welcome.mjs`, `?v=1` depuis `dock-search-data.mjs`, `profile-ui.mjs` et `project-ui.mjs`.
- [ ] **Filtre en chemin d'étapes (§Y)**, choix et limites à confirmer :
  - pour rester centré, le filtre réserve aussi la place du ← à droite : à 390 px, il fait 272 px au lieu de 293, et 5 chemins finissent par « … » en français (« Émirats arabes unis › Campus », « Émirats arabes unis › 42 Abu Dhabi », « Corée du Sud › 42 Gyeongsan », « Luxembourg › 42 Luxembourg », « Madagascar › 42 Antananarivo »), 4 en anglais et 1 en arabe, contre aucun avant ;
  - la hauteur est fixée sur le chemin le plus haut : 54 px en arabe à tous les niveaux, si bien que la ligne des chiffres et la bande descendent de 3 px en arabe ;
  - les chemins trop longs pour être centrés commencent juste après le globe (8 sur 94 en français sur ordinateur, jusqu'à 21,9 px du milieu) ;
  - l'étape du continent est un texte, pas un bouton : on remonte avec ← ou Échap, un niveau à la fois.
- [ ] **42 de l'entrée placé plus haut (§U)**, seuil de l'agent à confirmer : il ne monte que si l'arc passerait à moins de 20 px sous lui, et monte alors jusqu'à ce que l'arc passe 40 px dessous ; ainsi 1280×720, 1366×768, 320×640 et 1280×800 en français (19,7 px) montent, mais 1440×900 en arabe (30,5 px), 390×844 en arabe (24,8 px) et 1536×864 en français (23 px) restent au centre.

## 6. Tout le site : charte 42

- [ ] Vérifier la charte sur tout le site, dans les versions A et B : couleurs (Halo garde pour l'instant ses propres teintes), typographie, logo 42. C'est l'intention exprimée par l'utilisateur le 24 octobre : « on fera une vérification de tout le site à la fin pour que la charte soit bien respectée ».

## 7. Hors du navigateur de contrôle

- [ ] Vrais téléphones (iOS, Android).
- [ ] Safari et Firefox.
- [ ] Lecteurs d'écran réels : VoiceOver, NVDA, TalkBack.
- [ ] Polices arabes d'autres machines.
- [ ] Survol réel à la souris : Chrome sans interface ne sait pas l'émuler.

## 8. Droits et données

- [ ] **Logos des campus** : ce sont des marques sans autorisation de redistribution établie. La décision revient à l'utilisateur avant toute publication.
- [ ] Mentions en place pour les drapeaux flag-icons (licence MIT) et pour Natural Earth (domaine public).

## 9. Version A, archives et dépôt

- [ ] **Version A** : suites de tests (660), entrée, globe, rubriques ; le [plan du site](site-map/NOTES.md) reste exact (`check-site-map.mjs`).
- [ ] **Archives de la version B** (`archives/site-b-versions/`) : manifestes et rejeux, soit 544/544 pour l'état provisoire à cartes, 637/637 pour l'état avec « Monde », 638/638 pour l'état d'avant les retouches et 749/749 pour la colonne d'avant §X.
- [ ] **Maquettes atlas et arcade** (`studies/explorer-b-design/`) : elles lisent le modèle actuel de la version B ; depuis le retrait de « Monde », elles ne montrent plus l'état jugé, que l'archive `pre-no-monde-20261025/` permet de retrouver.
- [ ] **Avant un commit** : rien de sensible (les secrets restent locaux, [VERSIONING.md](../VERSIONING.md) §6) ni de trop lourd.
