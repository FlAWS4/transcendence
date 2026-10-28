# Convertisseur avant le voile des fenêtres recalé sur l'écran (19 octobre 2026)

`dom2fig.py` tel qu'il était quand la comparaison au site des cadres tenus de Projets a relevé une bande claire en bas de « Visionneuse de médias — Mobile » (2 264 à 2 521 pixels hors contours, au-dessous de y = 638 environ). Le voile `::backdrop` d'une fenêtre modale était placé au haut du document (`y = -origin[1]`) ; dans un cadre à la hauteur de l'écran d'un état capturé défilé, le contenu est décalé du défilement (origine `(0, sy)`) : le voile remontait donc de `sy` (206 px pour l'anglais) et s'arrêtait avant le bas de l'écran. Seuls les quatre états mobiles de la visionneuse de Projets sont capturés défilés avec une fenêtre modale (152 états à voile, relevés le 19 octobre).

Remplacé par la version de `scripts/`, qui place le voile au haut de l'écran, comme les pseudo-éléments fixes (`y0 - (0 if full else sy)`).
