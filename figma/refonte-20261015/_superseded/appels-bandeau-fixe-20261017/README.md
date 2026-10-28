# Appels de correction du 17 octobre (526 à 609) non envoyés — bandeau fixe mesuré sur toute la page

Sur 119 appels de correction écrits à 12 h 29 UTC, 19 sont partis avant la limite de session de 13 h. La vérification
d'Éléments communs a ensuite montré une régression : le pseudo-élément fixe `#app::after` (fondu sous l'en-tête,
166 px sur mobile) était mesuré dans la boîte de `#app`, donc sur toute la page, avec des arrêts de dégradé en px répartis
au hasard. Depuis l'ordre z du 17 octobre, il recouvrait le fond « atmosphère ». Les 100 appels restants sont gardés
ici sans avoir été envoyés ; tous les écrans concernés, y compris les 19 déjà envoyés, sont régénérés après correction
(`pseudo_frame` : l'écran est le bloc conteneur d'un pseudo-élément fixe ; `resolve_stops` : arrêts en px).
