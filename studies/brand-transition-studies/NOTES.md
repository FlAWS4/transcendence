# Dix transitions HORIZON ↔ AWARDS — 8 octobre 2026

**Choix explicite suivant, le 8 octobre :** l’utilisateur retient **08 — Cascade de lettres**. Le mouvement est maintenant raccordé à l’en-tête du prototype, avec sa durée de 1,25 s et les protections de navigation existantes ; [détails et contrôles du raccord](../../site/notes/BRAND_WORDMARK_NOTES.md). Les dix pistes restent consultables et inchangées. Les mentions « aucune piste choisie » ci-dessous décrivent les étapes antérieures.

L’utilisateur n’apprécie pas la transformation actuelle et demande des essais. Cette galerie est une nouvelle recherche séparée : aucune piste choisie ni animation du site remplacée.

## Première série — quatre propositions

1. **Fondu velouté** : disparition puis apparition avec un flou léger ; 850 ms.
2. **Passage vertical** : les mots entiers se relaient dans une fenêtre masquée ; 900 ms.
3. **Le R comme repère** : seule lettre commune, le R reste visible puis rejoint sa position dans le mot suivant ; les autres lettres sortent avant son déplacement et entrent ensuite ; 1 200 ms.
4. **Balayage lumineux** : un trait fin sépare les parties visibles des deux mots, puis disparaît à la fin ; 1 050 ms.

Durées et effets proposés par l’assistant, à comparer. Chaque carte possède deux destinations explicites, Rejouer et un curseur qui pilote les mêmes images que la lecture animée. Les deux commandes communes permettent une comparaison simultanée ; vitesse normale, ralentie ou rapide, thème clair/sombre. Une inversion en cours conserve la progression complémentaire.

## Identité et fonctionnement

- Symbole officiel `../../shared/brand/logo-42.svg` conservé, sans transformation de son dessin ; blanc en sombre par le traitement déjà utilisé dans le prototype.
- Jost Medium locale, espacement −0,035 em, proportion symbole/texte 58/25 et intervalle 22/25, comme l’en-tête. Le format de démonstration agrandit cet ensemble sans modifier ses proportions.
- Couleurs issues des jetons existants, turquoise en clair et rose en sombre. L’espace du mot réserve la largeur maximale des deux noms pour stabiliser le symbole dans cette comparaison.
- Aucun caractère aléatoire, shader, image générée ou dépendance nouvelle. CSS et module JavaScript locaux ; calcul de positions depuis les métriques de la police réellement chargée.
- Noms accessibles stables, boutons et curseurs au clavier. La réduction des mouvements termine immédiatement la transition demandée ; le curseur reste utilisable manuellement. Masquer l’onglet termine aussi la destination.

## Préservation et vérification

Les sources actives de l’en-tête et toutes les anciennes explorations restent intactes. Références de conception : `../../site/notes/BRAND_WORDMARK_NOTES.md`, `brand-wordmark.mjs`, `brand-wordmark.css` et styles de la marque actuelle.

Syntaxe JavaScript, absence d’erreur de diff et existence des références locales contrôlées. Un contrôle direct des fonctions de rendu parcourt **808 images calculées**, dans les deux sens : valeurs finies, opacités bornées et huit paires début/fin exactes. La continuité d’inversion des positions, opacités et flous est contrôlée numériquement à six instants pour les trois premières variantes. La quatrième utilise deux zones de découpe complémentaires de part et d’autre du même trait. Ces contrôles portent sur les calculs ; ils ne remplacent pas le rendu de la police dans le navigateur.

La revue source corrige aussi deux cas : inverser le R conserve maintenant son déplacement vertical exact, et masquer l’onglet ne change pas la destination d’une carte restée au repos. Les contrôles navigateur sont à consigner par l’agent principal : aucune vérification mobile, du rendu ou sur téléphone physique n’est revendiquée dans cette première livraison.

