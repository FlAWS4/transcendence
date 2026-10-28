# Seulement centrer le texte (`texte-centre`)

Essai n° 4 de l’étude [Essais du filtre de la version B](../../NOTES.md) (26 octobre 2026).

**État : réalisé et vérifié le 26 octobre 2026, à montrer à l’utilisateur.** Commencé avant la pause de 14 h 52, terminé et vérifié le soir sur les fichiers définitifs. Il n’est ni choisi ni intégré : la version B (`site-b/`) ne change pas.

Résumé de la carte : Même largeur fixe qu’aujourd’hui : seul le texte est centré dans le filtre, et le filtre sur l’axe de la page, le bouton ← à une place fixe.

## L’idée

Seul l’alignement change. Le filtre garde exactement la largeur fixe d’aujourd’hui, celle que la copie calcule sur la plus longue indication de la langue (retouche §T, `scope-pill.mjs`). Deux choses changent :

- son texte, c’est-à-dire le chemin et le sélecteur (« Monde ⌄ », « France › 42 Paris ⌄ »…), est centré dans la pastille au lieu de partir du globe ;
- la pastille elle-même est centrée sur l’axe de la page à chaque niveau, « Monde » compris, et le bouton ← garde une place fixe juste avant elle.

La ligne sous le filtre (« 58 campus · 30 pays »…) ne change pas. Elle est centrée sur l’axe, comme avant, et tombe donc maintenant juste sous le texte.

## Ce qui change

1. **Le filtre sur l’axe.** La copie centre la barre qui contient le ← et la pastille. L’essai ferme cette barre, après la pastille, par une place vide de la taille du ← et de l’écart qui le sépare de la pastille (44 + 8 px ; 38 + 5 px à 700 px de large et moins). La pastille se trouve ainsi au milieu de la barre, donc sur l’axe de la page. Quand le menu latéral s’affiche, c’est l’axe de la colonne à côté de lui.
   - Le ← reste juste avant la pastille, à la même place à tous les niveaux. À « Monde », il est caché mais garde sa place, comme dans la copie.
   - En mode lecture, la copie retire le ← : la place vide disparaît avec lui, et la pastille reste centrée.
2. **Le texte au milieu.** Au bout de la pastille opposé au globe, une place vide de la taille du siège du globe (6 + 32 + 6 = 44 px) l’équilibre. Le chemin garde sa propre largeur et se centre entre ces deux places : un texte court est donc au milieu de la pastille, sur l’axe, au-dessus de la ligne de chiffres.
3. **Les textes trop longs pour être centrés.** Quand un texte toucherait le globe une fois centré, il commence juste après le globe, comme dans la copie. Il peut alors occuper la place vide de l’autre bout, sans jamais dépasser la pastille ; son milieu s’écarte alors un peu de l’axe, vers le bout opposé au globe.
   - À 1440 × 900 en français, 4 indications sur 93 sont dans ce cas : « Émirats arabes unis › 42 Abu Dhabi » (21,6 px), « Corée du Sud › 42 Gyeongsan » (6,5 px), « Madagascar › 42 Antananarivo » (5,9 px) et « Luxembourg › 42 Luxembourg » (4,2 px). En anglais et en arabe, une seule : 42 Abu Dhabi (21,5 et 21,7 px).
   - À 667 × 375, 11 indications françaises sur 93, de 1,5 à 21,8 px.
   - Sur téléphone (390 × 844), où la pastille est plus étroite (premier point des limites) : 20 indications sur 93 en français et en anglais, 15 en arabe, de 0,5 à 22 px. Celles qui se terminent par « … » remplissent toute la place après le globe : leur milieu est à 22 px de l’axe.
4. **En arabe**, tout est en miroir : le ← et le globe à droite, les places vides à gauche.

**Choix de lecture de l’assistant**, à confirmer par l’utilisateur : le texte est centré sur le milieu de toute la pastille, pas seulement dans la place qui suit le globe. Centré dans cette seule place, il serait 22 px à côté de l’axe et de la ligne de chiffres ; cette variante n’a pas été réalisée.

**Rien d’autre ne change**, à une exception près (les téléphones, plus bas) :

