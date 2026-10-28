# Appels au moteur stocké dans le fichier Figma (16 octobre 2026), remplacés

Ces appels lisaient le moteur `render.js` dans le nœud de texte `4:3` du fichier Figma, puis l'exécutaient par `new Function`. Cette méthode a servi pour les appels 001 à 021, qui sont réussis.

Le 16 octobre, l'installation du moteur version 6 (`038-renderer.js`) a été refusée par le classificateur de permissions de Claude Code, avec le motif « Create RCE Surface ». Il refusait de stocker du code exécutable dans le document pour l'évaluer ensuite. Ce refus n'a pas été contourné : la méthode a changé.

Chaque appel porte désormais :
- ses données (`const S`, `const X`) ;
- le moteur lui-même (`scripts/render.inline.js`, construit par `scripts/build_renderer.cjs`).

Plus rien n'est stocké ni évalué depuis le fichier. Le nœud `4:3` reste à supprimer lors du nettoyage final.

Fichiers conservés ici à titre d'historique ; ils n'ont pas été envoyés, sauf `037-palette.js` (réussi, déplacé dans `calls/done/`).
