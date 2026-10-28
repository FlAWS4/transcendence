# Démo d’essai Pong — 11 octobre 2026

Nouvelle démonstration autonome créée pour comparer les deux présentations demandées par l’utilisateur : jeu intégré à la fiche et ouverture dans un nouvel onglet. Elle est distincte du vrai projet des auteurs, et ne revendique aucune intégration avec son code ou son serveur.

## Accès

- `index.html?lang=fr&theme=light` : page autonome.
- `index.html?lang=ar&theme=dark&embedded=1` : composition compacte pour iframe, direction RTL des textes ; le joueur conserve la raquette gauche.
- Langues : `fr` (défaut), `en`, `ar` ; thèmes : `light`, `dark`, préférence système si absent/invalide. La préférence du système est suivie pendant l’affichage lorsque le thème n’est pas fixé.
- L’iframe peut utiliser `sandbox="allow-scripts"`. `pong.mjs` est délibérément chargé comme **script classique différé**, sans import/export : aucun module CORS n’est demandé depuis une origine opaque.
- En iframe, le parent peut envoyer `{type:'horizon-demo-theme',theme:'light'}` ou `dark` avec `postMessage`. Seuls les messages de `window.parent`, distinct de la fenêtre courante, et ces deux valeurs sont acceptés. La palette change sans interrompre ni réinitialiser la partie ; la page autonome ignore ce protocole.

## Interaction

Partie contre l’ordinateur, premier à cinq points ; contrôles souris, tactile, flèches verticales ou W/S. Démarrer place le focus sur le terrain. Pause, Reprendre/Rejouer et Recommencer restent disponibles. Recommencer remet les scores à zéro et attend Démarrer. Le canvas fournit son nom et les instructions, les scores sont annoncés après un point.

Aucune boucle d’animation avant le premier démarrage ni pendant la pause. Les touches de jeu ne sont traitées que lorsque le terrain a le focus et que la partie tourne. Tab sort normalement et met le jeu en pause ; Échap met en pause sans empêcher la navigation. Changement de focus/fenêtre, document caché ou page quittée : pause. Souris/tactile n’agissent pas avant le démarrage ; le terrain laisse défiler la page lorsqu’il est arrêté.

Canvas sans dépendance ni réseau, coordonnées de jeu fixes et résolution adaptée à sa taille et à la densité de pixels. La version intégrée réserve au terrain une largeur maximale de480px pour l’iframe prévue à560px (540px sur petit écran) ; composition fluide à320px. Les textes, boutons et messages de score sont localisés.

## Vérifications

`node --check pong.mjs` réussit. Un contrôle ponctuel en DOM simulé passe16 scénarios : initialisation des trois langues, départ sans animation, démarrage/focus, flèches, Tab et Échap, clic Pause après perte du focus (empêche un redémarrage involontaire), déplacement tactile borné et libération du pointeur, messages parent acceptés/refusés sans remise à zéro, document caché, victoire à5, rejouer/remettre à zéro, sortie de page et préférence système.

Le navigateur de contrôle CUA est indisponible ; aucun rendu navigateur, chargement effectif en iframe à origine opaque, ni jeu sur téléphone physique ne doit être annoncé comme vérifié. Le contrôle DOM ne mesure pas le rendu mobile ou RTL.
