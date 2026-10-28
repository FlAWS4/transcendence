# Les chiffres dans le filtre (`chiffres-dans-le-filtre`)

Essai n° 1 de l’étude [Essais du filtre de la version B](../../NOTES.md) (26 octobre 2026).

**État : réalisé et vérifié le 26 octobre 2026, à montrer à l’utilisateur.** Il n’est ni choisi ni intégré : la version B (`site-b/`) ne change pas.

Résumé de la carte : Les chiffres de la ligne sous le filtre passent dans le filtre, après le lieu (« Monde · 58 campus · 30 pays », « 42 Paris · France ») ; la ligne disparaît et le filtre, de largeur fixe, se centre sur l’axe de la page.

## L’idée

La place vide du filtre reçoit ce que la ligne placée dessous affichait : les chiffres du lieu. Ils suivent son nom, après un « · », dans une couleur atténuée. La ligne disparaît.

| Niveau | Copie : filtre, puis ligne dessous | Essai : filtre seul |
| --- | --- | --- |
| Monde | « Monde ⌄ », puis « 58 campus · 30 pays » | « Monde · 58 campus · 30 pays ⌄ » |
| Continent | « Europe ⌄ », puis « 32 campus · 14 pays » | « Europe · 32 campus · 14 pays ⌄ » |
| Pays | « France ⌄ », puis « 8 campus » | « France · 8 campus ⌄ » |
| Campus | « France › 42 Paris ⌄ », sans ligne | « 42 Paris · France ⌄ » |

Les chiffres sont ceux du catalogue de la copie (`campuses.json`).

## Ce qui change

1. **Les chiffres dans le filtre.** Ils suivent les règles de la ligne (`scopeHint()` de `welcome.mjs`) :
   - au monde, les campus et les pays du réseau ;
   - pour un continent, ses campus et ses pays ;
   - pour un pays, ses campus.

   Ils sont écrits après le nom, à sa taille (14 px), en graisse normale. Leur couleur est la couleur atténuée propre au filtre, celle qu’avait le pays placé devant un campus dans la copie.
2. **Au niveau du campus, le pays.** À ce niveau, la copie masque la ligne, car la fiche du campus donne ses propres informations. Son texte aurait d’ailleurs été le nombre de campus du pays (« 8 campus » pour 42 Paris), pas le pays. L’essai montre donc le pays du campus après son nom, comme le demandait l’essai (« 42 Paris · France »). Le pays ne précède plus le campus (« France › 42 Paris » dans la copie).
3. **La ligne disparaît.** Elle est masquée, pas seulement vidée. La bande de l’Explorer (`explorer-band.mjs`) commence sous la ligne, ou sous le filtre quand la ligne est absente. Elle commence donc maintenant sous le filtre à tous les niveaux :
   - à 1440 × 900, le haut de la bande passe de 178,3 à 148 px à « Monde », au continent et au pays : la bande gagne 30,3 px (la ligne et son écart de 10 px) ;
   - à 390 × 844, elle gagne 28,8 px ;
   - au campus, rien ne change : la copie masquait déjà la ligne à ce niveau. Le haut de la bande est désormais le même à tous les niveaux.
4. **Une largeur fixe, plus courte.** Comme dans la retouche §T, le filtre prend la largeur de la plus longue indication qu’il peut montrer.
   - Les indications sont 93 par langue : le monde, 4 continents, 30 pays et 58 campus suivis de leur pays.
   - Elles sont mesurées sur des copies invisibles du filtre, dans la langue et la forme du moment, avec les vraies polices. La mesure est refaite quand la langue, la forme (compacte, lecture, menu sur le côté), la taille de la fenêtre ou les polices changent.
   - À 1440 × 900, le filtre mesure 315 px en français (« 42 Abu Dhabi · Émirats arabes unis »), 326 px en anglais et 332 px en arabe. Dans la copie, il mesurait 345, 357 et 363 px : le pays et le campus y occupaient deux boutons séparés par « › », ils partagent maintenant une ligne.
