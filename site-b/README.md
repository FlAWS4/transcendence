# site-b/ — version B of the 42 Horizon prototype

Version B started as a copy of the current site ([`site/`](../site/README.md), version A) that differs **only in the Explorer page**. It has no 3D globe. Instead, a level selector lets you choose a continent, then a country, then a campus. It was requested on 24 October 2026 as a variant beside version A, not as its replacement. Version A is unchanged. Since 25–26 October, a few changes requested by the user also reach version B's entrance and pages (see below).

It is a static prototype, version 0.0.1 pre-alpha, committed and pushed to the `rel-hass` branch on 26 October 2026, not merged into `main`. Its look follows the **Halo** design chosen by the user among three mock-ups ([`studies/explorer-b-design/`](../studies/explorer-b-design/README.md)), refined at the user's request on 25–26 October ([EXPLORER-B-REFINEMENTS-20261025.md](notes/EXPLORER-B-REFINEMENTS-20261025.md)).

## How the Explorer works

- **Levels**:
  - level 1: the four UN M49 regions of the network (Africa, Americas, Asia, Europe; Turkey in Asia, no Oceania), in the order of the language. « Monde » was removed from this level on 25 October: the world filter is simply the state where no continent is validated;
  - level 2: the countries;
  - level 3: the campuses.
- **Cursor and validation**: the content filter starts on the world. Moving the cursor (arrows, a drag or a swipe, the wheel, a click or a tap on a neighbour) never filters. Validating (Enter, a click on the centre, the « Valider » button) applies the filter and opens the next level with the cursor on its first item. Escape, Backspace, the scope bar's back arrow and the crumbs go up a level. There are no Previous/Next buttons.
- **Campus sheet**: validating a campus opens its sheet in place of the selector, inside the Explorer, never as a covering panel. The other campuses of the country stay in a strip for switching. The « Explorer {campus} » buttons of the content pages lead to this sheet.
- **Halo look**, as refined on 25–26 October:
  - silhouettes stand on a curved horizon, the same line at every level, with a pool of light under the centre item; no halo surrounds the items or the sheet's logo;
  - countries show their flag inside their shape, with the name written over it, above the campus dots; no campus count is written under the items, only the indication under the filter;
  - campuses show their official logo directly on the page, with the name below; on phones, the neighbours' logos show at the screen edges;
  - one fixed « Valider » button at the centre, at the same height at every level (the compact row of small landscape windows keeps its cursor's own chip); the keyboard focus ring surrounds only this « Valider » (the user's choice);
  - at the top, only the three step dots, centred; the prompt stays for screen readers. The key hints sit in a bubble behind an ⓘ button at the end of the dots and count row;
  - a drag, the arrow keys (held or not), the wheel and clicks move the items along the horizon; at a level change, only what changes animates.
- **Pages of version B**:
  - the dark theme's background is the plain ink #1B1B1B, without the pink and teal corner glows;
  - the scope pill shows the path in steps, « Monde › Pays › Campus », the steps still to choose in grey (on phones, the current step and the next one); it keeps one size, that of the longest path, stays centred and never moves when the filter changes; it shows the « Revenir au monde » globe pictogram on every page (inert in reading mode);
  - the « Exploration · 42 Horizon » note and its dialog are removed, their room kept empty;
  - in landscape windows at most 720 px tall, the bottom dock becomes a menu on the left (on the right in Arabic), in the style of version A's first side menu at a smaller size: no panel, muted labels, a soft pill gliding to the current section; it is centred in the height and does not fade while a page scrolls. Labels are 18 px when the window is wider than 1050 px and 16 px from 701 to 1050 px; only the icons show at 700 px and less, each with its name as a tooltip. The search and the dice are two icons under the sections (the dice under the search when only the icons show).
- **Entrance** (`index.html`): no ring around the 42 any more. The horizon arc is drawn where the Explorer's horizon is, below the 42. The 42 then flies to the header's 42; once it has landed, HORIZON appears with the letter cascade of the HORIZON ↔ AWARDS transition, the continents slide in along the horizon and stop on Afrique (mirrored in Arabic, stopping on آسيا), and the other elements arrive from their own edges.

## Files specific to version B

