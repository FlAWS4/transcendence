# Appels du globe en un seul envoi (16 octobre 2026), remplacés

Ces quatre appels créaient chacun un composant de globe à partir du SVG entier, soit 13 000 à 44 000 caractères.

Le 16 octobre au matin :
- l'appel 023 (Monde · ordinateur) a réussi et a créé le composant `33:19` ;
- l'envoi de 024 a été interrompu par le filtre de sécurité pendant la recopie. Seuls 8 957 caractères sur 41 378 sont partis. Ce JavaScript tronqué n'a rien pu exécuter : voir `call-results/024-globe-globe-monde--mobile.js.json`.

Ils sont remplacés par des envois en morceaux d'environ 6 000 caractères :
- `python3 scripts/globe_assets.py chunks` produit les appels ;
- les morceaux sont stockés dans des textes masqués de la page technique ;
- un dernier appel les réassemble, vérifie leur longueur et leur empreinte FNV-1a, puis crée le composant.

Fichiers conservés ici à titre d'historique ; ils ne sont pas envoyés.
