# Styles « chiffres tabulaires » à créer dans Figma

**18 octobre 2026, soir — les 11 styles existent.** À la demande de l'utilisateur (« Créer les 11 styles toi même »), l'assistant les a créés dans le fichier (appel 1437), sous les noms et avec les réglages du tableau ci-dessous. L'API de Figma ne peut toujours pas activer l'option : il reste à **cocher les chiffres tabulaires dans chacun des 11 styles**.
1. Dans Figma, sans rien sélectionner, ouvrir les styles de texte locaux (panneau de droite) : dossiers « Corps », « Libellés » et « Titres », styles dont le nom finit par « chiffres tabulaires ».
2. Modifier le style (icône de réglages au survol), ouvrir les réglages typographiques (Type settings / Type details), onglet « Details », partie « Numbers », et choisir les chiffres tabulaires (« Tabular »).
3. Recommencer pour les 11 styles, puis le signaler à l'assistant : il vérifie l'option sur un texte d'essai (la largeur de « 1111 » change) avant de rendre les cadres qui en dépendent.

Texte d'origine (18 octobre, après-midi) :

Le site affiche certains nombres en chiffres tabulaires (`font-variant-numeric: tabular-nums`). L’API de Figma ne sait pas activer cette option ; chaque style ci-dessous est donc à créer à la main dans le fichier « 42 Horizon — Maquettes (octobre 2026) », sous **exactement** ce nom, avec ces réglages et, dans les détails du texte (Type details → Numbers), **Tabular figures**. Le moteur les appliquera ensuite par leur nom.

| Nom exact du style | Police | Taille | Interligne | Interlettrage | Casse | Textes | Exemples |
|---|---|---|---|---|---|---|---|
| `Corps/16 · Medium · 24 · chiffres tabulaires` | Jost Medium | 16 px | 24 px | 0 | — | 60 | « 42 Paris » ; « 2024 » ; « 8 » ; « 42 Lyon » |
| `Libellés/13 · Medium · 21.45 · chiffres tabulaires` | Jost Medium | 13 px | 21.45 px | 0 | — | 1104 | « 2024 » ; « 4 » ; « 2022 » ; « 6 » |
| `Libellés/13 · Medium · chiffres tabulaires` | Jost Medium | 13 px | Auto | 0 | — | 60 | « 0 » ; « 3 » ; « 1 » ; « 2 » |
| `Libellés/13 · Regular · 20.8 · chiffres tabulaires` | Jost Regular | 13 px | 20.8 px | 0 | — | 32 | « 0 / 2 000 caractères » ; « 0 / 2,000 characters » ; « 9 / 2 000 caractères » ; « 9 / 2,000 characters » |
| `Libellés/13 · Regular · chiffres tabulaires` | Jost Regular | 13 px | Auto | 0 | — | 12 | « 1 / 2 » ; « 1 / 4 » |
| `Libellés/14 · Medium · 19.6 · chiffres tabulaires` | Jost Medium | 14 px | 19.6 px | 0 | — | 16 | « 1 » |
| `Libellés/14 · Regular · 19.6 · chiffres tabulaires` | Jost Regular | 14 px | 19.6 px | 0 | — | 48 | « 0 » |
| `Libellés/14 · Regular · 22.4 · chiffres tabulaires` | Jost Regular | 14 px | 22.4 px | 0 | — | 24 | « 25 janvier 2027 » ; « 19 février 2027 » ; « 1 mars 2027 » ; « 26 mars 2027 » |
| `Titres/25.8 · Medium · 28.38 · chiffres tabulaires` | Jost Medium | 25.8 px | 28.38 px | 0 | — | 4 | « 5 000+ » |
| `Titres/27 · Medium · chiffres tabulaires` | Jost Medium | 27 px | Auto | 0 | — | 8 | « 2013 » ; « novembre 2021 » ; « November 2021 » |
| `Titres/28 · Medium · 30.8 · chiffres tabulaires` | Jost Medium | 28 px | 30.8 px | 0 | — | 4 | « 5 000+ » ; « 413 » |
