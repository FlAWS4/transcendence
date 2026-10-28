# Zones des parcours avant la relecture des planches (19 octobre 2026)

`parcours.py` et `plan.json` tels qu'ils étaient quand quatre réviseurs ont relu les planches des zones (`verification/parcours-20261019/zones/`, une par cadre, ordinateur et mobile, français et anglais). Les zones n'étaient pas encore envoyées dans Figma.

La relecture a relevé, entre autres :
- des zones qui se recouvrent : la grande zone de la recherche ouverte, qui renvoyait sur elle-même, couvrait les résultats ; les zones de la page restaient actives sous les menus et les fenêtres ouverts ;
- des arrivées fausses : la carte minishell menait à la fiche ft_transcendence ; « ← », « Revenir au monde » et le nom du pays revenaient à l'écran précédent, alors que le site mène au monde ou au pays ; « Continuer avec le profil » ouvrait le panneau du compte, que le site ne rouvre pas ;
- des commandes visibles sans zone : Annuler, pagination, retours et sélecteurs des rubriques, choix des Paramètres, Se déconnecter ;
- des options masquées par le défilement interne d'un menu, qui recevaient pourtant une zone.

Remplacés par la version de `scripts/` et le plan régénéré. Ce plan garde pour chaque lien l'écran capturé de la même adresse, tient compte des menus et fenêtres ouverts (recouvrement, voile, fermeture) et ajoute les commandes manquantes quand un écran capturé leur correspond.
