# Repository reorganization — 23 October 2026

At rel-hass's request ("faire le tri … séparer très clairement le code de chacun de façon explicite"), the former `work/` folder was split so that each version of the site has its own, explicitly named place. rel-hass chose, among the assistant's proposals: one folder per **version of the site** (not per team member), a **real move** into explicit top-level folders, and, in the boarding journal and the evidence, **only link paths corrected**.

Files were moved, never deleted. Before the move the repository was clean at commit `5466285`, so every previous byte is also in Git history. At rel-hass's request, the move was then committed as `94969a2` (signed) and pushed to `rel-hass`; it is not merged into `main`.

**Team guide.** The onboarding guide (§ 21 of [DOCUMENTATION.en.md](../DOCUMENTATION.en.md)) recommended agreeing on the structure with the team before moving archives. rel-hass's explicit request took precedence; the guide now records the move, and the team still has to approve the layout.

## Old → new paths

Longest match first: a path inside a folder follows its folder.

| Old path | New path |
| --- | --- |
| `work/visualizations/horizon-welcome/` | `site/` — current version only |
| `work/visualizations/horizon-welcome/*.md` (48 notes) | `site/notes/` |
| `work/visualizations/horizon-welcome/archive/` | `archives/site-versions/` ([index](../../archives/site-versions/INDEX.md)) |
| `work/visualizations/horizon-welcome/welcome-panels.html`, `.mjs` | `archives/early-prototypes/welcome-panels/` |
| `work/visualizations/horizon-decryption*.{html,css,mjs}`, `horizon-decryption-engine*.mjs`, `horizon-decryption-morph.mjs`, `decryption-notes.md` | `archives/early-prototypes/decryption/` |
| `work/visualizations/horizon-globe*.html`, `globe-engine.js`, `horizon-scene.css`, `build_horizon.py`, `explorer-campus*.html` | `archives/early-prototypes/globe-explorer/` |
| `work/visualizations/content-first-proposal*.html` | `archives/early-prototypes/content-first-proposal/` |
| `work/visualizations/horizon-welcome-separate-city/` | `archives/early-prototypes/separate-city-map/` |
| `work/visualizations/<study>/` (13 studies, including `research-archive/`) | `studies/<study>/` |
| `work/visualizations/brand-transition-studies-initial-20261008/` | `studies/brand-transition-studies/archive/initial-20261008/` |
| `work/visualizations/connected-experience-studies-{bounded-scroll,full-sidebar-scroll}-20261007/` | `studies/connected-experience-studies/archive/{bounded-scroll,full-sidebar-scroll}-20261007/` |
| `work/visualizations/profile-navigation-studies-{initial,pre-group-selection,pre-project-filters,pre-underlined-tabs}-20261007/` | `studies/profile-navigation-studies/archive/{…}-20261007/` |
| `work/visualizations/assets/`, `map-data/` | `shared/assets/`, `shared/map-data/` |
| `work/figma/logo-42.svg`, `tokens.css` | `shared/brand/` |
| `work/figma/refonte-20261015/` | `figma/refonte-20261015/` |
| `work/figma/` (everything else) | `figma/explorations-2026-09/` |
| `work/visualizations/site-map/` | `docs/site-map/` |
| `work/reviews/` | `docs/reviews/` |
| `DOCUMENTATION.md`, `DOCUMENTATION.en.md`, `CONVERSATION.md`, `en.subject.pdf`, `42 - Charte graphique 2024.pdf` | `docs/` |

The complete rule list is in [path-map.json](path-map.json). The local server URLs change accordingly: `http://127.0.0.1:8765/work/visualizations/horizon-welcome/` becomes `http://127.0.0.1:8765/site/`.

## The site's own code

The site no longer loads code from a study or an earlier prototype. Its arrival screen used the scanner of `studies/decryption-examples/` and, through it, the engine of the first decryption prototype: those four modules (`scanner-return-random.mjs`, `scanner-return-together.mjs`, `shared.mjs`, `horizon-decryption-engine.mjs`) are copied into `site/decryption/`, identical except for the engine import line. The study keeps its own files. The site still uses the explicit shared folder `shared/`; two tests read files outside it: `site/tests/brand-wordmark.test.mjs` compares with `studies/brand-transition-studies/studies.mjs`, and `site/tests/media-viewer-browser.html` plays a clip from `figma/explorations-2026-09/entrance-proof/`.

## What was rewritten

Only references that **resolved before the move** were rewritten, so that each still lands on the same file:

- relative links in pages, styles, modules and Markdown, and repository paths (`work/…`) in documents, scripts and data files;
- `localhost:8765` URLs written in documents;
- Python paths computed from the script's location (`Path(__file__).parents[N]`, joins such as `REPO / 'work' / 'visualizations' / …`);
- the 25 pages that resolve their links against a `<base href>` (archive viewers of 7–13 October and the site's campus-sheet fixture), redone from their original bytes, and the 17 viewer modules that build addresses against that base;
- a few manual fixes: the site-map check, the shared Chrome helper of the checks, `export-tokens.py` (now writes `shared/brand/tokens.css`), `build_horizon.py`, and four scripts of the Figma rebuild.

In the existing text of `BOARDING_JOURNAL.md` and of the 9 September export `CONVERSATION.md`, only the targets of links changed (52 and 5); no word of the text did. A new dated entry was appended to the journal.

[ledger.json](ledger.json) lists every pre-existing file whose content changed (562, including the documents updated to describe this reorganization), with its old and new paths, its SHA-256 before and after, and each exact change, then the list of added files. Applying the changes in reverse rebuilds the previous bytes; the generator checked that the changes turn each previous text into the new one.

## What was deliberately left unchanged

These keep the paths of the old layout, because they record a past state:

- evidence data: results, measurements, manifests and hash lists (JSON, TXT, logs) under `checks/`, `verification/`, `call-results/`, proofs; the Figma calls already sent (`figma/refonte-20261015/calls/done/`); the published skeletons of the site map (`docs/site-map/checks/*/published-skeleton.html`); comments inside the SVG assets uploaded to Figma;
- frozen copies: `originals/`, `baseline/`, `_superseded/`, `source-documents/`, copies of notes kept inside site archives, and the source copies of the oldest archives (meant to be copied over the site, they never resolved in place);
- archive generators `snapshot.py`: their `--verify` mode only reads the archive's own folder and still passes;
- the 15 October "périmètre" audit scripts (`site/checks/20261015-audit-fixes/perimetre/`), which rebuild the old layout on purpose, and a few old check scripts that were already broken before the move.

## Checks

Run on 23 October 2026, after the move:

- **Tests** ([final run](results/final-checks.txt)): 660/660 for the site; 10 Awards, 7 brand-transition (after fixing one import that lost its `./`), 29 globe-gesture, 8 decryption-engine and 4 Figma-sync cases.
- **Site map**: `node docs/site-map/check-site-map.mjs` passes (65 screens, 110 links).
- **Archives**: the 12 site snapshots and the 2 study snapshots pass `snapshot.py --verify`.
- **Links**: every live reference of the rewritten files lands on the mapped file. A static crawl from every HTML page (318 before; 319 after, with the new site-map check output), honouring `<base href>`, compares the old tree (read from Git at `5466285`) with the new one ([result](results/static-crawl-comparison.txt)): 5,651 working references before, 5,654 after; the only differences are the site's two imports now served by `site/decryption/` and the three imports inside that folder. No reference broke.
- **Browser**: headless Chrome, one fresh browser per page, memory capped; local resources answering 404 and JavaScript errors recorded. The site entry loads 114 local resources with no error. With the WebGL globe blocked to stay within the available memory: the direct preview (two routes), the panel welcome, 22 pages of studies, early prototypes and the site map, and the 57 entry pages of the site archives (viewers, readers, snapshots). Apart from `favicon.ico`, which never existed, 51 archive pages and all the other pages have no missing local file and no error; the content of two sandboxed frames (the globe-control placement comparison and the archived Pong trial) could not be inspected. The 6 remaining archive pages are preserved `preview-before-…` states that keep an original defect on purpose (SVG sprite addressed through the archive URL, unpinned dependencies): served from the old tree extracted from Git, they fail in exactly the same way. See [results/](results/).
- **Globe**: on the site entry, the MapLibre map is created, the globe module, d3 and the decryption copies load, and no error screen appears ([probe](results/globe-probe-site-entry.json)).
- **Figma tooling**: the rebuild modules (`figlib`, `capture_lib`, `dom2fig`, `layout`, `variants`) import and resolve the site, the site-map data and the fonts; the 433 changed or moved Python scripts compile.

## Limits

- The globe itself was rendered only on the site's main entry; elsewhere it was blocked for memory reasons. Its files are inside `site/` and did not change.
- Old check scripts were corrected on a best-effort basis; they depend on states that no longer exist and were not re-run.
- Empty folders (holding no file) were not carried over; `.agents/` and `.codex/`, empty since 14 September, were recreated.

## Tools

The scripts used are in [tools/](tools/): `migrate.py` (plan, apply, verify), `pass2.py` (URLs in documents), `pass3_base.py` (`<base href>` pages), `pass4_docrel.py` (viewer modules), `crawl2.py` and `compare2.py` (static crawl), `browser_check*.py` (Chrome), `make_index.py` (site-versions index). They were run from a temporary folder; their paths are those of that session. `globe_probe.py` and `browser_check_entry.py` recorded the final checks of the site entry.