5. **Le filtre sur l’axe.** La copie centre la barre qui contient le ← et le filtre ; le ← y garde sa place même caché, si bien que le filtre était décalé de 26 px de l’axe.
   - L’essai ferme la barre, après le filtre, par une place vide de la largeur du ← (mesurée : 44 px, 38 px sur téléphone). Le filtre est ainsi au milieu de la barre, donc sur l’axe de la page. Quand le menu latéral s’affiche, c’est l’axe de la colonne à côté de lui.
   - Le ← reste juste avant le filtre, à la même place à tous les niveaux, caché à « Monde » comme dans la copie.
   - En mode lecture, le ← disparaît et la place vide avec lui.
6. **Le texte au milieu du filtre.** Le bouton « Monde ⌄ » couvre maintenant toute la place qui suit le globe.
   - Son texte (le nom, les chiffres et le chevron) est placé au milieu du filtre entier, globe compris. La position est recalculée à chaque mise à jour.
   - Un texte trop long pour être centré commence où la copie le commence, à 21 px du globe (16 px sur téléphone), jamais plus près, et va vers l’autre bout.
   - À 1440 × 900 en français, « France · 8 campus » et « 42 Paris · France » sont exactement centrés. « Monde · 58 campus · 30 pays » et « Europe · 32 campus · 14 pays » le sont à 4,5 px près.
   - Le panneau « Où veux-tu aller ? », ancré au début de ce bouton (`scope-popover.mjs`), s’ouvre toujours au même endroit.
7. **En arabe**, tout est en miroir : le globe et le ← à droite, la place vide à gauche, le texte lu de droite à gauche (« 42 Abu Dhabi · الإمارات العربية المتحدة »).

**Rien d’autre ne change :**

- la hauteur du filtre, à une exception près : en arabe sur téléphone, au campus, il mesure 49 px comme aux autres niveaux, au lieu de 48 dans la copie (voir les vérifications) ;
- son globe et le bouton « Revenir au monde », le ← et sa place ;
- la taille, la graisse et la couleur des noms ;
- le comportement du filtre, du panneau et du reste de la page ;
- la copie figée elle-même : l’essai s’applique par-dessus, seulement quand l’adresse le demande.

## Noms accessibles

L’essai les complète. C’est nécessaire : le texte visible d’un bouton doit figurer dans son nom accessible, et sur téléphone ce texte peut se terminer par « … ».

- **Nom du bouton du filtre :** « Monde · 58 campus · 30 pays · Choisir un pays ou un campus » au lieu de « Monde · Choisir un pays ou un campus ». Au campus : « 42 Paris · France · Choisir un pays ou un campus ».
- **Info-bulle (`title`) :** « Monde · 58 campus · 30 pays » au lieu de « Monde » ; « 42 Paris · France » au lieu de « 42 Paris ».
- **Résumé lu en mode lecture** (à la place du filtre, inerte) : « Contexte géographique : Monde · 58 campus · 30 pays ». Au campus, il ne change pas : « Contexte géographique : France › 42 Paris ».
- La ligne sous le filtre, un simple paragraphe, quitte la page : son texte est dans le nom du bouton.
- Les autres noms sont inchangés : ←, globe, panneau.

## Fichiers

- [essai.js](essai.js) : la fiche. Elle déclare la feuille de style et le module remplacé, sans `module.mjs`. Elle propose trois vues en tête de la liste « Page » de la galerie : « Explorer · Monde », « Explorer · 42 Paris (le pays après le campus) » et « Explorer · 42 Abu Dhabi sur téléphone, en arabe (« … ») ».
- [scope-pill.mjs](scope-pill.mjs) : une copie de `baseline/scope-pill.mjs` (retouche §T), qui le remplace par la carte d’import du chargeur, sur les deux pages. Elle :
  - écrit les chiffres, en suivant le texte de la ligne (`#globe-hint`) et, au campus, le pays (`#scope-country-name`) que `welcome.mjs` met à jour ;
  - complète les noms accessibles ;
  - mesure la largeur sur les 93 « nom · chiffres » ;
  - mesure le ← pour la place vide ;
  - place le texte au milieu du filtre.

  Pour compter les campus et les pays des continents, elle lit une seconde fois le catalogue de la copie (`campuses.json`), qui donne les codes des pays.
