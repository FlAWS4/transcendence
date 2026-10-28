# Essais issus de l’avis sur le design — 14 octobre 2026

## Demande et statut

Le 14 octobre, l’utilisateur demande un avis sur le design du prototype actuel ; l’assistant le donne sans modifier le site. L’utilisateur demande ensuite de réaliser **tous ces changements à part, comme les essais faits auparavant avec Codex**, pour savoir ce qui lui convient.

Cette collection réalise les propositions de l’avis sous forme de **19 essais facultatifs et séparés**, appliqués à une copie figée du site. Quatre problèmes reçoivent deux réponses possibles, à comparer entre elles. Chaque essai se compare à cette copie, seul ou avec d’autres. Ce sont des propositions de l’assistant, réalisées et vérifiées techniquement. Les 19 essais sont terminés et vérifiés le 15 octobre ; **l’utilisateur en retient neuf le même jour, qui sont intégrés au prototype actif** ([notes d’intégration](../../site/notes/DESIGN_REVIEW_SELECTION_NOTES.md)) ; les dix autres restent des propositions. Les essais qui reviennent sur une décision explicite antérieure sont signalés dans la galerie et dans le tableau ci-dessous. Le projet reste en **0.0.1 pré-alpha** ; rien n’est commité, poussé ni publié.

## Ouvrir et comparer

La [galerie](index.html) est l’entrée commune. Servir le dépôt avec le serveur local habituel (`python3 -m http.server 8765 --bind 127.0.0.1` depuis la racine), puis ouvrir `http://127.0.0.1:8765/studies/design-review-studies/`.

- **Comparer** : le bouton « Comparer » d’une carte affiche côte à côte la copie du site figée le 14 octobre et l’essai, sur la page où la différence se voit le mieux. Page, format (ordinateur 1440 × 900, mobile 390 × 844, petit mobile 320 × 640, paysage 667 × 375), thème et langue se règlent au-dessus des deux vues. L’affichage « Une grande vue, en bascule » superpose les deux états pour repérer les écarts fins.
- **Ma sélection** : cocher plusieurs essais pour les voir ensemble ; la sélection reste mémorisée dans ce navigateur. Deux paires sont exclusives (« Une colonne sous 360 px » / « Deux colonnes allégées à 320 px », « Illustrations adaptées au sombre » / « Illustrations atténuées en sombre ») : si les deux sont cochés, seul le premier dans l’ordre de la galerie s’applique, et la galerie le signale.
- **Liens directs** : `baseline/content-preview.html?essais=id1,id2&theme=dark&lang=ar#projects` ouvre la copie avec ces essais, ce thème et cette langue ; `baseline/index.html` joue l’arrivée complète. Sans paramètre, la copie s’affiche comme le prototype du 14 octobre. Les préférences, favoris et commentaires de la copie sont séparés de ceux du prototype actif.

Les vues de la galerie sont réduites à l’échelle de la page ; « Ouvrir l’essai » et « Ouvrir la copie du 14 octobre » les ouvrent en grand dans un nouvel onglet.

## Les 19 essais

« Validé » ou « Corrigé » : réalisé, contrôlé par son auteur, puis revérifié par un second agent chargé de le contredire, qui a corrigé les défauts trouvés. Ce n’est pas une acceptation de l’utilisateur.

| N° | Essai | Vérification | Décision antérieure concernée | Accès |
| --- | --- | --- | --- | --- |
| | **Explorer et globe** | | | |
| 01 | Globe dans l’espace libre | **Avec réserves** | 4 et 13 oct. : rayon du globe | [Comparer](index.html?essai=globe-espace-libre) |
| 02 | Textes du globe sur pastilles | **Validé** | — | [Comparer](index.html?essai=textes-sur-pastilles) |
| 03 | Étiquettes du globe en Jost | **Validé** | — | [Comparer](index.html?essai=police-etiquettes-globe) |
| 04 | Nom du campus en tête de fiche | **Corrigé** | 8 oct. : logo, sinon nom | [Comparer](index.html?essai=titre-fiche-campus) |
| | **Pile flottante, cartes et petits écrans** | | | |
| 05 | Recherche repliée en loupe | **Validé** | 5 oct. : capsule flottante | [Comparer](index.html?essai=recherche-repliee) |
| 06 | Voile sous la pile basse | **Corrigé** | — | [Comparer](index.html?essai=voile-pile-basse) |
| 07 | Une colonne sous 360 px | **Corrigé** | 6 et 8 oct. : deux colonnes à 320 px | [Comparer](index.html?essai=une-colonne-320) |
| 08 | Deux colonnes allégées à 320 px | **Corrigé** | 11 oct. : couronne à droite du nom, tailles conservées | [Comparer](index.html?essai=deux-colonnes-allegees) |
| 09 | Sans « pseudo à renseigner » | **Corrigé** | — | [Comparer](index.html?essai=pseudo-manquant) |
| | **Couleurs, thème sombre et illustrations** | | | |
| 10 | Illustrations adaptées au sombre | **Validé** | — | [Comparer](index.html?essai=illustrations-sombres) |
| 11 | Illustrations atténuées en sombre | **Validé** | — | [Comparer](index.html?essai=illustrations-attenuees) |
| 12 | Rôles de couleur unifiés | **Corrigé** | 13 oct. : couleurs limitées à Se connecter et au retour Monde | [Comparer](index.html?essai=roles-couleur) |
| 13 | Contour de « Visiter » en sombre | **Validé** | 13 oct. : rose et dimensions conservés, contour ajouté | [Comparer](index.html?essai=visiter-contour-sombre) |
| 14 | Illustrations variées dans les listes | **Validé** | — | [Comparer](index.html?essai=illustrations-variees) |
| | **Typographie, lisibilité et pages** | | | |
| 15 | Textes plus lisibles | **Corrigé** | — | [Comparer](index.html?essai=lisibilite-textes) |
| 16 | Signature typographique de la marque | **Corrigé** | Point en attente : Futura PT, HORIZON en Jost Medium | [Comparer](index.html?essai=titres-marque) |
| 17 | Titres plus affirmés | **Validé** | — | [Comparer](index.html?essai=titres-forts) |
| 18 | Échelle et arrondis unifiés | **Corrigé** | 6 oct. : adapter la page sans paliers de taille (en partie) | [Comparer](index.html?essai=echelle-unifiee) |
| 19 | Page Awards « à venir » | **Corrigé** | 7 oct. : page Awards sans contenu | [Comparer](index.html?essai=awards-a-venir) |

## Détail des essais

### Explorer et globe

#### Globe dans l’espace libre (`globe-espace-libre`)

Le globe du niveau Monde est réduit sur ordinateur, tablette et téléphone en paysage pour tenir entre la ligne « 58 campus · 30 pays » et « Exploration · 42 Horizon » (ou la recherche quand ce texte est masqué), avec au moins 16 px d’air, toujours centré à 50 %/50 %. Les téléphones en portrait gardent le globe actuel.

- **Décision concernée :** 4 octobre : demande d’« un globe un peu plus petit au départ », la scène occupant toute la page (« globe sur toute la surface, rayon initial un peu réduit ») ; 13 octobre : « le globe au centre exact », réalisé avec « centre à 50 %/50 %, rayon inchangé ». L’essai garde le centre exact mais réduit nettement le rayon.
- **Alternative :** `textes-sur-pastilles`
- **Vérification contradictoire :** avec réserves. Le code est conforme, mais le globe devient inutilisable sur un téléphone en paysage et les vues Pays du Canada et du Brésil sont moins zoomées ; contrôle étendu aux changements de langue et de thème et aux quatre essais du groupe combinés.
- **Mesures :** 14 contrôles consignés dans [essai.json](essais/globe-espace-libre/essai.json) et [results.json](checks/globe-espace-libre/results.json) ; 15 paires de captures avant/après.
- **Limites principales :**
  - Téléphone en paysage : entre la ligne de statistiques et la recherche il ne reste qu’un disque d’environ 41 px de diamètre (rayon mesuré 20,7 px à 667 × 375 comme à 844 × 390, ramené au zoom minimal −2 de MapLibre) : une bille presque cachée par l’étiquette « Maroc », inutilisable telle quelle. L’essai textes-sur-pastilles traite le même problème sans réduire le globe. En arabe, l’air au-dessus de la bille n’est que de 15,0 px à 844 × 390, essai seul ; avec lisibilite-textes, il descend aussi de 16,5 à 15,0 px à 667 × 375, la ligne de statistiques passant de 12 à 13 px : le disque étant déjà au zoom minimal, aucune bande ne peut le réduire.
  - Sur les portables courants, le globe perd près de la moitié de son rayon : 309,5 → 174,0 px à 1366 × 768 et 290,2 → 150,0 px à 1280 × 720. Les repères d’Europe y sont plus serrés : à 1440 × 900, le point d’un repère voisin passe sur l’étiquette « Albanie » (ordre d’empilement des repères inchangé par l’essai).
  - Effet au niveau Pays pour les deux grands pays : le zoom Pays a un plancher (zoom Monde + 1,35) qui suit le monde réduit. À 1440 × 900, Canada 3,82 → 3,09 et Brésil 3,82 → 3,23 (calcul avec la formule du moteur) ; la capture du Canada montre une vue nettement plus large, globe visible (36,6 % des pixels différents). Les 28 autres pays, dont la France, ne changent pas. Éviter cet effet demanderait de modifier le moteur du globe.

