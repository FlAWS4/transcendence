# Socle conservé — 13 octobre 2026

L’entrée [baseline/content-preview.html?variant=1#explore](baseline/content-preview.html?variant=1#explore) charge le vrai globe et les vrais contenus de démonstration depuis une copie indépendante du prototype Horizon. Les paramètres `variant=2` et `variant=3` sont destinés aux autres essais. La copie démarre sur Explorer ; les rubriques et leurs URL restent disponibles.

Le [manifeste](snapshot-manifest.json) enregistre les 136 fichiers locaux, leurs origines, tailles et empreintes avant/après adaptation. Cela comprend les modules, styles, données, médias utilisés, fontes, symbole 42, bibliothèques cartographiques, données géographiques brutes/compressées et dépendances du déchiffrement. Les archives, tests, captures et dépendances inutilisées des anciennes pistes ne sont pas recopiés. Les 11 fichiers adaptés conservent leurs octets d’origine dans `originals/`. Aucune source du prototype actif n’est modifiée.

Les URL partagées deviennent des fichiers physiques dans `baseline/shared/`. Les imports du worker, les requêtes JSON et les images conservent leur résolution relative ; aucun `base`, iframe ou lien symbolique ne détourne les URL de l’aperçu. Les rues détaillées d’un campus continuent d’utiliser le fournisseur cartographique distant existant ; le snapshot ne promet pas leur disponibilité hors ligne.

Sept clés ou préfixes de stockage sont isolés avec `horizon-globe-gesture-studies-20261013-` : thème, préférences de contenu actuelles/anciennes, ancienne disposition, commentaires, signalements et liens de dépôt. Les trois variantes partagent ces préférences d’essai, sans lire ni écrire les favoris ou réglages du prototype actif. Les remplacements exacts figurent dans le manifeste. Les occurrences restantes de `horizon-` qui désignent des propriétés CSS ou identifiants DOM ne sont pas des clés de stockage.

L’entrée ajoute `../study.css` et `../study.mjs`. Son contrôleur expose uniquement dans cette copie `window.horizonStudy` avec trois getters : `globe`, `locale`, `section`. Le moteur expose sa fonction existante `getNavigationState` et deux adaptateurs de suspension/reprise des gestes, `beginControlGesture` et `endControlGesture`, pour l’essai d’un appui prolongé annulable. Ce pont peut être interrogé lorsque le globe devient disponible ; les contrôles de l’étude restent dans les fichiers voisins.

Pour contrôler les empreintes :

```sh
python3 studies/globe-gesture-studies/snapshot.py --verify
```

Pour reproduire la préparation depuis les sources Horizon actuelles, choisir un **nouveau** dossier :

```sh
python3 studies/globe-gesture-studies/snapshot.py --output /tmp/horizon-globe-snapshot-reproduction
```

Le script refuse d’écraser un snapshot existant. Les sources actives pouvant évoluer, une nouvelle génération n’est historiquement identique que si ses empreintes source correspondent au manifeste conservé. Le snapshot déjà présent reste la référence de ces essais.

Le [contrôle technique](snapshot-verification.json) vérifie les 136 sources inchangées, la syntaxe des 64 fichiers JavaScript hors bibliothèques, et 120 références relatives sans manque. Ce contrôle n’est pas une validation visuelle ni un audit d’accessibilité ; les interactions des essais sont vérifiées séparément après ajout de leur contrôleur.
