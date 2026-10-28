# Essai des projets — état conservé du 11 octobre 2026

Cette archive précède la demande de remplacer **Tester le projet** par un accès à un dépôt, GitHub par exemple. Elle conserve l’essai des deux modes : Pong intégré à la page et ouverture du même Pong dans un nouvel onglet. Il s’agit d’une démonstration fictive créée pour comparer ces présentations, distincte du vrai projet des auteurs.

## Rejouer l’essai

Ouvrir [preview.html](preview.html) depuis le serveur statique du projet. L’aperçu autonome propose français, anglais, arabe RTL, clair et sombre. Il importe le module archivé, qui résout sa propre copie de Pong : aucune dépendance aux sources actives.

- [Aperçu français clair](preview.html?lang=fr&theme=light)
- [Aperçu anglais sombre](preview.html?lang=en&theme=dark)
- [Aperçu arabe sombre](preview.html?lang=ar&theme=dark)
- [Pong indépendant](project-demos/pong/index.html?lang=fr&theme=light)
- [Fonctionnement et limites du Pong](project-demos/pong/NOTES.md)

La langue recharge la démo ; le thème se transmet à l’iframe sans réinitialiser la partie. L’ouverture en nouvel onglet utilise le même jeu et les options sélectionnées. Servir les fichiers en HTTP, comme le reste du prototype, pour charger le module JavaScript de l’aperçu.

## Sources conservées

Les sept fichiers ci-dessous sont des copies exactes de l’état actif au moment de l’archivage : `project-trial.mjs`, `projects.css`, `tests/project-trial.test.mjs`, puis `project-demos/pong/index.html`, `pong.css`, `pong.mjs` et `NOTES.md`. Le manifeste contient leur taille et leur empreinte SHA-256. Les styles, textes et mécanismes de la démo n’ont pas été réécrits ; seuls cet aperçu et ce document ont été ajoutés pour garder l’essai consultable séparément.

Le sous-dossier [raccords](raccords/manifest.json) conserve aussi six fichiers d’intégration avant modification des imports et caches. Son manifeste est indépendant ; ces copies documentent le raccord historique et ne sont pas nécessaires à l’aperçu autonome.

Le test archivé importe le module archivé et peut se lancer avec `node --test tests/project-trial.test.mjs` depuis ce dossier. Les vérifications historiques de Pong restent décrites dans sa note conservée. Contrôles propres à l’archive : empreintes des copies, syntaxe, test du module et résolution des ressources locales. Aucun rendu navigateur ni essai réel en iframe n’est revendiqué : l’accès CUA était indisponible lors de cette conservation.

Cette archive n’est ni une nouvelle version de production ni le choix actif de présentation des projets. Les sources actives peuvent évoluer indépendamment.
