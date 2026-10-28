# Archive du prototype

[Ouvrir le lecteur](preview.html#journal) depuis le serveur local du projet.

Dock à cinq boutons avant l’adaptation en quatre étapes. Les styles de cette étude, les grilles, les auteurs d’origine et l’ancienne fiche campus restent conservés.

Les fichiers originaux conservés à la racine de cette archive ne sont pas réécrits. `preview.html` et les modules `viewer-*` constituent les lecteurs adaptés; leurs états précédents sont gardés dans les fichiers `*-before-dependency-pin-20261008.*`. Le répertoire `runtime/` contient des copies des dépendances modifiées lors de la passe du8octobre2026, avec provenance et empreintes dans `manifest.json`.

Le `<base>` reste dirigé vers le prototype parent pour les assets partagés; les fragments SVG et les liens des fiches visent explicitement ce lecteur. Les cartes, polices, photos et modules inchangés restent partagés, donc ce dossier ne constitue pas une copie autonome hors du dépôt.

Vérification de cette maintenance : chemins/imports/fragments et cohérence des données contrôlés statiquement. Aucun nouveau rejeu navigateur par cet agent, aucune disponibilité des services externes garantie.

Correction du lecteur du 8 octobre : l’URL complète de cette page est capturée avant toute écriture dans l’historique. Les routes et liens restent dans l’archive malgré le `<base>` des assets, y compris après rechargement. Les lecteurs précédents sont conservés dans `*-before-history-url-fix-20261008.*`. Cinq cas d’URL par lecteur et la syntaxe ont été vérifiés ; le rejeu navigateur est confié à l’agent principal.
