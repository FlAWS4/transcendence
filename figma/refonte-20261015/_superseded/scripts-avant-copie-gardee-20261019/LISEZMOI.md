# Copies des parcours et coursier avant la reprise des copies lourdes (19 octobre 2026)

`parcours.py` et `courier-workflow.js` tels qu'ils étaient avant deux changements du 19 octobre au matin.

Les écrans les plus lourds de Projets (commentaires, filtres déployés) coupaient à chaque essai : « MCP server connection lost », puis « Plugin execution failed due to internal timeout » pour 1811. La copie pouvait aboutir côté Figma sans que la réponse revienne. L'ancien appel supprimait alors la copie au renvoi, rechargeait la page source et recommençait, une boucle sans fin.

- `parcours.py` : l'appel de copie gardait aucune copie existante et chargeait toujours la page source. La conversion supposait un cadre intact : interrompue, elle laissait des calques déjà déplacés que le renvoi ne retrouvait plus.
- `courier-workflow.js` : « internal timeout » ne faisait pas partie des erreurs réessayées.

Remplacés par les versions de `scripts/`. La copie déjà présente est gardée, sa conversion terminée si une course l'a interrompue ; la page source n'est chargée que pour une copie encore à faire. Le coursier réessaie aussi sur « internal timeout », sauf pour une partie intermédiaire d'un écran découpé.
