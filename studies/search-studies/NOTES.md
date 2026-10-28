# Quatre accès à la recherche — 5 octobre 2026

Études isolées demandées pour comparer uniquement les menus et leur accès à la recherche, sans refaire les pages Horizon.

- **01 — La languette** : un accès au-dessus du dock se fond dans le champ.
- **02 — Les deux faces** : le menu se retourne pour révéler la recherche.
- **03 — L’invitation intégrée** : la question partage la surface du dock.
- **04 — La capsule flottante** : l’accès séparé rejoint le dock pour former une barre.

**Choix explicite de l’utilisateur : la capsule flottante.** Les quatre variantes restent conservées pour retracer la réflexion. L’intégration au site actif est traitée séparément ; cette page reste une démonstration sans moteur de recherche ni IA.

Les commandes 320 / 390 / 560 px permettent de comparer les largeurs, dans la limite de la place disponible. Les libellés restent à côté des icônes ; en format étroit, seul le nom actif se déploie. Les quatre rubriques, l’ouverture et la fermeture de la recherche, Échap, le retour du focus et les thèmes sont interactifs. La palette, les icônes et la police Jost sont partagées avec les études précédentes ; les archives sont préservées.

À la suite du signalement de deux croix dès la saisie, la croix native des champs de recherche WebKit est masquée. Le bouton explicite de fermeture reste visible et accessible. Le CSS est chargé en version 3.

Vérifications consignées par l’agent principal : captures sur ordinateur des quatre modèles au réglage de largeur 390 px en clair, ainsi que retournement du modèle à deux faces avec focus dans le champ. Lecture du contrôleur et du CSS : les faces cachées utilisent inert et aria-hidden, avec préférence de mouvements réduits prévue. Les contrôles navigateur complémentaires sont menés séparément par l’agent principal ; aucun test sur téléphone physique ou clavier virtuel n’est revendiqué ici.

Fichiers : index.html, styles.css, studies.mjs. URL locale : http://127.0.0.1:8765/studies/search-studies/index.html.


## Complément de contrôle et intégration — 5 octobre

La capsule flottante est examinée après saisie de Paris : une seule croix, puis retour au dock par Échap. Cette direction est intégrée à l’accueil et à son aperçu, avec recherche globale existante et traductions FR/EN/AR. Les quatre modèles restent distincts et consultables. [Réalisation active et vérifications](../../site/notes/FLOATING_SEARCH_NOTES.md). Le rappel utilisateur de conserver tous les essais est inscrit dans AGENTS.md.
