# Remonter en haut sur mobile — 13 octobre 2026

L’utilisateur demande un bouton pour remonter en haut, puis précise **uniquement sur mobile**. Le prototype ajoute cette commande aux listes et fiches Projets, Profils et Chroniques. Elle reste absente de l’entrée, d’Explorer, d’Awards et de la présentation ordinateur.

## Réalisation

`back-to-top.mjs` crée un bouton rond de44px dans l’application, en dehors du dock. L’assistant retient le seuil existant de840px qui sépare déjà les présentations des fiches. Le bouton apparaît après un défilement supérieur ou égal au plus grand de360px et75% de la hauteur de fenêtre. Ces valeurs sont des choix d’implémentation, pas de nouvelles décisions produit attribuées à l’utilisateur.

La commande se place à droite en français/anglais, à gauche en arabe. Ses couleurs et son verre reprennent les tokens partagés. Elle mesure le dock **et la rangée Recherche/dé qui le surplombe**, puis conserve12px au-dessus de l’ensemble, y compris lorsque le dock s’efface temporairement pendant le défilement. Un observateur de taille suit la fermeture animée de la recherche pour retrouver précisément cette position.

Le bouton se masque pendant une recherche, un dialogue, le choix géographique ou le panneau du compte. À la précision suivante de l’utilisateur, il **s’efface aussi pendant le défilement, comme le menu principal**, puis revient avec lui. La CSS réutilise directement `data-document-scrolling` du dock, sans minuteur supplémentaire : effacement220ms et retour350ms, aucune transition avec mouvements réduits. Le focus clavier rend immédiatement la commande visible ; un focus dans le menu rend aussi immédiatement les deux commandes visibles, conformément à son comportement existant.

Son clic place le focus sur le titre accessible de la liste ou de la fiche puis défile vers0, avec une animation douce ; les mouvements réduits utilisent un déplacement instantané. URL, filtres, page courante et contenu ne changent pas. Le focus reste utilisable lorsque le contrôle disparaît après un redimensionnement vers le mode ordinateur.

Le module écoute uniquement le défilement du document. Les listes internes des filtres, recherches ou menus ne déclenchent pas la commande. L’API `mountBackToTop({app,getLocale})` renvoie `refresh` et `destroy` ; les changements de langue, rubrique et entrée sont observés automatiquement. Le montage se fait après installation du dock et de son dé.

Chargements du bouton : `back-to-top.mjs?v=2` et `back-to-top.css?v=2`. Le correctif d’effacement modifie uniquement sa CSS ; le module et le dock restent identiques. Aucun ancien bouton n’existait avant cette demande initiale.

## Vérifications et préservation

Les **26 états du premier contrôle Chrome** passent sur les sources de l’intégration initiale, inchangées pendant l’exécution : entrée et haut de liste masqués, seuil,44px, séparation du dock, retour doux, limite840/841px avec focus, absence sur ordinateur, libellés FR/EN/AR, fermeture/réouverture des panneaux, trois fiches au clavier Entrée avec mouvements réduits, paysage et retour à Explorer. Aucun débordement horizontal ni chevauchement avec Recherche/dé/dock dans ces états. Les rendus français390px, arabe320px et paysage640×360 sont examinés.

- [Banc Chrome](../checks/20261013-back-to-top-browser.py) et [résultat final avec empreintes](../checks/20261013-back-to-top-browser.json).
- [Français390px](../checks/20261013-back-to-top-fr390.png), [arabe320px](../checks/20261013-back-to-top-ar320.png), [paysage](../checks/20261013-back-to-top-landscape.png).
- [Première variante consultable](../../archives/site-versions/pre-back-to-top-focus-fix-20261013/preview.html) et [README anglais](../../archives/site-versions/pre-back-to-top-focus-fix-20261013/README.md) : module/CSS exacts, empreintes égales à la première preuve, petit lecteur autonome sans dépendance active ni stockage.

Le premier passage a révélé la perte du focus au passage840→841px ; elle est corrigée dans le module. Les deux interruptions suivantes provenaient du banc : échappement d’un sélecteur et événement CDP Entrée sans caractère de saisie. Les tentatives restent conservées séparément et ne remplacent pas le résultat final passant.

La vérification utilise Chrome isolé avec le globe bloqué pour contrôler le parcours de contenu indépendant de la carte. Aucun téléphone physique ni clavier logiciel mobile n’a été utilisé. Il ne s’agit pas d’une validation esthétique globale ni d’une publication du prototype.

## Suite — suivre l’effacement du menu

Les **18 états complémentaires passent**, avec de **vrais événements de molette Chrome**, en français390px et arabe320px, avec et sans mouvements réduits. Les opacités du bouton et du menu sont échantillonnées à chaque image durant l’effacement et le retour. Le bouton bloque les clics pendant l’effacement ; clavier, retour instantané des deux commandes lorsque le menu reçoit le focus, focus vers le titre, retour instantané en haut et absence sur ordinateur sont revérifiés. Les quatre captures masqué/visible FR/AR sont examinées. [Banc complémentaire](../checks/20261013-back-to-top-scroll-browser.py), [preuve et empreintes inchangées des deux sources du bouton](../checks/20261013-back-to-top-scroll-browser.json).

L’état qui gardait le bouton visible pendant le défilement reste [consultable séparément](../../archives/site-versions/pre-back-to-top-scroll-hide-20261013/preview.html), avec [sources exactes et preuve précédente](../../archives/site-versions/pre-back-to-top-scroll-hide-20261013/README.md). Une première écriture du sélecteur d’effacement imbriquait deux `:has()` et était ignorée par Chrome ; source et essai échoué sont conservés, puis le sélecteur a été corrigé avant le résultat final.
