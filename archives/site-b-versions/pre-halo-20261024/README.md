# Version B before the Halo redesign — 24 October 2026

**Format: source copy.** These are the files of version B ([`site-b/`](../../../site-b/README.md)) that the Halo redesign of the Explorer replaced on 25 October 2026. They are not a standalone page.

## What this state was

The first working version B: the Explorer without a globe, as a level selector (Monde and the four continents, then countries, then campuses), where only validation filters the content. Its look was provisional:
- items drawn as rectangular cards;
- the campus sheet shown in a large white panel.

The user then asked for silhouettes with flags, logos without blocks, and a campus sheet in place of the selector. Three design mock-ups followed ([`studies/explorer-b-design/`](../../../studies/explorer-b-design/)), and the user chose Halo.

This state already included:
- the silhouettes generated from Natural Earth, with Morocco including Western Sahara and Russia split along the Urals;
- the flags and the campus logos.

## Files

| File | Note |
| --- | --- |
| `explorer-selector.mjs`, `explorer-selector.css`, `explorer-selector.test.mjs` | The card carousel and its campus panel. |
| `welcome.mjs`, `index.html`, `content-preview.html`, `content-preview.mjs` | Controller and entry pages, cache keys `b1`. |
| `tests/explorer-filter.test.mjs`, `campus-details.test.mjs` | Tests of the controller and of the campus sheet wiring. |
| `tools/build-explorer-shapes.mjs`, `explorer-shapes.mjs`, `explorer-shapes.test.mjs` | Silhouette generator and its output, before the Halo metadata (labels, campus dots, Urals cut runs, flag fits, globe). |
| `campus-logos.json` | Logo manifest without the `print` field. |

[manifest.json](manifest.json) records the bytes and SHA-256 of each file.

## How it was preserved

A full copy of `site-b/` had been taken just before the redesign, but a reboot of the machine on 25 October erased it, because it was in a temporary folder held in memory. The files were therefore rebuilt from the session's transcripts:
- **full reads** of each file made by the agents between the end of the first build and the start of the redesign;
- **edit replays**:
  - the filter test was rebuilt from its creation and its later edits;
  - the generator from its last full read plus the Urals edits;
  - the shapes test from its creation plus the Morocco and Urals edits;
  - the two entry pages from the read of `index.html` and the difference between version A's two pages;
  - `content-preview.mjs` from version A's file plus its one-line change.
- **regeneration**: `explorer-shapes.mjs` was regenerated with the rebuilt generator and the pinned Natural Earth source (`--check` passes).
- **subtraction**: in `campus-logos.json`, the `print` field added later was removed.

Check (25 October): with these files copied over a copy of the Halo state that followed the redesign, and the files added by the redesign deleted, the old test suite passes **544 out of 544**, the exact count of that state.

## Replaying it

1. Copy `site-b/` to a sibling folder of `site/`, for example `site-b-cards/`, so that the `../shared/` and `../site/` links keep working.
2. Version B changed again on 25–26 October. First replay [`pre-explorer-refinements-20261025/`](../pre-explorer-refinements-20261025/README.md): copy its files over the copy, keeping their paths, and delete the four files its README lists as added. Then copy the ten files of [`pre-no-monde-20261025/`](../pre-no-monde-20261025/README.md) over it. This gives back the Halo state that followed the redesign.
3. Copy these files over it, keeping their paths.
4. In the copy, delete the files the redesign added:
   - `explorer-art.css`, `explorer-art.mjs`, `explorer-art.test.mjs`;
   - `explorer-campus.css`, `explorer-campus.mjs`, `explorer-campus.test.mjs`;
   - `campus-logos.test.mjs`, `tools/build-campus-logo-prints.py`, `assets/campus-logos/print/`;
   - `notes/`.
5. Open `http://127.0.0.1:8765/site-b-cards/content-preview.html#explore` through the local server started at the repository root.
