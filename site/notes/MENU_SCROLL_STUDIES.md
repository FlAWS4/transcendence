# Essais de transparence du menu au défilement

**Choix du 5 octobre 2026 : deuxième version retenue et intégrée au comportement normal**, avec un retour accéléré. Les deux liens restent disponibles pour garder la comparaison.

- [Fond seul](../content-preview.html?menu-scroll=background#projects) : fond, contour, ombre, flou de fond et indicateur actif s’effacent ; textes et icônes restent visibles.
- [Menu entier — choisi](../content-preview.html?menu-scroll=all#projects) : menu et loupe s’effacent ensemble. Le pointeur est désactivé pendant l’effacement ; le focus visible au clavier et la saisie gardent le menu accessible.

Au 4 octobre, les essais attendaient le choix utilisateur et employaient 900ms de repos / 650ms de retour. Après son choix et sa demande de rapidité, les deux comparateurs partagent le délai courant de **400ms**, avec un retour de **350ms** et un effacement de **220ms**. Les petites pauses de 100ms restent absorbées. Les changements de rubrique et restaurations automatiques du scroll ne déclenchent plus le fondu.

L’accueil principal et l’aperçu sans paramètre utilisent maintenant la deuxième version. La première reste activable par le paramètre background. Les archives des trois études de navigation initiales sont conservées.

Les deux effets ont été examinés le4octobre sur ordinateur, le second aussi en mobile sombre. Le5octobre, 23tests et les parcours Chrome ciblés confirment l’intégration et la correction de navigation ; contrôle des positions mobile effectué, dernier rejeu du scroll mobile bloqué par la limite d’utilisation des outils. [Vérifications, versions et limites](INTERFACE_POLISH_NOTES.md).