Lancement depuis la racine du dépôt : `python3 -m http.server 8765 --bind 127.0.0.1`, puis [ouvrir la galerie](http://127.0.0.1:8765/studies/brand-transition-studies/index.html).

## Contrôle Chrome — 8 octobre 2026

Galerie examinée en clair sur ordinateur (1 910 px puis 1 280 px) et en sombre à 320 × 640. Boutons communs joués dans les deux sens : quatre états finaux 42 AWARDS puis 42 HORIZON confirmés. Les quatre curseurs ont été placés à 50 % au retour ; captures des deux paires examinées : extinction du fondu, ouverture verticale, R isolé, zones de découpe complémentaires du balayage. Rejouer de la piste 03 joué sur mobile. État final AWARDS lisible, largeur de page de 305 px pour une fenêtre de 320 px sans dépassement. Thème clair et format habituel rétablis, galerie laissée ouverte. Pas de téléphone physique, de mesure FPS ni de validation utilisateur de l’un des essais. Animation active inchangée.

## Suite du 8 octobre — six nouvelles pistes, dix au total

L’utilisateur demande cinq propositions supplémentaires, puis corrige immédiatement sa demande en **six**, pour en comparer dix. Les quatre premières restent dans la galerie avec les mêmes paramètres et calculs. Avant modification, leur dossier complet a été copié dans [une galerie initiale consultable](archive/initial-20261008/index.html) ; son [manifeste](archive/initial-20261008/manifest.json) conserve les empreintes des quatre fichiers originaux et ses dépendances partagées. Aucune animation de l’application n’est remplacée et aucun choix utilisateur n’est déduit.

5. **Pivot de face** : rotation du nom dans la profondeur, avec une légère variation de lumière ; 950 ms.
6. **Coupe diagonale** : deux zones obliques complémentaires, sans translation ni trait lumineux ; 1 000 ms.
7. **Compression** : le mot se resserre horizontalement au centre, puis le suivant se déploie ; 950 ms.
8. **Cascade de lettres** : retrait lettre par lettre, puis composition du nouveau nom ; 1 250 ms. Les mots ne se superposent pas et aucun caractère aléatoire n’est introduit.
9. **Ouverture centrale** : le nouveau nom s’ouvre du centre vers les bords ; 1 100 ms.
10. **Deux volets** : les deux moitiés du nom s’écartent légèrement, puis celles du suivant se rassemblent ; 1 100 ms.

Les durées et mouvements sont des propositions de l’assistant. Chaque essai conserve boutons HORIZON/AWARDS, Rejouer et curseur ; commandes communes, thèmes et vitesses sont partagés. Les positions de la cascade suivent les métriques de Jost chargée, y compris son espacement et ses paires de lettres. Le symbole 42, les proportions et l’espace réservé au mot restent stables. Les six nouvelles chronologies utilisent une même référence HORIZON → AWARDS ; l’inversion échange les couches à la progression complémentaire, sans relancer une animation CSS indépendante.

### Contrôles techniques et correction d’interruption

**Sept tests passent** avec `node studies/brand-transition-studies/studies.test.mjs` :

- métadonnées des quatre premières pistes identiques et **808 images calculées** strictement égales à leur version archivée ;
- **2 020 images calculées** finies pour les dix pistes dans les deux sens, avec états de départ/arrivée exacts ;
- inversion des six nouvelles à **14 instants chacune**, y compris autour du milieu, en conservant transformations, opacités, masques, lettres et fragments ;
- partage continu de la surface dans l’ouverture centrale et absence de superposition des noms dans la cascade ;
- vrai contrôleur avec DOM/RAF simulés : annulation immédiate, inversion en cours, vitesse, rejeu, réduction des mouvements, onglet masqué et curseurs manuels.

La revue indépendante trouve un cas concret dans le contrôleur commun : demander HORIZON juste après AWARDS, avant la progression de la première image, pouvait laisser le départ en attente et finir sur AWARDS. Le retour anticipé annule maintenant ce RAF. Un test couvre le clic avant toute frame et après la première frame encore à zéro. La correction est relue et les sept tests sont rejoués indépendamment, sans défaut concret restant côté contrôleur. La [première passe à dix avant correction](archive/ten-studies-before-start-reversal-20261008.mjs) est conservée comme source ; la galerie V1 complète reste exacte. Une seconde revue indépendante des calculs de positions et des masques ne relève pas de défaut concret.

Syntaxe, références locales et empreintes de la galerie V1 contrôlées. Les contrôles simulés ne remplacent pas un rendu de police réel ou un essai sur téléphone. Version courante : **module 3 / CSS 2**.

### Contrôle Chrome des six nouvelles pistes

Les six états intermédiaires sont examinés dans Chrome en français clair sur ordinateur **1 910 × 984**, puis en sombre sur **320 × 640**. Les commandes et titres restent entiers ; largeur du document **305 px pour 305 px disponibles**, sans dépassement horizontal. Les découpes et regroupements sont examinés ; aucune couture visible n’est relevée à l’état final de l’ouverture centrale et des deux volets. Le pivot mobile a demandé une nouvelle peinture après le redimensionnement pour être capturé correctement ; rejouer le curseur montre le mot incliné, sans défaut reproductible établi.

Après rechargement du **module 3** et montage complet, les commandes communes confirment **dix états 42 AWARDS**, puis **dix états 42 HORIZON**. Rejouer de **Deux volets** est joué ; au clavier, Home puis ArrowRight place son curseur à **1 % d’AWARDS vers HORIZON**, puis le retour est rejoué jusqu’à HORIZON. Le thème clair et le format habituel sont rétablis, galerie ouverte sur la piste 05. Aucun téléphone physique, mesure FPS, report Figma, publication ou choix final d’une piste.


## Suite du 8 octobre — cascade intégrée

Le choix explicite de la piste 08 est signalé dans le pied de galerie et dans le registre ; les dix mouvements et leurs calculs restent inchangés. L’[ancien pied de page](archive/ten-studies-before-cascade-choice-20261008.html) est conservé comme source HTML exacte, avec ses dépendances dans le dossier parent (ce fichier source n’est pas un lecteur autonome). L’ancien déchiffrement actif dispose d’un [lecteur propre](../../archives/site-versions/pre-cascade-wordmark-20261008/preview.html). Le contrôleur intégré passe sept tests ciblés et une revue indépendante ; les vérifications Chrome ordinateur/mobile, FR clair/AR sombre, entrée principale et aperçu sont consignées dans les [notes du raccord](../../site/notes/BRAND_WORDMARK_NOTES.md#contrôle-chrome-de-la-cascade-intégrée).
