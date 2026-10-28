# Nettoyage refusé le 17 octobre 2026, fait le 18

Le 17 octobre au soir, un coursier a tenté l'appel `797-nettoyage.js`. Le contrôle automatique des permissions l'a
refusé (« Modify Shared Resources ») et rien n'a été envoyé à Figma. Le message est conservé dans
`797-nettoyage.refus-17oct.json`.

Le 18 octobre, l'utilisateur a donné son accord (« oui »). La session principale a envoyé le même appel, sans
modification. La page 4:2 « ⚙ Outils de génération (temporaire) » a été supprimée. Elle ne contenait que le nœud texte
4:3, l'ancien moteur stocké (version 5), inutilisé depuis le 16 octobre ; sa source reste dans `scripts/` et dans
`_superseded/appels-moteur-stocke-20261016/`. Aucune variable « _pipeline/… » ne restait à supprimer : une lecture de
toutes les variables n'a trouvé aucun nom commençant par « _ ». Le résultat est dans
`call-results/797-nettoyage.js.json`.
