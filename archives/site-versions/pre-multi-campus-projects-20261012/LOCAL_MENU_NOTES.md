# Menus locaux sans numérotation — 7 octobre 2026

À la demande de l’utilisateur, les numéros décoratifs 01, 02, etc. sont retirés des menus locaux des profils, projets et articles. Le menu latéral et le sélecteur mobile partagent les mêmes éléments de navigation : icône et libellé restent présents, sans troisième élément ni espacement réservé aux numéros. Les numéros des pistes dans les galeries d’études ne sont pas modifiés.

Les sources remplacées et les raccords précédents sont conservés dans [l’archive](archive/pre-unnumbered-local-menus-20261007/manifest.json). Versions actives de cette correction : profil UI16/CSS14, projet UI7/CSS2, Journal UI6, contrôleur `profile-menu-88`, aperçu56. Le défilement et les données ne changent pas.

Vérifications statiques : absence des classes de numéros et du formatage à deux chiffres dans les deux constructeurs communs ; imports et versions HTML cohérents ; syntaxe des cinq modules modifiés contrôlée. Les cinq fichiers de tests rubriques Profil/Projet/Journal, historique campus et liens sociaux passent. Aucun test supplémentaire reproduisant simplement le retrait visuel n’a été ajouté. Le rendu navigateur de cette correction reste à vérifier par le contrôle centralisé.


Contrôle navigateur complémentaire : profil960×640 chargé avec aperçu56/profilsCSS14, rubriques Vue d’ensemble, Projets, Parcours et Contribution sans span de numérotation ; capture examinée. Les constructeurs communs Projet/Journal et le sélecteur mobile ont été contrôlés dans les sources/tests, sans nouveau parcours navigateur complet spécifique au retrait des numéros.
