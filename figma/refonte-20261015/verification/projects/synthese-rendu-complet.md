# Projets — vérification du rendu complet, cadres sans chiffres tabulaires (18 octobre 2026, vers 21 h 45 UTC)

**Périmètre.** Page « 03 · Projets » : 58 cadres clairs (appels 1237 à 1286, 1289, 1290, 1417, 1418) et 58 clones sombres (appel 1291). Les 32 cadres clairs tenus pour les styles « chiffres tabulaires » (filtres, commentaires, menu d'un commentaire, visionneuse) et leurs sombres attendent ; leurs anciens rendus sont à leur emplacement du nouveau plan (appel 1420 : 16 déplacés, 16 déjà en place).

**Structure** (lecture seule) : 11 sections, aucun cadre de construction, aucun marqueur, aucun ancien cadre hors plan.

**Comparaison au site.** Six sections exportées à l'échelle 1 (`rendu-complet/index.json`) ; la section « Liste des projets » (24 278 px de haut) dépasse ce que le serveur de Figma exporte (connexion perdue deux fois) : ses 22 cadres clairs et ses 12 cadres sombres qui ont une capture du site ont été exportés un par un (`rendu-complet/cadres/`, `rendu-complet/projects/index.json`).
- Écart moyen de 0,8 à 3,8 niveaux ; le plus fort sur la liste mobile en arabe (texte dense).
- Hors contours (`blocks.json`) : au plus 186 pixels par cadre (0,017 %) : logo flouté sous le voile des fenêtres (noyau du flou, comme sur Explorer) et petit globe des cadres ordinateur pleine hauteur (artefact des références pleine hauteur).
- « Signaler » en français, avec l'espace fine de « 0 / 1 000 » passée par jeton (1417, 1418) : rien hors contours au compteur.

**Bilan.** Aucun défaut de construction.

## Suite, nuit du 18 au 19 octobre : cadres à chiffres tabulaires

**Rendu.** Après l'activation des chiffres tabulaires par l'utilisateur dans les 11 styles : 32 cadres clairs (filtres, commentaires, menu d'un commentaire, visionneuse ; appels 1550 à 1586) et leurs 32 sombres : 28 clones posés un par appel (1604 à 1631 ; ces cadres sont très lourds : « Filtrer les projets — Ordinateur · Clair », seul cadre mesuré, compte 28 930 calques) et les 4 « suggestions de mention » rendues depuis leur propre relevé sombre (1564 à 1570). Les copies de l'écran placées sous un verre ont été renommées « Écran (copie sous le verre) » (1634 ; voir le README).

**Structure** (lecture seule, appel 1743) : 11 sections, les 180 cadres du plan à leur position et à leur taille, aucun cadre manquant, hors plan, en double ni en construction ; dans chaque section, ses deux textes de note.

**Comparaison au site.** Sections « Commentaires », « Menu à trois points d'un commentaire » et « Visionneuse de médias » exportées à l'échelle 1 (`rendu-complet/index.json`). L'export de la section « Filtrer les projets » a coupé la connexion (16 cadres très lourds ; constat de la session principale) : ses 12 cadres qui ont une capture du site sont exportés un par un (`rendu-complet/filtre/`, `rendu-complet/filter-projects/index.json`).
- Cadres de la nuit (50 comparés) : écart moyen de 0,2 à 2,3 niveaux, au plus 1,1 % de pixels différents, comme les autres cadres de la page.
- Hors contours (`blocks.json`) : au plus 967 pixels par cadre (0,071 %), sur « Filtrer les projets » ordinateur : logo et petits portraits des auteurs des cartes, floutés sous le voile de la fenêtre (noyau du flou) ; ailleurs, au plus 151 pixels sur les cadres de la nuit (« Filtrer les projets » mobile).
- Chiffres tabulaires : les zones hors contours ont été croisées avec les textes en chiffres tabulaires du relevé du site (1 997 textes dans 127 cadres de Projets et de Profils). Seules 8 petites zones en touchent un, de 1 à 12 pixels hors contours chacune, toutes au bord d'une lettre ou d'un menu ouvert par-dessus ; ici, les compteurs « 0 » des commentaires mobiles sombres. Aucun écart propre aux chiffres.

**Défaut trouvé et corrigé : voile de la visionneuse mobile.** Sur « Visionneuse de médias — Mobile », le voile gris de la fenêtre s'arrêtait vers 681 px (français) et 638 px (anglais), soit 844 px moins le défilement de la capture, au lieu de couvrir l'écran (2 264 à 2 521 pixels hors contours, en clair). Ces états sont capturés la page défilée (163 à 226 px) ; le convertisseur décale le contenu d'un cadre à la hauteur de l'écran de ce défilement, mais posait le voile `::backdrop` au haut du document. Seuls les quatre états mobiles de la visionneuse sont dans ce cas (152 états à voile relevés). `dom2fig.py` place désormais le voile au haut de l'écran (ancienne version : `_superseded/scripts-avant-voile-defile-20261019`). Cadres clairs régénérés et renvoyés (1745, 1746, chacun remplace le cadre du même nom), clones sombres refaits (1747, 1748). Après correction : écart moyen (trois canaux) 1,09 → 0,68 niveau (français), 1,16 → 0,70 (anglais), 0,91 → 0,83 (sombre) ; plus aucun pixel hors contours sur les trois cadres mobiles comparés (le sombre anglais n'a pas de capture du site). Planches d'avant gardées dans `rendu-complet/viewer-avant-voile-19oct/` (export `exports/viewer-avant-voile-19oct.png`).

**Bilan.** Les 180 cadres de la page sont rendus et vérifiés ; aucun défaut de construction restant. Restent les limites connues : lissage des polices, anticrénelage, noyau du flou sous les voiles, saturation du verre.
