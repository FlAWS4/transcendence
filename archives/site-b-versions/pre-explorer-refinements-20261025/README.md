# Version B before the refinements of 25–26 October 2026

**Format: source copy.** These are the files of version B ([`site-b/`](../../../site-b/README.md)) that the refinements requested by the user on 25 and 26 October 2026 replaced. They are not a standalone page.

## What this state was

Version B with the Halo design, just after « Monde » was removed from level 1 (cache keys up to `b6`):
- the items stood on halos of light, with a count under each continent and country;
- the selector had Previous/Next buttons, a prompt beside the step dots, and the key hints under the pager;
- each item carried its own « Valider » chip;
- the campus level had its own, higher horizon;
- the entrance drew a ring around the 42, then opened onto the Explorer as an iris;
- the pages showed the « Exploration · 42 Horizon » note, pink and teal glows in the dark theme's corners, a scope pill as wide as its text with the « Revenir au monde » globe on the Explorer only, and the bottom dock in every window.

The user then asked for nineteen changes, each quoted with the answers in [EXPLORER-B-REFINEMENTS-20261025.md](../../../site-b/notes/EXPLORER-B-REFINEMENTS-20261025.md).

## Files

| File | Note |
| --- | --- |
| `explorer-selector.mjs`, `explorer-selector.css`, `explorer-selector.test.mjs` | The selector with its halos, Previous/Next buttons, counts, per-item « Valider » chips, the prompt beside the step dots and the hint line; rigid drags, transition-based glides, whole-level fades, and the campus level's own horizon. |
| `explorer-art.css`, `explorer-art.test.mjs` | The glow tokens of the items. |
| `explorer-campus.css`, `explorer-campus.test.mjs` | The halo of the sheet's logo. |
| `explorer-band.mjs` | The band, bounded below by the note and the bottom dock's controls only. |
| `entrance.mjs`, `entrance.css`, `entrance.test.mjs`, `index.html` | The entrance with the ring around the 42 and the iris opening; the entry page with its cache keys. |
| `brand-wordmark.mjs`, `brand-wordmark.css`, `tests/brand-wordmark.test.mjs` | The header's wordmark, without the entrance's HORIZON cascade. |
| `welcome.mjs`, `welcome.css` | The controller (the note and its dialog, the entrance wiring, the filter, the bottom dock only) and the dark theme's corner glows. |
| `content-preview.html`, `content-preview.mjs`, `content-preview.css` | The preview page with its cache keys, and the note's placement on content pages. |
| `reading-scope.mjs`, `tests/reading-scope.test.mjs`, `dock-navigation.css`, `tests/explorer-filter.test.mjs` | The filter: the « Revenir au monde » button on the Explorer only, a pill as wide as its text. |
| `responsive-dock.css`, `dock-search.mjs`, `tests/dock-search.test.mjs` | The bottom dock in every window, and its search. |
| `tests/campus-sheet-fixture.html`, `tests/media-viewer-browser.html` | Browser test pages; only their `welcome.css` cache key changed. |

Four files were added by the refinements and have no earlier version: `scope-pill.mjs`, `tests/scope-pill.test.mjs`, `tests/dark-background.test.mjs` and `tests/dock-rail.test.mjs`. No file was removed.

[manifest.json](manifest.json) records the bytes and SHA-256 of each file, and the added files.

## How it was preserved

A copy of every code file of version B (the 102 `.mjs`, `.css` and `.html` files at its root and the 40 `*.test.mjs` files of `tests/`) was taken on 25 October, just before the refinements began. During the work, the session's temporary reference copy of the whole state was erased twice by power losses and rebuilt from this folder and the unchanged files. Once the refinements were done, on 26 October, the copies identical to the new files were removed. The two browser test pages, which the first copy did not include, come from that reference copy: the final cache-key change touched them too.

Check: these files, copied over the state that followed the refinements, without the four added files, give back the old test suite: **638 out of 638**, the exact count of that state.

## Replaying it

1. Copy `site-b/` to a sibling folder of `site/`, for example `site-b-before/`, so that the `../shared/`, `../site/`, `../studies/` and `../archives/` links of the pages and tests keep working.
2. Copy these files over the copy, keeping their paths.
3. Delete the four added files from the copy.
4. Open `http://127.0.0.1:8765/site-b-before/content-preview.html#explore` (or `index.html` for the entrance) through the local server started at the repository root.
