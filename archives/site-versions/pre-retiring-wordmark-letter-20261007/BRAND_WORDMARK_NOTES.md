# HORIZON ↔ AWARDS — 7 octobre 2026

L’utilisateur demande une transformation du mot de l’en-tête en entrant dans les Awards, en reprenant le mécanisme du message de connexion. Le symbole42 et la ligne arabe restent gérés par leur composition existante. Cette réalisation ajoute un module et une feuille de style ; le raccord aux routes et son contrôle navigateur sont centralisés par l’agent principal.

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

## API et raccord

Charger `brand-wordmark.css?v=1` puis importer `mountBrandWordmark` de `brand-wordmark.mjs?v=1`.

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

Syntaxe contrôlée ; les **cinq tests** de [brand-wordmark.test.mjs](tests/brand-wordmark.test.mjs) passent : permutation/42 rotations et instants de fixation, intermédiaires visibles et largeurs réelles,6↔7 caractères, inversion rapide et callback périmée, cible répétée, lien direct, réduction des mouvements, visibilité, changement de taille et nettoyage complet y compris polices tardives. Les tests emploient des métriques et une horloge simulées ; ils ne remplacent pas le contrôle du rendu Jost réel.

Aucun contrôle navigateur effectué par cet agent. Rendu des étapes intermédiaires, navigation rapide, français/arabe et formats réels à examiner par l’agent principal. Aucun report Figma, nouvelle authentification ou modification de l’animation de connexion.