| Path | Role |
| --- | --- |
| `continents.mjs` | The four network regions (UN M49) and their countries. |
| `explorer-model.mjs` | Pure model of each level: items, counts, cursor rules. |
| `explorer-selector.mjs`, `.css` | The selector: Halo layout, keyboard, pointer and touch, transitions, campus frame and strip. |
| `explorer-campus.mjs`, `.css` | The campus sheet. |
| `explorer-art.mjs`, `.css` | Drawing of silhouettes, globe, dots, the sheet's locator, printed logos and icons; Halo colour tokens (`--hx-`). |
| `explorer-band.mjs` | Measures the free band between the scope bar and the dock (with the side menu, down to the window's bottom margin). |
| `scope-pill.mjs` | Lists every path the scope pill can show and fixes the pill's size to the longest one (with a short form on phones). |
| `explorer-shapes.mjs` | Simplified silhouettes and their metadata: labels, campus dots, Urals cut runs, flag fits, the « Monde » globe (still generated, no longer shown). Generated, do not edit. |
| `tools/build-explorer-shapes.mjs` | Reproducible generator of `explorer-shapes.mjs` from the pinned Natural Earth 5.1.1 file. |
| `campus-logos.json`, `assets/campus-logos/` | Official campus logos (42 network catalogue) and their manifest; `assets/campus-logos/print/` holds the ink masks used for display. |
| `tools/build-campus-logo-prints.py` | Reproducible builder of the logo prints. |
| `assets/flags/` | Flags of the 30 countries, from flag-icons 7.5.0 (MIT licence). |
| `welcome.mjs`, `index.html`, `content-preview.html` | Version A's controller and entry pages, adapted (no globe, no MapLibre). Each changed file gets a new cache key prefixed `b`, up to `b9` on 26 October. |
| `entrance.mjs`, `.css`, `brand-wordmark.mjs`, `.css`, `responsive-dock.css`, `dock-navigation.css`, `dock-search.mjs`, `reading-scope.mjs`, `welcome.css`, `content-preview.css` | Version A's files adapted for the refinements of 25–26 October: the entrance (arc, flight, cascade), the side rail and its search, the world command and the pill's fixed width, the plain dark background, the note's removal. |
| `notes/` | The build specification ([SPEC-B-HALO.md](notes/SPEC-B-HALO.md)), the fixes made after verification ([HALO-FIXES-20261025.md](notes/HALO-FIXES-20261025.md)) and the refinements requested on 25–26 October ([EXPLORER-B-REFINEMENTS-20261025.md](notes/EXPLORER-B-REFINEMENTS-20261025.md)). |

Version A's globe files (MapLibre, local geography, campus street map) are not part of version B.

## Choices recorded by the user

- **Borders**: Morocco includes the whole of Western Sahara, and Russia is split between Europe and Asia along the Urals. Both apply to version B's silhouettes only.
- **Colours**: they are the Halo mock-up's for now. A check of the 42 charter across the whole site is planned later, at the user's request.

## Provenance and limits

- **Silhouettes**: Natural Earth 5.1.1, public domain.
- **Flags**: flag-icons, MIT licence; see [assets/flags/PROVENANCE.md](assets/flags/PROVENANCE.md).
- **Campus logos**: trademarks of their owners, used to identify the campuses in this prototype. No permission to redistribute them has been established, so any publication is the user's decision; see [assets/campus-logos/PROVENANCE.md](assets/campus-logos/PROVENANCE.md).
- **« Monde » globe** (no longer shown since 25 October): centred on 12°E 24°N, it showed 51 of the 58 campuses. Seoul, Tokyo, Gyeongsan, Singapore, Kuala Lumpur, Penang and Iskandar Puteri were on its far side.
- **Checks**: since 26 October, at the user's request, each change gets its tests and a few key screenshots; the complete checks are deferred to the end of the project and listed in [docs/VERIFICATIONS-FINALES.md](../docs/VERIFICATIONS-FINALES.md).

## Run and test

From the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1      # then open http://127.0.0.1:8765/site-b/content-preview.html#explore (index.html for the entrance)
bash -c 'node --test site-b/*.test.mjs site-b/tests/*.test.mjs'
node site-b/tools/build-explorer-shapes.mjs --source <ne_10m_admin_0_countries.geojson> --check
python3 -I site-b/tools/build-campus-logo-prints.py --check
```

The command also runs as is under zsh, which expands both patterns; `bash -c` keeps the form the checks use.

Earlier states of version B are in [`archives/site-b-versions/`](../archives/site-b-versions/README.md).
