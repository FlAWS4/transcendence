# Appels écrits avant le correctif des couleurs des cadres sombres rendus depuis la capture sombre (18 octobre 2026) — jamais envoyés

La vérification du Compte (v2) a trouvé dans les cadres sombres rendus depuis la capture sombre (`DARK_RENDER`) des
couleurs du thème clair : dans « Thème » et « Paramètres », la rangée « Clair » gardait le fond de sélection turquoise.
`dom2fig.cref()` cherchait la paire de couleurs avec les marques de transparence écrites pour le sens clair → sombre ;
il essaie maintenant les deux écritures du transparent de chaque côté et, faute de variable, garde la couleur observée
en sombre. Les fenêtres « Connexion simulée » et « Création de compte simulée » sont désormais rendues depuis la capture
sombre (leurs boutons font 51 px en sombre, 53 en clair).

Ces appels (panneaux sombres du compte, suggestions de mention sombres des Projets, et les clonages sombres de Projets,
Chroniques et Compte) avaient été écrits avant ce correctif. Ils ne sont pas envoyés : les cadres sont régénérés, avec en
plus les cadres du 16 octobre dont le fond « atmosphère » s'arrêtait à la hauteur de l'écran.
