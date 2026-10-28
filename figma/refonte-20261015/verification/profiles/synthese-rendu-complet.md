# Profils — vérification du rendu complet, cadres sans chiffres tabulaires (18 octobre 2026, vers 21 h 15 UTC)

**Périmètre.** Page « 04 · Profils » : seuls les cadres « Projets », « Parcours » et « Contribution » (12 clairs, appels 1294 à 1305, et 12 clones sombres, appel 1306) sont rendus par la passe complète. Les 50 autres cadres clairs et leurs sombres attendent les styles « chiffres tabulaires » de l'utilisateur. Leurs anciens rendus, quand ils existent (54), ont été placés à leur emplacement du nouveau plan (appel 1421 : 34 déplacés, 20 déjà en place).

**Structure** (lecture seule) : 8 sections, aucun cadre de construction, aucun marqueur, aucun ancien cadre hors plan.

**Comparaison au site** (sections « profile-projects », « profile-journey », « profile-contribution », exports à l'échelle 1, `rendu-complet/index.json`) :
- cadres de la passe complète : écart moyen de 0,6 à 2,6 niveaux, de 0,2 à 1,2 % de pixels différents ;
- hors contours (`rendu-complet/blocks.json`) : au plus 133 pixels par cadre (0,011 %) ;
- les cadres tenus (« Projets · filtre local ouvert ») ne sont pas jugés : ancien rendu, ou emplacement vide pour l'anglais.

**Artefact des références pleine hauteur.** Le petit globe de la pastille « Monde » diffère sur les cadres ordinateur plus hauts que l'écran. La capture pleine hauteur du site (`--full.png`) est prise après agrandissement de la fenêtre à la hauteur de la page : le globe y est redessiné et montre une autre vue (Afrique rapprochée). La capture à la hauteur de l'écran montre la vue « Monde », celle que voit le visiteur et celle de Figma (planche `scratchpad`, contrôle du 18 au soir). Ce n'est pas un défaut de Figma.

**Bilan.** Aucun défaut de construction sur les cadres rendus.

## Suite, nuit du 18 au 19 octobre : cadres à chiffres tabulaires

**Rendu.** Après l'activation des chiffres tabulaires par l'utilisateur dans les 11 styles et l'enregistrement des familles « Carte · Profils » (mobile et ordinateur, 132 variantes chacune) : les 50 cadres clairs tenus (liste, filtres, fiche profil, filtre local des projets, envoyer un message, signaler ; appels 1641 à 1691) et leurs 50 clones sombres, un par appel (1692 à 1741). La page compte maintenant ses 124 cadres. Incidents : 1642 coupé par le filtre de sécurité à la recopie (script tronqué, donc jamais exécuté), passé à l'identique au deuxième essai ; vers 3 h 03 UTC, trois clones (1698 à 1700) ont reçu « An unexpected error occurred » du serveur Figma, puis sont passés au renvoi.

**Structure** (lecture seule, appel 1744) : 8 sections, les 124 cadres du plan à leur position et à leur taille, aucun cadre manquant, hors plan, en double ni en construction ; dans chaque section, ses deux textes de note.

**Comparaison au site** (`rendu-complet/index.json`). Sections « Fiche profil », « Projets », « Envoyer un message » et « Signaler » exportées à l'échelle 1 ; l'export de « Projets » du 18 est gardé (`exports/profile-projects-18oct.png`, index et blocs du 18 : `index-18oct.json`, `blocks-18oct.json`). « Liste des profils » (27 732 px de haut) et « Filtrer les profils » (export de section coupé, comme celui de Projets ; constat de la session principale) sont exportées cadre par cadre : 28 et 12 cadres qui ont une capture du site (`rendu-complet/cadres/`, `rendu-complet/filtre/`, index dans `rendu-complet/people/` et `rendu-complet/filter-people/`).
- Cadres de la nuit (77 comparés) : écart moyen de 0,6 à 2,8 niveaux ; le plus fort sur la liste mobile en arabe (texte dense), au plus 1,6 % de pixels différents.
- Hors contours (`blocks.json` de chaque dossier) : au plus 149 pixels par cadre, sauf sous les voiles des fenêtres de filtre. Les plus forts viennent du logo flouté sous le voile des fenêtres « Signaler » et « Envoyer un message » (ordinateur clair) ; sur « Liste des profils » ordinateur, de la pastille du globe en haut des cadres pleine hauteur (artefact des références, ci-dessus) ; ailleurs, de pixels isolés sur les détails fins des portraits et des lettres. Sous les voiles des filtres :
  - « Filtrer les profils » ordinateur clair : 3 300 à 4 200 pixels (0,31 %), sur les portraits des cartes floutés sous le voile (la première colonne pour moitié, la dernière pour un quart, le reste au milieu) et sur le logo. Figma rend ces portraits un peu plus nets que Chrome ; le contraste des cheveux foncés sur le fond clair porte l'écart à 31 à 33 niveaux (21 au plus sur le logo, le 18). En sombre, le contraste est faible : environ 360 pixels ;
  - « Projets · filtre local ouvert » : 652 pixels (ordinateur) et 238 (mobile), contenu flouté sous le voile ; un décalage a été cherché sur le texte flouté (meilleur alignement à 0 px, mesure de la session principale) : c'est le noyau du flou.
- Chiffres tabulaires (années et nombres des cartes, venus des composants « Carte · Profils », compteurs) : croisés avec les textes en chiffres tabulaires du relevé du site, seules quatre zones de 1 à 12 pixels hors contours en touchent un, au bord des lettres de « 42 Paris » (fiche profil ordinateur) ou d'un menu de tri ouvert par-dessus « 2024 » ; aucun écart propre aux chiffres (détail dans la synthèse de Projets).

**Bilan.** Les 124 cadres de la page sont rendus et vérifiés ; aucun défaut de construction. Restent les limites connues : lissage des polices, anticrénelage, noyau du flou sous les voiles (plus visible ici, sur des portraits contrastés), saturation du verre.
