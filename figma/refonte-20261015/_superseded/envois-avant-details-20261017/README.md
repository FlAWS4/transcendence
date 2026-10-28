# Envois de Projets et Profils écrits avant le correctif des sélecteurs mobiles (17 octobre 2026, nuit)

Sur mobile, le sélecteur de rubrique des fiches projet, profil et chronique est un `<details>` replié : Chrome donne une
boîte à son contenu sans le dessiner, et le relevé l'avait pris pour visible. Les fiches mobiles montraient donc le menu
déplié. Ces appels, écrits avant le correctif de `dom2fig.py` (contenu d'un `<details>` fermé ignoré), n'ont pas été
envoyés ; les écrans sont régénérés.
