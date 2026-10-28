# Explorer — vérification du rendu complet (18 octobre 2026, vers 21 h 10 UTC)

**Périmètre.** Page « 02 · Explorer » après le rendu de la passe complète : appels 1216 à 1233 (cadres clairs), 1234 (36 clones sombres), 1419 (anciens rendus des cadres tenus placés à leur emplacement). Les huit fiches campus et leurs sombres attendent les styles « chiffres tabulaires » de l'utilisateur ; leur section n'est pas comparée.

**Structure** (lecture seule, `use_figma`) : 8 sections ; 72 nouveaux cadres aux emplacements du plan (rangées française, anglaise et arabe) ; dans « Fiche campus », les 8 anciens rendus des cadres tenus, à leur nouvel emplacement ; aucun ancien cadre remplacé resté en place, aucun cadre de construction, aucun marqueur `⟨pN⟩` ni « à remplacer ».

**Comparaison au site** (`scripts/verify_page.py`, exports des sections à l'échelle 1, `rendu-complet/index.json`) : 58 cadres comparés ; les 14 cadres sombres anglais n'ont pas de capture du site (clones en mode Sombre des cadres anglais).
- Écart moyen par canal : 0,6 à 1,9 niveau ; pixels différents : 0,1 à 0,6 %.
- Trois cadres mobiles de « Une nouvelle façon d'explorer » : 2,1 à 2,8 % de pixels, environ 3 niveaux. Les différences sont au contour des lettres d'un bloc de texte dense : le site mobile est capturé à densité 2 puis réduit, Figma rend à densité 1.
- Différences hors contours (`scripts/diff_blocks.py` : masque des pixels à plus de 12 niveaux, érodé deux fois en 3 × 3, `rendu-complet/blocks.json`) : au plus 178 pixels par cadre (0,013 %). Le plus grand groupe est le logo flouté sous le voile de la fenêtre « Une nouvelle façon d'explorer » : le flou de Chrome est un peu plus étalé que celui de Figma (21 niveaux au plus), limite déjà mesurée avec le verre sous un voile (essais 976 à 978).

**Bilan.** Aucun défaut de construction. Restent les limites connues : lissage des polices et anticrénelage, noyau du flou, saturation du verre (shader toujours refusé par Figma).

## Suite, nuit du 18 au 19 octobre : fiches campus (cadres à chiffres tabulaires)

Rendues après l'activation des chiffres tabulaires par l'utilisateur dans les 11 styles : 8 cadres clairs (appels 1540 à 1547) et 8 clones sombres (1548, plans des rues remplacés par leur version sombre). La page compte maintenant ses 88 cadres. Un premier essai de 1541 (partie 2) a été coupé à la recopie : script tronqué, donc rejeté avant toute exécution ; le second essai est une recopie exacte.

Comparaison au site (section exportée à l'échelle 1, `rendu-complet/campus-sheet/`) : 12 cadres comparés ; écart moyen de 1,0 à 1,9 niveau ; hors contours, au plus 273 pixels par cadre : détails de la photo du campus (agrandissement d'image de Figma), contours des lettres de l'adresse. Aucun écart sur les nombres en chiffres tabulaires (statistiques, dates, compteur de photos).

Constat de rangement : la copie de l'écran placée sous un verre (`glassCopies`, « Calques peints avant le verre ») gardait le nom de construction « ⟦build …⟧ » (3 772 calques sur la page). Le moteur est corrigé (« Écran (copie sous le verre) ») ; les copies existantes seront renommées page par page, sans autre changement.