- la largeur et la hauteur de la pastille, le globe et son siège ;
- les couleurs, les polices et leurs tailles ;
- la ligne sous le filtre, dont les boîtes sont identiques à celles de la copie ;
- le comportement du filtre et du reste de la page ;
- les noms accessibles. L’essai n’ajoute qu’une feuille de style, sans texte ni élément ; ses places vides sont un pseudo-élément vide et une marge intérieure, que les lecteurs d’écran ignorent.

## Fichiers

- [essai.js](essai.js) : la fiche. Elle déclare la feuille, sans module ni module remplacé, et propose deux vues en tête de la liste « Page » de la galerie : « Explorer · Monde » et « Explorer · 42 Paris » (un campus ordinaire, centré ; la vue « 42 Abu Dhabi » de la galerie montre la plus longue indication, qui part du globe).
- [styles.css](styles.css) : cinq règles, chargées après toutes les feuilles de la copie. Elles visent la pastille par ses identifiants (`#scope-bar`, `#scope-path`). `scope-pill.mjs` mesure des copies de la pastille sans identifiants, si bien que la largeur qu’il lui donne reste celle de la copie.

## Voir l’essai

- Galerie : [Comparer](../../index.html?essai=texte-centre). La copie figée est à gauche, l’essai à droite ; la page, le format, le thème et la langue se règlent au-dessus.
- Liens directs, depuis le dossier de l’étude :
  - `baseline/content-preview.html?essais=texte-centre&theme=light&lang=fr#explore` (ou `#explore?campus=paris`, `#projects`…) ;
  - `baseline/index.html?essais=texte-centre` pour l’arrivée.

## Vérifications (26 octobre 2026, soir)

Chrome sans interface, piloté par l’outil commun [`helper.py`](../../../design-review-studies/checks/helper.py), une session à la fois, mouvements réduits émulés. Mode rapide, choisi par l’utilisateur : quelques captures clés, toutes regardées, et les boîtes du filtre mesurées à chaque étape. Les contrôles de l’après-midi, faits avant la pause, précédaient la dernière retouche de `styles.css` ; ils ont tous été refaits le soir sur les fichiers définitifs, et les chiffres ci-dessous sont ceux du soir. Les scripts et les captures restent dans le dossier temporaire de la session, hors du dépôt.

Positions en px dans la fenêtre. L’axe est le centre de la barre du filtre ; il a aussi été mesuré sans elle (milieu de la fenêtre ou de la colonne à côté du menu latéral, bande de l’Explorer, bouton « Valider ») : les valeurs concordent à 1440 × 900, 1280 × 720 et 667 × 375.

### Explorer à 1440 × 900, français, clair

Le curseur est déplacé avec les flèches, puis le niveau est validé par le bouton « Valider » (Europe) ou par la touche Entrée (France, 42 Paris).

| Étape | Pastille (x · y · largeur × hauteur) | ← (x · y · largeur) | Centre de la pastille − axe | Centre du texte − centre de la pastille |
| --- | --- | --- | --- | --- |
| « Monde » | 547,5 · 84 · 345 × 48 | 495,5 · 86 · 44 (caché) | 0 | 0 |
| Europe | 547,5 · 84 · 345 × 48 | 495,5 · 86 · 44 | 0 | 0 |
| France | 547,5 · 84 · 345 × 48 | 495,5 · 86 · 44 | 0 | 0 |
| France › 42 Paris | 547,5 · 84 · 345 × 48 | 495,5 · 86 · 44 | 0 | 0 |
| ←, retour à France | 547,5 · 84 · 345 × 48 | 495,5 · 86 · 44 | 0 | 0 |
| Globe « Revenir au monde » | 547,5 · 84 · 345 × 48 | 495,5 · 86 · 44 (caché) | 0 | 0 |
| *Copie, « Monde »* | *573,5 · 84 · 345 × 48* | *521,5 · 86 · 44 (caché)* | *+26* | *−78,9* |
| *Copie, France › 42 Paris* | *573,5 · 84 · 345 × 48* | *521,5 · 86 · 44* | *+26* | *−36,8* |

L’axe est à 720 px, comme le milieu de la fenêtre, de la bande de l’Explorer et du bouton « Valider ». Deux autres façons de changer le filtre donnent exactement les mêmes boîtes, centrées : la recherche (« Lyon », puis le résultat « 42 Lyon ») et le filtre des pages de contenu (Projets à « Monde », puis à « 42 Paris »).

### Autres pages et formats

