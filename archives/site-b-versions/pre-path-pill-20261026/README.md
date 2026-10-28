# Version B before the scope pill became a path in steps — 26 October 2026

**Format: source copy.** These are the files of version B ([`site-b/`](../../../site-b/README.md)) that changed when the scope pill became a path in steps (refinement §Y), on the evening of 26 October 2026. They are not a standalone page.

## What this state was

Version B with the side rail in the style of version A's first menu (refinement §X, not committed). The scope pill had one fixed width, that of the longest indication in the language (refinement §T, for example « Émirats arabes unis › 42 Abu Dhabi »):
- at « Monde », the default state, most of the pill was empty (209 px out of 345 at 1440 px wide);
- the pill sat 26 px off the page's axis, because the hidden ← kept its room.

The user asked for a pill that is never empty, centred and still. Four trials were built and compared ([`studies/explorer-b-filter-studies/`](../../../studies/explorer-b-filter-studies/NOTES.md)); the user chose the path in steps, without the continent step. The request and the answers are quoted in §0 item 21 and §Y of [EXPLORER-B-REFINEMENTS-20261025.md](../../../site-b/notes/EXPLORER-B-REFINEMENTS-20261025.md).

## Files

| File | Note |
| --- | --- |
| `scope-pill.mjs`, `tests/scope-pill.test.mjs` | The §T width: the longest single indication. |
| `welcome.mjs`, `tests/explorer-filter.test.mjs` | The controller without the steps of the path. |
| `dock-navigation.css` | The pill's rules of §S and §T. |
| `index.html`, `content-preview.html`, `content-preview.mjs` | Entry pages without the steps' markup, with the cache keys before `b9`. |

No file was added or removed by the change. [manifest.json](manifest.json) records the bytes and SHA-256 of each file.

## How it was preserved

A copy of every code file of version B was taken just before the change. Once it was made, the copies identical to the new files were removed, which left the eight files above.

Check: these files, copied over the state that followed the change, give back the old test suite, **752 out of 752**, the exact count of that state.

## Replaying it

1. Copy `site-b/` to a sibling folder of `site/`, for example `site-b-pill/`, so that the `../shared/`, `../site/`, `../studies/` and `../archives/` links of the pages and tests keep working.
2. Copy these files over the copy, keeping their paths.
3. Open `http://127.0.0.1:8765/site-b-pill/content-preview.html#explore` through the local server started at the repository root.

The state committed before §X is replayed from this one: then copy the files of [`pre-old-style-rail-20261026/`](../pre-old-style-rail-20261026/README.md) over the same copy (749 out of 749, checked on 26 October).
