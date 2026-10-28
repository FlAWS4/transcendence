# HORIZON ↔ AWARDS — 7 octobre 2026

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