#### Textes du globe sur pastilles (`textes-sur-pastilles`)

Le globe reste tel quel ; la ligne sous le filtre (« 58 campus · 30 pays » et ses variantes Pays et Campus) et la ligne « Exploration · 42 Horizon » reçoivent chacune une pastille opaque et compacte, avec le bord et l’ombre du filtre. Rien ne bouge.

- **Alternative :** `globe-espace-libre`
- **Vérification contradictoire :** validé.
- **Mesures :** 10 contrôles consignés dans [essai.json](essais/textes-sur-pastilles/essai.json) et [results.json](checks/textes-sur-pastilles/results.json) ; 13 paires de captures avant/après.
- **Limites principales :**
  - Les autres états du niveau Campus (« Préparation des alentours… », message d’échec) utilisent le même élément et la même pastille opaque ; leur contraste n’a pas été mesuré séparément.
  - La pastille de la ligne d’aide passe au-dessus des repères du globe, comme le filtre : un repère proche peut y être partiellement caché.
  - Le contraste « avant » cité est le pire pixel de glyphe ; il dépend de la position de la carte au moment de la capture.

#### Étiquettes du globe en Jost (`police-etiquettes-globe`)

Les étiquettes des repères du globe (pays, campus, campus sélectionné et flèche hors champ) prennent la police du site au lieu de celle de MapLibre. Seule la famille change : taille, graisse, interligne et couleur restent les mêmes.

- **Vérification contradictoire :** validé.
- **Mesures :** 7 contrôles consignés dans [essai.json](essais/police-etiquettes-globe/essai.json) et [results.json](checks/police-etiquettes-globe/results.json) ; 11 paires de captures avant/après.
- **Limites principales :**
  - La graisse calculée reste 500, mais Jost possède une vraie graisse Medium alors que Liberation Sans (Arial sur cette machine) n’en a pas et était dessinée en normal : les étiquettes paraissent nettement plus appuyées (visible sur la capture de 42 Paris), comme les autres textes de graisse 500 du site. Sur un Mac, Helvetica Neue Medium donnait déjà un rendu medium.
  - Le site n’a pas de pile arabe dédiée pour ses textes : il utilise partout « Jost, sans-serif » et laisse le système choisir les glyphes arabes (Noto Sans Arabic ici, mesuré). Seuls le nom de marque أفق et l’option « العربية » nomment 'Noto Sans Arabic', sans-serif. L’essai reprend la pile commune ; sur une machine dont la police arabe par défaut est autre, les étiquettes suivraient le reste du site, pas forcément Noto Sans Arabic.
  - Contrairement à la revue, les noms arabes des repères étaient déjà dessinés en Noto Sans Arabic par repli du système ; en arabe, l’essai change surtout les noms latins des campus et les chiffres.

#### Nom du campus en tête de fiche (`titre-fiche-campus`)

Quand le logo officiel d’une fiche campus ne contient pas le nom du campus (42 Paris, réduit au sigle 42), ce nom apparaît en titre entre le logo et la ligne du pays. Les fiches sans logo (42 Lyon) et celle dont le logo écrit déjà le nom (42 Mulhouse) ne changent pas.

- **Décision concernée :** 8 octobre : « Fiches campus : logo officiel en tête, sinon nom texte (également si l’image échoue) » ; demande de l’utilisateur : « Si aucun logo ne s’affiche, le nom doit prendre sa place. » L’essai affiche aussi le nom sous un logo qui ne le contient pas (42 Paris).
- **Vérification contradictoire :** corrigé. Le titre n’est plus ajouté sous un logo qui écrit déjà le nom (Mulhouse) ; contrôle étendu à Mulhouse et Lyon, qui restent identiques au pixel près, et aux changements de langue et de thème.
- **Mesures :** 10 contrôles consignés dans [essai.json](essais/titre-fiche-campus/essai.json) et [results.json](checks/titre-fiche-campus/results.json) ; 9 paires de captures avant/après.
- **Limites principales :**
  - Le classement « logo qui écrit déjà le nom » est fait à l’œil sur les deux logos existants et inscrit dans essai.mjs (seul celui de Mulhouse). campus-profiles.json n’a pas de champ pour le dire : un nouveau logo non classé recevrait le titre, même s’il contient le nom.
  - Le titre ajoute de la hauteur en haut des fiches à logo sans nom : environ 47 px sur ordinateur en français, 58 px en arabe (interligne 1,5), 42 px sur mobile en français et 52 px en arabe. La ligne du pays et le reste du contenu descendent d’autant ; sur mobile, la fiche repliée montre un peu moins de contenu.
  - Le titre est placé sous la plaque du logo, pas dedans, pour ne pas imiter le logotype officiel « 42 + nom » de la charte ; il n’occupe donc pas la place du nom dans les fiches sans logo.

### Pile flottante, cartes et petits écrans

#### Recherche repliée en loupe (`recherche-repliee`)

Sur les pages de contenu, la capsule « Chercher dans Horizon » se replie en un bouton rond de 44 px à loupe, posé à 8 px du dé : la ligne flottante passe de 252 × 44 à 96 × 44 px. Explorer garde la capsule, et la recherche ouverte reste exactement celle d’aujourd’hui.

- **Décision concernée :** 5 octobre 2026 : après quatre modèles de recherche, l’utilisateur choisit explicitement la capsule flottante (« Je choisis la capsule flottante »), intégrée au-dessus du dock sans prendre sa largeur. L’essai la replie en loupe sur les pages de contenu ; Explorer la garde, et la loupe reste hors du dock.
- **Alternative :** `voile-pile-basse`
- **Vérification contradictoire :** validé.
- **Mesures :** 12 contrôles consignés dans [essai.json](essais/recherche-repliee/essai.json) et [results.json](checks/recherche-repliee/results.json) ; 12 paires de captures avant/après.
- **Limites principales :**
  - Le libellé visible « Chercher dans Horizon » disparaît sur les pages de contenu : seule la loupe signale la recherche. L’info-bulle native n’apparaît qu’au survol de la souris, pas sur écran tactile.
  - La hauteur de la pile ne change pas : la ligne des boutons reste haute de 44 px, au même endroit au-dessus du dock ; seule la largeur diminue. Les deux boutons masquent encore un peu de texte, par exemple la phrase de l’onglet Commentaires sur ordinateur.
  - Au changement de langue sans rechargement, animations actives, la loupe et le dé échangent leur place en 0,48 s et se croisent (jusqu’à 42 px de chevauchement sur 11 images) ; dans le site actuel, le dé passe déjà sur la capsule pendant ce mouvement (44 px sur 11 images).

#### Voile sous la pile basse (`voile-pile-basse`)

Sur les pages de contenu, un voile pleine largeur, de la couleur du fond de page, passe derrière la capsule, le dé et le dock : le contenu s’efface en 24 px au-dessus de la capsule au lieu d’être coupé par les pastilles. Capsule, dé et dock restent inchangés.

