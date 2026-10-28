# Appel 710 avant le chargement de la police de secours (18 octobre 2026) — envoyé, en échec

`710-projects-lot.js` construit la fiche projet « Fiche projet — Mobile · Clair · العربية ». Le 17 octobre au soir, le
coursier l'a envoyé à Figma, qui l'a refusé :

> Error: in setBoundVariable: unloaded font "Noto Sans Symbols2 Regular". Please call figma.loadFontAsync({ family:
> "Noto Sans Symbols2", style: "Regular" }) and await the returned promise first.

Lier une variable de texte fait recalculer le texte dans la langue du cadre. Pour un caractère que les polices du
calque ne couvrent pas, Figma choisit sa propre police de secours et exige qu'elle soit chargée. Les valeurs
enregistrées localement (`calls/strings-sent.json`) ne contiennent aucun caractère que Jost ou Noto Sans Arabic
ignorent. La fiche sur ordinateur (709), qui lie les mêmes textes, est passée. Le caractère en cause n'est donc pas
identifié.

Correction (`scripts/render.js`, `bindText`) : quand Figma réclame une police non chargée pendant la liaison, le moteur
la charge et refait la liaison, jusqu'à trois polices par texte. Les polices chargées ainsi sont comptées dans
`stats.fallbackFonts`. L'appel **798** reprend à l'identique les données S et X de celui-ci, avec le moteur
reconstruit.

Vérification hors ligne (`scripts/sim_figma.mjs`, avec `SIM_STRINGS=1` qui charge les variables de texte envoyées et
`SIM_FALLBACK="Noto Sans Symbols2|Regular"` qui reproduit le refus de Figma) :
- l'appel 710 échoue avec le même message ;
- l'appel 798 aboutit, charge la police une fois et lie 32 textes.

Le cadre de construction `⟦build projects-project-mobile-ar⟧` qu'un échec aurait pu laisser est supprimé au début de
l'appel 798. Ce fichier n'est plus à envoyer.
