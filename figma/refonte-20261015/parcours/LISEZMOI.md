# Parcours cliquables (19 et 23 octobre 2026)

Les pages « 09 · Parcours · ordinateur » et « 10 · Parcours · mobile » du fichier Figma `2iWoG3h7SegFmchssYAV80` se parcourent en mode Présentation. Décisions de l'utilisateur : deux pages, en clair ; le sombre par le mode « Sombre » de « 42 · Couleurs » ; l'anglais avec les vrais cadres anglais ; les fenêtres mènent à l'écran relevé exact ; les écrans membre sont relevés pour le parcours membre (18 et 19 octobre, voir `../PASSE-COMPLETE.md`).

## Contenu du dossier

- `correspondance-fr.json` et `.md` : correspondance hors ligne entre le plan du site et les cadres français (écrans, liens, fermetures), faite le 19 octobre avant les parcours ; ses outils sont dans `outils-correspondance/`.
- `plan.json` : le plan des parcours, produit par `../scripts/parcours.py plan` ; une entrée par cadre (`fmt|lang|flux|état`), ses zones (boîte, action, libellé) et ses enchaînements automatiques. Version finale du 23 octobre : 5 050 zones (2 724 sur ordinateur, 2 326 sur mobile) et 80 enchaînements automatiques.
- `ids.json` : identifiants Figma des deux pages, de leurs sections et des 362 cadres, relevés dans les résultats des appels (`parcours.py record`).

## Construction

1. **Cadres.** Chaque cadre est une copie d'un cadre vérifié des pages 01 à 08 (`parcours.py copies`), ou un écran membre rendu par le même moteur (`layout`, puis `convert`). Un cadre plus haut que l'écran est mis à la hauteur de l'écran et sa page défile. Les calques fixes du site (en-tête, pastille, menu du bas, colonne de la fiche) deviennent des enfants fixes du cadre.
2. **Zones.** Une zone est un cadre transparent posé sur l'élément du site, avec une interaction (`parcours.py links`). Elle est retrouvée de plusieurs façons :
   - dans les relevés du site (`dom/`), par la correspondance ;
   - par héritage, quand l'écran partage l'élément d'un autre : en-tête d'une fiche dans ses rubriques, liste dans ses variantes, page à côté d'un menu ouvert ;
   - par la structure de la page : menu du bas, recherche, dé, compte, onglets, pagination, boutons Annuler, résultats de recherche, liens externes.
3. **Arrivée.** Un lien mène à l'écran relevé de la même adresse. À défaut, il mène à l'écran relevé de la même rubrique (voir « Compromis »).
4. **Fenêtres et menus.** Ils sont repérés en comparant chaque capture à l'écran de base de son adresse.
   - Sous une fenêtre modale, la page ne réagit pas et le voile la ferme.
   - Un menu recouvre ce qu'il cache ; à côté, la page réagit et un clic dans le vide le ferme.
   - Le menu du bas et l'en-tête restent au-dessus d'un menu dessiné dans la page.
   - Un menu qui défile sur le site (« Dans ce projet » sur mobile, fiche campus, compte) défile aussi dans Figma : ses zones sont posées dans son calque.
5. **Fermeture.** Fermer, Annuler, le voile et un clic à côté reviennent à l'écran précédent (« Envoyer un message » ne se ferme pas par son voile, comme sur le site). Font exception les fenêtres que le site ferme avec celle d'où elles s'ouvrent : sous-panneaux du compte, filtres et fiche campus déployés, connexion et création de compte ouvertes depuis le panneau. Celles-là mènent à la page sous la fenêtre.
6. **Règles tirées du code du site.**
   - « ← », « Revenir au monde » et le nom du pays mènent au monde ou au pays.
   - « Retour aux … » mène à la liste nommée.
   - « Continuer avec le profil » laisse la page en membre.
   - La pastille de portée d'une fiche en lecture est inerte.
   - L'onglet actif, la page en cours et le dé grisé ne font rien.
   - Le dé d'une fiche mène à l'autre fiche relevée de sa rubrique (ft_transcendence et minishell ; sur ordinateur, aussi les fiches profil relevées), ou n'a pas de zone.
   - « ‹ Retour » des sous-panneaux du compte et « Replier la fiche » reviennent à l'écran précédent.

## Vérification

