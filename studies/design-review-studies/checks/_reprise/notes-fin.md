
## Sources et conservation

- [Socle et adaptations](SNAPSHOT.md) : copie figée du prototype du 14 octobre, **137 fichiers**, dont **11 adaptés** avec leurs originaux dans `originals/` ; [manifeste](snapshot-manifest.json) des empreintes et stockage isolé. Le prototype actif `horizon-welcome/` n’est pas modifié.
- Chaque essai vit dans `essais/<id>/` : `essai.css`, `essai.mjs`, `essai.json` (fiche lue par la galerie) et, pour trois essais typographiques, `early.js`. Le chargeur commun tient en trois fichiers : [boot.js](essais/boot.js), [styles.js](essais/styles.js) et [modules.mjs](essais/modules.mjs). Les polices Jost 700/800 et italiques sont dans [essais/_partage/](essais/_partage/fonts.css) avec leur licence OFL ; Jost reste un substitut, Futura PT n’est pas installée.
- Chaque essai a ses contrôles dans `checks/<id>/` : script `check.py`, mesures `results.json`, captures `avant-*.png` et `apres-*.png`. Outils communs : [helper.py](checks/helper.py) et [check-baseline.py](checks/check-baseline.py).
- Galerie : [index.html](index.html), [gallery.css](gallery.css) et [gallery.mjs](gallery.mjs).
- [checks/_reprise/](checks/_reprise/) garde de quoi reprendre : comptes rendus de réalisation et de vérification de la vague 1, script de la dernière série d’agents, surveillance mémoire et générateur de ces notes.
- Les captures de l’avis (une centaine) restent temporaires, hors du dépôt ; chaque essai garde ses propres captures avant/après.
- La collection figure en tête du [registre des recherches](../research-archive/index.html).

## Vérifications réalisées

- **Socle** : 137 empreintes, 11 originaux et 206 références relatives contrôlés à la pause, sans manque ni sortie de l’étude (`python3 -I snapshot.py --verify` ; [preuve initiale](snapshot-verification.json)).
- **Équivalence** : avant la réalisation des essais, la copie sans essai et le prototype actif donnent **0 pixel d’écart** sur cinq états (Projets et Profils ordinateur clair, fiche projet mobile sombre, Chroniques mobile arabe, Explorer avec le vrai globe) ; [résultats](checks/baseline/results.json).
- **Galerie** : test de fumée avec les fiches provisoires (19 cartes, cadres chargés, avertissement des paires exclusives, aucun débordement). À rejouer avec les fiches finales.
- **Vague 1** : 9 essais réalisés puis revérifiés par un second agent chargé de les contredire : 6 validés, 2 corrigés, 1 avec réserves. Les vérificateurs ont rejoué les mesures, notamment après un changement de langue et de thème sans rechargement.
- **Pas encore faits** : vérification contradictoire des 10 autres essais, contrôle des combinaisons, passe d’intégration et nouveau test de la galerie.

Les contrôles utilisent Chrome sans interface et des formats émulés. Aucun téléphone physique, lecteur d’écran réel ou audit WCAG complet n’est revendiqué.

## Incidents

- **Mémoire saturée deux fois le matin**, avec un plantage de VS Code : des profils de Chrome sans interface restés dans `/tmp` (en mémoire vive), puis plusieurs Chrome de contrôle sans plafond. Depuis, les profils sont gardés hors de `/tmp` et supprimés à la fermeture, et chaque Chrome tourne sous un plafond de 2,6 Go. Avec l’accord de l’utilisateur, 112 anciens profils sont supprimés.
- **Coupures réseau de l’API entre 13 h 30 et 13 h 49** : les deux agents de la seconde vague sont perdus, leurs fichiers restent intacts. La série reprend à 14 h 05 en unités plus petites, chacune relancée une fois en cas de coupure.
- **Accélération demandée par l’utilisateur à 14 h 31** : jusqu’à trois Chrome de contrôle à la fois, démarrés seulement avec 3 Go libres ; une surveillance ralentit les contrôles, ou arrête un Chrome de contrôle, si la mémoire baisse.
- **Pause demandée par l’utilisateur à 14 h 39** : tout est arrêté, sans Chrome ni profil restant, et le socle est contrôlé intact.

## Reprise

L’utilisateur veut **le parcours complet** : finir les 10 essais, les vérifier, puis contrôler toutes les combinaisons.

1. **Finir et vérifier les 10 essais restants**, en six unités parallèles :
   - recherche repliée et voile : fiches à écrire ;
   - une colonne et deux colonnes allégées : relancer le contrôle interrompu, contrôler le brouillon ;
   - pseudo manquant : à réaliser ;
   - lisibilité et signature de marque : à confirmer ; titres forts : à finir ;
   - échelle unifiée : à réaliser ;
   - Awards à venir : ancien brouillon à reprendre.

   Chaque unité est vérifiée dès qu’elle se termine.
2. **Contrôler les combinaisons**, en trois passes parallèles avec le contrôle du socle et des fiches :
   - la sélection compatible ;
   - tous les essais (le premier de chaque paire exclusive) ;
   - les ensembles susceptibles d’interagir : lisibilité, échelle et titres forts ; recherche repliée et voile ; globe dans l’espace libre et pastilles ; rôles de couleur et contour de Visiter.
3. **Passe d’intégration** : corrections minimales des conflits trouvés, dans les dossiers des essais concernés.
4. Nouveau test de la galerie avec les fiches finales, puis mise à jour de ces notes, du journal, du contexte et du README.

Le script [workflow-essais-paralleles.js](checks/_reprise/workflow-essais-paralleles.js) décrit ce parcours. Mettre à jour son « STATE ON DISK » si des fichiers ont changé depuis la pause. Durée estimée : environ 1 h 45 avec trois Chrome de contrôle.
