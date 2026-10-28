# Before multi-campus projects and independent local navigation — 12 October 2026

[Open the preserved Projects view](preview.html#projects) through the local project server, or open [ft_transcendence · Building as five](preview.html#projects/ft-transcendence-building-together) directly. The [project comments](preview.html#projects/ft-transcendence-building-together?tab=comments), [Profiles](preview.html#people), [Chronicles](preview.html#journal) and [Explorer](preview.html#explore) remain accessible.

This archive captures the active Horizon prototype before the changes requested on 12 October: associating projects with several participating campuses and making navigation within the left-hand detail menu independent of the main menu. It retains the former single-campus project model and original navigation behaviour. The fictional ft_transcendence example has contributors from several campuses but remains classified only under **42 Paris**. The reader deliberately retains that limitation for comparison.

The original controller is `project-repository-124`, content preview entry `91`, and responsive dock stylesheet `6`. Comments, mentions, report forms, the project repository form and the existing French, English and Arabic views are preserved as they were in the captured prototype. This is a historical prototype, not an integrated application or a release.

## Exact sources and separate reader

The root agent captured **196 original files** before changing active sources. [source-manifest.json](source-manifest.json) records their byte sizes and SHA-256 hashes. Those original files, including the HTML entries and tests, are unchanged. Use **preview.html** to browse the archive; the original `index.html` and `content-preview.html` remain source copies rather than adapted entry points.

`preview.html`, `viewer-entry.mjs` and `viewer-welcome.mjs` are reader adapters derived only from the captured files. `runtime/` freezes **51 JavaScript files, 33 stylesheets and 5 JSON datasets** from those same sources. No current multi-campus or corrected-navigation source was used to construct the reader. [reader-manifest.json](reader-manifest.json) lists reader adaptations, dependencies and checksums separately from the original snapshot manifest.

## Reader adaptations

- The HTML base points to the parent Horizon directory so shared graphics, fonts and libraries keep their original resolution.
- All application imports, stylesheets and JSON datasets are frozen in the archive runtime. The dynamically loaded campus-direction stylesheet and comment mention stylesheet are included.
- The reader captures its own pathname and query string before history changes. Generated routes and SVG icon references keep the archive entry, including when using the theme selector or campus dialog.
- The geography worker and entrance imports are adjusted for the archive directory depth. Geographic datasets retain explicit parent-directory URLs.
- Content preferences and favorites, theme preference, comments, reports and project repository drafts use archive-specific browser storage keys. Trying this historical version does not overwrite the active prototype's local preferences or drafts. The exact original storage keys remain in the unadapted source files.

Fonts, design tokens, the official 42 symbol, portraits, campus media, project media, map libraries, geographic resources and the decryption study remain shared within the repository. They were not changed by this task. This archive is **not standalone outside the repository**. External map tiles and campus websites still depend on their external services.

## Verification performed

- All **196 original files** retain their recorded size and SHA-256 checksum.
- Syntax checks pass for all **53 reader/runtime JavaScript files**.
- **166 local references** from the HTML, imports, CSS imports, module-relative URLs, explicit library loads and local media resolve, with no missing file.
- Application imports resolve within the archive; the explicitly listed shared libraries remain outside it.
- Direct project data retains the single `campus: 'paris'` field; the reader retains the single-campus filtering and routing source.
- Five route-construction cases retain the archive pathname and outer query string, including a project subsection, its team anchor, a profile subsection, an article subsection and a campus route.
- Checksums for reader files and the original manifest are recorded in the reader manifest and verified after generation.

No browser replay was performed during this archive preparation. Any subsequent visual or interaction checks should be recorded as a dated addition. The root task may perform those checks separately.

The current changes are documented in [PROJECTS_NOTES.md](../../../site/notes/PROJECTS_NOTES.md) and [DOCK_NAVIGATION_NOTES.md](../../../site/notes/DOCK_NAVIGATION_NOTES.md). Earlier studies and their sources remain preserved.

## Browser replay — 12 October 2026

A subsequent Chrome replay at **960 × 640** opened the archived ft_transcendence project and navigated between Overview and Comments. The archived data still classifies it only under Paris; navigation retains `preview.html` and its outer query parameters.

The replay reproduced the original menu coupling: clicking Comments scrolls the local menu from 0 to 190px while the document stays at 0px, yet the main menu enters `documentScrolling=true` and its buttons reach opacity 0. That behaviour remains intentionally frozen in this historical reader. The same comparative run passes 17 scenarios in total: this archived reproduction, 15 local-menu interactions in the corrected active prototype, and its regular document-reading scroll.

Visual review found that static SVG references omitted the reader query string. The separate `viewer-entry.mjs` adapter now resolves those references against the exact current archive URL before mounting the application. All six checked static navigation/account icons have visible SVG geometry after that correction, and the final overview capture was examined. Original sources are unchanged.

The [standalone replay script](../../../site/checks/20261012-independent-menu-browser.py), [17-case results](../../../site/checks/20261012-independent-menu-results.json) and [final archive overview](../../../site/checks/20261012-independent-menu-archive-overview.png) preserve the checks. This is a desktop headless-browser replay; no physical device check is claimed.
