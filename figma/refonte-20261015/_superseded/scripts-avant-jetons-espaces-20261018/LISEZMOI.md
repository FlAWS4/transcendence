# Scripts avant les jetons des espaces insécables (18 octobre 2026, vers 20 h 15)

État de render.js, make_call.py et components.py avant que U+202F et U+00A0 voyagent dans les appels sous forme de jetons visibles (⟦202f⟧, ⟦00a0⟧). Le coursier de l’ppel 1236-variables-textes.js avait recopié U+202F en espace ordinaire (contrôle DIFF au caractère 784) ; aucun appel envoyé jusque-là ne contenait ces deux caractères.
