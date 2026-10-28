# Appels des fenêtres de filtre écrits avant le relevé du soulignement (18 octobre 2026) — jamais envoyés

Ces appels reconstruisaient les fenêtres « Filtrer les projets », « Filtrer les profils » et « Projets · filtre local
ouvert » d’un profil (806 à 808, 899 à 902, 909 et 910), ainsi que le clonage sombre de Projets (831). Ils avaient été
écrits à partir des relevés de la veille, où le soulignement du lien « Réinitialiser » n’avait ni sa couleur
(`var(--cp-line)`) ni son décalage (4 px).

Le relevé note maintenant ces propriétés (`capture_lib.py` : decoColor, uOffset, decoW), le convertisseur les transmet
(`tdc`, `tdo`, `tdw`) et le moteur les pose avec les propriétés natives de Figma (la couleur garde sa variable, vérifié
sur un texte temporaire). Les fenêtres de filtre ont été relevées de nouveau (40 captures, sans échec ; anciens relevés
dans `_superseded/captures-filtres-avant-soulignement-20261018/`) et leurs cadres régénérés. Le clonage sombre de Projets
est réécrit pour couvrir aussi « Filtrer les projets — Ordinateur », ajouté au lot. Aucun de ces appels n’a été envoyé.
