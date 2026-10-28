# Menu uniforme et centré — 6 octobre 2026

**Suite du 7 octobre :** cette hauteur60px et les boutons48px restent conservés dans le [nouveau menu à quatre étapes](RESPONSIVE_DOCK_NOTES.md). La règle responsive « texte toujours à côté » est remplacée à la demande de l’utilisateur ; les vérifications historiques ci-dessous restent datées.

L’utilisateur remarque davantage d’espace sous la gélule active. Le diagnostic Chrome mesure 5,67px en haut /6,33px en bas sur ordinateur, 6,67/7,33px sur mobile : la bordure CSS de1px est rendue à0,667px, et le contenu de hauteur fixe reste aligné en haut de l’espace disponible. L’ombre peut renforcer l’impression, mais l’asymétrie géométrique est réelle.

Après explication de la différence60/64px entre ordinateur et mobile, l’utilisateur approuve une hauteur commune de60px avec boutons48px. La correction centre aussi la gélule : align-items:center pour les boutons, top:50% et translateY(-50%) pour la pastille. Le JavaScript ne mesure plus offsetTop ; le mode compact garde ses slots et son glissement horizontal. Le mobile conserve ses marges horizontales de6px, avec5px verticaux. Le champ de recherche suit cette marge verticale. Palette, dépoli, reflet et ombre sont conservés.

Versions : welcome.mjs uniform-dock-58 ; content-preview.mjs26 ; dock-search.css uniform-dock-20 ; floating-search.css uniform-dock-7. Sources précédentes et deux HTML conservés dans archive/pre-uniform-dock-20261006/. Les comparateurs séparés restent intacts.

37 tests de recherche et transitions passent ; syntaxe du contrôleur contrôlée. Chrome confirme60px pour le menu,48px pour boutons/pastille,6px exactement au-dessus et dessous sur ordinateur, mobile390×844 et arabe sombre320×640. Le changement Journal→Projets en RTL termine sur le bouton correct. Paris retourne ses trois résultats ; champ centré, une croix, surface capsule alignée au panneau à0,02px près, pas de débordement horizontal. Le format temporaire est réinitialisé.

Aucune mesure intermédiaire fiable de l’animation n’est revendiquée pour cette suite ; positions de départ/arrivée et règles de transition contrôlées. Pas de téléphone physique, clavier virtuel, nouvelle émulation de mouvements réduits ou report Figma. L’onglet principal est rechargé à la demande de l’utilisateur avant vérification finale.
