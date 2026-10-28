# HORIZON ↔ AWARDS — cascade choisie le 8 octobre 2026

## Décision et intégration courantes

Après comparaison des dix essais, l’utilisateur choisit explicitement **08 — Cascade de lettres**. Le module actif reprend cette piste : les lettres de HORIZON se retirent successivement vers le haut, puis celles d’AWARDS montent à leur place ; le retour parcourt exactement la même chronologie en sens inverse. **Durée complète : 1,25 s**, comme dans l’étude. Les lettres restent littérales, sans alphabet aléatoire ni accent temporaire. Le symbole 42 et la règle de la ligne arabe restent hors du module.

Jost, graisse, taille, couleur et espacement sont hérités de l’en-tête existant. La mesure des préfixes conserve les paires de lettres de la police ; un changement de format ou le chargement tardif des polices recalcule seulement ces positions, sans redémarrer le mouvement. L’ancien mot est éteint à 42 % et le suivant commence à 46 %. La largeur naturelle de l’en-tête rejoint celle du prochain mot dans cet intervalle de **50 ms**, afin que le N sortant dispose de toute sa place et que les commandes voisines retrouvent la largeur finale. Aucun espace permanent réservé au mot le plus long.

Une seule progression HORIZON → AWARDS décrit les deux directions. Une inversion reprend la frame visible et parcourt le chemin restant à la même vitesse ; une demande répétée ne redémarre rien. Le retour demandé avant toute progression annule aussi la frame en attente. Les cellules cachées de l’autre mot n’existent que pendant la transition : au repos, le DOM contient exactement **six caractères AWARDS ou sept HORIZON**. Les lecteurs d’écran reçoivent immédiatement le nom complet de destination sur le lien, jamais les cellules décoratives.

API conservée : `mountBrandWordmark({element, brandLink, motion})`, puis `setAwards(true/false, {animate})`, `refresh()` et `destroy()`. Un lien direct, une préférence de mouvement réduit ou un onglet masqué aboutit immédiatement au mot demandé. La destruction annule le travail, retire les écouteurs et laisse le dernier mot en texte simple. Le helper exporté `wordmarkGlyphs(word,time)` décrit désormais les opacités et déplacements sur la chronologie canonique ; il ne produit plus de caractères brouillés.

Raccord courant : `brand-wordmark.mjs?v=3`, `brand-wordmark.css?v=2`, contrôleur `cascade-wordmark-99`, aperçu67. Le déchiffrement de connexion demeure indépendant.

### Conservation des recherches