- **1280 × 720, français, clair (menu latéral)** : la colonne commence après les 200 px du menu ; son milieu, la bande de l’Explorer, « Valider » et la barre sont à 740 px. La pastille (567,5 · 345) est centrée sur cet axe, le ← à 515,5 ; dans la copie, la pastille est décalée de 26 px.
- **667 × 375 (menu latéral, petit paysage)** : axe de la colonne à 378,5 px. La pastille garde ses 293 px, à 232, centrée ; dans la copie, décalage de 21,5 px.
- **Projets, 1440 × 900, français, clair** : la pastille est à 547,5 · 345, centrée, avec « Monde ⌄ » au milieu ; de même une fois filtrée sur 42 Paris.
- **Fiche projet en mode lecture** (mesure) : la pastille est seule (559,5 · 321, en haut à 40 px), sans ← ni place vide, et centrée.
- **390 × 844, arabe, sombre (téléphone émulé)**, de « العالم » à 42 Paris en passant par Europe et France :
  - la pastille est à 59 · 272 et le ← à 336 · 38, à droite, à tous les niveaux ;
  - la pastille est centrée sur l’axe (195 px) et le texte centré dans la pastille ;
  - dans la copie, la pastille mesure 293 px, à 27, décalée de 21,5 px ;
  - la hauteur fait 49 px aux trois premiers niveaux et 48 px au campus, exactement comme dans la copie (cinquième point des limites).
- **1440 × 900, arabe, clair**, de « العالم » à 42 Paris : la pastille (538,5 · 363) et le ← (909,5 · 44, à droite) gardent leur place et leur largeur, centrées (copie : décalage de 26 px vers la gauche). La hauteur fait 51 px puis 54 px au campus, comme dans la copie (même point des limites).
- **Mesures sans capture** :
  - anglais à 1440 × 900 : 357 px, centrée ;
  - 320 × 640 (forme compacte) : 202 px au lieu de 205, centrée (copie : décalage de 21,5 px) ;
  - l’arrivée `index.html`, puis « Visiter » : 547,5 · 345, centrée ;
  - la plus longue indication, « Émirats arabes unis › 42 Abu Dhabi » : entière, du globe jusqu’à 7 px du bord, en français comme en anglais et en arabe (en miroir).
- **Ligne sous le filtre** : boîtes identiques à celles de la copie, par exemple 657,8 · 142 · 124,4 × 20,3 à « Monde » à 1440 × 900 (centre à 720 px), 677,8 à 1280 × 720, 149,2 · 91,5 à 390 × 844 en arabe.
- **Console et requêtes**, sur tous ces parcours :
  - aucune erreur JavaScript, aucun message d’erreur ni avertissement dans la console (les messages sur `favicon.ico`, absent comme pour `site-b/`, ne sont pas comptés) ;
  - de l’essai, seuls `essai.js` et `styles.css` sont demandés ;
  - aucune requête ne sort de l’étude ni de `shared/`.
- **Galerie** (1440 × 900) :
  - la carte « 04 Seulement centrer le texte » affiche le résumé, sans le badge « Vide » ;
  - le lien `?essai=texte-centre` ouvre la comparaison sur « Explorer · Monde », suivi de « Explorer · 42 Paris » dans la liste « Page » ;
  - à gauche la copie seule (décalée de 26 px), à droite l’essai seul, avec sa seule feuille (centré), aux deux vues ; les liens « Ouvrir » n’ont pas le paramètre `chargement`.

### Ce que montrent les captures

- **« Monde »** : le globe au bout gauche de la pastille ; « Monde ⌄ » au milieu, juste au-dessus de « 58 campus · 30 pays », sur l’axe de l’Afrique et de « Valider » ; la place du ← vide à gauche.
- **Europe** : le ← apparaît à gauche sans rien déplacer ; « Europe ⌄ » au centre, au-dessus de « 32 campus · 14 pays » ; l’Albanie, l’Allemagne et l’Autriche sur l’horizon.
- **France** : « France ⌄ » au centre, au-dessus de « 8 campus ».
- **42 Paris** : « France › 42 Paris ⌄ » au centre de la pastille, au-dessus de la fiche du campus.
- **1280 × 720** : le menu latéral à gauche ; la pastille, le texte et la ligne de chiffres au milieu de la colonne, au-dessus de l’Afrique et de « Valider ».
- **Projets** : la pastille centrée au-dessus des cartes, « Monde ⌄ » au milieu.
- **Téléphone en arabe, sombre** :
  - à « العالم », le globe à droite et le texte au centre, au-dessus de « 58 فرعًا · 30 دولة » ;
  - à 42 Paris, le ← (flèche en miroir) à droite et « فرنسا › 42 Paris ⌄ » au centre.