- [styles.css](styles.css) : neuf règles, chargées après toutes les feuilles de la copie. Elles masquent la ligne et le pays devant le campus, étendent le bouton sur la place qui suit le globe, appliquent le décalage du texte, donnent leur style aux chiffres et ajoutent la place vide symétrique du ←.

## Voir l’essai

- Galerie : [Comparer](../../index.html?essai=chiffres-dans-le-filtre). La copie figée est à gauche, l’essai à droite ; la page, le format, le thème et la langue se règlent au-dessus.
- Liens directs, depuis le dossier de l’étude :
  - `baseline/content-preview.html?essais=chiffres-dans-le-filtre&theme=light&lang=fr#explore` (ou `#explore?campus=paris`, `#projects`…) ;
  - `baseline/index.html?essais=chiffres-dans-le-filtre` pour l’arrivée.

## Vérifications (26 octobre 2026)

Chrome sans interface, piloté par l’outil commun [`helper.py`](../../../design-review-studies/checks/helper.py), mouvements réduits émulés. Mode rapide, choisi par l’utilisateur : quelques captures clés, toutes regardées, et les boîtes du filtre mesurées à chaque étape. Les scripts de contrôle restent hors du dépôt. Positions en px dans la fenêtre. L’axe est le centre de la barre du filtre ; la barre elle-même est contrôlée sur le centre de la fenêtre, ou de la colonne quand le menu latéral s’affiche, à 0 px près partout.

### Explorer à 1440 × 900, français, clair

Le curseur est déplacé avec les flèches. Le niveau est validé en cliquant le bouton fixe « Valider » (Europe) ou par la touche Entrée (France, 42 Paris).

| Étape | Texte du filtre | Filtre (x · largeur · hauteur) | ← (x · largeur) | Centre du filtre − axe | Centre du texte − centre du filtre | Haut de la bande |
| --- | --- | --- | --- | --- | --- | --- |
| « Monde » | Monde · 58 campus · 30 pays | 562,5 · 315 · 48 | 510,5 · 44 (caché) | 0 | +4,5 | 148 |
| Europe | Europe · 32 campus · 14 pays | 562,5 · 315 · 48 | 510,5 · 44 | 0 | +4,4 | 148 |
| France | France · 8 campus | 562,5 · 315 · 48 | 510,5 · 44 | 0 | 0 | 148 |
| 42 Paris | 42 Paris · France | 562,5 · 315 · 48 | 510,5 · 44 | 0 | 0 | 148 |
| ← (France), puis globe (« Monde ») | comme plus haut | 562,5 · 315 · 48 | 510,5 · 44 | 0 | 0, puis +4,5 | 148 |
| *Copie, « Monde »* | *Monde (ligne : 58 campus · 30 pays)* | *573,5 · 345 · 48* | *521,5 · 44 (caché)* | *+26* | *−78,9* | *178,3* |
| *Copie, 42 Paris* | *France › 42 Paris* | *573,5 · 345 · 48* | *521,5 · 44* | *+26* | *+1,4* | *148* |

- Le filtre (y = 84) et le ← (y = 86) gardent exactement les mêmes boîtes à toutes ces étapes.
- Le panneau « Où veux-tu aller ? » s’ouvre à x = 612,5 et y = 137 px, à 42 Paris comme à « Monde ».
- Le début du texte bouge, le filtre non : 622,5 px à « Monde », 652,5 px à « France ».

### Autres chemins, pages et formats

- **Recherche** (« Lyon », puis le résultat de type campus « 42 Lyon ») : « 42 Lyon · France », mêmes boîtes, texte centré.
- **Projets, 1440 × 900, français, clair** (capture) : 562,5 · 315 · 48, ← 510,5 · 44 caché, sur l’axe, « Monde · 58 campus · 30 pays ».
- **Filtre d’une page de contenu**, sur Projets, par les listes du panneau (mesures) :
  - le pays Brésil donne « Brésil · 3 campus », puis le campus 42 Rio « 42 Rio · Brésil » ;
  - ← revient à « Brésil · 3 campus », le globe à « Monde · 58 campus · 30 pays » ;
  - mêmes boîtes à chaque étape.