- [Ancien déchiffrement de l’en-tête consultable](archive/pre-cascade-wordmark-20261008/preview.html), avec quatre sources exactes copiées avant modification et [manifeste](archive/pre-cascade-wordmark-20261008/manifest.json). Le petit lecteur adapte uniquement les chemins d’import d’une copie de travail ; les originaux ne sont pas modifiés.
- [Les dix essais](../brand-transition-studies/index.html#study-cascade) et leurs commandes restent disponibles, ainsi que la [galerie initiale à quatre](../brand-transition-studies-initial-20261008/index.html).
- Le récit et les vérifications du 7 octobre ci-dessous décrivent l’ancien mécanisme ; ils restent conservés pour documenter la recherche.

### Vérifications techniques du raccord

Les **sept cas** de [brand-wordmark.test.mjs](tests/brand-wordmark.test.mjs) passent : équivalence de 201 frames à la piste08, caractères littéraux, absence de superposition des deux mots à chaque milliseconde, disparition du N, métriques et fins six/sept lettres, inversion aux mêmes positions, demandes rapides avant/après la première frame, callbacks périmés, cible répétée, route directe, réduction des mouvements, onglet masqué, resize, polices tardives et nettoyage. Syntaxe du module valide. Ces contrôles emploient une horloge et des métriques simulées. Une revue indépendante du contrôleur, des métriques et du nettoyage ne relève aucun défaut concret ; les sept cas sont rejoués indépendamment et passent.

### Contrôle Chrome de la cascade intégrée

Après le raccord final des caches 99/67, les **43 fichiers de tests actifs Horizon passent à nouveau**, sans échec ni test ignoré. Le contrôle `git diff --check` est propre.

Aperçu **67** à **320 × 640**, français clair : clic Awards, capture de la cascade et opacités successives de H à N observées, puis arrivée exacte AWARDS en six cellules. En arabe sombre, clic **الأعضاء**, état intermédiaire AWAR puis retour HORIZON en sept cellules avec ligne arabe rétablie. Aucune largeur débordante relevée (**310/310 px**).

Entrée principale **cascade-wordmark-99**, ordinateur **1 910 px clair** : parcours Visiteur → Chroniques, clic Awards, capture intermédiaire puis AWARDS en six cellules ; retour Chroniques avec HORIZON en sept cellules. Français et thème clair rétablis. Les inversions rapides et la réduction de mouvement sont contrôlées par les tests simulés ci-dessus ; aucun téléphone physique, mesure de FPS, report Figma ou publication n’est revendiqué.

---

## Historique conservé — demande et état du 7 octobre 2026

L’utilisateur demande une transformation du mot de l’en-tête en entrant dans les Awards, en reprenant le mécanisme du message de connexion. Le symbole 42 conserve sa composition. La ligne arabe reste hors du module ; le contrôleur de page la masque dans Awards et la rétablit ailleurs. Le module est raccordé aux deux entrées web, comme décrit dans [les notes Awards](AWARDS_NOTES.md).

## Sources reprises

- [scanner-return-random.mjs](../decryption-examples/scanner-return-random.mjs) : le n°22 délègue au renderer commun avec `resolution: 'random'`.
- [scanner-return-together.mjs](../decryption-examples/scanner-return-together.mjs) : `resolutionOrder()` est importé directement. Sa permutation seed42 fixe les lettres dans un ordre pseudo-aléatoire stable.
- [shared.mjs](../decryption-examples/shared.mjs) et [horizon-decryption-engine.mjs](../horizon-decryption-engine.mjs) : alphabet de76 caractères et rotation de42 positions. Le nouveau module importe `ALPHABET`, `KEY` et `encrypt` du moteur ; il ne reproduit pas les scans binaire/hexadécimal.
- [entrance.mjs](entrance.mjs) : référence du raccord du n°22 à la connexion simulée, laissée inchangée.

Tous ces fichiers existants restent intacts. Le module de marque est autonome par rapport au contrôleur d’entrée, avec seulement les fonctions de permutation et de rotation communes.

## Rendu proposé

Durée courte de **1,6s**, proposée pour l’en-tête. Toutes les lettres commencent à changer ensemble, puis se fixent entre **1,1s et1,6s**, dans l’ordre déterministe du n°22. Chaque lettre traverse les42 positions de l’alphabet original : lettres, chiffres et symboles sont donc visibles pendant les états intermédiaires. Les caractères actifs utilisent l’accent existant ; les caractères fixés reprennent la couleur normale. Aucun double scan ni nouvelle palette.

Le mot conserve police, graisse, taille et espacement hérités de la marque, actuellement Jost. Un contexte Canvas non affiché mesure les préfixes du texte avec ces réglages ; les lettres restent des spans dans le DOM. Leur place et la largeur totale sont interpolées par une courbe douce, en tenant compte des véritables métriques des6 lettres d’AWARDS et7 lettres d’HORIZON. Le septième caractère disparaît ou apparaît progressivement, sans réserver définitivement la largeur du mot le plus long. Les glyphes brouillés trop larges sont comprimés dans leur cellule, comme dans le renderer22, pour éviter de chevaucher leurs voisins ; les lettres finales retrouvent leurs métriques normales. Les dimensions sont recalculées au changement de format et après chargement des polices. [Premier état avant ajustement des glyphes conservé](archive/pre-wordmark-glyph-fit-20261007/manifest.json).

Le premier état de la transition conserve le mot visible précédent. Une nouvelle destination pendant l’animation reprend les positions, caractères et opacités courants, annule l’ancienne frame puis termine sur le dernier mot demandé. Une protection de séquence empêche une callback ancienne de rétablir un mot périmé. La réduction des mouvements ou le masquage de l’onglet termine immédiatement le mot attendu.

**Correction explicite suivante — animer aussi le N :** l’utilisateur remarque que la septième lettre de HORIZON restait fixe pendant le passage vers AWARDS. Le module2 fait désormais participer cette cellule sortante aux mêmes42 rotations de l’alphabet. Elle reste entièrement visible et garde sa largeur jusqu’à1,1s, puis se rétracte et s’efface progressivement pendant les500ms restantes, tout en continuant à se brouiller. Elle est retirée au résultat final AWARDS. La largeur de la marque réserve temporairement sa place, afin que le caractère encore visible ne dépasse pas vers les commandes voisines ; cette largeur peut donc grandir légèrement avant la contraction finale. Une inversion pendant l’effacement reprend son opacité et sa géométrie courantes, sans réapparition brutale. [Module1 et tests précédents conservés](archive/pre-retiring-wordmark-letter-20261007/manifest.json).

## API et raccord

Charger `brand-wordmark.css?v=1` puis importer `mountBrandWordmark` de `brand-wordmark.mjs?v=2`.

```js
const wordmark = mountBrandWordmark({
  element: document.getElementById('brand-wordmark'),
  brandLink: document.querySelector('.brand'),
  motion, // MediaQueryList prefers-reduced-motion, facultatif
});
wordmark.setAwards(section === 'awards', {animate: entryOpen});
```

Le module monte seulement le span latin. `setAwards(true)` vise AWARDS ; `false` vise HORIZON. `{animate:false}` permet un lien direct Awards avant l’entrée, sans rejouer une transformation cachée. Le lien reçoit immédiatement le nom accessible «42 Awards» ou «42 Horizon», tandis que les caractères décoratifs ne sont pas énoncés. Une cible répétée ne relance pas l’animation.

`refresh()` recalcule les métriques. `destroy()` termine le dernier mot demandé, retire frames et écouteurs et laisse ce mot en texte simple. Il préserve le nom accessible courant du lien. Aucun gestionnaire de navigation n’est créé par le module.

## Vérification

Syntaxe contrôlée ; les **sept tests** de [brand-wordmark.test.mjs](tests/brand-wordmark.test.mjs) passent : permutation/42 rotations et instants de fixation, intermédiaires visibles et largeurs réelles,6↔7 caractères, brouillage du N sur plusieurs étapes sans perte d’opacité ni rétraction avant1,1s, effacement àmi-course et fin, inversion pendant cet effacement, inversion rapide et callback périmée, cible répétée, lien direct, réduction des mouvements, visibilité, changement de taille et nettoyage complet y compris polices tardives. Les tests emploient des métriques et une horloge simulées ; ils ne remplacent pas le contrôle du rendu Jost réel.

Contrôle navigateur global : rendu final en français clair et arabe sombre, ordinateur et 320px ; retour vers HORIZON examiné à un instant brouillé. Après correction du N, sept cellules actives observées pendant le mouvement (dernier caractère «3», opacité1), puis six cellules et AWARDS. Les inversions rapides et le mouvement réduit sont couverts par tests simulés. [Preuves et limites du raccord](AWARDS_NOTES.md). Aucun report Figma, nouvelle authentification ou modification de l’animation de connexion.
