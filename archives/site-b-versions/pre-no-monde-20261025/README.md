# Version B before « Monde » was removed — 25 October 2026

**Format: source copy.** These are the files of version B ([`site-b/`](../../../site-b/README.md)) that the removal of « Monde » from the Explorer's first level replaced on 25 October 2026. They are not a standalone page.

## What this state was

Version B with the Halo design, as built, verified and fixed on 25 October (cache keys up to `b5`). Level 1 of the Explorer showed « Monde », drawn as a small globe, before the four continents. Validating Monde opened the list of all 30 countries, which had no other entry.

The user then asked: « Je veux que tu retires Monde et que tu laisses uniquement les continents, le filtre sera actif simplement si on ne valide pas de continent. » Level 1 now holds only the four continents, and the world filter is simply the state where no continent is validated.

## Files

| File | Note |
| --- | --- |
| `explorer-model.mjs`, `explorer-model.test.mjs` | Level model with the Monde item and the 30-country list. |
| `welcome.mjs` | Controller: the Monde validation, the list's history fields (`explorerList`, `explorerVia`) and its memory. |
| `explorer-selector.mjs`, `explorer-selector.test.mjs` | The selector's lookup of the Monde globe, and tests built on five level-1 items. |
| `index.html`, `content-preview.html`, `content-preview.mjs` | Entry pages, with the cache keys before `b6`. |
| `tests/explorer-filter.test.mjs`, `campus-details.test.mjs` | Controller tests that covered the Monde paths. |

[manifest.json](manifest.json) records the bytes and SHA-256 of each file.

## How it was preserved

A copy of every code file of version B (`.mjs`, `.css`, `.html` and the tests) was taken just before the change. Once the change was made, the copies identical to the new files were removed, which left the ten files above. The globe drawing and its data (`explorer-art.mjs`, `explorer-shapes.mjs`) did not change and are not copied here.

Check: these ten files, copied over the state that immediately followed the removal, give back the old test suite: **637 out of 637**, the exact count of that state.

## Replaying it

1. Copy `site-b/` to a sibling folder of `site/`, for example `site-b-monde/`, so that the `../shared/`, `../site/`, `../studies/` and `../archives/` links of the pages and tests keep working.
2. Version B changed again on 25–26 October. First replay [`pre-explorer-refinements-20261025/`](../pre-explorer-refinements-20261025/README.md): copy its files over the copy, keeping their paths, and delete the four files its README lists as added. This gives back the state that immediately followed the removal.
3. Then copy these ten files over it, keeping their paths.
4. Open `http://127.0.0.1:8765/site-b-monde/content-preview.html#explore` through the local server started at the repository root.