- **Fiche projet en mode lecture** (mesure) : le filtre est seul (574,5 · 291, y = 40), sans ← ni place vide, et centré. Le résumé lu est « Contexte géographique : Monde · 58 campus · 30 pays ».
- **1280 × 720, français, clair, menu latéral** (capture) : l’axe de la colonne est à 740 px. Le filtre (582,5 · 315) et le ← (530,5 · 44) sont centrés sur cet axe.
- **390 × 844, arabe, sombre (téléphone émulé)**, à « العالم », Asie, Émirats arabes unis et 42 Abu Dhabi (captures à « العالم » et à 42 Abu Dhabi) :
  - le filtre est à 59 · 272 · 49 et le ← à 336 · 38, à droite, aux quatre niveaux ;
  - le filtre est centré sur l’axe (195 px) ;
  - le texte est centré à « العالم » et à Asie ; aux deux derniers niveaux, il se termine par « … » et commence après le globe ;
  - la bande commence à 149 px (177,8 dans la copie) ;
  - dans la copie, le filtre mesurait 293 px, à 27 px, et était décalé de 21,5 px de l’axe ;
  - la hauteur est de 49 px à tous les niveaux, y compris par un lien direct vers 42 Abu Dhabi. La copie mesure 49 px à « العالم » mais 48 px à 42 Abu Dhabi : le pays en arabe après le nom latin du campus supprime cet écart.
- **Mesures sans capture** :
  - anglais à 1440 × 900 : 557 · 326, centré ;
  - arabe à 1440 × 900 : 554 · 332 · 51, centré, le ← à droite, le texte centré ;
  - français à 390 × 844 : 59 · 272 · 46, la bande à 146 px (174,8 dans la copie) ;
  - anglais à 390 × 844 : 59 · 272 · 46 ;
  - l’arrivée `index.html`, puis « Visiter » : 562,5 · 315, centré, avec les chiffres, avant et après.
- **Console et requêtes** :
  - aucune erreur JavaScript, aucun message d’erreur ni d’avertissement (la requête `favicon.ico`, absente comme pour `site-b/`, est écartée du contrôle) ;
  - toutes les requêtes réussissent (200 ou 304) ;
  - du dossier de l’essai, seuls `essai.js`, `scope-pill.mjs` et `styles.css` sont demandés.
- **Galerie** :
  - la carte n’a plus le badge « Vide » et affiche le résumé ;
  - le lien `?essai=chiffres-dans-le-filtre` ouvre la comparaison sur « Explorer · Monde », avec la copie à gauche (sans essai) et l’essai à droite ;
  - les trois vues de la fiche viennent en tête de la liste « Page ».

### Ce que montrent les captures

- **« Monde », 1440 × 900** : le globe au bout gauche du filtre ; au milieu, « Monde · 58 campus · 30 pays ⌄ », le nom en noir, les chiffres en gris plus clair et plus fin. Plus de ligne dessous : les points d’étapes de l’Explorer viennent juste sous le filtre, 30 px plus haut que dans la copie. Afrique, Amériques et Asie sont sur l’horizon.
- **La copie à « Monde »** : « Monde ⌄ » contre le globe, le reste du filtre vide, et « 58 campus · 30 pays » dessous.
- **Europe** : le ← apparaît avant le filtre sans rien déplacer ; « Europe · 32 campus · 14 pays ⌄ » ; Albanie, Allemagne et Autriche sur l’horizon.
- **France** : « France · 8 campus ⌄ » au centre ; 42 Angoulême, 42 Le Havre et 42 Lyon.
- **42 Paris** : « 42 Paris · France ⌄ » au centre du filtre, au-dessus de la fiche du campus (photos, contacts, adresse, piscines, rangée des campus français).
- **Projets** : le même filtre, à la même place, au-dessus de « 78 contenus » et des cartes.
- **1280 × 720** : le menu latéral à gauche ; le filtre et les points d’étapes au milieu de la colonne.
- **Téléphone, arabe, sombre** :
  - à « العالم », le globe à droite et « العالم · 58 فرعًا · 30 دولة » au centre, le chevron à gauche ;
  - à 42 Abu Dhabi, le ← à droite, « 42 Abu Dhabi · الإمارات العرب… » coupé par « … » au bout gauche, et dessous la fiche du campus.