- **Alternative :** `recherche-repliee`
- **Vérification contradictoire :** corrigé. Le voile s’efface quand la navigation au clavier sélectionne un élément placé sous la pile ; deux affirmations inexactes de la fiche sont corrigées.
- **Mesures :** 14 contrôles consignés dans [essai.json](essais/voile-pile-basse/essai.json) et [results.json](checks/voile-pile-basse/results.json) ; 16 paires de captures avant/après.
- **Limites principales :**
  - Au repos, le voile masque le bas de l’écran sur 173 px sur ordinateur (19 % de l’écran), 158 px sur mobile (19 %) et à 320 × 640 (25 %), 150 px en paysage 667 × 375 (40 %) : plein sur 149, 134 et 126 px, puis fondu sur les 24 px du haut. Entre le fondu de l’en-tête et le voile, la bande nette mesure 539 px (60 %) sur ordinateur, 520 px (62 %) sur mobile, 323 px (50 %) à 320 × 640 et seulement 85 px (23 %) en paysage, où les cartes sont presque entièrement voilées au repos.
  - Le contenu situé sous la pile n’est plus coupé, mais il n’est plus visible du tout au repos : il faut faire défiler pour le lire. Le fondu de 24 px est plus court que celui de l’en-tête (36 à 52 px).
  - Au clavier, le voile s’écarte dès que le focus est dans la page, y compris après un changement de rubrique au clavier par le dock, qui place le focus sur le titre de la page : une personne qui navigue au clavier voit la page comme aujourd’hui, avec les pastilles qui coupent le contenu, et le voile disparaît puis revient quand le focus entre dans la page ou la quitte. À la souris et au toucher, le voile reste ; mais une fermeture de menu par Échap rend le focus visible à son bouton, et le voile reste alors écarté jusqu’au clic suivant.

#### Une colonne sous 360 px (`une-colonne-320`)

Sous 360 px de largeur d’écran (360 px inclus), les grilles Projets et Chroniques affichent une carte par ligne au lieu de deux. L’intérieur des cartes, la vue Liste, les Profils et les écrans plus larges ne changent pas.

- **Décision concernée :** 8 oct. 2026 : « Projets et Chroniques : deux cartes par ligne sur mobile à 320 px » ; 6 oct. 2026 : « adapter d’abord les tailles des textes et éléments avant d’imposer une grille mobile ». Sous 360 px, l’essai revient sur ces deux choix.
- **Alternative :** `deux-colonnes-allegees`
- **Vérification contradictoire :** corrigé. Code conforme ; la fiche mesure les 12 cartes de la page au lieu de 8 et signale qu’en arabe à 340 px la référence coupe encore un nom ; une mesure indépendante est ajoutée.
- **Mesures :** 10 contrôles consignés dans [essai.json](essais/une-colonne-320/essai.json) et [results.json](checks/une-colonne-320/results.json) ; 5 paires de captures avant/après.
- **Limites principales :**
  - Les cartes deviennent bien plus hautes : à 320 px, les 8 premières cartes occupent 3073 px au lieu de 1390 px (×2,2), et il faut défiler davantage pour parcourir une page.
  - Le seuil suit la largeur de l’écran (360 px inclus), pas celle de la grille. 360 px est une largeur courante de téléphones Android : ils passeraient eux aussi en une colonne. De 361 à 389 px, les deux colonnes de la référence restent, avec des noms parfois sur deux lignes.
  - Combinaison avec les autres essais non vérifiée ici. L’essai est exclusif avec deux-colonnes-allegees : le premier listé dans l’URL l’emporte.

#### Deux colonnes allégées à 320 px (`deux-colonnes-allegees`)

Sous 360 px, Projets et Chroniques gardent deux cartes par ligne, mais leur rangée d’auteurs s’allège : le nom tient sur une ligne avec des points de suspension, et la couronne devient une petite pastille sur l’avatar du responsable. Avatars, +N, titres et couleurs ne changent pas.

- **Décision concernée :** 11 oct. 2026 : « couronne à droite du nom », « nom et couronne sont réunis sur la même ligne », « placement à droite également en arabe », « tailles et raccourcissement conservés ». Sous 360 px seulement, l’essai sort la couronne de la ligne du nom pour la poser sur l’avatar : en arabe, elle reste à droite du nom ; en français et en anglais, elle passe à sa gauche. La couronne passe aussi de 18 à 11 px et le nom tient sur une ligne au lieu de deux. En revanche, l’essai respecte le choix du 8 oct. 2026 : « deux cartes par ligne sur mobile à 320 px ».
- **Alternative :** `une-colonne-320`
- **Vérification contradictoire :** corrigé. Code conforme ; la fiche est corrigée et signale la décision du 11 octobre sur la couronne (18 → 11 px, posée sur l’avatar).
- **Mesures :** 11 contrôles consignés dans [essai.json](essais/deux-colonnes-allegees/essai.json) et [results.json](checks/deux-colonnes-allegees/results.json) ; 4 paires de captures avant/après.
- **Limites principales :**
  - Les noms raccourcis (« Luiza … », « Leïla … ») ne se lisent plus en entier sur la carte. Le nom complet reste dans le nom accessible, dans l’infobulle au survol et sur la fiche ; sur téléphone, sans survol, il faut ouvrir la fiche.
  - Le repli « nom masqué visuellement quand la place manque » n’a pas été ajouté : entre 320 et 360 px, le nom garde au moins 47 px, soit environ 5 lettres et « … ». À 300 px, sous la plage testée, il en reste au moins 37 px (13 px dans la référence), et le titre « ft_transcendence · Construire à cinq » y est coupé au milieu d’un mot, comme dans la référence : l’essai ne touche pas aux titres.
  - La couronne est plus petite (11 px dans un disque de 16 px, contre 18 px avant). Elle reste lisible à l’écran, mais n’a pas été testée sur un téléphone réel.

#### Sans « pseudo à renseigner » (`pseudo-manquant`)

Les profils fictifs sans pseudo Intra n’affichent plus « Pseudo Intra à renseigner » (ni « Intra login to be added », ni « اسم مستخدم Intra غير محدد »), ni dans l’annuaire en grille ou en liste, ni sur leur fiche. Les vrais pseudos (@lmansour…) restent affichés et aucun pseudo n’est inventé.

- **Vérification contradictoire :** corrigé. Code conforme ; deux chiffres inexacts de la fiche sont remplacés par des mesures sur les 4 pages de profils.
- **Mesures :** 14 contrôles consignés dans [essai.json](essais/pseudo-manquant/essai.json) et [results.json](checks/pseudo-manquant/results.json) ; 10 paires de captures avant/après.
- **Limites principales :**
  - La règle repose sur un détail du code de la base : un vrai pseudo porte dir="ltr", la mention provisoire non. Si profile-ui.mjs changeait sur ce point, la mention réapparaîtrait, ou un vrai pseudo sans dir serait masqué.
  - La consigne « garder l’espace si l’alignement en dépend, sinon replier » est appliquée rangée par rangée. Dans la grille, une carte sans pseudo placée à côté d’une carte à pseudo garde donc une ligne vide entre le nom et le campus. Les rangées sans aucun pseudo deviennent plus compactes (27 px de moins à 1440 px). La hauteur des rangées dépend ainsi de la largeur, du tri et des filtres, qui changent leur composition. Réserver ou replier partout serait plus simple (une seule règle CSS), mais désalignerait les rangées mixtes ou laisserait un vide dans toutes les cartes.
  - L’espace réservé fait une seule ligne, comme un vrai pseudo. À 320 px en FR et en AR, la mention en occupait deux, si bien que le décalage de 21 px qui existait dans la base disparaît. Ce n’est pas une retouche séparée : c’est la conséquence de la réserve d’une ligne de pseudo.

### Couleurs, thème sombre et illustrations

#### Illustrations adaptées au sombre (`illustrations-sombres`)

En thème sombre seulement, les fonds et décors clairs des illustrations fictives (shell, network, garden, path, chronique) sont remplacés par des teintes sombres mélangées à partir de la charte ; les accents 42 Blue et Royal Pink restent identiques.