- **Copie seule, pour comparer** : à 1440 × 900, « Monde ⌄ » collé au globe, la pastille décalée à droite et la ligne de chiffres qui ne tombe pas sous le texte ; sur téléphone en arabe, la pastille plus large et décalée.
- **Galerie** : les deux vues côte à côte, la copie à gauche, l’essai à droite, à « Monde » puis à 42 Paris.

## Limites

1. **Sur téléphone, la pastille raccourcit.** Pour qu’elle reste au milieu, la place du ← est gardée des deux côtés ; quand la barre atteint les marges de 16 px, c’est la pastille qui cède.
   - À 390 px de large, elle mesure 272 px au lieu de 293. Se terminent alors par « … » : quatre indications sur 93 en français (« Émirats arabes unis › 42 Abu Dhabi », « Madagascar › 42 Antananarivo », « Corée du Sud › 42 Gyeongsan », « Luxembourg › 42 Luxembourg »), trois en anglais et une en arabe. Le nom entier reste dans le nom accessible du sélecteur (« 42 Abu Dhabi · Choisir un pays ou un campus ») et dans son infobulle (« 42 Abu Dhabi »), comme dans la copie.
   - Dans la copie, aucun nom de campus n’est coupé à 390 px. Seul le pays devant un campus l’est, par sa propre limite de 120 px (« Émirats arabes unis »), et il l’est encore ici.
   - À 320 px (forme compacte), elle mesure 202 px au lieu de 205, et seul « Émirats arabes unis » est coupé.
   - Sur ordinateur et à 667 × 375, la largeur ne change pas. C’est la contrepartie déjà notée dans la [liste de fin](../../../../docs/VERIFICATIONS-FINALES.md), § 5 : « on pourrait le centrer et poser ← à l’extérieur, mais sur téléphone les plus longues indications se termineraient alors par « … » ».
2. **Le texte bouge, la pastille non.** Centré, le texte change de place quand sa longueur change : à 1440 × 900, « Monde ⌄ » commence à 676,4 px, « France › 42 Paris ⌄ » à 634,3 px. La pastille et le ← restent immobiles. Dans la copie, le début du texte restait fixe, collé au globe (623,5 px).
3. **Les plus longues indications ne sont pas centrées.** Elles partent du globe, et leur milieu s’écarte du centre de 22 px au plus (21,7 px sur ordinateur) ; voir « Ce qui change », point 3.
4. **Le panneau « Choisir un pays ou un campus » se déplace.** La copie l’ancre sous le début du sélecteur (`scope-popover.mjs`, inchangé). Comme le sélecteur suit maintenant le texte centré, le panneau s’ouvre plus loin du globe, à une place qui dépend de la longueur du texte : à « Monde », 1440 × 900, à 676,4 px au lieu de 623,5.
5. **Hérité de la copie, non corrigé ici** (l’essai ne change que l’alignement) : en arabe, la hauteur de la pastille change au niveau du campus.
   - À 1440 × 900, elle fait 51 px à « Monde », au continent et au pays, et 54 px au campus : le pays écrit en arabe devant le campus donne un bouton de 48 px au lieu de 45. Le ← descend alors de 1,5 px.
   - À 390 × 844, elle fait 49 px puis 48 px au campus : le sélecteur, qui porte alors le nom latin du campus, ne fait plus que 42 px, et le pays en arabe devant lui 44 px, contre 45 px pour le sélecteur en arabe aux autres niveaux. Le ← monte alors d’un demi-pixel.
   - La copie fait exactement de même (mesuré niveau par niveau). Une hauteur fixe de la pastille réglerait ce point pour tous les essais et pour la version B ; c’est à décider.
6. **Non vérifié** :
   - Firefox et Safari, de vrais téléphones, les lecteurs d’écran, les couleurs forcées, le survol réel ;
   - le thème sombre à 1440 × 900 : le sombre n’a été vu qu’à 390 × 844, en arabe ;
   - l’anglais sur téléphone et à 1440 × 900, seulement mesuré, sans capture ;
   - les animations : les contrôles ont tourné avec les mouvements réduits.
