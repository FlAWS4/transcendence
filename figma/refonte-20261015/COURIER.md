# Procédure du coursier Figma — refonte du 15 octobre 2026

Le coursier exécute, dans l'ordre et sans les modifier, des appels Figma déjà écrits dans `calls/`. Il ne décide de rien : il recopie, envoie, consigne et s'arrête à la première erreur.

## Outils

1. `ToolSearch` avec la requête `select:mcp__claude_ai_Figma__use_figma,mcp__claude_ai_Figma__get_figma_skill,mcp__claude_ai_Figma__get_screenshot`.
2. Lire une fois la consigne obligatoire avec `get_figma_skill(uri="skill://figma/figma-use/SKILL.md")`.

## Avant d'envoyer

Rejouer la file hors ligne depuis `scripts/` :

```sh
node sim_figma.mjs <fichiers dans l'ordre>
```

Depuis le 16 octobre, les appels de scènes sont autonomes : données, puis moteur. Le simulateur les exécute tels quels ; il ne sert plus le moteur stocké (`*-renderer.js`) que pour les anciens appels. Chaque ligne doit commencer par `OK` (ou `skip` pour les appels qui ne sont pas des scènes). Sinon, ne rien envoyer et rapporter.

## Pour chaque fichier, dans l'ordre

1. Le lire **entièrement** avec l'outil Read. Si la sortie est tronquée, relire par tranches (`offset`/`limit`) jusqu'à la fin.
2. Appeler `mcp__claude_ai_Figma__use_figma` avec :
   - `fileKey="2iWoG3h7SegFmchssYAV80"` ;
   - `description` = le nom du fichier ;
   - `skillNames="resource:figma-use,resource:figma-generate-design"` ;
   - `code` = le contenu **exact** du fichier, caractère pour caractère : sans reformulation, ajout, troncature ni « … ».
3. Écrire le résultat brut dans `call-results/<nom du fichier>.json` (outil Write). En cas d'erreur, écrire `{"is_error": true, "raw": "<message complet>"}`.
4. Après un succès, déplacer le fichier dans `calls/done/` (`mv`).

## Erreurs

- **Faute de syntaxe JavaScript ou JSON** (probable erreur de recopie) : relire le fichier et réessayer une fois, à l'identique.
- **Toute autre erreur, ou la même erreur deux fois** : s'arrêter. Rapporter l'erreur complète et `safeToRetryWithoutCanvasRead` s'il est présent.
- Ne jamais exécuter le fichier suivant après une erreur non résolue : les appels dépendent les uns des autres.

## Captures de contrôle (si la demande le précise)

1. Appeler `get_screenshot(fileKey, nodeId=<id renvoyé>, maxDimension=<valeur demandée>)`.
2. Télécharger l'image avec `curl -sL -o call-results/<nom>.png '<image_url>'`.

## Gros fichiers et workflow (depuis le 16 octobre)

- Un appel de 40 000 caractères coûte environ 37 000 jetons à lire, puis autant à recopier. Les coordonnées se découpent mal. Un même agent ne peut donc pas en enchaîner beaucoup : le 16 octobre, un coursier s'est arrêté après deux appels, contexte plein.
- **Lecture** : lire avec `Read` et `allow_large: true`, car une ligne unique dépasse le plafond ordinaire.
- **Envoi** : le workflow [`scripts/courier-workflow.js`](scripts/courier-workflow.js) lance **un agent neuf par fichier**.
  - Les fichiers sont organisés en chaînes. Une chaîne s'exécute dans l'ordre et s'arrête à la première erreur.
  - Les chaînes indépendantes (pages différentes) tournent côte à côte.
  - Arguments : `{ base, transcripts, chains: [[{ file, shots?: [{ node, max, out }] }]], pre?, context? }`.
  - **18 octobre** : `pre` liste les appels qui doivent passer avant tout écran (variables de texte `*-variables-textes.js`, variables d'ombre `*-effets.js`). Ils partent un par un ; les chaînes ne démarrent que si chacun a réussi avec une recopie exacte. `python3 scripts/rendu_complet.py chains <depuis>` rend directement `{ pre, chains }`.
  - **Garde** (18 octobre) : un coursier n'envoie pas un écran tant qu'un appel de variables de numéro inférieur reste dans `calls/`.
  - `context` (facultatif) précise aux coursiers d'où viennent les appels. Il ne remplace pas une consigne de l'utilisateur : après une question de l'utilisateur (par exemple un point d'avancement), les coursiers ont refusé d'envoyer jusqu'à sa consigne suivante (« continue les envois »).
  - Les noms de fichiers et les chemins sont passés entre apostrophes dans les commandes ; les appels de bibliothèque ont des noms réduits à `[a-z0-9-]`.