## Limites

1. **Sur téléphone, le filtre raccourcit et des textes sont coupés.**
   - Pour rester au milieu, le filtre garde la place du ← des deux côtés. Quand la barre atteint les marges de 16 px, c’est lui qui cède : à 390 px de large, il mesure 272 px au lieu de 293.
   - Se terminent alors par « … » (sur 93 indications par langue) :
     - en français, 3 : « 42 Abu Dhabi · Émirats arabes unis », « Amériques · 4 campus · 2 pays », « Émirats arabes unis · 1 campus » ;
     - en anglais, 7 : « 42 Abu Dhabi · United Arab Emirates », « Europe · 32 campuses · 14 countries », « Americas · 4 campuses · 2 countries », « World · 58 campuses · 30 countries » (l’état par défaut), « United Arab Emirates · 1 campus », « Asia · 16 campuses · 11 countries », « Africa · 6 campuses · 3 countries » ;
     - en arabe, 2 : « 42 Abu Dhabi · الإمارات العربية المتحدة » et « الإمارات العربية المتحدة · فرع واحد ».
   - Le texte entier reste dans le nom accessible et l’info-bulle. Dans la copie, à 390 px, seul le pays placé devant un campus était coupé, par sa propre limite de 120 px.
2. **Le texte bouge, le filtre non.** Centré, le texte change de place quand sa longueur change (voir le tableau). Le filtre et le ← restent immobiles.
3. **Les textes longs ne sont pas exactement centrés.** Ils restent à 21 px du globe (16 px sur téléphone), comme dans la copie, et s’écartent donc du centre :
   - 4,5 px à « Monde » et à Europe, en français à 1440 × 900 ;
   - 16,5 px pour « World · 58 campuses · 30 countries » à 1440 × 900 ;
   - 18,5 px pour « Monde · 58 campus · 30 pays » à 390 × 844 ;
   - 22 px pour les textes coupés.
4. **Le pays devant un campus n’est plus un bouton.** Dans la copie, « France » dans « France › 42 Paris » ramenait au pays d’un clic. Ici, le pays suit le campus dans le texte du bouton du filtre ; on remonte au pays par le ← ou par le panneau.
5. **Le survol et l’ouverture colorent toute la place qui suit le globe** (259 px à 1440 × 900), et non plus le seul nom (87 px dans la copie, à « Monde ») ; l’anneau de focus aussi. C’est la contrepartie du panneau immobile. Cet état n’a pas été photographié (mode rapide).
6. **Les chiffres s’affichent sur toutes les pages qui montrent le filtre** : Projets, Profils, Chroniques et les fiches en mode lecture, alors que la ligne de la copie n’apparaissait que dans l’Explorer. C’est un choix de l’essai : sans eux, le filtre de largeur fixe y serait plus vide que dans la copie. Il reste à confirmer par l’utilisateur.
7. **Le catalogue est lu deux fois.** Le module relit `campuses.json`, le fichier déjà chargé par la copie, pour les codes des pays. Tant qu’il n’est pas arrivé, au chargement de la page, le filtre garde sa largeur naturelle, comme la copie avant son propre catalogue.
8. **Avec un autre essai qui remplace aussi `scope-pill.mjs`** (« Un filtre plus court », « Le chemin en étapes »), le chargeur garde celui-ci, premier dans l’ordre de la galerie, et ignore l’autre. La galerie ne montre qu’un essai à la fois.
9. **Non vérifié** :
   - Firefox et Safari, de vrais téléphones, les lecteurs d’écran, les couleurs forcées, le survol réel ;
   - le thème sombre à 1440 × 900 (le sombre n’a été vu qu’à 390 × 844, en arabe) ;
   - 667 × 375 et 320 px ;
   - les animations : les contrôles ont tourné avec les mouvements réduits.
