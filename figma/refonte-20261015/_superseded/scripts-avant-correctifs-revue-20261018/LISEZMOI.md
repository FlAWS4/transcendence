# Scripts avant les correctifs de la relecture du 18 octobre 2026

Copie des scripts de la refonte au moment où la relecture contradictoire du moteur (workflow « revue-moteur-18oct », 20 agents) a rendu ses défauts confirmés : 14 importants, 28 mineurs. Les correctifs sont faits dans `scripts/` ; cette copie permet de comparer et de revenir en arrière.

`recapture_followup.py` y figure déjà corrigé (test exact « 0 jobs remaining », 13 h 40) ; `render.js` et `dom2fig.py` y portent les correctifs du bord flouté du globe (`unclipMasked`, `pin_stacking`, 13 h 00). `capture_lib.py` n'est pas concerné et ne doit pas changer avant la fin du relevé complet.