- **Contrôle de la recopie** : `python3 -I scripts/verify_sent.py <fichier> <chemin> <dossier subagents de la session>`.
  - Le script compare le code réellement transmis, relevé dans les journaux des agents, au fichier.
  - Il affiche MATCH ou DIFF. La chaîne s'arrête si la dernière ligne n'est pas MATCH.
  - **18 octobre, soir** : un appel réussi mais recopié inexactement (DIFF avec `ok`) n'est pas renvoyé automatiquement, car il a déjà modifié le fichier Figma. Un écran se renvoie tel quel : le moteur remplace le cadre du même nom (1257). Un appel de variables se corrige par un nouvel appel (1236 → 1416).
- **Coupures du serveur** (19 octobre, 0 h 18 à 0 h 33 UTC) : « Anthropic proxy: MCP server connection lost » sur des appels de toutes tailles. Un appel coupé peut s'être exécuté ou non : le vérifier dans le fichier (lecture seule) avant de le renvoyer. **Avant de relancer une chaîne, arrêter la course qui la portait** (TaskStop) : une course dont un coursier avait signalé l'interruption a réessayé et poursuivi sa chaîne pendant la relance, et deux coursiers ont envoyé 1528 et 1529 à quelques secondes d'intervalle (sans doublon dans le fichier, vérifié).
- **Erreur générique** (19 octobre, 3 h 03 UTC) : « An unexpected error occurred » sur trois clones sombres et une lecture de contrôle, dans la même minute, juste après une lecture de toute la page Projets (`findAllWithCriteria` sur une page très lourde). Le coursier la réessaie désormais comme une coupure de connexion, jamais pour une partie intermédiaire d'un écran découpé. Par précaution (lien non démontré : seulement la coïncidence dans le temps), ne pas lire une page très lourde en entier pendant des envois.
- **Page Projets** (19 octobre) : son chargement coupe souvent la connexion au premier essai (environ une fois sur deux, systématiquement entre 1 h 50 et 4 h 17 UTC), écritures comme lectures. Les écritures finissent par passer au renvoi (au deuxième essai pour 1615 à 1618 et 1634, exécuté dès le premier envoi ; au troisième pour 1608 ; 1614 exécuté malgré quatre réponses perdues). Une lecture de contrôle a échoué sept fois de suite, puis est passée juste après des envois sur cette page. Les lectures de contrôle partent donc aussi par le coursier, numérotées dans `calls/` (1743, 1744) : il réessaie et contrôle la recopie. Les exports (`get_screenshot`) passent, sauf ceux des sections de filtres (16 cadres très lourds) : leurs cadres s'exportent un par un.
- **Copies des parcours depuis Projets** (19 octobre, matin) : les copies les plus lourdes (commentaires, filtres déployés) coupaient à chaque essai, puis 1811 a reçu « Plugin execution failed due to internal timeout ». La copie aboutissait souvent côté Figma sans que la réponse revienne ; l'ancien appel la supprimait au renvoi et recommençait. Depuis 1898, l'appel garde une copie déjà faite (`kept`), termine sa conversion si une course l'a interrompue, et ne charge la page source que pour une copie encore à faire. Les renvois l'ont confirmé : 1898 et 1902 à 1907 ont retrouvé 25 copies faites pendant des essais sans réponse. Le coursier réessaie aussi sur « internal timeout » (jamais pour une partie intermédiaire d'un écran découpé).
- **Images** (23 octobre) : le dépôt (`upload_assets`, puis l'envoi des octets par `curl` aux adresses qu'il donne) a répondu « success » avec une empreinte, mais l'image n'a jamais été enregistrée dans le fichier. Aucun calque ne la portait, Figma ne connaissait pas l'empreinte, et la réponse ne donnait aucun détail de placement (1961 à 1964). Une petite image est donc créée par l'appel lui-même, depuis ses octets, avec `figma.createImage(figma.base64Decode(b64))`, puis posée sur ses calques (deux par appel, cadres français et anglais ; 1966, 1967 : plan des rues des pages Compte en membre, 2,7 et 2,2 Ko). L'empreinte n'est inscrite au registre qu'après la confirmation du placement par l'appel.
- **Espaces insécables** (18 octobre, soir) : un coursier a recopié U+202F en espace ordinaire (appel 1236). Depuis, U+202F et U+00A0 figurent dans les appels sous forme de jetons visibles `⟦202f⟧` et `⟦00a0⟧`, remis en place dans Figma (`render.js`, appel des variables de texte) : ils se recopient tels quels.

## Interdits

- Envoyer tout autre code Figma.
- Modifier quoi que ce soit dans le dépôt en dehors de `call-results/` et des déplacements vers `calls/done/`.
- Appeler d'autres outils Figma que ceux de la demande.