- **Alternative :** `illustrations-attenuees`
- **Vérification contradictoire :** validé.
- **Mesures :** 8 contrôles consignés dans [essai.json](essais/illustrations-sombres/essai.json) et [results.json](checks/illustrations-sombres/results.json) ; 10 paires de captures avant/après.
- **Limites principales :**
  - Dans la fiche et la visionneuse, le socle trace un fin contour hérité (couleur du texte, donc blanc en sombre) autour de chaque forme et du cadre de l’illustration entière ; invisible sur les anciens fonds clairs, il devient bien visible sur les fonds assombris (voir la capture de la visionneuse), comme il l’est déjà sur les illustrations chronique et raycast du socle. L’essai ne le modifie pas, par périmètre strict ; le retirer serait un autre choix, valable aussi pour ces deux motifs.
  - Le motif path n’apparaît sur aucune page actuelle (les deux récits de parcours redirigent vers le profil) : il n’est vérifié que sur la planche des motifs.
  - Les nouvelles teintes sont des mélanges calculés des couleurs de la charte, pas des couleurs nommées par celle-ci ; aucun contrôle sur écran physique ni par une personne malvoyante.

#### Illustrations atténuées en sombre (`illustrations-attenuees`)

Alternative plus simple à « Illustrations adaptées au sombre » : en thème sombre seulement, les six illustrations fictives sont atténuées d’un bloc (luminosité 0,8, saturation 0,9) sans changer leurs couleurs ; portraits et photos restent intacts.

- **Alternative :** `illustrations-sombres`
- **Vérification contradictoire :** validé.
- **Mesures :** 5 contrôles consignés dans [essai.json](essais/illustrations-attenuees/essai.json) et [results.json](checks/illustrations-attenuees/results.json) ; 9 paires de captures avant/après.
- **Limites principales :**
  - L’atténuation agit sur toute l’illustration : les accents 42 Blue et Royal Pink sont eux aussi assombris (composantes de couleur multipliées par 0,8) et légèrement désaturés, contrairement à illustrations-sombres qui les conserve.
  - Les couvertures restent nettement plus claires que le fond de page (luminance 0,27 à 0,47 contre 0,011) : c’est l’écart attendu entre cette variante légère et la variante recolorée (0,04 à 0,14).
  - Dans la fiche et la visionneuse, le fin contour hérité du socle est atténué avec l’illustration ; aucune autre différence.

#### Rôles de couleur unifiés (`roles-couleur`)

Une seule règle de couleur pour les actions : les boutons principaux reprennent le traitement déjà choisi pour Se connecter (42 Blue en clair, Royal Pink en sombre, texte encre), et les « Annuler » encore colorés deviennent neutres. Couleurs seulement.

- **Décision concernée :** 13 octobre 2026 : après le retour à l’état 139 et la règle de périmètre strict, l’utilisateur a demandé 42 Blue en clair et Royal Pink en sombre pour Se connecter et le retour Monde seulement ; les autres boutons ont gardé leur style (« les autres boutons gardent leur style » ; création de compte, Annuler, Visiter et Réessayer inchangés). Cet essai étend volontairement la règle aux autres actions principales, à titre de comparaison.
- **Vérification contradictoire :** corrigé. La fiche est précisée (décision concernée, bouton « Fermer », quatre contrôles ajoutés) ; le code de l’essai est inchangé.
- **Mesures :** 11 contrôles consignés dans [essai.json](essais/roles-couleur/essai.json) et [results.json](checks/roles-couleur/results.json) ; 10 paires de captures avant/après.
- **Limites principales :**
  - Le dialogue « Créer un compte » de l’arrivée ne s’ouvre pas depuis l’interface (le compte est masqué sur l’écran d’arrivée) : il n’a été mesuré qu’en l’ouvrant par script.
  - Royal Pink #ED3491 avec un texte encre atteint 4,51:1, juste au-dessus du seuil : toute variante plus sombre au survol ferait échouer le contraste, d’où la couleur identique au survol.
  - Dans le dialogue de connexion de l’arrivée, les deux boutons se touchent (aucun espace dans le socle) : le trait neutre rend ce contact visible ; l’espacement n’est pas modifié, par périmètre strict.

#### Contour de « Visiter » en sombre (`visiter-contour-sombre`)

En sombre seulement, « Visiter » à l’arrivée et « Créer un compte » dans le menu du compte gardent leur texte Royal Pink et reçoivent un contour fin visible, équivalent sombre du conteneur clair, pour ne plus se lire comme un lien.

