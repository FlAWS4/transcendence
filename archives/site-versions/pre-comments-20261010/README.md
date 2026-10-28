# Before comments and independent display preferences — 10 October 2026

[Open the preserved interface](preview.html#projects) through the local project server. Direct entries: [Projects](preview.html#projects), [Chronicles](preview.html#journal), [Profiles](preview.html#people) and [Explorer](preview.html#explore).

This archive preserves the active Horizon prototype immediately before the addition of a **Comments** section to project and Chronicles details, and before **Grid/List became an independent preference for each content section**. The original controller is `fixed-campus-photo-controls-101`, with content preview entry `69`.

The preserved interface has four project sections (Overview, Implementation, Media, Team) and three Chronicles sections (Full article, Media, Authors). It has no comments module or comments section. Grid/List is still one shared setting across Projects, Profiles and Chronicles. Existing media enlargement, the corrected campus photo controls, the letter cascade and the previous campus sheet behaviour remain present.

## Preserved sources and reader

The parent agent captured a complete source snapshot **before editing the active files**. This directory contains **135 exact original files** from that snapshot: root HTML/CSS/JavaScript/JSON files, the test directory and three continuity documents. The original project README, project context and boarding journal are under `source-documents/`; they remain historical copies, not current documentation. The other original files retain their snapshot paths, including `project-ui.mjs`, `journal-ui.mjs`, `projects.css`, `welcome.mjs`, both HTML entries, `content-preview.mjs`, `content-preferences.mjs` and their tests.

Use **`preview.html`** to open this archive. The original `index.html` and `content-preview.html` are source copies, not adapted entry points.

`preview.html`, `viewer-entry.mjs` and `viewer-welcome.mjs` are separate reader adapters. The `runtime/` directory freezes **41 JavaScript modules, 28 CSS files and 5 JSON datasets** taken only from the snapshot. No active comments or independent-layout source was used to construct that runtime.

The [manifest](manifest.json) records every original and runtime file with its SHA-256 checksum and source, plus the reader adaptations. No historical study or active source file was modified to build this reader.

## Reader adaptations

- The HTML `<base>` points to the parent Horizon prototype so its existing fonts, graphics, campus media and third-party resources still resolve.
- The reader captures its own absolute URL from `location.pathname` and `location.search` before any history mutation. Generated routes and icon fragments use that URL, preserving the archive path and query parameters.
- All local application imports resolve to `runtime/`. JSON datasets are loaded through module-relative URLs into that same directory, independently of the HTML base.
- The dynamically loaded campus-direction stylesheet is frozen in `runtime/` as well.
- The entrance animation and geography worker retain their shared decryption/map-library dependencies with corrected relative paths. The geographic dataset is shared through an explicitly corrected URL.
- The runtime content-preferences module keeps the original **single global `view`** behaviour, but uses `horizon-archive-pre-comments-20261010-preferences-v1` and `horizon-archive-pre-comments-20261010-view`. Trying the archive does not overwrite the active prototype’s preference keys. Original unadapted keys remain in the preserved source file.

Fonts, design tokens, the official 42 symbol, portraits, campus photos/logos, map libraries, geographic resources and the decryption study remain shared inside the repository. The archive is therefore **not standalone outside the repository**. Urban map tiles and external campus websites remain dependent on external services.

## Verification performed

- All **135 original files** match the pre-edit snapshot byte for byte.
- Syntax checks passed for **43 reader/runtime JavaScript modules**.
- **125 local references** from the reader HTML, imports and module-relative URLs resolve. No reader application import points to an active root-level module, stylesheet or JSON file.
- Source checks confirm the absence of the comments module and preservation of the old global Grid/List state.
- Five route-construction cases retain the archive pathname and query string, including project, Chronicles and profile subsections and a campus route.
- The preserved project-sections, journal-sections and content-preferences test files pass: **3 test files, no failures**.
- Manifest checksums are verified after generation.

No browser replay is claimed by this archive preparation. Visual and interaction checks, if performed subsequently by the main task, must be recorded as a dated addition. This archive remains a local prototype, not a release or a production application.

The corresponding active work is documented in [PROJECTS_NOTES.md](../../../site/notes/PROJECTS_NOTES.md) and [JOURNAL_NOTES.md](../../../site/notes/JOURNAL_NOTES.md). All previous studies remain preserved.