- **Relectures.** Les zones ont été dessinées sur les captures du site, une planche par cadre (sauf les quatre « Déchiffrement · vers le logo (membre) », faute de capture), et relues par format et par langue, en quatre tours : `../verification/parcours-20261019/zones`, `zones-v2`, `zones-v3` (19 octobre), puis `zones-v4` (23 octobre). Le mobile a été relu aux quatre tours, en français et en anglais. L'ordinateur l'a été aux tours 1, 2 et 4 en anglais, et au quatrième seulement en français : ses relecteurs des trois premiers tours ont été arrêtés sans résultat, et le quatrième tour les remplace. Les remarques sont dans `relectures/`. La quatrième relecture n'a relevé que des défauts mineurs ; `relectures/v4-remarques.json` dit, pour chacun, s'il a été corrigé, inscrit parmi les compromis ou trouvé conforme au site. La première version du plan et son script sont archivés dans `../_superseded/parcours-zones-avant-revue-20261019/`, la troisième dans `../_superseded/parcours-zones-v3-avant-relecture3-20261023/`.
- **Simulation.** Le 19 octobre, le code des copies (version qui garde une copie déjà faite, envoyée depuis 1898) et celui des liens ont été joués sur une maquette de l'API Figma, y compris le renvoi après une course coupée. Les lots de liens du 23 octobre, du même code, n'ont eu qu'un contrôle de syntaxe avant envoi ; la géométrie posée et le contrôle dans le fichier les ont vérifiés après.
- **Géométrie posée.** `outils-parcours/geometrie_posee.py` régénère hors ligne les lots que donne le plan final, puis les compare, cadre par cadre, au dernier lot exécuté qui contient chaque cadre (`../calls/done/`). Le 23 octobre, les 362 cadres sont identiques au plan final (boîtes, libellés, arrivées, conteneurs, enchaînements, défilement), ainsi que les 6 points de départ de chaque page.
- **Contrôle dans le fichier.** Après envoi, `parcours.py check` lit chaque page en lecture seule, par groupes de sections pour rester sous la limite de 48 000 octets d'une réponse. `parcours.py verify` compare ensuite cette lecture au plan : cadres, zones, arrivées, présence des calques fixes sur les cadres qui défilent, enchaînements et points de départ. Le 23 octobre (appels 2001 à 2006), les 362 cadres sont conformes, sans aucun écart. Le contrôle signale bien chacune des sept erreurs introduites exprès dans des copies de ces lectures.
- **Mode Présentation.** Les parcours n'ont pas été joués en mode Présentation : leurs interactions et leurs points de départ ont été lus dans le fichier.

## Compromis et limites

- Seuls certains sujets ont été relevés. Un auteur, un membre d'équipe, une mention ou un résultat d'un autre sujet ouvre la fiche relevée de sa rubrique. Dans les listes, seules les cartes des sujets relevés ont une zone, sauf sur la dernière page, où les cartes placées comme elles ouvrent la fiche relevée. Sur mobile, seule la fiche de Leïla Mansour a été relevée parmi les personnes.
- Les rubriques de ft_transcendence ouvrent celles de minishell ; celles d'Inès Morel et de Noé Laurent, celles de Leïla Mansour. Sur mobile, le sélecteur « Dans ce … » des rubriques, de minishell et des autres profils ouvre le sélecteur relevé sur ft_transcendence ou sur Leïla ; dans celui de ft_transcendence, « Vue d'ensemble » mène à ft_transcendence.
- Chaque fenêtre n'a été relevée qu'une fois, sur une page (Signaler, Envoyer un message, Autour du campus, visionneuse, recherche, tri ouvert, vue Liste) : ouverte ailleurs, elle montre cette page en dessous. « Où veux-tu aller ? » a été relevé sur Explorer : ouvert depuis une liste, il montre le globe dessous, et le choix d'un pays ou d'un campus mène à Explorer, alors que le site filtre la liste.
- Le parcours membre retombe sur les écrans visiteur quand le relevé membre manque.
- Sur mobile, les rubriques Médias et Commentaires d'une chronique n'ont pas d'entrée, faute de sélecteur ouvert relevé. Le tri des commentaires d'une chronique, ainsi que la pagination, l'affichage et le tri des chroniques, n'ont pas de zone ; « Mes favoris uniquement » n'en a que pour les projets.
- Le panneau de la recherche ne défile pas, car c'est une instance de composant.
- « Affichage » mène directement à l'autre vue. Seules l'option de tri en cours et « Mes favoris uniquement » ont une zone.
- Une fenêtre ouverte depuis un menu, depuis une autre fenêtre ou depuis la page à côté d'un menu se referme sur ce menu ou cette fenêtre (⋮ → Signaler ; Choisir un campus → Autour du campus), alors que le site les ferme en ouvrant la nouvelle fenêtre. Passer d'un panneau du compte à un autre par l'en-tête, puis fermer, rouvre le premier panneau. Après un changement de langue, « ‹ Retour » rouvre le panneau du compte dans la langue précédente.
- Dans le parcours anglais, les étapes de scan et l'ouverture du globe reprennent les cadres français, et l'arrivée alterne anglais et arabe.
- Les repères du globe font 14 × 14 px, comme sur le site ; seuls la France et 42 Paris sont relevés.
