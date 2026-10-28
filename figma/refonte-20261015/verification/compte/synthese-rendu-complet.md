# Compte et réglages — vérification du rendu complet (18 octobre 2026, vers 21 h 50 UTC)

**Périmètre.** Page « 07 · Compte et réglages » : 36 cadres clairs et 24 cadres sombres construits depuis leur propre relevé (appels 1332 à 1391), 12 clones sombres (appel 1392).

**Structure** (lecture seule) : 9 sections, exactement les 72 cadres du plan, aucun reste.

**Comparaison au site** (9 sections exportées à l'échelle 1, `rendu-complet/index.json`) : écart moyen de 0,8 à 3 niveaux, au plus 1,5 % de pixels différents. Hors contours (`rendu-complet/blocks.json`) : quelques centaines de pixels sur les fenêtres « Connexion simulée » et « Création de compte simulée » (au plus 1 207, soit 0,088 % du cadre), tous dans la page floutée derrière le voile, surtout sur les petits portraits colorés : noyau du flou de Figma et saturation 1,15 du site absente (shader refusé par Figma), plus le logo flouté sous le voile. Ailleurs, au plus quelques dizaines de pixels.

**Bilan.** Aucun défaut de construction ; restent les limites connues du flou et de la saturation sous les voiles.
