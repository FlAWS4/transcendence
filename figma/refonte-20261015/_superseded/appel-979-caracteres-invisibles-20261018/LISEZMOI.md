# Appel 979 (essai du globe ancré) — 18 octobre 2026

Un premier coursier a refusé d'envoyer la première partie : le moteur contenait des caractères invisibles écrits en
clair par esbuild (U+202F et U+00A0 issus de `String.fromCharCode`, U+200F, U+0600 et U+FEFF dans la plage arabe), et
les données des isolants U+2068/U+2069 issus de la fusion des `<bdi>`. Le second essai de la chaîne l'a envoyée avec une
recopie **inexacte** (ces caractères remplacés par des espaces) : le contrôle a répondu DIFF, la chaîne s'est arrêtée, et
le cadre provisoire « ⟦build projects-projects-desktop-fr-globe-ancre⟧ » (442:91305) est resté dans Archives. Les parties
2 et 3 n'ont jamais été envoyées.

Le moteur ne contient plus de caractère invisible (`String.fromCodePoint`, plage arabe échappée) et la fusion n'ajoute plus
d'isolants. Remplacé par l'appel 980, dont la première partie supprime ce cadre provisoire de même nom avant de reconstruire.