- **Décision concernée :** 13 octobre 2026 : l’utilisateur a demandé le texte Royal Pink pour Visiter et Créer un compte en sombre, et des dimensions de Visiter égales à celles de Se connecter. Les deux sont conservés ; seul un contour est ajouté.
- **Vérification contradictoire :** validé.
- **Mesures :** 9 contrôles consignés dans [essai.json](essais/visiter-contour-sombre/essai.json) et [results.json](checks/visiter-contour-sombre/results.json) ; 9 paires de captures avant/après.
- **Limites principales :**
  - Mesuré mais hors périmètre : en sombre, le texte rose de « Créer un compte » n’atteint que 3,85:1 (FR) et 3,74:1 (AR) sur le verre du menu, sous le seuil de 4,5:1 pour un texte de taille normale (Visiter atteint 4,51:1 sur le fond #1B1B1B de l’arrivée) ; l’essai ne change pas cette couleur choisie par l’utilisateur.
  - Pour comparaison, le contour clair existant (#DCE5E5) n’est qu’à 1,1–1,2:1 de son fond ; il est laissé tel quel.
  - Sur mobile clair, la comparaison au pixel près exclut le canevas du chiffrement ; pas d’écran physique ni de lecteur d’écran.

#### Illustrations variées dans les listes (`illustrations-variees`)

Les contenus fictifs qui répètent le même motif reçoivent une variante de palette tirée de la charte (fond et décor seulement), fixe pour chaque contenu : deux cartes voisines n’affichent plus la même image.

- **Vérification contradictoire :** validé.
- **Mesures :** 10 contrôles consignés dans [essai.json](essais/illustrations-variees/essai.json) et [results.json](checks/illustrations-variees/results.json) ; 9 paires de captures avant/après.
- **Limites principales :**
  - Le choix suit l’ordre par défaut (plus récents d’abord) ; il est vérifié aussi en ordre inverse sur toutes les pages, mais un tri « favoris d’abord » ou un filtre (campus, catégories) peut rapprocher deux contenus de même palette.
  - Tous les contenus actuels sont fictifs : deux des sept exemples d’origine reçoivent aussi une variante (network-messages-between-us, sous ft_transcendence dans la grille, et journal-share-the-unfinished, deuxième chronique), sans quoi ils resteraient identiques à leur voisin.
  - Les variantes changent le fond et le décor, pas le dessin : deux cartes voisines de même motif restent reconnaissables comme le même type d’illustration.

### Typographie, lisibilité et pages

#### Textes plus lisibles (`lisibilite-textes`)

Les petits textes utiles ne descendent plus sous 13 px et les petites actions (Favoris, Signaler, Envoyer un message, Explorer un campus…) passent à 14 px ; les petits textes en couleur d’accent prennent l’accent lisible déjà présent dans le site (#0C7677 en clair, #F485BD en sombre).

- **Vérification contradictoire :** corrigé. La pastille de statut agrandie était rognée dans la vue Liste des Profils sous 1200 px : elle y garde sa taille d’origine.
- **Mesures :** 14 contrôles consignés dans [essai.json](essais/lisibilite-textes/essai.json) et [results.json](checks/lisibilite-textes/results.json) ; 17 paires de captures avant/après.
- **Limites principales :**
  - Libellés du dock mobile laissés à 11 px : à 390 px, « Chroniques » occuperait environ 64 px d’une case de 67 px en 13 px, et à 320 px le dock masque déjà les libellés inactifs (cases de 48 px) ; les relever demanderait de revoir le dock, hors périmètre.
  - Ligne arabe du logotype (أفق, 11 à 14 px selon la largeur) laissée telle quelle : elle fait partie du logotype (voir l’essai titres-marque).
  - Dans les modes compacts des fiches (fenêtres basses, choisis par detail-scroll), le surtitre, les faits et les actions gardent leurs tailles réduites (10 à 12 px) ; les densités choisies ne changent pas (mesuré), mais ces modes n’ont été ni audités ni capturés.

#### Signature typographique de la marque (`titres-marque`)

Le mot-symbole HORIZON ↔ AWARDS de l’en-tête et le slogan « BEYOND THE CODE » révélé après la connexion simulée passent en Jost 800 italique, substitut provisoire du Futura PT Heavy Oblique de la charte ; la ligne arabe أفق garde sa famille et prend sa graisse grasse réelle.

- **Décision concernée :** Point en attente, non daté, de la section « Produit et décisions à préserver » de PROJECT_CONTEXT.md : « Futura PT Heavy Oblique reste un point en attente […] HORIZON reste provisoirement en Jost Medium ; la proposition arabe أفق utilise Noto Sans Arabic Medium ». L’essai propose un substitut Jost 800 italique sans trancher ce point.
- **Vérification contradictoire :** corrigé. Le slogan « BEYOND THE CODE » n’est plus rogné, et le message chiffré ne passe plus en gras italique avant le décryptage.
- **Mesures :** 7 contrôles consignés dans [essai.json](essais/titres-marque/essai.json) et [results.json](checks/titres-marque/results.json) ; 12 paires de captures avant/après.
- **Limites principales :**
  - Jost 800 italique n’est qu’un substitut géométrique : Futura PT Heavy Oblique, police de la charte, n’est toujours pas disponible ; les proportions et l’angle diffèrent.
  - Le mot plus large (environ +5 px à 1440 px, +3 à 4 px sur mobile) décale d’autant le symbole 42 en arabe, où la marque est ancrée à droite ; en français le symbole ne bouge pas.
  - La ligne arabe ne s’alourdit que si une face grasse réelle de Noto Sans Arabic existe sur l’appareil (c’est le cas sur cette machine) ; sinon elle reste en graisse normale, sans gras simulé. La proposition Figma أفق en Noto Sans Arabic Medium n’a pas d’équivalent chargé par le site.

#### Titres plus affirmés (`titres-forts`)

Les titres des fiches (projet, chronique, nom du profil), les titres des cartes et les intertitres des fiches (À propos, Technologies et savoir-faire, Équipe, Réseaux et liens…) passent en graisse 700 réelle, droite et sans capitales, à taille inchangée, avec un interlettrage resserré de 0,02 em ; en arabe, la vraie face grasse de Noto Sans Arabic est utilisée.

- **Vérification contradictoire :** validé.
- **Mesures :** 11 contrôles consignés dans [essai.json](essais/titres-forts/essai.json) et [results.json](checks/titres-forts/results.json) ; 12 paires de captures avant/après.
- **Limites principales :**
  - Jost Bold n’est qu’un substitut : la charte prévoit Futura PT Heavy, toujours indisponible ; la graisse 700 demandée reste en deçà d’un Heavy.
  - Plus de retours à la ligne, sans débordement ni troncature : en latin surtout dans les Chroniques à 1440 px (8 titres sur 78 en français gagnent une ligne, dont 7 passent de 2 à 3 lignes) ; en arabe, où l’interlettrage n’a presque pas d’effet, jusqu’à 19 titres sur 78 dans les Chroniques à 390 px ; au total, 94 cartes sur 2 574 deviennent plus hautes (jusqu’à +41 px).
  - Le gras arabe dépend de la présence de Noto Sans Arabic Bold sur l’appareil (police système de cette machine, non chargée par le site) ; ailleurs, la face normale reste, sans gras simulé. Ni macOS, ni Windows, ni Android n’ont été testés.

#### Échelle et arrondis unifiés (`echelle-unifiee`)

Démonstrateur d’un système consolidé : les principaux composants passent sur une échelle courte de tailles (12, 14, 16, 20, 28 et 35 px), trois rayons (12, 20 et 999 px) et deux niveaux d’ombre, sans toucher aux couleurs ni à la disposition. Les titres, les déclencheurs Filtrer/Affichage/Trier, les noms d’auteur et les images des cartes restent progressifs entre deux paliers ; les autres tailles prennent un palier fixe.

- **Décision concernée :** 6 octobre 2026, « Adapter toute la page, sans paliers de taille » : l’utilisateur remarque « les changements de taille quand je réduis la fenêtre » et précise que « les titres n’étaient qu’un exemple : cela concerne les autres éléments également » ; textes, boutons, vignettes, portraits et espacements reçoivent alors des tailles progressives, les petits libellés restant stables. L’essai revient en partie sur ce choix : il garde les progressions des titres, des déclencheurs, des noms d’auteur et des images de cartes, mais entre deux paliers ; il fige sur un palier des tailles jusque-là progressives (extraits des cartes 14 → 15 px, dates et campus des cartes 11 → 12 px, sélecteur Monde 13 → 15 px, noms des cartes Profils 18 → 21 px) et ajoute un petit saut des titres de cartes à 390 px (19,08 → 20 px). Il supprime en revanche quatre sauts de la base entre mobile et ordinateur (titres de blocs 19/20 px, textes de lecture 15/16 px, titres de récompenses 14/15 px, textes secondaires 13/14 px).
- **Vérification contradictoire :** corrigé. Au fil de trois vérifications, six défauts sont corrigés dans le style : portraits devenus ovales, ombre sans effet sur le sélecteur Monde, pastille rognée avec les textes plus lisibles, indication et état vide à 16 px, règle inutile, pseudos des cartes de profils remis à 12 px ; la fiche est réécrite depuis les mesures et signale la décision du 6 octobre.
- **Mesures :** 15 contrôles consignés dans [essai.json](essais/echelle-unifiee/essai.json) et [results.json](checks/echelle-unifiee/results.json) ; 19 paires de captures avant/après.
- **Limites principales :**
  - Démonstrateur seulement : une feuille de surcharge chargée en dernier, qui ajoute des sélecteurs au lieu d’en retirer. La vraie consolidation — jetons comme source unique dans shared/figma/tokens.css, feuilles moins nombreuses, suppression des valeurs locales et des surcharges — est un travail structurel qu’un essai ne peut pas montrer ; les 67 valeurs de font-size et 34 de border-radius restent déclarées dessous.
  - Progressions du 6 octobre en partie revisitées (voir « Décision concernée ») : l’échelle n’est exacte qu’à 390 px et à partir de 1024 px ; entre les deux, titres, déclencheurs et images de cartes passent par des valeurs intermédiaires (13,4, 25,6 et 32,9 px, rayon 16,5 px à 834 px), tandis que les extraits, dates et campus des cartes, le sélecteur Monde et les noms des cartes Profils ne varient plus avec la largeur.
  - Petit saut au seuil de 390 px : sous cette largeur, les titres des cartes de la grille gardent la taille de la base (18 à 19,08 px, sinon « ft_transcendence » ne tient plus dans la colonne de 129 px à 320 px), puis passent à 20 px ; en redimensionnant la fenêtre, ils sautent donc de 0,9 px à 390 px. Les titres des fiches projet et chronique gardent la rampe de la base 22 → 28 px (un 28 px fixe les faisait passer sur deux lignes sur mobile).

#### Page Awards « à venir » (`awards-a-venir`)

Une seule phrase centrée, « Les 42 Awards arrivent bientôt. » (aussi en anglais et en arabe), sous le trophée du menu en gris discret, sur la page 42 Awards aujourd’hui vide. Rien d’autre ne change : ni lien ni contenu, ni l’animation HORIZON → AWARDS, ni le dock.

- **Décision concernée :** 7 octobre : « un bouton 42 Award dans le menu principal, avec une page vide en dehors du header et du menu » (page ne contenant que l’en-tête et le menu). L’essai y ajoute une phrase d’attente.
- **Vérification contradictoire :** corrigé. Un commentaire du code et une limite inexacte de la fiche sont corrigés ; aucune règle de style n’est modifiée.
- **Mesures :** 15 contrôles consignés dans [essai.json](essais/awards-a-venir/essai.json) et [results.json](checks/awards-a-venir/results.json) ; 14 paires de captures avant/après.
- **Limites principales :**
  - La phrase n’est pas annoncée automatiquement : en arrivant sur Awards, la copie annonce toujours « 42 Awards » et place le focus sur le bouton du dock ; la phrase se lit dans le contenu principal, après le menu. Elle figure bien dans l’arbre d’accessibilité de Chrome, mais aucun lecteur d’écran réel n’a été essayé.
  - Traduction arabe « جوائز 42 قادمة قريبًا. » rédigée par l’assistant à partir du nom du dock, non relue par un arabophone.
  - Icône en gris secondaire, choisie pour la discrétion comme dans le bloc vide « Distinctions » des profils ; le premier brouillon utilisait le turquoise 42.

## Combinaisons

Le 15 octobre, l’utilisateur décide de ne pas faire contrôler d’avance toutes les combinaisons possibles : **seule la sélection finale de l’utilisateur sera testée en combinaison**, une fois son choix fait. Les trois contrôles prévus (sélection compatible, tous les essais, ensembles susceptibles d’interagir) et la passe d’intégration ne sont donc pas lancés. La sélection retenue le jour même est testée plus bas.

Pendant les vérifications individuelles, plusieurs combinaisons ont déjà été contrôlées, dont les mélanges les plus susceptibles d’interagir :

- les quatre essais d’Explorer ensemble, avant et après un changement de langue et de thème : un seul titre « 42 Paris », aucune erreur ;
- les illustrations adaptées au sombre avec les rôles de couleur, le contour de Visiter et les illustrations variées ; la paire exclusive avec les illustrations atténuées est bien ignorée ;
- le contour de Visiter avec les rôles de couleur ;
- le voile sous la pile basse avec la recherche repliée, à 390 × 844 et 320 × 640 ;
- les titres plus affirmés avec les textes plus lisibles et la signature de marque, puis avec l’échelle unifiée (70 titres sur 6 vues, aucun débordement) ;
- l’échelle unifiée avec les textes plus lisibles et les titres plus affirmés : une pastille rognée par cette combinaison y a été corrigée, puis 380 contrôles des tailles minimales et 152 contrôles de titres passent ;
- le pseudo manquant avec les textes plus lisibles, les titres plus affirmés, l’échelle unifiée et une colonne sous 360 px ;
- la page Awards « à venir » avec 17 essais actifs : son message reste identique au pixel près.

Ces contrôles ne garantissent pas tous les mélanges : la galerie peut tout combiner, mais un conflit reste possible tant que la sélection retenue n’est pas testée.

## Sélection retenue le 15 octobre

L’utilisateur retient neuf essais pour les voir ensemble : 01 Globe dans l’espace libre, 03 Étiquettes du globe en Jost, 07 Une colonne sous 360 px, 09 Sans « pseudo à renseigner », 12 Rôles de couleur unifiés, 13 Contour de « Visiter » en sombre, 15 Textes plus lisibles, 18 Échelle et arrondis unifiés, 19 Page Awards « à venir ». La combinaison est d’abord testée sur la copie, puis intégrée au prototype actif à la demande de l’utilisateur ([notes d’intégration](../../site/notes/DESIGN_REVIEW_SELECTION_NOTES.md)).

[Ouvrir la sélection](baseline/content-preview.html?essais=globe-espace-libre,police-etiquettes-globe,une-colonne-320,pseudo-manquant,roles-couleur,visiter-contour-sombre,lisibilite-textes,echelle-unifiee,awards-a-venir#explore) · [scripts et résultats du test](checks/_selection-20261015/)

Test du 15 octobre : deux contrôles parallèles en lecture seule (Explorer, arrivée et Awards ; rubriques, fiches et dialogues), puis une passe d’intégration qui reproduit chaque point avec le plus petit ensemble d’essais. **Aucun conflit bloquant.** Un conflit est corrigé entre le globe réduit et les textes plus lisibles, un défaut propre aux textes plus lisibles est corrigé, quatre points sont consignés sans correction et une alerte concerne un défaut déjà présent dans le site actuel. Les comptes rendus complets sont dans [selection-20261015.json](checks/_reprise/selection-20261015.json). Points traités, dans les mots de l’agent d’intégration :

- **Conflit corrigé :** Air sous le globe réduit (globe-espace-libre) sous 16 px en arabe avec lisibilite-textes. Les bandes fixes de globe-espace-libre ont été mesurées sans lisibilite-textes, qui agrandit « Exploration · 42 Horizon » (12 → 13 px sur ordinateur, 10 → 13 px sous 701 px). Reproduit avec globe-espace-libre et lisibilite-textes seuls (chargements directs, vrai globe) : en arabe, l’air passe de 17,0 à 14,0 px à 1440 × 900 (même chose à 1366 × 768, 1280 × 720 et 1920 × 1080) et de 17,0 à 10,0 px à 680 × 560. echelle-unifiee n’y est pour rien : avec globe-espace-libre seul, l’air reste à 17,0 px. J’ai trouvé un troisième effet du même conflit, que les contrôleurs n’avaient pas signalé : à 700 × 500 (paysage étroit et bas, disque non bloqué au zoom minimal), la ligne de statistiques passée à 13 px fait tomber l’air au-dessus du disque de 17,0 à 15,6 px. — Dans essais/globe-espace-libre/essai.css, j’ai ajouté trois bandes qui ne s’appliquent que si lisibilite-textes est actif (:root[data-essais~=lisibilite-textes], le mécanisme qu’utilise déjà echelle-unifiee). Leurs valeurs reprennent le pire cas arabe mesuré avec les deux essais : bande basse à 196 px sur ordinateur et tablette (au lieu de 193), bande basse à 181 px en paysage étroit d’au moins 521 px de haut (au lieu de 174), bande haute à 151,9 px en paysage étroit bas (au lieu de 150,4). globe-espace-libre seul ne change pas : rayons 240,0 / 174,0 / 150,0 / 330,0 / 302,0 / 89,0 / 82,6 px, bandes et marges identiques. Avec lisibilite-textes, comme avec les neuf : rayons de 237,0 / 171,0 / 147,0 / 327,0 / 299,0 px aux tailles d’ordinateur et de tablette, 82,0 px à 680 × 560 et 81,1 px à 700 × 500. L’air est d’au moins 17,0 px en arabe et de 26,0 px en français et en anglais, et le disque reste centré à 0 px. La fiche essai.json (changement, vérifications, limites, fichiers) et checks/globe-espace-libre/results.json (ajout de integration20261015 et du contrôle bandsFollowLisibiliteTextes) sont mis à jour.
- **Défaut d’un essai corrigé :** lisibilite-textes réduisait sur ordinateur la ligne d’aide du globe (« 58 campus · 30 pays », « Choisis un campus pour t’en approcher. », « Explore les alentours du campus. ») de 14 à 13 px. Sa règle, de spécificité (1,3,1), l’emportait sur la règle de la copie (0,4,1) à toutes les largeurs, contrairement à sa fiche (« seules des tailles augmentent »). Reproduit avec lisibilite-textes seul : 14 → 13 px à 1440 × 900 et à 844 × 390. Sous 701 px, la hausse de 12 à 13 px est voulue. Ses vérificateurs n’avaient pas mesuré le périmètre dans Explorer. — Dans essais/lisibilite-textes/essai.css, la ligne d’aide (.globe-status p) n’est plus relevée à 13 px que sous @media(max-width:700px) ; « Exploration · 42 Horizon » garde ses 13 px partout. Cette correction change l’essai seul, et c’est la seule façon de corriger, puisque la règle fautive lui appartient : sur ordinateur, la ligne d’aide revient aux 14 px de la copie, comme le décrit sa fiche. J’ai revérifié son périmètre dans Explorer, sur le même DOM en coupant puis rétablissant la feuille : 5 formats globe bloqué, puis les niveaux Monde, Pays et Campus avec le vrai globe. Aucune taille ne baisse ni ne dépasse 14 px, aucune couleur ne change, et la ligne d’aide est à 14 px aux trois niveaux sur ordinateur. La bande haute de globe-espace-libre (168,3 px) redevient exacte. La fiche essai.json (changement, vérifications, limites, fichiers) et checks/lisibilite-textes/results.json (ajout de integration20261015 et du contrôle scopeExplorer) sont mis à jour.
- **Non corrigé :** En paysage, à 667 × 375 et en arabe, l’air au-dessus de la bille passe de 16,5 px (globe seul) à 15,0 px avec lisibilite-textes, car la ligne de statistiques passe de 12 à 13 px. Le disque est déjà bloqué au zoom minimal de MapLibre (rayon de 20,65 px). Reproduit avec globe-espace-libre et lisibilite-textes ; les valeurs sont les mêmes après correction, et la nouvelle bande haute (151,9 px) s’applique sans effet. En complément : globe-espace-libre seul ne laisse déjà que 15,0 px en arabe à 844 × 390, pour la même raison ; c’est un constat de l’essai seul, jusque-là non consigné. — Aucune correction n’est possible dans le périmètre des essais : réduire encore la bille demanderait de modifier le moteur du globe, et garder la ligne à 12 px casserait le plancher de 13 px de lisibilite-textes. J’ai consigné la limite dans les deux fiches : dans celle de globe-espace-libre, avec le cas 844 × 390 de l’essai seul, et dans celle de lisibilite-textes.
- **Non corrigé :** À 390 × 844, dans la grille Projets en deux colonnes en sombre, le nom « Arun Suri » passe sur deux lignes, et la coupure tombe à l’espace. Reproduit avec lisibilite-textes seul (12,2 → 13 px) ; c’est identique avec lisibilite-textes et echelle-unifiee, et avec les neuf, alors qu’echelle-unifiee seul garde le nom sur une ligne. La copie replie déjà quatre noms à cette même largeur (Luiza Costa, Leïla Mansour, Caio Mendes, Tomás Vieira). Il n’y a ni mot coupé, ni chevauchement, ni conflit entre essais. — Aucune correction : c’est l’effet attendu du plancher de 13 px, identique seul et combiné. J’ai ajouté la limite à essais/lisibilite-textes/essai.json.
- **Non corrigé :** Vue Liste des Profils en arabe : la pastille « خريج / خريجة » (Alumni) passe sur deux lignes dans sa vignette, qui s’allonge. Les rangées Alumni mesurent 132 px au lieu de 114 px (112,5 px dans la copie). La cause est echelle-unifiee seul (11 → 12 px) ; le résultat est identique avec lisibilite-textes et echelle-unifiee, et avec les neuf, alors que ni lisibilite-textes seul ni pseudo-manquant seul ne le provoquent. Contrairement au rapport (360 px et moins), l’effet couvre toutes les largeurs de 320 à au moins 768 px (139 contre 121 px à 768 px) ; la pastille tient sur une ligne à 1024 et à 1199 px. Elle n’est jamais rognée et ne touche rien. — Aucune correction : la seule possible dans le périmètre serait de garder la pastille à 11 px, ce qui changerait l’essai seul et la sortirait de l’échelle, sans décision de l’utilisateur. J’ai ajouté la limite à essais/echelle-unifiee/essai.json, avec les largeurs mesurées.
- **Fausse alerte :** En sombre, le texte Royal Pink de « Créer un compte », dans le menu du compte, n’atteint pas 4,5:1 sur le verre. Mesuré sur les pixels : 3,84:1 à 1440 px en français, dans la copie, avec visiter-contour-sombre seul et avec les neuf ; 3,41:1 à 390 px en arabe dans la copie et avec visiter-contour-sombre seul, et 3,74:1 avec les neuf, parce que le verre floute un autre fond. Aucun des essais ne change cette couleur. Le contour #708383 voulu par visiter-contour-sombre est bien présent : 3,68:1, et 3,27 à 3,58:1 à 390 px. — Aucune correction dans la combinaison. Le défaut existe déjà dans la copie : c’est la couleur choisie par l’utilisateur le 13 octobre, déjà signalée dans les limites de visiter-contour-sombre. La changer demande sa décision.
- **Non corrigé :** Constat hors combinaison du premier contrôleur, que j’ai revérifié : à 320 × 640 en arabe, en portrait, où globe-espace-libre ne s’applique pas, le disque de la copie recouvre déjà le bas de « Exploration · 42 Horizon » (−9,0 px, et −3,0 px en français). Avec lisibilite-textes seul, ce recouvrement passe à −16,0 px (−7,0 px en français), et c’est identique avec les neuf. Le texte reste lisible sur le bord pâle de l’océan. — Aucune correction : le recouvrement existe déjà dans la copie et son agrandissement vient de l’essai seul. J’ai ajouté la limite à essais/lisibilite-textes/essai.json.

**Fichiers modifiés :** `essais/globe-espace-libre/essai.css`, `essais/globe-espace-libre/essai.json`, `checks/globe-espace-libre/results.json`, `essais/lisibilite-textes/essai.css`, `essais/lisibilite-textes/essai.json`, `checks/lisibilite-textes/results.json`, `essais/echelle-unifiee/essai.json`, `checks/_selection-20261015/integration/ (créé : commun.py, globe_bandes.py, listes_compte.py, perimetre_lisibilite.py, parcours_globe.py, passe_finale.py, fiches_valides.py, maj_fiches.py, bilan.py, results.json, results-*.json, log-*.txt, empreintes-essais-avant.txt et empreintes-essais-apres.txt, captures/, planches/)`, `snapshot-verification.json (réécrit par snapshot.py --verify, mêmes valeurs)`.

**Contrôle final de la combinaison :**

- Explorer à 1440 × 900, clair, français, vrai globe, avec les neuf : disque de 237,01 px centré à 0 px. Air : 80,99 px avec le filtre, 50,69 avec les statistiques, 25,99 avec le statut, 63,99 avec la recherche et 74,96 avec le dé. Étiquettes en « Jost, sans-serif » (25 repères), ligne d’aide à 14 px, statut à 13 px, libellé de la recherche à 14 px. Aucune erreur ni débordement. Planche f1 examinée.
- Explorer à 390 × 844, sombre, français, vrai globe : disque de 190,92 px, inchangé en portrait comme le prévoit globe-espace-libre, au moins 59 px d’air, étiquettes en Jost, sans erreur ni débordement.
- Neuf essais aux autres formats (vrai globe) : 237,0 / 171,0 / 147,0 / 327,0 / 299,0 px de rayon à 1440 × 900, 1366 × 768, 1280 × 720, 1920 × 1080 et 768 × 1024 ; 82 px à 680 × 560 et 81,1 px à 700 × 500. Air d’au moins 16,99 px en arabe partout, sauf aux formats bloqués au zoom minimal (667 × 375 à 15,0 px ; 844 × 390 à 17,0 px). Centre à 0 px, sans erreur.
- Parcours avec les neuf : arrivée → Visiter → révélation sur le disque de 237,01 px ; Monde → Projets avec le globe logé dans le médaillon (16,0 px, centré) ; retour à Explorer ; passage en arabe sombre par les réglages sans rechargement (237,01 px, air de 16,99 px). Aucune erreur.
- Projets à 320 × 640 en arabe : une colonne (280px), aucun nom ni titre coupé au milieu d’un mot, aucune pastille rognée, métadonnées à 13 px en #0C7677, rayon des cartes de 20 px. Aucune erreur ni débordement. Planche f2 examinée : la recherche flottante recouvre du contenu comme dans la copie.
- Profils à 1440 px : aucune mention « pseudo à renseigner » visible, et les vrais pseudos (@lcosta, @imorel, @lmansour…) restent affichés.
- Fiche ft_transcendence, onglet Commentaires (1440 px clair FR, 390 px sombre AR) : « Ajouter » en 42 Blue sur texte encre (7,18:1) puis en Royal Pink sur texte encre (4,51:1) ; Emoji et Favoris à 14 px, zone de saisie arrondie à 12 px. Aucune erreur ni débordement. Planche f2 examinée.
- Dialogue Filtrer (1440 px clair FR, 390 px sombre AR) : rayon de 20 px, ombre de niveau 2. « Appliquer » à 14 px atteint 7,18:1 en clair et 4,51:1 en sombre, « Annuler » 15,47:1 et 14,47:1. Aucun libellé rogné. Planche f3 examinée.
- Arrivée en sombre (1440 et 390 px) : Visiter et Se connecter ont les mêmes dimensions (153,6 × 52 et 342 × 52 px), en 16 px avec un rayon de 12 px. Contour de Visiter #708383 à 4,32:1, textes à 4,51:1. Focus clavier visible (trait plein de 2 px) sur le changement de thème, Se connecter et Visiter. Dialogue de connexion : rayon de 20 px, boutons à 4,51:1 et 16,2:1, non rognés. Planche f4 examinée.
- 42 Awards (1440 px clair FR, 390 px sombre FR) : « Les 42 Awards arrivent bientôt. » en 20/28 px, sur une ligne, centré à 0 px, à 228 et 222 px sous le fondu de l’en-tête et à 324 et 311 px au-dessus du dock. Planche f5 examinée.
- Aucune erreur de console ni défilement horizontal dans toutes les vues de la passe finale et dans tous les relevés du globe.
- Les neuf essai.json sont du JSON valide, avec tous les champs lus par la galerie ; leurs fichiers (4 à 14 par fiche) et leurs captures (10 à 38 par fiche) existent tous (results-fiches.json).
- snapshot.py --verify, lancé en dernier : copie figée intacte.

**Limites :**

- Reste un écart entre la combinaison et les essais seuls : en paysage, à 667 × 375 en arabe, 15,0 px d’air au-dessus de la bille au lieu de 16,5 px avec le globe seul. Il est inévitable sans modifier le moteur du globe ou le plancher de lisibilite-textes, et il est consigné. globe-espace-libre seul ne laisse lui-même que 15,0 px en arabe à 844 × 390.
- Les effets de deux essais seuls restent tels quels, documentés, en attente d’une décision de l’utilisateur : « Arun Suri » sur deux lignes à 390 px (lisibilite-textes), et la pastille Alumni arabe sur deux lignes avec des rangées de 18 px plus hautes, de 320 à au moins 768 px (echelle-unifiee).
- Le contraste de « Créer un compte » en sombre (3,4 à 3,8:1) existe déjà dans la copie et n’est pas traité : la couleur a été choisie par l’utilisateur.
- lisibilite-textes change seul sur un point : sur ordinateur, sa ligne d’aide du globe revient de 13 à 14 px, la valeur de la copie. globe-espace-libre seul ne change pas ; avec lisibilite-textes, son disque perd 3 px de rayon sur ordinateur et tablette, 7 px à 680 × 560 et 1,5 px à 700 × 500.
- NOTES.md est généré à partir des essai.json par checks/_reprise/notes_final.py ; il a été régénéré à 12 h 04, avant mes modifications des fiches (12 h 20 à 12 h 31). L’agent principal doit le régénérer : le nombre de contrôles passe de 13 à 14 pour globe-espace-libre et pour lisibilite-textes, et les limites changent.
- Le chargeur garde ?v=1 (boot.js est hors du périmètre autorisé) et le serveur n’envoie que Last-Modified. Le navigateur de l’utilisateur peut donc encore servir les anciennes feuilles en cache ; un rechargement forcé (Ctrl+Maj+R) peut être nécessaire.
- Les comparaisons de styles des contrôleurs, faites avant les corrections, ne sont pas rejouées : les corrections ne touchent qu’Explorer (ligne d’aide et bandes du globe), et la passe finale couvre les vues demandées. Le contrôle de la galerie (checks/galerie/check.py) n’est pas relancé, car il réécrirait des fichiers hors des dossiers des essais ; mon propre contrôle valide les fiches.
- Je n’ai pas recouvert le dialogue « Créer un compte » de l’arrivée, le menu du compte ouvert, la recherche ouverte ni la fenêtre « Autour du campus » ; mes corrections ne les touchent pas.
- Tous les contrôles ont été faits dans Chrome sans interface, en mouvement réduit, avec des formats émulés, sans téléphone physique ni lecteur d’écran ; l’anglais n’est mesuré que pour le globe.

## Sources et conservation

- [Socle et adaptations](SNAPSHOT.md) : copie figée du prototype du 14 octobre, **137 fichiers**, dont **11 adaptés** avec leurs originaux dans `originals/` ; [manifeste](snapshot-manifest.json) des empreintes et stockage isolé. Le prototype actif `horizon-welcome/` n’est pas modifié.
- Chaque essai vit dans `essais/<id>/` : `essai.css`, `essai.mjs`, `essai.json` (fiche lue par la galerie) et, pour trois essais typographiques, `early.js`. Le chargeur commun tient en trois fichiers : [boot.js](essais/boot.js), [styles.js](essais/styles.js) et [modules.mjs](essais/modules.mjs). Les polices Jost 700/800 et italiques sont dans [essais/_partage/](essais/_partage/fonts.css) avec leur licence OFL ; Jost reste un substitut, Futura PT n’est pas installée.
- Chaque essai a ses contrôles dans `checks/<id>/` : scripts de l’auteur et du vérificateur, mesures (`results.json` et contre-vérifications), captures `avant-*.png` et `apres-*.png`. Outils communs : [helper.py](checks/helper.py), [check-baseline.py](checks/check-baseline.py) et le [contrôle de la galerie](checks/galerie/check.py). Depuis le 23 octobre 2026, ces captures restent sur le poste de l’utilisateur, qui l’a décidé avant le premier envoi de ce dossier (environ 547 Mo) ; les scripts de contrôle les régénèrent.
- Galerie : [index.html](index.html), [gallery.css](gallery.css) et [gallery.mjs](gallery.mjs).
- [checks/_reprise/](checks/_reprise/) garde les comptes rendus de réalisation et de vérification des agents, le script de la dernière série, la surveillance mémoire et le générateur de ces notes.
- Les captures de l’avis (une centaine) restent temporaires, hors du dépôt ; chaque essai garde ses propres captures avant/après.
- La collection figure en tête du [registre des recherches](../research-archive/index.html).

## Vérifications réalisées

- **Socle** : 137 empreintes, 11 originaux et 206 références relatives contrôlés le 15 octobre, après la dernière vérification, sans manque ni sortie de l’étude (`python3 -I snapshot.py --verify` ; [preuve initiale](snapshot-verification.json)).
- **Équivalence** : avant la réalisation des essais, la copie sans essai et le prototype actif donnent **0 pixel d’écart** sur cinq états (Projets et Profils ordinateur clair, fiche projet mobile sombre, Chroniques mobile arabe, Explorer avec le vrai globe) ; [résultats](checks/baseline/results.json).
- **Essais** : les 19 essais sont réalisés, contrôlés par leur auteur, puis revérifiés par un second agent chargé de les contredire : **8 validés tels quels, 10 corrigés par leur vérificateur et 1 avec réserves** (le globe dans l’espace libre). Les vérificateurs ont rejoué les mesures, les formats 1440 × 900, 390 × 844 et 320 × 640, et les changements de langue et de thème sans rechargement ; ils ont corrigé les défauts trouvés dans les dossiers des essais.
- **Galerie** : [contrôle](checks/galerie/check.py) avec les fiches finales — 19 cartes sans fiche provisoire, dont 10 marquées « Revient sur une décision » ; 38 captures accessibles ; comparateur chargé des deux côtés (copie sans essai, copie avec l’essai) ; avertissement des paires exclusives ; aucun débordement à 1440, 390 et 320 px et aucune erreur de console ([résultats](checks/galerie/results.json), captures examinées).

Les contrôles utilisent Chrome sans interface et des formats émulés. Aucun téléphone physique, lecteur d’écran réel ou audit WCAG complet n’est revendiqué.

## Incidents

- **14 octobre au matin, mémoire saturée deux fois**, avec un plantage de VS Code : des profils de Chrome sans interface restés dans `/tmp` (en mémoire vive), puis plusieurs Chrome de contrôle sans plafond. Depuis, les profils sont gardés hors de `/tmp` et supprimés à la fermeture, et chaque Chrome tourne sous un plafond de 2,6 Go. Avec l’accord de l’utilisateur, 112 anciens profils sont supprimés.
- **Coupures réseau de l’API vers 13 h 30 puis vers 19 h** : les agents en cours sont perdus, leurs fichiers restent intacts. Les séries reprennent en unités plus petites, chaque étape étant relancée jusqu’à quatre fois ; après la seconde coupure, les étapes terminées sont relues dans un fichier de résultats au lieu d’être refaites.
- **Accélération demandée par l’utilisateur à 14 h 31** : jusqu’à trois Chrome de contrôle à la fois, démarrés seulement avec 3 Go libres. Le soir, avec un navigateur ouvert et l’échange plein, la garde descend à deux Chrome, puis à un seul sous 2 Go disponibles.
- **Pause demandée par l’utilisateur à 14 h 39**, reprise à 18 h 05.
- **Limite d’utilisation de la session atteinte à 20 h 34** : la dernière vérification est reprise le 15 octobre vers 3 h 55, après sa réinitialisation.

## Suite

La sélection de l’utilisateur est testée en combinaison, puis intégrée au prototype actif le 15 octobre, à sa demande, après archivage de l’état précédent ([notes d’intégration](../../site/notes/DESIGN_REVIEW_SELECTION_NOTES.md)). Les dix autres essais restent consultables dans la galerie ; la galerie compare toujours chaque essai à la copie figée du 14 octobre.
