# Appels régénérés avec le moteur non minifié (17 octobre 2026, après-midi) — jamais envoyés

Après les correctifs du 17 octobre (`dom2fig.py`, `render.js`), 141 appels ont été écrits pour les écrans modifiés
(n° 436 à 525). `render.inline.js` n'avait pas été reconstruit après la modification de `render.js` :
`make_call.py` a donc collé la source sans commentaires, plus lourde, ce qui découpait chaque écran en davantage
d'appels. Ces fichiers n'ont pas été envoyés ; les écrans sont régénérés avec le moteur minifié.
