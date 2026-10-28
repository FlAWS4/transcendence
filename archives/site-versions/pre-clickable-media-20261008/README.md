# Avant les médias agrandissables — 8 octobre 2026

[Ouvrir l’état conservé](preview.html#projects) depuis le serveur local du projet. Accès directs : [Projets](preview.html#projects), [Profils](preview.html#people), [Chroniques](preview.html#journal) et [Explorer](preview.html#explore).

Ce lecteur conserve l’état **chronicles-96 / aperçu 64**, juste avant l’ajout du lecteur de médias : les illustrations des fiches, les portraits principaux et les photos campus ne s’ouvrent pas en grand. Les liens des cartes et des auteurs continuent à naviguer. Paris et Mulhouse possèdent leurs logos officiels et données datées ; le volet mobile garde ses gestes tactiles précédents, sans le nouveau contrôle à la molette. Les noms Chroniques, les responsables et les créations collectives restent présents.

Les **onze fichiers originaux** déjà sauvegardés à la racine de cette archive restent exacts. `preview.html`, `viewer-entry.mjs` et `viewer-welcome.mjs` sont des lecteurs adaptés, séparés de ces originaux. Le répertoire `runtime/` fige **40 modules, 26 feuilles CSS et 5 jeux JSON**. [Le manifeste](manifest.json) indique leurs sources et empreintes, ainsi que les adaptations de chemins.

Deux sources complémentaires sont conservées : `campus-sheet.mjs` provient du runtime de l’archive précédant le renommage Chroniques et garde exactement le contrôleur tactile initial ; `journal-ui.mjs` est copié de l’état courant après son seul changement de paramètre de cache d’import. Sa copie runtime importe le projet antérieur, avec les libellés Chroniques inchangés. Aucun lecteur de médias n’est chargé par cet état.

Le `<base>` pointe vers le prototype parent pour les assets partagés. L’URL du lecteur, construite depuis `location.pathname` et `location.search`, est capturée avant toute écriture d’historique. Les routes, liens et fragments SVG visent explicitement ce lecteur. Les JSON sont chargés depuis le runtime par URL de module, indépendamment du `<base>`.

Polices, symbole 42, portraits SVG, photos/logos campus, bibliothèques tierces, données géographiques et étude de déchiffrement restent partagés dans le dépôt. Le dossier n’est donc pas autonome en dehors de celui-ci. Les services cartographiques et sites externes peuvent évoluer.

Vérifications : onze originaux inchangés ; empreintes du runtime et références locales contrôlées ; syntaxe des 42 modules du lecteur/runtime validée ; cinq cas de routes conservent chemin et paramètres du lecteur. Les données Paris/Mulhouse, les médias non cliquables, les libellés Chroniques et l’absence de gestionnaire de molette campus sont contrôlés dans les sources. Aucun rejeu navigateur n’est revendiqué par cette préparation ; le contrôle visuel appartient à l’intervention principale.

La fonctionnalité qui remplace cet état est décrite dans [MEDIA_VIEWER_NOTES.md](../../../site/notes/MEDIA_VIEWER_NOTES.md). Les autres études et leurs lecteurs restent conservés.
