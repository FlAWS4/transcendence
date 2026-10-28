# Version B before the side rail took the style of version A's first menu — 26 October 2026

**Format: source copy.** These are the files of version B ([`site-b/`](../../../site-b/README.md)) that changed when the side rail of short landscape windows took the style of version A's first side menu, on the afternoon of 26 October 2026. They are not a standalone page.

## What this state was

Version B as committed in `46279b0` on 26 October 2026. In landscape windows at most 720 px tall, the bottom dock became a side rail (refinement §W):
- a white, rounded glass panel with shadow, holding icon-and-label buttons;
- 140 px wide with labels above 1050 px of width, 56 px with icons only below;
- anchored on the bottom margin;
- the search and the dice as two round glass buttons at its foot;
- fading, like the bottom dock, while a content page scrolls.

The user then asked: « Je veux que le nouveau menu, quand la hauteur devient trop faible, soit dans le même style que le menu dans les premières versions du site A », followed by corrections, all quoted in §X of [EXPLORER-B-REFINEMENTS-20261025.md](../../../site-b/notes/EXPLORER-B-REFINEMENTS-20261025.md).

## Files

| File | Note |
| --- | --- |
| `responsive-dock.css` | The §W rail: the glass panel, its two label steps, its bottom anchoring, the round search and dice, the scroll fade. |
| `welcome.mjs`, `explorer-band.mjs` | The rail's switch and tooltips; the band bounded by the rail's foot. |
| `tests/dock-rail.test.mjs` | The six tests of the §W rail. |
| `index.html`, `content-preview.html`, `content-preview.mjs` | Entry pages with the cache keys before `b8`. |

No file was added or removed by the change. [manifest.json](manifest.json) records the bytes and SHA-256 of each file.

## How it was preserved

The seven files were taken from commit `46279b0`, the last committed state before the change, once the change was made.

Check: these files, copied over the state that followed the change, give back exactly the files of `46279b0` (notes aside) and its test suite, **749 out of 749**; after §Y, the same result comes once the files of `pre-path-pill-20261026/` are copied first (checked on 26 October).

## Replaying it

1. Copy `site-b/` to a sibling folder of `site/`, for example `site-b-rail/`, so that the `../shared/`, `../site/`, `../studies/` and `../archives/` links of the pages and tests keep working.
2. Version B changed again the same evening (§Y). First copy the files of [`pre-path-pill-20261026/`](../pre-path-pill-20261026/README.md) over the copy, keeping their paths.
3. Then copy these files over it, keeping their paths.
4. Open `http://127.0.0.1:8765/site-b-rail/content-preview.html#explore` in a landscape window at most 720 px tall, through the local server started at the repository root.

The older states still replay directly on today's `site-b/`, as their READMEs describe: their files cover these seven, or list them as added. Checked on 26 October: [`pre-explorer-refinements-20261025/`](../pre-explorer-refinements-20261025/README.md) gives back 638 out of 638.
